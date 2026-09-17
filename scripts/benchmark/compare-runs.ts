/**
 * Real solved-case benchmark — reproducibility check (B19).
 *
 *   node --import ./scripts/eval-resolve.mjs scripts/benchmark/compare-runs.ts [caseId] run-1 run-2 [...]
 *
 * Recomputes the stable output of each frozen blind run from its own
 * snapshot.json (the frozen files are never rewritten) and reports whether the
 * runs are identical once wall-clock data is normalised. Writes
 * benchmark/results/<caseId>/reproducibility.json (git-ignored) and prints a
 * one-line verdict. Exit code 1 when any run differs.
 */
import fs from "node:fs";
import path from "node:path";

import { sha256Json, stableBlindOutput } from "@/lib/benchmark/blind-output";
import type { SystemSnapshot } from "@/lib/evaluation/snapshot";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const caseId = args[0] ?? "us-v-ulbricht-sdny-14cr68";
const labels = args.slice(1).length > 0 ? args.slice(1) : ["run-1", "run-2"];
const base = path.join(ROOT, "benchmark", "results", caseId, "blind-run");

const runs = labels.map((label) => {
  const dir = path.join(base, label);
  if (!fs.existsSync(path.join(dir, "FROZEN.sha256"))) throw new Error(`${label} is not a frozen blind run`);
  const snapshot = JSON.parse(fs.readFileSync(path.join(dir, "snapshot.json"), "utf8")) as SystemSnapshot;
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "run-metadata.json"), "utf8")) as {
    evidencePackSha256: string;
    gitCommit: string | null;
    nodeVersion: string;
  };
  const stable = stableBlindOutput(snapshot);
  return { label, stableSha256: sha256Json(stable), counts: stable.counts, meta };
});

const [first] = runs;
if (!first) throw new Error("No runs to compare.");
const identical = runs.every((r) => r.stableSha256 === first.stableSha256);
const samePack = runs.every((r) => r.meta.evidencePackSha256 === first.meta.evidencePackSha256);
const result = {
  caseId,
  comparedAt: new Date().toISOString(),
  tolerance: "zero — deterministic stages; wall-clock instants and time-derived ids normalised (blind-output.ts)",
  samePack,
  identical,
  runs: runs.map((r) => ({
    label: r.label,
    stableSha256: r.stableSha256,
    evidencePackSha256: r.meta.evidencePackSha256,
    gitCommit: r.meta.gitCommit,
    nodeVersion: r.meta.nodeVersion,
    counts: r.counts,
  })),
};
fs.writeFileSync(path.join(ROOT, "benchmark", "results", caseId, "reproducibility.json"), JSON.stringify(result, null, 2) + "\n");
console.log(`${identical && samePack ? "IDENTICAL" : "DIFFERENT"}: ${runs.map((r) => `${r.label}=${r.stableSha256.slice(0, 12)}`).join(" ")}`);
if (!identical || !samePack) process.exitCode = 1;
