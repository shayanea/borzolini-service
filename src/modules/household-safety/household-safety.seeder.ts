import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem, FoodSafetyLevel } from './entities/food-item.entity';
import { Plant, PlantToxicityLevel } from './entities/plant.entity';
import { HouseholdItem, HazardSeverity } from './entities/household-item.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { FoodSafetyBySpecies } from './entities/food-safety-by-species.entity';
import { PlantToxicityBySpecies } from './entities/plant-toxicity-by-species.entity';
import { ItemHazardBySpecies } from './entities/item-hazard-by-species.entity';
import * as crypto from 'crypto';

@Injectable()
export class HouseholdSafetySeeder {
  private readonly logger = new Logger(HouseholdSafetySeeder.name);

  constructor(
    @InjectRepository(FoodItem) private readonly foodRepo: Repository<FoodItem>,
    @InjectRepository(FoodSafetyBySpecies) private readonly foodSafetyRepo: Repository<FoodSafetyBySpecies>,
    @InjectRepository(Plant) private readonly plantRepo: Repository<Plant>,
    @InjectRepository(PlantToxicityBySpecies) private readonly plantToxicityRepo: Repository<PlantToxicityBySpecies>,
    @InjectRepository(HouseholdItem) private readonly itemRepo: Repository<HouseholdItem>,
    @InjectRepository(ItemHazardBySpecies) private readonly itemHazardRepo: Repository<ItemHazardBySpecies>,
  ) {}

  private createHash(data: string): Buffer {
    return crypto.createHash('sha256').update(data).digest();
  }

  async seed() {
    this.logger.log('🌱 Starting household safety seeding...');
    await this.seedFoods();
    await this.seedPlants();
    await this.seedItems();
    this.logger.log('✅ Household safety seeding completed.');
  }

  async clear() {
    this.logger.log('🧹 Clearing household safety data...');
    // Clear dependent tables first
    await this.foodSafetyRepo.query('DELETE FROM "pet_food_safety_by_species"');
    await this.plantToxicityRepo.query('DELETE FROM "household_plant_toxicity_by_species"');
    await this.itemHazardRepo.query('DELETE FROM "household_item_hazards_by_species"');
    // Clear parent tables
    await this.foodRepo.query('DELETE FROM "pet_food_items"');
    await this.plantRepo.query('DELETE FROM "household_plants"');
    await this.itemRepo.query('DELETE FROM "household_items"');
  }

  async seedFoods() {
    const foods = [
      {
        canonical_name: 'Chocolate',
        safety_overall: FoodSafetyLevel.TOXIC,
        notes_markdown: 'Contains theobromine, which is toxic to most pets.',
        source_primary: 'ASPCA',
        source_name: 'ASPCA Animal Poison Control',
        species_safety: [
          { species: PetSpecies.DOG, safety: FoodSafetyLevel.TOXIC, risks: ['Vomiting', 'Diarrhea', 'Seizures'] },
          { species: PetSpecies.CAT, safety: FoodSafetyLevel.TOXIC, risks: ['Vomiting', 'Seizures', 'Death'] },
          { species: PetSpecies.BIRD, safety: FoodSafetyLevel.TOXIC, risks: ['Vomiting', 'Seizures', 'Death'] },
        ],
      },
      {
        canonical_name: 'Carrots',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'A healthy treat for many pets, rich in vitamins.',
        source_primary: 'AKC',
        source_name: 'American Kennel Club',
        species_safety: [
          { species: PetSpecies.DOG, safety: FoodSafetyLevel.SAFE, safe_amount: 'In moderation' },
          { species: PetSpecies.CAT, safety: FoodSafetyLevel.SAFE, safe_amount: 'Small amounts, cooked' },
          { species: PetSpecies.BIRD, safety: FoodSafetyLevel.SAFE, safe_amount: 'Small, shredded pieces' },
        ],
      },
    ];

    for (const foodData of foods) {
      const { species_safety, ...itemData } = foodData;
      const food = this.foodRepo.create({
        ...itemData,
        hash: this.createHash(foodData.canonical_name),
      });
      const savedFood = await this.foodRepo.save(food);

      if (species_safety) {
        for (const safetyData of species_safety) {
          const safety = this.foodSafetyRepo.create({
            ...safetyData,
            food: savedFood,
            citations: [],
          });
          await this.foodSafetyRepo.save(safety);
        }
      }
    }
  }

  async seedPlants() {
    const plants = [
      {
        canonical_name: 'Lily',
        toxicity_overall: PlantToxicityLevel.SEVERE,
        notes_markdown: 'Extremely toxic to cats, even in small amounts.',
        source_primary: 'FDA',
        source_name: 'U.S. Food and Drug Administration',
        species_toxicity: [
          { species: PetSpecies.CAT, toxicity: PlantToxicityLevel.SEVERE, clinical_signs: ['Vomiting', 'Lethargy', 'Kidney failure'] },
          { species: PetSpecies.DOG, toxicity: PlantToxicityLevel.MINOR, clinical_signs: ['Mild gastrointestinal upset'] },
        ],
      },
      {
        canonical_name: 'Spider Plant',
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Non-toxic to most pets and safe to have indoors.',
        source_primary: 'ASPCA',
        source_name: 'ASPCA Animal Poison Control',
        species_toxicity: [
          { species: PetSpecies.CAT, toxicity: PlantToxicityLevel.NON_TOXIC },
          { species: PetSpecies.DOG, toxicity: PlantToxicityLevel.NON_TOXIC },
          { species: PetSpecies.BIRD, toxicity: PlantToxicityLevel.NON_TOXIC },
        ],
      },
    ];

    for (const plantData of plants) {
      const { species_toxicity, ...itemData } = plantData;
      const plant = this.plantRepo.create({
        ...itemData,
        hash: this.createHash(plantData.canonical_name),
      });
      const savedPlant = await this.plantRepo.save(plant);

      if (species_toxicity) {
        for (const toxicityData of species_toxicity) {
          const toxicity = this.plantToxicityRepo.create({
            ...toxicityData,
            plant: savedPlant,
            citations: [],
          });
          await this.plantToxicityRepo.save(toxicity);
        }
      }
    }
  }

  async seedItems() {
    const items = [
      {
        canonical_name: 'Antifreeze',
        severity_overall: HazardSeverity.EMERGENCY,
        notes_markdown: 'Contains ethylene glycol, which is highly toxic and can be fatal.',
        source_primary: 'Pet Poison Helpline',
        source_name: 'Pet Poison Helpline',
        species_hazard: [
          { species: PetSpecies.DOG, severity: HazardSeverity.EMERGENCY, risks: ['Kidney failure', 'Death'] },
          { species: PetSpecies.CAT, severity: HazardSeverity.EMERGENCY, risks: ['Kidney failure', 'Death'] },
        ],
      },
    ];

    for (const itemData of items) {
      const { species_hazard, ...data } = itemData;
      const item = this.itemRepo.create({
        ...data,
        hash: this.createHash(itemData.canonical_name),
      });
      const savedItem = await this.itemRepo.save(item);

      if (species_hazard) {
        for (const hazardData of species_hazard) {
          const hazard = this.itemHazardRepo.create({
            ...hazardData,
            item: savedItem,
            citations: [],
          });
          await this.itemHazardRepo.save(hazard);
        }
      }
    }
  }
}
