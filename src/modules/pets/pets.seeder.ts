import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiHealthInsight } from '../ai-health/entities/ai-health-insight.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Pet, PetGender, PetSize, PetSpecies } from './entities/pet.entity';

interface PetData {
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  date_of_birth: string;
  weight: number;
  size: PetSize;
  color: string;
  microchip_number?: string;
  is_spayed_neutered: boolean;
  is_vaccinated: boolean;
  medical_history?: string;
  behavioral_notes?: string;
  dietary_requirements?: string;
  allergies: string[];
  medications: string[];
  emergency_contact?: string;
  emergency_phone?: string;
  photo_url?: string;
  owner_email: string;
}

@Injectable()
export class PetsSeeder {
  private readonly logger = new Logger(PetsSeeder.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(AiHealthInsight)
    private readonly aiHealthInsightRepository: Repository<AiHealthInsight>,
    private readonly usersService: UsersService
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting pets seeding...');

    try {
      // Clear existing pets first for fresh data
      await this.clear();

      // Validate that required users exist
      const requiredUsers = await this.validateRequiredUsers();
      if (!requiredUsers) {
        throw new Error('Required users not found. Please run users seeder first.');
      }

      this.logger.log('Creating sample pets...');
      const pets = await this.createSamplePets(requiredUsers);

      this.logger.log(`✅ Pets seeding completed! Created ${pets.length} pets`);
    } catch (error) {
      this.logger.error('❌ Error seeding pets:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async validateRequiredUsers(): Promise<{
    patients: User[];
  } | null> {
    try {
      const allUsersResult = await this.usersService.findAll();
      const allUsers = allUsersResult.users;
      const patientUsers = allUsers.filter((user) => user.role === UserRole.PATIENT && user.isActive);

      if (patientUsers.length === 0) {
        this.logger.warn('No patient users found for pet creation');
        return null;
      }

      return { patients: patientUsers };
    } catch (error) {
      this.logger.error('Error validating required users:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private async createSamplePets(users: { patients: User[] }): Promise<Pet[]> {
    const petData: PetData[] = [
      // John Doe's pets
      {
        name: 'Buddy',
        species: PetSpecies.DOG,
        breed: 'Golden Retriever',
        gender: PetGender.MALE,
        date_of_birth: '2020-03-15',
        weight: 65.5,
        size: PetSize.LARGE,
        color: 'Golden',
        microchip_number: 'MC123456789',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Annual checkups, no major issues. Recently had dental cleaning.',
        behavioral_notes: 'Friendly, loves children, good with other dogs. Enjoys playing fetch.',
        dietary_requirements: 'Grain-free diet due to mild sensitivity',
        allergies: ['chicken', 'wheat'],
        medications: [],
        emergency_contact: 'Jane Doe',
        emergency_phone: '+1-555-0400',
        photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
        owner_email: 'john.doe@example.com',
      },
      {
        name: 'Luna',
        species: PetSpecies.CAT,
        breed: 'Domestic Shorthair',
        gender: PetGender.FEMALE,
        date_of_birth: '2021-07-22',
        weight: 8.2,
        size: PetSize.SMALL,
        color: 'Black and White',
        microchip_number: 'MC987654321',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Spayed at 6 months, regular vaccinations. No health issues.',
        behavioral_notes: 'Independent, loves window watching, good with children. Shy around strangers.',
        dietary_requirements: 'High-protein cat food',
        allergies: [],
        medications: [],
        emergency_contact: 'Jane Doe',
        emergency_phone: '+1-555-0400',
        photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
        owner_email: 'john.doe@example.com',
      },

      // Jane Smith's pets
      {
        name: 'Max',
        species: PetSpecies.DOG,
        breed: 'Labrador Retriever',
        gender: PetGender.MALE,
        date_of_birth: '2019-11-08',
        weight: 72.0,
        size: PetSize.LARGE,
        color: 'Black',
        microchip_number: 'MC456789123',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Hip dysplasia monitoring, regular exercise recommended. Recent X-rays show mild arthritis.',
        behavioral_notes: 'Energetic, loves swimming, excellent with kids. Needs daily exercise.',
        dietary_requirements: 'Joint health formula',
        allergies: [],
        medications: ['Glucosamine supplement', 'Fish oil'],
        emergency_contact: 'John Smith',
        emergency_phone: '+1-555-0401',
        photo_url: 'https://images.unsplash.com/photo-1547407139-3c921a64505c?w=400&h=400&fit=crop',
        owner_email: 'jane.smith@example.com',
      },
      {
        name: 'Whiskers',
        species: PetSpecies.CAT,
        breed: 'Persian',
        gender: PetGender.MALE,
        date_of_birth: '2020-01-15',
        weight: 12.5,
        size: PetSize.MEDIUM,
        color: 'Cream',
        microchip_number: 'MC789123456',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular grooming needed, eye care routine. Prone to tear staining.',
        behavioral_notes: 'Calm, enjoys being brushed, prefers quiet environments. Loves high places.',
        dietary_requirements: 'Hairball control formula',
        allergies: [],
        medications: ['Eye drops for tear staining'],
        emergency_contact: 'John Smith',
        emergency_phone: '+1-555-0401',
        photo_url: 'https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop',
        owner_email: 'jane.smith@example.com',
      },

      // Mike Brown's pets
      {
        name: 'Rocky',
        species: PetSpecies.DOG,
        breed: 'German Shepherd',
        gender: PetGender.MALE,
        date_of_birth: '2021-04-12',
        weight: 78.0,
        size: PetSize.LARGE,
        color: 'Black and Tan',
        microchip_number: 'MC321654987',
        is_spayed_neutered: false,
        is_vaccinated: true,
        medical_history: 'Training for service dog certification. No health issues.',
        behavioral_notes: 'Highly intelligent, protective, excellent obedience. Needs mental stimulation.',
        dietary_requirements: 'High-quality working dog food',
        allergies: [],
        medications: [],
        emergency_contact: 'Sarah Brown',
        emergency_phone: '+1-555-0402',
        photo_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
        owner_email: 'mike.brown@example.com',
      },

      // Sarah Wilson's pets
      {
        name: 'Bella',
        species: PetSpecies.DOG,
        breed: 'Cavalier King Charles Spaniel',
        gender: PetGender.FEMALE,
        date_of_birth: '2022-02-28',
        weight: 18.5,
        size: PetSize.SMALL,
        color: 'Blenheim',
        microchip_number: 'MC147258369',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular heart monitoring due to breed predisposition. Recent echocardiogram normal.',
        behavioral_notes: 'Gentle, affectionate, great companion dog. Loves cuddling.',
        dietary_requirements: 'Heart-healthy diet',
        allergies: [],
        medications: ['Heart health supplement'],
        emergency_contact: 'Mike Wilson',
        emergency_phone: '+1-555-0403',
        photo_url: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&h=400&fit=crop',
        owner_email: 'sarah.wilson@example.com',
      },
      {
        name: 'Oliver',
        species: PetSpecies.CAT,
        breed: 'Maine Coon',
        gender: PetGender.MALE,
        date_of_birth: '2021-09-10',
        weight: 16.8,
        size: PetSize.LARGE,
        color: 'Orange Tabby',
        microchip_number: 'MC963852741',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular dental care, large breed monitoring. No health issues.',
        behavioral_notes: 'Playful, loves interactive toys, good with other pets. Very social.',
        dietary_requirements: 'Large breed cat formula',
        allergies: [],
        medications: [],
        emergency_contact: 'Mike Wilson',
        emergency_phone: '+1-555-0403',
        photo_url: 'https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop',
        owner_email: 'sarah.wilson@example.com',
      },

      // Alex Chen's pets
      {
        name: 'Shadow',
        species: PetSpecies.DOG,
        breed: 'Border Collie',
        gender: PetGender.FEMALE,
        date_of_birth: '2020-06-18',
        weight: 42.0,
        size: PetSize.MEDIUM,
        color: 'Black and White',
        microchip_number: 'MC852963741',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Active working dog, regular exercise essential. No health issues.',
        behavioral_notes: 'High energy, intelligent, needs mental stimulation. Excellent herding instincts.',
        dietary_requirements: 'Active dog formula with joint support',
        allergies: [],
        medications: [],
        emergency_contact: 'Jennifer Chen',
        emergency_phone: '+1-555-0404',
        photo_url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=400&fit=crop',
        owner_email: 'alex.chen@example.com',
      },
      {
        name: 'Mittens',
        species: PetSpecies.CAT,
        breed: 'Ragdoll',
        gender: PetGender.FEMALE,
        date_of_birth: '2021-12-03',
        weight: 11.2,
        size: PetSize.MEDIUM,
        color: 'Seal Point',
        microchip_number: 'MC741852963',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular grooming, gentle handling required. No health issues.',
        behavioral_notes: 'Relaxed, affectionate, goes limp when held. Very docile.',
        dietary_requirements: 'Premium indoor cat formula',
        allergies: [],
        medications: [],
        emergency_contact: 'Jennifer Chen',
        emergency_phone: '+1-555-0404',
        photo_url: 'https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop',
        owner_email: 'alex.chen@example.com',
      },

      // Lisa Garcia's pets
      {
        name: 'Coco',
        species: PetSpecies.DOG,
        breed: 'Chihuahua',
        gender: PetGender.FEMALE,
        date_of_birth: '2022-05-20',
        weight: 4.2,
        size: PetSize.TINY,
        color: 'Chocolate',
        microchip_number: 'MC159753486',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular checkups, no major issues. Prone to dental problems.',
        behavioral_notes: 'Feisty, protective, loves warm places. Good with family but wary of strangers.',
        dietary_requirements: 'Small breed formula',
        allergies: [],
        medications: ['Dental chews'],
        emergency_contact: 'Carlos Garcia',
        emergency_phone: '+1-555-0405',
        photo_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
        owner_email: 'lisa.garcia@example.com',
      },
      {
        name: 'Simba',
        species: PetSpecies.CAT,
        breed: 'Siamese',
        gender: PetGender.MALE,
        date_of_birth: '2021-03-10',
        weight: 9.8,
        size: PetSize.MEDIUM,
        color: 'Seal Point',
        microchip_number: 'MC486159753',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular checkups, no health issues. Vocal breed.',
        behavioral_notes: 'Very vocal, social, loves attention. Good with other pets.',
        dietary_requirements: 'High-quality cat food',
        allergies: [],
        medications: [],
        emergency_contact: 'Carlos Garcia',
        emergency_phone: '+1-555-0405',
        photo_url: 'https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop',
        owner_email: 'lisa.garcia@example.com',
      },

      // David Miller's pets
      {
        name: 'Duke',
        species: PetSpecies.DOG,
        breed: 'Great Dane',
        gender: PetGender.MALE,
        date_of_birth: '2020-08-15',
        weight: 145.0,
        size: PetSize.GIANT,
        color: 'Brindle',
        microchip_number: 'MC753159486',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular checkups, monitoring for bloat. Recent hip X-rays normal.',
        behavioral_notes: 'Gentle giant, very calm, good with children. Needs space to move.',
        dietary_requirements: 'Large breed formula with joint support',
        allergies: [],
        medications: ['Joint supplements'],
        emergency_contact: 'Susan Miller',
        emergency_phone: '+1-555-0406',
        photo_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
        owner_email: 'david.miller@example.com',
      },
      {
        name: 'Princess',
        species: PetSpecies.CAT,
        breed: 'British Shorthair',
        gender: PetGender.FEMALE,
        date_of_birth: '2021-11-25',
        weight: 10.5,
        size: PetSize.MEDIUM,
        color: 'Blue',
        microchip_number: 'MC486753159',
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: 'Regular checkups, no health issues. Dense coat requires regular brushing.',
        behavioral_notes: 'Independent, calm, not very active. Prefers quiet environments.',
        dietary_requirements: 'Premium cat food for dense coats',
        allergies: [],
        medications: [],
        emergency_contact: 'Susan Miller',
        emergency_phone: '+1-555-0406',
        photo_url: 'https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop',
        owner_email: 'david.miller@example.com',
      },
    ];

    const pets: Pet[] = [];
    for (const data of petData) {
      try {
        // Find the owner
        const owner = users.patients.find((u) => u.email === data.owner_email);
        if (!owner) {
          this.logger.warn(`Owner not found for pet ${data.name}: ${data.owner_email}`);
          continue;
        }

        // Create pet data
        const petDataToSave = {
          ...data,
          owner_id: owner.id,
          date_of_birth: new Date(data.date_of_birth),
        };

        // Remove owner_email as it's not a pet field
        delete (petDataToSave as any).owner_email;

        const pet = this.petRepository.create(petDataToSave);
        const savedPet = await this.petRepository.save(pet);
        pets.push(savedPet);

        this.logger.log(`Created pet: ${savedPet.name} (${savedPet.species}) for owner ${owner.email}`);
      } catch (error) {
        this.logger.error(`Failed to create pet ${data.name}:`, error);
        throw error;
      }
    }

    return pets;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing all pets and related data...');
    try {
      // Clear AI health insights first (references pets)
      await this.aiHealthInsightRepository.createQueryBuilder().delete().execute();
      this.logger.log('AI health insights cleared');

      // Clear clinic appointments that reference pets
      await this.petRepository.manager.query('DELETE FROM clinic_appointments WHERE pet_id IS NOT NULL');
      this.logger.log('Clinic appointments cleared');

      // Clear clinic pet cases that reference pets
      await this.petRepository.manager.query('DELETE FROM clinic_pet_cases WHERE pet_id IS NOT NULL');
      this.logger.log('Clinic pet cases cleared');

      // Then clear pets
      await this.petRepository.createQueryBuilder().delete().execute();
      this.logger.log('All pets cleared');
    } catch (error) {
      this.logger.error('Error clearing pets:', error);
      throw error;
    }
  }
}
