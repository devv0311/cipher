# B0 — Repository audit for the real solved-case benchmark

**Date:** 2026-09-16 · **Base commit:** `9df7146` (`origin/master`) · **Status:** Complete

This audit records what the existing contracts can and cannot carry before any
real case is selected. Every statement below was read from the repository at
`9df7146`; nothing is taken from a prompt or a memory.

---

## 1. Existing contracts that the benchmark must reuse

| Contract | Where | What it fixes |
|---|---|---|
| Corpus manifest (evidence input) | `src/lib/corpus/manifest-schema.ts` → `CorpusManifestSchema` | One investigation, `evidenceSources[]`, `evidenceItems[]` with a free-form `content` whose shape is implied by `itemType`, plus `locations[]`, `communicationEvents[]`, `financialTransactions[]`. Corpus `name` is a slug (relaxed at P6 so non-synthetic corpora use the same path). |
| Evidence item types | `src/lib/domain/evidence.ts` | `fir`, `suspect_record`, `alias_record`, `phone_record`, `imei_record`, `vehicle_record`, `bank_account_record`, `location_record`, `cdr_event`, `financial_transaction_record`, `witness_statement`, `crime_event`, `public_record`. |
| Entity kinds | `src/lib/domain/entity.ts` | `person`, `organisation`, `phone`, `imei`, `vehicle`, `bank_account`. |
| Relationship types | `src/lib/domain/relationship.ts` | `communication`, `financial`, `co_location`, `family`, `associate`, `ownership`, `other`. |
| Classification ladder | `src/lib/domain/provenance.ts` | `observed_fact` → `corroborated_fact` → `algorithmic_signal` → `ai_inference` → `investigative_lead`; one-way. |
| Provenance | `ProvenanceSchema` | six mandatory fields: source, location, method, confidence, processingHistory, timestamp. |
| Ground-truth schema | `CorpusGroundTruthSchema` | **Pinned to `operation-darknet-delhi`** and to that case's shape (8+ principal suspects, money-mule paths, 8 Copilot answers). It cannot hold a real case's ground truth without change. |
| Ingestion | `src/lib/ingestion/service.ts` | 8 stages; accepts `builtin-corpus` or `uploaded` JSON; rejects answer-key files at `file_validation` (`GROUND_TRUTH_REJECTED`). |
| Extraction | `src/lib/extraction/extract.ts` | Deterministic **field reads** per `itemType`. `witness_statement.text` is kept verbatim and **never parsed**. |
| Resolution (frozen) | `src/lib/resolution/` | Exact identifier canonicalisation + person clustering via shared identifiers on the same evidence item. No fuzzy merges. Byte-identical to `af22018`. |
| Graph / analytics / corroboration | `src/lib/graph`, `src/lib/analytics`, `src/lib/corroboration` | Graph from resolved entities; centrality, bridges, Louvain communities, paths; temporal windows and haversine co-location over `communicationEvents` + `locations`. |
| Evaluation harness | `scripts/evaluate.ts`, `src/lib/evaluation/` | Runs the real stages against a wiped DB, reads the persisted snapshot, loads ground truth only afterwards, writes `reports/evaluation/`. Metrics: entity-resolution, graph, analytics, corroboration, provenance. |
| Real-data precedent | `docs/evaluation/real-data-pilot.md` | Honest-reporting precedent: a 100% score produced by a resolver that never merged is declared arithmetic, not accuracy. |

## 2. Findings that shape the benchmark

1. **The pipeline consumes structured records, not documents.** There is no PDF,
   OCR or free-text extraction stage. A court record can only enter as typed
   evidence items authored by a person. Every such item is a manual normalisation
   step and must be logged (B10). This is the largest single threat to a "blind"
   claim and is treated as such in B14/B17.
2. **No kinds for online identity.** There is no entity kind for an online handle,
   email address, IP address, server, cryptocurrency wallet or device other than
   phone/IMEI. A darknet or cyber case must either map these onto existing kinds
   (documented as lossy) or record a schema gap (B9).
3. **The system never concludes guilt.** Claims are built deterministically from
   persisted records; AI contributes wording only; nothing is promoted up the
   classification ladder. A judicial outcome (conviction/acquittal) therefore has
   no counterpart in pipeline output. Outcome comparison (B16) must be framed as
   fact/relationship/timeline recovery against court-established facts, not as a
   verdict prediction.
4. **Ground-truth isolation already exists** and can be reused: answer-key
   rejection at ingestion, and source-scan tests proving no pipeline module imports
   the ground-truth loader (`tests/unit/corpus.test.ts`, `tests/unit/ingestion.test.ts`).
5. **Ground-truth schema is case-specific.** A real case needs its own
   ground-truth schema rather than bending `CorpusGroundTruthSchema`.
6. **Repository rule conflict.** `CLAUDE.md` §1 and `docs/requirements.md` §9–10
   forbid real FIRs, real investigative records and natural persons in this
   public repository. A real solved-case benchmark is a new data class and needs
   a recorded owner decision before any real case record is committed —
   see [`OWNER-DECISION-real-case-data-class.md`](./OWNER-DECISION-real-case-data-class.md).
7. **Frozen areas are not touched.** P6 ML is closed; `src/lib/resolution/` is
   frozen; Copilot is out of scope for this benchmark.

## 3. Working-copy state

The folder supplied for this task (`netintel-ai-master/`) is a source download,
not a git repository. A fresh clone of `origin/master` was taken; a recursive
comparison ignoring line endings found no differences. All benchmark work is done
in the clone. Push access to `devv0311/netintel-ai` was confirmed via the GitHub API.
`node_modules` is not installed in either copy.

> **Historical note (2026-09-18).** The repository slug and folder names above are
> recorded as they were on 2026-09-16. The canonical repository is now
> `devv0311/cipher` — see `docs/governance/naming.md`. The names are left as
> captured because this section records which working copy was audited and which
> slug the access check was performed against; rewriting them would make the
> record false.
