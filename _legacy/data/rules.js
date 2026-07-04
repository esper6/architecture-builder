/*
 * The combination engine.
 *
 * Individual technologies are only half the story — the interesting part is how
 * choices interact. This file holds:
 *
 *   1. PAIR_RULES   : synergies (+) and frictions (-) between two specific techs.
 *   2. STACK_CHECKS : whole-stack observations (e.g. redundancy, missing layer).
 *   3. estimateCost : a rough monthly infra cost from the selection + traffic tier.
 *
 * Everything here is intentionally readable so the app teaches *why*, not just
 * *what*. Numbers are order-of-magnitude teaching figures, never quotes.
 */

// A pair rule fires when BOTH ids are present in the selection.
// type: "synergy" (good) | "friction" (caution). `delta` nudges the overall score.
const PAIR_RULES = [
  {
    pair: ["dotnet", "mssql"],
    type: "synergy",
    delta: +4,
    title: ".NET Core + MSSQL = first-class pairing",
    detail:
      "Entity Framework Core treats SQL Server as a primary target. Tooling, migrations, and drivers are tightly integrated — this is the canonical Microsoft data stack.",
  },
  {
    pair: ["dotnet", "azure"],
    type: "synergy",
    delta: +4,
    title: ".NET Core + Azure = native home",
    detail:
      "Azure App Service deploys .NET with almost no config, and identity/monitoring (Entra ID, App Insights) integrate out of the box. The lowest-friction way to ship .NET.",
  },
  {
    pair: ["mssql", "azure"],
    type: "synergy",
    delta: +3,
    title: "MSSQL is cheapest on Azure",
    detail:
      "Azure SQL Database includes the licensing in the managed price and offers a serverless tier. Running MSSQL on AWS means paying a licensing premium — so this pairing saves real money.",
  },
  {
    pair: ["node", "mongo"],
    type: "synergy",
    delta: +3,
    title: "Node.js + MongoDB = JavaScript everywhere",
    detail:
      "Mongo stores JSON-like documents that map directly to JavaScript objects, so there's almost no translation layer. This is the classic MERN/MEAN backend pairing.",
  },
  {
    pair: ["react", "node"],
    type: "synergy",
    delta: +3,
    title: "React + Node.js = one language end to end",
    detail:
      "Frontend and backend are both JavaScript/TypeScript, so one developer (or one skillset) covers the whole stack and you can share types and validation code.",
  },
  {
    pair: ["nextjs", "node"],
    type: "synergy",
    delta: +2,
    title: "Next.js + Node.js = same runtime",
    detail:
      "Next.js runs on Node, so they share a runtime and language. Just be aware Next.js already includes backend capabilities (see the stack notes about redundancy).",
  },
  {
    pair: ["angular", "dotnet"],
    type: "synergy",
    delta: +3,
    title: "Angular + .NET Core = enterprise classic",
    detail:
      "Both are opinionated and strongly typed (TypeScript + C#), favored by enterprise teams that value structure and convention. A very common, well-trodden pairing.",
  },
  {
    pair: ["react", "postgres"],
    type: "synergy",
    delta: +1,
    title: "React + PostgreSQL = safe, popular default",
    detail:
      "Nothing exotic — a flexible UI on top of a reliable, free relational database. Easy to hire for and easy to find help online.",
  },
  {
    pair: ["mssql", "aws"],
    type: "friction",
    delta: -3,
    title: "MSSQL on AWS = licensing premium",
    detail:
      "AWS RDS for SQL Server bundles a Microsoft license into the hourly rate, making it noticeably pricier than the same database on Azure. Workable, but you pay for it.",
  },
  {
    pair: ["angular", "node"],
    type: "synergy",
    delta: +1,
    title: "Angular + Node.js = the MEAN stack",
    detail:
      "TypeScript on both ends. Works well, though Angular's structure pairs even more naturally with a strongly typed backend like .NET.",
  },
  {
    pair: ["dotnet", "mongo"],
    type: "friction",
    delta: -1,
    title: ".NET Core + MongoDB = workable but off the beaten path",
    detail:
      ".NET shines with relational data and EF Core. Mongo works via its C# driver, but you give up much of the tooling advantage .NET has with SQL databases.",
  },
];

// Whole-stack checks. Each returns a message object or null.
const STACK_CHECKS = [
  function nextRedundantBackend(sel) {
    if (sel.frontend === "nextjs" && sel.backend) {
      return {
        type: "friction",
        delta: -2,
        title: "Next.js + a separate backend can be redundant",
        detail:
          "Next.js can already run server-side code (API routes / server components). For many apps you don't need a separate Node/.NET backend too. Keep the separate backend only if you have heavy business logic, a non-JS team, or you want the API reusable by other clients (mobile, partners).",
      };
    }
    return null;
  },
  function missingLayer(sel) {
    const missing = [];
    if (!sel.frontend) missing.push("a frontend");
    // Next.js can serve as the backend, so it's OK to have no separate backend.
    if (!sel.backend && sel.frontend !== "nextjs") missing.push("a backend");
    if (!sel.database) missing.push("a database");
    if (!sel.cloud) missing.push("a cloud host");
    if (missing.length === 0) return null;
    return {
      type: "info",
      delta: 0,
      title: "Your stack is incomplete",
      detail:
        "You haven't picked " +
        missing.join(", ") +
        ". That can be fine (e.g. Next.js covers the backend), but a typical web app needs all four layers.",
    };
  },
  function crossLanguageCost(sel) {
    const jsFront = sel.frontend === "react" || sel.frontend === "angular" || sel.frontend === "nextjs";
    if (jsFront && sel.backend === "dotnet") {
      return {
        type: "info",
        delta: 0,
        title: "Two languages to maintain (JS + C#)",
        detail:
          "A JavaScript frontend with a C# backend means two ecosystems, two sets of tooling, and you can't share code/types across the boundary. Common in enterprises — just budget for the extra context-switching.",
      };
    }
    return null;
  },
  function allMicrosoft(sel) {
    if (sel.backend === "dotnet" && sel.database === "mssql" && sel.cloud === "azure") {
      return {
        type: "synergy",
        delta: +3,
        title: "Fully aligned Microsoft stack",
        detail:
          ".NET Core + MSSQL + Azure is a cohesive, well-supported, enterprise-grade combination. Everything is designed to work together, support is straightforward, and licensing is optimized on Azure.",
      };
    }
    return null;
  },
  function allOpenSourceJs(sel) {
    const jsFront = sel.frontend === "react" || sel.frontend === "nextjs";
    if (jsFront && sel.backend === "node" && (sel.database === "postgres" || sel.database === "mongo")) {
      return {
        type: "synergy",
        delta: +2,
        title: "Lean JavaScript stack",
        detail:
          "An all-JavaScript, mostly-open-source stack means one language, fast iteration, a huge hiring pool, and low licensing cost. A great fit for startups and small teams moving quickly.",
      };
    }
    return null;
  },
];

/*
 * Rough monthly infra cost (USD) for the selected stack at a traffic tier.
 * Sums the per-component cost, then applies cloud-specific adjustments
 * (e.g. MSSQL licensing premium on AWS). Returned as a low–high range because
 * real costs vary wildly. Teaching figures only.
 */
function estimateCost(selection, technologies, tierKey) {
  let base = 0;
  const lines = [];
  for (const cat of ["backend", "database", "cloud"]) {
    const id = selection[cat];
    if (!id) continue;
    const tech = technologies.find((t) => t.id === id);
    if (!tech) continue;
    const amount = tech.cost[tierKey] ?? 0;
    base += amount;
    if (amount > 0) lines.push({ label: tech.name, amount });
  }

  // Adjustment: MSSQL on AWS carries a licensing premium.
  let adjustment = 0;
  if (selection.database === "mssql" && selection.cloud === "aws") {
    const premium = { hobby: 20, growth: 150, scale: 900 }[tierKey] ?? 0;
    adjustment += premium;
    if (premium > 0) lines.push({ label: "MSSQL licensing premium on AWS", amount: premium });
  }

  const total = base + adjustment;
  // Express as a +/- 40% range to be honest about uncertainty.
  const low = Math.round((total * 0.6) / 5) * 5;
  const high = Math.round((total * 1.4) / 5) * 5;
  return { low, high, lines };
}

module.exports = { PAIR_RULES, STACK_CHECKS, estimateCost };
