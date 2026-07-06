import type { OrgContext, TechId } from "./types";
import type { Stack } from "../lib/scoring";

/**
 * The incident room: postmortem simulations that train the READ direction —
 * given how a system is misbehaving, reason backward to which layer's known
 * tradeoff just fired. Wrong answers are the curriculum (ADR-011): every
 * innocent layer returns a specific exoneration explaining why the evidence
 * doesn't fit it.
 */

export interface Mechanism {
  id: string;
  text: string;
  correct?: boolean;
  /** Shown when this mechanism is picked (right or wrong). */
  debrief: string;
}

export interface Incident {
  id: string;
  name: string;
  /** One-line hook for the card. */
  teaser: string;
  stack: Stack;
  context: OrgContext;
  /** What the pager and the support queue look like. */
  narrative: string;
  timeline: { time: string; entry: string }[];
  culprit: TechId;
  /** Why the culprit is guilty — shown when correctly identified. */
  culpritReveal: string;
  /** Exonerations for innocent layers (keyed by techId). */
  redHerrings: Partial<Record<TechId, string>>;
  mechanisms: Mechanism[];
  postmortem: {
    rootCause: string;
    contributing: string[];
    fixes: { action: string; kind: "immediate" | "structural" }[];
    lesson: string;
  };
}

export const INCIDENTS: Incident[] = [
  {
    id: "logout-storm",
    name: "Everyone got logged out",
    teaser:
      "Monday morning: users are logged out at random, mid-form. Logins work. Error rate is zero. Nothing was deployed.",
    stack: {
      architecture: "monolith",
      frontend: "react",
      backend: "aspnet-core",
      "api-style": "rest",
      "data-access": "ef-core",
      database: "mssql",
      caching: "in-process-cache",
      auth: "session-auth",
      hosting: "paas-containers",
    },
    context: { teamSize: "mid", platformTeam: false, compliance: false },
    narrative:
      "Monday 09:40. Support tickets are piling up: users report being logged out at random — some mid-form, losing work. Logging back in works fine, but sessions survive only a handful of requests. Traffic is normal-high for a Monday, error rate is near zero, CPU is healthy. Nothing was deployed today. On Friday afternoon, ops enabled autoscaling ahead of month-end.",
    timeline: [
      { time: "Fri 16:12", entry: "Change ticket: autoscale enabled on the app plan (1 → 3 instances)" },
      { time: "Mon 09:05", entry: "Traffic climbs; platform brings a second instance online" },
      { time: "Mon 09:12", entry: "First 'logged out randomly' tickets arrive" },
      { time: "Mon 09:31", entry: "Engineer: 'cannot reproduce — works fine locally and on staging'" },
      { time: "Mon 09:44", entry: "Ops: error rate 0.2%, auth endpoint p99 normal, memory healthy" },
      { time: "Mon 10:02", entry: "A user reports they stay logged in 'if I keep clicking fast'" },
    ],
    culprit: "session-auth",
    culpritReveal:
      "Correct. Server-held sessions were living in each instance's memory. The moment a second instance existed, any request routed to it carried a cookie the new instance had never heard of — instant, error-free 'unauthenticated'. The catalog's warning that cookie sessions need a shared store to scale horizontally just stopped being hypothetical.",
    redHerrings: {
      mssql:
        "Innocent. No session data lived in SQL Server in this design, and a struggling database announces itself with latency and errors — not clean, instant logouts at 0.2% error rate.",
      "aspnet-core":
        "The framework did exactly what it was configured to do. Nothing in the timeline points at request handling — logins work, requests succeed.",
      react:
        "The client just honors 401s. It's the messenger.",
      "ef-core":
        "No data-access symptoms anywhere: no slow queries, no errors, database healthy.",
      rest:
        "Ironically the one layer that kept its promise perfectly — the API is stateless by design. Something else was supposed to be holding the state.",
      "in-process-cache":
        "Warm, but an accomplice rather than the culprit: it faithfully held what it was given. The decision that sessions live in one instance's private memory belongs to the auth approach.",
      "paas-containers":
        "Close — the trigger lived here. But the platform did exactly what Friday's ticket asked: scale out. Scaling out is supposed to be safe. Ask instead: which layer couldn't survive a second instance?",
      monolith:
        "One deployable scaled to three copies is business as usual for a monolith — millions of them run behind load balancers. The shape isn't the problem; something stateful is hiding inside it.",
    },
    mechanisms: [
      {
        id: "samesite",
        text: "A framework update changed session cookies to SameSite=Strict, so cross-navigation requests drop the cookie",
        debrief:
          "Then logins would misbehave consistently everywhere — including single-instance staging, which is fine. And nothing was deployed; the timeline's only change is infrastructure.",
      },
      {
        id: "in-proc-sessions",
        text: "Sessions are held in-process: each instance has its own private session memory, and the load balancer spreads requests across instances that have never seen your cookie",
        correct: true,
        debrief:
          "Exactly. Staging (one instance) could never reproduce it, 'clicking fast' kept users pinned to a warm instance long enough to look logged in, and the 09:05 scale-out matches the 09:12 first ticket almost to the minute.",
      },
      {
        id: "db-locks",
        text: "The session table in SQL Server hit lock contention under Monday load",
        debrief:
          "Sessions weren't in SQL in this design — and lock contention shows up as latency and timeouts, not instant, error-free 'who are you?'.",
      },
      {
        id: "cache-evict",
        text: "Memory pressure made the in-process cache evict session entries",
        debrief:
          "Eviction would correlate with memory alarms (ops reported memory healthy) and would hit single-instance environments too. The correlation in the timeline is with instance COUNT, not memory.",
      },
    ],
    postmortem: {
      rootCause:
        "Server-held sessions stored in-process, combined with horizontal scale-out: each instance kept a private session dictionary, so any request landing on a different instance was silently unauthenticated.",
      contributing: [
        "Staging ran a single instance, structurally hiding the coupling",
        "The autoscale change shipped Friday without an application-readiness review",
        "No shared session store, despite the platform offering one out of the box",
      ],
      fixes: [
        { action: "Enable session affinity (sticky sessions) at the load balancer to stop the bleeding", kind: "immediate" },
        { action: "Move session state to a shared store — or switch to stateless tokens with short TTLs", kind: "structural" },
        { action: "Make staging multi-instance so scale-coupled bugs reproduce before production", kind: "structural" },
      ],
      lesson:
        "Cookie sessions' scaling weakness isn't a score on a chart — it's a latent incident that fires the exact day you scale out. Infrastructure changes are application changes.",
    },
  },
  {
    id: "silent-backlog",
    name: "The orders that never arrived",
    teaser:
      "Your biggest partner sent 4,000 orders. Your API accepted every one with a 200. Eleven have shipped.",
    stack: {
      architecture: "event-driven",
      backend: "aspnet-core",
      "api-style": "rest",
      "data-access": "dapper",
      database: "postgres",
      messaging: "rabbitmq",
      auth: "managed-idp",
      hosting: "paas-containers",
    },
    context: { teamSize: "mid", platformTeam: false, compliance: true },
    narrative:
      "Wednesday 10:15. Your biggest trading partner calls the VP directly: 'We've transmitted four thousand orders since Monday. Your API acknowledged every single one. Eleven have shipped.' The API dashboard is green — 200s across the board, latency flat. There are no errors in the API logs. Fulfillment says their work screen has been 'weirdly quiet this week.'",
    timeline: [
      { time: "Mon 07:30", entry: "Deploy: fulfillment consumer v2.4 (new order-validation logic)" },
      { time: "Mon 07:45", entry: "Queue depth begins climbing steadily (no alert configured on depth)" },
      { time: "Mon–Wed", entry: "Container restart count on the consumer: 2,847 (visible in platform metrics nobody watches)" },
      { time: "Wed 10:15", entry: "Partner escalation reaches the VP" },
      { time: "Wed 10:40", entry: "Consumer log, on inspection: the same order id failing JSON deserialization, over and over, every ~90 seconds" },
    ],
    culprit: "rabbitmq",
    culpritReveal:
      "Correct — the messaging layer, though not because the broker malfunctioned. One malformed order crashed the consumer; RabbitMQ dutifully redelivered it on restart; the consumer crashed again. With no dead-letter route configured, one poison message blocked four thousand orders for three days. The broker kept every promise it made — including the ones you didn't want.",
    redHerrings: {
      "aspnet-core":
        "The producer did its job. A 200 means 'accepted for processing' — and every order WAS accepted, durably. The gap between accepted and fulfilled lives downstream.",
      rest:
        "The API contract was honored to the letter. 'Accepted' and 'fulfilled' are different promises — that gap is the defining tradeoff of async architectures, but the API didn't cause the blockage.",
      postgres:
        "Nearly idle all week — its innocence is the clue. The work never reached it.",
      dapper:
        "Eleven orders shipped, so the write path works. Data access only executes what arrives.",
      "managed-idp":
        "Auth failures log 401s and would block the API, not the consumer. The tokens were fine.",
      "paas-containers":
        "The platform faithfully restarted what kept dying, 2,847 times — the restart counter was the clue sitting in plain sight. But it only did what supervision is supposed to do.",
      "event-driven":
        "The style created the failure MODE — invisible async workflows where silence looks like health. But the missing safety nets (dead-lettering, lag alerts) are the messaging layer's unpaid obligations. Close, though.",
    },
    mechanisms: [
      {
        id: "broker-lost",
        text: "The broker lost the messages",
        debrief:
          "Queue depth was GROWING — the broker kept every single one. Durability was never the issue; delivery was.",
      },
      {
        id: "poison",
        text: "A poison message: one malformed order crashes the consumer, at-least-once delivery hands it right back on restart, and with no dead-letter route the queue is blocked behind one bad message",
        correct: true,
        debrief:
          "That's the one. Crash → redeliver → crash, every ~90 seconds for three days. The dead-letter queue that would have parked the bad message and let 3,999 good ones flow was never configured — it's literally the first commitment on the broker's ledger.",
      },
      {
        id: "idp-rate",
        text: "The IdP rate-limited the consumer's service tokens",
        debrief:
          "Token failures would log 401s, not deserialization errors — and the crash loop started 15 minutes after a deploy, not at any token-expiry boundary.",
      },
      {
        id: "pg-deadlock",
        text: "Postgres deadlocks under Monday's order volume",
        debrief:
          "The database was nearly idle — the work never reached it. Deadlocks also announce themselves loudly in logs; this incident's signature is silence.",
      },
    ],
    postmortem: {
      rootCause:
        "One malformed message + at-least-once redelivery + no dead-letter queue = a crash-restart loop that silently blocked fulfillment for three days while every upstream signal stayed green.",
      contributing: [
        "No alerting on queue depth or consumer lag — the two numbers that were screaming",
        "Dead-letter queue never configured (the catalog lists this among RabbitMQ's first obligations)",
        "Async acceptance (200) presented to partners as if it meant end-to-end success",
        "Consumer restart counts visible but unwatched",
      ],
      fixes: [
        { action: "Park the poison message, drain the three-day backlog with fulfillment on notice", kind: "immediate" },
        { action: "Configure DLQ + max-delivery policy so one bad message can never block the queue again", kind: "structural" },
        { action: "Alert on queue depth, consumer lag, and restart counts", kind: "structural" },
        { action: "Add an 'orders acknowledged vs fulfilled' reconciliation metric — the number the partner effectively computed for you", kind: "structural" },
      ],
      lesson:
        "In event-driven systems, silence is not health. Every queue is a place where work can hide, and the broker's obligations ledger — DLQs, lag monitoring, idempotency — is precisely the checklist that would have caught this three times over.",
    },
  },
  {
    id: "dashboard-n-plus-one",
    name: "The dashboard that ate the database",
    teaser:
      "The new dashboard 'only runs a handful of queries' and was instant in dev. Postgres is at 100% CPU and checkout is dying.",
    stack: {
      architecture: "monolith",
      frontend: "nextjs",
      backend: "fastify",
      "api-style": "rest",
      "data-access": "prisma",
      database: "postgres",
      caching: "redis",
      auth: "managed-idp",
      hosting: "paas-containers",
    },
    context: { teamSize: "mid", platformTeam: false, compliance: false },
    narrative:
      "The customer-success dashboard shipped Thursday evening. Friday 08:50, everything is slow — including checkout, which has nothing to do with dashboards. Postgres CPU is pinned at 100%. The dashboard team is adamant: 'our page runs a handful of queries and rendered instantly in dev.' They're not lying. That's the problem.",
    timeline: [
      { time: "Thu 17:20", entry: "Dashboard feature deployed" },
      { time: "Fri 08:50", entry: "Postgres CPU 100%; p99 degrades on EVERY endpoint, checkout included" },
      { time: "Fri 09:10", entry: "pg_stat_statements: 1.9M executions of SELECT … FROM \"Order\" WHERE \"accountId\" = $1 since midnight" },
      { time: "Fri 09:15", entry: "The dashboard lists 600 accounts per page view — and each account row displays its recent orders" },
      { time: "Fri 09:20", entry: "Someone checks: the dev database has 12 accounts" },
    ],
    culprit: "prisma",
    culpritReveal:
      "Correct — the data-access layer. A relation accessed inside a render loop emitted one query per account row: the classic N+1, invisible in dev where N was 12 and unmissable in production where N was 600 per page view. The ORM's whole bargain — hiding the SQL — is exactly what hid this.",
    redHerrings: {
      postgres:
        "The victim, not the culprit. It executed precisely what it was asked — 1.9 million times. When a database is 'slow', the first question is what you're asking it, and how often.",
      nextjs:
        "The frontend requested a page; it has no idea what happens below the API. Rendering wasn't the bottleneck.",
      fastify:
        "The framework routed one request per page view, exactly as designed. The multiplication happened below it.",
      redis:
        "An unused bystander on this code path — and caching an N+1 wouldn't have fixed it, just hidden the debt until a cache miss.",
      rest:
        "One HTTP request came in. The 600 queries it spawned are not the API style's doing.",
      "managed-idp":
        "One token check per request. Nothing here scales with account count.",
      monolith:
        "The shape is irrelevant — this exact bug ships identically in microservices, where it becomes 600 network calls instead and pages a different team.",
    },
    mechanisms: [
      {
        id: "index",
        text: "Missing index on accountId",
        debrief:
          "Seductive — and an index WOULD make each query faster. But the problem is the COUNT: 600 queries per page view instead of one. Indexing an N+1 just makes the N+1 faster. Look at pg_stat_statements again: the query is cheap; there are 1.9 million of it.",
      },
      {
        id: "n-plus-one",
        text: "The ORM lazily loads each account's orders inside the render loop — one query per row, the classic N+1, invisible in dev where N was 12",
        correct: true,
        debrief:
          "Exactly. An innocent-looking property access in a loop, silently translated into a database round-trip per iteration. Dev's 12 accounts kept it under the pain threshold; production's cardinality sent the bill.",
      },
      {
        id: "more-cpu",
        text: "Postgres needs more CPU for the new workload",
        debrief:
          "You can't provision your way out of an algorithmic problem — 10× the hardware buys you one more zero of N before you're back here, paying 10× the invoice.",
      },
      {
        id: "cold-cache",
        text: "Redis wasn't warmed after the deploy",
        debrief:
          "This path never touched Redis. And a cold cache causes a spike that heals as it warms — this got worse as traffic grew.",
      },
    ],
    postmortem: {
      rootCause:
        "A relation access inside a render loop generated one query per row (N+1). The ORM made round-trips invisible in code review, and a 12-row dev dataset made the cost invisible at runtime — until production cardinality arrived.",
      contributing: [
        "No per-request query-count logging or budget in development",
        "Dev data wildly unrepresentative of production cardinality",
        "Code review reviewed the TypeScript, not the SQL it generates",
        "Shared database meant one feature's mistake degraded every endpoint, checkout included",
      ],
      fixes: [
        { action: "Rewrite the dashboard read as a single joined/aggregated query (eager include)", kind: "immediate" },
        { action: "Enable ORM query logging with a per-request query-count warning threshold", kind: "structural" },
        { action: "Seed development with production-shaped cardinality", kind: "structural" },
      ],
      lesson:
        "Every ORM's velocity is borrowed against exactly this moment. The abstraction bargain in the catalog isn't a metaphor — know what SQL your innocent-looking property access emits, because the database will execute all of it.",
    },
  },
  {
    id: "nine-second-mondays",
    name: "The nine-second Mondays",
    teaser:
      "Every Monday morning — and after every deploy — the first users wait 9 seconds. By 09:30 nobody can reproduce it.",
    stack: {
      architecture: "serverless-arch",
      frontend: "react",
      backend: "express",
      "api-style": "rest",
      database: "dynamodb",
      auth: "jwt-auth",
      hosting: "serverless-functions",
    },
    context: { teamSize: "small", platformTeam: false, compliance: false },
    narrative:
      "A B2B app with 9-to-5 traffic. Every Monday between 08:55 and 09:20 — and after every Friday deploy — the first users report 8–10 second page loads that then 'fix themselves.' p50 latency is superb all week. p99 is a sawtooth. The engineer assigned to it tests at 2pm and closes the ticket as 'cannot reproduce' for the third week running.",
    timeline: [
      { time: "Pattern", entry: "p99 spikes Mon 08:55–09:20, then flat for the week" },
      { time: "Pattern", entry: "Identical spike after every deploy, regardless of time of day" },
      { time: "Metrics", entry: "Cloud logs: 'Init Duration: 6.2s' on a subset of invocations — VPC attachment + a 48MB bundle" },
      { time: "Metrics", entry: "DynamoDB: zero throttles, single-digit-ms reads, all month" },
      { time: "Ticket", entry: "'Cannot reproduce (tested 14:05)' — functions warm by then" },
    ],
    culprit: "serverless-functions",
    culpritReveal:
      "Correct — the hosting layer. Weekend idle reclaimed every warm instance; deploys invalidate them all by definition. The first invocations pay full runtime initialization — 6+ seconds of VPC network attachment and bundle loading — and then the fleet is warm until it isn't. The platform behaved exactly as priced; nobody had given cold starts a budget.",
    redHerrings: {
      dynamodb:
        "The metrics exonerate it completely: zero throttles, single-digit-millisecond reads all month. This is the database that scales while you sleep — it was the compute that slept.",
      react:
        "The bundle it ships affects browsers, not server p99. The 6.2s is server-side init.",
      express:
        "Partially warm — its bundle weight is a contributing factor to init time. But the WHEN — Mondays and deploys, never load — signs the platform's name, not the framework's.",
      "jwt-auth":
        "Local signature verification, microseconds, no IdP round-trip. And auth cost wouldn't correlate with deploys.",
      rest: "The API style has no opinion about process lifecycle.",
      "serverless-arch":
        "Warm. The style knowingly accepted this trade — cold starts are in its avoidWhen list. But the bill arrives at the hosting slot, and that's where the fix lives too.",
    },
    mechanisms: [
      {
        id: "ddb-adaptive",
        text: "DynamoDB adaptive capacity lags behind the Monday-morning burst",
        debrief:
          "Zero throttles all month and single-digit-ms reads throughout the spike windows. The data layer has an alibi backed by metrics.",
      },
      {
        id: "cold-starts",
        text: "Cold starts: weekend idle and deploys reset all warm instances, so the first requests pay 6+ seconds of runtime init (VPC attachment + a 48MB bundle)",
        correct: true,
        debrief:
          "That's it. Two triggers, one mechanism: idle-reclaim (Mondays) and instance invalidation (deploys). The 2pm 'cannot reproduce' was testing a warm fleet — the incident only exists at the edges of the usage pattern.",
      },
      {
        id: "jwt-idp",
        text: "JWT validation calls the identity provider on every request",
        debrief:
          "Stateless JWT's whole point is local validation — no IdP call. And it would be slow ALWAYS, not in deploy-shaped bursts.",
      },
      {
        id: "batch-lock",
        text: "A weekend batch job holds table locks into Monday morning",
        debrief:
          "DynamoDB has no table locks to hold, and the metrics show no contention of any kind. Also fails to explain the post-deploy spikes.",
      },
    ],
    postmortem: {
      rootCause:
        "Cold starts: weekend idle plus deploy-time instance invalidation meant first invocations paid ~6s of initialization (VPC ENI attachment + oversized bundle) — a documented platform property that had never been given a budget or an owner.",
      contributing: [
        "No cold-start budget in the SLO; p50 dashboards hid what p99 paid",
        "Bundle grew 4× since launch with no size gate in CI",
        "VPC attachment retained for a database dependency removed a year ago",
        "Reproduction attempts made mid-day, against a warm fleet",
      ],
      fixes: [
        { action: "Provisioned concurrency on the login-path functions, scheduled for business hours", kind: "immediate" },
        { action: "Bundle-size gate in CI; remove the vestigial VPC attachment", kind: "structural" },
        { action: "Track Init Duration as a first-class metric with its own alert", kind: "structural" },
      ],
      lesson:
        "Serverless didn't fail — it behaved exactly as priced. The catalog's cold-start sub-score exists because p50 hides what p99 pays, and 'cannot reproduce at 2pm' is exactly what this failure mode is designed to make you say.",
    },
  },
  {
    id: "immortal-price",
    name: "The price that wouldn't die",
    teaser:
      "New pricing launched at 09:00 with a press release. Half the internet still sees the old price. Your laptop shows the new one.",
    stack: {
      architecture: "monolith",
      frontend: "react",
      backend: "aspnet-core",
      "api-style": "rest",
      "data-access": "ef-core",
      database: "postgres",
      caching: "cdn-cache",
      auth: "managed-idp",
      hosting: "paas-containers",
    },
    context: { teamSize: "mid", platformTeam: false, compliance: false },
    narrative:
      "Marketing launches the new pricing at 09:00, press release and all. By 09:30 it's on social media: half the audience sees the old prices. Some users see the new price on the pricing page and the old one on the homepage banner. Your laptop shows the new price everywhere; the CEO's phone shows the old one. The deploy dashboard is green, one version running, and the API — tested directly — returns correct values.",
    timeline: [
      { time: "09:00", entry: "Price change deployed; curl against the ORIGIN returns new values immediately" },
      { time: "09:10", entry: "First 'old price' reports, geographically scattered" },
      { time: "09:22", entry: "Engineer: 'cannot reproduce' (hard-refresh, office network)" },
      { time: "09:35", entry: "curl through the PUBLIC url: age: 41732 · cache-control: public, max-age=86400" },
      { time: "09:41", entry: "The homepage banner embeds price in a JSON fragment cached separately from the pricing page" },
    ],
    culprit: "cdn-cache",
    culpritReveal:
      "Correct — the edge. Price-bearing responses carried public, max-age=86400, and the deploy shipped no purge step. Every edge node is legally entitled to serve its own vintage of your prices until its copy expires — which is why the symptom varied by geography and by page. The origin told the truth from minute zero; almost nobody was talking to the origin.",
    redHerrings: {
      postgres:
        "The origin curl at 09:00 returned correct values — the database was serving truth from the first minute.",
      "aspnet-core":
        "Also truthful all along. Every request that actually REACHED it got the new price. The problem is how few did.",
      react:
        "The frontend renders what it receives. It received day-old JSON — from somewhere closer than your servers.",
      "ef-core": "Correct values came out of the data layer on every real request.",
      "managed-idp": "Authentication has nothing cached here; anonymous pages misbehaved too.",
      rest:
        "REST's superpower — HTTP caching — obeyed the instructions it was given, to the letter. It always does. That's the terror of it: the instructions were the bug.",
      monolith: "One deployable, one version, deployed cleanly. The extra 'versions' were running at the edge, not in your infrastructure.",
      "paas-containers": "Hosting served the new build from 09:00. Check what sits in FRONT of it.",
    },
    mechanisms: [
      {
        id: "replica-lag",
        text: "Postgres read-replica lag: replicas still serving the old price",
        debrief:
          "Origin curls showed correct values from minute zero — and replica lag is measured in seconds, not the 11.5 hours that age header confesses to.",
      },
      {
        id: "stale-cdn",
        text: "Stale CDN: day-long TTLs on price-bearing responses and no purge in the deploy — every edge node serves its own vintage until expiry",
        correct: true,
        debrief:
          "The age: 41732 header is a signed confession: that response was cached 11.5 hours before the launch. Geographic scatter, page-by-page inconsistency (separately cached fragments), and 'works on my laptop' (your office route missed the stale node) all follow.",
      },
      {
        id: "local-storage",
        text: "Browsers cached the old price in localStorage",
        debrief:
          "That would affect returning visitors uniformly regardless of geography, and a hard refresh would clear it — the engineer's hard-refresh 'worked' because their route hit a fresh edge node, not because of anything browser-side.",
      },
      {
        id: "two-versions",
        text: "A second app version is still running behind the load balancer",
        debrief:
          "The deploy dashboard and direct origin checks both said one version. You were right that multiple versions were serving traffic — but they were cached copies at the edge, not processes in your infrastructure.",
      },
    ],
    postmortem: {
      rootCause:
        "Price-bearing responses shipped with public, max-age=86400 and no surrogate keys; the deploy pipeline had no purge step. Every edge node lawfully served day-old prices until its own copy expired.",
      contributing: [
        "Cache headers written once at launch and never revisited per content class",
        "No CDN purge step in the deploy pipeline",
        "All post-deploy verification hit the origin — nobody checked through the URL users actually use",
        "Price embedded in multiple separately-cached fragments, guaranteeing inconsistency during expiry",
      ],
      fixes: [
        { action: "Global CDN purge; drop TTL on price-bearing endpoints to minutes", kind: "immediate" },
        { action: "Split cache policy by content class: immutable assets cache forever, price-bearing data caches briefly with surrogate keys", kind: "structural" },
        { action: "Deploys purge by surrogate key; post-deploy smoke test goes through the CDN, not around it", kind: "structural" },
      ],
      lesson:
        "Cache-control headers are architecture that happens to live in a config file. In the layered caching model, 'we deployed it' and 'users can see it' are separate facts — always verify at the layer users actually hit.",
    },
  },
];
