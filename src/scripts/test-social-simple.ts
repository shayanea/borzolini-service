import { SocialMediaSimpleService } from '../modules/social-media/social-media-simple.service';

// Mock the TypeORM repository
const mockClinicRepository = {
  find: async () => [
    {
      id: 'test-clinic-1',
      name: 'Test Clinic',
      instagram_url: 'https://www.instagram.com/testclinic/',
      tiktok_url: 'https://www.tiktok.com/@testclinic',
    },
  ],
  findOne: async () => ({
    id: 'test-clinic-1',
    name: 'Test Clinic',
    instagram_url: 'https://www.instagram.com/testclinic/',
    tiktok_url: 'https://www.tiktok.com/@testclinic',
  }),
};

// Create a simple test
async function testSocialMediaSimple() {
  console.log('🚀 Testing Social Media Simple Service...\n');

  try {
    // Create service instance with mock repository
    const service = new SocialMediaSimpleService(mockClinicRepository as any);

    // Test getting clinics with social media
    console.log('📸 Testing getClinicsWithSocialMedia...');
    const clinics = await service.getClinicsWithSocialMedia();
    console.log(`✅ Found ${clinics.length} clinics with social media URLs`);

    if (clinics.length > 0) {
      const firstClinic = clinics[0];
      if (!firstClinic) return;

      console.log(`\n🏥 Testing with clinic: ${firstClinic.name}`);

      // Test getting social content
      console.log('📱 Testing getClinicSocialContent...');
      const socialContent = await service.getClinicSocialContent(firstClinic.id, 3);
      console.log(`✅ Social content retrieved! Found ${socialContent.instagram.length} Instagram posts and ${socialContent.tiktok.length} TikTok posts`);

      // Test profile information
      console.log('\n👤 Testing profile information...');
      const instagramProfile = await service.getSocialMediaProfile('instagram', 'https://www.instagram.com/banfieldpethospital/');
      if (instagramProfile) {
        console.log('✅ Instagram Profile Info:');
        console.log(`   Username: ${instagramProfile.username}`);
        console.log(`   Display Name: ${instagramProfile.display_name}`);
        console.log(`   Bio: ${instagramProfile.bio?.substring(0, 100) || 'N/A'}...`);
        console.log(`   Followers: ${instagramProfile.followers_count?.toLocaleString() || 'N/A'}`);
        console.log(`   Following: ${instagramProfile.following_count?.toLocaleString() || 'N/A'}`);
        console.log(`   Posts: ${instagramProfile.posts_count?.toLocaleString() || 'N/A'}`);
        console.log(`   Verified: ${instagramProfile.is_verified ? 'Yes' : 'No'}`);
      }

      const tiktokProfile = await service.getSocialMediaProfile('tiktok', 'https://www.tiktok.com/@banfieldpethospital');
      if (tiktokProfile) {
        console.log('\n✅ TikTok Profile Info:');
        console.log(`   Username: ${tiktokProfile.username}`);
        console.log(`   Display Name: ${tiktokProfile.display_name}`);
        console.log(`   Bio: ${tiktokProfile.bio?.substring(0, 100) || 'N/A'}...`);
        console.log(`   Followers: ${tiktokProfile.followers_count?.toLocaleString() || 'N/A'}`);
        console.log(`   Following: ${tiktokProfile.following_count?.toLocaleString() || 'N/A'}`);
        console.log(`   Posts: ${tiktokProfile.posts_count?.toLocaleString() || 'N/A'}`);
        console.log(`   Verified: ${tiktokProfile.is_verified ? 'Yes' : 'No'}`);
      }
    }

    console.log('\n🎉 Social Media Simple Service Test Completed Successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error);
  }
}

// Run the test
testSocialMediaSimple().catch(console.error);
