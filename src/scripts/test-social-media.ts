import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { SocialMediaSimpleService } from '../modules/social-media/social-media-simple.service';

async function testSocialMediaScraping() {
  console.log('🚀 Starting Social Media Scraping Test...\n');

  try {
    // Create application context
    const app = await NestFactory.createApplicationContext(AppModule);
    const socialMediaService = app.get(SocialMediaSimpleService);

    // Test Instagram scraping with a real veterinary clinic
    console.log('📸 Testing Instagram scraping with real veterinary clinic...');

    try {
      // Test getting all clinics with social media
      const clinics = await socialMediaService.getClinicsWithSocialMedia();
      console.log(`✅ Found ${clinics.length} clinics with social media URLs`);

      if (clinics.length > 0) {
        const firstClinic = clinics[0];
        if (firstClinic) {
          console.log(`\n🏥 Testing with clinic: ${firstClinic.name}`);

          const socialContent = await socialMediaService.getClinicSocialContent(firstClinic.id, 3);
          console.log(`✅ Social content retrieved! Found ${socialContent.instagram.length} Instagram posts and ${socialContent.tiktok.length} TikTok posts`);

          socialContent.instagram.forEach((post, index) => {
            console.log(`\n📝 Instagram Post ${index + 1}:`);
            console.log(`   ID: ${post.id}`);
            console.log(`   Type: ${post.content_type}`);
            console.log(`   Caption: ${post.caption.substring(0, 100)}...`);
            console.log(`   Likes: ${post.likes_count}`);
            console.log(`   Comments: ${post.comments_count}`);
            console.log(`   Hashtags: ${post.hashtags.join(', ')}`);
            console.log(`   Media URLs: ${post.media_urls.length} files`);
          });

          socialContent.tiktok.forEach((post, index) => {
            console.log(`\n🎬 TikTok Post ${index + 1}:`);
            console.log(`   ID: ${post.id}`);
            console.log(`   Type: ${post.content_type}`);
            console.log(`   Caption: ${post.caption.substring(0, 100)}...`);
            console.log(`   Likes: ${post.likes_count}`);
            console.log(`   Comments: ${post.comments_count}`);
            console.log(`   Shares: ${post.shares_count}`);
            console.log(`   Hashtags: ${post.hashtags.join(', ')}`);
            console.log(`   Media URLs: ${post.media_urls.length} files`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ Social media test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test profile information
    console.log('\n👤 Testing profile information...');

    try {
      const instagramProfile = await socialMediaService.getSocialMediaProfile('instagram', 'https://www.instagram.com/banfieldpethospital/');
      if (instagramProfile) {
        console.log('✅ Instagram Profile Info:');
        console.log(`   Username: ${instagramProfile.username}`);
        console.log(`   Display Name: ${instagramProfile.display_name}`);
        console.log(`   Bio: ${instagramProfile.bio.substring(0, 100)}...`);
        console.log(`   Followers: ${instagramProfile.followers_count.toLocaleString()}`);
        console.log(`   Following: ${instagramProfile.following_count.toLocaleString()}`);
        console.log(`   Posts: ${instagramProfile.posts_count.toLocaleString()}`);
        console.log(`   Verified: ${instagramProfile.is_verified ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`❌ Instagram profile info failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const tiktokProfile = await socialMediaService.getSocialMediaProfile('tiktok', 'https://www.tiktok.com/@banfieldpethospital');
      if (tiktokProfile) {
        console.log('\n✅ TikTok Profile Info:');
        console.log(`   Username: ${tiktokProfile.username}`);
        console.log(`   Display Name: ${tiktokProfile.display_name}`);
        console.log(`   Bio: ${tiktokProfile.bio.substring(0, 100)}...`);
        console.log(`   Followers: ${tiktokProfile.followers_count.toLocaleString()}`);
        console.log(`   Following: ${tiktokProfile.following_count.toLocaleString()}`);
        console.log(`   Posts: ${tiktokProfile.posts_count.toLocaleString()}`);
        console.log(`   Verified: ${tiktokProfile.is_verified ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`❌ TikTok profile info failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n🎉 Social Media Scraping Test Completed!');
    console.log('\n📋 Available API Endpoints:');
    console.log('   GET /api/social-media/clinics - Get all clinics social content');
    console.log('   GET /api/social-media/clinic/:id - Get specific clinic social content');
    console.log('   GET /api/social-media/profile/instagram?url=... - Get Instagram profile info');
    console.log('   GET /api/social-media/profile/tiktok?url=... - Get TikTok profile info');
    console.log('   GET /api/social-media/scrape/instagram?url=... - Scrape Instagram directly');
    console.log('   GET /api/social-media/scrape/tiktok?url=... - Scrape TikTok directly');

    await app.close();
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the test
testSocialMediaScraping().catch(console.error);
