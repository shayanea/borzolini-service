import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem, FoodSafetyLevel } from './entities/food-item.entity';
import { Plant, PlantToxicityLevel } from './entities/plant.entity';
import {
  HouseholdItem,
  HazardSeverity,
} from './entities/household-item.entity';
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
    @InjectRepository(FoodSafetyBySpecies)
    private readonly foodSafetyRepo: Repository<FoodSafetyBySpecies>,
    @InjectRepository(Plant) private readonly plantRepo: Repository<Plant>,
    @InjectRepository(PlantToxicityBySpecies)
    private readonly plantToxicityRepo: Repository<PlantToxicityBySpecies>,
    @InjectRepository(HouseholdItem)
    private readonly itemRepo: Repository<HouseholdItem>,
    @InjectRepository(ItemHazardBySpecies)
    private readonly itemHazardRepo: Repository<ItemHazardBySpecies>,
  ) {}

  private createHash(data: string): Buffer {
    return crypto.createHash('sha256').update(data).digest();
  }

  async seed() {
    this.logger.log('🌱 Starting household safety seeding...');
    await this.clear();

    const foodData = this.getFoodData();
    for (const { species_safety, ...food } of foodData) {
      const hash = this.createHash(JSON.stringify(food));
      const existing = await this.foodRepo.findOne({ where: { hash } });
      if (existing) continue;

      const savedFood = await this.foodRepo.save(this.foodRepo.create(food));

      if (species_safety) {
        for (const safetyData of species_safety) {
          const safety = this.foodSafetyRepo.create({
            ...safetyData,
            food: savedFood,
          });
          await this.foodSafetyRepo.save(safety);
        }
      }
    }

    const plantData = this.getPlantData();
    for (const { species_toxicity, ...plant } of plantData) {
      const hash = this.createHash(JSON.stringify(plant));
      const existing = await this.plantRepo.findOne({ where: { hash } });
      if (existing) continue;

      const savedPlant = await this.plantRepo.save(this.plantRepo.create(plant));

      if (species_toxicity) {
        for (const toxicityData of species_toxicity) {
          const toxicity = this.plantToxicityRepo.create({
            ...toxicityData,
            plant: savedPlant,
          });
          await this.plantToxicityRepo.save(toxicity);
        }
      }
    }

    const itemData = this.getItemData();
    for (const { species_hazard, ...item } of itemData) {
      const hash = this.createHash(JSON.stringify(item));
      const existing = await this.itemRepo.findOne({ where: { hash } });
      if (existing) continue;

      const savedItem = await this.itemRepo.save(this.itemRepo.create(item));

      if (species_hazard) {
        for (const hazardData of species_hazard) {
          const hazard = this.itemHazardRepo.create({
            ...hazardData,
            item: savedItem,
          });
          await this.itemHazardRepo.save(hazard);
        }
      }
    }

    this.logger.log('✅ Household safety seeding completed.');
  }

  async clear() {
    this.logger.log('🧹 Clearing household safety data...');
    // Use raw SQL to bypass TypeORM's delete restrictions and handle constraints
    await this.itemHazardRepo.query('DELETE FROM "household_item_hazards_by_species"');
    await this.plantToxicityRepo.query('DELETE FROM "household_plant_toxicity_by_species"');
    await this.foodSafetyRepo.query('DELETE FROM "pet_food_safety_by_species"');
    
    await this.itemRepo.query('DELETE FROM "household_items"');
    await this.plantRepo.query('DELETE FROM "household_plants"');
    await this.foodRepo.query('DELETE FROM "pet_food_items"');
  }

  private getFoodData() {
    return [
      // Toxic Foods
      {
        canonical_name: 'Chocolate',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Theobromine', 'Caffeine'],
        notes_markdown: 'Contains theobromine and caffeine, which are toxic to most pets. Dark chocolate is the most dangerous.',
        source_primary: 'ASPCA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Diarrhea', 'Seizures', 'Heart abnormalities'],
            treatment_info: 'Induce vomiting and administer activated charcoal only if directed by a vet. Emergency veterinary care is crucial.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Seizures', 'Death'],
            treatment_info: 'Immediate veterinary intervention is required. Treatment may include induced vomiting, activated charcoal, and supportive care.',
          },
        ],
      },
      {
        canonical_name: 'Grapes & Raisins',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Unknown'],
        notes_markdown: 'Can cause acute kidney failure in dogs. The toxic substance is unknown. Cats are also suspected to be susceptible.',
        source_primary: 'Pet Poison Helpline',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Lethargy', 'Abdominal pain', 'Acute kidney failure'],
            treatment_info: 'Immediate veterinary attention is required, even if a small amount is ingested. Decontamination and supportive care are key.',
          },
           {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Lethargy', 'Kidney failure (suspected)'],
            treatment_info: 'Consult a veterinarian immediately. Proactive treatment is recommended.',
          },
        ],
      },
      {
        canonical_name: 'Onions, Garlic, Chives',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['N-propyl disulfide'],
        notes_markdown: 'These plants contain compounds that can damage red blood cells, leading to anemia. Cats are more sensitive than dogs.',
        source_primary: 'ASPCA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Lethargy', 'Weakness', 'Pale gums', 'Vomiting', 'Reddish urine'],
            treatment_info: 'Treatment includes decontamination, and in severe cases, blood transfusions and oxygen therapy.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Anemia', 'Lethargy', 'Pale gums', 'Increased heart rate'],
            treatment_info: 'Immediate veterinary care is critical. Cats are highly susceptible. Treatment is similar to dogs but may need to be more aggressive.',
          },
        ],
      },
      {
        canonical_name: 'Xylitol',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Xylitol'],
        notes_markdown: 'An artificial sweetener found in many sugar-free products. It causes a rapid release of insulin, leading to hypoglycemia (low blood sugar). Can also cause liver failure.',
        source_primary: 'FDA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Loss of coordination', 'Seizures', 'Liver failure'],
            treatment_info: 'This is a medical emergency. Treatment involves monitoring blood sugar, IV fluids with dextrose, and liver protectants.',
          },
        ],
      },
      // ... Add 35-45 more food items here
      // Safe Foods
      {
        canonical_name: 'Carrots',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'A healthy, low-calorie treat for many pets, rich in fiber and vitamins. Should be given in moderation.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Serve raw or cooked, but cut into bite-sized pieces to prevent choking.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Offer small amounts of cooked carrot. Most cats are not interested in carrots.',
          },
        ],
      },
      {
        canonical_name: 'Apples',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Apples are a good source of vitamins A and C, and fiber. The seeds and core should be removed.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Remove seeds and core. Cut into slices.',
            risks: ['Apple seeds contain small amounts of cyanide.'],
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Remove seeds and core. Offer small pieces.',
             risks: ['Apple seeds contain small amounts of cyanide.'],
          },
        ],
      },
      // ... Add more safe food items here
    ];
  }

  private getPlantData() {
    return [
      // Toxic Plants
      {
        canonical_name: 'Lilies',
        toxicity_overall: PlantToxicityLevel.SEVERE,
        toxic_compounds: ['Unknown'],
        notes_markdown: 'True lilies (Lilium and Hemerocallis species) are extremely toxic to cats. Ingesting even small amounts can cause severe kidney failure.',
        source_primary: 'FDA',
        species_toxicity: [
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Lethargy', 'Lack of appetite', 'Kidney failure'],
            treatment_info: 'This is a life-threatening emergency for cats. Immediate veterinary care is essential for survival.',
          },
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Mild gastrointestinal upset'],
            treatment_info: 'While not as dangerous for dogs, ingestion can still cause stomach upset.',
          },
        ],
      },
      {
        canonical_name: 'Sago Palm',
        toxicity_overall: PlantToxicityLevel.SEVERE,
        toxic_compounds: ['Cycasin'],
        notes_markdown: 'All parts of the Sago Palm are poisonous, but the seeds are the most toxic. Ingestion can cause severe liver failure and death.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Bloody stools', 'Jaundice', 'Liver failure', 'Death'],
            treatment_info: 'Immediate, aggressive veterinary treatment is required.',
          },
           {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Liver failure'],
            treatment_info: 'A medical emergency requiring immediate vet care.',
          },
        ],
      },
      // ... Add 35-45 more plant items here
      // Safe Plants
      {
        canonical_name: 'Spider Plant',
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Non-toxic to dogs and cats, making it a safe choice for a houseplant.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.NON_TOXIC,
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.NON_TOXIC,
          },
        ],
      },
      // ... Add more safe plants
    ];
  }

  private getItemData() {
    return [
      // Toxic Items
      {
        canonical_name: 'Antifreeze',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Ethylene Glycol'],
        notes_markdown: 'Contains ethylene glycol, which is highly toxic and can be fatal, even in small amounts. It has a sweet taste that can attract pets.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Kidney failure', 'Vomiting', 'Seizures', 'Death'],
            treatment_info: 'Immediate veterinary intervention is critical. An antidote may be available if administered quickly.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Acute kidney failure', 'Death'],
            treatment_info: 'A true emergency. The prognosis is poor without immediate and aggressive treatment.',
          },
        ],
      },
      {
        canonical_name: 'Rodenticides (Rat Poison)',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Anticoagulants', 'Bromethalin', 'Cholecalciferol'],
        notes_markdown: 'Different types of rat poison have different toxic effects, from internal bleeding to kidney failure and brain swelling.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Internal bleeding', 'Kidney failure', 'Seizures', 'Death'],
            treatment_info: 'The type of poison must be identified for proper treatment. Bring the packaging to the vet. Immediate care is required.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Internal bleeding', 'Neurological damage', 'Death'],
             treatment_info: 'Critical emergency. Treatment depends on the type of rodenticide ingested.',
          },
        ],
      },
       // ... Add 35-45 more household items here
    ];
  }
}
