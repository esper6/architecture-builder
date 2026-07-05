import type { OrgContext, Tech } from "../data/types";
import { DIMENSIONS } from "../data/dimensions";
import { CATEGORY_MAP } from "../data/categories";
import type { Weights } from "../lib/scoring";
import { effective, weightedOf } from "../lib/scoring";

function isBest(count: number, value: number | undefined, best: number) {
  return count > 1 && value !== undefined && value === best;
}

/** Winning value rendered as a filled pill — marked by shape, not color alone. */
function Value({
  value,
  best,
  strong = false,
}: {
  value: number | string;
  best: boolean;
  strong?: boolean;
}) {
  const text = strong ? <strong>{value}</strong> : value;
  return best ? <span className="win-pill">{text}</span> : <>{text}</>;
}

/**
 * The table-view twin of the radar — every charted value, readable without
 * color. Best value per dimension is bolded (ties all bold).
 *
 * With `showNative` (Compare view, where all techs share a category), the
 * category's native dimensions render as an extra section. They are display
 * only — never part of the radar or the weighted score.
 */
export function ScoreTable({
  techs,
  weights,
  ctx,
  showNative = false,
}: {
  techs: Tech[];
  weights: Weights;
  /** When provided, cells show context-adjusted scores (marked with °). */
  ctx?: OrgContext;
  showNative?: boolean;
}) {
  if (techs.length === 0) return null;

  const effs = techs.map((t) =>
    ctx ? effective(t, ctx) : { tech: t, scores: t.scores, applied: [] },
  );
  const category = CATEGORY_MAP[techs[0].category];
  const native =
    showNative &&
    techs.every((t) => t.category === category.id) &&
    (category.nativeDimensions ?? []).length > 0
      ? (category.nativeDimensions ?? [])
      : [];

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
            const best = Math.max(...effs.map((e) => e.scores[d.key]));
            return (
              <tr key={d.key}>
                <td title={d.question}>{d.label}</td>
                {effs.map((e) => {
                  const adjusted = e.scores[d.key] !== e.tech.scores[d.key];
                  const whys = e.applied
                    .filter((m) => m.delta[d.key])
                    .map((m) => m.why)
                    .join(" ");
                  return (
                    <td
                      className="num"
                      key={e.tech.id}
                      title={
                        adjusted
                          ? `Base ${e.tech.scores[d.key]}, adjusted for your org context: ${whys}`
                          : e.tech.scoreNotes?.[d.key]
                      }
                    >
                      <Value
                        value={adjusted ? `${e.scores[d.key]}°` : e.scores[d.key]}
                        best={isBest(techs.length, e.scores[d.key], best)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            <td>
              <strong>Weighted score</strong>
            </td>
            {(() => {
              const totals = effs.map((e) => weightedOf(e.scores, weights));
              const best = Math.max(...totals);
              return effs.map((e, i) => (
                <td className="num" key={e.tech.id}>
                  <Value
                    value={totals[i].toFixed(1)}
                    best={isBest(techs.length, totals[i], best)}
                    strong
                  />
                </td>
              ));
            })()}
          </tr>
          {native.length > 0 && (
            <tr>
              <td
                colSpan={techs.length + 1}
                className="native-header"
                title="Axes specific to this layer — shown for depth, not part of the radar or weighted score"
              >
                {category.name}-specific dimensions
              </td>
            </tr>
          )}
          {native.map((nd) => {
            const values = techs.map((t) => t.nativeScores?.[nd.key]);
            const best = Math.max(
              ...values.filter((v): v is number => v !== undefined),
            );
            return (
              <tr key={nd.key}>
                <td title={nd.question}>{nd.label}</td>
                {techs.map((t, i) => (
                  <td
                    className="num"
                    key={t.id}
                    title={t.nativeScoreNotes?.[nd.key]}
                  >
                    <Value
                      value={values[i] ?? "—"}
                      best={isBest(techs.length, values[i], best)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
