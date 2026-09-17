# Naming — the canonical identity contract

**Status:** Canonical and current. Adopted 2026-09-18 by the CIPHER identity migration.

This document defines the **only** correct spelling of the product's identity in
every surface of this repository. It supersedes the earlier position that the
product name and the repository slug were allowed to differ
(`docs/repository-governance.md`, ledger row P6.21.1).

**There is no official expansion of "CIPHER".** It is a name, not an acronym. Do
not invent one, do not backronym it, and do not write "C.I.P.H.E.R." or gloss it
as standing for anything.

---

## 1. The canonical forms

| Context | Canonical form |
|---|---|
| Human-facing product name | `CIPHER` |
| Default textual form in prose, titles, UI | `CIPHER` |
| Repository slug | `cipher` |
| Canonical GitHub repository | `devv0311/cipher` |
| Canonical repository URL | `https://github.com/devv0311/cipher` |
| Lowercase machine identifier | `cipher` |
| Separated / compound identifier | `cipher-<suffix>` |

Use another variant **only** when a platform's own naming rules forbid these — and
when you do, say so at the point of use.

## 2. Rules by surface

| Surface | Rule | Current value |
|---|---|---|
| Product name | `CIPHER`, always uppercase in prose | `CIPHER` |
| Repository slug | `cipher` | see §4 |
| npm package name | `cipher` | `package.json` `name` |
| Package description | Begins `CIPHER — ` | `package.json` `description` |
| Application / service id | `cipher` | — |
| Browser / document title | `CIPHER` | `src/app/layout.tsx` `metadata.title` |
| Docker / container name | `cipher` | none present (ADR-001 §10 forbids Docker app services) |
| Image name | `cipher` | none present |
| User-Agent product token | `CIPHER-research/<version>` | GLEIF, Wikidata adapters |
| User-Agent contact URL | `https://github.com/devv0311/cipher` | GLEIF, Wikidata adapters |
| Telemetry / logging service label | `cipher` | none present |
| Environment-variable prefix | **none** — this project uses generic names | `APP_*`, `DATABASE_URL`, `LOG_LEVEL` |
| Model artifact filename | `cipher-<purpose>.<version>.json` | `models/cipher-er-pair-classifier.*.json` |
| Filenames / directories | `cipher-…` when they carry product identity | — |
| Documentation titles | `CIPHER` | — |
| Test fixture branding | `CIPHER` | — |
| Generated reports / dossiers | `CIPHER` | — |
| API metadata | `CIPHER` | — |

### Environment variables

This project deliberately has **no product-specific environment-variable prefix**.
Configuration uses generic names (`APP_ENV`, `APP_PORT`, `DATABASE_URL`,
`LOG_LEVEL`, …). There was never a `NETINTEL_*` or `SHADOWTRACE_*` prefix, so
there is nothing to migrate. **Do not** rename these generic variables to
`CIPHER_*`: they are not identity, and renaming them would break runtime
configuration, `.env.example`, and every deployment target for no gain.

### Database, storage and schema identifiers

Persistent identifiers are **not** renamed for branding. SQLite file paths,
Drizzle migration directory names (`drizzle/2026…_<codename>`), table names and
column names are load-bearing: renaming them breaks migrations and existing data.
None of them currently carries a legacy product name.

## 3. What must never be renamed for branding

1. **Reproducibility constants.** Any string that is an input to a hash, a seed, a
   sample-selection function, or a published measurement. Renaming one silently
   changes a published result. See `scripts/relationship-evidence-study.ts:190`.
2. **Historical records.** A point-in-time audit, an evidence capture, a ledger row
   describing what was true then. Correct the *current-state* document; leave the
   record as captured and say what superseded it (`CLAUDE.md` §5, §6).
3. **External / third-party source material.** Upstream data, licences, quoted
   documents. These are evidence, not branding.
4. **Immutable Git objects.** Commit hashes and the commit messages already pushed.
5. **Coincidental substrings.** `shadow-lg`, "shadowing stale analytics", and any
   ordinary English or CSS token that merely contains a matching substring. These
   are not identity and are out of scope.

Every legacy string that survives a migration must be listed, with its reason, in
`docs/migrations/CIPHER_LEGACY_REFERENCE_REGISTER.md`.

## 4. Repository slug — current state

The canonical slug is **`cipher`** and the canonical URL is
**`https://github.com/devv0311/cipher`**.

As of 2026-09-18 the GitHub rename is **pending an owner action**: it requires
admin permission on `devv0311/netintel-ai`, which the migrating account does not
hold. Until the owner performs it:

- Every in-repository reference already uses the canonical `cipher` form.
- The Git remote `origin` still points at the pre-rename URL, because the new one
  does not resolve yet and a push to it would fail.
- GitHub issues a permanent redirect from the old slug after a rename, so existing
  clones and already-published links keep working.

The exact remaining action is recorded in
`docs/migrations/CIPHER_IDENTITY_MIGRATION_AUDIT.md` §6.

## 5. Legacy names — historical only

`NetIntel`, `NetIntel AI`, `netintel`, `netintel-ai`, `netintel_ai` are
**historical only**. They may appear **only** in the four preserved categories in
§3. They must never be reintroduced into a current-state document, a UI string,
package metadata, a generated report, or a contact URL.

`ShadowTrace` in any spelling **has never existed in this repository**. It is not a
predecessor name here. Do not add it, and do not "restore" it.
