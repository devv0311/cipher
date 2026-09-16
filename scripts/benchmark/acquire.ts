/**
 * Real solved-case benchmark — reproducible acquisition (B5).
 *
 *   node --import ./scripts/eval-resolve.mjs scripts/benchmark/acquire.ts [caseId]
 *
 * Reads the tracked acquisition manifest (benchmark/acquisition/<caseId>.json),
 * downloads every listed public court record into the git-ignored local store
 * benchmark/cases/<caseId>/sources/<pack>/, and verifies each file's SHA-256
 * against the manifest. A file whose hash differs is not kept: the run fails
 * loudly rather than benchmarking against bytes nobody registered.
 *
 * Ground-truth documents land under sources/ground_truth/, never beside the
 * evidence documents, so the evidence pack can be assembled from one directory.
 *
 * Polite by construction: sequential requests, a fixed delay between them, an
 * honest user agent, no authentication, nothing that circumvents access control.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { AcquisitionManifestSchema } from "@/lib/benchmark/acquisition";

const ROOT = process.cwd();
const caseId = process.argv[2] ?? "us-v-ulbricht-sdny-14cr68";
const DELAY_MS = 1500;
const USER_AGENT = "cipher-benchmark-acquisition/1.0 (public court record research)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const sha256 = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");

async function main(): Promise<void> {
  const manifestPath = path.join(ROOT, "benchmark", "acquisition", `${caseId}.json`);
  const manifest = AcquisitionManifestSchema.parse(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
  const store = path.join(ROOT, "benchmark", "cases", caseId, "sources");

  let fetched = 0;
  let verified = 0;
  const failures: string[] = [];

  for (const doc of manifest.documents) {
    const dir = path.join(store, doc.pack);
    const target = path.join(dir, doc.fileName);
    fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(target) && sha256(fs.readFileSync(target)) === doc.sha256) {
      verified += 1;
      continue;
    }

    const res = await fetch(doc.url, { headers: { "user-agent": USER_AGENT } });
    fetched += 1;
    if (!res.ok) {
      failures.push(`${doc.documentId} HTTP ${res.status}`);
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      const got = sha256(buf);
      if (got !== doc.sha256) {
        failures.push(`${doc.documentId} sha256 mismatch (expected ${doc.sha256.slice(0, 12)}…, got ${got.slice(0, 12)}…)`);
      } else {
        fs.writeFileSync(target, buf);
        verified += 1;
      }
    }
    await sleep(DELAY_MS);
  }

  console.log(`${caseId}: ${manifest.documents.length} registered, ${verified} verified, ${fetched} fetched`);
  if (failures.length > 0) {
    for (const f of failures) console.error(`  FAIL ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
