import { useMemo, useState } from "react";
import type { OrgContext, TechId } from "../data/types";
import { CATEGORIES } from "../data/categories";
import { DIMENSION_MAP, DIMENSIONS } from "../data/dimensions";
import { SCENARIO_MAP } from "../data/scenarios";
import { describeContext } from "../data/context";
import type { Challenge } from "../data/challenges";
import { getTech, techsIn } from "../data";
import type { Stack, Weights } from "../lib/scoring";
import {
  AGGREGATION,
  STRESS_EVENTS,
  analyzeStack,
  ecosystemName,
  stressTest,
} from "../lib/scoring";
import { stackToAdr } from "../lib/export";
import { evaluateChallenge } from "../lib/challenge";
import type { Game } from "../lib/game";
import { diffStacks, evaluateStage } from "../lib/game";
import { GAME_MODE_LABELS } from "../data/games";
import { ChartLegend, RadarChart } from "../components/RadarChart";
import { ScoreTable } from "../components/ScoreTable";
import { EffortBadge } from "../components/EffortBadge";
import { StackDiagram } from "../components/StackDiagram";

/** Curated example stacks — each one is a coherent, real-world archetype. */
const EXAMPLE_STACKS: { name: string; blurb: string; stack: Stack }[] = [
  {
    name: "Classic .NET enterprise",
    blurb: "The cohesive one-vendor stack for long-lived line-of-business systems.",
    stack: {
      architecture: "modular-monolith",
      frontend: "angular",
      backend: "aspnet-core",
      "api-style": "rest",
      "data-access": "ef-core",
      database: "mssql",
      caching: "in-process-cache",
      auth: "managed-idp",
      hosting: "paas-containers",
    },
  },
  {
    name: "Full-stack TypeScript startup",
    blurb: "One language end to end, optimized for iteration speed.",
    stack: {
      architecture: "monolith",
      frontend: "nextjs",
      backend: "fastify",
      "api-style": "trpc",
      "data-access": "prisma",
      database: "postgres",
      auth: "managed-idp",
      hosting: "static-edge",
    },
  },
  {
    name: "High-scale event pipeline",
    blurb: "Throughput-first: services around a durable event log.",
    stack: {
      architecture: "event-driven",
      backend: "go-http",
      "api-style": "grpc",
      database: "cassandra",
      caching: "redis",
      messaging: "kafka",
      auth: "jwt-auth",
      hosting: "kubernetes",
    },
  },
  {
    name: "Boring-on-purpose internal tool",
    blurb: "Minimum moving parts, maximum sleep — htmx over a monolith.",
    stack: {
      architecture: "monolith",
      frontend: "htmx",
      backend: "django",
      "api-style": "rest",
      "data-access": "sqlalchemy",
      database: "postgres",
      caching: "in-process-cache",
      auth: "session-auth",
      hosting: "vms",
    },
  },
  {
    name: "Integration / B2B backbone",
    blurb: "An EDI-flavored profile: async workflows, contracts, audit trails.",
    stack: {
      architecture: "event-driven",
      backend: "aspnet-core",
      "api-style": "rest",
      "data-access": "dapper",
      database: "postgres",
      messaging: "azure-service-bus",
      auth: "managed-idp",
      hosting: "paas-containers",
    },
  },
];

export function StackView({
  weights,
  scenarioName,
  ctx,
  stack,
  onStackChange,
  activeChallenge,
  onAbandonChallenge,
  activeGame,
  gameStage,
  gameBaseStack,
  onAdvanceGame,
  onResetStage,
  onAbandonGame,
}: {
  weights: Weights;
  scenarioName: string;
  ctx: OrgContext;
  stack: Stack;
  onStackChange: (stack: Stack) => void;
  activeChallenge: Challenge | null;
  onAbandonChallenge: () => void;
  activeGame: Game | null;
  gameStage: number;
  gameBaseStack: Stack;
  onAdvanceGame: () => void;
  onResetStage: () => void;
  onAbandonGame: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const stage = activeGame ? activeGame.stages[gameStage] : null;

  // A live challenge or game stage pins weights and context so its scoring
  // is deterministic regardless of what's dialed in elsewhere in the app.
  const effWeights = stage
    ? SCENARIO_MAP[stage.scenarioId].weights
    : activeChallenge
      ? SCENARIO_MAP[activeChallenge.scenarioId].weights
      : weights;
  const effCtx = stage
    ? stage.context
    : activeChallenge
      ? activeChallenge.context
      : ctx;
  const effScenarioName = stage
    ? SCENARIO_MAP[stage.scenarioId].name
    : activeChallenge
      ? SCENARIO_MAP[activeChallenge.scenarioId].name
      : scenarioName;

  const analysis = useMemo(
    () => analyzeStack(stack, effWeights, effCtx),
    [stack, effWeights, effCtx],
  );
  const challengeResult = activeChallenge
    ? evaluateChallenge(activeChallenge, analysis)
    : null;
  const stageResult =
    activeGame && stage
      ? evaluateStage(stage, analysis, gameBaseStack, stack)
      : null;
  const bill = activeGame ? diffStacks(gameBaseStack, stack) : null;
  const isLastStage = activeGame
    ? gameStage === activeGame.stages.length - 1
    : false;

  const backendId = stack.backend;
  const backendEco = backendId ? getTech(backendId).ecosystem : undefined;

  function setSlot(categoryId: (typeof CATEGORIES)[number]["id"], value: string) {
    const next = { ...stack };
    if (value === "") delete next[categoryId];
    else next[categoryId] = value as TechId;
    onStackChange(next);
  }

  async function copyAdr() {
    await navigator.clipboard.writeText(
      stackToAdr(stack, effWeights, effCtx, effScenarioName),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const blockers = analysis.notes.filter((n) => n.kind === "blocker");
  const warnings = analysis.notes.filter((n) => n.kind === "warning");
  const synergies = analysis.notes.filter((n) => n.kind === "synergy");
  const hasTechs = analysis.techs.length > 0;
  const floorDims = DIMENSIONS.filter((d) => AGGREGATION[d.key] === "floor");
  const gap = analysis.naiveOverall - analysis.overall;

  return (
    <div>
      {activeChallenge && challengeResult && (
        <div
          className={`card challenge-banner${challengeResult.passed ? " passed" : ""}`}
          style={{ marginTop: "1rem" }}
        >
          <div className="challenge-banner-head">
            <div>
              <p className="section-label">
                Challenge {challengeResult.passed ? "— PASSED ✓" : "in progress"}
              </p>
              <h3 style={{ margin: 0 }}>{activeChallenge.name}</h3>
              <p className="small secondary" style={{ margin: "0.3rem 0 0" }}>
                {activeChallenge.brief}
              </p>
              <p className="small muted" style={{ margin: "0.3rem 0 0" }}>
                Scored under locked <strong>{effScenarioName}</strong> weights ·{" "}
                {describeContext(effCtx)}
              </p>
            </div>
            <button className="chip" onClick={onAbandonChallenge}>
              Abandon
            </button>
          </div>
          <ul className="criteria-list">
            {challengeResult.criteria.map((c, i) => (
              <li key={i} className={c.pass ? "pass" : "fail"}>
                {c.pass ? "✓" : "✗"} {c.label}
              </li>
            ))}
          </ul>
          <details>
            <summary className="small muted">Need a hint?</summary>
            <p className="small secondary" style={{ margin: "0.4rem 0 0" }}>
              {activeChallenge.hint}
            </p>
          </details>
        </div>
      )}

      {activeGame && stage && stageResult && bill && (
        <div
          className={`card challenge-banner${stageResult.passed ? " passed" : ""}`}
          style={{ marginTop: "1rem" }}
        >
          <div className="challenge-banner-head">
            <div>
              <p className="section-label">
                {GAME_MODE_LABELS[activeGame.mode]} · stage {gameStage + 1} of{" "}
                {activeGame.stages.length}
                {stageResult.passed &&
                  (isLastStage ? " — COMPLETE ✓" : " — STAGE CLEAR ✓")}
              </p>
              <h3 style={{ margin: 0 }}>
                {activeGame.name} — {stage.name}
              </h3>
              <p className="small secondary" style={{ margin: "0.3rem 0 0" }}>
                {stage.narrative}
              </p>
              <p className="small muted" style={{ margin: "0.3rem 0 0" }}>
                Scored under locked <strong>{effScenarioName}</strong> weights ·{" "}
                {describeContext(effCtx)}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button className="chip" onClick={onResetStage} title="Restore this stage's starting stack">
                Reset stage
              </button>
              <button className="chip" onClick={onAbandonGame}>
                Abandon
              </button>
            </div>
          </div>
          <ul className="criteria-list">
            {stageResult.criteria.map((c, i) => (
              <li key={i} className={c.pass ? "pass" : "fail"}>
                {c.pass ? "✓" : "✗"} {c.label}
              </li>
            ))}
          </ul>
          {bill.changes.length > 0 && (
            <p className="small muted" style={{ margin: "0.2rem 0 0.4rem" }}>
              Changes this stage:{" "}
              {bill.changes.map((ch, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  {ch.label} <strong>({ch.cost})</strong>
                </span>
              ))}
            </p>
          )}
          {stageResult.passed && !isLastStage && (
            <button className="chip take-chip" onClick={onAdvanceGame}>
              Advance to stage {gameStage + 2} →
            </button>
          )}
          <details style={{ marginTop: "0.4rem" }}>
            <summary className="small muted">Need a hint?</summary>
            <p className="small secondary" style={{ margin: "0.4rem 0 0" }}>
              {stage.hint}
            </p>
          </details>
        </div>
      )}

      {!activeChallenge && !activeGame && (
        <div style={{ marginTop: "1rem" }}>
          <p className="section-label">
            Start from an archetype (or build from scratch)
          </p>
          <div className="chip-row">
            {EXAMPLE_STACKS.map((ex) => (
              <button
                key={ex.name}
                className="chip"
                title={ex.blurb}
                onClick={() => onStackChange({ ...ex.stack })}
              >
                {ex.name}
              </button>
            ))}
            <button className="chip" onClick={() => onStackChange({})}>
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="stack-layout">
        <div className="slot-list">
          <p className="small muted" style={{ margin: "0 0 0.2rem" }}>
            One choice per layer, on purpose: this models a <strong>single
            system's</strong> load-bearing decisions — not a company's whole
            estate, and not composed secondaries like an L1 cache in front of
            Redis. Why: ADR-009 on the Learn tab.
          </p>
          {CATEGORIES.map((c) => {
            const options = techsIn(c.id);
            // A slot can have zero compatible options (e.g. data access with a
            // Go/Rust backend — those ecosystems have no ORM entries, on
            // purpose). Say so instead of showing an unpickable "— choose —".
            const noneCompatible =
              c.id !== "backend" &&
              backendEco !== undefined &&
              options.length > 0 &&
              options.every(
                (t) => t.ecosystem !== undefined && t.ecosystem !== backendEco,
              );
            return (
              <div className="slot" key={c.id}>
                <div className="slot-header">
                  <span className="slot-name">
                    {c.name}
                    {c.optionalInStack && (
                      <span className="muted small"> · optional</span>
                    )}
                  </span>
                  <span className="slot-question">{c.question}</span>
                </div>
                <select
                  value={stack[c.id] ?? ""}
                  onChange={(e) => setSlot(c.id, e.target.value)}
                  aria-label={c.name}
                >
                  <option value="">
                    {noneCompatible
                      ? "— none (no entries for this ecosystem) —"
                      : c.optionalInStack
                        ? "— none —"
                        : "— choose —"}
                  </option>
                  {options.map((t) => {
                    const incompatible =
                      t.ecosystem !== undefined &&
                      c.id !== "backend" &&
                      backendEco !== undefined &&
                      t.ecosystem !== backendEco;
                    return (
                      <option key={t.id} value={t.id} disabled={incompatible}>
                        {t.name}
                        {t.ecosystem && c.id !== "backend"
                          ? incompatible
                            ? ` (needs ${ecosystemName(t.ecosystem)})`
                            : ` (${ecosystemName(t.ecosystem)})`
                          : ""}
                      </option>
                    );
                  })}
                </select>
                {stack[c.id] && (
                  <span className="small muted">
                    {getTech(stack[c.id]!).tagline}
                  </span>
                )}
                {noneCompatible && !stack[c.id] && (
                  <span className="small muted">
                    The catalog has no {ecosystemName(backendEco!)} entry here
                    — that ecosystem's idiom is talking to the database
                    directly (sqlc, pgx, sqlx). Leaving this layer empty is
                    the honest answer.
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {hasTechs && (
            <div className="card">
              <p className="section-label">
                System blueprint — the shape your choices make
              </p>
              <StackDiagram stack={stack} />
            </div>
          )}

          <div className="card">
            <div className="stack-score-row">
              <span className="hero-number">
                {hasTechs ? analysis.overall.toFixed(1) : "—"}
              </span>
              <span className="secondary">
                / 10 <strong>emergent</strong> fit for{" "}
                <strong>{effScenarioName}</strong> priorities
                {hasTechs && gap > 0.05 && (
                  <>
                    {" "}
                    — naive averaging would claim{" "}
                    <strong>{analysis.naiveOverall.toFixed(1)}</strong>; the
                    gap is your weakest links
                  </>
                )}
              </span>
              <button
                className="chip"
                style={{ marginLeft: "auto" }}
                onClick={copyAdr}
                disabled={!hasTechs}
              >
                {copied ? "Copied ✓" : "Copy as ADR draft"}
              </button>
            </div>
            {hasTechs && (
              <div className="floor-row">
                {floorDims.map((d) => {
                  const culprit = analysis.culprits[d.key];
                  return (
                    <span
                      key={d.key}
                      className="floor-chip"
                      title={`${d.label}: the stack is only as good as its weakest layer here${culprit ? ` — currently ${culprit.name}` : ""}`}
                    >
                      {d.label.replace(" & ", "/")} floor{" "}
                      <strong>{analysis.emergentProfile[d.key].toFixed(0)}</strong>
                      {culprit && (
                        <span className="muted"> · {culprit.name}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            <p className="small muted" style={{ margin: "0.5rem 0 0" }}>
              Floors, not averages: ops load, type safety, performance,
              scalability, and maturity are set by your weakest layer — your
              pager doesn't compute means. Scores are within-layer relative and
              adjusted for your org context.
            </p>
          </div>

          {(blockers.length > 0 || warnings.length > 0 || synergies.length > 0) && (
            <div className="card">
              <p className="section-label">What your combination implies</p>
              <div className="note-list">
                {blockers.map((n, i) => (
                  <div className="note blocker" key={`b${i}`}>
                    <span className="icon">⛔</span>
                    <span>{n.text}</span>
                  </div>
                ))}
                {warnings.map((n, i) => (
                  <div className="note warning" key={`w${i}`}>
                    <span className="icon">⚠️</span>
                    <span>{n.text}</span>
                  </div>
                ))}
                {synergies.map((n, i) => (
                  <div className="note synergy" key={`s${i}`}>
                    <span className="icon">✓</span>
                    <span>{n.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasTechs && (
            <div className="card">
              <p className="section-label">
                Average vs emergent — the systems-thinking gap
              </p>
              <ChartLegend
                series={[
                  {
                    id: "avg",
                    name: "Simple average (what a spreadsheet claims)",
                    color: "var(--muted)",
                  },
                  {
                    id: "emergent",
                    name: "Emergent (weakest link sets floors)",
                    color: "var(--series-1)",
                  },
                ]}
              />
              <RadarChart
                series={[
                  {
                    id: "avg",
                    name: "Simple average",
                    color: "var(--muted)",
                    values: analysis.averageProfile,
                  },
                  {
                    id: "emergent",
                    name: "Emergent",
                    color: "var(--series-1)",
                    values: analysis.emergentProfile,
                  },
                ]}
              />
              <ScoreTable techs={analysis.techs} weights={effWeights} ctx={effCtx} />
            </div>
          )}

          {hasTechs && (
            <div className="card">
              <p className="section-label">
                Stress lens — the same stack, eighteen months later
              </p>
              <div className="stress-list">
                {STRESS_EVENTS.map((ev) => {
                  const cracks = stressTest(analysis, ev);
                  return (
                    <div className="stress-event" key={ev.id}>
                      <div className="stress-head">
                        <strong>{ev.name}</strong>
                        <span
                          className={`stress-verdict ${cracks.length ? "cracks" : "absorbs"}`}
                        >
                          {cracks.length
                            ? `${cracks.length} crack${cracks.length > 1 ? "s" : ""}`
                            : "absorbs"}
                        </span>
                      </div>
                      <p className="small muted" style={{ margin: "0.15rem 0 0.35rem" }}>
                        {ev.description}
                      </p>
                      {cracks.map((c, i) => (
                        <div className="stress-crack" key={i}>
                          <span>
                            <strong>{c.tech.name}</strong> —{" "}
                            {DIMENSION_MAP[c.dim].label.toLowerCase()} {c.score}
                          </span>
                          {c.exits.length > 0 && (
                            <span className="small secondary">
                              exits:{" "}
                              {c.exits.map((x, j) => (
                                <span key={x.techId}>
                                  {j > 0 && ", "}
                                  {getTech(x.techId).name}{" "}
                                  <EffortBadge effort={x.effort} />
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasTechs && analysis.commitments.length > 0 && (
            <div className="card">
              <p className="section-label">
                The obligations ledger — what this stack signs you up for
              </p>
              <p className="small muted" style={{ margin: "0 0 0.6rem" }}>
                Second-order costs that appear on no feature list. Seniors
                carry this list in their heads; now it's on the table.
              </p>
              <div className="ledger">
                {analysis.commitments.map(({ tech, items }) => (
                  <div className="ledger-group" key={tech.id}>
                    <p className="ledger-tech">{tech.name}</p>
                    <ul>
                      {items.map((c, i) => (
                        <li key={i}>
                          <strong>{c.need}</strong>
                          <span className="muted"> — {c.why}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
