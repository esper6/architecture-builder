import { useMemo, useState } from "react";
import type { CategoryId, Tech, TechId } from "../data/types";
import { CATEGORIES, CATEGORY_MAP } from "../data/categories";
import { getTech, techsIn } from "../data";
import type { Weights } from "../lib/scoring";
import { weightedScore } from "../lib/scoring";
import { ChartLegend, RadarChart } from "../components/RadarChart";
import { ScoreTable } from "../components/ScoreTable";
import { TechDetail } from "../components/TechDetail";

const SERIES_VARS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
];

/** Up to four comparison slots. A tech keeps its slot (and color) until
 *  deselected — color follows the entity, never its rank. */
type Slots = (TechId | null)[];

function defaultSlots(category: CategoryId, weights: Weights): Slots {
  const ranked = [...techsIn(category)].sort(
    (a, b) => weightedScore(b, weights) - weightedScore(a, weights),
  );
  return [ranked[0]?.id ?? null, ranked[1]?.id ?? null, null, null];
}

export function CompareView({ weights }: { weights: Weights }) {
  const [category, setCategory] = useState<CategoryId>("architecture");
  const [slots, setSlots] = useState<Slots>(() =>
    defaultSlots("architecture", weights),
  );
  const [detailId, setDetailId] = useState<TechId | null>(null);

  const ranked = useMemo(
    () =>
      [...techsIn(category)]
        .map((t) => ({ tech: t, score: weightedScore(t, weights) }))
        .sort((a, b) => b.score - a.score),
    [category, weights],
  );

  const compared: { tech: Tech; color: string }[] = slots
    .flatMap((id, i) => (id === null ? [] : [{ id, color: SERIES_VARS[i] }]))
    .map((s) => ({ tech: getTech(s.id), color: s.color }));

  function toggle(id: TechId) {
    setSlots((prev) => {
      const at = prev.indexOf(id);
      if (at !== -1) {
        const next = [...prev];
        next[at] = null;
        return next;
      }
      const free = prev.findIndex((s) => s === null);
      if (free === -1) return prev; // 4 max — deselect something first
      const next = [...prev];
      next[free] = id;
      return next;
    });
  }

  function changeCategory(id: CategoryId) {
    setCategory(id);
    setSlots(defaultSlots(id, weights));
    setDetailId(null);
  }

  /** Jump to any tech — possibly in another category — and open its profile. */
  function focusOn(id: TechId) {
    const target = getTech(id);
    if (target.category !== category) {
      setCategory(target.category);
      const base = defaultSlots(target.category, weights);
      const free = base.findIndex((s) => s === null);
      if (!base.includes(id) && free !== -1) base[free] = id;
      setSlots(base);
    } else {
      setSlots((prev) => {
        if (prev.includes(id)) return prev;
        const free = prev.findIndex((s) => s === null);
        if (free === -1) return prev;
        const next = [...prev];
        next[free] = id;
        return next;
      });
    }
    setDetailId(id);
  }

  const detail = detailId ? getTech(detailId) : undefined;
  const maxScore = ranked.length ? ranked[0].score : 10;

  return (
    <div>
      <div className="chip-row" style={{ marginTop: "1rem" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip${c.id === category ? " active" : ""}`}
            onClick={() => changeCategory(c.id)}
            title={c.question}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="secondary" style={{ margin: "0.75rem 0 0", maxWidth: "70rem" }}>
        <strong>{CATEGORY_MAP[category].question}</strong>{" "}
        {CATEGORY_MAP[category].description}
      </p>

      <div className="compare-layout">
        <div>
          <p className="section-label">
            Ranked by your priorities — select up to 4 to compare
          </p>
          <div className="rank-list">
            {ranked.map(({ tech, score }) => {
              const slotIndex = slots.indexOf(tech.id);
              const selected = slotIndex !== -1;
              return (
                <button
                  key={tech.id}
                  className={`rank-item${selected ? " selected" : ""}`}
                  onClick={() => toggle(tech.id)}
                  aria-pressed={selected}
                >
                  <span
                    className="swatch"
                    style={{
                      background: selected
                        ? SERIES_VARS[slotIndex]
                        : "var(--baseline)",
                      opacity: selected ? 1 : 0.35,
                    }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span className="name">{tech.name}</span>
                    <span className="tagline">{tech.tagline}</span>
                  </span>
                  <span className="rank-score">{score.toFixed(1)}</span>
                  <span className="score-track">
                    <span
                      className="score-fill"
                      style={{
                        width: `${(score / Math.max(maxScore, 0.01)) * 100}%`,
                        display: "block",
                        height: "100%",
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <p className="section-label">Tradeoff profile</p>
            {compared.length === 0 ? (
              <p className="muted">Select technologies on the left to compare.</p>
            ) : (
              <>
                <ChartLegend
                  series={compared.map(({ tech, color }) => ({
                    id: tech.id,
                    name: tech.name,
                    color,
                  }))}
                />
                <RadarChart
                  series={compared.map(({ tech, color }) => ({
                    id: tech.id,
                    name: tech.name,
                    color,
                    values: tech.scores,
                  }))}
                />
                <ScoreTable
                  techs={compared.map((c) => c.tech)}
                  weights={weights}
                />
              </>
            )}
          </div>

          <div className="card">
            {detail ? (
              <TechDetail tech={detail} onNavigate={focusOn} />
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                Open a technology's full profile — strengths, weaknesses, when
                to choose it, and what can replace it:
              </p>
            )}
            <div className="chip-row" style={{ marginTop: detail ? "1rem" : "0.6rem" }}>
              {ranked
                .filter(({ tech }) => tech.id !== detailId)
                .map(({ tech }) => (
                  <button
                    key={tech.id}
                    className="chip"
                    onClick={() => setDetailId(tech.id)}
                  >
                    {tech.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
