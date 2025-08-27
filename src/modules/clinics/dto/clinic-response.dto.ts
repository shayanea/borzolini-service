import { ApiProperty } from '@nestjs/swagger';
import { Clinic } from '../entities/clinic.entity';

export class ClinicResponseDto {
  @ApiProperty({
    description: 'Clinic data',
    type: Clinic,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Borzolini Pet Clinic',
      description: 'Comprehensive veterinary care with state-of-the-art facilities and experienced staff. Specializing in preventive care, surgery, and emergency services.',
      address: '123 Veterinary Drive',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
      phone: '+1-555-123-4567',
      email: 'info@borzoliniclinic.com',
      website: 'https://borzoliniclinic.com',
      logo_url: 'https://example.com/logo.png',
      banner_url: 'https://example.com/banner.jpg',
      rating: 4.8,
      total_reviews: 156,
      is_verified: true,
      is_active: true,
      operating_hours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      },
      emergency_contact: 'Emergency Services',
      emergency_phone: '+1-555-911-0000',
      services: {
        consultation: true,
        vaccination: true,
        surgery: true,
        emergency: true,
        dental: true,
        grooming: false,
        boarding: false
      },
      specializations: {
        small_animals: true,
        exotic_pets: true,
        emergency_medicine: true,
        surgery: true,
        dermatology: true
      },
      payment_methods: {
        cash: true,
        credit_card: true,
        debit_card: true,
        insurance: true,
        payment_plans: true
      },
      insurance_providers: {
        'PetCare Insurance': true,
        'VetAssist': true,
        'PetHealth': true
      },
      created_at: '2020-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T10:30:00.000Z'
    }
  })
  data!: Clinic;

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ClinicsListResponseDto {
  @ApiProperty({
    description: 'List of clinics',
    type: [Clinic],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Borzolini Pet Clinic',
        city: 'New York',
        state: 'NY',
        rating: 4.8,
        total_reviews: 156,
        is_verified: true,
        is_active: true,
        created_at: '2020-01-15T10:30:00.000Z'
      },
      {
        id: '456e7890-e89b-12d3-a456-426614174001',
        name: 'Downtown Veterinary Center',
        city: 'New York',
        state: 'NY',
        rating: 4.6,
        total_reviews: 89,
        is_verified: true,
        is_active: true,
        created_at: '2021-03-20T14:15:00.000Z'
      }
    ]
  })
  data!: Clinic[];

  @ApiProperty({
    description: 'Total number of clinics',
    example: 25
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Clinics retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ClinicCreatedResponseDto {
  @ApiProperty({
    description: 'Created clinic data',
    type: Clinic
  })
  data!: Clinic;

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic created successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Created clinic ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt!: string;
}

export class ClinicUpdatedResponseDto {
  @ApiProperty({
    description: 'Updated clinic data',
    type: Clinic
  })
  data!: Clinic;

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic updated successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Updated clinic ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'Number of affected rows',
    example: 1
  })
  affectedRows!: number;
}

export class ClinicSearchResponseDto {
  @ApiProperty({
    description: 'Search results for clinics',
    type: [Clinic],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Borzolini Pet Clinic',
        city: 'New York',
        state: 'NY',
        rating: 4.8,
        total_reviews: 156,
        distance: 2.5,
        services: ['consultation', 'vaccination', 'surgery', 'emergency'],
        specializations: ['small_animals', 'emergency_medicine']
      }
    ]
  })
  data!: Array<Clinic & { distance?: number }>;

  @ApiProperty({
    description: 'Total number of search results',
    example: 15
  })
  total!: number;

  @ApiProperty({
    description: 'Search query used',
    example: 'veterinary clinic near me'
  })
  query!: string;

  @ApiProperty({
    description: 'Search filters applied',
    example: {
      city: 'New York',
      services: ['emergency'],
      rating: 4.0
    }
  })
  filters!: Record<string, any>;

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic search completed successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ClinicServicesResponseDto {
  @ApiProperty({
    description: 'Clinic services data',
    example: {
      clinicId: '123e4567-e89b-12d3-a456-426614174000',
      clinicName: 'Borzolini Pet Clinic',
      services: [
        {
          id: 'service_001',
          name: 'General Consultation',
          description: 'Comprehensive health examination and consultation',
          category: 'preventive_care',
          duration: 30,
          cost: 75.00,
          isAvailable: true
        },
        {
          id: 'service_002',
          name: 'Vaccination',
          description: 'Core and non-core vaccinations for pets',
          category: 'preventive_care',
          duration: 15,
          cost: 45.00,
          isAvailable: true
        },
        {
          id: 'service_003',
          name: 'Surgery',
          description: 'Various surgical procedures including spay/neuter',
          category: 'surgery',
          duration: 120,
          cost: 500.00,
          isAvailable: true
        }
      ],
      categories: ['preventive_care', 'surgery', 'emergency', 'dental'],
      totalServices: 15
    }
  })
  data!: {
    clinicId: string;
    clinicName: string;
    services: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      duration: number;
      cost: number;
      isAvailable: boolean;
    }>;
    categories: string[];
    totalServices: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic services retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ClinicStaffResponseDto {
  @ApiProperty({
    description: 'Clinic staff data',
    example: {
      clinicId: '123e4567-e89b-12d3-a456-426614174000',
      clinicName: 'Borzolini Pet Clinic',
      staff: [
        {
          id: 'staff_001',
          name: 'Dr. Sarah Johnson',
          role: 'veterinarian',
          specialization: 'Small Animal Medicine',
          experience: 8,
          education: 'DVM, University of Veterinary Medicine',
          certifications: ['Board Certified in Small Animal Practice'],
          availability: 'Monday-Friday, 8:00 AM - 6:00 PM',
          rating: 4.9,
          totalReviews: 45
        },
        {
          id: 'staff_002',
          name: 'Dr. Michael Chen',
          role: 'veterinarian',
          specialization: 'Surgery',
          experience: 12,
          education: 'DVM, Cornell University',
          certifications: ['Board Certified in Veterinary Surgery'],
          availability: 'Tuesday-Saturday, 9:00 AM - 7:00 PM',
          rating: 4.8,
          totalReviews: 38
        }
      ],
      totalStaff: 8,
      roles: ['veterinarian', 'technician', 'receptionist', 'groomer']
    }
  })
  data!: {
    clinicId: string;
    clinicName: string;
    staff: Array<{
      id: string;
      name: string;
      role: string;
      specialization: string;
      experience: number;
      education: string;
      certifications: string[];
      availability: string;
      rating: number;
      totalReviews: number;
    }>;
    totalStaff: number;
    roles: string[];
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic staff retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class ClinicReviewsResponseDto {
  @ApiProperty({
    description: 'Clinic reviews data',
    example: {
      clinicId: '123e4567-e89b-12d3-a456-426614174000',
      clinicName: 'Borzolini Pet Clinic',
      overallRating: 4.8,
      totalReviews: 156,
      reviews: [
        {
          id: 'review_001',
          rating: 5,
          title: 'Excellent care for my dog',
          comment: 'Dr. Johnson was amazing with my anxious dog. Very patient and caring.',
          author: 'John D.',
          date: '2024-01-10T15:30:00.000Z',
          verified: true,
          helpful: 12
        },
        {
          id: 'review_002',
          rating: 4,
          title: 'Good experience overall',
          comment: 'Clean facility, friendly staff. Wait time was a bit long but worth it.',
          author: 'Sarah M.',
          date: '2024-01-08T12:15:00.000Z',
          verified: true,
          helpful: 8
        }
      ],
      ratingDistribution: {
        5: 89,
        4: 45,
        3: 15,
        2: 5,
        1: 2
      }
    }
  })
  data!: {
    clinicId: string;
    clinicName: string;
    overallRating: number;
    totalReviews: number;
    reviews: Array<{
      id: string;
      rating: number;
      title: string;
      comment: string;
      author: string;
      date: string;
      verified: boolean;
      helpful: number;
    }>;
    ratingDistribution: Record<number, number>;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Clinic reviews retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}
