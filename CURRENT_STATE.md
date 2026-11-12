# SiteScribe Current State

Status date: 2026-08-05

## Current baselines

| Component | Baseline | Authority | Included |
|---|---:|---|---|
| Review Console | v0.7.18 | Current source and release packages in this kit | Yes |
| Parser Lite client | v0.8.16a | Supplied client files and visible version | Yes |
| Parser server proxy | deployed `server/parse.php` lineage | Protected production component | No — intentionally excluded |
| JSON contract | two-level records, package version 1.0 lineage | Master engineering handoffs | Documented |

The v0.7.18 source passed JavaScript syntax checks and its focused `regression_check_v0.7.18.js` before this kit was assembled.

## Current Review Console capabilities

- File picker, drag/drop JSON import, and protected import-choice workflow.
- Working Memory with primary and secondary records, open/closed behavior, flags, deliverables, dates, manual sorting, and mobile-safe editing.
- Saved Sites in IndexedDB with local autosave, explicit JSON export, Dropbox pull, stable-file update, and dated backup copy.
- Site-specific Contacts / Departments, routing aliases/keywords/intents, and deliberate contact copying from a selected source site.
- Parser-result intake and voluntary email-draft recommendations.
- Editable email draft screen; no automatic sending.
- Site-specific Email Activity log with clear-confirmation and collapsed/expandable detail containing source record context and draft preview.
- Daily Site, Open Items, Hours, MDS Billing, and Communication Activity reports.
- MDS Billing excludes closed secondary records and every billing entry under a closed primary.
- Mobile report horizontal scrolling and mobile secondary time-entry protections.

## v0.6.99 through v0.7.18 lineage summary

- v0.6.99: mobile Site Walk reorder gesture lock.
- v0.7.00–v0.7.10: site-owned Contacts / Departments, persistence repair, lookup/prefill evolution, title-bar reorder/state fixes, site-scoped contact copying, inert Contacts backdrop.
- v0.7.11–v0.7.14: parse-to-email review completion, Communication Activity Report, inert secondary backdrop, clearable email activity, expandable email activity history with source/draft context.
- v0.7.15: improved mobile secondary time-entry layout and page lock.
- v0.7.16: MDS Billing excludes closed work.
- v0.7.17: compact Dropbox file rows.
- v0.7.18: Dropbox list tooltip clipping repair.

Detailed per-release notes are in `source/review-console-v0.7.18/RELEASE_NOTES_*.txt`.

## Open work and unresolved decisions

### 1. Performance defect — next recommended task

The user reports unacceptable latency when typing, entering data, and choosing projects in v0.7.18. No performance fix has been made yet. Diagnose before changing code.

Initial investigation should measure:

- input/change handlers firing on every keystroke;
- delayed autosave frequency and overlapping IndexedDB writes;
- full Working Memory or Saved Sites re-renders triggered by field input;
- large site JSON cloning/stringification;
- contact/routing aggregation across all saved sites;
- Dropbox list/status work running during unrelated UI actions;
- duplicate listeners accumulated after opening panels or switching sites.

Use browser performance traces and targeted instrumentation. Do not reduce data safety or remove autosave merely to make the symptom disappear.

### 2. Email draft secondary-record model — design decision pending

Email drafts currently remain visible as secondary records so their text can be reopened. Pressing MARK SENT closes the email-draft secondary. The user saw value in having the text visible and has not approved removing these secondary records. Do not change this model without a new explicit decision.

### 3. Parser Lite baseline qualification

The supplied Parser Lite client files identify themselves as v0.8.16a and pass JavaScript syntax checks. No matching release note or automated regression script was supplied, so Codex should treat them as the current user-supplied client baseline and perform a baseline inventory/manual smoke test before the first Parser edit. Preserve the production server folder and secret-key file.

### 4. Real-world acceptance coverage

The parse/email route has been functionally exercised: a routing recommendation appeared, the user selected it, and the email draft opened. The reporting features are present, but future releases should continue real-site testing on desktop and iPhone.

## Explicitly finished or protected decisions

- Each site remains self-contained.
- Cross-site contact reuse is copy-only: choose source site, then contact, then prefill an independent current-site contact.
- No global people repository and no cross-site automatic update.
- Contacts/Departments and secondary-editor shaded backdrops are inert.
- Email is never sent automatically.
- Email activity can be cleared only with confirmation and only for the open site.
- Dropbox file rows are compact; unreadable-file diagnostics remain visible.
- B03 remains removed from the visible Review Console and reports.
- Templates are browser-global with version-aware merging, while each site retains its chosen template ID.

## Known deployment facts

- Review Console deployable is a flat nine-file web package.
- Dropbox button logic changes require deployment of `dropbox-sync-proof.js`.
- Parser normal releases are client-only; never overwrite `server/` as part of a routine UI release. The normal client set is `index.html`, `app.js`, `styles.css`, `sitescribe-parser-core.js`, and `sitescribe_contacts.json` when contact configuration changes.
- Cache markers/version query strings must be bumped when JavaScript or CSS changes, particularly for iPhone/PWA testing.
