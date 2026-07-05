import type { Tech } from "../types";

/**
 * API styles. The hidden axis here is WHO the contract serves: browsers and
 * third parties (REST, GraphQL, SOAP), your own services (gRPC), your own
 * TypeScript monorepo (tRPC), or a live connection that isn't request/response
 * at all (WebSockets/SSE). Most confusion in this category comes from
 * comparing styles that sit on different points of that axis.
 */
export const API_STYLE_TECHS: Tech[] = [
  {
    id: "rest",
    aka: ["RESTful API", "HTTP/JSON API", "Web API"],
    name: "REST / HTTP+JSON",
    category: "api-style",
    tagline: "The default everyone must justify deviating from — resource URLs, verbs, and the web's own caching.",
    description:
      "Resources addressed by URLs, manipulated with HTTP verbs, represented as JSON. Purists note that almost nobody implements Fielding's full vision (hypermedia, HATEOAS) — on the Richardson maturity model most 'REST' APIs are level 2, which is really RPC over HTTP with good manners. That's fine: the value was never the dissertation, it's that every client, proxy, gateway, cache, and developer on earth already speaks it.",
    scores: {
      performance: 6,
      devVelocity: 8,
      learningEase: 9,
      ecosystem: 10,
      scalability: 8,
      typeSafety: 4,
      opsSimplicity: 9,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "Text JSON over request/response is the baseline, not the ceiling — but HTTP caching (ETags, CDN, browser cache) gives it wins no other style gets for free.",
      typeSafety:
        "JSON over the wire is stringly-typed by default; OpenAPI + codegen claws back a typed contract, but that's tooling you must adopt and keep honest.",
      ecosystem:
        "The 10 of this category: every language, gateway, monitoring tool, and hiring pool assumes it.",
    },
    nativeScores: { cacheability: 10, streaming: 3, contractRigor: 5 },
    nativeScoreNotes: {
      cacheability:
        "HTTP caching semantics (ETags, cache-control, CDNs) are REST's superpower — the web itself is the cache.",
      streaming:
        "Request/response at heart; SSE bolts on for one-way push.",
      contractRigor:
        "OpenAPI makes contracts possible; culture makes them optional.",
    },
    strengths: [
      "Universal interoperability — the only style you can hand to an unknown third party without a conversation",
      "HTTP caching is a superpower: ETags, Cache-Control, and CDNs accelerate GETs with zero application code",
      "Statelessness makes horizontal scaling boring — any instance can serve any request",
      "Debuggable with curl and readable in any browser dev-tools pane",
      "OpenAPI gives contracts, docs, and client codegen when you invest in it",
    ],
    weaknesses: [
      "Over-fetching and under-fetching: endpoints return fixed shapes, so clients get too much or make N calls",
      "No type safety without discipline — the OpenAPI spec drifts from the code unless generated from it",
      "Endpoint proliferation as clients' needs diverge ('/orders?view=mobile-summary' is a smell)",
      "Real-time push is outside the model entirely — you'll bolt on polling or a second transport",
    ],
    chooseWhen: [
      "You're exposing an API to third parties, partners, or an unknown future — universality wins",
      "The API is public-facing and read-heavy — HTTP caching does the scaling for you",
      "You're starting anything and don't have a specific reason to deviate — it's the default for a reason",
    ],
    avoidWhen: [
      "Many client types need visibly different slices of the same data and endpoint variants are multiplying",
      "Service-to-service chatter inside your own estate is the dominant traffic — typed binary contracts serve that better",
    ],
    alternatives: [
      { techId: "graphql", note: "Switch when divergent client data needs are causing real endpoint sprawl — not before, because you'll trade HTTP caching away for it.", effort: "moderate" },
      { techId: "grpc", note: "For internal service-to-service calls where you control both ends and want typed contracts and speed.", effort: "moderate" },
      { techId: "trpc", note: "If both ends are TypeScript in one repo, tRPC deletes the API-contract layer entirely.", effort: "moderate" },
      { techId: "soap", note: "Only when the counterparty demands it — large B2B/EDI estates still speak WSDL and will for years.", effort: "rewrite" },
    ],
    pairsWellWith: [
      { techId: "cdn-cache", note: "Cacheable GETs with proper headers turn a CDN into your read-scaling tier for free." },
      { techId: "jwt-auth", note: "Stateless tokens on stateless requests — the standard pairing for APIs consumed by SPAs and services." },
    ],
    notInterchangeableWith: [
      { techId: "websockets", note: "REST is request/response semantics; WebSockets is a persistent push transport. 'Should we use WebSockets instead of REST?' is usually a category error — most systems need both, for different traffic." },
    ],
    commitments: [
      {
        need: "You now own contract fidelity between the OpenAPI spec and the code",
        why: "Nothing in the protocol enforces the contract — either the spec is generated from code and gated in CI, or it quietly becomes fiction.",
      },
      {
        need: "You now own a versioning and deprecation policy",
        why: "Fixed response shapes mean breaking changes break clients you can't see — a public REST contract is forever until you run a deliberate deprecation process.",
      },
      {
        need: "You must treat cache headers as correctness, not configuration",
        why: "HTTP caching is the superpower you chose this for — and a wrong Cache-Control or missing Vary serves stale or private responses at CDN scale.",
      },
    ],
    tags: ["default-choice", "http", "public-api"],
  },
  {
    id: "graphql",
    aka: ["Apollo (dominant ecosystem)", "Relay"],
    name: "GraphQL",
    category: "api-style",
    tagline: "Clients query exactly what they need — and the server pays for letting them ask anything.",
    description:
      "A typed query language where clients specify the exact shape of data they want and one endpoint resolves it. It solves REST's over/under-fetching precisely, which matters when many clients (web, mobile, partners) need divergent slices of the same graph. The bill arrives on the server: resolver complexity, N+1 query patterns, per-field authorization, and the loss of plain HTTP caching, because everything is a POST to /graphql.",
    scores: {
      performance: 5,
      devVelocity: 6,
      learningEase: 4,
      ecosystem: 7,
      scalability: 7,
      typeSafety: 8,
      opsSimplicity: 4,
      maturity: 7,
    },
    scoreNotes: {
      performance:
        "Fewer round-trips for composite views, but resolvers fan out into N+1 database queries unless you build DataLoader-style batching — and HTTP/CDN caching is largely forfeit.",
      devVelocity:
        "A tale of two teams: consumers fly (self-service queries, no endpoint requests), the server team pays in resolvers, batching, and query-cost policing.",
      opsSimplicity:
        "One endpoint hides wildly variable query cost — you now own depth limits, cost analysis, persisted queries, and per-field tracing.",
    },
    nativeScores: { cacheability: 3, streaming: 6, contractRigor: 8 },
    nativeScoreNotes: {
      cacheability:
        "POST-to-one-endpoint defeats HTTP caching; persisted queries and client caches claw some back.",
      contractRigor:
        "The schema is mandatory — that's the point.",
    },
    strengths: [
      "Clients self-serve: new views need no new endpoints, mobile stops waiting on backend tickets",
      "The schema is a real typed contract with introspection — codegen and tooling (GraphiQL, type generation) are excellent",
      "Aggregates multiple backend services behind one graph — the strongest BFF/consolidation story in the category",
      "Precise payloads matter on constrained mobile networks",
    ],
    weaknesses: [
      "N+1 resolution is the default failure mode; DataLoader-style batching is mandatory infrastructure, not an optimization",
      "Everything is a POST: HTTP and CDN caching are gone, replaced by client-cache libraries and persisted queries you must build",
      "Authorization moves from 'per endpoint' to 'per field reachable via any path' — much harder to reason about and audit",
      "Arbitrary client queries mean arbitrary server cost — malicious or naive queries need active defense",
    ],
    chooseWhen: [
      "Multiple client types with genuinely divergent data needs are driving REST endpoint sprawl",
      "You're building a BFF layer consolidating several internal services for frontend teams",
      "The org is large enough that client teams outpacing backend ticket queues is a real bottleneck",
    ],
    avoidWhen: [
      "One web client talks to one backend you also own — you'll pay the resolver-and-caching tax for flexibility nobody uses",
      "The API is public and read-heavy where CDN caching is your scaling strategy",
      "The team hasn't internalized N+1 batching and query-cost controls — the failure modes are subtle and arrive under load",
    ],
    alternatives: [
      { techId: "rest", note: "If the client diversity that justifies GraphQL never materialized, plain REST returns the caching and simplicity you gave up.", effort: "moderate" },
      { techId: "trpc", note: "If 'typed client calls' was the actual appeal and everything is TypeScript, tRPC delivers that with none of the resolver machinery.", effort: "moderate" },
      { techId: "grpc", note: "If the consumers are your own services rather than UIs, typed RPC fits better than a query language.", effort: "rewrite" },
    ],
    pairsWellWith: [
      { techId: "react", note: "The ecosystem GraphQL grew up in — Apollo/Relay-style clients with normalized caches are mature here." },
      { techId: "microservices", note: "As the consolidation layer: one graph federating many services is GraphQL's strongest enterprise use case." },
    ],
    frictionWith: [
      { techId: "cdn-cache", note: "POSTs to a single endpoint are invisible to HTTP caches — GraphQL trades away exactly what makes CDN caching work." },
    ],
    notInterchangeableWith: [
      { techId: "grpc", note: "Both are 'not REST', so they get compared — but gRPC is typed RPC between services you control, GraphQL is query flexibility for client UIs. Different consumers, different problems." },
    ],
    commitments: [
      {
        need: "You now own per-field authorization",
        why: "Clients compose their own queries, so 'is this endpoint allowed' becomes 'is every field in this query allowed'.",
      },
      {
        need: "You now need query cost controls (depth limits, complexity budgets)",
        why: "The flexibility you gave clients includes the flexibility to write a query that takes down the database.",
      },
      {
        need: "You now own N+1 batching infrastructure",
        why: "Resolvers execute per node — without DataLoader-style batching, one composite query fans out into hundreds of database round-trips.",
      },
      {
        need: "You now own the caching story HTTP used to give you for free",
        why: "Everything is a POST to one endpoint, so client caches, persisted queries, and cache hints are systems you build and maintain.",
      },
    ],
    tags: ["query-language", "bff", "client-driven"],
  },
  {
    id: "grpc",
    aka: ["Protocol Buffers", "protobuf"],
    name: "gRPC",
    category: "api-style",
    tagline: "Typed binary contracts between your own services — the browser needs an interpreter.",
    description:
      "Google's RPC framework: define services in Protocol Buffers, generate clients and servers in any language, communicate in compact binary over HTTP/2 with first-class streaming. Inside a service estate you control, it's the performance and type-safety benchmark of this category. Its boundary is the browser, which can't speak native gRPC — reaching web clients means gRPC-Web plus a proxy layer, at which point many teams just expose REST at the edge.",
    scores: {
      performance: 10,
      devVelocity: 6,
      learningEase: 4,
      ecosystem: 6,
      scalability: 9,
      typeSafety: 9,
      opsSimplicity: 5,
      maturity: 8,
    },
    scoreNotes: {
      performance:
        "Binary protobuf over multiplexed HTTP/2 with streaming — the category's ceiling for service-to-service throughput and latency.",
      typeSafety:
        "Contract-first .proto files with codegen in every mainstream language; the schema can't drift from the client the way an OpenAPI doc can.",
      opsSimplicity:
        "Long-lived HTTP/2 connections confuse L4 load balancers (one pod gets everything), and binary payloads defeat curl-and-eyeball debugging — you'll want grpcurl and L7-aware infrastructure.",
    },
    nativeScores: { cacheability: 4, streaming: 10, contractRigor: 10 },
    nativeScoreNotes: {
      streaming:
        "Unary, server-, client-, and bidirectional streaming are all first-class.",
      contractRigor:
        "Proto files plus codegen: the contract IS the artifact.",
    },
    strengths: [
      "Fastest wire format in the category: binary serialization, HTTP/2 multiplexing, connection reuse",
      "Contract-first discipline: the .proto file is the single source of truth, with well-defined field-numbering rules for safe evolution",
      "Streaming is native — client, server, and bidirectional — not a bolted-on second transport",
      "Polyglot codegen makes it the lingua franca for mixed-language service estates",
      "Deadlines, cancellation, and typed errors are protocol features, not conventions",
    ],
    weaknesses: [
      "No native browser support — web clients require gRPC-Web and a translating proxy (Envoy), a whole extra moving part",
      "Binary payloads aren't human-readable: debugging requires tooling, not just dev-tools",
      "HTTP/2 load balancing needs L7 awareness — naive infrastructure sends all traffic down one connection",
      "Contract-first ceremony is overhead when one team owns both ends and iterates rapidly",
    ],
    chooseWhen: [
      "Service-to-service communication inside an estate you control, especially across languages",
      "Latency and throughput between services are measured requirements, not vibes",
      "Streaming (telemetry, live feeds, long-running operations) is part of the actual workload",
    ],
    avoidWhen: [
      "Browsers or third parties are the primary consumers — the proxy tax and unfamiliarity outweigh the wins",
      "A small monolith-plus-SPA system — there's no service-to-service traffic to optimize",
    ],
    alternatives: [
      { techId: "rest", note: "At the public edge, REST's universality beats gRPC's speed — many estates run gRPC inside and REST outside.", effort: "moderate" },
      { techId: "graphql", note: "If the consumers are diverse client UIs rather than services, a query layer serves them better than fixed RPC methods.", effort: "rewrite" },
      { techId: "websockets", note: "For browser-facing streaming specifically — gRPC streams don't reach browsers without the proxy layer.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "microservices", note: "The canonical pairing: typed contracts and codegen claw back the compile-time safety the network took away." },
      { techId: "kubernetes", note: "K8s-native L7 tooling (Envoy, service meshes) solves gRPC's load-balancing quirks — these ecosystems co-evolved." },
      { techId: "go-http", note: "Go and gRPC are both Google-culture tools; Go's gRPC support is arguably the reference implementation." },
    ],
    notInterchangeableWith: [
      { techId: "graphql", note: "Commonly confused because both are 'the modern alternative to REST'. gRPC optimizes calls between services you control; GraphQL optimizes flexibility for client UIs you don't. Swapping one in for the other's job hurts." },
    ],
    commitments: [
      {
        need: "You now own L7-aware load balancing",
        why: "Long-lived HTTP/2 connections pin traffic to whichever instance accepted them — naive L4 balancing sends everything down one pipe.",
      },
      {
        need: "You now own proto governance and field-number discipline",
        why: "The .proto file is a cross-team contract; a reused field number or careless rename corrupts messages silently across every consumer.",
      },
      {
        need: "You need a debugging toolchain beyond curl",
        why: "Binary frames mean grpcurl, server reflection, and interceptor logging are day-one infrastructure, not nice-to-haves.",
      },
      {
        need: "You must run a translation layer for any browser consumer",
        why: "Browsers can't speak native gRPC — gRPC-Web plus an Envoy-class proxy becomes a permanent piece of your edge.",
      },
    ],
    tags: ["rpc", "binary", "service-to-service", "streaming"],
  },
  {
    id: "trpc",
    name: "tRPC",
    category: "api-style",
    ecosystem: "node",
    tagline: "Coupling as a feature: the API layer dissolves into TypeScript type inference.",
    description:
      "End-to-end typesafe APIs for TypeScript: the client imports the server's router type, and every procedure call is fully typed with zero codegen, zero schema files, and zero drift — rename a field on the server and the frontend fails to compile. The premise is total: TypeScript on both ends, ideally in one monorepo. That coupling is not a limitation to engineer around; it IS the product, and it stops making sense the moment a non-TS consumer appears.",
    scores: {
      performance: 6,
      devVelocity: 9,
      learningEase: 7,
      ecosystem: 4,
      scalability: 4,
      typeSafety: 10,
      opsSimplicity: 7,
      maturity: 5,
    },
    scoreNotes: {
      typeSafety:
        "The category's 10: not a generated contract that can drift, but literally the same types at both ends, checked by the compiler on every build.",
      scalability:
        "The '4' is organizational: the shared-types model assumes one repo and TS everywhere. Multiple teams, polyglot services, or external consumers all break the premise.",
      learningEase:
        "Trivial for a TypeScript developer — the '7' discounts for advanced inference errors, which can be genuinely cryptic when something goes wrong deep in a router type.",
    },
    nativeScores: { cacheability: 5, streaming: 7, contractRigor: 9 },
    nativeScoreNotes: {
      cacheability:
        "GET-mode queries can use HTTP caching, but it isn't the default posture.",
      contractRigor:
        "Inferred rather than declared — rigorous inside the monorepo, invisible outside it.",
    },
    strengths: [
      "Change a server type, watch every affected client call site light up red — refactoring across the stack becomes compile-time safe",
      "No codegen step, no schema file, no OpenAPI drift — the contract is the code",
      "Startlingly fast iteration for small full-stack TS teams: autocomplete from database to component",
      "Thin runtime — it's a typed convention over HTTP, not a heavy framework",
    ],
    weaknesses: [
      "TypeScript-only, by design — the first Python service, mobile team, or external partner needs a completely separate API",
      "Monorepo-shaped: client and server sharing types across repos or versions gets painful fast",
      "No language-neutral contract artifact to hand to another team, document, or govern",
      "Young ecosystem and small hiring signal compared to REST/GraphQL",
    ],
    chooseWhen: [
      "Full-stack TypeScript in a monorepo (Next.js app + API is the archetype) with one team owning both ends",
      "The 'API' is really your own frontend talking to your own backend — internal seam, not a product",
      "Iteration speed on a small team matters more than contract governance",
    ],
    avoidWhen: [
      "Any current or plausible consumer isn't TypeScript — mobile native, partner integrations, other services",
      "The API is a public product needing versioning, documentation, and a stable contract",
      "Teams own the frontend and backend separately and want an explicit contract between them",
    ],
    alternatives: [
      { techId: "rest", note: "The moment a non-TS consumer appears, expose REST — many teams run tRPC for their own frontend and REST for everyone else.", effort: "moderate" },
      { techId: "graphql", note: "When client diversity grows beyond one TS app, GraphQL offers typed flexibility that doesn't require TypeScript on the client.", effort: "moderate" },
      { techId: "grpc", note: "The polyglot equivalent of the same instinct: typed contracts with codegen instead of shared source types.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "nextjs", note: "The native habitat: one monorepo, one deploy, typed calls from server component to API procedure." },
      { techId: "prisma", note: "Database types flow through Prisma into tRPC procedures out to the client — the full-stack TS type pipeline." },
      { techId: "react", note: "TanStack Query integration gives typed hooks per procedure out of the box." },
    ],
    commitments: [
      {
        need: "You now own the monorepo discipline that makes shared types work",
        why: "The contract is source-level type inference — split the repos or version the two ends independently and the entire premise collapses.",
      },
      {
        need: "You must guard the TypeScript-only boundary",
        why: "The first mobile team, Python service, or partner integration needs a second, parallel API — someone has to see that coming and plan the seam.",
      },
      {
        need: "You now own build-time coupling between frontend and backend",
        why: "Every server type change recompiles the client — the two ends must be reviewed and shipped as one unit, which is a process commitment, not just tooling.",
      },
    ],
    tags: ["typescript", "monorepo", "end-to-end-types"],
  },
  {
    id: "soap",
    aka: ["WS-*", "WSDL web services", "XML web services"],
    name: "SOAP / WS-*",
    category: "api-style",
    tagline: "The contract-first enterprise stack everyone mocks — and half of B2B still runs on.",
    description:
      "XML messaging with formal WSDL contracts and the WS-* extensions: WS-Security for message-level signing and encryption, WS-ReliableMessaging for delivery guarantees, WS-Transaction for distributed transactions. These solved real enterprise problems — federated security, non-repudiation, contract governance — a decade before REST tooling addressed any of them, which is exactly why banking, insurance, logistics, and EDI estates still run on it. Nobody starts new public APIs here; plenty of businesses are built on the ones that exist.",
    scores: {
      performance: 3,
      devVelocity: 3,
      learningEase: 3,
      ecosystem: 2,
      scalability: 6,
      typeSafety: 8,
      opsSimplicity: 4,
      maturity: 10,
    },
    scoreNotes: {
      ecosystem:
        "Low and falling: tooling is in maintenance mode (WCF's successor story on .NET is a community project), and each hiring year the pool shrinks. The installed base is vast; the momentum is negative.",
      typeSafety:
        "WSDL + XSD is a genuinely rigorous machine-validated contract — schema validation catches malformed messages before your code sees them. The tooling around it aged; the idea didn't.",
      maturity:
        "Twenty-five years of production hardening in the most demanding compliance environments. Nothing in this category is more proven.",
    },
    nativeScores: { cacheability: 4, streaming: 1, contractRigor: 10 },
    nativeScoreNotes: {
      contractRigor:
        "WSDL + XSD — nothing since has matched the formality, for better and worse.",
    },
    strengths: [
      "WSDL contracts are formal, machine-validated, and generate strongly-typed clients — contract-first before it was cool",
      "WS-Security does message-level security (signing, encryption, non-repudiation) that transport-level TLS can't — parts of finance and healthcare still require it",
      "Built-in standards for reliability and distributed transactions that REST never standardized",
      "Vast production estates: if you integrate with banks, insurers, carriers, or EDI VANs, you will meet it and it will work",
    ],
    weaknesses: [
      "XML envelope verbosity: payloads and parsing costs are multiples of JSON equivalents",
      "Tooling decay — modern frameworks treat SOAP support as a legacy checkbox, and debugging WS-Security failures is a dark art",
      "Hiring: engineers who know the WS-* stack well are retiring faster than they're being replaced",
      "The WS-* spec family's complexity meant interop between vendor stacks was never as smooth as the standards promised",
    ],
    chooseWhen: [
      "The counterparty's contract IS SOAP — B2B, EDI, government, and banking integrations don't offer you a vote",
      "Message-level security or formal contract governance is a regulatory requirement, not a preference",
      "You're maintaining or extending an existing estate where it's working — ripping out functioning SOAP for fashion is negative-value work",
    ],
    avoidWhen: [
      "Any greenfield API where you control both ends — every modern option is cheaper to build and staff",
      "Consumers are browsers or mobile apps — the XML/tooling overhead has no payoff there",
    ],
    alternatives: [
      { techId: "rest", note: "The migration target for SOAP estates being modernized — usually via a REST facade in front of the SOAP service, strangler-style, not a rewrite.", effort: "rewrite" },
      { techId: "grpc", note: "The spiritual successor for contract-first, typed, machine-to-machine integration — protobuf is WSDL's discipline with a fraction of the weight.", effort: "rewrite" },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "The .NET world carries the largest WCF/SOAP legacy; CoreWCF exists precisely to keep those estates alive on modern runtimes." },
      { techId: "spring-boot", note: "JAX-WS/Spring-WS tooling remains the JVM's workmanlike path for maintaining SOAP integrations." },
    ],
    notInterchangeableWith: [
      { techId: "rest", note: "Teams treat 'replace SOAP with REST' as a format swap. It isn't: WS-Security, reliable messaging, and formal contracts have no direct REST equivalent — replacing them means re-solving those problems, not just re-serializing." },
    ],
    commitments: [
      {
        need: "You now own a shrinking-skills succession plan",
        why: "WS-* expertise is retiring faster than it's being replaced — every year, the person who can debug a WS-Security fault gets harder to hire.",
      },
      {
        need: "You must keep aging toolchains alive through platform upgrades",
        why: "Framework support is in maintenance mode (CoreWCF, JAX-WS) — every runtime upgrade now includes 'does our SOAP stack still work' as a standing test item.",
      },
      {
        need: "You now own certificate and WSDL lifecycle coordination with counterparties",
        why: "Message-level security means key rotations, WSDL revisions, and schema changes are multi-party projects with partner calendars attached.",
      },
    ],
    tags: ["enterprise", "b2b", "contract-first", "legacy"],
  },
  {
    id: "websockets",
    aka: ["SSE", "SignalR", "socket.io", "server push"],
    name: "WebSockets / SSE",
    category: "api-style",
    tagline: "Persistent push for live data — a complement to request/response, never its replacement.",
    description:
      "Two transports for server push: WebSockets give a persistent bidirectional socket (chat, collaboration, live trading), Server-Sent Events give a simpler one-way stream over plain HTTP (feeds, notifications, progress). Neither is an API style you build CRUD on — they complement a request/response API for the traffic that's genuinely live. The real cost isn't the protocol, it's the connection state: every open socket is server memory and an ops obligation that stateless HTTP never made you carry.",
    scores: {
      performance: 8,
      devVelocity: 5,
      learningEase: 5,
      ecosystem: 6,
      scalability: 4,
      typeSafety: 3,
      opsSimplicity: 3,
      maturity: 8,
    },
    scoreNotes: {
      performance:
        "For push latency nothing beats an open socket — no polling, no request overhead. The '8' not '10' because every message is application-level work HTTP caching can never absorb.",
      scalability:
        "The category's hard problem: connections pin state to servers (sticky sessions or a shared broker), and broadcasting to N connected clients across M servers needs a pub/sub backplane you must build.",
      typeSafety:
        "The wire is untyped frames; there's no standard schema layer, so message contracts are whatever discipline you impose.",
      opsSimplicity:
        "Load balancers, proxies, and serverless platforms all assume short-lived requests — long-lived connections fight idle timeouts, deploys (every restart drops everyone), and autoscaling.",
    },
    nativeScores: { cacheability: 1, streaming: 10, contractRigor: 2 },
    nativeScoreNotes: {
      cacheability:
        "A persistent socket is definitionally uncacheable.",
      contractRigor:
        "The protocol says nothing about message shapes; any contract is a convention you build and enforce yourself.",
    },
    strengths: [
      "True server push: clients see changes in milliseconds without polling waste",
      "WebSockets' bidirectional channel is the only real option for chat, collaborative editing, and live multiplayer interactions",
      "SSE is the underrated half: plain HTTP, automatic reconnection built into the browser API, works through ordinary infrastructure — enough for most 'live updates' needs",
      "Eliminates polling storms that hammer APIs for data that rarely changed",
    ],
    weaknesses: [
      "Connection state is an ops burden: sticky sessions or a broker backplane, drain-on-deploy strategies, idle-timeout fights with every proxy in the path",
      "Fan-out across horizontally scaled servers requires pub/sub infrastructure (Redis, a broker) — broadcast is not built in",
      "No standard message schema, versioning, or contract story — you invent your own protocol inside the pipe",
      "Reconnection and missed-message recovery is your application logic (SSE's Last-Event-ID helps; raw WebSockets gives you nothing)",
    ],
    chooseWhen: [
      "The product is visibly live: chat, collaboration, dashboards, tracking, trading — and users notice staleness in seconds",
      "Server-to-client notification frequency makes polling wasteful or too slow",
      "Bidirectional interaction (client sends events on the same channel) rules out SSE — otherwise start with SSE and keep the simplicity",
    ],
    avoidWhen: [
      "The 'real-time' requirement is actually 'refresh within a minute' — polling or SSE is a fraction of the complexity",
      "Your hosting is serverless functions — execution time limits and statelessness fight persistent connections head-on",
      "The team wants it for regular CRUD calls — request/response over a socket re-invents HTTP badly",
    ],
    alternatives: [
      { techId: "rest", note: "Short-interval polling of a cacheable REST endpoint is unglamorous and covers a surprising share of 'real-time' requirements with zero new infrastructure.", effort: "moderate" },
      { techId: "grpc", note: "For service-to-service streaming (not browsers), gRPC streams give you push with typed contracts included.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "rest", note: "The standard architecture: REST for commands and queries, a socket/stream for the live updates — each transport doing the job it's shaped for." },
      { techId: "redis", note: "Redis pub/sub is the classic backplane for fanning messages out to sockets held across many server instances." },
    ],
    frictionWith: [
      { techId: "serverless-functions", note: "Long-lived connections versus short-lived, stateless execution is a head-on collision; you'll end up on a managed gateway service doing the socket-holding for you." },
    ],
    notInterchangeableWith: [
      { techId: "rest", note: "A push transport and a request/response API style solve different halves of client communication. Systems that moved all traffic onto sockets rebuilt routing, caching, and error semantics by hand — HTTP already had them." },
    ],
    commitments: [
      {
        need: "You now own connection-state infrastructure",
        why: "Every open socket is server memory pinned to an instance — sticky sessions or a broker backplane, plus a drain strategy for every deploy.",
      },
      {
        need: "You now own a fan-out backplane",
        why: "Broadcasting to clients spread across N servers isn't built in — Redis pub/sub or a broker becomes mandatory the day you scale past one instance.",
      },
      {
        need: "You must design your own message protocol and its versioning",
        why: "The pipe carries untyped frames — message shapes, contracts, and evolution rules are conventions you invent and enforce yourself.",
      },
      {
        need: "You now own reconnection and missed-message recovery",
        why: "Networks drop and deploys restart — clients need resume logic and the server needs replay or gap detection, all of it application code.",
      },
    ],
    tags: ["real-time", "push", "transport"],
  },
];
