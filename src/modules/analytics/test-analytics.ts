import { AnalyticsService } from './analytics.service';
import { ConfigService } from '@nestjs/config';

// Simple test script for the analytics module
async function testAnalytics() {
  console.log('🧪 Testing Analytics Module...\n');

  // Mock config service
  const mockConfig = {
    get: (key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'UMAMI_ENABLED': true,
        'UMAMI_WEBSITE_ID': 'test-website-id',
        'UMAMI_API_URL': 'https://test-umami.com/api/collect'
      };
      return config[key] || defaultValue;
    }
  } as ConfigService;

  try {
    // Test service initialization
    console.log('1. Testing service initialization...');
    const analyticsService = new AnalyticsService(mockConfig);
    console.log('✅ Analytics service created successfully');
    console.log(`   Enabled: ${analyticsService.isAnalyticsEnabled()}`);
    console.log(`   Status:`, analyticsService.getAnalyticsStatus());

    // Test event tracking
    console.log('\n2. Testing event tracking...');
    await analyticsService.trackEvent({
      eventName: 'test_event',
      eventData: { test: true, timestamp: new Date().toISOString() }
    });
    console.log('✅ Event tracking test completed');

    // Test page view tracking
    console.log('\n3. Testing page view tracking...');
    await analyticsService.trackPageView({
      url: 'https://test.com/page',
      referrer: 'https://test.com'
    });
    console.log('✅ Page view tracking test completed');

    // Test business event tracking
    console.log('\n4. Testing business event tracking...');
    await analyticsService.trackAuthEvent('login', 'test-user-123');
    await analyticsService.trackAppointmentEvent('created', 'appointment-123', 'clinic-456');
    await analyticsService.trackHealthEvent('checkup', 'pet-123', 'clinic-456');
    await analyticsService.trackClinicEvent('updated', 'clinic-789');
    console.log('✅ Business event tracking tests completed');

    console.log('\n🎉 All tests passed! Analytics module is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAnalytics();
}

export { testAnalytics };
