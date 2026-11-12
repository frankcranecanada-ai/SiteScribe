# AGENTS.md — SiteScribe Development Rules

These instructions apply to the entire repository.

## Product boundary

SiteScribe is a local-first site-memory and review system. Its principle is: **the site remembers, even when people change**.

Maintain the separation between:

- Parser Lite: cleans and organizes raw notes into reviewable JSON.
- Review Console: imports reviewed JSON and manages working memory, saved sites, records, deliverables, reports, contacts/routing, email drafts/history, local storage, and Dropbox transfer.
- Human operator: approves records, communications, status changes, and operational actions.

Do not merge Parser Lite and Review Console into an autonomous application. Do not automatically send email, notify people, close records, change dates, schedule work, or make jobsite decisions.

## Current source authority

- The last user-accepted Review Console baseline is `source/review-console-v0.7.33/`. Begin a new unrelated release from it unless the user explicitly authorizes continued work on the v0.8 candidate line.
- The current Review Console candidate is `source/review-console-v0.8.10/` (typed 24-hour Start/End entry, branched from v0.8.9). It is **not accepted**. A candidate becomes the baseline only when the user tests it and says so explicitly.
- To continue the v0.8 line, copy the latest candidate into a **new** versioned folder. Never edit an existing candidate folder in place.
- `source/review-console-v0.7.18/` is a protected never-edit folder. It is the retained original baseline, not the source authority. Do not build from it and do not modify it.
- A root deploy file or an artifact ZIP is never source authority. The root nine web files are intentionally current for testing, and test deployment is not user acceptance.
- Historical handoffs are context, not source authority.
- Build Parser Lite client changes only from `source/parser-lite-v0.8.16a/` until the user accepts a newer Parser release.
- Parser Lite and Review Console each carry a `sitescribe-parser-core.js`; do not mix component files even when two copies are byte-identical.
- If exact current source is missing, stop and request it. Do not rebuild from screenshots, deployable files, or older packages.

## Data integrity

- Preserve the capped three-level record model: Primary -> Secondary (update/comment) -> Activity. A secondary owns `activities[]`; an activity never owns children.
- Discard an attempted fourth level during normalization. Do not preserve it and do not deepen the model without an explicit new user decision and migration plan.
- Keep legacy two-level packages importable. Their secondaries normalize to `activities: []`.
- Keep hours and expenses direct-only on each record. Parent totals are calculated in report/export output and are never written back to parent records, or totals double count.
- `app.js` still writes `model: "two-level-records-with-record-flags"` in some package metadata. That is known stale metadata, not a directive to remove activities. Correct it only in a focused, separately tested candidate.
- Preserve `sourceText` through parse, review, import, edit, export, Dropbox, and reporting.
- Preserve JSON file-picker and drag-and-drop import.
- Preserve the protected import choices: Create New Saved Site, Append To Current, or Cancel. Never silently overwrite.
- Each saved site is self-contained. Contacts copied from another site become independent copies; there is no shared global people master.
- Use clarification/flags for ambiguity. Do not invent missing facts, recipients, dates, or obligations.
- Closed records remain recoverable and locked until reopened.

## Safety and autonomy

- Draft and suggest only. Never send email automatically.
- Email recommendations remain unselected until the user chooses them.
- A draft is not proof of sending or delivery.
- Destructive actions such as delete, clear, erase, and discard require confirmation.
- Reversible actions such as reorder, move, promote, and demote do not require confirmation.
- Clicking a shaded backdrop must not close Contacts/Departments or the secondary editor. Only explicit Close controls dismiss those panels.

## Development discipline

- Diagnose before editing. Identify the actual event, render, storage, or deployment path involved.
- Make the smallest coherent change. Do not refactor unrelated code during a repair build.
- Preserve existing user changes and current UI unless the task explicitly changes them.
- Never remove or rename protected DOM IDs without a documented migration and explicit approval.
- Never reintroduce removed controls: Load Sample, Clear All Sites, standalone CONFIG, visible B03 Active Working Memory, or visible Apply Site Name.
- Do not change Dropbox authentication, redirect, app-folder scope, or file naming unless explicitly requested.
- Do not change hardcoded MDS billing metadata without explicit instruction.
- Do not embed private API keys, Dropbox access tokens, or credentials in source or documentation.

## Parser deployment protection

Routine Parser Lite deployments are client-only. The supplied v0.8.16a client set is `index.html`, `app.js`, `styles.css`, `sitescribe-parser-core.js`, and `sitescribe_contacts.json`. Do not replace the whole deployed parser directory. Do not overwrite `server/`, `server/parse.php`, or `server/sitescribe_openai_key.php` unless the user explicitly requests a proxy/server release. Never commit the production OpenAI API key.

## Required verification

Before packaging a Review Console candidate:

1. Confirm version strings and cache markers agree.
2. Run `node --check` on all first-party JavaScript files.
3. Run the current release regression script and any new focused regression.
4. Check for duplicate function declarations and duplicate DOM IDs.
5. Validate CSS brace integrity and inspect changed selectors.
6. Manually test the changed behavior plus the protected workflows in `REGRESSION_CHECKLIST.md`.
7. Verify the deployable package is flat and contains only the expected web files.
8. Produce both a deployable ZIP and a full source ZIP with release notes and regression evidence.

Never claim a candidate is the new baseline until the user tests it and explicitly accepts it.
