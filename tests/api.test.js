// Basic API endpoint tests
const { spawn } = require('child_process');
const http = require('http');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testRandomDilemmaEndpoint() {
  console.log('🧪 Testing random dilemma endpoint...');
  
  try {
    const response = await makeRequest('/api/dilemmas/random');
    
    if (response.status === 302 || response.status === 307) {
      const location = response.headers.location;
      if (location && location.includes('/explore/')) {
        console.log('✅ Random dilemma redirects correctly');
        return true;
      }
    }
    
    console.log('❌ Random dilemma endpoint failed:', response.status);
    return false;
  } catch (error) {
    console.log('❌ Random dilemma test error:', error.message);
    return false;
  }
}

async function testResponsesAPI() {
  console.log('🧪 Testing responses API with perceivedDifficulty...');
  
  const testData = {
    sessionId: 'test-session-123',
    responses: [{
      dilemmaId: '123e4567-e89b-12d3-a456-426614174000',
      chosenOption: 'a',
      reasoning: 'Test reasoning',
      responseTime: 5000,
      perceivedDifficulty: 7
    }]
  };
  
  try {
    const response = await makeRequest('/api/responses', {
      method: 'POST',
      body: testData
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Responses API accepts perceivedDifficulty');
      return true;
    }
    
    console.log('❌ Responses API test failed:', response.status, response.data);
    return false;
  } catch (error) {
    console.log('❌ Responses API test error:', error.message);
    return false;
  }
}

async function testValuesGeneration() {
  console.log('🧪 Testing values generation API...');
  
  try {
    const response = await makeRequest('/api/generate-values', {
      method: 'POST',
      body: { sessionId: 'test-session-123' }
    });
    
    // Should return 404 for non-existent session, not 500 error
    if (response.status === 404) {
      console.log('✅ Values generation handles missing session correctly');
      return true;
    }
    
    console.log('❌ Values generation test failed:', response.status, response.data);
    return false;
  } catch (error) {
    console.log('❌ Values generation test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Wait for server to be ready
  await wait(2000);
  
  const results = await Promise.all([
    testRandomDilemmaEndpoint(),
    testResponsesAPI(),
    testValuesGeneration()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testRandomDilemmaEndpoint, testResponsesAPI, testValuesGeneration };