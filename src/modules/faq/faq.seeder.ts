import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '../../common/elasticsearch.service';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { AnimalFaq, FaqCategory } from './entities/faq.entity';

interface FaqData {
  species: PetSpecies;
  category: FaqCategory;
  question: string;
  answer: string;
  order_index: number;
}

@Injectable()
export class FaqSeeder {
  private readonly logger = new Logger(FaqSeeder.name);

  constructor(
    @InjectRepository(AnimalFaq)
    private readonly faqRepository: Repository<AnimalFaq>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Starting FAQ seeding...');

    const faqsData = this.getFaqsData();

    let createdCount = 0;
    let skippedCount = 0;

    for (const faqData of faqsData) {
      const existingFaq = await this.faqRepository.findOne({
        where: {
          species: faqData.species,
          category: faqData.category,
          question: faqData.question,
        },
      });

      if (existingFaq) {
        this.logger.log(`⏭️  Skipping FAQ: ${faqData.question.substring(0, 50)}... - already exists`);
        skippedCount++;
        continue;
      }

      const faq = this.faqRepository.create(faqData);
      await this.faqRepository.save(faq);
      this.logger.log(`✅ Created FAQ: ${faqData.question.substring(0, 50)}...`);
      createdCount++;
    }

    this.logger.log(`🌱 FAQ seeding completed! Created: ${createdCount}, Skipped: ${skippedCount}`);

    // Index FAQs in Elasticsearch if enabled
    if (this.elasticsearchService.isServiceEnabled() && createdCount > 0) {
      this.logger.log('🔍 Indexing FAQs in Elasticsearch...');
      try {
        await this.indexFaqsInElasticsearch();
      } catch (error) {
        this.logger.warn('Failed to index FAQs in Elasticsearch, but seeding completed successfully', error);
      }
    }
  }

  private getFaqsData(): FaqData[] {
    return [
      // DOGS
      {
        species: PetSpecies.DOG,
        category: FaqCategory.HEALTH_CARE,
        question: 'What is the average lifespan of a dog?',
        answer: 'Typically 10-13 years, varying by breed and size. Small breeds often live longer than large breeds.',
        order_index: 1,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.HEALTH_CARE,
        question: 'How often should I take my dog to the vet?',
        answer: 'Annual check-ups for adult dogs, every 3-4 months for puppies, and twice yearly for senior dogs (7+ years).',
        order_index: 2,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.HEALTH_CARE,
        question: 'What vaccinations does my dog need?',
        answer: 'Core vaccines: Rabies, DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza). Non-core vaccines based on lifestyle and location.',
        order_index: 3,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.HEALTH_CARE,
        question: 'What are common signs of illness in dogs?',
        answer: 'Lethargy, loss of appetite, vomiting, diarrhea, coughing, excessive panting, changes in behavior or elimination habits.',
        order_index: 4,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.HEALTH_CARE,
        question: "How can I keep my dog's teeth clean?",
        answer: 'Daily brushing with dog toothpaste, dental chews, professional cleanings, and avoiding human food.',
        order_index: 5,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'How often should I feed my dog?',
        answer: 'Adult dogs: twice daily; puppies: 3-4 times daily; senior dogs: may need smaller, more frequent meals.',
        order_index: 1,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'What should I feed my dog for a balanced diet?',
        answer: 'High-quality commercial dog food appropriate for their age, size, and activity level. Consult your vet for specific recommendations.',
        order_index: 2,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'How much should my dog eat?',
        answer: "Follow feeding guidelines on food packaging, adjusted based on your dog's weight, activity level, and body condition.",
        order_index: 3,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'When should I start training my puppy?',
        answer: 'Begin basic training at 7-8 weeks old with positive reinforcement methods.',
        order_index: 1,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I prevent my dog from barking excessively?',
        answer: 'Identify the cause, provide adequate exercise and mental stimulation, use positive training techniques, and consider professional help if needed.',
        order_index: 2,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How do I socialize my dog properly?',
        answer: 'Expose them to various environments, people, and other animals early and often in positive, controlled situations.',
        order_index: 3,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I stop my dog from chewing on furniture?',
        answer: 'Provide appropriate chew toys, supervise closely, use deterrents, and redirect to acceptable items.',
        order_index: 4,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.EXERCISE_ACTIVITY,
        question: 'How much exercise does my dog need daily?',
        answer: 'At least 30 minutes to 2 hours daily, depending on breed, age, and health. High-energy breeds need more.',
        order_index: 1,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.EXERCISE_ACTIVITY,
        question: 'What are the benefits of spaying or neutering my dog?',
        answer: 'Prevents unwanted litters, reduces risk of certain cancers, may reduce behavioral issues, and can increase lifespan.',
        order_index: 2,
      },
      {
        species: PetSpecies.DOG,
        category: FaqCategory.GENERAL_CARE,
        question: 'How can I help my dog adjust to a new home?',
        answer: 'Maintain routines, provide a quiet space, be patient, and gradually introduce new experiences.',
        order_index: 1,
      },

      // CATS
      {
        species: PetSpecies.CAT,
        category: FaqCategory.HEALTH_CARE,
        question: 'What is the average lifespan of a cat?',
        answer: 'Indoor cats: 12-15 years; outdoor cats: 7-10 years. Some cats live into their 20s with proper care.',
        order_index: 1,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.HEALTH_CARE,
        question: 'How often should I take my cat to the vet?',
        answer: 'Annual check-ups for adult cats, every 3-4 weeks for kittens, and twice yearly for senior cats (7+ years).',
        order_index: 2,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.HEALTH_CARE,
        question: 'What vaccinations does my cat need?',
        answer: 'Core vaccines: FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) and Rabies. Non-core vaccines based on lifestyle.',
        order_index: 3,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.HEALTH_CARE,
        question: 'What are common signs of illness in cats?',
        answer: 'Hiding, changes in appetite, vomiting, diarrhea, lethargy, changes in litter box habits, excessive grooming.',
        order_index: 4,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.HEALTH_CARE,
        question: "How can I keep my cat's teeth clean?",
        answer: 'Daily brushing with cat toothpaste, dental treats, professional cleanings, and feeding dental health diets.',
        order_index: 5,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'How often should I feed my cat?',
        answer: 'Adult cats: 1-2 times daily; kittens: 3-4 times daily; some cats prefer free-feeding with measured portions.',
        order_index: 1,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'What should I feed my cat for a balanced diet?',
        answer: 'High-quality commercial cat food appropriate for their age and health status. Cats are obligate carnivores.',
        order_index: 2,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'Should I feed my cat wet or dry food?',
        answer: 'Both have benefits. Wet food provides hydration, dry food helps with dental health. Many cats benefit from a combination.',
        order_index: 3,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I litter train my cat?',
        answer: 'Most cats naturally use litter boxes. Keep boxes clean, accessible, and provide one per cat plus one extra.',
        order_index: 1,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I prevent my cat from scratching furniture?',
        answer: 'Provide scratching posts, trim nails regularly, use deterrents, and redirect to appropriate surfaces.',
        order_index: 2,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How do I introduce a new cat to my household?',
        answer: 'Gradual introduction over days/weeks, separate spaces initially, use positive reinforcement, and be patient.',
        order_index: 3,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'Why does my cat stop using the litter box?',
        answer: 'Medical issues, stress, dirty litter box, location problems, or territorial issues. Consult your vet first.',
        order_index: 4,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.EXERCISE_ACTIVITY,
        question: 'How much exercise does my cat need daily?',
        answer: 'At least 15-30 minutes of active playtime daily. Indoor cats need more stimulation than outdoor cats.',
        order_index: 1,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.EXERCISE_ACTIVITY,
        question: 'What are the benefits of spaying or neutering my cat?',
        answer: 'Prevents unwanted litters, reduces risk of certain cancers, eliminates heat cycles, and may reduce behavioral issues.',
        order_index: 2,
      },
      {
        species: PetSpecies.CAT,
        category: FaqCategory.GENERAL_CARE,
        question: 'How can I keep my indoor cat entertained?',
        answer: 'Interactive toys, puzzle feeders, cat trees, window perches, and regular play sessions with you.',
        order_index: 1,
      },

      // BIRDS
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.HEALTH_CARE,
        question: 'What is the average lifespan of pet birds?',
        answer: 'Small birds (canaries, finches): 5-10 years; Medium birds (cockatiels): 15-25 years; Large parrots: 40-80 years.',
        order_index: 1,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.HEALTH_CARE,
        question: 'How often should I take my bird to the vet?',
        answer: 'Annual check-ups for healthy birds, more frequently for new birds or those with health issues.',
        order_index: 2,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.HEALTH_CARE,
        question: 'What vaccinations does my bird need?',
        answer: 'Vaccination needs vary by species and location. Consult an avian veterinarian for specific recommendations.',
        order_index: 3,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.HEALTH_CARE,
        question: 'What are common signs of illness in birds?',
        answer: 'Fluffed feathers, lethargy, changes in droppings, loss of appetite, difficulty breathing, changes in behavior.',
        order_index: 4,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.HEALTH_CARE,
        question: "How can I keep my bird's beak and nails healthy?",
        answer: 'Provide appropriate perches of varying textures, toys for chewing, and schedule regular check-ups for trimming.',
        order_index: 5,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'How often should I feed my bird?',
        answer: 'Provide fresh food and water daily. Most birds eat small amounts throughout the day.',
        order_index: 1,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'What should I feed my bird for a balanced diet?',
        answer: 'Species-appropriate pellets as base diet, supplemented with fresh fruits, vegetables, and occasional treats.',
        order_index: 2,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'Can I feed my bird human food?',
        answer: "Some human foods are safe in moderation, but many are toxic. Research your bird's specific dietary needs.",
        order_index: 3,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I train my bird to talk?',
        answer: 'Start with simple words, repeat consistently, use positive reinforcement, and be patient. Not all birds will talk.',
        order_index: 1,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I prevent my bird from biting?',
        answer: 'Use positive reinforcement, avoid triggering fear responses, respect their body language, and build trust gradually.',
        order_index: 2,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.EXERCISE_ACTIVITY,
        question: 'How much exercise does my bird need daily?',
        answer: 'Daily out-of-cage time for flying and mental stimulation. Time varies by species and individual needs.',
        order_index: 1,
      },
      {
        species: PetSpecies.BIRD,
        category: FaqCategory.GENERAL_CARE,
        question: 'How do I socialize my bird?',
        answer: 'Handle them gently and regularly, expose them to various stimuli, and use positive reinforcement for good behavior.',
        order_index: 1,
      },

      // RABBITS
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HEALTH_CARE,
        question: 'What is the average lifespan of a pet rabbit?',
        answer: 'Typically 8-12 years with proper care, though some breeds may live longer or shorter.',
        order_index: 1,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HEALTH_CARE,
        question: 'How often should I take my rabbit to the vet?',
        answer: 'Annual check-ups for healthy rabbits, more frequently for young, senior, or sick rabbits.',
        order_index: 2,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HEALTH_CARE,
        question: 'What vaccinations does my rabbit need?',
        answer: 'Vaccination needs vary by location and disease prevalence. Consult a rabbit-savvy veterinarian.',
        order_index: 3,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HEALTH_CARE,
        question: 'What are common signs of illness in rabbits?',
        answer: 'Changes in eating or drinking, lethargy, changes in droppings, difficulty breathing, head tilting, or changes in behavior.',
        order_index: 4,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HEALTH_CARE,
        question: "How can I keep my rabbit's teeth healthy?",
        answer: 'Provide unlimited hay, appropriate chew toys, and regular veterinary check-ups for dental health.',
        order_index: 5,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'How often should I feed my rabbit?',
        answer: 'Unlimited hay should always be available, fresh vegetables daily, and measured pellets based on age and weight.',
        order_index: 1,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'What should I feed my rabbit for a balanced diet?',
        answer: '80% hay, 15% fresh vegetables, 5% pellets. Avoid high-sugar fruits and treats.',
        order_index: 2,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.FEEDING_NUTRITION,
        question: 'Why is hay so important for rabbits?',
        answer: 'Essential for dental health, digestive health, and provides necessary fiber for proper gut function.',
        order_index: 3,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HOUSING_ENVIRONMENT,
        question: 'How much space does my rabbit need?',
        answer: 'Minimum 4x2 feet for small breeds, larger for bigger breeds. More space is always better.',
        order_index: 1,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.HOUSING_ENVIRONMENT,
        question: 'Should I keep my rabbit indoors or outdoors?',
        answer: 'Indoor housing is generally safer and allows for better social interaction and health monitoring.',
        order_index: 2,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How can I litter train my rabbit?',
        answer: 'Most rabbits naturally use one area. Place a litter box there, use rabbit-safe litter, and be patient.',
        order_index: 1,
      },
      {
        species: PetSpecies.RABBIT,
        category: FaqCategory.TRAINING_BEHAVIOR,
        question: 'How do I introduce a new rabbit to my existing rabbit?',
        answer: 'Gradual introduction in neutral territory, supervised meetings, and be prepared for a bonding process that may take weeks.',
        order_index: 2,
      },
    ];
  }

  /**
   * Index all FAQs in Elasticsearch
   */
  private async indexFaqsInElasticsearch(): Promise<void> {
    try {
      // Create FAQ index if it doesn't exist
      await this.createFaqIndex();

      // Get all active FAQs
      const faqs = await this.faqRepository.find({
        where: { is_active: true },
      });

      if (faqs.length === 0) {
        this.logger.log('No FAQs to index');
        return;
      }

      this.logger.log(`Indexing ${faqs.length} FAQs`);

      // Bulk index FAQs
      const bulkOperations = faqs.flatMap(faq => [
        {
          index: {
            _index: 'faqs',
            _id: faq.id,
          },
        },
        {
          id: faq.id,
          species: faq.species,
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index,
          is_active: faq.is_active,
          created_at: faq.created_at.toISOString(),
          updated_at: faq.updated_at.toISOString(),
          searchable_content: `${faq.question} ${faq.answer}`.toLowerCase(),
        },
      ]);

      await this.elasticsearchService.bulk(bulkOperations);

      this.logger.log(`✅ Successfully indexed ${faqs.length} FAQs in Elasticsearch`);
    } catch (error) {
      this.logger.error('Failed to index FAQs in Elasticsearch', error);
      throw error;
    }
  }

  /**
   * Create FAQ index with proper mappings and settings
   */
  private async createFaqIndex(): Promise<void> {
    const indexName = 'faqs';

    // Check if index already exists
    const indexExists = await this.elasticsearchService.indexExists(indexName);
    if (indexExists) {
      this.logger.log(`FAQ index '${indexName}' already exists`);
      return;
    }

    const indexSettings = {
      number_of_shards: 1,
      number_of_replicas: 0,
      analysis: {
        analyzer: {
          faq_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'stop', 'porter_stem'],
          },
          autocomplete_analyzer: {
            type: 'custom',
            tokenizer: 'autocomplete_tokenizer',
            filter: ['lowercase'],
          },
        },
        filter: {
          autocomplete_filter: {
            type: 'edge_ngram',
            min_gram: 2,
            max_gram: 20,
          },
        },
        tokenizer: {
          autocomplete_tokenizer: {
            type: 'edge_ngram',
            min_gram: 2,
            max_gram: 20,
            token_chars: ['letter', 'digit'],
          },
        },
      },
    };

    const mappings = {
      properties: {
        id: {
          type: 'keyword',
        },
        species: {
          type: 'keyword',
        },
        category: {
          type: 'keyword',
        },
        question: {
          type: 'text',
          analyzer: 'faq_analyzer',
          fields: {
            keyword: {
              type: 'keyword',
            },
            completion: {
              type: 'completion',
              analyzer: 'autocomplete_analyzer',
            },
          },
        },
        answer: {
          type: 'text',
          analyzer: 'faq_analyzer',
        },
        searchable_content: {
          type: 'text',
          analyzer: 'faq_analyzer',
        },
        order_index: {
          type: 'integer',
        },
        is_active: {
          type: 'boolean',
        },
        created_at: {
          type: 'date',
        },
        updated_at: {
          type: 'date',
        },
      },
    };

    await this.elasticsearchService.createIndex(indexName, mappings, indexSettings);

    this.logger.log(`Created FAQ index '${indexName}'`);
  }

  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing FAQ data...');
    await this.faqRepository.delete({});
    this.logger.log('✅ FAQ data cleared');
  }
}
