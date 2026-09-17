/**
 * Real solved-case benchmark — blind output summary (B11–B14).
 *
 *   node --import ./scripts/eval-resolve.mjs scripts/benchmark/summarize-blind.ts [caseId] <label>
 *
 * Reads one frozen blind run's snapshot.json and writes blind-summary.json next
 * to the run directory (benchmark/results/<caseId>/blind-summary.<label>.json,
 * git-ignored). The summary is written BEFORE ground truth is opened and is the
 * record the comparison stage scores. It reads no ground-truth file.
 *
 * Contents: person clusters with the mentions that formed them, aliases,
 * relationships with labels, identifier-graph paths between person entities,
 * top-ranked entities, communities and corroboration findings.
 */
import fs from "node:fs";
import path from "node:path";

import type { SystemSnapshot } from "@/lib/evaluation/snapshot";

const ROOT = process.cwd();
const [caseIdArg, labelArg] = process.argv.slice(2);
const caseId = labelArg && caseIdArg ? caseIdArg : "us-v-ulbricht-sdny-14cr68";
const label = labelArg ?? caseIdArg ?? "run-1";
const runDir = path.join(ROOT, "benchmark", "results", caseId, "blind-run", label);
if (!fs.existsSync(path.join(runDir, "FROZEN.sha256"))) throw new Error(`${label} is not frozen`);
const s = JSON.parse(fs.readFileSync(path.join(runDir, "snapshot.json"), "utf8")) as SystemSnapshot;

const entity = new Map(s.entities.map((e) => [e.id, e]));
const locationById = new Map(s.locations.map((l) => [l.id, l]));
const labelOf = (id: string) => entity.get(id)?.canonicalLabel ?? locationById.get(id)?.label ?? id;
const kindOf = (id: string) => entity.get(id)?.kind ?? (locationById.has(id) ? "location" : "unknown");

const clusters = new Map<string, { resolutionType: string; status: string; mention: string }[]>();
for (const d of s.resolutionDecisions) {
  const list = clusters.get(d.canonicalEntityId) ?? [];
  list.push({ resolutionType: d.resolutionType, status: d.status, mention: d.provenance.location });
  clusters.set(d.canonicalEntityId, list);
}
const persons = s.entities
  .filter((e) => e.kind === "person")
  .map((e) => ({
    entityId: e.id,
    label: e.canonicalLabel,
    aliases: s.aliases.filter((a) => a.entityId === e.id).map((a) => a.aliasValue),
    mentions: (clusters.get(e.id) ?? []).sort((a, b) => a.mention.localeCompare(b.mention)),
  }))
  .sort((a, b) => a.label.localeCompare(b.label) || b.mentions.length - a.mentions.length);

const relationships = s.relationships
  .map((r) => ({
    type: r.relationshipType,
    source: labelOf(r.sourceEntityId),
    sourceKind: kindOf(r.sourceEntityId),
    target: labelOf(r.targetEntityId),
    targetKind: kindOf(r.targetEntityId),
    directed: r.directed,
    classification: r.classification,
    evidenceItems: r.evidenceItemIds.length,
    conflicts: r.conflicts,
  }))
  .sort((a, b) => `${a.type}${a.source}${a.target}`.localeCompare(`${b.type}${b.source}${b.target}`));

// Undirected BFS over relationships, person entity to person entity.
const adj = new Map<string, string[]>();
for (const r of s.relationships) {
  adj.set(r.sourceEntityId, [...(adj.get(r.sourceEntityId) ?? []), r.targetEntityId]);
  adj.set(r.targetEntityId, [...(adj.get(r.targetEntityId) ?? []), r.sourceEntityId]);
}
function shortestPath(from: string, to: string): string[] | null {
  const prev = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const n of adj.get(cur) ?? []) if (!prev.has(n)) { prev.set(n, cur); queue.push(n); }
  }
  if (!prev.has(to)) return null;
  const out: string[] = [];
  for (let c: string | null = to; c !== null; c = prev.get(c) ?? null) out.unshift(c);
  return out;
}
const connectedPersons = persons.filter((p) => adj.has(p.entityId));
const personPaths: { from: string; to: string; hops: number; path: string[] }[] = [];
for (const [i, a] of connectedPersons.entries()) {
  for (const b of connectedPersons.slice(i + 1)) {
    const p = shortestPath(a.entityId, b.entityId);
    if (p) personPaths.push({
      from: `${a.label} [${a.entityId.slice(-6)}]`,
      to: `${b.label} [${b.entityId.slice(-6)}]`,
      hops: p.length - 1,
      path: p.map((id) => `${labelOf(id)} (${kindOf(id)})`),
    });
  }
}

const value = (x: unknown) => (x ?? {}) as Record<string, unknown>;
const ranking = s.analyticalSignals
  .filter((x) => x.signalType === "ranking")
  .map((x) => ({ rank: Number(value(x.value).rank), entity: labelOf(String(x.targetEntityId)), kind: kindOf(String(x.targetEntityId)), score: value(x.value).score }))
  .sort((a, b) => a.rank - b.rank);
const communities = s.analyticalSignals
  .filter((x) => x.signalType === "community")
  .map((x) => ({ members: (value(x.value).memberEntityIds as string[] | undefined)?.map(labelOf) ?? [], explanation: x.explanation }))
  .filter((c) => c.members.length > 1);
const bridges = s.analyticalSignals.filter((x) => x.signalType === "bridge").map((x) => ({ entity: labelOf(String(x.targetEntityId)), explanation: x.explanation }));
const corroboration = s.corroborationFindings.map((c) => ({
  type: c.findingType,
  entities: c.entityIds.map((id) => `${labelOf(id)} (${kindOf(id)})`),
  locations: c.locationIds.map(labelOf),
  window: c.window,
  value: c.value,
  explanation: c.explanation,
}));

const summary = {
  caseId,
  label,
  groundTruthRead: false,
  counts: {
    evidenceItems: s.evidenceItems.length,
    extractedRecords: s.extractedRecords.length,
    entities: s.entities.length,
    personEntities: persons.length,
    aliases: s.aliases.length,
    relationships: s.relationships.length,
    analyticalSignals: s.analyticalSignals.length,
    corroborationFindings: s.corroborationFindings.length,
  },
  resolutionTypes: s.resolutionDecisions.reduce<Record<string, number>>((acc, d) => {
    acc[d.resolutionType] = (acc[d.resolutionType] ?? 0) + 1;
    return acc;
  }, {}),
  persons,
  relationships,
  personPaths,
  ranking: ranking.slice(0, 15),
  communities,
  bridges,
  corroboration,
};
const out = path.join(ROOT, "benchmark", "results", caseId, `blind-summary.${label}.json`);
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + "\n");
console.log(`Wrote ${path.relative(ROOT, out)}: ${persons.length} person entities, ${relationships.length} relationships, ${personPaths.length} person-person paths, ${corroboration.length} corroboration findings`);
