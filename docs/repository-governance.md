# Repository Governance

This document records the operational governance of the CIPHER repository: where the canonical source lives, how the default branch is protected, and the Git synchronization protocol every contributor (human or AI) must follow. It is technology-neutral — it governs the repository, not the eventual application stack.

## Canonical Repository

- **Repository**: `devv0311/cipher` on GitHub
- **Canonical URL**: `https://github.com/devv0311/cipher`
- **Product name**: **CIPHER**. Product name and repository slug are the **same
  identity** and must not diverge. The full contract is `docs/governance/naming.md`.
- **Naming history**: the product was renamed from *NetIntel AI* to **CIPHER** at
  P6.21, at which point the repository slug was deliberately left as
  `devv0311/netintel-ai` and the two were recorded as separate things allowed to
  differ. **That decision was superseded on 2026-09-18** by the CIPHER identity
  migration, which brought the repository slug into line with the product name.
  See `docs/migrations/CIPHER_IDENTITY_MIGRATION_AUDIT.md`.
- **Rename status**: the GitHub rename to `devv0311/cipher` requires admin on the
  repository and is pending an owner action by `devv0311`; the exact command is in
  the audit document §6. Until it runs, `origin` stays on the pre-rename URL
  because the canonical URL does not resolve yet and a push to it would fail.
  GitHub redirects the old slug permanently after a rename, so existing clones keep
  working.
- **Visibility**: Public
- **GitHub is the single source of truth** for project progress. No implementation is considered complete until it exists on the remote.

## Default Branch

- **Branch**: `master`
- Preserved as-is (not renamed) — this is the branch already in use since the foundation commit.

## Branch Protection (`master`)

Applied via the GitHub REST branch-protection API on 2026-09-01:

| Rule | Setting | Rationale |
| --- | --- | --- |
| Force pushes | **Blocked** | Prevents accidental history rewrite on the canonical branch. |
| Branch deletion | **Blocked** | Prevents accidental deletion of the default branch. |
| Required pull request reviews | **Not required** | Single-developer/AI-assisted hackathon workflow; a review requirement would block the owner's own direct pushes and add bureaucracy without a second reviewer to provide it. |
| Required status checks | **Not required** | No CI checks exist yet at this stage; nothing to require. |
| `enforce_admins` | **Off** | The repository owner (admin) can still push directly, matching the mandatory `implement → validate → commit → push → verify` workflow. |
| Branch lock / read-only | **Off** | Would prevent all pushes, including the owner's. |

This intentionally does **not** impose a pull-request-required workflow. The project's mandatory increment cycle is:

```text
implement → validate → commit → push → verify remote synchronization
```

Branch protection here only guards against destructive accidents (force push, deletion) — it does not gate legitimate direct pushes by the repository owner.

### Known Platform Limitation

GitHub's classic branch-protection API was used (rather than the newer Rulesets feature) because it fully covers the required rules (block force-push, block deletion) without requiring paid plan features. No protection rule requiring a paid GitHub plan tier was configured or attempted.

## Repository Security Settings

The following free, public-repository security features were verified/enabled:

| Setting | Status |
| --- | --- |
| Secret scanning | Enabled (GitHub default for public repos) |
| Secret scanning push protection | Enabled (GitHub default for public repos) |
| Dependabot vulnerability alerts | Enabled |
| Dependabot automatic security-update PRs | Not enabled (would add automated PR noise beyond this task's scope; can be enabled later if desired) |

No paid features were enabled. No repository visibility, credentials, or secrets were modified.

## Where the Rules Live

This document governs the **repository**: canonical remote, branch protection,
secret handling, and the synchronization protocol below.

The durable rules an AI session must follow while working in it — architectural
boundaries, evidence provenance, completed-phase protection, testing and
documentation expectations — are in [`../CLAUDE.md`](../CLAUDE.md), which restates
the Git discipline below rather than replacing it. If the two ever disagree about
Git, this document wins.

## Secret-Handling Rule

- Real credentials, API keys, tokens, and certificates must never be committed.
- `.gitignore` excludes `.env`, `.env.*` (except `.env.example`), keys, certificates, and credential files by pattern.
- `.env.example` contains placeholder values only; real local secrets live in a git-ignored `.env`.
- Before every commit, the working tree is scanned for secret-like strings as part of validation.

## Git Synchronization Protocol

Every accepted implementation increment follows:

```text
LOCAL IMPLEMENTATION
       ↓
LOCAL VALIDATION
       ↓
GIT COMMIT
       ↓
IMMEDIATE GITHUB PUSH
       ↓
REMOTE VERIFICATION
```

No accepted progress may exist only locally. Remote verification means confirming, after every push, that `git status` reports the local branch up to date with `origin/<branch>` and that the pushed commit is visible via GitHub CLI (`gh repo view`, `gh api`).

## Change Log

| Date | Change | Commit |
| --- | --- | --- |
| 2026-09-01 | Repository foundation established | `df66560` |
| 2026-09-01 | Branch protection and repository security hardening (P0.18) | See `docs/progress/implementation-ledger.md` |
| 2026-09-09 | Repository-wide documentation and governance reconciliation (P6.30). `CLAUDE.md` becomes the durable AI operating record; `docs/progress/README.md` becomes the canonical current-status document. | See `docs/progress/implementation-ledger.md` |
