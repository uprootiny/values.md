import 'dotenv/config';
import { db } from '../src/lib/db';
import { dilemmas, userResponses, llmResponses } from '../src/lib/schema';

async function cleanupDatabase() {
  try {
    console.log('Cleaning up database...');
    
    // Delete all records that reference dilemmas
    await db.delete(llmResponses);
    console.log('Cleared LLM responses');
    
    await db.delete(userResponses);
    console.log('Cleared user responses');
    
    await db.delete(dilemmas);
    console.log('Cleared dilemmas');
    
    console.log('Database cleanup completed!');
  } catch (error) {
    console.error('Error cleaning up database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupDatabase();
}