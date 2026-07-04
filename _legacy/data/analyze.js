/*
 * Turns a selection { frontend, backend, database, cloud } into a full analysis:
 *   - the chosen technologies
 *   - averaged scores per axis (for the radar chart)
 *   - synergies / frictions / info notes from the rules engine
 *   - an overall 0-100 score
 *   - a rough cost estimate for the chosen traffic tier
 */

const { technologies, AXES, TIERS } = require("./technologies");
const { PAIR_RULES, STACK_CHECKS, estimateCost } = require("./rules");

function byId(id) {
  return technologies.find((t) => t.id === id) || null;
}

function analyze(selection, tierKey = "growth") {
  const chosen = ["frontend", "backend", "database", "cloud"]
    .map((cat) => ({ cat, tech: byId(selection[cat]) }))
    .filter((x) => x.tech);

  // --- Average each axis across the chosen technologies ---
  const axisScores = {};
  for (const axis of AXES) {
    if (chosen.length === 0) {
      axisScores[axis.key] = 0;
      continue;
    }
    const sum = chosen.reduce((acc, c) => acc + (c.tech.scores[axis.key] ?? 0), 0);
    axisScores[axis.key] = +(sum / chosen.length).toFixed(2);
  }

  // --- Fire pair rules ---
  const notes = [];
  let scoreDelta = 0;
  const ids = new Set(chosen.map((c) => c.tech.id));
  for (const rule of PAIR_RULES) {
    if (rule.pair.every((id) => ids.has(id))) {
      notes.push({ type: rule.type, title: rule.title, detail: rule.detail });
      scoreDelta += rule.delta;
    }
  }

  // --- Fire whole-stack checks ---
  for (const check of STACK_CHECKS) {
    const result = check(selection);
    if (result) {
      notes.push({ type: result.type, title: result.title, detail: result.detail });
      scoreDelta += result.delta;
    }
  }

  // --- Overall score: average of axes (0-100) nudged by synergies/frictions ---
  const axisAvg =
    AXES.reduce((acc, a) => acc + axisScores[a.key], 0) / AXES.length; // 0-5
  let overall = (axisAvg / 5) * 100 + scoreDelta;
  overall = Math.max(0, Math.min(100, Math.round(overall)));

  // --- Cost ---
  const cost = estimateCost(selection, technologies, tierKey);

  // Sort notes: synergies first, then info, then frictions last (so cautions stand out at the end).
  const order = { synergy: 0, info: 1, friction: 2 };
  notes.sort((a, b) => order[a.type] - order[b.type]);

  return {
    selection,
    tier: TIERS.find((t) => t.key === tierKey) || null,
    chosen: chosen.map((c) => ({ category: c.cat, ...c.tech })),
    axisScores,
    notes,
    overall,
    cost,
    counts: {
      synergies: notes.filter((n) => n.type === "synergy").length,
      frictions: notes.filter((n) => n.type === "friction").length,
    },
  };
}

module.exports = { analyze };
