# Source register — `us-v-ulbricht-sdny-14cr68` (B5)

**Status:** Retrieved and hashed 2026-09-16. Documents are **not** committed to the
repository (§3; owner decision B). This register plus `benchmark/acquisition/us-v-ulbricht-sdny-14cr68.json`
is the reproducible acquisition reference.

- **case_id:** `us-v-ulbricht-sdny-14cr68`
- **courts:** U.S. District Court, S.D.N.Y. (1:14-cr-00068); U.S. Court of Appeals,
  Second Circuit (15-1815).
- **retrieval method:** HTTPS GET of the public RECAP copy of each PACER document
  (Free Law Project, `storage.courtlistener.com`), located from the public docket
  page `https://www.courtlistener.com/docket/4353251/united-states-v-ulbricht/`. No
  login, paywall, CAPTCHA or access control was involved. Requests were spaced
  ≥1.5 s apart and identified as a research client.
- **provenance:** each RECAP file is the PACER filing; its header stamp
  (`Case 1:14-cr-00068 … Document N Filed …`) ties it to the docket entry. Text
  layers were extracted with `pdftotext -layout`.
- **integrity:** SHA-256 over the exact bytes retrieved.

## 1. Retrieved documents

| document_id | title | document_type | docket entry | retrieval URL | retrieved_at | bytes | sha256 | benchmark role | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| SR-001 | Indictment (14 Cr. 68), 2014-02-04 | charging_document | Doc. 12 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.12.0.pdf` | 2026-09-16T16:31:00Z | 385,931 | `9ec596aa72d2f3a1deed872808e48e0395b96d89d3b3d57988815eb3ab7e3f93` | evidence pack (allegation) | APPROVED | Scanned image; OCR required. Allegations only. |
| SR-002 | S1 Superseding Indictment, 2014-08-21 | charging_document | Doc. 52 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.52.0.pdf` | 2026-09-16T16:31:03Z | 541,155 | `2ca2ea1eb8bcb929104a32a46e379a97061f04f014eed48feb1e86694ec55bc8` | evidence pack (allegation) | APPROVED | Scanned image; OCR required. Defines the seven counts; allegations only. |
| SR-003 | Opinion & Order on motions in limine, 2015-01-07 | pretrial_order | Doc. 142 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.142.0.pdf` | 2026-09-16T16:31:06Z | 159,616 | `52d4156f617916f8473d3facbae47466544e1058a95231e0a758ee843b155014` | excluded (legal ruling) | APPROVED | Admissibility reasoning; neither evidence nor fact-finding. |
| SR-004 | Opinion & Order (defence tactical decisions), 2015-02-01 | trial_order | Doc. 173 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.173.0.pdf` | 2026-09-16T16:31:09Z | 109,364 | `7edb8f5a9659bab208894ed16690a4795ea20823b5531893346235e307ed658d` | excluded (legal ruling) | APPROVED |  |
| SR-005 | Opinion & Order on proposed jury charge, 2015-02-02 | trial_order | Doc. 174 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.174.0.pdf` | 2026-09-16T16:31:12Z | 98,263 | `c0991ec88304280fadf92c962a2f024d183c6085fe18641ea0cd923f7f73adaf` | ground-truth pack (legal framing) | APPROVED | Legal framing of the counts; never model-visible. |
| SR-006 | Jury Verdict Form, 2015-02-05 | verdict | Doc. 183 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.183.0.pdf` | 2026-09-16T16:31:15Z | 100,739 | `2ce1b3f2106ff94bee128ee33e61098d4d56f5c369f6e8c8b953955f84ff7bad` | ground-truth pack | APPROVED | Outcome document. Checkbox marks partly garbled in text layer; read visually. |
| SR-007 | Trial transcript, 2015-01-13 | trial_transcript | Doc. 196 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.196.0.pdf` | 2026-09-16T16:31:18Z | 330,441 | `c8643f2d1b8512cdee1c1328204cbcfc722ced0215b460f771e4d47e171e8260` | evidence pack (testimony only) | APPROVED_WITH_RESTRICTIONS | Openings excluded as advocacy. |
| SR-008 | Trial transcript, 2015-01-14 | trial_transcript | Doc. 198 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.198.0.pdf` | 2026-09-16T16:31:21Z | 660,402 | `21bfc99924f1a70dfa5b471547f411ecca4e0b154da1dc992fe62d3dd0ee7f21` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-009 | Trial transcript, 2015-01-15 | trial_transcript | Doc. 200 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.200.0.pdf` | 2026-09-16T16:31:25Z | 622,891 | `27bac1c8bea7bd1caa04d4b9e5749ff3b0fa2ed2ba87ba70c87c6c9a5a2631f5` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-010 | Trial transcript, 2015-01-20 | trial_transcript | Doc. 202 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.202.0.pdf` | 2026-09-16T16:31:28Z | 515,350 | `1d258a60a6c12d281ee6b5090d9ca696247da7bc0cf44a550ff046c066109ce8` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-011 | Trial transcript, 2015-01-21 | trial_transcript | Doc. 204 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.204.0.pdf` | 2026-09-16T16:31:31Z | 701,399 | `7834ff2af942db0a3a3db75b8ce99064a4da91ab8c7e101bd14fffa1d653f30f` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-012 | Trial transcript, 2015-01-22 | trial_transcript | Doc. 206 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.206.0.pdf` | 2026-09-16T16:31:35Z | 601,980 | `403db6fee96abd7298e9e4013b44a7859fda6be3235e6f55a6611685c08babb5` | superseded | APPROVED_WITH_RESTRICTIONS | Superseded by corrected Doc. 208; hashed for completeness only. |
| SR-013 | Trial transcript, 2015-01-22 (corrected) | trial_transcript | Doc. 208 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.208.0.pdf` | 2026-09-16T16:31:38Z | 601,810 | `67e98849a8b50d80b62bc989f592eec9fab74eff642f31487a84d9dbc74a07b5` | evidence pack | APPROVED_WITH_RESTRICTIONS | Use this, not 206. |
| SR-014 | Trial transcript, 2015-01-26 | trial_transcript | Doc. 210 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.210.0.pdf` | 2026-09-16T16:31:41Z | 267,183 | `ebfebf63919b736c13543b24aee0c0d2e4d37c3e7a563582bcd642a585810004` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-015 | Trial transcript, 2015-01-29 | trial_transcript | Doc. 212 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.212.0.pdf` | 2026-09-16T16:31:45Z | 797,900 | `00021249116d9c8e441886a168b8486381fb19f6127fea54d82a99a29506e1ac` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-016 | Trial transcript, 2015-01-28 | trial_transcript | Doc. 214 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.214.0.pdf` | 2026-09-16T16:31:48Z | 691,800 | `701859eea6ed17d2222d186115e46e10a7f8884dca5f410d56de3149d894b0f3` | evidence pack | APPROVED_WITH_RESTRICTIONS |  |
| SR-017 | Trial transcript, 2015-02-02 | trial_transcript | Doc. 216 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.216.0.pdf` | 2026-09-16T16:31:51Z | 613,571 | `03ff181952963d1e95b3314882e12f5ac086367b7b04f6cdf07e913fae026b81` | evidence pack | APPROVED_WITH_RESTRICTIONS | Includes start of defence case. |
| SR-018 | Trial transcript, 2015-02-03 | trial_transcript | Doc. 218 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.218.0.pdf` | 2026-09-16T16:31:55Z | 594,836 | `25e9d749904bc8286635faed347189191f8e788b6b03cba9dd69c2e982fc299a` | evidence pack (testimony only) | APPROVED_WITH_RESTRICTIONS | Summations excluded as advocacy. |
| SR-019 | Trial transcript, 2015-02-04 | trial_transcript | Doc. 220 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823.220.0.pdf` | 2026-09-16T16:31:58Z | 296,081 | `1503176d5f470e711f9720adeba81f01ce1b2f572cde581d91cbfae0796c18a9` | ground-truth pack (charge/deliberation) | APPROVED_WITH_RESTRICTIONS | Post-evidence day; never model-visible. |
| SR-020 | Opinion & Order denying new trial, 2015-04-27 | post_trial_opinion | Doc. 237 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.237.0.pdf` | 2026-09-16T16:32:01Z | 108,325 | `b1e404632c6c58d0be3c00dc7656edb174297ad106029f745d832160496fb71e` | ground-truth pack | APPROVED |  |
| SR-021 | Judgment in a Criminal Case, 2015-06-01 | judgment | Doc. 269 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.269.0.pdf` | 2026-09-16T16:32:04Z | 170,039 | `b91ddba18251b9bd6f4551f46bfa01cb106bc7ab1f6902d8275f4387e7fd7d86` | ground-truth pack | APPROVED | Counts 2, 4, 5, 6, 7 adjudicated; counts 1 and 3 vacated by the court. |
| SR-022 | Sentencing transcript, 2015-05-29 | sentencing_transcript | Doc. 277 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.277.0.pdf` | 2026-09-16T16:32:07Z | 331,024 | `abca00d233ef873a4475559c70a44c5afb2fcc6cb89e6cc9599dc768a40eb2ec` | ground-truth pack | APPROVED_WITH_RESTRICTIONS | Preponderance-standard findings recorded with their standard. Victim-family statements not transcribed. |
| SR-023 | USCA mandate (certified copy), 2017-09-06 | appellate_mandate | Doc. 296 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.296.0.pdf` | 2026-09-16T16:32:10Z | 588,815 | `82215f692debce13de6ff03082df4f680e0c4522df3014bc4cfe49ea06220089` | ground-truth pack | APPROVED |  |
| SR-024 | 2d Cir. opinion No. 15-1815, 858 F.3d 71 (2017-05-31), mandate attachment | appellate_opinion | Doc. 296 att. 1 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.296.1.pdf` | 2026-09-16T16:32:14Z | 484,004 | `8a972cf6b8a9ebfcfd1134637d9ef6dea6c8db793042256e84fe72fe9d39d3f5` | ground-truth pack | APPROVED | Also narrates trial evidence; never model-visible. |
| SR-025 | Order: court does not retain exhibits, 2018-05-07 | order | Doc. 332 | `https://storage.courtlistener.com/recap/gov.uscourts.nysd.422823/gov.uscourts.nysd.422823.332.0.pdf` | 2026-09-16T16:32:16Z | 62,662 | `f291144399aef4bf3e4a7e626ccb6aff8f5e4a2592b1e2732e78060e705da63b` | metadata | APPROVED | Establishes exhibits are not retrievable from the court. |

## 2. Known but not retrieved

| document_id | title | why not | status |
|---|---|---|---|
| SR-X01 | Sealed complaint 13 Mag. 2328 (FBI affidavit), 2013-09-27 | Doc. 1 has no free RECAP copy. A public mirror exists on the Internet Archive, which is not an official source. | MANUAL_REVIEW |
| SR-X02 | Government trial exhibits (GX series) | The court does not retain exhibits (Doc. 332). Their content is available only where read into the transcript. | REJECTED as a separate source |
| SR-X03 | Trial days without a free copy (e.g. 2015-01-27, 2015-01-30) | Would require PACER purchase; not purchased. | MANUAL_REVIEW — coverage gap carried into B18 |
| SR-X04 | Presidential pardon, 2025-01-21 | Executive act, not a court record. | APPROVED_WITH_RESTRICTIONS (metadata only) |

## 3. Licence, copyright and permitted use

| Class | Documents | Position | Use permitted here |
|---|---|---|---|
| Opinions, orders, verdict form, judgment, mandate | Docs. 142, 173, 174, 183, 237, 269, 296, 332 | Not subject to copyright: judicial edicts (*Georgia v. Public.Resource.Org, Inc.*, 590 U.S. 255 (2020)); U.S. Government works (17 U.S.C. §105). | Citations and derived structured facts. Full text not committed (a minimisation choice, not a copyright constraint). |
| Charging documents | Docs. 12, 52 | U.S. Attorney's Office filings; U.S. Government works. | Same; always labelled allegation. |
| Trial and sentencing transcripts | Docs. 196–220, 277 | Official record produced by court reporters under 28 U.S.C. §753; copyright status of transcripts is unsettled. | **APPROVED_WITH_RESTRICTIONS:** cite by document/page/line; store structured facts and short quotations only; never commit full transcript text. |
| RECAP archive | all | Free Law Project public-access archive of PACER records. | Research retrieval with attribution. |

## 4. Privacy handling (applies to every committed artifact)

- The defendant is named as in the case caption. Every other natural person —
  civilian witnesses, agents testifying in an official capacity, and third parties
  mentioned in testimony — is recorded by **role pseudonym**. The pseudonym ↔ name
  key is not committed.
- Raw identifiers (email addresses, usernames tied to private individuals, IP
  addresses, Bitcoin addresses, hostnames, street addresses) are replaced by
  deterministic tokens `BMK-<KIND>-<12 hex of sha256(kind:normalised value:case_id)>`,
  so exact-match resolution still works without publishing the raw value.
- Victim-family statements at sentencing and the names of alleged
  murder-for-hire targets are not transcribed.
