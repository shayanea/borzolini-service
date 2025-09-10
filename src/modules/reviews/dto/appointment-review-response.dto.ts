import { ApiProperty } from '@nestjs/swagger';
import { AppointmentReview } from '../entities/appointment-review.entity';

export class AppointmentReviewResponseDto {
  @ApiProperty({ description: 'Review data' })
  data!: AppointmentReview;

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;
}

export class AppointmentReviewsListResponseDto {
  @ApiProperty({ description: 'List of reviews', type: [AppointmentReview] })
  data!: AppointmentReview[];

  @ApiProperty({ description: 'Total number of reviews' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;
}

export class AppointmentReviewCreatedResponseDto {
  @ApiProperty({ description: 'Created review data' })
  data!: AppointmentReview;

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;

  @ApiProperty({ description: 'Created review ID' })
  id!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: string;
}

export class AppointmentReviewUpdatedResponseDto {
  @ApiProperty({ description: 'Updated review data' })
  data!: AppointmentReview;

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;

  @ApiProperty({ description: 'Updated review ID' })
  id!: string;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt!: string;

  @ApiProperty({ description: 'Number of affected rows' })
  affectedRows!: number;
}

export class AppointmentReviewStatisticsResponseDto {
  @ApiProperty({ description: 'Review statistics' })
  data!: {
    totalReviews: number;
    averageOverallRating: number;
    averageVetExpertiseRating: number;
    averageCommunicationRating: number;
    averagePunctualityRating: number;
    averageHomeVisitRating: number;
    averageFollowUpRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    verifiedReviews: number;
    helpfulReviews: number;
    recentReviews: number;
    recommendationRate: number;
    homeVisitReviews: number;
    consultationReviews: number;
    emergencyReviews: number;
    followUpReviews: number;
  };

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;
}

export class AppointmentReviewHelpfulResponseDto {
  @ApiProperty({ description: 'Helpful vote data' })
  data!: {
    reviewId: string;
    isHelpful: boolean;
    helpfulCount: number;
  };

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;
}

export class AppointmentReviewReportResponseDto {
  @ApiProperty({ description: 'Report data' })
  data!: {
    reviewId: string;
    reported: boolean;
    reason?: string;
  };

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;
}

export class ClinicResponseToReviewDto {
  @ApiProperty({ description: 'Clinic response to review' })
  data!: {
    reviewId: string;
    clinicResponse: string;
    responseDate: string;
  };

  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp!: string;
}
