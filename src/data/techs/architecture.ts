import type { Tech } from "../types";

/**
 * Architecture styles. These aren't products — they're shapes you commit to.
 * Scores are relative to each other, from the perspective of a typical
 * product team (not a FAANG platform org); scoreNotes flag where the answer
 * flips at a different org size.
 */
export const ARCHITECTURE_TECHS: Tech[] = [
  {
    id: "monolith",
    name: "Monolith",
    category: "architecture",
    tagline: "One deployable. The right default that everyone apologizes for choosing.",
    description:
      "All code ships as a single deployable unit sharing one database. Function calls instead of network calls, one transaction boundary, one thing to deploy and monitor. The industry spent a decade treating this as legacy, then quietly noticed that most successful systems started (and many stayed) here.",
    scores: {
      performance: 7,
      devVelocity: 9,
      learningEase: 9,
      ecosystem: 8,
      scalability: 4,
      typeSafety: 8,
      opsSimplicity: 9,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "In-process calls beat network hops every time; the ceiling is vertical scaling of one process.",
      scalability:
        "Scales fine horizontally behind a load balancer until the database or the team becomes the bottleneck — the '4' is about scaling the codebase and org, not requests.",
      typeSafety:
        "Every cross-module call is compile-time checked — a property every distributed style gives up.",
    },
    strengths: [
      "One deploy, one log stream, one debugger session — the whole system fits in your head and your IDE",
      "Refactoring across module boundaries is a rename, not a versioned API migration",
      "ACID transactions across the whole domain for free",
      "Cheapest possible operational footprint: one process, one database",
    ],
    weaknesses: [
      "One team's bad deploy takes down everyone's features",
      "Scaling is all-or-nothing: you replicate the whole app to scale one hot path",
      "Technology lock-in: the whole codebase moves versions together",
      "Without discipline, module boundaries erode into a big ball of mud",
    ],
    chooseWhen: [
      "You're starting almost anything — it's the default that must be argued out of, not into",
      "The team is under ~20 engineers working in one codebase",
      "The domain is still being discovered and boundaries will move",
    ],
    avoidWhen: [
      "Independent teams genuinely need independent deploy cadences today (not someday)",
      "Parts of the system have wildly different scaling or availability profiles",
    ],
    alternatives: [
      {
        techId: "modular-monolith",
        note: "Same deployable, enforced internal boundaries — the upgrade path when the ball of mud threatens but the ops budget hasn't grown.",
        effort: "moderate",
      },
      {
        techId: "microservices",
        note: "Split when team-scale pain (deploy contention, ownership disputes) exceeds the very real distributed-systems tax — not before.",
        effort: "rewrite",
      },
      {
        techId: "serverless-arch",
        note: "For spiky or low-traffic workloads where paying for an always-on process stings.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "postgres", note: "One relational database with real transactions is the monolith's superpower — lean into it." },
      { techId: "paas-containers", note: "A single container on a PaaS is the lowest-friction way to run one deployable." },
      { techId: "in-process-cache", note: "With one process, a simple in-memory cache often removes the need for cache infrastructure entirely." },
    ],
    frictionWith: [
      { techId: "kafka", note: "An event log between parts of one deployable usually means you've built a distributed system with extra steps." },
      { techId: "kubernetes", note: "Running one deployable on a full K8s cluster is renting a container ship to move a couch." },
    ],
    commitments: [
      {
        need: "You now own module-boundary discipline with no compiler or network to enforce it",
        why: "Every shortcut import is legal in one codebase; the big ball of mud arrives one expedient PR at a time.",
      },
      {
        need: "You now must watch the scaling ceiling — database contention, build times, deploy duration — and plan the exit before you hit it",
        why: "A monolith fails gradually, then suddenly; the time to draw module boundaries is while the codebase still fits in someone's head.",
      },
      {
        need: "You now own a release train: every team ships on one cadence, and one team's freeze is everyone's freeze",
        why: "A single deployable means a single pipeline — deploy coordination is a standing meeting you signed up for, it just doesn't hurt yet.",
      },
    ],
    tags: ["default-choice", "single-deployable"],
  },
  {
    id: "modular-monolith",
    name: "Modular Monolith",
    category: "architecture",
    tagline: "Microservice boundaries, monolith deployment — discipline instead of network calls.",
    description:
      "One deployable, but internally partitioned into modules with enforced boundaries: modules own their tables, expose explicit interfaces, and may only talk through them. You get most of microservices' organizational benefits while keeping one process, one deploy, and real transactions. The catch: the boundaries are maintained by discipline and tooling, not by the network.",
    scores: {
      performance: 7,
      devVelocity: 8,
      learningEase: 6,
      ecosystem: 6,
      scalability: 6,
      typeSafety: 8,
      opsSimplicity: 8,
      maturity: 6,
    },
    scoreNotes: {
      ecosystem:
        "The pattern is old but the formalized tooling (architecture tests, module systems) is newer and thinner than microservices' ecosystem.",
      scalability:
        "Org-scalability sits between monolith and microservices: clear ownership without independent deployment.",
    },
    strengths: [
      "Module boundaries are real enough to extract a service from later — the best-documented migration path to microservices",
      "Refactoring a boundary is still a compile-time operation, not a cross-team API negotiation",
      "One deploy pipeline and one on-call rotation, however many modules",
      "Forces the domain-boundary conversation early, when it's cheap",
    ],
    weaknesses: [
      "Boundaries are enforced by convention and CI checks — one hurried PR can tunnel through them",
      "Still one runtime: no independent scaling, deployment, or technology per module",
      "Requires more up-front design maturity than 'just build the monolith'",
      "Less literature and fewer war stories than either neighbor",
    ],
    chooseWhen: [
      "You believe you'll need service boundaries eventually but refuse to pay the distributed tax now",
      "Multiple squads share one codebase and stepping on each other is the emerging pain",
      "You're consolidating a premature microservices estate back into something operable",
    ],
    avoidWhen: [
      "The team lacks the discipline or tooling to keep boundaries honest — it degrades into a plain monolith quietly",
      "You genuinely need per-module scaling or deploy independence on day one",
    ],
    alternatives: [
      {
        techId: "monolith",
        note: "If the team is small and boundaries are speculative, skip the ceremony and keep modules as plain namespaces.",
        effort: "drop-in",
      },
      {
        techId: "microservices",
        note: "Extract the modules whose deploy cadence or scale profile has demonstrably diverged — the boundaries are already drawn.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "postgres", note: "Schema-per-module in one database keeps ownership clear while transactions still work." },
      { techId: "aspnet-core", note: ".NET's project/assembly system plus architecture tests make module boundaries mechanically enforceable." },
      { techId: "spring-boot", note: "Spring Modulith exists precisely to enforce this pattern on the JVM." },
    ],
    commitments: [
      {
        need: "You now own boundary enforcement in CI — architecture tests, module systems, or lint rules that fail the build on an illegal import",
        why: "There's no network policing your boundaries, so your tooling must; a boundary that isn't mechanically enforced quietly stops existing.",
      },
      {
        need: "You now must design module interfaces like service contracts, with review to match",
        why: "The whole promise is that a module can be extracted later — that only stays true if its interface never grew convenience backdoors.",
      },
      {
        need: "You now own ongoing boundary maintenance as the domain shifts",
        why: "Boundaries drawn at project start decay as the business moves; unmaintained ones become exactly the walls everyone tunnels through.",
      },
    ],
    tags: ["stepping-stone", "single-deployable"],
  },
  {
    id: "microservices",
    name: "Microservices",
    category: "architecture",
    tagline: "Independent services for independent teams — an org chart optimization that costs a distributed system.",
    description:
      "The system is decomposed into separately deployed services, each owning its data and communicating over the network. Solves real problems — team autonomy, independent scaling, fault isolation, per-service tech choices — by converting them all into distributed-systems problems: network failures, eventual consistency, versioned contracts, and an observability stack you now cannot live without.",
    scores: {
      performance: 5,
      devVelocity: 4,
      learningEase: 3,
      ecosystem: 8,
      scalability: 10,
      typeSafety: 4,
      opsSimplicity: 2,
      maturity: 8,
    },
    scoreNotes: {
      devVelocity:
        "For a large org with mature platform tooling this flips to a strength — the '4' is the small-to-mid team reality of contract coordination and local-dev pain.",
      performance:
        "Every in-process call that becomes a network hop adds latency and a failure mode; you buy back throughput with independent scaling.",
      typeSafety:
        "Cross-service calls are runtime contracts. Schema registries and codegen (gRPC, OpenAPI) claw some back — that's tooling you now own.",
    },
    strengths: [
      "Teams deploy independently — no release-train coordination as the org grows",
      "Hot paths scale alone; a memory leak in reporting can't take down checkout",
      "Failure isolation with real blast-radius boundaries",
      "Each service can pick the right tool (language, database) for its job",
    ],
    weaknesses: [
      "A distributed system's failure modes: partial failure, retries, idempotency, eventual consistency — all now your problem",
      "Requires serious platform investment: service discovery, tracing, centralized logging, CI/CD per service",
      "Cross-service features are slow: contract negotiation replaces refactoring",
      "Local development and integration testing get dramatically harder",
    ],
    chooseWhen: [
      "Multiple teams demonstrably block each other's releases in one codebase",
      "Parts of the system have proven, divergent scaling or availability needs",
      "You have (or will fund) platform engineering to pay the operational tax",
    ],
    avoidWhen: [
      "A team under ~20 engineers — you'll spend your feature budget on plumbing",
      "The domain boundaries are still moving; a wrong service boundary is 10x costlier than a wrong module boundary",
      "It's being chosen because it's what serious companies do — that's résumé-driven architecture",
    ],
    alternatives: [
      {
        techId: "modular-monolith",
        note: "Delivers the ownership and boundary benefits without the network in the middle — the honest first step for most teams.",
        effort: "moderate",
      },
      {
        techId: "event-driven",
        note: "Often layered onto microservices; choose event-driven when the coupling you need to break is temporal (who must be up when), not just organizational.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "kubernetes", note: "K8s exists for exactly this: orchestrating many small deployables with health checks and service discovery." },
      { techId: "grpc", note: "Typed, fast service-to-service contracts with codegen — claws back some of the type safety the network took." },
      { techId: "kafka", note: "Async events between services decouple availability — service A publishes whether or not service B is up." },
    ],
    frictionWith: [
      { techId: "session-auth", note: "Server-held sessions fight horizontal, polyglot services; stateless tokens travel better." },
    ],
    notInterchangeableWith: [
      {
        techId: "modular-monolith",
        note: "People treat these as sizes of the same thing. They're not: one has network boundaries with independent failure modes, the other has compile-time boundaries. The migration between them is real work, in either direction.",
      },
    ],
    commitments: [
      {
        need: "You now need distributed tracing and centralized logging before the first incident, not after",
        why: "A request crossing five services can't be debugged from any single service's logs.",
      },
      {
        need: "You now own versioned API contracts between teams",
        why: "A breaking change is no longer a compile error — it's a production incident in someone else's service.",
      },
      {
        need: "You now own a platform: service templates, per-service CI/CD, service discovery, secrets distribution",
        why: "Every service repeats the same infrastructure needs — without a paved road, each team paves its own, differently.",
      },
      {
        need: "You now need a maintained answer to local development",
        why: "Running thirty services on a laptop stops working early; docker-compose sprawl, shared environments, or contract stubs — someone must build and keep whichever you pick alive.",
      },
    ],
    tags: ["distributed", "team-scale"],
  },
  {
    id: "event-driven",
    aka: ["EDA", "pub/sub architecture"],
    name: "Event-Driven Architecture",
    category: "architecture",
    tagline: "Components communicate by publishing facts, not calling each other — decoupled in time, coupled in schema.",
    description:
      "Producers emit events ('OrderPlaced') to a broker or log; consumers react without the producer knowing they exist. This decouples availability (the producer doesn't care if a consumer is down) and enables fan-out, audit trails, and replay. The price: workflows become invisible — no stack trace shows you 'what happens after checkout' — and consistency becomes eventual everywhere.",
    scores: {
      performance: 8,
      devVelocity: 4,
      learningEase: 3,
      ecosystem: 7,
      scalability: 9,
      typeSafety: 4,
      opsSimplicity: 3,
      maturity: 7,
    },
    scoreNotes: {
      performance:
        "Async hand-offs absorb spikes and parallelize beautifully; end-to-end latency of any single workflow gets worse, throughput gets better.",
      typeSafety:
        "Event schemas drift silently unless you run a schema registry — the producer compiles fine after breaking every consumer.",
    },
    strengths: [
      "Producers and consumers deploy, fail, and scale independently — true temporal decoupling",
      "Adding a new consumer (analytics, notifications, EDI outbound feed) requires zero producer changes",
      "The event stream is a natural audit log and replay mechanism",
      "Absorbs load spikes: the queue buffers what the consumers can't keep up with",
    ],
    weaknesses: [
      "Debugging is archaeology: correlating events across consumers replaces reading a stack trace",
      "Eventual consistency leaks into UX and business logic ('the order you just placed isn't in your history yet')",
      "Exactly-once is a lie; you own idempotency, ordering, and duplicate handling forever",
      "Event schema changes require choreographed migrations across unknown consumers",
    ],
    chooseWhen: [
      "Integration-heavy domains where many systems react to the same business facts — this is the water EDI shops already swim in",
      "Workflows are naturally async (fulfillment, settlement, document processing)",
      "You need to add consumers over time without touching producers",
    ],
    avoidWhen: [
      "The domain is mostly synchronous request/response CRUD — you'd be adding invisible complexity for symmetry's sake",
      "The team hasn't operated a broker before and the deadline is near",
    ],
    alternatives: [
      {
        techId: "microservices",
        note: "The synchronous alternative for decomposition: REST/gRPC calls keep workflows traceable but couple availability — A can't finish if B is down.",
        effort: "rewrite",
      },
      {
        techId: "cqrs-es",
        note: "Go further and make events the source of truth, not just notifications — only where audit/replay demands justify it.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "kafka", note: "The canonical backbone when events are facts to retain and replay, not just work to distribute." },
      { techId: "rabbitmq", note: "The right broker when events are commands/work-items to be consumed once and acknowledged." },
      { techId: "cassandra", note: "Write-heavy event ingestion at scale is Cassandra's home turf." },
    ],
    notInterchangeableWith: [
      {
        techId: "websockets",
        note: "'Event-driven' the architecture is about system-to-system async messaging; WebSockets is a client-push transport. Sharing the word 'event' is a coincidence.",
      },
    ],
    commitments: [
      {
        need: "You now own idempotent consumers and duplicate handling, in every consumer, forever",
        why: "At-least-once delivery is the only honest guarantee a broker makes; a consumer that can't survive a replayed event corrupts data on an ordinary Tuesday.",
      },
      {
        need: "You now need event schema governance — a registry, compatibility rules, and a deprecation process",
        why: "Producers can't see their consumers; without enforced compatibility, a renamed field ships as a successful deploy and lands as a silent consumer crash.",
      },
      {
        need: "You now own workflow observability: correlation IDs and tracing stitched across every hop",
        why: "No stack trace shows 'what happens after checkout' — without correlation, incident response is grepping five consumers' logs by timestamp.",
      },
      {
        need: "You now run a broker as tier-zero infrastructure",
        why: "The broker inherits the availability requirements of every workflow that crosses it — when it's down, everything is down.",
      },
    ],
    tags: ["distributed", "async"],
  },
  {
    id: "serverless-arch",
    aka: ["FaaS-first architecture", "cloud-native glue"],
    name: "Serverless Architecture",
    category: "architecture",
    tagline: "Functions and managed services, billed per use — no servers to patch, new failure modes to learn.",
    description:
      "The application is composed of cloud functions (Lambda, Azure Functions) glued to managed services (queues, object storage, managed databases). Nothing runs when nothing happens, scaling is the platform's problem, and there is no server to patch at 2 AM. In exchange: cold starts, execution time limits, vendor-shaped architecture, and debugging that spans six managed services' consoles.",
    scores: {
      performance: 4,
      devVelocity: 7,
      learningEase: 6,
      ecosystem: 7,
      scalability: 9,
      typeSafety: 5,
      opsSimplicity: 8,
      maturity: 6,
    },
    scoreNotes: {
      performance:
        "Cold starts and per-invocation overhead hurt latency-sensitive paths; steady high-throughput workloads also get expensive fast.",
      opsSimplicity:
        "No servers to manage, but distributed tracing across managed services is its own discipline — simple to run, harder to understand.",
    },
    strengths: [
      "Zero idle cost — a genuinely free tier for low-traffic and spiky workloads",
      "Scaling from 0 to thousands of concurrent executions with no capacity planning",
      "No OS patching, no process babysitting, no capacity on-call",
      "Forces small, stateless, event-shaped units — decent architecture by constraint",
    ],
    weaknesses: [
      "Cold-start latency on infrequently-hit paths (worse with heavy runtimes and VPCs)",
      "Execution limits (time, memory, payload) shape your design in vendor-specific ways",
      "Local development and testing are perpetually second-class",
      "At sustained high traffic, per-invocation pricing crosses over and always-on becomes cheaper",
    ],
    chooseWhen: [
      "Traffic is spiky, low, or unpredictable — pay-per-use is unbeatable there",
      "Glue work: file-arrival triggers, scheduled jobs, webhook handlers, queue consumers",
      "A small team wants production-grade scaling without an ops function",
    ],
    avoidWhen: [
      "Latency-critical request paths where a cold start is a broken SLA",
      "Long-running or stateful processes (streaming, big batch) that fight execution limits",
      "Portability across clouds is a hard requirement",
    ],
    alternatives: [
      {
        techId: "monolith",
        note: "Past a steady-traffic threshold, one boring always-on service is cheaper and simpler than a constellation of functions.",
        effort: "rewrite",
      },
      {
        techId: "microservices",
        note: "When functions multiply and need contracts and ownership anyway, containerized services give the same boundaries with fewer platform limits.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "serverless-functions", note: "The hosting model is the architecture — these choices are made together." },
      { techId: "dynamodb", note: "Per-request pricing and zero connection pools match the function model exactly; classic RDBMS connection limits do not." },
      { techId: "sqs-sns", note: "Managed queues are the natural glue between functions." },
    ],
    frictionWith: [
      { techId: "hibernate", note: "Heavyweight ORM warm-up per cold start is real money and real latency — lightweight data access wins in functions." },
    ],
    commitments: [
      {
        need: "You now own a cold-start budget per latency-sensitive path, and must measure it continuously",
        why: "Cold starts degrade invisibly as functions, dependencies, and VPC config change — nobody notices until a customer does.",
      },
      {
        need: "You now track vendor limits (execution time, payload size, concurrency) as design constraints",
        why: "These limits are load-bearing walls: a job that needs sixteen minutes of processing doesn't need a refactor, it needs a different architecture.",
      },
      {
        need: "You now need distributed debugging skills and tracing across managed services",
        why: "A request touches functions, queues, and managed stores; when it fails, there is no process to attach a debugger to.",
      },
      {
        need: "You now own cost observability as an engineering discipline",
        why: "Per-invocation pricing turns a retry storm or a chatty loop into a bill, not a blip — someone must watch spend the way other teams watch CPU.",
      },
    ],
    tags: ["managed", "pay-per-use"],
  },
  {
    id: "cqrs-es",
    aka: ["CQRS", "Event Sourcing", "ES"],
    name: "CQRS + Event Sourcing",
    category: "architecture",
    tagline: "Writes are commands, reads are projections, history is the database — maximal power, maximal ceremony.",
    description:
      "Command Query Responsibility Segregation splits the write model from read models; Event Sourcing stores every state change as an immutable event, with current state derived by replay. Together they give perfect audit history, time travel, and independently-optimized read models. They also multiply every simple CRUD feature into commands, events, handlers, and projections — this is the most frequently regretted architecture in the catalog when applied without cause.",
    scores: {
      performance: 8,
      devVelocity: 3,
      learningEase: 2,
      ecosystem: 5,
      scalability: 9,
      typeSafety: 6,
      opsSimplicity: 3,
      maturity: 5,
    },
    scoreNotes: {
      performance:
        "Read models are precomputed exactly for their query — reads are O(lookup). The write side pays for it.",
      maturity:
        "The pattern is well-described but tooling is niche and most teams' first implementation is their training project.",
    },
    strengths: [
      "A complete, immutable audit trail is the data model, not a bolt-on — auditors and regulators love it",
      "Temporal queries for free: reconstruct any past state, replay onto new projections",
      "Read and write sides scale and evolve independently",
      "New reporting views can be built retroactively from history",
    ],
    weaknesses: [
      "Every feature costs a command, event(s), handlers, and projection updates — CRUD becomes ceremony",
      "Projections are eventually consistent; UI and business logic must cope",
      "Event schema versioning over years is genuinely hard (upcasting, migration strategies)",
      "Small hiring pool; long onboarding; easy to implement subtly wrong",
    ],
    chooseWhen: [
      "The audit trail IS a business requirement (finance, healthcare, trading, compliance-heavy EDI flows)",
      "The domain is naturally event-shaped and 'how did we get here?' is a routine business question",
      "Read and write workloads have irreconcilably different shapes",
    ],
    avoidWhen: [
      "It's most of an application that is basically forms-over-data — you'll drown in ceremony",
      "The team is learning the pattern on a deadline",
      "Applied system-wide: even advocates scope it to the subdomains that earn it",
    ],
    alternatives: [
      {
        techId: "event-driven",
        note: "If you need events between systems but a normal database inside them, plain event-driven integration is 20% of the cost for 80% of the benefit.",
        effort: "rewrite",
      },
      {
        techId: "monolith",
        note: "A boring CRUD system with a well-designed audit log table covers a surprising share of 'we need history' requirements.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "kafka", note: "A durable, replayable log is a natural event store and projection feed." },
      { techId: "postgres", note: "A pragmatic event store (append-only table) and home for projections — no exotic infrastructure required." },
    ],
    notInterchangeableWith: [
      {
        techId: "event-driven",
        note: "Event-driven integration uses events to notify other systems; event sourcing uses events as the system of record. Confusing these leads to sourcing your integration events — a famous trap.",
      },
    ],
    commitments: [
      {
        need: "You now own an event versioning and upcasting strategy for the lifetime of the system",
        why: "Events written today must still be readable in ten years; they're immutable, so every schema change needs an upcaster — 'we'll just migrate the data' is not on the menu.",
      },
      {
        need: "You now need projection rebuild tooling and a runbook for using it",
        why: "Projections are disposable caches by design; replaying years of events onto a corrupted or brand-new projection must be a routine operation, not a research project.",
      },
      {
        need: "You now own eventual-consistency UX patterns across the whole product",
        why: "The read model lags the write model by design; every screen must decide how to handle 'you just did that, but it isn't visible yet'.",
      },
      {
        need: "You now must turn the pattern's tribal knowledge into onboarding curriculum",
        why: "CQRS+ES failure modes (sourcing integration events, commands reading projections) look fine in code review and hurt months later — new hires can't ship safely on intuition.",
      },
    ],
    tags: ["audit", "advanced"],
  },
];
