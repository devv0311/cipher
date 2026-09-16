import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { AcquisitionManifestSchema } from "@/lib/benchmark/acquisition";

/**
 * The tracked acquisition manifest for the real solved-case benchmark.
 * No network, no case data: these tests read only the committed manifest
 * and .gitignore (owner decision B keeps the documents local).
 */

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "benchmark", "acquisition", "us-v-ulbricht-sdny-14cr68.json");
const load = () => AcquisitionManifestSchema.parse(JSON.parse(fs.readFileSync(MANIFEST, "utf8")));

describe("benchmark acquisition manifest — us-v-ulbricht-sdny-14cr68", () => {
  it("validates against the schema", () => {
    expect(() => load()).not.toThrow();
  });

  it("has unique document ids, file names and hashes", () => {
    const { documents } = load();
    for (const key of ["documentId", "fileName", "sha256"] as const) {
      expect(new Set(documents.map((d) => d[key])).size).toBe(documents.length);
    }
  });

  it("never places an outcome document in the evidence pack", () => {
    const outcomeTypes = new Set([
      "verdict",
      "judgment",
      "sentencing_transcript",
      "post_trial_opinion",
      "appellate_opinion",
      "appellate_mandate",
    ]);
    const leaked = load().documents.filter((d) => d.pack === "evidence" && outcomeTypes.has(d.documentType));
    expect(leaked).toEqual([]);
  });

  it("puts every outcome document in the ground-truth pack", () => {
    const { documents } = load();
    for (const type of ["verdict", "judgment", "appellate_opinion"]) {
      const docs = documents.filter((d) => d.documentType === type);
      expect(docs.length).toBeGreaterThan(0);
      expect(docs.every((d) => d.pack === "ground_truth")).toBe(true);
    }
  });

  it("the transcript of the post-evidence trial day is ground truth, not evidence", () => {
    // 2015-02-04: jury charge and deliberations — legal framing, never evidence.
    const day = load().documents.find((d) => d.docketEntry === 220);
    expect(day?.pack).toBe("ground_truth");
  });

  it("keeps real case data out of git (owner decision B)", () => {
    const ignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
    for (const p of ["/benchmark/cases/", "/benchmark/ground-truth/", "/benchmark/results/"]) {
      expect(ignore).toContain(p);
    }
  });
});
