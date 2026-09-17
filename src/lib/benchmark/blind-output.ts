import { createHash } from "node:crypto";

import type { SystemSnapshot } from "@/lib/evaluation/snapshot";

/**
 * The frozen, comparable form of a blind run (B14 / B19).
 *
 * Everything the pipeline persisted is kept, except what records *when* the
 * run happened rather than *what* it concluded:
 *
 *   - wall-clock keys (`timestamp`, `ingestedAt`, `graphVersion`, …) are dropped;
 *   - ISO instants embedded inside strings (e.g. `graph_version:<instant>`) are
 *     replaced by `<instant>`;
 *   - analytical signals and corroboration findings lose their `id` and are
 *     ordered by content, because their ids are derived from the graph-synthesis
 *     instant (measured finding R1 in the benchmark report) and so change on
 *     every fresh database even when nothing else does. References to those ids
 *     elsewhere are replaced the same way.
 *
 * Two runs over the same evidence pack must produce byte-identical stable
 * output; that is the reproducibility test.
 */

const VOLATILE_KEYS = new Set([
  "timestamp",
  "ingestedAt",
  "createdAt",
  "updatedAt",
  "generatedAt",
  "computedAt",
  "resolvedAt",
  "graphVersion",
]);
const ISO_INSTANT = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;
const TIME_DERIVED_ID = /\b(?:analytical_signal|corroboration_finding|community)_[0-9a-f]{20}\b/g;

export function stripVolatile(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(ISO_INSTANT, "<instant>").replace(TIME_DERIVED_ID, (m) => m.replace(/_[0-9a-f]{20}$/, "_<time-derived>"));
  }
  if (Array.isArray(value)) return value.map(stripVolatile);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      if (VOLATILE_KEYS.has(key)) continue;
      out[key] = stripVolatile((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

const byId = <T extends { id: string }>(rows: T[]): unknown[] =>
  [...rows].sort((a, b) => a.id.localeCompare(b.id)).map(stripVolatile);

const byContent = <T extends { id: string }>(rows: T[]): unknown[] =>
  rows
    .map(({ id: _id, ...rest }) => stripVolatile(rest))
    .map((row) => ({ key: JSON.stringify(row), row }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ row }) => row);

export interface StableBlindOutput {
  counts: Record<string, number>;
  snapshot: Record<string, unknown[]>;
}

export function stableBlindOutput(snapshot: SystemSnapshot): StableBlindOutput {
  const stable: Record<string, unknown[]> = {
    entities: byId(snapshot.entities),
    aliases: byId(snapshot.aliases),
    locations: byId(snapshot.locations),
    evidenceItems: byId(snapshot.evidenceItems),
    extractedRecords: byId(snapshot.extractedRecords),
    resolutionDecisions: byId(snapshot.resolutionDecisions),
    relationships: byId(snapshot.relationships),
    analyticalSignals: byContent(snapshot.analyticalSignals),
    corroborationFindings: byContent(snapshot.corroborationFindings),
  };
  const counts = Object.fromEntries(Object.entries(stable).map(([k, v]) => [k, v.length]));
  return { counts, snapshot: stable };
}

export function sha256Json(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
