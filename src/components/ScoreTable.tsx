import type { Tech } from "../data/types";
import { DIMENSIONS } from "../data/dimensions";
import type { Weights } from "../lib/scoring";
import { weightedScore } from "../lib/scoring";

/**
 * The table-view twin of the radar — every charted value, readable without
 * color. Best value per dimension is bolded (ties all bold).
 */
export function ScoreTable({
  techs,
  weights,
}: {
  techs: Tech[];
  weights: Weights;
}) {
  if (techs.length === 0) return null;
  return (
    <div className="table-scroll">
      <table className="score-table">
        <thead>
          <tr>
            <th>Dimension</th>
            {techs.map((t) => (
              <th className="num" key={t.id}>
                {t.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DIMENSIONS.map((d) => {
            const best = Math.max(...techs.map((t) => t.scores[d.key]));
            return (
              <tr key={d.key}>
                <td title={d.question}>{d.label}</td>
                {techs.map((t) => (
                  <td
                    className={`num${techs.length > 1 && t.scores[d.key] === best ? " best" : ""}`}
                    key={t.id}
                    title={t.scoreNotes?.[d.key]}
                  >
                    {t.scores[d.key]}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td>
              <strong>Weighted score</strong>
            </td>
            {(() => {
              const totals = techs.map((t) => weightedScore(t, weights));
              const best = Math.max(...totals);
              return techs.map((t, i) => (
                <td
                  className={`num${techs.length > 1 && totals[i] === best ? " best" : ""}`}
                  key={t.id}
                >
                  <strong>{totals[i].toFixed(1)}</strong>
                </td>
              ));
            })()}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
