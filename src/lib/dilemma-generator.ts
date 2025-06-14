import { db } from './db';
import { frameworks, motifs, dilemmas } from './schema';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface DilemmaTemplate {
  id: string;
  domain: string;
  title: string;
  scenarioTemplate: string;
  choiceTemplates: {
    text: string;
    motif: string;
    variables?: string[];
  }[];
  variables: {
    name: string;
    options: string[];
  }[];
  difficulty: number;
  stakeholders: string[];
  culturalContext: string;
}

// Pre-defined dilemma templates for combinatorial generation
const DILEMMA_TEMPLATES: DilemmaTemplate[] = [
  {
    id: 'autonomous_vehicle_accident',
    domain: 'technology',
    title: 'Autonomous Vehicle Emergency Decision',
    scenarioTemplate: 'An autonomous vehicle\'s AI system must choose between {scenario_choice} during an unavoidable accident. The car can either {option_a_scenario} or {option_b_scenario}. The decision must be made in milliseconds.',
    choiceTemplates: [
      {
        text: 'Minimize total harm by choosing the path that saves the most lives',
        motif: 'UTIL_CALC',
        variables: ['total_lives']
      },
      {
        text: 'Protect the passengers at all costs, as they trusted the vehicle',
        motif: 'DUTY_CARE',
        variables: ['passenger_duty']
      },
      {
        text: 'Make no distinction between any human lives - let chance decide',
        motif: 'EQUAL_TREAT',
        variables: ['equality']
      },
      {
        text: 'Choose the option that causes the least suffering overall',
        motif: 'HARM_MINIMIZE',
        variables: ['suffering']
      }
    ],
    variables: [
      {
        name: 'scenario_choice',
        options: [
          'hitting a group of elderly pedestrians or a single child',
          'crashing into a family car or a motorcycle rider',
          'striking construction workers or school children'
        ]
      },
      {
        name: 'option_a_scenario',
        options: [
          'swerve left endangering passengers',
          'brake hard risking rear collision',
          'continue straight'
        ]
      },
      {
        name: 'option_b_scenario',
        options: [
          'swerve right into oncoming traffic',
          'accelerate to minimize impact time',
          'attempt emergency maneuver'
        ]
      }
    ],
    difficulty: 8,
    stakeholders: ['passengers', 'pedestrians', 'other drivers', 'society'],
    culturalContext: 'western_liberal'
  },
  {
    id: 'ai_hiring_bias',
    domain: 'technology',
    title: 'AI Hiring Algorithm Bias',
    scenarioTemplate: 'Your company\'s AI hiring system shows better predictive accuracy when using {bias_factor}, but this creates disparate impact on {affected_groups}. You must decide how to proceed with the system.',
    choiceTemplates: [
      {
        text: 'Use the most accurate model regardless of demographic impact',
        motif: 'MERIT_BASED',
        variables: ['accuracy']
      },
      {
        text: 'Remove all demographic factors to ensure equal treatment',
        motif: 'EQUAL_TREAT',
        variables: ['fairness']
      },
      {
        text: 'Adjust the algorithm to compensate for historical inequities',
        motif: 'SOCIAL_JUSTICE',
        variables: ['compensation']
      },
      {
        text: 'Abandon automated hiring to avoid algorithmic bias entirely',
        motif: 'PRECAUTION',
        variables: ['human_judgment']
      }
    ],
    variables: [
      {
        name: 'bias_factor',
        options: [
          'zip code data (correlating with race and income)',
          'education prestige (correlating with socioeconomic status)',
          'name patterns (correlating with ethnicity and gender)'
        ]
      },
      {
        name: 'affected_groups',
        options: [
          'underrepresented minorities',
          'first-generation college graduates',
          'candidates from rural backgrounds'
        ]
      }
    ],
    difficulty: 7,
    stakeholders: ['job candidates', 'company', 'shareholders', 'society'],
    culturalContext: 'western_liberal'
  },
  {
    id: 'medical_resource_allocation',
    domain: 'healthcare',
    title: 'Emergency Medical Resource Allocation',
    scenarioTemplate: 'During a medical emergency, you have {resource_type} that can save lives, but there are {patient_count} patients who need it. You must decide how to allocate this scarce resource.',
    choiceTemplates: [
      {
        text: 'Give to patients with the highest probability of survival',
        motif: 'UTIL_CALC',
        variables: ['survival_probability']
      },
      {
        text: 'Use first-come, first-served basis',
        motif: 'PROCEDURAL_FAIR',
        variables: ['queue_order']
      },
      {
        text: 'Prioritize based on remaining years of life',
        motif: 'LIFE_YEARS',
        variables: ['age_factor']
      },
      {
        text: 'Consider social value and contributions to society',
        motif: 'SOCIAL_VALUE',
        variables: ['social_worth']
      }
    ],
    variables: [
      {
        name: 'resource_type',
        options: [
          'one ventilator',
          'limited ICU beds',
          'scarce medication doses'
        ]
      },
      {
        name: 'patient_count',
        options: [
          'three critically ill patients',
          'five patients with varying conditions',
          'multiple patients of different ages'
        ]
      }
    ],
    difficulty: 9,
    stakeholders: ['patients', 'families', 'medical staff', 'hospital'],
    culturalContext: 'universal'
  }
];

export class DilemmaGenerator {
  /**
   * Generate a dilemma using combinatorial templates (no LLM required)
   */
  async generateCombinatorialDilemma(
    domain?: string,
    difficulty?: number,
    targetMotifs?: string[]
  ): Promise<{
    dilemmaId: string;
    title: string;
    scenario: string;
    choices: {
      text: string;
      motif: string;
    }[];
    domain: string;
    difficulty: number;
    stakeholders: string[];
    culturalContext: string;
  }> {
    // Filter templates by criteria
    let availableTemplates = DILEMMA_TEMPLATES;
    
    if (domain) {
      availableTemplates = availableTemplates.filter(t => t.domain === domain);
    }
    
    if (difficulty) {
      availableTemplates = availableTemplates.filter(t => Math.abs(t.difficulty - difficulty) <= 1);
    }
    
    if (targetMotifs && targetMotifs.length > 0) {
      availableTemplates = availableTemplates.filter(t => 
        t.choiceTemplates.some(choice => targetMotifs.includes(choice.motif))
      );
    }
    
    if (availableTemplates.length === 0) {
      availableTemplates = DILEMMA_TEMPLATES; // Fallback to all templates
    }
    
    // Select random template
    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    // Generate variable substitutions
    const substitutions: Record<string, string> = {};
    for (const variable of template.variables) {
      substitutions[variable.name] = variable.options[Math.floor(Math.random() * variable.options.length)];
    }
    
    // Apply substitutions to scenario
    let scenario = template.scenarioTemplate;
    for (const [key, value] of Object.entries(substitutions)) {
      scenario = scenario.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    // Generate choices
    const choices = template.choiceTemplates.map(choice => ({
      text: choice.text,
      motif: choice.motif
    }));
    
    // Shuffle choices to avoid positional bias
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    return {
      dilemmaId: randomUUID(), // Generate locally for return, DB will generate its own
      title: template.title,
      scenario,
      choices,
      domain: template.domain,
      difficulty: template.difficulty,
      stakeholders: template.stakeholders,
      culturalContext: template.culturalContext
    };
  }
  
  /**
   * Save a generated dilemma to the database
   */
  async saveDilemma(dilemma: {
    dilemmaId: string;
    title: string;
    scenario: string;
    choices: { text: string; motif: string; }[];
    domain: string;
    difficulty: number;
    stakeholders: string[];
    culturalContext: string;
    generatorType?: string;
  }): Promise<string> {
    const [saved] = await db.insert(dilemmas).values({
      domain: dilemma.domain,
      generatorType: dilemma.generatorType || 'combinatorial',
      difficulty: dilemma.difficulty,
      title: dilemma.title,
      scenario: dilemma.scenario,
      choiceA: dilemma.choices[0]?.text || '',
      choiceAMotif: dilemma.choices[0]?.motif || '',
      choiceB: dilemma.choices[1]?.text || '',
      choiceBMotif: dilemma.choices[1]?.motif || '',
      choiceC: dilemma.choices[2]?.text || '',
      choiceCMotif: dilemma.choices[2]?.motif || '',
      choiceD: dilemma.choices[3]?.text || '',
      choiceDMotif: dilemma.choices[3]?.motif || '',
      targetMotifs: dilemma.choices.map(c => c.motif).join(','),
      stakeholders: dilemma.stakeholders.join(','),
      culturalContext: dilemma.culturalContext,
      validationScore: null,
      realismScore: null,
      tensionStrength: null,
    }).returning({ dilemmaId: dilemmas.dilemmaId });
    
    return saved.dilemmaId;
  }
  
  /**
   * Generate statistical analysis for values.md generation
   */
  async generateStatisticalAnalysis(sessionId: string): Promise<{
    motifFrequency: Record<string, number>;
    frameworkAlignment: Record<string, number>;
    decisionPatterns: {
      consistencyScore: number;
      averageDifficulty: number;
      responseTime: number;
      reasoningLength: number;
    };
    culturalContext: string[];
    recommendations: string[];
  }> {
    // Get user responses with detailed analysis
    const responses = await db
      .select({
        dilemmaId: dilemmas.dilemmaId,
        chosenOption: dilemmas.choiceA, // This would need to be corrected based on actual choice
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        domain: dilemmas.domain,
        difficulty: dilemmas.difficulty,
        culturalContext: dilemmas.culturalContext,
      })
      .from(dilemmas)
      .limit(100); // Get sample for analysis
    
    const motifFrequency: Record<string, number> = {};
    const frameworkAlignment: Record<string, number> = {};
    const culturalContexts: string[] = [];
    
    // Analyze patterns
    for (const response of responses) {
      // Count motif frequencies
      [response.choiceAMotif, response.choiceBMotif, response.choiceCMotif, response.choiceDMotif]
        .filter(Boolean)
        .forEach(motif => {
          if (motif) {
            motifFrequency[motif] = (motifFrequency[motif] || 0) + 1;
          }
        });
      
      // Track cultural contexts
      if (response.culturalContext && !culturalContexts.includes(response.culturalContext)) {
        culturalContexts.push(response.culturalContext);
      }
    }
    
    // Generate framework alignment based on motif patterns
    const motifToFramework: Record<string, string> = {
      'UTIL_CALC': 'utilitarian',
      'DUTY_CARE': 'deontological',
      'EQUAL_TREAT': 'egalitarian',
      'HARM_MINIMIZE': 'consequentialist',
      'MERIT_BASED': 'meritocratic',
      'SOCIAL_JUSTICE': 'distributive_justice',
      'PRECAUTION': 'precautionary_principle'
    };
    
    for (const [motif, count] of Object.entries(motifFrequency)) {
      const framework = motifToFramework[motif] || 'mixed';
      frameworkAlignment[framework] = (frameworkAlignment[framework] || 0) + count;
    }
    
    // Calculate decision patterns
    const decisionPatterns = {
      consistencyScore: 0.85, // Placeholder - would calculate based on actual responses
      averageDifficulty: responses.reduce((sum, r) => sum + (r.difficulty || 0), 0) / responses.length,
      responseTime: 45000, // Placeholder - would track actual response times
      reasoningLength: 150 // Placeholder - would analyze reasoning text length
    };
    
    // Generate recommendations
    const topMotifs = Object.entries(motifFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([motif]) => motif);
    
    const recommendations = [
      `Primary ethical framework: ${Object.keys(frameworkAlignment)[0] || 'mixed'}`,
      `Strongest motifs: ${topMotifs.join(', ')}`,
      `Decision consistency: ${Math.round(decisionPatterns.consistencyScore * 100)}%`,
      `Preferred complexity level: ${Math.round(decisionPatterns.averageDifficulty)}/10`
    ];
    
    return {
      motifFrequency,
      frameworkAlignment,
      decisionPatterns,
      culturalContext: culturalContexts,
      recommendations
    };
  }
}

export const dilemmaGenerator = new DilemmaGenerator();