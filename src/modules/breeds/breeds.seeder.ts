import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Breed, ExerciseNeeds, GroomingNeeds, PetSize, PetSpecies } from './entities/breed.entity';

interface BreedData {
  name: string;
  species: PetSpecies;
  size_category: PetSize;
  temperament: string;
  health_risks: string[];
  life_expectancy_min: number;
  life_expectancy_max: number;
  weight_min: number;
  weight_max: number;
  origin_country: string;
  origin_history?: string;
  description: string;
  image_url?: string;
  resources?: string[];
  grooming_needs: GroomingNeeds;
  exercise_needs: ExerciseNeeds;
}

@Injectable()
export class BreedsSeeder {
  private readonly logger = new Logger(BreedsSeeder.name);
  constructor(
    @InjectRepository(Breed)
    private readonly breedRepository: Repository<Breed>
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Starting breeds seeding...');

    const breedsData: BreedData[] = [
      // DOGS
      {
        name: 'Labrador Retriever',
        species: PetSpecies.DOG,
        size_category: PetSize.LARGE,
        temperament: 'Friendly, outgoing, and high-spirited',
        health_risks: ['Hip dysplasia', 'Elbow dysplasia', 'Obesity'],
        life_expectancy_min: 10,
        life_expectancy_max: 14,
        weight_min: 55,
        weight_max: 80,
        origin_country: 'Canada',
        origin_history: 'The Labrador Retriever originated in Newfoundland, Canada in the early 19th century. They were bred from St. John\'s water dogs, a breed used by fishermen to retrieve fish that fell off fishing lines. The breed was later refined in England where they became popular as gun dogs for hunting waterfowl. Their friendly nature, intelligence, and water-loving abilities made them ideal for both work and companionship.',
        description: 'A medium-large gun dog that was bred to retrieve shot waterfowl',
        image_url: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?auto=format&fit=crop&q=80',
        resources: [
          'https://www.akc.org/dog-breeds/labrador-retriever/',
          'https://www.labradorretrieverclub.com/',
          'https://www.ofa.org/breeds/labrador-retrievers',
          'https://www.pennhip.org/',
          'American Kennel Club Labrador Retriever Breed Standard'
        ],
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.HIGH,
      },
      {
        name: 'Golden Retriever',
        species: PetSpecies.DOG,
        size_category: PetSize.LARGE,
        temperament: 'Intelligent, friendly, and devoted',
        health_risks: ['Hip dysplasia', 'Elbow dysplasia', 'Cancer'],
        life_expectancy_min: 10,
        life_expectancy_max: 12,
        weight_min: 55,
        weight_max: 75,
        origin_country: 'Scotland',
        origin_history: 'The Golden Retriever was developed in Scotland in the mid-19th century by Dudley Marjoribanks, 1st Baron Tweedmouth. He crossed a yellow-colored Retriever with the Tweed Water Spaniel, aiming to create a superior hunting companion. The breed was officially recognized in 1913 and quickly became popular for their gentle temperament and versatility. They excel as hunting dogs, service animals, and family companions.',
        description: 'A large-sized gun dog that was bred to retrieve shot waterfowl',
        image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e27?auto=format&fit=crop&q=80',
        resources: [
          'https://www.akc.org/dog-breeds/golden-retriever/',
          'https://www.grca.org/',
          'https://www.ofa.org/breeds/golden-retrievers',
          'https://www.goldenretrieverfoundation.org/',
          'American Kennel Club Golden Retriever Breed Standard'
        ],
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.HIGH,
      },
      {
        name: 'German Shepherd',
        species: PetSpecies.DOG,
        size_category: PetSize.LARGE,
        temperament: 'Confident, courageous, and smart',
        health_risks: ['Hip dysplasia', 'Elbow dysplasia', 'Bloat'],
        life_expectancy_min: 9,
        life_expectancy_max: 13,
        weight_min: 50,
        weight_max: 90,
        origin_country: 'Germany',
        origin_history: 'The German Shepherd Dog was developed in Germany in 1899 by Captain Max von Stephanitz and other breeders. They were originally bred from various German sheep herding dogs, with the goal of creating an intelligent working dog. The breed excelled in herding, police work, and military service. They became famous for their loyalty, intelligence, and versatility, serving as guide dogs, search and rescue dogs, and police K-9 units worldwide.',
        description: 'A medium to large-sized working dog that originated in Germany',
        image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80',
        resources: [
          'https://www.akc.org/dog-breeds/german-shepherd-dog/',
          'https://www.gsdca.org/',
          'https://www.ofa.org/breeds/german-shepherd-dogs',
          'https://www.germanshepherddog.com/',
          'American Kennel Club German Shepherd Dog Breed Standard'
        ],
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.HIGH,
      },
      {
        name: 'French Bulldog',
        species: PetSpecies.DOG,
        size_category: PetSize.SMALL,
        temperament: 'Adaptable, playful, and smart',
        health_risks: ['Brachycephalic syndrome', 'Hip dysplasia', 'Allergies'],
        life_expectancy_min: 10,
        life_expectancy_max: 12,
        weight_min: 20,
        weight_max: 28,
        origin_country: 'France',
        origin_history: 'The French Bulldog originated in England in the 19th century, bred from Bulldog and terrier crosses. They were brought to France by lace workers who immigrated from Nottingham, where the breed became popular among Parisian artisans and shopkeepers. Their compact size and friendly nature made them ideal companion dogs. The breed was officially recognized in France and gained worldwide popularity as a lap dog and show dog.',
        description: 'A small domestic dog breed that originated in France',
        image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80',
        resources: [
          'https://www.akc.org/dog-breeds/french-bulldog/',
          'https://www.frenchbulldogclubofamerica.org/',
          'https://www.ofa.org/breeds/french-bulldogs',
          'https://www.frenchbulldogrescue.org/',
          'American Kennel Club French Bulldog Breed Standard'
        ],
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.LOW,
      },
      {
        name: 'Poodle',
        species: PetSpecies.DOG,
        size_category: PetSize.MEDIUM,
        temperament: 'Active, alert, and intelligent',
        health_risks: ['Hip dysplasia', 'Progressive retinal atrophy', 'Bloat'],
        life_expectancy_min: 12,
        life_expectancy_max: 15,
        weight_min: 45,
        weight_max: 70,
        origin_country: 'Germany',
        origin_history: 'The Poodle originated in Germany as a water retriever and hunting dog. The breed was developed from various European water dogs and was used for retrieving waterfowl. Their distinctive curly coat was originally practical for swimming, helping to insulate them in cold water. Poodles come in three sizes: Standard, Miniature, and Toy, each developed for different hunting purposes. They became popular as show dogs and companions due to their intelligence and trainability.',
        description: 'A water dog breed that comes in three size varieties',
        image_url: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&q=80',
        resources: [
          'https://www.akc.org/dog-breeds/poodle/',
          'https://www.poodleclubofamerica.org/',
          'https://www.ofa.org/breeds/poodles',
          'https://www.poodle-rescue.org/',
          'American Kennel Club Poodle Breed Standard'
        ],
        grooming_needs: GroomingNeeds.HIGH,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'Beagle',
        species: PetSpecies.DOG,
        size_category: PetSize.MEDIUM,
        temperament: 'Friendly, curious, and merry',
        health_risks: ['Epilepsy', 'Hypothyroidism', 'Obesity'],
        life_expectancy_min: 13,
        life_expectancy_max: 16,
        weight_min: 20,
        weight_max: 30,
        origin_country: 'England',
        description: 'A small to medium-sized hound dog that is similar in appearance to the foxhound',
        image_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'Yorkshire Terrier',
        species: PetSpecies.DOG,
        size_category: PetSize.TINY,
        temperament: 'Bold, confident, and intelligent',
        health_risks: ['Patellar luxation', 'Tracheal collapse', 'Dental problems'],
        life_expectancy_min: 11,
        life_expectancy_max: 15,
        weight_min: 4,
        weight_max: 7,
        origin_country: 'England',
        description: 'A small dog breed of terrier type, developed during the 19th century in Yorkshire',
        image_url: 'https://images.unsplash.com/photo-1565058609200-4629f7d4d3e0?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.HIGH,
        exercise_needs: ExerciseNeeds.LOW,
      },

      // CATS
      {
        name: 'Persian',
        species: PetSpecies.CAT,
        size_category: PetSize.MEDIUM,
        temperament: 'Quiet, gentle, and sweet',
        health_risks: ['Polycystic kidney disease', 'Breathing problems', 'Eye conditions'],
        life_expectancy_min: 12,
        life_expectancy_max: 17,
        weight_min: 7,
        weight_max: 12,
        origin_country: 'Iran',
        description: 'A long-haired breed of cat characterized by its round face and short muzzle',
        image_url: 'https://images.unsplash.com/photo-1616129650852-3075a02e588c?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.HIGH,
        exercise_needs: ExerciseNeeds.LOW,
      },
      {
        name: 'Maine Coon',
        species: PetSpecies.CAT,
        size_category: PetSize.LARGE,
        temperament: 'Gentle, friendly, and intelligent',
        health_risks: ['Hip dysplasia', 'Hypertrophic cardiomyopathy', 'Spinal muscular atrophy'],
        life_expectancy_min: 12,
        life_expectancy_max: 15,
        weight_min: 8,
        weight_max: 18,
        origin_country: 'United States',
        description: 'One of the largest domesticated cat breeds, known for its size and hunting prowess',
        image_url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'British Shorthair',
        species: PetSpecies.CAT,
        size_category: PetSize.MEDIUM,
        temperament: 'Calm, easygoing, and affectionate',
        health_risks: ['Hypertrophic cardiomyopathy', 'Obesity', 'Dental disease'],
        life_expectancy_min: 12,
        life_expectancy_max: 20,
        weight_min: 7,
        weight_max: 17,
        origin_country: 'England',
        description: 'A medium-sized cat breed with a dense coat and broad face',
        image_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.LOW,
      },
      {
        name: 'Ragdoll',
        species: PetSpecies.CAT,
        size_category: PetSize.LARGE,
        temperament: 'Docile, placid, and affectionate',
        health_risks: ['Hypertrophic cardiomyopathy', 'Bladder stones', 'Obesity'],
        life_expectancy_min: 12,
        life_expectancy_max: 17,
        weight_min: 10,
        weight_max: 20,
        origin_country: 'United States',
        description: 'A cat breed with a color point coat and blue eyes, known for its docile temperament',
        image_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.LOW,
      },
      {
        name: 'Siamese',
        species: PetSpecies.CAT,
        size_category: PetSize.MEDIUM,
        temperament: 'Active, vocal, and social',
        health_risks: ['Progressive retinal atrophy', 'Amyloidosis', 'Asthma'],
        life_expectancy_min: 15,
        life_expectancy_max: 20,
        weight_min: 8,
        weight_max: 15,
        origin_country: 'Thailand',
        description: 'A short-haired breed with distinctive color points and blue eyes',
        image_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'Sphynx',
        species: PetSpecies.CAT,
        size_category: PetSize.MEDIUM,
        temperament: 'Energetic, intelligent, and extroverted',
        health_risks: ['Hypertrophic cardiomyopathy', 'Skin conditions', 'Dental problems'],
        life_expectancy_min: 8,
        life_expectancy_max: 14,
        weight_min: 6,
        weight_max: 12,
        origin_country: 'Canada',
        description: 'A hairless cat breed known for its lack of fur and wrinkled skin',
        image_url: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.HIGH,
        exercise_needs: ExerciseNeeds.MODERATE,
      },

      // BIRDS
      {
        name: 'Canary',
        species: PetSpecies.BIRD,
        size_category: PetSize.TINY,
        temperament: 'Cheerful, active, and social',
        health_risks: ['Respiratory infections', 'Feather plucking', 'Egg binding'],
        life_expectancy_min: 7,
        life_expectancy_max: 10,
        weight_min: 0.3,
        weight_max: 0.5,
        origin_country: 'Canary Islands',
        description: 'A small songbird known for its beautiful singing and bright colors',
        image_url: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd8?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'Cockatiel',
        species: PetSpecies.BIRD,
        size_category: PetSize.SMALL,
        temperament: 'Gentle, affectionate, and intelligent',
        health_risks: ['Respiratory infections', 'Feather plucking', 'Egg binding'],
        life_expectancy_min: 15,
        life_expectancy_max: 25,
        weight_min: 2.5,
        weight_max: 4.5,
        origin_country: 'Australia',
        description: 'A small parrot that is a popular pet bird, known for its crest and whistling',
        image_url: 'https://images.unsplash.com/photo-1619490057073-6b7165f61012?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'African Grey',
        species: PetSpecies.BIRD,
        size_category: PetSize.MEDIUM,
        temperament: 'Intelligent, sensitive, and social',
        health_risks: ['Feather plucking', 'Respiratory infections', 'Calcium deficiency'],
        life_expectancy_min: 40,
        life_expectancy_max: 60,
        weight_min: 15,
        weight_max: 20,
        origin_country: 'Central Africa',
        description: 'A highly intelligent parrot known for its exceptional talking ability',
        image_url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.HIGH,
      },

      // RABBITS
      {
        name: 'Holland Lop',
        species: PetSpecies.RABBIT,
        size_category: PetSize.SMALL,
        temperament: 'Gentle, calm, and friendly',
        health_risks: ['Dental problems', 'Ear infections', 'Obesity'],
        life_expectancy_min: 7,
        life_expectancy_max: 12,
        weight_min: 2,
        weight_max: 4,
        origin_country: 'Netherlands',
        description: 'A small rabbit breed with drooping ears and a compact body',
        image_url: 'https://images.unsplash.com/photo-1585110396000-c928e911659f?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'Flemish Giant',
        species: PetSpecies.RABBIT,
        size_category: PetSize.GIANT,
        temperament: 'Gentle, docile, and calm',
        health_risks: ['Sore hocks', 'Heart disease', 'Obesity'],
        life_expectancy_min: 5,
        life_expectancy_max: 8,
        weight_min: 9,
        weight_max: 14,
        origin_country: 'Belgium',
        description: 'The largest rabbit breed, known for its massive size and gentle nature',
        image_url: 'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.MODERATE,
        exercise_needs: ExerciseNeeds.MODERATE,
      },

      // HAMSTERS
      {
        name: 'Syrian Hamster',
        species: PetSpecies.HAMSTER,
        size_category: PetSize.TINY,
        temperament: 'Gentle, easy to handle, and solitary',
        health_risks: ['Wet tail', 'Respiratory infections', 'Diabetes'],
        life_expectancy_min: 2,
        life_expectancy_max: 3,
        weight_min: 0.1,
        weight_max: 0.2,
        origin_country: 'Syria',
        description: 'The most common pet hamster, known for its golden color and friendly nature',
        image_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.MODERATE,
      },

      // FISH
      {
        name: 'Goldfish',
        species: PetSpecies.FISH,
        size_category: PetSize.SMALL,
        temperament: 'Peaceful, social, and active',
        health_risks: ['Swim bladder disease', 'Ich', 'Fin rot'],
        life_expectancy_min: 10,
        life_expectancy_max: 30,
        weight_min: 0.1,
        weight_max: 2,
        origin_country: 'China',
        description: 'A freshwater fish that is one of the most commonly kept aquarium fish',
        image_url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.LOW,
      },
      {
        name: 'Betta',
        species: PetSpecies.FISH,
        size_category: PetSize.TINY,
        temperament: 'Aggressive, territorial, and intelligent',
        health_risks: ['Fin rot', 'Ich', 'Swim bladder disease'],
        life_expectancy_min: 2,
        life_expectancy_max: 5,
        weight_min: 0.05,
        weight_max: 0.1,
        origin_country: 'Thailand',
        description: 'A colorful freshwater fish known for its aggressive behavior and beautiful fins',
        image_url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.LOW,
      },

      // REPTILES
      {
        name: 'Bearded Dragon',
        species: PetSpecies.REPTILE,
        size_category: PetSize.MEDIUM,
        temperament: 'Docile, friendly, and calm',
        health_risks: ['Metabolic bone disease', 'Respiratory infections', 'Impaction'],
        life_expectancy_min: 8,
        life_expectancy_max: 12,
        weight_min: 0.5,
        weight_max: 1.5,
        origin_country: 'Australia',
        description: 'A popular pet lizard known for its docile nature and distinctive beard',
        image_url: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.MODERATE,
      },
      {
        name: 'Leopard Gecko',
        species: PetSpecies.REPTILE,
        size_category: PetSize.SMALL,
        temperament: 'Docile, gentle, and easy to handle',
        health_risks: ['Metabolic bone disease', 'Impaction', 'Respiratory infections'],
        life_expectancy_min: 15,
        life_expectancy_max: 20,
        weight_min: 0.1,
        weight_max: 0.3,
        origin_country: 'Pakistan',
        description: 'A small, nocturnal gecko that is popular as a pet due to its docile nature',
        image_url: 'https://images.unsplash.com/photo-1591567972361-6bc5d54d0b6b?auto=format&fit=crop&q=80',
        grooming_needs: GroomingNeeds.LOW,
        exercise_needs: ExerciseNeeds.LOW,
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const breedData of breedsData) {
      const existingBreed = await this.breedRepository.findOne({
        where: {
          name: breedData.name,
          species: breedData.species,
        },
      });

      if (existingBreed) {
        this.logger.log(`⏭️  Skipping ${breedData.name} (${breedData.species}) - already exists`);
        skippedCount++;
        continue;
      }

      const breed = this.breedRepository.create(breedData);
      await this.breedRepository.save(breed);
      this.logger.log(`✅ Created ${breedData.name} (${breedData.species})`);
      createdCount++;
    }

    this.logger.log(`🌱 Breeds seeding completed! Created: ${createdCount}, Skipped: ${skippedCount}`);
  }

  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing breeds data...');
    await this.breedRepository.createQueryBuilder().delete().execute();
    this.logger.log('✅ Breeds data cleared');
  }
}
