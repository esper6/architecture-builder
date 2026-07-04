import { useState } from "react";
import type { TechId } from "../data/types";
import { CATEGORIES, CATEGORY_MAP } from "../data/categories";
import { confusedWith, getTech, replacementTargets, techsIn } from "../data";

/**
 * Substitution explorer: for any technology, what can stand in its place,
 * what it can stand in for, and what it's commonly confused with. Reverse
 * edges are derived, so every authored "alternative" teaches in both
 * directions for free.
 */
export function SwapView() {
  const [selected, setSelected] = useState<TechId>("react");
  const tech = getTech(selected);

  const replacedBy = tech.alternatives; // things that can stand in for it
  const canReplace = replacementTargets(selected); // things it can stand in for
  const confused = confusedWith(selected);

  return (
    <div className="swap-layout">
      <div className="card swap-picker">
        {CATEGORIES.map((c) => (
          <div key={c.id}>
            <p className="section-label">{c.name}</p>
            <div className="chip-row">
              {techsIn(c.id).map((t) => (
                <button
                  key={t.id}
                  className={`chip${t.id === selected ? " active" : ""}`}
                  onClick={() => setSelected(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="card">
          <h2 style={{ marginBottom: "0.2rem" }}>
            {tech.name}
            <span className="pill">{CATEGORY_MAP[tech.category].name}</span>
          </h2>
          <p className="tagline" style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>
            {tech.tagline}
          </p>
          <p className="secondary" style={{ margin: 0 }}>
            {tech.description}
          </p>
        </div>

        <div className="swap-columns">
          <div className="card">
            <p className="section-label">
              ⟵ What can stand in for {tech.name}
            </p>
            {replacedBy.length === 0 ? (
              <p className="muted small">No authored substitutes.</p>
            ) : (
              <div className="relation-list">
                {replacedBy.map((r) => {
                  const t = getTech(r.techId);
                  return (
                    <div className="relation-item" key={r.techId}>
                      <button className="rel-name" onClick={() => setSelected(r.techId)}>
                        {t.name}
                      </button>
                      {t.category !== tech.category && (
                        <span className="pill">
                          {CATEGORY_MAP[t.category].name} — cross-layer
                        </span>
                      )}
                      <p className="rel-note">{r.note}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <p className="section-label">
              ⟶ What {tech.name} can stand in for
            </p>
            {canReplace.length === 0 ? (
              <p className="muted small">
                Nothing in the catalog lists {tech.name} as its substitute.
              </p>
            ) : (
              <div className="relation-list">
                {canReplace.map((e) => (
                  <div className="relation-item" key={e.from.id}>
                    <button className="rel-name" onClick={() => setSelected(e.from.id)}>
                      {e.from.name}
                    </button>
                    {e.from.category !== tech.category && (
                      <span className="pill">
                        {CATEGORY_MAP[e.from.category].name} — cross-layer
                      </span>
                    )}
                    <p className="rel-note">{e.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {confused.length > 0 && (
          <div className="confused-block">
            <p className="section-label">
              Commonly confused with {tech.name} — but NOT interchangeable
            </p>
            <div className="relation-list">
              {confused.map((e) => (
                <div className="relation-item" key={e.from.id}>
                  <button className="rel-name" onClick={() => setSelected(e.from.id)}>
                    {e.from.name}
                  </button>
                  <span className="pill">{CATEGORY_MAP[e.from.category].name}</span>
                  <p className="rel-note">{e.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
