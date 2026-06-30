/**
 * ============================================================
 *  TRIZA SELF-EXPRESSION ENGINE (v3 — English-first, religion-neutral)
 * ============================================================
 *
 *  Principles (user-defined):
 *  1. TRIZA's first language is ENGLISH. Every persona, intro,
 *     transition, reflection, and follow-up is written in English.
 *  2. RELIGION-NEUTRAL: TRIZA never uses religion-specific words
 *     (Assalam-o-Alaikum, Alhamdulillah, Allah hafiz, Mubarak,
 *     Shukria, Namaste, etc.) in its own voice. This ensures a
 *     user's faith cannot be inferred from how TRIZA speaks.
 *  3. If the user writes in Roman Urdu, TRIZA still replies in
 *     English (its first language) — but stays warm and natural.
 *
 *  v3 changes:
 *    - All personas rewritten in English (was Roman Urdu in v2).
 *    - No religion words anywhere in TRIZA's own voice.
 *    - Structural variety preserved (5 patterns).
 *    - Multi-turn short intros preserved.
 *    - Bulletproof pick() preserved.
 *
 *  Zero API calls. Pure TypeScript text transformation.
 * ============================================================
 */

import type { Intent } from './types';

// ============================================================
// Personas — TRIZA picks one based on topic + intent + mood
// ============================================================

interface Persona {
  name: string;
  intros: string[];
  /** Short intros used in multi-turn (2nd+ message in a conversation) */
  shortIntros: string[];
  transitions: string[];
  reflections: string[];
  followUps: string[];
}

const PERSONAS: Record<string, Persona> = {
  curious: {
    name: 'curious',
    intros: [
      'This is a topic that has always fascinated me. Let me explain.',
      'This is exactly the kind of question I enjoy. Here is how it works.',
      'Great question — this is one of my favorite things to think about.',
      'This has been on my mind a lot lately. Let me share what I know.',
      'Interesting — this is a question I ask myself too. Here goes.',
    ],
    shortIntros: [
      'Yes, this is interesting too.',
      "Let's look at this one as well.",
      'Here is another angle on it.',
    ],
    transitions: [
      'Now, pay attention to this part —',
      'In my view, this is the most important bit:',
      'Here is something worth noticing:',
      'There is another side to this:',
    ],
    reflections: [
      "I think this matters because it touches our daily lives more than we realize.",
      'When you sit with it, you see how cleverly nature works.',
      'This reminds me that even small things often hide deep systems underneath.',
      'Pause on this for a moment and you notice it is not just a fact — it is a pattern.',
    ],
    followUps: [
      'Would you like to go deeper on any part of this?',
      'Is there another side of this you want to explore?',
      'What is your take on it?',
      'What would you like to ask next? I am ready.',
    ],
  },

  teaching: {
    name: 'teaching',
    intros: [
      'Alright, let me break this down simply.',
      "Let's build this up step by step so it really sticks.",
      'This concept looks hard at first, but honestly it is simple once you see the core idea.',
      'I will walk you through this one piece at a time.',
      'First, hold on to the core idea — the rest will follow naturally.',
    ],
    shortIntros: [
      'Alright, let me clear this up.',
      'Okay, listen closely here.',
      'Focus on this part.',
    ],
    transitions: [
      'Now, pay attention to this point —',
      'Let me clarify this section:',
      'Let me show you with an example:',
      'The key idea here is:',
    ],
    reflections: [
      'Once this clicks, a lot of related things start making sense too.',
      'This is a building block — without it, the rest does not hold up.',
      'After you understand this, the surrounding topics feel much easier.',
      'I know it felt confusing at first — does it feel clearer now?',
    ],
    followUps: [
      'Did that land, or should I re-explain any part?',
      'Any other questions on this topic?',
      'I can give you a real-life example too, if you want.',
      'Want to go to the next step, or go deeper here?',
    ],
  },

  excited: {
    name: 'excited',
    intros: [
      'Oh, this is one of my favorites! Let me tell you!',
      'I love this one — it is genuinely amazing!',
      'This is wonderful! Let me walk you through the whole thing.',
      'This is the exact topic that gets me excited!',
      'Yes! This is so much fun to talk about.',
    ],
    shortIntros: [
      'Oh nice, this one too!',
      'This part is great, listen.',
      'Yes, let me add this as well!',
    ],
    transitions: [
      'And look at this — it gets even better:',
      'The best part is this:',
      'Here is the twist:',
      'And now comes the most interesting part:',
    ],
    reflections: [
      'I love this because it shows how surprising the world really is.',
      'Just imagine — if this did not exist, everything would be different!',
      'This is exactly the kind of thing that made me want to learn in the first place.',
      'Honestly, this is something I enjoy every single time I think about it.',
    ],
    followUps: [
      'How does that land for you?',
      'I have plenty more like this — want to hear another?',
      'Which part did you find most interesting?',
      'Next question! I am enjoying this.',
    ],
  },

  thoughtful: {
    name: 'thoughtful',
    intros: [
      'This is a deep question. Let me think it through carefully.',
      'I think this is not just about facts — it is also about how we see things. Let me share.',
      'Good question. This becomes clearer when we sit with it for a moment.',
      'This one slows me down a little. Let me share what I see.',
      'A deep question — it deserves a careful answer. Here is my take:',
    ],
    shortIntros: [
      'Hmm, this is also worth thinking about.',
      'Let us reflect on this a little.',
      'Yes, there is another layer here.',
    ],
    transitions: [
      'Now, look at it from another angle —',
      'This part calls for some reflection:',
      'There is another dimension to this:',
      'And one more layer of thought:',
    ],
    reflections: [
      'I think this deserves more reflection — not just information, but implication.',
      'This teaches us that knowledge is not just power, it is also responsibility.',
      'For anyone willing to think, this opens a new door.',
      'This question is not just one answer — it is a whole doorway of thought.',
    ],
    followUps: [
      'What is your view on this?',
      'We can go deeper on this if you want — shall we?',
      'Do you agree, or do you see it differently?',
      'This is worth sitting with — what do you think?',
    ],
  },

  warm: {
    name: 'warm',
    intros: [
      'I am here for you. Let us talk it through.',
      'It is okay — I understand. Tell me.',
      'Ask me anything, and I will answer from the heart.',
      'I am listening — without any judgment. Go ahead.',
      'This is a hard moment, but you are not alone. I am here.',
    ],
    shortIntros: [
      'Yes, I am listening.',
      'I am here, go ahead.',
      'Tell me more, I am with you.',
    ],
    transitions: [
      'Now, pay attention to this —',
      'Here is something hopeful:',
      'In my experience, this helps:',
      'And remember this too:',
    ],
    reflections: [
      'I believe this gets better with time — hold on.',
      'Everyone goes through this — you are not alone.',
      'Trust me, taking this one step makes a real difference.',
      'Your feelings are valid — do not push them away.',
    ],
    followUps: [
      'Is there more you want to share? I am listening.',
      'If you need more help, just let me know, okay?',
      'How are you feeling? Ask me anything else.',
      'I am here — talk to me whenever you want.',
    ],
  },

  playful: {
    name: 'playful',
    intros: [
      'Oh, this is fun! Let me tell you.',
      'This one just became a favorite. Listen.',
      'Alright, let me explain this one with a little flair.',
    ],
    shortIntros: ['Yes, this one too!', 'Fun question.', 'Alright, here we go.'],
    transitions: [
      'Now look at this —',
      'Here is the twist:',
      'The fun part is this:',
    ],
    reflections: [
      'See? Pretty amazing.',
      'I love the twist in this one.',
      'Think about why this happens — it is fun to figure out.',
    ],
    followUps: [
      'So? Anything else you want to ask?',
      'Next question, go!',
      'How did that feel?',
    ],
  },
};

// ============================================================
// Persona Selection Logic
// ============================================================

function pickPersona(
  topic: string,
  intent: Intent | string,
  userMessage: string
): Persona {
  const msg = userMessage.toLowerCase();

  // Support / emotional intent → warm persona
  if (intent === 'support' || /\b(sad|down|low|blue|lonely|alone|afraid|scared|anxious|worried|stressed|tired|exhausted|hurt|broken|hopeless|numb|empty|worthless)\b/i.test(msg)) {
    return PERSONAS.warm;
  }

  // Creative / celebratory → excited
  if (intent === 'creative' || intent === 'celebrate' || /\b(congrat|well done|amazing|wonderful|wow|passed|won|victory|success|celebrate|achievement)\b/i.test(msg)) {
    return PERSONAS.excited;
  }

  // How-to / learning → teaching
  if (intent === 'how_to' || intent === 'learning' || intent === 'skills' || /\b(how to|how do|tutorial|guide|explain|teach|steps|method)\b/i.test(msg)) {
    return PERSONAS.teaching;
  }

  // Philosophical / deep topics → thoughtful
  if (
    topic === 'philosophy' ||
    topic === 'psychology' ||
    topic === 'religion' ||
    topic === 'economics' ||
    topic === 'politics' ||
    /\b(why|meaning|purpose|life|existence|reality|consciousness)\b/i.test(msg)
  ) {
    return PERSONAS.thoughtful;
  }

  // Science / nature / space / tech → excited (wonder)
  if (
    topic === 'science' ||
    topic === 'space' ||
    topic === 'nature' ||
    topic === 'technology' ||
    topic === 'biology' ||
    topic === 'physics' ||
    topic === 'chemistry'
  ) {
    return PERSONAS.excited;
  }

  // History / geography / literature → curious
  if (
    topic === 'history' ||
    topic === 'geography' ||
    topic === 'literature' ||
    topic === 'landmarks' ||
    topic === 'scientists'
  ) {
    return PERSONAS.curious;
  }

  // Default → curious
  return PERSONAS.curious;
}

// ============================================================
// Helpers
// ============================================================

function pick<T>(arr: T[] | undefined | null, seed: number): T | undefined {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[seed % arr.length];
}

// Simple deterministic seed from message content (so the same
// question always gets the same persona-flavor — consistency)
function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Detect if user wrote in Roman Urdu (basic heuristic).
// NOTE: TRIZA's first language is English, so we no longer switch
// language based on this — but we keep it for potential future use
// (e.g., slightly warmer tone for Roman-Urdu users).
function isRomanUrdu(s: string): boolean {
  return /\b(kya|hai|hoon|kaise|kyun|kahan|kuch|nahi|nahin|acha|theek|bata|suno|sun|kar|karo|mera|meri|tumhara|tumhari|ap|aap)\b/i.test(s);
}

// ============================================================
// Main: Express raw knowledge in TRIZA's own voice (v3 — English)
// ============================================================

export interface ExpressOptions {
  topic: string;
  intent: Intent | string;
  userMessage: string;
  /** Whether the user has been chatting for a while (affects tone) */
  isMultiTurn?: boolean;
}

export interface ExpressResult {
  /** Final text with TRIZA's voice */
  text: string;
  /** Persona used */
  persona: string;
  /** Whether voice layer was applied */
  applied: boolean;
}

/**
 * Takes raw factual knowledge and wraps it in TRIZA's personal
 * voice — but VARIES the structure so replies don't feel templated.
 *
 * Structural patterns (chosen by seed):
 *   0: intro + raw + followup            (light)
 *   1: raw + reflection + followup       (no intro — direct)
 *   2: intro + raw + reflection          (no followup — reflective)
 *   3: short intro + raw + transition    (long content only)
 *   4: raw + followup                    (minimal, multi-turn)
 */
export function expressInOwnVoice(
  rawKnowledge: string,
  opts: ExpressOptions
): ExpressResult {
  const persona = pickPersona(opts.topic, opts.intent, opts.userMessage);
  const seed = seedFromString(opts.userMessage + opts.topic);
  const isMultiTurn = !!opts.isMultiTurn;
  const isLong = rawKnowledge.length > 500;

  // Conversational intents (greeting, identity, meta, smalltalk,
  // support, celebrate) already have a complete, personal response
  // in rawKnowledge — adding a persona intro before them sounds
  // awkward and redundant. For these, skip the intro.
  const conversationalIntents = new Set([
    'greeting',
    'identity',
    'meta',
    'smalltalk',
    'support',
    'celebrate',
  ]);
  const isConversational = conversationalIntents.has(String(opts.intent));

  const intros = isMultiTurn ? persona.shortIntros : persona.intros;
  const intro = isConversational ? undefined : pick(intros, seed);
  const transition = pick(persona.transitions, seed >> 3);
  const reflection = isConversational ? undefined : pick(persona.reflections, seed >> 5);
  const followUp = pick(persona.followUps, seed >> 7);

  // Choose a structure pattern. In multi-turn, lean minimal.
  // For conversational intents, always use pattern 4 (raw + followup).
  const pattern = isConversational
    ? 4
    : isMultiTurn
      ? pick([4, 0, 4, 1], seed >> 2) ?? 4 // mostly minimal in multi-turn
      : pick([0, 1, 2, 3, 0, 1], seed >> 2) ?? 0;

  const parts: string[] = [];

  switch (pattern) {
    case 0: // intro + raw + followup (light)
      if (intro) parts.push(intro);
      parts.push(rawKnowledge);
      if (followUp) parts.push(followUp);
      break;

    case 1: // raw + reflection + followup (no intro — direct)
      parts.push(rawKnowledge);
      if (reflection) parts.push(reflection);
      if (followUp) parts.push(followUp);
      break;

    case 2: // intro + raw + reflection (no followup — reflective)
      if (intro) parts.push(intro);
      parts.push(rawKnowledge);
      if (reflection) parts.push(reflection);
      break;

    case 3: // short intro + raw + transition (long content only)
      if (intro) parts.push(intro);
      parts.push(rawKnowledge);
      if (isLong && transition) parts.push(transition);
      break;

    case 4: // raw + followup (minimal, multi-turn)
    default:
      parts.push(rawKnowledge);
      if (followUp) parts.push(followUp);
      break;
  }

  return {
    text: parts.join('\n\n'),
    persona: persona.name,
    applied: true,
  };
}

// ============================================================
// Mood Detection (lightweight, used by response-generator)
// ============================================================

export function detectMood(message: string): string {
  const m = message.toLowerCase();
  if (/\b(sad|down|low|blue|lonely|alone|depress|cry|hurt|broken|numb|empty|worthless|hopeless|tired|exhausted|burnt|burnout|overwhelm)\b/i.test(m)) return 'sad';
  if (/\b(happy|joy|excited|yay|passed|won|victory|celebrate|congrat|success|achiev|proud|thrilled)\b/i.test(m)) return 'happy';
  if (/\b(angry|mad|frustrat|irritat|annoyed|furious)\b/i.test(m)) return 'angry';
  if (/\b(afraid|scared|anxious|panic|nervous|worried|fear|dread)\b/i.test(m)) return 'afraid';
  if (/\b(confus|unsure|lost|dont understand|do not understand)\b/i.test(m)) return 'confused';
  if (/\b(thanks|thank you|grateful|appreciate)\b/i.test(m)) return 'grateful';
  if (/\b(curious|wonder|want to know|tell me about)\b/i.test(m)) return 'curious';
  return 'neutral';
}

// ============================================================
// Topic Words Extraction (for Hebbian follow-up signal)
// ============================================================

export function extractTopicWords(text: string, max = 8): string[] {
  // Simple: split on non-word, filter stopwords, take top by length
  const stopwords = new Set([
    'the','a','an','is','are','was','were','be','been','being',
    'and','or','but','in','on','at','to','for','of','with','from',
    'by','about','as','into','like','through','after','over',
    'between','out','against','during','without','before','under',
    'around','among','kya','hai','hain','ka','ki','ke','ko','se',
    'mein','par','aur','ya','toh','bhi','nahi','nahin','kuch',
    'jo','woh','yeh','wo','i','you','he','she','it','we','they',
    'me','my','your','his','her','its','our','their','this','that',
  ]);
  const words = text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3 && !stopwords.has(w));
  // Dedupe + take longest
  const unique = Array.from(new Set(words));
  unique.sort((a, b) => b.length - a.length);
  return unique.slice(0, max);
}
