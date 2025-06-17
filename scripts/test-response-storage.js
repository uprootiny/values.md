const http = require('http');

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
          resolve({ 
            status: res.statusCode, 
            data: parsed, 
            rawData: data
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data, 
            rawData: data
          });
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

async function testResponseStorage() {
  console.log('🧪 TESTING RESPONSE STORAGE - Post-fix validation\n');
  
  try {
    // First, get a real dilemma UUID
    console.log('1. Getting random dilemma...');
    const randomResponse = await makeRequest('/api/dilemmas/random');
    
    if (randomResponse.status !== 302 && randomResponse.status !== 307) {
      throw new Error(`Random dilemma failed: ${randomResponse.status}`);
    }
    
    const location = randomResponse.headers?.location;
    if (!location) {
      throw new Error('No redirect location from random dilemma');
    }
    
    const uuid = location.split('/explore/')[1];
    console.log(`✅ Got dilemma UUID: ${uuid.substring(0, 8)}...`);
    
    // Test response storage with real UUID
    console.log('\n2. Testing response storage...');
    const testData = {
      sessionId: 'emergency-test-session',
      responses: [{
        dilemmaId: uuid,
        chosenOption: 'a',
        reasoning: 'Emergency test response after motif fix',
        responseTime: 5000,
        perceivedDifficulty: 7
      }]
    };
    
    const response = await makeRequest('/api/responses', {
      method: 'POST',
      body: testData
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, response.data);
    
    if (response.status === 200 && response.data.success) {
      console.log('🎉 RESPONSE STORAGE FIXED!');
      
      // Now test values generation
      console.log('\n3. Testing values generation...');
      const valuesResponse = await makeRequest('/api/generate-values', {
        method: 'POST',
        body: { sessionId: 'emergency-test-session' }
      });
      
      console.log(`Values generation status: ${valuesResponse.status}`);
      
      if (valuesResponse.status === 200) {
        console.log('🌟 VALUES GENERATION WORKING!');
        console.log('Sample values.md preview:');
        console.log(valuesResponse.data.valuesMarkdown?.substring(0, 300) + '...');
        
        console.log('\n🎯 END-TO-END USER JOURNEY: FUNCTIONAL');
        
      } else {
        console.log('⚠️  Values generation issue:', valuesResponse.data);
      }
      
    } else {
      console.log('❌ Response storage still broken:', response.data);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testResponseStorage();