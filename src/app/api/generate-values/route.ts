import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

interface MotifAnalysis {
  motifId: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  count: number;
  weight: number;
  conflictsWith: string[];
  synergiesWith: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get user responses with dilemma data
    const responses = await db
      .select({
        dilemmaId: userResponses.dilemmaId,
        chosenOption: userResponses.chosenOption,
        reasoning: userResponses.reasoning,
        perceivedDifficulty: userResponses.perceivedDifficulty,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        title: dilemmas.title,
        domain: dilemmas.domain,
        difficulty: dilemmas.difficulty,
        targetMotifs: dilemmas.targetMotifs,
        stakeholders: dilemmas.stakeholders,
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for session' },
        { status: 404 }
      );
    }

    // Enhanced motif analysis
    const motifCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    const difficultyWeightedScores: Record<string, number> = {};
    
    for (const response of responses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = response.choiceAMotif || ''; break;
        case 'b': chosenMotif = response.choiceBMotif || ''; break;
        case 'c': chosenMotif = response.choiceCMotif || ''; break;
        case 'd': chosenMotif = response.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
        
        // Weight by difficulty and perceived difficulty
        const difficultyWeight = (response.difficulty || 5) * (response.perceivedDifficulty || 5) / 25;
        difficultyWeightedScores[chosenMotif] = (difficultyWeightedScores[chosenMotif] || 0) + difficultyWeight;
        
        // Track domain preferences
        if (response.domain) {
          domainCounts[response.domain] = (domainCounts[response.domain] || 0) + 1;
        }
      }
    }

    // Get detailed motif information
    const allChosenMotifs = Object.keys(motifCounts);
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(inArray(motifs.motifId, allChosenMotifs));

    // Enhanced analysis with conflicts and synergies
    const motifAnalysis: MotifAnalysis[] = motifDetails.map(motif => ({
      motifId: motif.motifId,
      name: motif.name || '',
      category: motif.category || '',
      subcategory: motif.subcategory || '',
      description: motif.description || '',
      count: motifCounts[motif.motifId] || 0,
      weight: parseFloat(motif.weight || '0'),
      conflictsWith: (motif.conflictsWith || '').split(',').map(s => s.trim()).filter(Boolean),
      synergiesWith: (motif.synergiesWith || '').split(',').map(s => s.trim()).filter(Boolean),
    }));

    // Sort by weighted importance (count * weight * difficulty)
    motifAnalysis.sort((a, b) => {
      const scoreA = a.count * a.weight * (difficultyWeightedScores[a.motifId] || 1);
      const scoreB = b.count * b.weight * (difficultyWeightedScores[b.motifId] || 1);
      return scoreB - scoreA;
    });

    // Identify ethical framework alignment
    const frameworkAlignment = await identifyFrameworkAlignment(motifAnalysis);

    // Generate sophisticated values.md
    const valuesMarkdown = await generateAdvancedValuesMarkdown(
      motifAnalysis,
      responses,
      domainCounts,
      frameworkAlignment
    );

    return NextResponse.json({ 
      valuesMarkdown,
      motifAnalysis: motifCounts,
      detailedAnalysis: motifAnalysis,
      frameworkAlignment,
      domainPreferences: domainCounts
    });
  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

async function identifyFrameworkAlignment(motifAnalysis: MotifAnalysis[]) {
  // Map motifs to their parent frameworks
  const frameworkScores: Record<string, number> = {};
  
  for (const motif of motifAnalysis) {
    // Weight by frequency and inherent weight
    const score = motif.count * motif.weight;
    
    // Map common motif categories to frameworks
    switch (motif.category) {
      case 'consequentialism':
        frameworkScores['UTIL_ACT'] = (frameworkScores['UTIL_ACT'] || 0) + score;
        break;
      case 'deontology':
        frameworkScores['DEONT_ABSOLUTE'] = (frameworkScores['DEONT_ABSOLUTE'] || 0) + score;
        break;
      case 'virtue':
        frameworkScores['VIRTUE_ARISTOTELIAN'] = (frameworkScores['VIRTUE_ARISTOTELIAN'] || 0) + score;
        break;
      case 'care':
        frameworkScores['CARE_ETHICS'] = (frameworkScores['CARE_ETHICS'] || 0) + score;
        break;
      case 'rights':
        frameworkScores['RIGHTS_NATURAL'] = (frameworkScores['RIGHTS_NATURAL'] || 0) + score;
        break;
    }
  }

  return Object.entries(frameworkScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([framework, score]) => ({ framework, score }));
}

async function generateAdvancedValuesMarkdown(
  motifAnalysis: MotifAnalysis[],
  responses: any[],
  domainCounts: Record<string, number>,
  frameworkAlignment: any[]
): Promise<string> {
  const primaryMotif = motifAnalysis[0];
  const secondaryMotifs = motifAnalysis.slice(1, 4);
  const topDomains = Object.entries(domainCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Identify value conflicts
  const conflicts = primaryMotif?.conflictsWith || [];
  const synergies = primaryMotif?.synergiesWith || [];
  
  // Calculate consistency score
  const totalResponses = responses.length;
  const consistencyScore = Math.round((primaryMotif?.count || 0) / totalResponses * 100);

  return `# My Values

## Core Ethical Framework

Based on my responses to ${totalResponses} ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || 'Balanced reasoning'}** (${consistencyScore}% consistency).

${primaryMotif?.description || 'This reflects my core approach to moral reasoning.'}

### Framework Alignment

My ethical reasoning most closely aligns with:

${frameworkAlignment.map((fw, i) => 
  `${i + 1}. **${fw.framework.replace(/_/g, ' ')}** (strength: ${Math.round(fw.score)})`
).join('\n')}

## Decision-Making Patterns

### Primary Ethical Motifs

${motifAnalysis.slice(0, 5).map((motif, index) => 
  `${index + 1}. **${motif.name}** (${motif.count}/${totalResponses} responses)
   - *${motif.description}*
   - Category: ${motif.category}${motif.subcategory ? ` → ${motif.subcategory}` : ''}
   - Weight: ${motif.weight}`
).join('\n\n')}

### Domain Preferences

I show consistent ethical reasoning across domains:

${topDomains.map(([domain, count]) => 
  `- **${domain}**: ${count} responses (${Math.round(count/totalResponses*100)}%)`
).join('\n')}

## Ethical Tensions & Trade-offs

### Potential Conflicts

When my primary approach conflicts with:
${conflicts.length > 0 ? conflicts.map(c => `- ${c}`).join('\n') : '- No major conflicts identified in my value system'}

### Natural Synergies

My approach works well with:
${synergies.length > 0 ? synergies.map(s => `- ${s}`).join('\n') : '- My values show internal consistency'}

## Decision Examples

${responses.slice(0, 3).map((r, i) => {
  const chosenMotif = getChosenMotif(r);
  const motifDetail = motifAnalysis.find(m => m.motifId === chosenMotif);
  
  return `### Example ${i + 1}: ${r.title}
**Domain:** ${r.domain} | **Difficulty:** ${r.difficulty}/10 | **My Rating:** ${r.perceivedDifficulty}/10

**My Choice:** Option ${r.chosenOption.toUpperCase()}
**Ethical Framework:** ${motifDetail?.name || chosenMotif}
${r.reasoning ? `**Reasoning:** "${r.reasoning}"` : ''}

---`;
}).join('\n')}

## Instructions for AI Systems

When making decisions on my behalf, please:

### 1. Primary Ethical Framework
**Prioritize ${primaryMotif?.name || 'balanced reasoning'}**: ${primaryMotif?.description || 'Follow my demonstrated ethical patterns'}

### 2. Secondary Considerations
Consider these complementary approaches:
${secondaryMotifs.map(motif => 
  `- **${motif.name}**: Applied in ${Math.round(motif.count/totalResponses*100)}% of cases`
).join('\n')}

### 3. Domain-Specific Guidance
${topDomains.length > 0 ? `I show particular engagement with **${topDomains[0][0]}** decisions, where my reasoning is most developed.` : ''}

### 4. Conflict Resolution
When facing ethical tensions:
- **Default to**: ${primaryMotif?.name || 'my primary framework'}
- **Avoid approaches that**: ${conflicts.length > 0 ? conflicts.join(', ') : 'contradict my core values'}
- **Seek synergies with**: ${synergies.length > 0 ? synergies.join(', ') : 'complementary ethical approaches'}

### 5. Transparency Requirements
- Always explain which ethical framework guided the decision
- Highlight when trade-offs were necessary
- Flag decisions that might conflict with my secondary values
- Ask for guidance when facing novel dilemmas outside my demonstrated patterns

## Validation & Confidence

- **Response Consistency**: ${consistencyScore}%
- **Decision Confidence**: Based on ${totalResponses} dilemmas across ${Object.keys(domainCounts).length} domains
- **Value Stability**: ${primaryMotif ? 'Strong primary framework identified' : 'Balanced approach across multiple frameworks'}

---

*Generated from ethical dilemma responses | Updated: ${new Date().toISOString().split('T')[0]}*
*Ethical Framework: Combinatorial analysis of motif patterns and framework alignment*`;
}

function getChosenMotif(response: any): string {
  switch (response.chosenOption) {
    case 'a': return response.choiceAMotif || '';
    case 'b': return response.choiceBMotif || '';
    case 'c': return response.choiceCMotif || '';
    case 'd': return response.choiceDMotif || '';
    default: return '';
  }
}

function generateValuesMarkdown(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  responses: any[],
  primaryMotif: any
): string {
  return `# My Values

## Core Ethical Framework

Based on my responses to ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || topMotifs[0]}**.

${primaryMotif?.description || 'This reflects my core approach to moral reasoning.'}

## Decision-Making Patterns

### Primary Motifs (in order of preference):

${topMotifs.map((motif, index) => 
  `${index + 1}. **${motif}** (${motifCounts[motif]} responses)`
).join('\n')}

### Key Principles

When making decisions, I tend to:

${primaryMotif?.behavioralIndicators || 'Follow consistent ethical principles based on my moral framework.'}

## Reasoning Examples

${responses.slice(0, 3).map((r, i) => 
  `### Dilemma ${i + 1}: ${r.title}
- **Choice:** Option ${r.chosenOption.toUpperCase()}
${r.reasoning ? `- **Reasoning:** ${r.reasoning}` : ''}
`).join('\n')}

## Instructions for AI Systems

When making decisions on my behalf, please:

1. **Prioritize ${primaryMotif?.name || topMotifs[0]}** - ${primaryMotif?.logicalPatterns || 'Follow my primary ethical framework'}

2. **Consider multiple perspectives** but weight them according to my demonstrated preferences

3. **Be transparent** about the reasoning process and potential trade-offs

4. **Ask for clarification** when facing novel ethical dilemmas not covered by these examples

---

*Generated from responses to ${responses.length} ethical dilemmas*
*Last updated: ${new Date().toISOString().split('T')[0]}*`;
}