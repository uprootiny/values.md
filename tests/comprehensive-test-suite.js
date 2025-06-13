#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Values.md Research Platform
 * 
 * Tests architectural integrity, ethical framework consistency,
 * and research methodology robustness in alignment with project VALUES.md
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ANSI color codes for expressive output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestReporter {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const colorMap = {
      info: colors.blue,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red,
      critical: colors.magenta
    };
    
    console.log(`${colors.bright}[${timestamp}]${colors.reset} ${colorMap[level] || ''}${message}${colors.reset}`);
  }

  test(name, testFn) {
    this.log(`🧪 ${name}`, 'info');
    try {
      const result = testFn();
      if (result) {
        this.log(`✅ ${name} - PASSED`, 'success');
        this.results.push({ name, status: 'passed', result });
        return true;
      } else {
        this.log(`❌ ${name} - FAILED`, 'error');
        this.results.push({ name, status: 'failed', result });
        return false;
      }
    } catch (error) {
      this.log(`💥 ${name} - ERROR: ${error.message}`, 'critical');
      this.results.push({ name, status: 'error', error: error.message });
      return false;
    }
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`📊 TEST SUITE SUMMARY`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');
    this.log(`Total Tests: ${total}`, 'info');
    this.log(`✅ Passed: ${passed}`, passed === total ? 'success' : 'info');
    this.log(`❌ Failed: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`💥 Errors: ${errors}`, errors > 0 ? 'critical' : 'info');
    this.log(`⏱️  Duration: ${duration}s`, 'info');
    
    if (passed === total) {
      this.log(`\n🎉 ALL TESTS PASSED - ARCHITECTURE HEALTHY`, 'success');
      return true;
    } else {
      this.log(`\n⚠️  ARCHITECTURE ISSUES DETECTED`, 'warning');
      this.results.filter(r => r.status !== 'passed').forEach(result => {
        this.log(`  • ${result.name}: ${result.error || 'Failed validation'}`, 'error');
      });
      return false;
    }
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
  } catch (error) {
    throw new Error(`Cannot read ${filePath}: ${error.message}`);
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// ============================================================================
// ARCHITECTURAL INTEGRITY TESTS
// ============================================================================

function testProjectStructure() {
  const requiredFiles = [
    'package.json',
    'src/lib/schema.ts',
    'src/lib/db.ts',
    'src/app/api/generate-values/route.ts',
    'src/store/dilemma-store.ts',
    'VALUES.md',
    'CLAUDE.md'
  ];

  const requiredDirs = [
    'src/app/api',
    'src/components',
    'drizzle',
    'scripts'
  ];

  for (const file of requiredFiles) {
    if (!fileExists(file)) {
      throw new Error(`Critical file missing: ${file}`);
    }
  }

  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(__dirname, '..', dir))) {
      throw new Error(`Critical directory missing: ${dir}`);
    }
  }

  return true;
}

function testDatabaseSchemaIntegrity() {
  const schema = readFile('src/lib/schema.ts');
  
  // Test for core tables
  const requiredTables = ['frameworks', 'motifs', 'dilemmas', 'userResponses'];
  for (const table of requiredTables) {
    if (!schema.includes(`export const ${table}`)) {
      throw new Error(`Database table missing: ${table}`);
    }
  }

  // Test for critical fields
  const criticalFields = [
    'perceivedDifficulty', // Recently added field
    'choiceAMotif', 'choiceBMotif', 'choiceCMotif', 'choiceDMotif', // Motif mapping
    'conflictsWith', 'synergiesWith', // Motif relationships
    'dilemmaId.*UUID' // UUID primary keys
  ];

  for (const field of criticalFields) {
    if (!schema.match(new RegExp(field, 'i'))) {
      throw new Error(`Critical schema field missing or malformed: ${field}`);
    }
  }

  return true;
}

function testAPIEndpointConsistency() {
  const responsesAPI = readFile('src/app/api/responses/route.ts');
  const valuesAPI = readFile('src/app/api/generate-values/route.ts');
  const dilemmasAPI = readFile('src/app/api/dilemmas/[uuid]/route.ts');

  // Test perceivedDifficulty consistency
  if (!responsesAPI.includes('perceivedDifficulty: response.perceivedDifficulty')) {
    throw new Error('Responses API missing perceivedDifficulty field');
  }

  if (!valuesAPI.includes('perceivedDifficulty: userResponses.perceivedDifficulty')) {
    throw new Error('Values API not reading perceivedDifficulty field');
  }

  // Test motif data flow
  if (!dilemmasAPI.includes('choiceAMotif') || !dilemmasAPI.includes('choiceBMotif')) {
    throw new Error('Dilemmas API not returning motif data');
  }

  if (!valuesAPI.includes('MotifAnalysis') || !valuesAPI.includes('conflictsWith')) {
    throw new Error('Values API missing enhanced motif analysis');
  }

  return true;
}

// ============================================================================
// ETHICAL FRAMEWORK TESTS
// ============================================================================

function testPrivacyFirstArchitecture() {
  const store = readFile('src/store/dilemma-store.ts');
  const responsesAPI = readFile('src/app/api/responses/route.ts');

  // Verify localStorage persistence (privacy-first)
  if (!store.includes('persist') || !store.includes('localStorage')) {
    throw new Error('Zustand store not using localStorage persistence');
  }

  // Verify no user tracking in responses API
  if (responsesAPI.includes('userId') || responsesAPI.includes('userEmail')) {
    throw new Error('Responses API violates privacy-first principle with user tracking');
  }

  // Verify sessionId anonymity
  if (!responsesAPI.includes('sessionId') || responsesAPI.includes('ip_address')) {
    throw new Error('Session handling not properly anonymized');
  }

  return true;
}

function testResearchMethodologicalRigor() {
  const valuesAPI = readFile('src/app/api/generate-values/route.ts');
  const schema = readFile('src/lib/schema.ts');

  // Test for statistical rigor
  const rigorousPatterns = [
    'weight.*parseFloat', // Weighted scoring
    'difficultyWeightedScores', // Complexity consideration
    'frameworkAlignment', // Multi-framework analysis
    'motifAnalysis.*sort', // Ranked analysis
    'consistencyScore' // Reliability metrics
  ];

  for (const pattern of rigorousPatterns) {
    if (!valuesAPI.match(new RegExp(pattern, 'i'))) {
      throw new Error(`Research rigor pattern missing: ${pattern}`);
    }
  }

  // Test for validation fields in schema
  if (!schema.includes('validationScore') || !schema.includes('realismScore')) {
    throw new Error('Database schema missing research validation fields');
  }

  return true;
}

function testTechnicalExcellenceStandards() {
  const packageJson = JSON.parse(readFile('package.json'));
  
  // Verify TypeScript usage
  if (!packageJson.devDependencies?.typescript) {
    throw new Error('TypeScript not configured for type safety');
  }

  // Verify database ORM usage
  if (!packageJson.dependencies?.['drizzle-orm']) {
    throw new Error('Type-safe database ORM not configured');
  }

  // Check for proper error handling in APIs
  const apis = [
    'src/app/api/responses/route.ts',
    'src/app/api/generate-values/route.ts',
    'src/app/api/dilemmas/[uuid]/route.ts'
  ];

  for (const apiFile of apis) {
    const content = readFile(apiFile);
    if (!content.includes('try {') || !content.includes('catch (error)')) {
      throw new Error(`API ${apiFile} missing proper error handling`);
    }
    if (!content.includes('console.error')) {
      throw new Error(`API ${apiFile} missing error logging`);
    }
  }

  return true;
}

// ============================================================================
// VALUES.md META-FRAMEWORK TESTS
// ============================================================================

function testProjectValuesMetaFramework() {
  const values = readFile('VALUES.md');

  // Test for meta-ethical self-application
  const requiredSections = [
    'Privacy-First Architecture',
    'Research Methodological Rigor',
    'Technical Excellence Through Documentation',
    'Meta-analysis of values.md system applied to itself'
  ];

  for (const section of requiredSections) {
    if (!values.includes(section)) {
      throw new Error(`VALUES.md missing required section: ${section}`);
    }
  }

  // Test for decision examples that reflect actual architectural choices
  if (!values.includes('Local storage with optional anonymous contribution')) {
    throw new Error('VALUES.md not reflecting actual privacy-first decisions');
  }

  if (!values.includes('sophisticated combinatorial analysis')) {
    throw new Error('VALUES.md not reflecting actual research methodology choices');
  }

  return true;
}

function testDocumentationCompleteness() {
  const claude = readFile('CLAUDE.md');
  
  // Test for comprehensive architecture documentation
  const requiredDocs = [
    'Database Schema Design',
    'API Routes Structure',
    'User Journey Implementation',
    'State Management Architecture',
    'Authentication Security'
  ];

  for (const doc of requiredDocs) {
    if (!claude.includes(doc)) {
      throw new Error(`CLAUDE.md missing critical documentation: ${doc}`);
    }
  }

  // Test for environment variable documentation
  if (!claude.includes('DATABASE_URL') || !claude.includes('OPENROUTER_API_KEY')) {
    throw new Error('CLAUDE.md missing environment variable documentation');
  }

  return true;
}

// ============================================================================
// DATA INTEGRITY TESTS
// ============================================================================

function testCSVDataIntegrity() {
  const csvFiles = [
    '_old_data/values.md-main/striated/frameworks.csv',
    '_old_data/values.md-main/striated/motifs.csv',
    '_old_data/dilemmas.csv'
  ];

  for (const csvFile of csvFiles) {
    if (!fileExists(csvFile)) {
      throw new Error(`Critical CSV data missing: ${csvFile}`);
    }
    
    const content = readFile(csvFile);
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error(`CSV file appears empty or malformed: ${csvFile}`);
    }
    
    // Verify header format
    const headers = lines[0].split(',');
    if (headers.length < 3) {
      throw new Error(`CSV file has insufficient columns: ${csvFile}`);
    }
  }

  return true;
}

function testMotifFrameworkConsistency() {
  if (!fileExists('_old_data/values.md-main/striated/motifs.csv')) {
    throw new Error('Cannot test motif consistency - CSV file missing');
  }

  const motifsCSV = readFile('_old_data/values.md-main/striated/motifs.csv');
  const valuesAPI = readFile('src/app/api/generate-values/route.ts');

  // Test that framework mapping in API matches motif categories in CSV
  const frameworkMapping = [
    ['consequentialism', 'UTIL_ACT'],
    ['deontology', 'DEONT_ABSOLUTE'],
    ['virtue', 'VIRTUE_ARISTOTELIAN'],
    ['care', 'CARE_ETHICS']
  ];

  for (const [category, framework] of frameworkMapping) {
    if (!motifsCSV.includes(category)) {
      throw new Error(`Motif category missing in CSV: ${category}`);
    }
    if (!valuesAPI.includes(framework)) {
      throw new Error(`Framework mapping missing in API: ${framework}`);
    }
  }

  return true;
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runComprehensiveTestSuite() {
  const reporter = new TestReporter();
  
  reporter.log('🚀 Starting Comprehensive Test Suite for Values.md Platform', 'info');
  reporter.log('Testing architectural integrity, ethical framework consistency, and research methodology robustness\n', 'info');

  // Architectural Integrity Tests
  reporter.log('🏗️  ARCHITECTURAL INTEGRITY TESTS', 'info');
  reporter.test('Project Structure Integrity', testProjectStructure);
  reporter.test('Database Schema Integrity', testDatabaseSchemaIntegrity);
  reporter.test('API Endpoint Consistency', testAPIEndpointConsistency);

  // Ethical Framework Tests  
  reporter.log('\n🛡️  ETHICAL FRAMEWORK COMPLIANCE TESTS', 'info');
  reporter.test('Privacy-First Architecture', testPrivacyFirstArchitecture);
  reporter.test('Research Methodological Rigor', testResearchMethodologicalRigor);
  reporter.test('Technical Excellence Standards', testTechnicalExcellenceStandards);

  // VALUES.md Meta-Framework Tests
  reporter.log('\n🔄 META-ETHICAL FRAMEWORK TESTS', 'info');
  reporter.test('Project VALUES.md Meta-Framework', testProjectValuesMetaFramework);
  reporter.test('Documentation Completeness', testDocumentationCompleteness);

  // Data Integrity Tests
  reporter.log('\n📊 DATA INTEGRITY TESTS', 'info');
  reporter.test('CSV Data Integrity', testCSVDataIntegrity);
  reporter.test('Motif-Framework Consistency', testMotifFrameworkConsistency);

  const success = reporter.summary();
  return success;
}

// Export for use in other test files
module.exports = {
  runComprehensiveTestSuite,
  TestReporter,
  testPrivacyFirstArchitecture,
  testResearchMethodologicalRigor,
  testTechnicalExcellenceStandards
};

// Run if called directly
if (require.main === module) {
  runComprehensiveTestSuite().then(success => {
    process.exit(success ? 0 : 1);
  });
}