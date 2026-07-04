import type { Tech } from "../types";

/**
 * Frontend choices. The hidden axis in this category is "how much application
 * lives in the client at all" — htmx and Blazor Server sit at one end,
 * full SPAs at the other, Next.js straddles the line.
 */
export const FRONTEND_TECHS: Tech[] = [
  {
    id: "react",
    name: "React",
    category: "frontend",
    tagline: "The ecosystem default — a UI library that outsources every other decision to you.",
    description:
      "A component library (deliberately not a framework) for building UIs from declarative components. It won the ecosystem war so thoroughly that 'frontend developer' often means 'React developer'. The flip side of being just the view layer: routing, data fetching, state management, and build tooling are all decisions you now own, and the community's answers to them change every couple of years.",
    scores: {
      performance: 6,
      devVelocity: 7,
      learningEase: 6,
      ecosystem: 10,
      scalability: 8,
      typeSafety: 7,
      opsSimplicity: 7,
      maturity: 9,
    },
    scoreNotes: {
      performance:
        "The virtual DOM is fast enough for almost everything but is measurably heavier than compiled approaches like Svelte.",
      learningEase:
        "The library is small; the curve is the ecosystem — hooks rules, memoization, and picking your own router/state/data stack.",
    },
    strengths: [
      "Unmatched ecosystem: a maintained package, tutorial, and Stack Overflow answer for everything",
      "Largest frontend hiring pool in existence",
      "Composable component model that has scaled to the largest codebases on the web",
      "First-class TypeScript experience",
    ],
    weaknesses: [
      "Just the view layer — the surrounding stack is a set of decisions with churn",
      "Easy to write slow apps: re-render behavior and memoization are perennial footguns",
      "Ecosystem fashion cycles (state managers, data fetching) create legacy patterns fast",
      "Client-side rendering alone is weak for SEO/first-paint — hence the meta-framework era",
    ],
    chooseWhen: [
      "You want the safest possible frontend bet for hiring and libraries",
      "The UI is genuinely app-like: heavy interactivity, complex client state",
      "You're pairing a SPA with a separate API backend",
    ],
    avoidWhen: [
      "The site is mostly content/forms — a server-rendered approach is less machinery for the same result",
      "The team is backend-heavy and nobody wants to own a JS build pipeline",
    ],
    alternatives: [
      { techId: "vue", note: "Same component model with more decisions made for you and a gentler curve; smaller ecosystem and hiring pool." },
      { techId: "angular", note: "When you'd rather have one prescribed way to do everything than assemble your own stack." },
      { techId: "svelte", note: "When bundle size and runtime performance matter more than ecosystem depth." },
      { techId: "nextjs", note: "React plus the missing framework: routing, SSR, and data fetching decided for you — and a server to run." },
      { techId: "htmx", note: "The 'do we need a SPA at all?' option — server-rendered HTML with sprinkles of interactivity." },
    ],
    pairsWellWith: [
      { techId: "trpc", note: "With a TypeScript backend, end-to-end type inference from server to component with no codegen." },
      { techId: "rest", note: "The boring, universal pairing — every React data library speaks it." },
      { techId: "static-edge", note: "A pure SPA is static files — CDN hosting is free-tier cheap and operationally trivial." },
    ],
    tags: ["spa", "library-not-framework"],
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    tagline: "React with the decisions made — and a server runtime that can quietly become your backend.",
    description:
      "The dominant React meta-framework: file-based routing, server-side rendering, static generation, API routes, and React Server Components in one opinionated package. Its most important architectural property is that it runs on a server — which means it can BE the backend for many applications, collapsing the frontend/backend split entirely. That power is also its complexity: you're now operating a Node server (or buying into a host like Vercel), not shipping static files.",
    scores: {
      performance: 7,
      devVelocity: 8,
      learningEase: 5,
      ecosystem: 9,
      scalability: 8,
      typeSafety: 7,
      opsSimplicity: 5,
      maturity: 7,
    },
    scoreNotes: {
      learningEase:
        "You're learning React plus a framework plus a server/client mental model (Server Components) that even experienced React devs find disorienting.",
      opsSimplicity:
        "Self-hosting SSR is real server ops; the friction-free path is Vercel, which is a vendor relationship, not just a deploy target.",
    },
    strengths: [
      "SSR/SSG/ISR out of the box: fast first paint and real SEO without hand-rolling",
      "File-based routing and API routes eliminate a whole layer of stack assembly",
      "For full-stack TypeScript apps, one codebase and deploy for UI + API",
      "Huge momentum: it's the assumed default for new React projects",
    ],
    weaknesses: [
      "The server/client component boundary is a new complexity class React alone doesn't have",
      "Framework churn is real: major versions have repeatedly changed core patterns (pages → app router)",
      "Easiest path couples you to Vercel; self-hosting all features is doable but nontrivial",
      "Overkill machinery if you're building a purely internal SPA behind a login",
    ],
    chooseWhen: [
      "Public-facing product where SEO and first-paint speed are business requirements",
      "A small full-stack TS team that wants one framework for UI and API",
      "You want React without assembling routing/SSR/bundling yourself",
    ],
    avoidWhen: [
      "Internal tools/dashboards — a plain SPA on a CDN is simpler to run",
      "Your backend is .NET/Java/Python and substantial — API routes would duplicate a layer you already have",
    ],
    alternatives: [
      { techId: "react", note: "Drop back to plain React + a CDN when there's no SEO/SSR need — less machinery, fewer moving parts." },
      { techId: "htmx", note: "If the appeal is 'server renders the HTML', htmx does that with your existing backend instead of a Node layer." },
      { techId: "blazor", note: "The .NET-native way to get the same 'one stack for UI and server' consolidation." },
    ],
    pairsWellWith: [
      { techId: "trpc", note: "Or its built-in server actions — either way, typed calls from component to server with no API ceremony." },
      { techId: "prisma", note: "The canonical full-stack TS data path: Next.js server code → Prisma → Postgres." },
      { techId: "static-edge", note: "Vercel/Netlify-class platforms are built around exactly this framework." },
    ],
    frictionWith: [
      { techId: "aspnet-core", note: "Both want to be the server. Running Next.js SSR in front of a full .NET API means two backends to operate and a blurry ownership line — pick one to be in charge." },
    ],
    notInterchangeableWith: [
      { techId: "react", note: "Next.js isn't 'newer React' — it's React plus a server runtime. Adopting it is a hosting and architecture decision, not a library upgrade." },
    ],
    tags: ["meta-framework", "ssr", "fullstack"],
  },
  {
    id: "angular",
    name: "Angular",
    category: "frontend",
    tagline: "The full-framework answer: everything included, one blessed way, enterprise-grade guardrails.",
    description:
      "Google's batteries-included frontend framework: router, forms, HTTP client, DI container, and testing story all in the box, all versioned together, with TypeScript mandatory since day one. Where React optimizes for flexibility, Angular optimizes for consistency — ten Angular codebases look alike in a way ten React codebases never do. The cost is ceremony and a curve that front-loads a lot of concepts.",
    scores: {
      performance: 6,
      devVelocity: 6,
      learningEase: 4,
      ecosystem: 7,
      scalability: 9,
      typeSafety: 9,
      opsSimplicity: 7,
      maturity: 9,
    },
    scoreNotes: {
      scalability:
        "The '9' is team-scalability: DI, enforced structure, and Nx-style tooling keep 50-developer frontends coherent.",
      devVelocity:
        "Slower to start (modules, DI, RxJS), faster to stay fast on large long-lived codebases.",
    },
    strengths: [
      "One prescribed way to do everything — onboarding onto any Angular codebase feels familiar",
      "Strongest type-safety culture of the big three; DI makes testing first-class",
      "Google's LTS discipline: predictable, well-documented upgrade paths",
      "Scales to very large teams without style drift",
    ],
    weaknesses: [
      "Steepest learning curve of the mainstream options (RxJS alone is a course)",
      "Verbose: simple features carry framework ceremony",
      "Smaller and shrinking mindshare vs React — fewer new libraries target it first",
      "Heavier baseline bundle than the compiled newcomers",
    ],
    chooseWhen: [
      "Large enterprise team that values consistency and guardrails over flexibility",
      "Long-lived internal applications where 10-year maintainability beats time-to-first-demo",
      "The org already has Angular expertise and codebases",
    ],
    avoidWhen: [
      "Small team racing to an MVP — the ceremony tax is real at small scale",
      "Hiring markets where React candidates outnumber Angular ones 10:1 (most of them)",
    ],
    alternatives: [
      { techId: "react", note: "Trade guardrails for ecosystem: more flexibility, more hiring, more decisions to own." },
      { techId: "vue", note: "A middle path: more structure than React, far less ceremony than Angular." },
      { techId: "blazor", note: "For .NET shops, the same enterprise-guardrails philosophy without a second language." },
    ],
    pairsWellWith: [
      { techId: "spring-boot", note: "The classic enterprise pairing — two convention-heavy, DI-centric frameworks with matching cultures." },
      { techId: "aspnet-core", note: "Equally common in enterprises; both stacks share the 'one blessed way' philosophy." },
      { techId: "rest", note: "Angular's HttpClient + OpenAPI codegen is a well-worn, typed path." },
    ],
    tags: ["framework", "enterprise", "spa"],
  },
  {
    id: "vue",
    name: "Vue",
    category: "frontend",
    tagline: "The approachable middle path — more framework than React, less ceremony than Angular.",
    description:
      "A progressive framework designed to be adoptable incrementally: start with a script tag on one page, grow into a full SPA with official router and state libraries. Single-file components put template, logic, and style together in a way many developers find immediately legible. Technically excellent and beloved by its users; its main cost is simply being second-place in a winner-take-most ecosystem game.",
    scores: {
      performance: 7,
      devVelocity: 8,
      learningEase: 8,
      ecosystem: 7,
      scalability: 7,
      typeSafety: 7,
      opsSimplicity: 7,
      maturity: 8,
    },
    scoreNotes: {
      ecosystem:
        "Healthy official ecosystem (router, Pinia, Nuxt) but the third-party long tail and hiring pool are a fraction of React's.",
    },
    strengths: [
      "Gentlest learning curve of the major frameworks — productive in days",
      "Official, blessed solutions for routing and state end the decision fatigue",
      "Single-file components keep everything about a component in one place",
      "Incremental adoption: can enhance server-rendered pages without a rewrite",
    ],
    weaknesses: [
      "Smaller hiring pool and library ecosystem than React everywhere outside Asia",
      "TypeScript support is good now but historically lagged — some ecosystem corners still show it",
      "The Options→Composition API transition split its own ecosystem's idioms",
    ],
    chooseWhen: [
      "A team of mixed experience needs to be productive fast",
      "Progressively enhancing an existing server-rendered app rather than rewriting",
      "You want framework guidance without Angular-scale ceremony",
    ],
    avoidWhen: [
      "Hiring at scale in markets where the candidate pool is overwhelmingly React",
      "You depend on the newest third-party UI libraries, which ship React-first",
    ],
    alternatives: [
      { techId: "react", note: "When ecosystem depth and hiring outweigh Vue's ergonomics." },
      { techId: "svelte", note: "Willing to trade even more ecosystem for even better ergonomics and performance." },
      { techId: "nextjs", note: "Vue's equivalent is Nuxt — if you're comparing meta-frameworks, compare those two." },
    ],
    pairsWellWith: [
      { techId: "fastapi", note: "A popular 'pragmatic and pleasant' pairing in the Python world." },
      { techId: "rest", note: "Vue's data story is unopinionated; plain REST + fetch/axios is the beaten path." },
    ],
    tags: ["progressive", "spa"],
  },
  {
    id: "svelte",
    name: "Svelte",
    category: "frontend",
    tagline: "The compiler gambit: do the framework's work at build time, ship almost no runtime.",
    description:
      "Svelte compiles components into imperative DOM updates instead of shipping a framework runtime that diffs a virtual DOM. The result is the smallest bundles and some of the best runtime performance in the category, with famously pleasant ergonomics (reactivity via plain assignment). SvelteKit is its Next.js-equivalent meta-framework. The bet you're making: excellent technology against a much smaller ecosystem.",
    scores: {
      performance: 9,
      devVelocity: 8,
      learningEase: 8,
      ecosystem: 5,
      scalability: 6,
      typeSafety: 7,
      opsSimplicity: 7,
      maturity: 6,
    },
    scoreNotes: {
      scalability:
        "Nothing wrong technically at scale — the '6' reflects fewer patterns, tools, and precedents for very large teams and codebases.",
    },
    strengths: [
      "Smallest bundles and fastest runtime of the mainstream options — no virtual DOM overhead",
      "Reactivity with almost no API surface: assign to a variable, the UI updates",
      "Less code per feature than React or Angular, consistently",
      "SvelteKit provides the full SSR/routing story in first-party form",
    ],
    weaknesses: [
      "Ecosystem and hiring pool are an order of magnitude behind React",
      "Fewer battle-tested component libraries; you'll build more UI primitives yourself",
      "Compiler magic means framework internals are less inspectable when things get weird",
      "Svelte 5's runes reworked the reactivity model — young enough to still make moves like that",
    ],
    chooseWhen: [
      "Performance-critical or bandwidth-critical frontends (embedded, emerging markets, widgets)",
      "Small product team that values shipping speed over ecosystem insurance",
      "Embeddable widgets where bundle size is the constraint",
    ],
    avoidWhen: [
      "You need to hire many frontend devs from the open market quickly",
      "The app leans hard on rich third-party component ecosystems (complex grids, charts)",
    ],
    alternatives: [
      { techId: "react", note: "The ecosystem-insurance trade: heavier and more boilerplate, but nothing you need will be missing." },
      { techId: "vue", note: "A middle point — better ecosystem than Svelte, nearly as pleasant." },
    ],
    pairsWellWith: [
      { techId: "static-edge", note: "Tiny bundles + static/edge hosting = extremely fast sites for nearly free." },
      { techId: "go-http", note: "A popular 'small and fast everywhere' pairing for lean teams." },
    ],
    tags: ["compiled", "performance"],
  },
  {
    id: "blazor",
    name: "Blazor",
    category: "frontend",
    tagline: "C# in the browser — one language end to end for .NET shops, with a payload or a socket to pay for it.",
    description:
      "Microsoft's framework for building interactive UIs in C# instead of JavaScript, in two very different modes: WebAssembly (the .NET runtime ships to the browser — real payload cost) or Server (UI events stream over a SignalR socket — every click is a network round-trip). For .NET teams it eliminates the second language, the second package manager, and the shared-DTO problem entirely. Outside .NET shops it has essentially no constituency.",
    scores: {
      performance: 5,
      devVelocity: 7,
      learningEase: 6,
      ecosystem: 4,
      scalability: 6,
      typeSafety: 9,
      opsSimplicity: 6,
      maturity: 6,
    },
    scoreNotes: {
      learningEase:
        "The '6' assumes a C# developer, for whom it's easy; for a JS developer it's learning .NET.",
      performance:
        "WASM mode pays a multi-MB first load; Server mode pays a round-trip per interaction. Both are fine for LOB apps, wrong for public consumer web.",
    },
    strengths: [
      "One language, one toolchain, shared models between client and server — the DTO-mapping layer just disappears",
      "Full .NET type safety across the entire application",
      "Component model (Razor components) is genuinely good and familiar to ASP.NET devs",
      "Ideal for the internal-LOB-app niche that .NET shops build constantly",
    ],
    weaknesses: [
      "WASM: heavy initial download and a runtime penalty vs JS frameworks",
      "Server: per-user socket state makes scaling stateful and offline impossible",
      "Tiny ecosystem next to the JS world — component libraries exist but the long tail doesn't",
      "Hiring 'Blazor developers' means hiring .NET developers and pointing them at it",
    ],
    chooseWhen: [
      "A .NET shop building internal line-of-business apps — the productivity win is real",
      "The team has zero JavaScript expertise and no appetite to acquire it",
      "Shared validation/models between client and server matter (complex forms, calculators)",
    ],
    avoidWhen: [
      "Public consumer-facing web where first-load speed and SEO decide bounce rates",
      "You may need non-.NET developers to work on the frontend later",
    ],
    alternatives: [
      { techId: "react", note: "The ecosystem-standard SPA answer if you accept owning a JavaScript stack alongside .NET." },
      { techId: "angular", note: "Culturally the closest JS framework to .NET's philosophy — a common .NET-shop compromise." },
      { techId: "htmx", note: "Razor Pages + htmx covers many 'internal app' cases with even less machinery than Blazor." },
    ],
    pairsWellWith: [
      { techId: "aspnet-core", note: "Not just compatible — the entire value proposition assumes this pairing." },
      { techId: "ef-core", note: "The all-Microsoft stack: shared entities from database to browser." },
    ],
    frictionWith: [
      { techId: "express", note: "Blazor without a .NET backend forfeits its whole reason to exist — shared language and models." },
    ],
    tags: ["dotnet", "wasm", "lob"],
  },
  {
    id: "htmx",
    name: "htmx",
    category: "frontend",
    tagline: "The counter-revolution: your server renders HTML, a 14kB script makes it interactive.",
    description:
      "A small library that lets any element make HTTP requests and swap the response's HTML into the page — extending hypermedia instead of replacing it with a client-side app. Your backend (any language) returns HTML fragments, not JSON, and there is no build step, no bundler, and no client-side state to manage. It's the sharpest tool for asking the most underrated architecture question in this catalog: does this app need to be a SPA at all?",
    scores: {
      performance: 8,
      devVelocity: 7,
      learningEase: 9,
      ecosystem: 3,
      scalability: 6,
      typeSafety: 2,
      opsSimplicity: 9,
      maturity: 6,
    },
    scoreNotes: {
      typeSafety:
        "Attributes in HTML strings — nothing checks that hx-target's selector exists. The mitigation is that each interaction is small enough to test by looking at it.",
      scalability:
        "Scales operationally beautifully (it's just your server); the '6' is the UI-complexity ceiling — rich client state (drag-drop boards, offline) fights the model.",
      devVelocity:
        "For form-and-table apps it's startlingly fast — no API layer, no serialization, no client state. Off that path, velocity drops sharply.",
    },
    strengths: [
      "Eliminates the entire SPA supply chain: no node_modules, no bundler, no hydration, no API-for-your-own-frontend",
      "Any backend language plays — the frontend skillset is 'HTML and your existing server framework'",
      "Server-rendered pages: SEO, first-paint, and accessibility defaults are all good",
      "Radically small surface area — the whole library is learnable in an afternoon",
    ],
    weaknesses: [
      "Complex client-side state (collaborative editors, offline, heavy optimistic UI) is outside its design envelope",
      "No type-checked contract between server templates and hx-attributes",
      "Small ecosystem: you and your server framework's template engine are the component library",
      "Team perception risk: some frontend devs read it as a step backward and hire accordingly",
    ],
    chooseWhen: [
      "Forms-and-tables applications (admin panels, internal tools, B2B portals) — most of the business web, honestly",
      "A backend-strong team without JS specialists wants a modern-feeling UI",
      "You're questioning whether the SPA complexity you're about to buy is earning anything",
    ],
    avoidWhen: [
      "The product IS a rich client experience: real-time collaboration, offline, complex local state",
      "The frontend team's skills and preferences are SPA-shaped",
    ],
    alternatives: [
      { techId: "react", note: "When client-side complexity is real and earned, the SPA model is the right tool — buy it deliberately." },
      { techId: "nextjs", note: "Interestingly convergent: React's server components move React toward htmx's 'render on the server' worldview." },
      { techId: "blazor", note: "For .NET shops, Razor Pages + htmx and Blazor Server compete for the same 'no-JS internal app' niche." },
    ],
    pairsWellWith: [
      { techId: "django", note: "Django templates + htmx is a celebrated combo — the admin-heavy web with almost no JavaScript." },
      { techId: "aspnet-core", note: "Razor Pages returning fragments to htmx is a quietly excellent .NET stack." },
      { techId: "session-auth", note: "Server-rendered pages and cookie sessions are the classic, simplest-possible auth pairing." },
    ],
    frictionWith: [
      { techId: "graphql", note: "htmx wants HTML fragments over the wire; GraphQL exists to serve flexible JSON to rich clients. These are opposite bets." },
      { techId: "trpc", note: "Typed RPC to a JS client has no role when the server returns rendered HTML." },
    ],
    tags: ["hypermedia", "no-build", "server-rendered"],
  },
];
