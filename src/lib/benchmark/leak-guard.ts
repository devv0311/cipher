import path from "node:path";

import type { AcquisitionManifest } from "./acquisition";

/**
 * Leak guard for the real solved-case benchmark (B7 / B14).
 *
 * The blind run may read exactly one thing: the frozen evidence pack at
 * benchmark/cases/<caseId>/evidence/corpus.json. This module fails loudly —
 * before any pipeline stage runs — if the input could carry the outcome:
 *
 *   1. the path is not the evidence pack, or points into a ground-truth tree;
 *   2. the JSON carries an answer-key field anywhere in its structure;
 *   3. an evidence item cites a document that the acquisition manifest
 *      assigned to the ground-truth or excluded pack.
 *
 * Check 3 is the one that matters most: an item transcribed from the verdict,
 * the judgment or the appellate opinion is rejected even if nothing about its
 * shape looks like an answer key.
 */

export type BenchmarkLeakCode =
  | "PATH_NOT_EVIDENCE_PACK"
  | "ANSWER_KEY_FIELD"
  | "CITES_NON_EVIDENCE_DOCUMENT"
  | "UNCITED_ITEM";

export class BenchmarkLeakError extends Error {
  readonly code: BenchmarkLeakCode;

  constructor(code: BenchmarkLeakCode, message: string) {
    super(message);
    this.code = code;
    this.name = "BenchmarkLeakError";
  }
}

/** Field names that belong to an answer key, never to evidence. Matched case-insensitively at any depth. */
export const ANSWER_KEY_FIELDS = [
  // synthetic ground-truth markers (src/lib/ingestion/source.ts)
  "expectedEntityMerges",
  "hiddenConnections",
  "moneyMulePaths",
  "intendedConclusions",
  "expectedCopilotAnswers",
  "expectedCommunities",
  "doNotMerge",
  // real-case ground-truth markers (benchmark/ground-truth/<caseId>/)
  "establishedFindings",
  "finalOutcome",
  "verdictByCount",
  "judgmentByCount",
  "rejectedAllegations",
  "standardOfProof",
  "courtReasoning",
] as const;

const ANSWER_KEY_SET = new Set(ANSWER_KEY_FIELDS.map((k) => k.toLowerCase()));

/** Pack v1.0.0 is `corpus.json`; any later version is `corpus.v<version>.json`. */
export function packSuffix(version = "1.0.0"): string {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid pack version "${version}"`);
  return version === "1.0.0" ? "" : `.v${version}`;
}

export function evidencePackPath(root: string, caseId: string, version = "1.0.0"): string {
  return path.join(root, "benchmark", "cases", caseId, "evidence", `corpus${packSuffix(version)}.json`);
}

export function assertEvidencePackPath(root: string, caseId: string, candidate: string, version = "1.0.0"): void {
  const expected = path.resolve(evidencePackPath(root, caseId, version));
  const actual = path.resolve(candidate);
  const lowered = actual.toLowerCase().replace(/\\/g, "/");
  if (lowered.includes("/ground-truth/") || lowered.includes("/ground_truth/")) {
    throw new BenchmarkLeakError("PATH_NOT_EVIDENCE_PACK", "Refusing to read a ground-truth path in a blind run.");
  }
  if (actual !== expected) {
    throw new BenchmarkLeakError(
      "PATH_NOT_EVIDENCE_PACK",
      `A blind run reads only the frozen evidence pack (benchmark/cases/${caseId}/evidence/corpus${packSuffix(version)}.json).`,
    );
  }
}

export function findAnswerKeyFields(value: unknown, trail = "$"): string[] {
  const hits: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((v, i) => hits.push(...findAnswerKeyFields(v, `${trail}[${i}]`)));
  } else if (value !== null && typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (ANSWER_KEY_SET.has(key.toLowerCase())) hits.push(`${trail}.${key}`);
      hits.push(...findAnswerKeyFields(v, `${trail}.${key}`));
    }
  }
  return hits;
}

interface CitedItem {
  ref?: unknown;
  content?: { citation?: { doc?: unknown } };
}

export function assertEvidencePackIsBlind(raw: unknown, acquisition: AcquisitionManifest): void {
  const answerKey = findAnswerKeyFields(raw);
  if (answerKey.length > 0) {
    throw new BenchmarkLeakError("ANSWER_KEY_FIELD", `Evidence pack carries answer-key fields: ${answerKey.join(", ")}`);
  }

  const evidenceDocs = new Set(
    acquisition.documents.filter((d) => d.pack === "evidence").map((d) => d.docketEntry),
  );
  const items = ((raw as { evidenceItems?: unknown }).evidenceItems ?? []) as CitedItem[];
  for (const item of items) {
    const doc = item.content?.citation?.doc;
    if (typeof doc !== "number") {
      throw new BenchmarkLeakError("UNCITED_ITEM", `Evidence item ${String(item.ref)} has no document citation.`);
    }
    if (!evidenceDocs.has(doc)) {
      throw new BenchmarkLeakError(
        "CITES_NON_EVIDENCE_DOCUMENT",
        `Evidence item ${String(item.ref)} cites docket entry ${doc}, which is not in the evidence pack.`,
      );
    }
  }
}
