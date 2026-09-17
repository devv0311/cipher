/**
 * Real solved-case benchmark — ground-truth comparison (B15–B18).
 *
 *   node --import ./scripts/eval-resolve.mjs scripts/benchmark/compare-ground-truth.ts [caseId] <label> [<label> ...]
 *
 * Runs only after a blind run is frozen AND its blind summary exists (both are
 * checked). Loads benchmark/ground-truth/<caseId>/ground-truth.json — the only
 * script in the benchmark that does — scores every assertion, and writes
 * benchmark/results/<caseId>/comparison.<label>.json (git-ignored).
 *
 * Reported per label:
 *   - assertion outcomes and the score table (never a single "accuracy");
 *   - entity-resolution diagnostics: how many entities carry the defendant's
 *     name, how many name mentions were left ambiguous, which merges have no
 *     ground-truth counterpart at all (neither confirmed nor refuted);
 *   - evidence coverage: which assertions had any model-visible support.
 */
import fs from "node:fs";
import path from "node:path";

import {
  anchoredFragments,
  RealCaseGroundTruthSchema,
  scoreAssertion,
  summarise,
  type BlindSummary,
} from "@/lib/benchmark/ground-truth";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const caseId = args[0] ?? "us-v-ulbricht-sdny-14cr68";
const labels = args.slice(1);
if (labels.length === 0) throw new Error("Name at least one frozen blind-run label.");

const results = path.join(ROOT, "benchmark", "results", caseId);
for (const label of labels) {
  if (!fs.existsSync(path.join(results, "blind-run", label, "FROZEN.sha256"))) throw new Error(`${label} is not frozen`);
  if (!fs.existsSync(path.join(results, `blind-summary.${label}.json`))) throw new Error(`${label} has no blind summary; write it before opening ground truth`);
}

const gt = RealCaseGroundTruthSchema.parse(
  JSON.parse(fs.readFileSync(path.join(ROOT, "benchmark", "ground-truth", caseId, "ground-truth.json"), "utf8")),
);
const DEFENDANT = "Ross Ulbricht";

for (const label of labels) {
  const summary = JSON.parse(fs.readFileSync(path.join(results, `blind-summary.${label}.json`), "utf8")) as BlindSummary & {
    resolutionTypes: Record<string, number>;
  };
  const scored = gt.assertions.map((a) => scoreAssertion(a, summary));
  const table = summarise(scored);

  const defendantEntities = summary.persons.filter((p) => p.label === DEFENDANT || p.aliases.includes(DEFENDANT));
  const identifierAnchored = anchoredFragments(summary, DEFENDANT);
  const multiMentionMerges = summary.persons
    .filter((p) => p.aliases.length > 0 || p.mentions.filter((m) => /shared_identifier_merge/.test(JSON.stringify(m))).length > 1)
    .map((p) => ({ label: p.label, aliases: p.aliases, mentions: p.mentions.length }));
  const gtLabels = new Set(
    gt.assertions.flatMap((a) =>
      a.matcher.kind === "identity_link" || a.matcher.kind === "no_link" ? [a.matcher.a, a.matcher.b] : [],
    ),
  );
  const aliasesWithoutGroundTruth = summary.persons.flatMap((p) =>
    p.aliases.filter((al) => !gtLabels.has(al)).map((al) => ({ entity: p.label, alias: al })),
  );

  const comparison = {
    caseId,
    label,
    groundTruthSha256: undefined as string | undefined,
    comparedAt: new Date().toISOString(),
    scorerVersion: "v2 (fragment-aware identity_link; path_exists)",
    scoreTable: table,
    assertions: scored,
    entityResolution: {
      entitiesCarryingDefendantName: defendantEntities.length,
      identifierAnchoredDefendantFragments: identifierAnchored.length,
      resolutionTypes: summary.resolutionTypes,
      mergesAndAliases: multiMentionMerges,
      aliasesWithNoGroundTruthCounterpart: aliasesWithoutGroundTruth,
    },
    coverage: {
      assertions: gt.assertions.length,
      withModelVisibleSupport: gt.assertions.filter((a) => a.modelVisibleSupport.length > 0).length,
      notScorable: scored.filter((s) => s.outcome === "not_scorable").map((s) => s.id),
    },
    finalOutcome: {
      groundTruth: gt.finalOutcome,
      systemConclusion: "none — the system is prohibited from drawing culpability conclusions; outcome agreement is not measured",
    },
  };
  const { createHash } = await import("node:crypto");
  comparison.groundTruthSha256 = createHash("sha256")
    .update(fs.readFileSync(path.join(ROOT, "benchmark", "ground-truth", caseId, "ground-truth.json")))
    .digest("hex");
  fs.writeFileSync(path.join(results, `comparison.${label}.json`), JSON.stringify(comparison, null, 2) + "\n");

  console.log(`\n== ${label}`);
  console.log(JSON.stringify(table));
  for (const s of scored) console.log(`  ${s.id.padEnd(10)} ${s.polarity.padEnd(8)} ${s.outcome.padEnd(20)} ${s.detail}`);
  console.log(`  defendant-name entities: ${defendantEntities.length} (identifier-anchored fragments: ${identifierAnchored.length})`);
  console.log(`  aliases with no ground-truth counterpart: ${JSON.stringify(aliasesWithoutGroundTruth)}`);
}
