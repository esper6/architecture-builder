// Knowledge-base audit: score ranges, edge integrity, native-dimension
// completeness, and a score matrix per category for calibration review.
// The compiler catches broken TechId references; this catches what it can't.
// Usage: npx tsx scripts/audit.ts
import { ALL_TECHS } from "../src/data/index";
import { DIMENSIONS } from "../src/data/dimensions";
import { CATEGORIES } from "../src/data/categories";

for (const c of CATEGORIES) {
  const techs = ALL_TECHS.filter((t) => t.category === c.id);
  console.log(`\n== ${c.name} (${techs.length}) ==`);
  console.log(
    "tech".padEnd(20),
    DIMENSIONS.map((d) => d.key.slice(0, 6).padStart(7)).join(""),
  );
  for (const t of techs) {
    console.log(
      t.id.padEnd(20),
      DIMENSIONS.map((d) => String(t.scores[d.key]).padStart(7)).join(""),
    );
  }
}

let issues = 0;
for (const t of ALL_TECHS) {
  for (const d of DIMENSIONS) {
    const v = t.scores[d.key];
    if (v === undefined || v < 0 || v > 10) {
      console.log(`ISSUE: ${t.id} score ${d.key} = ${v}`);
      issues++;
    }
  }
  if (t.alternatives.length === 0) {
    console.log(`NOTE: ${t.id} has no alternatives`);
  }
  for (const rel of [
    ...t.alternatives,
    ...(t.pairsWellWith ?? []),
    ...(t.frictionWith ?? []),
    ...(t.notInterchangeableWith ?? []),
  ]) {
    if (rel.techId === t.id) {
      console.log(`ISSUE: ${t.id} references itself`);
      issues++;
    }
    if (!ALL_TECHS.some((x) => x.id === rel.techId)) {
      console.log(`ISSUE: ${t.id} -> missing ${rel.techId}`);
      issues++;
    }
  }
}

// Granularity checks: nativeScores keys must match the category definition;
// if a category defines native dimensions, every tech must score them all.
for (const c of CATEGORIES) {
  const nativeKeys = new Set((c.nativeDimensions ?? []).map((d) => d.key));
  for (const t of ALL_TECHS.filter((x) => x.category === c.id)) {
    for (const k of Object.keys(t.nativeScores ?? {})) {
      if (!nativeKeys.has(k)) {
        console.log(
          `ISSUE: ${t.id} nativeScores key '${k}' not defined on category`,
        );
        issues++;
      }
      const v = t.nativeScores![k];
      if (v < 0 || v > 10) {
        console.log(`ISSUE: ${t.id} native ${k} = ${v} out of range`);
        issues++;
      }
    }
    if (nativeKeys.size > 0) {
      for (const k of nativeKeys) {
        if (t.nativeScores?.[k] === undefined) {
          console.log(`ISSUE: ${t.id} missing native score '${k}'`);
          issues++;
        }
      }
    }
    for (const [dim, subs] of Object.entries(t.subScores ?? {})) {
      for (const s of subs ?? []) {
        if (s.value < 0 || s.value > 10) {
          console.log(
            `ISSUE: ${t.id} subScore ${dim}/${s.label} = ${s.value} out of range`,
          );
          issues++;
        }
      }
    }
  }
}

// System-thinking data: every alternatives edge should carry a migration
// effort; every tech should carry an obligations ledger; context modifiers
// must have sane deltas.
for (const t of ALL_TECHS) {
  for (const a of t.alternatives) {
    if (!a.effort) {
      console.log(`ISSUE: ${t.id} -> ${a.techId} alternatives edge missing effort`);
      issues++;
    }
  }
  if ((t.commitments ?? []).length < 2) {
    console.log(`ISSUE: ${t.id} has ${t.commitments?.length ?? 0} commitments (want ≥2)`);
    issues++;
  }
}
{
  const { CONTEXT_MODIFIERS } = await import("../src/data/context");
  for (const m of CONTEXT_MODIFIERS) {
    for (const [dim, d] of Object.entries(m.delta)) {
      if (d === 0 || Math.abs(d ?? 0) > 6) {
        console.log(`ISSUE: modifier ${m.techId}/${dim} delta ${d} out of sane range`);
        issues++;
      }
    }
    if (!m.why) {
      console.log(`ISSUE: modifier ${m.techId} missing rationale`);
      issues++;
    }
  }
  console.log(`Context modifiers: ${CONTEXT_MODIFIERS.length}`);
}

const alt = ALL_TECHS.reduce((n, t) => n + t.alternatives.length, 0);
const pairs = ALL_TECHS.reduce((n, t) => n + (t.pairsWellWith?.length ?? 0), 0);
const fric = ALL_TECHS.reduce((n, t) => n + (t.frictionWith?.length ?? 0), 0);
const conf = ALL_TECHS.reduce(
  (n, t) => n + (t.notInterchangeableWith?.length ?? 0),
  0,
);
const withSubs = ALL_TECHS.filter((t) => t.subScores).length;
const withNative = ALL_TECHS.filter((t) => t.nativeScores).length;
const commitmentCount = ALL_TECHS.reduce(
  (n, t) => n + (t.commitments?.length ?? 0),
  0,
);
console.log(`Commitments: ${commitmentCount} across ${ALL_TECHS.length} techs`);

console.log(
  `\nEdges — alternatives: ${alt}, pairsWellWith: ${pairs}, frictionWith: ${fric}, notInterchangeable: ${conf}`,
);
console.log(
  `Granularity — techs with subScores: ${withSubs}, with nativeScores: ${withNative}`,
);
console.log(`Total techs: ${ALL_TECHS.length}, structural issues: ${issues}`);
if (issues > 0) process.exit(1);
console.log("Audit passed.");
