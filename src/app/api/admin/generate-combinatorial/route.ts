import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { dilemmaGenerator } from '@/lib/dilemma-generator';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      domain,
      difficulty,
      targetMotifs = [],
      count = 1
    } = body;

    const generatedDilemmas = [];

    // Generate multiple dilemmas if requested
    for (let i = 0; i < Math.min(count, 10); i++) { // Limit to 10 at once
      const dilemma = await dilemmaGenerator.generateCombinatorialDilemma(
        domain,
        difficulty,
        targetMotifs
      );

      // Save to database
      const savedId = await dilemmaGenerator.saveDilemma({
        ...dilemma,
        generatorType: 'combinatorial'
      });

      generatedDilemmas.push({
        ...dilemma,
        dilemmaId: savedId // Use the actual saved ID
      });
    }

    return NextResponse.json({
      success: true,
      count: generatedDilemmas.length,
      dilemmas: generatedDilemmas
    });
  } catch (error) {
    console.error('Error generating combinatorial dilemmas:', error);
    return NextResponse.json(
      { error: 'Failed to generate dilemmas' },
      { status: 500 }
    );
  }
}