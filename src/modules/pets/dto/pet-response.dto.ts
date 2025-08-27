import { ApiProperty } from '@nestjs/swagger';
import { Pet, PetSpecies, PetGender, PetSize } from '../entities/pet.entity';

export class PetResponseDto {
  @ApiProperty({
    description: 'Pet data',
    type: Pet,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      gender: 'male',
      date_of_birth: '2020-03-15',
      weight: 65.5,
      size: 'large',
      color: 'Golden',
      microchip_number: '985141000000000',
      is_spayed_neutered: true,
      is_vaccinated: true,
      medical_history: 'No significant medical issues. Regular wellness checkups.',
      behavioral_notes: 'Friendly and well-behaved. Good with children and other pets.',
      dietary_restrictions: 'None',
      allergies: 'None known',
      medications: [],
      emergency_contact_name: 'John Doe',
      emergency_contact_phone: '+1234567890',
      emergency_contact_relationship: 'Owner',
      insurance_provider: 'PetCare Insurance',
      insurance_policy_number: 'PCI123456789',
      insurance_expiry_date: '2024-12-31',
      is_active: true,
      created_at: '2023-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T10:30:00.000Z',
      owner_id: '456e7890-e89b-12d3-a456-426614174001'
    }
  })
  data!: Pet;

  @ApiProperty({
    description: 'Success message',
    example: 'Pet retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PetsListResponseDto {
  @ApiProperty({
    description: 'List of pets',
    type: [Pet],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        gender: 'male',
        weight: 65.5,
        size: 'large',
        is_active: true,
        created_at: '2023-01-15T10:30:00.000Z'
      },
      {
        id: '456e7890-e89b-12d3-a456-426614174001',
        name: 'Whiskers',
        species: 'cat',
        breed: 'Domestic Shorthair',
        gender: 'female',
        weight: 12.0,
        size: 'small',
        is_active: true,
        created_at: '2023-02-20T14:15:00.000Z'
      }
    ]
  })
  data!: Pet[];

  @ApiProperty({
    description: 'Total number of pets',
    example: 75
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Pets retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PetCreatedResponseDto {
  @ApiProperty({
    description: 'Created pet data',
    type: Pet
  })
  data!: Pet;

  @ApiProperty({
    description: 'Success message',
    example: 'Pet created successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Created pet ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt!: string;
}

export class PetUpdatedResponseDto {
  @ApiProperty({
    description: 'Updated pet data',
    type: Pet
  })
  data!: Pet;

  @ApiProperty({
    description: 'Success message',
    example: 'Pet updated successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Updated pet ID',
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

export class PetHealthSummaryResponseDto {
  @ApiProperty({
    description: 'Pet health summary data',
    example: {
      petId: '123e4567-e89b-12d3-a456-426614174000',
      petName: 'Buddy',
      lastCheckup: '2024-01-10T10:00:00.000Z',
      nextVaccination: '2024-04-15T10:00:00.000Z',
      weightHistory: [
        { date: '2023-01-15', weight: 60.0 },
        { date: '2023-06-15', weight: 62.5 },
        { date: '2024-01-10', weight: 65.5 }
      ],
      vaccinationStatus: {
        rabies: { status: 'up_to_date', nextDue: '2025-01-10' },
        dhpp: { status: 'up_to_date', nextDue: '2024-04-15' },
        bordetella: { status: 'up_to_date', nextDue: '2024-07-15' }
      },
      medicalAlerts: [],
      upcomingAppointments: [
        {
          id: '789e0123-e89b-12d3-a456-426614174006',
          date: '2024-02-15T14:00:00.000Z',
          type: 'wellness_exam',
          clinic: 'Borzolini Clinic'
        }
      ]
    }
  })
  data!: {
    petId: string;
    petName: string;
    lastCheckup: string;
    nextVaccination: string;
    weightHistory: Array<{ date: string; weight: number }>;
    vaccinationStatus: Record<string, { status: string; nextDue: string }>;
    medicalAlerts: string[];
    upcomingAppointments: Array<{
      id: string;
      date: string;
      type: string;
      clinic: string;
    }>;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Pet health summary retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PetVaccinationResponseDto {
  @ApiProperty({
    description: 'Pet vaccination data',
    example: {
      petId: '123e4567-e89b-12d3-a456-426614174000',
      petName: 'Buddy',
      vaccinations: [
        {
          id: 'vac_001',
          name: 'Rabies',
          date: '2024-01-10T10:00:00.000Z',
          nextDue: '2025-01-10T10:00:00.000Z',
          status: 'up_to_date',
          clinic: 'Borzolini Clinic',
          veterinarian: 'Dr. Smith'
        },
        {
          id: 'vac_002',
          name: 'DHPP',
          date: '2024-01-10T10:00:00.000Z',
          nextDue: '2024-04-15T10:00:00.000Z',
          status: 'up_to_date',
          clinic: 'Borzolini Clinic',
          veterinarian: 'Dr. Smith'
        }
      ],
      upcomingVaccinations: [
        {
          name: 'DHPP',
          dueDate: '2024-04-15T10:00:00.000Z',
          daysUntilDue: 90
        }
      ]
    }
  })
  data!: {
    petId: string;
    petName: string;
    vaccinations: Array<{
      id: string;
      name: string;
      date: string;
      nextDue: string;
      status: string;
      clinic: string;
      veterinarian: string;
    }>;
    upcomingVaccinations: Array<{
      name: string;
      dueDate: string;
      daysUntilDue: number;
    }>;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Pet vaccination records retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PetMedicalHistoryResponseDto {
  @ApiProperty({
    description: 'Pet medical history data',
    example: {
      petId: '123e4567-e89b-12d3-a456-426614174000',
      petName: 'Buddy',
      medicalRecords: [
        {
          id: 'med_001',
          date: '2024-01-10T10:00:00.000Z',
          type: 'wellness_exam',
          diagnosis: 'Healthy adult dog',
          treatment: 'Annual vaccination and wellness check',
          veterinarian: 'Dr. Smith',
          clinic: 'Borzolini Clinic',
          notes: 'Pet is in excellent health. Weight is stable.'
        },
        {
          id: 'med_002',
          date: '2023-07-15T14:00:00.000Z',
          type: 'consultation',
          diagnosis: 'Minor skin irritation',
          treatment: 'Topical treatment prescribed',
          veterinarian: 'Dr. Johnson',
          clinic: 'Borzolini Clinic',
          notes: 'Follow up in 2 weeks if symptoms persist.'
        }
      ],
      medications: [
        {
          name: 'Flea Prevention',
          dosage: 'Monthly topical',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active'
        }
      ],
      allergies: ['None known'],
      chronicConditions: []
    }
  })
  data!: {
    petId: string;
    petName: string;
    medicalRecords: Array<{
      id: string;
      date: string;
      type: string;
      diagnosis: string;
      treatment: string;
      veterinarian: string;
      clinic: string;
      notes: string;
    }>;
    medications: Array<{
      name: string;
      dosage: string;
      startDate: string;
      endDate: string;
      status: string;
    }>;
    allergies: string[];
    chronicConditions: string[];
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Pet medical history retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class PetBehavioralAssessmentResponseDto {
  @ApiProperty({
    description: 'Pet behavioral assessment data',
    example: {
      petId: '123e4567-e89b-12d3-a456-426614174000',
      petName: 'Buddy',
      assessmentDate: '2024-01-15T10:30:00.000Z',
      temperament: 'friendly',
      socialBehavior: {
        withHumans: 'excellent',
        withOtherDogs: 'good',
        withCats: 'neutral',
        withChildren: 'excellent'
      },
      trainingLevel: 'intermediate',
      commands: ['sit', 'stay', 'come', 'heel'],
      behavioralIssues: [],
      recommendations: [
        'Continue with positive reinforcement training',
        'Maintain regular socialization',
        'Consider advanced obedience classes'
      ],
      nextAssessment: '2024-07-15T10:30:00.000Z'
    }
  })
  data!: {
    petId: string;
    petName: string;
    assessmentDate: string;
    temperament: string;
    socialBehavior: {
      withHumans: string;
      withOtherDogs: string;
      withCats: string;
      withChildren: string;
    };
    trainingLevel: string;
    commands: string[];
    behavioralIssues: string[];
    recommendations: string[];
    nextAssessment: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Pet behavioral assessment retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}
