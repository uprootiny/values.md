#!/usr/bin/env node

/**
 * API Integration Validation Suite
 * 
 * Tests the complete API pipeline with real database data
 */

const http = require('http');
const { spawn } = require('child_process');

class APIValidator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.serverProcess = null;
  }

  async startServer() {
    console.log('🚀 Starting development server...');
    
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let output = '';
      this.serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Ready in')) {
          console.log('✅ Server started successfully');
          setTimeout(resolve, 2000); // Give it extra time to be ready
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Error:') && !error.includes('Warning:')) {
          reject(new Error(`Server startup error: ${error}`));
        }
      });

      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);
    });
  }

  stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('🛑 Server stopped');
    }
  }

  async makeRequest(path, options = {}) {
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
              headers: res.headers,
              rawData: data
            });
          } catch (e) {
            resolve({ 
              status: res.statusCode, 
              data: data, 
              headers: res.headers,
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

  async test(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      const result = await testFn();
      if (result.success) {
        console.log(`✅ ${name} - PASSED`);
        if (result.details) console.log(`   Details: ${result.details}`);
        this.results.push({ name, status: 'passed', details: result.details });
        return true;
      } else {
        console.log(`❌ ${name} - FAILED: ${result.error}`);
        this.results.push({ name, status: 'failed', error: result.error });
        return false;
      }
    } catch (error) {
      console.log(`💥 ${name} - ERROR: ${error.message}`);
      this.results.push({ name, status: 'error', error: error.message });
      return false;
    }
  }

  async testRandomDilemmaEndpoint() {
    const response = await this.makeRequest('/api/dilemmas/random');
    
    if (response.status === 302 || response.status === 307) {
      const location = response.headers.location;
      if (location && location.includes('/explore/')) {
        const uuid = location.split('/explore/')[1];
        return { 
          success: true, 
          details: `Redirects to UUID: ${uuid.substring(0, 8)}...`,
          uuid 
        };
      }
    }
    
    return { 
      success: false, 
      error: `Unexpected response: ${response.status} ${JSON.stringify(response.data)}` 
    };
  }

  async testDilemmaFetching() {
    // First get a random dilemma UUID
    const randomResult = await this.testRandomDilemmaEndpoint();
    if (!randomResult.success) {
      return { success: false, error: 'Cannot get random dilemma for testing' };
    }

    // Test fetching specific dilemma
    const uuid = randomResult.uuid;
    const response = await this.makeRequest(`/api/dilemmas/${uuid}`);
    
    if (response.status !== 200) {
      return { 
        success: false, 
        error: `Dilemma fetch failed: ${response.status} ${JSON.stringify(response.data)}` 
      };
    }

    const data = response.data;
    if (!data.dilemmas || !Array.isArray(data.dilemmas) || data.dilemmas.length !== 12) {
      return { 
        success: false, 
        error: `Invalid dilemma data structure: expected 12 dilemmas, got ${data.dilemmas?.length || 'none'}` 
      };
    }

    // Validate dilemma structure
    const firstDilemma = data.dilemmas[0];
    const requiredFields = ['dilemmaId', 'title', 'scenario', 'choiceA', 'choiceB', 'choiceC', 'choiceD'];
    const missingFields = requiredFields.filter(field => !firstDilemma[field]);
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: `Dilemma missing required fields: ${missingFields.join(', ')}` 
      };
    }

    // Check for motif data
    const motifFields = ['choiceAMotif', 'choiceBMotif', 'choiceCMotif', 'choiceDMotif'];
    const hasMotifs = motifFields.some(field => firstDilemma[field]);
    
    if (!hasMotifs) {
      return { 
        success: false, 
        error: 'Dilemma missing motif data for choices' 
      };
    }

    return { 
      success: true, 
      details: `12 dilemmas loaded, motif data present, starting with: "${firstDilemma.title}"` 
    };
  }

  async testResponsesAPI() {
    const testData = {
      sessionId: 'validation-test-session',
      responses: [{
        dilemmaId: '123e4567-e89b-12d3-a456-426614174000',
        chosenOption: 'a',
        reasoning: 'Test reasoning for validation',
        responseTime: 5000,
        perceivedDifficulty: 7
      }]
    };
    
    const response = await this.makeRequest('/api/responses', {
      method: 'POST',
      body: testData
    });
    
    if (response.status === 200 && response.data.success) {
      return { 
        success: true, 
        details: 'Accepts responses with perceivedDifficulty field' 
      };
    }
    
    return { 
      success: false, 
      error: `Response storage failed: ${response.status} ${JSON.stringify(response.data)}` 
    };
  }

  async testValuesGeneration() {
    const response = await this.makeRequest('/api/generate-values', {
      method: 'POST',
      body: { sessionId: 'validation-test-session' }
    });
    
    // Should return 404 for non-existent session (which is correct behavior)
    if (response.status === 404) {
      return { 
        success: true, 
        details: 'Correctly handles missing session with 404' 
      };
    }
    
    // If it returned 200, check the structure
    if (response.status === 200) {
      const data = response.data;
      if (data.valuesMarkdown && data.detailedAnalysis && data.frameworkAlignment) {
        return { 
          success: true, 
          details: 'Values generation API returns enhanced analysis structure' 
        };
      }
    }
    
    return { 
      success: false, 
      error: `Unexpected values generation response: ${response.status} ${JSON.stringify(response.data)}` 
    };
  }

  async testHealthEndpoint() {
    const response = await this.makeRequest('/');
    
    if (response.status === 200 && response.rawData.includes('values.md')) {
      return { 
        success: true, 
        details: 'Home page loads correctly' 
      };
    }
    
    return { 
      success: false, 
      error: `Home page failed: ${response.status}` 
    };
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 API VALIDATION SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    
    return passed === total;
  }
}

async function runAPIValidation() {
  const validator = new APIValidator();
  
  try {
    await validator.startServer();
    
    console.log('\n🧪 Running API Integration Tests...\n');
    
    await validator.test('Health Check (Home Page)', () => validator.testHealthEndpoint());
    await validator.test('Random Dilemma Endpoint', () => validator.testRandomDilemmaEndpoint());
    await validator.test('Dilemma Fetching Pipeline', () => validator.testDilemmaFetching());
    await validator.test('Response Storage API', () => validator.testResponsesAPI());
    await validator.test('Values Generation API', () => validator.testValuesGeneration());
    
    const success = validator.summary();
    
    validator.stopServer();
    return { success, results: validator.results };
    
  } catch (error) {
    console.error(`💥 Validation failed: ${error.message}`);
    validator.stopServer();
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  runAPIValidation().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { runAPIValidation };