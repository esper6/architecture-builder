import { useMemo, useState } from "react";
import type { TechId } from "../data/types";
import { CATEGORIES } from "../data/categories";
import { DIMENSION_MAP } from "../data/dimensions";
import { getTech, techsIn } from "../data";
import type { Stack, Weights } from "../lib/scoring";
import {
  analyzeStack,
  ecosystemName,
  stackToMarkdown,
} from "../lib/scoring";
import { ChartLegend, RadarChart } from "../components/RadarChart";
import { ScoreTable } from "../components/ScoreTable";

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
  stack,
  onStackChange,
}: {
  weights: Weights;
  scenarioName: string;
  stack: Stack;
  onStackChange: (stack: Stack) => void;
}) {
  const [copied, setCopied] = useState(false);
  const analysis = useMemo(() => analyzeStack(stack, weights), [stack, weights]);

  const backendId = stack.backend;
  const backendEco = backendId ? getTech(backendId).ecosystem : undefined;

  function setSlot(categoryId: (typeof CATEGORIES)[number]["id"], value: string) {
    const next = { ...stack };
    if (value === "") delete next[categoryId];
    else next[categoryId] = value as TechId;
    onStackChange(next);
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(
      stackToMarkdown(stack, weights, scenarioName),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const blockers = analysis.notes.filter((n) => n.kind === "blocker");
  const warnings = analysis.notes.filter((n) => n.kind === "warning");
  const synergies = analysis.notes.filter((n) => n.kind === "synergy");

  return (
    <div>
      <div style={{ marginTop: "1rem" }}>
        <p className="section-label">Start from an archetype (or build from scratch)</p>
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

      <div className="stack-layout">
        <div className="slot-list">
          {CATEGORIES.map((c) => {
            const options = techsIn(c.id);
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
                    {c.optionalInStack ? "— none —" : "— choose —"}
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
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="stack-score-row">
              <span className="hero-number">
                {analysis.techs.length ? analysis.overall.toFixed(1) : "—"}
              </span>
              <span className="secondary">
                / 10 fit for <strong>{scenarioName}</strong> priorities ·{" "}
                {analysis.techs.length} layer
                {analysis.techs.length === 1 ? "" : "s"} chosen
              </span>
              <button
                className="chip"
                style={{ marginLeft: "auto" }}
                onClick={copyMarkdown}
                disabled={analysis.techs.length === 0}
              >
                {copied ? "Copied ✓" : "Copy as Markdown"}
              </button>
            </div>
            <p className="small muted" style={{ margin: "0.5rem 0 0" }}>
              Scores are within-layer relative, so this number compares stack
              variants against each other — it is not an absolute grade.
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

          {analysis.techs.length > 0 && (
            <div className="card">
              <p className="section-label">
                Stack profile (average across chosen layers)
              </p>
              <RadarChart
                series={[
                  {
                    id: "stack",
                    name: "Your stack",
                    color: "var(--series-1)",
                    values: analysis.profile,
                  },
                ]}
              />
              <ChartLegend
                series={[
                  { id: "stack", name: "Your stack", color: "var(--series-1)" },
                ]}
              />
              <ScoreTable techs={analysis.techs} weights={weights} />
              <p className="small muted" style={{ marginTop: "0.5rem" }}>
                Weakest dimension:{" "}
                <strong>
                  {
                    DIMENSION_MAP[
                      Object.entries(analysis.profile).sort(
                        (a, b) => a[1] - b[1],
                      )[0][0] as keyof typeof DIMENSION_MAP
                    ].label
                  }
                </strong>{" "}
                — the table shows which layer drags it down.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
