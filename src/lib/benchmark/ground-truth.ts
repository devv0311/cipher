import { z } from "zod";

/**
 * Ground-truth schema for a real solved-case benchmark (B7), and the matchers
 * that score a frozen blind summary against it (B15–B16).
 *
 * Kept separate from CorpusGroundTruthSchema (pinned to the synthetic case).
 * Loaded only by scripts/benchmark/compare-ground-truth.ts, which runs after a
 * blind run is frozen; no pipeline module imports this file
 * (tests/unit/benchmark-leak-guard.test.ts).
 *
 * Every assertion records the STANDARD at which it was established, because a
 * jury verdict, an appellate recital of trial evidence, a sentencing finding
 * by a preponderance and a party's allegation are not the same kind of truth.
 */

export const StandardSchema = z.enum([
  "jury_verdict", // necessarily found by the verdict
  "judgment", // entered by the court
  "appellate_recital", // trial evidence as summarised by the appellate court (sufficiency unchallenged)
  "sentencing_preponderance", // found by the sentencing judge by a preponderance
  "party_concession", // conceded by the defence at trial, recorded by a court
  "rejected_by_verdict", // a defence theory the verdict necessarily rejected
  "abandoned_by_government", // an investigative hypothesis the government abandoned, recorded by a court
  "unproven", // a court records that no evidence established it
  "executive_act", // not a judicial finding
]);

const Source = z.object({ doc: z.number().int(), locator: z.string().min(1), quote: z.string().max(160).optional() });

const Base = z.object({
  id: z.string().regex(/^GT-[A-Z]+-\d+$/),
  category: z.enum([
    "identity", "alias", "relationship", "event", "timeline", "location", "transaction",
    "communication", "document_authenticity", "forensic_finding", "role", "contradiction", "final_outcome",
  ]),
  assertion: z.string().min(1),
  standard: StandardSchema,
  sources: z.array(Source).min(1),
  /** Evidence-pack item refs that carry supporting evidence the model could see. Empty = not model-visible. */
  modelVisibleSupport: z.array(z.string()),
});

/** How an assertion is scored against a blind summary. */
export const MatcherSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("identity_link"), a: z.string(), b: z.string(), maxHops: z.number().int().positive() }),
  z.object({ kind: z.literal("path_exists"), a: z.string(), b: z.string(), maxHops: z.number().int().positive() }),
  z.object({ kind: z.literal("no_link"), a: z.string(), b: z.string() }),
  z.object({ kind: z.literal("ownership"), person: z.string(), identifierLabelContains: z.string() }),
  z.object({ kind: z.literal("temporal_corroboration"), entityLabelsAny: z.array(z.string()).min(1), windowStart: z.string(), windowEnd: z.string() }),
  z.object({ kind: z.literal("contradiction_flag"), subject: z.string() }),
  z.object({ kind: z.literal("not_scorable"), reason: z.string() }),
]);
export type Matcher = z.infer<typeof MatcherSchema>;

export const GroundTruthAssertionSchema = Base.extend({ polarity: z.enum(["positive", "negative"]), matcher: MatcherSchema });
export type GroundTruthAssertion = z.infer<typeof GroundTruthAssertionSchema>;

export const RealCaseGroundTruthSchema = z.object({
  caseId: z.string(),
  authoredAt: z.string(),
  authoredFrom: z.array(z.number().int()).min(1),
  finalOutcome: z.object({
    verdictByCount: z.record(z.string(), z.enum(["guilty", "not_guilty", "hung"])),
    judgmentByCount: z.record(z.string(), z.enum(["adjudicated", "vacated", "dismissed"])),
    appeal: z.string(),
    postJudgment: z.array(z.string()),
  }),
  assertions: z.array(GroundTruthAssertionSchema).min(1),
});
export type RealCaseGroundTruth = z.infer<typeof RealCaseGroundTruthSchema>;

// --- blind summary shape consumed by the matchers ------------------------------

export interface BlindSummary {
  persons: { entityId: string; label: string; aliases: string[]; mentions: { mention: string; resolutionType?: string; status?: string }[] }[];
  relationships: { type: string; source: string; sourceKind: string; target: string; targetKind: string }[];
  personPaths: { from: string; to: string; hops: number; path: string[] }[];
  corroboration: { type: string; entities: string[]; window: { start: string; end: string } | null }[];
}

export type Outcome = "recovered" | "partially_recovered" | "missed" | "correctly_absent" | "false_link" | "not_scorable";

export interface ScoredAssertion {
  id: string;
  category: string;
  polarity: "positive" | "negative";
  standard: string;
  modelVisible: boolean;
  outcome: Outcome;
  detail: string;
}

const labelOf = (s: string) => s.replace(/ \[[0-9a-f]{6}\]$/, "");
const hasLabel = (label: string, wanted: string) => labelOf(label) === wanted || labelOf(label).startsWith(`${wanted} (`);

function personsMerged(summary: BlindSummary, a: string, b: string): boolean {
  return summary.persons.some(
    (p) => (p.label === a || p.aliases.includes(a)) && (p.label === b || p.aliases.includes(b)) && a !== b,
  );
}

const ANCHORED = /new_entity|shared_identifier_merge|exact_name_match|canonicalized_identifier/;

/** Entities carrying `label` (as label or alias) that were formed from identifier evidence, not a lone ambiguous or unlinked mention. */
export function anchoredFragments(summary: BlindSummary, label: string) {
  return summary.persons.filter(
    (p) => (p.label === label || p.aliases.includes(label)) && p.mentions.some((m) => ANCHORED.test(m.resolutionType ?? "")),
  );
}

function pathBetweenEntities(summary: BlindSummary, label: string, entityId: string, maxHops: number): boolean {
  const tag = `[${entityId.slice(-6)}]`;
  return summary.personPaths.some(
    (p) => p.hops <= maxHops && ((hasLabel(p.from, label) && p.to.endsWith(tag)) || (hasLabel(p.to, label) && p.from.endsWith(tag))),
  );
}

function bestPath(summary: BlindSummary, a: string, b: string) {
  return summary.personPaths
    .filter((p) => (hasLabel(p.from, a) && hasLabel(p.to, b)) || (hasLabel(p.from, b) && hasLabel(p.to, a)))
    .sort((x, y) => x.hops - y.hops)[0];
}

export function scoreAssertion(gt: GroundTruthAssertion, summary: BlindSummary): ScoredAssertion {
  const base = {
    id: gt.id,
    category: gt.category,
    polarity: gt.polarity,
    standard: gt.standard,
    modelVisible: gt.modelVisibleSupport.length > 0,
  };
  const m = gt.matcher;
  switch (m.kind) {
    case "identity_link": {
      // Fragment-aware (scorer v2): every identifier-anchored entity that carries
      // label b must be merged with a (recovered), or at least some must be merged
      // or path-linked (partially_recovered). A single lucky merge while b stays
      // split across other entities is not full recovery.
      const fragments = anchoredFragments(summary, m.b);
      if (fragments.length === 0) return { ...base, outcome: "missed", detail: `no identifier-anchored entity for ${m.b}` };
      const merged = fragments.filter((p) => p.label === m.a || p.aliases.includes(m.a));
      const linked = fragments.filter((p) => !merged.includes(p) && pathBetweenEntities(summary, m.a, p.entityId, m.maxHops));
      const detail = `${fragments.length} identifier-anchored '${m.b}' entities: ${merged.length} merged with '${m.a}', ${linked.length} linked within ${m.maxHops} hops, ${fragments.length - merged.length - linked.length} unconnected`;
      if (merged.length === fragments.length) return { ...base, outcome: "recovered", detail };
      if (merged.length + linked.length > 0) return { ...base, outcome: "partially_recovered", detail };
      return { ...base, outcome: "missed", detail };
    }
    case "path_exists": {
      const p = bestPath(summary, m.a, m.b);
      if (p && p.hops <= m.maxHops) return { ...base, outcome: "recovered", detail: `${p.hops}-hop path: ${p.path.join(" → ")}` };
      return { ...base, outcome: "missed", detail: p ? `shortest path ${p.hops} hops (limit ${m.maxHops})` : "no path" };
    }
    case "no_link": {
      if (personsMerged(summary, m.a, m.b)) return { ...base, outcome: "false_link", detail: `${m.a} merged with ${m.b}` };
      const p = bestPath(summary, m.a, m.b);
      if (p) return { ...base, outcome: "false_link", detail: `${p.hops}-hop path: ${p.path.join(" → ")}` };
      return { ...base, outcome: "correctly_absent", detail: "no merge and no path" };
    }
    case "ownership": {
      const hit = summary.relationships.find(
        (r) => r.type === "ownership" && hasLabel(r.source, m.person) && r.target.includes(m.identifierLabelContains),
      );
      return hit
        ? { ...base, outcome: "recovered", detail: `${r2s(hit)}` }
        : { ...base, outcome: "missed", detail: `no ownership edge ${m.person} → *${m.identifierLabelContains}*` };
    }
    case "temporal_corroboration": {
      const hit = summary.corroboration.find(
        (c) =>
          c.type === "temporal_co_occurrence" &&
          c.window !== null &&
          c.window.start <= m.windowEnd &&
          c.window.end >= m.windowStart &&
          c.entities.some((e) => m.entityLabelsAny.some((w) => hasLabel(e, w))),
      );
      return hit
        ? { ...base, outcome: "recovered", detail: `temporal co-occurrence ${hit.window?.start}–${hit.window?.end}: ${hit.entities.join(", ")}` }
        : { ...base, outcome: "missed", detail: "no temporal co-occurrence overlapping the window" };
    }
    case "contradiction_flag":
      return { ...base, outcome: "missed", detail: `pipeline emits no contradiction finding type; subject: ${m.subject}` };
    case "not_scorable":
      return { ...base, outcome: "not_scorable", detail: m.reason };
  }
}

const r2s = (r: BlindSummary["relationships"][number]) => `${r.type}: ${r.source} → ${r.target}`;

export interface ScoreTable {
  total: number;
  scorable: number;
  byOutcome: Record<Outcome, number>;
  positiveRecall: number | null;
  positiveRecallModelVisible: number | null;
  negativeSpecificity: number | null;
}

export function summarise(scored: ScoredAssertion[]): ScoreTable {
  const byOutcome: Record<Outcome, number> = {
    recovered: 0, partially_recovered: 0, missed: 0, correctly_absent: 0, false_link: 0, not_scorable: 0,
  };
  for (const s of scored) byOutcome[s.outcome] += 1;
  const pos = scored.filter((s) => s.polarity === "positive" && s.outcome !== "not_scorable");
  const posVisible = pos.filter((s) => s.modelVisible);
  const neg = scored.filter((s) => s.polarity === "negative" && s.outcome !== "not_scorable");
  const credit = (xs: ScoredAssertion[]) =>
    xs.length === 0 ? null : xs.reduce((n, s) => n + (s.outcome === "recovered" ? 1 : s.outcome === "partially_recovered" ? 0.5 : 0), 0) / xs.length;
  return {
    total: scored.length,
    scorable: scored.filter((s) => s.outcome !== "not_scorable").length,
    byOutcome,
    positiveRecall: credit(pos),
    positiveRecallModelVisible: credit(posVisible),
    negativeSpecificity: neg.length === 0 ? null : neg.filter((s) => s.outcome === "correctly_absent").length / neg.length,
  };
}
