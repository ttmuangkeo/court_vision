const axios = require('axios');

async function testProfileSetup() {
  console.log('🧪 Testing Profile Setup...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Server is running:', healthResponse.data.message);

    // Test 2: Check if profile endpoint exists
    console.log('\n2. Testing profile endpoint...');
    try {
      await axios.get('http://localhost:3000/api/auth/profile');
      console.log('✅ Profile endpoint exists');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Profile endpoint exists (requires auth)');
      } else {
        console.log('❌ Profile endpoint not found');
      }
    }

    // Test 3: Check if teams endpoint works
    console.log('\n3. Testing teams endpoint...');
    const teamsResponse = await axios.get('http://localhost:3000/api/teams');
    console.log(`✅ Teams endpoint works (${teamsResponse.data.length} teams found)`);

    // Test 4: Check if players endpoint works
    console.log('\n4. Testing players endpoint...');
    const playersResponse = await axios.get('http://localhost:3000/api/players');
    console.log(`✅ Players endpoint works (${playersResponse.data.length} players found)`);

    console.log('\n🎉 Profile setup test completed successfully!');
    console.log('\n📋 What you can do now:');
    console.log('1. Start the frontend: cd frontend && npm start');
    console.log('2. Sign up/login to access the profile page');
    console.log('3. Visit /profile to manage your preferences');
    console.log('4. Visit /dashboard to see your personalized dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running: node server.js');
    console.log('2. Check if port 3000 is available');
    console.log('3. Verify database connection');
  }
}

testProfileSetup(); 