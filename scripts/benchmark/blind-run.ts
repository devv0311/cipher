/**
 * Real solved-case benchmark — the blind run (B10–B14, B19).
 *
 *   node --import ./scripts/eval-resolve.mjs scripts/benchmark/blind-run.ts [caseId] [--label run-1] [--pack 1.0.0]
 *
 * Reads ONLY the frozen evidence pack benchmark/cases/<caseId>/evidence/corpus.json,
 * after the leak guard has checked its path, its fields and every item's
 * citation against the tracked acquisition manifest. Runs the real pipeline
 * stages in the real order through the same service functions the API routes
 * call, against a dedicated, wiped database. The Copilot and dossier stages are
 * not run (out of scope for this benchmark; the Copilot calls a paid model).
 *
 * Writes (git-ignored, owner decision B):
 *   benchmark/results/<caseId>/blind-run/<label>/snapshot.json         full persisted state
 *   benchmark/results/<caseId>/blind-run/<label>/stable-output.json    volatile fields removed
 *   benchmark/results/<caseId>/blind-run/<label>/run-metadata.json     hashes, versions, stage results
 *   benchmark/results/<caseId>/blind-run/<label>/FROZEN.sha256         hashes of the three files
 *
 * Nothing under benchmark/ground-truth/ is read, imported or addressed here —
 * tests/unit/benchmark-leak-guard.test.ts scans this file to keep it that way.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { AcquisitionManifestSchema } from "@/lib/benchmark/acquisition";
import { assertEvidencePackIsBlind, assertEvidencePackPath, evidencePackPath, packSuffix } from "@/lib/benchmark/leak-guard";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const caseId = args[0] && !args[0].startsWith("--") ? args[0] : "us-v-ulbricht-sdny-14cr68";
const labelIdx = args.indexOf("--label");
const label = (labelIdx >= 0 ? args[labelIdx + 1] : undefined) ?? "run-1";
const packIdx = args.indexOf("--pack");
const packVersion = (packIdx >= 0 ? args[packIdx + 1] : undefined) ?? "1.0.0";

const OUT = path.join(ROOT, "benchmark", "results", caseId, "blind-run", label);
const DB = path.join(OUT, "blind-run.db");

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function gitCommit(): string | null {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  if (fs.existsSync(path.join(OUT, "FROZEN.sha256"))) {
    throw new Error(`${path.relative(ROOT, OUT)} is frozen. A blind run is never overwritten; use a new --label.`);
  }

  const packPath = evidencePackPath(ROOT, caseId, packVersion);
  assertEvidencePackPath(ROOT, caseId, packPath, packVersion);
  const packText = fs.readFileSync(packPath, "utf8");
  const pack = JSON.parse(packText) as unknown;
  const acquisition = AcquisitionManifestSchema.parse(
    JSON.parse(fs.readFileSync(path.join(ROOT, "benchmark", "acquisition", `${caseId}.json`), "utf8")),
  );
  assertEvidencePackIsBlind(pack, acquisition);

  const frozenHashFile = path.join(ROOT, "benchmark", "cases", caseId, "manifests", `evidence-pack${packSuffix(packVersion)}.sha256`);
  const frozenHash = fs.readFileSync(frozenHashFile, "utf8").split(/\s+/)[0];
  const packHash = sha256(packText);
  if (packHash !== frozenHash) {
    throw new Error(`Evidence pack hash ${packHash} does not match the frozen hash ${frozenHash}.`);
  }

  fs.mkdirSync(OUT, { recursive: true });
  for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(DB + suffix, { force: true });
  process.env.DATABASE_URL = DB;
  process.env.APP_ENV = process.env.APP_ENV ?? "development";

  const { runIngestion } = await import("@/lib/ingestion/service");
  const { runExtraction } = await import("@/lib/extraction/service");
  const { runResolution } = await import("@/lib/resolution/service");
  const { runGraphSynthesis } = await import("@/lib/graph/service");
  const { runAnalyticsSynthesis } = await import("@/lib/analytics/service");
  const { runCorroborationSynthesis } = await import("@/lib/corroboration/service");

  const stages: { stage: string; status: string; ms: number; error: unknown }[] = [];
  const stage = async (name: string, fn: () => Promise<unknown>) => {
    const began = Date.now();
    const result = (await fn()) as { status?: string; error?: unknown };
    stages.push({ stage: name, status: result?.status ?? "ok", ms: Date.now() - began, error: result?.error ?? null });
    console.log(`  ${name.padEnd(32)} ${result?.status ?? "ok"}`);
    if (result?.status === "failed") console.log("    ", JSON.stringify(result.error));
  };

  console.log(`Blind run ${caseId} / ${label}`);
  await stage("ingestion", () => runIngestion({ kind: "uploaded", filename: "corpus.json", contents: pack }));
  await stage("extraction", () => runExtraction());
  await stage("resolution", () => runResolution());
  await stage("graph synthesis", () => runGraphSynthesis());
  await stage("topology analytics", () => runAnalyticsSynthesis());
  await stage("spatial/temporal corroboration", () => runCorroborationSynthesis());

  const { loadSystemSnapshot } = await import("@/lib/evaluation/snapshot");
  const { stableBlindOutput, sha256Json } = await import("@/lib/benchmark/blind-output");
  const snapshot = await loadSystemSnapshot();
  const stable = stableBlindOutput(snapshot);

  const snapshotText = JSON.stringify(snapshot, null, 2) + "\n";
  const stableText = JSON.stringify(stable, null, 2) + "\n";
  const metadata = {
    caseId,
    label,
    packVersion,
    caseVersion: (pack as { corpus: { version: string } }).corpus.version,
    evidencePackSha256: packHash,
    acquisitionManifestSha256: sha256(
      fs.readFileSync(path.join(ROOT, "benchmark", "acquisition", `${caseId}.json`), "utf8"),
    ),
    stableOutputSha256: sha256Json(stable),
    gitCommit: gitCommit(),
    nodeVersion: process.version,
    schemaVersion: "corpus-manifest (src/lib/corpus/manifest-schema.ts @ gitCommit)",
    modelVersion: "none — deterministic stages only; Copilot and ML scoring not run",
    startedAt: new Date().toISOString(),
    stages,
    counts: stable.counts,
    groundTruthRead: false,
  };
  const metadataText = JSON.stringify(metadata, null, 2) + "\n";

  fs.writeFileSync(path.join(OUT, "snapshot.json"), snapshotText);
  fs.writeFileSync(path.join(OUT, "stable-output.json"), stableText);
  fs.writeFileSync(path.join(OUT, "run-metadata.json"), metadataText);
  fs.writeFileSync(
    path.join(OUT, "FROZEN.sha256"),
    [
      `${sha256(snapshotText)}  snapshot.json`,
      `${sha256(stableText)}  stable-output.json`,
      `${sha256(metadataText)}  run-metadata.json`,
    ].join("\n") + "\n",
  );

  const { closeAllDbConnections } = await import("@/lib/db/client");
  closeAllDbConnections();
  console.log(`Counts: ${JSON.stringify(stable.counts)}`);
  console.log(`Stable output sha256: ${metadata.stableOutputSha256}`);
  console.log(`Frozen: ${path.relative(ROOT, OUT)}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
