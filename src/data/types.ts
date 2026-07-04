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

/** A related-technology edge with the narrative that makes it educational. */
export interface Relation {
  techId: TechId;
  /** One or two sentences: when you'd switch / why they pair / why they clash. */
  note: string;
}

export interface Tech {
  id: TechId;
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
  tags?: string[];
}

/** A weighting profile representing project priorities. Weights multiply scores. */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  /** 0 = don't care … 2 = critical. 1 = neutral. */
  weights: Record<DimensionKey, number>;
}
