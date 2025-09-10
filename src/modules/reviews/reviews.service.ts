import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { AppointmentReviewCreatedResponseDto, AppointmentReviewResponseDto, AppointmentReviewsListResponseDto, AppointmentReviewStatisticsResponseDto, ClinicResponseToReviewDto } from './dto/appointment-review-response.dto';
import { CreateAppointmentReviewDto } from './dto/create-appointment-review.dto';
import { AppointmentReview, ReviewStatus, ReviewType } from './entities/appointment-review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(AppointmentReview)
    private readonly appointmentReviewRepository: Repository<AppointmentReview>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>
  ) {}

  async createReview(createReviewDto: CreateAppointmentReviewDto, userId: string): Promise<AppointmentReviewCreatedResponseDto> {
    // Verify appointment exists and belongs to user
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: createReviewDto.appointment_id,
        owner_id: userId,
        status: AppointmentStatus.COMPLETED,
      },
      relations: ['pet', 'clinic'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or not completed');
    }

    // Check if review already exists
    const existingReview = await this.appointmentReviewRepository.findOne({
      where: {
        appointment_id: createReviewDto.appointment_id,
        user_id: userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this appointment');
    }

    // Create new review
    const review = this.appointmentReviewRepository.create({
      ...createReviewDto,
      user_id: userId,
      pet_id: appointment.pet_id,
      clinic_id: appointment.clinic_id,
      status: ReviewStatus.PENDING,
      is_verified: true, // Auto-verify reviews for completed appointments
    });

    const savedReview = await this.appointmentReviewRepository.save(review);

    return {
      data: savedReview,
      message: 'Review created successfully',
      timestamp: new Date().toISOString(),
      id: savedReview.id,
      createdAt: savedReview.created_at.toISOString(),
    };
  }

  async getReviewsByClinic(clinicId: string, page: number = 1, limit: number = 10, status?: ReviewStatus): Promise<AppointmentReviewsListResponseDto> {
    const queryBuilder = this.appointmentReviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.pet', 'pet')
      .leftJoinAndSelect('review.appointment', 'appointment')
      .where('review.clinic_id = :clinicId', { clinicId });

    if (status) {
      queryBuilder.andWhere('review.status = :status', { status });
    }

    const [reviews, total] = await queryBuilder
      .orderBy('review.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      message: 'Reviews retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async getReviewsByUser(userId: string, page: number = 1, limit: number = 10): Promise<AppointmentReviewsListResponseDto> {
    const [reviews, total] = await this.appointmentReviewRepository.findAndCount({
      where: { user_id: userId },
      relations: ['pet', 'clinic', 'appointment'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      message: 'User reviews retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async getReviewById(reviewId: string): Promise<AppointmentReviewResponseDto> {
    const review = await this.appointmentReviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'pet', 'clinic', 'appointment'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      data: review,
      message: 'Review retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async updateReview(reviewId: string, updateData: Partial<CreateAppointmentReviewDto>, userId: string): Promise<AppointmentReviewResponseDto> {
    const review = await this.appointmentReviewRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or access denied');
    }

    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestException('Cannot modify approved review');
    }

    Object.assign(review, updateData);
    const updatedReview = await this.appointmentReviewRepository.save(review);

    return {
      data: updatedReview,
      message: 'Review updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.appointmentReviewRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or access denied');
    }

    await this.appointmentReviewRepository.remove(review);
  }

  async getClinicStatistics(clinicId: string): Promise<AppointmentReviewStatisticsResponseDto> {
    const reviews = await this.appointmentReviewRepository.find({
      where: {
        clinic_id: clinicId,
        status: ReviewStatus.APPROVED,
      },
    });

    const totalReviews = reviews.length;
    const averageOverallRating = this.calculateAverageRating(reviews, 'overall_rating');
    const averageVetExpertiseRating = this.calculateAverageRating(reviews, 'vet_expertise_rating');
    const averageCommunicationRating = this.calculateAverageRating(reviews, 'communication_rating');
    const averagePunctualityRating = this.calculateAverageRating(reviews, 'punctuality_rating');
    const averageHomeVisitRating = this.calculateAverageRating(reviews, 'home_visit_rating');
    const averageFollowUpRating = this.calculateAverageRating(reviews, 'follow_up_rating');

    const ratingDistribution = this.calculateRatingDistribution(reviews, 'overall_rating');
    const verifiedReviews = reviews.filter((r) => r.is_verified).length;
    const helpfulReviews = reviews.filter((r) => r.helpful_count > 0).length;
    const recentReviews = reviews.filter((r) => r.isRecent).length;
    const recommendationRate = reviews.filter((r) => r.would_recommend).length / totalReviews;

    const homeVisitReviews = reviews.filter((r) => r.review_type === ReviewType.HOME_VISIT).length;
    const consultationReviews = reviews.filter((r) => r.review_type === ReviewType.CONSULTATION).length;
    const emergencyReviews = reviews.filter((r) => r.review_type === ReviewType.EMERGENCY).length;
    const followUpReviews = reviews.filter((r) => r.review_type === ReviewType.FOLLOW_UP).length;

    return {
      data: {
        totalReviews,
        averageOverallRating,
        averageVetExpertiseRating,
        averageCommunicationRating,
        averagePunctualityRating,
        averageHomeVisitRating,
        averageFollowUpRating,
        ratingDistribution,
        verifiedReviews,
        helpfulReviews,
        recentReviews,
        recommendationRate,
        homeVisitReviews,
        consultationReviews,
        emergencyReviews,
        followUpReviews,
      },
      message: 'Clinic statistics retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async addClinicResponse(reviewId: string, response: string, clinicId: string): Promise<ClinicResponseToReviewDto> {
    const review = await this.appointmentReviewRepository.findOne({
      where: { id: reviewId, clinic_id: clinicId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or access denied');
    }

    review.clinic_response = response;
    review.clinic_response_date = new Date();
    await this.appointmentReviewRepository.save(review);

    return {
      data: {
        reviewId,
        clinicResponse: response,
        responseDate: review.clinic_response_date.toISOString(),
      },
      message: 'Clinic response added successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async markReviewHelpful(reviewId: string, _userId: string): Promise<void> {
    // Implementation for marking review as helpful
    // This would typically involve a separate table for user-review interactions
    const review = await this.appointmentReviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.helpful_count += 1;
    await this.appointmentReviewRepository.save(review);
  }

  async reportReview(reviewId: string, reason: string, _userId: string): Promise<void> {
    const review = await this.appointmentReviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.is_reported = true;
    review.report_reason = reason;
    review.status = ReviewStatus.FLAGGED;
    await this.appointmentReviewRepository.save(review);
  }

  private calculateAverageRating(reviews: AppointmentReview[], field: keyof AppointmentReview): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review[field] as number), 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  }

  private calculateRatingDistribution(reviews: AppointmentReview[], field: keyof AppointmentReview): { 1: number; 2: number; 3: number; 4: number; 5: number } {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      const rating = review[field] as number;
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  }
}
