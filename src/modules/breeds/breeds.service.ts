import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllBreedsResponseDto, BreedResponseDto, BreedsBySpeciesResponseDto } from './dto/breed-response.dto';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { Breed, PetSpecies } from './entities/breed.entity';

@Injectable()
export class BreedsService {
  constructor(
    @InjectRepository(Breed)
    private readonly breedRepository: Repository<Breed>
  ) {}

  /**
   * Create a new breed
   */
  async create(createBreedDto: CreateBreedDto): Promise<BreedResponseDto> {
    // Check if breed already exists for this species
    const existingBreed = await this.breedRepository.findOne({
      where: {
        name: createBreedDto.name,
        species: createBreedDto.species,
      },
    });

    if (existingBreed) {
      throw new ConflictException(`Breed '${createBreedDto.name}' already exists for species '${createBreedDto.species}'`);
    }

    const breed = this.breedRepository.create(createBreedDto);
    const savedBreed = await this.breedRepository.save(breed);
    return this.mapToResponseDto(savedBreed);
  }

  /**
   * Get all breeds without pagination
   */
  async findAll(): Promise<AllBreedsResponseDto> {
    const breeds = await this.breedRepository.find({
      where: { is_active: true },
      order: { species: 'ASC', name: 'ASC' },
    });

    // Group breeds by species
    const breedsBySpecies = this.groupBreedsBySpecies(breeds);

    return {
      breeds_by_species: breedsBySpecies,
      total_breeds: breeds.length,
      total_species: breedsBySpecies.length,
    };
  }

  /**
   * Get all breeds for a specific species
   */
  async findBySpecies(species: PetSpecies): Promise<BreedResponseDto[]> {
    const breeds = await this.breedRepository.find({
      where: { species, is_active: true },
      order: { name: 'ASC' },
    });

    return breeds.map((breed) => this.mapToResponseDto(breed));
  }

  /**
   * Get a single breed by ID
   */
  async findOne(id: string): Promise<BreedResponseDto> {
    const breed = await this.breedRepository.findOne({
      where: { id, is_active: true },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return this.mapToResponseDto(breed);
  }

  /**
   * Get a breed by name and species
   */
  async findByNameAndSpecies(name: string, species: PetSpecies): Promise<BreedResponseDto> {
    const breed = await this.breedRepository.findOne({
      where: { name, species, is_active: true },
    });

    if (!breed) {
      throw new NotFoundException(`Breed '${name}' not found for species '${species}'`);
    }

    return this.mapToResponseDto(breed);
  }

  /**
   * Update a breed
   */
  async update(id: string, updateBreedDto: UpdateBreedDto): Promise<BreedResponseDto> {
    const breed = await this.breedRepository.findOne({
      where: { id, is_active: true },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    // Check for name/species conflict if name or species is being updated
    if (updateBreedDto.name || updateBreedDto.species) {
      const name = updateBreedDto.name || breed.name;
      const species = updateBreedDto.species || breed.species;

      const existingBreed = await this.breedRepository.findOne({
        where: { name, species },
      });

      if (existingBreed && existingBreed.id !== id) {
        throw new ConflictException(`Breed '${name}' already exists for species '${species}'`);
      }
    }

    Object.assign(breed, updateBreedDto);
    const updatedBreed = await this.breedRepository.save(breed);
    return this.mapToResponseDto(updatedBreed);
  }

  /**
   * Soft delete a breed (set is_active to false)
   */
  async remove(id: string): Promise<void> {
    const breed = await this.breedRepository.findOne({
      where: { id, is_active: true },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    breed.is_active = false;
    await this.breedRepository.save(breed);
  }

  /**
   * Get breed statistics
   */
  async getStatistics(): Promise<{
    total_breeds: number;
    breeds_by_species: Record<string, number>;
    breeds_by_size: Record<string, number>;
  }> {
    const breeds = await this.breedRepository.find({
      where: { is_active: true },
    });

    const breedsBySpecies: Record<string, number> = {};
    const breedsBySize: Record<string, number> = {};

    breeds.forEach((breed) => {
      // Count by species
      breedsBySpecies[breed.species] = (breedsBySpecies[breed.species] || 0) + 1;

      // Count by size
      if (breed.size_category) {
        breedsBySize[breed.size_category] = (breedsBySize[breed.size_category] || 0) + 1;
      }
    });

    return {
      total_breeds: breeds.length,
      breeds_by_species: breedsBySpecies,
      breeds_by_size: breedsBySize,
    };
  }

  /**
   * Search breeds by name
   */
  async searchByName(searchTerm: string): Promise<BreedResponseDto[]> {
    const breeds = await this.breedRepository
      .createQueryBuilder('breed')
      .where('breed.is_active = :isActive', { isActive: true })
      .andWhere('LOWER(breed.name) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orderBy('breed.species', 'ASC')
      .addOrderBy('breed.name', 'ASC')
      .getMany();

    return breeds.map((breed) => this.mapToResponseDto(breed));
  }

  /**
   * Private helper methods
   */
  private groupBreedsBySpecies(breeds: Breed[]): BreedsBySpeciesResponseDto[] {
    const groupedBreeds: Record<string, Breed[]> = {};

    breeds.forEach((breed) => {
      groupedBreeds[breed.species] = groupedBreeds[breed.species] ?? [];
      groupedBreeds[breed.species]!.push(breed);
    });

    return Object.entries(groupedBreeds).map(([species, speciesBreeds]) => ({
      species,
      breeds: speciesBreeds.map((breed) => this.mapToResponseDto(breed)),
    }));
  }

  private mapToResponseDto(breed: Breed): BreedResponseDto {
    const dto: Partial<BreedResponseDto> = {
      id: breed.id,
      name: breed.name,
      species: breed.species,
      temperament: breed.temperament ?? '',
      health_risks: breed.health_risks,
      is_active: breed.is_active,
      created_at: breed.created_at,
      updated_at: breed.updated_at,
    };

    if (breed.size_category !== undefined) {
      dto.size_category = breed.size_category;
    }
    if (breed.life_expectancy_min !== undefined) {
      dto.life_expectancy_min = breed.life_expectancy_min;
    }
    if (breed.life_expectancy_max !== undefined) {
      dto.life_expectancy_max = breed.life_expectancy_max;
    }
    if (breed.weight_min !== undefined) {
      dto.weight_min = breed.weight_min;
    }
    if (breed.weight_max !== undefined) {
      dto.weight_max = breed.weight_max;
    }
    if (breed.origin_country !== undefined) {
      dto.origin_country = breed.origin_country;
    }
    if (breed.origin_history !== undefined) {
      dto.origin_history = breed.origin_history;
    }
    if (breed.description !== undefined) {
      dto.description = breed.description;
    }
    if (breed.resources !== undefined) {
      dto.resources = breed.resources;
    }
    if (breed.grooming_needs !== undefined) {
      dto.grooming_needs = breed.grooming_needs;
    }
    if (breed.exercise_needs !== undefined) {
      dto.exercise_needs = breed.exercise_needs;
    }

    return dto as BreedResponseDto;
  }
}
