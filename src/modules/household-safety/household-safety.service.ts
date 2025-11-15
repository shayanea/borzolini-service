import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { FoodItem, FoodSafetyLevel } from './entities/food-item.entity';
import { FoodAlias } from './entities/food-alias.entity';
import { Plant, PlantToxicityLevel } from './entities/plant.entity';
import { HouseholdItem, HazardSeverity } from './entities/household-item.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';

@Injectable()
export class HouseholdSafetyService {
  constructor(
    @InjectRepository(FoodItem) private readonly foodRepo: Repository<FoodItem>,
    @InjectRepository(FoodAlias) private readonly aliasRepo: Repository<FoodAlias>,
    @InjectRepository(Plant) private readonly plantRepo: Repository<Plant>,
    @InjectRepository(HouseholdItem) private readonly itemRepo: Repository<HouseholdItem>,
  ) {}

  async searchAll(query: string, species?: PetSpecies) {
    const q = `%${query}%`;
    const [foods, plants, items] = await Promise.all([
      this.foodRepo.find({
        where: [{ canonical_name: ILike(q) }, { scientific_name: ILike(q) }],
        take: 25,
        relations: ['safety_by_species'],
      }),
      this.plantRepo.find({
        where: [{ canonical_name: ILike(q) }, { scientific_name: ILike(q) }],
        take: 25,
        relations: ['toxicity_by_species'],
      }),
      this.itemRepo.find({ where: { canonical_name: ILike(q) }, take: 25, relations: ['hazards_by_species'] }),
    ]);

    const filterBySpecies = (arr: any[], key: string) =>
      species
        ? arr.map((a) => ({ ...a, [key]: (a[key] || []).filter((s: any) => s.species === species) }))
        : arr;

    return {
      foods: filterBySpecies(foods, 'safety_by_species'),
      plants: filterBySpecies(plants, 'toxicity_by_species'),
      items: filterBySpecies(items, 'hazards_by_species'),
    };
  }

  async listFoods(species?: PetSpecies) {
    const foods = await this.foodRepo.find({ relations: ['safety_by_species'], take: 100 });
    return species ? foods.map((f) => ({ ...f, safety_by_species: (f.safety_by_species || []).filter((s) => s.species === species) })) : foods;
  }

  async listPlants(species?: PetSpecies) {
    const plants = await this.plantRepo.find({ relations: ['toxicity_by_species'], take: 100 });
    return species
      ? plants.map((p) => ({ ...p, toxicity_by_species: (p.toxicity_by_species || []).filter((t) => t.species === species) }))
      : plants;
  }

  async listItems(species?: PetSpecies) {
    const items = await this.itemRepo.find({ relations: ['hazards_by_species'], take: 100 });
    return species
      ? items.map((i) => ({ ...i, hazards_by_species: (i.hazards_by_species || []).filter((h) => h.species === species) }))
      : items;
  }

  async resolveFoodAlias(alias: string) {
    const record = await this.aliasRepo.findOne({ where: { alias: ILike(alias) }, relations: ['food'] });
    return record?.food ?? null;
  }

  // Admin Methods

  /**
   * Get all food items with pagination, filtering, and sorting (Admin only)
   */
  async findAllFoods(options: {
    page: number;
    limit: number;
    search?: string;
    species?: PetSpecies;
    safetyLevel?: FoodSafetyLevel;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): Promise<{ foods: FoodItem[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.foodRepo.createQueryBuilder('food')
      .leftJoinAndSelect('food.safety_by_species', 'safety');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.search) {
      conditions.push('(food.canonical_name ILIKE :search OR food.scientific_name ILIKE :search)');
      params.search = `%${options.search}%`;
    }

    if (options.safetyLevel) {
      conditions.push('food.safety_overall = :safetyLevel');
      params.safetyLevel = options.safetyLevel;
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    if (options.species) {
      // Use EXISTS subquery to filter by species without excluding items without species relationships
      if (conditions.length > 0) {
        queryBuilder.andWhere(
          'EXISTS (SELECT 1 FROM pet_food_safety_by_species s WHERE s.food_id = food.id AND s.species = :species)',
          { species: options.species }
        );
      } else {
        queryBuilder.where(
          'EXISTS (SELECT 1 FROM pet_food_safety_by_species s WHERE s.food_id = food.id AND s.species = :species)',
          { species: options.species }
        );
      }
    }

    const total = await queryBuilder.getCount();

    // Validate sortBy to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'canonical_name', 'safety_overall', 'category'];
    const sortBy = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';
    const sortOrder = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .orderBy(`food.${sortBy}`, sortOrder)
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const foods = await queryBuilder.getMany();

    return {
      foods,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  /**
   * Get all plants with pagination, filtering, and sorting (Admin only)
   */
  async findAllPlants(options: {
    page: number;
    limit: number;
    search?: string;
    species?: PetSpecies;
    toxicityLevel?: PlantToxicityLevel;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): Promise<{ plants: Plant[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.plantRepo.createQueryBuilder('plant')
      .leftJoinAndSelect('plant.toxicity_by_species', 'toxicity');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.search) {
      conditions.push('(plant.canonical_name ILIKE :search OR plant.scientific_name ILIKE :search)');
      params.search = `%${options.search}%`;
    }

    if (options.toxicityLevel) {
      conditions.push('plant.toxicity_overall = :toxicityLevel');
      params.toxicityLevel = options.toxicityLevel;
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    if (options.species) {
      // Use EXISTS subquery to filter by species without excluding plants without species relationships
      if (conditions.length > 0) {
        queryBuilder.andWhere(
          'EXISTS (SELECT 1 FROM household_plant_toxicity_by_species t WHERE t.plant_id = plant.id AND t.species = :species)',
          { species: options.species }
        );
      } else {
        queryBuilder.where(
          'EXISTS (SELECT 1 FROM household_plant_toxicity_by_species t WHERE t.plant_id = plant.id AND t.species = :species)',
          { species: options.species }
        );
      }
    }

    const total = await queryBuilder.getCount();

    // Validate sortBy to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'canonical_name', 'toxicity_overall'];
    const sortBy = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';
    const sortOrder = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .orderBy(`plant.${sortBy}`, sortOrder)
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const plants = await queryBuilder.getMany();

    return {
      plants,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  /**
   * Get all household items with pagination, filtering, and sorting (Admin only)
   */
  async findAllItems(options: {
    page: number;
    limit: number;
    search?: string;
    species?: PetSpecies;
    severity?: HazardSeverity;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): Promise<{ items: HouseholdItem[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.itemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.hazards_by_species', 'hazards');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.search) {
      conditions.push('item.canonical_name ILIKE :search');
      params.search = `%${options.search}%`;
    }

    if (options.severity) {
      conditions.push('item.severity_overall = :severity');
      params.severity = options.severity;
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    if (options.species) {
      // Use EXISTS subquery to filter by species without excluding items without species relationships
      if (conditions.length > 0) {
        queryBuilder.andWhere(
          'EXISTS (SELECT 1 FROM household_item_hazards_by_species h WHERE h.item_id = item.id AND h.species = :species)',
          { species: options.species }
        );
      } else {
        queryBuilder.where(
          'EXISTS (SELECT 1 FROM household_item_hazards_by_species h WHERE h.item_id = item.id AND h.species = :species)',
          { species: options.species }
        );
      }
    }

    const total = await queryBuilder.getCount();

    // Validate sortBy to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'canonical_name', 'severity_overall', 'category'];
    const sortBy = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';
    const sortOrder = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .orderBy(`item.${sortBy}`, sortOrder)
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }
}


