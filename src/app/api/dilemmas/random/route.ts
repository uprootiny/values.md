import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get 12 random dilemmas with diverse characteristics
    const randomDilemmas = await db
      .select()
      .from(dilemmas)
      .orderBy(sql`RANDOM()`)
      .limit(12);

    return NextResponse.json({ dilemmas: randomDilemmas });
  } catch (error) {
    console.error('Error fetching random dilemmas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dilemmas' },
      { status: 500 }
    );
  }
}