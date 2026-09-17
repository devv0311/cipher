# Visual evidence — real solved-case benchmark (BM1.2)

**Captured:** 2026-09-16. **Case:** `us-v-ulbricht-sdny-14cr68`. **Pipeline:** commit `4fb0f60`
with the benchmark harness committed alongside these files.

These are **generated charts, not screenshots**. The benchmark has no UI surface: it
runs the existing pipeline headlessly (`scripts/benchmark/blind-run.ts`). Each chart is
drawn by `python scripts/benchmark/render_visuals.py`, which prints every value it draws.
It reads the git-ignored local results (owner decision B), so it can be re-run only on a
machine holding them. The aggregate numbers are also committed in
[`reports/benchmark/us-v-ulbricht-sdny-14cr68/metrics.json`](../../../reports/benchmark/us-v-ulbricht-sdny-14cr68/metrics.json).
Everyone except the defendant is shown by role pseudonym; identifier tokens are omitted.

| File | What it shows | Source data |
|---|---|---|
| [`evidence-structure.svg`](./evidence-structure.svg) | Evidence pack v1.0 by source document and item type, and counts at each pipeline stage | `normalized/items.json`, `blind-summary.run-1.json` |
| [`reconstructed-graph.svg`](./reconstructed-graph.svg) | Identity subgraph from blind run v1.0: DPR → site account → laptop → OS login → defendant fragment B; fragment C merged with DPR via the PGP key; fragment A isolated; ALT-1 unconnected | `blind-summary.run-1.json` (the node layout is hand-placed; nodes and edges are those in the summary) |
| [`arrest-timeline.svg`](./arrest-timeline.svg) | Arrest-window events as transcribed, in UTC, with the temporal co-occurrence window the pipeline found | evidence items; `blind-summary.run-1.json` corroboration |
| [`benchmark-metrics.svg`](./benchmark-metrics.svg) | Ground-truth outcomes per assertion, v1.0 (official) and v1.1 (diagnostic) | `comparison.run-1.json`, `comparison.v1.1-run-1.json` |
| [`failure-categories.svg`](./failure-categories.svg) | Why assertions were not recovered, v1.0 | final report §17 (counts entered in the renderer and printed) |

What these do **not** prove: anything about pipeline behaviour on documents that were
not transcribed (95% of the testimony), or anything about guilt. See the
[final report](../../benchmark/us-v-ulbricht-sdny-14cr68-FINAL-BENCHMARK-REPORT.md) §25.
