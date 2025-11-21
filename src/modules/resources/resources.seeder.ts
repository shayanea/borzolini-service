import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, ResourceType } from './entities/resource.entity';

interface ResourceSeedData {
  type: ResourceType;
  title: string;
  url: string;
  cover?: string;
  description?: string;
}

@Injectable()
export class ResourcesSeeder {
  private readonly logger = new Logger(ResourcesSeeder.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>
  ) {}

  /**
   * Seed resources if they don't exist.
   */
  async seed(): Promise<void> {
    this.logger.log('🌱 Starting resources seeding...');

    const resources = this.getResources();

    let created = 0;
    let skipped = 0;

    for (const data of resources) {
      const exists = await this.resourceRepository.findOne({ where: { url: data.url } });
      if (exists) {
        skipped++;
        this.logger.log(`⏭️  Skipping ${data.title} - already exists`);
        continue;
      }

      const resource = this.resourceRepository.create({
        ...data,
        is_active: true,
      });
      await this.resourceRepository.save(resource);
      created++;
      this.logger.log(`✅ Created resource: ${data.title}`);
    }

    this.logger.log(`🌱 Resources seeding completed! Created: ${created}, Skipped: ${skipped}`);
  }

  /**
   * Remove all resources. Useful for fresh seeding.
   */
  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing resources data...');
    await this.resourceRepository.createQueryBuilder().delete().execute();
    this.logger.log('✅ Resources data cleared');
  }

  private getResources(): ResourceSeedData[] {
    const discordServers: ResourceSeedData[] = [
      { type: ResourceType.DISCORD, title: 'r/Dogs Official', url: 'https://discord.com/invite/dogs', cover: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'r/Cats Official', url: 'https://discord.com/invite/cats', cover: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Dog Training Advice', url: 'https://discord.com/invite/dogtraining', cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Cat Care Community', url: 'https://discord.com/invite/catcare', cover: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'The Dog House', url: 'https://discord.com/invite/thedoghouse', cover: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Purrfect Pals', url: 'https://discord.com/invite/purrfectpals', cover: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Puppy Training 101', url: 'https://discord.com/invite/puppytraining', cover: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Feline Behavior Support', url: 'https://discord.com/invite/felinebehavior', cover: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Pet Vet Corner', url: 'https://discord.com/invite/petvet', cover: 'https://images.unsplash.com/photo-1628009368231-75706a122033?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Dog Grooming Help', url: 'https://discord.com/invite/doggrooming', cover: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.DISCORD, title: 'Cat Breeds & Genetics', url: 'https://discord.com/invite/catgenetics', cover: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&q=80&w=300' },
    ];

    const youtubeChannels: ResourceSeedData[] = [
      // Dog Training & Behavior (Verified Working)
      { type: ResourceType.VIDEO, title: 'Zak George\'s Dog Training Revolution', url: 'https://www.youtube.com/user/zakgeorge21', cover: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Kikopup', url: 'https://www.youtube.com/user/kikopup', cover: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'McCann Dog Training', url: 'https://www.youtube.com/user/McCannDogs', cover: 'https://images.unsplash.com/photo-1553685216-64548eb33f78?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Training Positive', url: 'https://www.youtube.com/user/tab289', cover: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Simpawtico Dog Training', url: 'https://www.youtube.com/c/SimpawticoDogTraining', cover: 'https://images.unsplash.com/photo-1477884213360-71990bc536e9?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Cesar Millan', url: 'https://www.youtube.com/user/CesarMillan', cover: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Stonnie Dennis', url: 'https://www.youtube.com/user/StonnieDennis', cover: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'American Kennel Club', url: 'https://www.youtube.com/user/AmericanKennelClub', cover: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Nate Schoemer', url: 'https://www.youtube.com/c/NateSchoemer', cover: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Fenrir Canine Leaders', url: 'https://www.youtube.com/@FenrirCanineLeaders', cover: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Instinct Dog Training', url: 'https://www.youtube.com/@InstinctDogTraining', cover: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=300' },

      // Cat Training & Behavior (Verified Working)
      { type: ResourceType.VIDEO, title: 'Jackson Galaxy (Official)', url: 'https://www.youtube.com/@JacksonGalaxy', cover: 'https://images.unsplash.com/photo-1511044568932-338cba0fb803?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Cat School Clicker Training', url: 'https://www.youtube.com/c/CatSchool', cover: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Helpful Vancouver Vet', url: 'https://www.youtube.com/c/HelpfulVancouverVet', cover: 'https://images.unsplash.com/photo-1623366302587-bdbd9a1a937e?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'The Cat Butler', url: 'https://www.youtube.com/c/TheCatButler', cover: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Fundamentally Feline', url: 'https://www.youtube.com/c/FundamentallyFeline', cover: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'International Cat Care', url: 'https://www.youtube.com/user/icatcare', cover: 'https://images.unsplash.com/photo-1494256997604-0e100427a250?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Hannah Shaw (Kitten Lady)', url: 'https://www.youtube.com/@KittenLady', cover: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=300' },

      // Cat Entertainment & Lifestyle (Verified Working)
      { type: ResourceType.VIDEO, title: 'Cole and Marmalade', url: 'https://www.youtube.com/@coleandmarmalade', cover: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Maru the Cat', url: 'https://www.youtube.com/user/mugumogu', cover: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Nora the Piano Cat', url: 'https://www.youtube.com/user/rburns2007', cover: 'https://images.unsplash.com/photo-1478050180914-725e01db8712?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Kittisaurus (CreamHeroes)', url: 'https://www.youtube.com/c/Kittisaurus', cover: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'That Little Puff', url: 'https://www.youtube.com/c/ThatLittlePuff', cover: 'https://images.unsplash.com/photo-1501820488136-72669149e0d4?auto=format&fit=crop&q=80&w=300' },

      // Pet Healthcare & Veterinary (Verified Working)
      { type: ResourceType.VIDEO, title: 'Vet Ranch', url: 'https://www.youtube.com/user/VetRanch', cover: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Dr. Karen Becker', url: 'https://www.youtube.com/user/MercolaHealthyPets', cover: 'https://images.unsplash.com/photo-1551214012-84f95e060dee?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'AnimalWised', url: 'https://www.youtube.com/c/AnimalWised', cover: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Chewy', url: 'https://www.youtube.com/c/Chewy', cover: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'PetSmart', url: 'https://www.youtube.com/user/PetSmart', cover: 'https://images.unsplash.com/photo-1589924691195-41432c84c161?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Mercola Healthy Pets', url: 'https://www.youtube.com/user/MercolaHealthyPets', cover: 'https://images.unsplash.com/photo-1594149929911-78975a43d4f5?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Gone to the Snow Dogs', url: 'https://www.youtube.com/user/GoneToTheSnowDogs', cover: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Rachel Fusaro', url: 'https://www.youtube.com/c/RachelFusaro', cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=300' },
      { type: ResourceType.VIDEO, title: 'Our Pets Health', url: 'https://www.youtube.com/@OurPetsHealth', cover: 'https://images.unsplash.com/photo-1508154048109-1b6723f12323?auto=format&fit=crop&q=80&w=300' },
    ];

    const audioResources: ResourceSeedData[] = [
      {
        type: ResourceType.AUDIO,
        title: 'Pet Life Radio',
        url: 'https://www.petliferadio.com/',
        cover: 'https://images.unsplash.com/photo-1551730459-946cd8e363a8?auto=format&fit=crop&q=80&w=300',
        description: 'The world\'s #1 pet podcast network with shows about pet health, training, and care',
      },
      {
        type: ResourceType.AUDIO,
        title: 'The Pawdcast',
        url: 'https://www.thepawdcast.com/',
        cover: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&q=80&w=300',
        description: 'Interviews with veterinarians, trainers, and pet experts',
      },
      {
        type: ResourceType.AUDIO,
        title: 'Oh My Dog Podcast',
        url: 'https://www.ohmydogpodcast.com/',
        cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=300',
        description: 'Stories and advice about our canine companions',
      },
      {
        type: ResourceType.AUDIO,
        title: 'Cat Talk Radio',
        url: 'https://www.blogtalkradio.com/cattalkradio',
        cover: 'https://images.unsplash.com/photo-1511044568932-338cba0fb803?auto=format&fit=crop&q=80&w=300',
        description: 'Everything you need to know about cats and cat care',
      },
      {
        type: ResourceType.AUDIO,
        title: 'The Cone of Shame Veterinary Podcast',
        url: 'https://www.coneofshame.com/',
        cover: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&q=80&w=300',
        description: 'Veterinary medicine podcast with humor and expertise',
      },
    ];

    return [...discordServers, ...youtubeChannels, ...audioResources];
  }
}
