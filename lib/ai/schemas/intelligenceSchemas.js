import { z } from "zod";

export const TRUST_LEVELS = ["CONFIRMED", "REPORTED", "AI_ANALYSIS", "SCENARIO", "UNKNOWN"];
export const IMPACT_LEVELS = ["LOW", "MEDIUM", "HIGH", "VERY HIGH"];
export const CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW"];
export const DIFFICULTY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export const trustLabelSchema = z.object({
  level: z.enum(TRUST_LEVELS),
  text: z.string().min(1).max(2000),
});

export const understandSchema = z.object({
  whatHappened: z.string().min(1).max(1500),
  simpleExplanation: z.string().min(1).max(1000),
  whyItMatters: z.string().min(1).max(1500),
  keyFacts: z.array(z.string().min(1).max(500)).min(1).max(8),
  whatChanged: z.string().max(1500).optional().nullable(),
  unknowns: z.array(z.string().min(1).max(500)).max(8),
  affectedGroups: z.array(
    z.object({
      group: z.string().min(1).max(100),
      explanation: z.string().min(1).max(500),
    }),
  ).max(10),
  trustLabels: z.array(trustLabelSchema).optional(),
});

export const impactItemSchema = z.object({
  group: z.string().min(1).max(100),
  level: z.enum(IMPACT_LEVELS),
  explanation: z.string().min(1).max(800),
  reason: z.string().min(1).max(800),
  score: z.number().int().min(1).max(10),
});

export const impactSchema = z.object({
  impacts: z.array(impactItemSchema).min(1).max(12),
  summary: z.string().max(1000).optional(),
  disclaimer: z.string().max(500).optional(),
});

export const connectionSchema = z.object({
  connections: z.array(
    z.object({
      articleId: z.string().optional().nullable(),
      title: z.string().min(1).max(500),
      relationshipType: z.string().min(1).max(100),
      confidence: z.enum(CONFIDENCE_LEVELS),
      explanation: z.string().min(1).max(800),
    }),
  ).max(10),
  connectionChain: z.array(z.string().min(1).max(200)).max(12).optional(),
});

export const learningConceptSchema = z.object({
  name: z.string().min(1).max(200),
  explanation: z.string().min(1).max(800),
  difficulty: z.enum(DIFFICULTY_LEVELS),
  relevance: z.string().min(1).max(500),
  exercise: z.string().max(800).optional().nullable(),
});

export const learningSchema = z.object({
  concepts: z.array(learningConceptSchema).min(1).max(8),
  learningOrder: z.array(z.string().min(1).max(200)).min(1).max(8),
  whyLearn: z.string().min(1).max(1000),
  practicalTask: z.string().min(1).max(1000),
  estimatedMinutes: z.number().int().min(5).max(120).optional(),
});

export const scenarioSchema = z.object({
  scenario: z.string().min(1).max(500),
  question: z.string().min(1).max(500),
  immediateEffects: z.array(z.string().min(1).max(500)).max(8),
  secondaryEffects: z.array(z.string().min(1).max(500)).max(8),
  longTermPossibilities: z.array(z.string().min(1).max(500)).max(8),
  affectedGroups: z.array(
    z.object({
      group: z.string().min(1).max(100),
      explanation: z.string().min(1).max(500),
    }),
  ).max(10),
  confidence: z.enum(CONFIDENCE_LEVELS),
  supportingEvidence: z.array(z.string().min(1).max(500)).max(8),
  uncertainties: z.array(z.string().min(1).max(500)).max(8),
  invalidators: z.array(z.string().min(1).max(500)).max(6).optional(),
  impactChain: z.array(z.string().min(1).max(200)).max(12).optional(),
});

export const missedReasonSchema = z.object({
  articleId: z.string(),
  reason: z.string().min(1).max(800),
  relevanceScore: z.number().min(0).max(1).optional(),
});

export const discoverSchema = z.object({
  items: z.array(missedReasonSchema).max(10),
});

export default understandSchema;
