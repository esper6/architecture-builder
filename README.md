# 🏗️ Architecture Builder

A learning tool for architectural tradeoffs. It holds a curated knowledge base
of **63 technologies across 10 stack layers** — from architecture styles
(monolith, event-driven, CQRS+ES) down through frontends, backends, API styles,
data access, databases, caching, messaging, auth, and hosting — each scored on
eight tradeoff dimensions and connected by ~400 authored relationship edges.

The core thesis: **"best technology" is meaningless without "for what" and
"for whom"** — and a stack is a system, not a shopping list. The app makes
those lessons interactive instead of stating them:

- **Emergence, not averages** — ops load, type safety, performance,
  scalability, and maturity are weakest-link properties. The Stack Builder
  charts the naive average against the emergent profile and names the culprit
  layer setting each floor.
- **Conway's Law as an input** — team size, platform team, and compliance
  regime apply *visible, explained* score adjustments. Drag team size and
  watch Kubernetes climb.
- **Choices are subscriptions** — every tech carries its second-order
  obligations ("you now own consumer-lag monitoring"), aggregated into the
  stack's obligations ledger.
- **Architecture is a verb** — a stress lens plays Traffic ×10 / Team ×5 /
  Compliance-lands against your stack and prices the exits with
  migration-effort ratings on every substitution edge.

## The five views

| Tab | What it teaches |
| --- | --- |
| **Compare** | Rank any layer's options under *your* priorities (8 weight sliders + scenario presets) and org context, then radar-compare up to 4. Watch the winners flip when priorities or context change — that flip is the whole discipline. |
| **Stack Builder** | Assemble a full stack layer by layer. Compatibility engine (ecosystem blockers, frictions, synergies), average-vs-emergent radar with floor culprits, stress lens, obligations ledger, and one-click **ADR draft export**. |
| **Swap Map** | The substitution graph: what can stand in for X, what X can stand in for (with migration-effort badges), and **commonly-confused pairs that are NOT interchangeable** (Kafka ≠ RabbitMQ, event-driven ≠ event sourcing). |
| **Play** | Three shapes of practice. **Scenario games**: architect your way *out* — Crisis, Campaign, Rescue — with every change billed in effort points from the migration ratings (drop-in 1 / migration 2 / rewrite 4) against a stage budget; solvability re-verified by the audit on every catalog change. **Incident room**: postmortem simulations that train the *read* direction — symptoms and a timeline, accuse a component on the blueprint, name the mechanism, receive the postmortem; every wrong accusation earns a specific exoneration. **Design challenges**: freeform builds under locked weights/context, scored live against emergent floors. |
| **Learn** | The eight dimensions, the systems-thinking method (emergence, Conway, obligations, stress-testing), and this app's own ADRs — a worked example of the format. |

## Run it

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
npm run audit:data      # knowledge-base integrity + calibration matrix
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
- Granularity beyond the shared eight dimensions: `subScores` (drill-downs
  like performance → throughput/startup/memory) and per-category
  `nativeDimensions` (e.g. databases score Query Flexibility, Consistency
  Guarantees, Schema Flexibility). Both are display-depth only — they never
  affect the radar or weighted rankings.
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
