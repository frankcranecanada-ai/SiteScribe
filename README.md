# SiteScribe

SiteScribe is a local-first site-memory and review system. It separates:

- **Parser Lite** — turns raw notes into reviewable JSON;
- **Review Console** — maintains records, saved sites, reports, contacts/routing, local storage, and deliberate Dropbox transfer;
- **Human operator** — approves all records, communication, status, and operational actions.

## Current Git baseline

This repository's current Review Console baseline is **v0.8.13**.

- Deployable web files are at the repository root.
- The matching Review Console source and its regression/release evidence are in `source/review-console-v0.8.13/`.
- The protected Parser Lite client baseline is in `source/parser-lite-v0.8.16a/`.
- Historical releases, ZIP packages, local backups, and site-specific contacts are deliberately excluded from Git.

The Review Console v0.8.13 line is a candidate until user acceptance; Git history records the engineering baseline, not user acceptance.

## Important safeguards

- Preserve the capped three-level record model: Primary → Secondary → Activity.
- Preserve `sourceText`, JSON drag/drop and file-picker import, and the explicit Create New / Append / Cancel import decision.
- Do not commit API keys, Dropbox tokens, credentials, or site contact exports.
- Do not automatically send email, change record status/dates, or take jobsite actions.

See `AGENTS.md` for the binding engineering rules and `REGRESSION_CHECKLIST.md` before a release.

## Local checks

From `source/review-console-v0.8.13/`:

```powershell
node --check app.js
node regression_check_v0.8.13.js
```
