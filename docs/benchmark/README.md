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

## Layout

```text
benchmark/
├── acquisition/<case-id>.json   tracked — URLs, SHA-256, pack assignment per document
├── cases/<case-id>/             git-ignored — sources/, evidence/, normalized/, manifests/
├── ground-truth/<case-id>/      git-ignored — never readable by the pipeline
└── results/<case-id>/           git-ignored — frozen blind-run outputs
```

## Reproduce acquisition

```bash
npm run benchmark:acquire
```

Downloads every registered document into `benchmark/cases/<case-id>/sources/<pack>/`
and fails if any file's SHA-256 differs from the manifest.

## Current case

`us-v-ulbricht-sdny-14cr68` — *United States v. Ross William Ulbricht*, S.D.N.Y.
1:14-cr-00068, 2d Cir. 15-1815. Selection rationale and known gaps:
[`candidate-cases.md`](./candidate-cases.md) §3.
