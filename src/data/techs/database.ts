import type { Tech } from "../types";

/**
 * Databases. The most consequential slot in the stack: data outlives code,
 * and a database migration is measured in quarters, not sprints. Every other
 * layer can be swapped with a refactor; this one is the choice you'll still
 * be living with when the frontend has been rewritten twice. Scores are
 * relative within this category — Postgres deliberately sets the balanced
 * baseline everything else is argued against.
 */
export const DATABASE_TECHS: Tech[] = [
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "database",
    tagline: "The default that must be argued out of — relational rigor that keeps eating its neighbors' niches.",
    description:
      "The open-source relational database that quietly became the industry consensus: strict SQL, real transactions, and an extension model that keeps absorbing adjacent categories — JSONB for documents, full-text search, PostGIS for geo, pgvector for embeddings. 'Just use Postgres' is modern shorthand for a real insight: since data outlives code, the safest bet is the store with the fewest assumptions about what you'll need it to do in five years. Deviating is fine — but the burden of proof sits on the alternative.",
    scores: {
      performance: 8,
      devVelocity: 8,
      learningEase: 6,
      ecosystem: 10,
      scalability: 7,
      typeSafety: 9,
      opsSimplicity: 6,
      maturity: 10,
    },
    scoreNotes: {
      ecosystem:
        "Every ORM, every cloud, every hosting tier, every tutorial — the category maximum, and the hiring pool to match.",
      scalability:
        "Vertical scaling and read replicas carry it much further than people assume; the '7' is that write sharding is your project, not a checkbox like the planet-scale NoSQL stores.",
      typeSafety:
        "Strict schema, real constraints, rich types, transactional DDL — the toolchain catches your mistakes before your users do.",
      opsSimplicity:
        "Trivial to start, and managed offerings are everywhere — but vacuum tuning, connection limits, and upgrade planning are real once you're serious.",
    },
    strengths: [
      "Balanced excellence: no single axis where it's the best, no axis where choosing it is a mistake",
      "JSONB with indexing covers most 'we need a document store' requirements inside a relational database",
      "Constraints, foreign keys, and transactions push data integrity into the database — the layer that outlives every application rewrite",
      "Extension ecosystem (PostGIS, pgvector, full-text) keeps deferring the day you need a second database",
      "Runs identically from a laptop to a multi-TB managed cluster — no capability cliff as you grow",
    ],
    weaknesses: [
      "Write scaling beyond one primary means Citus, partitioning, or app-level sharding — real engineering, not configuration",
      "Connection-per-client model is expensive; serious deployments grow a pooler (PgBouncer, RDS Proxy) whether they planned to or not",
      "Operational depth (vacuum, bloat, major-version upgrades) surfaces exactly when the database has become too important to fumble",
      "No first-party global multi-region write story — that's the honest case for the planet-scale stores",
    ],
    chooseWhen: [
      "You're starting almost anything — it's this category's monolith: the default that must be argued out of",
      "The data is relational or you don't yet know what it is (which is the same situation)",
      "You want one database that can absorb the document, search, and geo requirements you haven't met yet",
    ],
    avoidWhen: [
      "Write throughput or global distribution genuinely exceeds a single-primary design — proven with numbers, not vibes",
      "The workload is a pure known-key lookup at massive scale where DynamoDB's model is simply a better fit",
    ],
    alternatives: [
      { techId: "mysql", note: "When the team, tooling, or hosting environment is already MySQL-shaped — the gap has narrowed to features, not viability." },
      { techId: "mssql", note: "In a Microsoft shop where the licensing is already paid and the DBAs already exist, fighting the grain costs more than the license." },
      { techId: "sqlite", note: "Single-server or embedded apps: if one machine can hold the workload, skip the database server entirely." },
      { techId: "mongodb", note: "When documents genuinely are the domain model and JSONB-in-a-relational-shell feels like fighting the tool." },
      { techId: "dynamodb", note: "When access patterns are known, stable, and enormous — trade query flexibility for guaranteed latency at any scale." },
    ],
    pairsWellWith: [
      { techId: "monolith", note: "One app, one relational database with real transactions — the pairing that built most successful software." },
      { techId: "redis", note: "The canonical division of labor: Postgres as the source of truth, Redis absorbing the hot read paths." },
      { techId: "prisma", note: "The default full-stack TypeScript data path — Postgres is every modern ORM's first-class target." },
    ],
    frictionWith: [
      { techId: "serverless-functions", note: "Thousands of short-lived function instances vs a connection-per-client database: without a pooler in between, functions exhaust connections at the first traffic spike." },
    ],
    notInterchangeableWith: [
      {
        techId: "mongodb",
        note: "The catalog's most common false equivalence. Postgres enforces structure and integrity in the database; MongoDB moves both into application code. Teams pick MongoDB 'to move fast', then spend years rebuilding constraints by hand — the flexibility is a loan, not a gift.",
      },
    ],
    tags: ["default-choice", "relational", "open-source"],
  },
  {
    id: "mssql",
    name: "SQL Server",
    category: "database",
    tagline: "Enterprise-grade engine, enterprise-grade invoice — licensing is an architectural force, not a line item.",
    description:
      "Microsoft's flagship relational database: a top-tier engine wrapped in the best operational tooling in the category (SSMS, Query Store, first-class profiling) and woven deeply into the .NET and Azure world. Its defining architectural property isn't technical — it's that per-core licensing shapes decisions everywhere else: scaling out means buying cores, read replicas cost real money, and 'just spin up another instance' becomes a procurement conversation. In shops that have already paid that toll, it's excellent; outside them, Postgres does 95% of it for $0.",
    scores: {
      performance: 8,
      devVelocity: 7,
      learningEase: 6,
      ecosystem: 7,
      scalability: 7,
      typeSafety: 9,
      opsSimplicity: 5,
      maturity: 10,
    },
    scoreNotes: {
      ecosystem:
        "Deep but bounded: unmatched inside the Microsoft world, thin outside it — most OSS tooling targets Postgres/MySQL first.",
      opsSimplicity:
        "The tooling is the best in the category; the '5' is everything around it — licensing audits, edition feature-gating, and Windows-era operational weight (much improved on Linux/containers, not gone).",
      scalability:
        "The engine scales fine; the license scales with it. Architectures bend around that: fewer, bigger boxes, and read offloading you'd do freely on Postgres becomes a cost decision.",
    },
    strengths: [
      "SSMS and Query Store: the best day-two DBA experience in the category — diagnosing a bad plan regression is a first-class workflow, not archaeology",
      "Deep .NET integration: EF Core, SqlClient, and Azure SQL are a paved road with a decade of enterprise wear",
      "Columnstore indexes, in-database analytics, and mature HA (Availability Groups) in one engine",
      "Azure SQL is one of the most polished managed database services anywhere — the cloud story is genuinely strong",
    ],
    weaknesses: [
      "Per-core licensing distorts architecture: scaling, replicas, and dev/test environments all have a price tag attached",
      "Edition feature-gating means the feature you read about may live one SKU above your budget",
      "Community gravity is elsewhere: new OSS data tooling ships Postgres-first, SQL Server support later or never",
      "Hosting outside Azure/Windows-friendly environments means swimming upstream",
    ],
    chooseWhen: [
      "A .NET/Azure shop where licenses, DBAs, and operational muscle memory already exist — the paved road is real",
      "You need serious operational tooling (plan forcing, Query Store) and someone else is paying for it",
      "Regulated enterprise environments where vendor support contracts are a requirement, not a preference",
    ],
    avoidWhen: [
      "A startup or cost-sensitive product — the license alone can exceed the rest of the infrastructure bill",
      "You're not on Azure and not a Microsoft shop: you'd be paying the toll without getting the road",
    ],
    alternatives: [
      { techId: "postgres", note: "The default escape route — most SQL Server workloads port cleanly, and the license line goes to zero. The migration cost is T-SQL surface area (procs, SSIS, Query Store habits), not the data model." },
      { techId: "mysql", note: "Rarely the migration target from SQL Server — if you're leaving, Postgres matches the feature depth far better." },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "The classic Microsoft stack — tooling, drivers, and documentation all assume this pairing." },
      { techId: "ef-core", note: "EF Core's most battle-tested provider; migrations and LINQ translation are smoothest here." },
      { techId: "azure-service-bus", note: "The all-Azure enterprise triangle: one cloud, one support contract, one identity model." },
    ],
    tags: ["enterprise", "relational", "microsoft"],
  },
  {
    id: "mysql",
    name: "MySQL / MariaDB",
    category: "database",
    tagline: "The web-era workhorse — running more of the internet than anything else, while the mindshare moved next door.",
    description:
      "The database that powered the LAMP era and still runs an enormous share of the web — WordPress, most shared hosting, and some of the largest properties on the internet (via forks and Vitess). Replication has been battle-hardened for two decades, and 'find a host that runs MySQL' has never been a sentence anyone needed to say. The modern tension: Postgres has pulled ahead on features (richer types, transactional DDL, extensions), so MySQL's case today is deployed-base gravity, replication maturity, and team familiarity rather than capability.",
    scores: {
      performance: 7,
      devVelocity: 7,
      learningEase: 7,
      ecosystem: 9,
      scalability: 7,
      typeSafety: 7,
      opsSimplicity: 7,
      maturity: 10,
    },
    scoreNotes: {
      typeSafety:
        "A real schema with real constraints, but a history of permissive defaults (silent truncation, loose SQL modes) that strict configuration fixes and legacy deployments often don't.",
      ecosystem:
        "The deployed base is arguably larger than Postgres's; the '9' vs Postgres's 10 is where the momentum is — new tools and tutorials ship Postgres-first now.",
      scalability:
        "Replication maturity is its quiet superpower — read scaling and failover patterns are ancient, boring, and documented. Vitess exists as the proven (if heavyweight) sharding path.",
    },
    strengths: [
      "Replication that has been boring for twenty years — read replicas and failover are solved, documented problems",
      "Ubiquity: every host, every PaaS, every ops engineer, every CMS speaks MySQL",
      "Enormous body of operational war stories — whatever breaks, someone has blogged the fix",
      "MariaDB keeps a fully open-source fork alive as a hedge against Oracle stewardship",
    ],
    weaknesses: [
      "Feature-behind Postgres: weaker JSON story, no transactional DDL, thinner type system, no extension ecosystem",
      "Historically permissive defaults mean data-quality surprises in inherited databases",
      "The Oracle-ownership / MariaDB split fragments the community and the version story",
      "Choosing it for a new greenfield project increasingly needs a reason beyond 'it's fine' — because Postgres is also fine, plus more",
    ],
    chooseWhen: [
      "The team, tooling, or platform is already MySQL-shaped — familiarity is worth more than a feature delta",
      "Read-heavy web workloads where its replication maturity is the exact strength you need",
      "You're deploying into an ecosystem that assumes it (WordPress and the wider PHP world, classic shared hosting)",
    ],
    avoidWhen: [
      "Greenfield with no MySQL gravity — Postgres is the same effort with a longer feature runway",
      "You'll want the Postgres extension ecosystem (geo, vectors, full-text) — bolting those on later is a migration, and data outlives code",
    ],
    alternatives: [
      { techId: "postgres", note: "The default greenfield answer; switch when you have no MySQL legacy pulling you back — feature depth and momentum both point this way." },
      { techId: "sqlite", note: "For the small end of MySQL's classic territory (single-server sites), SQLite removes the database server entirely." },
    ],
    pairsWellWith: [
      { techId: "monolith", note: "The classic boring web stack: one app server, one MySQL, decades of collective experience running exactly this." },
      { techId: "vms", note: "The LAMP-era pairing still quietly powering a huge share of the web — well-understood, cheap, unglamorous." },
    ],
    tags: ["relational", "web-classic", "open-source"],
  },
  {
    id: "sqlite",
    name: "SQLite",
    category: "database",
    tagline: "Not a toy — the most deployed database on earth is a file, and that's a feature.",
    description:
      "A full SQL engine that runs inside your process and stores everything in one file: no server, no port, no connection string, no ops. It's in every phone, browser, and car — the most deployed database in existence — and it's a serious choice for single-server web apps, edge/embedded workloads, and tests, not just a dev-time stand-in. Its ceiling is equally real and arrives abruptly: one writer at a time, and no network access means the moment a second machine needs the data, you're migrating.",
    scores: {
      performance: 8,
      devVelocity: 9,
      learningEase: 9,
      ecosystem: 7,
      scalability: 2,
      typeSafety: 4,
      opsSimplicity: 10,
      maturity: 10,
    },
    scoreNotes: {
      opsSimplicity:
        "The category maximum, unchallenged: there is no server. Backup is copying a file; deployment is shipping a file.",
      scalability:
        "The '2' is architectural, not a performance slur: single-writer and in-process-only. One well-provisioned server goes surprisingly far (WAL mode handles many readers) — but the ceiling is a wall, not a slope.",
      performance:
        "No network hop means reads are microseconds — for single-machine workloads it outruns client-server databases that spend their budget on the wire.",
      typeSafety:
        "Flexible typing by default — it will happily store a string in your INTEGER column. STRICT tables (2021) fix this, but the ecosystem's default posture is permissive.",
    },
    strengths: [
      "Zero operations: no server to provision, patch, monitor, or wake up for — the entire ops burden is 'don't lose the file'",
      "In-process reads with no network hop — a class of latency client-server databases can't touch",
      "The most battle-tested storage code on the planet, with famously rigorous testing and a decades-long compatibility promise",
      "Makes tests and local dev trivially fast and hermetic — every test run gets a pristine database for free",
      "Modern renaissance: WAL mode, Litestream-style replication, and edge platforms have expanded 'serious SQLite' territory considerably",
    ],
    weaknesses: [
      "Single writer: concurrent write-heavy workloads serialize, full stop",
      "No network access: the second app server, the reporting tool, the admin dashboard on another box — each one forces the migration conversation",
      "Flexible typing means the database won't defend your schema unless you opt into STRICT tables",
      "Fewer guardrails for the 'we outgrew it mid-flight' moment — the migration to Postgres lands exactly when you're busiest",
    ],
    chooseWhen: [
      "Single-server applications whose traffic one machine can hold — a large share of real business apps, honestly",
      "Embedded, edge, desktop, and mobile — anywhere shipping a database server is absurd",
      "Tests and local development, even when production runs something bigger (mind the dialect gaps)",
    ],
    avoidWhen: [
      "Multiple app instances need the same data — SQLite has no answer, and workarounds recreate a worse database server",
      "Write concurrency is the workload (high-volume ingest, many simultaneous writers)",
      "You already know you'll scale horizontally soon — starting on SQLite schedules a migration, and data outlives code",
    ],
    alternatives: [
      { techId: "postgres", note: "The graduation path: the moment you need a second writer or a second machine. Migrating schema is easy; migrating live data under traffic is the part people underestimate." },
      { techId: "mysql", note: "Same graduation logic if your world is MySQL-shaped — but Postgres is the more common landing zone." },
    ],
    pairsWellWith: [
      { techId: "monolith", note: "One process, one file: the lowest-total-complexity stack that is still a real production system." },
      { techId: "go-http", note: "The 'single static binary plus a database file' deployment — an entire production service you can scp to a server." },
      { techId: "in-process-cache", note: "The zero-infrastructure stack: both live inside your process, and neither appears on an ops dashboard." },
    ],
    frictionWith: [
      { techId: "kubernetes", note: "A database that is a file on local disk fights everything K8s assumes: ephemeral pods, multiple replicas, remote volumes. If you're on K8s, you're already past SQLite's design point." },
      { techId: "serverless-functions", note: "Ephemeral function filesystems and a local database file are architecturally incompatible — each invocation would start amnesiac." },
    ],
    notInterchangeableWith: [
      {
        techId: "postgres",
        note: "Both speak SQL, so people treat SQLite as 'small Postgres'. It isn't — it's a library, not a server. The dividing question is 'will more than one machine ever touch this data?', and the answer decides the category, not the size.",
      },
    ],
    tags: ["embedded", "zero-ops", "single-server"],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "database",
    tagline: "Store your objects as they are — and discover that 'schemaless' means the schema moved into your code.",
    description:
      "The dominant document database: JSON-like documents, no up-front schema, and a query API that feels native from JavaScript. When documents genuinely match the domain — nested, self-contained aggregates like a product listing or an EDI message envelope — it's a pleasure. The trap is choosing it to skip schema design: the schema doesn't disappear, it moves into application code, unversioned and unenforced, where every reader must handle every historical shape forever. Transactions and joins ($lookup) exist now, but a workload leaning on them is a relational workload in denial.",
    scores: {
      performance: 6,
      devVelocity: 8,
      learningEase: 7,
      ecosystem: 8,
      scalability: 8,
      typeSafety: 3,
      opsSimplicity: 5,
      maturity: 8,
    },
    scoreNotes: {
      devVelocity:
        "Genuinely fast early — insert an object, iterate, no migrations. The bill arrives later as document-shape drift and hand-rolled integrity checks.",
      typeSafety:
        "Schema validators exist but are opt-in and rarely opted into; the database happily accepts any shape, so the toolchain catches almost nothing before runtime.",
      opsSimplicity:
        "Replica sets are mandatory homework for production; Atlas (the managed service) raises this to a 7 and is how most teams actually run it.",
      maturity:
        "Long past its early durability scandals — a legitimately mature system now, but the reputation debt lingered for a reason.",
    },
    strengths: [
      "Documents that match domain aggregates eliminate object-relational impedance — read one document, get the whole thing",
      "Schema flexibility is real power when shapes genuinely vary (product catalogs, CMS content, heterogeneous partner payloads)",
      "Built-in sharding and replica sets: horizontal scaling is a designed-in path, not an afterthought",
      "Atlas is a polished managed experience across all three clouds",
      "Huge ecosystem and hiring pool — the default NoSQL choice by mindshare",
    ],
    weaknesses: [
      "The 'schemaless means no schema decisions' trap: integrity, relationships, and shape-versioning become application code, forever",
      "Cross-document consistency is your job — multi-document transactions exist but cost the performance you came for",
      "Joins ($lookup) work but are a smell: heavily relational access patterns fight the document model",
      "A denormalized document design optimized for one access pattern quietly hardcodes it — reshaping millions of documents later is a migration project, and data outlives code",
    ],
    chooseWhen: [
      "The domain is genuinely document-shaped: self-contained aggregates read and written as units",
      "Document shapes vary by nature (multi-tenant configs, partner-specific payloads) and a rigid schema would be a lie",
      "Node/TypeScript teams whose objects map directly to documents and whose access patterns are aggregate-at-a-time",
    ],
    avoidWhen: [
      "The data is relational — orders, customers, invoices, anything with cross-entity integrity rules. Most business data is",
      "You're choosing it to avoid schema design — that's deferring the decision to the worst possible time",
      "Reporting and ad-hoc queries across entities are a core requirement",
    ],
    alternatives: [
      { techId: "postgres", note: "JSONB gives you documents inside a relational database — the right call when only part of the domain is document-shaped and the rest wants integrity." },
      { techId: "dynamodb", note: "If your access patterns are known and fixed and scale is the driver, Dynamo's discipline beats Mongo's flexibility." },
      { techId: "cosmosdb", note: "On Azure, Cosmos speaks the MongoDB wire protocol — same programming model, different operational and pricing regime." },
    ],
    pairsWellWith: [
      { techId: "express", note: "The MEAN-era pairing endures: JSON documents end to end with no translation layer." },
      { techId: "nestjs", note: "Mongoose integration is first-class — the typed-Node path to disciplined document modeling." },
    ],
    notInterchangeableWith: [
      {
        techId: "postgres",
        note: "The most common false equivalence in this catalog: 'we'll use Mongo, it's easier'. The question isn't ease — it's where integrity lives. Postgres enforces it in the database; Mongo delegates it to every application that will ever touch the data.",
      },
      {
        techId: "dynamodb",
        note: "Both wear the NoSQL label, but Mongo is a general document store with ad-hoc queries; Dynamo is a key-value machine that demands access patterns up front. Teams pick Dynamo expecting Mongo's flexibility and hit a wall at the first unplanned query.",
      },
    ],
    tags: ["document", "nosql", "schema-flexible"],
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "database",
    tagline: "Single-digit milliseconds at any scale — if you can name every query before you write the table.",
    description:
      "AWS's fully managed key-value store, built on the insight that if you constrain queries to key lookups, latency and scale become guarantees rather than aspirations. The discipline is the product: you design the table around your access patterns (often one table, carefully overloaded keys), and in exchange nothing degrades at a billion items. It's also the databases category's deepest lock-in — the data model, the pricing, and the operational model are all AWS-shaped. The failure mode is treating it like a general database and discovering that the query you didn't plan for requires a full table scan or a redesign.",
    scores: {
      performance: 9,
      devVelocity: 5,
      learningEase: 3,
      ecosystem: 6,
      scalability: 10,
      typeSafety: 3,
      opsSimplicity: 9,
      maturity: 8,
    },
    scoreNotes: {
      learningEase:
        "The API is small; the '3' is the modeling discipline — single-table design with overloaded keys is a genuinely different skill that experienced SQL developers must unlearn into.",
      opsSimplicity:
        "No servers, no capacity planning (on-demand mode), no maintenance windows — among the least operable-by-you databases in existence, in the best sense.",
      scalability:
        "The honest 10: the same table, the same latency, from a prototype to Amazon-retail scale. This is the axis the entire design sacrifices everything else for.",
      devVelocity:
        "Every new feature starts with 'is this access pattern in the table design?' — when yes, fast; when no, a schema-redesign conversation SQL never makes you have.",
    },
    strengths: [
      "Guaranteed single-digit-millisecond reads and writes regardless of table size — a promise, not a benchmark",
      "Zero operational surface: no instances, no patching, no connection pools, pay-per-request if you want",
      "Pairs perfectly with serverless: per-request pricing and no connections match the function model exactly",
      "DynamoDB Streams turn every write into an event feed — change-data-capture built in",
      "Access-pattern-first design, when done honestly, produces systems that never develop the slow-query drawer",
    ],
    weaknesses: [
      "You must know your queries up front — the un-designed-for access pattern is a redesign, and data outlives code",
      "Ad-hoc queries, aggregations, and analytics are not what it does; you'll export to something else for those",
      "Deep AWS lock-in: the data model itself, not just the hosting, is proprietary",
      "Costs are excellent at low and spiky volume, but hot-partition mistakes and heavy sustained throughput produce surprising bills",
    ],
    chooseWhen: [
      "Access patterns are known, few, and stable — session stores, user profiles, carts, device state, event ingestion by key",
      "You're all-in on AWS serverless and want the database that shares its scaling and pricing model",
      "Scale requirements are real and enormous, and you'd rather constrain queries than operate a distributed database",
    ],
    avoidWhen: [
      "The product is young and access patterns are still being discovered — you'd be pouring concrete before the blueprint exists",
      "Reporting, search, or ad-hoc queries are first-class requirements",
      "Multi-cloud portability matters — this is the least portable data model in the category",
    ],
    alternatives: [
      { techId: "postgres", note: "When access patterns are unknown or evolving, a relational schema is reversible in a way a single-table design is not — flexibility now, scale engineering later." },
      { techId: "cosmosdb", note: "The Azure counterpart: comparable global-scale guarantees with a multi-model API surface instead of pure key-value." },
      { techId: "cassandra", note: "The self-hosted relative: similar query-first modeling without vendor lock-in — paid for with a serious operations team." },
      { techId: "mongodb", note: "When you want document flexibility and ad-hoc queries more than guaranteed-latency key access." },
    ],
    pairsWellWith: [
      { techId: "serverless-functions", note: "The canonical pairing: no connection pools to exhaust, per-request pricing on both sides, IAM auth end to end." },
      { techId: "serverless-arch", note: "The database the serverless architecture assumes — the two decisions are usually made together." },
      { techId: "sqs-sns", note: "Streams-to-queue pipelines make Dynamo writes the trigger for everything downstream, all managed, all AWS." },
    ],
    notInterchangeableWith: [
      {
        techId: "mongodb",
        note: "'Both NoSQL' hides opposite philosophies: Mongo says 'store documents, query however you like'; Dynamo says 'declare your queries, and I'll make them infinitely fast'. Swapping one for the other fails in whichever direction you attempt it.",
      },
    ],
    tags: ["key-value", "serverless-native", "aws"],
  },
  {
    id: "cosmosdb",
    name: "Cosmos DB",
    category: "database",
    tagline: "Globally distributed, five consistency levels, priced in a currency you'll learn the hard way.",
    description:
      "Azure's globally distributed multi-model database: one service exposing document (its native API, plus MongoDB wire compatibility), Cassandra, Gremlin, and table APIs, with turnkey replication to any region and comfortably the most honest consistency story in the industry — five explicit levels from strong to eventual, each with a documented latency/availability price. That spectrum is worth studying even if you never use the product: it's the CAP theorem as a dropdown menu. The recurring surprise is Request Units — an abstract throughput currency you provision or pay per operation, where an innocent cross-partition query can cost 100x a point read.",
    scores: {
      performance: 8,
      devVelocity: 5,
      learningEase: 3,
      ecosystem: 5,
      scalability: 10,
      typeSafety: 3,
      opsSimplicity: 7,
      maturity: 7,
    },
    scoreNotes: {
      learningEase:
        "The API is approachable; the '3' is partitioning strategy, RU budgeting, and choosing among five consistency levels — decisions SQL never asked of you, each with a bill attached.",
      opsSimplicity:
        "Fully managed with SLAs on latency, availability, and consistency — but RU capacity management is a new operational discipline that replaces the old ones.",
      ecosystem:
        "Azure-deep, world-thin: excellent .NET SDKs and Azure integration, limited community gravity beyond — the Mongo-compatibility API exists partly to borrow an ecosystem.",
    },
    strengths: [
      "Turnkey global distribution: replicating to a new region is configuration, not a project",
      "Five explicit consistency levels — the industry's clearest articulation that consistency is a spectrum you choose on, not a checkbox",
      "Comprehensive SLAs covering latency and consistency, not just uptime — rare in this category",
      "Multi-model APIs (including MongoDB compatibility) ease migrations into it",
      "Serverless and autoscale tiers fit spiky Azure-native workloads well",
    ],
    weaknesses: [
      "RU pricing is a recurring ambush: cross-partition queries, large documents, and default indexing of everything all burn budget invisibly until the invoice",
      "Partition-key choice is nearly irreversible and made on day one, when you know the least — and data outlives code",
      "Azure lock-in as deep as Dynamo's AWS lock-in, with a smaller community around it",
      "Multi-model breadth means some APIs are clearly second-class citizens versus the native document API",
    ],
    chooseWhen: [
      "Azure-committed and genuinely multi-region: globally distributed reads/writes with SLAs is the headline feature, so need the headline",
      "You want Dynamo-class scale but your cloud is Azure",
      "Tunable consistency is a real requirement — a global system where different operations legitimately need different guarantees",
    ],
    avoidWhen: [
      "A single-region CRUD app — Azure SQL or Postgres delivers more, simpler, cheaper",
      "The team can't yet model partition keys and access patterns confidently — RU costs punish improvisation",
      "Any future off Azure is plausible",
    ],
    alternatives: [
      { techId: "dynamodb", note: "The AWS counterpart — purer key-value, simpler pricing to reason about, equally locked in. Cloud choice usually decides this pairing, not features." },
      { techId: "mongodb", note: "Atlas offers multi-region documents with cloud portability — less turnkey than Cosmos, but not married to Azure." },
      { techId: "postgres", note: "For most Azure apps that reached for Cosmos by default: a managed Postgres is simpler, cheaper, and more capable until global distribution is a proven requirement." },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "First-party .NET SDKs and the shared Azure identity/deployment story make this the low-friction pairing." },
      { techId: "serverless-functions", note: "Azure Functions' Cosmos bindings and the change feed make an event-driven serverless stack with almost no glue code." },
      { techId: "azure-service-bus", note: "The all-Azure event pipeline: change feed to bus to consumers, one cloud, one bill." },
    ],
    tags: ["multi-model", "global-distribution", "azure"],
  },
  {
    id: "cassandra",
    name: "Cassandra",
    category: "database",
    tagline: "Linear write scale across datacenters — bring your own operations team and know your queries cold.",
    description:
      "The wide-column heavyweight for massive write-intensive workloads: a masterless ring where every node accepts writes, scale is added by adding nodes, and multi-datacenter replication is a native concept rather than a bolt-on. Netflix, Apple, and Discord-scale ingest workloads live here. The costs are symmetrical and non-negotiable: query-first modeling (tables are designed per query, denormalized, no joins), eventual consistency as the default posture, and an operational burden — compaction, repair, JVM tuning, capacity planning — that assumes dedicated people. This is the category's 'you must be this tall' entry.",
    scores: {
      performance: 8,
      devVelocity: 3,
      learningEase: 2,
      ecosystem: 5,
      scalability: 10,
      typeSafety: 5,
      opsSimplicity: 2,
      maturity: 8,
    },
    scoreNotes: {
      performance:
        "Writes are the specialty — append-oriented storage makes sustained ingest its home turf. Read performance is good only for the queries you designed tables for; anything else ranges from slow to impossible.",
      devVelocity:
        "Every new query pattern means a new denormalized table and a backfill — the '3' is CQL looking like SQL while refusing to behave like it.",
      opsSimplicity:
        "Compaction strategies, anti-entropy repair, tombstone management, JVM GC tuning: among the most operationally demanding systems in the whole catalog. Managed offerings (Astra, Keyspaces) soften this at the price of the flexibility that justified Cassandra.",
      typeSafety:
        "CQL enforces a real schema per table — more than the document stores — but nothing stops the classic modeling errors (unbounded partitions) that only fail at scale, in production.",
    },
    strengths: [
      "Near-linear write scaling: need more throughput, add nodes — the promise, and it actually holds",
      "Masterless architecture: no failover event, no primary to lose; nodes die and the ring shrugs",
      "Multi-datacenter, multi-region replication as a first-class native feature, not an enterprise add-on",
      "Tunable consistency per query (ONE / QUORUM / ALL) — you choose the tradeoff at the statement level",
      "Proven at the scale most systems only present slides about",
    ],
    weaknesses: [
      "Query-first modeling inverts everything SQL taught: design tables from queries, denormalize freely, and a new access pattern means a new table plus a backfill — and data outlives code",
      "CQL's SQL-like syntax is a false-friend trap: no joins, no ad-hoc WHERE clauses, no aggregations worth the name",
      "Serious, permanent operational demands — running it well is somebody's actual job",
      "Eventual consistency and tombstone behavior produce bug classes (deleted data resurrecting, unbounded-partition death) that only appear at scale",
    ],
    chooseWhen: [
      "Sustained massive write volume is the defining requirement: telemetry, time-series, event ingestion, activity feeds at tens of thousands of writes per second and up",
      "Multi-datacenter active-active replication is a hard requirement, not a nice-to-have",
      "The organization can staff real database operations — or has consciously chosen a managed offering",
    ],
    avoidWhen: [
      "Anything smaller than 'we measured, and a relational database genuinely cannot ingest this' — under-scale Cassandra is pure cost with no payoff",
      "Access patterns are evolving or ad-hoc queries matter — the modeling discipline punishes exploration",
      "No one owns operations — an untended cluster degrades in slow motion until it fails all at once",
    ],
    alternatives: [
      { techId: "dynamodb", note: "The managed exit: similar query-first modeling and scale guarantees with the ops burden outsourced to AWS — trading operational sovereignty for sleep." },
      { techId: "cosmosdb", note: "Speaks the Cassandra API on Azure — a migration path that keeps CQL but drops the 3 AM repair jobs." },
      { techId: "postgres", note: "Partitioned Postgres (or Timescale-style extensions) handles far more ingest than intuition suggests — exhaust this before buying a ring." },
    ],
    pairsWellWith: [
      { techId: "kafka", note: "The classic ingest pipeline: Kafka absorbs and orders the firehose, Cassandra persists it — two systems built for the same scale philosophy." },
      { techId: "event-driven", note: "Write-heavy event architectures are its natural habitat: events in, per-query read tables out." },
    ],
    notInterchangeableWith: [
      {
        techId: "mongodb",
        note: "Filed together under NoSQL, built for different universes: Mongo is a general document store for flexible development; Cassandra is a write-throughput machine that demands your queries in advance. Choosing between them by comparing feature lists misses that the workloads barely overlap.",
      },
    ],
    tags: ["wide-column", "write-optimized", "multi-dc"],
  },
];
