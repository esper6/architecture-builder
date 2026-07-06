# Architecture Builder — session guide

Static Vite + React + TS SPA teaching architectural tradeoffs. No backend, no
chart libraries, no router — deliberate decisions, recorded as ADR-001…010 in
`src/views/LearnView.tsx` (also rendered on the Learn tab). Read those before
proposing structural changes; each names its revisit trigger.

## Commands

```bash
npm run dev          # dev server
npm run build        # tsc -b && vite build — must pass before any commit
npm run audit:data   # knowledge-base integrity + game solvability — must pass
npm run preview      # serve dist (tour/checks need this running)
node scripts/tour.mjs            # end-to-end smoke tour (headless Chrome via channel:chrome)
node scripts/diagram-check.mjs   # screenshots all six blueprint topologies
```

Verification bar for changes: build + audit + tour green, and screenshot any
UI you touched (playwright is a devDependency; use `--channel chrome`).

## Load-bearing invariants

- **Knowledge base is typed TS** (`src/data/techs/*.ts`, one file per layer).
  Every cross-reference is a `TechId` union member — extend the union in
  `src/data/types.ts` when adding a tech. Follow `docs/authoring-guide.md`
  (scoring rubric + voice) exactly; scores are 0–10 **relative within a
  category** (5 = category-typical).
- Every tech needs ≥2 `commitments` and every `alternatives` edge needs an
  `effort` rating — the audit fails otherwise. Effort ratings are also the
  **game currency** (drop-in 1 / moderate 2 / rewrite 4).
- Every game in `src/data/games.ts` must carry a `knownSolution` per stage;
  the audit replays them through the real engine. Rebalancing any score can
  break a game — the audit will catch it; fix the game or the balance.
- Stack aggregation is **emergent, not averaged** (`AGGREGATION` in
  `src/lib/scoring.ts`): perf/scalability/ops/typeSafety/maturity floor at the
  worst layer, the rest average.
- Org-context score adjustments live only in `src/data/context.ts` as visible
  modifiers with rationales — never bake context into base scores.
- Chart/diagram colors: CSS custom properties from `src/theme.css` (validated
  palette; light + dark are separately chosen steps). SVG edge colors must
  also be set via CSS classes, not only presentation attributes (Dark Reader
  strips the latter — learned the hard way).
- Challenges/games lock weights + context while active; evaluation always
  goes through `analyzeStack` — never a second scoring path.

## Layout

```
src/data/       types, dimensions, categories, scenarios, context (modifiers),
                challenges, games, index (graph helpers), techs/ (the catalog)
src/lib/        scoring (effective scores, emergent stack, stress), game
                (effort economy), challenge (criteria), export (ADR draft)
src/components/ RadarChart, ScoreTable, TechDetail, WeightPanel, ContextPanel,
                StackDiagram (per-architecture topologies), EffortBadge
src/views/      Compare, Stack Builder, Swap Map, Play (challenges + games), Learn
scripts/        audit.ts, tour.mjs, diagram-check.mjs
_legacy/        the original one-prompt Express prototype (reference only)
```

GitHub: https://github.com/esper6/architecture-builder (public). Owner is
learning architecture — explain the "why" of tradeoffs in code review and
content, and keep the app's opinionated-but-fair teaching voice.

## Deferred ideas (agreed, not built)

- Saved-stack comparison → the honest portfolio/"company estate" view (ADR-009)
- Editable domain names on blueprint diagram nodes; diagram interactivity
- Audit assertion that design challenges (not just games) remain solvable
- Wished-for catalog entries: Bun/Deno, jOOQ, Elasticsearch, Kinesis/Event
  Hubs, background-job frameworks, API gateway/BFF, Laravel
- GitHub Pages / Vercel deployment (user deferred hosting)
