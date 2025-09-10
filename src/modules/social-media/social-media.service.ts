import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaywrightCrawler } from 'crawlee';
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
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);

  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>
  ) {}

  /**
   * Scrape Instagram content for a clinic
   */
  async scrapeInstagramContent(instagramUrl: string, maxPosts: number = 10): Promise<SocialMediaPost[]> {
    this.logger.log(`Starting Instagram scraping for: ${instagramUrl}`);

    const posts: SocialMediaPost[] = [];

    const crawler = new PlaywrightCrawler({
      async requestHandler({ request, page, log }) {
        try {
          log.info(`Processing Instagram URL: ${request.url}`);

          // Navigate to the Instagram profile
          await page.goto(request.url, { waitUntil: 'networkidle' });

          // Wait for content to load
          await page.waitForSelector('article', { timeout: 10000 });

          // Extract profile information
          const profileData = await page.evaluate(() => {
            const profileElement = document.querySelector('header section');
            if (!profileElement) return null;

            return {
              username: profileElement.querySelector('h2')?.textContent?.trim() || '',
              displayName: profileElement.querySelector('h1')?.textContent?.trim() || '',
              bio: profileElement.querySelector('div[data-testid="user-bio"]')?.textContent?.trim() || '',
              postsCount: profileElement.querySelector('div[data-testid="user-posts-count"]')?.textContent?.trim() || '0',
              followersCount: profileElement.querySelector('div[data-testid="user-followers-count"]')?.textContent?.trim() || '0',
              followingCount: profileElement.querySelector('div[data-testid="user-following-count"]')?.textContent?.trim() || '0',
            };
          });

          if (profileData) {
            log.info(`Found profile: ${profileData.username}`);
          }

          // Extract posts
          const postsData = await page.evaluate((maxPosts) => {
            const posts: SocialMediaPost[] = [];
            const postElements = document.querySelectorAll('article > div > div > div > div');

            for (let i = 0; i < Math.min(postElements.length, maxPosts); i++) {
              const postElement = postElements[i];
              if (!postElement) continue;

              // Extract post data
              const captionElement = postElement.querySelector('div[data-testid="post-caption"]');
              const mediaElements = postElement.querySelectorAll('img, video');
              const likeElement = postElement.querySelector('button[aria-label*="like"]');
              const commentElement = postElement.querySelector('button[aria-label*="comment"]');

              const mediaUrls = Array.from(mediaElements)
                .map((el) => {
                  if (el.tagName === 'IMG') {
                    return (el as HTMLImageElement).src;
                  } else if (el.tagName === 'VIDEO') {
                    return (el as HTMLVideoElement).src || (el as HTMLVideoElement).poster;
                  }
                  return null;
                })
                .filter((url): url is string => url !== null);

              const caption = captionElement?.textContent?.trim() || '';
              const hashtags = caption.match(/#\w+/g) || [];
              const mentions = caption.match(/@\w+/g) || [];

              if (mediaUrls.length > 0) {
                posts.push({
                  id: `instagram_${Date.now()}_${i}`,
                  platform: 'instagram',
                  content_type: mediaUrls.some((url) => url && url.includes('video')) ? 'reel' : 'post',
                  caption,
                  media_urls: mediaUrls,
                  likes_count: parseInt(likeElement?.textContent?.replace(/\D/g, '') || '0'),
                  comments_count: parseInt(commentElement?.textContent?.replace(/\D/g, '') || '0'),
                  published_date: new Date(),
                  hashtags,
                  mentions,
                  is_verified: false,
                });
              }
            }

            return posts;
          }, maxPosts);

          posts.push(...postsData);
          log.info(`Extracted ${postsData.length} posts from Instagram`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          log.error(`Error scraping Instagram: ${errorMessage}`);
        }
      },
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 60,
    });

    try {
      await crawler.run([instagramUrl]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Instagram scraping failed: ${errorMessage}`);
    }

    this.logger.log(`Instagram scraping completed. Found ${posts.length} posts`);
    return posts;
  }

  /**
   * Scrape TikTok content for a clinic
   */
  async scrapeTikTokContent(tiktokUrl: string, maxPosts: number = 10): Promise<SocialMediaPost[]> {
    this.logger.log(`Starting TikTok scraping for: ${tiktokUrl}`);

    const posts: SocialMediaPost[] = [];

    const crawler = new PlaywrightCrawler({
      async requestHandler({ request, page, log }) {
        try {
          log.info(`Processing TikTok URL: ${request.url}`);

          // Navigate to the TikTok profile
          await page.goto(request.url, { waitUntil: 'networkidle' });

          // Wait for content to load
          await page.waitForSelector('[data-e2e="user-post-item"]', { timeout: 10000 });

          // Extract posts
          const postsData = await page.evaluate((maxPosts) => {
            const posts: SocialMediaPost[] = [];
            const postElements = document.querySelectorAll('[data-e2e="user-post-item"]');

            for (let i = 0; i < Math.min(postElements.length, maxPosts); i++) {
              const postElement = postElements[i];
              if (!postElement) continue;

              // Extract post data
              const videoElement = postElement.querySelector('video');
              const captionElement = postElement.querySelector('[data-e2e="video-desc"]');
              const likeElement = postElement.querySelector('[data-e2e="like-count"]');
              const commentElement = postElement.querySelector('[data-e2e="comment-count"]');
              const shareElement = postElement.querySelector('[data-e2e="share-count"]');

              const videoUrl = videoElement?.src || videoElement?.poster || '';
              const caption = captionElement?.textContent?.trim() || '';
              const hashtags = caption.match(/#\w+/g) || [];
              const mentions = caption.match(/@\w+/g) || [];

              if (videoUrl) {
                posts.push({
                  id: `tiktok_${Date.now()}_${i}`,
                  platform: 'tiktok',
                  content_type: 'video',
                  caption,
                  media_urls: [videoUrl],
                  likes_count: parseInt(likeElement?.textContent?.replace(/\D/g, '') || '0'),
                  comments_count: parseInt(commentElement?.textContent?.replace(/\D/g, '') || '0'),
                  shares_count: parseInt(shareElement?.textContent?.replace(/\D/g, '') || '0'),
                  published_date: new Date(),
                  hashtags,
                  mentions,
                  is_verified: false,
                });
              }
            }

            return posts;
          }, maxPosts);

          posts.push(...postsData);
          log.info(`Extracted ${postsData.length} posts from TikTok`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          log.error(`Error scraping TikTok: ${errorMessage}`);
        }
      },
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 60,
    });

    try {
      await crawler.run([tiktokUrl]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`TikTok scraping failed: ${errorMessage}`);
    }

    this.logger.log(`TikTok scraping completed. Found ${posts.length} posts`);
    return posts;
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

    // Scrape Instagram if URL is available
    if (clinic.instagram_url) {
      try {
        results.instagram = await this.scrapeInstagramContent(clinic.instagram_url, maxPostsPerPlatform);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to scrape Instagram for clinic ${clinicId}: ${errorMessage}`);
      }
    }

    // Scrape TikTok if URL is available
    if (clinic.tiktok_url) {
      try {
        results.tiktok = await this.scrapeTikTokContent(clinic.tiktok_url, maxPostsPerPlatform);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to scrape TikTok for clinic ${clinicId}: ${errorMessage}`);
      }
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
    const clinics = await this.clinicRepository.find({
      where: [{ instagram_url: Not('') }, { tiktok_url: Not('') }],
    });

    const results = [];

    for (const clinic of clinics) {
      try {
        const socialContent = await this.getClinicSocialContent(clinic.id, maxPostsPerPlatform);
        results.push(socialContent);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to get social content for clinic ${clinic.id}: ${errorMessage}`);
      }
    }

    return results;
  }

  /**
   * Get social media profile information
   */
  async getSocialMediaProfile(platform: 'instagram' | 'tiktok', url: string): Promise<SocialMediaProfile | null> {
    let profileData: SocialMediaProfile | null = null;

    const crawler = new PlaywrightCrawler({
      async requestHandler({ request, page, log }) {
        try {
          log.info(`Getting profile info for ${platform}: ${request.url}`);

          await page.goto(request.url, { waitUntil: 'networkidle' });

          if (platform === 'instagram') {
            profileData = await page.evaluate(() => {
              const profileElement = document.querySelector('header section');
              if (!profileElement) return null;

              return {
                platform: 'instagram',
                username: profileElement.querySelector('h2')?.textContent?.trim() || '',
                display_name: profileElement.querySelector('h1')?.textContent?.trim() || '',
                bio: profileElement.querySelector('div[data-testid="user-bio"]')?.textContent?.trim() || '',
                profile_picture_url: profileElement.querySelector('img')?.src || '',
                followers_count: parseInt(profileElement.querySelector('div[data-testid="user-followers-count"]')?.textContent?.replace(/\D/g, '') || '0'),
                following_count: parseInt(profileElement.querySelector('div[data-testid="user-following-count"]')?.textContent?.replace(/\D/g, '') || '0'),
                posts_count: parseInt(profileElement.querySelector('div[data-testid="user-posts-count"]')?.textContent?.replace(/\D/g, '') || '0'),
                is_verified: profileElement.querySelector('svg[aria-label="Verified"]') !== null,
                is_private: profileElement.textContent?.includes('This account is private') || false,
              };
            });
          } else if (platform === 'tiktok') {
            profileData = await page.evaluate(() => {
              const profileElement = document.querySelector('[data-e2e="user-title"]');
              if (!profileElement) return null;

              return {
                platform: 'tiktok',
                username: profileElement.querySelector('h1')?.textContent?.trim() || '',
                display_name: profileElement.querySelector('h2')?.textContent?.trim() || '',
                bio: profileElement.querySelector('[data-e2e="user-bio"]')?.textContent?.trim() || '',
                profile_picture_url: profileElement.querySelector('img')?.src || '',
                followers_count: parseInt(profileElement.querySelector('[data-e2e="followers-count"]')?.textContent?.replace(/\D/g, '') || '0'),
                following_count: parseInt(profileElement.querySelector('[data-e2e="following-count"]')?.textContent?.replace(/\D/g, '') || '0'),
                posts_count: parseInt(profileElement.querySelector('[data-e2e="video-count"]')?.textContent?.replace(/\D/g, '') || '0'),
                is_verified: profileElement.querySelector('svg[data-e2e="verified-icon"]') !== null,
                is_private: false, // TikTok doesn't have private accounts
              };
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          log.error(`Error getting profile info: ${errorMessage}`);
        }
      },
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 30,
    });

    try {
      await crawler.run([url]);
      return profileData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get profile info for ${platform}: ${errorMessage}`);
      return null;
    }
  }
}
