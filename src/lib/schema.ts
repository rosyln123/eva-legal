import { z } from "zod";

export const SeverityEnum = z.enum([
  "minimal",
  "low",
  "moderate",
  "high",
  "critical",
]);
export type Severity = z.infer<typeof SeverityEnum>;

export const ConfidenceEnum = z.enum([
  "very high",
  "high",
  "moderate",
  "low",
  "very low",
]);
export type Confidence = z.infer<typeof ConfidenceEnum>;

export const AnalysisItemSchema = z.object({
  issue: z.string(),
  jurisdiction: z.string(),
  discussion: z.string(),
});
export type AnalysisItem = z.infer<typeof AnalysisItemSchema>;

export const RiskItemSchema = z.object({
  type: z.string(),
  severity: SeverityEnum,
  justification: z.string(),
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

export const EvaResponseSchema = z.object({
  needsClarification: z.boolean(),
  clarifyingQuestions: z.array(z.string()).default([]),
  jurisdictions: z.array(z.string()).default([]),
  summary: z.string().default(""),
  legalContext: z.string().default(""),
  legalDomains: z.array(z.string()).default([]),
  analysis: z.array(AnalysisItemSchema).default([]),
  risks: z.array(RiskItemSchema).default([]),
  uncertainties: z.array(z.string()).default([]),
  options: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  confidence: ConfidenceEnum,
  confidenceRationale: z.string().default(""),
  disclaimer: z.string().default(""),
});
export type EvaResponse = z.infer<typeof EvaResponseSchema>;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Present on assistant messages that parsed into a structured EVA response. */
  structured?: EvaResponse;
}
