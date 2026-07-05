import type { Tech } from "../types";

/**
 * Caching. The layered mental model is the whole lesson: browser → CDN →
 * distributed cache → in-process cache → database. These are layers that
 * compose, not competitors — each one absorbs reads the layers behind it
 * never see, and each has a different answer to the only hard question in
 * caching: how does it get invalidated? Scores are relative within this
 * category.
 */
export const CACHING_TECHS: Tech[] = [
  {
    id: "redis",
    name: "Redis",
    category: "caching",
    tagline: "The default distributed cache that keeps volunteering for extra jobs — until it's holding your app together.",
    description:
      "An in-memory data-structure server that won the distributed-cache slot so completely that 'add a cache' means 'add Redis'. Its superpower is that it's never just a cache: sorted sets give you leaderboards and rate limiters, lists give you queues, SETNX gives you distributed locks, pub/sub gives you messaging. That scope creep cuts both ways — one dependency solving five problems is efficient right up until the 'cache' is also your queue, your locks, and your session store, and a restart of the thing you classified as disposable takes the whole platform down with it.",
    scores: {
      performance: 8,
      devVelocity: 8,
      learningEase: 7,
      ecosystem: 10,
      scalability: 9,
      typeSafety: 4,
      opsSimplicity: 5,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "Sub-millisecond, but across a network hop — an order of magnitude slower than in-process memory. People benchmark the dictionary and deploy the network call.",
      ecosystem:
        "The category maximum: every language, every framework, every cloud has first-class Redis support, and every cloud sells it managed.",
      opsSimplicity:
        "A single node is trivial; the '5' prices in what production actually needs — persistence choices, memory/eviction management, and Sentinel or Cluster for HA. Managed offerings raise this to a 7.",
      typeSafety:
        "String keys, serialized blobs, and data structures with no schema — typos and serialization drift are runtime discoveries.",
    },
    strengths: [
      "Shared cache across all app instances: one invalidation, everyone consistent — the property in-process caches can't offer",
      "Data structures as a toolbox: rate limiting, leaderboards, distributed locks, queues, and pub/sub without new infrastructure",
      "Sub-millisecond latency with battle-tested predictability at very high throughput",
      "Universal ecosystem — the beaten path is wide, paved, and lit",
      "TTLs and eviction policies built in: cache semantics are native, not bolted on",
    ],
    weaknesses: [
      "'Redis is holding your app together' syndrome: the disposable cache quietly accretes queues, locks, and sessions until it's the most critical stateful system you run — with the least ceremony around it",
      "Single-threaded command execution: one slow command (KEYS in prod, a huge SMEMBERS) stalls everyone behind it",
      "Memory is the budget: datasets that outgrow RAM force eviction decisions applications rarely handle gracefully",
      "The 2024 license drama (and the Valkey fork) added a governance question to what was a default choice",
    ],
    chooseWhen: [
      "Multiple app instances need a consistent shared cache — this is the moment in-process caching stops being enough",
      "You need cache-adjacent primitives (rate limits, locks, ephemeral counters) and want one well-understood dependency for all of them",
      "Session state or hot lookups back a horizontally scaled service",
    ],
    avoidWhen: [
      "A single-instance app — an in-process cache gives faster reads with zero infrastructure; buy the network hop only when instances multiply",
      "The cached data is about to become load-bearing state — if losing it is an outage, you need a database's durability posture, not a cache's",
    ],
    alternatives: [
      { techId: "in-process-cache", note: "For one instance, or per-instance caching of rarely-changing data — nanosecond reads and no new infrastructure. Graduate to Redis when instance count makes coherence the problem.", effort: "moderate" },
      { techId: "memcached", note: "If you truly need only get/set at high throughput, Memcached's multi-threaded simplicity is arguably purer — but Redis's ubiquity usually wins anyway.", effort: "drop-in" },
      { techId: "rabbitmq", note: "The honest swap when Redis lists have become your job queue: acknowledgements, dead-letter queues, and delivery guarantees are a broker's actual job.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "postgres", note: "The canonical division of labor: Postgres owns truth, Redis absorbs the hot read paths in front of it." },
      { techId: "session-auth", note: "The standard answer to 'where do sessions live when the app scales horizontally'." },
      { techId: "microservices", note: "Shared cache, rate limiting, and distributed locks — the utility belt distributed services keep reaching for." },
    ],
    notInterchangeableWith: [
      {
        techId: "in-process-cache",
        note: "People benchmark a dictionary read (nanoseconds) and deploy a network call (a millisecond) — three orders of magnitude apart. One is shared and consistent across instances; the other is private and duplicated. Which property you need decides the layer; they're not sizes of the same thing.",
      },
      {
        techId: "redis-streams",
        note: "Same binary, different architectural commitment: caching is disposable by definition; a stream consumed by other services is load-bearing state. Running both on one instance is exactly how the 'cache' becomes unrestartable.",
      },
    ],
    commitments: [
      {
        need: "You now own an invalidation strategy per cached shape",
        why: "Every cache is a bet about staleness; someone must decide TTLs and who busts what, when.",
      },
      {
        need: "You now own the scope-creep boundary",
        why: "The cache will volunteer to be your queue, your locks, and your sessions — someone must decide what's allowed on it before a restart of 'disposable' infrastructure becomes an outage.",
      },
      {
        need: "You must treat memory as a hard budget with an eviction owner",
        why: "When the dataset outgrows RAM, the eviction policy decides what silently disappears — that choice needs an owner before it's made under load.",
      },
      {
        need: "You now own an HA posture (Sentinel, Cluster, or a managed tier)",
        why: "Once the cache sits in every request path, a single node is a single point of failure for latency — someone must architect and actually test the failover.",
      },
    ],
    tags: ["distributed-cache", "data-structures", "default-choice"],
  },
  {
    id: "memcached",
    name: "Memcached",
    category: "caching",
    tagline: "A cache that refuses to be anything else — deliberate simplicity as a feature, not a gap.",
    description:
      "The original distributed memory cache: get, set, delete, TTLs, and essentially nothing else, by design and on principle. Its multi-threaded architecture squeezes more raw throughput from a big multi-core box than single-threaded Redis, and its feature list hasn't grown in a decade because it isn't supposed to. The teaching value is the philosophy: a tool that can't become your queue or your lock server can never be misused as one. In practice Redis still wins most default choices — not because Memcached is worse at caching, but because teams (rightly) suspect they'll eventually want the extra structures.",
    scores: {
      performance: 9,
      devVelocity: 6,
      learningEase: 9,
      ecosystem: 6,
      scalability: 8,
      typeSafety: 3,
      opsSimplicity: 7,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "Multi-threaded where Redis is single-threaded: on large multi-core machines doing pure get/set, it delivers more throughput per box — a fact that surprises people who assume newer means faster.",
      learningEase:
        "The entire mental model fits in a paragraph: it's a network hash map with TTLs. Nothing else to learn because there is nothing else.",
      maturity:
        "Unchanged for a decade because it's finished — the rare piece of infrastructure with nothing left to want from its own mission statement.",
      ecosystem:
        "Every language has a client, but the momentum, managed offerings, and tutorials have consolidated on Redis.",
    },
    strengths: [
      "Multi-threaded: scales up with cores, making one big node do work Redis needs a cluster for",
      "Can't scope-creep: no persistence, no structures, no pub/sub — it can never quietly become load-bearing state",
      "Predictable memory behavior via slab allocation, and LRU eviction that just works",
      "Operationally boring in the best way: two decades of production hardening, nothing to tune, nothing to upgrade for",
    ],
    weaknesses: [
      "Values are opaque blobs: no data structures, no atomic operations beyond incr/decr, no pub/sub — the moment you need more, you're adding Redis anyway",
      "No persistence and no replication in core: a restart is a cold cache and a thundering herd against your database (mitigable, but your job)",
      "Client-side consistent hashing does the distribution: cluster behavior lives in your client library, not the server",
      "Shrinking mindshare: fewer managed offerings, fewer new hires who've used it, fewer blog posts when something's odd",
    ],
    chooseWhen: [
      "The workload is purely get/set at high throughput — HTML fragments, rendered API responses, session blobs — and you want maximum cache per dollar",
      "You want a cache that structurally cannot accrete responsibilities — simplicity as an architectural guardrail",
      "Very large flat caches on big boxes, where its multi-threading and memory efficiency outwork Redis per node",
    ],
    avoidWhen: [
      "You'll plausibly want data structures, persistence, or pub/sub within the year — starting on Redis beats running both",
      "The team knows Redis and doesn't know this — a second cache technology needs a better reason than benchmark purity",
    ],
    alternatives: [
      { techId: "redis", note: "The default for a reason: 90% of Memcached's caching ability plus everything it deliberately lacks. Choose Memcached on principle or on throughput math; choose Redis on ecosystem gravity.", effort: "drop-in" },
      { techId: "in-process-cache", note: "If the deployment is a single instance, skip the network cache layer entirely.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "mysql", note: "The classic pairing that scaled the 2000s web — Memcached in front of MySQL is the original cache-aside architecture, still sound." },
      { techId: "monolith", note: "A horizontally scaled monolith with a dumb shared cache is a proven, boring, fast architecture." },
    ],
    commitments: [
      {
        need: "You now own cold-start and stampede protection",
        why: "No persistence means every restart is an empty cache and a thundering herd at the database — request coalescing and warm-up are your application's job.",
      },
      {
        need: "You now own cluster topology in the client",
        why: "Distribution is client-side consistent hashing — adding a node, choosing a hashing scheme, and keeping client configs in sync across services is your work, not the server's.",
      },
      {
        need: "You must plan for the second-system moment",
        why: "The day you need pub/sub, data structures, or persistence, you'll be running Redis alongside — decide the boundary now or plan the migration later.",
      },
    ],
    tags: ["pure-cache", "multi-threaded", "deliberately-simple"],
  },
  {
    id: "in-process-cache",
    name: "In-Process Memory Cache",
    category: "caching",
    tagline: "A dictionary in your app — the fastest cache you'll ever use and the first one you should reach for.",
    description:
      "Caching inside your application's own memory: IMemoryCache in .NET, Caffeine on the JVM, lru-cache in Node, or honestly a ConcurrentDictionary with a timestamp. Reads are nanoseconds — no network, no serialization, no infrastructure, no new failure mode. It's the right first cache for any monolith. The costs arrive with horizontal scale: every instance holds its own private copy (multiplying memory and database warm-up load), and invalidation across instances is the problem that eventually sends you to Redis — instance A updates a record while instance B cheerfully serves the stale version.",
    scores: {
      performance: 10,
      devVelocity: 9,
      learningEase: 9,
      ecosystem: 8,
      scalability: 3,
      typeSafety: 8,
      opsSimplicity: 10,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "Nanosecond reads with zero serialization — no network cache is within three orders of magnitude. This is the number people accidentally quote when justifying Redis.",
      scalability:
        "The '3' is the whole story: per-instance duplication and no cross-instance invalidation. One instance: perfect. Ten instances: ten disagreeing caches.",
      typeSafety:
        "The sleeper high score: you cache real typed objects in your own language — no serialization boundary, no stringly-typed keys, and the compiler still sees everything.",
      opsSimplicity:
        "It is literally your app. Nothing to deploy, monitor, secure, or page anyone about.",
    },
    strengths: [
      "The fastest possible cache, full stop — no network hop, no serialization, no marshaling",
      "Zero infrastructure: no cluster, no connection strings, no new dashboard, no new bill",
      "Caches live typed objects — the whole class of serialization bugs doesn't exist",
      "Built into every mature framework (IMemoryCache, Caffeine, lru-cache) with TTLs and size limits included",
      "The correct first cache: prove caching helps at all before buying infrastructure for it",
    ],
    weaknesses: [
      "Per-instance duplication: N instances hold N copies and independently warm them against your database",
      "Cross-instance invalidation doesn't exist: after a write, other instances serve stale data until their TTLs expire — the bug users report as 'sometimes it shows the old value'",
      "Competes with your application for heap; oversized caches surface as GC pressure and OOMs in the app's own vitals",
      "Restarts and deploys start cold, and every scaled-out instance re-warms independently",
    ],
    chooseWhen: [
      "A monolith or single-instance service — this should be your default cache until instance count says otherwise",
      "The data is read-heavy and tolerates bounded staleness (config, feature flags, reference/lookup tables) — short TTLs make per-instance drift harmless",
      "A latency budget so tight even a Redis round-trip is too much — cache the hottest items in-process in front of the distributed cache",
    ],
    avoidWhen: [
      "Many instances must agree after writes — per-instance caches structurally cannot, and TTL tuning only shrinks the window",
      "The cached working set is large — duplicating gigabytes into every instance's heap is the expensive way to buy incoherence",
    ],
    alternatives: [
      { techId: "redis", note: "The graduation path when instances multiply: one shared copy, one invalidation, consistency across the fleet — paid for with a network hop and an infrastructure dependency.", effort: "moderate" },
      { techId: "memcached", note: "Same graduation logic when all you need shared is get/set.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "monolith", note: "One process makes in-process caching complete, coherent, and free — often removing the need for cache infrastructure entirely." },
      { techId: "sqlite", note: "The zero-infrastructure stack: both live inside your process and neither appears on an ops dashboard." },
      { techId: "redis", note: "Not either/or — a small in-process layer for the hottest keys in front of Redis is the standard two-tier pattern in latency-sensitive services." },
    ],
    frictionWith: [
      { techId: "serverless-functions", note: "Instances are ephemeral and multiply on demand — an in-process cache barely warms before its instance dies. Cache outside the function or not at all." },
    ],
    notInterchangeableWith: [
      {
        techId: "redis",
        note: "The nanosecond dictionary and the millisecond network service are different layers, not different brands. In-process is speed without coherence; Redis is coherence at network price. Deciding which property the data needs IS the caching decision.",
      },
    ],
    commitments: [
      {
        need: "You now own a staleness window per cached item",
        why: "There is no cross-instance invalidation — every TTL is a statement about how long users may see the old value, and someone must make it consciously.",
      },
      {
        need: "You must treat cache size as part of your app's memory profile",
        why: "The cache competes with your application for heap — unbounded growth surfaces as GC pressure and OOMs in the app's own vitals, not on a cache dashboard.",
      },
      {
        need: "You now own recognizing the graduation trigger",
        why: "The first 'sometimes it shows the old value' report after scaling out means this layer is architecturally done for that data — that's a migration signal, not a TTL-tuning exercise.",
      },
    ],
    tags: ["zero-infrastructure", "first-cache", "single-instance"],
  },
  {
    id: "cdn-cache",
    name: "CDN / Edge Caching",
    category: "caching",
    tagline: "The cache that answers before your server hears the question — highest leverage, least control.",
    description:
      "Caching at the HTTP layer, in edge locations near users, before requests ever reach your infrastructure: CloudFront, Cloudflare, Fastly, Akamai. For read-heavy public traffic it's the highest-leverage cache in this catalog — a hit costs you nothing, scales past any origin you could build, and shaves continental round-trips off latency. It's driven by Cache-Control headers, which makes HTTP cache semantics an architecture skill rather than a config detail. The classic war story is invalidation: purges propagate across hundreds of edge nodes in seconds-to-minutes, which is exactly how prod serves yesterday's price after the deploy that fixed it.",
    scores: {
      performance: 9,
      devVelocity: 5,
      learningEase: 4,
      ecosystem: 8,
      scalability: 10,
      typeSafety: 2,
      opsSimplicity: 6,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "For cache hits, unbeatable — served from an edge node near the user with zero origin work. The '9' not '10' is that it only applies to cacheable (shared, GET-shaped) responses.",
      scalability:
        "The honest 10: a viral traffic spike hits the provider's global network, not your origin. No cache you operate can make that claim.",
      learningEase:
        "Cache-Control, Vary, s-maxage vs max-age, stale-while-revalidate — HTTP caching semantics are a genuinely deep, spec-lawyer skill, and mistakes ship user A's data to user B.",
      typeSafety:
        "Header strings interpreted by remote infrastructure: nothing validates that your Vary header matches how responses actually differ — the toolchain catches nothing before production does.",
    },
    strengths: [
      "Hits never touch your infrastructure: the only cache that reduces load to zero rather than merely making it faster",
      "Global edge presence solves geographic latency — the one problem no cache in your datacenter can address",
      "Absorbs traffic spikes and takes DDoS-class load off your origin as a side effect",
      "Standards-based: Cache-Control speaks to browsers, CDNs, and proxies at once — one header, three cache layers",
      "stale-while-revalidate class directives give near-perfect hit ratios on content that tolerates seconds of staleness",
    ],
    weaknesses: [
      "Invalidation latency is measured in seconds-to-minutes across hundreds of nodes — the canonical 'why is prod stale after the deploy' war story",
      "A wrong Vary or an accidentally cached Set-Cookie means serving one user's private response to another — the failure mode is a security incident, not a slow page",
      "Only helps shared, GET-shaped responses: personalized and authenticated traffic mostly sails through to origin",
      "Debugging means reasoning about which of several hundred remote caches served the response — response headers are your only telescope",
    ],
    chooseWhen: [
      "Read-heavy public traffic — content sites, product catalogs, public APIs, and every static asset you serve. This is the first cache to add, not the last",
      "A global audience with a single-region origin — no amount of origin optimization fixes the speed of light",
      "Traffic is spiky or viral-prone and you'd rather absorb it at the edge than autoscale for it",
    ],
    avoidWhen: [
      "Traffic is overwhelmingly personalized or authenticated — the hit ratio won't justify the added moving part",
      "Internal tools behind a login — there's no shared response to cache and no public edge to serve it from",
      "Correctness requires read-your-writes freshness and you can't engineer around purge latency",
    ],
    alternatives: [
      { techId: "static-edge", note: "The logical conclusion: if the whole site can be built ahead of time, host it at the edge and stop caching a dynamic origin — no invalidation problem because there's no origin to be stale against.", effort: "moderate" },
      { techId: "redis", note: "Not a substitute but the next layer inward: when responses are personalized and the CDN can't help, cache the data (not the HTTP response) behind your app.", effort: "moderate" },
    ],
    pairsWellWith: [
      { techId: "rest", note: "REST's GET/URL discipline is what makes responses cacheable at all — HTTP caching is REST's home-field advantage." },
      { techId: "nextjs", note: "SSG and ISR are architecture built around CDN semantics — the framework generates, the edge serves." },
      { techId: "static-edge", note: "Static assets on the edge platform, dynamic responses CDN-cached in front of the origin — the standard split for public products." },
    ],
    frictionWith: [
      { techId: "graphql", note: "POSTs to a single /graphql endpoint are invisible to HTTP caching — the CDN sees one uncacheable URL. Persisted queries over GET claw some back, but you're fighting the grain of both tools." },
    ],
    notInterchangeableWith: [
      {
        techId: "redis",
        note: "'We have a CDN, why add Redis?' (and vice versa) confuses layers: the CDN caches whole HTTP responses for anonymous traffic before requests reach you; Redis caches data inside your infrastructure for logic the edge can't run. Read-heavy public products usually want both — they're sequential layers, not rivals.",
      },
    ],
    commitments: [
      {
        need: "You now own HTTP cache-correctness as a security discipline",
        why: "A wrong Vary or a cached Set-Cookie serves one user's private response to another — cache-header review is incident prevention, not style feedback.",
      },
      {
        need: "You must design a purge strategy per content type",
        why: "Invalidation propagates across hundreds of edge nodes in seconds-to-minutes — deploys, price changes, and takedowns each need a plan for that window.",
      },
      {
        need: "You now own cache-key hygiene",
        why: "Query strings, headers, and cookies silently fragment or poison the cache — what counts as 'the same response' is a decision you encode and maintain.",
      },
      {
        need: "You must keep observability into a cache you don't run",
        why: "Hit ratios and stale serves happen on infrastructure you can't log into — response-header telemetry and provider analytics are your only instruments, so wire them in early.",
      },
    ],
    tags: ["edge", "http-caching", "highest-leverage"],
  },
];
