# Candidate solved cases — research and selection matrix (B2–B4)

**Status:** Research complete 2026-09-16. Selection confirmed after the
owner decision (Option B, local-only case data) in [`OWNER-DECISION-real-case-data-class.md`](./OWNER-DECISION-real-case-data-class.md).
Criteria and weights: [`CASE_BENCHMARK_REQUIREMENTS.md`](./CASE_BENCHMARK_REQUIREMENTS.md) §7.

**Verification level.** C1 was verified in this session against primary records
(docket listing, 25 documents retrieved and hashed, text extracted and read — see
[`source-register.md`](./source-register.md)). The other candidates were assessed
at desk level: their public-record characteristics are stated from general legal
knowledge and light searching, marked *(desk)*, and were **not** verified document by
document. A desk assessment was enough to reject or rank them below C1; it would
not be enough to select one of them.

---

## 1. Candidates

### C1 — United States v. Ross William Ulbricht (Silk Road)
S.D.N.Y. 1:14-cr-00068; 2d Cir. 15-1815 (858 F.3d 71, 2017).
- **Outcome (verified):** jury verdict 2015-02-04/05 guilty on all seven counts of
  the S1 superseding indictment (Doc. 183). Judgment 2015-06-01 adjudicates counts
  2, 4, 5, 6, 7; counts 1 and 3 vacated by the court (Doc. 269). Affirmed "in all
  respects" (Doc. 296-1). Full and unconditional **presidential pardon, 2025-01-21**
  — an executive act that does not alter the judicial findings; recorded as such.
- **Public record (verified):** indictment and superseding indictment (scanned
  images, OCR needed); 13 trial-day transcripts (≈590k words) with the index of
  examinations for 17 witnesses across prosecution and defence; evidentiary
  opinions (Docs. 142, 173, 174); verdict form; judgment; sentencing transcript;
  new-trial opinion (Doc. 237); appellate opinion. The criminal complaint (Doc. 1)
  is not on the free archive but its text is publicly mirrored. **Trial exhibits are
  not on the docket** (Doc. 332: the court does not retain exhibits); exhibit
  content survives only where it was read into the transcript.
- **Evidence types:** digital forensics (laptop seized in a public library),
  server imaging, chat logs and journal entries read into the record, Bitcoin
  transaction tracing, online-forum posts, undercover account takeover, ID-document
  seizure, testimony of friends and agents, defence alternative-perpetrator case.
- **Why it tests NetIntel:** the core factual question at trial was identity —
  whether the pseudonymous operator ("Dread Pirate Roberts") was the defendant —
  which is precisely alias/entity resolution across heterogeneous evidence.
  Negative ground truth is rich: two other investigated suspects the government
  abandoned; five alleged murders-for-hire that the appellate court records had no
  evidence of occurring, were not charged in S.D.N.Y., and were found only by a
  preponderance at sentencing; one of the alleged "hits" was faked by a corrupt
  agent.
- **Weaknesses:** one defendant, so role identification is thin; exhibits must be
  reconstructed from transcript readings; several trial days are missing from the
  free archive; online-identity kinds are absent from the schema; private
  witnesses must be pseudonymised.

### C2 — State (NCT of Delhi) v. Navjot Sandhu (2001 Parliament attack) *(desk)*
Supreme Court of India, 2005.
- **Outcome:** mixed — conviction of one accused upheld, one acquitted, one
  conviction altered to a lesser offence. Final.
- **Public record:** essentially the trial, High Court and Supreme Court judgments.
  FIR and chargesheet are not public documents
  (*Saurav Das v. Union of India*, SC, 20 Jan 2023: chargesheets cannot be placed
  in the public domain on par with FIRs).
- **Evidence types:** mobile CDRs, IMEI/SIM linkage, laptop, recoveries, confessions
  (partly held inadmissible) — an excellent fit for the phone/IMEI/CDR schema.
- **Fatal problem:** the only public account of the evidence is the courts' own
  narrative inside the judgments that state the conclusion. Evidence and outcome
  cannot be separated by document, so a "blind" run would be fed conclusion-shaped
  evidence. Also a terrorism case with high sensitivity.

### C3 — United States v. Elizabeth Holmes (Theranos) *(desk)*
N.D. Cal. 5:18-cr-00258; 9th Cir. (affirmed 2024).
- **Outcome:** mixed and final — convicted on four investor-fraud counts, acquitted
  on four patient-related counts, jury hung on three (later dismissed).
- **Public record:** large docket, trial transcripts, many exhibits released to the
  press.
- **Fit:** strong for mixed-outcome scoring and documentary/financial evidence; weak
  for aliases, locations, communications graph and entity resolution — the
  identity of the actors was never in dispute. Exhibits include patient medical
  information → higher privacy burden.

### C4 — United States v. Samuel Bankman-Fried (FTX) *(desk)*
S.D.N.Y. 1:22-cr-00673.
- **Outcome:** convicted on seven counts (2023). Appellate finality **not
  confirmed** in this session → fails the finality requirement until verified.
- **Fit:** financial and communications evidence strong; identity not contested.

### C5 — CBI v. A. Raja and others (2G spectrum) *(desk)*
Special CBI Court, Delhi, 2017.
- **Outcome:** acquittal of all accused; CBI appeal pending before the Delhi High
  Court → **unresolved. Rejected** under the hard-rejection rule.

### C6 — CBI v. B. Ramalinga Raju and others (Satyam) *(desk)*
- **Outcome:** conviction 2015; sentences suspended and appeals pending →
  **finality ambiguous. Rejected.**

### C7 — United States v. Carl Mark Force IV *(desk)*
N.D. Cal. 3:15-cr-00319 (corrupt DEA agent in the Silk Road investigation).
- **Outcome:** guilty plea, sentenced 2015. Final.
- **Fit:** ground truth rests on a plea agreement's admitted facts; little
  independent evidence was ever tested at trial → poor evidence/ground-truth
  separation. Better as a *linked* case to C1 later.

### C8 — United States v. Alexandre Cazes (AlphaBay) *(desk)*
- Defendant died before any adjudication → **no judicial outcome. Rejected.**

## 2. Selection matrix

Scores 0–3 (3 = best). "Separability" = can pre-verdict evidence be split from the
conclusion by document. Weighted totals use the weights in the requirements §7.

| Candidate | Jurisdiction | Outcome | Evidence breadth | Digital evidence | Financial evidence | Timeline | Relationships | Public records | Ground-truth clarity | Separability | Reconstruction difficulty | Privacy/legal risk | Weighted |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **C1 Ulbricht** | US federal (SDNY / 2d Cir.) | Conviction, all counts; 2 vacated at judgment; affirmed; later pardoned | 3 | 3 | 2 (Bitcoin tracing) | 3 | 3 | 3 (transcripts, orders, opinions; exhibits only via transcript) | 3 | 3 | High (manual transcription) | Low–medium (pseudonymise private witnesses) | **70** |
| C2 Navjot Sandhu | India (SC) | Mixed, final | 2 | 3 | 1 | 3 | 3 | 1 (judgments only) | 3 | **0** | Medium | High (terrorism, confessions) | 44 |
| C3 Holmes | US federal (N.D. Cal. / 9th Cir.) | Mixed, final | 2 | 1 | 3 | 2 | 1 | 3 | 3 | 3 | High | Medium (patient data) | 57 |
| C4 Bankman-Fried | US federal (SDNY) | Conviction; appeal status unverified | 2 | 2 | 3 | 2 | 2 | 3 | 1 | 3 | High | Medium | 53 |
| C5 2G spectrum | India (Special Court) | Acquittal; appeal pending | 2 | 1 | 2 | 2 | 2 | 1 | 0 | 0 | — | Medium | Rejected |
| C6 Satyam | India | Conviction; appeals pending | 2 | 1 | 3 | 2 | 2 | 1 | 1 | 0 | — | Medium | Rejected |
| C7 Force | US federal (N.D. Cal.) | Plea, final | 1 | 2 | 2 | 1 | 1 | 2 | 2 | 1 | Low | Low | 43 |
| C8 Cazes | US / Thailand | None (death) | — | — | — | — | — | — | 0 | — | — | — | Rejected |

Weighted totals are computed from per-criterion scores (0–3) against the
requirements §7 weights; maximum 75. Criterion order: primary evidence, outcome,
breadth, cross-document, temporal, entity resolution, provenance, reproducible,
lawful/privacy, pipeline fit, separability.

| Candidate | Scores | Weighted |
|---|---|---|
| C1 | 3 3 3 3 3 3 3 3 2 2 3 | 70 |
| C3 | 3 3 2 1 2 1 3 3 2 1 3 | 57 |
| C4 | 3 1 2 2 2 1 3 3 2 1 3 | 53 |
| C2 | 1 3 2 3 3 2 2 2 1 2 0 | 44 |
| C7 | 1 3 1 1 1 1 2 3 3 1 1 | 43 |

C1's scores are grounded in retrieved documents; the others are desk scores.

## 3. Selection (B4)

**Selected: C1, United States v. Ulbricht.**
Case id: `us-v-ulbricht-sdny-14cr68`.

Why, in order of the criteria:
1. **Separability.** Pre-verdict evidence (testimony and exhibits read into the
   trial record, defence case, charging documents as allegations) lives in
   different documents from the outcome (verdict, judgment, sentencing, appellate
   opinion). This is the property C2 lacks and the one a blind benchmark cannot do
   without.
2. **Clear, final judicial outcome** with an exact, citable scope, including a
   non-trivial wrinkle (counts vacated at judgment) and a post-judgment executive
   act that must be recorded without being mistaken for a finding.
3. **Identity was the contested question,** which makes entity and alias
   resolution the thing being measured rather than a side metric.
4. **Negative ground truth** — abandoned alternative suspects, uncharged and
   unproven murder-for-hire allegations, a staged "killing" — tests whether the
   pipeline invents relationships the court did not find.
5. **Provenance** is page-and-line citable from official transcripts.
6. **Lawful, reproducible acquisition** from the court's public docket via the free
   RECAP archive, with hashes.

What this case **cannot** test, stated now so it is not discovered later:
- CCTV evidence (none material), vehicle evidence (none material), phone/IMEI/CDR
  evidence in the synthetic corpus's sense (communication evidence here is chat
  and forum records, not call records).
- Multi-defendant role separation.
- Mixed-verdict scoring across defendants (C3 is the recommended second case for
  that).

**No single candidate meets every requirement.** C1 is the best available fit, not
a complete one; the gaps above are carried into the completeness score (B18).
