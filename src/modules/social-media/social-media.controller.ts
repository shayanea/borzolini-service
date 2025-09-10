import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialMediaSimpleService } from './social-media-simple.service';
import { SocialMediaPost, SocialMediaProfile, SocialMediaService } from './social-media.service';

@ApiTags('social-media')
@Controller('social-media')
@UseGuards(JwtAuthGuard)
export class SocialMediaController {
  constructor(
    private readonly socialMediaService: SocialMediaService,
    private readonly socialMediaSimpleService: SocialMediaSimpleService
  ) {}

  @Get('clinic/:clinicId')
  @ApiOperation({ summary: 'Get social media content for a specific clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiQuery({ name: 'maxPosts', required: false, description: 'Maximum posts per platform', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Social media content retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        clinic: { $ref: '#/components/schemas/Clinic' },
        instagram: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              platform: { type: 'string', enum: ['instagram', 'tiktok'] },
              content_type: { type: 'string', enum: ['post', 'story', 'reel', 'video'] },
              caption: { type: 'string' },
              media_urls: { type: 'array', items: { type: 'string' } },
              likes_count: { type: 'number' },
              comments_count: { type: 'number' },
              shares_count: { type: 'number' },
              views_count: { type: 'number' },
              published_date: { type: 'string', format: 'date-time' },
              hashtags: { type: 'array', items: { type: 'string' } },
              mentions: { type: 'array', items: { type: 'string' } },
              location: { type: 'string' },
              is_verified: { type: 'boolean' },
            },
          },
        },
        tiktok: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              platform: { type: 'string', enum: ['instagram', 'tiktok'] },
              content_type: { type: 'string', enum: ['post', 'story', 'reel', 'video'] },
              caption: { type: 'string' },
              media_urls: { type: 'array', items: { type: 'string' } },
              likes_count: { type: 'number' },
              comments_count: { type: 'number' },
              shares_count: { type: 'number' },
              views_count: { type: 'number' },
              published_date: { type: 'string', format: 'date-time' },
              hashtags: { type: 'array', items: { type: 'string' } },
              mentions: { type: 'array', items: { type: 'string' } },
              location: { type: 'string' },
              is_verified: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async getClinicSocialContent(@Param('clinicId') clinicId: string, @Query('maxPosts') maxPosts: number = 10) {
    return this.socialMediaSimpleService.getClinicSocialContent(clinicId, maxPosts);
  }

  @Get('clinics')
  @ApiOperation({ summary: 'Get social media content for all clinics' })
  @ApiQuery({ name: 'maxPosts', required: false, description: 'Maximum posts per platform', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Social media content for all clinics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clinic: { $ref: '#/components/schemas/Clinic' },
          instagram: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                platform: { type: 'string', enum: ['instagram', 'tiktok'] },
                content_type: { type: 'string', enum: ['post', 'story', 'reel', 'video'] },
                caption: { type: 'string' },
                media_urls: { type: 'array', items: { type: 'string' } },
                likes_count: { type: 'number' },
                comments_count: { type: 'number' },
                shares_count: { type: 'number' },
                views_count: { type: 'number' },
                published_date: { type: 'string', format: 'date-time' },
                hashtags: { type: 'array', items: { type: 'string' } },
                mentions: { type: 'array', items: { type: 'string' } },
                location: { type: 'string' },
                is_verified: { type: 'boolean' },
              },
            },
          },
          tiktok: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                platform: { type: 'string', enum: ['instagram', 'tiktok'] },
                content_type: { type: 'string', enum: ['post', 'story', 'reel', 'video'] },
                caption: { type: 'string' },
                media_urls: { type: 'array', items: { type: 'string' } },
                likes_count: { type: 'number' },
                comments_count: { type: 'number' },
                shares_count: { type: 'number' },
                views_count: { type: 'number' },
                published_date: { type: 'string', format: 'date-time' },
                hashtags: { type: 'array', items: { type: 'string' } },
                mentions: { type: 'array', items: { type: 'string' } },
                location: { type: 'string' },
                is_verified: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  })
  async getAllClinicsSocialContent(@Query('maxPosts') maxPosts: number = 5) {
    return this.socialMediaSimpleService.getAllClinicsSocialContent(maxPosts);
  }

  @Get('profile/instagram')
  @ApiOperation({ summary: 'Get Instagram profile information' })
  @ApiQuery({ name: 'url', description: 'Instagram profile URL' })
  @ApiResponse({
    status: 200,
    description: 'Instagram profile information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['instagram'] },
        username: { type: 'string' },
        display_name: { type: 'string' },
        bio: { type: 'string' },
        profile_picture_url: { type: 'string' },
        followers_count: { type: 'number' },
        following_count: { type: 'number' },
        posts_count: { type: 'number' },
        is_verified: { type: 'boolean' },
        is_private: { type: 'boolean' },
        external_url: { type: 'string' },
      },
    },
  })
  async getInstagramProfile(@Query('url') url: string): Promise<SocialMediaProfile | null> {
    return this.socialMediaSimpleService.getSocialMediaProfile('instagram', url);
  }

  @Get('profile/tiktok')
  @ApiOperation({ summary: 'Get TikTok profile information' })
  @ApiQuery({ name: 'url', description: 'TikTok profile URL' })
  @ApiResponse({
    status: 200,
    description: 'TikTok profile information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['tiktok'] },
        username: { type: 'string' },
        display_name: { type: 'string' },
        bio: { type: 'string' },
        profile_picture_url: { type: 'string' },
        followers_count: { type: 'number' },
        following_count: { type: 'number' },
        posts_count: { type: 'number' },
        is_verified: { type: 'boolean' },
        is_private: { type: 'boolean' },
        external_url: { type: 'string' },
      },
    },
  })
  async getTikTokProfile(@Query('url') url: string): Promise<SocialMediaProfile | null> {
    return this.socialMediaSimpleService.getSocialMediaProfile('tiktok', url);
  }

  @Get('scrape/instagram')
  @ApiOperation({ summary: 'Scrape Instagram content directly' })
  @ApiQuery({ name: 'url', description: 'Instagram profile URL' })
  @ApiQuery({ name: 'maxPosts', required: false, description: 'Maximum posts to scrape', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Instagram content scraped successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          platform: { type: 'string', enum: ['instagram'] },
          content_type: { type: 'string', enum: ['post', 'story', 'reel'] },
          caption: { type: 'string' },
          media_urls: { type: 'array', items: { type: 'string' } },
          likes_count: { type: 'number' },
          comments_count: { type: 'number' },
          published_date: { type: 'string', format: 'date-time' },
          hashtags: { type: 'array', items: { type: 'string' } },
          mentions: { type: 'array', items: { type: 'string' } },
          is_verified: { type: 'boolean' },
        },
      },
    },
  })
  async scrapeInstagram(@Query('url') url: string, @Query('maxPosts') maxPosts: number = 10): Promise<SocialMediaPost[]> {
    return this.socialMediaService.scrapeInstagramContent(url, maxPosts);
  }

  @Get('scrape/tiktok')
  @ApiOperation({ summary: 'Scrape TikTok content directly' })
  @ApiQuery({ name: 'url', description: 'TikTok profile URL' })
  @ApiQuery({ name: 'maxPosts', required: false, description: 'Maximum posts to scrape', type: Number })
  @ApiResponse({
    status: 200,
    description: 'TikTok content scraped successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          platform: { type: 'string', enum: ['tiktok'] },
          content_type: { type: 'string', enum: ['video'] },
          caption: { type: 'string' },
          media_urls: { type: 'array', items: { type: 'string' } },
          likes_count: { type: 'number' },
          comments_count: { type: 'number' },
          shares_count: { type: 'number' },
          published_date: { type: 'string', format: 'date-time' },
          hashtags: { type: 'array', items: { type: 'string' } },
          mentions: { type: 'array', items: { type: 'string' } },
          is_verified: { type: 'boolean' },
        },
      },
    },
  })
  async scrapeTikTok(@Query('url') url: string, @Query('maxPosts') maxPosts: number = 10): Promise<SocialMediaPost[]> {
    return this.socialMediaService.scrapeTikTokContent(url, maxPosts);
  }
}
