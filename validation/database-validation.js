#!/usr/bin/env node

/**
 * Database Integrity Validation Suite
 * 
 * Validates database seeding, schema consistency, and API data flow
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

class ValidationReporter {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async test(name, testFn) {
    console.log(`🔍 Testing: ${name}`);
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

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 DATABASE VALIDATION SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    
    return passed === total;
  }
}

async function validateFrameworksTable() {
  const result = await sql`SELECT COUNT(*) as count, 
    COUNT(DISTINCT framework_id) as unique_ids,
    COUNT(DISTINCT name) as unique_names
    FROM frameworks`;
  
  const count = parseInt(result[0].count);
  const uniqueIds = parseInt(result[0].unique_ids);
  const uniqueNames = parseInt(result[0].unique_names);
  
  if (count === 0) {
    return { success: false, error: 'No frameworks found in database' };
  }
  
  if (count !== uniqueIds) {
    return { success: false, error: `Duplicate framework IDs detected: ${count} rows, ${uniqueIds} unique IDs` };
  }
  
  // Sample a few key frameworks
  const samples = await sql`SELECT framework_id, name FROM frameworks WHERE framework_id IN ('UTIL_ACT', 'DEONT_KANT', 'VIRTUE_ARISTOTELIAN') ORDER BY framework_id`;
  
  if (samples.length < 3) {
    return { success: false, error: 'Missing key ethical frameworks' };
  }
  
  return { 
    success: true, 
    details: `${count} frameworks loaded, ${uniqueNames} unique names, key frameworks present` 
  };
}

async function validateMotifsTable() {
  const result = await sql`SELECT COUNT(*) as count,
    COUNT(CASE WHEN weight IS NOT NULL THEN 1 END) as with_weights,
    COUNT(CASE WHEN conflicts_with IS NOT NULL AND conflicts_with != '' THEN 1 END) as with_conflicts
    FROM motifs`;
  
  const count = parseInt(result[0].count);
  const withWeights = parseInt(result[0].with_weights);
  const withConflicts = parseInt(result[0].with_conflicts);
  
  if (count === 0) {
    return { success: false, error: 'No motifs found in database' };
  }
  
  // Test motif categories
  const categories = await sql`SELECT DISTINCT category FROM motifs WHERE category IS NOT NULL`;
  const expectedCategories = ['consequentialism', 'deontological', 'virtue', 'care'];
  const foundCategories = categories.map(r => r.category);
  
  const missingCategories = expectedCategories.filter(cat => !foundCategories.includes(cat));
  if (missingCategories.length > 0) {
    return { success: false, error: `Missing motif categories: ${missingCategories.join(', ')}` };
  }
  
  return { 
    success: true, 
    details: `${count} motifs loaded, ${withWeights} with weights, ${withConflicts} with conflicts, all categories present` 
  };
}

async function validateDilemmasTable() {
  const result = await sql`SELECT COUNT(*) as count,
    COUNT(CASE WHEN choice_a_motif IS NOT NULL THEN 1 END) as with_motifs,
    COUNT(DISTINCT domain) as domains,
    AVG(difficulty) as avg_difficulty
    FROM dilemmas`;
  
  const count = parseInt(result[0].count);
  const withMotifs = parseInt(result[0].with_motifs);
  const domains = parseInt(result[0].domains);
  const avgDifficulty = parseFloat(result[0].avg_difficulty);
  
  if (count === 0) {
    return { success: false, error: 'No dilemmas found in database' };
  }
  
  if (withMotifs / count < 0.8) {
    return { success: false, error: `Too many dilemmas missing motif data: ${withMotifs}/${count}` };
  }
  
  if (domains < 3) {
    return { success: false, error: `Insufficient domain diversity: only ${domains} domains` };
  }
  
  // Test UUID format
  const uuidTest = await sql`SELECT dilemma_id FROM dilemmas LIMIT 1`;
  const sampleUUID = uuidTest[0].dilemma_id;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(sampleUUID)) {
    return { success: false, error: `Invalid UUID format: ${sampleUUID}` };
  }
  
  return { 
    success: true, 
    details: `${count} dilemmas loaded, ${withMotifs} with motifs, ${domains} domains, avg difficulty ${avgDifficulty.toFixed(1)}` 
  };
}

async function validateMotifFrameworkConsistency() {
  // Check that motifs reference valid framework categories
  const motifCategories = await sql`SELECT DISTINCT category FROM motifs WHERE category IS NOT NULL`;
  const frameworkTraditions = await sql`SELECT DISTINCT tradition FROM frameworks WHERE tradition IS NOT NULL`;
  
  const motifCats = motifCategories.map(r => r.category);
  const frameworkTrads = frameworkTraditions.map(r => r.tradition);
  
  // Check overlap
  const overlap = motifCats.filter(cat => frameworkTrads.includes(cat));
  
  if (overlap.length < 3) {
    return { success: false, error: `Insufficient motif-framework alignment: only ${overlap.length} overlapping categories` };
  }
  
  // Check specific motif-framework relationships
  const utilMotifs = await sql`SELECT COUNT(*) as count FROM motifs WHERE category = 'consequentialism'`;
  const utilFrameworks = await sql`SELECT COUNT(*) as count FROM frameworks WHERE tradition = 'consequentialism'`;
  
  if (parseInt(utilMotifs[0].count) === 0 || parseInt(utilFrameworks[0].count) === 0) {
    return { success: false, error: 'Missing utilitarian motifs or frameworks' };
  }
  
  return { 
    success: true, 
    details: `${overlap.length} overlapping categories, motif-framework consistency validated` 
  };
}

async function validateDilemmaMotifReferences() {
  // Check that dilemma motifs reference valid motif IDs
  const dilemmaMotifs = await sql`
    SELECT choice_a_motif as motif FROM dilemmas WHERE choice_a_motif IS NOT NULL
    UNION
    SELECT choice_b_motif as motif FROM dilemmas WHERE choice_b_motif IS NOT NULL
    UNION  
    SELECT choice_c_motif as motif FROM dilemmas WHERE choice_c_motif IS NOT NULL
    UNION
    SELECT choice_d_motif as motif FROM dilemmas WHERE choice_d_motif IS NOT NULL
  `;
  
  const validMotifs = await sql`SELECT motif_id FROM motifs`;
  const validMotifIds = new Set(validMotifs.map(r => r.motif_id));
  
  const invalidReferences = dilemmaMotifs.filter(r => r.motif && !validMotifIds.has(r.motif));
  
  if (invalidReferences.length > 0) {
    return { 
      success: false, 
      error: `Invalid motif references in dilemmas: ${invalidReferences.slice(0, 3).map(r => r.motif).join(', ')}${invalidReferences.length > 3 ? '...' : ''}` 
    };
  }
  
  const totalReferences = dilemmaMotifs.length;
  const validReferences = dilemmaMotifs.filter(r => r.motif && validMotifIds.has(r.motif)).length;
  
  return { 
    success: true, 
    details: `${validReferences}/${totalReferences} dilemma motif references are valid` 
  };
}

async function validateTableRelationships() {
  // Test foreign key relationships
  try {
    // This should work if relationships are properly set up
    const joinTest = await sql`
      SELECT d.title, m.name as motif_name 
      FROM dilemmas d 
      LEFT JOIN motifs m ON d.choice_a_motif = m.motif_id 
      WHERE d.choice_a_motif IS NOT NULL 
      LIMIT 5
    `;
    
    if (joinTest.length === 0) {
      return { success: false, error: 'No dilemma-motif joins possible' };
    }
    
    const withValidMotifs = joinTest.filter(r => r.motif_name !== null).length;
    
    if (withValidMotifs / joinTest.length < 0.8) {
      return { success: false, error: `Too many broken motif references: ${withValidMotifs}/${joinTest.length}` };
    }
    
    return { 
      success: true, 
      details: `Table relationships functional, ${withValidMotifs}/${joinTest.length} motif joins successful` 
    };
  } catch (error) {
    return { success: false, error: `Relationship test failed: ${error.message}` };
  }
}

async function runDatabaseValidation() {
  console.log('🚀 Starting Database Integrity Validation\n');
  
  const reporter = new ValidationReporter();
  
  await reporter.test('Frameworks Table Integrity', validateFrameworksTable);
  await reporter.test('Motifs Table Integrity', validateMotifsTable);
  await reporter.test('Dilemmas Table Integrity', validateDilemmasTable);
  await reporter.test('Motif-Framework Consistency', validateMotifFrameworkConsistency);
  await reporter.test('Dilemma-Motif References', validateDilemmaMotifReferences);
  await reporter.test('Table Relationships', validateTableRelationships);
  
  const success = reporter.summary();
  return { success, results: reporter.results };
}

if (require.main === module) {
  runDatabaseValidation().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { runDatabaseValidation };