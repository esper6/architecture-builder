/**
 * Core data model for the Architecture Builder knowledge base.
 *
 * Everything the app renders is derived from these types. The knowledge base
 * is authored as typed TS modules (not fetched JSON) so that cross-references
 * between technologies are checked at compile time via the TechId union.
 */

/** The eight tradeoff dimensions every technology is scored on (0–10). */
export type DimensionKey =
  | "performance"
  | "devVelocity"
  | "learningEase"
  | "ecosystem"
  | "scalability"
  | "typeSafety"
  | "opsSimplicity"
  | "maturity";

export interface Dimension {
  key: DimensionKey;
  label: string;
  /** Short question the dimension answers, e.g. "How fast can a small team ship?" */
  question: string;
  /** What a high score means vs a low score — shown in Learn and tooltips. */
  high: string;
  low: string;
}

/** A finer-grained score under a shared dimension (drill-down detail). */
export interface SubScore {
  label: string;
  /** 0–10, same within-category relativity as top-level scores. */
  value: number;
  note?: string;
}

/**
 * An extra tradeoff axis that only makes sense for one category (e.g.
 * "Consistency guarantees" for databases). Defined once on the category so
 * every tech in it scores the same axes; rendered in detail views and the
 * Compare table — never on the shared radar or the weight sliders.
 */
export interface CategoryDimension {
  key: string;
  label: string;
  question: string;
}

/** Stack layers. Order here is the order slots render in the Stack Builder. */
export type CategoryId =
  | "architecture"
  | "frontend"
  | "backend"
  | "api-style"
  | "data-access"
  | "database"
  | "caching"
  | "messaging"
  | "auth"
  | "hosting";

export interface Category {
  id: CategoryId;
  name: string;
  /** The decision this layer represents, phrased as the question you'd ask. */
  question: string;
  description: string;
  /** Optional layers can be left empty in the Stack Builder without a warning. */
  optionalInStack?: boolean;
  /** Category-specific tradeoff axes beyond the shared eight. */
  nativeDimensions?: CategoryDimension[];
}

/**
 * Language ecosystems. A tech bound to an ecosystem can only be combined with
 * a backend from the same ecosystem (e.g. EF Core requires a .NET backend).
 * "agnostic" techs combine with anything.
 */
export type Ecosystem =
  | "dotnet"
  | "node"
  | "jvm"
  | "python"
  | "go"
  | "rust"
  | "agnostic";

/** Every technology id in the knowledge base. Cross-references are compile-checked against this. */
export type TechId =
  // architecture styles
  | "monolith"
  | "modular-monolith"
  | "microservices"
  | "event-driven"
  | "serverless-arch"
  | "cqrs-es"
  // frontend
  | "react"
  | "nextjs"
  | "angular"
  | "vue"
  | "svelte"
  | "blazor"
  | "htmx"
  // backend
  | "aspnet-core"
  | "express"
  | "fastify"
  | "nestjs"
  | "spring-boot"
  | "fastapi"
  | "django"
  | "go-http"
  | "rust-axum"
  // api style
  | "rest"
  | "graphql"
  | "grpc"
  | "trpc"
  | "soap"
  | "websockets"
  // data access
  | "ef-core"
  | "dapper"
  | "ado-net"
  | "prisma"
  | "drizzle"
  | "typeorm"
  | "hibernate"
  | "sqlalchemy"
  // database
  | "postgres"
  | "mssql"
  | "mysql"
  | "sqlite"
  | "mongodb"
  | "dynamodb"
  | "cosmosdb"
  | "cassandra"
  // caching
  | "redis"
  | "memcached"
  | "in-process-cache"
  | "cdn-cache"
  // messaging
  | "rabbitmq"
  | "kafka"
  | "azure-service-bus"
  | "sqs-sns"
  | "nats"
  | "redis-streams"
  // auth
  | "jwt-auth"
  | "session-auth"
  | "managed-idp"
  | "self-hosted-idp"
  // hosting
  | "kubernetes"
  | "paas-containers"
  | "serverless-functions"
  | "vms"
  | "static-edge";

/** How much work swapping to an alternative really is. */
export type MigrationEffort = "drop-in" | "moderate" | "rewrite";

/** A related-technology edge with the narrative that makes it educational. */
export interface Relation {
  techId: TechId;
  /** One or two sentences: when you'd switch / why they pair / why they clash. */
  note: string;
  /** For `alternatives` edges: the realistic cost of actually switching. */
  effort?: MigrationEffort;
}

/**
 * A second-order obligation a technology signs you up for — the ongoing
 * infrastructure, process, or skill commitments that don't appear on any
 * feature list but dominate total cost of ownership.
 */
export interface Commitment {
  /** The obligation, phrased as "You now own/need …". */
  need: string;
  /** Why this tech creates it. */
  why: string;
}

export interface Tech {
  id: TechId;
  /**
   * Alternate names people actually use — old brands (".NET Core"),
   * nicknames ("K8s"), or the well-known products that embody a concept
   * (Managed IdP → "Auth0", "Entra ID"). Shown on profiles so a reader's
   * mental vocabulary maps onto the canonical name.
   */
  aka?: string[];
  name: string;
  category: CategoryId;
  /** Language ecosystem this tech is bound to; omit for agnostic. */
  ecosystem?: Ecosystem;
  /** One-line hook shown on cards, e.g. "The default choice everyone must justify deviating from." */
  tagline: string;
  /** 2–4 sentences: what it is and where it sits in the landscape. */
  description: string;
  /**
   * 0–10 per dimension, relative to peers IN THE SAME CATEGORY.
   * 5 = typical for the category, 9–10 = best in class, 1–2 = notably weak.
   */
  scores: Record<DimensionKey, number>;
  /** Optional one-liners justifying non-obvious scores — surfaced in tooltips. */
  scoreNotes?: Partial<Record<DimensionKey, string>>;
  /**
   * Optional drill-down under a shared dimension, e.g. performance →
   * throughput / startup / memory. Answers "why is this a 6?" with data.
   */
  subScores?: Partial<Record<DimensionKey, SubScore[]>>;
  /**
   * Scores for the category's nativeDimensions (keys must match the
   * category's definition — enforced by the audit script, not the compiler).
   */
  nativeScores?: Record<string, number>;
  nativeScoreNotes?: Record<string, string>;
  strengths: string[];
  weaknesses: string[];
  /** Concrete situations where this is the right pick. */
  chooseWhen: string[];
  /** Concrete situations where you'll regret it. */
  avoidWhen: string[];
  /**
   * What can stand in this tech's place (same category OR cross-category,
   * e.g. "Next.js can replace React + a separate Node API for many apps").
   * The note explains WHEN the swap makes sense.
   */
  alternatives: Relation[];
  /** Techs this one has real synergy with — used by the Stack Builder. */
  pairsWellWith?: Relation[];
  /** Techs this one fights with (beyond ecosystem constraints) — used for warnings. */
  frictionWith?: Relation[];
  /**
   * Techs people wrongly treat as interchangeable with this one.
   * The note explains why they solve different problems.
   */
  notInterchangeableWith?: Relation[];
  /** What choosing this signs you up for — the obligations ledger. */
  commitments?: Commitment[];
  tags?: string[];
}

/* ---------- Org context (Conway's Law, made mechanical) ---------- */

export type TeamSize = "small" | "mid" | "large";

/** The org-shaped inputs that flip technology scores. */
export interface OrgContext {
  /** small ≤10 devs · mid 10–30 · large 30+ */
  teamSize: TeamSize;
  /** Is there a platform/infra team paving roads for product teams? */
  platformTeam: boolean;
  /** Formal compliance regime (SOC 2, financial, healthcare…)? */
  compliance: boolean;
}

/**
 * A visible, explained score adjustment triggered by org context.
 * All specified conditions must match for the modifier to apply.
 * This is deliberately data, not a model — every adjustment carries its "why"
 * and is shown in the UI (see ADR-006).
 */
export interface ContextModifier {
  techId: TechId;
  when: Partial<{
    teamSize: TeamSize[];
    platformTeam: boolean;
    compliance: boolean;
  }>;
  delta: Partial<Record<DimensionKey, number>>;
  why: string;
}

/** A weighting profile representing project priorities. Weights multiply scores. */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  /** 0 = don't care … 2 = critical. 1 = neutral. */
  weights: Record<DimensionKey, number>;
}
