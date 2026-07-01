/**
 * ============================================================================
 * P36 — MULTI-STEP PLANNING
 * ============================================================================
 *
 * Principle: Multi-Step Planning — Decompose → Adaptive Replan → Failure-
 * Branching. A goal is decomposed into a chain of dependent steps. If a
 * step fails, the agent either REPLANS in place (replace the failed step
 * with an alternative) or BRANCHES (create a sub-plan with the alternative
 * and try it). Execution is serial and dependency-ordered.
 *
 * Math:
 *   - decompose(goal, actions): produce 3-5 steps where step[i] depends
 *     on step[i-1] (linear chain). Each step's action comes from `actions`.
 *   - replan(plan, failedId, alternatives): produce a NEW plan where the
 *     failed step is replaced by the best alternative (longest action name
 *     = most specific). All statuses reset to 'pending'.
 *   - branchOnFailure(plan, stepId, alternatives): produce a BRANCH plan
 *     stored under plan.branches[stepId] with the failed step replaced.
 *   - execute(plan, executeStep): topologically execute steps. On failure
 *     of a step, attempt its branch (if any). Returns the final plan,
 *     whether all steps completed, and the list of failed step ids.
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface PlanStep {
  id: string;
  action: string;
  dependsOn: string[];
  status: 'pending' | 'in-progress' | 'done' | 'failed';
}

export interface Plan {
  goal: string;
  steps: PlanStep[];
  branches: Map<string, Plan>;
  createdAt: number;
}

let __planStepCounter: number = 0;
function generateStepId(): string {
  __planStepCounter++;
  return `step-${__planStepCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Decompose a goal into 3-5 sequential steps drawn from the available
 * actions. Each step depends on the previous one (linear chain).
 *
 * Principle: P36 — Multi-Step Planning (decompose).
 *
 * @param goal              The high-level goal.
 * @param availableActions  Pool of actions to draw steps from.
 */
export function decompose(goal: string, availableActions: string[]): PlanStep[] {
  if (availableActions.length === 0) return [];

  // Take between 3 and 5 steps (or all available if fewer than 3).
  const count: number = Math.min(5, Math.max(3, availableActions.length));
  const selected: string[] = availableActions.slice(0, count);

  const steps: PlanStep[] = [];
  let prevId: string | null = null;
  for (const action of selected) {
    const id: string = generateStepId();
    steps.push({
      id,
      action,
      dependsOn: prevId ? [prevId] : [],
      status: 'pending',
    });
    prevId = id;
  }
  return steps;
}

/**
 * Pick the "best" alternative by simple heuristic: the longest action
 * name is the most specific (most information). Returns null if the
 * list is empty.
 */
function pickBestAlternative(alternatives: string[]): string | null {
  if (alternatives.length === 0) return null;
  let best: string = alternatives[0];
  for (const a of alternatives) {
    if (a.length > best.length) best = a;
  }
  return best;
}

/**
 * Adaptive replan: produce a NEW plan where the failed step is replaced
 * by the best alternative. The original plan is NOT mutated — a new Plan
 * with a fresh steps array is returned. All step statuses reset to
 * 'pending' so the new plan can be re-executed from the top.
 *
 * Principle: P36 — Multi-Step Planning (adaptive replan).
 *
 * @param plan          The original plan.
 * @param failedStepId  The id of the step that failed.
 * @param alternatives  Alternative actions to choose from.
 */
export function replan(plan: Plan, failedStepId: string, alternatives: string[]): Plan {
  const best: string | null = pickBestAlternative(alternatives);
  const newSteps: PlanStep[] = plan.steps.map((s) => {
    if (s.id === failedStepId) {
      return {
        ...s,
        action: best ?? s.action,
        status: 'pending' as const,
      };
    }
    return { ...s, status: 'pending' as const };
  });

  return {
    goal: plan.goal,
    steps: newSteps,
    branches: new Map(plan.branches),
    createdAt: Date.now(),
  };
}

/**
 * Branch on failure: create a branch plan (with the failed step replaced
 * by the best alternative) and store it under plan.branches[stepId].
 * Returns a NEW plan with the branch added (the original is not mutated).
 *
 * Principle: P36 — Multi-Step Planning (failure-branching).
 *
 * @param plan          The original plan.
 * @param stepId        The id of the failing step.
 * @param alternatives  Alternative actions for the branch.
 */
export function branchOnFailure(plan: Plan, stepId: string, alternatives: string[]): Plan {
  const branch: Plan = replan(plan, stepId, alternatives);
  const newBranches: Map<string, Plan> = new Map(plan.branches);
  newBranches.set(stepId, branch);
  return {
    goal: plan.goal,
    steps: plan.steps.map((s) => ({ ...s })),
    branches: newBranches,
    createdAt: plan.createdAt,
  };
}

/**
 * Topologically sort plan steps by their dependencies. Returns the
 * sorted steps in execution order. Assumes dependencies are acyclic.
 */
function topoSort(steps: PlanStep[]): PlanStep[] {
  const byId: Map<string, PlanStep> = new Map(steps.map((s) => [s.id, s] as [string, PlanStep]));
  const visited: Set<string> = new Set();
  const result: PlanStep[] = [];

  function visit(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const step = byId.get(id);
    if (!step) return;
    for (const dep of step.dependsOn) {
      visit(dep);
    }
    result.push(step);
  }

  for (const s of steps) visit(s.id);
  return result;
}

/**
 * Execute a plan serially in dependency order. The caller supplies an
 * `executeStep` callback that returns 'done' or 'failed' for each step.
 * On failure, if a branch exists for that step, the branch plan is
 * executed recursively. If the branch completes, the original step is
 * marked 'done'. Returns the final plan state, whether all steps
 * completed, and the list of failed step ids.
 *
 * Principle: P36 — Multi-Step Planning (execute with failure-branching).
 *
 * @param plan         The plan to execute.
 * @param executeStep  Callback that actually performs each step.
 */
export function execute(
  plan: Plan,
  executeStep: (step: PlanStep) => 'done' | 'failed'
): { plan: Plan; completed: boolean; failures: string[] } {
  const failures: string[] = [];
  const ordered: PlanStep[] = topoSort(plan.steps);
  let allDone: boolean = true;

  for (const step of ordered) {
    if (step.status === 'done') continue;

    // Skip steps whose dependencies failed.
    const depFailed: boolean = step.dependsOn.some((depId) => failures.includes(depId));
    if (depFailed) {
      step.status = 'failed';
      failures.push(step.id);
      allDone = false;
      continue;
    }

    step.status = 'in-progress';
    const result: 'done' | 'failed' = executeStep(step);

    if (result === 'done') {
      step.status = 'done';
    } else {
      step.status = 'failed';
      failures.push(step.id);
      allDone = false;

      // Attempt branch if one exists.
      const branch: Plan | undefined = plan.branches.get(step.id);
      if (branch) {
        const branchResult = execute(branch, executeStep);
        if (branchResult.completed) {
          // Branch succeeded — mark the original step as done and
          // remove it from the failures list.
          step.status = 'done';
          const idx: number = failures.lastIndexOf(step.id);
          if (idx >= 0) failures.splice(idx, 1);
          allDone = true;
        }
      }
    }
  }

  return { plan, completed: allDone && failures.length === 0, failures };
}
