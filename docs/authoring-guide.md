# Knowledge-base authoring guide

This guide keeps every category of the catalog consistent in scoring and voice.
Read `src/data/types.ts` for the schema and `src/data/techs/architecture.ts` +
`src/data/techs/frontend.ts` as the calibration exemplars before writing anything.

## Voice

- **Opinionated senior engineer, zero marketing.** Every tech gets an honest
  case for it AND against it. If a tech is overhyped or frequently misapplied,
  say so plainly (see the microservices and CQRS entries).
- **Teach the tradeoff, not the feature list.** A strength is only interesting
  when the reader understands what it costs elsewhere.
- **Taglines are hooks** — one punchy sentence capturing the tech's essence and
  its central tension (see "An org chart optimization that costs a distributed
  system").
- Descriptions: 2–4 sentences, landscape position + the core tension.
- The audience is an experienced developer (integration/enterprise background)
  learning architecture. Occasional enterprise/B2B/EDI-flavored examples land
  well; don't overdo it.

## Scoring (0–10 per dimension)

**Scores are relative to peers in the same category.** 5 = typical for the
category, 9–10 = best in class on that axis, 1–2 = notably weak. Never score a
tech against something in another category.

Anchor examples from the exemplars:

- `performance`: Svelte 9 (compiled, no runtime) vs Blazor 5 (WASM payload /
  socket round-trips). Monolith 7 (in-proc calls) vs microservices 5 (network
  hops).
- `devVelocity`: Monolith 9 vs CQRS+ES 3 (every feature = command + events +
  handlers + projections).
- `learningEase`: htmx 9 (an afternoon) vs CQRS+ES 2 (long onboarding, easy to
  get subtly wrong).
- `ecosystem`: React 10 (the maximum anywhere in the catalog) vs htmx 3.
  This axis includes hiring pool.
- `scalability`: includes ORG scale (team size, codebase growth), not just
  requests — Angular gets 9 largely for team-scale.
- `typeSafety`: Blazor 9 (one typed language end to end) vs htmx 2 (attributes
  in strings). For non-code techs, score how much the toolchain catches before
  runtime (schema enforcement, typed contracts).
- `opsSimplicity`: htmx 9 (it's just your server) vs microservices 2 (tracing,
  discovery, per-service CI/CD).
- `maturity`: Monolith 10, SQL databases high; anything that reworked its core
  model in recent memory caps around 6–7.

**Use `scoreNotes`** for any score that would surprise someone or that flips in
a different context ("for a large org this is a 8, the 4 is small-team reality").
2–4 notes per tech is typical.

### Granularity (optional, additive)

Two mechanisms add depth without touching the radar or the weight sliders —
both render in detail views (and native dimensions in the Compare table):

- **`subScores`** — a drill-down under a shared dimension, answering "why is
  this a 6?" with numbers (e.g. backend `performance` → Throughput / Startup &
  cold start / Memory footprint). Same 0–10 within-category relativity. Keep
  labels identical across all techs in a category so the drill-downs compare.
- **Category-native dimensions** — axes that only make sense for one layer
  (databases: Query Flexibility / Consistency Guarantees / Schema Flexibility;
  API styles: Cacheability / Streaming & Push / Contract Rigor). Define the
  axes once in `categories.ts` (`nativeDimensions`), score them per tech in
  `nativeScores` (+ `nativeScoreNotes`). If a category defines native
  dimensions, EVERY tech in it must score all of them — the audit script
  enforces this; the compiler can't.

## Content shape per tech

- 4–5 `strengths`, 3–4 `weaknesses` — concrete, not generic ("famous churn:
  pages → app router" beats "can be complex").
- 3 `chooseWhen`, 2–3 `avoidWhen` — situations, not adjectives.
- 2–5 `alternatives` with **when-to-switch notes**. Cross-category alternatives
  are encouraged where real (Next.js can replace a separate API; htmx can
  replace a SPA). Every `techId` must exist in the `TechId` union in types.ts.
- 2–3 `pairsWellWith` where the synergy is real and explainable.
- `frictionWith` only where the combination genuinely fights (beyond ecosystem
  mismatch, which the app derives automatically from the `ecosystem` field).
- `notInterchangeableWith` is the catalog's best teaching device: pairs people
  wrongly treat as equivalent (Kafka vs RabbitMQ, event-driven vs event
  sourcing). Use it wherever the confusion is common.

### System-thinking fields (required)

- **`commitments`** (2–4 per tech) — second-order obligations the choice signs
  a team up for, phrased "You now own/need/must …" with a `why`. Not generic
  advice, not restated weaknesses: the ongoing infrastructure/process/skill
  costs that appear on no feature list (Kafka → consumer-lag monitoring;
  JWT → a revocation story). The Stack Builder aggregates these into the
  obligations ledger.
- **`effort` on every `alternatives` edge** — `"drop-in"` (days, same model),
  `"moderate"` (a real migration project, weeks), `"rewrite"` (paradigm shift
  or whole-layer reconstruction). Note the deliberate asymmetries: monolith →
  microservices is a rewrite, but monolith → modular-monolith →
  microservices is two moderates — pricing paths is the point.
- **Context modifiers** live centrally in `src/data/context.ts`, not on techs:
  visible score deltas keyed to org context (team size, platform team,
  compliance), each with a written rationale. Add one only when the flip is
  real, explainable, and worth teaching (see ADR-006).

## Ecosystem bindings

Set `ecosystem` ONLY on techs bound to a language ecosystem:

- backend: aspnet-core → dotnet; express, fastify, nestjs → node;
  spring-boot → jvm; fastapi, django → python; go-http → go; rust-axum → rust
- data-access: ef-core, dapper, ado-net → dotnet; prisma, drizzle, typeorm →
  node; hibernate → jvm; sqlalchemy → python
- api-style: trpc → node (TypeScript on both ends is its whole premise)
- Everything else: omit the field (agnostic).

## Mechanics

- Plain TypeScript, must compile under `strict`. Verify with `npx tsc --noEmit`
  from the repo root; fix errors in YOUR file only (other category files are
  being authored concurrently — ignore their errors).
- One file per category in `src/data/techs/`, exporting a single
  `const <NAME>_TECHS: Tech[]` (import `Tech` from `../types`).
