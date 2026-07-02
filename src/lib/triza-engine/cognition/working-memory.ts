/**
 * ============================================================================
 * P35 — WORKING MEMORY BUFFER
 * ============================================================================
 *
 * Principle: Working Memory Buffer — capacity-limited, rehearsal-driven,
 * serial-process. Working memory is the small "scratchpad" where the
 * agent holds the current task's active items. Miller's 7±2 rule, taken
 * conservatively at 4. Activation decays over time; rehearsal boosts it.
 * Items reaching 0 activation are evicted. Processing is SERIAL — one
 * item at a time — to model the focus of attention.
 *
 * Math:
 *   - add(content): item.activation = 1.0, item.lastRehearsed = now.
 *       If buffer overflows, evict the lowest-activation item.
 *   - rehearse(id, now): activation = min(1.0, activation + 0.3),
 *       lastRehearsed = now.
 *   - decay(now): for each item,
 *       activation -= (now − lastRehearsed) / 60000 × 0.1
 *     (i.e. every minute of un-rehearsed time costs 0.1 activation).
 *     Items reaching activation ≤ 0 are evicted.
 *   - process(serially): apply the callback to each item, one at a time.
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface WMItem {
  id: string;
  content: string;
  activation: number;
  lastRehearsed: number;
}

/**
 * Generate a reasonably-unique id without external dependencies.
 * Uses a counter + timestamp + random.
 */
let __wmIdCounter: number = 0;
function generateId(): string {
  __wmIdCounter++;
  return `wm-${Date.now().toString(36)}-${__wmIdCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * WorkingMemory — capacity-limited, rehearsal-driven, serial-process
 * working memory buffer. Default capacity 4 (Miller's 7±2, conservative).
 */
export class WorkingMemory {
  private buffer: WMItem[] = [];
  private capacity: number;

  constructor(capacity: number = 4) {
    this.capacity = capacity;
  }

  /**
   * Add a new item to working memory. The item starts with full
   * activation (1.0). If the buffer is over capacity, the
   * lowest-activation item is evicted.
   *
   * Principle: P35 — Working Memory Buffer.
   * Math: item.activation = 1.0; evict if |buffer| > capacity.
   *
   * @param content  The content to hold in working memory.
   * @returns        The id of the new item.
   */
  add(content: string): string {
    const id: string = generateId();
    const now: number = Date.now();
    const item: WMItem = {
      id,
      content,
      activation: 1.0,
      lastRehearsed: now,
    };
    this.buffer.push(item);

    // Evict lowest-activation item if over capacity.
    while (this.buffer.length > this.capacity) {
      let lowestIdx: number = 0;
      for (let i = 1; i < this.buffer.length; i++) {
        if (this.buffer[i].activation < this.buffer[lowestIdx].activation) {
          lowestIdx = i;
        }
      }
      this.buffer.splice(lowestIdx, 1);
    }

    return id;
  }

  /**
   * Rehearse an item — boosts its activation by 0.3 (clamped at 1.0)
   * and updates lastRehearsed to `now`. No-op if the id is unknown.
   *
   * Principle: P35 — Working Memory Buffer (rehearsal-driven).
   * Math: activation = min(1.0, activation + 0.3); lastRehearsed = now.
   *
   * @param id   The id of the item to rehearse.
   * @param now  Current timestamp (ms).
   */
  rehearse(id: string, now: number): void {
    const item = this.buffer.find((i) => i.id === id);
    if (!item) return;
    item.activation = Math.min(1.0, item.activation + 0.3);
    item.lastRehearsed = now;
  }

  /**
   * Apply time-based decay to every item. Each item's activation is
   * reduced by (now − lastRehearsed) / 60000 × 0.1 — every minute of
   * un-rehearsed time costs 0.1 activation. Items reaching activation
   * ≤ 0 are evicted.
   *
   * Principle: P35 — Working Memory Buffer.
   * Math: activation -= (now − lastRehearsed) / 60000 × 0.1.
   *
   * @param now  Current timestamp (ms).
   */
  decay(now: number): void {
    const survivors: WMItem[] = [];
    for (const item of this.buffer) {
      const elapsedMin: number = Math.max(0, (now - item.lastRehearsed) / 60000);
      item.activation -= elapsedMin * 0.1;
      if (item.activation > 0) {
        survivors.push(item);
      }
    }
    this.buffer = survivors;
  }

  /**
   * Recall an item by id. Returns null if the id is not in the buffer.
   *
   * Principle: P35 — Working Memory Buffer.
   *
   * @param id  The id of the item to recall.
   */
  recall(id: string): WMItem | null {
    const item = this.buffer.find((i) => i.id === id);
    return item ?? null;
  }

  /**
   * Return a copy of the current buffer contents.
   *
   * Principle: P35 — Working Memory Buffer.
   */
  contents(): WMItem[] {
    return [...this.buffer];
  }

  /**
   * Serially process every item in the buffer — the callback is
   * invoked once per item, in order. Models the focus of attention
   * moving from one item to the next.
   *
   * Principle: P35 — Working Memory Buffer (serial-process).
   *
   * @param serially  Callback invoked once per item, one at a time.
   */
  process(serially: (item: WMItem) => void): void {
    for (const item of this.buffer) {
      serially(item);
    }
  }
}
