import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentReview, ReviewStatus, ReviewType } from './entities/appointment-review.entity';

interface ReviewData {
  appointment_id: string;
  user_email: string;
  pet_name: string;
  clinic_name: string;
  overall_rating: number;
  vet_expertise_rating: number;
  communication_rating: number;
  punctuality_rating: number;
  home_visit_rating: number;
  follow_up_rating: number;
  title: string;
  comment: string;
  positive_aspects: string;
  improvement_areas?: string;
  would_recommend: boolean;
  review_type: ReviewType;
  status: ReviewStatus;
  is_verified: boolean;
  helpful_count: number;
  is_reported: boolean;
  pet_photos: string[];
  visit_photos: string[];
  clinic_response?: string;
  clinic_response_date?: string;
  is_anonymous: boolean;
}

@Injectable()
export class ReviewsSeeder {
  private readonly logger = new Logger(ReviewsSeeder.name);

  constructor(
    @InjectRepository(AppointmentReview)
    private readonly reviewRepository: Repository<AppointmentReview>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting reviews seeding...');

    try {
      // Clear existing reviews first for fresh data
      await this.clear();

      // Validate that required data exists
      const requiredData = await this.validateRequiredData();
      if (!requiredData) {
        throw new Error('Required data not found. Please run appointments seeder first.');
      }

      this.logger.log('Creating sample appointment reviews...');
      const reviews = await this.createSampleReviews(requiredData);

      this.logger.log(`✅ Reviews seeding completed! Created ${reviews.length} reviews`);
    } catch (error) {
      this.logger.error('❌ Error seeding reviews:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async validateRequiredData(): Promise<{
    appointments: Appointment[];
    clinics: Clinic[];
    pets: Pet[];
    users: User[];
  } | null> {
    try {
      const appointments = await this.appointmentRepository.find({
        where: { status: AppointmentStatus.COMPLETED },
        relations: ['pet', 'owner', 'clinic', 'staff'],
      });
      const clinics = await this.clinicRepository.find({ where: { is_active: true } });
      const pets = await this.petRepository.find({ where: { is_active: true } });
      const users = await this.userRepository.find();

      if (appointments.length === 0 || clinics.length === 0 || pets.length === 0) {
        this.logger.warn('Insufficient data for review creation');
        this.logger.warn(`Found: ${appointments.length} completed appointments, ${clinics.length} clinics, ${pets.length} pets`);
        return null;
      }

      return { appointments, clinics, pets, users };
    } catch (error) {
      this.logger.error('Error validating required data:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private async createSampleReviews(requiredData: { appointments: Appointment[]; clinics: Clinic[]; pets: Pet[]; users: User[] }): Promise<AppointmentReview[]> {
    const { appointments, clinics, pets, users } = requiredData;

    const reviewData: ReviewData[] = [
      // Review for Buddy's hip dysplasia appointment
      {
        appointment_id: '', // Will be filled dynamically
        user_email: 'john.doe@example.com',
        pet_name: 'Buddy',
        clinic_name: 'Borzolini Pet Clinic',
        overall_rating: 5,
        vet_expertise_rating: 5,
        communication_rating: 5,
        punctuality_rating: 4,
        home_visit_rating: 5,
        follow_up_rating: 5,
        title: "Excellent care for Buddy's hip dysplasia",
        comment:
          "Dr. Smith was incredibly thorough in explaining Buddy's hip dysplasia condition. The X-rays were clearly explained and the treatment plan was comprehensive. The staff was very caring and made sure Buddy was comfortable throughout the examination. The joint supplements prescribed have already shown improvement in his mobility.",
        positive_aspects: 'Clear diagnosis, detailed treatment plan, caring staff, follow-up care',
        improvement_areas: 'Wait time could be shorter',
        would_recommend: true,
        review_type: ReviewType.CONSULTATION,
        status: ReviewStatus.APPROVED,
        is_verified: true,
        helpful_count: 3,
        is_reported: false,
        pet_photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'],
        visit_photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'],
        clinic_response: "Thank you for your kind words! We're delighted to hear that Buddy is responding well to the treatment. Our team is committed to providing the best care for your furry family members.",
        clinic_response_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_anonymous: false,
      },
      // Review for Luna's vaccination appointment
      {
        appointment_id: '',
        user_email: 'john.doe@example.com',
        pet_name: 'Luna',
        clinic_name: 'Borzolini Pet Clinic',
        overall_rating: 4,
        vet_expertise_rating: 5,
        communication_rating: 4,
        punctuality_rating: 5,
        home_visit_rating: 5,
        follow_up_rating: 4,
        title: 'Great vaccination service',
        comment:
          "Luna's vaccination appointment went smoothly. Dr. Smith was gentle with her and explained the importance of dental care. The dental cleaning recommendation was helpful. Luna was a bit nervous but the staff made her feel comfortable.",
        positive_aspects: 'Gentle handling, clear explanations, comfortable environment',
        improvement_areas: 'Could provide more detailed aftercare instructions',
        would_recommend: true,
        review_type: ReviewType.CONSULTATION,
        status: ReviewStatus.APPROVED,
        is_verified: true,
        helpful_count: 1,
        is_reported: false,
        pet_photos: ['https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=300&fit=crop'],
        visit_photos: [],
        is_anonymous: false,
      },
      // Review for Max's ear infection appointment
      {
        appointment_id: '',
        user_email: 'jane.smith@example.com',
        pet_name: 'Max',
        clinic_name: 'Borzolini Pet Clinic',
        overall_rating: 5,
        vet_expertise_rating: 5,
        communication_rating: 5,
        punctuality_rating: 5,
        home_visit_rating: 5,
        follow_up_rating: 5,
        title: 'Outstanding treatment for chronic ear infections',
        comment:
          "Dr. Smith diagnosed Max's chronic ear infections perfectly. The allergy testing recommendation was spot-on and the medicated ear drops worked wonders. Max is much more comfortable now. The follow-up care instructions were very clear and helpful.",
        positive_aspects: 'Accurate diagnosis, effective treatment, clear instructions, follow-up care',
        would_recommend: true,
        review_type: ReviewType.CONSULTATION,
        status: ReviewStatus.APPROVED,
        is_verified: true,
        helpful_count: 5,
        is_reported: false,
        pet_photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'],
        visit_photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'],
        clinic_response: "We're so happy to hear that Max is feeling better! Chronic ear infections can be challenging, but with proper treatment and management, most pets can live comfortably. Thank you for trusting us with Max's care.",
        clinic_response_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        is_anonymous: false,
      },
      // Review for Whiskers' dental cleaning
      {
        appointment_id: '',
        user_email: 'jane.smith@example.com',
        pet_name: 'Whiskers',
        clinic_name: 'Borzolini Pet Clinic',
        overall_rating: 5,
        vet_expertise_rating: 5,
        communication_rating: 5,
        punctuality_rating: 5,
        home_visit_rating: 5,
        follow_up_rating: 5,
        title: 'Professional dental care for Whiskers',
        comment:
          'The dental cleaning procedure was handled with great care. Dr. Smith explained the severe gingivitis and the need for tooth extraction clearly. Whiskers recovered well from the procedure and the antibiotics helped prevent infection. The follow-up care was excellent.',
        positive_aspects: 'Professional procedure, clear communication, excellent follow-up care',
        would_recommend: true,
        review_type: ReviewType.CONSULTATION,
        status: ReviewStatus.APPROVED,
        is_verified: true,
        helpful_count: 2,
        is_reported: false,
        pet_photos: ['https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=300&fit=crop'],
        visit_photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'],
        is_anonymous: false,
      },
      // Review for Rocky's emergency surgery
      {
        appointment_id: '',
        user_email: 'mike.brown@example.com',
        pet_name: 'Rocky',
        clinic_name: 'Borzolini Pet Clinic',
        overall_rating: 5,
        vet_expertise_rating: 5,
        communication_rating: 5,
        punctuality_rating: 5,
        home_visit_rating: 5,
        follow_up_rating: 5,
        title: 'Life-saving emergency surgery - exceptional care',
        comment:
          "When Rocky had bloat, I was terrified. Dr. Smith and the team acted quickly and professionally. The emergency surgery was successful and Rocky is recovering well. The staff kept me informed throughout the entire process and provided excellent post-surgery care instructions. I can't thank them enough for saving Rocky's life.",
        positive_aspects: 'Quick response, life-saving surgery, excellent communication, comprehensive care',
        would_recommend: true,
        review_type: ReviewType.EMERGENCY,
        status: ReviewStatus.APPROVED,
        is_verified: true,
        helpful_count: 8,
        is_reported: false,
        pet_photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'],
        visit_photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'],
        clinic_response:
          "We're so relieved that Rocky is doing well! Bloat is a serious condition that requires immediate attention, and we're grateful we could help. Your trust in our team during such a stressful time means everything to us.",
        clinic_response_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_anonymous: false,
      },
    ];

    const reviews: AppointmentReview[] = [];

    for (const data of reviewData) {
      try {
        // Find the appointment by pet name and owner email
        const appointment = appointments.find((apt) => apt.pet?.name === data.pet_name && apt.owner?.email === data.user_email);

        if (!appointment) {
          this.logger.warn(`Appointment not found for review: ${data.pet_name} - ${data.user_email}`);
          continue;
        }

        // Find the clinic
        const clinic = clinics.find((c) => c.name === data.clinic_name);
        if (!clinic) {
          this.logger.warn(`Clinic not found: ${data.clinic_name}`);
          continue;
        }

        // Find the pet
        const pet = pets.find((p) => p.name === data.pet_name);
        if (!pet) {
          this.logger.warn(`Pet not found: ${data.pet_name}`);
          continue;
        }

        // Find the user
        const user = users.find((u) => u.email === data.user_email);
        if (!user) {
          this.logger.warn(`User not found: ${data.user_email}`);
          continue;
        }

        // Create review data
        const reviewDataToSave: Partial<AppointmentReview> = {
          appointment_id: appointment.id,
          user_id: user.id,
          pet_id: pet.id,
          clinic_id: clinic.id,
          overall_rating: data.overall_rating,
          vet_expertise_rating: data.vet_expertise_rating,
          communication_rating: data.communication_rating,
          punctuality_rating: data.punctuality_rating,
          home_visit_rating: data.home_visit_rating,
          follow_up_rating: data.follow_up_rating,
          title: data.title,
          comment: data.comment,
          positive_aspects: data.positive_aspects,
          ...(data.improvement_areas && { improvement_areas: data.improvement_areas }),
          would_recommend: data.would_recommend,
          review_type: data.review_type,
          status: data.status,
          is_verified: data.is_verified,
          helpful_count: data.helpful_count,
          is_reported: data.is_reported,
          pet_photos: data.pet_photos,
          visit_photos: data.visit_photos,
          ...(data.clinic_response && { clinic_response: data.clinic_response }),
          ...(data.clinic_response_date && { clinic_response_date: new Date(data.clinic_response_date) }),
          is_anonymous: data.is_anonymous,
        };

        const review = this.reviewRepository.create(reviewDataToSave);
        const savedReview = await this.reviewRepository.save(review);

        reviews.push(savedReview);
        this.logger.log(`Created review: ${data.title} for ${data.pet_name}`);
      } catch (error) {
        this.logger.error(`Failed to create review for ${data.pet_name}:`, error);
        throw error;
      }
    }

    return reviews;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing all appointment reviews...');
    try {
      await this.reviewRepository.createQueryBuilder().delete().execute();
      this.logger.log('All appointment reviews cleared');
    } catch (error) {
      this.logger.error('Error clearing appointment reviews:', error);
      throw error;
    }
  }
}
