#!/usr/bin/env ts-node

import { AnalyticsService } from './src/modules/analytics/analytics.service';
import { ConfigService } from '@nestjs/config';

// Test script for real Umami integration
async function testRealUmami() {
  console.log('🧪 Testing Real Umami Integration...\n');

  // Check if environment variables are set
  const umamiEnabled = process.env.UMAMI_ENABLED;
  const websiteId = process.env.UMAMI_WEBSITE_ID;
  const apiUrl = process.env.UMAMI_API_URL;

  if (!umamiEnabled || !websiteId || !apiUrl) {
    console.log('❌ Environment variables not set. Please configure:');
    console.log('   UMAMI_ENABLED=true');
    console.log('   UMAMI_WEBSITE_ID=your_website_id');
    console.log('   UMAMI_API_URL=your_api_url');
    console.log('\n📖 See UMAMI_INTEGRATION_SUMMARY.md for setup instructions');
    return;
  }

  console.log('✅ Environment variables found:');
  console.log(`   Enabled: ${umamiEnabled}`);
  console.log(`   Website ID: ${websiteId}`);
  console.log(`   API URL: ${apiUrl}\n`);

  // Create config service that reads from environment
  const configService = {
    get: (key: string, defaultValue?: any) => {
      return process.env[key] || defaultValue;
    },
  } as ConfigService;

  try {
    // Test service initialization
    console.log('1. Testing service initialization...');
    const analyticsService = new AnalyticsService(configService);
    console.log('✅ Analytics service created successfully');
    console.log(`   Enabled: ${analyticsService.isAnalyticsEnabled()}`);
    console.log(`   Status:`, analyticsService.getAnalyticsStatus());

    // Test real event tracking
    console.log('\n2. Testing real event tracking...');
    await analyticsService.trackEvent({
      eventName: 'test_integration',
      eventData: {
        test: true,
        timestamp: new Date().toISOString(),
        environment: 'development',
      },
    });
    console.log('✅ Event tracking completed - check your Umami dashboard!');

    // Test page view tracking
    console.log('\n3. Testing page view tracking...');
    await analyticsService.trackPageView({
      url: 'https://clinic.com/test-page',
      referrer: 'https://clinic.com',
    });
    console.log('✅ Page view tracking completed - check your Umami dashboard!');

    // Test business events
    console.log('\n4. Testing business events...');
    await analyticsService.trackAuthEvent('login', 'test-user-123');
    await analyticsService.trackAppointmentEvent('created', 'appointment-123', 'clinic-456');
    console.log('✅ Business events completed - check your Umami dashboard!');

    console.log('\n🎉 All tests passed! Check your Umami dashboard for data.');
    console.log('\n📊 Dashboard URLs:');
    console.log('   - umami.is: https://umami.is/dashboard');
    console.log('   - Self-hosted: http://localhost:4000');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your environment variables');
    console.log('   2. Verify your Umami instance is running');
    console.log('   3. Check network connectivity');
  }
}

// Run the test
testRealUmami();
