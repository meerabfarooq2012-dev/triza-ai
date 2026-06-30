/**
 * ============================================================
 *  TRIZA ENGINE — Type Definitions
 * ============================================================
 *
 *  TRIZA is a self-contained AI that learns facts (knowledge
 *  base) and then expresses them in its own voice — like a
 *  child who first memorises facts, then rephrases them to
 *  show understanding.
 *
 *  NO external LLM API is used for known topics.
 * ============================================================
 */

export type Intent =
  | 'factual_question'
  | 'how_to'
  | 'greeting'
  | 'smalltalk'
  | 'creative'
  | 'support'
  | 'identity'
  | 'meta'
  | 'learning'
  | 'celebrate'
  | 'skills';

export interface KnowledgeEntry {
  /** Unique kebab-case id, e.g. "photosynthesis-explained" */
  id: string;
  /** Regex patterns that trigger this entry (word-boundary, case-insensitive) */
  patterns: RegExp[];
  /** The intent category */
  intent: Intent;
  /** Topic domain, e.g. "science", "history" */
  topic: string;
  /**
   * The raw factual response. This is what TRIZA "learned".
   * The self-expression engine will wrap it in TRIZA's own voice.
   */
  response: () => string;
}

export interface TrizaResponse {
  /** The final text shown to the user (in TRIZA's own voice) */
  text: string;
  /** The raw knowledge that was matched (before self-expression) */
  rawKnowledge: string;
  /** Matched entry id (for Hebbian learning tracking) */
  matchedEntryId?: string;
  /** Topic domain of the matched entry */
  topicDomain?: string;
  /** Confidence 0-1 */
  confidence: number;
  /** Mood detected from the user message */
  mood: string;
  /** Detected intent */
  intent: Intent | string;
  /** Reasoning steps (for transparency) */
  steps: string[];
  /** Processing time in ms */
  processingTimeMs: number;
  /** Whether self-expression layer was applied */
  selfExpressed: boolean;
  /** Key topic words extracted (for Hebbian follow-up) */
  topicWords: string[];
}
