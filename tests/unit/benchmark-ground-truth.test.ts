import { describe, it, expect } from "vitest";

import {
  anchoredFragments,
  GroundTruthAssertionSchema,
  RealCaseGroundTruthSchema,
  scoreAssertion,
  summarise,
  type BlindSummary,
  type GroundTruthAssertion,
} from "@/lib/benchmark/ground-truth";

/**
 * Ground-truth matchers for the real solved-case benchmark, on a fictional
 * blind summary. No case data.
 */

const summary: BlindSummary = {
  persons: [
    { entityId: "entity_000000aaaaaa", label: "Persona X", aliases: ["Person P"], mentions: [{ mention: "K#name", resolutionType: "shared_identifier_merge" }] },
    { entityId: "entity_000000bbbbbb", label: "Person P", aliases: [], mentions: [{ mention: "L#name", resolutionType: "new_entity" }] },
    { entityId: "entity_000000cccccc", label: "Person P", aliases: [], mentions: [{ mention: "W#aboutNames[0]", resolutionType: "ambiguous_name_conflict" }] },
    { entityId: "entity_000000dddddd", label: "Person Q", aliases: [], mentions: [{ mention: "Q#name", resolutionType: "new_entity" }] },
    { entityId: "entity_000000eeeeee", label: "Suspect Z", aliases: [], mentions: [{ mention: "Z#name", resolutionType: "new_entity" }] },
  ],
  relationships: [
    { type: "ownership", source: "Persona X", sourceKind: "person", target: "TOKEN-KEY-1", targetKind: "bank_account" },
    { type: "ownership", source: "Person P", sourceKind: "person", target: "TOKEN-EP-1", targetKind: "phone" },
  ],
  personPaths: [
    { from: "Persona X [aaaaaa]", to: "Person P [bbbbbb]", hops: 4, path: ["Persona X (person)", "…", "Person P (person)"] },
    { from: "Person Q [dddddd]", to: "Person P [bbbbbb]", hops: 1, path: ["Person Q (person)", "Person P (person)"] },
  ],
  corroboration: [
    { type: "temporal_co_occurrence", entities: ["Persona X (person)", "TOKEN-EP-2 (phone)"], window: { start: "2020-01-01T10:00:00Z", end: "2020-01-01T10:05:00Z" } },
  ],
};

const gt = (matcher: GroundTruthAssertion["matcher"], polarity: "positive" | "negative" = "positive", support = ["ITEM"]): GroundTruthAssertion =>
  GroundTruthAssertionSchema.parse({
    id: "GT-ID-1", category: "identity", polarity, standard: "jury_verdict", assertion: "fixture",
    sources: [{ doc: 1, locator: "x" }], modelVisibleSupport: support, matcher,
  });

describe("benchmark ground-truth matchers", () => {
  it("counts only identifier-anchored fragments, not lone ambiguous mentions", () => {
    expect(anchoredFragments(summary, "Person P").map((p) => p.entityId)).toEqual(["entity_000000aaaaaa", "entity_000000bbbbbb"]);
  });

  it("identity_link is partial when one fragment merged and another is only path-linked", () => {
    const s = scoreAssertion(gt({ kind: "identity_link", a: "Persona X", b: "Person P", maxHops: 4 }), summary);
    expect(s.outcome).toBe("partially_recovered");
    expect(s.detail).toMatch(/2 identifier-anchored 'Person P' entities: 1 merged .* 1 linked/);
  });

  it("identity_link is missed when the path is longer than allowed and nothing merged", () => {
    const s = scoreAssertion(gt({ kind: "identity_link", a: "Person Q", b: "Persona X", maxHops: 1 }), summary);
    expect(s.outcome).toBe("missed");
  });

  it("path_exists respects the hop limit", () => {
    expect(scoreAssertion(gt({ kind: "path_exists", a: "Person Q", b: "Person P", maxHops: 1 }), summary).outcome).toBe("recovered");
    expect(scoreAssertion(gt({ kind: "path_exists", a: "Persona X", b: "Person P", maxHops: 3 }), summary).outcome).toBe("missed");
  });

  it("no_link reports a false link when any path exists, and correct absence otherwise", () => {
    expect(scoreAssertion(gt({ kind: "no_link", a: "Person Q", b: "Person P" }, "negative"), summary).outcome).toBe("false_link");
    expect(scoreAssertion(gt({ kind: "no_link", a: "Suspect Z", b: "Persona X" }, "negative"), summary).outcome).toBe("correctly_absent");
  });

  it("ownership and temporal corroboration match on labels, tokens and overlapping windows", () => {
    expect(scoreAssertion(gt({ kind: "ownership", person: "Persona X", identifierLabelContains: "TOKEN-KEY-1" }), summary).outcome).toBe("recovered");
    expect(scoreAssertion(gt({ kind: "ownership", person: "Person P", identifierLabelContains: "TOKEN-KEY-1" }), summary).outcome).toBe("missed");
    const t = (start: string, end: string) =>
      scoreAssertion(gt({ kind: "temporal_corroboration", entityLabelsAny: ["Persona X"], windowStart: start, windowEnd: end }), summary).outcome;
    expect(t("2020-01-01T10:04:00Z", "2020-01-01T11:00:00Z")).toBe("recovered");
    expect(t("2020-01-01T11:00:00Z", "2020-01-01T12:00:00Z")).toBe("missed");
  });

  it("contradictions are always missed (no contradiction finding type exists) and not_scorable stays out of the rates", () => {
    const scored = [
      scoreAssertion(gt({ kind: "contradiction_flag", subject: "s" }), summary),
      scoreAssertion(gt({ kind: "not_scorable", reason: "r" }), summary),
      scoreAssertion(gt({ kind: "path_exists", a: "Person Q", b: "Person P", maxHops: 1 }), summary),
      scoreAssertion(gt({ kind: "identity_link", a: "Persona X", b: "Person P", maxHops: 4 }), summary),
      scoreAssertion(gt({ kind: "no_link", a: "Suspect Z", b: "Persona X" }, "negative"), summary),
    ];
    const table = summarise(scored);
    expect(scored[0]?.outcome).toBe("missed");
    expect(table.scorable).toBe(4);
    expect(table.positiveRecall).toBeCloseTo((0 + 1 + 0.5) / 3);
    expect(table.negativeSpecificity).toBe(1);
  });

  it("rejects a ground-truth document without a final outcome or with an unknown standard", () => {
    expect(RealCaseGroundTruthSchema.safeParse({ caseId: "x", authoredAt: "d", authoredFrom: [1], assertions: [] }).success).toBe(false);
    expect(GroundTruthAssertionSchema.safeParse({
      id: "GT-ID-1", category: "identity", polarity: "positive", standard: "rumour", assertion: "a",
      sources: [{ doc: 1, locator: "x" }], modelVisibleSupport: [], matcher: { kind: "not_scorable", reason: "r" },
    }).success).toBe(false);
  });
});
