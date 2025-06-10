import { NextRequest, NextResponse } from 'next/server';
import { openRouter } from '../../../../../lib/openrouter';
import { db } from '../../../../../lib/db';
import { dilemmas } from '../../../../../lib/schema';

function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!checkAdminAuth(request)) {
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

    // Generate dilemma using OpenRouter
    const generatedDilemma = await openRouter.generateDilemma(
      frameworks,
      motifs,
      domain,
      difficulty
    );

    // Create unique ID
    const dilemmaId = `DM${Date.now().toString().slice(-6)}`;

    // Save to database
    await db.insert(dilemmas).values({
      dilemmaId,
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
      culturalContext: 'western_liberal',
      validationScore: null,
      realismScore: null,
      tensionStrength: null,
    });

    return NextResponse.json({
      success: true,
      dilemmaId,
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