import type { CategoryId, DimensionKey, OrgContext, TechId } from "./types";

/**
 * Challenge cards: scenarios to design against, validated live by the same
 * engine that powers the Stack Builder (ADR-008 — one source of truth).
 * Floors check the EMERGENT profile, so weakest-link thinking is required
 * to pass, not just a good average.
 */
export interface Challenge {
  id: string;
  name: string;
  brief: string;
  /** Scenario preset to lock the weights to. */
  scenarioId: string;
  /** Org context the challenge takes place in. */
  context: OrgContext;
  /** Optional starting stack (rescue missions start broken). */
  presetStack?: Partial<Record<CategoryId, TechId>>;
  targets: {
    minOverall?: number;
    noBlockers?: boolean;
    maxWarnings?: number;
    /** Minimum EMERGENT profile values — the weakest link must clear these. */
    floors?: Partial<Record<DimensionKey, number>>;
    requiredLayers?: CategoryId[];
  };
  hint: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "weekend-dream",
    name: "A weekend and a dream",
    brief:
      "You're one person building a product on evenings and weekends. Anything that needs babysitting in production kills the project — design for maximum sleep.",
    scenarioId: "solo-side-project",
    context: { teamSize: "small", platformTeam: false, compliance: false },
    targets: {
      minOverall: 7,
      noBlockers: true,
      maxWarnings: 0,
      floors: { opsSimplicity: 7 },
    },
    hint: "The ops floor is the trap: one 'interesting' infrastructure choice sets it. Boring is the strategy, and optional layers you skip can't page you.",
  },
  {
    id: "edi-backbone",
    name: "The EDI backbone",
    brief:
      "A B2B integration platform: partner feeds, async document flows, auditors on the guest list. 20 devs, no platform team, compliance is real. It must still be running — and provable — in ten years.",
    scenarioId: "integration-heavy",
    context: { teamSize: "mid", platformTeam: false, compliance: true },
    targets: {
      minOverall: 7,
      noBlockers: true,
      maxWarnings: 1,
      floors: { maturity: 6, opsSimplicity: 4 },
      requiredLayers: ["messaging", "auth"],
    },
    hint: "You need messaging, but the flashy broker sets your ops floor without a platform team. Which queue semantics do document flows actually need?",
  },
  {
    id: "hypergrowth",
    name: "Hypergrowth",
    brief:
      "Series C landed. Traffic doubles quarterly, headcount is 80 and climbing, and there's a real platform team. Design the system that scales in requests AND in teams.",
    scenarioId: "high-scale",
    context: { teamSize: "large", platformTeam: true, compliance: false },
    targets: {
      minOverall: 7,
      noBlockers: true,
      floors: { scalability: 8, performance: 6 },
    },
    hint: "The platform team flips several ops scores — infrastructure that would be reckless at 10 devs is table stakes here. Your floor risk moves to the layers that don't scale out.",
  },
  {
    id: "regulated-fintech",
    name: "Regulated fintech",
    brief:
      "Payments adjacent, auditor-heavy, 25 devs. Correctness and a paper trail beat velocity every time — one bad audit finding costs more than a year of feature work.",
    scenarioId: "regulated",
    context: { teamSize: "mid", platformTeam: false, compliance: true },
    targets: {
      minOverall: 7,
      noBlockers: true,
      maxWarnings: 1,
      floors: { typeSafety: 6, maturity: 7 },
    },
    hint: "The type-safety floor is end-to-end: one untyped seam (in ANY layer) sets it. Check your frontend and API style, not just the backend.",
  },
  {
    id: "rescue-mission",
    name: "Rescue mission",
    brief:
      "You inherited this stack from a consultancy that billed by the buzzword. It has a hard incompatibility and combinations that fight each other. Fix it without throwing everything away — keep the overall fit at 6.5 or better.",
    scenarioId: "balanced",
    context: { teamSize: "mid", platformTeam: false, compliance: false },
    presetStack: {
      architecture: "monolith",
      frontend: "nextjs",
      backend: "aspnet-core",
      "api-style": "trpc",
      "data-access": "ef-core",
      database: "mongodb",
      caching: "redis",
      messaging: "kafka",
      auth: "session-auth",
      hosting: "kubernetes",
    },
    targets: {
      minOverall: 6.5,
      noBlockers: true,
      maxWarnings: 0,
    },
    hint: "Start with the blocker (tRPC needs a Node backend — which side of that pair fits the rest?), then hunt the frictions: Kafka under a monolith, K8s for one deployable, two servers fighting over rendering.",
  },
  {
    id: "boring-is-a-feature",
    name: "Boring is a feature",
    brief:
      "A 40-developer enterprise replacing a legacy line-of-business suite. Teams rotate yearly; the system outlives everyone's tenure. Optimize for the tenth year, not the first demo.",
    scenarioId: "enterprise-lob",
    context: { teamSize: "large", platformTeam: false, compliance: true },
    targets: {
      minOverall: 7.2,
      noBlockers: true,
      floors: { maturity: 8, opsSimplicity: 5 },
    },
    hint: "Large team, no platform team — the guardrail frameworks get context bonuses here and the exciting infrastructure gets none. Maturity floor 8 rules out anything that reworked itself recently.",
  },
];
