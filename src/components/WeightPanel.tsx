import { DIMENSIONS } from "../data/dimensions";
import { SCENARIOS } from "../data/scenarios";
import type { Weights } from "../lib/scoring";

/**
 * The single filter row that scopes every chart: pick a scenario preset or
 * drag sliders (which switches to "custom"). Shared between Compare and
 * Stack Builder so a priority profile follows you across views.
 */
export function WeightPanel({
  weights,
  scenarioId,
  onChange,
}: {
  weights: Weights;
  scenarioId: string;
  onChange: (weights: Weights, scenarioId: string) => void;
}) {
  const active = SCENARIOS.find((s) => s.id === scenarioId);

  return (
    <div className="card weight-panel">
      <div>
        <p className="section-label">Priority profile — what does this project care about?</p>
        <div className="chip-row">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`chip${s.id === scenarioId ? " active" : ""}`}
              onClick={() => onChange({ ...s.weights }, s.id)}
              title={s.description}
            >
              {s.name}
            </button>
          ))}
          {scenarioId === "custom" && <span className="chip active">Custom</span>}
        </div>
        {active && (
          <p className="small muted" style={{ margin: "0.5rem 0 0" }}>
            {active.description}
          </p>
        )}
      </div>
      <div className="weight-sliders">
        {DIMENSIONS.map((d) => (
          <div className="weight-row" key={d.key}>
            <label htmlFor={`w-${d.key}`} title={d.question}>
              {d.label}
            </label>
            <input
              id={`w-${d.key}`}
              type="range"
              min={0}
              max={2}
              step={0.25}
              value={weights[d.key]}
              onChange={(e) =>
                onChange(
                  { ...weights, [d.key]: Number(e.target.value) },
                  "custom",
                )
              }
            />
            <span className="weight-value">{weights[d.key].toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
