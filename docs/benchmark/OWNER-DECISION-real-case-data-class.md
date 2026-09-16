# Owner decision — a real judicial-record data class for benchmarking

**Status:** **Decided 2026-09-16 — Option B (approve, local-only data).**
Raised the same day, before any real case record was committed.

## 1. Why a decision is needed

`CLAUDE.md` §1 defines exactly two data classes and states that no real FIR,
investigative record, phone or financial identifier may enter this repository;
`docs/requirements.md` §9–10 repeats this and adds that the repository is public.
The benchmark requested on 2026-09-16 requires structured facts derived from a real
criminal case involving natural persons. That is a third data class. Adding it is
an owner decision, not an implementation detail.

Nothing real has been committed. Candidate research, requirements and the source
register (citations and hashes only) are documentation about public court records,
not the records themselves.

## 2. Proposed third data class

| | Real judicial-record benchmark |
|---|---|
| Nature | Structured facts transcribed from **public** court records of a **closed** case |
| Subjects | Natural persons appear. Defendant named per the caption; everyone else by role pseudonym |
| Identifiers | Tokenised (`BMK-<KIND>-<hash>`); raw values never committed |
| Documents | Never committed; source register + hashes + acquisition manifest only |
| Used for | Blind benchmark evaluation of the existing pipeline only |
| Never used for | Training, the demonstration narrative, the ML model, or mixing with either existing class |
| Isolation | Evidence pack and ground-truth pack in separate trees with an automated leak guard |

## 3. A limitation the owner should weigh

The pipeline cannot read documents. Someone must transcribe court testimony into
typed evidence items. In this session that transcriber is an AI that already knows
the outcome of this famous case. Mitigations proposed:

- Scope is fixed **by witness examination, before transcription**, and every
  statement in scope is transcribed — not selected by relevance to the verdict.
- Defence evidence and cross-examination inside scope are transcribed with equal
  completeness.
- Every item cites document/page/line so a second reviewer can audit coverage.
- The report states plainly that the benchmark measures pipeline reconstruction
  from a human/AI-normalised record, not blind reading of raw documents.

## 4. Options

- **A — Approve as proposed.** Commit the tokenised, pseudonymised evidence pack
  and ground-truth pack to the public repository; add the class to `CLAUDE.md`.
- **B — Approve, local-only data.** Build and run everything, but keep
  `benchmark/cases/**` and `benchmark/ground-truth/**` git-ignored; commit code,
  guards, docs, metrics and failure analysis only.
- **C — Reject.** No real case enters; the benchmark harness is built against
  the synthetic corpus only.

The decision, once made, is recorded here with its date and the option chosen.

## 5. Decision

**Option B**, chosen by the owner on 2026-09-16.

- `benchmark/cases/**`, `benchmark/ground-truth/**` and `benchmark/results/**` are
  git-ignored. Case-derived evidence items, ground-truth items and raw run outputs
  stay on the machine that built them.
- Committed: benchmark code, the leak guard and its tests, the acquisition manifest
  (URLs + hashes), documentation, aggregate metrics and failure analysis. Committed
  reports refer to people only by role pseudonym and to identifiers only by token.
- The two existing data classes in `CLAUDE.md` §1 are unchanged; this class is
  documented here and in `docs/benchmark/README.md` and never mixes with them.
