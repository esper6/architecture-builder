import { CATEGORIES } from "../data/categories";
import { DIMENSION_MAP, DIMENSIONS } from "../data/dimensions";
import { describeContext } from "../data/context";
import { getTech } from "../data";
import type { OrgContext } from "../data/types";
import type { Stack, StackAnalysis, Weights } from "./scoring";
import { AGGREGATION, analyzeStack } from "./scoring";

/**
 * Export a stack as a draft Architecture Decision Record — the artifact this
 * app most wants its users to make a habit of writing.
 */
export function stackToAdr(
  stack: Stack,
  weights: Weights,
  ctx: OrgContext,
  scenarioName: string,
): string {
  const a: StackAnalysis = analyzeStack(stack, weights, ctx);
  const lines: string[] = [
    "# ADR-XXX: Technology stack selection",
    "",
    "Status: Proposed",
    "",
    "## Context",
    "",
    `- Priority profile: **${scenarioName}**`,
    `- Org context: ${describeContext(ctx)}`,
    `- Overall fit (emergent): **${a.overall.toFixed(1)} / 10** — naive average would claim ${a.naiveOverall.toFixed(1)}`,
    "",
    "## Decision",
    "",
    "| Layer | Choice | Rationale hook |",
    "| --- | --- | --- |",
  ];
  for (const c of CATEGORIES) {
    const id = stack[c.id];
    if (!id) continue;
    const t = getTech(id);
    lines.push(`| ${c.name} | **${t.name}** | ${t.tagline} |`);
  }

  lines.push("", "## Emergent properties (weakest-link view)", "");
  for (const d of DIMENSIONS) {
    if (AGGREGATION[d.key] !== "floor") continue;
    const culprit = a.culprits[d.key];
    if (!culprit) continue;
    lines.push(
      `- ${DIMENSION_MAP[d.key].label}: **${a.emergentProfile[d.key].toFixed(0)}** — floor set by ${culprit.name}`,
    );
  }

  lines.push("", "## Alternatives considered", "");
  for (const c of CATEGORIES) {
    const id = stack[c.id];
    if (!id) continue;
    const t = getTech(id);
    const alt = t.alternatives[0];
    if (!alt) continue;
    const altTech = getTech(alt.techId);
    lines.push(
      `- Instead of ${t.name}: **${altTech.name}**${alt.effort ? ` (${alt.effort})` : ""} — ${alt.note}`,
    );
  }

  const issues = a.notes.filter((n) => n.kind !== "synergy");
  if (issues.length) {
    lines.push("", "## Risks", "");
    for (const n of issues) lines.push(`- ${n.text}`);
  }

  if (a.commitments.length) {
    lines.push("", "## Consequences — what this signs us up for", "");
    for (const { tech, items } of a.commitments) {
      for (const c of items) lines.push(`- **${tech.name}**: ${c.need} (${c.why})`);
    }
  }

  lines.push(
    "",
    "_Drafted with Architecture Builder. Scores are within-layer relative and context-adjusted; the emergent view floors weakest-link dimensions rather than averaging them._",
  );
  return lines.join("\n");
}
