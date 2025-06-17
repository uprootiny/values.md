import 'dotenv/config';
import { db } from '../src/lib/db';

async function resetSchema() {
  try {
    console.log('Resetting schema for UUID support...');
    
    // Drop tables in correct order (reverse dependency order)
    await db.execute(`DROP TABLE IF EXISTS llm_responses CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS user_responses CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS dilemmas CASCADE;`);
    
    console.log('Dropped existing tables');
    console.log('Schema reset completed! Now run: npx drizzle-kit push');
  } catch (error) {
    console.error('Error resetting schema:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetSchema();
}