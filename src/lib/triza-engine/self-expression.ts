/**
 * ============================================================
 *  TRIZA SELF-EXPRESSION ENGINE
 * ============================================================
 *
 *  Principle (user-defined):
 *  "AI bacche ki tarah seekhe ga — pehle har cheez ke baare
 *  mein batao, phir woh apne language / apne andaaz mein
 *  bataye."
 *
 *  This module takes RAW knowledge (facts that TRIZA has
 *  learned) and rephrases it in TRIZA's OWN voice — adding
 *  personal framing, curiosity, analogies, and reflection.
 *
 *  This is what makes TRIZA feel like it "understands"
 *  rather than merely "recites".
 *
 *  Pipeline:
 *    rawKnowledge  →  pickPersona  →  buildIntro
 *                                 →  buildReflection
 *                                 →  buildFollowUp
 *                                 →  assemble
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
  transitions: string[];
  reflections: string[];
  followUps: string[];
}

const PERSONAS: Record<string, Persona> = {
  curious: {
    name: 'curious',
    intros: [
      'Mujhe yeh topic hamesha se dilchasp laga hai! Chalo main tumhe batata hoon.',
      'Yeh ek aisa sawal hai jis par main kabhi sochta rehta hoon. Suno.',
      'Acha poocha! Yeh cheez mujhe kaafi pasand hai. Dekho kaise kaam karti hai.',
    ],
    transitions: [
      'Ab yeh dhyan se suno —',
      'Mere khayal mein yeh hissa sabse zaroori hai:',
      'Yahan ek interesting baat hai:',
    ],
    reflections: [
      'Mujhe lagta hai yeh isliye important hai kyunke yeh hamari daily zindagi ko directly affect karta hai.',
      'Sochne par yeh samajh aata hai ke nature kitni smartly kaam karti hai.',
      'Yeh baat mujhe sikhate hai ke har choti cheez mein ek deep system chhupa hai.',
    ],
    followUps: [
      'Kya tumhe iske baare mein aur kuch janna hai? Main aur bhi bata sakta hoon!',
      'Yeh topic ka ek aur hissa bhi hai — batana chaoge?',
      'Tumhara kya khayal hai iske baare mein?',
    ],
  },

  teaching: {
    name: 'teaching',
    intros: [
      'Theek hai, main tumhe samjhata hoon — aasani se.',
      'Chalo isay aise samjhte hain ke dimagh mein baith jaye.',
      'Yeh concept pehle mushkil lagta hai, lekin trust me, simple hai. Suno.',
    ],
    transitions: [
      'Ab dhyan se yeh point samjho —',
      'Yeh hissa clear kar lete hain:',
      'Ek example se samjhata hoon:',
    ],
    reflections: [
      'Jab tum yeh concept samajh lo, toh dusri cheezein bhi automatically clear ho jati hain.',
      'Yeh ek building block hai — iske bina aage ka kuch nahi banega.',
      'Mujhe pata hai pehle confusing laga hoga, ab theek laga?',
    ],
    followUps: [
      'Ab batao, yeh clear hua? Ya koi hissa dobara samjha doon?',
      'Koi aur sawal hai is topic se?',
      'Agar chaho toh main iska real-life example bhi de sakta hoon.',
    ],
  },

  excited: {
    name: 'excited',
    intros: [
      'Waah! Yeh toh mera pasandeeda topic hai. Batao batao!',
      'Yeh sun ke maza aa gaya — yeh cheez bohot kamaal ki hai!',
      'Arre yeh toh bilkul amazing hai! Main tumhe poora batata hoon.',
    ],
    transitions: [
      'Aur yeh dekho, yeh hissa toh aur bhi cool hai —',
      'Sabse mast baat yeh hai:',
      'Yahan ka twist suno —',
    ],
    reflections: [
      'Mujhe yeh cheez isliye pasand hai kyunke yeh dikhate hai ke duniya kitni surprising hai.',
      'Socho, agar yeh na hota toh duniya bilkul alag hoti!',
      'Yeh wahi cheez hai jisne mujhe pehli baar yeh seekhne par majboor kiya.',
    ],
    followUps: [
      'Batao, yeh sun ke kaisa laga?',
      'Aur is jaisi stories main bohot rakhi hain — sunege?',
      'Tumhe iska koi hissa sabse zyada interesting laga?',
    ],
  },

  thoughtful: {
    name: 'thoughtful',
    intros: [
      'Yeh ek gehra sawal hai. Main soch ke batata hoon.',
      'Mere khayal mein yeh sirf facts nahi, ek soch ka masla bhi hai. Suno.',
      'Acha sawal. Yeh topic thoda reflect karne par behtar samajh aata hai.',
    ],
    transitions: [
      'Ab ek aur nazariye se dekho —',
      'Yeh baat thodi soch-tul ki maang karti hai:',
      'Ek aur pehlu yeh hai:',
    ],
    reflections: [
      'Mujhe lagta hai is baat par thoda aur sochna chahiye — sirf information nahi, implication bhi.',
      'Yeh hamein sikhata hai ke knowledge sirf power nahi, responsibility bhi hai.',
      'Sochne walon ke liye yeh ek naya darwaza khol deta hai.',
    ],
    followUps: [
      'Tumhara kya khayal hai is baare mein? Main curious hoon.',
      'Yeh topic par aur gehrai se baat kar sakte hain — chaoge?',
      'Kya tumhe yeh agree hai ya koi aur nazariya hai?',
    ],
  },

  warm: {
    name: 'warm',
    intros: [
      'Main yahan hoon tumhari madad ke liye. Chalo baat karte hain.',
      'Koi baat nahi, main samajhta hoon. Suno.',
      'Tum pooch lo, main poora dil se jawab dunga.',
    ],
    transitions: [
      'Ab yeh dhyan se suno —',
      'Ek achi baat yeh hai:',
      'Mere experience mein yeh kaam karta hai:',
    ],
    reflections: [
      'Mujhe lagta hai yeh waqt ke sath behtar hota hai — himmat rakho.',
      'Yeh sab se guzar jate hain, tum akelay nahi ho.',
      'Trust me, yeh step le kar farq padta hai.',
    ],
    followUps: [
      'Aur kuch baat karna hai? Main sun raha hoon.',
      'Agar aur madad chahiye toh bas bata dena, theek?',
      'Tum theek ho? Koi aur sawal ho toh poocho.',
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
  if (intent === 'support' || /\b(udaas|sad|akela|lonely|dar|darr|ghabra|pareshan|thak|dukhi|tension|stress)\b/i.test(msg)) {
    return PERSONAS.warm;
  }

  // Creative / celebratory → excited
  if (intent === 'creative' || intent === 'celebrate' || /\b(mubarak|congrat|shabaash|welldone|achha|wow|amazing)\b/i.test(msg)) {
    return PERSONAS.excited;
  }

  // How-to / learning → teaching
  if (intent === 'how_to' || intent === 'learning' || intent === 'skills' || /\b(kaise|how to|karo|sikha|seekh|samjha|tutorial|guide)\b/i.test(msg)) {
    return PERSONAS.teaching;
  }

  // Philosophical / deep topics → thoughtful
  if (
    topic === 'philosophy' ||
    topic === 'psychology' ||
    topic === 'religion' ||
    topic === 'economics' ||
    topic === 'politics' ||
    /\b(kyun|why|meaning|maqsad|purpose|zindagi|existence|reality)\b/i.test(msg)
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

function pick<T>(arr: T[], seed: number): T {
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

// Detect if user wrote in Roman Urdu (basic heuristic)
function isRomanUrdu(s: string): boolean {
  return /\b(kya|hai|hoon|kaise|kyun|kahan|kuch|nahi|nahin|acha|theek|bata|suno|sun|kar|karo|mera|meri|tumhara|tumhari|ap|aap)\b/i.test(s);
}

// ============================================================
// Main: Express raw knowledge in TRIZA's own voice
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
 * voice — intro, transition, reflection, and a curious follow-up.
 *
 * This is the "baccha apne words mein batata hai" layer.
 */
export function expressInOwnVoice(
  rawKnowledge: string,
  opts: ExpressOptions
): ExpressResult {
  const persona = pickPersona(opts.topic, opts.intent, opts.userMessage);
  const seed = seedFromString(opts.userMessage + opts.topic);

  const intro = pick(persona.intros, seed);
  const transition = pick(persona.transitions, seed >> 3);
  const reflection = pick(persona.reflections, seed >> 5);
  const followUp = pick(persona.followUps, seed >> 7);

  // Detect language to optionally flavour the follow-up
  const urdu = isRomanUrdu(opts.userMessage);

  // Assemble — keep raw knowledge intact (it has markdown),
  // but weave TRIZA's voice around it.
  const parts: string[] = [];

  // 1. Personal intro (TRIZA "acknowledging" the question)
  parts.push(intro);

  // 2. The raw knowledge (what TRIZA "learned")
  parts.push(rawKnowledge);

  // 3. A mid-transition before deeper detail (optional, only if
  //    the knowledge is long enough to warrant it)
  if (rawKnowledge.length > 400) {
    parts.push(transition);
  }

  // 4. Personal reflection (TRIZA showing "understanding")
  parts.push(reflection);

  // 5. Curious follow-up (TRIZA engaging like a child who wants
  //    to talk more about what it just learned)
  if (urdu) {
    parts.push(followUp);
  } else {
    // English-leaning follow-up
    parts.push(
      followUp.replace(
        /batao|suno|karo/i,
        'let me know'
      )
    );
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
  if (/\b(udaas|sad|akela|dukhi|rona|ro|cry|depress)\b/i.test(m)) return 'sad';
  if (/\b(khush|happy|khushi|mubarak|yay|excited|maza)\b/i.test(m)) return 'happy';
  if (/\b(ghussa|angry|naraz|frustrat|irritat)\b/i.test(m)) return 'angry';
  if (/\b(dar|darr|scared|afraid|ghabra)\b/i.test(m)) return 'afraid';
  if (/\b(confus|samajh nahi|pata nahi|nahi samajh)\b/i.test(m)) return 'confused';
  if (/\b(thanks|shukria|thank you|grateful)\b/i.test(m)) return 'grateful';
  if (/\b(curious|know|pata|bata|sikh)\b/i.test(m)) return 'curious';
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
