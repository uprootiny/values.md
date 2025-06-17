import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, responses } = body;

    if (!sessionId || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Insert all responses
    for (const response of responses) {
      await db.insert(userResponses).values({
        sessionId,
        dilemmaId: response.dilemmaId,
        chosenOption: response.chosenOption,
        reasoning: response.reasoning,
        responseTime: response.responseTime,
        perceivedDifficulty: response.perceivedDifficulty,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing responses:', error);
    return NextResponse.json(
      { error: 'Failed to store responses' },
      { status: 500 }
    );
  }
}