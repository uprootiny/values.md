import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for environment variables
    const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;

    return NextResponse.json({
      hasOpenRouterKey,
      hasDatabaseUrl,
      hasNextAuthSecret,
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Error checking environment:', error);
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    );
  }
}