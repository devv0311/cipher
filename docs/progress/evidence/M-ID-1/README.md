# M-ID-1 — CIPHER identity migration, visual evidence

| Field | Value |
|---|---|
| Ledger row | `M-ID-1` in [`../../implementation-ledger.md`](../../implementation-ledger.md) |
| Status at capture | COMPLETE (except the owner-only GitHub rename) |
| Commit | `ac3d998` |
| Captured | 2026-09-18 |
| How | Playwright/Chromium against the real dev server at `http://localhost:3000/`, viewport 1440x900, `networkidle` |

## `M-ID-1_screenshot_2026-09-18_ac3d998.png`

The running application shell after the migration.

What it proves:

- **Browser/tab metadata** — `document.title` is `CIPHER`.
- **App shell / header** — the product wordmark reads **CIPHER**, subtitle
  "Investigation Workspace".
- **Navigation, sidebar, pipeline rail, empty state, badges** — no legacy product
  name on any user-visible surface.
- **No legacy string anywhere in the DOM** — asserted in the same run:
  `/netintel|shadowtrace/i.test(document.documentElement.outerHTML)` returned
  `false`.
- **No console errors** during load.

Interaction recording and side-by-side comparison are not applicable: this
milestone changes no interaction and no layout. It is a text-identity migration,
and the only visual delta against the pre-migration UI is that there is none —
the UI already read CIPHER after P6.21; this milestone brought the repository
identity into line with it.
