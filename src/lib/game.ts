import type { CategoryId, MigrationEffort, TechId } from "../data/types";
import { CATEGORIES } from "../data/categories";
import { getTech } from "../data";
import type { Stack, StackAnalysis } from "./scoring";
import type { Challenge } from "../data/challenges";
import type { Criterion } from "./challenge";
import { evaluateChallenge } from "./challenge";

/**
 * The game economy: change costs effort points, priced by the catalog's
 * migration-effort ratings. Architecture isn't picking the ideal stack —
 * it's finding the affordable path from where you are (ADR-010).
 */

export const EFFORT_COST: Record<MigrationEffort, number> = {
  "drop-in": 1,
  moderate: 2,
  rewrite: 4,
};

/** Adding to an empty slot / decommissioning a tech. */
export const ADD_COST = 1;
export const REMOVE_COST = 1;

/** Cost of swapping a slot from one tech to another (same category). */
export function swapCost(from: TechId, to: TechId): number {
  const forward = getTech(from).alternatives.find((a) => a.techId === to);
  const backward = getTech(to).alternatives.find((a) => a.techId === from);
  const efforts = [forward?.effort, backward?.effort].filter(
    (e): e is MigrationEffort => Boolean(e),
  );
  if (efforts.length === 0) return EFFORT_COST.rewrite; // unlisted swap = rebuild the layer
  return Math.min(...efforts.map((e) => EFFORT_COST[e]));
}

export interface StackChange {
  category: CategoryId;
  from?: TechId;
  to?: TechId;
  cost: number;
  label: string;
}

/** Itemized bill for getting from the stage's base stack to the current one. */
export function diffStacks(base: Stack, current: Stack): {
  changes: StackChange[];
  total: number;
} {
  const changes: StackChange[] = [];
  for (const c of CATEGORIES) {
    const from = base[c.id];
    const to = current[c.id];
    if (from === to) continue;
    if (from && to) {
      const cost = swapCost(from, to);
      changes.push({
        category: c.id,
        from,
        to,
        cost,
        label: `${getTech(from).name} → ${getTech(to).name}`,
      });
    } else if (!from && to) {
      changes.push({
        category: c.id,
        to,
        cost: ADD_COST,
        label: `add ${getTech(to).name}`,
      });
    } else if (from && !to) {
      changes.push({
        category: c.id,
        from,
        cost: REMOVE_COST,
        label: `decommission ${getTech(from).name}`,
      });
    }
  }
  return { changes, total: changes.reduce((n, ch) => n + ch.cost, 0) };
}

/* ---------- Game definitions ---------- */

export type GameMode = "crisis" | "campaign" | "rescue";

export interface GameStage {
  name: string;
  /** The scenario narrative — what just happened to you. */
  narrative: string;
  scenarioId: string;
  context: Challenge["context"];
  targets: Challenge["targets"];
  /** Effort points available this stage. Omit for a free build. */
  effortBudget?: number;
  hint: string;
}

export interface Game {
  id: string;
  mode: GameMode;
  name: string;
  brief: string;
  /** Stack you start stage 0 from ({} = greenfield). */
  startStack: Stack;
  stages: GameStage[];
  /**
   * One stack per stage that passes that stage's targets within budget,
   * starting from the previous stage's solution (or startStack). Not shown
   * in the UI — the audit script replays these through the real engine so
   * catalog rebalances can't silently make a game unwinnable (ADR-008/010).
   */
  knownSolution: Stack[];
}

export interface StageResult {
  criteria: Criterion[];
  passed: boolean;
  spent: number;
  budget?: number;
}

export function evaluateStage(
  stage: GameStage,
  analysis: StackAnalysis,
  base: Stack,
  current: Stack,
): StageResult {
  const { total } = diffStacks(base, current);
  const inner = evaluateChallenge({ targets: stage.targets }, analysis);
  const criteria = [...inner.criteria];
  if (stage.effortBudget !== undefined) {
    criteria.push({
      label: `Migration budget: ${total} / ${stage.effortBudget} effort points`,
      pass: total <= stage.effortBudget,
    });
  }
  return {
    criteria,
    passed: analysis.techs.length > 0 && criteria.every((c) => c.pass),
    spent: total,
    budget: stage.effortBudget,
  };
}
