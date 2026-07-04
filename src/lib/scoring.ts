import type {
  CategoryId,
  DimensionKey,
  Tech,
  TechId,
} from "../data/types";
import { DIMENSIONS } from "../data/dimensions";
import { CATEGORIES } from "../data/categories";
import { getTech } from "../data";

export type Weights = Record<DimensionKey, number>;

/** Weighted score, normalized back to 0–10 regardless of weight magnitudes. */
export function weightedScore(tech: Tech, weights: Weights): number {
  let num = 0;
  let den = 0;
  for (const d of DIMENSIONS) {
    num += tech.scores[d.key] * weights[d.key];
    den += weights[d.key];
  }
  return den === 0 ? 0 : num / den;
}

export type Stack = Partial<Record<CategoryId, TechId>>;

export interface StackNote {
  kind: "synergy" | "warning" | "blocker";
  text: string;
}

export interface StackAnalysis {
  techs: Tech[];
  notes: StackNote[];
  /** Average dimension profile across selected techs (each 0–10). */
  profile: Record<DimensionKey, number>;
  /** Weighted overall score 0–10 under the given weights. */
  overall: number;
}

export function analyzeStack(stack: Stack, weights: Weights): StackAnalysis {
  const techs = CATEGORIES.map((c) => stack[c.id])
    .filter((id): id is TechId => Boolean(id))
    .map(getTech);
  const ids = new Set(techs.map((t) => t.id));
  const notes: StackNote[] = [];

  // Hard ecosystem constraints: an ecosystem-bound tech needs a backend from
  // the same ecosystem (the backend defines the ecosystem; it can't violate itself).
  const backend = techs.find((t) => t.category === "backend");
  for (const t of techs) {
    if (!t.ecosystem || t.category === "backend") continue;
    if (!backend) {
      notes.push({
        kind: "warning",
        text: `${t.name} is a ${ecosystemName(t.ecosystem)} technology — pick a backend so compatibility can be checked.`,
      });
    } else if (backend.ecosystem !== t.ecosystem) {
      notes.push({
        kind: "blocker",
        text: `${t.name} is a ${ecosystemName(t.ecosystem)} library — it can't run on ${backend.name} (${ecosystemName(backend.ecosystem ?? "agnostic")}). Swap one side of this pair.`,
      });
    }
  }

  // Curated synergy / friction edges among the selected techs. Edges are
  // authored on both sides for the Swap Map, so dedupe symmetric pairs here.
  const seenPairs = new Set<string>();
  for (const t of techs) {
    for (const rel of t.pairsWellWith ?? []) {
      const key = `s:${[t.id, rel.techId].sort().join("+")}`;
      if (ids.has(rel.techId) && !seenPairs.has(key)) {
        seenPairs.add(key);
        notes.push({
          kind: "synergy",
          text: `${t.name} + ${getTech(rel.techId).name}: ${rel.note}`,
        });
      }
    }
    for (const rel of t.frictionWith ?? []) {
      const key = `f:${[t.id, rel.techId].sort().join("+")}`;
      if (ids.has(rel.techId) && !seenPairs.has(key)) {
        seenPairs.add(key);
        notes.push({
          kind: "warning",
          text: `${t.name} + ${getTech(rel.techId).name}: ${rel.note}`,
        });
      }
    }
  }

  const profile = {} as Record<DimensionKey, number>;
  for (const d of DIMENSIONS) {
    profile[d.key] =
      techs.length === 0
        ? 0
        : techs.reduce((sum, t) => sum + t.scores[d.key], 0) / techs.length;
  }

  let overall = 0;
  if (techs.length > 0) {
    let den = 0;
    let num = 0;
    for (const d of DIMENSIONS) {
      num += profile[d.key] * weights[d.key];
      den += weights[d.key];
    }
    overall = den === 0 ? 0 : num / den;
  }

  return { techs, notes, profile, overall };
}

export function ecosystemName(eco: NonNullable<Tech["ecosystem"]>): string {
  switch (eco) {
    case "dotnet":
      return ".NET";
    case "node":
      return "Node.js/TypeScript";
    case "jvm":
      return "JVM";
    case "python":
      return "Python";
    case "go":
      return "Go";
    case "rust":
      return "Rust";
    case "agnostic":
      return "ecosystem-agnostic";
  }
}

/** Markdown export of a stack for pasting into a doc or PR description. */
export function stackToMarkdown(
  stack: Stack,
  weights: Weights,
  scenarioName: string,
): string {
  const analysis = analyzeStack(stack, weights);
  const lines: string[] = [
    "# Architecture decision snapshot",
    "",
    `Priority profile: **${scenarioName}** · Overall fit: **${analysis.overall.toFixed(1)} / 10**`,
    "",
    "| Layer | Choice | Why (tagline) |",
    "| --- | --- | --- |",
  ];
  for (const c of CATEGORIES) {
    const id = stack[c.id];
    if (!id) continue;
    const t = getTech(id);
    lines.push(`| ${c.name} | **${t.name}** | ${t.tagline} |`);
  }
  const synergies = analysis.notes.filter((n) => n.kind === "synergy");
  const issues = analysis.notes.filter((n) => n.kind !== "synergy");
  if (synergies.length) {
    lines.push("", "## Synergies", "");
    for (const n of synergies) lines.push(`- ${n.text}`);
  }
  if (issues.length) {
    lines.push("", "## Warnings", "");
    for (const n of issues) lines.push(`- ${n.text}`);
  }
  lines.push(
    "",
    "_Generated with Architecture Builder — scores are relative within each layer and weighted by the selected priority profile._",
  );
  return lines.join("\n");
}
