/**
 * P10 — Intrinsic Goals (Layer II: Structure & Composition)
 * ---------------------------------------------------------
 * Principle: AI khud goal banaye — memory se (jo dekha) + momentum se
 * (jo chal raha tha). The AI generates its own goals from two intrinsic
 * sources: gaps in memory ("I saw X but I don't understand it") and
 * momentum ("I was just doing X, so I should continue X-related work").
 *
 * Math: `Goal = (target, source, strength) + priority queue`. Each goal
 * carries a target string, a source tag, a base strength, and a priority
 * computed from strength × recency (decays over hours). Goals are stored
 * in a max-heap keyed by priority.
 *
 * This file is self-contained: no imports.
 */

/** Where a goal came from. */
export type GoalSource = 'memory' | 'momentum' | 'curiosity';

/** A single intrinsic goal. */
export interface Goal {
  id: string;
  target: string;
  source: GoalSource;
  strength: number;
  createdAt: number;
  priority: number;
}

/**
 * Priority queue (max-heap by priority) for intrinsic goals.
 *
 * Principle: P10 — Intrinsic Goals.
 * Math: `Goal = (target, source, strength) + priority queue`. The queue is a
 * binary max-heap on `priority`; `next()` returns the highest-priority goal.
 */
export class GoalQueue {
  private readonly _heap: Goal[] = [];

  /** Number of goals currently in the queue. */
  get size(): number {
    return this._heap.length;
  }

  /** Insert a goal into the queue. */
  add(goal: Goal): void {
    this._heap.push(goal);
    this._siftUp(this._heap.length - 1);
  }

  /** Peek at the highest-priority goal without removing it. */
  peek(): Goal | null {
    return this._heap.length > 0 ? this._heap[0] : null;
  }

  /** Remove and return the highest-priority goal. */
  next(): Goal | null {
    if (this._heap.length === 0) {
      return null;
    }
    const top: Goal = this._heap[0];
    const last: Goal = this._heap.pop() as Goal;
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  /** Remove a goal by id. Returns true if a goal was removed. */
  remove(id: string): boolean {
    const idx: number = this._heap.findIndex((g) => g.id === id);
    if (idx === -1) {
      return false;
    }
    const last: Goal = this._heap.pop() as Goal;
    if (idx < this._heap.length) {
      this._heap[idx] = last;
      // Restore heap property in both directions.
      this._siftUp(idx);
      this._siftDown(idx);
    }
    return true;
  }

  /** Snapshot of all goals (unordered). Does not mutate the queue. */
  all(): Goal[] {
    return [...this._heap];
  }

  /** Move the element at idx up until the heap property is restored. */
  private _siftUp(idx: number): void {
    let i: number = idx;
    while (i > 0) {
      const parentIdx: number = Math.floor((i - 1) / 2);
      if (this._heap[i].priority <= this._heap[parentIdx].priority) {
        break;
      }
      this._swap(i, parentIdx);
      i = parentIdx;
    }
  }

  /** Move the element at idx down until the heap property is restored. */
  private _siftDown(idx: number): void {
    const n: number = this._heap.length;
    let i: number = idx;
    while (true) {
      const left: number = 2 * i + 1;
      const right: number = 2 * i + 2;
      let largest: number = i;
      if (left < n && this._heap[left].priority > this._heap[largest].priority) {
        largest = left;
      }
      if (
        right < n &&
        this._heap[right].priority > this._heap[largest].priority
      ) {
        largest = right;
      }
      if (largest === i) {
        break;
      }
      this._swap(i, largest);
      i = largest;
    }
  }

  private _swap(a: number, b: number): void {
    const tmp: Goal = this._heap[a];
    this._heap[a] = this._heap[b];
    this._heap[b] = tmp;
  }
}

/**
 * Generate intrinsic goals from gaps in memory.
 *
 * Principle: P10 — Intrinsic Goals.
 * Math: `Goal = (target, source='memory', strength)`. For each distinct
 * memory entry, frequency = count of occurrences; strength scales with
 * frequency (more-mentioned = higher strength). The target is the memory
 * entry itself, framed as "understand X".
 *
 * @param memory raw memory entries (strings). Duplicates allowed.
 * @returns array of Goals, one per distinct memory entry.
 */
export function generateFromMemory(memory: string[]): Goal[] {
  const freq: Map<string, number> = new Map();
  for (const m of memory) {
    freq.set(m, (freq.get(m) ?? 0) + 1);
  }
  const now: number = Date.now();
  const goals: Goal[] = [];
  for (const [entry, count] of freq) {
    // Strength scales with how often the entry appears (log-smoothed).
    const strength: number = Math.log(1 + count) / Math.log(1 + memory.length + 1);
    const target: string = `understand:${entry}`;
    const priority: number = priorityOf(
      {
        id: `goal-mem:${entry}`,
        target,
        source: 'memory',
        strength,
        createdAt: now,
        priority: 0, // computed below
      },
      now,
    );
    goals.push({
      id: `goal-mem:${entry}`,
      target,
      source: 'memory',
      strength,
      createdAt: now,
      priority,
    });
  }
  return goals;
}

/**
 * Generate intrinsic goals from momentum — continue what was just happening.
 *
 * Principle: P10 — Intrinsic Goals.
 * Math: `Goal = (target, source='momentum', strength)`. The most recent
 * activity in `history` gets the highest strength (recency-weighted). Goals
 * are produced for each recent activity, but the most recent ones dominate.
 *
 * @param currentActivity what the AI is doing right now
 * @param history the AI's recent activity trace (oldest → newest)
 * @returns array of Goals continuing currentActivity + recent history
 */
export function generateFromMomentum(
  currentActivity: string,
  history: string[],
): Goal[] {
  const now: number = Date.now();
  const goals: Goal[] = [];
  // The current activity is always the strongest momentum goal.
  const currentGoal: Goal = {
    id: `goal-mom:current:${currentActivity}`,
    target: `continue:${currentActivity}`,
    source: 'momentum',
    strength: 1.0,
    createdAt: now,
    priority: 0,
  };
  currentGoal.priority = priorityOf(currentGoal, now);
  goals.push(currentGoal);

  // History items contribute too, but strength decays with age.
  const n: number = history.length;
  for (let i: number = 0; i < n; i += 1) {
    const activity: string = history[i];
    // i = n-1 is the most recent; recency weight = (i+1)/n.
    const recencyWeight: number = (i + 1) / Math.max(1, n);
    const strength: number = 0.5 * recencyWeight;
    const goal: Goal = {
      id: `goal-mom:hist:${i}:${activity}`,
      target: `continue:${activity}`,
      source: 'momentum',
      strength,
      createdAt: now - (n - i) * 1000, // pseudo-timestamps spread over seconds
      priority: 0,
    };
    goal.priority = priorityOf(goal, now);
    goals.push(goal);
  }
  return goals;
}

/**
 * Compute the priority of a goal at time `now`.
 *
 * Principle: P10 — Intrinsic Goals.
 * Math: `priority = strength × recency` where
 * `recency = 1 / (1 + (now − createdAt) / 3_600_000)` (decays over hours).
 *
 * @param goal the goal to score
 * @param now current epoch milliseconds
 * @returns priority value (≥ 0; higher = more important right now)
 */
export function priorityOf(goal: Goal, now: number): number {
  const ageMs: number = Math.max(0, now - goal.createdAt);
  const recency: number = 1 / (1 + ageMs / 3_600_000);
  return goal.strength * recency;
}
