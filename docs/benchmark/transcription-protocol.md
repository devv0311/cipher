# Transcription protocol — evidence pack (B6)

**Status:** Fixed 2026-09-16, **before** any evidence item was authored and before
any ground-truth document was read for content.

The pipeline cannot read documents (B0 finding 1), so court testimony has to be
turned into typed evidence items by hand. This protocol limits what that hand can
choose. It applies to the benchmark case `us-v-ulbricht-sdny-14cr68` and is the
template for later cases.

## 1. Source scope

**In scope:** every witness examination — direct, cross, redirect, recross, for
prosecution and defence witnesses alike — in the evidence-pack transcripts listed
in `benchmark/acquisition/<case>.json` with `pack: "evidence"`.

**Out of scope, always:** opening statements, summations and rebuttal (advocacy);
bench conferences, colloquy and jury-management passages; the jury charge and
everything after the close of evidence; every ground-truth or excluded document.
Charging documents are in the evidence pack but enter only as labelled
allegations, never as observed facts.

Sections are identified mechanically from the transcript running header
(`<Witness> - <examination>`), not by judgement.

## 2. Candidate generation (neutral)

A deterministic pass lists every occurrence, inside scope, of:
email addresses, IPv4 addresses, `.onion` and web domains, and handles introduced
in quotation marks. Each occurrence is a **candidate**. Every candidate receives
exactly one disposition:

| Disposition | Meaning |
|---|---|
| `transcribed` | at least one evidence item cites this line |
| `no_association` | the passage mentions the string but states no link to a person, account, event, place or time |
| `duplicate` | the same statement by the same witness is already transcribed |
| `unreadable` | text-layer damage prevents a faithful reading |

Coverage = candidates dispositioned ÷ candidates. Target 100%.

Candidates are the minimum. Passages that state a relationship, event, location or
transaction without any regex-visible identifier (e.g. "the laptop was open and
logged in") are also transcribed when they fall inside a section that already
produced a candidate; this is the one place judgement enters, and every such item
is flagged `anchor: "reader"` so it can be audited separately.

## 3. What an item may say

- Only what the witness or an exhibit read into the record **states**. No
  inference, no merging, no "therefore".
- A witness's belief or opinion is recorded as that witness's statement, not as a
  fact about the world (`witness_statement`).
- Cross-examination concessions and defence theories are transcribed with the
  same completeness as direct examination.
- Charging-document content is marked `allegation: true` in `content`.
- Every item carries `citation: { doc, page, line, lineEnd, section }`.

## 4. Type mapping (summary — full mapping in the schema-mapping doc)

The frozen resolver canonicalises only phone, IMEI, vehicle and bank-account
identifiers. So that online identities can be resolved at all without touching
frozen code:

| Real-world identifier | Evidence item / field | Recorded as |
|---|---|---|
| Email address, forum or site account, chat handle, server login | `phone_record.number`, `suspect_record.phones[]`, `cdr_event` endpoints | a **communication endpoint** token `BMK-EP-…` |
| Bitcoin wallet / address | `bank_account_record.account`, `financial_transaction_record` | `BMK-BTC-…` |
| Server / IP address | `bank_account_record.account` with `accountKind: "server"` or `"ip_address"` | `BMK-SRV-…` / `BMK-IP-…` |
| Named natural person or persona | `suspect_record.name` / `alias_record` | caption name for the defendant; role pseudonym otherwise |

`suspect_record` is used only because it is the one type whose extractor links a
person to identifiers. Its `role` field records the role **as stated in the
testimony** ("defendant", "online persona", "witness", "investigated person"),
never an outcome.

## 5. Privacy

Raw identifiers become `BMK-<KIND>-<12 hex>` tokens computed from
`sha256(kind:normalised value:case_id)`; normalisation lowercases and trims.
Private natural persons become role pseudonyms. The token and pseudonym keys stay
in the git-ignored case directory.

## 6. Order of work

1. Build and hash the evidence pack.
2. Freeze it (`manifests/evidence-pack.sha256`).
3. Only then author the ground-truth pack from ground-truth documents.
4. The blind run reads the frozen evidence pack only.

## 7. Deviation recorded for pack v1.0.0 (2026-09-16)

The coverage target in §2 was **not met**. 729 candidates were generated. 77 (10.6%) lie
inside passages cited by an evidence item. The remaining 652 carry the disposition
**`not_reviewed`**, a disposition this protocol did not define, added here rather than
hidden. By witness, 7 of 17 produced at least one item. Measured coverage is in
`benchmark/cases/<case>/normalized/coverage.json` and the final report §6. A pack that meets §2
is the first recommended next experiment.
