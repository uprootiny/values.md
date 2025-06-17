const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixMotifReferences() {
  console.log('🔧 FIXING MOTIF REFERENCES - Emergency repair\n');
  
  try {
    // Fix UTIL_MAXIMIZE -> UTIL_CALC
    console.log('Fixing UTIL_MAXIMIZE → UTIL_CALC...');
    
    const utilMaxFixes = await sql`
      UPDATE dilemmas 
      SET choice_a_motif = 'UTIL_CALC' 
      WHERE choice_a_motif = 'UTIL_MAXIMIZE'
    `;
    
    await sql`
      UPDATE dilemmas 
      SET choice_b_motif = 'UTIL_CALC' 
      WHERE choice_b_motif = 'UTIL_MAXIMIZE'
    `;
    
    await sql`
      UPDATE dilemmas 
      SET choice_c_motif = 'UTIL_CALC' 
      WHERE choice_c_motif = 'UTIL_MAXIMIZE'
    `;
    
    await sql`
      UPDATE dilemmas 
      SET choice_d_motif = 'UTIL_CALC' 
      WHERE choice_d_motif = 'UTIL_MAXIMIZE'
    `;
    
    console.log('✅ UTIL_MAXIMIZE fixed');
    
    // For EXPERT_DEFERENCE, let's use a reasonable fallback since AUTHORITY_DEFERENCE doesn't exist
    // Check what authority-related motifs we have
    const authorityMotifs = await sql`
      SELECT motif_id, name FROM motifs 
      WHERE name ILIKE '%authority%' OR name ILIKE '%expert%' OR name ILIKE '%defer%'
    `;
    
    console.log('Authority-related motifs found:', authorityMotifs);
    
    // Use COMMUNITY_TRADITION as a reasonable fallback for expert deference
    console.log('Fixing EXPERT_DEFERENCE → COMMUNITY_TRADITION...');
    
    await sql`
      UPDATE dilemmas 
      SET choice_a_motif = 'COMMUNITY_TRADITION' 
      WHERE choice_a_motif = 'EXPERT_DEFERENCE'
    `;
    
    await sql`
      UPDATE dilemmas 
      SET choice_b_motif = 'COMMUNITY_TRADITION' 
      WHERE choice_b_motif = 'EXPERT_DEFERENCE'
    `;
    
    await sql`
      UPDATE dilemmas 
      SET choice_c_motif = 'COMMUNITY_TRADITION' 
      WHERE choice_c_motif = 'EXPERT_DEFERENCE'
    `;
    
    await sql`
      UPDATE dilemmas 
      SET choice_d_motif = 'COMMUNITY_TRADITION' 
      WHERE choice_d_motif = 'EXPERT_DEFERENCE'
    `;
    
    console.log('✅ EXPERT_DEFERENCE fixed');
    
    // Verify the fix
    console.log('\n🔍 Verification check...');
    const remainingInvalid = await sql`
      SELECT DISTINCT choice_a_motif as motif FROM dilemmas 
      WHERE choice_a_motif NOT IN (SELECT motif_id FROM motifs) 
      AND choice_a_motif IS NOT NULL
      UNION
      SELECT DISTINCT choice_b_motif as motif FROM dilemmas 
      WHERE choice_b_motif NOT IN (SELECT motif_id FROM motifs) 
      AND choice_b_motif IS NOT NULL
      UNION  
      SELECT DISTINCT choice_c_motif as motif FROM dilemmas 
      WHERE choice_c_motif NOT IN (SELECT motif_id FROM motifs) 
      AND choice_c_motif IS NOT NULL
      UNION
      SELECT DISTINCT choice_d_motif as motif FROM dilemmas 
      WHERE choice_d_motif NOT IN (SELECT motif_id FROM motifs) 
      AND choice_d_motif IS NOT NULL
    `;
    
    if (remainingInvalid.length === 0) {
      console.log('🎉 ALL MOTIF REFERENCES FIXED!');
      console.log('\n📋 Ready for response storage test...');
    } else {
      console.log('⚠️  Remaining invalid references:');
      remainingInvalid.forEach(r => console.log(`  ${r.motif}`));
    }
    
  } catch (error) {
    console.error('💥 Fix failed:', error.message);
  }
}

fixMotifReferences();