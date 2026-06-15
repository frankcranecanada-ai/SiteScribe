# SiteScribe Review Console v0.4.7

Local browser-based SiteScribe review app.

## Protected requirement

JSON import is a protected non-regression feature.

Future versions must preserve both:

- drag-and-drop JSON loading
- Choose JSON File / file-picker loading

Do not remove, rename, or bypass the DOM elements used by `app.js` for JSON import:

- `jsonFile`
- `dropZone`
- `sampleButton`
- `statusLine`

## Current version

**v0.4.7**

## Version history

- **v0.1** — Loaded one SiteScribe JSON package, validated required sections, rendered review/action cards, and provided copy buttons.
- **v0.2** — Added collapsible sections, editable card fields, status buttons, in-memory JSON updates, and reviewed JSON export.
- **v0.2.1** — Clarified in-memory edit behavior, added modified badges, dirty-state wording, and reload/leave warning.
- **v0.2.2** — Added clarification resolution logic and active-vs-closed clarification sections.
- **v0.2.3** — Fixed formatted copy-pill click handling.
- **v0.2.4** — Compressed review UI and compact closed clarification rows.
- **v0.3** — Added IndexedDB persistent local storage, Local Archive / Saved Packages, reopen saved package, and persistent edits/status changes.
- **v0.3.1–v0.3.4** — Improved JSON drop/import reliability and display de-duplication/routing.
- **v0.4** — Added two-level record model: category/date-grouped main records plus secondary update lines only.
- **v0.4.1** — Fixed JSON import by using one shared importer for file picker and drag/drop.
- **v0.4.2** — Fixed object rendering, duplicate suppression, and clarification-title preservation.
- **v0.4.3** — Converted missing information and clarification into record flags instead of standalone categories.
- **v0.4.4** — Simplified the detail screen around one secondary update/comment workflow.
- **v0.4.5** — Selecting a secondary item loads it into the editor and saving updates that line instead of duplicating it.
- **v0.4.6** — Clarified secondary item behavior: virgin box creates new items; selected item edits replace that selected item.
- **v0.4.7** — Protected JSON import as a standing requirement, restored the required v0.4 DOM structure, and hardened drag/drop plus file-picker loading so future builds must preserve them.

## What this version does

- Loads SiteScribe JSON by drag/drop or file picker.
- Creates main records from classification-first entries.
- Displays main records by date, newest first.
- Opens a detail view for one main record.
- Keeps the main description fixed.
- Adds secondary update/comment records under the main record.
- Allows secondary records to be selected, edited, and replaced.
- Stores packages locally in IndexedDB.
- Exports reviewed JSON as a backup/export file.

## What this version intentionally does not do

- No AI API integration.
- No email sending.
- No calendar sync.
- No PWA install yet.

## Use

1. Open `index.html` in a browser.
2. Drop a JSON file onto the drop zone, or click **Choose JSON File**.
3. Review and update records.
4. Save to local storage or export reviewed JSON.
