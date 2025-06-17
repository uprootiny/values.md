import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get the admin user from database
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id!))
      .limit(1);

    if (adminUser.length === 0 || !adminUser[0].password) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 400 }
      );
    }

    // Verify current password against database
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser[0].password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update the password in database
    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, session.user.id!));

    return NextResponse.json({
      message: 'Password changed successfully!'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}