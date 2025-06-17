const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function emergencyTriage() {
  console.log('🚨 EMERGENCY TRIAGE - Finding motif ID mismatches\n');
  
  try {
    // Get all motif IDs actually in database
    const actualMotifs = await sql`SELECT motif_id, name FROM motifs ORDER BY motif_id`;
    console.log('✅ Actual motifs in database:');
    actualMotifs.forEach(m => console.log(`  ${m.motif_id} - ${m.name}`));
    
    // Find all motif references in dilemmas
    const referencedMotifs = await sql`
      SELECT DISTINCT choice_a_motif as motif FROM dilemmas WHERE choice_a_motif IS NOT NULL
      UNION
      SELECT DISTINCT choice_b_motif as motif FROM dilemmas WHERE choice_b_motif IS NOT NULL
      UNION  
      SELECT DISTINCT choice_c_motif as motif FROM dilemmas WHERE choice_c_motif IS NOT NULL
      UNION
      SELECT DISTINCT choice_d_motif as motif FROM dilemmas WHERE choice_d_motif IS NOT NULL
    `;
    
    console.log('\n🔍 Motifs referenced in dilemmas:');
    referencedMotifs.forEach(m => console.log(`  ${m.motif}`));
    
    // Find mismatches
    const actualMotifIds = new Set(actualMotifs.map(m => m.motif_id));
    const invalidRefs = referencedMotifs.filter(r => r.motif && !actualMotifIds.has(r.motif));
    
    console.log('\n❌ INVALID MOTIF REFERENCES:');
    invalidRefs.forEach(r => console.log(`  ${r.motif}`));
    
    console.log(`\n📊 Summary: ${invalidRefs.length} invalid references out of ${referencedMotifs.length} total`);
    
    if (invalidRefs.length > 0) {
      console.log('\n🔧 SUGGESTED MAPPING:');
      const mapping = {
        'UTIL_MAXIMIZE': 'UTIL_CALC',
        'EXPERT_DEFERENCE': 'AUTHORITY_DEFERENCE',
        'VIRT_CHARACTER': 'VIRTUE_CHARACTER',
        'CARE_PARTICULAR': 'CARE_CONTEXTUAL',
        'JUST_PROCEDURAL': 'JUSTICE_PROCEDURAL',
        'HARM_MINIMIZE': 'HARM_PREVENTION'
      };
      
      invalidRefs.forEach(r => {
        const suggestion = mapping[r.motif] || 'NEEDS_MANUAL_MAPPING';
        console.log(`  ${r.motif} → ${suggestion}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Triage failed:', error.message);
  }
}

emergencyTriage();