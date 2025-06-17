import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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
      frameworks = ['UTIL_CALC', 'DEONT_ABSOLUTE'], 
      motifs = ['UTIL_CALC', 'HARM_MINIMIZE'], 
      domain = 'technology',
      difficulty = 7 
    } = body;

    // Get existing dilemmas to avoid duplication
    const existingDilemmas = await db
      .select({ title: dilemmas.title })
      .from(dilemmas)
      .where(eq(dilemmas.domain, domain))
      .limit(20);

    // Generate dilemma using improved OpenRouter
    const generatedDilemma = await openRouter.generateDilemma(
      frameworks,
      motifs,
      domain,
      difficulty,
      existingDilemmas.map(d => d.title)
    );

    // Save to database with enhanced metadata (let DB generate UUID)
    const [savedDilemma] = await db.insert(dilemmas).values({
      domain,
      generatorType: 'ai_generated',
      difficulty,
      title: generatedDilemma.title,
      scenario: generatedDilemma.scenario,
      choiceA: generatedDilemma.choices[0]?.text || '',
      choiceAMotif: generatedDilemma.choices[0]?.motif || '',
      choiceB: generatedDilemma.choices[1]?.text || '',
      choiceBMotif: generatedDilemma.choices[1]?.motif || '',
      choiceC: generatedDilemma.choices[2]?.text || '',
      choiceCMotif: generatedDilemma.choices[2]?.motif || '',
      choiceD: generatedDilemma.choices[3]?.text || '',
      choiceDMotif: generatedDilemma.choices[3]?.motif || '',
      targetMotifs: motifs.join(','),
      stakeholders: generatedDilemma.stakeholders.join(','),
      culturalContext: generatedDilemma.culturalContext,
      validationScore: null,
      realismScore: null,
      tensionStrength: generatedDilemma.tensionStrength.toString(),
    }).returning({ dilemmaId: dilemmas.dilemmaId });

    return NextResponse.json({
      success: true,
      dilemmaId: savedDilemma.dilemmaId,
      dilemma: generatedDilemma
    });
  } catch (error) {
    console.error('Error generating dilemma:', error);
    return NextResponse.json(
      { error: 'Failed to generate dilemma' },
      { status: 500 }
    );
  }
}