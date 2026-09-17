import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import type { AcquisitionManifest } from "@/lib/benchmark/acquisition";
import {
  assertEvidencePackIsBlind,
  assertEvidencePackPath,
  BenchmarkLeakError,
  evidencePackPath,
  findAnswerKeyFields,
  packSuffix,
} from "@/lib/benchmark/leak-guard";
import { stableBlindOutput, stripVolatile } from "@/lib/benchmark/blind-output";
import type { SystemSnapshot } from "@/lib/evaluation/snapshot";

/**
 * Leak guard and blind-output tests for the real solved-case benchmark.
 * Fixtures are fictional; no case data is read (owner decision B keeps it local).
 */

const ROOT = path.resolve("/repo");
const CASE = "fictional-case";

const acquisition: AcquisitionManifest = {
  caseId: CASE,
  caption: "Fictional v. Example",
  courts: ["Test Court"],
  docketPage: "https://example.org/docket",
  retrievalMethod: "test",
  register: "docs/benchmark/source-register.md",
  localStore: "benchmark/cases/fictional-case/sources/",
  documents: [
    { documentId: "SR-001", docketEntry: 10, attachment: 0, title: "Transcript", documentType: "trial_transcript", pack: "evidence", url: "https://example.org/10.pdf", fileName: "10.pdf", bytes: 1, sha256: "a".repeat(64), retrievedAt: "2026-01-01T00:00:00Z" },
    { documentId: "SR-002", docketEntry: 20, attachment: 0, title: "Verdict", documentType: "verdict", pack: "ground_truth", url: "https://example.org/20.pdf", fileName: "20.pdf", bytes: 1, sha256: "b".repeat(64), retrievedAt: "2026-01-01T00:00:00Z" },
  ],
};

const item = (ref: string, doc: number | undefined, extra: Record<string, unknown> = {}) => ({
  ref,
  sourceKey: "S",
  itemType: "witness_statement",
  content: { text: "x", ...(doc === undefined ? {} : { citation: { doc, page: 1, line: 1, lineEnd: 1 } }), ...extra },
});

describe("benchmark leak guard — path", () => {
  it("accepts exactly the evidence pack path for each pack version", () => {
    expect(() => assertEvidencePackPath(ROOT, CASE, evidencePackPath(ROOT, CASE))).not.toThrow();
    expect(() => assertEvidencePackPath(ROOT, CASE, evidencePackPath(ROOT, CASE, "1.1.0"), "1.1.0")).not.toThrow();
    expect(packSuffix("1.1.0")).toBe(".v1.1.0");
  });

  it("rejects a ground-truth path, whatever it is called", () => {
    for (const p of [
      path.join(ROOT, "benchmark", "ground-truth", CASE, "ground-truth.json"),
      path.join(ROOT, "benchmark", "cases", CASE, "sources", "ground_truth", "20.pdf"),
    ]) {
      expect(() => assertEvidencePackPath(ROOT, CASE, p)).toThrow(BenchmarkLeakError);
    }
  });

  it("rejects any other path, including a different pack version", () => {
    expect(() => assertEvidencePackPath(ROOT, CASE, path.join(ROOT, "other.json"))).toThrow(/only the frozen evidence pack/);
    expect(() => assertEvidencePackPath(ROOT, CASE, evidencePackPath(ROOT, CASE, "1.1.0"))).toThrow(BenchmarkLeakError);
  });

  it("rejects a malformed pack version", () => {
    expect(() => packSuffix("../../ground-truth")).toThrow(/Invalid pack version/);
  });
});

describe("benchmark leak guard — content", () => {
  it("passes a pack whose items all cite evidence documents", () => {
    expect(() => assertEvidencePackIsBlind({ evidenceItems: [item("A", 10)] }, acquisition)).not.toThrow();
  });

  it("rejects an item transcribed from a ground-truth document", () => {
    expect(() => assertEvidencePackIsBlind({ evidenceItems: [item("A", 10), item("B", 20)] }, acquisition)).toThrow(
      expect.objectContaining({ code: "CITES_NON_EVIDENCE_DOCUMENT" }),
    );
  });

  it("rejects an uncited item", () => {
    expect(() => assertEvidencePackIsBlind({ evidenceItems: [item("A", undefined)] }, acquisition)).toThrow(
      expect.objectContaining({ code: "UNCITED_ITEM" }),
    );
  });

  it("finds answer-key fields at any depth, case-insensitively", () => {
    const raw = { corpus: {}, evidenceItems: [item("A", 10, { nested: { FinalOutcome: "x" } })], verdictByCount: {} };
    expect(findAnswerKeyFields(raw).sort()).toEqual(["$.evidenceItems[0].content.nested.FinalOutcome", "$.verdictByCount"].sort());
    expect(() => assertEvidencePackIsBlind(raw, acquisition)).toThrow(expect.objectContaining({ code: "ANSWER_KEY_FIELD" }));
  });
});

describe("benchmark isolation — source scan", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

  it("the blind run never addresses the ground-truth tree or loads the ground-truth module", () => {
    const src = read("scripts/benchmark/blind-run.ts").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).not.toMatch(/ground-truth|ground_truth|groundTruth\b/);
    expect(src).not.toMatch(/@\/lib\/benchmark\/ground-truth/);
  });

  it("no pipeline stage imports the benchmark ground-truth module", () => {
    const stageDirs = ["ingestion", "extraction", "resolution", "graph", "analytics", "corroboration", "copilot", "dossier"];
    for (const dir of stageDirs) {
      for (const file of fs.readdirSync(path.join(process.cwd(), "src", "lib", dir))) {
        expect(read(path.join("src", "lib", dir, file))).not.toMatch(/benchmark\/ground-truth/);
      }
    }
  });

  it("only the comparison script loads the ground-truth file", () => {
    const scripts = fs.readdirSync(path.join(process.cwd(), "scripts", "benchmark"));
    const loaders = scripts.filter((f) => /RealCaseGroundTruthSchema/.test(read(path.join("scripts", "benchmark", f))));
    expect(loaders).toEqual(["compare-ground-truth.ts"]);
  });
});

describe("blind output — stable form", () => {
  const snap = (instant: string, signalId: string): SystemSnapshot =>
    ({
      entities: [{ id: "entity_b", provenance: { timestamp: instant } }, { id: "entity_a", provenance: { timestamp: instant } }],
      aliases: [],
      locations: [],
      evidenceItems: [],
      extractedRecords: [],
      resolutionDecisions: [],
      relationships: [],
      analyticalSignals: [
        { id: signalId, graphVersion: instant, provenance: { location: `graph_version:${instant}`, source: "community_0123456789abcdef0123" } },
      ],
      corroborationFindings: [],
    }) as unknown as SystemSnapshot;

  it("is identical for two runs that differ only in wall-clock instants and time-derived ids", () => {
    const a = stableBlindOutput(snap("2026-01-01T00:00:00.000Z", "analytical_signal_1"));
    const b = stableBlindOutput(snap("2026-02-02T11:11:11.111Z", "analytical_signal_2"));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.counts.entities).toBe(2);
  });

  it("orders id-stable collections by id and drops volatile keys", () => {
    const out = stableBlindOutput(snap("2026-01-01T00:00:00.000Z", "x"));
    expect((out.snapshot.entities as { id: string }[]).map((e) => e.id)).toEqual(["entity_a", "entity_b"]);
    expect(JSON.stringify(out)).not.toMatch(/2026-01-01/);
  });

  it("keeps non-volatile content untouched", () => {
    expect(stripVolatile({ occurredAtLabel: "noon", nested: { value: 3 } })).toEqual({ nested: { value: 3 }, occurredAtLabel: "noon" });
  });
});
