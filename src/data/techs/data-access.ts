import type { Tech } from "../types";

/**
 * Data access. This is the most ecosystem-bound category in the catalog:
 * you don't choose between EF Core and Prisma — your backend language already
 * chose for you. The real decision inside each ecosystem is the same everywhere:
 * how much SQL do you want the tool to write for you, and what will that
 * abstraction cost when a query gets hot?
 */
export const DATA_ACCESS_TECHS: Tech[] = [
  {
    id: "ef-core",
    aka: ["Entity Framework", "EF"],
    name: "Entity Framework Core",
    category: "data-access",
    ecosystem: "dotnet",
    tagline: "The full-ORM bargain in .NET: LINQ and migrations now, opaque SQL when queries get hot.",
    description:
      "Microsoft's flagship ORM and the default data layer of the .NET world: change tracking, LINQ queries compiled to SQL, and first-class schema migrations. The honest framing isn't the tired 'ORMs are slow' meme — EF Core is fast enough for the vast majority of queries. The real bargain is abstraction: you ship features quickly against typed entities, and in exchange the 5% of queries that get hot require you to read generated SQL, understand change-tracker behavior, and sometimes drop to raw SQL anyway. It exists only inside .NET; choosing it and choosing ASP.NET Core are the same decision.",
    scores: {
      performance: 6,
      devVelocity: 9,
      learningEase: 6,
      ecosystem: 9,
      scalability: 8,
      typeSafety: 9,
      opsSimplicity: 7,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "Well within range for typical CRUD; the '6' is the hot-path reality — change tracking overhead, occasional bad generated SQL, and N+1s from careless navigation-property loading.",
      typeSafety:
        "LINQ queries are compile-checked against your entity model end to end — a refactored column name breaks the build, not production.",
      learningEase:
        "Easy to start, deep to master: change-tracker semantics, loading strategies, and 'why did it generate THAT query' form the real curve.",
    },
    strengths: [
      "LINQ: queries are typed C# checked at compile time, refactorable with the rest of the codebase",
      "Migrations as first-class tooling — schema evolution is versioned, diffable, and CI-runnable",
      "Change tracking makes multi-entity update logic almost declarative",
      "Deep integration with the whole .NET stack: DI, logging, ASP.NET Core, Azure tooling",
      "Escape hatches are real: FromSql, compiled queries, no-tracking reads when you need control",
    ],
    weaknesses: [
      "The abstraction leaks under load: diagnosing a slow endpoint means reading generated SQL and change-tracker behavior, not just your code",
      "N+1 and cartesian-explosion traps from navigation properties are easy to write and invisible until production data sizes",
      "Encourages entity-shaped thinking — set-based SQL operations (bulk updates, window functions) fight the model",
      "Change tracking overhead makes it a poor fit for hot read paths at scale",
    ],
    chooseWhen: [
      "You're building a .NET application with a relational database — it's the ecosystem default for good reason",
      "The domain is rich CRUD: many entities, evolving schema, business logic over object graphs",
      "Team velocity on features matters more than squeezing the last milliseconds from queries",
    ],
    avoidWhen: [
      "The workload is dominated by high-volume, hand-tunable read queries — the abstraction earns nothing there",
      "The team treats it as 'not needing to know SQL' — that's how the production incidents get written",
    ],
    alternatives: [
      { techId: "dapper", note: "The classic hybrid: EF Core for writes and complex object graphs, Dapper for the hot read paths where you want to own the SQL. Many mature .NET codebases run exactly this split.", effort: "moderate" },
      { techId: "ado-net", note: "The substrate underneath both — only worth reaching for directly in extreme bulk/streaming scenarios EF and Dapper can't express.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "Designed together: DI registration, logging, health checks, and configuration all click in one line each." },
      { techId: "mssql", note: "The all-Microsoft path — EF's SQL Server provider is its most battle-tested." },
      { techId: "postgres", note: "The Npgsql provider is excellent; EF Core + Postgres is the standard non-Microsoft-database .NET stack." },
    ],
    commitments: [
      {
        need: "You now own N+1 vigilance as a code-review discipline",
        why: "Navigation properties make the N+1 the easiest query to write — nothing flags it until production data volumes reveal it.",
      },
      {
        need: "You must keep someone who can read generated SQL and change-tracker behavior",
        why: "When an endpoint gets slow, the diagnosis runs through EF's output, not your code — that skill has to live on the team, permanently.",
      },
      {
        need: "You now own migration discipline across environments",
        why: "EF generates the migrations, but ordering, rollback plans, and production windows for big-table changes are a process you run forever.",
      },
    ],
    tags: ["orm", "full-orm", "migrations"],
  },
  {
    id: "dapper",
    name: "Dapper",
    category: "data-access",
    ecosystem: "dotnet",
    tagline: "You write the SQL, it does the mapping — the micro-ORM middle path for .NET.",
    description:
      "A micro-ORM born at Stack Overflow: you write the SQL, Dapper maps rows to objects with near-raw-ADO.NET speed and none of its boilerplate. It occupies the deliberate middle of the .NET spectrum — above raw data readers, below full ORMs — and its whole philosophy is that the SQL your database runs should be the SQL you wrote. Like everything in this category, it's an in-ecosystem choice: Dapper is a .NET library, full stop.",
    scores: {
      performance: 9,
      devVelocity: 6,
      learningEase: 8,
      ecosystem: 7,
      scalability: 8,
      typeSafety: 5,
      opsSimplicity: 8,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "Within measurement noise of raw ADO.NET — no change tracking, no query translation, just fast mapping over the SQL you wrote.",
      typeSafety:
        "Results map to typed objects, but the SQL itself is a string: a renamed column breaks at runtime, not compile time. Half the safety of LINQ, honestly acquired.",
      opsSimplicity:
        "No migrations, no model, no tooling to operate — but that means schema management is now a separate concern you must solve (SQL scripts, DbUp, etc.).",
    },
    strengths: [
      "The SQL is exactly what you wrote — performance tuning is database work, not ORM archaeology",
      "Near-zero overhead: consistently at the top of .NET data-access benchmarks",
      "Tiny API learnable in an hour: Query<T>, Execute, and you're productive",
      "Multi-mapping and stored-procedure support make it at home in legacy database estates where the SQL already exists",
    ],
    weaknesses: [
      "SQL in strings: no compile-time checking, refactoring tools can't see into queries",
      "No change tracking or unit-of-work — multi-entity write logic is all yours to orchestrate",
      "No migrations story — schema evolution needs a separate tool and discipline",
      "CRUD boilerplate accumulates: every entity's INSERT/UPDATE is hand-written or extension-library territory",
    ],
    chooseWhen: [
      "You know SQL, like SQL, and want the database layer to be transparent",
      "Hot read paths where you need to own the exact query — including as a complement to EF Core in the same codebase",
      "Working against an existing database with established stored procedures and hand-tuned queries",
    ],
    avoidWhen: [
      "A large evolving domain model where hand-writing every CRUD statement is pure toil EF would automate",
      "The team is junior in SQL — Dapper hands you the gun the ORM was keeping in the drawer",
    ],
    alternatives: [
      { techId: "ef-core", note: "When the write model grows rich (object graphs, evolving schema, migrations), the full ORM's automation starts paying for its abstraction — or run both, split by read/write.", effort: "moderate" },
      { techId: "ado-net", note: "Dropping further down buys almost nothing — Dapper is already within noise of the metal. Only raw streaming/bulk scenarios justify it.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "A minimal-API + Dapper stack is the .NET equivalent of the lean, SQL-first services popular in Go." },
      { techId: "mssql", note: "Its birthplace — Stack Overflow ran (and runs) Dapper against SQL Server at very serious scale." },
    ],
    commitments: [
      {
        need: "You now own schema migration tooling",
        why: "Dapper has no migrations story — SQL scripts, DbUp, or Flyway becomes a separate tool you choose, wire into CI, and maintain for the system's lifetime.",
      },
      {
        need: "You must keep hand-written SQL and the schema in sync by discipline",
        why: "SQL lives in strings the compiler can't see — every column rename is a grep-and-test exercise unless you build integration testing around the queries.",
      },
      {
        need: "You now own write orchestration",
        why: "No change tracking or unit-of-work means transaction boundaries and multi-entity consistency are explicit application code, feature by feature.",
      },
    ],
    tags: ["micro-orm", "sql-first", "performance"],
  },
  {
    id: "ado-net",
    aka: ["ADO.NET", "System.Data", "SqlClient"],
    name: "Raw ADO.NET",
    category: "data-access",
    ecosystem: "dotnet",
    tagline: "The substrate everything above is built on — maximal control, maximal boilerplate.",
    description:
      "The .NET platform's low-level database API: connections, commands, parameters, and data readers. Every ORM and micro-ORM in the ecosystem is built on top of it, which makes it worth understanding even though almost nobody should write application code against it directly anymore. Its niche today is the extremes: bulk operations (SqlBulkCopy), streaming enormous result sets, and squeezing out overhead that even Dapper's mapping represents.",
    scores: {
      performance: 10,
      devVelocity: 3,
      learningEase: 5,
      ecosystem: 6,
      scalability: 8,
      typeSafety: 3,
      opsSimplicity: 8,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "The floor of the stack — nothing is faster in .NET because everything else is this plus overhead. SqlBulkCopy in particular has no ORM equivalent.",
      learningEase:
        "The concepts are simple; the '5' reflects the ceremony (using blocks, parameter objects, reader index juggling) and the sharp edges (connection leaks, injection if you get lazy with parameters).",
      ecosystem:
        "Fully supported forever as the platform substrate, but no one builds new tooling AT this level — the ecosystem energy lives in the layers above.",
    },
    strengths: [
      "Zero abstraction: total control over connections, transactions, command behavior, and streaming",
      "SqlBulkCopy and streaming readers handle data volumes that choke any ORM",
      "No dependency beyond the platform itself — nothing to version, nothing to deprecate",
      "Understanding it makes you better at every layer above: EF's and Dapper's behavior stops being magic",
    ],
    weaknesses: [
      "Brutal boilerplate: connection, command, parameters, reader loop, manual mapping — per query",
      "Everything is stringly-typed: column names, SQL, parameter names all break at runtime",
      "All the classic hand-rolled-data-layer bugs are yours: connection leaks, forgotten parameters, mapping drift",
      "Choosing it wholesale in 2026 means rebuilding a worse Dapper in-house, slowly",
    ],
    chooseWhen: [
      "Bulk ingestion or export where SqlBulkCopy-class throughput is the requirement",
      "Streaming very large result sets where materializing objects is the bottleneck",
      "Building infrastructure (a library, a custom mapper) rather than an application",
    ],
    avoidWhen: [
      "Ordinary application data access — Dapper gives you 98% of the control with 20% of the code",
      "Anyone on the team is tempted to concatenate SQL strings — the substrate has no guardrails",
    ],
    alternatives: [
      { techId: "dapper", note: "The default answer to 'we need control': same SQL ownership, boilerplate handled, negligible overhead. This is where 'we'll just use ADO.NET' projects should land.", effort: "drop-in" },
      { techId: "ef-core", note: "If the reason for raw access was distrust of ORMs rather than a measured need, modern EF Core deserves a re-evaluation.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "mssql", note: "SqlBulkCopy and SQL Server-specific command features are the main reason to be at this level at all." },
    ],
    commitments: [
      {
        need: "You now own an in-house data-access layer as a codebase",
        why: "Mapping helpers, parameter builders, and connection management become library code someone maintains alongside the actual product.",
      },
      {
        need: "You must enforce parameterization by review",
        why: "The substrate has no guardrails — one lazy string-concatenated query is a SQL injection, and only humans stand in the way.",
      },
      {
        need: "You now own connection lifecycle correctness",
        why: "A missed using-block leaks connections that surface as pool exhaustion under load, far from the line of code that caused it.",
      },
    ],
    tags: ["low-level", "substrate", "bulk-operations"],
  },
  {
    id: "prisma",
    name: "Prisma",
    category: "data-access",
    ecosystem: "node",
    tagline: "Schema-first with a generated typed client — TS-land's polished default, with an engine under the hood.",
    description:
      "The most polished data layer in the TypeScript ecosystem: you declare your model in a Prisma schema file, and it generates a fully typed client, runs migrations, and ships a query engine that does the SQL generation. The developer experience — autocomplete on every relation, types that update when the schema changes — set the standard the rest of TS-land now chases. The tradeoff is the machinery: an engine layer between you and the database, its own query language rather than SQL, and escape hatches ($queryRaw) you'll eventually need. Node/TypeScript only — it's a generated TS client, meaningless anywhere else.",
    scores: {
      performance: 5,
      devVelocity: 9,
      learningEase: 8,
      ecosystem: 8,
      scalability: 7,
      typeSafety: 9,
      opsSimplicity: 6,
      maturity: 7,
    },
    scoreNotes: {
      performance:
        "The engine layer and conservative query generation (historically joining in application space) cost real overhead versus SQL-first peers; recent engine rewrites narrow the gap but the architecture is heavier by design.",
      opsSimplicity:
        "Migrations tooling is excellent, but the engine binary complicated serverless/edge cold starts for years — improved now, still a moving part peers don't have.",
      maturity:
        "Widely deployed and well-funded, but it has reworked core architecture (engine, joins strategy) recently enough to cap the score.",
    },
    strengths: [
      "Best-in-class developer experience: generated types mean autocomplete and compile errors track your schema automatically",
      "The schema file is a single readable source of truth for the data model — great for team comprehension and review",
      "Migrations are integrated, generated from schema diffs, and genuinely pleasant",
      "Prisma Studio and the surrounding tooling lower the barrier for developers who aren't database people",
    ],
    weaknesses: [
      "The engine layer adds weight: overhead per query, cold-start cost, and a black box between your code and the SQL",
      "Its query API is its own language — complex SQL (window functions, CTEs, fine-grained locking) pushes you to $queryRaw, losing the type safety that justified it",
      "Historically application-level joins produced surprising query patterns at scale — know which strategy your version uses",
      "Schema-first means the database is downstream of Prisma's modeling opinions; unusual database features fit awkwardly",
    ],
    chooseWhen: [
      "TypeScript backend where developer velocity and type safety are the priorities — it's the ecosystem's safe default",
      "The team skews application-side and benefits from the guardrails and tooling",
      "Standard relational modeling: if your schema is conventional, the polish is pure profit",
    ],
    avoidWhen: [
      "SQL-heavy workloads where you'd live in $queryRaw — a SQL-first tool keeps the types you'd be giving up",
      "Extreme cold-start-sensitive edge deployments — verify the current engine story fits your platform before committing",
    ],
    alternatives: [
      { techId: "drizzle", note: "The same-slot alternative: swap when you know SQL well and want the query language to BE SQL — lighter runtime, more control, younger ecosystem.", effort: "moderate" },
      { techId: "typeorm", note: "Only really relevant as the incumbent you're migrating from — new projects rarely have a reason to pick it over Prisma.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "nextjs", note: "The canonical full-stack TS pairing — Prisma in server components/routes is half the ecosystem's tutorials." },
      { techId: "trpc", note: "Prisma's generated types flow through tRPC procedures to the client: schema-to-UI type safety with no manual contracts." },
      { techId: "postgres", note: "Its best-supported and most-deployed target — the default pairing in TS-land." },
    ],
    commitments: [
      {
        need: "You now own the query engine as a deployment artifact",
        why: "The engine is a moving part with its own binary, cold-start profile, and platform-compatibility matrix — it ships with you everywhere, forever.",
      },
      {
        need: "You must track where the type-safety boundary ends",
        why: "Complex SQL pushes you to $queryRaw, which returns untyped rows — someone must decide how much of the codebase lives outside the guarantees you chose Prisma for.",
      },
      {
        need: "You now own knowing your version's query-generation strategy",
        why: "Join behavior has changed materially across releases — the same schema can produce different query patterns after an upgrade, and load tests are how you find out.",
      },
    ],
    tags: ["orm", "schema-first", "codegen"],
  },
  {
    id: "drizzle",
    aka: ["Drizzle ORM"],
    name: "Drizzle",
    category: "data-access",
    ecosystem: "node",
    tagline: "If you know SQL, you know Drizzle — a typed query builder that refuses to hide the database.",
    description:
      "A TypeScript query builder that mirrors SQL almost one-to-one: select, joins, CTEs, and window functions all look like the SQL they compile to, but every column and result is fully typed. It's the SQL-first counterweight to Prisma's schema-first abstraction — no engine layer, no separate query language, tiny runtime, edge-friendly. The bet is the inverse of Prisma's: you bring SQL knowledge, it brings types; the ecosystem around it is younger and thinner. Node/TypeScript only, definitionally.",
    scores: {
      performance: 8,
      devVelocity: 7,
      learningEase: 7,
      ecosystem: 5,
      scalability: 7,
      typeSafety: 9,
      opsSimplicity: 8,
      maturity: 4,
    },
    scoreNotes: {
      learningEase:
        "A '9' if you know SQL — the API is SQL with types. The '7' averages in developers who'd have to learn SQL first, which Prisma lets them defer.",
      maturity:
        "Young: APIs still evolve, the migrations tool (drizzle-kit) is newer than the query builder, and long-tail edge cases have fewer years of production sanding.",
      performance:
        "Thin translation layer over the driver, no engine process — close to hand-written SQL, and its lightness made it the early favorite for edge runtimes.",
    },
    strengths: [
      "Queries are transparent: what you write is recognizably the SQL that runs — hot-path tuning is just SQL tuning",
      "Full type inference without codegen watchers — types flow from the schema definition in plain TypeScript",
      "Tiny, dependency-light runtime with no engine binary — serverless and edge deployments stay simple",
      "Real SQL features (CTEs, window functions, precise joins) are first-class, not escape hatches",
    ],
    weaknesses: [
      "Young ecosystem: fewer integrations, examples, and Stack Overflow answers than Prisma when you hit a weird case",
      "Migrations tooling is serviceable but less polished than Prisma Migrate",
      "SQL-shaped API means SQL-shaped thinking — teams weak in SQL lose the guardrails a full ORM provides",
      "API churn risk: it's still making design changes an older tool would be locked out of",
    ],
    chooseWhen: [
      "The team is fluent in SQL and resents abstractions that hide it",
      "Serverless/edge deployment where runtime weight and cold starts matter",
      "You want Prisma-grade type safety but with SQL as the query language, not a proprietary API",
    ],
    avoidWhen: [
      "The team needs the guardrails, docs depth, and maturity of the established option — boring beats elegant on a deadline",
      "You're betting a long-lived enterprise system on it and can't absorb API evolution",
    ],
    alternatives: [
      { techId: "prisma", note: "The same-slot alternative: swap when you want maximum polish, guardrails, and ecosystem depth and will accept the engine layer and its own query language.", effort: "moderate" },
      { techId: "typeorm", note: "Practically never the switch target — Drizzle exists in part because of TypeORM's unfixable problems.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "trpc", note: "Two thin, inference-based TS tools: schema types flow through procedures to the client with no codegen anywhere." },
      { techId: "postgres", note: "Its richest dialect support — the Drizzle + Postgres combination is the SQL-first TS stack." },
      { techId: "serverless-functions", note: "No engine binary and tiny bundles make it the least-friction data layer for function and edge runtimes." },
    ],
    commitments: [
      {
        need: "You must budget for API churn",
        why: "It's young enough to still fix its design mistakes — upgrades can carry breaking changes that a mature tool stopped being allowed to make.",
      },
      {
        need: "You now own the SQL competence bar for the whole team",
        why: "The API is SQL with types — every contributor needs real SQL fluency, and hiring and onboarding must screen for it.",
      },
      {
        need: "You must fill ecosystem gaps yourself",
        why: "Fewer integrations and answered questions mean the weird edge case is a GitHub issue you file, not a Stack Overflow answer you find.",
      },
    ],
    tags: ["query-builder", "sql-first", "edge-friendly"],
  },
  {
    id: "typeorm",
    name: "TypeORM",
    category: "data-access",
    ecosystem: "node",
    tagline: "The decorator-era incumbent: a huge install base carrying a reputation it can't shake.",
    description:
      "The ORM that taught Node developers Hibernate-style patterns: entities as decorated classes, Active Record or Data Mapper flavors, repositories and relations. It accumulated an enormous install base — NestJS documentation made it a default for years — and then an equally substantial reputation for maintenance gaps, surprising query generation, and long-open correctness bugs. It still works, and vast production estates run on it; the reason default recommendations moved to Prisma and Drizzle is that both were designed with the lessons of watching it age.",
    scores: {
      performance: 5,
      devVelocity: 6,
      learningEase: 6,
      ecosystem: 7,
      scalability: 5,
      typeSafety: 6,
      opsSimplicity: 5,
      maturity: 5,
    },
    scoreNotes: {
      maturity:
        "The '5' despite its age is deliberate: maturity means dependable, and its history of maintainer churn and long-lived correctness issues (cascades, relation loading, migration edge cases) undercuts the years in production.",
      ecosystem:
        "Huge install base, endless tutorials — but the ecosystem energy has visibly moved to Prisma and Drizzle; the '7' is momentum from mass, not growth.",
      typeSafety:
        "Decorated entities are typed, but query strings ('relation.field' selectors), find-options objects, and runtime relation resolution leak past the compiler in ways newer tools engineered out.",
    },
    strengths: [
      "Familiar to anyone from Hibernate/EF backgrounds — decorator entities and repositories map straight over",
      "Both Active Record and Data Mapper patterns supported — flexible to team preference",
      "Deep NestJS integration and years of accumulated tutorials, answers, and examples",
      "Broad database support including MongoDB, unusual for the category",
    ],
    weaknesses: [
      "Long-standing correctness and maintenance issues: subtle bugs in cascades, relations, and migrations that sat open for years shaped its reputation",
      "Query generation can be opaque and inefficient, with fewer diagnostics than EF or Hibernate offer for the same problem",
      "Type safety has gaps newer tools closed: magic strings in queries and relations that fail at runtime",
      "The talent and library ecosystem is migrating away — betting new systems on it means swimming against that current",
    ],
    chooseWhen: [
      "You're maintaining an existing TypeORM codebase — it works, and migration is a project to justify on its own merits, not a reflex",
      "A NestJS-centric team with existing TypeORM expertise and patterns is starting something small and similar",
      "You need one ORM API across SQL and MongoDB in the same codebase (a genuinely rare requirement)",
    ],
    avoidWhen: [
      "Greenfield TypeScript projects — Prisma and Drizzle exist because of this tool's problems and are better on nearly every axis",
      "Correctness-sensitive domains where a data-layer bug is an incident, given the track record",
    ],
    alternatives: [
      { techId: "prisma", note: "The mainstream migration target: schema-first, better tooling, active development — most 'we're leaving TypeORM' stories end here.", effort: "moderate" },
      { techId: "drizzle", note: "The migration target for teams who concluded the problem was ORM opacity itself, not just this ORM.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "nestjs", note: "The historical default pairing — years of NestJS docs and codebases assume it, which is exactly why so much of it is still running." },
    ],
    commitments: [
      {
        need: "You now own defensive testing around the ORM's known trouble spots",
        why: "Cascades, relation loading, and migration edge cases have a documented bug history — integration tests around them are insurance, not paranoia.",
      },
      {
        need: "You must maintain against a shrinking ecosystem current",
        why: "Talent and library energy are moving to Prisma and Drizzle — each year, hiring for and integrating with TypeORM costs a little more.",
      },
      {
        need: "You now own keeping the exit affordable",
        why: "The migration-away conversation will recur every planning cycle — clean entity-layer boundaries are what keep it a project instead of a rewrite.",
      },
    ],
    tags: ["orm", "decorator-based", "legacy-momentum"],
  },
  {
    id: "hibernate",
    aka: ["JPA", "Spring Data JPA"],
    name: "Hibernate / JPA",
    category: "data-access",
    ecosystem: "jvm",
    tagline: "The original heavyweight ORM — capability and complexity in equal, enormous measure.",
    description:
      "The ORM that defined the category and the JPA standard behind it: entity mapping, a session with a first-level cache, optional second-level caching, lazy loading, dirty checking, and HQL/Criteria queries. Twenty-plus years of production hardening make it capable of nearly anything — and its session and caching semantics form a genuine discipline that takes years to master, with LazyInitializationException as every JVM developer's rite of passage. A JVM library through and through; it exists only where Java or Kotlin runs.",
    scores: {
      performance: 5,
      devVelocity: 6,
      learningEase: 3,
      ecosystem: 9,
      scalability: 8,
      typeSafety: 7,
      opsSimplicity: 5,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "Bimodal: tuned Hibernate with proper fetch strategies and caching is genuinely fast; naive Hibernate generates N+1 storms and session bloat. The '5' averages the tuning skill actually present on teams.",
      learningEase:
        "The category's deepest curve: session lifecycle, entity states (transient/managed/detached), cascade types, and lazy-loading semantics must all be understood before it stops surprising you.",
      maturity:
        "The reference point for ORM maturity anywhere: every failure mode is documented, every question answered somewhere.",
    },
    strengths: [
      "Handles mapping complexity nothing else in the category attempts: inheritance strategies, composite keys, exotic legacy schemas",
      "Sophisticated caching layers (session, second-level, query) can dramatically reduce database load when wielded well",
      "JPA standardization means knowledge and (mostly) code transfer across implementations and decades",
      "Enormous hiring pool and two decades of documented solutions to every conceivable problem",
      "Spring Data JPA on top removes most boilerplate for conventional repository patterns",
    ],
    weaknesses: [
      "Lazy-loading landmines: LazyInitializationException and accidental N+1 queries are the classic production surprises",
      "Session semantics (attached vs detached entities, flush timing, dirty checking) leak into application design everywhere",
      "Generated SQL for complex mappings can be spectacularly bad, and diagnosing it requires deep internals knowledge",
      "Heavy startup and memory footprint — a poor fit for cold-start-sensitive deployments",
    ],
    chooseWhen: [
      "JVM enterprise applications with complex domain models and long lifespans — its home turf for twenty years",
      "The team has real Hibernate depth — experienced hands avoid the landmines and harvest the caching wins",
      "Mapping a gnarly legacy schema where its exhaustive mapping flexibility is the only thing that fits",
    ],
    avoidWhen: [
      "Serverless or scale-to-zero deployments where its warm-up cost is paid on every cold start",
      "Simple services where jOOQ-style SQL-first or plain JDBC would be transparent — the session machinery is pure overhead there",
      "The team is junior in it and the schedule has no room for the rite-of-passage bugs",
    ],
    alternatives: [
      { techId: "ef-core", note: "Not a swap — a mirror. If the platform choice is still open, EF Core is the same full-ORM bargain with a decade less legacy; data-access tools only compete inside their own ecosystem.", effort: "rewrite" },
      { techId: "dapper", note: "The pattern to copy, not the library: the JVM equivalent of the micro-ORM move is jOOQ or JdbcTemplate for hot paths alongside Hibernate for writes.", effort: "rewrite" },
    ],
    pairsWellWith: [
      { techId: "spring-boot", note: "Spring Data JPA is the JVM's default data story — the integration is so complete most teams never see raw Hibernate APIs." },
      { techId: "postgres", note: "The workhorse open-source pairing across two decades of JVM enterprise systems." },
      { techId: "redis", note: "A common second-level cache backing store when Hibernate's caching layers are used in anger across instances." },
    ],
    frictionWith: [
      { techId: "serverless-functions", note: "Session factories and entity-manager warm-up on every cold start is real latency and real money — the architecture and the library want opposite lifecycles." },
    ],
    commitments: [
      {
        need: "You now own session-lifecycle expertise as a permanent team skill",
        why: "Entity states, flush timing, and lazy-loading semantics leak into application design — every hire must internalize them before their code stops surprising you.",
      },
      {
        need: "You now own fetch-strategy tuning as ongoing work",
        why: "Default lazy loading plus growing data volumes produce N+1 storms — someone must keep watching the generated SQL as the domain model evolves.",
      },
      {
        need: "You must govern every caching layer you enable",
        why: "Second-level and query caches trade correctness for speed — invalidation scope and cross-instance clustering behavior become your design problem, not Hibernate's.",
      },
    ],
    tags: ["orm", "full-orm", "jpa", "enterprise"],
  },
  {
    id: "sqlalchemy",
    name: "SQLAlchemy",
    category: "data-access",
    ecosystem: "python",
    tagline: "Core + ORM as separate layers — the most respected ORM design in any language.",
    description:
      "Python's data-access standard, distinguished by its layered architecture: Core is a full SQL expression language and connection toolkit you can use alone, and the ORM is an optional layer built openly on top of it. That design means you never hit the classic ORM cliff — when a query outgrows the ORM, you drop one layer to Core and keep composing SQL programmatically, instead of falling all the way to raw strings. The 2.0 release unified the historically divergent query APIs into one style. Python-only, and the reason many engineers consider it the best-designed ORM in any language.",
    scores: {
      performance: 6,
      devVelocity: 7,
      learningEase: 5,
      ecosystem: 8,
      scalability: 7,
      typeSafety: 6,
      opsSimplicity: 7,
      maturity: 9,
    },
    scoreNotes: {
      learningEase:
        "The layered design that experts love is the learning curve novices feel: sessions, the unit-of-work pattern, and knowing which layer to reach for take time to internalize.",
      typeSafety:
        "2.0's typed constructs (Mapped[], mypy plugins) are a big step, but Python's typing can't match what compiled-language peers check — the ceiling is the language's.",
      maturity:
        "Two decades old and rigorously maintained; the 2.0 API unification was a managed, well-documented migration rather than a rug-pull — held just below 10 because that transition is still recent memory in real codebases.",
    },
    strengths: [
      "The Core/ORM split is the category's best escape-hatch design: outgrowing the ORM means dropping one layer, not abandoning the tool",
      "Core's SQL expression language composes queries programmatically with full database-dialect awareness — safer and more reusable than string building",
      "Exceptional engineering reputation: careful design, thorough docs, disciplined maintenance across two decades",
      "2.0 unified the ORM and Core query styles into one coherent API, paying down its own historical inconsistency",
      "Alembic migrations integrate tightly and handle complex, real-world schema evolution well",
    ],
    weaknesses: [
      "Conceptually demanding: the session/unit-of-work model and the layer boundaries confuse newcomers who just want to save an object",
      "Python typing limits how much the toolchain can catch versus compiled-language ORMs",
      "The 1.x-to-2.0 transition left years of tutorials and codebases in the old styles — learning from random examples is hazardous",
      "Async support is solid post-2.0 but arrived late; older ecosystem integrations still assume sync sessions",
    ],
    chooseWhen: [
      "Any serious Python application talking to a relational database that isn't Django — it's the ecosystem's default for a reason",
      "Data-heavy or SQL-forward domains where Core's composable expression language shines (reporting, ETL, analytics services)",
      "Long-lived systems where the escape-hatch architecture will eventually be needed and rewrites are unaffordable",
    ],
    avoidWhen: [
      "You're already in Django — fighting the framework's integrated ORM to use SQLAlchemy costs more than it returns",
      "Trivial scripts or tiny services where a driver and a few SQL strings are honestly sufficient",
    ],
    alternatives: [
      { techId: "django", note: "Cross-category but the real decision: Django's built-in ORM comes with the framework, and choosing Django is choosing its ORM — SQLAlchemy is the default everywhere else in Python.", effort: "rewrite" },
      { techId: "ef-core", note: "Not a swap — the ecosystem-peer comparison: if the platform is still open, EF Core is the nearest equivalent in ambition, with stronger compile-time typing and a less interesting escape hatch.", effort: "rewrite" },
    ],
    pairsWellWith: [
      { techId: "fastapi", note: "The standard modern Python API stack — FastAPI's dependency injection manages SQLAlchemy sessions cleanly, and 2.0's async support fits its async-first design." },
      { techId: "postgres", note: "Its deepest dialect support and the default pairing for serious Python backends." },
    ],
    commitments: [
      {
        need: "You now own the session and unit-of-work discipline",
        why: "When objects flush, expire, and detach is a model every contributor must internalize — most 'SQLAlchemy bugs' are session-lifecycle misunderstandings.",
      },
      {
        need: "You must police pre-2.0 patterns out of new code",
        why: "Years of 1.x tutorials and codebases mean copy-pasted examples routinely import the old styles — style enforcement is a standing review job.",
      },
      {
        need: "You now own Alembic migration hygiene",
        why: "Autogenerate produces a draft, not a migration — reviewing diffs, ordering branches, and testing downgrades is process you run for the system's lifetime.",
      },
    ],
    tags: ["orm", "layered-design", "sql-toolkit"],
  },
];
