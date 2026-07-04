import type { Scenario } from "./types";

/**
 * Weight presets representing project priorities. Weights (0–2) multiply
 * dimension scores when ranking technologies — the same catalog re-ranks
 * dramatically under different scenarios, which is the whole lesson:
 * "best tech" is meaningless without "for what".
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "balanced",
    name: "Balanced",
    description: "No particular pressure — every dimension weighted equally.",
    weights: {
      performance: 1,
      devVelocity: 1,
      learningEase: 1,
      ecosystem: 1,
      scalability: 1,
      typeSafety: 1,
      opsSimplicity: 1,
      maturity: 1,
    },
  },
  {
    id: "startup-mvp",
    name: "Startup MVP",
    description:
      "Ship in weeks, iterate daily, with a tiny team. Speed of change beats speed of execution; scale is a problem you'd love to have.",
    weights: {
      performance: 0.25,
      devVelocity: 2,
      learningEase: 1.5,
      ecosystem: 1.25,
      scalability: 0.25,
      typeSafety: 0.75,
      opsSimplicity: 1.5,
      maturity: 0.5,
    },
  },
  {
    id: "enterprise-lob",
    name: "Enterprise Line-of-Business",
    description:
      "A 10-year system maintained by rotating teams. Predictability, hiring, and upgrade paths matter more than peak performance.",
    weights: {
      performance: 0.5,
      devVelocity: 1,
      learningEase: 1,
      ecosystem: 1.75,
      scalability: 1,
      typeSafety: 1.75,
      opsSimplicity: 1.25,
      maturity: 2,
    },
  },
  {
    id: "high-scale",
    name: "High-Scale Consumer",
    description:
      "Millions of users, spiky traffic, latency is product quality. You'll pay in complexity and specialists to get throughput.",
    weights: {
      performance: 2,
      devVelocity: 0.75,
      learningEase: 0.5,
      ecosystem: 1,
      scalability: 2,
      typeSafety: 1,
      opsSimplicity: 0.75,
      maturity: 1,
    },
  },
  {
    id: "regulated",
    name: "Regulated / Financial",
    description:
      "Auditors read your architecture diagrams. Correctness, stability, and a paper trail beat velocity every time.",
    weights: {
      performance: 0.75,
      devVelocity: 0.5,
      learningEase: 0.75,
      ecosystem: 1.25,
      scalability: 1,
      typeSafety: 2,
      opsSimplicity: 1,
      maturity: 2,
    },
  },
  {
    id: "solo-side-project",
    name: "Solo Side Project",
    description:
      "One person, evenings and weekends. Anything you have to babysit in production kills the project.",
    weights: {
      performance: 0.25,
      devVelocity: 1.75,
      learningEase: 1.25,
      ecosystem: 1,
      scalability: 0.25,
      typeSafety: 0.75,
      opsSimplicity: 2,
      maturity: 0.75,
    },
  },
  {
    id: "integration-heavy",
    name: "Integration-Heavy / B2B",
    description:
      "The system is mostly seams: partners, file feeds, message queues, long-running workflows. Reliability of the boring parts is the product.",
    weights: {
      performance: 0.75,
      devVelocity: 1,
      learningEase: 0.75,
      ecosystem: 1.5,
      scalability: 1.25,
      typeSafety: 1.5,
      opsSimplicity: 1.25,
      maturity: 1.75,
    },
  },
  {
    id: "realtime",
    name: "Real-Time / Collaborative",
    description:
      "Live dashboards, presence, collaborative editing. Latency and connection handling dominate; request/response thinking fails you.",
    weights: {
      performance: 1.75,
      devVelocity: 1,
      learningEase: 0.75,
      ecosystem: 1,
      scalability: 1.75,
      typeSafety: 1,
      opsSimplicity: 0.75,
      maturity: 0.75,
    },
  },
];

export const SCENARIO_MAP = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
) as Record<string, Scenario>;
