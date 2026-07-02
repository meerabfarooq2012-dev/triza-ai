/**
 * ============================================================
 *  TRIZA RELIGION-NEUTRAL SANITIZATION LAYER
 * ============================================================
 *
 *  Principle (user-defined):
 *  "AI ki first language English ho gi, aur koi bhi religion word
 *   (jaise Alhamdulillah, Allah hafiz, Mubarak, etc.) use nahi ho
 *   ga — taake pata na chale ke agla user kaunsa mazhab rakhta hai."
 *
 *  TRIZA must NOT use religion-specific words in its OWN conversational
 *  speech (greetings, farewells, thanks, celebration, exclamations).
 *  This keeps the AI religion-neutral — a user's faith cannot be
 *  inferred from how TRIZA talks to them.
 *
 *  This module is a SAFETY NET. It runs on every TRIZA response
 *  right before delivery. Even if a knowledge-base entry or
 *  self-expression string slips through with a religion word, this
 *  layer catches and neutralizes it.
 *
 *  Scope:
 *    - Conversational religion words (greetings, farewells, thanks,
 *      celebration, exclamations) → replaced with neutral English.
 *    - Factual religious terms (Quran, Bible, Namaz, Hajj, etc.)
 *      when used in KNOWLEDGE responses about religion are LEFT
 *      intact — answering "what is Islam?" factually is different
 *      from greeting someone with "Assalam-o-Alaikum".
 *
 *  Strategy: We only sanitize religion words that appear in
 *  TRIZA's own voice (markdown headings, short exclamations,
 *  greeting/farewell lines). Long factual paragraphs are trusted.
 * ============================================================
 */

// Religion-specific conversational phrases → neutral English equivalents.
// Ordered so longer/multi-word phrases are matched before their parts.
const RELIGION_REPLACEMENTS: Array<{ re: RegExp; to: string }> = [
  // ── Greetings ───────────────────────────────────────────────
  { re: /\bassalam[- ]?o[- ]?alaikum\b/gi, to: 'Hello' },
  { re: /\bassalamualaikum\b/gi, to: 'Hello' },
  { re: /\bas-?salamu\s+alaikum\b/gi, to: 'Hello' },
  { re: /\bsalam\s+alaikum\b/gi, to: 'Hello' },
  { re: /\bassalamu\s+alaikum\b/gi, to: 'Hello' },
  // Bare "salam"/"salaam" used as a greeting
  { re: /\b(salam|salaam)\b/gi, to: 'Hello' },
  { re: /\bnamaste\b/gi, to: 'Hello' },
  { re: /\bnomoskar\b/gi, to: 'Hello' },
  { re: /\bshalom\b/gi, to: 'Hello' },

  // ── Farewells ───────────────────────────────────────────────
  { re: /\ballah\s+hafiz\b/gi, to: 'Take care' },
  { re: /\ballah\s+hafiz\b/gi, to: 'Take care' },
  { re: /\bkhuda\s+hafiz\b/gi, to: 'Take care' },
  { re: /\bkhuda\s+haafiz\b/gi, to: 'Take care' },
  { re: /\balvida\b/gi, to: 'Goodbye' },
  { re: /\bfee\s+amanillah\b/gi, to: 'Take care' },

  // ── Thanks / gratitude exclamations ─────────────────────────
  { re: /\balhamdulillah\b/gi, to: 'Thankfully' },
  { re: /\balhamdu\s+lillah\b/gi, to: 'Thankfully' },
  { re: /\bshukria\b/gi, to: 'thank you' },
  { re: /\bshukriya\b/gi, to: 'thank you' },
  { re: /\bshukar\b/gi, to: 'gladly' },
  { re: /\bshukar\s+alhamdulillah\b/gi, to: 'thankfully' },
  { re: /\bhamd\b/gi, to: 'thanks' },

  // ── Celebration / congratulation ────────────────────────────
  { re: /\bmubarak\s+ho\b/gi, to: 'Congratulations' },
  { re: /\bmubarak\b/gi, to: 'Congratulations' },
  { re: /\bshabaash\b/gi, to: 'Well done' },
  { re: /\bwah\s+wah\b/gi, to: 'Bravo' },

  // ── Exclamations / invocations ──────────────────────────────
  { re: /\bmashallah\b/gi, to: 'Wonderful' },
  { re: /\bmaashallah\b/gi, to: 'Wonderful' },
  { re: /\bsubhanallah\b/gi, to: 'Amazing' },
  { re: /\bsubhan\s+allah\b/gi, to: 'Amazing' },
  { re: /\bastaghfirullah\b/gi, to: 'Oh my' },
  { re: /\binshallah\b/gi, to: 'hopefully' },
  { re: /\binsha\s*allah\b/gi, to: 'hopefully' },
  { re: /\binsha\s+allah\b/gi, to: 'hopefully' },
  { re: /\bishaallah\b/gi, to: 'hopefully' },
  { re: /\bjes\s+positive\b/gi, to: 'hopefully' },

  // ── Deity references used as conversational exclamations ────
  // Only neutralize when standing alone or in common phrases —
  // NOT inside factual religious-knowledge paragraphs (handled by
  // the long-paragraph trust rule below).
  { re: /\bya\s+allah\b/gi, to: 'Oh my' },
  { re: /\bprabhu\b/gi, to: 'the divine' },
  { re: /\bbhagwan\b/gi, to: 'the divine' },
  { re: /\bishwar\b/gi, to: 'the divine' },
  { re: /\bwahguru\b/gi, to: 'the divine' },
  { re: /\brab\b/gi, to: 'the divine' },

  // ── "khuda" used conversationally (not in factual context) ──
  { re: /\bkhuda\s+ka\s+shukar\b/gi, to: 'thankfully' },
  { re: /\bkhuda\s+ki\s+kasam\b/gi, to: 'I swear' },
  { re: /\bkhuda\s+na\s+kare\b/gi, to: "heaven forbid" },
  { re: /\bkhuda\s+kare\b/gi, to: 'hopefully' },

  // ── Religious honorifics used as standalone salutations ─────
  // (Left intact inside factual religion entries — see trust rule.)
  { re: /\bjes\s+hafiz\b/gi, to: 'Goodbye' },

  // ── "Om" as a standalone exclamation (not the word "om" inside other words) ─
  { re: /\bom\s+shanti\b/gi, to: 'Peace' },
]

/**
 * Protect long factual paragraphs from over-sanitization.
 * Paragraphs longer than this are treated as knowledge content
 * (trusted) — only the most clearly conversational religion words
 * (greetings/farewells/thanks) are replaced there.
 */
const LONG_PARAGRAPH_THRESHOLD = 200

/**
 * Sanitize a TRIZA response for religion-neutrality.
 *
 * - Splits the text into paragraphs.
 * - For SHORT paragraphs (TRIZA's own voice — headings, greetings,
 *   asides, follow-ups), applies ALL religion-word replacements.
 * - For LONG paragraphs (factual knowledge), applies ONLY the
 *   conversational-phrase replacements (greetings/farewells/thanks),
 *   leaving factual religious terminology intact.
 * - Preserves markdown formatting and case.
 */
export function sanitizeReligion(text: string): string {
  if (!text) return text

  // Quick exit: if no religion word appears anywhere, skip the work.
  const hasReligionWord = /\b(assalam|salam|salaam|allah|khuda|alhamdulillah|inshallah|insha\s*allah|mashallah|subhanallah|shukria|shukriya|shukar|mubarak|shabaash|namaste|nomoskar|bhagwan|ishwar|prabhu|wahguru|rab|alvida|hafiz|astaghfirullah|om\s+shanti)\b/i.test(text)
  if (!hasReligionWord) return text

  const paragraphs = text.split(/(\n\n+)/) // keep separators
  const conversationalOnly = RELIGION_REPLACEMENTS.filter(
    (r) => /hello|goodbye|take care|thank you|thankfully|congratulations|well done|bravo|peace/i.test(r.to)
  )

  return paragraphs
    .map((chunk) => {
      // Preserve separators (whitespace-only chunks between paragraphs)
      if (/^\s*$/.test(chunk) || /^(\n)+$/.test(chunk)) return chunk

      const isLong = chunk.length > LONG_PARAGRAPH_THRESHOLD
      const rules = isLong ? conversationalOnly : RELIGION_REPLACEMENTS

      let out = chunk
      for (const rule of rules) {
        out = out.replace(rule.re, rule.to)
      }
      return out
    })
    .join('')
}
