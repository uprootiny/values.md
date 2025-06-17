import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
  try {
    const adminEmail = 'admin@values.md';
    const adminPassword = process.env.ADMIN_PASSWORD || 'hohoho';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Update admin user with hashed password
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, adminEmail));
    
    console.log('Admin password updated successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();