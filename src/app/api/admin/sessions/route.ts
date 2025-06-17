import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { userResponses } from '@/lib/schema';
import { sql } from 'drizzle-orm';

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

    // Get available sessions with response counts
    const sessions = await db
      .select({
        sessionId: userResponses.sessionId,
        responseCount: sql<number>`count(*)`,
        lastResponse: sql<Date>`max(${userResponses.createdAt})`
      })
      .from(userResponses)
      .groupBy(userResponses.sessionId)
      .having(sql`count(*) >= 3`) // At least 3 responses to be useful
      .orderBy(sql`max(${userResponses.createdAt}) desc`);

    const sessionList = sessions.map(s => ({
      sessionId: s.sessionId,
      responseCount: s.responseCount,
      lastResponse: s.lastResponse,
      displayName: `${s.sessionId.slice(-8)} (${s.responseCount} responses)`
    }));

    return NextResponse.json({
      sessions: sessionList.map(s => s.sessionId),
      sessionDetails: sessionList
    });

  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}