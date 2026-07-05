import type {
  CategoryId,
  MigrationEffort,
  Relation,
  Tech,
  TechId,
} from "./types";
import { ARCHITECTURE_TECHS } from "./techs/architecture";
import { FRONTEND_TECHS } from "./techs/frontend";
import { BACKEND_TECHS } from "./techs/backend";
import { API_STYLE_TECHS } from "./techs/api-style";
import { DATA_ACCESS_TECHS } from "./techs/data-access";
import { DATABASE_TECHS } from "./techs/database";
import { CACHING_TECHS } from "./techs/caching";
import { MESSAGING_TECHS } from "./techs/messaging";
import { AUTH_TECHS } from "./techs/auth";
import { HOSTING_TECHS } from "./techs/hosting";

export const ALL_TECHS: Tech[] = [
  ...ARCHITECTURE_TECHS,
  ...FRONTEND_TECHS,
  ...BACKEND_TECHS,
  ...API_STYLE_TECHS,
  ...DATA_ACCESS_TECHS,
  ...DATABASE_TECHS,
  ...CACHING_TECHS,
  ...MESSAGING_TECHS,
  ...AUTH_TECHS,
  ...HOSTING_TECHS,
];

export const TECH_MAP = new Map<TechId, Tech>(ALL_TECHS.map((t) => [t.id, t]));

export function getTech(id: TechId): Tech {
  const tech = TECH_MAP.get(id);
  if (!tech) throw new Error(`Unknown tech id: ${id}`);
  return tech;
}

export function techsIn(category: CategoryId): Tech[] {
  return ALL_TECHS.filter((t) => t.category === category);
}

export interface ReverseEdge {
  from: Tech;
  note: string;
  effort?: MigrationEffort;
}

/** Techs that list `id` among their alternatives — i.e. things `id` can replace. */
export function replacementTargets(id: TechId): ReverseEdge[] {
  return ALL_TECHS.filter((t) => t.id !== id)
    .flatMap((t) =>
      (t.alternatives ?? [])
        .filter((a) => a.techId === id)
        .map((a) => ({ from: t, note: a.note, effort: a.effort })),
    );
}

/** Both directions of "commonly confused with". */
export function confusedWith(id: TechId): ReverseEdge[] {
  const tech = getTech(id);
  const forward: ReverseEdge[] = (tech.notInterchangeableWith ?? []).map(
    (r: Relation) => ({ from: getTech(r.techId), note: r.note }),
  );
  const backward: ReverseEdge[] = ALL_TECHS.filter((t) => t.id !== id).flatMap(
    (t) =>
      (t.notInterchangeableWith ?? [])
        .filter((r) => r.techId === id)
        .map((r) => ({ from: t, note: r.note })),
  );
  const seen = new Set(forward.map((e) => e.from.id));
  return [...forward, ...backward.filter((e) => !seen.has(e.from.id))];
}
