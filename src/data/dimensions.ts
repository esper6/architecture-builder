import type { Dimension } from "./types";

/**
 * The eight tradeoff axes. Order here is the display order on charts.
 * Scores are relative WITHIN a category: comparing React's 7 to Kafka's 7
 * is meaningless; comparing React's 7 to Angular's 5 is the point.
 */
export const DIMENSIONS: Dimension[] = [
  {
    key: "performance",
    label: "Raw Performance",
    question: "How fast is it at runtime — throughput, latency, resource use?",
    high: "Handles heavy load with low latency and a small footprint.",
    low: "Needs more hardware, tuning, or caching to hit the same numbers.",
  },
  {
    key: "devVelocity",
    label: "Dev Velocity",
    question: "How quickly can a competent team ship and iterate on features?",
    high: "Batteries included, little boilerplate, fast feedback loops.",
    low: "Lots of ceremony, configuration, or hand-rolled plumbing per feature.",
  },
  {
    key: "learningEase",
    label: "Ease of Learning",
    question: "How fast does a developer new to it become productive?",
    high: "Small concept count, great docs, hard to hold wrong.",
    low: "Steep curve, many concepts before the first win, easy to misuse.",
  },
  {
    key: "ecosystem",
    label: "Ecosystem & Hiring",
    question: "How deep is the library ecosystem and the pool of people who know it?",
    high: "A package for everything; easy to hire for; answers one search away.",
    low: "You'll write more yourself and train people on arrival.",
  },
  {
    key: "scalability",
    label: "Scalability",
    question: "How gracefully does it grow — in traffic, data, and team size?",
    high: "Clear scale-out story; large systems and teams stay manageable.",
    low: "Scaling requires rearchitecting or heroics past a certain size.",
  },
  {
    key: "typeSafety",
    label: "Type Safety & Tooling",
    question: "How much does the toolchain catch before runtime?",
    high: "Strong static guarantees, great refactoring and IDE support.",
    low: "Mistakes surface at runtime; large refactors are risky.",
  },
  {
    key: "opsSimplicity",
    label: "Operational Simplicity",
    question: "How easy is it to deploy, monitor, patch, and keep healthy?",
    high: "Boring to operate: few moving parts, mature monitoring, easy upgrades.",
    low: "Significant operational expertise or infrastructure required.",
  },
  {
    key: "maturity",
    label: "Maturity & Stability",
    question: "How proven is it, and how stable are its APIs and ecosystem?",
    high: "Decades of production miles; upgrades are uneventful.",
    low: "Young or fast-moving; expect churn and sharp edges.",
  },
];

export const DIMENSION_MAP = Object.fromEntries(
  DIMENSIONS.map((d) => [d.key, d]),
) as Record<Dimension["key"], Dimension>;
