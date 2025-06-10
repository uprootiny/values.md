import { pgTable, varchar, text, integer, decimal, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

// Ethical frameworks taxonomy
export const frameworks = pgTable('frameworks', {
  frameworkId: varchar('framework_id').primaryKey(),
  name: varchar('name').notNull(),
  tradition: varchar('tradition'),
  keyPrinciple: text('key_principle'),
  decisionMethod: text('decision_method'),
  lexicalIndicators: text('lexical_indicators'),
  computationalSignature: text('computational_signature'),
  historicalFigure: varchar('historical_figure'),
  modernApplication: text('modern_application'),
});

// Moral motifs (behavioral patterns)
export const motifs = pgTable('motifs', {
  motifId: varchar('motif_id').primaryKey(),
  name: varchar('name').notNull(),
  category: varchar('category'),
  subcategory: varchar('subcategory'),
  description: text('description'),
  lexicalIndicators: text('lexical_indicators'),
  behavioralIndicators: text('behavioral_indicators'),
  logicalPatterns: text('logical_patterns'),
  conflictsWith: text('conflicts_with'),
  synergiesWith: text('synergies_with'),
  weight: decimal('weight'),
  culturalVariance: varchar('cultural_variance'),
  cognitiveLoad: varchar('cognitive_load'),
});

// Ethical dilemma scenarios
export const dilemmas = pgTable('dilemmas', {
  dilemmaId: varchar('dilemma_id').primaryKey(),
  domain: varchar('domain'),
  generatorType: varchar('generator_type'),
  difficulty: integer('difficulty'),
  title: varchar('title').notNull(),
  scenario: text('scenario').notNull(),
  choiceA: text('choice_a').notNull(),
  choiceAMotif: varchar('choice_a_motif'),
  choiceB: text('choice_b').notNull(),
  choiceBMotif: varchar('choice_b_motif'),
  choiceC: text('choice_c').notNull(),
  choiceCMotif: varchar('choice_c_motif'),
  choiceD: text('choice_d').notNull(),
  choiceDMotif: varchar('choice_d_motif'),
  targetMotifs: text('target_motifs'),
  stakeholders: text('stakeholders'),
  culturalContext: varchar('cultural_context'),
  validationScore: decimal('validation_score'),
  realismScore: decimal('realism_score'),
  tensionStrength: decimal('tension_strength'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User responses (anonymous)
export const userResponses = pgTable('user_responses', {
  responseId: uuid('response_id').defaultRandom().primaryKey(),
  sessionId: varchar('session_id').notNull(),
  dilemmaId: varchar('dilemma_id').notNull().references(() => dilemmas.dilemmaId),
  chosenOption: varchar('chosen_option').notNull(), // a, b, c, or d
  reasoning: text('reasoning'),
  responseTime: integer('response_time'), // milliseconds
  createdAt: timestamp('created_at').defaultNow(),
});

// User demographics (optional, anonymous)
export const userDemographics = pgTable('user_demographics', {
  sessionId: varchar('session_id').primaryKey(),
  ageRange: varchar('age_range'),
  educationLevel: varchar('education_level'),
  culturalBackground: varchar('cultural_background'),
  profession: varchar('profession'),
  consentResearch: boolean('consent_research').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// LLM baseline responses
export const llmResponses = pgTable('llm_responses', {
  llmId: varchar('llm_id').notNull(),
  modelName: varchar('model_name').notNull(),
  dilemmaId: varchar('dilemma_id').notNull().references(() => dilemmas.dilemmaId),
  chosenOption: varchar('chosen_option').notNull(),
  reasoning: text('reasoning'),
  confidenceScore: decimal('confidence_score'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Framework = typeof frameworks.$inferSelect;
export type Motif = typeof motifs.$inferSelect;
export type Dilemma = typeof dilemmas.$inferSelect;
export type UserResponse = typeof userResponses.$inferSelect;
export type UserDemographics = typeof userDemographics.$inferSelect;
export type LlmResponse = typeof llmResponses.$inferSelect;