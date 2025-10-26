import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet, PetGender, PetSize, PetSpecies } from './entities/pet.entity';

export interface PetFilters {
  species?: PetSpecies | undefined;
  gender?: PetGender | undefined;
  size?: PetSize | undefined;
  is_spayed_neutered?: boolean | undefined;
  is_vaccinated?: boolean | undefined;
  search?: string | undefined;
  owner_id?: string | undefined;
  clinic_id?: string | undefined;
}

export interface PetStats {
  total: number;
  bySpecies: Record<PetSpecies, number>;
  byGender: Record<PetGender, number>;
  bySize: Record<PetSize, number>;
  spayedNeutered: number;
  vaccinated: number;
  averageAge: number;
}

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createPetDto: CreatePetDto, ownerId: string): Promise<Pet> {
    // Verify owner exists
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    // Create pet data
    const petData = {
      ...createPetDto,
      owner_id: ownerId,
    };

    // Handle date conversion
    if (createPetDto.date_of_birth) {
      (petData as any).date_of_birth = new Date(createPetDto.date_of_birth);
    }

    const pet = this.petRepository.create(petData);

    // Calculate size based on weight if not provided
    if (!pet.size && pet.weight) {
      pet.size = this.calculateSizeFromWeight(pet.weight);
    }

    const savedPet = await this.petRepository.save(pet);
    this.logger.log(`Created pet ${savedPet.name} for owner ${ownerId}`);

    return savedPet;
  }

  async findAll(filters?: PetFilters, page: number = 1, limit: number = 10, sortBy: string = 'created_at', sortOrder: 'ASC' | 'DESC' = 'DESC'): Promise<{ pets: Pet[]; total: number; page: number; totalPages: number }> {
    const where: any = { is_active: true };

    // Apply filters
    if (filters?.species) where.species = filters.species;
    if (filters?.gender) where.gender = filters.gender;
    if (filters?.size) where.size = filters.size;
    if (filters?.is_spayed_neutered !== undefined) where.is_spayed_neutered = filters.is_spayed_neutered;
    if (filters?.is_vaccinated !== undefined) where.is_vaccinated = filters.is_vaccinated;
    if (filters?.owner_id) where.owner_id = filters.owner_id;

    // Validate sortBy parameter against allowed columns
    const allowedSortColumns = ['created_at', 'updated_at', 'name', 'species', 'gender', 'size', 'date_of_birth', 'weight', 'is_spayed_neutered', 'is_vaccinated'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

    // Build count query with clinic filtering if needed
    let countQuery = this.petRepository.createQueryBuilder('pet').leftJoinAndSelect('pet.owner', 'owner');
    
    // Apply clinic_id filter if provided - show only pets with appointments at that clinic
    if (filters?.clinic_id) {
      countQuery = countQuery
        .innerJoin('appointments', 'appt', 'appt.pet_id = pet.id AND appt.clinic_id = :clinicId', { clinicId: filters.clinic_id })
        .andWhere('pet.is_active = :isActive', { isActive: true });
    } else {
      countQuery = countQuery.where(where);
    }

    // Apply other filters
    if (filters?.species && !filters?.clinic_id) where.species = filters.species;
    if (filters?.gender && !filters?.clinic_id) where.gender = filters.gender;
    if (filters?.size && !filters?.clinic_id) where.size = filters.size;
    if (filters?.is_spayed_neutered !== undefined && !filters?.clinic_id) where.is_spayed_neutered = filters.is_spayed_neutered;
    if (filters?.is_vaccinated !== undefined && !filters?.clinic_id) where.is_vaccinated = filters.is_vaccinated;
    if (filters?.owner_id && !filters?.clinic_id) where.owner_id = filters.owner_id;

    // Apply search filter to count query
    if (filters?.search) {
      countQuery = countQuery.andWhere('(pet.name ILIKE :search OR pet.breed ILIKE :search OR pet.color ILIKE :search)', { search: `%${filters.search}%` });
    }

    // Get total count
    const total = await countQuery.getCount();

    // Build data query with clinic filtering if needed
    let dataQuery = this.petRepository.createQueryBuilder('pet').leftJoinAndSelect('pet.owner', 'owner');
    
    // Apply clinic_id filter if provided
    if (filters?.clinic_id) {
      dataQuery = dataQuery
        .innerJoin('appointments', 'appt', 'appt.pet_id = pet.id AND appt.clinic_id = :clinicId', { clinicId: filters.clinic_id })
        .andWhere('pet.is_active = :isActive', { isActive: true });
    } else {
      dataQuery = dataQuery.where(where);
    }

    // Apply search filter to data query
    if (filters?.search) {
      dataQuery = dataQuery.andWhere('(pet.name ILIKE :search OR pet.breed ILIKE :search OR pet.color ILIKE :search)', { search: `%${filters.search}%` });
    }

    // Apply sorting
    dataQuery = dataQuery.orderBy(`pet.${validSortBy}`, sortOrder);

    // Apply pagination
    const pets = await dataQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      pets,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Pet> {
    this.validateUUID(id);

    const pet = await this.petRepository.findOne({
      where: { id, is_active: true },
      relations: ['owner', 'appointments'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    return pet;
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    const pets = await this.petRepository.find({
      where: { owner_id: ownerId, is_active: true },
      relations: ['appointments'],
      order: { created_at: 'DESC' },
    });

    return pets;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    this.validateUUID(id);
    const pet = await this.findOne(id);

    // Handle date conversion
    if (updatePetDto.date_of_birth) {
      (updatePetDto as any).date_of_birth = new Date(updatePetDto.date_of_birth);
    }

    // Calculate size based on weight if weight is updated
    if (updatePetDto.weight && !updatePetDto.size) {
      (updatePetDto as any).size = this.calculateSizeFromWeight(updatePetDto.weight);
    }

    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petRepository.save(pet);

    this.logger.log(`Updated pet ${id}`);
    return updatedPet;
  }

  async remove(id: string): Promise<void> {
    this.validateUUID(id);
    const pet = await this.findOne(id);

    // Soft delete by setting is_active to false
    pet.is_active = false;
    await this.petRepository.save(pet);

    this.logger.log(`Soft deleted pet ${id}`);
  }

  async hardRemove(id: string): Promise<void> {
    this.validateUUID(id);
    const pet = await this.findOne(id);
    await this.petRepository.remove(pet);

    this.logger.log(`Hard deleted pet ${id}`);
  }

  async getPetStats(clinicId?: string): Promise<PetStats> {
    let query = this.petRepository.createQueryBuilder('pet').where('pet.is_active = :isActive', { isActive: true });
    
    // If clinic_id provided, filter pets by appointments at that clinic
    if (clinicId) {
      query = query
        .innerJoin('appointments', 'appt', 'appt.pet_id = pet.id AND appt.clinic_id = :clinicId', { clinicId });
    }
    
    const pets = await query.getMany();

    const stats: PetStats = {
      total: pets.length,
      bySpecies: {
        [PetSpecies.DOG]: 0,
        [PetSpecies.CAT]: 0,
        [PetSpecies.BIRD]: 0,
        [PetSpecies.RABBIT]: 0,
        [PetSpecies.HAMSTER]: 0,
        [PetSpecies.FISH]: 0,
        [PetSpecies.REPTILE]: 0,
        [PetSpecies.HORSE]: 0,
        [PetSpecies.OTHER]: 0,
      },
      byGender: {
        [PetGender.MALE]: 0,
        [PetGender.FEMALE]: 0,
        [PetGender.UNKNOWN]: 0,
      },
      bySize: {
        [PetSize.TINY]: 0,
        [PetSize.SMALL]: 0,
        [PetSize.MEDIUM]: 0,
        [PetSize.LARGE]: 0,
        [PetSize.GIANT]: 0,
      },
      spayedNeutered: 0,
      vaccinated: 0,
      averageAge: 0,
    };

    let totalAge = 0;
    let petsWithAge = 0;

    pets.forEach((pet) => {
      // Count by species
      if (pet.species) {
        stats.bySpecies[pet.species]++;
      }

      // Count by gender
      if (pet.gender) {
        stats.byGender[pet.gender]++;
      }

      // Count by size
      if (pet.size) {
        stats.bySize[pet.size]++;
      }

      // Count spayed/neutered
      if (pet.is_spayed_neutered) {
        stats.spayedNeutered++;
      }

      // Count vaccinated
      if (pet.is_vaccinated) {
        stats.vaccinated++;
      }

      // Calculate average age
      if (pet.age !== null) {
        totalAge += pet.age;
        petsWithAge++;
      }
    });

    stats.averageAge = petsWithAge > 0 ? Math.round(totalAge / petsWithAge) : 0;

    return stats;
  }

  async getPetsBySpecies(species: PetSpecies): Promise<Pet[]> {
    return this.petRepository.find({
      where: { species, is_active: true },
      relations: ['owner'],
      order: { name: 'ASC' },
    });
  }

  async getPetsNeedingVaccination(): Promise<Pet[]> {
    return this.petRepository.find({
      where: { is_vaccinated: false, is_active: true },
      relations: ['owner'],
      order: { created_at: 'ASC' },
    });
  }

  async getPetsNeedingSpayNeuter(): Promise<Pet[]> {
    return this.petRepository.find({
      where: { is_spayed_neutered: false, is_active: true },
      relations: ['owner'],
      order: { created_at: 'ASC' },
    });
  }

  async getDistinctAllergies(): Promise<string[]> {
    const rows: Array<{ value: string | null }> = await this.petRepository.query(`SELECT DISTINCT jsonb_array_elements_text(allergies) AS value FROM pets WHERE is_active = true AND jsonb_array_length(allergies) > 0 ORDER BY value ASC;`);
    return rows.map((r) => (r.value ?? '').trim()).filter((v) => v.length > 0);
  }

  async getDistinctMedications(): Promise<string[]> {
    const rows: Array<{ value: string | null }> = await this.petRepository.query(
      `SELECT DISTINCT jsonb_array_elements_text(medications) AS value FROM pets WHERE is_active = true AND jsonb_array_length(medications) > 0 ORDER BY value ASC;`
    );
    return rows.map((r) => (r.value ?? '').trim()).filter((v) => v.length > 0);
  }

  private calculateSizeFromWeight(weight: number): PetSize {
    if (weight < 5) return PetSize.TINY;
    if (weight < 20) return PetSize.SMALL;
    if (weight < 50) return PetSize.MEDIUM;
    if (weight < 100) return PetSize.LARGE;
    return PetSize.GIANT;
  }

  async validatePetData(petData: CreatePetDto): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate date of birth is not in the future
    if (petData.date_of_birth) {
      const birthDate = new Date(petData.date_of_birth);
      if (birthDate > new Date()) {
        errors.push('Date of birth cannot be in the future');
      }
    }

    // Validate weight is reasonable
    if (petData.weight !== undefined) {
      if (petData.weight < 0) {
        errors.push('Weight cannot be negative');
      }
      if (petData.weight > 1000) {
        errors.push('Weight seems unreasonably high');
      }
    }

    // Validate microchip number format (basic validation)
    if (petData.microchip_number) {
      if (!/^\d{9,15}$/.test(petData.microchip_number)) {
        errors.push('Microchip number should be 9-15 digits');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateUUID(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
  }
}
