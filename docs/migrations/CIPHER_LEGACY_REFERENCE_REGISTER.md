# CIPHER legacy reference register

**Date:** 2026-09-18 · **Companion to:** `docs/migrations/CIPHER_IDENTITY_MIGRATION_AUDIT.md`

Every legacy-name occurrence that **survives** the CIPHER identity migration, with the
reason it survives. Nothing here is an oversight. A legacy string that is not in this
register is a defect — either fix it, or add it here with a justification.

**Classifications**

| Code | Meaning |
|---|---|
| `HISTORICAL_FACT` | Records something that was true on a date. Rewriting it would make the document **false**. |
| `EXTERNAL_SOURCE` | Third-party or upstream material. Not ours to rewrite. |
| `IMMUTABLE_REFERENCE` | A Git object or published identifier that cannot be changed. |
| `REPRODUCIBILITY_CONSTANT` | An input to a hash, seed or sample selection. Changing it silently invalidates a published result. |
| `MIGRATION_DOCUMENTATION` | Names the old identity in order to document the migration itself. |

---

## Register

| # | File | Line | Exact string | Classification | Reason retained |
|---|---|---|---|---|---|
| R1 | `docs/progress/implementation-ledger.md` | 33 | `devv0311/netintel-ai` (row P0.5) | `HISTORICAL_FACT` | The repository **was** created under this name at commit `df66560`. P0.5 records that event. Rewriting it would claim a repository was created under a name that did not exist for another year. |
| R2 | `docs/progress/implementation-ledger.md` | 121 | `devv0311/netintel-ai`, `NetIntel AI`, `netintel-p6.20-control-${i}` (row P6.21.1) | `HISTORICAL_FACT` | This row **is** the record of the P6.21 rename and of the decision this migration supersedes. It is the primary evidence for why the slug was kept. A forward-pointing `[SUPERSEDED 2026-09-18 by M-ID-1 …]` marker was appended; the row's own findings are unmodified. |
| R3 | `docs/progress/implementation-ledger.md` | 125 | `netintel-p6-handoff.tar.gz` (row P6.24.0) | `HISTORICAL_FACT` | The filename of an untracked handoff bundle that was inspected and deliberately not committed. The file's name **at that time** is the fact being recorded. The file is not tracked, so there is nothing to rename. |
| R4 | `docs/benchmark/B0-repository-audit.md` | 61 | `netintel-ai-master/` | `HISTORICAL_FACT` | Records which working copy was supplied for the B0 audit on 2026-09-16. Renaming it would misstate what was audited. Annotated with a historical note directly below the section. |
| R5 | `docs/benchmark/B0-repository-audit.md` | 64 | `Push access to devv0311/netintel-ai was confirmed via the GitHub API` | `HISTORICAL_FACT` | Records an access check performed against **that slug** on that date. The check did not happen against `devv0311/cipher`. Covered by the same historical note as R4. |
| R6 | `docs/data-research/project-assessment.md` | 4 | `**Repository inspected:** devv0311/netintel-ai @ master (4493a3e…)` | `HISTORICAL_FACT` | The inspection header of a point-in-time assessment. It names the repository as it was addressed at `4493a3e` on 2026-09-03. The document already carries a `HISTORICAL` banner, now extended with a naming note. |
| R7 | `docs/data-research/project-assessment.md` | 9 | `devv0311/netintel-ai` | `MIGRATION_DOCUMENTATION` | Part of the historical note added by this migration, which must name the old slug to explain why the header above it was left alone. |
| R8 | `docs/repository-governance.md` | 11, 13 | `NetIntel AI`, `devv0311/netintel-ai` | `MIGRATION_DOCUMENTATION` | The **Naming history** bullet, which exists to record that the product was renamed at P6.21 and that the slug exception was superseded on 2026-09-18. Naming the old identity is the point of the bullet. |
| R9 | `scripts/relationship-evidence-study.ts` | 199 | the `netintel-p6.20-control-` seed literal | **`REPRODUCIBILITY_CONSTANT`** | **See below.** |
| R10 | `CLAUDE.md` | §1 Identity block | `netintel-ai`, `netintel`, `NetIntel`, `NetIntel AI` | `MIGRATION_DOCUMENTATION` | The rule that forbids reintroducing the legacy names must spell them out in order to forbid them. |
| R11 | `docs/governance/naming.md` · `docs/migrations/*.md` | throughout | all legacy spellings | `MIGRATION_DOCUMENTATION` | The naming contract, the audit and this register document the migration and must name what was migrated **from**. |

## R9 — the frozen reproducibility constant, in full

**File:** `scripts/relationship-evidence-study.ts:199`
**Classification:** `REPRODUCIBILITY_CONSTANT` — **DO NOT RENAME**

The literal is the input to a SHA-256 digest:

```ts
const h = crypto.createHash("sha256").update(`netintel-p6.20-control-${i}`).digest();
return h.readUInt32BE(0) / 0x100000000;
```

whose output indexes into the sorted LEI population to draw P6.20's 500-pair control
set.

**Determination:** it is **not cosmetic**. It is not a name, a label or a display
string — it is a measurement constant. Renaming it to a `cipher-` spelling would
produce a different digest, select **a different 500 pairs**, and therefore silently
change P6.20's published **0/500** control result, which could then no longer be
reproduced from the committed record.

**Decision:** frozen, byte-identical, at the value the published run used. This is
strictly preferable to silently invalidating a published benchmark result for the sake
of branding consistency in a string no user ever sees.

The call site carries a comment stating that it is a legacy reproducibility constant,
that it is not current branding, and that renaming it would break reproducibility.

---

## Not in this register, and why

- **`ShadowTrace` / `shadow-trace` / `shadow trace`** — **zero occurrences.** This name
  has never existed in this repository. It is not a predecessor name here.
- **`shadow-lg`, "shadowing stale analytics", "never silently shadows a changed graph"**
  (6 occurrences in `src/components/`, `src/lib/`, `docs/data/`, `tests/`) — Tailwind CSS
  utility classes and the ordinary English verb. Coincidental substrings, not product
  identity, explicitly out of scope, left byte-identical.
- **Generic environment variables** (`APP_ENV`, `APP_PORT`, `DATABASE_URL`, `LOG_LEVEL`,
  …) — never carried a product prefix; there is no `NETINTEL_*` or `SHADOWTRACE_*` to
  migrate, and renaming generic variables to `CIPHER_*` would break runtime
  configuration for no benefit.
- **Git commit hashes and pushed commit messages** — `IMMUTABLE_REFERENCE` by nature.
  History was not rewritten; no hash was altered.
