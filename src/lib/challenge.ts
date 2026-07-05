import type { Challenge } from "../data/challenges";
import { CATEGORY_MAP } from "../data/categories";
import { DIMENSION_MAP } from "../data/dimensions";
import type { DimensionKey } from "../data/types";
import type { StackAnalysis } from "./scoring";

export interface Criterion {
  label: string;
  pass: boolean;
}

/** Evaluate a challenge against the SAME analysis the Stack Builder shows. */
export function evaluateChallenge(
  challenge: Challenge,
  analysis: StackAnalysis,
): { criteria: Criterion[]; passed: boolean } {
  const t = challenge.targets;
  const criteria: Criterion[] = [];
  const blockers = analysis.notes.filter((n) => n.kind === "blocker").length;
  const warnings = analysis.notes.filter((n) => n.kind === "warning").length;

  if (t.minOverall !== undefined) {
    criteria.push({
      label: `Overall fit ≥ ${t.minOverall.toFixed(1)} (now ${analysis.overall.toFixed(1)})`,
      pass: analysis.overall >= t.minOverall,
    });
  }
  if (t.noBlockers) {
    criteria.push({
      label: `No blockers (now ${blockers})`,
      pass: blockers === 0,
    });
  }
  if (t.maxWarnings !== undefined) {
    criteria.push({
      label: `At most ${t.maxWarnings} warning${t.maxWarnings === 1 ? "" : "s"} (now ${warnings})`,
      pass: warnings <= t.maxWarnings,
    });
  }
  for (const [dim, floor] of Object.entries(t.floors ?? {})) {
    const key = dim as DimensionKey;
    const val = analysis.emergentProfile[key];
    criteria.push({
      label: `${DIMENSION_MAP[key].label} floor ≥ ${floor} (now ${val.toFixed(0)}${
        analysis.culprits[key] ? `, set by ${analysis.culprits[key]!.name}` : ""
      })`,
      pass: val >= (floor ?? 0),
    });
  }
  for (const layer of t.requiredLayers ?? []) {
    const present = analysis.techs.some((x) => x.category === layer);
    criteria.push({
      label: `${CATEGORY_MAP[layer].name} layer chosen`,
      pass: present,
    });
  }

  const meaningful = analysis.techs.length > 0;
  return {
    criteria,
    passed: meaningful && criteria.every((c) => c.pass),
  };
}
