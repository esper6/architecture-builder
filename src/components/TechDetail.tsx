import type { Relation, Tech, TechId } from "../data/types";
import { DIMENSIONS } from "../data/dimensions";
import { CATEGORY_MAP } from "../data/categories";
import { getTech } from "../data";
import { ecosystemName } from "../lib/scoring";

function RelationList({
  relations,
  onNavigate,
}: {
  relations: Relation[];
  onNavigate: (id: TechId) => void;
}) {
  return (
    <div className="relation-list">
      {relations.map((r) => {
        const target = getTech(r.techId);
        return (
          <div className="relation-item" key={r.techId}>
            <button className="rel-name" onClick={() => onNavigate(r.techId)}>
              {target.name}
            </button>
            <span className="pill">{CATEGORY_MAP[target.category].name}</span>
            <p className="rel-note">{r.note}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Full profile of one technology — the knowledge base page for it. */
export function TechDetail({
  tech,
  onNavigate,
}: {
  tech: Tech;
  onNavigate: (id: TechId) => void;
}) {
  return (
    <div className="tech-detail">
      <div>
        <h2>
          {tech.name}
          <span className="pill">{CATEGORY_MAP[tech.category].name}</span>
          {tech.ecosystem && (
            <span className="pill">{ecosystemName(tech.ecosystem)}</span>
          )}
        </h2>
        <p className="tagline">{tech.tagline}</p>
      </div>
      <p className="secondary" style={{ margin: 0 }}>
        {tech.description}
      </p>

      <div>
        <p className="section-label">Scores (relative to this category)</p>
        <div className="table-scroll">
          <table className="score-table">
            <tbody>
              {DIMENSIONS.map((d) => [
                <tr key={d.key}>
                  <td style={{ whiteSpace: "nowrap" }} title={d.question}>
                    {d.label}
                  </td>
                  <td style={{ width: "40%" }}>
                    <div className="score-track">
                      <div
                        className="score-fill"
                        style={{ width: `${tech.scores[d.key] * 10}%` }}
                      />
                    </div>
                  </td>
                  <td className="num">{tech.scores[d.key]}</td>
                  <td className="score-notes-row">
                    {tech.scoreNotes?.[d.key] ?? ""}
                  </td>
                </tr>,
                ...(tech.subScores?.[d.key] ?? []).map((s) => (
                  <tr key={`${d.key}-${s.label}`} className="sub">
                    <td>↳ {s.label}</td>
                    <td>
                      <div className="score-track">
                        <div
                          className="score-fill sub-fill"
                          style={{ width: `${s.value * 10}%` }}
                        />
                      </div>
                    </td>
                    <td className="num">{s.value}</td>
                    <td className="score-notes-row">{s.note ?? ""}</td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </div>

      {(() => {
        const native = CATEGORY_MAP[tech.category].nativeDimensions ?? [];
        if (native.length === 0 || !tech.nativeScores) return null;
        return (
          <div>
            <p className="section-label">
              {CATEGORY_MAP[tech.category].name}-specific dimensions
            </p>
            <div className="table-scroll">
              <table className="score-table">
                <tbody>
                  {native.map((nd) => (
                    <tr key={nd.key}>
                      <td style={{ whiteSpace: "nowrap" }} title={nd.question}>
                        {nd.label}
                      </td>
                      <td style={{ width: "40%" }}>
                        <div className="score-track">
                          <div
                            className="score-fill"
                            style={{
                              width: `${(tech.nativeScores?.[nd.key] ?? 0) * 10}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="num">{tech.nativeScores?.[nd.key] ?? "—"}</td>
                      <td className="score-notes-row">
                        {tech.nativeScoreNotes?.[nd.key] ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted" style={{ margin: "0.4rem 0 0" }}>
              Axes that only make sense for this layer — shown for depth, not
              part of the radar or weighted rankings.
            </p>
          </div>
        );
      })()}

      <div className="two-col">
        <div className="plus-minus">
          <p className="section-label">Strengths</p>
          <ul>
            {tech.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="plus-minus">
          <p className="section-label">Weaknesses</p>
          <ul>
            {tech.weaknesses.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="two-col">
        <div className="plus-minus">
          <p className="section-label">Choose it when…</p>
          <ul>
            {tech.chooseWhen.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="plus-minus">
          <p className="section-label">Avoid it when…</p>
          <ul>
            {tech.avoidWhen.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {tech.alternatives.length > 0 && (
        <div>
          <p className="section-label">Alternatives — and when to switch</p>
          <RelationList relations={tech.alternatives} onNavigate={onNavigate} />
        </div>
      )}

      {tech.pairsWellWith && tech.pairsWellWith.length > 0 && (
        <div>
          <p className="section-label">Pairs well with</p>
          <RelationList relations={tech.pairsWellWith} onNavigate={onNavigate} />
        </div>
      )}

      {tech.frictionWith && tech.frictionWith.length > 0 && (
        <div>
          <p className="section-label">Friction with</p>
          <RelationList relations={tech.frictionWith} onNavigate={onNavigate} />
        </div>
      )}

      {tech.notInterchangeableWith && tech.notInterchangeableWith.length > 0 && (
        <div className="confused-block">
          <p className="section-label" style={{ marginBottom: "0.4rem" }}>
            Commonly confused — not interchangeable
          </p>
          <RelationList
            relations={tech.notInterchangeableWith}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
}
