import type {
  CategoryId,
  Commitment,
  ContextModifier,
  DimensionKey,
  OrgContext,
  Relation,
  Tech,
  TechId,
} from "../data/types";
import { DIMENSIONS } from "../data/dimensions";
import { CATEGORIES } from "../data/categories";
import { CONTEXT_MODIFIERS } from "../data/context";
import { getTech } from "../data";

export type Weights = Record<DimensionKey, number>;

/* ---------- Context: effective scores ---------- */

export interface EffectiveTech {
  tech: Tech;
  /** Base scores with matching context modifiers applied, clamped to 0–10. */
  scores: Record<DimensionKey, number>;
  /** The modifiers that fired — every adjustment shows its work. */
  applied: ContextModifier[];
}

function modifierMatches(mod: ContextModifier, ctx: OrgContext): boolean {
  if (mod.when.teamSize && !mod.when.teamSize.includes(ctx.teamSize))
    return false;
  if (
    mod.when.platformTeam !== undefined &&
    mod.when.platformTeam !== ctx.platformTeam
  )
    return false;
  if (
    mod.when.compliance !== undefined &&
    mod.when.compliance !== ctx.compliance
  )
    return false;
  return true;
}

export function effective(tech: Tech, ctx: OrgContext): EffectiveTech {
  const applied = CONTEXT_MODIFIERS.filter(
    (m) => m.techId === tech.id && modifierMatches(m, ctx),
  );
  const scores = { ...tech.scores };
  for (const mod of applied) {
    for (const [dim, delta] of Object.entries(mod.delta)) {
      const key = dim as DimensionKey;
      scores[key] = Math.min(10, Math.max(0, scores[key] + (delta ?? 0)));
    }
  }
  return { tech, scores, applied };
}

/* ---------- Weighted scores ---------- */

/** Weighted score of a score record, normalized back to 0–10. */
export function weightedOf(
  scores: Record<DimensionKey, number>,
  weights: Weights,
): number {
  let num = 0;
  let den = 0;
  for (const d of DIMENSIONS) {
    num += scores[d.key] * weights[d.key];
    den += weights[d.key];
  }
  return den === 0 ? 0 : num / den;
}

export function weightedScore(
  tech: Tech,
  weights: Weights,
  ctx?: OrgContext,
): number {
  return weightedOf(ctx ? effective(tech, ctx).scores : tech.scores, weights);
}

/* ---------- Emergent stack aggregation ----------
 * A stack's properties are not the average of its parts (ADR-007):
 * - floor dimensions: the worst layer sets the system's value. Your pager
 *   doesn't average; one untyped seam breaks end-to-end type safety; the
 *   least scalable layer is the bottleneck.
 * - average dimensions: costs that accumulate roughly linearly (learning
 *   each part, ecosystem depth, day-to-day friction).
 */

export const AGGREGATION: Record<DimensionKey, "floor" | "average"> = {
  performance: "floor",
  scalability: "floor",
  opsSimplicity: "floor",
  typeSafety: "floor",
  maturity: "floor",
  devVelocity: "average",
  learningEase: "average",
  ecosystem: "average",
};

export type Stack = Partial<Record<CategoryId, TechId>>;

export interface StackNote {
  kind: "synergy" | "warning" | "blocker";
  text: string;
}

export interface StackAnalysis {
  techs: Tech[];
  eff: EffectiveTech[];
  notes: StackNote[];
  /** What averaging claims the stack looks like. */
  averageProfile: Record<DimensionKey, number>;
  /** What the stack actually behaves like (floors on floor dimensions). */
  emergentProfile: Record<DimensionKey, number>;
  /** For floor dimensions: which layer sets the floor. */
  culprits: Partial<Record<DimensionKey, Tech>>;
  /** Weighted overall from the emergent profile — the honest number. */
  overall: number;
  /** Weighted overall from the average profile — shown to teach the gap. */
  naiveOverall: number;
  /** The obligations ledger: what this stack signs the team up for. */
  commitments: { tech: Tech; items: Commitment[] }[];
}

export function analyzeStack(
  stack: Stack,
  weights: Weights,
  ctx: OrgContext,
): StackAnalysis {
  const techs = CATEGORIES.map((c) => stack[c.id])
    .filter((id): id is TechId => Boolean(id))
    .map(getTech);
  const eff = techs.map((t) => effective(t, ctx));
  const ids = new Set(techs.map((t) => t.id));
  const notes: StackNote[] = [];

  // Hard ecosystem constraints: an ecosystem-bound tech needs a backend from
  // the same ecosystem (the backend defines the ecosystem; it can't violate itself).
  const backend = techs.find((t) => t.category === "backend");
  for (const t of techs) {
    if (!t.ecosystem || t.category === "backend") continue;
    if (!backend) {
      notes.push({
        kind: "warning",
        text: `${t.name} is a ${ecosystemName(t.ecosystem)} technology — pick a backend so compatibility can be checked.`,
      });
    } else if (backend.ecosystem !== t.ecosystem) {
      notes.push({
        kind: "blocker",
        text: `${t.name} is a ${ecosystemName(t.ecosystem)} library — it can't run on ${backend.name} (${ecosystemName(backend.ecosystem ?? "agnostic")}). Swap one side of this pair.`,
      });
    }
  }

  // Curated synergy / friction edges among the selected techs. Edges are
  // authored on both sides for the Swap Map, so dedupe symmetric pairs here.
  const seenPairs = new Set<string>();
  for (const t of techs) {
    for (const rel of t.pairsWellWith ?? []) {
      const key = `s:${[t.id, rel.techId].sort().join("+")}`;
      if (ids.has(rel.techId) && !seenPairs.has(key)) {
        seenPairs.add(key);
        notes.push({
          kind: "synergy",
          text: `${t.name} + ${getTech(rel.techId).name}: ${rel.note}`,
        });
      }
    }
    for (const rel of t.frictionWith ?? []) {
      const key = `f:${[t.id, rel.techId].sort().join("+")}`;
      if (ids.has(rel.techId) && !seenPairs.has(key)) {
        seenPairs.add(key);
        notes.push({
          kind: "warning",
          text: `${t.name} + ${getTech(rel.techId).name}: ${rel.note}`,
        });
      }
    }
  }

  const averageProfile = {} as Record<DimensionKey, number>;
  const emergentProfile = {} as Record<DimensionKey, number>;
  const culprits: Partial<Record<DimensionKey, Tech>> = {};

  for (const d of DIMENSIONS) {
    if (eff.length === 0) {
      averageProfile[d.key] = 0;
      emergentProfile[d.key] = 0;
      continue;
    }
    const avg = eff.reduce((s, e) => s + e.scores[d.key], 0) / eff.length;
    averageProfile[d.key] = avg;
    if (AGGREGATION[d.key] === "floor") {
      let worst = eff[0];
      for (const e of eff) if (e.scores[d.key] < worst.scores[d.key]) worst = e;
      emergentProfile[d.key] = worst.scores[d.key];
      culprits[d.key] = worst.tech;
    } else {
      emergentProfile[d.key] = avg;
    }
  }

  const overall = eff.length ? weightedOf(emergentProfile, weights) : 0;
  const naiveOverall = eff.length ? weightedOf(averageProfile, weights) : 0;

  const commitments = techs
    .filter((t) => (t.commitments ?? []).length > 0)
    .map((t) => ({ tech: t, items: t.commitments! }));

  return {
    techs,
    eff,
    notes,
    averageProfile,
    emergentProfile,
    culprits,
    overall,
    naiveOverall,
    commitments,
  };
}

/* ---------- Stress lens: architecture over time ---------- */

export interface StressEvent {
  id: string;
  name: string;
  description: string;
  /** Dimensions this event leans on. */
  focus: DimensionKey[];
  /** Effective scores strictly below this crack under the event. */
  threshold: number;
}

export const STRESS_EVENTS: StressEvent[] = [
  {
    id: "traffic-10x",
    name: "Traffic ×10",
    description:
      "The launch worked. Sustained traffic is ten times yesterday's, and it isn't going back down.",
    focus: ["performance", "scalability"],
    threshold: 5,
  },
  {
    id: "team-5x",
    name: "Team ×5",
    description:
      "Funding landed; headcount quintuples over 18 months. The codebase everyone knew becomes the codebase nobody knows.",
    focus: ["scalability", "typeSafety"],
    threshold: 5,
  },
  {
    id: "compliance-lands",
    name: "Compliance lands",
    description:
      "Your biggest prospect requires SOC 2 and full auditability. What was culture is now evidence.",
    focus: ["maturity", "typeSafety"],
    threshold: 5,
  },
];

export interface StressCrack {
  tech: Tech;
  dim: DimensionKey;
  score: number;
  /** Same-category exits, easiest migration first. */
  exits: Relation[];
}

const EFFORT_ORDER = { "drop-in": 0, moderate: 1, rewrite: 2 } as const;

export function stressTest(
  analysis: StackAnalysis,
  event: StressEvent,
): StressCrack[] {
  const cracks: StressCrack[] = [];
  for (const e of analysis.eff) {
    for (const dim of event.focus) {
      if (e.scores[dim] < event.threshold) {
        const exits = e.tech.alternatives
          .filter((a) => getTech(a.techId).category === e.tech.category)
          .sort(
            (a, b) =>
              (EFFORT_ORDER[a.effort ?? "rewrite"] ?? 2) -
              (EFFORT_ORDER[b.effort ?? "rewrite"] ?? 2),
          )
          .slice(0, 2);
        cracks.push({ tech: e.tech, dim, score: e.scores[dim], exits });
      }
    }
  }
  return cracks;
}

/* ---------- Misc ---------- */

export function ecosystemName(eco: NonNullable<Tech["ecosystem"]>): string {
  switch (eco) {
    case "dotnet":
      return ".NET";
    case "node":
      return "Node.js/TypeScript";
    case "jvm":
      return "JVM";
    case "python":
      return "Python";
    case "go":
      return "Go";
    case "rust":
      return "Rust";
    case "agnostic":
      return "ecosystem-agnostic";
  }
}
