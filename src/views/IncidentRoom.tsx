import type { Incident } from "../data/incidents";
import { INCIDENTS } from "../data/incidents";
import type { TechId } from "../data/types";
import { CATEGORIES } from "../data/categories";
import { getTech } from "../data";
import { usePersistentState } from "../lib/usePersistentState";
import { StackDiagram } from "../components/StackDiagram";

/**
 * The incident room: diagnosis gameplay (ADR-011). You're handed the pager,
 * not the whiteboard — read the symptoms, accuse a layer, name the
 * mechanism, receive the postmortem. Wrong accusations return specific
 * exonerations; they're half the curriculum.
 */

interface IncidentState {
  openId: string | null;
  accusedWrong: TechId[];
  foundCulprit: boolean;
  wrongMechanisms: string[];
  foundMechanism: boolean;
}

const FRESH: IncidentState = {
  openId: null,
  accusedWrong: [],
  foundCulprit: false,
  wrongMechanisms: [],
  foundMechanism: false,
};

function stackTechs(incident: Incident): TechId[] {
  return CATEGORIES.map((c) => incident.stack[c.id]).filter(
    (id): id is TechId => Boolean(id),
  );
}

export function IncidentRoom() {
  const [state, setState] = usePersistentState<IncidentState>(
    "ab.incident",
    FRESH,
  );

  const incident = INCIDENTS.find((i) => i.id === state.openId) ?? null;

  function open(id: string) {
    setState({ ...FRESH, openId: id });
  }

  function accuse(techId: TechId) {
    if (!incident || state.foundCulprit) return;
    if (techId === incident.culprit) {
      setState({ ...state, foundCulprit: true });
    } else if (!state.accusedWrong.includes(techId)) {
      setState({ ...state, accusedWrong: [...state.accusedWrong, techId] });
    }
  }

  function pickMechanism(id: string) {
    if (!incident || state.foundMechanism) return;
    const mech = incident.mechanisms.find((m) => m.id === id);
    if (!mech) return;
    if (mech.correct) {
      setState({ ...state, foundMechanism: true });
    } else if (!state.wrongMechanisms.includes(id)) {
      setState({ ...state, wrongMechanisms: [...state.wrongMechanisms, id] });
    }
  }

  /* ---------- list ---------- */
  if (!incident) {
    return (
      <div>
        <h2 style={{ marginTop: "2rem" }}>Incident room</h2>
        <p className="secondary" style={{ margin: "0 0 0", maxWidth: "52rem" }}>
          The other modes train the <em>write</em> direction — choosing well.
          This one trains the <em>read</em> direction: production is
          misbehaving, and you must reason backward from symptoms to which
          layer's known tradeoff just fired. Accuse a component on the
          blueprint; wrong accusations earn specific exonerations, and those
          are half the lesson.
        </p>
        <div className="challenge-grid">
          {INCIDENTS.map((inc) => (
            <div className="card challenge-card" key={inc.id}>
              <p className="section-label">Incident · diagnose the culprit</p>
              <h3 style={{ marginBottom: "0.25rem" }}>{inc.name}</h3>
              <p className="small secondary">{inc.teaser}</p>
              <button className="chip take-chip" onClick={() => open(inc.id)}>
                Take the pager →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- player ---------- */
  const techs = stackTechs(incident);
  const lastWrong = state.accusedWrong[state.accusedWrong.length - 1];
  const highlights: Partial<Record<TechId, "correct" | "wrong">> = {};
  for (const t of state.accusedWrong) highlights[t] = "wrong";
  if (state.foundCulprit) highlights[incident.culprit] = "correct";

  const guesses = state.accusedWrong.length + (state.foundCulprit ? 1 : 0);
  const mechTries =
    state.wrongMechanisms.length + (state.foundMechanism ? 1 : 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginTop: "2rem" }}>
        <h2 style={{ margin: 0 }}>🚨 {incident.name}</h2>
        <button className="chip" onClick={() => setState(FRESH)}>
          ← All incidents
        </button>
      </div>

      <div className="incident-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <p className="section-label">The page</p>
            <p className="secondary" style={{ margin: 0 }}>
              {incident.narrative}
            </p>
          </div>
          <div className="card">
            <p className="section-label">Timeline & evidence</p>
            <div className="incident-timeline">
              {incident.timeline.map((t, i) => (
                <div className="timeline-row" key={i}>
                  <span className="timeline-time">{t.time}</span>
                  <span>{t.entry}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <p className="section-label">
              The system — {state.foundCulprit ? "culprit identified" : "accuse a component"}
            </p>
            <StackDiagram
              stack={incident.stack}
              onTechClick={state.foundCulprit ? undefined : accuse}
              highlights={highlights}
            />
            <div className="chip-row" style={{ marginTop: "0.5rem" }}>
              {techs.map((id) => {
                const wrong = state.accusedWrong.includes(id);
                const right = state.foundCulprit && id === incident.culprit;
                return (
                  <button
                    key={id}
                    className={`chip suspect-chip${wrong ? " wrong" : ""}${right ? " right" : ""}`}
                    onClick={() => accuse(id)}
                    disabled={state.foundCulprit || wrong}
                  >
                    {getTech(id).name}
                  </button>
                );
              })}
            </div>
            {!state.foundCulprit && lastWrong && (
              <div className="verdict-note wrong-note">
                <strong>{getTech(lastWrong).name} — exonerated.</strong>{" "}
                {incident.redHerrings[lastWrong] ??
                  "The evidence doesn't point there. Re-read the timeline: what changed, and when?"}
              </div>
            )}
            {state.foundCulprit && (
              <div className="verdict-note right-note">
                {incident.culpritReveal}
              </div>
            )}
          </div>

          {state.foundCulprit && (
            <div className="card">
              <p className="section-label">
                Root cause — what actually happened?
              </p>
              <div className="mechanism-list">
                {incident.mechanisms.map((m) => {
                  const wrong = state.wrongMechanisms.includes(m.id);
                  const right = state.foundMechanism && m.correct;
                  return (
                    <div key={m.id}>
                      <button
                        className={`mechanism-option${wrong ? " wrong" : ""}${right ? " right" : ""}`}
                        onClick={() => pickMechanism(m.id)}
                        disabled={state.foundMechanism || wrong}
                      >
                        {m.text}
                      </button>
                      {(wrong || right) && (
                        <p className={`small mechanism-debrief ${right ? "right-text" : "wrong-text"}`}>
                          {m.debrief}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {state.foundMechanism && (
            <div className="card postmortem">
              <p className="section-label">
                Postmortem — resolved in {guesses} accusation
                {guesses === 1 ? "" : "s"}, {mechTries} mechanism attempt
                {mechTries === 1 ? "" : "s"}
              </p>
              <p className="small">
                <strong>Root cause.</strong> {incident.postmortem.rootCause}
              </p>
              <p className="small" style={{ marginBottom: "0.25rem" }}>
                <strong>Contributing factors.</strong>
              </p>
              <ul className="small" style={{ marginTop: 0 }}>
                {incident.postmortem.contributing.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p className="small" style={{ marginBottom: "0.25rem" }}>
                <strong>Remediation.</strong>
              </p>
              <ul className="small" style={{ marginTop: 0 }}>
                {incident.postmortem.fixes.map((f, i) => (
                  <li key={i}>
                    <span className={`pill fix-${f.kind}`}>{f.kind}</span>{" "}
                    {f.action}
                  </li>
                ))}
              </ul>
              <p className="small lesson">
                <strong>The lesson.</strong> {incident.postmortem.lesson}
              </p>
              <button className="chip take-chip" onClick={() => setState(FRESH)}>
                Take another pager →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
