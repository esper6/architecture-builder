import type { Category } from "./types";

/** Stack layers, in the order a stack is assembled top-down. */
export const CATEGORIES: Category[] = [
  {
    id: "architecture",
    name: "Architecture Style",
    question: "What shape is the system?",
    description:
      "The highest-leverage decision you'll make. Everything below it — team structure, deployment, data ownership — flows from whether you build one deployable, several, or an event-driven mesh. Unlike the other layers, these aren't products you install; they're patterns you commit to.",
  },
  {
    id: "frontend",
    name: "Frontend",
    question: "How will you build the UI?",
    description:
      "What runs in the browser (or renders HTML for it). The real tradeoff space here is less 'which framework is best' and more 'how much application do you want living in the client at all'.",
  },
  {
    id: "backend",
    name: "Backend Framework",
    question: "What runs your business logic?",
    description:
      "The language + framework combo serving your API and executing domain logic. This choice sets your ecosystem: it constrains data access options, shapes hiring, and anchors team identity more than any other layer.",
  },
  {
    id: "api-style",
    name: "API Style",
    question: "How do clients talk to the server?",
    description:
      "The contract between frontend and backend (and between services). Styles differ in flexibility, tooling, caching behavior, and how much they couple the two sides together.",
    nativeDimensions: [
      {
        key: "cacheability",
        label: "Cacheability",
        question: "How well do responses cache at HTTP/CDN layers without custom work?",
      },
      {
        key: "streaming",
        label: "Streaming & Push",
        question: "How naturally does it handle server push and long-lived streams?",
      },
      {
        key: "contractRigor",
        label: "Contract Rigor",
        question: "How strongly is the client/server contract specified and enforced?",
      },
    ],
  },
  {
    id: "data-access",
    name: "Data Access",
    question: "How does code talk to the database?",
    description:
      "The layer between your objects and your rows. The eternal tradeoff: how much SQL do you want abstracted away, and what does that abstraction cost you when queries get hot or complex?",
  },
  {
    id: "database",
    name: "Database",
    question: "Where does the data live?",
    description:
      "The most consequential and hardest-to-reverse choice after architecture style. Data outlives every framework above it — teams rewrite frontends for sport, but nobody migrates a primary database for fun.",
    nativeDimensions: [
      {
        key: "queryFlexibility",
        label: "Query Flexibility",
        question: "How freely can you ask questions you didn't plan for at design time?",
      },
      {
        key: "consistency",
        label: "Consistency Guarantees",
        question: "How strong (and how simple to reason about) are guarantees under concurrency and distribution?",
      },
      {
        key: "schemaFlexibility",
        label: "Schema Flexibility",
        question: "How cheaply can the shape of the data evolve after launch?",
      },
    ],
  },
  {
    id: "caching",
    name: "Caching",
    question: "How do you make hot reads fast?",
    optionalInStack: true,
    description:
      "Where computed or fetched results wait to be reused. Famously one of the two hard problems in computer science — every caching layer trades read speed for a new question: 'when is this stale?'",
  },
  {
    id: "messaging",
    name: "Messaging & Events",
    question: "How do parts of the system talk asynchronously?",
    optionalInStack: true,
    description:
      "Queues, topics, and event logs that decouple producers from consumers in time. Essential for event-driven architectures; the biggest source of confusion in this catalog because queues and event logs look similar and behave nothing alike.",
  },
  {
    id: "auth",
    name: "Authentication",
    question: "How do you know who's calling?",
    optionalInStack: true,
    description:
      "How identity is established and carried on each request. The tradeoff runs between statefulness (easy revocation, sticky infrastructure) and statelessness (easy scaling, hard revocation) — plus build-vs-buy for the identity provider itself.",
  },
  {
    id: "hosting",
    name: "Hosting & Deployment",
    question: "Where does it run?",
    description:
      "The substrate everything ships to. Ranges from 'a VM you SSH into' to 'functions you never see the machine for' — the axis is how much operational control you trade away for how much operational burden.",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category["id"], Category>;
