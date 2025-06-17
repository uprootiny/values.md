// Validate the code fixes we made
const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  return fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
}

function testPerceivedDifficultyFix() {
  console.log('🧪 Testing perceivedDifficulty field addition...');
  
  const responsesAPI = readFile('src/app/api/responses/route.ts');
  
  if (responsesAPI.includes('perceivedDifficulty: response.perceivedDifficulty')) {
    console.log('✅ perceivedDifficulty field added to responses API');
    return true;
  }
  
  console.log('❌ perceivedDifficulty field missing in responses API');
  return false;
}

function testUUIDFix() {
  console.log('🧪 Testing UUID generation fix in admin dilemma creation...');
  
  const adminAPI = readFile('src/app/api/admin/generate-dilemma/route.ts');
  
  if (adminAPI.includes('.returning({ dilemmaId: dilemmas.dilemmaId })')) {
    console.log('✅ UUID generation fixed with .returning() clause');
    return true;
  }
  
  console.log('❌ UUID generation still has issues');
  return false;
}

function testResultsPageUpdate() {
  console.log('🧪 Testing results page enhanced interface...');
  
  const resultsPage = readFile('src/app/results/page.tsx');
  
  if (resultsPage.includes('detailedAnalysis') && 
      resultsPage.includes('frameworkAlignment') &&
      resultsPage.includes('domainPreferences')) {
    console.log('✅ Results page updated with enhanced analysis interface');
    return true;
  }
  
  console.log('❌ Results page missing enhanced analysis interface');
  return false;
}

function testValuesGeneration() {
  console.log('🧪 Testing enhanced values generation algorithm...');
  
  const valuesAPI = readFile('src/app/api/generate-values/route.ts');
  
  if (valuesAPI.includes('MotifAnalysis') &&
      valuesAPI.includes('identifyFrameworkAlignment') &&
      valuesAPI.includes('generateAdvancedValuesMarkdown')) {
    console.log('✅ Enhanced values generation algorithm implemented');
    return true;
  }
  
  console.log('❌ Enhanced values generation algorithm missing');
  return false;
}

function testProjectValues() {
  console.log('🧪 Testing project VALUES.md existence...');
  
  try {
    const valuesContent = readFile('VALUES.md');
    
    if (valuesContent.includes('Privacy-First Architecture') &&
        valuesContent.includes('Research Methodological Rigor') &&
        valuesContent.includes('Meta-analysis of values.md system applied to itself')) {
      console.log('✅ Project VALUES.md created with meta-ethical framework');
      return true;
    }
  } catch (e) {
    console.log('❌ Project VALUES.md missing or incomplete');
    return false;
  }
  
  console.log('❌ Project VALUES.md missing required content');
  return false;
}

function runValidation() {
  console.log('🔍 Validating code fixes and enhancements...\n');
  
  const tests = [
    testPerceivedDifficultyFix,
    testUUIDFix,
    testResultsPageUpdate,
    testValuesGeneration,
    testProjectValues
  ];
  
  const results = tests.map(test => test());
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Validation Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All validations passed! Ready to commit.');
    return true;
  } else {
    console.log('⚠️  Some validations failed. Fix before committing.');
    return false;
  }
}

// Run validation
if (require.main === module) {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}

module.exports = { runValidation };