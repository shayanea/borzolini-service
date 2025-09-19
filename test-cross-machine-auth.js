const axios = require('axios');

// Configuration for cross-machine testing
const API_BASE = 'http://192.168.70.174:3001/api/v1'\;
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // This is CRITICAL for cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

async function testCrossMachineAuth() {
  console.log('🧪 Testing Cross-Machine Cookie Authentication');
  console.log(`📍 API Server: ${API_BASE}`);
  console.log(`📧 Test Email: ${TEST_EMAIL}`);
  
  try {
    // Step 1: Test login and cookie setting
    console.log('\n1️⃣ Testing Login...');
    const loginResponse = await apiClient.post('/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Login successful!');
    console.log(`👤 User: ${loginResponse.data.user.email}`);
    
    // Check if cookies were set
    const setCookieHeader = loginResponse.headers['set-cookie'];
    if (setCookieHeader) {
      console.log('🍪 Cookies received:');
      setCookieHeader.forEach(cookie => {
        console.log(`   ${cookie.split(';')[0]}`);
      });
    } else {
      console.log('❌ No cookies received in response');
    }
    
    // Step 2: Test authenticated request
    console.log('\n2️⃣ Testing Authenticated Request...');
    const profileResponse = await apiClient.get('/auth/profile');
    
    console.log('✅ Authenticated request successful!');
    console.log(`👤 Profile: ${profileResponse.data.email}`);
    
    // Step 3: Test token refresh
    console.log('\n3️⃣ Testing Token Refresh...');
    const refreshResponse = await apiClient.post('/auth/refresh');
    
    console.log('✅ Token refresh successful!');
    console.log(`🔄 Message: ${refreshResponse.data.message}`);
    
    console.log('\n🎉 All tests passed! Cross-machine cookie authentication is working.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error(`📄 Status: ${error.response.status}`);
      console.error(`📄 Data:`, error.response.data);
      console.error(`🍪 Request cookies:`, error.config.headers?.Cookie || 'None');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused. Is the server running on 192.168.70.174:3001?');
    }
  }
}

// Run the test
testCrossMachineAuth();
