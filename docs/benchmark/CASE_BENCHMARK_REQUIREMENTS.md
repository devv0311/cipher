# Real solved-case benchmark — requirements (B1)

**Status:** Defined 2026-09-16, before any case was selected.
**Question the benchmark answers:** given only the publicly reconstructable,
pre-verdict evidence of a real case — never the outcome — how closely does
NetIntel's evidence reconstruction agree with what the court established?

This is written before case research so that the case is chosen to fit the
requirements, not the requirements to fit a case.

---

## 1. What an ideal case contains

Each item is scored in `candidate-cases.md` as **available / partial / absent**
from legitimate public sources.

### 1.1 Core records
- charging document(s): FIR/complaint, indictment, chargesheet or equivalent
- prosecution and defence filings
- evidence as presented: testimony, exhibits, or their record equivalents
- final judgment and relevant orders
- appellate decision(s) where the judgment was appealed
- a reconstructable chronology

### 1.2 Persons and things
accused · complainants/victims · witnesses · associates/co-accused ·
organisations · vehicles · locations · accounts · devices · online identities

### 1.3 Evidence types
documentary · testimony · forensic · digital · CCTV · communications ·
financial/transaction · location · chronology

### 1.4 Relationships
person↔person · person↔organisation · person↔phone/device · person↔account ·
person↔location · person↔event · transaction↔entity · communication↔entity

## 2. Ground-truth requirements

1. **A final judicial determination exists and is identifiable** (conviction,
   acquittal, or mixed), including its exact scope — which counts, which
   defendants, which findings.
2. **Finality is recorded honestly.** Appeals, remands, dismissed counts and
   post-judgment executive acts (pardon, commutation) are recorded as what they
   are. An executive act is not a judicial finding and does not rewrite one.
3. **Allegations are never ground truth.** A charging document, an opening
   statement or a sentencing submission states what a party alleges. Only facts
   found by the fact-finder or recited as established by a court become
   `established`; everything else is `alleged`, `contested` or `rejected`.
4. **Negative ground truth is kept.** Rejected alternative explanations, uncharged
   or dismissed allegations, and documented contradictions are first-class
   ground-truth items, because a reconstruction that invents them is wrong.
5. **Every ground-truth assertion cites its source** (document, page, line or
   paragraph).

## 3. Evidence-pack / ground-truth separation

| Model-visible (evidence pack) | Never model-visible (ground-truth pack) |
|---|---|
| Pre-verdict evidence: testimony, exhibits read into the record, charging documents (labelled as allegation), pre-trial evidentiary filings | Verdict form, judgment, sentencing record, post-trial and appellate opinions |
| Defence evidence and cross-examination | Closing arguments and jury instructions (advocacy / legal framing, not evidence) |
| | Anything authored after the verdict |
| | The benchmark answer key and all derived labels |

The separation is by **document and document section**, fixed before
transcription, never by whether an item helps or hurts the expected answer.

An automated guard must fail the run if any ground-truth path, file, or
answer-key field reaches the pipeline.

## 4. Pipeline-fit requirements

- The case must be representable in the existing corpus manifest; gaps are
  documented in the schema mapping before any schema change.
- Manual normalisation (transcribing a record into typed items) is allowed only
  under a written transcription protocol, and every item records who/what
  authored it and from which page/line.
- The frozen resolver, the closed P6 model and the Copilot are not modified.

## 5. Legal and privacy requirements

- Sources: official court, government, or recognised free legal archives. No
  leaked, sealed, private or paywall-bypassed material; no CAPTCHA or access
  control circumvention.
- Record per document: licence/access conditions, copyright notes, permitted use,
  hash, retrieval method and time.
- Public availability is not a reuse licence. Where redistribution is uncertain,
  commit provenance and acquisition instructions, not the document.
- **Data minimisation:** name only what the benchmark needs. Private individuals
  (civilian witnesses, bystanders) are referred to by role pseudonym. Raw
  identifiers (emails, IPs, wallet addresses, phone numbers, hostnames) are
  replaced by deterministic tokens so exact-match resolution still works.
- Exclude cases involving minors, sexual offences, or victims whose identification
  is legally restricted.

## 6. Evaluation requirements

- Metrics are reported per layer (entity, alias, relationship, event, timeline,
  corroboration, contradiction, provenance) — never a single headline accuracy.
- Every mismatch gets a failure class (B17).
- Coverage is reported as **publicly reconstructable record**, never as the full
  investigative record.
- The blind run's outputs are frozen and hashed before ground truth is opened.
- A repeat run on the same frozen evidence must reproduce the output within a
  documented tolerance (the pipeline is deterministic, so the tolerance is zero).

## 7. Selection criteria (weights used in B3/B4)

| # | Criterion | Weight |
|---|---|---|
| 1 | Publicly available primary evidence | 3 |
| 2 | Clear, final judicial outcome | 3 |
| 3 | Breadth of evidence types | 2 |
| 4 | Cross-document relationships | 2 |
| 5 | Temporal reasoning required | 1 |
| 6 | Entity-resolution / alias requirements | 2 |
| 7 | Provenance traceability (page/line citable) | 2 |
| 8 | Reproducible acquisition | 2 |
| 9 | Lawful acquisition and low privacy risk | 3 |
| 10 | Fit with the existing pipeline | 2 |
| — | Evidence/ground-truth separability (can pre-verdict evidence be separated from the conclusion by document?) | 3 |

Hard rejections: unresolved outcome; evidence available only through the
judgment's own narrative **and** no other source; sealed or restricted core
evidence; protected victims.
