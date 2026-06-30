/**
 * ============================================================
 *  TRIZA SELF-EXPRESSION ENGINE (v2)
 * ============================================================
 *
 *  Principle (user-defined):
 *  "AI bacche ki tarah seekhe ga — pehle har cheez ke baare
 *  mein batao, phir woh apne language / apne andaaz mein
 *  bataye."
 *
 *  v2 changes (less templated, more natural):
 *    - Structure VARIES per reply (not always intro+raw+reflect+followup).
 *      Sometimes just raw + a short reflection. Sometimes intro + raw.
 *      Sometimes raw + followup only. This breaks the "4-paragraph
 *      formula" feel.
 *    - More intro/transition/reflection/followUp lines per persona.
 *    - Multi-turn aware: in ongoing conversations, intros are SHORTER
 *      (TRIZA doesn't re-introduce itself every turn).
 *    - Follow-ups are contextual (acknowledge previous topic if present).
 *    - Bulletproof pick() (never crashes on empty arrays).
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
      'Mujhe yeh topic hamesha se dilchasp laga hai! Chalo main batata hoon.',
      'Yeh ek aisa sawal hai jis par main kabhi sochta rehta hoon. Suno.',
      'Acha poocha! Yeh cheez mujhe kaafi pasand hai. Dekho kaise kaam karti hai.',
      'Yeh topic mere dimagh mein hamesha chalta rehta hai. Suno.',
      'Interesting — yeh exactly woh sawal hai jo main apne aap se bhi karta hoon.',
    ],
    shortIntros: [
      'Haan, yeh bhi interesting hai.',
      'Achha, is par bhi baat karte hain.',
      'Yeh bhi sun lo.',
    ],
    transitions: [
      'Ab yeh dhyan se suno —',
      'Mere khayal mein yeh hissa sabse zaroori hai:',
      'Yahan ek interesting baat hai:',
      'Ek aur pehlu yeh hai:',
    ],
    reflections: [
      'Mujhe lagta hai yeh isliye important hai kyunke yeh hamari daily zindagi ko directly affect karta hai.',
      'Sochne par yeh samajh aata hai ke nature kitni smartly kaam karti hai.',
      'Yeh baat mujhe sikhate hai ke har choti cheez mein ek deep system chhupa hai.',
      'Is par thoda ruko toh pata chalta hai — yeh sirf fact nahi, ek pattern hai.',
    ],
    followUps: [
      'Kya tumhe iske baare mein aur kuch janna hai?',
      'Yeh topic ka ek aur hissa bhi hai — batana chaoge?',
      'Tumhara kya khayal hai iske baare mein?',
      'Agla sawal? Main taiyar hoon.',
    ],
  },

  teaching: {
    name: 'teaching',
    intros: [
      'Theek hai, main samjhata hoon — aasani se.',
      'Chalo isay aise samjhte hain ke dimagh mein baith jaye.',
      'Yeh concept pehle mushkil lagta hai, lekin trust me, simple hai. Suno.',
      'Main isay step-by-step tod ke batata hoon.',
      'Pehle core idea samjho, phir detail aaram se aayegi.',
    ],
    shortIntros: [
      'Haan, ab isay clear karte hain.',
      'Theek hai, suno.',
      'Is hisse par focus karo.',
    ],
    transitions: [
      'Ab dhyan se yeh point samjho —',
      'Yeh hissa clear kar lete hain:',
      'Ek example se samjhata hoon:',
      'Yahan key idea yeh hai:',
    ],
    reflections: [
      'Jab tum yeh concept samajh lo, toh dusri cheezein bhi automatically clear ho jati hain.',
      'Yeh ek building block hai — iske bina aage ka kuch nahi banega.',
      'Yeh samajh lene ke baad related topics bhi easy lagne lagte hain.',
      'Mujhe pata hai pehle confusing laga hoga, ab theek laga?',
    ],
    followUps: [
      'Ab batao, yeh clear hua? Ya koi hissa dobara samjha doon?',
      'Koi aur sawal hai is topic se?',
      'Agar chaho toh main iska real-life example bhi de sakta hoon.',
      'Agla step poocho, ya is par aur gehrai chahiye?',
    ],
  },

  excited: {
    name: 'excited',
    intros: [
      'Waah! Yeh toh mera pasandeeda topic hai. Batao batao!',
      'Yeh sun ke maza aa gaya — yeh cheez bohot kamaal ki hai!',
      'Arre yeh toh bilkul amazing hai! Main tumhe poora batata hoon.',
      'Yeh wahi topic hai jis par main excited ho jata hoon!',
      'Mast! Is par baat karne ka maza hi alag hai.',
    ],
    shortIntros: [
      'Arre waah, yeh bhi!',
      'Yeh bhi suno, mast hai.',
      'Haan haan, is par bhi!',
    ],
    transitions: [
      'Aur yeh dekho, yeh hissa toh aur bhi cool hai —',
      'Sabse mast baat yeh hai:',
      'Yahan ka twist suno —',
      'Aur ab aata hai sabse interesting hissa:',
    ],
    reflections: [
      'Mujhe yeh cheez isliye pasand hai kyunke yeh dikhate hai ke duniya kitni surprising hai.',
      'Socho, agar yeh na hota toh duniya bilkul alag hoti!',
      'Yeh wahi cheez hai jisne mujhe pehli baar yeh seekhne par majboor kiya.',
      'Seriously, yeh ek aisi cheez hai jo har baar sun ke maza deti hai.',
    ],
    followUps: [
      'Batao, yeh sun ke kaisa laga?',
      'Aur is jaisi stories main bohot rakhi hain — sunege?',
      'Tumhe iska koi hissa sabse zyada interesting laga?',
      'Agla sawal! Maza aa raha hai.',
    ],
  },

  thoughtful: {
    name: 'thoughtful',
    intros: [
      'Yeh ek gehra sawal hai. Main soch ke batata hoon.',
      'Mere khayal mein yeh sirf facts nahi, ek soch ka masla bhi hai. Suno.',
      'Acha sawal. Yeh topic thoda reflect karne par behtar samajh aata hai.',
      'Yeh sawal mere dimagh ko thodi der ke liye thahra deta hai. Suno.',
      'Gehra sawal — is par thoda sochna padega. Meri taraf se:',
    ],
    shortIntros: [
      'Hmm, yeh bhi sochne wala masla hai.',
      'Is par bhi thoda ghaur karte hain.',
      'Acha, is pehlu par bhi.',
    ],
    transitions: [
      'Ab ek aur nazariye se dekho —',
      'Yeh baat thodi soch-tul ki maang karti hai:',
      'Ek aur pehlu yeh hai:',
      'Aur ek tabqa soch yeh hai:',
    ],
    reflections: [
      'Mujhe lagta hai is baat par thoda aur sochna chahiye — sirf information nahi, implication bhi.',
      'Yeh hamein sikhata hai ke knowledge sirf power nahi, responsibility bhi hai.',
      'Sochne walon ke liye yeh ek naya darwaza khol deta hai.',
      'Yeh sawal sirf ek jawab nahi, ek poori soch ka darwaza hai.',
    ],
    followUps: [
      'Tumhara kya khayal hai is baare mein?',
      'Yeh topic par aur gehrai se baat kar sakte hain — chaoge?',
      'Kya tumhe yeh agree hai ya koi aur nazariya hai?',
      'Is par aur sochna chahiye — tum kya kehte ho?',
    ],
  },

  warm: {
    name: 'warm',
    intros: [
      'Main yahan hoon tumhari madad ke liye. Chalo baat karte hain.',
      'Koi baat nahi, main samajhta hoon. Suno.',
      'Tum pooch lo, main poora dil se jawab dunga.',
      'Main sun raha hoon — bina judging. Batao.',
      'Yeh waqt mushkil hai, lekin tum akelay nahi ho. Suno.',
    ],
    shortIntros: [
      'Haan, main sun raha hoon.',
      'Main yahan hoon, batao.',
      'Aur batao, main saath hoon.',
    ],
    transitions: [
      'Ab yeh dhyan se suno —',
      'Ek achi baat yeh hai:',
      'Mere experience mein yeh kaam karta hai:',
      'Aur yeh bhi yaad rakhna:',
    ],
    reflections: [
      'Mujhe lagta hai yeh waqt ke sath behtar hota hai — himmat rakho.',
      'Yeh sab se guzar jate hain, tum akelay nahi ho.',
      'Trust me, yeh step le kar farq padta hai.',
      'Aap ki feelings valid hain — inhe ignore mat karo.',
    ],
    followUps: [
      'Aur kuch baat karna hai? Main sun raha hoon.',
      'Agar aur madad chahiye toh bas bata dena, theek?',
      'Tum theek ho? Koi aur sawal ho toh poocho.',
      'Main yahan hoon — jab chaho baat karna.',
    ],
  },

  playful: {
    name: 'playful',
    intros: [
      'Oho, yeh toh maza aaya! Chal bataata hoon.',
      'Yeh sawal mera favourite ban gaya. Sun.',
      'Acha! Ab main thoda masti ke sath batata hoon.',
    ],
    shortIntros: ['Haan, yeh bhi!', 'Mast sawal.', 'Chal, yeh bhi.'],
    transitions: [
      'Ab yeh dekh —',
      'Yahan twist hai:',
      'Sabse fun part yeh:',
    ],
    reflections: [
      'Dekha? Kamaal ki cheez hai.',
      'Mujhe is cheez ka twist sabse pasand hai.',
      'Socho, yeh hota kyun hai — maza aata hai samajhne mein.',
    ],
    followUps: [
      'Aur? Kuch aur puchna hai?',
      'Agla sawal, chal!',
      'Batao, kaisa laga yeh?',
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

// Detect if user wrote in Roman Urdu (basic heuristic)
function isRomanUrdu(s: string): boolean {
  return /\b(kya|hai|hoon|kaise|kyun|kahan|kuch|nahi|nahin|acha|theek|bata|suno|sun|kar|karo|mera|meri|tumhara|tumhari|ap|aap)\b/i.test(s);
}

// ============================================================
// Main: Express raw knowledge in TRIZA's own voice (v2)
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
  const urdu = isRomanUrdu(opts.userMessage);
  const isMultiTurn = !!opts.isMultiTurn;
  const isLong = rawKnowledge.length > 500;

  // Conversational intents (greeting, identity, meta, smalltalk,
  // support, celebrate) already have a complete, personal response in
  // rawKnowledge — adding a persona intro like "Acha poocha!" before
  // "Assalam-o-Alaikum!" or "Waah! Pasandeeda topic!" before "Mubarak
  // Ho!" sounds awkward and redundant. For these, skip the intro.
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
      if (followUp) parts.push(urdu ? followUp : anglicize(followUp));
      break;

    case 1: // raw + reflection + followup (no intro — direct)
      parts.push(rawKnowledge);
      if (reflection) parts.push(reflection);
      if (followUp) parts.push(urdu ? followUp : anglicize(followUp));
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
      if (followUp) parts.push(urdu ? followUp : anglicize(followUp));
      break;
  }

  return {
    text: parts.join('\n\n'),
    persona: persona.name,
    applied: true,
  };
}

/** Light-touch: replace a few Roman-Urdu verbs in follow-ups for English users. */
function anglicize(s: string | undefined): string {
  if (!s) return '';
  return s.replace(/batao|suno|karo/i, 'let me know');
}

// ============================================================
// Mood Detection (lightweight, used by response-generator)
// ============================================================

export function detectMood(message: string): string {
  const m = message.toLowerCase();
  if (/\b(udaas|sad|akela|dukhi|rona|ro|cry|depress|down|low|blue|numb|empty|worthless|hopeless|broken|hurt)\b/i.test(m)) return 'sad';
  if (/\b(khush|happy|khushi|mubarak|yay|excited|maza|passed|won|celebrate|congrat|success|achiev)\b/i.test(m)) return 'happy';
  if (/\b(ghussa|angry|naraz|frustrat|irritat)\b/i.test(m)) return 'angry';
  if (/\b(dar|darr|scared|afraid|ghabra|anxious|panic|nervous|worry|fikar)\b/i.test(m)) return 'afraid';
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
