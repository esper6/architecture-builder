import type { Challenge } from "../data/challenges";
import { CHALLENGES } from "../data/challenges";
import { SCENARIO_MAP } from "../data/scenarios";
import { describeContext } from "../data/context";
import { CATEGORY_MAP } from "../data/categories";
import { DIMENSION_MAP } from "../data/dimensions";
import type { DimensionKey } from "../data/types";

function targetSummary(ch: Challenge): string[] {
  const t = ch.targets;
  const parts: string[] = [];
  if (t.minOverall !== undefined) parts.push(`Overall fit ≥ ${t.minOverall}`);
  if (t.noBlockers) parts.push("No blockers");
  if (t.maxWarnings !== undefined)
    parts.push(`≤ ${t.maxWarnings} warning${t.maxWarnings === 1 ? "" : "s"}`);
  for (const [dim, floor] of Object.entries(t.floors ?? {})) {
    parts.push(`${DIMENSION_MAP[dim as DimensionKey].label} floor ≥ ${floor}`);
  }
  for (const layer of t.requiredLayers ?? []) {
    parts.push(`${CATEGORY_MAP[layer].name} required`);
  }
  return parts;
}

/**
 * Scenario cards to design against. Taking one locks the weights and org
 * context to the challenge's world and scores your Stack Builder work live —
 * the same engine, no separate answer key (ADR-008).
 */
export function ChallengesView({
  activeChallengeId,
  onTake,
}: {
  activeChallengeId: string | null;
  onTake: (ch: Challenge) => void;
}) {
  return (
    <div>
      <p className="secondary" style={{ margin: "1rem 0 0", maxWidth: "52rem" }}>
        Reading about tradeoffs is one thing; designing under constraints is
        the actual skill. Each card locks the priority weights and org context
        to its world and scores your Stack Builder work live. Floors check the{" "}
        <strong>emergent</strong> profile — a great average with one weak layer
        will fail, exactly like production.
      </p>
      <div className="challenge-grid">
        {CHALLENGES.map((ch) => {
          const active = ch.id === activeChallengeId;
          return (
            <div className={`card challenge-card${active ? " active" : ""}`} key={ch.id}>
              <h3 style={{ marginBottom: "0.25rem" }}>{ch.name}</h3>
              <p className="small secondary">{ch.brief}</p>
              <p className="small muted" style={{ margin: "0 0 0.5rem" }}>
                <strong>{SCENARIO_MAP[ch.scenarioId].name}</strong> weights ·{" "}
                {describeContext(ch.context)}
                {ch.presetStack && " · starts with an inherited stack"}
              </p>
              <div className="chip-row" style={{ marginBottom: "0.75rem" }}>
                {targetSummary(ch).map((p, i) => (
                  <span className="target-chip" key={i}>
                    {p}
                  </span>
                ))}
              </div>
              <button className="chip take-chip" onClick={() => onTake(ch)}>
                {active ? "Resume in Stack Builder →" : "Take this challenge →"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
