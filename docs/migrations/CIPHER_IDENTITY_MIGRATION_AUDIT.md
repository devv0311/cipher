# CIPHER identity migration — audit

**Date:** 2026-09-18
**Scope:** repository-wide product-identity migration to **CIPHER** / `devv0311/cipher`
**Pre-migration HEAD:** `6588e7c3b5dcdd85c2c2aa503f6b581bcfc2822e` (`master`)
**Pre-migration remote:** `https://github.com/devv0311/netintel-ai.git`
**Working tree at audit time:** clean (0 modified, 0 untracked)

---

## 1. The superseded governance decision

Two documents recorded a deliberate decision **not** to rename the repository:

- **`CLAUDE.md` §1** — "CIPHER (repository slug `devv0311/netintel-ai`, deliberately
  not renamed)".
- **`docs/repository-governance.md` § Canonical Repository** — "The GitHub repository
  slug is deliberately NOT renamed … Repository identity and product name are
  separate things and are allowed to differ."
- **`docs/progress/implementation-ledger.md`** row **P6.21.1** — the P6.21 rename
  from "NetIntel AI" to CIPHER, which explicitly preserved the slug and listed
  exactly where it survived.

**That decision is SUPERSEDED as of 2026-09-18.** The product and the repository now
share one identity: **CIPHER** / `devv0311/cipher`. Product name and repository slug
are no longer permitted to differ. The reasoning recorded at P6.21.1 was sound at the
time and is preserved as history; it is no longer current policy.

The new contract is `docs/governance/naming.md`.

## 2. Method

Inventory was built by case-insensitive search across **all 3,489 tracked files** for
`netintel`, `netintel-ai`, `netintel_ai`, `netintelai`, `NetIntel AI`, `ShadowTrace`,
`shadow-trace`, `shadow trace`, plus targeted inspection of package manifests,
environment templates, CI configuration, Docker/infrastructure files, database and
migration identifiers, User-Agent strings, and GitHub URLs.

**No blind search-and-replace was used.** Every occurrence below was read in context
and classified individually.

### Surfaces checked and found to need no change

| Surface | Finding |
|---|---|
| `.github/` (workflows, templates, Dependabot, CODEOWNERS) | **Does not exist.** No CI/CD identity to migrate. |
| Environment variables | No `NETINTEL_*` / `SHADOWTRACE_*` prefix ever existed. All generic (`APP_*`, `DATABASE_URL`, `LOG_LEVEL`). Correctly left alone. |
| `package.json` | Already `"name": "cipher"`, description already `CIPHER — …`. |
| `src/app/layout.tsx` | `metadata.title` already `"CIPHER"`. |
| Model artifacts | Already `models/cipher-er-pair-classifier.*.json`. |
| Docker / Kubernetes / Helm / IaC / Vercel | None present (ADR-001 §10 forbids Docker app services). |
| Database, schema, migration identifiers | No legacy product name in any table, column, SQLite path or Drizzle migration name. |
| Lockfile (`package-lock.json`) | Package name already `cipher`; no regeneration needed. |
| `ShadowTrace` in any spelling | **Zero occurrences. This name has never existed in this repository.** |

### "shadow" substring — deliberately NOT touched

Six `shadow` matches exist and are **all** ordinary English or Tailwind CSS
(`shadow-lg`, "shadowing stale analytics", "never silently shadows a changed graph").
These are coincidental substrings, are not product identity, and were left
byte-identical.

## 3. Classified inventory

Total legacy occurrences at audit: **18**, across **11 files**.

### A. MUST RENAME — current identity, actively wrong

| # | File:line | String | Why |
|---|---|---|---|
| A1 | `CLAUDE.md:11` | `repository slug devv0311/netintel-ai, deliberately not renamed` | States the superseded decision as current policy. The single highest-priority fix. |
| A2 | `docs/repository-governance.md:7` | `**Repository**: devv0311/netintel-ai` | Canonical-repository field of the governance document. |
| A3 | `docs/repository-governance.md:8` | rationale paragraph for not renaming | Argues for the superseded decision as current. |
| A4 | `README.md:105` | `netintel-ai/` | Repository-tree root in the public README. |
| A5 | `src/lib/adapters/public/gleif.ts:379` | `+https://github.com/devv0311/netintel-ai` | User-Agent contact URL. |
| A6 | `src/lib/adapters/public/gleif.ts:413` | `+https://github.com/devv0311/netintel-ai` | User-Agent contact URL. |
| A7 | `src/lib/adapters/public/wikidata.ts:348` | `+https://github.com/devv0311/netintel-ai` | User-Agent contact URL. |

### B. SHOULD RENAME — current prose using the old product name

| # | File:line | String | Why |
|---|---|---|---|
| B1 | `docs/benchmark/CASE_BENCHMARK_REQUIREMENTS.md:6` | `NetIntel's evidence reconstruction` | Current requirements prose naming the product. |
| B2 | `docs/benchmark/candidate-cases.md:38` | `Why it tests NetIntel:` | Current selection-criteria prose naming the product. |

### C. HISTORICAL REFERENCE — PRESERVE WITH CONTEXT

Per `CLAUDE.md` §5–§6, a point-in-time record stays as captured; only current-state
documents are corrected. Rewriting these would make the documentation **false**.

| # | File:line | String | Why retained |
|---|---|---|---|
| C1 | `docs/progress/implementation-ledger.md:33` (P0.5) | `Canonical public GitHub repository created (devv0311/netintel-ai)` | Historical fact: the repository *was* created under that name at that commit. Rewriting it would falsify the phase record. |
| C2 | `docs/progress/implementation-ledger.md:121` (P6.21.1) | multiple | The ledger row that *records the P6.21 rename decision*, including why the slug was then preserved. It is the primary evidence for what this migration supersedes. |
| C3 | `docs/progress/implementation-ledger.md:125` (P6.24.0) | `netintel-p6-handoff.tar.gz` | Historical filename of an untracked handoff bundle that was inspected and deliberately not committed. The file's name at that time is the fact being recorded. |
| C4 | `docs/benchmark/B0-repository-audit.md:61` | `netintel-ai-master/` | Point-in-time B0 audit recording the exact folder name supplied for that task. |
| C5 | `docs/benchmark/B0-repository-audit.md:64` | `Push access to devv0311/netintel-ai was confirmed` | Point-in-time record of an access check performed against that slug on that date. |
| C6 | `docs/data-research/project-assessment.md:4` | `Repository inspected: devv0311/netintel-ai @ master (4493a3e…)` | Point-in-time inspection header naming the repository as it was addressed at that commit. |

Each of C1–C6 receives an explicit historical-note marker rather than an edit to the
recorded fact, so no reader mistakes them for current identity.

### D. REPRODUCIBILITY-SENSITIVE — REVIEW BEFORE CHANGE → **FROZEN**

| # | File:line | String | Determination |
|---|---|---|---|
| D1 | `scripts/relationship-evidence-study.ts:190` | the `netintel-p6.20-control-` seed literal | **Not cosmetic.** It is the input to a SHA-256 hash that selects *which* 500 pairs form P6.20's control set. Renaming it to a `cipher-` spelling draws a **different sample** and silently changes P6.20's published **0/500** control result, which could then no longer be reproduced from the record. **Frozen as a LEGACY REPRODUCIBILITY CONSTANT.** The call site already carries a comment explaining exactly this; that comment is retained and strengthened. |

Verified by reading the call site: the literal feeds a SHA-256 digest whose output
drives index selection into the sorted LEI population. This is the precise hazard
Phase 17 of the migration brief guards against.

### E. EXTERNAL SOURCE / THIRD-PARTY CONTENT — DO NOT MODIFY

No tracked external/upstream source file contains a legacy project name. The
`evidence/` corpora are public-register records (Wikidata, GLEIF, SEC EDGAR) and
synthetic case data; neither carries the product's own branding.

The six `shadow` CSS/English substrings described in §2 are classified here as
coincidental and out of scope.

## 4. Change plan

| Class | Count | Action |
|---|---|---|
| A — must rename | 7 | Rewritten to canonical CIPHER / `devv0311/cipher`. |
| B — should rename | 2 | Rewritten to `CIPHER`. |
| C — historical | 6 | **Preserved**, each annotated with a historical note. |
| D — reproducibility | 1 | **Frozen**, documented at the call site and in the register. |
| E — external/coincidental | 6 (`shadow`) | **Untouched.** |

## 5. Constraints honoured

- Git history preserved — no rewrite, no force-push, no rebase, no amend.
- No commit hash altered.
- Benchmark reproducibility preserved — D1 frozen; P6.20's published 0/500 result
  remains reproducible.
- No blind global replacement — all 18 occurrences classified individually.
- No URL, API, deployment config, package resolution, test fixture, migration or
  external integration broken.
- Historical facts preserved; no document was made false to satisfy branding.

## 6. Outstanding owner action — GitHub repository rename

**Status: BLOCKED — requires an action by the repository owner `devv0311`.**

The migrating account (`Sanchit1089`) holds `push` and `triage` on
`devv0311/netintel-ai` but **`admin: false`**. Renaming a GitHub repository requires
admin. The rename endpoint was attempted and rejected:

```
PATCH /repos/devv0311/netintel-ai  name=cipher  ->  HTTP 404
```

(GitHub returns 404 rather than 403 on admin-only endpoints when the caller lacks
permission.) Pre-checks that did pass:

- **No conflicting repository** — `devv0311/cipher` returns HTTP 404, so the target
  slug is free.
- **Repository health** — public, not a fork, default branch `master`, clean tree.
- **Description / homepage / topics** — all currently empty, so none contains a
  legacy name; they are set as part of the owner action below.

### The exact remaining actions

```bash
# 1. Rename the repository (requires admin - run as devv0311)
gh api -X PATCH repos/devv0311/netintel-ai -f name=cipher

# 2. Set the repository metadata
gh api -X PATCH repos/devv0311/cipher -f description='CIPHER - synthetic-data investigative intelligence platform' -f homepage='https://github.com/devv0311/cipher'

# 3. Point every local clone at the canonical URL
git remote set-url origin https://github.com/devv0311/cipher.git
git remote -v && git fetch origin && git status -sb
```

Until step 1 runs, `origin` intentionally remains on the pre-rename URL: the new URL
does not resolve, so repointing it first would make every push fail. GitHub issues a
permanent redirect from the old slug after the rename, so existing clones continue to
work and step 3 is a cleanup, not a repair.

### Known interim condition

The GLEIF and Wikidata `User-Agent` contact URLs (A5–A7) now carry the canonical
`https://github.com/devv0311/cipher`, which **returns 404 until step 1 is performed**.
This was raised with the owner and migrating to the canonical URL now was the accepted
decision. Both upstreams require a *reachable* contact URL in the User-Agent, so step 1
closes a real compliance gap — it should be performed promptly. Neither adapter is on
the demonstration path, and no automated crawl is scheduled in the interim.

---

**Remaining legacy references after migration are individually justified in
`docs/migrations/CIPHER_LEGACY_REFERENCE_REGISTER.md`.**
