# 🏗️ Architecture Builder

A learning tool for architectural tradeoffs. It holds a curated knowledge base
of **63 technologies across 10 stack layers** — from architecture styles
(monolith, event-driven, CQRS+ES) down through frontends, backends, API styles,
data access, databases, caching, messaging, auth, and hosting — each scored on
eight tradeoff dimensions and connected by ~400 authored relationship edges.

The core thesis: **"best technology" is meaningless without "for what."** The
app makes that lesson interactive instead of stating it.

## The four views

| Tab | What it teaches |
| --- | --- |
| **Compare** | Rank any layer's options under *your* priorities (8 weight sliders + scenario presets like "Startup MVP" vs "Regulated / Financial"), then radar-compare up to 4. Watch the winners flip when priorities change — that flip is the whole discipline. |
| **Stack Builder** | Assemble a full stack layer by layer. A compatibility engine flags hard ecosystem violations (EF Core on Spring Boot), authored frictions (Next.js in front of a full .NET API), and synergies (Angular + Spring Boot). Export any stack as Markdown. |
| **Swap Map** | The substitution graph: what can stand in for X, what X can stand in for (including cross-layer swaps like "htmx can replace a SPA"), and — the best part — **commonly-confused pairs that are NOT interchangeable** (Kafka ≠ RabbitMQ, event-driven ≠ event sourcing). |
| **Learn** | The eight dimensions, how scoring works, and this app's own Architecture Decision Records — real ADRs, included partly as documentation and mostly as a worked example of the format. |

## Run it

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
node scripts/tour.mjs   # headless end-to-end smoke tour (needs Chrome + `npm run preview` running)
```

It's a fully static SPA — `dist/` deploys to any static host or CDN.
(Why no backend? See ADR-001 on the Learn tab.)

## How the knowledge base works

- `src/data/types.ts` — the schema. Every technology cross-reference is a
  member of the `TechId` union, so a typo'd edge is a **compile error**, not a
  silent runtime hole (ADR-002).
- `src/data/techs/*.ts` — one file per layer. Scores are 0–10 **relative to
  peers in the same category** (ADR-004); relationship edges carry the
  narratives (`alternatives` with when-to-switch notes, `pairsWellWith`,
  `frictionWith`, `notInterchangeableWith`).
- `docs/authoring-guide.md` — the scoring rubric and voice guide. Read it
  before adding or editing entries; it's what keeps the catalog calibrated.

**To add a technology:** add its id to the `TechId` union, add an entry to its
category file following the guide, and wire at least one `alternatives` edge in
each direction. The compiler and the audit script keep you honest.

Scores and narratives are opinionated teaching content, not vendor
benchmarks — tune them where your experience disagrees. Disagreeing with a
score, and being able to say why, means the tool worked.

## Layout

```
src/
  data/            types, dimensions, categories, scenarios, index (+ graph helpers)
  data/techs/      the knowledge base — one file per layer
  lib/             scoring engine, stack analysis, persistence hook
  components/      radar chart, score table, weight panel, tech detail
  views/           Compare, Stack Builder, Swap Map, Learn
scripts/tour.mjs   headless smoke tour (Playwright + installed Chrome)
docs/              authoring guide for knowledge-base contributors
_legacy/           the original one-prompt Express prototype, kept for reference
```
