import type { MigrationEffort } from "../data/types";

const LABELS: Record<MigrationEffort, string> = {
  "drop-in": "drop-in",
  moderate: "migration",
  rewrite: "rewrite",
};

const TITLES: Record<MigrationEffort, string> = {
  "drop-in": "Days of work — same slot, same model",
  moderate: "A real migration project — weeks, different idioms",
  rewrite: "Paradigm shift — the layer gets rebuilt",
};

/** Small badge rating how expensive a substitution really is. */
export function EffortBadge({ effort }: { effort?: MigrationEffort }) {
  if (!effort) return null;
  return (
    <span className={`effort-badge effort-${effort}`} title={TITLES[effort]}>
      {LABELS[effort]}
    </span>
  );
}
