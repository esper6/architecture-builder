import { DIMENSIONS } from "../data/dimensions";

interface Adr {
  id: string;
  title: string;
  status: string;
  context: string;
  decision: string;
  consequences: string;
}

/**
 * This app documents its own architecture decisions as real ADRs — partly
 * because they're genuinely why it's built this way, mostly because reading
 * a few concrete ADRs is the fastest way to learn the format.
 */
const ADRS: Adr[] = [
  {
    id: "ADR-001",
    title: "Static SPA with no backend",
    status: "Accepted",
    context:
      "The app serves a curated, read-only knowledge base. There is no user data to protect, nothing to persist server-side, and no per-user computation. The previous prototype ran an Express server whose two endpoints only echoed static data and ran arithmetic the browser could do.",
    decision:
      "Ship a fully static single-page app. The knowledge base compiles into the bundle; all scoring runs client-side; user state (your stack, your weights) lives in localStorage.",
    consequences:
      "Hosting is a CDN (free, zero ops, globally fast) and the app works offline once loaded. The costs: the whole catalog ships to every visitor (~acceptable at this size), and any future multi-user feature (sharing stacks by URL is fine; saving them to accounts is not) forces revisiting this decision. Note the shape of this tradeoff: we chose the simplest thing that serves today's requirements and wrote down the trigger that would invalidate it.",
  },
  {
    id: "ADR-002",
    title: "Knowledge base as typed TypeScript modules, not JSON",
    status: "Accepted",
    context:
      "The catalog is a graph: technologies reference each other as alternatives, synergies, frictions, and confusions. In JSON, a typo'd reference ('postgress') fails silently at runtime — the worst failure mode for a teaching tool.",
    decision:
      "Author the catalog as .ts files exporting typed arrays. Every cross-reference is a TechId union member, so a bad reference is a compile error.",
    consequences:
      "The compiler is the data validator — broken edges can't ship. Non-developers can't edit the catalog (acceptable: its authors are developers), and adding a technology means touching the union type plus a data file (a deliberate speed bump that keeps the graph consistent).",
  },
  {
    id: "ADR-003",
    title: "Hand-rolled SVG charts, no chart library",
    status: "Accepted",
    context:
      "The app needs exactly two chart shapes: a radar and score bars. Chart libraries are large dependencies whose APIs churn, and generic libraries fight custom requirements like stable per-entity series colors and a table-view twin for accessibility.",
    decision:
      "Draw the charts as plain SVG in React components (~150 lines total).",
    consequences:
      "Zero dependency weight or churn; complete control over accessibility and theming. We own the geometry math, and each genuinely new chart type is a new component to write — the bet is that two shapes stay two shapes. If chart needs multiply, this decision flips.",
  },
  {
    id: "ADR-004",
    title: "Scores are relative within a category",
    status: "Accepted",
    context:
      "A single absolute scale ('Kafka performance: 9, React performance: 6') implies comparisons across layers that are meaningless — a message broker and a UI library don't compete.",
    decision:
      "Every score is 0–10 relative to peers in the same category; 5 is category-typical. The UI only charts techs from one category together (the stack profile averages across layers and is labeled as such).",
    consequences:
      "Rankings inside a category are honest and legible. The stack-level score is comparative, not absolute — useful for A/B-ing two stack variants, misleading if read as a grade. That caveat is printed next to the number, which is itself a lesson: when a metric can be misread, label it where it appears.",
  },
  {
    id: "ADR-005",
    title: "Scenario weights, not a recommendation engine",
    status: "Accepted",
    context:
      "The tempting feature is 'answer 5 questions, we pick your stack'. But the app's goal is to teach judgment, and a black-box recommendation teaches nothing — worse, it implies technology choice has an objective answer.",
    decision:
      "Expose the value function directly: eight weight sliders with named presets. The user watches rankings reorder as priorities change.",
    consequences:
      "The core lesson — 'best' is a function of your constraints — is enacted rather than stated: the same catalog produces different winners under different weights, visibly. The cost is that users must engage with the sliders to get value; the presets exist to make that first engagement one click.",
  },
];

export function LearnView() {
  return (
    <div style={{ maxWidth: "58rem" }}>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>How to read this app</h2>
        <p className="secondary">
          Every technology is scored 0–10 on eight dimensions,{" "}
          <strong>relative to its own category</strong> — a 7 for React is
          measured against other frontends, never against databases. There is
          deliberately no overall "best": the ranked lists multiply scores by
          your <strong>priority weights</strong>, so the right choice falls out
          of what your project cares about. Try switching the profile from
          "Startup MVP" to "Regulated / Financial" on the Compare tab and watch
          the winners change — that reversal is the entire discipline of
          architecture in one interaction.
        </p>
        <p className="secondary" style={{ marginBottom: 0 }}>
          Three relationship types carry most of the teaching:{" "}
          <strong>alternatives</strong> (what can stand in for what, and when
          you'd switch), <strong>pairings and frictions</strong> (combinations
          that amplify or fight each other), and{" "}
          <strong>commonly-confused pairs</strong> (things that look
          interchangeable and aren't — Kafka vs RabbitMQ is the canonical
          example). The Swap Map tab navigates these edges directly.
        </p>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>The eight dimensions</h2>
      <div className="learn-grid">
        {DIMENSIONS.map((d) => (
          <div className="card" key={d.key}>
            <h3 style={{ fontSize: "0.95rem" }}>{d.label}</h3>
            <p className="small secondary" style={{ marginBottom: "0.4rem" }}>
              {d.question}
            </p>
            <p className="small" style={{ margin: 0 }}>
              <span className="muted">High:</span> {d.high}
              <br />
              <span className="muted">Low:</span> {d.low}
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>
        This app's own architecture decisions
      </h2>
      <p className="secondary">
        Architecture Decision Records are one-page documents capturing a
        decision, its context, and its consequences — the cheapest
        architecture practice with the highest payoff, and the habit this app
        most wants you to steal. These five are the real ADRs for the app
        you're using; notice how each one names the condition under which the
        decision should be revisited.
      </p>
      {ADRS.map((adr) => (
        <div className="card adr" key={adr.id}>
          <span className="status">{adr.status}</span>
          <h3>
            {adr.id} — {adr.title}
          </h3>
          <p className="small">
            <strong>Context.</strong> {adr.context}
          </p>
          <p className="small">
            <strong>Decision.</strong> {adr.decision}
          </p>
          <p className="small" style={{ marginBottom: 0 }}>
            <strong>Consequences.</strong> {adr.consequences}
          </p>
        </div>
      ))}
    </div>
  );
}
