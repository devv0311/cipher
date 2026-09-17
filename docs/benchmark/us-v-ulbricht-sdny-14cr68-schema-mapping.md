# Schema mapping — `us-v-ulbricht-sdny-14cr68` (B9)

**Status:** Complete for evidence pack v1.0.0 (sha256 `38ee79ff…b5a2b`) and the
diagnostic v1.1.0 (`5c3339b4…c447de`). No schema was changed: every gap below is
documented, not patched. Frozen areas (`src/lib/resolution/`, P6 ML) are untouched.

## 1. The chain, as it was actually run

```text
COURT RECORD (public PACER filing via RECAP, hashed)          benchmark/acquisition/<case>.json
  ↓ pdftotext -layout; transcript line index (doc, page, line, witness – examination)
TESTIMONY PASSAGE (evidence-pack document, in-scope section)
  ↓ manual transcription under docs/benchmark/transcription-protocol.md
EVIDENCE ITEM  (CorpusManifest.evidenceItems[], typed content + citation)      local only
  ↓ runIngestion({ kind: "uploaded" })        src/lib/ingestion
DOCUMENT / SOURCE (evidence_sources = one per transcript day; evidence_items)
  ↓ runExtraction()                           field reads per itemType
EXTRACTED RECORD (entity / attribute / relationship / event mentions)
  ↓ runResolution()                           frozen resolver
ENTITY (+ aliases, resolution decisions)
  ↓ runGraphSynthesis()
RELATIONSHIP (ownership, communication, financial …)
  ↓ runAnalyticsSynthesis()                   centrality, bridges, Louvain, ranking
ANALYTICAL SIGNAL
  ↓ runCorroborationSynthesis()               temporal windows, haversine proximity
CORROBORATION FINDING  →  TIMELINE (event and communication timestamps)
```

## 2. Type mapping used

| Real-world thing in the record | Evidence item type | Field(s) | Resulting entity kind | Fidelity |
|---|---|---|---|---|
| Defendant, witness, investigated person, online persona | `suspect_record` | `name`, `role`, `phones[]`, `accounts[]`, `note` | `person` | Lossy: type name says "suspect" for everyone; `role` carries the stated role |
| Person named in passing | `witness_statement.aboutNames[]` | — | `person` (Tier B, name only) | Exact |
| Email address, forum account, site account, chat handle, OS login | `phone_record.number`, `suspect_record.phones[]`, `cdr_event` endpoints | token `BMK-EP-…` | `phone` | **Lossy (G1)** |
| Laptop | `imei_record.imei` + `boundNumber` | token `BMK-DEV-…` | `imei` | **Lossy (G1)** |
| Server, IP address, domain, PGP key, Bitcoin wallet, bank/exchange account | `bank_account_record.account` (+ `accountKind` text, `holderName`) | tokens `BMK-SRV/KEY/BTC/ACC-…` | `bank_account` | **Lossy (G1)** |
| Chat session, forum post, email chat | `cdr_event` + `communicationEvents[]` | caller, callee, startedAt, duration, cell ref | communication edge | Lossy: posts are not calls; direction arbitrary |
| Dated bank wire | `financial_transaction_record` + `financialTransactions[]` | ref, from, to, amount, currency, date | financial edge | Exact |
| Aggregate Bitcoin flow without per-transaction dates | `witness_statement` (text + non-extracted fields) | — | none | **Gap (G3)** |
| Arrest, status change, observation, site shutdown | `crime_event` | eventId, occurredAt, sceneLabel | event mention only | **Lossy (G5, G6)** |
| Library, cafe | `location_record` + `locations[]` | label, type, lat/long | location | Coordinates added by hand (geocoding intervention) |
| Charging document | `fir` | `firNumber`, `filedAt`, `accused[]` | person mention | Lossy: aliases in the caption omitted (G4) |

## 3. Gaps (documented, not fixed)

| ID | Gap | Effect measured in the blind run | Fix would require |
|---|---|---|---|
| G1 | No entity kinds for online identities, devices other than phones, servers, keys or crypto wallets | Emails and handles are "phones"; servers, keys and wallets are "bank accounts". Identity still resolves because the resolver matches exact identifier values. Analytics labels and ranking semantics are wrong for these nodes. | New `EntityKind` values and extractor support. The resolver's Phase 1 list is hard-coded, so this needs an owner decision (frozen code). |
| G2 | A communication edge needs both endpoints canonicalised as phone entities, which only a `phone_record` provides; `suspect_record.phones[]` does not create one | v1.0: 6 chat events → **0 communication edges** | Either the transcriber adds a bare `phone_record` per endpoint (done in v1.1 as a diagnostic), or graph synthesis canonicalises identifiers named in relationship mentions |
| G3 | `FinancialTransaction.occurredAt` is required; aggregate, undated flows cannot be represented | The ~700k BTC flow from Silk Road servers to the laptop wallet exists only as text; no financial edge | An aggregate-flow record type, or an optional date with a precision field |
| G4 | No way to mark an alias as **alleged** | Caption a/k/a names in the indictment were left out rather than presented as observed aliases | An `allegation` flag on relationship mentions carried through classification |
| G5 | No neutral event type; arrests, status changes and observations are `crime_event` | Label misrepresents the event; no event is a "crime" | A generic event item type |
| G6 | `crime_event` has no person or entity field the extractor reads | The arrest cannot be attached to the arrested person; the timeline has events with no participants | A subject/participants field on events |
| G7 | No contradiction finding over statements | The claimed sale of the site (Nov 2011, Feb 2013) vs continued operation is not flagged | Contradiction detection that does not parse free text is limited to structured fields; a structured "claims-status" item would be needed |
| G8 | Date-only and approximate times | 8 items stored at 00:00Z or estimated, each logged | A precision field on timestamps |
| G9 | Ground-truth schema pinned to the synthetic case | A separate `RealCaseGroundTruthSchema` was added under `src/lib/benchmark/` | — (done without touching the synthetic contract) |

## 4. Manual interventions (v1.0: 29; v1.1: 39)

| Kind | Count (v1.0) | Examples |
|---|---|---|
| date_precision | 6 | forum post and chat dates stored at day precision |
| type_mapping | 5 | laptop as IMEI; servers and keys as accounts; post as communication |
| event_type_mapping | 4 | arrest and DPR status changes as `crime_event` |
| timezone | 3 | PDT → UTC for the arrest window |
| geocoding | 2 | library and cafe coordinates |
| endpoint_identity | 2 | chat side labelled "me" mapped to the Gmail account by stipulation; "dread" in the staff chat kept distinct from the Pidgin account |
| allegation_aliases_omitted, location_type_mapping, direction, time_estimate, holder_attribution, schema_gap, scope_judgement | 1 each | defendant's library entry placed at 22:05Z, flagged as an estimate |
| structural_completion (v1.1 only) | 10 | bare `phone_record`/account record per identifier that lacked one |

The per-item log lives in the git-ignored `benchmark/cases/<case>/normalized/interventions*.json`.
