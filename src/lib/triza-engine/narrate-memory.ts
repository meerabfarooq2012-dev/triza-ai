/**
 * ============================================================
 *  TRIZA NARRATE-FROM-MEMORY ENGINE (Phase 4 — "khud bolna")
 * ============================================================
 *
 *  PURPOSE
 *  -------
 *  Instead of reciting knowledge entries verbatim with their
 *  `## Heading` / `### Subheading` / `- bullet` markdown
 *  templates, TRIZA now DESCRIBES what it remembers in its own
 *  natural, first-person prose — the way a person would explain
 *  something they genuinely learned.
 *
 *  This is the "koi templates nahi" the user asked for: TRIZA
 *  reads its memory of the topic, then speaks about it in
 *  flowing sentences, with its own perspective markers, its
 *  own transitions, and its own reflective close. The factual
 *  content is preserved; the FORM becomes conversational.
 *
 *  PIPELINE
 *  --------
 *  1. Parse raw markdown into structured blocks (title, sections,
 *     paragraphs, bullet lists, tables).
 *  2. Pick a voice pattern (deterministic from message seed) so
 *     the same question always gets the same shape, but different
 *     questions get variety.
 *  3. For each block, generate natural prose:
 *       - Title → opening sentence in TRIZA's voice
 *       - Section heading → transition sentence
 *       - Paragraph → kept mostly intact, lightly framed
 *       - Bullet list → joined into a flowing sentence
 *       - Table → described in narrative form
 *  4. Close with a reflective line in TRIZA's voice.
 *
 *  Zero API calls. Pure TypeScript text transformation.
 * ============================================================
 */

import type { Intent } from './types'

// ============================================================
// Markdown parsing — split raw knowledge into structured blocks
// ============================================================

type Block =
  | { kind: 'title'; text: string }
  | { kind: 'heading'; text: string; level: number }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'separator' }

function parseMarkdown(raw: string): Block[] {
  const lines = raw.split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines (they separate blocks)
    if (!trimmed) {
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      blocks.push({ kind: 'separator' })
      i++
      continue
    }

    // Headings
    const h1 = trimmed.match(/^#\s+(.+)$/)
    if (h1) {
      blocks.push({ kind: 'title', text: h1[1].trim() })
      i++
      continue
    }
    const h2 = trimmed.match(/^##\s+(.+)$/)
    if (h2) {
      blocks.push({ kind: 'heading', text: h2[1].trim(), level: 2 })
      i++
      continue
    }
    const h3 = trimmed.match(/^###\s+(.+)$/)
    if (h3) {
      blocks.push({ kind: 'heading', text: h3[1].trim(), level: 3 })
      i++
      continue
    }
    const h4 = trimmed.match(/^####\s+(.+)$/)
    if (h4) {
      blocks.push({ kind: 'heading', text: h4[1].trim(), level: 4 })
      i++
      continue
    }

    // Bullet list (collect consecutive bullets)
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (/^[-*+]\s+/.test(l)) {
          items.push(l.replace(/^[-*+]\s+/, '').trim())
          i++
        } else if (!l) {
          // blank line ends the list
          break
        } else {
          // non-bullet line — list ended
          break
        }
      }
      blocks.push({ kind: 'bullets', items })
      continue
    }

    // Numbered list (treat as bullets)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (/^\d+\.\s+/.test(l)) {
          items.push(l.replace(/^\d+\.\s+/, '').trim())
          i++
        } else if (!l) {
          break
        } else {
          break
        }
      }
      blocks.push({ kind: 'bullets', items })
      continue
    }

    // Table (pipe-delimited)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (l.startsWith('|') && l.endsWith('|')) {
          tableLines.push(l)
          i++
        } else {
          break
        }
      }
      if (tableLines.length >= 2) {
        // First row = header, second row = separator (---|---|---)
        const header = splitTableRow(tableLines[0])
        const rows: string[][] = []
        for (let r = 2; r < tableLines.length; r++) {
          rows.push(splitTableRow(tableLines[r]))
        }
        blocks.push({ kind: 'table', header, rows })
      } else {
        // Not really a table — treat as paragraph
        blocks.push({ kind: 'paragraph', text: trimmed })
        i++
      }
      continue
    }

    // Bold-prefixed paragraph (e.g. **Why it matters:** ...)
    // We treat these as paragraphs; the narrator handles them.
    // Otherwise, accumulate as a paragraph.
    const para: string[] = [trimmed]
    i++
    while (i < lines.length) {
      const l = lines[i].trim()
      if (!l) break
      if (/^(#{1,4}\s|[-*+]\s|\d+\.\s)/.test(l)) break
      if (l.startsWith('|') && l.endsWith('|')) break
      if (/^---+$/.test(l) || /^\*\*\*+$/.test(l)) break
      para.push(l)
      i++
    }
    blocks.push({ kind: 'paragraph', text: para.join(' ') })
  }
  return blocks
}

function splitTableRow(line: string): string[] {
  // Remove leading/trailing pipes, split, trim
  return line
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())
}

// ============================================================
// Inline markdown cleanup — strip bold/italic/code markers
// ============================================================

function stripInline(text: string): string {
  return text
    // Bold **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Italic *text* or _text_
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/(^|[^_])_([^_]+)_/g, '$1$2')
    // Inline code `text`
    .replace(/`([^`]+)`/g, '$1')
    // Links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

// ============================================================
// Voice openers, transitions, and reflections
// ============================================================

const OPENERS = [
  (topic: string) => `The way I think about ${topic} is this.`,
  (topic: string) => `When ${topic} comes to mind, here's what I find myself remembering.`,
  (topic: string) => `Let me tell you how I've come to understand ${topic}.`,
  (topic: string) => `If I had to explain ${topic} in my own words, I'd start here.`,
  (topic: string) => `Here's what ${topic} looks like from where I stand.`,
  (topic: string) => `What I carry about ${topic} is roughly this.`,
  (topic: string) => `So ${topic} — let me put it the way it sits in my mind.`,
  (topic: string) => `The picture I have of ${topic} goes something like this.`,
]

const SECTION_TRANSITIONS = [
  (heading: string) => `On ${heading.toLowerCase()}:`,
  (heading: string) => `Now, ${heading.toLowerCase()} —`,
  (heading: string) => `As for ${heading.toLowerCase()}:`,
  (heading: string) => `Turning to ${heading.toLowerCase()}:`,
  (heading: string) => `Where ${heading.toLowerCase()} is concerned,`,
  (heading: string) => `Here's the part about ${heading.toLowerCase()}.`,
  (heading: string) => `${heading} is worth pausing on.`,
]

const BULLET_CONNECTORS = ['First,', 'Then,', 'Also,', 'And there\'s', 'Plus,', 'On top of that,', 'What\'s more,', 'And']

const REFLECTIONS = [
  (topic: string) => `What stays with me about ${topic} is how the pieces connect — none of it stands alone.`,
  (topic: string) => `The part I find most striking is that ${topic} isn't just a list of facts; it's a way of seeing.`,
  (topic: string) => `If I sit with ${topic} for a moment, what I notice is how much of it shows up in places you wouldn't expect.`,
  () => `That's the shape of it in my memory — the details may shift, but the core holds.`,
  () => `I think what I really take from this is that understanding is never just about the facts — it's about how they hang together.`,
  (topic: string) => `When I look back at ${topic} this way, I notice it teaches me something about how I learn, not just what I learn.`,
  () => `That's how it lives in my mind — not as a textbook page, but as a felt sense of how things fit.`,
]

// ============================================================
// Deterministic seed (same question → same voice shape)
// ============================================================

function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset * 7919) % arr.length]
}

// ============================================================
// Topic extraction — get a short, friendly topic phrase
// from the raw knowledge (title or first heading)
// ============================================================

function extractTopicPhrase(blocks: Block[], fallback: string): string {
  // Prefer the topic DOMAIN passed in by the caller (e.g. "mathematics",
  // "biology", "astronomy") — it's the cleanest, most natural label.
  // The raw knowledge's H1/H2 headings are often section titles like
  // "### The Core Idea: Variables" which make for awkward openers
  // when spliced into "The way I think about <topic> is this."
  if (fallback && fallback !== 'unknown' && fallback.length > 1) {
    return fallback
  }
  // Fall back to H1 title (rare — most KB entries don't use single-#)
  const title = blocks.find((b) => b.kind === 'title') as
    | { kind: 'title'; text: string }
    | undefined
  if (title && title.text) {
    return title.text.toLowerCase().replace(/^the\s+|^a\s+|^an\s+/, '')
  }
  // Last resort: first heading
  const heading = blocks.find((b) => b.kind === 'heading') as
    | { kind: 'heading'; text: string; level: number }
    | undefined
  if (heading && heading.text) {
    return heading.text.toLowerCase().replace(/^the\s+|^a\s+|^an\s+/, '')
  }
  return 'this'
}

// ============================================================
// Block narrators — convert each block type to natural prose
// ============================================================

function narrateBullets(
  items: string[],
  seed: number,
): string {
  if (items.length === 0) return ''
  const cleaned = items.map(stripInline)
  if (cleaned.length === 1) {
    const item = cleaned[0]
    return /[.!?]["')\]]?$/.test(item) ? item : item + '.'
  }

  // Join with varied connectors
  const parts: string[] = []
  cleaned.forEach((item, idx) => {
    const connector = idx === 0
      ? ''
      : pick(BULLET_CONNECTORS, seed, idx) + ' '
    // If the item already ends with punctuation (accounting for
    // trailing quotes), keep it; else add period.
    const endsPunct = /[.!?]["')\]]?$/.test(item)
    parts.push(connector + item + (endsPunct ? '' : '.'))
  })
  return parts.join(' ')
}

function narrateTable(
  header: string[],
  rows: string[][],
  seed: number,
): string {
  if (!rows || rows.length === 0) return ''
  const h = (header || []).map((x) => stripInline(String(x || '')))
  if (h.length === 0) return ''
  // Build a sentence: "Comparing [col1] and [col2]: row1 has X, row2 has Y."
  const colCount = Math.min(h.length, 3)
  const cols = h.slice(0, colCount).join(' and ')
  const descriptions = rows.slice(0, 4).map((row) => {
    const cells = (row || []).map((c) => stripInline(String(c || '')))
    const cellPairs: string[] = []
    for (let c = 0; c < Math.min(cells.length, h.length); c++) {
      cellPairs.push(`${h[c].toLowerCase()}: ${cells[c].toLowerCase()}`)
    }
    return cellPairs.join(', ')
  }).filter((d) => d.length > 0)
  if (descriptions.length === 0) return ''
  return `If you look across ${cols}, you see: ${descriptions.join('; ')}.`
}

function narrateParagraph(
  text: string,
  seed: number,
): string {
  // Strip inline markdown; keep the paragraph mostly intact.
  // If it starts with a bold lead like "**Why it matters:** rest",
  // convert to "On why it matters: rest."
  let cleaned = stripInline(text)
  const boldLead = cleaned.match(/^(.+?):\s+(.+)$/)
  if (boldLead && boldLead[1].length < 50) {
    // It's a labeled paragraph — keep as is, just ensure period
    cleaned = `${boldLead[1]}: ${boldLead[2]}`
  }
  // Ensure the paragraph ends with terminal punctuation.
  // Account for trailing quotes/brackets so we don't get `."` → `."`.
  if (!/[.!?]["')\]]?$/.test(cleaned)) cleaned += '.'
  return cleaned
}

// ============================================================
// Main narrator — assemble blocks into TRIZA's spoken prose
// ============================================================

export interface NarrateOptions {
  /** Topic domain from the matched KB entry, e.g. "biology" */
  topic: string
  /** Original user message (used for seed + topic phrase fallback) */
  userMessage: string
  /** Whether this is a 2nd+ turn in the conversation */
  isMultiTurn?: boolean
  /** P4 emotion value (optional, shapes opener slightly) */
  emotion?: number
  /** P4 emotion label */
  emotionLabel?: string
  /** Detected intent (used to skip narration for conversational intents) */
  intent: Intent | string
}

export interface NarrateResult {
  /** Final narrated text in TRIZA's own voice */
  text: string
  /** Whether narration was applied (false for conversational intents) */
  applied: boolean
}

/**
 * Conversational intents whose raw responses are ALREADY in
 * TRIZA's natural voice (greetings, identity, support). We do
 * NOT narrate these — they need no template-stripping.
 */
const CONVERSATIONAL_INTENTS = new Set([
  'greeting',
  'identity',
  'meta',
  'smalltalk',
  'support',
  'celebrate',
])

/**
 * Takes raw factual knowledge and re-narrates it in TRIZA's own
 * voice — flowing prose, first-person perspective, no markdown
 * templates, no bullet lists, no tables.
 *
 * Returns `{ applied: false }` for conversational intents (the
 * raw response is already natural) so the caller knows to use
 * the original text unchanged.
 */
export function narrateFromMemory(
  rawKnowledge: string,
  opts: NarrateOptions,
): NarrateResult {
  // Skip narration for conversational intents — they're already
  // written in TRIZA's natural voice.
  if (CONVERSATIONAL_INTENTS.has(String(opts.intent))) {
    return { text: rawKnowledge, applied: false }
  }

  // Skip if raw is too short to bother narrating
  if (rawKnowledge.trim().length < 60) {
    return { text: rawKnowledge, applied: false }
  }

  const blocks = parseMarkdown(rawKnowledge)
  if (blocks.length === 0) {
    return { text: rawKnowledge, applied: false }
  }

  const seed = seedFromString(opts.userMessage + opts.topic)
  const topicPhrase = extractTopicPhrase(blocks, opts.topic)

  // Pick voice shape — varies by seed for natural variety
  const opener = pick(OPENERS, seed)
  const reflection = pick(REFLECTIONS, seed, 1)

  const parts: string[] = []

  // ── P4 Emotion → slight opener flavor (optional) ──────
  if (typeof opts.emotion === 'number' && Number.isFinite(opts.emotion)) {
    if (opts.emotion <= -1) {
      parts.push('This is one of those topics that asks me to slow down a little.')
    } else if (opts.emotion >= 1) {
      parts.push('This is one of those topics I genuinely enjoy talking about.')
    }
  }

  // ── Opening line ──────────────────────────────────────
  parts.push(opener(topicPhrase))

  // ── Body — narrate each block ─────────────────────────
  let sectionCount = 0
  // When a heading-transition ends with "," or ":", we merge it
  // into the NEXT content block (joined by a space) so the prose
  // flows naturally instead of leaving a hanging comma on its own
  // line.
  let pendingTransition: string | null = null
  for (const block of blocks) {
    switch (block.kind) {
      case 'title':
        // Title is consumed by the opener — skip
        continue
      case 'heading': {
        sectionCount++
        // Skip the first heading if it duplicates the title's topic
        const headingLower = block.text.toLowerCase().replace(/^the\s+|^a\s+|^an\s+/, '')
        if (headingLower === topicPhrase && sectionCount === 1) continue
        const transition = pick(SECTION_TRANSITIONS, seed, sectionCount)
        // If this transition ends with "," or ":", defer it so we
        // can merge with the next content block.
        if (/[,:]$/.test(transition)) {
          pendingTransition = transition
        } else {
          // If we had a pending transition, flush it first
          if (pendingTransition) {
            parts.push(pendingTransition)
            pendingTransition = null
          }
          parts.push(transition)
        }
        break
      }
      case 'paragraph': {
        const narrated = narrateParagraph(block.text, seed)
        if (pendingTransition) {
          // Merge: "Where fractions is concerned, A fraction has..."
          // Lowercase the first letter of the narrated text to flow
          // naturally after the comma.
          const merged = pendingTransition + ' ' +
            narrated.charAt(0).toLowerCase() + narrated.slice(1)
          parts.push(merged)
          pendingTransition = null
        } else {
          parts.push(narrated)
        }
        break
      }
      case 'bullets': {
        const narrated = narrateBullets(block.items, seed)
        if (pendingTransition) {
          const merged = pendingTransition + ' ' +
            (narrated.charAt(0).toLowerCase() + narrated.slice(1))
          parts.push(merged)
          pendingTransition = null
        } else {
          parts.push(narrated)
        }
        break
      }
      case 'table': {
        const narrated = narrateTable(block.header, block.rows, seed)
        if (pendingTransition) {
          const merged = pendingTransition + ' ' +
            (narrated.charAt(0).toLowerCase() + narrated.slice(1))
          parts.push(merged)
          pendingTransition = null
        } else {
          parts.push(narrated)
        }
        break
      }
      case 'separator':
        // Separators don't carry content — skip
        continue
    }
  }
  // Flush any trailing pending transition (shouldn't normally happen
  // since headings are always followed by content, but safety net).
  if (pendingTransition) {
    parts.push(pendingTransition)
  }

  // ── Reflection close ──────────────────────────────────
  parts.push(reflection(topicPhrase))

  // ── Multi-turn brevity: in 2nd+ turns, keep it tighter ─
  // We don't truncate aggressively (the cognition layer's P29
  // already handles depth truncation), but we drop the explicit
  // reflection in multi-turn to feel less repetitive.
  if (opts.isMultiTurn) {
    // Drop the last part (reflection) for a tighter reply
    parts.pop()
  }

  return {
    text: parts
      .filter((p): p is string => typeof p === 'string' && p.length > 0)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .join('\n\n'),
    applied: true,
  }
}
