# Real solved-case benchmark

A benchmark that runs the existing CIPHER pipeline on the **publicly
reconstructable, pre-verdict record** of a real, closed criminal case and compares
what it reconstructs with what the court established — without ever showing the
pipeline the outcome.

This is a **third data class**, separate from the synthetic Operation DarkNet Delhi
corpus and from the public-register corpora. Its rules are set by the owner
decision below and it never mixes with either existing class.

## Documents

| Phase | Document |
|---|---|
| B0 | [`B0-repository-audit.md`](./B0-repository-audit.md) — what the existing contracts can carry |
| Gate | [`OWNER-DECISION-real-case-data-class.md`](./OWNER-DECISION-real-case-data-class.md) — **Option B: case data stays local** |
| B1 | [`CASE_BENCHMARK_REQUIREMENTS.md`](./CASE_BENCHMARK_REQUIREMENTS.md) — requirements and selection weights, fixed before research |
| B2–B4 | [`candidate-cases.md`](./candidate-cases.md) — eight candidates, matrix, selection |
| B5 | [`source-register.md`](./source-register.md) — every document, hash, licence and role |
| B6 | [`transcription-protocol.md`](./transcription-protocol.md) — how testimony became evidence items, and where the protocol was not met |
| B8 | [`us-v-ulbricht-sdny-14cr68-evidence-ground-truth-matrix.md`](./us-v-ulbricht-sdny-14cr68-evidence-ground-truth-matrix.md) |
| B9 | [`us-v-ulbricht-sdny-14cr68-schema-mapping.md`](./us-v-ulbricht-sdny-14cr68-schema-mapping.md) — gaps G1–G9 |
| B11 | [`../../reports/benchmark/us-v-ulbricht-sdny-14cr68/entity-resolution-report.md`](../../reports/benchmark/us-v-ulbricht-sdny-14cr68/entity-resolution-report.md) |
| B20 | [`us-v-ulbricht-sdny-14cr68-FINAL-BENCHMARK-REPORT.md`](./us-v-ulbricht-sdny-14cr68-FINAL-BENCHMARK-REPORT.md) — **results** |
| B21 | [`../progress/benchmark/`](../progress/benchmark/) — generated charts |

## Layout

```text
benchmark/
├── acquisition/<case-id>.json   tracked — URLs, SHA-256, pack assignment per document
├── cases/<case-id>/             git-ignored — sources/, evidence/, normalized/, manifests/
├── ground-truth/<case-id>/      git-ignored — never readable by the pipeline
└── results/<case-id>/           git-ignored — frozen blind-run outputs
```

## Commands, in order

```bash
npm run benchmark:acquire
npm run benchmark:blind-run -- us-v-ulbricht-sdny-14cr68 --label run-1 --pack 1.0.0
npm run benchmark:blind-run -- us-v-ulbricht-sdny-14cr68 --label run-2 --pack 1.0.0
npm run benchmark:compare-runs -- us-v-ulbricht-sdny-14cr68 run-1 run-2
npm run benchmark:summarize -- us-v-ulbricht-sdny-14cr68 run-1
npm run benchmark:compare-ground-truth -- us-v-ulbricht-sdny-14cr68 run-1
python scripts/benchmark/render_visuals.py
```

Acquisition downloads every registered document and fails if any file's SHA-256 differs
from the manifest; it works anywhere. Every later step needs the local, git-ignored
evidence pack and ground truth, which under decision B exist only on the machine that
transcribed them. Summarise **before** opening ground truth. The blind run refuses to
overwrite a frozen run, refuses a pack whose hash differs from its frozen hash, and runs
the leak guard (`src/lib/benchmark/leak-guard.ts`) before any stage.

## Current case

`us-v-ulbricht-sdny-14cr68` — *United States v. Ross William Ulbricht*, S.D.N.Y.
1:14-cr-00068, 2d Cir. 15-1815. Selection rationale and known gaps:
[`candidate-cases.md`](./candidate-cases.md) §3.
