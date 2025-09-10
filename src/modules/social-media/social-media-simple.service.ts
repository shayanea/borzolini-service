import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';

export interface SocialMediaPost {
  id: string;
  platform: 'instagram' | 'tiktok';
  content_type: 'post' | 'story' | 'reel' | 'video';
  caption: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  views_count?: number;
  published_date: Date;
  hashtags: string[];
  mentions: string[];
  location?: string;
  is_verified: boolean;
}

export interface SocialMediaProfile {
  platform: 'instagram' | 'tiktok';
  username: string;
  display_name: string;
  bio: string;
  profile_picture_url: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  is_private: boolean;
  external_url?: string;
}

@Injectable()
export class SocialMediaSimpleService {
  private readonly logger = new Logger(SocialMediaSimpleService.name);

  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>
  ) {}

  /**
   * Get all clinics with social media URLs
   */
  async getClinicsWithSocialMedia(): Promise<Clinic[]> {
    return this.clinicRepository.find({
      where: [{ instagram_url: Not('') }, { tiktok_url: Not('') }],
    });
  }

  /**
   * Get social media content for a specific clinic
   */
  async getClinicSocialContent(
    clinicId: string,
    maxPostsPerPlatform: number = 10
  ): Promise<{
    clinic: Clinic;
    instagram: SocialMediaPost[];
    tiktok: SocialMediaPost[];
  }> {
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new Error(`Clinic with ID ${clinicId} not found`);
    }

    const results = {
      clinic,
      instagram: [] as SocialMediaPost[],
      tiktok: [] as SocialMediaPost[],
    };

    // For now, return mock data to demonstrate the structure
    if (clinic.instagram_url) {
      results.instagram = this.generateMockInstagramPosts(maxPostsPerPlatform);
    }

    if (clinic.tiktok_url) {
      results.tiktok = this.generateMockTikTokPosts(maxPostsPerPlatform);
    }

    return results;
  }

  /**
   * Get all clinics with social media content
   */
  async getAllClinicsSocialContent(maxPostsPerPlatform: number = 5): Promise<
    {
      clinic: Clinic;
      instagram: SocialMediaPost[];
      tiktok: SocialMediaPost[];
    }[]
  > {
    const clinics = await this.getClinicsWithSocialMedia();
    const results = [];

    for (const clinic of clinics) {
      try {
        const socialContent = await this.getClinicSocialContent(clinic.id, maxPostsPerPlatform);
        results.push(socialContent);
      } catch (error) {
        this.logger.error(`Failed to get social content for clinic ${clinic.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Generate mock Instagram posts for demonstration
   */
  private generateMockInstagramPosts(count: number): SocialMediaPost[] {
    const posts: SocialMediaPost[] = [];

    for (let i = 0; i < count; i++) {
      posts.push({
        id: `instagram_mock_${Date.now()}_${i}`,
        platform: 'instagram',
        content_type: i % 3 === 0 ? 'reel' : 'post',
        caption: `Veterinary care post ${i + 1} - Taking care of our furry friends! 🐾 #veterinary #petcare #healthypets`,
        media_urls: [`https://example.com/instagram_post_${i + 1}.jpg`],
        likes_count: Math.floor(Math.random() * 1000) + 50,
        comments_count: Math.floor(Math.random() * 100) + 5,
        published_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        hashtags: ['#veterinary', '#petcare', '#healthypets', '#animals'],
        mentions: ['@petowner', '@vetclinic'],
        is_verified: true,
      });
    }

    return posts;
  }

  /**
   * Generate mock TikTok posts for demonstration
   */
  private generateMockTikTokPosts(count: number): SocialMediaPost[] {
    const posts: SocialMediaPost[] = [];

    for (let i = 0; i < count; i++) {
      posts.push({
        id: `tiktok_mock_${Date.now()}_${i}`,
        platform: 'tiktok',
        content_type: 'video',
        caption: `Vet life day ${i + 1} - Behind the scenes at our clinic! 🩺🐕 #vetlife #fyp #veterinary`,
        media_urls: [`https://example.com/tiktok_video_${i + 1}.mp4`],
        likes_count: Math.floor(Math.random() * 5000) + 100,
        comments_count: Math.floor(Math.random() * 500) + 10,
        shares_count: Math.floor(Math.random() * 200) + 5,
        views_count: Math.floor(Math.random() * 10000) + 1000,
        published_date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Last 3 days
        hashtags: ['#vetlife', '#fyp', '#veterinary', '#pets', '#clinic'],
        mentions: ['@petowner', '@vetclinic'],
        is_verified: true,
      });
    }

    return posts;
  }

  /**
   * Get mock social media profile information
   */
  async getSocialMediaProfile(_platform: 'instagram' | 'tiktok', url: string): Promise<SocialMediaProfile | null> {
    // Return mock profile data for demonstration
    const mockProfiles: Record<string, SocialMediaProfile> = {
      banfieldpethospital: {
        platform: 'instagram',
        username: 'banfieldpethospital',
        display_name: 'Banfield Pet Hospital',
        bio: 'Comprehensive pet care with over 1,000 locations nationwide. Preventive care, emergency services, and everything your pet needs! 🐾',
        profile_picture_url: 'https://example.com/banfield_profile.jpg',
        followers_count: 125000,
        following_count: 500,
        posts_count: 2500,
        is_verified: true,
        is_private: false,
        external_url: 'https://www.banfield.com',
      },
      bluepearlvet: {
        platform: 'instagram',
        username: 'bluepearlvet',
        display_name: 'BluePearl Specialty + Emergency Pet Hospital',
        bio: 'Advanced specialty and emergency veterinary care. 24/7 critical care when your pet needs it most. 🏥🐾',
        profile_picture_url: 'https://example.com/bluepearl_profile.jpg',
        followers_count: 89000,
        following_count: 300,
        posts_count: 1800,
        is_verified: true,
        is_private: false,
        external_url: 'https://bluepearlvet.com',
      },
    };

    // Extract username from URL
    const username = url.split('/').pop()?.replace('@', '') || '';
    return mockProfiles[username] || null;
  }
}
