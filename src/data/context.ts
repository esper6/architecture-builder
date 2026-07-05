import type { ContextModifier, OrgContext, TeamSize } from "./types";

/**
 * Org context — Conway's Law made mechanical. These modifiers encode the
 * score-flips that depend on who is building, not what is built. Every
 * modifier is visible data with a rationale (ADR-006): the app never adjusts
 * a number without showing its work.
 *
 * Base scores assume the catalog's default posture: a mid-sized team
 * (10–30 devs), no dedicated platform team, no formal compliance regime.
 * Modifiers express how reality diverges from that posture.
 */

export const DEFAULT_CONTEXT: OrgContext = {
  teamSize: "mid",
  platformTeam: false,
  compliance: false,
};

export const TEAM_SIZE_LABELS: Record<TeamSize, string> = {
  small: "≤ 10 devs",
  mid: "10–30 devs",
  large: "30+ devs",
};

export const CONTEXT_MODIFIERS: ContextModifier[] = [
  // --- Orchestration & platform-shaped infrastructure ---
  {
    techId: "kubernetes",
    when: { platformTeam: true },
    delta: { opsSimplicity: 5, devVelocity: 1 },
    why: "A platform team absorbs the cluster's care and feeding; product teams consume golden paths instead of writing YAML from scratch.",
  },
  {
    techId: "kubernetes",
    when: { teamSize: ["small"], platformTeam: false },
    delta: { devVelocity: -2 },
    why: "A small team pays the platform tax straight out of its feature budget — there is nobody else to pay it.",
  },
  {
    techId: "kafka",
    when: { platformTeam: true },
    delta: { opsSimplicity: 4 },
    why: "Someone else runs the brokers (or owns the managed-service relationship); partition math stays, pager duty largely goes.",
  },
  {
    techId: "cassandra",
    when: { platformTeam: true },
    delta: { opsSimplicity: 3 },
    why: "Cassandra's operational demands assume a dedicated owner; with one, it does what it says on the tin.",
  },
  {
    techId: "rabbitmq",
    when: { platformTeam: true },
    delta: { opsSimplicity: 2 },
    why: "Broker upgrades, cluster policies, and queue hygiene move off the product team's plate.",
  },
  {
    techId: "event-driven",
    when: { platformTeam: true },
    delta: { opsSimplicity: 2 },
    why: "Tracing, replay tooling, and broker operations are exactly the kind of paved road a platform team builds once for everyone.",
  },
  {
    techId: "self-hosted-idp",
    when: { platformTeam: true },
    delta: { opsSimplicity: 3 },
    why: "Owning Keycloak is sane when a platform/security function owns its patching and availability — and reckless when nobody does.",
  },
  {
    techId: "vms",
    when: { teamSize: ["large"] },
    delta: { opsSimplicity: -2 },
    why: "Configuration drift compounds with fleet size; at scale, hand-tended servers become a garden of snowflakes.",
  },
  {
    techId: "paas-containers",
    when: { teamSize: ["large"], platformTeam: true },
    delta: { scalability: -1 },
    why: "Large orgs with platform capacity tend to hit PaaS ceilings (networking, compliance controls, cost curves) and graduate to orchestration they control.",
  },

  // --- Architecture styles: the org-size story ---
  {
    techId: "microservices",
    when: { teamSize: ["large"] },
    delta: { devVelocity: 4 },
    why: "At org scale the coordination cost of a shared codebase exceeds the distributed-systems tax — independent deploys become the faster path. This is the pattern's entire purpose.",
  },
  {
    techId: "microservices",
    when: { platformTeam: true },
    delta: { opsSimplicity: 3 },
    why: "Service discovery, tracing, and per-service CI/CD are a solved problem exactly once — by the platform team.",
  },
  {
    techId: "monolith",
    when: { teamSize: ["large"] },
    delta: { devVelocity: -3, scalability: -1 },
    why: "Thirty-plus developers shipping through one deploy pipe rediscover why release trains have schedules — and conflicts.",
  },
  {
    techId: "modular-monolith",
    when: { teamSize: ["large"] },
    delta: { devVelocity: 1 },
    why: "Enforced module ownership gives big teams most of the parallelism without the network hops — until deploy cadences truly diverge.",
  },
  {
    techId: "serverless-arch",
    when: { teamSize: ["small"] },
    delta: { opsSimplicity: 1 },
    why: "No-ops matters most when there is no ops: the platform is your platform team.",
  },
  {
    techId: "cqrs-es",
    when: { compliance: true },
    delta: { devVelocity: 2 },
    why: "When a complete audit trail is a requirement anyway, event sourcing stops being extra work and starts being the work.",
  },
  {
    techId: "event-driven",
    when: { compliance: true },
    delta: { devVelocity: 1 },
    why: "The durable event stream you'd have to bolt on for auditors is native here.",
  },

  // --- Frameworks: guardrails amortize with headcount ---
  {
    techId: "angular",
    when: { teamSize: ["large"] },
    delta: { devVelocity: 1 },
    why: "The ceremony that slows three developers standardizes thirty — one blessed way scales better than ten clever ones.",
  },
  {
    techId: "angular",
    when: { teamSize: ["small"] },
    delta: { devVelocity: -1 },
    why: "A small team pays Angular's structure tax without the coordination problems it exists to solve.",
  },
  {
    techId: "nestjs",
    when: { teamSize: ["large"] },
    delta: { devVelocity: 1, scalability: 1 },
    why: "Imposed structure is what keeps N Node teams from shipping N bespoke architectures.",
  },
  {
    techId: "spring-boot",
    when: { teamSize: ["large"] },
    delta: { devVelocity: 1 },
    why: "Convention-heavy frameworks are how enterprises survive team rotation — any Spring developer can read any Spring codebase.",
  },
  {
    techId: "express",
    when: { teamSize: ["large"] },
    delta: { scalability: -2 },
    why: "No imposed structure × many teams = N bespoke architectures that each new hire must archaeology through.",
  },
  {
    techId: "htmx",
    when: { teamSize: ["large"] },
    delta: { scalability: -1 },
    why: "The untyped seam between server templates and hx-attributes gets crowded when many hands share the pages.",
  },
  {
    techId: "trpc",
    when: { teamSize: ["large"] },
    delta: { scalability: -1 },
    why: "Coupling-as-a-feature strains as team count grows — the monorepo that made tRPC magical becomes the thing everyone queues behind.",
  },
  {
    techId: "graphql",
    when: { teamSize: ["large"] },
    delta: { devVelocity: 1 },
    why: "A schema many client teams can self-serve against is GraphQL's actual economic case.",
  },
  {
    techId: "graphql",
    when: { teamSize: ["small"] },
    delta: { devVelocity: -1 },
    why: "Schema, resolvers, and query-cost controls are real ceremony when there's only one client team to serve.",
  },
  {
    techId: "mongodb",
    when: { teamSize: ["large"] },
    delta: { typeSafety: -1 },
    why: "Schema-in-application-code drifts fastest when many services write the same collections.",
  },

  // --- Compliance-shaped adjustments ---
  {
    techId: "managed-idp",
    when: { compliance: true },
    delta: { maturity: 1 },
    why: "The vendor's certifications (SOC 2, ISO 27001) transfer to your audit — identity becomes a checkbox instead of a chapter.",
  },
  {
    techId: "soap",
    when: { compliance: true },
    delta: { ecosystem: 1 },
    why: "In regulated B2B, the partners and auditors who still speak WS-* are disproportionately represented.",
  },
  {
    techId: "serverless-functions",
    when: { compliance: true },
    delta: { opsSimplicity: -1 },
    why: "Shared-responsibility models take auditor education; proving control over infrastructure you can't see is its own workstream.",
  },
];

/** Human-readable summary of the current context, for exports and headers. */
export function describeContext(ctx: OrgContext): string {
  return [
    `team ${TEAM_SIZE_LABELS[ctx.teamSize]}`,
    ctx.platformTeam ? "platform team" : "no platform team",
    ctx.compliance ? "compliance regime" : "no compliance regime",
  ].join(" · ");
}
