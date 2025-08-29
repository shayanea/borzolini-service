import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pet, PetSpecies, PetGender, PetSize } from "./entities/pet.entity";
import { User, UserRole } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

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
    private readonly usersService: UsersService,
  ) {}

  async seed(): Promise<void> {
    this.logger.log("Starting pets seeding...");

    try {
      // Check if pets already exist
      const existingPets = await this.petRepository.count();
      if (existingPets > 0) {
        this.logger.log("Pets already seeded, skipping...");
        return;
      }

      // Validate that required users exist
      const requiredUsers = await this.validateRequiredUsers();
      if (!requiredUsers) {
        throw new Error(
          "Required users not found. Please run users seeder first.",
        );
      }

      this.logger.log("Creating sample pets...");
      const pets = await this.createSamplePets(requiredUsers);

      this.logger.log(
        `✅ Pets seeding completed! Created ${pets.length} pets`,
      );
    } catch (error) {
      this.logger.error(
        "❌ Error seeding pets:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private async validateRequiredUsers(): Promise<{
    patients: User[];
  } | null> {
    try {
      const allUsersResult = await this.usersService.findAll();
      const allUsers = allUsersResult.users;
      const patientUsers = allUsers.filter(
        (user) => user.role === UserRole.PATIENT && user.isActive,
      );

      if (patientUsers.length === 0) {
        this.logger.warn("No patient users found for pet creation");
        return null;
      }

      return { patients: patientUsers };
    } catch (error) {
      this.logger.error(
        "Error validating required users:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  private async createSamplePets(users: { patients: User[] }): Promise<Pet[]> {
    const petData: PetData[] = [
      // John Doe's pets
      {
        name: "Buddy",
        species: PetSpecies.DOG,
        breed: "Golden Retriever",
        gender: PetGender.MALE,
        date_of_birth: "2020-03-15",
        weight: 65.5,
        size: PetSize.LARGE,
        color: "Golden",
        microchip_number: "MC123456789",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Annual checkups, no major issues",
        behavioral_notes: "Friendly, loves children, good with other dogs",
        dietary_requirements: "Grain-free diet due to mild sensitivity",
        allergies: ["chicken", "wheat"],
        medications: [],
        emergency_contact: "Jane Doe",
        emergency_phone: "+1234567894",
        photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
        owner_email: "john.doe@example.com",
      },
      {
        name: "Luna",
        species: PetSpecies.CAT,
        breed: "Domestic Shorthair",
        gender: PetGender.FEMALE,
        date_of_birth: "2021-07-22",
        weight: 8.2,
        size: PetSize.SMALL,
        color: "Black and White",
        microchip_number: "MC987654321",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Spayed at 6 months, regular vaccinations",
        behavioral_notes: "Independent, loves window watching, good with children",
        dietary_requirements: "High-protein cat food",
        allergies: [],
        medications: [],
        emergency_contact: "Jane Doe",
        emergency_phone: "+1234567894",
        photo_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
        owner_email: "john.doe@example.com",
      },

      // Jane Smith's pets
      {
        name: "Max",
        species: PetSpecies.DOG,
        breed: "Labrador Retriever",
        gender: PetGender.MALE,
        date_of_birth: "2019-11-08",
        weight: 72.0,
        size: PetSize.LARGE,
        color: "Black",
        microchip_number: "MC456789123",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Hip dysplasia monitoring, regular exercise recommended",
        behavioral_notes: "Energetic, loves swimming, excellent with kids",
        dietary_requirements: "Joint health formula",
        allergies: [],
        medications: ["Glucosamine supplement"],
        emergency_contact: "John Smith",
        emergency_phone: "+1234567895",
        photo_url: "https://images.unsplash.com/photo-1547407139-3c921a64505c?w=400&h=400&fit=crop",
        owner_email: "jane.smith@example.com",
      },
      {
        name: "Whiskers",
        species: PetSpecies.CAT,
        breed: "Persian",
        gender: PetGender.MALE,
        date_of_birth: "2020-01-15",
        weight: 12.5,
        size: PetSize.MEDIUM,
        color: "Cream",
        microchip_number: "MC789123456",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Regular grooming needed, eye care routine",
        behavioral_notes: "Calm, enjoys being brushed, prefers quiet environments",
        dietary_requirements: "Hairball control formula",
        allergies: [],
        medications: ["Eye drops for tear staining"],
        emergency_contact: "John Smith",
        emergency_phone: "+1234567895",
        photo_url: "https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop",
        owner_email: "jane.smith@example.com",
      },

      // Mike Brown's pets
      {
        name: "Rocky",
        species: PetSpecies.DOG,
        breed: "German Shepherd",
        gender: PetGender.MALE,
        date_of_birth: "2021-04-12",
        weight: 78.0,
        size: PetSize.LARGE,
        color: "Black and Tan",
        microchip_number: "MC321654987",
        is_spayed_neutered: false,
        is_vaccinated: true,
        medical_history: "Training for service dog certification",
        behavioral_notes: "Highly intelligent, protective, excellent obedience",
        dietary_requirements: "High-quality working dog food",
        allergies: [],
        medications: [],
        emergency_contact: "Sarah Brown",
        emergency_phone: "+1234567896",
        photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
        owner_email: "mike.brown@example.com",
      },

      // Sarah Wilson's pets
      {
        name: "Bella",
        species: PetSpecies.DOG,
        breed: "Cavalier King Charles Spaniel",
        gender: PetGender.FEMALE,
        date_of_birth: "2022-02-28",
        weight: 18.5,
        size: PetSize.SMALL,
        color: "Blenheim",
        microchip_number: "MC147258369",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Regular heart monitoring due to breed predisposition",
        behavioral_notes: "Gentle, affectionate, great companion dog",
        dietary_requirements: "Heart-healthy diet",
        allergies: [],
        medications: ["Heart health supplement"],
        emergency_contact: "Mike Wilson",
        emergency_phone: "+1234567897",
        photo_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&h=400&fit=crop",
        owner_email: "sarah.wilson@example.com",
      },
      {
        name: "Oliver",
        species: PetSpecies.CAT,
        breed: "Maine Coon",
        gender: PetGender.MALE,
        date_of_birth: "2021-09-10",
        weight: 16.8,
        size: PetSize.LARGE,
        color: "Orange Tabby",
        microchip_number: "MC963852741",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Regular dental care, large breed monitoring",
        behavioral_notes: "Playful, loves interactive toys, good with other pets",
        dietary_requirements: "Large breed cat formula",
        allergies: [],
        medications: [],
        emergency_contact: "Mike Wilson",
        emergency_phone: "+1234567897",
        photo_url: "https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop",
        owner_email: "sarah.wilson@example.com",
      },

      // Alex Chen's pets
      {
        name: "Shadow",
        species: PetSpecies.DOG,
        breed: "Border Collie",
        gender: PetGender.FEMALE,
        date_of_birth: "2020-06-18",
        weight: 42.0,
        size: PetSize.MEDIUM,
        color: "Black and White",
        microchip_number: "MC852963741",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Active working dog, regular exercise essential",
        behavioral_notes: "High energy, intelligent, needs mental stimulation",
        dietary_requirements: "Active dog formula with joint support",
        allergies: [],
        medications: [],
        emergency_contact: "Jennifer Chen",
        emergency_phone: "+1234567899",
        photo_url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=400&fit=crop",
        owner_email: "alex.chen@example.com",
      },
      {
        name: "Mittens",
        species: PetSpecies.CAT,
        breed: "Ragdoll",
        gender: PetGender.FEMALE,
        date_of_birth: "2021-12-03",
        weight: 11.2,
        size: PetSize.MEDIUM,
        color: "Seal Point",
        microchip_number: "MC741852963",
        is_spayed_neutered: true,
        is_vaccinated: true,
        medical_history: "Regular grooming, gentle handling required",
        behavioral_notes: "Relaxed, affectionate, goes limp when held",
        dietary_requirements: "Premium indoor cat formula",
        allergies: [],
        medications: [],
        emergency_contact: "Jennifer Chen",
        emergency_phone: "+1234567899",
        photo_url: "https://images.unsplash.com/photo-1518791841407-5c8ac7fcefa7?w=400&h=400&fit=crop",
        owner_email: "alex.chen@example.com",
      },
    ];

    const pets: Pet[] = [];
    for (const data of petData) {
      try {
        // Find the owner
        const owner = users.patients.find(u => u.email === data.owner_email);
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

        this.logger.log(
          `Created pet: ${savedPet.name} (${savedPet.species}) for owner ${owner.email}`,
        );
      } catch (error) {
        this.logger.error(`Failed to create pet ${data.name}:`, error);
        throw error;
      }
    }

    return pets;
  }

  async clear(): Promise<void> {
    this.logger.log("Clearing all pets...");
    try {
      await this.petRepository.clear();
      this.logger.log("All pets cleared");
    } catch (error) {
      this.logger.error("Error clearing pets:", error);
      throw error;
    }
  }
}
