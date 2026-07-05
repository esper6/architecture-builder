import type { OrgContext, TeamSize } from "../data/types";
import { TEAM_SIZE_LABELS } from "../data/context";

const TEAM_SIZES: TeamSize[] = ["small", "mid", "large"];

/**
 * The org-context row — Conway's Law as an input. Sits beside the priority
 * weights and scopes every score in Compare and Stack Builder. Changing it
 * visibly re-ranks technologies; each adjustment carries its rationale.
 */
export function ContextPanel({
  ctx,
  onChange,
}: {
  ctx: OrgContext;
  onChange: (ctx: OrgContext) => void;
}) {
  return (
    <div className="card context-panel">
      <p className="section-label">
        Org context — who is building this? (Conway's Law is an input)
      </p>
      <div className="context-row">
        <div className="context-group">
          <span className="context-group-label">Team size</span>
          <div className="chip-row">
            {TEAM_SIZES.map((s) => (
              <button
                key={s}
                className={`chip${ctx.teamSize === s ? " active" : ""}`}
                onClick={() => onChange({ ...ctx, teamSize: s })}
              >
                {TEAM_SIZE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="context-group">
          <span className="context-group-label">Platform team</span>
          <div className="chip-row">
            <button
              className={`chip${!ctx.platformTeam ? " active" : ""}`}
              onClick={() => onChange({ ...ctx, platformTeam: false })}
            >
              None
            </button>
            <button
              className={`chip${ctx.platformTeam ? " active" : ""}`}
              onClick={() => onChange({ ...ctx, platformTeam: true })}
              title="A dedicated platform/infra team paving roads for product teams"
            >
              Yes
            </button>
          </div>
        </div>
        <div className="context-group">
          <span className="context-group-label">Compliance regime</span>
          <div className="chip-row">
            <button
              className={`chip${!ctx.compliance ? " active" : ""}`}
              onClick={() => onChange({ ...ctx, compliance: false })}
            >
              None
            </button>
            <button
              className={`chip${ctx.compliance ? " active" : ""}`}
              onClick={() => onChange({ ...ctx, compliance: true })}
              title="SOC 2, financial, healthcare — auditors read your diagrams"
            >
              Regulated
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
