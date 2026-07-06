import type { Challenge } from "../data/challenges";
import { CHALLENGES } from "../data/challenges";
import type { Game } from "../lib/game";
import { GAME_MODE_LABELS, GAMES } from "../data/games";
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
  activeGameId,
  onTakeGame,
}: {
  activeChallengeId: string | null;
  onTake: (ch: Challenge) => void;
  activeGameId: string | null;
  onTakeGame: (g: Game) => void;
}) {
  return (
    <div>
      <h2 style={{ marginTop: "1.25rem" }}>Scenario games</h2>
      <p className="secondary" style={{ margin: "0 0 0", maxWidth: "52rem" }}>
        Architect your way <em>out</em> of something. You start from a concrete
        stack and every change costs effort points priced by the catalog's
        migration ratings — drop-in <strong>1</strong>, migration{" "}
        <strong>2</strong>, rewrite <strong>4</strong> (adding or
        decommissioning a layer costs 1). Real architecture is the affordable
        path, not the ideal endpoint.
      </p>
      <div className="challenge-grid">
        {GAMES.map((g) => {
          const active = g.id === activeGameId;
          return (
            <div className={`card challenge-card${active ? " active" : ""}`} key={g.id}>
              <p className="section-label">{GAME_MODE_LABELS[g.mode]}</p>
              <h3 style={{ marginBottom: "0.25rem" }}>{g.name}</h3>
              <p className="small secondary">{g.brief}</p>
              <div className="chip-row" style={{ marginBottom: "0.75rem" }}>
                <span className="target-chip">
                  {g.stages.length} stage{g.stages.length > 1 ? "s" : ""}
                </span>
                {g.stages[0].effortBudget !== undefined ? (
                  <span className="target-chip">
                    budget: {g.stages.map((s) => s.effortBudget ?? "—").join(" · ")}
                  </span>
                ) : (
                  <span className="target-chip">stage 1: free build</span>
                )}
              </div>
              <button className="chip take-chip" onClick={() => onTakeGame(g)}>
                {active ? "Resume in Stack Builder →" : "Play →"}
              </button>
            </div>
          );
        })}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Design challenges</h2>
      <p className="secondary" style={{ margin: "0 0 0", maxWidth: "52rem" }}>
        Freeform builds under constraints — no budget, just judgment. Each card
        locks the priority weights and org context to its world and scores your
        Stack Builder work live. Floors check the <strong>emergent</strong>{" "}
        profile — a great average with one weak layer will fail, exactly like
        production.
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
