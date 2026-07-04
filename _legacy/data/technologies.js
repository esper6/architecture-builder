/*
 * The knowledge base.
 *
 * Every score is on a 1-5 scale where HIGHER IS ALWAYS BETTER for the person
 * building the app. That keeps the radar chart intuitive: a bigger shape = a
 * "stronger" stack on that axis. The axes are:
 *
 *   costEfficiency : 5 = cheap to run / operate, 1 = expensive
 *   performance    : 5 = fast at runtime, 1 = slow
 *   scalability    : 5 = scales to huge load easily, 1 = hard to scale
 *   ease           : 5 = easy to learn & onboard, 1 = steep learning curve
 *   ecosystem      : 5 = massive library/tooling ecosystem, 1 = sparse
 *   hiring         : 5 = easy to find developers, 1 = niche/rare skill
 *   devSpeed       : 5 = ship features fast, 1 = slow to build with
 *
 * `cost` is a *very rough* order-of-magnitude estimate of the monthly infra
 * cost (USD) this component adds, at three traffic tiers. These are teaching
 * numbers, not quotes. Frontend frameworks are open source and cost ~nothing
 * to "own" — their cost shows up in hosting (the cloud) and dev time.
 */

const AXES = [
  { key: "costEfficiency", label: "Cost efficiency" },
  { key: "performance", label: "Performance" },
  { key: "scalability", label: "Scalability" },
  { key: "ease", label: "Ease of learning" },
  { key: "ecosystem", label: "Ecosystem" },
  { key: "hiring", label: "Hiring pool" },
  { key: "devSpeed", label: "Dev speed" },
];

const TIERS = [
  { key: "hobby", label: "Hobby / side project", note: "low traffic, a few users" },
  { key: "growth", label: "Startup / growth", note: "thousands of users, real traffic" },
  { key: "scale", label: "Enterprise / scale", note: "high traffic, HA, compliance" },
];

const technologies = [
  // ---------------------------------------------------------------- FRONTEND
  {
    id: "react",
    name: "React",
    category: "frontend",
    role: "UI library (you assemble the rest yourself)",
    blurb:
      "The most popular UI library. It renders components in the browser. React itself is just the view layer — you bolt on routing, data fetching, and a build setup. Maximum flexibility, but you make a lot of decisions.",
    scores: { costEfficiency: 5, performance: 4, scalability: 4, ease: 3, ecosystem: 5, hiring: 5, devSpeed: 4 },
    strengths: ["Largest ecosystem and component library selection", "Easiest frontend role to hire for", "Backed by Meta, battle-tested at scale"],
    weaknesses: ["Unopinionated — you must choose routing, state, build tooling", "SEO needs extra work (or Next.js) since it renders client-side", "Decision fatigue for beginners"],
    bestFor: ["SPAs and dashboards", "Teams that want flexibility", "Anything where you'll find lots of hiring/help"],
    cost: { hobby: 0, growth: 0, scale: 0 },
  },
  {
    id: "angular",
    name: "Angular",
    category: "frontend",
    role: "Full framework (batteries included)",
    blurb:
      "A complete, opinionated framework from Google. Routing, forms, HTTP, and dependency injection all ship in the box and it's TypeScript-first. More to learn up front, but consistent across large teams.",
    scores: { costEfficiency: 5, performance: 4, scalability: 4, ease: 2, ecosystem: 4, hiring: 3, devSpeed: 3 },
    strengths: ["Everything included — consistent structure across big teams", "TypeScript-first, strong tooling", "Great fit for large enterprise apps"],
    weaknesses: ["Steepest learning curve of the three frontends", "Verbose; heavier than React/Next for small apps", "Smaller hiring pool than React"],
    bestFor: ["Large enterprise apps", "Teams that want strong conventions", "Long-lived projects with many developers"],
    cost: { hobby: 0, growth: 0, scale: 0 },
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    role: "React framework — frontend AND backend (full-stack)",
    blurb:
      "React with a framework around it: file-based routing, server-side rendering, and API routes that run on the server. This means Next.js can BE your backend for many apps — it blurs the frontend/backend line. Built on React, so React skills transfer.",
    scores: { costEfficiency: 4, performance: 5, scalability: 4, ease: 3, ecosystem: 5, hiring: 4, devSpeed: 5 },
    strengths: ["Server-side rendering = fast first load + good SEO", "Can replace a separate backend for many apps (API routes)", "Builds on React, so React knowledge carries over"],
    weaknesses: ["Needs a Node server to run (or static export with limits)", "More concepts than plain React (SSR, server components)", "Can be overkill for a simple internal tool"],
    bestFor: ["Public-facing sites that need SEO", "Full-stack apps where you want one framework", "Marketing sites, e-commerce, content sites"],
    cost: { hobby: 0, growth: 0, scale: 0 },
    notes: ["Counts as both your frontend and (optionally) your backend."],
  },

  // ----------------------------------------------------------------- BACKEND
  {
    id: "node",
    name: "Node.js",
    category: "backend",
    role: "JavaScript runtime for the server (usually + Express/Nest)",
    blurb:
      "Runs JavaScript/TypeScript on the server. Same language as the frontend, so one team can do both. Event-driven and great at handling many simultaneous connections (I/O-bound work like APIs and real-time apps).",
    scores: { costEfficiency: 5, performance: 4, scalability: 4, ease: 4, ecosystem: 5, hiring: 5, devSpeed: 5 },
    strengths: ["Same language (JS/TS) front and back — one skillset", "Excellent for APIs, real-time, and I/O-heavy workloads", "Huge npm ecosystem; fast to prototype"],
    weaknesses: ["Single-threaded — CPU-heavy work needs care/workers", "Looser typing unless you adopt TypeScript discipline", "Dependency sprawl can become a maintenance burden"],
    bestFor: ["REST/GraphQL APIs", "Real-time apps (chat, dashboards)", "Startups moving fast with a small team"],
    cost: { hobby: 5, growth: 40, scale: 300 },
  },
  {
    id: "dotnet",
    name: ".NET Core",
    category: "backend",
    role: "Cross-platform C# backend framework",
    blurb:
      "Microsoft's modern, cross-platform (Linux too) framework using C#. Strongly typed, fast, and excellent for complex business logic and CPU-bound work. The go-to in enterprise and finance shops.",
    scores: { costEfficiency: 4, performance: 5, scalability: 5, ease: 3, ecosystem: 4, hiring: 4, devSpeed: 4 },
    strengths: ["Top-tier raw performance and CPU-bound throughput", "Strong typing (C#) catches bugs early — great for big codebases", "First-class on Azure and with MSSQL"],
    weaknesses: ["Different language from the frontend (C# vs JS)", "Heavier setup than Node for small projects", "Historically Windows-centric (now fully cross-platform, but culture lingers)"],
    bestFor: ["Enterprise & financial systems", "CPU-heavy or compute-intensive services", "Teams already in the Microsoft ecosystem"],
    cost: { hobby: 5, growth: 45, scale: 320 },
  },

  // ---------------------------------------------------------------- DATABASE
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "database",
    role: "Open-source relational (SQL) database",
    blurb:
      "A rock-solid, free, relational database. Tables with strict schemas and powerful SQL, plus modern extras (JSON columns, full-text search, geospatial). The safe default for most apps.",
    scores: { costEfficiency: 5, performance: 4, scalability: 4, ease: 3, ecosystem: 5, hiring: 4, devSpeed: 4 },
    strengths: ["Free and open source — no licensing cost", "Reliable, standards-compliant SQL with strong data integrity", "Supported everywhere; managed options on every cloud"],
    weaknesses: ["Rigid schema means migrations when shape changes", "Horizontal scaling (sharding) takes more effort than NoSQL", "SQL learning curve for newcomers"],
    bestFor: ["Most apps — the sensible default", "Anything with relationships and transactions (orders, payments)", "Teams that want no licensing cost"],
    cost: { hobby: 0, growth: 50, scale: 400 },
  },
  {
    id: "mongo",
    name: "MongoDB",
    category: "database",
    role: "Document (NoSQL) database",
    blurb:
      "Stores flexible JSON-like documents instead of rigid tables. No fixed schema, so you can change shape on the fly. Pairs naturally with JavaScript since documents look like JS objects. Scales horizontally well.",
    scores: { costEfficiency: 4, performance: 4, scalability: 5, ease: 4, ecosystem: 4, hiring: 4, devSpeed: 5 },
    strengths: ["Flexible schema — iterate fast without migrations", "Documents map cleanly to JS objects (great with Node)", "Designed to scale out horizontally"],
    weaknesses: ["Weaker at complex multi-table relationships/joins", "Easy to create inconsistent data without discipline", "Transactions exist but are less natural than in SQL"],
    bestFor: ["Rapidly evolving schemas / early prototypes", "Content, catalogs, event/log data", "JS-heavy stacks (MERN/MEAN)"],
    cost: { hobby: 0, growth: 57, scale: 450 },
  },
  {
    id: "mssql",
    name: "Microsoft SQL Server",
    category: "database",
    role: "Enterprise relational (SQL) database",
    blurb:
      "Microsoft's commercial relational database. Extremely capable and well-tooled, with deep .NET integration. Powerful but licensed — the cost shows up at scale, and is cheapest when run on Azure.",
    scores: { costEfficiency: 2, performance: 5, scalability: 4, ease: 3, ecosystem: 4, hiring: 4, devSpeed: 4 },
    strengths: ["Excellent performance and enterprise tooling (SSMS, reporting)", "Deep integration with .NET and Azure", "Strong support and enterprise SLAs"],
    weaknesses: ["Licensing cost — the priciest database option here", "Cheapest on Azure; licensing premium on AWS", "Less common outside the Microsoft world"],
    bestFor: ["Microsoft-stack enterprises", "Apps already invested in .NET", "Orgs that want commercial support"],
    cost: { hobby: 15, growth: 120, scale: 800 },
  },

  // ------------------------------------------------------------------- CLOUD
  {
    id: "aws",
    name: "AWS",
    category: "cloud",
    role: "Cloud platform (broadest service catalog)",
    blurb:
      "The largest cloud provider with the widest range of services and regions. Most flexible and most mature, but the breadth means a steeper learning curve and pricing that's easy to get wrong.",
    scores: { costEfficiency: 4, performance: 5, scalability: 5, ease: 2, ecosystem: 5, hiring: 4, devSpeed: 3 },
    strengths: ["Widest service catalog and global region coverage", "Most mature; huge community and documentation", "Best-in-class for large, complex, scalable systems"],
    weaknesses: ["Steepest learning curve; sprawling console", "Pricing is complex and easy to overspend on", "Less seamless with the Microsoft stack than Azure"],
    bestFor: ["Large-scale and complex systems", "Teams wanting maximum service choice", "Startups that may need exotic services later"],
    cost: { hobby: 5, growth: 60, scale: 500 },
  },
  {
    id: "azure",
    name: "Azure",
    category: "cloud",
    role: "Cloud platform (Microsoft-integrated)",
    blurb:
      "Microsoft's cloud. Integrates seamlessly with .NET, MSSQL, and enterprise identity (Active Directory). Often the easiest path if your org is already Microsoft-centric — which matches your plan to host on an Azure-hosted Ubuntu box.",
    scores: { costEfficiency: 4, performance: 5, scalability: 5, ease: 3, ecosystem: 4, hiring: 4, devSpeed: 4 },
    strengths: ["Seamless with .NET, MSSQL, and Active Directory", "Strong enterprise agreements and hybrid-cloud support", "Cheapest place to run MSSQL licensing"],
    weaknesses: ["Slightly smaller service catalog than AWS", "Some services less mature than the AWS equivalent", "Best value is realized inside the Microsoft ecosystem"],
    bestFor: ["Microsoft-stack teams", "Enterprises with existing MS licensing", "Hosting .NET + MSSQL apps cheaply"],
    cost: { hobby: 5, growth: 55, scale: 480 },
  },
];

module.exports = { technologies, AXES, TIERS };
