# Entity-resolution report — `us-v-ulbricht-sdny-14cr68` (B11)

**Run:** blind run v1.0 (`run-1`), evidence pack sha256 `38ee79ff…b5a2b`, resolver
byte-identical to `af22018` (frozen). v1.1 changes graph edges, not resolution:
its person clusters are identical, and it adds 10 more `canonicalized_identifier`
decisions, one per new bare identifier record.
**Ground truth consulted for the verdicts in §4 only.** §1–§3 were read from the
frozen blind summary before ground truth was opened.

## 1. What the resolver did

| Resolution type | Decisions |
|---|---|
| canonicalized_identifier | 18 |
| ambiguous_name_conflict | 14 |
| exact_name_match | 10 |
| shared_identifier_merge | 9 |
| unlinked_mention | 8 |
| new_entity | 5 |
| **Total** | **64** |

Person entities: **29**. Of these, **15** carry the defendant's name as label or alias.
Only **3** of them are identifier-anchored (built from identifier evidence). The other
12 are single name mentions the resolver deliberately left alone, either as
ambiguous or as unlinked.

## 2. Merges (every merge, with the evidence behind it)

| Entity | Aliases | Formed from | Evidence for the merge |
|---|---|---|---|
| "Ross Ulbricht" (fragment A, 7 mentions) | `altoid`, `frosty` | SR-DEF-GMAIL-IRS, SR-DEF-GMAIL-FRIEND, SR-ALTOID-SHROOMERY, SR-ALTOID-BITCOINTALK, SR-SO-ACCOUNT, SR-SO-FROSTY, SR-FACEBOOK | Every item states the same email-account token. The forum-persona items state it as the account email; the records-witness items state it as the registered email of an account whose email later changed to another address. |
| "Dread Pirate Roberts" (fragment C, 2 mentions) | `Ross Ulbricht` | SR-DPR-KEY, SR-DEF-KEY | Both items state the same PGP-key token: one as DPR's site key, one as a key found on the defendant's laptop. |
| "HSI undercover agent" (5 mentions) | — | SR-UC-CIRRUS + 4 exact-name mentions | Tier A on the Cirrus account; Tier B exact names. |
| "Investigated person ALT-1" (4 mentions) | — | SR-ALT1 + 3 exact-name mentions | Tier A on the hosting-domain token; Tier B exact names. |
| "Defendant's friend" (4 mentions) | — | SR-FRIEND + 3 exact-name mentions | Tier A on the friend's email token; Tier B exact names. |

No merge was made on name similarity. Every merge traces to a shared identifier token
or an exact-name match against exactly one anchored entity.

## 3. Fragmentation and ambiguity

| Fragment | Formed from | Linked to other fragments? |
|---|---|---|
| A — Gmail cluster | 7 identifier items (above) | v1.0: **no edges at all**, because the email token never became a canonical phone entity (schema gap G2). v1.1: ownership edges to 5 endpoint tokens; derived communication edge to the friend. |
| B — laptop cluster | SR-DEF-LAPTOP (OS account `frosty` on the seized laptop) | Linked to the DPR persona by a 4-hop path: DPR → site account → laptop → OS account → B |
| C — merged into DPR | SR-DEF-KEY | Merged (§2) |

The three fragments hold different identifiers stated by different witnesses. No single
item states two of them for the same named person, so under the frozen Tier-A rule
they stay apart. That is the rule working as designed. It is also the measured cost
of that design on a real record.

**Why 14 name mentions were left ambiguous:** a name-only mention (witness-statement
`aboutNames`, account `holderName`, phone `subscriberName`) merges only when its exact
name matches **one** anchored entity. "Ross Ulbricht" matched three (A, B, C) and
"Dread Pirate Roberts" matched two, so every such mention stayed unmerged, as the
resolver's contract requires. This includes the laptop wallet's holder, which is why
the wallet never attaches to the defendant (GT-TX-1 missed).

**Spelling variation:** the indictment names "Ross William Ulbricht"; testimony uses
"Ross Ulbricht". The resolver does not normalise away a middle name, so the charging
document's accused mention stays unlinked. Conservative, and correct under the
no-fuzzy-merge rule.

**Same string, different identifiers:** the OS login `frosty` on the laptop and the
`frosty` account email in the records witness's testimony are different tokens. They
were not merged, because nothing in the evidence says they are the same account. The
ground truth does not address either.

## 4. Against ground truth

| Check | Result |
|---|---|
| DPR ↔ defendant identity (GT-ID-1) | **Partially recovered**: 1 of 3 anchored fragments merged with DPR, 1 linked within 4 hops, 1 unconnected |
| ALT-1 ↔ DPR (GT-NEG-1) | Correctly absent: no merge, no path |
| ALT-2 ↔ DPR (GT-NEG-2) | Correctly absent |
| ALT-1 ↔ defendant (GT-NEG-3) | Correctly absent |
| Undercover ↔ Cirrus (GT-REL-1) | Missed in v1.0 (no phone entity for the account, G2); recovered in v1.1 |
| Defendant ↔ Gmail account (GT-ID-3) | Missed in v1.0 (G2); recovered in v1.1 |
| False merges | **0** found. No merge contradicts any ground-truth assertion. |
| Merges with no ground-truth counterpart | `altoid` and `frosty` as aliases of fragment A. The appellate opinion does not mention them, so they are **neither confirmed nor refuted**, and they are not counted as correct. |

## 5. Failure classification

| Mismatch | Class |
|---|---|
| Defendant split into 3 anchored fragments + 12 name-only entities | ENTITY-RESOLUTION FAILURE (Tier-A rule needs a shared identifier on one item); aggravated by MISSING SOURCE (transcription did not include testimony that ties the laptop to the Gmail account) |
| Wallet not attached to the defendant | ENTITY-RESOLUTION FAILURE (ambiguous holder name) |
| Fragment A isolated in v1.0 | GRAPH CONSTRUCTION FAILURE caused by schema contract gap G2 |
