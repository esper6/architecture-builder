import type { Tech } from "../types";

/**
 * Messaging systems. The headline lesson of this category: "Kafka vs RabbitMQ"
 * is the most common false equivalence in system design. A queue distributes
 * WORK to be consumed once; a log retains FACTS to be re-read. Most of the
 * remaining choices here are really "who operates the broker" questions.
 */
export const MESSAGING_TECHS: Tech[] = [
  {
    id: "rabbitmq",
    aka: ["AMQP broker"],
    name: "RabbitMQ",
    category: "messaging",
    tagline: "The classic smart broker: messages are work, and the broker's job is to hand each piece to exactly one worker.",
    description:
      "A mature message broker built on the queue-of-work model: producers publish to exchanges, the broker routes to queues, and consumers take messages, do the work, and acknowledge. Routing intelligence (topic exchanges, headers, priorities), per-message acks, retries, and dead-letter queues all live in the broker, keeping consumers simple. Its model assumes a message is consumed once and then gone — which is exactly right for task distribution and exactly wrong for event history.",
    scores: {
      performance: 6,
      devVelocity: 8,
      learningEase: 7,
      ecosystem: 8,
      scalability: 6,
      typeSafety: 3,
      opsSimplicity: 5,
      maturity: 9,
    },
    scoreNotes: {
      scalability:
        "Scales fine for the overwhelming majority of workloads; clustering and queue federation exist but get fiddly — this is where Kafka-class throughput needs actually diverge.",
      typeSafety:
        "Messages are bytes; nothing checks that producer and consumer agree on the payload. Contract discipline is on you (shared DTOs, versioned schemas).",
      opsSimplicity:
        "A single node is easy; a properly clustered, monitored production deployment (memory alarms, queue depth, mirrored/quorum queues) is a real ops responsibility.",
    },
    strengths: [
      "Rich routing in the broker: topic exchanges, header matching, priorities — consumers stay dumb and simple",
      "Per-message acknowledgement with automatic redelivery: a crashed worker's message goes back on the queue",
      "First-class dead-letter queues make 'what happens to poison messages' a configuration, not a design project",
      "Competing consumers for free: add workers, the broker load-balances work across them",
      "Protocol standard (AMQP) with excellent client libraries in every mainstream language",
    ],
    weaknesses: [
      "A consumed message is gone — no replay, no late-joining consumer catching up on history",
      "Throughput ceiling well below log-based systems; very large fan-out or firehose ingestion strains it",
      "Clustering and high availability are historically the sharp edges (network partitions, queue synchronization)",
      "Broker-side smarts mean broker-side state — the broker is a stateful service you must care for",
    ],
    chooseWhen: [
      "Distributing work across a pool of workers: image processing, email sending, EDI document translation jobs",
      "You need routing logic (this message type goes to these three queues) without building it in application code",
      "Request/reply and RPC-over-messaging patterns — the broker model fits them naturally",
    ],
    avoidWhen: [
      "Consumers need to replay history or new consumers must process past events — that's a log, not a queue",
      "Sustained firehose throughput (clickstreams, telemetry) where partitioned logs are the proven shape",
      "You're on a cloud whose managed queue (Service Bus, SQS) covers your needs — self-operating a broker for parity features is pure cost",
    ],
    alternatives: [
      {
        techId: "kafka",
        note: "Switch when messages stop being work-to-do and start being facts-to-retain: multiple consumers, replay, event history.",
        effort: "rewrite",
      },
      {
        techId: "azure-service-bus",
        note: "Same conceptual model, nobody to operate — the obvious swap for Azure shops.",
        effort: "moderate",
      },
      {
        techId: "sqs-sns",
        note: "The AWS-managed equivalent; less routing sophistication, zero broker operations.",
        effort: "moderate",
      },
      {
        techId: "nats",
        note: "When you want lighter-weight messaging with a smaller footprint and can live with a smaller ecosystem.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "event-driven", note: "The right broker when events are really commands or work items — consumed once, acknowledged, done." },
      { techId: "microservices", note: "Async work hand-off between services without coupling their availability." },
      { techId: "postgres", note: "The classic pairing: transactional outbox in Postgres, RabbitMQ delivers — solving the dual-write problem." },
    ],
    notInterchangeableWith: [
      {
        techId: "kafka",
        note: "The most common false equivalence in system design. RabbitMQ distributes work: each message consumed once, acked, deleted. Kafka retains facts: consumers read and re-read an immutable log at their own pace. 'Which broker?' is the wrong question until you know whether your messages are work or history.",
      },
    ],
    commitments: [
      {
        need: "You now operate a stateful broker as tier-one infrastructure",
        why: "Memory alarms, disk watermarks, queue-depth monitoring, and cluster upgrades are yours — the broker is now the most availability-critical box between any two services.",
      },
      {
        need: "You now need a dead-letter triage process, not just a dead-letter queue",
        why: "The DLQ is a config line; someone reading it, classifying failures, and replaying or discarding is a standing rota. An undrained DLQ is where failures go to be forgotten.",
      },
      {
        need: "You now must write idempotent consumers despite per-message acks",
        why: "Redelivery after a worker crash means at-least-once in practice — the duplicate arrives on your worst day, and only consumer-side idempotency absorbs it.",
      },
    ],
    tags: ["queue", "work-distribution", "amqp"],
  },
  {
    id: "kafka",
    aka: ["Confluent", "Amazon MSK", "Azure Event Hubs (Kafka-compatible)"],
    name: "Kafka",
    category: "messaging",
    tagline: "Not a queue — a distributed, replayable log where messages are facts that many consumers read at their own pace.",
    description:
      "A distributed append-only log: producers write events to partitioned topics, and consumers read them without removing them — the same event can feed the order service, the analytics pipeline, and next year's projection rebuild. Retention, replay, and consumer groups make it the backbone of serious event-driven estates. The cost is a genuinely heavy distributed system to operate (or a managed-service bill) and a partitioning discipline that quietly shapes your whole data model.",
    scores: {
      performance: 9,
      devVelocity: 4,
      learningEase: 3,
      ecosystem: 9,
      scalability: 10,
      typeSafety: 5,
      opsSimplicity: 2,
      maturity: 9,
    },
    scoreNotes: {
      opsSimplicity:
        "Self-hosted Kafka is a distributed system with its own on-call rotation. Managed offerings (Confluent, MSK, Event Hubs) move this toward a 6 — for a price.",
      typeSafety:
        "Raw Kafka is bytes, but the schema-registry ecosystem (Avro/Protobuf, compatibility checks) is the most mature contract-enforcement story in the category — if you adopt it.",
      learningEase:
        "Partitions, consumer groups, offsets, rebalancing, ordering-per-partition-only: the mental model is the curve, and getting partition keys wrong is expensive to unwind.",
      devVelocity:
        "The '4' is the tax of thinking in partitions, offsets, and idempotency for every feature; teams already fluent in the model move much faster.",
    },
    strengths: [
      "Replay is a first-class feature: rewind a consumer group, backfill a new projection, recover from a bad deploy by reprocessing",
      "Many independent consumer groups read the same events — adding a consumer never touches the producer or other consumers",
      "Throughput in a different league: partitioned, sequential-write design handles firehose workloads",
      "Retained history turns the message system into an audit trail and integration source of record",
      "Massive ecosystem: Connect for integrations, Streams/ksqlDB for processing, schema registry for contracts",
    ],
    weaknesses: [
      "Heavy to operate self-hosted: brokers, partitions, rebalancing storms, capacity planning — a platform, not a utility",
      "Ordering is per-partition only; your partition-key choice is an architectural commitment that's painful to change",
      "No broker-side routing smarts or per-message ack/redelivery — retries, DLQs, and poison handling are your application's job",
      "Overkill as a simple work queue — teams routinely deploy a distributed log to do what a queue does better",
    ],
    chooseWhen: [
      "Events are facts multiple systems consume independently — the integration backbone for an event-driven estate",
      "Replay and history are requirements: rebuilding projections, backfilling analytics, feeding new consumers from day zero",
      "Sustained high-volume streams (telemetry, clickstream, CDC) where partitioned throughput is the point",
    ],
    avoidWhen: [
      "You need a work queue with per-message acks, retries, and DLQs — a queue does that natively; Kafka makes you build it",
      "Small team, modest volume, no replay requirement — the operational weight buys you nothing",
      "You can't fund managed Kafka and don't have the platform engineering to run it",
    ],
    alternatives: [
      {
        techId: "rabbitmq",
        note: "Switch when messages are really work items consumed once — you get acks, retries, and DLQs for free instead of building them.",
        effort: "rewrite",
      },
      {
        techId: "sqs-sns",
        note: "If the honest requirement is 'queue plus fan-out' rather than 'replayable log', the managed primitives are a fraction of the complexity.",
        effort: "rewrite",
      },
      {
        techId: "nats",
        note: "JetStream covers lightweight persistent-streaming needs with a footprint an order of magnitude smaller.",
        effort: "moderate",
      },
      {
        techId: "redis-streams",
        note: "For modest-volume streaming when you already run Redis and can accept weaker durability guarantees.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "event-driven", note: "The canonical backbone when events are facts to retain and replay across many consumers." },
      { techId: "cqrs-es", note: "A durable, replayable log is a natural projection feed — and rewinding offsets rebuilds read models." },
      { techId: "cassandra", note: "Firehose in, write-optimized store out — a battle-tested high-volume ingestion pipeline." },
    ],
    frictionWith: [
      { techId: "monolith", note: "An event log between the parts of one deployable is a distributed system with extra steps — in-process events or a job table cover it." },
    ],
    notInterchangeableWith: [
      {
        techId: "rabbitmq",
        note: "Kafka is a log of facts, RabbitMQ a queue of work. Kafka doesn't delete on consume, doesn't ack per message, doesn't route per message — because it's not trying to. Using Kafka as a job queue means hand-building everything RabbitMQ gives you; using RabbitMQ as an event store means losing your history on consume.",
      },
    ],
    commitments: [
      {
        need: "You now own partition-key design and its consequences",
        why: "Ordering, parallelism, and hot spots are all decided by the key — and rekeying a topic in production is a project.",
      },
      {
        need: "You now need consumer-lag monitoring and alerting",
        why: "A silently stalled consumer is data loss on a delay timer.",
      },
      {
        need: "You now build the retry/DLQ/poison-message machinery yourself, per consumer",
        why: "The broker has no per-message redelivery — retry topics, dead-letter topics, and skip-or-halt decisions are application code every consuming team writes and maintains.",
      },
      {
        need: "You now need a schema-contract regime for data that outlives its producers",
        why: "Retained events are read by consumers that don't exist yet; without a schema registry and compatibility rules, a payload change today breaks a replay two years from now.",
      },
    ],
    tags: ["event-log", "streaming", "replay"],
  },
  {
    id: "azure-service-bus",
    name: "Azure Service Bus",
    category: "messaging",
    tagline: "Enterprise messaging as a utility bill — sessions, dedup, and transactions, with Microsoft on call.",
    description:
      "Azure's fully managed enterprise message broker: queues and topics with the features enterprise integration actually leans on — sessions for ordered processing per business key, duplicate detection, scheduled delivery, dead-lettering, and transactional sends. Conceptually it's the RabbitMQ model with the operations outsourced. For a shop already on Azure it's the default that must be argued out of; off Azure it's an odd thing to reach for.",
    scores: {
      performance: 5,
      devVelocity: 8,
      learningEase: 7,
      ecosystem: 6,
      scalability: 7,
      typeSafety: 3,
      opsSimplicity: 9,
      maturity: 8,
    },
    scoreNotes: {
      performance:
        "A managed multi-tenant service with per-operation latency — entirely adequate for business messaging, not built for firehose throughput (that's Event Hubs' job on Azure).",
      ecosystem:
        "Excellent first-party SDKs and deep Azure integration, but it's a single-cloud product — community knowledge and tooling are Azure-shaped.",
      opsSimplicity:
        "No broker to patch, cluster, or capacity-plan. The remaining ops work is configuration and monitoring quotas — a different job category from running RabbitMQ.",
    },
    strengths: [
      "The enterprise feature set built in: duplicate detection, scheduled delivery, sessions (per-key ordering), transactions across operations",
      "Dead-lettering with reason codes as a native, queryable feature — poison-message handling out of the box",
      "Nothing to operate: no cluster, no patching, no disk to fill at 2 AM",
      "Deep Azure integration: managed identity auth, Functions triggers, Logic Apps connectors",
      "Sessions solve the 'ordered per order-ID, parallel across orders' requirement that plain queues fumble",
    ],
    weaknesses: [
      "Azure-only — adopting it is a cloud commitment, not just a broker choice",
      "Quotas and tiers shape your design: message size limits, throughput units, premium pricing for the serious features",
      "Not for high-volume event streaming — Azure itself points that workload at Event Hubs",
      "Local development runs against an emulator or a real cloud namespace — the inner loop is worse than a Docker container",
    ],
    chooseWhen: [
      "You're an Azure shop needing reliable business messaging — this is the boring, correct default there",
      "Requirements include the enterprise checklist: ordered processing per entity, dedup, scheduled messages, transactional hand-off",
      "Integration workloads (order flows, document exchange, B2B hand-offs) where per-message reliability beats raw throughput",
    ],
    avoidWhen: [
      "You're not on Azure or need cloud portability — the equivalent primitive exists everywhere else",
      "The workload is event streaming at volume — wrong tool even within Azure's own catalog",
    ],
    alternatives: [
      {
        techId: "rabbitmq",
        note: "The self-hosted equivalent: more routing flexibility and portability, and now you operate a broker.",
        effort: "moderate",
      },
      {
        techId: "sqs-sns",
        note: "The AWS counterpart — simpler primitives, same 'managed and boring' virtue, if your cloud is AWS.",
        effort: "moderate",
      },
      {
        techId: "kafka",
        note: "When messages become replayable facts rather than consumable work — on Azure, that pressure usually points at Event Hubs' Kafka-compatible surface.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "First-party SDK, Functions triggers, and managed-identity auth make the all-Azure .NET path frictionless." },
      { techId: "serverless-functions", note: "Queue-triggered Azure Functions are the canonical consumer — scale-out workers with zero polling code." },
      { techId: "event-driven", note: "A managed broker removes the biggest adoption barrier to async architecture: operating the middleware." },
    ],
    commitments: [
      {
        need: "You now own idempotency where duplicate detection ends",
        why: "Dedup covers a time window, not forever, and delivery is still at-least-once — the consumer that can't survive a duplicate is a production incident waiting for a retry storm.",
      },
      {
        need: "You now design within quotas and tiers, and watch them as you grow",
        why: "Message-size limits, throughput units, and premium-only features are architectural constraints; a growth spurt turns a tier boundary into an unplanned re-negotiation.",
      },
      {
        need: "You now need someone who drains the dead-letter queues",
        why: "Dead-lettering with reason codes is native, but a DLQ nobody reads is silent message loss with better bookkeeping — triage and redrive are a process you staff.",
      },
      {
        need: "You now maintain a cloud-tethered inner loop",
        why: "Local development means an emulator or a real Azure namespace — dev and CI environments need a namespace strategy, and 'run it all in Docker' stops being true.",
      },
    ],
    tags: ["managed", "azure", "enterprise-messaging"],
  },
  {
    id: "sqs-sns",
    name: "AWS SQS + SNS",
    category: "messaging",
    tagline: "A queue and a fan-out, priced per request — aggressively boring, effectively infinite, and proud of it.",
    description:
      "AWS's messaging primitives: SQS is a managed queue (workers pull, process, delete), SNS is managed pub/sub fan-out (one publish, many subscribers — including SQS queues, the classic fan-out-to-queues pattern). No brokers, no clusters, no capacity planning; you pay per request and it scales past any load you will ever generate. The teaching points are its defaults: at-least-once delivery and best-effort ordering — FIFO queues buy back ordering and exactly-once at a throughput and cost premium.",
    scores: {
      performance: 5,
      devVelocity: 8,
      learningEase: 8,
      ecosystem: 7,
      scalability: 10,
      typeSafety: 2,
      opsSimplicity: 10,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "Polling latency and per-request overhead make it mediocre for latency-sensitive paths — throughput and elasticity are the point, not speed per message.",
      scalability:
        "The honest '10': no partitions to plan, no brokers to add — the queue absorbs whatever you throw at it (standard queues; FIFO has throughput caps).",
      typeSafety:
        "JSON strings over HTTP with no contract enforcement anywhere in the path — schema discipline is entirely on your team.",
      opsSimplicity:
        "There is nothing to operate. Configuration, IAM, and a CloudWatch alarm on queue depth is the entire ops story.",
    },
    strengths: [
      "Zero infrastructure: no broker exists from your point of view — a queue is an API call away",
      "Scales without ceremony from ten messages a day to tens of thousands per second",
      "SNS-to-many-SQS fan-out gives each consumer its own queue, retry policy, and DLQ — a robust pub/sub pattern from two primitives",
      "Per-request pricing means idle costs nothing — perfect for spiky and low-volume workloads",
      "Native DLQs, visibility timeouts, and delay queues cover the standard reliability checklist",
    ],
    weaknesses: [
      "At-least-once and unordered by default — idempotent consumers are mandatory, and teams learn this in production",
      "Ordering costs extra: FIFO queues have throughput limits, higher price, and require message-group discipline",
      "Primitive routing compared to a smart broker — complex topologies become SNS filter policies and glue",
      "AWS-only, and per-request pricing at sustained huge volume can exceed running your own broker",
    ],
    chooseWhen: [
      "You're on AWS and need work queues or fan-out — this is the boring default that must be argued out of",
      "Decoupling serverless components: SQS between Lambdas is the canonical buffering pattern",
      "Spiky or unpredictable volume where pay-per-request and elastic absorption beat provisioned anything",
    ],
    avoidWhen: [
      "You need replayable history or multiple consumers re-reading events — that's a log (Kinesis or Kafka), not a queue",
      "Strict ordering at high throughput — FIFO's caps and message-group mechanics fight you",
      "Multi-cloud portability is a real requirement rather than a slide-deck aspiration",
    ],
    alternatives: [
      {
        techId: "azure-service-bus",
        note: "The Azure counterpart, with a richer enterprise feature set (sessions, dedup, transactions) built in.",
        effort: "moderate",
      },
      {
        techId: "rabbitmq",
        note: "When you need broker-side routing intelligence or you're off AWS — at the price of operating it.",
        effort: "moderate",
      },
      {
        techId: "kafka",
        note: "When consumers need to replay history or many systems read the same events independently — a queue can't become a log.",
        effort: "rewrite",
      },
      {
        techId: "nats",
        note: "A portable, self-hosted lightweight alternative when AWS lock-in is the objection.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "serverless-arch", note: "The natural glue of serverless designs — queues buffer between functions, SNS fans events out to them." },
      { techId: "serverless-functions", note: "SQS-triggered Lambdas with automatic scaling and batching is the pattern AWS optimized end to end." },
      { techId: "dynamodb", note: "The all-managed AWS spine: per-request pricing on both sides, zero servers anywhere." },
    ],
    commitments: [
      {
        need: "You now write idempotent consumers everywhere, from day one",
        why: "At-least-once and unordered are the defaults, not edge cases — the duplicate and the out-of-order pair WILL arrive, and only consumer design absorbs them.",
      },
      {
        need: "You now own DLQ alarms and a redrive process",
        why: "Failed messages land in dead-letter queues that page nobody by default; without monitoring and an owner, they age out of retention and vanish.",
      },
      {
        need: "You now watch per-request spend as a growth metric",
        why: "Pricing that rounds to zero at launch crosses over at sustained volume — a chatty retry loop or a polling misconfiguration shows up on the invoice before the dashboard.",
      },
      {
        need: "You now maintain messaging topology as IAM policies and filter rules",
        why: "Who may publish and what routes where lives in IAM statements and SNS filter policies — routing logic a broker would hold is now spread across security config.",
      },
    ],
    tags: ["managed", "aws", "queue", "fan-out"],
  },
  {
    id: "nats",
    aka: ["JetStream (persistence layer)"],
    name: "NATS",
    category: "messaging",
    tagline: "Messaging at the speed of a function call — a single small binary that does pub/sub first and persistence on request.",
    description:
      "A lightweight, cloud-native messaging system: core NATS is blazing-fast fire-and-forget pub/sub and request/reply from one small Go binary; JetStream layers on persistence, streams, and consumer acknowledgements when you need durability. It occupies the 'simple, fast, operable by mortals' corner of the category and is beloved in Kubernetes-native circles. The trade is ecosystem depth: next to Kafka's or RabbitMQ's worlds of tooling, connectors, and hiring, NATS is a small town.",
    scores: {
      performance: 10,
      devVelocity: 7,
      learningEase: 7,
      ecosystem: 4,
      scalability: 8,
      typeSafety: 3,
      opsSimplicity: 7,
      maturity: 6,
    },
    scoreNotes: {
      performance:
        "Core NATS is the fastest thing in the category by a wide margin — millions of messages/sec from one process. JetStream persistence narrows the gap but stays quick.",
      ecosystem:
        "Solid client libraries, thin everything else: few connectors, less tooling, a much smaller pool of engineers who've run it in production.",
      maturity:
        "Core NATS is old and stable; JetStream (which is how most teams would use it seriously) is years younger — and it replaced a previous persistence attempt (STAN).",
    },
    strengths: [
      "Astonishing throughput and sub-millisecond latencies with almost no tuning",
      "One small static binary: dev, CI, edge devices, and production all run the same thing trivially",
      "Request/reply is a first-class primitive — service-to-service RPC over messaging without extra machinery",
      "JetStream adds streams, replay, and acks when needed — you opt into durability per subject instead of paying for it everywhere",
      "Built-in multi-tenancy and decentralized auth model designed for cloud-native topologies",
    ],
    weaknesses: [
      "Core NATS is fire-and-forget: no subscriber, no delivery — durability requires deliberately opting into JetStream",
      "Small ecosystem: few off-the-shelf connectors, integrations, and war stories compared to the incumbents",
      "JetStream's persistence and clustering are far younger than Kafka's or RabbitMQ's — fewer miles on the odometer",
      "Hiring someone who has operated NATS in production is a genuine search",
    ],
    chooseWhen: [
      "Service-to-service messaging inside a Kubernetes or edge estate where footprint and speed dominate",
      "You want one system to cover ephemeral pub/sub, request/reply, AND modest persistent streaming",
      "Resource-constrained or self-contained deployments (on-prem appliances, edge sites) where Kafka's footprint is absurd",
    ],
    avoidWhen: [
      "You need the connector/integration ecosystem — Kafka Connect-style off-the-shelf pipelines don't exist here",
      "The organization optimizes for hireability and community answers over technical elegance",
      "Massive retained event history is the core requirement — JetStream persists, but Kafka-scale retention is not its home turf",
    ],
    alternatives: [
      {
        techId: "kafka",
        note: "When retained history at scale and the connector ecosystem matter more than footprint and latency.",
        effort: "moderate",
      },
      {
        techId: "rabbitmq",
        note: "When you want mature broker-side routing and a decades-deep operational playbook over raw speed.",
        effort: "moderate",
      },
      {
        techId: "redis-streams",
        note: "A similar 'lightweight streaming' niche — choose Redis Streams if Redis is already in your stack, NATS if you're starting fresh.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "kubernetes", note: "A tiny stateless-ish binary with native clustering — the messaging layer K8s-native teams reach for." },
      { techId: "go-http", note: "Culturally and technically aligned: small, fast, static-binary Go services talking over NATS." },
      { techId: "microservices", note: "Built-in request/reply plus pub/sub covers both sync and async inter-service patterns with one lightweight system." },
    ],
    commitments: [
      {
        need: "You now own the durability decision per subject, and its review",
        why: "Core NATS drops messages with no subscriber by design; every new message flow needs an explicit 'ephemeral or JetStream?' call, and the wrong default is silent loss.",
      },
      {
        need: "You now grow your own operators instead of hiring them",
        why: "Engineers who have run NATS in production are a genuine search — expertise is built in-house, and the bus factor on 'who understands JetStream clustering' starts at one.",
      },
      {
        need: "You now hand-build the integrations Kafka shops download",
        why: "There is no Connect-style connector catalog — every pipeline into a warehouse, search index, or third-party system is custom code your team writes and maintains.",
      },
    ],
    tags: ["lightweight", "cloud-native", "pub-sub"],
  },
  {
    id: "redis-streams",
    name: "Redis Streams",
    category: "messaging",
    tagline: "The 'you already have Redis' answer — a real stream with consumer groups, minus a dedicated broker's guarantees.",
    description:
      "An append-only log data type inside Redis, with consumer groups, pending-entry tracking, and acknowledgements — a surprisingly complete streaming feature set living in the cache you already run. Its entire value proposition is pragmatism: no new infrastructure, no new operational skillset, messaging for the price of a data structure. The caveat is that Redis is memory-first: durability depends on your persistence configuration, and by default a crash can lose acknowledged writes a dedicated broker would have kept.",
    scores: {
      performance: 8,
      devVelocity: 8,
      learningEase: 6,
      ecosystem: 5,
      scalability: 5,
      typeSafety: 2,
      opsSimplicity: 6,
      maturity: 6,
    },
    scoreNotes: {
      opsSimplicity:
        "If Redis is already in your stack this is a 9 — zero new infrastructure. The '6' prices in hardening Redis persistence (AOF, replication) for a messaging role it wasn't configured for.",
      devVelocity:
        "XADD/XREADGROUP and you're streaming — no new deployment, client library, or vocabulary for a team that knows Redis.",
      scalability:
        "Bounded by a single node's memory and throughput per stream; sharding streams across a cluster is manual design work, not a built-in like Kafka partitions.",
      learningEase:
        "The commands are simple; the honest curve is pending-entries management, claiming stalled messages, and understanding what your persistence config actually guarantees.",
    },
    strengths: [
      "Zero new infrastructure if Redis is already deployed — messaging as a feature flag, not a platform decision",
      "Real consumer groups with acks and pending-entry lists — genuine work-distribution semantics, not just pub/sub",
      "Excellent latency and solid throughput for small-to-mid workloads — it's Redis",
      "The stream is readable history (up to trimming), so late consumers can catch up — a mini-log, not just a queue",
      "Same client library and operational knowledge your team already has",
    ],
    weaknesses: [
      "Durability is a configuration gamble: default persistence can lose acknowledged messages on crash — fsync-always AOF closes the gap and costs throughput",
      "Memory-bound retention: history lives in RAM, so aggressive trimming is mandatory and 'replay from last month' is off the table",
      "No broker-side routing, dedup, scheduled delivery, or DLQs — the enterprise checklist is DIY",
      "Sharing the instance with cache traffic couples your messaging to your cache's failure and eviction behavior",
    ],
    chooseWhen: [
      "Redis is already in the stack and you need modest, low-latency streaming or background-job distribution without new infrastructure",
      "Prototypes and early-stage systems where operational simplicity outweighs delivery guarantees",
      "Short-retention event feeds (activity streams, notifications, metrics buffering) where losing the tail in a disaster is survivable",
    ],
    avoidWhen: [
      "Losing messages is unacceptable — a dedicated broker's durability story exists for a reason",
      "You need long retention or large-scale replay — RAM-resident history doesn't stretch that far",
      "Message volume or retention will grow past one node — you'll re-platform under pressure instead of by choice",
    ],
    alternatives: [
      {
        techId: "kafka",
        note: "The graduation path when retention, replay, and durability requirements outgrow a memory-first store.",
        effort: "moderate",
      },
      {
        techId: "rabbitmq",
        note: "When you need real broker features — routing, DLQs, delivery guarantees — more than you need to avoid a new deployment.",
        effort: "moderate",
      },
      {
        techId: "sqs-sns",
        note: "If the goal is 'reliable queue with no ops', a managed queue beats hardening Redis for durability.",
        effort: "moderate",
      },
      {
        techId: "nats",
        note: "The other lightweight option — choose NATS when you're not already running Redis and want messaging-first design.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "redis", note: "It IS Redis — cache, locks, rate limiting, and light streaming from one deployment is the whole pitch." },
      { techId: "monolith", note: "A monolith with background jobs rarely needs more broker than this — work distribution without a second system." },
    ],
    notInterchangeableWith: [
      {
        techId: "kafka",
        note: "Both are append-only logs with consumer groups, which tempts the comparison. But Kafka is a durable distributed commit log built for retention and replay at scale; Redis Streams is a data structure in a memory-first cache. Same shape, different guarantees — the difference shows up in your worst week, not your demo.",
      },
    ],
    commitments: [
      {
        need: "You now treat Redis persistence config as a durability contract",
        why: "AOF fsync policy decides whether acknowledged messages survive a crash — the default loses them, and nobody re-reads that config file until the post-mortem.",
      },
      {
        need: "You now own stream trimming policy on every stream",
        why: "History lives in RAM; an untrimmed stream quietly eats the memory of the cache it shares — your messaging bug becomes everyone's eviction storm.",
      },
      {
        need: "You now hand-roll stalled-consumer recovery and poison handling",
        why: "Pending-entry lists give you the raw data, but claiming stuck messages, capping retries, and parking poison entries is application code with no broker to fall back on.",
      },
    ],
    tags: ["pragmatic", "streams", "low-ops"],
  },
];
