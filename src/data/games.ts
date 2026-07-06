import type { Game } from "../lib/game";

/**
 * Scenario games: architect your way OUT of something. Where Challenges ask
 * "design well from scratch," games start you somewhere concrete and price
 * every change with the catalog's migration-effort ratings — because real
 * architecture is finding the affordable path, not the ideal endpoint.
 *
 * Every game carries a knownSolution replayed by `npm run audit:data`
 * through the real engine, so a catalog rebalance can never silently make
 * a game unwinnable.
 */
export const GAMES: Game[] = [
  {
    id: "black-friday",
    mode: "crisis",
    name: "Black Friday is coming",
    brief:
      "Your boring-on-purpose Python monolith just got picked for a national retail partnership. Sustained traffic will be ten times today's — in six weeks. The stack that was right is about to be wrong.",
    startStack: {
      architecture: "monolith",
      frontend: "htmx",
      backend: "django",
      "api-style": "rest",
      "data-access": "sqlalchemy",
      database: "sqlite",
      auth: "session-auth",
      hosting: "vms",
    },
    stages: [
      {
        name: "Six weeks to impact",
        narrative:
          "The partnership is signed. Ten-times traffic, sustained, starting Black Friday. Your performance and scalability floors are about to become headlines — fix them with the engineering time you actually have.",
        scenarioId: "high-scale",
        context: { teamSize: "small", platformTeam: false, compliance: false },
        targets: {
          noBlockers: true,
          floors: { performance: 6, scalability: 5 },
        },
        effortBudget: 9,
        hint: "SQLite and Django set both floors — the database swap is cheap, the backend swap is not. And check the catalog: Go has no data-access entry, because that ecosystem writes SQL directly. Decommissioning a layer is a legitimate (and cheap) move.",
      },
    ],
    knownSolution: [
      {
        architecture: "modular-monolith",
        frontend: "htmx",
        backend: "go-http",
        "api-style": "rest",
        database: "postgres",
        auth: "session-auth",
        hosting: "vms",
      },
    ],
  },
  {
    id: "audit-clock",
    mode: "crisis",
    name: "The audit clock",
    brief:
      "Your full-stack TypeScript startup just landed its first enterprise customer. The contract has one condition: SOC 2 within 90 days. What was culture is now evidence.",
    startStack: {
      architecture: "monolith",
      frontend: "nextjs",
      backend: "fastify",
      "api-style": "trpc",
      "data-access": "prisma",
      database: "postgres",
      auth: "managed-idp",
      hosting: "static-edge",
    },
    stages: [
      {
        name: "Ninety days",
        narrative:
          "The auditors want maturity they can point at and infrastructure with a change-control story. Your youngest, cleverest choices are now your riskiest line items — and you have one quarter of engineering time.",
        scenarioId: "regulated",
        context: { teamSize: "mid", platformTeam: false, compliance: true },
        targets: {
          noBlockers: true,
          maxWarnings: 0,
          floors: { maturity: 7, typeSafety: 4 },
        },
        effortBudget: 4,
        hint: "Two layers set your maturity and type-safety floors, and the budget covers exactly two moderate swaps. Which two of your choices would an auditor circle in red?",
      },
    ],
    knownSolution: [
      {
        architecture: "monolith",
        frontend: "nextjs",
        backend: "fastify",
        "api-style": "rest",
        "data-access": "prisma",
        database: "postgres",
        auth: "managed-idp",
        hosting: "paas-containers",
      },
    ],
  },
  {
    id: "garage-to-ipo",
    mode: "campaign",
    name: "Garage to IPO",
    brief:
      "Three eras, one codebase. Build a stack as a solo founder, survive hypergrowth, then pass the IPO filing — carrying your early choices the whole way. Early decisions with cheap exits win this game.",
    startStack: {},
    stages: [
      {
        name: "Era 1 — The garage",
        narrative:
          "It's you, evenings and weekends. Nothing may page you at 3 AM, and every hour spent on infrastructure is an hour not spent finding customers. Build it.",
        scenarioId: "solo-side-project",
        context: { teamSize: "small", platformTeam: false, compliance: false },
        targets: {
          minOverall: 6.5,
          noBlockers: true,
          maxWarnings: 1,
          floors: { opsSimplicity: 6 },
        },
        hint: "Free build — but think one era ahead: the swaps you'll need later are priced by migration effort, so prefer choices with cheap exits over local optima.",
      },
      {
        name: "Era 2 — The growth round",
        narrative:
          "Funding landed. Traffic doubles quarterly, the team is 20 and hiring, and there's a platform team now. The scaling ceiling you accepted in the garage is due.",
        scenarioId: "high-scale",
        context: { teamSize: "mid", platformTeam: true, compliance: false },
        targets: {
          noBlockers: true,
          floors: { scalability: 6, performance: 5 },
        },
        effortBudget: 8,
        hint: "If Era 1 was a plain monolith, its scalability floor is now the problem — and the modular monolith is the moderate-cost exit that was designed for exactly this moment.",
      },
      {
        name: "Era 3 — The IPO filing",
        narrative:
          "S-1 season. Eighty engineers, a compliance regime, and auditors reading your architecture diagrams. Immature layers and untyped seams are now disclosure items.",
        scenarioId: "regulated",
        context: { teamSize: "large", platformTeam: true, compliance: true },
        targets: {
          noBlockers: true,
          maxWarnings: 1,
          floors: { maturity: 7, typeSafety: 4 },
        },
        effortBudget: 6,
        hint: "The modular monolith's formalized-recently maturity score is the likely floor — and its honest boundaries make the microservices extraction a moderate, not a rewrite. That asymmetry was the point all along.",
      },
    ],
    knownSolution: [
      {
        architecture: "monolith",
        frontend: "react",
        backend: "aspnet-core",
        "api-style": "rest",
        "data-access": "ef-core",
        database: "postgres",
        auth: "managed-idp",
        hosting: "paas-containers",
      },
      {
        architecture: "modular-monolith",
        frontend: "react",
        backend: "aspnet-core",
        "api-style": "rest",
        "data-access": "ef-core",
        database: "postgres",
        auth: "managed-idp",
        hosting: "paas-containers",
      },
      {
        architecture: "microservices",
        frontend: "react",
        backend: "aspnet-core",
        "api-style": "rest",
        "data-access": "ef-core",
        database: "postgres",
        auth: "managed-idp",
        hosting: "paas-containers",
      },
    ],
  },
  {
    id: "consultants-inheritance",
    mode: "rescue",
    name: "The consultant's inheritance",
    brief:
      "The consultancy billed by the buzzword and left. You inherited a stack with a hard incompatibility, a broker with no consumers' worth of traffic, and a container platform for one deployable. Untangle it — without a full rewrite.",
    startStack: {
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
    stages: [
      {
        name: "The untangling",
        narrative:
          "Leadership wants the incidents to stop and the invoices to shrink. Remove what fights, fix what can't work, and keep the fit respectable — the board will not fund a ground-up rebuild.",
        scenarioId: "balanced",
        context: { teamSize: "mid", platformTeam: false, compliance: false },
        targets: {
          noBlockers: true,
          maxWarnings: 0,
          minOverall: 6.0,
        },
        effortBudget: 12,
        hint: "Start with the blocker (tRPC needs a Node backend — which side fits the rest?). Then the frictions: Kafka under a monolith, K8s for one deployable, two servers fighting over rendering. Decommissioning is cheap; the database swap is the expensive call you must budget around.",
      },
    ],
    knownSolution: [
      {
        architecture: "monolith",
        frontend: "react",
        backend: "aspnet-core",
        "api-style": "rest",
        "data-access": "ef-core",
        database: "postgres",
        caching: "redis",
        auth: "session-auth",
        hosting: "paas-containers",
      },
    ],
  },
];

export const GAME_MODE_LABELS: Record<Game["mode"], string> = {
  crisis: "Crisis — fix it under budget",
  campaign: "Campaign — survive three eras",
  rescue: "Rescue — untangle the inheritance",
};
