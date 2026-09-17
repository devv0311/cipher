# Final benchmark report — `us-v-ulbricht-sdny-14cr68`

**Status:** Complete for one case (B0–B22). Stopped here by design (B23).
**Date:** 2026-09-16 · **Pipeline commit at run time:** `4fb0f60`, plus the benchmark harness
that is committed alongside this report (the harness does not modify any pipeline stage).
**Data class:** real judicial record, local-only (owner decision B). Nothing in this report
reproduces a court document. Everyone except the defendant is referred to by role pseudonym;
identifiers appear only as tokens.

> **Headline.** On the publicly reconstructable, pre-verdict record, as transcribed, the
> frozen deterministic pipeline did three things. It linked the Dread Pirate Roberts
> persona to the defendant through the seized laptop. It merged one defendant fragment
> with DPR through the PGP key. It placed the DPR chat and the laptop chat in the same
> arrest window. It created no false link to either investigated alternative suspect.
> It did **not** assemble the defendant into one identity (3 identifier-anchored
> fragments and 12 name-only entities). It built no communication edges from the
> official v1.0 pack, and it has no way to flag the central contradiction. Of 9 scorable
> positive ground-truth assertions it fully recovered 3, partially recovered 1 and
> missed 5; all 3 scorable negative assertions were correctly absent. 10 of 22
> assertions cannot be scored against this pipeline at all. **This is a measurement
> of pipeline reconstruction from a hand-normalised 5% of the testimony, not of reading
> a case file, and not of predicting a verdict.**

---

## 1. Case overview

*United States v. Ross William Ulbricht*, S.D.N.Y. 1:14-cr-00068; 2d Cir. No. 15-1815
(858 F.3d 71). The prosecution of the operator of Silk Road, a Tor marketplace. Trial
13 January – 4 February 2015. The contested factual question at trial was identity:
whether the defendant was the pseudonymous administrator "Dread Pirate Roberts".

## 2. Why this case was selected

Weighted 70/75 against requirements fixed before research
([`candidate-cases.md`](./candidate-cases.md)). Decisive: pre-verdict evidence
(testimony, defence cross-examination) and the outcome (verdict, judgment, appellate
opinion) live in **different documents**, so a blind split is possible. The Parliament
attack case scored 0 on that criterion because its evidence is public only inside the
judgments. Identity was the trial's contested issue, which targets entity resolution
directly. The record carries negative ground truth: abandoned alternative suspects and
uncharged, unproven murder-for-hire allegations.

## 3. Public evidence available

25 court records retrieved from the RECAP archive of PACER and hashed
([`source-register.md`](./source-register.md)): charging documents (scanned),
13 trial-day transcripts (≈590k words, 17 witnesses), evidentiary and post-trial
opinions, verdict form, judgment, sentencing transcript, appellate mandate and opinion.
`npm run benchmark:acquire` re-downloaded all 25 and matched every hash.

## 4. Evidence not publicly available

- **Trial exhibits.** The court does not retain them (Doc. 332). Chat logs, journal
  files, spreadsheets and blockchain analyses survive only where read into the transcript.
- **Trial days without a free copy** (e.g. 27 and 30 January 2015). Not purchased from PACER.
- **The sealed criminal complaint** (Doc. 1). No official free copy; a non-official mirror
  exists and was not used.
- **Grand-jury material, the pre-sentence report, sealed appendices, and the corrupt-agent
  evidence the court excluded.** Not public.
- **The full investigative record** (pen/trap data, server images, lab reports). Never public.

## 5. Source register

[`source-register.md`](./source-register.md): 25 retrieved documents with URL, retrieval
time, bytes, SHA-256, role and access status (11 APPROVED: opinions, orders, verdict,
judgment, charging documents, mandate; 14 APPROVED_WITH_RESTRICTIONS: trial and sentencing transcripts), plus 4 known-but-not-retrieved sources.
Tracked manifest: `benchmark/acquisition/us-v-ulbricht-sdny-14cr68.json`.

## 6. Evidence-pack composition

Pack v1.0.0 (official), sha256 `38ee79ff45933548f18b303f4bfe1190054f9926bd6f76f35e862541d93b5a2b`.
Transcribed under [`transcription-protocol.md`](./transcription-protocol.md), fixed before any item was written.

| | |
|---|---|
| Evidence items | **63**: 15 `suspect_record`, 15 `witness_statement`, 11 `bank_account_record`, 6 `phone_record`, 6 `cdr_event`, 5 `crime_event`, 2 `location_record`, 1 each `fir`, `imei_record`, `financial_transaction_record` |
| Structured rows | 6 communication events, 1 financial transaction, 2 locations |
| Source documents cited | 10 transcripts + indictment docket entry (11 evidence sources) |
| Anchors | 30 regex candidate, 5 quoted handle, 28 reader-selected (flagged for audit) |
| Manual interventions | **29** (schema mapping §4) |
| Testimony coverage | 2,162 of 41,213 in-scope testimony lines (**5.2%**) lie inside cited passages; 77 of 729 identifier candidates (**10.6%**) are inside cited passages; **10 of 17 witnesses produced no item** |

Pack v1.1.0 (diagnostic), sha256 `5c3339b4f5776b5a8462cc609221d2babd2af0091f37d5221c6e30a6b7c447de`:
v1.0 plus 10 bare identifier records (one per identifier token that had no record of its
own kind), each citing the same passage as the item that first named the identifier. It was
built after reading v1.0's blind output and **before** ground truth was opened. It adds no fact.

## 7. Ground-truth composition

22 assertions authored after both blind runs were frozen, from the verdict form, the judgment
and the appellate opinion only; sha256 `66bb76e8…f238` (local). Each assertion records its
**standard**: 2 jury_verdict, 12 appellate_recital, 2 judgment, 1 party_concession,
1 rejected_by_verdict, 3 abandoned_by_government, 1 unproven (with its sentencing-preponderance
finding noted), plus the pardon recorded separately as an executive act. 17 positive, 5 negative. Full matrix:
[`us-v-ulbricht-sdny-14cr68-evidence-ground-truth-matrix.md`](./us-v-ulbricht-sdny-14cr68-evidence-ground-truth-matrix.md).
Final outcome recorded exactly: guilty on all 7 counts; counts 1 and 3 vacated at sentencing
as lesser-included offences; sentenced on 2, 4, 5, 6, 7 to life; affirmed in all respects;
presidential pardon 21 January 2025 (executive act, not a finding).

## 8. Data / schema mapping

[`us-v-ulbricht-sdny-14cr68-schema-mapping.md`](./us-v-ulbricht-sdny-14cr68-schema-mapping.md).
No schema change was made. Nine gaps were documented (G1–G9). The two with the largest
measured effect: **G1**, no kinds for online identities, servers, keys or wallets, so they
are carried as "phones" and "bank accounts"; and **G2**, a communication edge needs a
`phone_record` for both endpoints.

## 9. Ingestion results

All 6 stages succeeded on both packs (v1.0: ingestion 110 ms … corroboration 9 ms).
The leak guard ran before ingestion: path check, answer-key field scan, and a check that
every item cites an evidence-pack document per the acquisition manifest.
v1.0: 63 items → **164** extracted records (66 entity, 56 attribute, 30 relationship,
12 event mentions). No stage reported an error. Stage warnings are not persisted by the
harness, so none are claimed either way. Graph synthesis's code warns when a communication
endpoint was never canonicalised, which is the G2 mechanism in §11.

## 10. Entity-resolution results

[`reports/benchmark/us-v-ulbricht-sdny-14cr68/entity-resolution-report.md`](../../reports/benchmark/us-v-ulbricht-sdny-14cr68/entity-resolution-report.md).
64 decisions: 18 canonicalised identifiers, 9 shared-identifier merges, 10 exact-name
matches, 5 new entities, **14 ambiguous name conflicts**, 8 unlinked mentions.
29 person entities; the defendant's name is carried by **15**, of which **3** are
identifier-anchored fragments. **0 false merges.** Two aliases (`altoid`, `frosty`)
attached to a defendant fragment have no ground-truth counterpart, confirming or refuting.

## 11. Graph reconstruction

| | v1.0 (official) | v1.1 (diagnostic) |
|---|---|---|
| Entities | 47 (29 person, 11 account-kind, 6 phone-kind, 1 device) | 57 |
| Relationships | **12** (11 ownership, 1 financial) | **27** (+5 communication, +2 derived person↔person communication) |
| Person↔person paths | 1: DPR → site account → laptop → OS login → defendant (4 hops) | 4 |
| Communities (>1 member) | 6 | 7 |

In v1.0 every chat event was dropped at graph synthesis ("caller or callee phone never
canonicalized") because of G2.

## 12. Temporal analysis

- **Recovered:** a `temporal_co_occurrence` between the DPR entity and the laptop's Pidgin
  endpoint, window 22:09:11–22:15:56Z on 1 October 2013. The staff-chat log and the photo of
  the seized laptop are two evidence items from two witnesses. v1.1 adds co-occurrences
  involving the undercover agent, and a 2010–2013 friend↔defendant communication span.
- **Sequence:** the transcribed events order correctly: DPR offline 21:47Z → defendant enters
  library (22:05Z, an **estimate**, flagged) → DPR online 22:08:41Z → chat 22:09:11Z →
  arrest ~22:15Z → laptop photo 22:15:56Z ([`arrest-timeline.svg`](../progress/benchmark/arrest-timeline.svg)).
- **Not possible:** events carry no participants (G6), so "the defendant entered, then DPR came
  online" is visible to a reader but never joined by the pipeline.
- **Gaps and overlaps:** the pipeline computes no event-gap analysis. None is reported.

## 13. Spatial analysis

One `spatial_proximity` finding: the library and the adjacent cafe, 21 m apart. **It is an
artifact.** Both coordinates were added by hand during normalisation (2 geocoding
interventions), and the "proximity" restates that adjacency. It corroborates nothing and is
counted as an unsupported signal (§20). No other spatial evidence was transcribed; the
residence address was deliberately withheld.

## 14. Financial analysis

One dated financial transaction exists (the undercover agent's $7,000 wire to an exchange
profile, 5 April 2013). It became the only financial edge. The central flow, ~700,254 BTC from
Silk Road server addresses to the laptop wallet, **could not be represented** (G3: no
per-transaction dates), so no financial path from the marketplace to the defendant exists.
The laptop wallet's holder mention was ambiguous (§10), so the wallet is not attached to any
person.

## 15. Blind model output

"Model" here means the deterministic pipeline; no language model and no ML scoring ran.
Frozen outputs (git-ignored): `benchmark/results/us-v-ulbricht-sdny-14cr68/blind-run/{run-1,run-2,v1.1-run-1,v1.1-run-2}/`
with `FROZEN.sha256`; summaries written before ground truth was opened.
The harness refuses to overwrite a frozen run (verified).

Top structural ranking, v1.0: 1 laptop device, 2 DPR site account, 3 OS login, … 8 a
defendant fragment. v1.1: 1 a defendant fragment, 2 laptop, 3 undercover agent. These are
network-position signals, **not** claims of involvement.

## 16. Ground-truth comparison

Scorer v2 (see §24). v1.0 is the official result.

| ID | Assertion (short) | Standard | v1.0 | v1.1 |
|---|---|---|---|---|
| GT-ID-1 | Defendant = DPR | jury_verdict | **partial**: 3 fragments, 1 merged, 1 linked ≤4 hops, 1 unconnected | partial (same) |
| GT-ID-2 | DPR's private key on defendant's laptop | appellate_recital | recovered | recovered |
| GT-FOR-1 | Laptop on DPR-only Mastermind page | appellate_recital | recovered (4-hop path) | recovered |
| GT-TL-1 | Enter → DPR online → chat → same chat on laptop | appellate_recital | recovered (co-occurrence) | recovered |
| GT-REL-1 | Cirrus operated by undercover | appellate_recital | missed (G2) | recovered |
| GT-REL-2 | Friend ↔ defendant | appellate_recital | missed (G2) | recovered |
| GT-ID-3 | Defendant's Gmail | appellate_recital | missed (G2) | recovered |
| GT-TX-1 | Laptop wallet funded from Silk Road servers | appellate_recital | missed | missed |
| GT-CON-1 | Claimed sale vs continued operation | rejected_by_verdict | missed | missed |
| GT-NEG-1 | ALT-1 ≠ DPR | abandoned | correctly absent | correctly absent |
| GT-NEG-2 | ALT-2 ≠ DPR | abandoned | correctly absent | correctly absent |
| GT-NEG-3 | ALT-1's hosting ≠ defendant | abandoned | correctly absent | correctly absent |
| GT-ROLE-1, GT-ALIAS-1, GT-EV-1, GT-FOR-2, GT-FOR-3, GT-NEG-4, GT-NEG-5, GT-OUT-1..3 | — | — | not scorable (reasons in §17) | not scorable |

## 17. Metrics

No single accuracy figure is meaningful here; these are reported separately.

| Metric | v1.0 | v1.1 |
|---|---|---|
| **Fact recovery** (positive assertions, recovered = 1, partial = 0.5), scorable n = 9 | **0.39** (3 + 0.5) | 0.72 (6 + 0.5) |
| **Relationship recovery** (GT-REL-1, GT-REL-2, GT-ID-3, GT-ID-2, GT-TX-1) | 1 / 5 | 4 / 5 |
| **Identity (inference) recovery** (GT-ID-1, GT-FOR-1) | 1.5 / 2 | 1.5 / 2 |
| **Timeline recovery** (GT-TL-1) | 1 / 1 | 1 / 1 |
| **Contradiction recovery** (GT-CON-1) | 0 / 1 | 0 / 1 |
| **Negative specificity** (no false link to rejected hypotheses), n = 3 | **1.00** | 1.00 |
| False merges | 0 | 0 |
| Defendant fragmentation (identifier-anchored fragments / name-bearing entities) | 3 / 15 | 3 / 15 |
| **Ground-truth agreement on final outcome** | not measured, by design | not measured |
| Assertions not scorable | 10 / 22 | 10 / 22 |
| Unsupported signals | 1 (spatial artifact, §13) | 1 |

Failure classification (B17), v1.0:

| Class | Assertions | Cause |
|---|---|---|
| ENTITY-RESOLUTION FAILURE | GT-ID-1 (partial), GT-TX-1 | Tier-A rule needs one item to state two identifiers for the same name; name-only mentions matched several fragments and stayed ambiguous |
| GRAPH CONSTRUCTION FAILURE | GT-REL-1, GT-REL-2, GT-ID-3 | G2: identifiers named only in `suspect_record` lists never become entities |
| ANALYTICS FAILURE | GT-CON-1 | No contradiction finding type over statements (G7) |
| MISSING SOURCE (transcription) | GT-ALIAS-1; contributes to GT-ID-1 | The username-change chat and laptop↔Gmail linking testimony were not transcribed (5.2% coverage) |
| INSUFFICIENT PUBLIC EVIDENCE | GT-NEG-5 | Corrupt-agent evidence excluded at trial |
| SCHEMA LIMIT (not scorable) | GT-ROLE-1, GT-EV-1, GT-FOR-2, GT-FOR-3 | G5, G6; no "operates a service" or "document copy on device" relation |
| BY DESIGN | GT-OUT-1, GT-OUT-2, GT-OUT-3 | The system never draws culpability conclusions |
| No failure | GT-NEG-4 | Murders not in the pack, and none invented |
| OCR/EXTRACTION, PROVENANCE, TEMPORAL REASONING, GROUND-TRUTH AMBIGUITY | — | none observed. Every persisted row carried full provenance to a cited item. |

## 18. False positives

- **No false merges; no false links** to the abandoned suspects.
- **Unsupported signal:** the library–cafe `spatial_proximity` finding restates hand-added
  coordinates (§13).
- **Unverifiable merges (not counted either way):** `altoid` and `frosty` joined to the Gmail
  fragment through a shared email token. Supported by the transcribed evidence, absent from
  ground-truth documents.

## 19. False negatives

The defendant not unified into one identity; undercover ↔ Cirrus, friend ↔ defendant and
defendant ↔ Gmail edges (v1.0 only); laptop wallet ↔ defendant and the marketplace-to-wallet
flow; the claimed-sale contradiction.

## 20. Unsupported conclusions

None was produced as a conclusion: the pipeline emits no guilt or role judgement, and every
relationship traces to cited items. Two classes of output need care. **Ranking**: a device
ranks first in v1.0; the report does not read that as a finding about anyone. **The spatial
artifact** (§13). Two items rely on witness characterisation ("the defendant's laptop") for
person attribution; their `holder_attribution` intervention is logged.

## 21. Missing evidence

Model-visible but not transcribed: the vj chats, including the January 2012 username
change; travel-matching evidence; handwritten notes; the staff-chat instructions file; most
of the undercover agent's chat history; seven witnesses in full. Not public: exhibits,
missing trial days, sealed complaint, excluded corrupt-agent evidence, the PSR.

## 22. Pipeline failures

G2 (communication edges need `phone_record` endpoints) is the only failure that is a
**contract surprise**. It was found by the blind run, not by reading code. The rest are known
design limits: no online-identity kinds (G1), no undated aggregate flows (G3), no
alleged-alias marker (G4), no neutral event type or event participants (G5/G6), no
contradiction detection (G7), no timestamp precision (G8). One reproducibility defect:
analytics signal IDs embed the graph-synthesis wall-clock instant (R1, §23).

## 23. Model failures

No language model or ML model ran. The frozen resolver behaved exactly to contract: no fuzzy
merges, ambiguity kept unmerged. Its failures on this case are those of the contract
(§10, §17), not of implementation.

## 24. Reproducibility

| Item | Value |
|---|---|
| Case version | pack 1.0.0 (official), 1.1.0 (diagnostic) |
| Evidence hashes | v1.0 `38ee79ff…5a2b`; v1.1 `5c3339b4…47de`; 25 source PDFs in the acquisition manifest |
| Pipeline version | commit `4fb0f60` + benchmark harness (this commit); resolver byte-identical to `af22018` |
| Schema version | `CorpusManifestSchema` at the same commit; `RealCaseGroundTruthSchema` (new) |
| Model version | none (deterministic stages; Copilot and ML not run) |
| Runtime | Node v24.19.0, Windows 11 |
| Runs | v1.0: run-1, run-2 → stable output `dfec418bd3de…`, **identical**. v1.1: `a0606588ced9…`, **identical** |
| Tolerance | zero, after normalising wall-clock instants and time-derived IDs |
| Finding R1 | Raw snapshots differ run to run: analytics and corroboration IDs are derived from the graph-synthesis timestamp. The `stableOutputSha256` inside the v1.0 runs' own metadata was computed before the normalisation fix and differs between them; the authoritative figures are the `scripts/benchmark/compare-runs.ts` results above, recomputed from each frozen `snapshot.json`. The v1.1 runs were made after the fix, and their metadata already agrees |
| Scorer revisions | v1 (first pass) scored GT-ID-1 as recovered and used a duplicate matcher for GT-FOR-1 and an identity matcher for GT-REL-2. v2 made identity fragment-aware and fixed both matchers. v1 results are kept locally (`comparison.*.scorer-v1.json`): v1.0 fact recovery 0.44 → v2 0.39. The revision made the result **stricter** |

**Who can reproduce what.** Acquisition is reproducible by anyone (`npm run benchmark:acquire`).
Under decision B the transcribed pack, ground truth and results are local. A third party can
re-run acquisition, the harness and the scorer, but must re-transcribe under the protocol;
item-level agreement between transcribers has not been measured.

## 25. Limitations

1. **Not blind reading.** Testimony was normalised by hand, and the transcriber (an AI)
   knew the outcome of a famous case. Scope rules and citations limit this; they do not remove it.
2. **Coverage is thin:** 5.2% of in-scope testimony lines, 10.6% of identifier candidates, 7 of
   17 witnesses. The protocol's 100% candidate-disposition target was **not met**;
   undispositioned candidates are `not_reviewed`.
3. **Publicly reconstructable record, not the investigative record.** Exhibits, sealed and
   excluded material, and missing trial days are absent.
4. **Lossy type mapping** (G1) distorts analytics semantics even where identity resolves.
5. **Small n.** 12 scorable assertions; the rates are descriptive, not statistically meaningful.
6. **Ground truth from an appellate summary** of evidence viewed favourably to the verdict.
   It is not an independent finding of each fact.
7. **One case, one jurisdiction, one defendant.**
8. Validation status for the commits of this increment is recorded in the ledger row BM1.2.

## 26. Recommended next experiment

1. **Same case, pack v2 under a completed protocol.** Disposition 100% of candidates across all
   17 witnesses, with a second, outcome-naive transcriber on a sample for inter-transcriber
   agreement. This separates coverage effects from pipeline effects, which this run cannot do.
2. **Owner decisions this benchmark surfaces:** whether graph synthesis should canonicalise
   identifiers named only in relationship mentions (G2), and whether to add online-identity
   entity kinds (G1, touches frozen resolver lists).
3. **Second case only after (1):** *United States v. Holmes* (C3) for mixed-verdict scoring,
   documentary/financial evidence and no identity dispute. That tests the opposite end of the
   pipeline from this case.
