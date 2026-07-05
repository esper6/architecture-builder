import type { Tech } from "../types";

/**
 * Backend frameworks. This is the ecosystem-anchor decision of the whole
 * stack: picking a backend picks a language, which picks your data-access
 * options, your hiring pool, and half your ops story. Scores are relative
 * within this category; scoreNotes flag where a number flips in a
 * different context (team background, traffic profile, org size).
 */
export const BACKEND_TECHS: Tech[] = [
  {
    id: "aspnet-core",
    name: "ASP.NET Core",
    category: "backend",
    ecosystem: "dotnet",
    tagline: "Performance, batteries, and one vendor's coherent answer to everything.",
    description:
      "Microsoft's cross-platform web framework: routing, DI, configuration, auth, background services, and a first-party ORM all designed together and versioned together. It's one of the fastest managed-runtime frameworks in existence, and the one-vendor coherence means the pieces genuinely fit — the price is that you're choosing Microsoft's worldview for the whole backend, and your data-access and hiring markets come with it.",
    scores: {
      performance: 8,
      devVelocity: 7,
      learningEase: 6,
      ecosystem: 8,
      scalability: 9,
      typeSafety: 9,
      opsSimplicity: 7,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "Kestrel routinely tops managed-runtime benchmarks — only Go and Rust in this category beat it, and not by much on typical workloads.",
      scalability:
        "The '9' is as much org-scale as request-scale: DI, analyzers, and a stable idiom keep 50-developer codebases coherent.",
      maturity:
        "The framework itself is rock solid; the '9' not '10' remembers the Framework→Core rewrite — old ASP.NET knowledge and libraries didn't all survive the move.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 9 },
        { label: "Startup & cold start", value: 6, note: "JIT warm-up on first requests; Native AOT closes the gap where cold start actually matters." },
        { label: "Memory footprint", value: 6 },
      ],
    },
    strengths: [
      "Top-tier performance for a batteries-included framework — you rarely leave it for speed reasons",
      "Everything first-party and designed together: DI, config, auth, logging, EF Core, SignalR",
      "C#'s type system plus analyzers catch a lot before runtime; refactoring large codebases is safe",
      "Microsoft's LTS discipline: predictable releases, long support windows, serious backward-compat culture",
      "Deep enterprise hiring pool, especially outside coastal startup markets",
    ],
    weaknesses: [
      "One-vendor coherence cuts both ways: the idiomatic path is Microsoft's path, and fighting it is expensive",
      "Heavier conceptual surface than the minimalist options — middleware pipeline, DI lifetimes, hosting model",
      "The ecosystem skews enterprise: fewer cutting-edge OSS experiments than the Node world",
      "Startup-market perception problem: some talent pools read '.NET' as 'enterprise legacy' regardless of reality",
    ],
    chooseWhen: [
      "The team knows C# or the org is already a Microsoft shop — the coherence dividend is immediate",
      "Long-lived line-of-business systems where 10-year maintainability and vendor support matter",
      "You want near-Go performance without giving up a rich framework and ORM",
    ],
    avoidWhen: [
      "The team is JavaScript- or Python-native and the project doesn't justify a language migration",
      "You're hiring in a market where .NET candidates are scarce and startup-JS candidates are everywhere",
    ],
    alternatives: [
      {
        techId: "spring-boot",
        note: "The JVM twin: same batteries-included, DI-centric enterprise philosophy. Choose by which ecosystem your org already lives in — switching between them buys little.",
        effort: "rewrite",
      },
      {
        techId: "nestjs",
        note: "Delivers a similar structured, DI-driven experience in TypeScript — for teams that want ASP.NET's shape but Node's ecosystem and hiring.",
        effort: "rewrite",
      },
      {
        techId: "go-http",
        note: "When deploy footprint and cold-start latency start to dominate — a single static binary beats a runtime, at the cost of the framework and ORM comforts.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "ef-core", note: "Designed together, versioned together — migrations, LINQ, and change tracking with zero impedance against the framework." },
      { techId: "mssql", note: "The all-Microsoft data path: best-in-class tooling integration, and EF Core's SQL Server provider is its most exercised." },
      { techId: "blazor", note: "One language and shared models from database to browser — the whole-stack consolidation play for .NET teams." },
    ],
    commitments: [
      {
        need: "You now track the .NET release cadence — yearly majors with LTS windows the org must actually observe",
        why: "Running an out-of-support runtime is a compliance finding, not a preference; upgrades are usually smooth but never optional.",
      },
      {
        need: "You now own DI-lifetime and middleware-pipeline expertise as core team knowledge",
        why: "A captive dependency or misordered middleware fails subtly at runtime — the framework's coherence assumes someone knows its lifecycle cold.",
      },
      {
        need: "You now must stay on the idiomatic Microsoft path to keep the coherence you're paying for",
        why: "Swapping in foreign DI containers or ORMs fights the first-party integration at every seam — the one-vendor dividend evaporates the moment you go off-road.",
      },
    ],
    tags: ["batteries-included", "enterprise", "one-vendor"],
  },
  {
    id: "express",
    name: "Node.js + Express",
    category: "backend",
    ecosystem: "node",
    tagline: "The lingua franca of Node — minimal by design, assembled by you, coasting on its past.",
    description:
      "A ~15-year-old minimalist routing-and-middleware library that became the default way to write a Node server; half the backend tutorials on the internet assume it. It gives you almost nothing — no validation, no ORM, no structure — which means every Express app is a bespoke assembly of npm packages, and the framework's own core has barely moved in a decade while the ecosystem around it churned. Choosing it anchors you to Node: JavaScript hiring, npm's enormous-but-uneven library market, and single-threaded-per-process ops.",
    scores: {
      performance: 5,
      devVelocity: 6,
      learningEase: 9,
      ecosystem: 10,
      scalability: 5,
      typeSafety: 4,
      opsSimplicity: 6,
      maturity: 9,
    },
    scoreNotes: {
      ecosystem:
        "The 10 is real — largest tutorial base, middleware market, and hiring pool in this category — but note the core itself stagnated for years (v5 took nearly a decade).",
      typeSafety:
        "TypeScript bolts on, but Express predates it: untyped req/res extension and any-typed middleware are the daily reality without discipline.",
      devVelocity:
        "Fast for the first week; the 'you assemble everything' cost (validation, auth, error handling, structure) compounds as the app grows.",
      scalability:
        "The '5' is org-scale: with no imposed structure, ten Express codebases are ten different architectures — coherence at team scale is on you.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 5 },
        { label: "Startup & cold start", value: 8 },
        { label: "Memory footprint", value: 7 },
      ],
    },
    strengths: [
      "Everyone knows it: the largest hiring pool and Stack Overflow coverage of any backend framework",
      "Learnable in an afternoon — a route is a function, middleware is a function",
      "Total flexibility: no framework opinion stands between you and any design you want",
      "Any npm package you can imagine has an Express integration",
    ],
    weaknesses: [
      "You assemble everything: validation, auth, ORM, error handling, project structure — and own the assembly forever",
      "The core aged in place: callback-era APIs, weak async error handling until v5, TypeScript as an afterthought",
      "No guardrails means large codebases drift into bespoke architectures new hires must archaeology through",
      "Middling performance — never the bottleneck early, but Fastify does the same job measurably faster",
    ],
    chooseWhen: [
      "A small service or API where familiarity beats everything — everyone's first Node server works fine",
      "The team already thinks in Express idioms and the app won't outgrow them",
      "You need maximal middleware compatibility with the existing npm ecosystem",
    ],
    avoidWhen: [
      "Starting a new project with no legacy constraint — Fastify gives the same model with modern internals",
      "A growing team needs shared structure — unguided Express at 20 developers is architecture by accretion",
    ],
    alternatives: [
      {
        techId: "fastify",
        note: "The same minimalist model, rebuilt modern: faster, schema-first validation, real TypeScript support. The default upgrade for new projects.",
        effort: "drop-in",
      },
      {
        techId: "nestjs",
        note: "When the Express codebase needs imposed structure — Nest brings DI, modules, and conventions (and can even run on Express underneath).",
        effort: "moderate",
      },
      {
        techId: "fastapi",
        note: "The Python equivalent of the 'lightweight API framework' slot — switch ecosystems when the team or the domain (data/ML) is Python-shaped.",
        effort: "rewrite",
      },
      {
        techId: "go-http",
        note: "When ops footprint and raw throughput start to matter more than npm's library breadth.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "prisma", note: "A modern typed data layer papers over Express's own lack of one — the most common way Express apps get type safety at the database boundary." },
      { techId: "rest", note: "Express is essentially a REST-endpoint construction kit; this is its home game." },
    ],
    notInterchangeableWith: [
      {
        techId: "nestjs",
        note: "People treat 'Node backend' as one choice. Express is a library you build a framework around; Nest is a full framework with an architecture. Migrating between them is a rewrite of structure, not a dependency swap.",
      },
    ],
    commitments: [
      {
        need: "You now own the assembled stack — validation, auth, error handling, project structure are your in-house framework to document and maintain",
        why: "Express ships none of it; every app is a bespoke assembly a new hire learns from your code, because no tutorial covers your choices.",
      },
      {
        need: "You now audit and track a deep npm dependency tree",
        why: "The batteries the framework didn't include arrive as dozens of packages with independent maintainers, CVE streams, and abandonment risk.",
      },
      {
        need: "You now own async error-handling discipline as a review gate",
        why: "A rejected promise that misses next(err) is a hung request or a crashed process — the core predates the patterns that would have caught it for you.",
      },
    ],
    tags: ["minimalist", "default-choice", "aging-core"],
  },
  {
    id: "fastify",
    name: "Node.js + Fastify",
    category: "backend",
    ecosystem: "node",
    tagline: "Express's model, rebuilt for this decade — schema-first, faster, and actually maintained.",
    description:
      "A minimalist Node framework in Express's image but designed post-async/await: JSON-schema validation at the route boundary, serious TypeScript support, a disciplined plugin system with encapsulation, and roughly 2–3x Express's throughput. It occupies the awkward-but-honest position of being technically better than the default while commanding a fraction of its mindshare — the classic second-place ecosystem bet, inside the same Node anchor.",
    scores: {
      performance: 7,
      devVelocity: 6,
      learningEase: 8,
      ecosystem: 6,
      scalability: 6,
      typeSafety: 6,
      opsSimplicity: 6,
      maturity: 7,
    },
    scoreNotes: {
      performance:
        "Best-in-class for Node — the '7' only looks modest because Go, Rust, and .NET live in this category too.",
      typeSafety:
        "JSON-schema validation gives runtime enforcement at the boundary, and type providers derive static types from schemas — better than Express, still not compiler-checked end to end.",
      ecosystem:
        "Healthy first-party plugin set and growing adoption, but the tutorial base, middleware long tail, and 'candidates who already know it' pool are all a fraction of Express's.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 7, note: "Same Node runtime as Express — the gain is lower framework overhead and schema-compiled serialization." },
        { label: "Startup & cold start", value: 8 },
        { label: "Memory footprint", value: 7 },
      ],
    },
    strengths: [
      "Fastest mainstream Node framework — serialization and routing engineered for throughput",
      "Schema-first request/response validation is built in, not a middleware you pick and wire",
      "Plugin encapsulation gives real modularity without a heavyweight framework",
      "Modern core: async/await native, TypeScript-friendly, actively maintained by design",
      "Familiar enough that an Express developer is productive in a day",
    ],
    weaknesses: [
      "Smaller ecosystem: some Express middleware has no Fastify equivalent, and hiring means training",
      "Still minimalist — the 'you assemble the architecture' burden is lighter than Express's but not gone",
      "Schema-everywhere is a discipline some teams skip, at which point you've bought speed and little else",
    ],
    chooseWhen: [
      "Starting a new Node service today — it's Express's job done with modern internals",
      "Node API throughput actually matters (high-RPS gateways, serialization-heavy endpoints)",
      "You want validation contracts at the boundary without adopting a full framework",
    ],
    avoidWhen: [
      "The team leans hard on specific Express middleware with no Fastify port",
      "You need a full imposed architecture — that's NestJS's job, not a faster router's",
    ],
    alternatives: [
      {
        techId: "express",
        note: "Only for legacy compatibility or maximal-familiarity reasons — going backward buys mindshare, not capability.",
        effort: "drop-in",
      },
      {
        techId: "nestjs",
        note: "When you outgrow 'fast minimalist library' and need framework-scale structure — Nest can even use Fastify as its HTTP engine, keeping the speed.",
        effort: "moderate",
      },
      {
        techId: "go-http",
        note: "If you're choosing Fastify purely for performance, Go is the next honest step — more speed and a radically simpler ops story, outside Node.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "prisma", note: "Typed data access plus schema-validated routes covers both boundaries of a Node service." },
      { techId: "drizzle", note: "A popular lean-and-fast pairing — both tools bet on staying close to the metal with types on top." },
      { techId: "websockets", note: "First-party WebSocket support rides on the same performance-focused core." },
    ],
    commitments: [
      {
        need: "You now own schema discipline as a team norm",
        why: "The validation and serialization wins only exist for routes that declare schemas — unschema'd routes silently opt out, and the framework won't complain.",
      },
      {
        need: "You now write the integration glue an Express team would npm-install",
        why: "When a middleware exists only for Express, porting or wrapping it is your backlog item, not the ecosystem's.",
      },
      {
        need: "You now train hires on the plugin and encapsulation model",
        why: "Most Node developers arrive with Express reflexes; Fastify's scoped plugins are different enough to cause confused bugs before they cause productivity.",
      },
    ],
    tags: ["minimalist", "performance", "modern-core"],
  },
  {
    id: "nestjs",
    name: "NestJS",
    category: "backend",
    ecosystem: "node",
    tagline: "Angular for the backend — imposed architecture for Node teams tired of bespoke Express sprawl.",
    description:
      "A full TypeScript backend framework that brings Angular's playbook to the server: modules, dependency injection, decorators, guards, interceptors, and one blessed way to structure everything. It exists because large Express codebases converge on hand-rolled worse versions of exactly this. You pay in ceremony and abstraction layers over what remains, underneath, Express or Fastify — but ten Nest codebases look alike in a way ten Express codebases never will.",
    scores: {
      performance: 5,
      devVelocity: 7,
      learningEase: 5,
      ecosystem: 7,
      scalability: 8,
      typeSafety: 7,
      opsSimplicity: 6,
      maturity: 7,
    },
    scoreNotes: {
      performance:
        "It's a structure layer over Express (or Fastify — flip the adapter for a real boost); the abstraction itself costs a little.",
      scalability:
        "The '8' is team-scale: enforced modules and DI keep many developers coherent in one codebase — Nest's actual reason to exist.",
      typeSafety:
        "TypeScript-first, but decorator metadata and runtime DI mean some wiring errors surface at boot rather than compile time.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 5, note: "Rides its HTTP adapter — Express by default; swapping in Fastify buys real throughput for one config change." },
        { label: "Startup & cold start", value: 6 },
        { label: "Memory footprint", value: 6 },
      ],
    },
    strengths: [
      "One prescribed architecture: onboarding onto any Nest codebase feels familiar",
      "DI makes testing first-class — mocking a dependency is configuration, not monkey-patching",
      "First-party answers for the hard parts: config, validation, microservice transports, OpenAPI, GraphQL",
      "Angular developers already know the mental model — a real synergy for full-TS shops",
      "Keeps you in the Node ecosystem: npm packages, JS hiring pool, one language across the stack",
    ],
    weaknesses: [
      "Ceremony tax: a CRUD endpoint is a module, controller, service, DTO, and provider wiring",
      "Decorator-heavy magic can obscure what's actually an Express handler underneath",
      "Slower to learn than anything else in Node-land — it front-loads architecture concepts",
      "Abstraction layers make performance tuning and debugging deeper than plain Express/Fastify",
    ],
    chooseWhen: [
      "A growing Node team needs shared structure and the Express codebase is becoming bespoke sprawl",
      "The org runs Angular on the frontend — the shared idiom is a genuine productivity multiplier",
      "Enterprise-style Node: many developers, long-lived codebase, consistency over flexibility",
    ],
    avoidWhen: [
      "Small services or small teams — the ceremony overwhelms the benefit below a certain codebase size",
      "The team wants to stay close to the metal; Nest's abstractions are the product, and they're not optional",
    ],
    alternatives: [
      {
        techId: "express",
        note: "Drop the framework when the service is small enough that structure-by-convention suffices.",
        effort: "moderate",
      },
      {
        techId: "fastify",
        note: "If Nest's appeal was 'better than raw Express' rather than 'imposed architecture', Fastify may be the lighter answer — or use it as Nest's engine.",
        effort: "moderate",
      },
      {
        techId: "aspnet-core",
        note: "The framework Nest is imitating, in its native habitat — if you're not bound to Node, the original has deeper batteries and better performance.",
        effort: "rewrite",
      },
      {
        techId: "spring-boot",
        note: "The JVM's version of the same philosophy; Nest is the choice when you want that shape without leaving TypeScript.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "typeorm", note: "The historically canonical Nest pairing — decorator-based entities match Nest's idiom exactly (Prisma is the modern contender)." },
      { techId: "angular", note: "The same architecture vocabulary on both ends: modules, DI, decorators — one team can genuinely own both." },
      { techId: "graphql", note: "First-party GraphQL module with code-first schemas from decorators — one of the smoother GraphQL on-ramps in any ecosystem." },
    ],
    notInterchangeableWith: [
      {
        techId: "express",
        note: "Nest isn't 'Express with extras' — it's a full framework with an inversion-of-control architecture that happens to use Express as an HTTP engine. Adopting it is an architectural commitment, not a library swap.",
      },
    ],
    commitments: [
      {
        need: "You now own the DI container's runtime behavior",
        why: "Missing providers and circular modules surface at boot, not compile — someone on the team must read Nest's injector errors fluently.",
      },
      {
        need: "You now enforce the framework's layering everywhere, including where it feels like overkill",
        why: "Uniformity is the product; corners that shortcut the module/controller/service ceremony break the one promise Nest makes.",
      },
      {
        need: "You now maintain decorator and metadata toolchain compatibility across TypeScript upgrades",
        why: "experimentalDecorators, reflect-metadata, and build config must stay aligned — an upgrade treadmill plain Express apps simply don't have.",
      },
    ],
    tags: ["framework", "structure", "enterprise"],
  },
  {
    id: "spring-boot",
    name: "Spring Boot",
    category: "backend",
    ecosystem: "jvm",
    tagline: "Two decades of enterprise Java, auto-configured — unmatched depth, undeniable ceremony.",
    description:
      "The JVM's dominant framework: Spring's vast ecosystem (data, security, batch, integration, cloud) with opinionated auto-configuration so it starts useful instead of starting with XML. Nothing else in this category matches its depth — there is a mature, supported Spring answer to essentially every enterprise problem, including the weird EDI-shaped ones. The costs are equally established: conceptual weight, annotation magic that resists debugging, and a JVM that's hungry at rest and slow to wake.",
    scores: {
      performance: 7,
      devVelocity: 6,
      learningEase: 4,
      ecosystem: 9,
      scalability: 9,
      typeSafety: 8,
      opsSimplicity: 4,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "A warm JVM is genuinely fast — the '7' is throughput reality; the ops pain is startup time and memory, which live in opsSimplicity.",
      opsSimplicity:
        "Multi-hundred-MB heaps and tens-of-seconds cold starts fight containers and serverless; GraalVM native images fix this at real build-complexity cost.",
      learningEase:
        "Spring Boot is easy to start; Spring is a career. The gap between 'it works by magic' and 'I know why' is the widest in this category.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 8, note: "Excellent once warm — the JVM's whole bargain." },
        { label: "Startup & cold start", value: 3, note: "The famous cost: seconds of JVM warm-up. GraalVM native images fix it by trading away some of the dynamic runtime." },
        { label: "Memory footprint", value: 3 },
      ],
    },
    strengths: [
      "Deepest ecosystem in enterprise computing: batch, messaging, security, integration — all first-party, all maintained",
      "Twenty years of patterns for every problem, including the obscure enterprise-integration ones",
      "Enormous hiring pool of experienced JVM engineers, globally",
      "Org-scale champion: DI, established conventions, and tooling keep hundred-developer codebases coherent",
      "Battle-tested under more production load than nearly anything else in this catalog",
    ],
    weaknesses: [
      "Annotation and auto-configuration magic: when it works you saved a week, when it breaks you lose one",
      "JVM warm-up and memory appetite tax containers, autoscaling, and anything serverless-shaped",
      "Ceremony per feature is high — layers, annotations, and configuration for what FastAPI does in a decorator",
      "The size of the ecosystem is itself a curve: knowing what NOT to use is senior-engineer knowledge",
    ],
    chooseWhen: [
      "Enterprise systems with deep integration needs — messaging, batch, legacy protocols — where Spring has a module for everything",
      "The org already runs on the JVM and staffs for it",
      "Very large teams building very long-lived systems where structure and support beat startup speed",
    ],
    avoidWhen: [
      "Small teams racing to an MVP — the ceremony and curve tax is front-loaded exactly where you can't afford it",
      "Scale-to-zero or serverless deployment models, unless you're prepared to own GraalVM native builds",
    ],
    alternatives: [
      {
        techId: "aspnet-core",
        note: "The .NET mirror image: same enterprise philosophy, generally better raw performance and lighter runtime. Choose by existing org ecosystem, not by feature comparison.",
        effort: "rewrite",
      },
      {
        techId: "go-http",
        note: "The escape hatch when JVM footprint dominates: services that start in milliseconds and run in tens of MB — giving up Spring's framework depth entirely.",
        effort: "rewrite",
      },
      {
        techId: "nestjs",
        note: "For teams leaving Java for TypeScript who still want the DI-and-modules shape they're used to.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "hibernate", note: "Spring Data JPA over Hibernate is the default enterprise persistence stack — deeply integrated, extensively documented, and hard to hire around." },
      { techId: "postgres", note: "The modern default pairing now that Oracle licensing sends everyone elsewhere." },
      { techId: "kafka", note: "Spring Kafka and Spring Cloud Stream make the JVM the most-paved road to event-driven architectures." },
    ],
    frictionWith: [
      { techId: "serverless-functions", note: "Cold-starting a JVM plus Spring's context per invocation is the canonical serverless anti-pattern — native images help but move the cost into your build." },
    ],
    commitments: [
      {
        need: "You now own JVM tuning and memory sizing in production",
        why: "Heap, GC, and warm-up behavior are operational surface Go/Node teams simply don't have.",
      },
      {
        need: "You now own the auto-configuration black box",
        why: "Someone must be able to answer 'why does this bean exist?' — debugging conditional configuration is a distinct skill you keep in-house or suffer without.",
      },
      {
        need: "You now curate the Spring ecosystem for your teams",
        why: "There's a starter for everything; knowing what NOT to adopt is senior-engineer knowledge, and every module you do adopt joins your upgrade matrix.",
      },
    ],
    tags: ["enterprise", "batteries-included", "jvm"],
  },
  {
    id: "fastapi",
    name: "FastAPI",
    category: "backend",
    ecosystem: "python",
    tagline: "Type hints become validation, docs, and contracts — Python API velocity with a Python ceiling.",
    description:
      "A modern async Python microframework where Pydantic models and type hints do triple duty: runtime validation, serialization, and auto-generated OpenAPI docs, all from the code you'd write anyway. It's plausibly the fastest path from idea to documented, validated API in this category. The anchor matters: you're in Python — home-field advantage for anything data/ML-adjacent, but with the GIL, interpreter-speed ceilings, and a deployment story of process managers rather than one binary.",
    scores: {
      performance: 4,
      devVelocity: 9,
      learningEase: 9,
      ecosystem: 7,
      scalability: 6,
      typeSafety: 6,
      opsSimplicity: 5,
      maturity: 6,
    },
    scoreNotes: {
      performance:
        "Excellent for Python (async + uvloop), still Python: the interpreter and GIL cap you well below the compiled and JIT'd options here. CPU-bound work needs to leave the process.",
      typeSafety:
        "Pydantic enforces contracts at runtime and type hints help editors — real safety at the boundary, but the interior is still gradually-typed Python.",
      maturity:
        "Young-ish and largely one lead maintainer's project; the Pydantic v1→v2 migration was a real ecosystem event.",
      opsSimplicity:
        "The GIL means scaling is multi-process (uvicorn/gunicorn workers) behind a reverse proxy — standard, but more moving parts than a single binary.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 4, note: "Async holds up well under I/O-bound concurrency; CPU-bound work hits the GIL." },
        { label: "Startup & cold start", value: 7 },
        { label: "Memory footprint", value: 6 },
      ],
    },
    strengths: [
      "Fastest idea-to-endpoint velocity in the category: define a Pydantic model, get validation and docs for free",
      "Auto-generated OpenAPI/Swagger UI keeps docs honest — they ARE the code",
      "Async-native design that actually exploits Python's asyncio for I/O-bound APIs",
      "Direct line to Python's data/ML ecosystem — the natural API layer in front of models and pipelines",
      "Trivially easy to learn for anyone who knows Python",
    ],
    weaknesses: [
      "Python's performance ceiling and the GIL: throughput-heavy or CPU-bound services outgrow it",
      "A microframework: auth, migrations, admin, background jobs are all assembly work (Django's territory)",
      "Bus-factor and churn risk: a young project with a history of core-dependency breaking changes",
      "Async Python's ecosystem is still split — mixing sync libraries into async handlers is a classic footgun",
    ],
    chooseWhen: [
      "APIs in front of data science or ML work — the ecosystem gravity is decisive",
      "Small teams shipping internal or B2B APIs where velocity and self-documenting contracts beat raw speed",
      "Prototyping services whose contracts you want validated and documented from day one",
    ],
    avoidWhen: [
      "Throughput or latency SLAs that push against Python's ceiling — you'll be rewriting under pressure",
      "The app is really a full product with admin, auth, and CMS needs — that's Django's brief, not a microframework's",
    ],
    alternatives: [
      {
        techId: "django",
        note: "Same language, opposite philosophy: switch when you need the batteries (admin, auth, ORM, migrations) more than the microframework's agility.",
        effort: "moderate",
      },
      {
        techId: "fastify",
        note: "The Node ecosystem's equivalent slot — schema-validated, lightweight, fast-for-its-runtime. Switch ecosystems when the team is TypeScript-shaped.",
        effort: "rewrite",
      },
      {
        techId: "go-http",
        note: "The standard graduation path when a FastAPI service hits Python's performance ceiling — keep the API contract, swap the engine.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "sqlalchemy", note: "The canonical pairing: SQLAlchemy's async support plus Pydantic models covers the whole request-to-database path." },
      { techId: "postgres", note: "The default database of the modern Python stack — asyncpg drivers make it the best-supported async path." },
      { techId: "rest", note: "FastAPI is effectively a REST-contract generator; OpenAPI-first workflows are its home game." },
    ],
    notInterchangeableWith: [
      {
        techId: "django",
        note: "Both are 'Python backends' and that's where the similarity ends: FastAPI is a microframework for APIs, Django a full-stack application factory. Choosing between them is choosing how much framework you want, not which brand.",
      },
    ],
    commitments: [
      {
        need: "You now own a multi-process deployment topology",
        why: "The GIL means scaling is uvicorn/gunicorn workers behind a proxy — sizing worker counts, timeouts, and per-worker memory is your ops surface, not the framework's.",
      },
      {
        need: "You now police the sync/async boundary in code review",
        why: "One blocking call inside an async handler stalls the event loop for every request — the interpreter won't warn you; production will.",
      },
      {
        need: "You now track a fast-moving dependency chain with a thin bus factor",
        why: "FastAPI, Pydantic, and Starlette move quickly and have broken compatibility before (Pydantic v2) — pinning and migration work is recurring, not one-time.",
      },
    ],
    tags: ["microframework", "async", "python-data"],
  },
  {
    id: "django",
    name: "Django",
    category: "backend",
    ecosystem: "python",
    tagline: "The web framework as complete product kit — an admin panel for free, a monolith by assumption.",
    description:
      "Python's batteries-included framework: ORM, migrations, auth, forms, templating, security middleware, and the famous auto-generated admin interface, all designed as one coherent whole since 2005. For database-backed products it may be the fastest complete-application path in this catalog — CRUD plus an internal admin UI materializes in days. Its assumptions are monolithic and server-rendered: the further your architecture drifts from 'one Django app owning its database', the more the batteries become baggage.",
    scores: {
      performance: 3,
      devVelocity: 9,
      learningEase: 6,
      ecosystem: 8,
      scalability: 6,
      typeSafety: 3,
      opsSimplicity: 5,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "The slowest mainstream option here: synchronous heritage, ORM overhead, interpreter speed. Instagram-scale deployments prove it's survivable — with caching layers doing the real work.",
      devVelocity:
        "The '9' is for database-backed products: model + admin + auth in an afternoon. For pure JSON APIs the advantage shrinks toward FastAPI.",
      typeSafety:
        "Dynamically-typed Python plus a string-heavy ORM and template layer; django-stubs helps but it's retrofit, not foundation.",
      maturity:
        "Twenty years of unbroken releases, a security track record institutions trust, and deprecation policies other projects should study.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 3 },
        { label: "Startup & cold start", value: 6 },
        { label: "Memory footprint", value: 5 },
      ],
    },
    strengths: [
      "The admin interface alone justifies it for internal tools — a usable back-office UI generated from your models",
      "Everything included and designed together: ORM, migrations, auth, forms, security defaults",
      "Security hardening by default (CSRF, XSS, SQL injection) from two decades of production scar tissue",
      "Exceptional docs and stability — Django code from years ago still reads like Django code from today",
      "Python anchor: the same hiring pool and library access as the data/ML world",
    ],
    weaknesses: [
      "Slowest option in the category — Python plus a heavyweight synchronous-heritage framework",
      "Monolithic assumptions: Django wants to own the database, the URLs, and the request cycle; microservice-shaped and API-only uses fight it",
      "Async support is still retrofit — the ORM and middleware story remains partially synchronous",
      "The Django ORM is its own dialect: powerful for common cases, awkward at the SQL edges, and non-transferable knowledge",
    ],
    chooseWhen: [
      "Database-backed products where an admin/back-office UI is half the requirement — CMSes, marketplaces, internal platforms",
      "Small teams that want one coherent, secure, documented answer to everything rather than assembling a stack",
      "Content-heavy or forms-heavy sites where server-side rendering is a feature, not a limitation",
    ],
    avoidWhen: [
      "High-throughput or real-time APIs — the performance ceiling and async story will fight you",
      "Microservice architectures — a fleet of Djangos carries a lot of unused batteries per service",
      "The frontend is a rich SPA and Django would be reduced to a slow JSON pump behind it",
    ],
    alternatives: [
      {
        techId: "fastapi",
        note: "Same language, a tenth of the framework: switch when you need an API, not an application kit — or when async performance starts to matter.",
        effort: "moderate",
      },
      {
        techId: "aspnet-core",
        note: "The batteries-included philosophy with a compiled runtime and static types — a better fit when the same product outgrows Python's ceilings.",
        effort: "rewrite",
      },
      {
        techId: "spring-boot",
        note: "The JVM's application-kit equivalent; heavier ceremony, deeper enterprise integrations.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "postgres", note: "Django's first-class citizen: the ORM's best features (JSON fields, full-text search, array fields) are Postgres-specific." },
      { techId: "htmx", note: "Templates returning fragments to htmx gives Django apps a modern feel with no SPA, no API layer, and no JavaScript build — a celebrated combination." },
      { techId: "redis", note: "The standard answer to Django's performance ceiling: cache aggressively and let Redis absorb what Python can't." },
    ],
    frictionWith: [
      { techId: "prisma", note: "Django's ORM is load-bearing — migrations, admin, and forms all hang off it. Swapping in a foreign data layer amputates the framework's best parts." },
    ],
    notInterchangeableWith: [
      {
        techId: "fastapi",
        note: "The reverse of the FastAPI entry, because the confusion flows both ways: Django is an application factory, FastAPI an API toolkit. 'Modern vs old' is the wrong frame — 'whole product vs endpoint layer' is the right one.",
      },
    ],
    commitments: [
      {
        need: "You now design inside the ORM's dialect and own the escape hatches where it runs out",
        why: "Admin, forms, and migrations all hang off the ORM — every raw-SQL workaround is a seam in the framework's most load-bearing wall, and you maintain the seam.",
      },
      {
        need: "You now own a caching layer as a permanent architectural component",
        why: "Django at real traffic is Django plus Redis/CDN doing the heavy lifting — cache strategy and invalidation become core application logic, not an optimization.",
      },
      {
        need: "You now own the admin interface as production attack surface",
        why: "The free back-office UI is a real application exposed to real users; its permissioning, auditing, and hardening are ongoing work, not a checkbox.",
      },
    ],
    tags: ["batteries-included", "admin", "monolith-shaped"],
  },
  {
    id: "go-http",
    name: "Go net/http + chi/Gin",
    category: "backend",
    ecosystem: "go",
    tagline: "Operational excellence as a language feature — one static binary, deliberate austerity everywhere else.",
    description:
      "Go's standard library HTTP server, usually with a thin router like chi or Gin, is a complete production web stack — goroutines give you concurrency without an async dialect, and the compiler gives you a single static binary that starts in milliseconds and idles in tens of megabytes. The language is austere on purpose: less expressive than everything else here, repetitive by design, and proud of it. You're trading developer comfort for the best ops story in the category.",
    scores: {
      performance: 9,
      devVelocity: 5,
      learningEase: 7,
      ecosystem: 7,
      scalability: 8,
      typeSafety: 8,
      opsSimplicity: 10,
      maturity: 8,
    },
    scoreNotes: {
      opsSimplicity:
        "The 10: one static binary, no runtime to install, millisecond starts, tiny memory, cross-compilation built in. Nothing else in the category is close.",
      devVelocity:
        "The '5' is the austerity tax: explicit error handling on every call, no ORM culture, more code per feature. It reads as slow and reviews as reliable.",
      learningEase:
        "The language is learnable in a week by design; the curve is unlearning — accepting repetition and if err != nil as the idiom rather than fighting for abstraction.",
      ecosystem:
        "The cloud-native world is written in Go (Docker, Kubernetes, Terraform), so infra libraries are superb; the web-application long tail (admin panels, CMS-ish batteries) is thin.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 9 },
        { label: "Startup & cold start", value: 10, note: "A static binary starting in milliseconds is half the ops pitch." },
        { label: "Memory footprint", value: 9 },
      ],
    },
    strengths: [
      "Deploy story without equal: a single static binary in a scratch container, starting in milliseconds",
      "Goroutines make concurrent I/O natural — no async/await split, no colored functions",
      "Performance near the top of the category with far less effort than Rust demands",
      "Enforced simplicity means codebases stay readable across teams and years — little style drift to police",
      "gofmt, fast compiles, and single-binary tooling: the whole toolchain respects your time",
    ],
    weaknesses: [
      "Deliberate language austerity: verbose error handling, limited abstraction — some experienced developers find it stifling",
      "Batteries not included: no framework-grade auth, admin, or ORM conventions — the culture prefers SQL and libraries over frameworks",
      "More code per feature than anything here except Rust — velocity is a conscious sacrifice",
      "The 'plain Go' culture means less imposed structure; large codebases need their own conventions",
    ],
    chooseWhen: [
      "Ops footprint is a first-class requirement: many small services, edge deployments, scale-to-zero, tight containers",
      "Infrastructure-adjacent services — proxies, CLIs, agents, network tools — where Go is the native tongue",
      "A team burned by runtime and dependency sprawl wants boring, reliable, fast services",
    ],
    avoidWhen: [
      "Product CRUD velocity is the whole game — a batteries-included framework ships features faster",
      "The team's satisfaction depends on expressive language features; Go's austerity is permanent and intentional",
    ],
    alternatives: [
      {
        techId: "rust-axum",
        note: "When Go's performance isn't enough or its GC pauses matter — the next step up in speed and correctness, and a much bigger step up in difficulty.",
        effort: "rewrite",
      },
      {
        techId: "aspnet-core",
        note: "Most of Go's performance with a real framework and ORM attached — the pragmatic middle when austerity isn't buying you anything.",
        effort: "rewrite",
      },
      {
        techId: "fastify",
        note: "Going the other way: when npm's ecosystem and JS hiring matter more than the binary's size.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "postgres", note: "Go culture skips the ORM and talks to Postgres directly through pgx and sqlc-style codegen — SQL-first with compile-time-checked queries." },
      { techId: "grpc", note: "Go is gRPC's first-class citizen — protobuf codegen and the ecosystem's infra DNA make it the default for service-to-service meshes." },
      { techId: "kubernetes", note: "K8s is written in Go and Go binaries are its ideal tenants: tiny images, fast starts, health checks that answer instantly." },
    ],
    commitments: [
      {
        need: "You now own the conventions a framework would have imposed",
        why: "Project layout, error wrapping, middleware patterns — plain Go dictates none of it, so your style guide is the framework and enforcing it is ongoing work.",
      },
      {
        need: "You now write and maintain the batteries: auth flows, admin tooling, background jobs",
        why: "The Go culture's answer to most framework features is 'a small library and some code you own' — and that code is yours forever.",
      },
      {
        need: "You now own SQL fluency as a team requirement",
        why: "The idiomatic data path is pgx and sqlc-style codegen, not an ORM — schema design, query tuning, and migrations are hand tools here.",
      },
    ],
    tags: ["single-binary", "ops-first", "austere"],
  },
  {
    id: "rust-axum",
    name: "Rust + Axum",
    category: "backend",
    ecosystem: "rust",
    tagline: "Peak performance and compile-time correctness — bought with the steepest curve and the slowest velocity in the catalog.",
    description:
      "Axum is the Rust ecosystem's leading web framework: type-safe extractors, tower middleware, and Tokio async underneath. Rust delivers the best performance in this category and a compiler that eliminates whole bug classes — no GC pauses, no data races, no null. The bill is equally extreme: the borrow checker plus async lifetimes is the hardest learning curve in mainstream programming, compile times are real, and feature velocity is the slowest here even for experts. This is a specialist tool that's currently fashionable as a generalist one.",
    scores: {
      performance: 10,
      devVelocity: 2,
      learningEase: 2,
      ecosystem: 4,
      scalability: 7,
      typeSafety: 10,
      opsSimplicity: 9,
      maturity: 5,
    },
    scoreNotes: {
      devVelocity:
        "The '2' is honest even for experienced Rust developers on CRUD work — fighting lifetimes in async handlers is time not spent shipping. On the workloads Rust is FOR, the calculus changes.",
      typeSafety:
        "The 10 anywhere in this catalog: ownership, exhaustive matching, no null, fearless concurrency — if it compiles, a whole class of production incidents can't happen.",
      opsSimplicity:
        "Same single-static-binary story as Go, with even smaller memory and no GC — a '9' only because compile times make the CI/CD loop heavier.",
      maturity:
        "Axum is well-run but young, and the async Rust ecosystem still has sharp edges the language team is actively sanding.",
    },
    subScores: {
      performance: [
        { label: "Throughput", value: 10 },
        { label: "Startup & cold start", value: 10 },
        { label: "Memory footprint", value: 10, note: "No GC and no runtime — the ceiling of this category." },
      ],
    },
    strengths: [
      "The performance ceiling of the category: native code, zero-cost abstractions, no GC pauses ever",
      "Compiler-enforced correctness: data races, null derefs, and use-after-free are compile errors, not incidents",
      "Go-class deployment: small static binaries, tiny memory footprint, predictable latency",
      "Axum's extractor model turns request parsing into type signatures — the type system IS the validation layer",
    ],
    weaknesses: [
      "The steepest learning curve in mainstream programming — and async Rust is harder than regular Rust",
      "Slowest feature velocity here even in expert hands; the compiler negotiates every shortcut out of you",
      "Small hiring pool, and 'wants to write Rust' correlates imperfectly with 'wants to write CRUD'",
      "Young web ecosystem: auth, ORMs, and framework conveniences are years behind the established players",
    ],
    chooseWhen: [
      "Performance or latency is the product: proxies, trading systems, high-RPS hot paths, per-request cost at massive scale",
      "Correctness failures are catastrophic and worth buying insurance for at compile time",
      "A performance-critical service is being extracted from a slower stack — the rewrite is scoped and justified",
    ],
    avoidWhen: [
      "Standard product development — the velocity tax compounds every sprint and buys nothing users notice",
      "The team hasn't shipped Rust before and the timeline assumes they'll learn on the job",
      "Requirements are still fluid: Rust punishes churn — refactoring under the borrow checker is slow",
    ],
    alternatives: [
      {
        techId: "go-http",
        note: "90% of the performance and the same single-binary ops story at a fraction of the difficulty — the question to answer before choosing Rust is 'why isn't Go enough?'",
        effort: "rewrite",
      },
      {
        techId: "aspnet-core",
        note: "If the honest requirement is 'fast and typed' rather than 'fastest possible', a JIT'd framework with full batteries gets you most of the way in comfort.",
        effort: "rewrite",
      },
      {
        techId: "fastify",
        note: "The pragmatic retreat when a Rust experiment meets a deadline: keep the API shape, ship in the ecosystem your team already knows.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "postgres", note: "sqlx-style compile-time-checked SQL against Postgres extends Rust's 'if it compiles it works' guarantee to the query layer." },
      { techId: "grpc", note: "Tonic (gRPC on the same Tokio/tower stack as Axum) makes Rust services first-class citizens in a typed service mesh." },
      { techId: "redis", note: "A common shape: Rust for the hot path, Redis for shared state — both obsessed with microseconds." },
    ],
    commitments: [
      {
        need: "You now fund a long onboarding ramp for every hire, indefinitely",
        why: "The borrow checker plus async lifetimes takes months to internalize — 'productive-tomorrow Rust web developer' is not a hiring market that exists at scale.",
      },
      {
        need: "You now own compile-time budgets in CI and the inner dev loop",
        why: "Rust build times grow with the codebase; caching infrastructure and workspace splitting become real platform work, not nice-to-haves.",
      },
      {
        need: "You now track a young async ecosystem that hasn't finished consolidating",
        why: "Axum, tower, and friends are well-run but pre-1.0 in spirit — upgrades arrive as engineering tasks with thin migration docs, not version bumps.",
      },
    ],
    tags: ["performance", "correctness", "specialist"],
  },
];
