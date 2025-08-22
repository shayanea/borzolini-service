import { generateSwaggerDocs } from './generate-swagger';

/**
 * Test script to verify Swagger generation works correctly
 */
async function testSwaggerGeneration() {
  console.log('🧪 Testing Swagger documentation generation...');

  try {
    await generateSwaggerDocs();
    console.log('✅ Swagger generation test passed!');
  } catch (error) {
    console.error('❌ Swagger generation test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSwaggerGeneration();
}
