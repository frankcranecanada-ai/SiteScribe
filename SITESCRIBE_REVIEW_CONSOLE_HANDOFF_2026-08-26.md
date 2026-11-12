# SiteScribe Review Console — Full Engineering Handoff

**Prepared:** 2026-08-26  
**Workspace:** `C:\Users\ECR1\Desktop\ALL APPS\1SiteScribe-review-console`  
**Source control:** The user does **not** want Git used for this project.  
**Product principle:** *The site remembers, even when people change.*

---

## 1. Read this first: present release state

There are two different ideas that must not be confused:

| Meaning | Version / location | Status |
|---|---|---|
| Last user-accepted Review Console baseline | `source\review-console-v0.7.33\` | **Accepted baseline** |
| Latest test candidate | `source\review-console-v0.8.8\` | **Not yet accepted as a new baseline** |
| Files currently mirrored at the project root for deployment/testing | Root nine web files | Match **v0.8.8** |
| Latest test deploy archive | `artifacts\SiteScribe_Review_Console_v0.8.8_Closed_Secondary_Recovery_Footer_Deployable.zip` | Flat deploy package |
| Latest full-source archive | `artifacts\SiteScribe_Review_Console_v0.8.8_Closed_Secondary_Recovery_Footer_Source.zip` | Source + release evidence |

### Source-authority rule for the next engineer

1. Do **not** treat a root deploy file or an artifact ZIP as source authority.
2. Do **not** claim that v0.8.8 is accepted until the user says so explicitly.
3. For a new unrelated release, begin from accepted `v0.7.33` unless the user explicitly authorizes continued work on the v0.8 candidate line or accepts v0.8.8.
4. If continuing the unaccepted three-level work, copy the latest matching candidate into a **new** versioned folder; do not edit v0.8.8 in place.
5. Never touch `source\review-console-v0.7.18\`. It is the protected original baseline retained by the repository rules.

This distinction matters because the code at the root is intentionally current for testing, but test deployment is not user acceptance.

---

## 2. Product boundary and non-negotiable behavior

SiteScribe is a **local-first** site-memory and review tool. It is not an autonomous jobsite system.

### Responsibility split

| Component | Responsibility |
|---|---|
| Parser Lite | Cleans and organizes raw notes into reviewable JSON proposals. |
| Review Console | Imports approved JSON; manages sites, working memory, records, deliverables, reports, contacts/routing, draft-email history, local storage, and Dropbox transfer. |
| Human operator | Approves imports, records, dates, statuses, communications, and every operational action. |

### Never introduce any of the following without explicit user approval

- Automatic email sending, notifications, closing/reopening, date changes, schedule changes, or jobsite decisions.
- A browser-visible OpenAI API key, Dropbox token, or any credential.
- A silent overwrite during JSON or Dropbox import.
- An automatic transition from parsing to Working Memory. The operator must review and append accepted records.
- A change to Dropbox authentication, redirect handling, app-folder scope, or file naming.
- A change to hardcoded MDS billing metadata.
- A shared global contacts master. Contacts copied from another saved site become independent copies.

### Draft-email rule

SiteScribe drafts and suggests only. A draft is **not** proof that an email was sent or delivered. Routing recommendations remain unselected until the operator chooses them.

---

## 3. Repository map

```text
1SiteScribe-review-console\
├── app.js                              # Root deploy mirror; currently v0.8.8
├── index.html                          # Root deploy mirror; currently v0.8.8
├── styles.css                          # Root deploy mirror; currently v0.8.8
├── dropbox-sync-proof.js               # Root deploy mirror
├── sitescribe-add-data.js              # Root deploy mirror; B04/Parser handoff
├── sitescribe-parser-core.js           # Root deploy mirror; do not mix with Parser Lite copy
├── sitescribe-hours-excel.js           # Root deploy mirror
├── sitescribe-mds-excel.js             # Root deploy mirror
├── exceljs.min.js                      # Root deploy mirror
├── AGENTS.md                           # Binding project development rules
├── REGRESSION_CHECKLIST.md             # Core manual regression checklist
├── SITESCRIBE_REVIEW_CONSOLE_HANDOFF_2026-08-26.md
├── artifacts\                          # Deploy and full-source ZIPs; retain for rollback
└── source\
    ├── review-console-v0.7.18\         # Protected original baseline; never edit
    ├── review-console-v0.7.33\         # Last accepted baseline
    └── review-console-v0.8.0 ... v0.8.8\ # Candidate line; latest is v0.8.8
```

### Exact deployable file contract

Every Review Console deploy ZIP must be **flat** and contain exactly these nine files—no enclosing folder and no notes, tests, or hidden extras:

```text
app.js
dropbox-sync-proof.js
exceljs.min.js
index.html
sitescribe-parser-core.js
sitescribe-add-data.js
sitescribe-hours-excel.js
sitescribe-mds-excel.js
styles.css
```

The root mirrors this exact deployment set after a candidate is packaged. Release notes, verification evidence, regression scripts, and this handoff are source/documentation files, never deploy-ZIP contents.

---

## 4. Version lineage and decisions already made

### v0.7.33

- User-accepted Review Console baseline.
- It remains the safe start point for unrelated changes until the v0.8 line is explicitly accepted.

### v0.8.0 — capped third record level (candidate)

- Introduced a deliberately limited hierarchy: **Primary → Secondary → Activity**.
- A secondary owns `activities[]`; activity records can never own children.
- Parser/import normalization discards an attempted fourth level rather than preserving it or inventing a deeper data model.
- Legacy two-level files remain valid; their secondary records normalize to `activities: []`.
- Activities reuse the important secondary-record capabilities: status, time, direct hours, expense/billing fields, deliverable, source text, draft-email support, close/reopen, deletion confirmation, compact row treatment, and drag grip.
- Activities only reorder inside their own secondary. They cannot be promoted, moved across parents, or nested further.
- Reports and Excel exports traverse activities. Hours are **direct-only**: do not write child sums to parent records, or totals will double count.

### v0.8.1 — B05 row-click correction (candidate)

- Primary **row body** toggles its secondary branch.
- Secondary **row body** toggles its activity branch.
- The explicit compact `OPEN` pill opens a record’s detail instead of expanding/collapsing it.
- Activity rows open their detail because they have no children.
- This separation was direct user feedback. Do not turn body clicks back into detail-open actions.

### v0.8.2 — inline activity entry (candidate)

- Opening a secondary keeps the user on that secondary’s detail screen.
- A full **Add Activity Record** editor appears below it, with text, time, hours, work date, billing, expense, currency, expense type, and deliverable controls.
- The former navigation-style “Add Activity” pill was intentionally removed. The user did not want to be pulled away from the secondary screen to add third-level items.

### v0.8.3 — consistent B05 OPEN pills (candidate)

- Primary, secondary, and activity OPEN controls use matching compact oval status-pill styling.
- Secondary and activity controls are real buttons; do not regress them to noninteractive spans.

### v0.8.4 through v0.8.6 — Custom AI Report UX prototype (candidate)

- The Reports panel contains the existing regular report selector plus a separate **AI Report** selector.
- `None` hides the AI prototype; any non-None selection shows it.
- The selector includes `None`, `Blank custom report`, and three site-specific saved-prompt placeholders:
  - Schedule delivery status
  - Crane window readiness
  - Open work hours
- The prototype clearly says **PROTOTYPE · NO API CALL**.
- Prompt entry, report output, and save/manage controls are disabled placeholders. No prompt is stored, no data is sent, no report is generated, and no API call exists.
- This was intentionally designed for later server-side/proxy work analogous to the Parser Lite server path. Never place an API key in browser files.

### v0.8.7 and v0.8.8 — closed secondary/activity recovery repair (candidate)

The v0.8.7 intent was correct but the initial implementation hid recovery controls within the same locked editor block. v0.8.8 fixed the actual render-path defect.

The current v0.8.8 behavior is:

| Selected record state | Parent state | Editor | Recovery controls |
|---|---|---|---|
| Open secondary/activity | Required ancestors open | Editable | `Close Record` |
| Closed secondary | Primary open | Locked | `Reopen` and `Delete` shown below lock notice |
| Closed activity | Primary and parent secondary open | Locked | `Reopen` and `Delete` shown below lock notice |
| Activity under closed secondary | Parent secondary closed | Locked | Status only; reopen the secondary first |
| Secondary/activity under closed primary | Primary closed | Locked | Status only; reopen the primary first |

Deletion is still restricted to a closed selected record and uses the existing browser confirmation. Do not make delete one-click or available on an open record.

---

## 5. Current three-level data model

### Hierarchy

```text
Primary record
└── Secondary record / update / comment
    └── Activity record
```

The terminology in older code and documents may say “comment” for a secondary. That is an internal compatibility name, not a request to reduce the interface to free-form comments. In the current design, a secondary is a fully trackable record, and an activity has the same core tracking capabilities at the capped third level.

### Intended schedule example

```text
Primary:     Phase 4A schedule
Secondary:   Sep 19–21 — E-House delivery and offload
Activities:  Truck arrival time
             Truck wait time / crane not ready
             Rigger labor hours
             Safety meeting and attendees
             Hoist time
             Crane hours
```

This is why the third level exists: detailed work remains structured and reportable instead of being buried in a secondary’s free-form text.

### Key data expectations

- Primary records carry `comments[]` (the legacy internal name for secondaries).
- Each normalized secondary carries `activities[]`.
- Activities must normalize with `activities: []`; a fourth level must be discarded.
- `sourceText` is protected data and must survive parse, review, import, append, edit, saved-site storage, JSON export/import, Dropbox transfer, report/export, record promotion/movement, and email-draft context.
- Each record can carry its own status, timestamps, work date, direct hours, billing/expense values, deliverable details, flags, routing/email fields, and movement metadata as applicable.
- Existing two-level packages must remain importable.

### Important metadata caveat

`app.js` still writes an older descriptive value of `model: "two-level-records-with-record-flags"` in some package metadata. The implementation now supports a capped third activity level. Treat that label as a **known stale metadata description**, not as a directive to delete activities. Correct it only in a focused, separately tested candidate because exported-package compatibility must be verified.

---

## 6. Working Memory (B05) interaction contract

### Click behavior

| Element clicked | Expected result |
|---|---|
| Primary row body | Expand/collapse that primary’s secondary records |
| Primary branch arrow/count | Expand/collapse secondary records |
| Primary OPEN pill | Open primary detail only |
| Secondary row body | Expand/collapse that secondary’s activities |
| Secondary branch arrow/count | Expand/collapse activity records |
| Secondary OPEN pill | Open secondary detail only |
| Activity row body / OPEN pill | Open activity detail |
| Six-dot drag grip | Initiates only the permitted drag/reorder operation |

The body/pill distinction is not cosmetic. It prevents accidental navigation when the user is scanning or unfolding large schedules.

### Drag rules

- Primary, secondary, and activity drag operations are guarded by record locks and deliverable/movement rules.
- Only the six-dot grip begins a drag. Normal row clicks must remain normal clicks.
- Activity reordering is only within its current secondary.
- Do not allow activities to become primary records, move between secondary parents, or create a fourth level without an explicit new user decision and migration plan.
- The touch affordance and iPhone drag behavior were repaired in the v0.7.28/v0.7.29 period; retain desktop hover and touch-visible grip affordances.

### Detail behavior

- Opening any record displays **that record’s detail**, not an all-children screen.
- To navigate a branch, close the detail and use B05’s expand/collapse structure.
- Backdrops do not close the secondary/detail editor. Only the explicit Close control closes it.

---

## 7. Record lock, close, reopen, and delete rules

These are data-integrity rules, not merely UI styling.

1. A closed record is visibly deemphasized and locked.
2. A closed primary locks all descendants.
3. A closed secondary locks its own activities.
4. Closing a secondary does **not** close its primary.
5. A closed record remains recoverable through `Reopen` when its required ancestors are open.
6. Delete is only offered for the selected closed secondary/activity record, requires confirmation, and warns that restoration requires a JSON backup.
7. Do not create an automatic status transition in parsing, reports, Dropbox, draft email, or an edit side effect.

### Critical v0.8.8 implementation detail

The locked editor is conditionally rendered in `renderDetail()`. Recovery controls must be rendered **outside** that locked/disabled editor conditional. Otherwise the state logic can be correct but the user will see only a greyed-out detail and a `CLOSED` pill—as happened in v0.8.7.

Key v0.8.8 code locations in `app.js`:

| Area | Approximate function / line | Why it matters |
|---|---:|---|
| Detail render | `renderDetail()` around 3884 | Computes ancestor locks and selected context |
| Locked recovery footer | around 3979 | Uses `locked && selectedComment` and `secondary-locked-recovery-footer` |
| Status control render | `renderSelectedCommentStatusControls()` around 4086 | Returns Close or Reopen/Delete controls |
| Detail action handling | `handleDetailClick()` around 4305 | Applies close/reopen/delete checks and confirmations |
| Activity save/edit path | around 4664 | Enforces parent and activity locks |
| Inline add-activity path | around 4754 | Adds direct child activities without navigation |

---

## 8. Reports, hours, exports, and delivery logic

### Report traversal

- Report functions traverse primary records, their secondary records, and activity records.
- Activities appear with parent-secondary context.
- A closed secondary excludes its activities from active reporting traversal.
- A closed primary excludes descendant work through the existing primary lock/filter path.
- The system uses direct hours/expenses stored on each record. Parent totals are calculated only in report/export output, never persisted back into parent records.

### Reports panel

Regular reports remain the functional report path. The AI-report selector is additive prototype UI, not a replacement for `Report Type`.

Do not conflate the two controls:

| Control | Current state |
|---|---|
| `Report Type` | Functional standard reports |
| `AI Report` | Controls visibility of a disabled, no-API prototype |

### Excel outputs

- Hours and MDS Excel exports must preserve activity context.
- MDS billing excludes closed secondaries and entries under closed primaries.
- Keep the accepted Hours table format unless the user specifically asks to revise it.

### Future AI reporting design, not implemented

The user’s intended prompt is similar to: “Report on what has been delivered and what is left to do in the schedule.” A future implementation should:

1. Send only the current reviewed site JSON and an operator-provided prompt through a server-side proxy.
2. Return a clearly labeled draft report into a text area.
3. Never automatically alter records, dates, schedule status, email, or communications based on the response.
4. Make data scope explicit and keep credentials off the browser.
5. Add saved prompt persistence only with a user-approved data design.

No part of that future workflow is currently functional.

---

## 9. Parser Lite / B04 integration

### Current intent

B04 is a launcher into the existing parsing workflow. It does not contain a raw-note textbox itself.

- The visible action says **Open Note Parser**.
- The parser accepts rough notes or schedule text plus an optional instruction.
- The instruction must travel separately from raw source text and must never be copied into `sourceText`.
- Parser review remains human-approved. Nothing enters Working Memory until **Append Accepted Records** is pressed.

### Schedule-specific instruction style

An operator may use an instruction such as:

> Create a Schedule primary, an E-House delivery secondary, and activity records only for separately trackable execution details.

The parser must not infer dates, obligations, recipients, or record detail that is unsupported by source material. It should use clarification/flags where needed.

### Parser deployment protection

Routine Parser Lite deployment is client-only. The known supplied Parser Lite client set is:

```text
index.html
app.js
styles.css
sitescribe-parser-core.js
sitescribe_contacts.json
```

Never replace the whole deployed Parser Lite directory. Do not overwrite its `server\`, `server\parse.php`, or `server\sitescribe_openai_key.php` unless the user explicitly asks for a proxy/server release. The Review Console and Parser Lite each carry a `sitescribe-parser-core.js`; do not substitute one for the other even if they happen to look identical.

---

## 10. Import, saved-site, and Dropbox protections

### JSON import choices

Every import path—including Dropbox—must present the protected choice:

1. **Create New Saved Site**
2. **Append To Current**
3. **Cancel**

Never silently overwrite an existing site. Preserve file-picker JSON import and drag-and-drop JSON import.

### Saved sites

- A saved site is self-contained.
- Source-site contact copying creates independent records in the target site.
- Saved sites must persist after reload.
- Local JSON export must retain the current site, source text, records, deliverables, flags, contacts/routing, selected template, and email activity.

### Dropbox behavior

- **LIST DROPBOX JSON FILES** only lists available SiteScribe JSON files.
- **IMPORT** must use the protected Create New / Append / Cancel path.
- **UPDATE DROPBOX SITE FILE** replaces the stable Dropbox site file only after its existing confirmation.
- **SAVE NEW BACKUP COPY** creates a dated restore-point copy; it is intentionally distinct from Update.
- After an Update, the app must automatically run a list operation so the current file can be seen in Dropbox. The relevant protection is `listDropboxJsonFiles({ client: dbx, afterSiteUpdate: true })` in `dropbox-sync-proof.js`.
- Recognized Dropbox file rows are limited to bold name/status, Content updated, Import, and Delete. Keep unreadable-file diagnostics.
- Dropbox errors must not change Working Memory or local saved sites.

Do not alter Dropbox auth, redirect, app folder, scope, or naming without direct user approval.

---

## 11. UX requirements that have already been decided

- The Bxx box number is the control that exposes title-box configuration; users found this by testing. Do not add unrelated expand/collapse behavior to every header area.
- B05 should preserve title space: indentation is intentionally light, rows are compact, and grips/status pills should not crowd descriptive text.
- No visible B03 Active Working Memory panel.
- Never restore removed controls: Load Sample, Clear All Sites, standalone CONFIG, visible Apply Site Name.
- B04 Parse Notes needs clear launcher wording so it does not imply the raw note should be pasted into the pill itself.
- The user wants structured schedule execution details under a secondary, not a free-form text blob.
- AI report UX belongs in Reports, but stays a safe prototype unless a future server-side integration is explicitly authorized.

---

## 12. Current candidate validation evidence (v0.8.8)

Evidence is stored in:

```text
source\review-console-v0.8.8\RELEASE_NOTES_v0.8.8.txt
source\review-console-v0.8.8\VERIFICATION_v0.8.8.txt
source\review-console-v0.8.8\regression_check_v0.8.8.js
```

Completed before packaging:

- Version and changed cache markers matched v0.8.8.
- `node --check` passed for all first-party JS files and the focused regression script.
- Focused v0.8.8 regression: 17 checks passed, 0 failed.
- No duplicate first-party function declarations found.
- No duplicate HTML IDs found.
- CSS brace balance: 971 opening and 971 closing braces.
- Browser test in an isolated localhost session:
  1. Created an open primary and secondary.
  2. Closed the secondary.
  3. Verified locked editor plus visible **Reopen** and **Delete**.
  4. Used Reopen and verified normal editable secondary controls returned.
- Root nine deploy files were SHA-256-matched to the v0.8.8 candidate.
- v0.8.8 deploy ZIP was verified flat with exactly nine expected web files.
- v0.8.8 source ZIP was verified to include release notes, verification evidence, and the focused regression.

### User test still needed

v0.8.8 has not been explicitly accepted as a new baseline. The next interaction should ask the user to test the actual deployment, particularly:

- Closed secondary under an open primary: visible Reopen and Delete.
- Closed activity under an open secondary: visible Reopen and Delete.
- Closed primary / closed parent secondary: descendant recovery remains blocked.
- Desktop and relevant iPhone workflow.

---

## 13. Required release workflow for every future candidate

### A. Before editing

1. Read `AGENTS.md` fully.
2. Identify the exact source-authority folder and user acceptance state.
3. Copy that source to a new immutable versioned candidate folder, for example `source\review-console-v0.8.9\`.
4. Never edit a previously packaged candidate in place.
5. Diagnose the event path, render path, state/storage path, and deployment path first. Make the smallest coherent change; do not casually refactor `app.js`.

### B. Version and cache updates

Update all changed release markers together:

- `app.js`: top release note block and `const APP_VERSION = "vX.Y.Z"`.
- `index.html`: page title, visible version, `styles.css?v=`, `app.js?v=`, `sitescribe-add-data.js?v=`, and `dropbox-sync-proof.js?v=`.
- `sitescribe-add-data.js`: `const MODULE_VERSION = "vX.Y.Z"`.
- New `RELEASE_NOTES_vX.Y.Z.txt`.
- New `VERIFICATION_vX.Y.Z.txt` after testing.
- New focused regression script, copied forward and named `regression_check_vX.Y.Z.js`.

### C. Minimum automated checks

Run from the candidate folder:

```powershell
$files = @(
  'app.js',
  'dropbox-sync-proof.js',
  'sitescribe-add-data.js',
  'sitescribe-hours-excel.js',
  'sitescribe-mds-excel.js',
  'sitescribe-parser-core.js',
  'regression_check_vX.Y.Z.js'
)
foreach ($file in $files) {
  node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node .\regression_check_vX.Y.Z.js
```

Also check:

- Version/cache-marker agreement.
- Duplicate first-party function declarations.
- Duplicate DOM IDs.
- CSS brace integrity and changed selectors.
- A changed-workflow browser test.
- The manual core list in `REGRESSION_CHECKLIST.md`.

### D. Required manual focus for three-level changes

At a minimum test these branches explicitly:

1. Primary row body toggles secondaries; primary OPEN opens detail.
2. Secondary row body toggles activities; secondary OPEN opens detail.
3. Activity detail does not offer child creation.
4. Inline Add Activity stays within the selected secondary.
5. Activity direct hours contribute once, with parent context in reports/exports.
6. A closed secondary excludes its activities from active reports.
7. Close/reopen/delete matrix in Section 7.
8. JSON import Create New / Append / Cancel and sourceText persistence.
9. Dropbox post-update listing.
10. Relevant touch/iPhone behavior if B05, drag, detail, or layout changed.

### E. Packaging procedure

1. Confirm candidate version/cache markers.
2. Copy only the exact nine deploy files from the candidate to root.
3. Compare file hashes between root and candidate.
4. Create a deploy ZIP containing only those nine files at ZIP root.
5. Create a full-source ZIP containing the full candidate directory, release notes, verification evidence, and regression script.
6. Verify ZIP contents; retain all older artifacts for rollback.
7. Report candidate status honestly. Do not call it accepted until the user explicitly accepts it.

### F. Suggested naming

```text
artifacts\SiteScribe_Review_Console_vX.Y.Z_<Short_Description>_Deployable.zip
artifacts\SiteScribe_Review_Console_vX.Y.Z_<Short_Description>_Source.zip
```

---

## 14. Common regression traps

| Trap | Preventive action |
|---|---|
| Editing root deploy files directly | Always build in a new versioned source folder, then mirror root only after validation. |
| Treating a candidate as accepted baseline | Record user acceptance explicitly; use Section 1 status table. |
| Hiding recovery controls inside a locked form | Render recovery status controls outside the locked editor branch. |
| Turning a row click into a detail-open click | Preserve the B05 body-toggle / OPEN-pill-detail split. |
| Restoring old “Add Activity” navigation pill | Preserve the full inline activity composer in secondary detail. |
| Adding deeper nesting by accident | Normalize to one `activities[]` layer only and discard fourth-level children. |
| Double-counting labor | Use direct record hours; compute totals only in reports/exports. |
| Regressing two-level data compatibility | Normalize missing `activities` to an empty array and retain two-level package validation. |
| Losing source evidence | Carry `sourceText` through every transform and export. |
| Automatically appending parser output | Require operator review and Append Accepted Records. |
| Adding browser API calls/keys for AI reports | Keep prototype inert; later use a server-side proxy only. |
| Accidentally changing Dropbox behavior | Keep Update and Backup distinct; list after Update; preserve protected import choices. |
| Reintroducing removed controls | Check the explicit removed-controls list in `REGRESSION_CHECKLIST.md`. |
| Breaking mobile backdrop behavior | Only explicit Close dismisses Contacts/Departments and record detail. |
| Mixing Parser Lite and Review Console core files | Keep each component’s own `sitescribe-parser-core.js`. |

---

## 15. Helpful code landmarks in current v0.8.8

These approximate locations are for orientation only; search by function name before editing.

| Concern | File / function |
|---|---|
| App setup, B05 click delegation | `app.js`, around initialization and `els.recordsRoot` handlers |
| Primary/secondary expansion state | `toggleSecondaryDisplay`, `toggleCommentActivityDisplay` |
| B05 row rendering | `renderRecordLine`, `renderInlineSecondaryRecord`, `renderInlineActivityRecord` |
| Detail state/render | `renderDetail` |
| Inline activity creation UI | `renderInlineActivityEntry` |
| Close/reopen/delete controls | `renderSelectedCommentStatusControls`, `handleDetailClick` |
| Activity sort/reorder | `sortActivityRecordsForComment`, `reorderActivityWithinComment` |
| Report traversal | `reportChildRows` and report filter helpers |
| Package / record normalization | `normalizePackage`, `normalizeRecord`, `normalizeComment` |
| Parser staging/request | `sitescribe-add-data.js`, `buildRequest`, `normalizePackageForStaging` |
| Package schema validation | `sitescribe-parser-core.js` |
| Dropbox List/Update handling | `dropbox-sync-proof.js`, `listDropboxJsonFiles` and update handler |
| AI prototype visibility | `setCustomAiReportPrototypeVisibility` |

---

## 16. Open design items; do not silently implement

1. **Functional AI reporting.** The UX prototype exists, but a proxy/API design, data scope, retention/privacy behavior, saved-prompt data model, error handling, and approval boundaries still need user authorization.
2. **Saved AI prompts.** Current dropdown values are placeholders only; nothing is persisted.
3. **Package metadata model label.** The stale two-level metadata string should be reviewed as a focused compatibility change, not casually corrected.
4. **Three-level candidate acceptance.** The user must test and explicitly accept the v0.8 line before it replaces v0.7.33 as source authority.

---

## 17. Handoff checklist for the next engineer

- [ ] Read this document, `AGENTS.md`, and `REGRESSION_CHECKLIST.md`.
- [ ] Confirm whether the user has accepted v0.8.8 since this document was created.
- [ ] Confirm which source folder is authoritative before changing any code.
- [ ] Work only in a new versioned source folder.
- [ ] Preserve all safeguards in Sections 2, 7, 9, and 10.
- [ ] Add a focused regression that would have caught the reported defect.
- [ ] Run syntax, regression, duplicate function/ID, CSS, manual workflow, and package checks.
- [ ] Mirror root only after packaging checks pass.
- [ ] Produce both artifact ZIP types and preserve rollback artifacts.
- [ ] State candidate/acceptance status precisely in the final handoff.

---

## 18. Reference artifacts

Latest candidate:

```text
source\review-console-v0.8.8\
artifacts\SiteScribe_Review_Console_v0.8.8_Closed_Secondary_Recovery_Footer_Deployable.zip
artifacts\SiteScribe_Review_Console_v0.8.8_Closed_Secondary_Recovery_Footer_Source.zip
```

The v0.8.8 release notes and verification file are the narrow evidence for the closed-record recovery repair. This document is the broader architecture and regression-prevention handoff.
