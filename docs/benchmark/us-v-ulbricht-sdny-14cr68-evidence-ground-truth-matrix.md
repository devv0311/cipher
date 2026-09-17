# Evidence ↔ ground-truth matrix — `us-v-ulbricht-sdny-14cr68` (B8)

**Status:** Ground truth authored 2026-09-16 **after** blind runs v1.0 and v1.1 were
frozen, from ground-truth documents only (Doc. 183 verdict form, Doc. 269 judgment,
Doc. 296-1 Second Circuit opinion, 858 F.3d 71). Ground-truth file sha256
`66bb76e8…f238` (git-ignored). Evidence references are evidence-pack item refs
(pack v1.0.0) whose content cites a trial-transcript page and line.

People other than the defendant appear by role pseudonym, as in every committed
artifact. The public court record names them; this repository does not need to.

**Standard** records how each assertion was established. It is not a confidence score.

| ID | Ground-truth finding | Standard | Supporting evidence (model-visible items) | Evidence document / location | Model-visible? | Ground-truth only? |
|---|---|---|---|---|---|---|
| GT-ID-1 | The defendant operated Silk Road as Dread Pirate Roberts | jury_verdict | SR-DPR-KEY, SR-DEF-KEY, PH-SR-DPR-LAPTOP, PH-FROSTY, DEV-LAPTOP, CDR-LAPTOP-CIRRUS, CDR-UC-DPR-1001, WS-UC-OBS, WS-FRIEND-CREATED | Tr. 1/21 pp. 846–871, 1013–1015; Tr. 1/14 pp. 321–334; Tr. 1/22 p. 1095 | Yes | Conclusion itself: yes |
| GT-ID-2 | DPR's private PGP key was on the defendant's laptop | appellate_recital | KEY-DPR, SR-DPR-KEY, SR-DEF-KEY | Tr. 1/21 pp. 1013–1015 | Yes | No |
| GT-ROLE-1 | The defendant created Silk Road (defence concession) | party_concession | WS-FRIEND-CREATED | Tr. 1/22 p. 1095 | Partly (friend's account, not the concession) | Concession: yes (opening statement out of scope) |
| GT-ALIAS-1 | Username changed to Dread Pirate Roberts around Jan 2012 on vj's advice | appellate_recital | — | — | No | Yes |
| GT-REL-1 | Cirrus was taken over and operated by the HSI undercover agent | appellate_recital | SR-UC-CIRRUS | Tr. 1/14 p. 265 | Yes | No |
| GT-REL-2 | W-FRIEND was the defendant's friend and helped with programming | appellate_recital | SR-FRIEND, CDR-FRIEND-2010, CDR-FRIEND-2013, WS-FRIEND-CREATED | Tr. 1/22 pp. 1095, 1102, 1140 | Yes | No |
| GT-ID-3 | The defendant's Gmail address incorporates his full name | appellate_recital | SR-DEF-GMAIL-IRS, SR-DEF-GMAIL-FRIEND | Tr. 1/26 p. 1270; Tr. 1/22 p. 1102 | Yes | No |
| GT-EV-1 | Arrested in a San Francisco public library, 1 Oct 2013 | appellate_recital | EV-ARREST, LOC-LIBRARY, WS-ARREST-CS | Tr. 1/21 p. 846 | Yes | No |
| GT-TL-1 | Entered the library → DPR online minutes later → Cirrus chat → same chat open on seized laptop | appellate_recital | EV-DEF-ENTERS-LIBRARY, EV-DPR-ONLINE, CDR-UC-DPR-1001, CDR-LAPTOP-CIRRUS, EV-ARREST | Tr. 1/14 pp. 325–335; Tr. 1/21 pp. 860–865 | Yes | No |
| GT-FOR-1 | The laptop was on the DPR-only "Mastermind" page | appellate_recital | PH-SR-DPR-LAPTOP, PH-FROSTY, DEV-LAPTOP | Tr. 1/21 pp. 869–871 | Yes | No |
| GT-TX-1 | ~$18M BTC seized from laptop wallet; ~89% from Silk Road servers in Iceland | appellate_recital | WS-BTC-FLOW, BA-WALLET-LAPTOP, BA-WALLET-SR, BA-SRV-BTC | Tr. 1/29 pp. 1690–1699; Tr. 1/21 p. 979; Tr. 1/22 p. 1032 | Yes | $18M seizure figure: yes |
| GT-FOR-2 | USB drives at home held versions of laptop documents | appellate_recital | SR-DEF-BACKUP | Tr. 1/22 pp. 1027–1030 | Yes | No |
| GT-FOR-3 | Spreadsheets on the laptop catalogued Silk Road servers | appellate_recital | BA-SRV-BORA, BA-SRV-BTC, BA-SRV-GALA | Tr. 1/21 pp. 975–979 | Yes | No |
| GT-CON-1 | Claimed sale of the site (Nov 2011; "not my problem anymore", Feb 2013) contradicted by continued operation; the court records he lied about the sale | rejected_by_verdict | WS-FRIEND-SOLD, WS-FRIEND-NOTMYPROBLEM, CDR-UC-DPR-1001, PH-SR-DPR-LAPTOP | Tr. 1/22 pp. 1138–1141; Tr. 1/14 pp. 329–334 | Yes (both sides) | vj Dec 2011 chat: yes |
| GT-NEG-1 | ALT-1 investigated as DPR; theory abandoned; alternative-perpetrator defence rejected | abandoned_by_government | WS-ALT1-SUSPICION, SR-ALT1, BA-XTA, BA-SRMARKET-REG, WS-COURT-INSTRUCTION | Tr. 1/15 pp. 490–502; Tr. 1/20 pp. 748–753; Tr. 1/21 p. 974 | Yes | No |
| GT-NEG-2 | ALT-2 investigated as DPR; theory abandoned | abandoned_by_government | WS-ALT2 | Tr. 1/20 pp. 672–682 | Yes | No |
| GT-NEG-3 | No relationship makes ALT-1's hosting company the operator of the Tor site | abandoned_by_government | BA-SRMARKET-REG, BA-XTA | Tr. 1/15 p. 500; Tr. 1/20 p. 749 | Yes | No |
| GT-NEG-4 | Five commissioned murders: no evidence any occurred; not charged here; found at sentencing by a preponderance only | unproven / sentencing_preponderance | — | — | No | Yes |
| GT-NEG-5 | Two investigating agents were corrupt (later pleaded guilty); their evidence was excluded at trial | appellate_recital | — | — | No | Yes |
| GT-OUT-1 | Guilty on all seven counts | jury_verdict | IND-S1 (charges only, as allegation) | Doc. 183 | Charges only | Verdict: yes |
| GT-OUT-2 | Counts 1 and 3 vacated as lesser-included; sentenced on 2, 4, 5, 6, 7; life | judgment | — | Doc. 269 | No | Yes |
| GT-OUT-3 | Affirmed in all respects, 31 May 2017 | judgment | — | Doc. 296 | No | Yes |

**Post-judgment:** a full and unconditional presidential pardon was announced on
21 January 2025. That is an executive act, not a judicial finding. It changes none
of the rows above and is recorded from the public announcement (source register SR-X04).

## Coverage of the matrix

- 22 assertions; 17 have at least one model-visible supporting item (GT-OUT-1's only
  support is the charging document, which carries the charges as an allegation, not
  the verdict); 5 have none.
- 10 assertions cannot be scored against pipeline output. The reasons are in the
  final report §16; they are schema or design limits, not missing evidence.
