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
    @InjectRepository(FoodSafetyBySpecies)
    private readonly foodSafetyRepo: Repository<FoodSafetyBySpecies>,
    @InjectRepository(Plant) private readonly plantRepo: Repository<Plant>,
    @InjectRepository(PlantToxicityBySpecies)
    private readonly plantToxicityRepo: Repository<PlantToxicityBySpecies>,
    @InjectRepository(HouseholdItem)
    private readonly itemRepo: Repository<HouseholdItem>,
    @InjectRepository(ItemHazardBySpecies)
    private readonly itemHazardRepo: Repository<ItemHazardBySpecies>
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
        category: 'Sweets',
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
        category: 'Fruits',
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
        category: 'Vegetables',
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
        category: 'Sweeteners',
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
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Hypoglycemia', 'Liver damage'],
            treatment_info: 'Immediate veterinary care required. Less common in cats but equally dangerous.',
          },
        ],
      },
      {
        canonical_name: 'Avocado',
        category: 'Fruits',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Persin'],
        notes_markdown: 'Contains persin, which can cause vomiting and diarrhea in dogs and cats. The pit is also a choking hazard.',
        source_primary: 'ASPCA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Diarrhea', 'Pancreatitis'],
            treatment_info: 'Monitor for symptoms. Seek veterinary care if vomiting or diarrhea persists.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Diarrhea', 'Heart damage'],
            treatment_info: 'Contact veterinarian if ingested. Supportive care may be needed.',
          },
        ],
      },
      {
        canonical_name: 'Macadamia Nuts',
        category: 'Nuts',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Unknown'],
        notes_markdown: 'Toxic to dogs, causing weakness, vomiting, and hyperthermia. The toxic principle is unknown.',
        source_primary: 'Pet Poison Helpline',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Weakness', 'Depression', 'Vomiting', 'Tremors', 'Hyperthermia'],
            treatment_info: 'Symptoms usually appear within 12 hours. Supportive care and monitoring recommended.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.AVOID,
            risks: ['Limited data available'],
            treatment_info: 'Avoid feeding to cats. Monitor if accidentally ingested.',
          },
        ],
      },
      {
        canonical_name: 'Alcohol',
        category: 'Beverages',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Ethanol'],
        notes_markdown: 'Even small amounts of alcohol can cause significant intoxication in pets, leading to serious health issues.',
        source_primary: 'ASPCA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Vomiting', 'Disorientation', 'Difficulty breathing', 'Coma', 'Death'],
            treatment_info: 'Emergency veterinary care immediately. Treatment includes supportive care and monitoring.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Severe intoxication', 'Respiratory failure', 'Death'],
            treatment_info: 'Life-threatening emergency. Immediate veterinary intervention required.',
          },
        ],
      },
      {
        canonical_name: 'Caffeine',
        category: 'Beverages',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Caffeine', 'Methylxanthines'],
        notes_markdown: 'Found in coffee, tea, energy drinks, and some medications. Can cause serious health issues in pets.',
        source_primary: 'Pet Poison Helpline',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Hyperactivity', 'Restlessness', 'Vomiting', 'Elevated heart rate', 'Seizures'],
            treatment_info: 'Seek immediate veterinary care. Treatment is similar to chocolate poisoning.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Tremors', 'Seizures', 'Cardiac arrhythmias'],
            treatment_info: 'Emergency care required. Activated charcoal and supportive treatment.',
          },
        ],
      },
      {
        canonical_name: 'Raw Yeast Dough',
        category: 'Baked Goods',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Ethanol', 'Carbon Dioxide'],
        notes_markdown: 'Yeast dough expands in the stomach, causing bloat. Fermentation also produces alcohol.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Bloat', 'Stomach torsion', 'Alcohol poisoning', 'Difficulty breathing'],
            treatment_info: 'Emergency situation. Immediate veterinary care required to prevent gastric dilatation.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Gastric distension', 'Ethanol toxicity'],
            treatment_info: 'Seek immediate veterinary attention. May require surgery in severe cases.',
          },
        ],
      },
      {
        canonical_name: 'Cooked Bones',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.AVOID,
        notes_markdown: 'Cooked bones can splinter and cause choking, intestinal blockage, or perforation.',
        source_primary: 'FDA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.AVOID,
            risks: ['Choking', 'Broken teeth', 'Intestinal blockage', 'Rectal bleeding'],
            treatment_info: 'Never give cooked bones. If ingested, monitor closely and contact vet if symptoms appear.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.AVOID,
            risks: ['Choking', 'Intestinal perforation', 'Constipation'],
            treatment_info: 'Avoid all cooked bones. Raw bones are safer but still risky for cats.',
          },
        ],
      },
      {
        canonical_name: 'Salt',
        category: 'Seasonings',
        safety_overall: FoodSafetyLevel.AVOID,
        toxic_compounds: ['Sodium'],
        notes_markdown: 'Excessive salt can lead to sodium ion poisoning, especially in large amounts.',
        source_primary: 'ASPCA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.AVOID,
            risks: ['Vomiting', 'Diarrhea', 'Tremors', 'Seizures', 'Death'],
            treatment_info: 'Seek veterinary care if large amounts consumed. Treatment includes IV fluids.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.AVOID,
            risks: ['Excessive thirst', 'Sodium ion poisoning', 'Kidney damage'],
            treatment_info: 'Contact vet immediately if consumed in large quantities.',
          },
        ],
      },
      {
        canonical_name: 'Nutmeg',
        category: 'Spices',
        safety_overall: FoodSafetyLevel.TOXIC,
        toxic_compounds: ['Myristicin'],
        notes_markdown: 'Contains myristicin, which can cause hallucinations, disorientation, and seizures in pets.',
        source_primary: 'Pet Poison Helpline',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Disorientation', 'Hallucinations', 'Increased heart rate', 'Seizures'],
            treatment_info: 'Veterinary care needed. Supportive treatment and monitoring.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.TOXIC,
            risks: ['Tremors', 'Seizures', 'Central nervous system depression'],
            treatment_info: 'Immediate veterinary attention required.',
          },
        ],
      },
      {
        canonical_name: 'Raw Eggs',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Raw eggs may contain Salmonella and avidin, which interferes with biotin absorption.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Salmonella', 'E. coli', 'Biotin deficiency with prolonged consumption'],
            treatment_info: 'Cooked eggs are safer. Monitor for digestive upset if raw eggs consumed.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Salmonella', 'Biotin deficiency'],
            treatment_info: 'Cooked eggs preferred. Watch for signs of food poisoning.',
          },
        ],
      },
      {
        canonical_name: 'Raw Meat',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Raw meat can contain bacteria like Salmonella and E. coli. Some advocate raw diets, but risks exist.',
        source_primary: 'FDA',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Salmonella', 'E. coli', 'Parasites'],
            treatment_info: 'If feeding raw, source from reputable suppliers. Monitor for illness.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Bacterial contamination', 'Parasites'],
            treatment_info: 'Cats are more adapted to raw meat but risks remain. Consult veterinarian.',
          },
        ],
      },
      // Caution Foods
      {
        canonical_name: 'Dairy Products',
        category: 'Dairy',
        safety_overall: FoodSafetyLevel.CAUTION,
        toxic_compounds: ['Lactose'],
        notes_markdown: 'Many adult pets are lactose intolerant and may experience digestive upset from dairy.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Diarrhea', 'Gas', 'Vomiting'],
            treatment_info: 'Small amounts of lactose-free dairy may be tolerated. Monitor for digestive issues.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Diarrhea', 'Stomach upset'],
            treatment_info: 'Most cats are lactose intolerant. Offer only small amounts if at all.',
          },
        ],
      },
      {
        canonical_name: 'Coconut',
        category: 'Fruits',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Coconut flesh and oil are generally safe in small amounts but high in fat.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Stomach upset', 'Diarrhea if consumed in large amounts'],
            preparation: 'Small amounts of coconut flesh or oil. Avoid coconut water with added sugars.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Digestive upset'],
            preparation: 'Very small amounts only. High fat content.',
          },
        ],
      },
      {
        canonical_name: 'Almonds',
        category: 'Nuts',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Not toxic but can be difficult to digest and pose choking hazards.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Choking', 'Intestinal blockage', 'Pancreatitis from high fat'],
            treatment_info: 'Avoid salted almonds. Monitor if consumed.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Choking', 'Digestive upset'],
            treatment_info: 'Not recommended. Cats have difficulty digesting nuts.',
          },
        ],
      },
      {
        canonical_name: 'Bread',
        category: 'Baked Goods',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Plain bread is not toxic but offers little nutritional value and can cause weight gain.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Weight gain', 'Bloating'],
            preparation: 'Only plain, baked bread. No raw dough. Avoid bread with raisins, garlic, or xylitol.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Weight gain', 'Limited nutritional value'],
            preparation: 'Not recommended as cats are obligate carnivores.',
          },
        ],
      },
      {
        canonical_name: 'Corn',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Corn kernels are safe but corn cobs are dangerous choking and blockage hazards.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Corn cob can cause intestinal blockage'],
            preparation: 'Remove kernels from cob. Never give corn cobs.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Limited digestibility'],
            preparation: 'Small amounts of kernels only. Not a natural food for cats.',
          },
        ],
      },
      {
        canonical_name: 'Peanut Butter',
        category: 'Spreads',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Safe in moderation but MUST be xylitol-free. Check ingredients carefully.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Xylitol poisoning if wrong brand', 'Choking', 'Obesity'],
            preparation: 'Only xylitol-free, unsalted peanut butter. Small amounts as treats.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Choking hazard', 'High fat content'],
            preparation: 'Not necessary for cats. Very small amounts if given.',
          },
        ],
      },
      // Safe Foods
      {
        canonical_name: 'Carrots',
        category: 'Vegetables',
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
        category: 'Fruits',
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
      {
        canonical_name: 'Blueberries',
        category: 'Fruits',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Rich in antioxidants, vitamins, and fiber. A healthy treat for pets.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Serve fresh or frozen. Great training treats.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Most cats ignore blueberries but they are safe if interested.',
          },
        ],
      },
      {
        canonical_name: 'Watermelon',
        category: 'Fruits',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Hydrating and nutritious. Remove seeds and rind before serving.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Remove seeds and rind. Serve flesh in small chunks.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Seedless flesh only. Most cats prefer meat.',
          },
        ],
      },
      {
        canonical_name: 'Pumpkin',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Excellent for digestive health. Use plain, cooked pumpkin or canned pure pumpkin.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Plain cooked or canned pumpkin. Not pumpkin pie filling. Great for diarrhea or constipation.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small amounts of plain pumpkin. Helps with hairballs and digestion.',
          },
        ],
      },
      {
        canonical_name: 'Sweet Potato',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Rich in vitamins and fiber. Must be cooked. Never feed raw.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cook thoroughly without seasonings. Cut into small pieces.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small amounts of cooked sweet potato. Not a primary food source.',
          },
        ],
      },
      {
        canonical_name: 'Green Beans',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Low-calorie, nutritious vegetable. Can be served raw, steamed, or canned (no salt).',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Fresh, frozen, or canned (no salt). Chop to prevent choking.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cooked and chopped. Small amounts only.',
          },
        ],
      },
      {
        canonical_name: 'Cooked Chicken',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Excellent protein source. Must be boneless, skinless, and cooked without seasonings.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Plain, cooked, boneless chicken. No seasoning, skin, or bones.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Plain, cooked chicken without bones. Great protein source.',
          },
        ],
      },
      {
        canonical_name: 'Salmon',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Rich in omega-3 fatty acids. Must be cooked. Never feed raw salmon.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cooked, boneless salmon. Raw salmon can contain parasites.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cooked salmon without bones. Excellent for coat health.',
          },
        ],
      },
      {
        canonical_name: 'Rice',
        category: 'Grains',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Plain white or brown rice is safe and easily digestible. Good for upset stomachs.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cooked plain rice. Often used in bland diets for digestive issues.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small amounts of plain cooked rice. Not a primary food for cats.',
          },
        ],
      },
      {
        canonical_name: 'Bananas',
        category: 'Fruits',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'High in potassium and vitamins. Safe in moderation but high in sugar.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small slices as treats. High in sugar, so moderation is key.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Very small amounts. Most cats are not interested.',
          },
        ],
      },
      {
        canonical_name: 'Strawberries',
        category: 'Fruits',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Rich in vitamins and antioxidants. Remove stems and leaves.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Fresh or frozen. Cut into small pieces. Remove green tops.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small pieces without stems. Most cats are indifferent.',
          },
        ],
      },
      {
        canonical_name: 'Peas',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Good source of vitamins and fiber. Can be fresh, frozen, or canned (no salt).',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Fresh, frozen, or canned (no salt added). Avoid canned with seasonings.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small amounts. Some commercial cat foods include peas.',
          },
        ],
      },
      {
        canonical_name: 'Cooked Eggs',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Excellent protein source when fully cooked. Avoid raw eggs.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Fully cooked without oil, butter, or seasonings.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cooked scrambled or boiled eggs. Good protein supplement.',
          },
        ],
      },
      {
        canonical_name: 'Cucumber',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Low-calorie, hydrating snack. Good for overweight pets.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cut into bite-sized pieces. Remove seeds if desired.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small pieces. Most cats are not interested.',
          },
        ],
      },
      {
        canonical_name: 'Broccoli',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Safe in small amounts but can cause gas. Contains isothiocyanates which can be irritating in large quantities.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Gas', 'Stomach upset if too much'],
            preparation: 'Small amounts of cooked broccoli. Less than 10% of diet.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Digestive upset'],
            preparation: 'Very small amounts if at all. Cook to improve digestibility.',
          },
        ],
      },
      {
        canonical_name: 'Spinach',
        category: 'Vegetables',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'Contains oxalic acid which can interfere with calcium absorption. Safe in small amounts.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Kidney issues in large amounts'],
            preparation: 'Small amounts of cooked spinach. Avoid for dogs with kidney disease.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Calcium absorption issues'],
            preparation: 'Very small amounts. Not recommended for cats with urinary issues.',
          },
        ],
      },
      {
        canonical_name: 'Cheese',
        category: 'Dairy',
        safety_overall: FoodSafetyLevel.CAUTION,
        notes_markdown: 'High in fat and many pets are lactose intolerant. Use sparingly.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Digestive upset', 'Obesity', 'Pancreatitis'],
            preparation: 'Small amounts of low-fat cheese. Use as high-value training treats.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.CAUTION,
            risks: ['Lactose intolerance', 'Obesity'],
            preparation: 'Very small amounts. Many cats are lactose intolerant.',
          },
        ],
      },
      {
        canonical_name: 'Turkey',
        category: 'Protein',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Lean protein source. Must be plain, cooked, and boneless.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Plain cooked turkey without skin, bones, or seasonings.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Plain cooked turkey. Excellent protein source.',
          },
        ],
      },
      {
        canonical_name: 'Oatmeal',
        category: 'Grains',
        safety_overall: FoodSafetyLevel.SAFE,
        notes_markdown: 'Good source of fiber. Must be cooked plain without added sugar or flavorings.',
        source_primary: 'AKC',
        species_safety: [
          {
            species: PetSpecies.DOG,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Cook with water, no milk, sugar, or flavorings. Cool before serving.',
          },
          {
            species: PetSpecies.CAT,
            safety: FoodSafetyLevel.SAFE,
            preparation: 'Small amounts only. Not a natural food for cats.',
          },
        ],
      },
    ];
  }

  private getPlantData() {
    return [
      // Severe/Fatal Toxic Plants
      {
        canonical_name: 'Lilies',
        scientific_name: 'Lilium and Hemerocallis species',
        common_aliases: ['True Lily', 'Easter Lily', 'Tiger Lily', 'Day Lily'],
        toxicity_overall: PlantToxicityLevel.SEVERE,
        toxic_compounds: ['Unknown'],
        notes_markdown: 'True lilies (Lilium and Hemerocallis species) are extremely toxic to cats. Ingesting even small amounts can cause severe kidney failure.',
        source_primary: 'ASPCA',
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
        scientific_name: 'Cycas revoluta',
        common_aliases: ['Cycad', 'Coontie Palm', 'Cardboard Palm'],
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
      {
        canonical_name: 'Azalea',
        scientific_name: 'Rhododendron spp.',
        common_aliases: ['Rhododendron'],
        toxicity_overall: PlantToxicityLevel.SEVERE,
        toxic_compounds: ['Grayanotoxins'],
        notes_markdown: 'All parts of the plant are toxic. Can cause cardiovascular collapse and death.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Drooling', 'Weakness', 'Cardiac failure'],
            treatment_info: 'Emergency veterinary care required. Can be fatal.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Weakness', 'Cardiac arrhythmias', 'Coma'],
            treatment_info: 'Life-threatening. Immediate veterinary intervention needed.',
          },
        ],
      },
      {
        canonical_name: 'Oleander',
        scientific_name: 'Nerium oleander',
        common_aliases: ['Rose Bay'],
        toxicity_overall: PlantToxicityLevel.FATAL,
        toxic_compounds: ['Cardiac glycosides', 'Oleandrin'],
        notes_markdown: 'Extremely toxic. All parts are poisonous. Can cause death with very small amounts.',
        source_primary: 'Pet Poison Helpline',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.FATAL,
            clinical_signs: ['Drooling', 'Vomiting', 'Diarrhea', 'Abnormal heart rate', 'Death'],
            treatment_info: 'Critical emergency. Immediate aggressive treatment required.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.FATAL,
            clinical_signs: ['Cardiac abnormalities', 'Hypothermia', 'Death'],
            treatment_info: 'Life-threatening emergency requiring immediate veterinary care.',
          },
        ],
      },
      {
        canonical_name: 'Castor Bean',
        scientific_name: 'Ricinus communis',
        common_aliases: ['Castor Oil Plant'],
        toxicity_overall: PlantToxicityLevel.FATAL,
        toxic_compounds: ['Ricin'],
        notes_markdown: 'Seeds contain ricin, one of the most toxic plant compounds. Can be fatal.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.FATAL,
            clinical_signs: ['Drooling', 'Vomiting', 'Diarrhea', 'Seizures', 'Organ failure'],
            treatment_info: 'Emergency situation. Even small amounts can be fatal.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.FATAL,
            clinical_signs: ['Severe vomiting', 'Abdominal pain', 'Kidney failure', 'Death'],
            treatment_info: 'Critical emergency requiring immediate veterinary attention.',
          },
        ],
      },
      {
        canonical_name: 'Foxglove',
        scientific_name: 'Digitalis purpurea',
        common_aliases: ['Digitalis'],
        toxicity_overall: PlantToxicityLevel.SEVERE,
        toxic_compounds: ['Cardiac glycosides', 'Digitoxin'],
        notes_markdown: 'All parts are toxic. Affects heart function and can be fatal.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Cardiac arrhythmias', 'Seizures'],
            treatment_info: 'Immediate veterinary care required. Monitor heart function.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Drooling', 'Heart abnormalities', 'Weakness', 'Collapse'],
            treatment_info: 'Emergency treatment needed. Can be fatal.',
          },
        ],
      },
      {
        canonical_name: 'Autumn Crocus',
        scientific_name: 'Colchicum autumnale',
        common_aliases: ['Meadow Saffron'],
        toxicity_overall: PlantToxicityLevel.SEVERE,
        toxic_compounds: ['Colchicine'],
        notes_markdown: 'Extremely toxic. Can cause organ damage and bone marrow suppression.',
        source_primary: 'Pet Poison Helpline',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Organ failure', 'Bone marrow suppression'],
            treatment_info: 'Life-threatening. Aggressive veterinary treatment required.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.SEVERE,
            clinical_signs: ['Severe gastrointestinal signs', 'Respiratory failure', 'Multi-organ failure'],
            treatment_info: 'Critical emergency. Prognosis is poor without immediate care.',
          },
        ],
      },
      {
        canonical_name: 'Yew',
        scientific_name: 'Taxus spp.',
        common_aliases: ['Japanese Yew', 'English Yew'],
        toxicity_overall: PlantToxicityLevel.FATAL,
        toxic_compounds: ['Taxine alkaloids'],
        notes_markdown: 'Extremely toxic. All parts except the berry flesh. Can cause sudden death.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.FATAL,
            clinical_signs: ['Trembling', 'Difficulty breathing', 'Cardiac failure', 'Sudden death'],
            treatment_info: 'Often fatal before symptoms appear. Emergency care if ingestion suspected.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.FATAL,
            clinical_signs: ['Tremors', 'Difficulty breathing', 'Sudden cardiac arrest'],
            treatment_info: 'Extremely dangerous. Often fatal. Immediate emergency care needed.',
          },
        ],
      },
      // Moderate Toxic Plants
      {
        canonical_name: 'Pothos',
        scientific_name: 'Epipremnum aureum',
        common_aliases: ["Devil's Ivy", 'Golden Pothos'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Calcium oxalate crystals'],
        notes_markdown: 'Common houseplant. Causes oral irritation from calcium oxalate crystals.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral irritation', 'Drooling', 'Vomiting', 'Difficulty swallowing'],
            treatment_info: 'Rinse mouth. Monitor for swelling. Contact vet if symptoms persist.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral pain', 'Drooling', 'Pawing at mouth', 'Vomiting'],
            treatment_info: 'Rinse mouth with water. Seek veterinary care if symptoms worsen.',
          },
        ],
      },
      {
        canonical_name: 'Philodendron',
        scientific_name: 'Philodendron spp.',
        common_aliases: ['Heartleaf Philodendron'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Calcium oxalate crystals'],
        notes_markdown: 'Popular houseplant. Causes oral and digestive irritation.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral irritation', 'Drooling', 'Vomiting', 'Difficulty swallowing'],
            treatment_info: 'Rinse mouth thoroughly. Contact vet if severe symptoms develop.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Mouth pain', 'Excessive drooling', 'Vomiting'],
            treatment_info: 'Provide water to rinse mouth. Veterinary care if symptoms persist.',
          },
        ],
      },
      {
        canonical_name: 'Peace Lily',
        scientific_name: 'Spathiphyllum spp.',
        common_aliases: ['Spathe Flower'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Calcium oxalate crystals'],
        notes_markdown: 'Common houseplant. Causes oral and GI irritation but rarely severe.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral irritation', 'Drooling', 'Vomiting', 'Loss of appetite'],
            treatment_info: 'Usually self-limiting. Contact vet if symptoms are severe.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral pain', 'Drooling', 'Difficulty swallowing'],
            treatment_info: 'Rinse mouth. Most cats recover without treatment.',
          },
        ],
      },
      {
        canonical_name: 'Dieffenbachia',
        scientific_name: 'Dieffenbachia spp.',
        common_aliases: ['Dumb Cane'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Calcium oxalate crystals', 'Proteolytic enzymes'],
        notes_markdown: 'Can cause severe oral irritation and swelling. Keep away from pets.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Severe oral pain', 'Drooling', 'Swelling of mouth', 'Vomiting'],
            treatment_info: 'Rinse mouth immediately. Seek veterinary care for severe swelling.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Intense oral irritation', 'Drooling', 'Difficulty swallowing'],
            treatment_info: 'Emergency care if swelling obstructs breathing.',
          },
        ],
      },
      {
        canonical_name: 'Aloe Vera',
        scientific_name: 'Aloe barbadensis',
        common_aliases: ['Medicinal Aloe'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Saponins', 'Anthraquinones'],
        notes_markdown: 'While the gel has medicinal uses for humans, the latex can be toxic to pets.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Lethargy', 'Tremors'],
            treatment_info: 'Contact vet if symptoms develop. Provide supportive care.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Loss of appetite', 'Color change in urine'],
            treatment_info: 'Veterinary care recommended if ingested in quantity.',
          },
        ],
      },
      {
        canonical_name: 'English Ivy',
        scientific_name: 'Hedera helix',
        common_aliases: ['Common Ivy'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Triterpenoid saponins'],
        notes_markdown: 'Can cause digestive upset and skin irritation.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Drooling', 'Abdominal pain'],
            treatment_info: 'Usually mild. Contact vet if symptoms are severe or persistent.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Excessive drooling'],
            treatment_info: 'Monitor symptoms. Seek veterinary care if symptoms worsen.',
          },
        ],
      },
      {
        canonical_name: 'Daffodils',
        scientific_name: 'Narcissus spp.',
        common_aliases: ['Narcissus', 'Jonquil'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Lycorine', 'Alkaloids'],
        notes_markdown: 'Bulbs are most toxic. Can cause serious digestive and cardiac issues.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Abdominal pain', 'Cardiac arrhythmias'],
            treatment_info: 'Bulb ingestion is serious. Seek immediate veterinary care.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Drooling', 'Diarrhea', 'Low blood pressure'],
            treatment_info: 'Contact vet immediately, especially if bulb ingested.',
          },
        ],
      },
      {
        canonical_name: 'Tulips',
        scientific_name: 'Tulipa spp.',
        common_aliases: [],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Tulipalin A and B'],
        notes_markdown: 'Bulbs contain highest concentration of toxins. Can cause serious GI upset.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Drooling', 'Depression'],
            treatment_info: 'More serious if bulb eaten. Contact veterinarian.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Drooling', 'Vomiting', 'Diarrhea'],
            treatment_info: 'Veterinary care recommended, especially for bulb ingestion.',
          },
        ],
      },
      {
        canonical_name: 'Monstera',
        scientific_name: 'Monstera deliciosa',
        common_aliases: ['Swiss Cheese Plant', 'Split Leaf Philodendron'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Calcium oxalate crystals'],
        notes_markdown: 'Popular houseplant. Causes oral irritation similar to other aroids.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral irritation', 'Drooling', 'Vomiting', 'Difficulty swallowing'],
            treatment_info: 'Rinse mouth. Most symptoms resolve on their own.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Oral pain', 'Excessive drooling', 'Pawing at face'],
            treatment_info: 'Provide water. Contact vet if symptoms are severe.',
          },
        ],
      },
      {
        canonical_name: 'Hyacinth',
        scientific_name: 'Hyacinthus orientalis',
        common_aliases: [],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Alkaloids'],
        notes_markdown: 'Bulbs are most toxic. Can cause intense GI upset.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Drooling', 'Tremors'],
            treatment_info: 'Seek veterinary care, especially if bulb ingested.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Severe vomiting', 'Diarrhea', 'Depression'],
            treatment_info: 'Contact veterinarian. Supportive care may be needed.',
          },
        ],
      },
      // Minor Toxic Plants
      {
        canonical_name: 'Jade Plant',
        scientific_name: 'Crassula ovata',
        common_aliases: ['Money Plant', 'Lucky Plant'],
        toxicity_overall: PlantToxicityLevel.MINOR,
        toxic_compounds: ['Unknown'],
        notes_markdown: 'Can cause mild digestive upset. Generally not serious.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Vomiting', 'Depression', 'Incoordination'],
            treatment_info: 'Usually mild. Monitor and contact vet if symptoms persist.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Vomiting', 'Lethargy'],
            treatment_info: 'Typically self-limiting. Provide supportive care.',
          },
        ],
      },
      {
        canonical_name: 'Christmas Cactus',
        scientific_name: 'Schlumbergera bridgessii',
        common_aliases: ['Thanksgiving Cactus'],
        toxicity_overall: PlantToxicityLevel.MINOR,
        toxic_compounds: [],
        notes_markdown: 'Generally considered safe. May cause mild stomach upset in some pets.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Mild vomiting', 'Diarrhea'],
            treatment_info: 'Rarely problematic. Monitor if ingested.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Mild digestive upset'],
            treatment_info: 'Generally safe. Symptoms usually mild.',
          },
        ],
      },
      {
        canonical_name: 'Begonia',
        scientific_name: 'Begonia spp.',
        common_aliases: [],
        toxicity_overall: PlantToxicityLevel.MINOR,
        toxic_compounds: ['Calcium oxalate crystals'],
        notes_markdown: 'Can cause oral irritation. Most toxic parts are underground.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Oral irritation', 'Drooling', 'Vomiting'],
            treatment_info: 'Usually mild. Rinse mouth and monitor.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MINOR,
            clinical_signs: ['Oral irritation', 'Vomiting'],
            treatment_info: 'Typically not serious. Contact vet if symptoms persist.',
          },
        ],
      },
      {
        canonical_name: 'Amaryllis',
        scientific_name: 'Amaryllis spp.',
        common_aliases: ['Belladonna Lily'],
        toxicity_overall: PlantToxicityLevel.MODERATE,
        toxic_compounds: ['Lycorine', 'Phenanthridine alkaloids'],
        notes_markdown: 'Bulbs are most toxic. Can cause significant GI distress.',
        source_primary: 'ASPCA',
        species_toxicity: [
          {
            species: PetSpecies.DOG,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Diarrhea', 'Drooling', 'Abdominal pain', 'Tremors'],
            treatment_info: 'Contact veterinarian. More serious if bulb consumed.',
          },
          {
            species: PetSpecies.CAT,
            toxicity: PlantToxicityLevel.MODERATE,
            clinical_signs: ['Vomiting', 'Depression', 'Diarrhea', 'Tremors'],
            treatment_info: 'Seek veterinary care. Can cause low blood pressure.',
          },
        ],
      },
      // Non-Toxic/Safe Plants
      {
        canonical_name: 'Spider Plant',
        scientific_name: 'Chlorophytum comosum',
        common_aliases: ['Airplane Plant', 'Ribbon Plant'],
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
      {
        canonical_name: 'Boston Fern',
        scientific_name: 'Nephrolepis exaltata',
        common_aliases: ['Sword Fern'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Safe for pets. Popular indoor plant with no toxic effects.',
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
      {
        canonical_name: 'Areca Palm',
        scientific_name: 'Dypsis lutescens',
        common_aliases: ['Butterfly Palm', 'Golden Cane Palm'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Safe palm variety for pet owners. Good air purifying plant.',
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
      {
        canonical_name: 'Bamboo Palm',
        scientific_name: 'Chamaedorea seifrizii',
        common_aliases: ['Reed Palm'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Pet-safe palm. Good choice for homes with cats and dogs.',
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
      {
        canonical_name: 'Prayer Plant',
        scientific_name: 'Maranta leuconeura',
        common_aliases: ['Maranta'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Safe for pets. Attractive foliage plant with no toxic effects.',
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
      {
        canonical_name: 'African Violet',
        scientific_name: 'Saintpaulia spp.',
        common_aliases: [],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Non-toxic flowering plant safe for homes with pets.',
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
      {
        canonical_name: 'Orchids',
        scientific_name: 'Phalaenopsis spp.',
        common_aliases: ['Moth Orchid'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Most orchid varieties are safe for pets. Beautiful and non-toxic.',
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
      {
        canonical_name: 'Calathea',
        scientific_name: 'Calathea spp.',
        common_aliases: ['Peacock Plant', 'Rattlesnake Plant'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Safe for pets. Striking foliage patterns without toxicity concerns.',
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
      {
        canonical_name: 'Peperomia',
        scientific_name: 'Peperomia spp.',
        common_aliases: ['Radiator Plant'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Pet-friendly houseplant. Many varieties available, all safe.',
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
      {
        canonical_name: 'Parlor Palm',
        scientific_name: 'Chamaedorea elegans',
        common_aliases: ['Neanthe Bella Palm'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Safe palm for indoor use. Non-toxic to pets.',
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
      {
        canonical_name: 'Ponytail Palm',
        scientific_name: 'Beaucarnea recurvata',
        common_aliases: ["Elephant's Foot"],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Despite the name, not a true palm. Safe for pets.',
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
      {
        canonical_name: 'Swedish Ivy',
        scientific_name: 'Plectranthus verticillatus',
        common_aliases: [],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Not a true ivy. Safe trailing plant for pet-friendly homes.',
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
      {
        canonical_name: 'Haworthia',
        scientific_name: 'Haworthia spp.',
        common_aliases: ['Zebra Cactus', 'Pearl Plant'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Pet-safe succulent. Good alternative to toxic aloe vera.',
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
      {
        canonical_name: 'Polka Dot Plant',
        scientific_name: 'Hypoestes phyllostachya',
        common_aliases: ['Freckle Face'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Colorful, pet-safe plant. No toxicity concerns.',
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
      {
        canonical_name: 'Wax Plant',
        scientific_name: 'Hoya carnosa',
        common_aliases: ['Hoya', 'Porcelain Flower'],
        toxicity_overall: PlantToxicityLevel.NON_TOXIC,
        notes_markdown: 'Safe for pets. Beautiful flowering houseplant.',
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
    ];
  }

  private getItemData() {
    return [
      // Emergency Items
      {
        canonical_name: 'Antifreeze',
        category: 'Automotive',
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
        category: 'Pesticides',
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
      {
        canonical_name: 'Insecticides & Pesticides',
        category: 'Pesticides',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Organophosphates', 'Carbamates', 'Pyrethrins'],
        notes_markdown: 'Many insecticides are highly toxic to pets. Even products meant for pets can be dangerous if misused.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Tremors', 'Seizures', 'Drooling', 'Difficulty breathing', 'Death'],
            treatment_info: 'Emergency veterinary care required. Bring product packaging if possible.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Severe tremors', 'Seizures', 'Respiratory failure', 'Death'],
            treatment_info: 'Cats are extremely sensitive. Immediate emergency care essential.',
          },
        ],
      },
      {
        canonical_name: 'Bleach',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Sodium Hypochlorite'],
        notes_markdown: 'Household bleach can cause severe irritation and chemical burns. Even diluted bleach is dangerous.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Oral burns', 'Vomiting', 'Drooling', 'Difficulty breathing'],
            treatment_info: 'Do not induce vomiting. Rinse mouth and seek immediate veterinary care.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Chemical burns', 'Respiratory distress', 'Esophageal damage'],
            treatment_info: 'Emergency situation. Never induce vomiting with caustic substances.',
          },
        ],
      },
      {
        canonical_name: 'Ammonia-Based Cleaners',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Ammonia'],
        notes_markdown: 'Strong fumes and direct contact can cause severe respiratory and tissue damage.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Respiratory irritation', 'Oral burns', 'Vomiting', 'Pneumonia'],
            treatment_info: 'Move to fresh air. Seek veterinary care immediately if ingested.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe respiratory distress', 'Chemical burns', 'Eye damage'],
            treatment_info: 'Emergency care needed. Rinse affected areas with water.',
          },
        ],
      },
      {
        canonical_name: 'Batteries',
        category: 'Electronics',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Lithium', 'Lead', 'Alkaline chemicals'],
        notes_markdown: 'Batteries can cause chemical burns, heavy metal poisoning, and intestinal blockage. Lithium batteries are especially dangerous.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Chemical burns', 'Intestinal obstruction', 'Heavy metal poisoning', 'Tissue necrosis'],
            treatment_info: 'Emergency situation. X-rays needed to locate battery. Surgery may be required.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Severe burns', 'Blockage', 'Perforation', 'Toxicity'],
            treatment_info: 'Critical emergency. Immediate veterinary intervention required.',
          },
        ],
      },
      {
        canonical_name: 'Liquid Potpourri',
        category: 'Home Fragrances',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Essential oils', 'Cationic detergents'],
        notes_markdown: 'Extremely dangerous to cats. Can cause severe chemical burns and organ damage.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Oral burns', 'Vomiting', 'Drooling', 'Difficulty breathing'],
            treatment_info: 'Seek immediate veterinary care. Can cause severe tissue damage.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Severe chemical burns', 'Respiratory distress', 'Liver damage', 'Death'],
            treatment_info: 'Life-threatening emergency for cats. Immediate aggressive treatment needed.',
          },
        ],
      },
      {
        canonical_name: 'Mothballs',
        category: 'Pest Control',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Naphthalene', 'Paradichlorobenzene'],
        notes_markdown: 'Highly toxic. Can cause severe anemia and organ damage.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Vomiting', 'Tremors', 'Seizures', 'Anemia', 'Liver damage'],
            treatment_info: 'Emergency care required. Can be fatal if not treated promptly.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Severe anemia', 'Liver failure', 'Neurological symptoms', 'Death'],
            treatment_info: 'Cats are highly susceptible. Immediate veterinary intervention essential.',
          },
        ],
      },
      // Danger Items
      {
        canonical_name: 'Human Pain Medications (NSAIDs)',
        category: 'Medications',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Ibuprofen', 'Naproxen', 'Aspirin'],
        notes_markdown: 'Common over-the-counter pain relievers can cause severe organ damage in pets.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Stomach ulcers', 'Kidney failure', 'Liver damage', 'Vomiting blood'],
            treatment_info: 'Immediate veterinary care needed. Treatment includes decontamination and supportive care.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Acute kidney failure', 'Anemia', 'Liver toxicity', 'Death'],
            treatment_info: 'Cats are extremely sensitive. Emergency treatment required.',
          },
        ],
      },
      {
        canonical_name: 'Acetaminophen (Tylenol)',
        category: 'Medications',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Acetaminophen'],
        notes_markdown: 'Extremely toxic to cats. Even one regular strength tablet can be fatal.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Liver damage', 'Kidney damage', 'Facial swelling', 'Difficulty breathing'],
            treatment_info: 'Immediate veterinary care required. Antidote available if given quickly.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Severe anemia', 'Liver failure', 'Difficulty breathing', 'Death'],
            treatment_info: 'Life-threatening emergency. Even tiny amounts can be fatal to cats.',
          },
        ],
      },
      {
        canonical_name: 'Antidepressants',
        category: 'Medications',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['SSRIs', 'SNRIs', 'Tricyclic antidepressants'],
        notes_markdown: 'Can cause serious neurological and cardiovascular effects in pets.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Sedation', 'Agitation', 'Elevated heart rate', 'Tremors', 'Seizures'],
            treatment_info: 'Emergency veterinary care needed. Monitor cardiovascular function.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe agitation', 'Tremors', 'Seizures', 'Elevated heart rate'],
            treatment_info: 'Immediate veterinary attention required. Can be life-threatening.',
          },
        ],
      },
      {
        canonical_name: 'Essential Oils',
        category: 'Home Fragrances',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Various terpenes', 'Phenols'],
        notes_markdown: 'Many essential oils are toxic to pets, especially cats who cannot metabolize them properly.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Drooling', 'Vomiting', 'Weakness', 'Difficulty breathing'],
            treatment_info: 'Depends on oil and amount. Contact vet if symptoms develop.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Liver toxicity', 'Difficulty breathing', 'Tremors', 'Drooling', 'Weakness'],
            treatment_info: 'Cats lack enzymes to metabolize essential oils. Seek veterinary care.',
          },
        ],
      },
      {
        canonical_name: 'Fertilizers',
        category: 'Garden Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Nitrogen', 'Phosphorus', 'Potassium', 'Iron', 'Herbicides'],
        notes_markdown: 'Fertilizers can cause GI upset and more serious issues depending on ingredients.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Vomiting', 'Diarrhea', 'Intestinal blockage', 'Heavy metal poisoning'],
            treatment_info: 'Severity depends on type. Contact vet with product information.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['GI upset', 'Drooling', 'Potential organ damage'],
            treatment_info: 'Seek veterinary care. Bring product packaging.',
          },
        ],
      },
      {
        canonical_name: 'Paint & Paint Thinner',
        category: 'Home Improvement',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Solvents', 'Heavy metals', 'VOCs'],
        notes_markdown: 'Paint and solvents can cause respiratory issues, chemical burns, and organ damage.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Respiratory distress', 'Chemical burns', 'Neurological symptoms', 'Organ damage'],
            treatment_info: 'Move to fresh air. Seek immediate veterinary care if ingested.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe respiratory issues', 'Aspiration pneumonia', 'Organ toxicity'],
            treatment_info: 'Emergency care needed. Never induce vomiting with petroleum products.',
          },
        ],
      },
      {
        canonical_name: 'Windshield Washer Fluid',
        category: 'Automotive',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Methanol', 'Ethylene glycol'],
        notes_markdown: 'Similar toxicity to antifreeze. Can be fatal in small amounts.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Intoxication', 'Vomiting', 'Kidney failure', 'Blindness', 'Death'],
            treatment_info: 'Life-threatening emergency. Immediate veterinary intervention critical.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Acute kidney failure', 'Neurological damage', 'Death'],
            treatment_info: 'Critical emergency. Prognosis poor without immediate treatment.',
          },
        ],
      },
      {
        canonical_name: 'Gorilla Glue (Expanding Adhesives)',
        category: 'Adhesives',
        severity_overall: HazardSeverity.EMERGENCY,
        toxic_compounds: ['Diisocyanates'],
        notes_markdown: 'Expands in the stomach creating a large foreign body obstruction. Requires surgery.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Gastric obstruction', 'Vomiting', 'Abdominal pain', 'Requires surgery'],
            treatment_info: 'Emergency situation. Surgery usually required to remove mass.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.EMERGENCY,
            risks: ['Severe obstruction', 'Tissue damage', 'Perforation risk'],
            treatment_info: 'Immediate veterinary intervention. Surgical removal typically necessary.',
          },
        ],
      },
      // Caution Items
      {
        canonical_name: 'Silica Gel Packets',
        category: 'Packaging',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: [],
        notes_markdown: 'Generally non-toxic. Main concern is choking or mild GI upset.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Mild vomiting', 'Diarrhea', 'Choking hazard'],
            treatment_info: 'Usually not a problem. Monitor for obstruction if large amount consumed.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['Mild GI upset', 'Choking risk'],
            treatment_info: 'Generally safe. Contact vet if symptoms develop.',
          },
        ],
      },
      {
        canonical_name: 'Laundry Detergent Pods',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Concentrated surfactants', 'Enzymes'],
        notes_markdown: 'Highly concentrated. Can cause severe chemical burns and respiratory issues.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Chemical burns', 'Vomiting', 'Respiratory distress', 'Lethargy'],
            treatment_info: 'Do not induce vomiting. Rinse mouth and seek immediate veterinary care.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe oral burns', 'Respiratory issues', 'Esophageal damage'],
            treatment_info: 'Emergency situation. Never induce vomiting.',
          },
        ],
      },
      {
        canonical_name: 'Hand Soap & Dish Soap',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: ['Surfactants'],
        notes_markdown: 'Usually causes mild GI upset. Rarely serious unless large amounts consumed.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Vomiting', 'Diarrhea', 'Drooling'],
            treatment_info: 'Usually mild. Monitor and contact vet if symptoms are severe.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['Mild vomiting', 'Diarrhea'],
            treatment_info: 'Typically self-limiting. Seek care if symptoms persist.',
          },
        ],
      },
      {
        canonical_name: 'Toothpaste (with Xylitol)',
        category: 'Personal Care',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Xylitol'],
        notes_markdown: 'Many toothpastes contain xylitol which is extremely toxic to dogs.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Hypoglycemia', 'Seizures', 'Liver failure', 'Death'],
            treatment_info: 'Emergency if contains xylitol. Immediate veterinary care required.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['Mild GI upset', 'Potential xylitol toxicity'],
            treatment_info: 'Check ingredients for xylitol. Contact vet if present.',
          },
        ],
      },
      {
        canonical_name: 'Glow Sticks',
        category: 'Toys',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: ['Dibutyl phthalate'],
        notes_markdown: 'Causes oral irritation and excessive drooling but rarely serious.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Excessive drooling', 'Mouth irritation', 'Agitation'],
            treatment_info: 'Rinse mouth with water or milk. Usually resolves without treatment.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['Intense drooling', 'Pawing at mouth', 'Agitation'],
            treatment_info: 'Offer water or milk. Symptoms typically resolve quickly.',
          },
        ],
      },
      {
        canonical_name: 'Cigarettes & Tobacco',
        category: 'Tobacco Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Nicotine'],
        notes_markdown: 'Nicotine is highly toxic. Cigarette butts and chewing tobacco are especially dangerous.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Vomiting', 'Diarrhea', 'Tremors', 'Seizures', 'Elevated heart rate', 'Death'],
            treatment_info: 'Emergency care needed. Can be rapidly fatal.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe tremors', 'Seizures', 'Cardiac abnormalities', 'Death'],
            treatment_info: 'Life-threatening. Immediate veterinary intervention required.',
          },
        ],
      },
      {
        canonical_name: 'Marijuana & Cannabis Products',
        category: 'Drugs',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['THC', 'CBD'],
        notes_markdown: 'Edibles are especially dangerous due to high THC content and potential presence of chocolate or xylitol.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Lethargy', 'Incoordination', 'Urinary incontinence', 'Vomiting', 'Seizures'],
            treatment_info: 'Seek veterinary care. Be honest with vet about exposure for proper treatment.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe depression', 'Incoordination', 'Drooling', 'Seizures'],
            treatment_info: 'Veterinary care needed. Treatment is supportive.',
          },
        ],
      },
      {
        canonical_name: 'Alcohol-Based Hand Sanitizer',
        category: 'Personal Care',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Ethanol', 'Isopropanol'],
        notes_markdown: 'High alcohol content can cause rapid intoxication in pets.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Intoxication', 'Vomiting', 'Disorientation', 'Low blood sugar', 'Seizures'],
            treatment_info: 'Seek veterinary care. Monitor blood sugar and provide supportive treatment.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe intoxication', 'Respiratory depression', 'Coma'],
            treatment_info: 'Emergency care required. Cats are very sensitive to alcohol.',
          },
        ],
      },
      {
        canonical_name: 'Ice Melt & De-icers',
        category: 'Outdoor Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Calcium chloride', 'Sodium chloride', 'Potassium chloride'],
        notes_markdown: 'Can cause paw pad irritation and toxicity if ingested from licking paws.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Paw irritation', 'Vomiting', 'Diarrhea', 'Electrolyte imbalances', 'Seizures'],
            treatment_info: 'Rinse paws after walks. Seek vet care if ingested.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Paw burns', 'Oral irritation', 'Electrolyte abnormalities'],
            treatment_info: 'Wash paws thoroughly. Contact vet if symptoms develop.',
          },
        ],
      },
      {
        canonical_name: 'Zinc Oxide (Diaper Cream)',
        category: 'Personal Care',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: ['Zinc'],
        notes_markdown: 'Small amounts usually not a problem but large ingestions can cause zinc toxicity.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Vomiting', 'Diarrhea', 'Anemia (large amounts)'],
            treatment_info: 'Usually mild. Contact vet if large amount consumed.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['GI upset', 'Potential anemia'],
            treatment_info: 'Monitor symptoms. Seek care if significant amount ingested.',
          },
        ],
      },
      {
        canonical_name: 'Pennies (Post-1982)',
        category: 'Household Objects',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Zinc'],
        notes_markdown: 'Pennies minted after 1982 contain high levels of zinc. Stomach acid causes zinc release.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Zinc toxicity', 'Anemia', 'Kidney failure', 'Liver damage'],
            treatment_info: 'X-rays to confirm. Endoscopic or surgical removal required.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe anemia', 'Organ damage', 'Death'],
            treatment_info: 'Emergency removal needed. Can be fatal if not treated.',
          },
        ],
      },
      {
        canonical_name: 'Fabric Softener',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: ['Cationic detergents'],
        notes_markdown: 'Can cause oral irritation and GI upset. Concentrated products more dangerous.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Vomiting', 'Diarrhea', 'Drooling', 'Oral irritation'],
            treatment_info: 'Usually mild. Contact vet if concentrated product ingested.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['Oral irritation', 'GI upset'],
            treatment_info: 'Monitor symptoms. Seek care if severe or persistent.',
          },
        ],
      },
      {
        canonical_name: 'Matches',
        category: 'Household Objects',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: ['Potassium chlorate', 'Phosphorus'],
        notes_markdown: 'Can cause GI upset and potential red blood cell damage in large amounts.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Vomiting', 'Diarrhea', 'Difficulty breathing (large amounts)'],
            treatment_info: 'Usually not serious unless many consumed. Monitor and contact vet if needed.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['GI upset', 'Respiratory issues (large amounts)'],
            treatment_info: 'Typically mild. Seek care if symptoms are severe.',
          },
        ],
      },
      {
        canonical_name: 'Sunscreen',
        category: 'Personal Care',
        severity_overall: HazardSeverity.CAUTION,
        toxic_compounds: ['Zinc oxide', 'Salicylates'],
        notes_markdown: 'Some ingredients can be harmful. Use pet-specific products if applying to pets.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.CAUTION,
            risks: ['Vomiting', 'Diarrhea', 'Drooling'],
            treatment_info: 'Usually mild. Contact vet if symptoms develop or large amount consumed.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.CAUTION,
            risks: ['GI upset', 'Potential zinc toxicity'],
            treatment_info: 'Monitor for symptoms. Use pet-safe products only.',
          },
        ],
      },
      {
        canonical_name: 'Vitamin D Supplements',
        category: 'Medications',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Cholecalciferol'],
        notes_markdown: 'Can cause severe kidney failure. Even small amounts of high-dose supplements are dangerous.',
        source_primary: 'Pet Poison Helpline',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Kidney failure', 'Excessive thirst', 'Vomiting', 'Loss of appetite'],
            treatment_info: 'Emergency care needed. Symptoms may be delayed. Aggressive treatment required.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Acute kidney failure', 'Calcification of tissues', 'Death'],
            treatment_info: 'Life-threatening. Immediate veterinary intervention essential.',
          },
        ],
      },
      {
        canonical_name: 'Compost',
        category: 'Garden Products',
        severity_overall: HazardSeverity.DANGER,
        toxic_compounds: ['Mycotoxins', 'Various toxins'],
        notes_markdown: 'Moldy compost can contain tremorgenic mycotoxins causing severe neurological issues.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.DANGER,
            risks: ['Tremors', 'Seizures', 'Hyperthermia', 'Agitation'],
            treatment_info: 'Emergency care required. Can be life-threatening.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.DANGER,
            risks: ['Severe tremors', 'Seizures', 'Elevated body temperature'],
            treatment_info: 'Immediate veterinary intervention needed.',
          },
        ],
      },
      // Info Items (Pet-Safe Alternatives)
      {
        canonical_name: 'Baking Soda',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.INFO,
        notes_markdown: 'Generally safe for cleaning. Non-toxic alternative to harsh chemicals. Large ingestions can cause electrolyte issues.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.INFO,
            risks: ['Electrolyte imbalances (very large amounts only)'],
            treatment_info: 'Safe cleaning alternative. Only problematic in huge quantities.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.INFO,
            risks: ['Minimal risk'],
            treatment_info: 'Pet-safe cleaning option.',
          },
        ],
      },
      {
        canonical_name: 'White Vinegar',
        category: 'Cleaning Products',
        severity_overall: HazardSeverity.INFO,
        notes_markdown: 'Safe, non-toxic cleaning alternative. May cause mild irritation if consumed in large amounts.',
        source_primary: 'ASPCA',
        species_hazard: [
          {
            species: PetSpecies.DOG,
            severity: HazardSeverity.INFO,
            risks: ['Mild GI upset (large amounts only)'],
            treatment_info: 'Safe for cleaning. Dilute for use around pets.',
          },
          {
            species: PetSpecies.CAT,
            severity: HazardSeverity.INFO,
            risks: ['Minimal'],
            treatment_info: 'Pet-friendly cleaning option.',
          },
        ],
      },
    ];
  }
}
