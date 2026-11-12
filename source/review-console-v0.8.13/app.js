/*
SiteScribe Review Console v0.8.13
Changes:
- v0.7.32: After a successful UPDATE DROPBOX SITE FILE upload, reuses the verified Dropbox client to force an immediate newest-first list refresh. The result line now explicitly confirms that the refreshed list shows the current Dropbox file, or states that the upload succeeded but the confirmation list could not refresh. Backup-copy behavior is unchanged.
- v0.7.33: Keeps the protected two-level primary/secondary model while making B05 branches explicit. A primary row opens only its own detail; its small disclosure control alone expands/collapses secondary rows. Opening a secondary shows only that secondary's editor and a light parent reference, never a sibling list.
- v0.8.0: Introduces a backward-compatible, strictly capped third record level. Primary records contain secondary records; secondary records contain activity records using the same row and editor capabilities. Activity records cannot have children. Reports traverse the third level without copying or double-counting direct hours.
- v0.8.1: B05 row bodies toggle their own branches: primary rows show/hide secondary records and secondary rows show/hide activity records. The existing OPEN pills explicitly open record detail.
- v0.8.2: Secondary detail keeps the operator in place by displaying a full inline activity-entry editor. It replaces the Add Activity navigation pill; activity records can be entered directly beneath their secondary record.
- v0.8.3: B05 primary, secondary, and activity OPEN controls use the same compact oval pill treatment.
- v0.8.4: Adds a non-functional Custom AI Report prototype to the Reports page. It displays the proposed scope, prompt, draft-report area, and explicit future actions without sending data or calling an API.
- v0.8.5: Adds an AI Report selector beside Report Type. The non-functional Custom AI Report prototype expands only when “Add Custom AI Report” is selected.
- v0.8.6: Extends the Custom AI Report prototype selector with Blank custom report and site-specific saved-prompt placeholders. No prompt is loaded, saved, or generated yet.
- v0.8.7: Restores visible Reopen/Delete controls for a closed secondary record when its primary record remains open. The secondary editor stays locked until reopened.
- v0.8.8: Renders closed-record recovery controls outside the locked editor, so Reopen/Delete remain available while the closed editor stays protected.
- v0.8.9: Protects partly entered Start/End times. A time control with only some segments filled reports an empty value to the page, which previously deleted an already-saved time and silently produced a blank Hrs field. Such an entry is now detected, the stored time is preserved instead of erased, and the incomplete box is marked with a visible note. Closing a record now explicitly commits pending editor edits first; the previous commit in that path could never run.
- v0.8.13: B05 secondary and activity rows use two lines in portrait on a phone. The right-hand cluster of work date, hours badge and OPEN pill measured 168px of a 342px row against 106px for the description, so the metadata occupied more of the row than the text it described. That cluster now sits on a second line indented under the title, giving the description the full row width. Stylesheet only: no change to row markup, row rendering, click or drag behaviour, and no stored value changes. Landscape and desktop keep the original single-line layout, and primary rows are unchanged at every size.
- v0.8.12: The B02 saved-site "Content updated" line now shows the site's actual content timestamp instead of record.lastModified. lastModified is bumped by any save, including pure view-state toggles such as expanding a Working Memory branch or pressing Hide Closed, so a site that had only been opened and browsed appeared newer than its own Dropbox copy while the Dropbox row and the CURRENT pill correctly reported the older content date. B02 and B01 now measure the same thing, so an identical date in both means genuinely in sync. No change to Dropbox upload, listing, freshness comparison, or any stored value.
- v0.8.11: The Hrs box in the secondary and activity editors is labelled "Hrs hh:mm" and shows elapsed time as hours:minutes, so a 77-minute entry reads 1:17 instead of 1.28. The Working Memory hours badge matches. Stored values stay decimal and reports, the Hours table, MDS billing and both Excel exports are unchanged. The box accepts either form when typed: 1:17 or 1.28. A stored value that is not minute-aligned is held exactly as saved unless the operator edits the box, so opening a record cannot silently re-round its hours.
- v0.8.10: Secondary and activity Start/End boxes accept typed 24-hour times without interference. The native time control rendered under a 12-hour locale, so typing 20 for 20:00 committed 2 as the hour and jumped to minutes; 20:00 could not be entered at all and a mis-set AM/PM produced a correct calculation of the wrong span. Both boxes are now plain text fields taking 2000, 20:00 or 8:05 and settling to HH:MM on exit. Stored values, hours arithmetic, reports and exports are unchanged; they were already 24-hour. The v0.8.9 partial-entry protection is retained and extended to the text boxes, so an unfinished time still cannot delete a saved one. Work Date and deliverable dates keep the native date control.
- v0.7.31: Clarifies B04 Record Intake's Parse Notes launcher. The visible pill now reads Open Note Parser and its guidance explains that notes, schedule text, and the optional parsing instruction are entered in the opened parser. No parsing, record, saved-site, communication, or Dropbox behavior changes.
- v0.7.30: Adds an optional per-parse instruction field to B04 Parse Notes. The instruction is sent separately to the existing shared parser API before raw source notes, remains visible during proposal review, and is never added to sourceText. It is cleared with the staged intake or after accepted proposals append. No automatic record creation, communication, date/status change, Dropbox action, or saved-site overwrite is introduced.
- v0.7.20: Repairs the secondary editor Work Date fallback for older records that have hours but no stored workDate. Editing an existing secondary now shows its Created Date (then Updated Date or parent record date as legacy fallbacks) instead of incorrectly showing today. A genuinely new secondary record still defaults to today. No stored timestamps or existing data are rewritten merely by opening the editor.
- v0.7.21: Makes the compact secondary-record rows show Work Date when it is stored, falling back to the secondary record Created Date when it is not. This is a display-only rule and does not rewrite saved dates.
- v0.7.22: Adds the same compact Work Date (or Created Date fallback) to the right side of inline secondary records on the primary Working Memory screen. It is date-only to preserve title space.
- v0.7.23: Keeps Reports usable on a phone in landscape. The report overlay can scroll vertically on short screens, while wide Hours and MDS tables retain an independent horizontal swipe area for values at the right.
- v0.7.24: New secondary records now begin with Billing set to Reg. Existing secondary records retain their saved billing setting, including legacy untagged records.
- v0.7.25: Aligns B02 Saved Sites rows with the compact B01 Dropbox file format: bold site title, one Content updated line, and controls at the right. Saved-site actions and editing remain unchanged.
- v0.7.26: Compresses B02 Saved Sites rows by arranging the four existing action pills as a two-by-two grid at the right and tightening row spacing.
- v0.7.27: Makes B02's visible file information match B01's recognized Dropbox rows exactly: site title plus one Content updated line. The saved-site date and record/open/closed summary are not displayed in the normal B02 row.
- v0.7.28: Adds a six-dot drag grip at the left edge of movable B05 primary and secondary records. A record opens only by clicking its row; drag/reorder/move/blend begins from the labelled grip. Valid drop destinations retain the existing move highlight and explicit before/after insertion lines.
- v0.7.29: Narrows the secondary-to-primary promotion zone so iPhone drag events do not highlight the full Working Memory box when the six-dot grip is first selected. The full-panel dashed promotion target now appears only after the secondary is deliberately moved into the left primary-alignment edge.
- v0.7.19: Adds report date ordering with explicit oldest/newest choices. Primary records use their created date; secondary records use Work Date when present and otherwise their created date. Daily, Hours, and MDS reports default oldest-to-newest, Communication Activity defaults newest-to-oldest, and Open Items retains urgency priority by default. On-screen, print, copied text, selection lists, and Excel inputs share the same ordering.
- v0.7.18: Keeps the LIST DROPBOX JSON FILES desktop help text fully inside the B01 panel on hover/focus so the panel border no longer clips it. No Dropbox file, connection, import, delete, upload, report, record, contact, email, parser, or mobile behavior changes.
- v0.7.17: Compacts recognized Dropbox file rows to the bold site/file title with its freshness status pill and a single Content updated line. Removes the record counts, package, summary, source, upload, local-save, filename, and path lines from the normal listing while keeping Import/Delete controls aligned at the right on desktop and mobile. Warning rows retain diagnostic detail.
- v0.7.16: Excludes closed work from the MDS Billing Report at the shared row-selection source. A billing row is omitted when either its primary record or its secondary record is Closed, so closed labour and expense lines cannot appear in the MDS selector, on-screen report totals/detail, or MDS Excel export. Other reports are unchanged.
- v0.7.14: Email Activity is now a collapsed, expandable record list. Each entry identifies the originating primary record (and secondary record when applicable) and expands to show a preserved, readable preview of the actual email draft text. Email history remains site-specific and no email is sent automatically.
- v0.7.12: Makes the shaded backdrop behind the secondary-record editor inert. The editor can now be closed only with its explicit Close pill, preventing an accidental exit while reviewing or editing a secondary record.
- v0.7.09: Replaces the new-contact global All Site Contacts picker with a deliberate two-step copy flow: choose another saved source site, then choose a contact from that site. The selected person's details are copied into the new card only; neither site is linked or updated.
- v0.7.08: Contacts / Departments reordering now preserves the expanded/collapsed state of every title bar during the post-drop redraw. Moving title bar 1 can no longer cause title bar 2 (or any other group) to expand.
- v0.7.07: Contacts / Departments title strips now use the same light-blue background as primary Working Memory rows. Reordering a collapsed department/company no longer opens it on release: the dot-matrix grip suppresses the summary click and the card's existing open/collapsed state is restored after the order redraw.
- v0.7.06: Restores the established indigo Site Walk B01/B02/B04/B05 banner colours. Contacts / Departments groups now use a clear title strip, retain native collapse/expand, and can be deliberately reordered by their dot-matrix grip within their own department/company list. The same exclusive mobile gesture lock prevents background scrolling during that movement.
- v0.7.04: Fixes the new-contact prefill dropdown closing immediately on click. Only actual contact-management buttons now trigger the delegated action handler; clicking the native contact picker leaves its option list open until a person is chosen or the user dismisses it.
- v0.7.03: When adding a new blank contact to a site's Contacts / Departments setup, adds an “All Site Contacts” dropdown. Selecting a saved person prefills the new card with that person's name, email, phone, role, aliases, and active status. This is a copy only: the source contact and its saved site/department are never changed.
- v0.7.02: Removes the confusing deployment-contact import feature and its generic “Imported Project Contacts” staging group. Contacts are now managed only inside the relevant Saved Site. Adds a read-only All Site Contacts lookup that gathers saved contacts and their internal departments/external companies across every Saved Site on the device. No contacts are copied, moved, or edited by the lookup.
- v0.6.93: Refines the Site Walk B01/B02/B04/B05 controls to the established Ontario SSRHA banner pattern: a dot-matrix drag handle, Bxx template button, divider, title, collapsed-state summary, and chevron. Clicking the banner expands/collapses it; dragging only the grip reorders these four panels locally on the device. No site data, records, templates, reports, Dropbox, email activity, or MDS billing/export logic changes.
- v0.6.95: Makes the existing automatic on-device working-copy save explicit, removes the redundant manual Save in Browser footer action, and adds a clearly-confirmed Dropbox-only Replace Current Working Memory import choice. Dropbox remains an intentional, static project version until the user chooses Update Dropbox Site File.
- v0.6.98: Fixes the mobile fixed footer regression introduced by the desktop single-line status layout. The mobile status item no longer inherits the desktop 520px flex basis as its height, so it cannot cover the Site Walk panels on iPhone startup or rotation.
- v0.6.99: Makes Site Walk section relocation exclusive on touch devices. Holding a dot-matrix grip now captures the gesture and temporarily blocks page scrolling, pinch/gesture handling, text selection, and other panel controls until the move is released or cancelled. The Bxx configuration button and normal title-bar expand/collapse actions remain separate.
- v0.6.96: Restores the last active browser working copy automatically when the site is reopened. Adding or saving a secondary record writes its working copy immediately, rather than relying only on the short background-save delay.
- v0.6.92: Adds device-local, collapsible Site Walk sections for B01/B02/B04/B05. New layouts begin with administration panels B01 and B02 collapsed, while Record Intake (B04) and Working Memory (B05) remain open. The Bxx template buttons remain separate; compact collapsed summaries show the active site, saved-site count, intake cue, and open-record/subrecord load. No site JSON, record, parser, report, Dropbox, billing, or template data changes.
- v0.6.89: Adds a mutually exclusive CAD / USD checkbox choice beside Expense Amount. CAD is the default for existing and new expense lines. MDS review and Excel keep currencies separate rather than combining them.
- v0.6.88: Replaces the secondary Reg/OT checkbox pair with one always-visible Billing selector (None, Reg, OT, Expense). Expenses use the existing Work Date plus an amount and optional categorized type; the MDS workbook adds an Expenses Summary tab. Existing Reg/OT records remain compatible.
- v0.6.87: Adds an editable Work Date beside Hrs in the secondary-record editor. New secondary records prefill it with today; the MDS Billing Report uses this work date when supplied, while older records retain their existing creation-date reporting behavior. The MDS company name is shortened to ECR Inc. in the export.
- v0.6.86: Adds the separate MDS Billing Report and monthly Excel export. It uses only Reg/OT-tagged secondary-record hours, assigns each block to its recorded date, produces one Saturday–Friday MDS timesheet tab per covered week, and adds a hardcoded MDS monthly summary (Frank Sved / ECR Inc., project 1097, PO 17280). The normal Hours Report remains unchanged.
- v0.6.85: Hotfixes the Reg / OT secondary-record autosave. Selecting either checkbox now safely reads the current control state before committing, so the secondary editor remains usable and can be closed or changed normally.
- v0.6.84: Adds an optional mutually-exclusive Regular / Overtime checkbox pair beside Hrs in the secondary-record editor. The selection is stored per secondary record, survives save/import/export/Dropbox normalization, and does not alter the existing Hours Report or calculations.
- v0.6.82: Locally routes parsed and manual records through the active site's Communication Setup. Recommendations are individually unchecked; only selected drafts are created. Adds a site-specific on-screen Email Activity log. SiteScribe never sends mail.
- v0.6.80: Phase 2 Communication Setup. Adds a site-specific editor for internal departments, external companies, contacts, aliases, allowed intents, keywords, active state, and default contacts. Existing deployment contacts may be explicitly imported into the active site. Configuration validation is visible and all setup data remains embedded in the saved site package. No parser-routing, manual-record intent, email-draft, activity-log UI, report, Dropbox, or automatic-email behavior changes.
- v0.6.79: Communication Routing foundation. Adds per-site communicationConfig and emailActivityLog schema normalization, record/secondary intent preservation, and collision-safe activity-log append behavior. This foundation does not change parser recommendations, manual-entry UI, reports, Dropbox actions, or existing email-draft behaviour; no mail is sent automatically.
- v0.6.78: Adds genuine Excel export for the live Hours Report using the same selected records, Working Memory order, displayed fields, report-only zero-hour rule, and cumulative total. Renames the footer save action to Save in Browser and removes the volatile Export Current Memory footer control; saved-site Export remains available.
- v0.6.77: Renames the Dropbox panel heading to Manual Dropbox Backup / Import and removes the redundant non-interactive manual backup/import badge.
- v0.6.76: Moves Connect Dropbox beside the Dropbox connection/callback status pills, separating authorization from the file I/O action row. Preserves the existing button ID and connection logic.
- v0.6.75: Extends grouped primary/secondary checkbox selection to Daily Site and Open Items reports. Daily Site display/print follows Working Memory order; Open Items keeps its protected overdue/due-soon/upcoming priority sections and urgency sorting while applying the chosen record scope.
- v0.6.74: Hours Report screen and print output now follow the selection list order exactly: primary groups use current Working Memory order and their secondary rows use current displayed/manual order. Removes the conflicting Oldest/Newest printed-order control.
- v0.6.73: Adds a checkbox to every Hours Report primary heading. It selects or clears all matching secondary records within that primary and shows an indeterminate state when only some children are selected.
- v0.6.72aa: Removes the redundant Generate Report pill. Reports continue to rebuild immediately when report type, dates, categories, statuses, record selections, or printed order change; Print and Copy Text remain unchanged.
- v0.6.72z: Hours Report selects all matching secondary records by default and displays report-only 0 hours for entries with no recorded hours. Zero-hour rows remain in the report, do not change the cumulative total, and do not write zero back into record data.
- v0.6.72y: Hours Report selection now lists every matching secondary record, including records without hours. Hour-bearing records remain selected by default; no-hour records start unchecked and can be deliberately included with a blank hours value without affecting the total.
- v0.6.72x: Show More now expands every secondary record directly in Working Memory so hidden rows remain draggable/reorderable; Show Less collapses back to five. The Hours Report selection list no longer uses a short internal scroll area, keeping later primary groups visibly available.
- v0.6.72w: Adds Hours Report secondary-record selection grouped in Working Memory order, date-range filtering on each secondary record, Select All/Clear All controls, and oldest/newest printed order.
- v0.6.72v: Streamlines the Parse Notes overlay with compact Site/Date chips, a shorter auto-growing notes box, tighter actions and status spacing, and proposal/append controls that remain hidden until parsing returns records.
- v0.6.72u: Further compresses Add/Edit Secondary Record: two-line auto-growing observation entry, time and deliverable controls sharing one quick-entry row, shorter placeholder, reduced card/footer spacing, and removal of the redundant new-record footer label.
- v0.6.72t: Compresses the Primary Record summary at the top of the secondary-record screen into a dense description, inline metadata strip, compact status/actions, and conditional one-line deliverable control. Also tightens the detail header without removing information or behavior.
- v0.6.72s: Compacts the Add/Edit Secondary Record workflow: smaller auto-growing observation area, tighter time fields, a single-line conditional deliverable control, compact status/timestamps, and short state-aware actions while preserving all field IDs and save behavior.
- v0.6.72r: Repairs vertical secondary-record reordering in Working Memory. The first up/down drag within a primary switches only that primary's secondary list to persistent manual order, while left-promotion and drag/drop into another primary remain unchanged. Untouched primary records keep automatic date/deliverable sorting; closed secondary records remain at the bottom.
- v0.6.72p: Opening an open primary record now lands directly on the Add Secondary Record editor, scrolls that card into view, and places the cursor in the text box for immediate field-observation entry. Opening an existing secondary record still selects it for editing.
- v0.6.72o: Persists the Dropbox offline refresh authorization on the current device so iPhone/browser restarts can silently renew short-lived access tokens instead of reopening Dropbox login every session. Persistent authorization is cleared when Dropbox rejects or revokes it.
- v0.6.72n: Configures the public Dropbox App Key in the deployed client and removes the password-style App Key field that triggered iPhone password-manager prompts and unreliable per-browser key retention. Dropbox secrets and authorization tokens remain excluded from source.
- v0.6.72m: Makes secondary-record display order deterministic: open deliverable records first by urgency and due date, then other open records newest-to-oldest, followed by closed records newest-to-oldest. Legacy manual secondarySortOrder values no longer override date order.
- v0.6.72l: Verifies Dropbox authorization before file operations, automatically refreshes stored offline authorization when supported, and makes disconnected/reconnect-required states prominent in red instead of silently leaving stale file actions available.
- v0.6.72l: Shows a compact Hours: xx label immediately beside the OPEN/CLOSED badge on secondary-record banners when recorded hours exist. The existing detail time metadata keeps date and time range without duplicating the hours value.
- v0.6.72j: Reorganizes the record detail modal into distinct Primary Record, Source Text, Add/Edit Secondary Record, and Existing Secondary Records cards. Standardizes the remaining detail actions and empty/list labels on Secondary Record terminology without changing field IDs or behavior.
- v0.6.72i: Renames the primary detail Copy Main control to Copy Record and makes it copy the same complete formatted primary record, source, deliverable, flags, and secondary records as the Working Memory copy control.
- v0.6.72h: Replaces obsolete Updates / Comments wording in the primary detail editor with Secondary Records terminology, including its placeholder, locked-state instruction, and deliverable heading.
- v0.6.72g: Allows an open deliverable-dated primary record to be dragged into another open primary as a secondary update while preserving its deliverable date. Deliverable primaries remain locked against top-level reordering.
- v0.6.72f: Reorganizes B04 as Record Intake with clearly separated Parse Notes and Add One Manually sections. Migrates only the former default B04 title while preserving custom titles and all functional IDs.
- v0.6.72e: Renames the B04 AI intake launcher and overlay to Parse Notes, and makes Dropbox Connect visibly open/focus missing browser settings or report a blocked SDK instead of silently stopping. Transfer behavior is unchanged.
- v0.6.72d: Reuses the live Parser Lite proxy at /SiteScribe-Parser-Lite/server/parse.php, verified reachable with its existing server-side key. No new key or proxy deployment is required.
- v0.6.72c: Provisional SiteScribe-local proxy path; superseded after the existing Parser Lite deployment was identified.
- v0.6.72b: Attempted root proxy path repair; superseded after live testing confirmed /server292/parse.php returned the public website HTML.
- v0.6.72a: Add Data Shared Core Proof. Integrates SiteScribe Parser Core v1.0.1 behind a feature-flagged staging overlay, retains Add Manual Record, and commits only operator-included proposals through the existing protected append/dedupe path.
- v0.6.71c: Repairs OPEN IN EMAIL APP mailto encoding for eM Client. Query values now use strict percent encoding, spaces remain %20, literal plus signs remain %2B, and body line endings normalize to CRLF without double encoding.
- v0.6.71b: Secondary OPEN/CLOSED labels are now square-edged, non-action status badges. Pressing the badge follows the row click and opens the secondary record. Status changes moved into the selected secondary editor.
- v0.6.71a: Dropbox uploads now force and await a successful local save, then upload that exact current snapshot. Adds contentUpdatedAt/localSavedAt freshness metadata for Dropbox list verification.
- v0.6.68a: Dropbox Save Mode Repair branch. Built from the working v0.6.67 baseline after v0.6.68 failed. Restores the known-working Dropbox upload path and splits it into SAVE NEW BACKUP COPY and UPDATE DROPBOX SITE FILE while preserving protected import/export, Saved Sites, reports, and mobile entry behaviour.
- v0.6.63: Dropbox Login Cleanup branch. Adds visible Dropbox App Key and Redirect URI settings in the Dropbox panel and supports a dedicated unprotected callback page at /dropbox-callback.html to reduce mobile protected-folder re-login friction during OAuth. Keeps v0.6.62 selected-file Dropbox Pull Proof behavior. No automatic import, upload/delete/move, silent overwrite, two-way sync, record/report/Saved Sites/CONFIG/manual-entry behavior changes, or protected import/export workflow changes.
- v0.6.62: Dropbox Pull Proof branch. Adds safe selected-file Dropbox JSON download/import proof. Listed Dropbox JSON files now show an IMPORT pill; clicking it downloads the selected file, parses JSON, normalizes through the existing SiteScribe import bridge, and opens the existing import choice prompt: Create New Saved Site / Append To Current / Cancel. No automatic startup import, Dropbox upload/delete/move, silent overwrite, two-way sync, record/report/Saved Sites/CONFIG/manual-entry behavior changes, or protected import/export workflow changes.
- v0.6.61: Dropbox Sync Proof branch. Adds a compact Dropbox panel and isolated dropbox-sync-proof.js module for OAuth PKCE connection and read-only JSON listing from /incoming and /saved-sites. Proof only: no import, upload, IndexedDB overwrite, Saved Sites mutation, report changes, record changes, Parser compatibility changes, or protected import/export workflow changes.
- v0.6.60: Mobile Hours Detail table swipe fix. Keeps the Hours Report as a table, preserves v0.6.59 modal fit, and strengthens horizontal scroll/touch behavior on mobile so right-side columns can be reached without squeezing/wrapping. No report content, print/PDF, import/export, Saved Sites, CONFIG, or deliverable behavior changes.
- v0.6.59: Hours Report table/modal fit. Keeps the Hours Report as a table, widens the report modal, and keeps wide tables inside an internal horizontal scroll area.
- v0.6.52: Report date defaults now set the To Date to today instead of the latest record date. Manual date edits are still allowed. No import/export, Saved Sites, CONFIG, or deliverable behavior changes.
- v0.6.51: Hours Report now shows the detailed Hours Detail table first and places a cumulative total after the list. Daily Totals and Hours by Category summary sections are removed from the Hours Report. No import/export, Saved Sites, CONFIG, deliverable, or print-orientation behavior changes.
- v0.6.44: Merged v0.6.43 Report Polish report output into the current v0.6.44 closed-secondary DELETE build.
- v0.6.44: Added a red DELETE pill beside REOPEN for closed secondary/update records in the detail panel. Delete requires confirmation and is only available for closed secondary records while the parent primary is open. No schema/import/export behavior changes.
- v0.6.43: Fixed secondary/update OPEN pill behavior in the detail panel so tapping OPEN selects/loads the update for editing, matching the body click behavior. No schema/import/export behavior changes.
- v0.6.42: Closed secondary/update rows now use a smaller lighter font treatment even when their primary remains open. No schema/import/export behavior changes.
- v0.6.42: Added deliverable date schema/UI, priority squares, report inclusion, and Working Memory deliverable priority grouping while preserving closed-record override.
- v0.6.40: Mobile secondary Start/End time fields now use native time inputs so iPhone allows structured HH:MM time entry. No workflow changes.
- v0.6.39: Release-candidate audit pass. No feature changes; validation/package/docs metadata only.
- v0.6.38: Conservative CSS orphan cleanup only. No JavaScript behavior change; version metadata updated for the CSS-cleanup source.
- v0.6.36: Removed stale cached DOM IDs and obsolete guarded event hooks for removed controls (configButton and saveActiveMemoryNameButton). No CSS or workflow changes.
- v0.6.35: Stage 3 stabilization cleanup only. Removed confirmed dead JavaScript functions and one remaining superseded duplicate CONFIG save handler; no CSS cleanup or feature changes.
- v0.6.34b: Report date filters now reset when the active saved site/report scope changes, preventing stale date ranges from another saved site from showing “No records match the selected filters.”
- v0.6.34: Stabilization cleanup only. Removed superseded duplicate JavaScript function definitions while preserving current behavior; no CSS cleanup or feature changes.

- v0.6.19: Removed redundant Main Record status meta line because OPEN/CLOSED pills already show the state on desktop and mobile.
- v0.6.18: Mobile Working Memory primary rows hide category text to save horizontal space; desktop category display is unchanged.
- v0.6.17: Saved Sites metadata display shortened for mobile: keep file/site description, show only last edited date/time plus record counts.
- v0.6.16: Verified and removed all reversible secondary/update drag confirmations: update-to-primary-target and hard-left promote-to-primary both complete immediately without confirm prompts.
- v0.6.15: Removed secondary/update move and promote confirmation prompts.
- v0.6.14: Primary-record drag/drop onto another primary now moves the record under the receiver immediately, without a confirmation prompt. The move remains non-terminal and can be undone by promoting/moving the update back.
- v0.6.13: Template version numbers now increment only when template content actually changes. Opening CONFIG, closing CONFIG, applying a template, or Save/Export/Email with unchanged CONFIG no longer bumps templateVersion.
- v0.6.11: Removed redundant selected/editing template summary pills from CONFIG; template rows now carry per-template version text directly beside the template name in smaller font.

- Added editable Record Flag resolution/answer text.
- CLARIFY and INCOMPLETE flags can now store a resolution, be saved, and be resolved/closed from the flag itself.
- Bulk Clear Saved Sites has been removed from the normal workflow; single saved-site Delete remains available.
- Preserved protected JSON import: drag/drop and file picker share importJsonFile().
- Working Memory displays open records before closed records within each date.
- Added Email JSON pill for sharing/exporting the current reviewed JSON state between devices.
- v0.5.4: Updates now display open items before closed items.
- v0.5.5: One active working memory; JSON imports ask whether to append, open separately, or cancel.
- v0.5.6: User-facing language and compressed one-line Working Memory records.
- v0.5.7: Working Memory shows compact indented update rows under each main record.
- v0.5.8: Inline update display is limited to 5 updates per main record, then shows more...
- v0.5.9: Detail-panel update records use the same compressed one-line row presentation as Working Memory.
- v0.5.14: Simplified Add Manual Record placeholder to a compact comma-separated category list and reduced the entry box height.
- v0.5.15: Manual entry parser recognizes the first word as the category cue with optional trailing punctuation.
- v0.5.17: Closed flags no longer use a separate divider; they remain in the same compact flag list, lighter and sorted to the end.
- v0.5.19: Record flag rows now use the same light-blue compact-row background and closed treatment as secondary/update rows.
- v0.5.18: Primary records, secondary/update records, and flags now render through one shared compact-row presentation helper.
- v0.5.20: Added parent/child record linking by unique record ID, with linked-record rows in the detail panel.
- v0.5.21: Removed record-linking UI and added drag/drop housekeeping: drop one record onto another primary record to convert it into an update under the receiver.
- v0.5.22: Drag an inline secondary/update left into primary alignment to promote it back to a top-level primary record.
- v0.5.23: Drag-edge auto-scroll scrolls the page when dragging records near the top or bottom of the window.
- v0.5.24: Working Memory supports manual drag ordering plus Sort Newest/Sort Oldest pills. Promoted updates land at the drop position.
- v0.5.25: Closed primary records always render at the bottom of Working Memory after all open records, even in manual order.
- v0.5.26: Closed primary records are locked. Reopen the record before editing updates, resolving flags, drag/drop housekeeping, or other record mutation.
- v0.5.27: Drag/drop housekeeping stays in Working Memory list view and does not open the detail/edit panel after moves.
- v0.5.28: Imported JSON packages temporarily auto-saved to Saved Sites; superseded by v0.5.29 manual-save behavior.
- v0.5.29: Removed import auto-save. Opening a saved site now hard-switches Working Memory to the clicked package. Imported JSON stays active until the user explicitly saves it.
- v0.5.29: Opening a package from Saved Sites now force-replaces the active working memory and re-renders from the selected saved package.
- v0.5.31: Added editable Site / Memory Name field. Applied names are written into currentPackage.site and preserved by Save, Export, and Email JSON.
- v0.5.32: Restored the visible Site / Memory Name editor in index.html so the existing site-name logic is reachable.
- v0.5.33: Loading/opening JSON with site missing/not stated force-clears the Site / Memory Name field instead of retaining the previous name.
- v0.5.34: Hard-synchronizes the Site / Memory Name field after every active-memory switch so iOS/Safari cannot retain the previous saved site name.
- v0.5.35: Adds an iOS/Safari delayed hard-clear for unnamed JSON imports so the Site / Memory Name field cannot retain the previous saved site name after file-picker restore.
- v0.5.36: Primary row body toggles inline secondary/update visibility; status pill opens the primary record detail. Collapsed records show a small disclosure indicator.
- v0.5.37: Compacts the import panel into one Load JSON drop/click control while preserving drag/drop and file-picker import.
- v0.5.38: Makes compact Load JSON use a native label/file-input path for iOS reliability; selecting a JSON imports immediately.
- v0.5.39: Adds Create New Site to clear only Active Working Memory while preserving Saved Sites.
- v0.5.40: After adding or saving an update, the detail panel stays open, the update editor clears, and the record is ready for another secondary item.
- v0.5.41: Moves New Blank Site to the Active Working Memory header so it is clearly a workspace reset action, separate from Apply Site Name.
- v0.5.16: Detail-panel record flags display as compact one-line expandable rows.
- v0.5.42: Moved Active Working Memory above Add Manual Record so the active site is confirmed before adding records.
- v0.5.45: Restored Active Working Memory above Add Manual Record while preserving v0.5.43/v0.5.44 flag fixes.
- v0.5.46: Added iOS/mobile row containment CSS so record metadata and OPEN/CLOSED pills stay inside primary and secondary record boxes.
- v0.5.47: Closed primary records default to collapsed secondary/update rows and use a slightly smaller closed-row font treatment in Working Memory.
- v0.5.48: Closed primary records use a stronger compact font/spacing treatment so they visibly stand apart from open records.
- v0.5.49: Added Working Memory Show/Hide Closed toggle.
- v0.5.50: Secondary/update rows use compact single-line layout with right-aligned status pill; clicking secondary status pill opens the update for editing.
- v0.5.59: Fixed mobile primary OPEN/CLOSED pill click target when rendered inside the two-line title/tail layout.

- v0.5.69: Mobile/detail-panel secondary update status controls are subdued status indicators; OPEN uses light blue and CLOSED uses light grey, while Record Flag status controls keep original blue/grey styling.
- v0.5.70: Detail-panel secondary/update OPEN/CLOSED status controls apply consistently on all screen sizes.
- v0.5.71: Cleaned obsolete v0.5.69 mobile-only CSS attempt; single source of truth remains the v0.5.70/v0.5.71 detail-update styling.
- v0.5.72: Working Memory inline secondary/update rows no longer render selected highlighting behind the detail panel. Detail-panel update selection highlighting remains intact.
- v0.5.73: Added optional Start / End / Hrs fields to secondary/update records only, with calculated total hours and compact mobile display.
- v0.5.74: Added commit-based background autosave to local storage after meaningful record, update, flag, site-name, status, and drag/drop changes.
- v0.5.77: Hardened selected secondary/update field commits so edited text/start/end/hours save when leaving fields, switching updates, or closing the detail panel.
- v0.5.78: Fixed mobile update time-entry layout and changed mobile update row metadata to show date plus total hours without created time.
- v0.5.79: Changed update time inputs to compact 24-hour text pills so Start, End, and Hrs fit on one horizontal mobile line without overlap.
- v0.5.80: Added report-only workflow: Reports pill, date/category/status filters, Daily Site Report, Open Items Report, and Hours Report.
- v0.5.81: Standardized primary/secondary record timestamps with updatedAt and closedAt while preserving compact Working Memory display.
- v0.5.82: Record/report display dates now prefer each record's createdAt date instead of today/source-date fallbacks.
- v0.5.98: Fixed B-box CONFIG click targets by making B01/B02/B04/B05 real clickable buttons and wiring them to focused box config editors.
- v0.5.88-v0.5.90: Added CONFIG title editor with B01-B05 uiConfig support; active site files use their own uiConfig, while no-open-site edits update the default template used by New Blank Site.
- v0.5.91: Added legacy JSON uiConfig migration-on-open: if a site JSON has no uiConfig, copy the current default template uiConfig into the active site memory, mark it dirty, and preserve it on the next Save/Export/Email.
- v0.5.92: CONFIG title edits are committed before Save to Local Storage, Export Current Memory, and Email Current Memory, so typed title changes persist even if Apply was not clicked first.
- v0.5.95: Saved Sites list stays collapsed after New Blank Site creation or OPEN; row click still expands title/date editor.

- v0.5.99: Preserved Saved Sites row expand/collapse state when manual records, autosave, Save, Export, or Email refresh the Saved Sites list. Saving no longer forces the active B02 row open.
- v0.6.00: Reworked CONFIG into a template manager. Removed the standalone CONFIG pill, added template list/create/edit/apply/save workflow, and added site templateId support with legacy sites defaulting to the Default template.
- v0.6.01: Fixed template persistence/selection. Template libraries now travel with saved/exported site JSON, imported site template libraries merge into local template storage, and only the chosen template receives the blue selected highlight.
- v0.6.02: Fixed legacy site switching so no-template/legacy JSON always resets to Default and clears stale selected template state from the previously edited template.
- v0.6.03: Hardened site-file load template reset: every imported/opened site starts from Default, then applies only an explicit templateId from that site. uiConfig alone no longer carries a prior template into legacy files.
- v0.6.10: Template manager list now displays each individual template version on its own row, because each template may have a different version number.
- v0.6.20: Saved Sites supports manual drag reordering with no nesting; order is persisted with savedSiteOrder.
- v0.6.21: Fix duplicate JSON overwrite so the overwritten import becomes the visible Active Working Memory immediately.
- v0.6.22: Prioritize replacing the currently open saved site during JSON import when a separate duplicate saved site also exists.
- v0.6.23: Replace Open Site preserves the open saved site name instead of renaming it to the incoming JSON site name.
- v0.6.25: Restores the import choice prompt whenever a saved site is open; Replace Open Site still preserves the open saved-site name.
- v0.6.26: Fixes import prompt regression caused by missing firstStatedSiteName helper and hardens active saved-site detection before import.
- v0.6.28: Saved Sites can be merged by dragging one saved site into the middle of another saved site row. The receiving site keeps its name; source records are appended and the source saved-site row is removed after confirmation.
- v0.6.30: On mobile/coarse-pointer devices, manual primary record creation no longer forces focus back into the entry box, avoiding the iOS keyboard checkmark interruption. Desktop keeps automatic refocus.
- v0.6.31: Removes the bulk Clear Saved Sites control from the normal Saved Sites workflow. Single saved-site delete remains available.
- v0.6.32: Removes the B01 Load Sample control from the normal import workflow. JSON file loading and reports remain.
- v0.6.33: Fixes v0.6.32 regression by removing the accidentally reintroduced visible Clear Saved Sites button from B02. Single-site Delete remains available.
- v0.6.29: Manual primary record creation now stays in entry mode. The new record appears in Working Memory without forcing the detail panel open.
- v0.6.27: Simplifies Load JSON workflow. Import choices are now only Create New Saved Site, Append To Current, and Cancel. Overwrite/replace/matching-site paths are removed.
- v0.6.24: Hard-fixes Replace Open Site so the active saved-site display name is preserved in record metadata, package data, and the visible active memory after overwrite.
*/
const APP_VERSION = "v0.8.13";
const SITE_WALK_LAYOUT_STORAGE_KEY = "sitescribe_site_walk_layout_v1";
const SITE_WALK_ORDER_STORAGE_KEY = "sitescribe_site_walk_order_v1";
const ACTIVE_WORKING_COPY_STORAGE_KEY = "sitescribe_active_working_copy_v1";
const SITE_WALK_DEFAULT_COLLAPSED = { siteWalkB01: true, siteWalkB02: true, siteWalkB04: false, siteWalkB05: false };
const DB_NAME = "sitescribe_review_console_db";
const DB_VERSION = 1;
const STORE_NAME = "packages";

const DEFAULT_UI_CONFIG = {
  titles: {
    B01: "Bring In Site Notes",
    B02: "Saved Sites",
    B04: "Record Intake",
    B05: "Working Memory"
  },
  subtitles: {
    B01: "Ready. Drag a JSON file onto Load JSON or anywhere on the page.",
    B04: "Enter one record directly. Categories: event, action, followup, scheduled, safety, communication, document.",
    B05: "Load a JSON package or create a record to begin."
  },
  pills: {
    B01: { loadJson: "Load JSON", reports: "Reports" },
    B02: { refresh: "Refresh", newBlank: "New Blank Site" },
    B04: { addRecord: "Add Record" },
    B05: { sortNewest: "Sort Newest", sortOldest: "Sort Oldest", hideClosed: "Hide Closed", showClosed: "Show Closed" },
    footer: { email: "Email Current Memory" }
  }
};
const DEFAULT_TEMPLATE_STORAGE_KEY = "sitescribe_default_ui_config";

let db = null;
let dbAvailable = false;
let currentPackageRecord = null;
let activeSiteFileOpen = false;
let selectedArchivePackageId = null;
let currentPackage = createEmptyPackage();
let selectedRecordId = null;
let selectedCommentId = null;
let selectedActivityId = null;
let newActivityParentId = null;
let selectedFlagId = null;
let dirty = false;
let workingMemoryDragPayload = null;
let workingMemoryAutoScrollFrame = null;
let workingMemoryAutoScrollSpeed = 0;
let workingMemoryDropIntent = null;
let savedSitesDragPackageId = null;
let savedSitesDropIntent = null;
let savedSitesSuppressClickUntil = 0;
let autoSaveTimer = null;
let autoSaveInProgress = false;
let autoSaveQueued = false;
let configDraftDirty = false;
let reportFilterScopeKey = "";
let reportSelectionScopeKey = "";
let reportSelectedKeys = new Set();
let reportSelectionInitialized = false;
let expandedInlineSecondaryRecordIds = new Set();
let communicationSetupDraft = null;
let communicationSetupDirty = false;
let communicationSetupSaveInProgress = false;
let allSiteContacts = [];
let contactPrefillSources = [];
let contactPrefillSelections = new Map();

const DEFAULT_INTENT_CATALOG = [
  ["documentation_internal", "Documentation / Internal Record"], ["information_notice", "Information / General Notice"],
  ["planning_scheduling", "Planning / Scheduling"], ["action_required", "Action Required"],
  ["safety_notification", "Safety Notification"], ["incident_notification", "Incident / Near-Miss Notification"],
  ["trade_coordination", "Coordination With Trades"], ["document_request", "Document Request"],
  ["approval_decision", "Approval / Decision Required"], ["engineering_review", "Engineering / Technical Review"],
  ["lift_planning", "Lift Planning"], ["cost_billing", "Cost / Billing"], ["follow_up", "Follow-up"], ["other", "Other — User Defined"]
].map(([id, label]) => ({ id, label, active: true }));


const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  els.appVersion.textContent = APP_VERSION;
  initializeSiteWalkPanels();
  renderManualIntentOptions();
  bindEvents();
  installDropProtection();
  initDatabase().then(async () => {
    await refreshArchive();
    const restored = await restoreActiveWorkingCopy();
    render();
    applyUiConfigToScreen();
    if (!restored) setStatus("Ready.");
  });
}

function readActiveWorkingCopyId() {
  try {
    return String(localStorage.getItem(ACTIVE_WORKING_COPY_STORAGE_KEY) || "").trim();
  } catch (error) {
    return "";
  }
}

function rememberActiveWorkingCopy(recordId) {
  if (!recordId) return;
  try {
    localStorage.setItem(ACTIVE_WORKING_COPY_STORAGE_KEY, String(recordId));
  } catch (error) {
    // The current session remains usable if the small restore pointer cannot be stored.
  }
}

function forgetActiveWorkingCopy() {
  try {
    localStorage.removeItem(ACTIVE_WORKING_COPY_STORAGE_KEY);
  } catch (error) {
    // Nothing else is required when browser settings prevent localStorage access.
  }
}

async function restoreActiveWorkingCopy() {
  if (!dbAvailable) return false;
  const recordId = readActiveWorkingCopyId();
  if (!recordId) return false;
  try {
    const record = await getPackageFromDb(recordId);
    if (!record || !record.data) {
      forgetActiveWorkingCopy();
      return false;
    }
    openSavedPackageAsActive(record, { restoring: true });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function readSiteWalkLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(SITE_WALK_LAYOUT_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

function saveSiteWalkLayout(layout) {
  try {
    localStorage.setItem(SITE_WALK_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    // The layout remains usable for this visit even if browser storage is unavailable.
  }
}

function siteWalkPanelLabel(panelId) {
  return ({ siteWalkB01: "Bring In Site Notes", siteWalkB02: "Saved Sites", siteWalkB04: "Record Intake", siteWalkB05: "Working Memory" })[panelId] || "section";
}

function setSiteWalkPanelCollapsed(panelId, collapsed, options = {}) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const isCollapsed = !!collapsed;
  panel.classList.toggle("is-collapsed", isCollapsed);
  const header = panel.querySelector(".site-walk-header");
  if (header) {
    const label = siteWalkPanelLabel(panelId);
    header.setAttribute("aria-expanded", String(!isCollapsed));
    header.title = `${isCollapsed ? "Expand" : "Collapse"} ${label}`;
  }
  if (!options.skipSave) {
    const layout = readSiteWalkLayout();
    layout[panelId] = isCollapsed;
    saveSiteWalkLayout(layout);
  }
}

function initializeSiteWalkPanels() {
  restoreSiteWalkPanelOrder();
  const layout = readSiteWalkLayout();
  Object.keys(SITE_WALK_DEFAULT_COLLAPSED).forEach(panelId => {
    const collapsed = Object.prototype.hasOwnProperty.call(layout, panelId) ? !!layout[panelId] : SITE_WALK_DEFAULT_COLLAPSED[panelId];
    setSiteWalkPanelCollapsed(panelId, collapsed, { skipSave: true });
  });
  updateSiteWalkSummaries();
}

function siteWalkPanelIds() { return ["siteWalkB01", "siteWalkB02", "siteWalkB04", "siteWalkB05"]; }

function restoreSiteWalkPanelOrder() {
  const shell = document.querySelector("main.shell");
  if (!shell) return;
  try {
    const saved = JSON.parse(localStorage.getItem(SITE_WALK_ORDER_STORAGE_KEY) || "[]");
    const valid = siteWalkPanelIds();
    const order = Array.isArray(saved) ? saved.filter(id => valid.includes(id)) : [];
    valid.forEach(id => { if (!order.includes(id)) order.push(id); });
    order.forEach(id => { const panel = document.getElementById(id); if (panel) shell.appendChild(panel); });
  } catch (error) { /* Default source order remains in use. */ }
}

function enableSiteWalkPanelDrag(panel, header) {
  const grip = header.querySelector(".site-walk-drag-grip");
  if (!grip || grip.dataset.dragBound === "1") return;
  grip.dataset.dragBound = "1";
  let state = null;
  const acquireGestureLock = () => {
    // Pointer capture keeps this grip receiving the pointer. These capture-phase
    // listeners additionally stop iOS from treating the same hold/move as a page
    // scroll, pinch, or background interaction.
    const preventPageGesture = event => event.preventDefault();
    document.documentElement.classList.add("site-walk-reorder-active");
    document.addEventListener("touchmove", preventPageGesture, { capture: true, passive: false });
    document.addEventListener("gesturestart", preventPageGesture, { capture: true, passive: false });
    return () => {
      document.removeEventListener("touchmove", preventPageGesture, { capture: true });
      document.removeEventListener("gesturestart", preventPageGesture, { capture: true });
      document.documentElement.classList.remove("site-walk-reorder-active");
    };
  };
  const cleanup = () => { if (!state) return; state.releaseGestureLock?.(); state.ghost?.remove(); state.line?.remove(); panel.classList.remove("drag-source"); try { grip.releasePointerCapture(state.pointerId); } catch (error) {} state = null; };
  grip.addEventListener("pointerdown", event => { if (event.button !== undefined && event.button !== 0) return; state = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false, ghost: null, line: null, releaseGestureLock: acquireGestureLock() }; grip.setPointerCapture(event.pointerId); event.preventDefault(); event.stopPropagation(); });
  grip.addEventListener("pointermove", event => {
    if (!state || event.pointerId !== state.pointerId) return;
    if (!state.dragging && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < 8) return;
    if (!state.dragging) { state.dragging = true; panel.classList.add("drag-source"); state.ghost = document.createElement("div"); state.ghost.className = "site-walk-drag-ghost"; state.ghost.textContent = `${panel.querySelector(".box-id")?.textContent || ""}  ${panel.querySelector("h2")?.textContent || ""}`; state.line = document.createElement("div"); state.line.className = "site-walk-drop-line"; document.body.appendChild(state.ghost); }
    state.ghost.style.left = `${Math.max(8, Math.min(event.clientX + 12, window.innerWidth - state.ghost.offsetWidth - 8))}px`;
    state.ghost.style.top = `${Math.max(8, Math.min(event.clientY + 12, window.innerHeight - state.ghost.offsetHeight - 8))}px`;
    const shell = document.querySelector("main.shell"); const panels = siteWalkPanelIds().map(id => document.getElementById(id)).filter(candidate => candidate && candidate !== panel);
    const before = panels.find(candidate => event.clientY < candidate.getBoundingClientRect().top + candidate.getBoundingClientRect().height / 2);
    if (before) shell.insertBefore(state.line, before); else shell.appendChild(state.line);
    event.preventDefault();
  });
  const finish = event => { if (!state || event.pointerId !== state.pointerId) return; if (state.dragging && state.line?.parentNode) { state.line.parentNode.insertBefore(panel, state.line); localStorage.setItem(SITE_WALK_ORDER_STORAGE_KEY, JSON.stringify(siteWalkPanelIds().filter(id => document.getElementById(id)).sort((a, b) => [...document.querySelector("main.shell").children].indexOf(document.getElementById(a)) - [...document.querySelector("main.shell").children].indexOf(document.getElementById(b))))); } cleanup(); event.preventDefault(); event.stopPropagation(); };
  grip.addEventListener("pointerup", finish); grip.addEventListener("pointercancel", cleanup); grip.addEventListener("lostpointercapture", cleanup);
}

function toggleSiteWalkPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  setSiteWalkPanelCollapsed(panelId, !panel.classList.contains("is-collapsed"));
}

function updateSiteWalkSummary(panelId, text) {
  const summary = document.querySelector(`[data-panel-summary="${panelId}"]`);
  if (summary) summary.textContent = text;
}

function updateSiteWalkSummaries() {
  const records = Array.isArray(currentPackage?.records) ? currentPackage.records : [];
  const openRecordCount = records.filter(record => normalizeLegacyStatus(record.status) !== "closed").length;
  const secondaryCount = records.reduce((total, record) => total + (Array.isArray(record.comments) ? record.comments.length : 0), 0);
  const savedCount = els.localArchive ? els.localArchive.querySelectorAll(".archive-item").length : 0;
  const site = String(currentPackage?.site || "No active site").trim() || "No active site";
  updateSiteWalkSummary("siteWalkB01", `Site: ${site}`);
  updateSiteWalkSummary("siteWalkB02", `${savedCount} saved ${savedCount === 1 ? "site" : "sites"} on this device`);
  updateSiteWalkSummary("siteWalkB04", "Open the note parser or add one record manually.");
  updateSiteWalkSummary("siteWalkB05", `${openRecordCount} open ${openRecordCount === 1 ? "record" : "records"} · ${secondaryCount} ${secondaryCount === 1 ? "subrecord" : "subrecords"}`);
}

function getCurrentSiteContacts() {
  const config = normalizeCommunicationConfig(currentPackage?.communicationConfig);
  return [...config.internalDepartments, ...config.externalCompanies].flatMap(group =>
    (group.contacts || []).map(contact => ({
      ...structuredCloneSafe(contact),
      company: contact.company || (group.type === "company" ? group.name : ""),
      department: group.type === "department" ? group.name : ""
    }))
  );
}

function getCurrentSiteContact(contactId) {
  return getCurrentSiteContacts().find(contact => contact.id === contactId) || null;
}

function cacheElements() {
  const ids = [
    "appVersion", "mainEntry", "mainEntryIntent", "addMainButton", "entryHint", "emailJsonButton",
    "jsonFile", "dropZone", "statusLine", "refreshArchiveButton",
    "localArchive", "activeMemorySummary", "activeMemorySiteInput", "createNewSiteButton", "sortNewestButton", "sortOldestButton", "toggleClosedButton", "recordsRoot", "detailPanel", "detail-title", "detailContent", "closeDetailButton", "reportsButton", "communicationSetupButton", "communicationSetupPanel", "closeCommunicationSetupButton", "communicationSetupSite", "communicationSetupWarnings", "communicationSetupFields", "allSiteContactsButton", "allSiteContactsPanel", "closeAllSiteContactsButton", "allSiteContactsSearch", "allSiteContactsSummary", "allSiteContactsList", "addInternalDepartmentButton", "addExternalCompanyButton", "saveCommunicationSetupButton", "configPanel", "closeConfigButton", "configFields", "applyConfigButton", "restoreConfigDefaultsButton", "saveConfigToSiteButton", "reportsPanel", "closeReportsButton", "reportType", "aiReportMode", "customAiReportPrototype", "reportFromDate", "reportToDate", "reportSortOrder", "reportStatusOpen", "reportStatusClosed", "printReportButton", "copyReportButton", "exportHoursExcelButton", "exportMdsExcelButton", "hoursRecordSelector", "hoursRecordSelectorTitle", "hoursRecordSelectorSite", "hoursRecordSelectionList", "selectAllHoursButton", "clearHoursButton", "reportOutput", "toast"
  ];
  ids.forEach(id => els[id] = document.getElementById(id));
  ["communicationActivityButton", "communicationActivityPanel", "closeCommunicationActivityButton", "clearCommunicationActivityButton", "communicationActivitySite", "communicationActivityLog"].forEach(id => els[id] = document.getElementById(id));
}

function bindEvents() {
  els.jsonFile.addEventListener("change", event => {
    const file = event.target.files && event.target.files[0];
    if (file) importJsonFile(file);
    event.target.value = "";
  });

  els.dropZone.addEventListener("click", event => {
    // v0.5.38: when dropZone is a <label for="jsonFile">, the browser/iOS opens
    // the native file picker itself. Do not also call input.click(), because double
    // activation can open Files without reliably firing the selected-file change event.
    if (els.dropZone.tagName && els.dropZone.tagName.toLowerCase() === "label") return;
    els.jsonFile.click();
  });
  els.dropZone.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      els.jsonFile.click();
    }
  });

  if (els.createNewSiteButton) els.createNewSiteButton.addEventListener("click", createNewSite);
  els.addMainButton.addEventListener("click", addMainRecordFromInput);
  els.mainEntry.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") addMainRecordFromInput();
  });

  els.recordsRoot.addEventListener("click", event => {
    if (event.target.closest(".record-drag-grip")) {
      event.preventDefault();
      return;
    }
    const branchToggle = event.target.closest("[data-action='toggle-primary-children']");
    if (branchToggle) {
      event.preventDefault();
      const recordId = branchToggle.dataset.recordId || branchToggle.closest(".record-line")?.dataset.recordId;
      if (recordId) toggleSecondaryDisplay(recordId);
      return;
    }
    const activityToggle = event.target.closest("[data-action='toggle-secondary-activities']");
    if (activityToggle) {
      event.preventDefault();
      const recordId = activityToggle.dataset.recordId;
      const commentId = activityToggle.dataset.commentId;
      if (recordId && commentId) toggleCommentActivityDisplay(recordId, commentId);
      return;
    }
    const activityRow = event.target.closest(".activity-record-line");
    if (activityRow && activityRow.dataset.recordId && activityRow.dataset.commentId && activityRow.dataset.activityId) {
      selectedRecordId = activityRow.dataset.recordId;
      selectedCommentId = activityRow.dataset.commentId;
      selectedActivityId = activityRow.dataset.activityId;
      newActivityParentId = null;
      selectedFlagId = null;
      renderDetail();
      return;
    }
    const secondaryRow = event.target.closest(".secondary-record-line");
    if (secondaryRow && secondaryRow.dataset.recordId && secondaryRow.dataset.commentId) {
      const explicitOpen = event.target.closest("[data-action='open-secondary']");
      selectedRecordId = secondaryRow.dataset.recordId;
      selectedCommentId = secondaryRow.dataset.commentId;
      selectedActivityId = null;
      newActivityParentId = null;
      selectedFlagId = null;
      if (explicitOpen) renderDetail();
      else toggleCommentActivityDisplay(secondaryRow.dataset.recordId, secondaryRow.dataset.commentId);
      return;
    }

    const moreRow = event.target.closest(".secondary-more-line");
    if (moreRow && moreRow.dataset.recordId) {
      setInlineSecondaryExpansion(moreRow.dataset.recordId, moreRow.dataset.secondaryListAction !== "collapse");
      return;
    }

    const row = event.target.closest(".record-line");
    if (row && row.dataset.recordId) {
      const explicitCopy = event.target.closest("[data-action='copy-primary']");
      const explicitOpen = event.target.closest("[data-action='open-primary']");
      selectedRecordId = row.dataset.recordId;
      selectedCommentId = null;
      selectedActivityId = null;
      newActivityParentId = null;
      selectedFlagId = null;
      if (explicitCopy) {
        const record = getSelectedRecord();
        if (record) copyText(formatPrimaryRecordForClipboard(record));
        return;
      }
      if (explicitOpen) {
        renderDetail();
        return;
      }
      toggleSecondaryDisplay(row.dataset.recordId);
    }
  });

  els.recordsRoot.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("[data-action='toggle-primary-children']")) return;
    if (event.target.closest("[data-action='toggle-secondary-activities']")) return;
    const explicitPrimaryOpen = event.target.closest("[data-action='open-primary']");
    if (explicitPrimaryOpen) {
      const row = explicitPrimaryOpen.closest(".record-line");
      if (!row?.dataset.recordId) return;
      event.preventDefault();
      selectedRecordId = row.dataset.recordId;
      selectedCommentId = null;
      selectedActivityId = null;
      newActivityParentId = null;
      selectedFlagId = null;
      renderDetail();
      return;
    }
    const explicitSecondaryOpen = event.target.closest("[data-action='open-secondary']");
    if (explicitSecondaryOpen) {
      const row = explicitSecondaryOpen.closest(".secondary-record-line");
      if (!row?.dataset.recordId || !row.dataset.commentId) return;
      event.preventDefault();
      selectedRecordId = row.dataset.recordId;
      selectedCommentId = row.dataset.commentId;
      selectedActivityId = null;
      newActivityParentId = null;
      selectedFlagId = null;
      renderDetail();
      return;
    }
    const moreRow = event.target.closest(".secondary-more-line");
    if (moreRow && moreRow.dataset.recordId) {
      event.preventDefault();
      setInlineSecondaryExpansion(moreRow.dataset.recordId, moreRow.dataset.secondaryListAction !== "collapse");
      return;
    }
    const activityRow = event.target.closest(".activity-record-line");
    if (activityRow && activityRow.dataset.recordId && activityRow.dataset.commentId && activityRow.dataset.activityId) {
      event.preventDefault();
      selectedRecordId = activityRow.dataset.recordId;
      selectedCommentId = activityRow.dataset.commentId;
      selectedActivityId = activityRow.dataset.activityId;
      newActivityParentId = null;
      selectedFlagId = null;
      renderDetail();
      return;
    }
    const secondaryRow = event.target.closest(".secondary-record-line");
    if (secondaryRow && secondaryRow.dataset.recordId && secondaryRow.dataset.commentId) {
      event.preventDefault();
      toggleCommentActivityDisplay(secondaryRow.dataset.recordId, secondaryRow.dataset.commentId);
      return;
    }
    const primaryRow = event.target.closest(".record-line");
    if (!primaryRow || primaryRow !== event.target || !primaryRow.dataset.recordId) return;
    event.preventDefault();
    toggleSecondaryDisplay(primaryRow.dataset.recordId);
  });

  if (els.sortNewestButton) els.sortNewestButton.addEventListener("click", () => sortWorkingMemory("date_desc"));
  if (els.sortOldestButton) els.sortOldestButton.addEventListener("click", () => sortWorkingMemory("date_asc"));
  if (els.toggleClosedButton) els.toggleClosedButton.addEventListener("click", toggleClosedRecordsVisibility);

  els.recordsRoot.addEventListener("dragstart", handleWorkingMemoryDragStart);
  els.recordsRoot.addEventListener("dragover", handleWorkingMemoryDragOver);
  els.recordsRoot.addEventListener("dragleave", handleWorkingMemoryDragLeave);
  els.recordsRoot.addEventListener("drop", handleWorkingMemoryDrop);
  els.recordsRoot.addEventListener("dragend", finishWorkingMemoryDrag);
  window.addEventListener("dragover", handleWorkingMemoryWindowDragOver, true);
  window.addEventListener("drop", stopWorkingMemoryAutoScroll, true);

  els.closeDetailButton.addEventListener("click", closeDetail);
  els.detailContent.addEventListener("click", handleDetailClick);
  els.detailContent.addEventListener("keydown", handleDetailKeydown);
  els.detailContent.addEventListener("input", handleDetailInput);
  els.detailContent.addEventListener("focusout", handleDetailFocusOut);
  els.detailContent.addEventListener("change", handleDetailChange);

  els.emailJsonButton.addEventListener("click", emailJsonPackage);
  els.refreshArchiveButton.addEventListener("click", refreshArchive);
  els.localArchive.addEventListener("click", handleArchiveClick);
  els.localArchive.addEventListener("dragstart", handleSavedSitesDragStart);
  els.localArchive.addEventListener("dragover", handleSavedSitesDragOver);
  els.localArchive.addEventListener("dragleave", handleSavedSitesDragLeave);
  els.localArchive.addEventListener("drop", handleSavedSitesDrop);
  els.localArchive.addEventListener("dragend", finishSavedSitesDrag);
  if (els.reportsButton) els.reportsButton.addEventListener("click", openReportsPanel);
  if (els.communicationSetupButton) els.communicationSetupButton.addEventListener("click", openCommunicationSetupPanel);
  if (els.communicationActivityButton) els.communicationActivityButton.addEventListener("click", openCommunicationActivityPanel);
  if (els.closeCommunicationActivityButton) els.closeCommunicationActivityButton.addEventListener("click", closeCommunicationActivityPanel);
  if (els.clearCommunicationActivityButton) els.clearCommunicationActivityButton.addEventListener("click", clearEmailActivityLog);
  if (els.communicationActivityPanel) els.communicationActivityPanel.addEventListener("click", event => { if (event.target === els.communicationActivityPanel) closeCommunicationActivityPanel(); });
  if (els.closeCommunicationSetupButton) els.closeCommunicationSetupButton.addEventListener("click", closeCommunicationSetupPanel);
  if (els.allSiteContactsButton) els.allSiteContactsButton.addEventListener("click", openAllSiteContactsPanel);
  if (els.closeAllSiteContactsButton) els.closeAllSiteContactsButton.addEventListener("click", closeAllSiteContactsPanel);
  if (els.allSiteContactsPanel) els.allSiteContactsPanel.addEventListener("click", event => { if (event.target === els.allSiteContactsPanel) closeAllSiteContactsPanel(); });
  if (els.allSiteContactsSearch) els.allSiteContactsSearch.addEventListener("input", renderAllSiteContacts);
  if (els.addInternalDepartmentButton) els.addInternalDepartmentButton.addEventListener("click", () => addCommunicationGroup("department"));
  if (els.addExternalCompanyButton) els.addExternalCompanyButton.addEventListener("click", () => addCommunicationGroup("company"));
  if (els.saveCommunicationSetupButton) els.saveCommunicationSetupButton.addEventListener("click", saveCommunicationSetup);
  if (els.communicationSetupFields) {
    els.communicationSetupFields.addEventListener("click", handleCommunicationSetupClick);
    els.communicationSetupFields.addEventListener("change", handleCommunicationSetupChange);
    els.communicationSetupFields.addEventListener("input", () => { communicationSetupDirty = true; });
  }
  document.querySelectorAll(".box-id[data-config-box]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      openConfigPanel(button.dataset.configBox || "");
    });
  });
  document.querySelectorAll(".site-walk-header[data-collapse-panel]").forEach(header => {
    header.addEventListener("click", event => {
      if (event.target.closest(".box-id, .site-walk-drag-grip")) return;
      event.preventDefault();
      toggleSiteWalkPanel(header.dataset.collapsePanel || "");
    });
    header.addEventListener("keydown", event => {
      if (event.target !== header || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      toggleSiteWalkPanel(header.dataset.collapsePanel || "");
    });
    const panel = header.closest(".site-walk-panel");
    if (panel) enableSiteWalkPanelDrag(panel, header);
  });
  if (els.closeConfigButton) els.closeConfigButton.addEventListener("click", closeConfigPanel);
  if (els.configPanel) els.configPanel.addEventListener("click", event => {
    if (event.target === els.configPanel) closeConfigPanel();
  });
  if (els.applyConfigButton) els.applyConfigButton.addEventListener("click", applyConfigTitles);
  if (els.restoreConfigDefaultsButton) els.restoreConfigDefaultsButton.addEventListener("click", restoreConfigDefaults);
  if (els.saveConfigToSiteButton) els.saveConfigToSiteButton.addEventListener("click", saveConfigToSite);
  if (els.configFields) {
    els.configFields.addEventListener("input", () => { configDraftDirty = true; });
    els.configFields.addEventListener("click", event => {
      const tab = event.target.closest("[data-config-tab]");
      if (!tab) return;
      event.preventDefault();
      const currentConfig = readConfigInputs();
      fillConfigInputs(currentConfig, tab.dataset.configTab || "B01");
    });
  }
  if (els.closeReportsButton) els.closeReportsButton.addEventListener("click", closeReportsPanel);
  if (els.aiReportMode) els.aiReportMode.addEventListener("change", setCustomAiReportPrototypeVisibility);
  if (els.reportsPanel) els.reportsPanel.addEventListener("click", event => {
    if (event.target === els.reportsPanel) closeReportsPanel();
  });
  if (els.printReportButton) els.printReportButton.addEventListener("click", printCurrentReport);
  if (els.copyReportButton) els.copyReportButton.addEventListener("click", copyCurrentReportText);
  if (els.exportHoursExcelButton) els.exportHoursExcelButton.addEventListener("click", exportHoursReportExcel);
  if (els.exportMdsExcelButton) els.exportMdsExcelButton.addEventListener("click", exportMdsReportExcel);
  [els.reportType, els.reportFromDate, els.reportToDate, els.reportSortOrder, els.reportStatusOpen, els.reportStatusClosed].forEach(control => {
    if (control) control.addEventListener("change", () => {
      resetReportSelection();
      generateReport();
    });
  });
  document.querySelectorAll(".reportCategory").forEach(control => control.addEventListener("change", () => {
    resetReportSelection();
    generateReport();
  }));
  if (els.hoursRecordSelectionList) els.hoursRecordSelectionList.addEventListener("change", handleReportRecordSelectionChange);
  if (els.selectAllHoursButton) els.selectAllHoursButton.addEventListener("click", selectAllReportRows);
  if (els.clearHoursButton) els.clearHoursButton.addEventListener("click", clearReportRows);

  window.addEventListener("beforeunload", event => {
    if (!dirty) return;
    forceAutoSaveNow("browser closing");
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && dirty) forceAutoSaveNow("app backgrounded");
  });
}

function installDropProtection() {
  ["dragenter", "dragover"].forEach(type => {
    window.addEventListener(type, event => {
      event.preventDefault();
      if (event.target === els.dropZone || els.dropZone.contains(event.target)) {
        els.dropZone.classList.add("dragover");
      }
    }, true);
  });

  ["dragleave", "drop"].forEach(type => {
    window.addEventListener(type, event => {
      if (type === "drop") event.preventDefault();
      els.dropZone.classList.remove("dragover");
    }, true);
  });

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const file = getJsonFileFromDrop(event);
    if (file) importJsonFile(file);
  }

  els.dropZone.addEventListener("drop", handleDrop, false);
  document.addEventListener("drop", handleDrop, false);
}


function handleWorkingMemoryDragStart(event) {
  const grip = event.target.closest(".record-drag-grip");
  if (!grip || grip.getAttribute("draggable") !== "true") {
    event.preventDefault();
    return;
  }
  const activityRow = event.target.closest(".activity-record-line");
  if (activityRow && activityRow.dataset.recordId && activityRow.dataset.commentId && activityRow.dataset.activityId) {
    const sourceRecord = getRecordById(activityRow.dataset.recordId);
    const sourceComment = (sourceRecord?.comments || []).find(item => item.id === activityRow.dataset.commentId);
    const sourceActivity = (sourceComment?.activities || []).find(item => item.id === activityRow.dataset.activityId);
    if (isRecordLocked(sourceRecord) || isCommentLocked(sourceComment) || isCommentMovementLocked(sourceActivity)) {
      event.preventDefault();
      commentMovementLockedMessage(sourceActivity);
      return;
    }
    const payload = { kind: "activity", sourceRecordId: sourceRecord.id, commentId: sourceComment.id, activityId: sourceActivity.id };
    workingMemoryDragPayload = payload;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/sitescribe-record-move", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", "sitescribe-activity-move");
    activityRow.classList.add("dragging");
    return;
  }
  const secondaryRow = event.target.closest(".secondary-record-line");
  if (secondaryRow && secondaryRow.dataset.recordId && secondaryRow.dataset.commentId) {
    const sourceRecord = getRecordById(secondaryRow.dataset.recordId);
    const sourceComment = sourceRecord && Array.isArray(sourceRecord.comments) ? sourceRecord.comments.find(item => item.id === secondaryRow.dataset.commentId) : null;
    if (isRecordLocked(sourceRecord) || isCommentMovementLocked(sourceComment)) {
      event.preventDefault();
      commentMovementLockedMessage(sourceComment);
      return;
    }
    const payload = {
      kind: "comment",
      sourceRecordId: secondaryRow.dataset.recordId,
      commentId: secondaryRow.dataset.commentId
    };
    workingMemoryDragPayload = payload;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/sitescribe-record-move", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", "sitescribe-comment-move");
    secondaryRow.classList.add("dragging");
    return;
  }

  const primaryRow = event.target.closest(".record-line");
  if (primaryRow && primaryRow.dataset.recordId) {
    const sourceRecord = getRecordById(primaryRow.dataset.recordId);
    if (isRecordLocked(sourceRecord)) {
      event.preventDefault();
      recordMovementLockedMessage(sourceRecord);
      return;
    }
    const payload = {
      kind: "record",
      recordId: primaryRow.dataset.recordId
    };
    workingMemoryDragPayload = payload;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/sitescribe-record-move", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", "sitescribe-record-move");
    primaryRow.classList.add("dragging");
  }
}

function handleWorkingMemoryDragOver(event) {
  const payload = getWorkingMemoryDragPayload(event);
  if (!payload) return;
  updateWorkingMemoryAutoScroll(event);
  clearWorkingMemoryDropTargets();
  workingMemoryDropIntent = null;

  const targetRow = event.target.closest(".record-line");
  const targetActivityRow = event.target.closest(".activity-record-line");
  const targetSecondaryRow = event.target.closest(".secondary-record-line");
  const targetRecordId = (targetRow && targetRow.dataset.recordId) || (targetSecondaryRow && targetSecondaryRow.dataset.recordId) || "";
  const targetCommentId = targetSecondaryRow && targetSecondaryRow.dataset.commentId || "";

  if (payload.kind === "activity" && targetActivityRow && targetActivityRow.dataset.recordId === payload.sourceRecordId && targetActivityRow.dataset.commentId === payload.commentId && targetActivityRow.dataset.activityId !== payload.activityId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const position = getBeforeAfterPosition(event, targetActivityRow);
    workingMemoryDropIntent = { action: "reorder-activity", targetRecordId: payload.sourceRecordId, targetCommentId: payload.commentId, targetActivityId: targetActivityRow.dataset.activityId, position };
    targetActivityRow.classList.add(`reorder-${position}`);
    return;
  }

  if (payload.kind === "record" && targetRow && targetRecordId && payload.recordId !== targetRecordId && canDropWorkingMemoryPayload(payload, targetRecordId)) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    workingMemoryDropIntent = getPrimaryDropIntent(event, targetRow, payload, targetRecordId);
    targetRow.classList.add(workingMemoryDropIntent.action === "move-under" ? "drop-target" : `reorder-${workingMemoryDropIntent.position}`);
    return;
  }

  if (payload.kind === "comment" && isPromoteSecondaryDrop(event, payload)) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const position = targetRow ? getBeforeAfterPosition(event, targetRow) : "after";
    workingMemoryDropIntent = { action: "promote", targetRecordId, position };
    els.recordsRoot.classList.add("promote-target");
    if (targetRow && targetRecordId) targetRow.classList.add(`reorder-${position}`);
    return;
  }

  if (payload.kind === "comment" && targetSecondaryRow && targetRecordId && targetCommentId && payload.commentId !== targetCommentId && canMoveSecondaryPayload(payload)) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const position = getBeforeAfterPosition(event, targetSecondaryRow);
    workingMemoryDropIntent = {
      action: payload.sourceRecordId === targetRecordId ? "reorder-comment" : "move-comment-at",
      targetRecordId,
      targetCommentId,
      position
    };
    targetSecondaryRow.classList.add(`reorder-${position}`);
    return;
  }

  if (payload.kind === "comment" && targetRow && targetRecordId && canDropWorkingMemoryPayload(payload, targetRecordId)) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    workingMemoryDropIntent = { action: "move-comment-under", targetRecordId };
    targetRow.classList.add("drop-target");
  }
}

function getPrimaryDropIntent(event, targetRow, payload, targetRecordId) {
  const source = payload && payload.recordId ? getRecordById(payload.recordId) : null;
  // A deliverable-dated primary stays fixed in top-level ordering, but it may
  // still be converted into a secondary under another open primary.
  if (activeRecordDeliverableInfo(source)) return { action: "move-under", targetRecordId };
  const rect = targetRow.getBoundingClientRect();
  const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
  if (ratio < 0.28) return { action: "reorder-record", targetRecordId, position: "before" };
  if (ratio > 0.72) return { action: "reorder-record", targetRecordId, position: "after" };
  return { action: "move-under", targetRecordId };
}

function getBeforeAfterPosition(event, targetRow) {
  const rect = targetRow.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
}

function handleWorkingMemoryDragLeave(event) {
  const leavingRow = event.target.closest(".record-line");
  const entering = event.relatedTarget;
  if (leavingRow && (!entering || !leavingRow.contains(entering))) leavingRow.classList.remove("drop-target");
}

function handleWorkingMemoryDrop(event) {
  const payload = getWorkingMemoryDragPayload(event);
  const targetRow = event.target.closest(".record-line");
  const targetActivityRow = event.target.closest(".activity-record-line");
  const targetSecondaryRow = event.target.closest(".secondary-record-line");
  const targetRecordId = (targetRow && targetRow.dataset.recordId) || (targetSecondaryRow && targetSecondaryRow.dataset.recordId) || "";
  const intent = workingMemoryDropIntent;

  if (!payload) return;
  event.preventDefault();
  clearWorkingMemoryDropTargets();

  if (intent && payload.kind === "activity" && intent.action === "reorder-activity") {
    reorderActivityWithinComment(payload.sourceRecordId, payload.commentId, payload.activityId, intent.targetActivityId, intent.position);
    finishWorkingMemoryDrag();
    return;
  }

  if (intent && payload.kind === "record" && intent.action === "reorder-record") {
    reorderPrimaryRecord(payload.recordId, intent.targetRecordId, intent.position);
    finishWorkingMemoryDrag();
    return;
  }

  if (intent && payload.kind === "record" && intent.action === "move-under") {
    movePrimaryRecordUnderRecord(payload.recordId, intent.targetRecordId);
    finishWorkingMemoryDrag();
    return;
  }

  if (intent && payload.kind === "comment" && intent.action === "promote") {
    promoteCommentToPrimaryRecord(payload.sourceRecordId, payload.commentId, intent.targetRecordId, intent.position);
    finishWorkingMemoryDrag();
    return;
  }

  if (intent && payload.kind === "comment" && intent.action === "move-comment-under") {
    moveCommentUnderRecord(payload.sourceRecordId, payload.commentId, intent.targetRecordId);
    finishWorkingMemoryDrag();
    return;
  }

  if (intent && payload.kind === "comment" && intent.action === "reorder-comment") {
    reorderCommentWithinRecord(payload.sourceRecordId, payload.commentId, intent.targetCommentId, intent.position);
    finishWorkingMemoryDrag();
    return;
  }

  if (intent && payload.kind === "comment" && intent.action === "move-comment-at") {
    moveCommentUnderRecord(payload.sourceRecordId, payload.commentId, intent.targetRecordId, intent.targetCommentId, intent.position);
    finishWorkingMemoryDrag();
    return;
  }

  if (payload.kind === "comment" && isPromoteSecondaryDrop(event, payload)) {
    promoteCommentToPrimaryRecord(payload.sourceRecordId, payload.commentId, targetRecordId, targetRow ? getBeforeAfterPosition(event, targetRow) : "after");
    finishWorkingMemoryDrag();
    return;
  }

  if (targetRecordId && canDropWorkingMemoryPayload(payload, targetRecordId)) {
    if (payload.kind === "record") movePrimaryRecordUnderRecord(payload.recordId, targetRecordId);
    if (payload.kind === "comment") moveCommentUnderRecord(payload.sourceRecordId, payload.commentId, targetRecordId);
  }
  finishWorkingMemoryDrag();
}

function getWorkingMemoryDragPayload(event) {
  if (workingMemoryDragPayload) return workingMemoryDragPayload;
  try {
    const raw = event.dataTransfer && event.dataTransfer.getData("application/sitescribe-record-move");
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function canDropWorkingMemoryPayload(payload, targetRecordId) {
  if (!payload || !targetRecordId) return false;
  const target = getRecordById(targetRecordId);
  if (isRecordLocked(target)) return false;
  if (payload.kind === "record") {
    const source = getRecordById(payload.recordId);
    return payload.recordId && payload.recordId !== targetRecordId && !isRecordLocked(source);
  }
  if (payload.kind === "comment") {
    const source = getRecordById(payload.sourceRecordId);
    const comment = source && Array.isArray(source.comments) ? source.comments.find(item => item.id === payload.commentId) : null;
    return payload.sourceRecordId && payload.commentId && payload.sourceRecordId !== targetRecordId && !isRecordLocked(source) && !isCommentMovementLocked(comment);
  }
  return false;
}

function canMoveSecondaryPayload(payload) {
  if (!payload || payload.kind !== "comment") return false;
  const source = getRecordById(payload.sourceRecordId);
  const comment = source && Array.isArray(source.comments) ? source.comments.find(item => item.id === payload.commentId) : null;
  return !!(source && comment && !isRecordLocked(source) && !isCommentMovementLocked(comment));
}

function isRecordLocked(record) {
  return !!record && normalizeLegacyStatus(record.status) === "closed";
}

function isRecordMovementLocked(record) {
  return isRecordLocked(record) || !!activeRecordDeliverableInfo(record);
}

function recordMovementLockedMessage(record) {
  if (activeRecordDeliverableInfo(record)) {
    showToast("Deliverable-priority primary is fixed in place until its active deliverable is removed, disabled, or closed.");
    return;
  }
  lockedRecordMessage();
}

function isCommentLocked(comment) {
  return !!comment && normalizeLegacyStatus(comment.status) === "closed";
}

function isCommentMovementLocked(comment) {
  return isCommentLocked(comment) || deliverableApplies(comment);
}

function commentMovementLockedMessage(comment) {
  if (deliverableApplies(comment)) {
    showToast("Deliverable-priority update is fixed in place until its deliverable date is removed or disabled.");
    return;
  }
  lockedRecordMessage();
}

function lockedRecordMessage() {
  showToast("Closed record locked. Reopen it before making changes.");
}

function clearWorkingMemoryDropTargets() {
  if (!els.recordsRoot) return;
  els.recordsRoot.classList.remove("promote-target");
  els.recordsRoot.querySelectorAll(".drop-target, .dragging, .reorder-before, .reorder-after").forEach(row => row.classList.remove("drop-target", "dragging", "reorder-before", "reorder-after"));
}

function finishWorkingMemoryDrag() {
  workingMemoryDragPayload = null;
  workingMemoryDropIntent = null;
  stopWorkingMemoryAutoScroll();
  clearWorkingMemoryDropTargets();
}

function handleWorkingMemoryWindowDragOver(event) {
  if (!workingMemoryDragPayload && !savedSitesDragPackageId) return;
  updateWorkingMemoryAutoScroll(event);
}

function updateWorkingMemoryAutoScroll(event) {
  if ((!workingMemoryDragPayload && !savedSitesDragPackageId) || !event) return;
  const y = event.clientY;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!height) return;

  const edge = Math.min(120, Math.max(70, height * 0.14));
  const maxSpeed = 14;
  let speed = 0;

  if (y < edge) {
    speed = -Math.ceil(((edge - y) / edge) * maxSpeed);
  } else if (y > height - edge) {
    speed = Math.ceil(((y - (height - edge)) / edge) * maxSpeed);
  }

  setWorkingMemoryAutoScrollSpeed(speed);
}

function setWorkingMemoryAutoScrollSpeed(speed) {
  workingMemoryAutoScrollSpeed = speed;
  if (!speed) {
    stopWorkingMemoryAutoScroll();
    return;
  }
  if (!workingMemoryAutoScrollFrame) {
    workingMemoryAutoScrollFrame = requestAnimationFrame(runWorkingMemoryAutoScroll);
  }
}

function runWorkingMemoryAutoScroll() {
  workingMemoryAutoScrollFrame = null;
  if ((!workingMemoryDragPayload && !savedSitesDragPackageId) || !workingMemoryAutoScrollSpeed) return;

  const before = window.scrollY || document.documentElement.scrollTop || 0;
  window.scrollBy(0, workingMemoryAutoScrollSpeed);
  const after = window.scrollY || document.documentElement.scrollTop || 0;

  if (before !== after) {
    workingMemoryAutoScrollFrame = requestAnimationFrame(runWorkingMemoryAutoScroll);
  } else {
    workingMemoryAutoScrollSpeed = 0;
  }
}

function stopWorkingMemoryAutoScroll() {
  workingMemoryAutoScrollSpeed = 0;
  if (workingMemoryAutoScrollFrame) {
    cancelAnimationFrame(workingMemoryAutoScrollFrame);
    workingMemoryAutoScrollFrame = null;
  }
}



function ensureReviewConsoleState() {
  if (!currentPackage) currentPackage = createEmptyPackage();
  currentPackage.reviewConsole = currentPackage.reviewConsole || {};
  if (!Array.isArray(currentPackage.reviewConsole.collapsedRecordIds)) currentPackage.reviewConsole.collapsedRecordIds = [];
  if (!Array.isArray(currentPackage.reviewConsole.collapsedActivityParentIds)) currentPackage.reviewConsole.collapsedActivityParentIds = [];
  return currentPackage.reviewConsole;
}

function getCollapsedActivityParentIds() {
  return new Set(ensureReviewConsoleState().collapsedActivityParentIds || []);
}

function isCommentActivityCollapsed(commentId) {
  return getCollapsedActivityParentIds().has(commentId);
}

function setCommentActivityCollapsed(commentId, collapsed) {
  if (!commentId) return;
  const rc = ensureReviewConsoleState();
  const ids = new Set(rc.collapsedActivityParentIds || []);
  if (collapsed) ids.add(commentId);
  else ids.delete(commentId);
  rc.collapsedActivityParentIds = Array.from(ids);
}

function toggleCommentActivityDisplay(recordId, commentId) {
  const record = getRecordById(recordId);
  const comment = (record?.comments || []).find(item => item.id === commentId);
  const count = Array.isArray(comment?.activities) ? comment.activities.length : 0;
  if (!comment || !count) {
    showToast("No activity records to show or hide. Use the status pill to open the record.");
    return;
  }
  const nextCollapsed = !isCommentActivityCollapsed(commentId);
  setCommentActivityCollapsed(commentId, nextCollapsed);
  markDirty({ contentChanged: false, reason: "activity display toggled" });
  render();
  setStatus(nextCollapsed ? "Activities hidden for this secondary record." : "Activities shown for this secondary record.");
}

function getCollapsedRecordIds() {
  return new Set(ensureReviewConsoleState().collapsedRecordIds || []);
}

function isRecordSecondaryCollapsed(recordId) {
  return getCollapsedRecordIds().has(recordId);
}

function getExpandedClosedRecordIds() {
  const rc = ensureReviewConsoleState();
  if (!Array.isArray(rc.expandedClosedRecordIds)) rc.expandedClosedRecordIds = [];
  return new Set(rc.expandedClosedRecordIds || []);
}

function isClosedRecordExpanded(recordId) {
  return getExpandedClosedRecordIds().has(recordId);
}

function setClosedRecordExpanded(recordId, expanded) {
  if (!recordId) return;
  const rc = ensureReviewConsoleState();
  const ids = new Set(rc.expandedClosedRecordIds || []);
  if (expanded) ids.add(recordId);
  else ids.delete(recordId);
  rc.expandedClosedRecordIds = Array.from(ids);
}

function shouldCollapseSecondaryRecords(record) {
  if (!record) return false;
  const count = Array.isArray(record.comments) ? record.comments.length : 0;
  if (!count) return false;
  const status = normalizeLegacyStatus(record.status);
  if (status === "closed") return !isClosedRecordExpanded(record.id);
  return isRecordSecondaryCollapsed(record.id);
}

function setRecordSecondaryCollapsed(recordId, collapsed) {
  if (!recordId) return;
  const rc = ensureReviewConsoleState();
  const ids = new Set(rc.collapsedRecordIds || []);
  if (collapsed) ids.add(recordId);
  else ids.delete(recordId);
  rc.collapsedRecordIds = Array.from(ids);
}

function toggleSecondaryDisplay(recordId) {
  const record = getRecordById(recordId);
  if (!record) return;
  const count = Array.isArray(record.comments) ? record.comments.length : 0;
  if (!count) {
    showToast("No updates to show or hide. Use the status pill to open the record.");
    return;
  }

  const status = normalizeLegacyStatus(record.status);
  let nextCollapsed;
  if (status === "closed") {
    const nextExpanded = !isClosedRecordExpanded(recordId);
    setClosedRecordExpanded(recordId, nextExpanded);
    nextCollapsed = !nextExpanded;
  } else {
    nextCollapsed = !isRecordSecondaryCollapsed(recordId);
    setRecordSecondaryCollapsed(recordId, nextCollapsed);
  }

  markDirty({ contentChanged: false, reason: "secondary display toggled" });
  render();
  setStatus(nextCollapsed ? "Updates hidden for this primary record." : "Updates shown for this primary record.");
}

function getWorkingMemorySortMode() {
  const rc = currentPackage && currentPackage.reviewConsole ? currentPackage.reviewConsole : null;
  return rc && rc.workingMemorySort ? rc.workingMemorySort : "date_desc";
}

function getClosedRecordsHidden() {
  const rc = currentPackage && currentPackage.reviewConsole ? currentPackage.reviewConsole : null;
  return !!(rc && rc.hideClosedRecords);
}

function setClosedRecordsHidden(hidden) {
  const rc = ensureReviewConsoleState();
  rc.hideClosedRecords = !!hidden;
}

function toggleClosedRecordsVisibility() {
  const nextHidden = !getClosedRecordsHidden();
  setClosedRecordsHidden(nextHidden);
  markDirty({ contentChanged: false, reason: "closed visibility toggled" });
  render();
  setStatus(nextHidden ? "Closed records hidden in Working Memory." : "Closed records shown in Working Memory.");
  showToast(nextHidden ? "Closed records hidden." : "Closed records shown.");
}

function updateClosedToggleButton() {
  if (!els.toggleClosedButton) return;
  const hidden = getClosedRecordsHidden();
  els.toggleClosedButton.textContent = hidden ? pillLabel("B05", "showClosed") : pillLabel("B05", "hideClosed");
  els.toggleClosedButton.classList.toggle("active-toggle", hidden);
  els.toggleClosedButton.setAttribute("aria-pressed", hidden ? "true" : "false");
}

function setWorkingMemorySortMode(mode) {
  if (!currentPackage) currentPackage = createEmptyPackage();
  currentPackage.reviewConsole = currentPackage.reviewConsole || {};
  currentPackage.reviewConsole.workingMemorySort = mode;
}

function ensureManualSortOrder() {
  const records = currentPackage && Array.isArray(currentPackage.records) ? currentPackage.records : [];
  const ordered = sortRecordsForWorkingMemory(records, true);
  ordered.forEach((record, index) => {
    if (!Number.isFinite(Number(record.sortOrder))) record.sortOrder = (index + 1) * 1000;
  });
}

function assignManualSortOrder(records) {
  records.forEach((record, index) => { record.sortOrder = (index + 1) * 1000; });
}

function sortWorkingMemory(mode) {
  const records = currentPackage && Array.isArray(currentPackage.records) ? currentPackage.records : [];
  const sorted = [...records].sort(mode === "date_asc" ? compareRecordChronologyAsc : compareRecordChronologyDesc);
  assignManualSortOrder(sorted);
  currentPackage.records = sorted;
  setWorkingMemorySortMode(mode);
  markDirty();
  render();
  setStatus(mode === "date_asc" ? "Working Memory sorted oldest to newest." : "Working Memory sorted newest to oldest.");
  showToast("Working Memory sorted.");
}

function reorderPrimaryRecord(sourceRecordId, targetRecordId, position) {
  const records = currentPackage && Array.isArray(currentPackage.records) ? currentPackage.records : [];
  const source = records.find(record => record.id === sourceRecordId);
  const target = records.find(record => record.id === targetRecordId);
  if (!source || !target || source.id === target.id) return;
  if (isRecordMovementLocked(source) || isRecordLocked(target)) {
    if (isRecordMovementLocked(source)) recordMovementLockedMessage(source);
    else lockedRecordMessage();
    return;
  }
  ensureManualSortOrder();
  const working = sortRecordsForWorkingMemory(records, true).filter(record => record.id !== source.id);
  let targetIndex = working.findIndex(record => record.id === target.id);
  if (targetIndex < 0) targetIndex = working.length;
  if (position === "after") targetIndex += 1;
  working.splice(targetIndex, 0, source);
  assignManualSortOrder(working);
  currentPackage.records = working;
  setWorkingMemorySortMode("manual");
  selectedRecordId = source.id;
  selectedCommentId = null;
  selectedFlagId = null;
  markDirty();
  render();
  setStatus("Primary record moved manually. Use Sort pills to restore date/time ordering.");
  showToast("Record moved.");
}

function insertPrimaryRecordAtPosition(record, targetRecordId, position) {
  currentPackage.records = Array.isArray(currentPackage.records) ? currentPackage.records : [];
  ensureManualSortOrder();
  const working = sortRecordsForWorkingMemory(currentPackage.records, true).filter(item => item.id !== record.id);
  let index = working.length;
  if (targetRecordId) {
    const found = working.findIndex(item => item.id === targetRecordId);
    if (found >= 0) index = found + (position === "after" ? 1 : 0);
  }
  working.splice(index, 0, record);
  assignManualSortOrder(working);
  currentPackage.records = working;
  setWorkingMemorySortMode("manual");
}

function sortRecordsForWorkingMemory(records, useStoredOrder = false) {
  const mode = useStoredOrder ? "manual" : getWorkingMemorySortMode();
  const baseCompare = mode === "manual"
    ? (a, b) => {
        const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
        const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return compareRecordChronologyDesc(a, b);
      }
    : (mode === "date_asc" ? compareRecordChronologyAsc : compareRecordChronologyDesc);

  const deliverableCompare = (a, b) => {
    const aInfo = activeRecordDeliverableInfo(a);
    const bInfo = activeRecordDeliverableInfo(b);
    const priority = deliverablePriorityValue(aInfo && aInfo.status) - deliverablePriorityValue(bInfo && bInfo.status);
    if (priority) return priority;
    if (aInfo && bInfo && aInfo.date !== bInfo.date) return String(aInfo.date || "").localeCompare(String(bInfo.date || ""));
    return baseCompare(a, b);
  };

  const openRecords = records.filter(record => normalizeLegacyStatus(record.status) !== "closed").sort(deliverableCompare);
  const closedRecords = records.filter(record => normalizeLegacyStatus(record.status) === "closed").sort(baseCompare);
  return [...openRecords, ...closedRecords];
}

function movePrimaryRecordUnderRecord(sourceRecordId, targetRecordId) {
  const records = currentPackage && Array.isArray(currentPackage.records) ? currentPackage.records : [];
  const sourceIndex = records.findIndex(record => record.id === sourceRecordId);
  const target = records.find(record => record.id === targetRecordId);
  if (sourceIndex < 0 || !target || sourceRecordId === targetRecordId) {
    showToast("Record move unavailable.");
    return;
  }
  const source = records[sourceIndex];
  if (isRecordLocked(source) || isRecordLocked(target)) {
    if (isRecordLocked(source)) recordMovementLockedMessage(source);
    else lockedRecordMessage();
    return;
  }
  // v0.6.14: primary -> primary drag/drop is a reversible housekeeping move,
  // so it now completes immediately without an extra confirmation prompt.
  target.comments = Array.isArray(target.comments) ? target.comments : [];
  const movedAt = new Date().toISOString();
  const movedMain = normalizeComment({
    id: createId("com"),
    text: source.description || "Untitled moved record",
    status: normalizeLegacyStatus(source.status),
    createdAt: source.createdAt || movedAt,
    updatedAt: movedAt,
    sourceText: source.sourceText || "",
    deliverable: source.deliverable || { apply: false, date: "" },
    movedFromRecordId: source.id,
    movedFromCategory: source.category || "event",
    movedFromSourceDate: source.sourceDate || "not stated",
    movedAt,
    movedType: "primary_record"
  });
  target.comments.push(movedMain);
  target.updatedAt = movedAt;

  (Array.isArray(source.comments) ? source.comments : []).forEach(comment => {
    const movedComment = normalizeComment({
      ...structuredCloneSafe(comment),
      id: createId("com"),
      updatedAt: movedAt,
      movedFromRecordId: source.id,
      movedFromCommentId: comment.id || "",
      movedFromCategory: source.category || "event",
      movedAt,
      movedType: "primary_record_update"
    });
    target.comments.push(movedComment);
  });

  if (Array.isArray(source.flags) && source.flags.length) {
    source.flags.forEach(flag => {
      const flagType = flag.type === "clarify" ? "clarify" : "incomplete";
      const flagComment = normalizeComment({
        id: createId("com"),
        text: `${flagType}: ${flag.text || "Record flag"}`,
        status: normalizeLegacyStatus(flag.status),
        createdAt: flag.createdAt || movedAt,
        updatedAt: movedAt,
        sourceText: flag.sourceText || source.sourceText || "",
        movedFromRecordId: source.id,
        movedFromFlagId: flag.id || "",
        movedFromCategory: source.category || "event",
        movedAt,
        movedType: "primary_record_flag"
      });
      target.comments.push(flagComment);
    });
  }

  records.splice(sourceIndex, 1);
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  markDirty();
  render();
  closeDetail();
  setStatus("Record moved under receiving primary record as an update. Saving working copy...");
  showToast("Record moved under primary.");
}

function moveCommentUnderRecord(sourceRecordId, commentId, targetRecordId, targetCommentId = "", position = "after") {
  const source = getRecordById(sourceRecordId);
  const target = getRecordById(targetRecordId);
  if (!source || !target || source.id === target.id) {
    showToast("Update move unavailable.");
    return;
  }
  if (isRecordLocked(source) || isRecordLocked(target)) {
    lockedRecordMessage();
    return;
  }
  if (isRecordLocked(source)) {
    lockedRecordMessage();
    return;
  }
  source.comments = Array.isArray(source.comments) ? source.comments : [];
  const index = source.comments.findIndex(comment => comment.id === commentId);
  if (index < 0) {
    showToast("Update not found.");
    return;
  }
  const sourceComment = source.comments[index];
  if (isCommentMovementLocked(sourceComment)) {
    commentMovementLockedMessage(sourceComment);
    return;
  }
  // v0.6.17: moving a secondary/update under another primary is reversible housekeeping,
  // so it completes immediately without a confirmation prompt.
  const movedAt = new Date().toISOString();
  const movedComment = normalizeComment({
    ...structuredCloneSafe(sourceComment),
    id: createId("com"),
    updatedAt: movedAt,
    movedFromRecordId: source.id,
    movedFromCommentId: sourceComment.id || "",
    movedAt,
    movedType: "secondary_update"
  });
  target.comments = Array.isArray(target.comments) ? target.comments : [];
  const targetDisplay = target.secondarySortMode === "manual"
    ? secondaryRecordsInManualOrder(target.comments)
    : sortSecondaryRecordsForDisplay([...target.comments]);
  let targetIndex = targetDisplay.length;
  if (targetCommentId) {
    const found = targetDisplay.findIndex(comment => comment.id === targetCommentId);
    if (found >= 0) targetIndex = found + (position === "after" ? 1 : 0);
  }
  targetDisplay.splice(targetIndex, 0, movedComment);
  assignSecondarySortOrder(targetDisplay);
  target.comments = targetDisplay;
  source.comments.splice(index, 1);
  source.updatedAt = movedAt;
  target.updatedAt = movedAt;
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  markDirty();
  render();
  closeDetail();
  setStatus("Update moved under receiving primary record. Saving working copy...");
  showToast("Update moved.");
}

function reorderCommentWithinRecord(recordId, commentId, targetCommentId, position = "after") {
  const record = getRecordById(recordId);
  if (!record || isRecordLocked(record)) return lockedRecordMessage();
  record.comments = Array.isArray(record.comments) ? record.comments : [];
  const sourceComment = record.comments.find(comment => comment.id === commentId);
  if (!sourceComment || commentId === targetCommentId) return;
  if (isCommentMovementLocked(sourceComment)) return commentMovementLockedMessage(sourceComment);
  const ordered = (record.secondarySortMode === "manual"
    ? secondaryRecordsInManualOrder(record.comments)
    : sortSecondaryRecordsForDisplay([...record.comments]))
    .filter(comment => comment.id !== commentId);
  let targetIndex = ordered.findIndex(comment => comment.id === targetCommentId);
  if (targetIndex < 0) targetIndex = ordered.length;
  else if (position === "after") targetIndex += 1;
  ordered.splice(targetIndex, 0, sourceComment);
  assignSecondarySortOrder(ordered);
  record.secondarySortMode = "manual";
  record.comments = ordered;
  record.updatedAt = new Date().toISOString();
  markDirty();
  render();
  setStatus("Secondary record reordered within its primary record.");
  showToast("Update reordered.");
}

function secondaryRecordsInManualOrder(comments) {
  const items = Array.isArray(comments) ? [...comments] : [];
  const hasManual = items.some(comment => Number.isFinite(Number(comment.secondarySortOrder)));
  if (!hasManual) return sortSecondaryRecordsForDisplay(items);
  const compareManual = (a, b) => {
    const aOrder = Number.isFinite(Number(a.secondarySortOrder)) ? Number(a.secondarySortOrder) : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(Number(b.secondarySortOrder)) ? Number(b.secondarySortOrder) : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return compareRecordChronologyDesc(a, b);
  };
  return [
    ...items.filter(comment => normalizeLegacyStatus(comment.status) !== "closed").sort(compareManual),
    ...items.filter(comment => normalizeLegacyStatus(comment.status) === "closed").sort(compareManual)
  ];
}

function assignSecondarySortOrder(comments) {
  comments.forEach((comment, index) => { comment.secondarySortOrder = (index + 1) * 1000; });
}

function isPromoteSecondaryDrop(event, payload) {
  if (!payload || payload.kind !== "comment" || !els.recordsRoot) return false;
  const firstPrimary = els.recordsRoot.querySelector(".record-line");
  const sourceSecondary = els.recordsRoot.querySelector(`[data-record-id="${cssEscape(payload.sourceRecordId)}"][data-comment-id="${cssEscape(payload.commentId)}"]`);
  if (!firstPrimary || !sourceSecondary) return false;
  const clientX = Number(event?.clientX);
  // iPhone can initially emit dragover with clientX 0, and a grip sits close
  // to the secondary row's left edge. Neither state is an intentional request
  // to promote. Require a real coordinate inside a narrow primary-alignment
  // zone to the left of the secondary row.
  if (!Number.isFinite(clientX) || clientX <= 0) return false;
  const primaryLeft = firstPrimary.getBoundingClientRect().left;
  const secondaryLeft = sourceSecondary.getBoundingClientRect().left;
  const leftEdgeAllowance = Math.min(16, Math.max(8, secondaryLeft - primaryLeft - 4));
  return clientX <= primaryLeft + leftEdgeAllowance;
}

function promoteCommentToPrimaryRecord(sourceRecordId, commentId, targetRecordId = "", position = "after") {
  const source = getRecordById(sourceRecordId);
  if (!source) {
    showToast("Update promotion unavailable.");
    return;
  }
  source.comments = Array.isArray(source.comments) ? source.comments : [];
  const index = source.comments.findIndex(comment => comment.id === commentId);
  if (index < 0) {
    showToast("Update not found.");
    return;
  }
  const sourceComment = source.comments[index];
  if (isCommentMovementLocked(sourceComment)) {
    commentMovementLockedMessage(sourceComment);
    return;
  }
  // v0.6.17: promoting a secondary/update back to a primary is reversible housekeeping,
  // so it completes immediately without a confirmation prompt.
  const promotedAt = new Date().toISOString();
  const category = categoryForPromotedComment(sourceComment, source);
  const record = normalizeRecord({
    id: createId("rec"),
    category,
    description: sourceComment.text || "Untitled promoted record",
    status: normalizeLegacyStatus(sourceComment.status),
    createdAt: sourceComment.createdAt || promotedAt,
    updatedAt: promotedAt,
    closedAt: "",
    sourceDate: sourceComment.movedFromSourceDate || source.sourceDate || dateFromIso(sourceComment.createdAt) || todayString(),
    sourceText: sourceComment.sourceText || sourceComment.text || "",
    deliverable: sourceComment.deliverable || { apply: false, date: "" },
    flags: [],
    comments: [],
    promotedFromRecordId: source.id,
    promotedFromCommentId: sourceComment.id || "",
    promotedFromCategory: source.category || "event",
    promotedAt
  });
  record.promotedFromRecordId = source.id;
  record.promotedFromCommentId = sourceComment.id || "";
  record.promotedFromCategory = source.category || "event";
  record.promotedAt = promotedAt;
  record.promotedType = "secondary_update";

  source.comments.splice(index, 1);
  source.updatedAt = promotedAt;
  insertPrimaryRecordAtPosition(record, targetRecordId, position);
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  markDirty();
  render();
  closeDetail();
  setStatus("Update promoted to a top-level primary record. Saving working copy...");
  showToast("Update promoted to primary.");
}

function categoryForPromotedComment(comment, sourceRecord) {
  const firstToken = String(comment.text || "").trim().split(/\s+/)[0] || "";
  const firstCategory = cueToCategory(normalizeCue(firstToken.replace(/[.:,;\-]+$/g, "")));
  if (firstCategory) return firstCategory;
  return comment.movedFromCategory || sourceRecord?.category || "event";
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}


function getJsonFileFromDrop(event) {
  const files = event.dataTransfer && event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
  return files.find(isJsonLikeFile) || null;
}

function isJsonLikeFile(file) {
  if (!file) return false;
  const name = (file.name || "").toLowerCase();
  return name.endsWith(".json") || file.type === "application/json" || file.type === "text/json";
}

async function importJsonFile(file) {
  if (!isJsonLikeFile(file)) {
    setStatus("Please choose a JSON file.");
    return;
  }
  try {
    const data = JSON.parse(await readJsonFile(file));
    const importedPackage = normalizeImportedPackage(data);
    if (!siteIsStated(importedPackage.site) && els.activeMemorySiteInput) {
      writeActiveMemorySiteInputValue("");
    }
    await applyImportedPackage(importedPackage, file.name || "imported JSON");
  } catch (error) {
    console.error(error);
    setStatus(`Could not load JSON: ${error.message}`);
  }
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.readAsText(file);
  });
}

async function applyImportedPackage(importedPackage, sourceLabel, options = {}) {
  const mode = await chooseImportMode(importedPackage, sourceLabel, options);
  if (mode === "cancel") {
    setStatus("JSON import cancelled.");
    showToast("Import cancelled.");
    return { mode: "cancel", sourceLabel };
  }

  if (mode === "create") {
    await createNewSavedSiteFromImport(importedPackage, sourceLabel);
    return { mode: "create", sourceLabel };
  }

  if (mode === "append") {
    const summary = appendImportedPackageToCurrent(importedPackage, sourceLabel);
    selectedRecordId = null;
    selectedCommentId = null;
    selectedFlagId = null;
    markDirty();
    render();
    setStatus(`Added ${summary.added} records from ${sourceLabel}; skipped ${summary.skipped} duplicates. Saving working copy...`);
    showToast("JSON appended. Auto-saving.");
    return { mode: "append", sourceLabel, summary };
  }

  if (mode === "replace") {
    const currentSite = firstStatedSiteName(
      els.activeMemorySiteInput && els.activeMemorySiteInput.value,
      currentPackage && currentPackage.site,
      currentPackageRecord && currentPackageRecord.site
    ) || "current Working Memory";
    const confirmed = window.confirm(
      `Replace current Working Memory?\n\nThis will overwrite the browser working copy for ${currentSite} with ${sourceLabel}. The Dropbox file itself will not be changed.\n\nChoose Cancel to keep your current browser copy.`
    );
    if (!confirmed) {
      setStatus("Dropbox replace cancelled. Current Working Memory was kept.");
      showToast("Current working copy kept.");
      return { mode: "cancel", sourceLabel };
    }
    await replaceCurrentWorkingMemoryFromImport(importedPackage, sourceLabel);
    return { mode: "replace", sourceLabel };
  }

  return { mode: mode || "unknown", sourceLabel };
}

// v0.6.72a-v0.6.72f Parse Notes / Add Data bridge.
// The isolated Add Data module stages proposals, but the Review Console remains
// the only owner of current-site context, normalization, dedupe, mutation, and rendering.
window.SiteScribeAddDataBridge = {
  version: APP_VERSION,
  getCurrentContext() {
    commitActiveMemorySiteInput({ silent: true });
    const site = firstStatedSiteName(
      els.activeMemorySiteInput && els.activeMemorySiteInput.value,
      currentPackage && currentPackage.site,
      currentPackageRecord && currentPackageRecord.site
    );
    const shiftDate = String(currentPackage?.shiftDate || currentPackageRecord?.shiftDate || todayString()).trim();
    return {
      ready: Boolean(site && currentPackage && Array.isArray(currentPackage.records)),
      site: site || "",
      shiftDate: /^\d{4}-\d{2}-\d{2}$/.test(shiftDate) ? shiftDate : todayString(),
      captureMethod: "SiteScribe Add Data"
    };
  },
  getSiteContacts() {
    return structuredCloneSafe(getCurrentSiteContacts());
  },
  async ensureSiteContacts() {
    return this.getSiteContacts();
  },
  getRoutingRecommendation(item, parentRecord = null) {
    return structuredCloneSafe(resolveRecordRouting(item, parentRecord));
  },
  prepareSelectedEmailDrafts(data, selectedKeys = []) {
    const outgoing = structuredCloneSafe(data || {});
    const selected = new Set(selectedKeys || []);
    outgoing.emailActivityLog = normalizeEmailActivityLog(outgoing.emailActivityLog);
    (outgoing.records || []).forEach(record => {
      const primaryKey = `primary:${record.id}`;
      if (selected.has(primaryKey) && record.emailRecommendation?.routing?.status === "resolved") {
        const routing = record.emailRecommendation.routing;
        const action = buildRoutingDraft(record, routing, record);
        const draftComment = normalizeComment({ id: createId("com"), text: `Email draft: ${action.subject}`, status: "open", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sourceText: record.sourceText, intent: record.intent, intentSource: "routing_confirmed", action });
        record.comments = record.comments || []; record.comments.push(draftComment);
        outgoing.emailActivityLog.push(normalizeEmailActivityEntry({ id: createId("email_log"), timestamp: new Date().toISOString(), recordId: draftComment.id, parentRecordId: record.id, intent: record.intent, sourceExcerpt: record.sourceText, parentRecordSummary: record.description, messagePreview: action.body, recipientRef: { recipientType: routing.recipientType, groupId: routing.groupId, contactId: routing.contactId }, recipientSnapshot: routing.recipientSnapshot, subject: action.subject, action: "draftCreated", status: "not_sent" }));
      }
      (record.comments || []).forEach(comment => {
        const key = `secondary:${record.id}:${comment.id}`;
        if (selected.has(key) && comment.emailRecommendation?.routing?.status === "resolved") {
          const routing = comment.emailRecommendation.routing; const action = buildRoutingDraft(comment, routing, record);
          comment.action = action;
          outgoing.emailActivityLog.push(normalizeEmailActivityEntry({ id: createId("email_log"), timestamp: new Date().toISOString(), recordId: comment.id, parentRecordId: record.id, intent: comment.intent, sourceExcerpt: comment.sourceText || record.sourceText, parentRecordSummary: record.description, secondaryRecordSummary: comment.text, messagePreview: action.body, recipientRef: { recipientType: routing.recipientType, groupId: routing.groupId, contactId: routing.contactId }, recipientSnapshot: routing.recipientSnapshot, subject: action.subject, action: "draftCreated", status: "not_sent" }));
        }
        (comment.activities || []).forEach(activity => {
          const activityKey = `activity:${record.id}:${comment.id}:${activity.id}`;
          if (!selected.has(activityKey) || activity.emailRecommendation?.routing?.status !== "resolved") return;
          const routing = activity.emailRecommendation.routing; const action = buildRoutingDraft(activity, routing, record);
          activity.action = action;
          outgoing.emailActivityLog.push(normalizeEmailActivityEntry({ id: createId("email_log"), timestamp: new Date().toISOString(), recordId: activity.id, parentRecordId: record.id, intent: activity.intent, sourceExcerpt: activity.sourceText || comment.sourceText || record.sourceText, parentRecordSummary: record.description, secondaryRecordSummary: comment.text, messagePreview: action.body, recipientRef: { recipientType: routing.recipientType, groupId: routing.groupId, contactId: routing.contactId }, recipientSnapshot: routing.recipientSnapshot, subject: action.subject, action: "draftCreated", status: "not_sent" }));
        });
      });
    });
    return outgoing;
  },
  focusFirstSelectedEmailDraft(data, selectedKeys = []) {
    const selected = new Set(selectedKeys || []);
    let target = null;
    (data?.records || []).some(record => {
      const primaryKey = `primary:${record.id}`;
      if (selected.has(primaryKey)) {
        const comment = (record.comments || []).find(item => item?.action?.type === "communication" && item?.action?.method === "email_draft");
        if (comment) target = { recordId: record.id, commentId: comment.id };
      }
      if (!target) (record.comments || []).some(comment => {
        const key = `secondary:${record.id}:${comment.id}`;
        if (selected.has(key) && comment?.action?.type === "communication" && comment?.action?.method === "email_draft") {
          target = { recordId: record.id, commentId: comment.id };
          return true;
        }
        const activity = (comment.activities || []).find(item => selected.has(`activity:${record.id}:${comment.id}:${item.id}`) && item?.action?.type === "communication" && item?.action?.method === "email_draft");
        if (activity) {
          target = { recordId: record.id, commentId: comment.id, activityId: activity.id };
          return true;
        }
        return false;
      });
      return Boolean(target);
    });
    if (!target) return false;
    const record = getRecordById(target.recordId);
    const comment = (record?.comments || []).find(item => item.id === target.commentId);
    if (!record || !comment) return false;
    selectedRecordId = target.recordId;
    selectedCommentId = target.commentId;
    selectedActivityId = target.activityId || null;
    newActivityParentId = null;
    selectedFlagId = null;
    render();
    renderDetail(true);
    return true;
  },
  appendAcceptedPackage(data, sourceLabel = "Add Data") {
    const context = this.getCurrentContext();
    if (!context.ready) throw new Error("Open or create a named Saved Site before appending Add Data proposals.");
    const incoming = structuredCloneSafe(data || {});
    incoming.site = context.site;
    incoming.shiftDate = context.shiftDate;
    const importedPackage = normalizeImportedPackage(incoming);
    const summary = appendImportedPackageToCurrent(importedPackage, sourceLabel);
    selectedRecordId = null;
    selectedCommentId = null;
    selectedFlagId = null;
    markDirty({ reason: "add data proposals appended" });
    render();
    setStatus(`Added ${summary.added} parsed record${summary.added === 1 ? "" : "s"}; skipped ${summary.skipped} duplicate${summary.skipped === 1 ? "" : "s"}. Saving working copy...`);
    showToast("Parsed note proposals appended.");
    return summary;
  },
  notify(message) {
    setStatus(String(message || ""));
  }
};

// v0.6.62 Dropbox Pull Proof bridge.
// This exposes the existing SiteScribe JSON normalization/import-choice workflow
// to the isolated Dropbox proof module without creating a second import path.
window.SiteScribeDropboxImportBridge = {
  async importJsonData(data, sourceLabel, options = {}) {
    const importedPackage = normalizeImportedPackage(data);
    return applyImportedPackage(importedPackage, sourceLabel || "Dropbox JSON", options);
  },
  getCurrentExportData() {
    if (!currentPackage || !Array.isArray(currentPackage.records)) {
      return { ok: false, reason: "No current Working Memory is open." };
    }
    const hasSite = !!firstStatedSiteName(
      els.activeMemorySiteInput && els.activeMemorySiteInput.value,
      currentPackage && currentPackage.site,
      currentPackageRecord && currentPackageRecord.site
    );
    const hasRecords = Array.isArray(currentPackage.records) && currentPackage.records.length > 0;
    if (!hasSite && !hasRecords) {
      return { ok: false, reason: "No current site or Working Memory content is available to back up." };
    }
    const data = buildReviewedExportData();
    return {
      ok: true,
      data,
      filename: filenameForPackage(data, "sitescribe_reviewed"),
      site: data.site || "",
      shiftDate: data.shiftDate || ""
    };
  },
  async prepareCurrentExportForDropbox() {
    commitSelectedCommentEditorChanges({ renderRows: true, saveNow: false });
    commitRecordDeliverableEditor();
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    await waitForAutoSaveIdle();
    const saved = await saveCurrentPackageToLocalStorage({ silent: true, reason: "dropbox preflight" });
    if (!saved) {
      return { ok: false, reason: "Dropbox upload stopped because the current site could not be saved locally." };
    }
    return this.getCurrentExportData();
  },
  getCurrentFreshnessInfo() {
    if (!currentPackage || !Array.isArray(currentPackage.records)) return null;
    ensurePackageFreshnessMetadata(currentPackage);
    return {
      site: currentPackage.site || "",
      shiftDate: currentPackage.shiftDate || "",
      contentUpdatedAt: currentPackage.reviewConsole?.contentUpdatedAt || "",
      localSavedAt: currentPackage.reviewConsole?.localSavedAt || ""
    };
  }
};

function chooseImportMode(importedPackage, sourceLabel, options = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.className = "import-choice-overlay";
    const hasCurrent = !!(currentPackage && Array.isArray(currentPackage.records));
    const currentSite = firstStatedSiteName(
      els.activeMemorySiteInput && els.activeMemorySiteInput.value,
      currentPackage && currentPackage.site,
      currentPackageRecord && currentPackageRecord.site
    ) || "current site";
    const hasCurrentWorkingMemory = hasCurrent && (
      siteIsStated(currentPackage && currentPackage.site) ||
      (currentPackage.records || []).length > 0
    );
    overlay.innerHTML = `
      <div class="import-choice-card" role="dialog" aria-modal="true" aria-labelledby="importChoiceTitle">
        <h2 id="importChoiceTitle">Load JSON</h2>
        <p>Choose how to bring in <strong>${escapeHtml(sourceLabel || "imported JSON")}</strong>.</p>
        <div class="meta-grid">
          ${metaBox("Incoming site", importedPackage.site || "not stated")}
          ${metaBox("Incoming date", importedPackage.shiftDate || "not stated")}
          ${metaBox("Incoming records", String((importedPackage.records || []).length))}
          ${metaBox("Current site", currentSite)}
        </div>
        <div class="button-row import-choice-buttons">
          <button type="button" data-import-mode="create">Create New Saved Site</button>
          <button type="button" class="secondary" data-import-mode="append" ${hasCurrentWorkingMemory ? "" : "disabled"}>Append To Current</button>
          ${options.allowReplaceCurrent && hasCurrentWorkingMemory ? '<button type="button" class="secondary import-replace-button" data-import-mode="replace">Replace Current Working Memory</button>' : ""}
          <button type="button" class="secondary" data-import-mode="cancel">Cancel</button>
        </div>
        <p class="muted">Create New Saved Site makes a separate Saved Sites entry. Append To Current adds the incoming records to the site currently open in Working Memory.${options.allowReplaceCurrent ? " Replace Current Working Memory overwrites this browser's active working copy only after confirmation; it never changes the Dropbox file." : " Loading JSON never overwrites an existing saved site."}</p>
      </div>`;
    document.body.appendChild(overlay);
    const firstButton = overlay.querySelector("[data-import-mode='create']");
    if (firstButton) firstButton.focus();
    overlay.addEventListener("click", event => {
      const button = event.target.closest("[data-import-mode]");
      if (!button || button.disabled) return;
      const mode = button.dataset.importMode || "cancel";
      overlay.remove();
      resolve(mode);
    });
  });
}

async function replaceCurrentWorkingMemoryFromImport(importedPackage, sourceLabel) {
  const replacement = attachTemplateLibraryToPackage(structuredCloneSafe(importedPackage));
  const now = new Date().toISOString();
  currentPackage = normalizeImportedPackage(replacement);
  currentPackage.reviewConsole = {
    ...(currentPackage.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    replacedCurrentWorkingMemoryAt: now,
    replacedCurrentWorkingMemoryFrom: sourceLabel || "Dropbox JSON"
  };
  currentPackageRecord = createPackageRecord(currentPackage, sourceLabel || "Dropbox JSON");
  activeSiteFileOpen = true;
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  resetConfigTemplateSelectionToActiveSite();
  if (els.mainEntry) els.mainEntry.value = "";
  closeDetail();
  if (els.recordsRoot) els.recordsRoot.innerHTML = "";
  if (els.activeMemorySummary) els.activeMemorySummary.innerHTML = "";
  const saved = await saveCurrentPackageToLocalStorage({ silent: true, reason: "Dropbox working-copy replace" });
  dirty = !saved;
  render();
  hardSwitchActiveMemorySiteInputDelayed();
  await refreshArchive();
  if (saved) {
    setStatus(`Working copy replaced from ${sourceLabel}. Auto-saved on this device.`);
    showToast("Dropbox version loaded into Working Memory.");
  } else {
    setStatus(`Dropbox version opened, but browser storage could not save it: ${sourceLabel}.`);
    showToast("Dropbox version opened; local save failed.");
  }
}

async function createNewSavedSiteFromImport(importedPackage, sourceLabel) {
  const newPackage = attachTemplateLibraryToPackage(structuredCloneSafe(importedPackage));
  const now = new Date().toISOString();
  if (!siteIsStated(newPackage.site)) {
    newPackage.site = siteNameFromSourceLabel(sourceLabel) || "Imported Site";
  }
  newPackage.site = await uniqueSavedSiteName(newPackage.site, newPackage.shiftDate);
  newPackage.reviewConsole = {
    ...(newPackage.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    importedAsNewAt: now,
    importedAsNewFromSite: importedPackage.site || "not stated"
  };

  currentPackage = normalizeImportedPackage(newPackage);
  currentPackageRecord = null;
  selectedArchivePackageId = null;
  activeSiteFileOpen = true;
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  resetConfigTemplateSelectionToActiveSite();

  if (els.mainEntry) els.mainEntry.value = "";
  closeDetail();
  if (els.recordsRoot) els.recordsRoot.innerHTML = "";
  if (els.activeMemorySummary) els.activeMemorySummary.innerHTML = "";

  if (dbAvailable) {
    currentPackageRecord = createPackageRecord(currentPackage, sourceLabel || "imported JSON", { forceNew: true });
    await savePackageToDb(currentPackageRecord);
    currentPackage.reviewConsole.localPackageId = currentPackageRecord.id;
    currentPackageRecord.data = structuredCloneSafe(currentPackage);
    currentPackageRecord.statusSummary = summarizeStatus(currentPackage);
    currentPackageRecord.lastModified = new Date().toISOString();
    await savePackageToDb(currentPackageRecord);
    dirty = false;
    render();
    hardSwitchActiveMemorySiteInputDelayed();
    await refreshArchive();
    setStatus(`Created new saved site: ${currentPackageRecord.site}.`);
    showToast("New saved site created.");
    return;
  }

  dirty = true;
  render();
  hardSwitchActiveMemorySiteInputDelayed();
  await refreshArchive();
  setStatus("Opened JSON as a new site. Browser storage is unavailable; use Email Current Memory or Dropbox to keep a copy.");
  showToast("JSON loaded.");
}

async function uniqueSavedSiteName(siteName, shiftDate) {
  const base = siteIsStated(siteName) ? String(siteName).trim() : "Imported Site";
  if (!dbAvailable) return base;
  try {
    const records = await getAllPackagesFromDb();
    const date = String(shiftDate || "").trim();
    const matches = name => records.some(record => {
      const sameName = normalizeSavedSiteMatchText(record.site) === normalizeSavedSiteMatchText(name);
      const sameDate = !date || String(record.shiftDate || "").trim() === date;
      return sameName && sameDate;
    });
    if (!matches(base)) return base;
    let index = 2;
    let candidate = `${base} (${index})`;
    while (matches(candidate)) {
      index += 1;
      candidate = `${base} (${index})`;
    }
    return candidate;
  } catch (error) {
    console.warn("Could not check duplicate saved-site name", error);
    return base;
  }
}

function siteNameFromSourceLabel(sourceLabel) {
  const clean = String(sourceLabel || "").trim().replace(/\.json$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return clean || "";
}

function appendImportedPackageToCurrent(importedPackage, sourceLabel) {
  if (!currentPackage || !Array.isArray(currentPackage.records)) currentPackage = createEmptyPackage();
  if (!Array.isArray(importedPackage.records)) importedPackage.records = [];

  const summary = appendPackageRecords(currentPackage, importedPackage, sourceLabel);
  currentPackage.reviewConsole = {
    ...(currentPackage.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    modifiedAt: new Date().toISOString(),
    model: "two-level-records-with-record-flags",
    activeWorkingMemoryRule: "json-import-create-new-or-append-current"
  };
  activeSiteFileOpen = true;
  currentPackageRecord = createPackageRecord(currentPackage, currentPackageRecord?.sourceLabel || "active working memory");
  return summary;
}

function importDedupeKey(record) {
  return [record.sourceDate || "", record.category || "", record.sourceText || record.description || ""]
    .join("::")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}



async function createNewSite() {
  const hasActiveRecords = currentPackage && Array.isArray(currentPackage.records) && currentPackage.records.length > 0;
  if (hasActiveRecords || dirty) {
    const ok = confirm("Create a new blank saved site? This clears only the current Working Memory screen. Existing Saved Sites remain available.");
    if (!ok) return;
  }

  const siteName = prompt("Name the new site / memory:", "");
  if (siteName === null) {
    setStatus("New blank site cancelled.");
    return;
  }
  const cleanSiteName = String(siteName || "").trim();
  if (!cleanSiteName) {
    showToast("Site name required.");
    setStatus("New blank site was not created. Enter a site name first.");
    return;
  }

  const defaultDate = todayString();
  const dateValue = prompt("Site date (YYYY-MM-DD):", defaultDate);
  if (dateValue === null) {
    setStatus("New blank site cancelled.");
    return;
  }
  const cleanDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || "").trim()) ? String(dateValue).trim() : defaultDate;

  currentPackageRecord = null;
  selectedArchivePackageId = null;
  activeSiteFileOpen = false;
  currentPackage = createEmptyPackage();
  currentPackage.site = cleanSiteName;
  currentPackage.shiftDate = cleanDate;
  currentPackage.source = currentPackage.source || { captureMethod: "manual entry", rawText: "" };
  currentPackage.reviewConsole = {
    ...(currentPackage.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    newBlankSavedSiteCreatedAt: new Date().toISOString()
  };
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;

  if (els.mainEntry) els.mainEntry.value = "";
  writeActiveMemorySiteInputValue(cleanSiteName);
  closeDetail();
  if (els.recordsRoot) els.recordsRoot.innerHTML = "";
  if (els.detailContent) els.detailContent.innerHTML = "";

  if (dbAvailable) {
    try {
      currentPackageRecord = createPackageRecord(currentPackage, "new blank site", { forceNew: true });
      // v0.5.95: creating/opening a site should highlight the active row but keep
      // the B02 Saved Sites edit box collapsed until the user clicks the row.
      selectedArchivePackageId = null;
      activeSiteFileOpen = true;
      await savePackageToDb(currentPackageRecord);
      dirty = false;
      render();
      await refreshArchive();
      setStatus(`New blank site created and saved: ${cleanSiteName}.`);
      showToast("New saved site ready.");
      return;
    } catch (error) {
      console.error(error);
      currentPackageRecord = null;
      selectedArchivePackageId = null;
      activeSiteFileOpen = false;
      dirty = true;
      render();
      await refreshArchive();
      setStatus(`New site opened but could not be saved locally: ${error.message}`);
      showToast("New site opened; save failed.");
      return;
    }
  }

  dirty = true;
  render();
  await refreshArchive();
  setStatus("New blank site opened. Browser storage is unavailable; use Email Current Memory or Dropbox to keep a copy.");
  showToast("New blank site ready.");
}

function addMainRecordFromInput() {
  const text = els.mainEntry.value.trim();
  if (!text) {
    flashHint("Enter a record first.");
    return;
  }

  if (!currentPackage || !Array.isArray(currentPackage.records)) {
    currentPackage = createEmptyPackage();
  }
  if (!currentPackage.packageType) currentPackage.packageType = "sitescribe_two_level_records";
  if (!currentPackage.shiftDate) currentPackage.shiftDate = todayString();
  if (!currentPackage.processedAt) currentPackage.processedAt = new Date().toISOString();
  if (!currentPackage.source) currentPackage.source = { captureMethod: "manual entry", rawText: "" };

  const parsed = parseMainEntry(text);
  const intent = normalizeIntentValue(els.mainEntryIntent?.value) || "documentation_internal";
  const now = new Date().toISOString();
  const record = {
    id: createId("rec"),
    category: parsed.category,
    description: parsed.description,
    status: "open",
    createdAt: now,
    updatedAt: now,
    closedAt: "",
    sourceDate: dateFromIso(now) || todayString(),
    sourceText: text,
    flags: [],
    comments: [],
    deliverable: { apply: false, date: "" },
    intent,
    intentSource: "manual_user_confirmed",
    intentConfidence: "confirmed",
    sortOrder: Date.now()
  };
  const routing = resolveRecordRouting(record);
  if (routing.status === "resolved") record.directedTo = normalizeDirectedTo(routing);

  currentPackage.records.push(record);
  currentPackage.source.rawText = [currentPackage.source.rawText, text].filter(Boolean).join("\n");

  // v0.6.29: stay in rapid entry mode after creating a primary record.
  // The new record is displayed in Working Memory, but the detail panel is not forced open.
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  if (els.detailPanel) {
    els.detailPanel.classList.remove("open");
    els.detailPanel.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("detail-panel-open");
  }
  els.mainEntry.value = "";
  markDirty();
  render();

  // v0.6.30: desktop can refocus for keyboard-speed entry.
  // Mobile/iPhone should not be forced back into focus because iOS may show an
  // extra keyboard checkmark/Done confirmation step that interrupts entry rhythm.
  if (shouldAutoFocusMainEntryAfterCreate() && els.mainEntry && typeof els.mainEntry.focus === "function") {
    els.mainEntry.focus();
  }

  setStatus(shouldAutoFocusMainEntryAfterCreate()
    ? "Main record created and added to Working Memory. Entry box is ready for another record."
    : "Main record created and added to Working Memory.");
  showToast("Main record created.");
}

function shouldAutoFocusMainEntryAfterCreate() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  try {
    return !window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  } catch (error) {
    return true;
  }
}

function parseMainEntry(text) {
  const raw = text.trim();

  // Manual entry rule: the first word is usually the category cue.
  // Accept plain first-word cues and first-word cues followed by punctuation:
  // "followup call", "followup. call", "followup: call", "followup, call", "followup - call".
  const firstWordMatch = raw.match(/^([a-zA-Z][a-zA-Z-]*)(?:[\s]*[\.:,;\-]+)?\s*(.*)$/);
  const firstCue = firstWordMatch ? normalizeCue(firstWordMatch[1]) : "";
  let category = cueToCategory(firstCue);
  let description = firstWordMatch ? firstWordMatch[2].trim() : "";

  if (!category) {
    const match = raw.match(/^([a-zA-Z\-/ ]{2,30})\s*[:,\-]\s*(.+)$/);
    const cue = match ? normalizeCue(match[1]) : normalizeCue(raw.split(/\s+/)[0]);
    category = cueToCategory(cue);
    description = match ? match[2].trim() : raw.replace(/^\w+\s+/, "").trim();
  }

  if (!category) {
    category = "event";
    description = raw;
  }
  if (category === "scheduled" && !hasScheduledDateOrTime(description)) category = "action";
  return { category, description: description || raw };
}

function cueToCategory(cue) {
  const map = {
    event: "event", timeline: "event", log: "event",
    action: "action", todo: "action", "to-do": "action", task: "action",
    followup: "followup", "follow-up": "followup", waiting: "followup", wait: "followup",
    scheduled: "scheduled", schedule: "scheduled", appointment: "scheduled", meeting: "scheduled",
    safety: "safety", hazard: "safety", warning: "safety", violation: "safety",
    communication: "communication", email: "communication", call: "communication", message: "communication",
    document: "document", doc: "document", file: "document", insurance: "document", permit: "document", liftplan: "document", "lift-plan": "document"
  };
  return map[cue] || null;
}

function hasScheduledDateOrTime(text) {
  return /\b(\d{1,2}:\d{2}\s*(am|pm)?|\d{1,2}\s*(am|pm)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}-\d{2}-\d{2})\b/i.test(text);
}

function siteIsStated(value) {
  const text = String(value || "").trim();
  return !!text && text.toLowerCase() !== "not stated";
}

function firstStatedSiteName(...values) {
  for (const value of values) {
    if (siteIsStated(value)) return String(value).trim();
  }
  return "";
}

function activeMemorySiteValueFromPackage(pkg = currentPackage) {
  return siteIsStated(pkg?.site) ? String(pkg.site).trim() : "";
}

function writeActiveMemorySiteInputValue(value) {
  if (!els.activeMemorySiteInput) return;
  const cleanValue = String(value || "").trim();

  // Always blank first. This prevents iOS/Safari from visually retaining the previous
  // saved site's input value when a newly loaded JSON has no stated site name.
  els.activeMemorySiteInput.value = "";
  els.activeMemorySiteInput.defaultValue = "";
  els.activeMemorySiteInput.setAttribute("value", "");

  if (cleanValue) {
    els.activeMemorySiteInput.value = cleanValue;
    els.activeMemorySiteInput.defaultValue = cleanValue;
    els.activeMemorySiteInput.setAttribute("value", cleanValue);
  }
}

function syncActiveMemorySiteInput(options = {}) {
  if (!els.activeMemorySiteInput) return;
  if (!options.force && document.activeElement === els.activeMemorySiteInput) return;
  writeActiveMemorySiteInputValue(activeMemorySiteValueFromPackage());
}

function forceSyncActiveMemorySiteInput() {
  if (!els.activeMemorySiteInput) return;
  writeActiveMemorySiteInputValue(activeMemorySiteValueFromPackage());
}

function hardSwitchActiveMemorySiteInput() {
  // v0.5.35: package switches must overwrite the UI field even on iOS/Safari.
  // A JSON with missing/blank/"not stated" site must show a blank field, never the previous saved site's name.
  forceSyncActiveMemorySiteInput();
}

function hardSwitchActiveMemorySiteInputDelayed() {
  // iOS/Safari can restore form values just after file-picker/import UI returns.
  // Re-apply the package-derived value several times after the switch.
  hardSwitchActiveMemorySiteInput();
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(hardSwitchActiveMemorySiteInput);
  setTimeout(hardSwitchActiveMemorySiteInput, 0);
  setTimeout(hardSwitchActiveMemorySiteInput, 75);
  setTimeout(hardSwitchActiveMemorySiteInput, 250);
}

function commitActiveMemorySiteInput(options = {}) {
  if (!els.activeMemorySiteInput) return false;
  const name = String(els.activeMemorySiteInput.value || "").trim();
  if (!name) {
    if (!options.silent) {
      showToast("Enter a site or memory name first.");
      setStatus("Enter a Site / Memory Name, then apply it before saving or exporting.");
    }
    return false;
  }
  if (!currentPackage || typeof currentPackage !== "object") currentPackage = createEmptyPackage();
  if (currentPackage.site === name) return false;

  currentPackage.site = name;
  currentPackage.reviewConsole = {
    ...(currentPackage.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    siteNameEditedAt: new Date().toISOString()
  };
  currentPackage.reviewConsole.contentUpdatedAt = currentPackage.reviewConsole.siteNameEditedAt;

  if (currentPackageRecord) {
    currentPackageRecord.site = name;
    currentPackageRecord.title = `${name} - ${currentPackage.shiftDate || todayString()}`;
    currentPackageRecord.lastModified = new Date().toISOString();
    currentPackageRecord.statusSummary = summarizeStatus(currentPackage);
    currentPackageRecord.data = structuredCloneSafe(currentPackage);
  }

  dirty = true;
  return true;
}


function cloneUiConfig(config) {
  return structuredCloneSafe(config || DEFAULT_UI_CONFIG);
}

function mergeUiConfig(config) {
  const source = config || {};
  const sourceTitles = { ...(source.titles || {}) };
  if (sourceTitles.B04 === "Add Manual Record") sourceTitles.B04 = "Record Intake";
  const sourceSubtitles = { ...(source.subtitles || {}) };
  if (sourceSubtitles.B04 === "Categories: event, action, followup, scheduled, safety, communication, document") {
    sourceSubtitles.B04 = DEFAULT_UI_CONFIG.subtitles.B04;
  }
  const merged = {
    titles: {
      ...DEFAULT_UI_CONFIG.titles,
      ...sourceTitles
    },
    subtitles: {
      ...DEFAULT_UI_CONFIG.subtitles,
      ...sourceSubtitles
    },
    pills: {}
  };
  Object.keys(DEFAULT_UI_CONFIG.pills || {}).forEach(group => {
    merged.pills[group] = {
      ...(DEFAULT_UI_CONFIG.pills[group] || {}),
      ...((source.pills && source.pills[group]) || {})
    };
  });
  Object.keys((source.pills || {})).forEach(group => {
    if (!merged.pills[group]) merged.pills[group] = { ...(source.pills[group] || {}) };
  });
  return merged;
}

function saveDefaultTemplateUiConfig(config) {
  try {
    if (window.localStorage) window.localStorage.setItem(DEFAULT_TEMPLATE_STORAGE_KEY, JSON.stringify(mergeUiConfig(config)));
  } catch (_) {}
}


function hasActiveSiteFileOpen() {
  return !!(activeSiteFileOpen || (currentPackageRecord && currentPackageRecord.id));
}


function activeTemplateNameForDisplay() {
  try {
    return getTemplateById(currentSiteTemplateId()).name || "Default";
  } catch (_) {
    return "Default";
  }
}

function activeTemplateVersionForDisplay() {
  try {
    return normalizeTemplateVersion(getTemplateById(currentSiteTemplateId()).templateVersion || "1.0.0");
  } catch (_) {
    return "1.0.0";
  }
}

function b01HardcodedStatusPrompt() {
  const records = (currentPackage && Array.isArray(currentPackage.records)) ? currentPackage.records : [];
  const site = (currentPackage && currentPackage.site && String(currentPackage.site).trim()) ? String(currentPackage.site).trim() : "not stated";
  const shiftDate = (currentPackage && currentPackage.shiftDate && String(currentPackage.shiftDate).trim()) ? String(currentPackage.shiftDate).trim() : "not stated";
  const template = activeTemplateNameForDisplay();
  const templateVersion = activeTemplateVersionForDisplay();
  return `Opened: ${site} | ${shiftDate} | ${records.length} records | app: ${APP_VERSION} | tmpl: ${template} v${templateVersion}`;
}

function subtitleForBox(boxId) {
  if (boxId === "B01") return b01HardcodedStatusPrompt();
  const config = getActiveUiConfig();
  return (config.subtitles && config.subtitles[boxId]) || DEFAULT_UI_CONFIG.subtitles[boxId] || "";
}

function pillLabel(group, key) {
  const config = getActiveUiConfig();
  return (config.pills && config.pills[group] && config.pills[group][key]) || (DEFAULT_UI_CONFIG.pills[group] && DEFAULT_UI_CONFIG.pills[group][key]) || key;
}

function setTextIfFound(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function setPlaceholderIfFound(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute("placeholder", text || "");
}

function setButtonLabel(button, text) {
  if (!button || !text) return;
  button.textContent = text;
  button.setAttribute("aria-label", text);
}

function applyUiConfigToScreen() {
  const config = getActiveUiConfig();
  setTextIfFound('[data-box-key="box.main.import"] h2', config.titles.B01);
  setTextIfFound('[data-box-key="box.main.savedSites"] h2', config.titles.B02);
  setTextIfFound('[data-box-key="box.main.manualRecord"] h2', config.titles.B04);
  setTextIfFound('[data-box-key="box.main.workingMemory"] h2', config.titles.B05);

  if (els.statusLine) els.statusLine.textContent = subtitleForBox("B01");
  setTextIfFound("#manualEntryFeatureHint", subtitleForBox("B04"));
  setPlaceholderIfFound("#mainEntry", "Enter one record manually");

  if (els.recordsRoot && els.recordsRoot.classList.contains("empty")) els.recordsRoot.textContent = subtitleForBox("B05");

  setButtonLabel(els.reportsButton, pillLabel("B01", "reports"));
  if (els.dropZone) els.dropZone.textContent = pillLabel("B01", "loadJson");

  setButtonLabel(els.refreshArchiveButton, pillLabel("B02", "refresh"));
  setButtonLabel(els.createNewSiteButton, pillLabel("B02", "newBlank"));

  setButtonLabel(els.addMainButton, pillLabel("B04", "addRecord"));
  setButtonLabel(els.sortNewestButton, pillLabel("B05", "sortNewest"));
  setButtonLabel(els.sortOldestButton, pillLabel("B05", "sortOldest"));
  updateClosedToggleButton();

  setButtonLabel(els.emailJsonButton, pillLabel("footer", "email"));
}

const CONFIG_BOX_FIELDS = {
  B01: {
    heading: "B01 - Bring In Site Notes",
    note: "Rename the panel title and visible pills in the JSON import box. The B01 status line is hardcoded by the app.",
    title: true,
    subtitle: false,
    pillGroup: "B01",
    pills: [
      ["loadJson", "Load JSON pill"],
      ["reports", "Reports pill"]
    ]
  },
  B02: {
    heading: "B02 - Saved Sites",
    note: "B02 is the site file list/control box. Bulk clear is not exposed in the normal workflow; use single-site Delete for housekeeping.",
    title: true,
    subtitle: false,
    pillGroup: "B02",
    pills: [
      ["refresh", "Refresh pill"],
      ["newBlank", "New Blank Site pill"]
    ]
  },
  B04: {
    heading: "B04 - Record Intake",
    note: "Rename the overall Record Intake title, the manual-entry guidance, and the add-record pill. Parse Notes remains a distinct protected workflow.",
    title: true,
    subtitle: true,
    pillGroup: "B04",
    pills: [["addRecord", "Add Record pill"]]
  },
  B05: {
    heading: "B05 - Working Memory",
    note: "Rename the working-memory title, empty-list subtitle, and list-control pills.",
    title: true,
    subtitle: true,
    pillGroup: "B05",
    pills: [
      ["sortNewest", "Sort Newest pill"],
      ["sortOldest", "Sort Oldest pill"],
      ["hideClosed", "Hide Closed pill"],
      ["showClosed", "Show Closed pill"]
    ]
  }
};







function configPanelIsOpen() {
  return !!(els.configPanel && els.configPanel.classList.contains("open"));
}


async function openReportsPanel() {
  if (!els.reportsPanel) return;
  ensureReportDateDefaults();
  els.reportsPanel.classList.add("open");
  els.reportsPanel.setAttribute("aria-hidden", "false");
  setCustomAiReportPrototypeVisibility();
  generateReport();
}

function setCustomAiReportPrototypeVisibility() {
  if (!els.customAiReportPrototype) return;
  const includeAiReport = !!els.aiReportMode?.value && els.aiReportMode.value !== "none";
  els.customAiReportPrototype.hidden = !includeAiReport;
}

function closeReportsPanel() {
  if (!els.reportsPanel) return;
  els.reportsPanel.classList.remove("open");
  els.reportsPanel.setAttribute("aria-hidden", "true");
}

function ensureReportDateDefaults(options = {}) {
  const scopeKey = currentReportFilterScopeKey();
  const scopeChanged = reportFilterScopeKey !== scopeKey;
  const shouldReset = !!options.force || scopeChanged;
  const bounds = reportDateBoundsForCurrentPackage();

  if (els.reportFromDate && (shouldReset || !els.reportFromDate.value)) els.reportFromDate.value = bounds.from;
  if (els.reportToDate && (shouldReset || !els.reportToDate.value)) els.reportToDate.value = bounds.to;

  reportFilterScopeKey = scopeKey;
}

function currentReportFilterScopeKey() {
  const records = getReportSourceRecords();
  const recordIds = records.slice(0, 5).map(record => record.id || record.description || "").join("|");
  return [
    currentPackageRecord?.id || currentPackage?.reviewConsole?.localPackageId || "active",
    currentPackage?.site || "",
    currentPackage?.shiftDate || "",
    String(records.length),
    recordIds
  ].join("::");
}

function reportDateBoundsForCurrentPackage() {
  const records = getReportSourceRecords();
  const dates = records.flatMap(record => [
    recordReportDate(record),
    ...(record.comments || []).flatMap(comment => [
      commentReportDate(comment, record),
      ...(comment.activities || []).map(activity => commentReportDate(activity, record))
    ])
  ]).filter(Boolean).sort();
  const today = todayString();
  const fallback = currentPackage?.shiftDate || today;
  const from = dates[0] || fallback;
  const to = today;
  return { from, to };
}

function getReportFilters() {
  const categories = Array.from(document.querySelectorAll(".reportCategory:checked")).map(input => input.value);
  const statuses = [];
  if (!els.reportStatusOpen || els.reportStatusOpen.checked) statuses.push("open");
  if (!els.reportStatusClosed || els.reportStatusClosed.checked) statuses.push("closed");
  return {
    type: els.reportType?.value || "daily",
    from: els.reportFromDate?.value || "",
    to: els.reportToDate?.value || "",
    sortOrder: els.reportSortOrder?.value || "default",
    categories,
    statuses
  };
}

function resolvedReportSortOrder(filters = getReportFilters()) {
  if (filters.sortOrder === "date_asc" || filters.sortOrder === "date_desc") return filters.sortOrder;
  if (filters.type === "open") return "priority";
  if (filters.type === "email_activity") return "date_desc";
  return "date_asc";
}

function compareReportDates(leftDate, rightDate, direction = "date_asc") {
  const left = String(leftDate || "");
  const right = String(rightDate || "");
  if (!left && right) return 1;
  if (left && !right) return -1;
  const result = left.localeCompare(right);
  return direction === "date_desc" ? -result : result;
}

function sortReportPrimaryRecords(records, filters = getReportFilters()) {
  const direction = resolvedReportSortOrder(filters);
  if (direction === "priority") return [...records];
  return [...records].sort((left, right) =>
    compareReportDates(recordReportDate(left), recordReportDate(right), direction)
      || (direction === "date_desc" ? compareRecordChronologyDesc(left, right) : compareRecordChronologyAsc(left, right))
  );
}

function sortReportSecondaryRows(rows, filters = getReportFilters()) {
  const direction = resolvedReportSortOrder(filters);
  if (direction === "priority") return [...rows];
  return [...rows].sort((left, right) =>
    compareReportDates(left.date, right.date, direction)
      || String(left.comment?.createdAt || "").localeCompare(String(right.comment?.createdAt || "")) * (direction === "date_desc" ? -1 : 1)
  );
}

function getReportSourceRecords() {
  return (currentPackage && Array.isArray(currentPackage.records)) ? currentPackage.records : [];
}

function getFilteredReportRecords(filters = getReportFilters()) {
  return getReportSourceRecords().filter(record => {
    const category = categoryIdLabel(record.category);
    const status = normalizeLegacyStatus(record.status);
    const date = recordReportDate(record);
    if (filters.categories.length && !filters.categories.includes(category)) return false;
    if (filters.statuses.length && !filters.statuses.includes(status)) return false;
    if (filters.from && date && date < filters.from) return false;
    if (filters.to && date && date > filters.to) return false;
    return true;
  });
}

function getHoursReportSourceRecords(filters = getReportFilters()) {
  return getReportSourceRecords().filter(record => {
    const category = categoryIdLabel(record.category);
    return !filters.categories.length || filters.categories.includes(category);
  });
}

function recordReportDate(record) {
  return recordCreationDate(record) || currentPackage?.shiftDate || "";
}

function recordCreationDate(record) {
  return dateFromIso(record?.createdAt) || dateFromIso(record?.updatedAt) || record?.sourceDate || record?.sourceLogDate || "";
}

function commentReportDate(comment, parentRecord) {
  return normalizeDateOnly(comment?.workDate) || dateFromIso(comment?.createdAt) || dateFromIso(comment?.updatedAt) || recordReportDate(parentRecord);
}

function commentEditorWorkDate(comment, parentRecord) {
  if (!comment) return todayString();
  return normalizeDateOnly(comment.workDate)
    || dateFromIso(comment.createdAt)
    || dateFromIso(comment.updatedAt)
    || recordReportDate(parentRecord)
    || todayString();
}

const EXPENSE_TYPES = [
  ["accommodations", "Accommodations"], ["rental_vehicle", "Rental vehicle"], ["fuel", "Fuel"],
  ["meals", "Meals"], ["airfare", "Airfare"], ["mileage_personal_vehicle", "Mileage - personal vehicle"],
  ["parking_tolls", "Parking / tolls"], ["ground_transportation", "Ground transportation"],
  ["supplies_materials", "Supplies / materials"], ["other", "Other"]
];

function normalizeBillingType(value, legacyHourType = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (["regular", "overtime", "expense"].includes(normalized)) return normalized;
  return normalizeHourType(legacyHourType);
}

function commentBillingType(comment) {
  return normalizeBillingType(comment?.billingType, comment?.hourType);
}

function commentEditorBillingType(comment) {
  return comment ? commentBillingType(comment) : "regular";
}

function isTimeBillingType(type) {
  return type === "regular" || type === "overtime";
}

function normalizeExpenseType(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  return EXPENSE_TYPES.some(([id]) => id === normalized) ? normalized : "";
}

function expenseTypeLabel(value) {
  const type = normalizeExpenseType(value);
  return EXPENSE_TYPES.find(([id]) => id === type)?.[1] || "Uncategorized";
}

function parseExpenseAmount(value) {
  const text = String(value ?? "").trim().replace(/^\$/, "").replace(/,/g, "");
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number * 100) / 100;
}

function expenseAmountForComment(comment) {
  const amount = parseExpenseAmount(comment?.expenseAmount);
  return amount != null ? amount : 0;
}

function normalizeExpenseCurrency(value) {
  return String(value || "").trim().toUpperCase() === "USD" ? "USD" : "CAD";
}

function expenseCurrencyForComment(comment) {
  return normalizeExpenseCurrency(comment?.expenseCurrency);
}

function formatCurrency(value, currency = "CAD") {
  const amount = Number(value) || 0;
  const normalized = normalizeExpenseCurrency(currency);
  return new Intl.NumberFormat(normalized === "USD" ? "en-US" : "en-CA", { style: "currency", currency: normalized }).format(amount);
}

function expenseTotalsByCurrency(rows) {
  return rows.reduce((totals, row) => {
    const currency = expenseCurrencyForComment(row.comment);
    totals[currency] += expenseAmountForComment(row.comment);
    return totals;
  }, { CAD: 0, USD: 0 });
}

function secondaryReportSelectionKey(record, comment, activity = null) {
  return `${record?.id || "record"}::${comment?.id || "secondary"}${activity ? `::${activity.id || "activity"}` : ""}`;
}

function primaryReportSelectionKey(record) {
  return `primary::${record?.id || "record"}`;
}

function resetReportSelection() {
  reportSelectionScopeKey = "";
  reportSelectedKeys = new Set();
  reportSelectionInitialized = false;
}

function reportPrimaryMatchesFilters(record, filters) {
  const status = normalizeLegacyStatus(record.status);
  const date = recordReportDate(record);
  if (filters.statuses.length && !filters.statuses.includes(status)) return false;
  if (filters.from && date && date < filters.from) return false;
  if (filters.to && date && date > filters.to) return false;
  return true;
}

function reportSelectionGroups(filters) {
  const workingRecords = sortRecordsForWorkingMemory(getHoursReportSourceRecords(filters));
  const records = sortReportPrimaryRecords(workingRecords, filters);
  return records.map(record => {
    if (filters.type === "mds" && normalizeLegacyStatus(record.status) === "closed") return null;
    const rows = sortReportSecondaryRows(reportChildRows(record, filters), filters);
    const primaryKey = filters.type === "hours" || filters.type === "mds" || !reportPrimaryMatchesFilters(record, filters)
      ? ""
      : primaryReportSelectionKey(record);
    return primaryKey || rows.length ? { record, primaryKey, rows } : null;
  }).filter(Boolean);
}

function reportChildRows(record, filters) {
  const rows = [];
  sortSecondaryRecordsForRecord(record).forEach(comment => {
    const commentClosed = normalizeLegacyStatus(comment.status) === "closed";
    if (!(filters.type === "mds" && commentClosed) && reportCommentMatchesFilters(comment, record, filters)) {
      const hours = reportCommentHours(comment);
      rows.push({ record, comment, parentComment: null, level: "secondary", date: commentReportDate(comment, record), hours: hours != null && hours > 0 ? hours : null, key: secondaryReportSelectionKey(record, comment) });
    }
    if (commentClosed) return;
    sortActivityRecordsForComment(comment).forEach(activity => {
      if (filters.type === "mds" && normalizeLegacyStatus(activity.status) === "closed") return;
      if (!reportCommentMatchesFilters(activity, record, filters)) return;
      const hours = reportCommentHours(activity);
      rows.push({ record, comment: activity, parentComment: comment, level: "activity", date: commentReportDate(activity, record), hours: hours != null && hours > 0 ? hours : null, key: secondaryReportSelectionKey(record, comment, activity) });
    });
  });
  return rows;
}

function reportSelectionKeys(groups) {
  return groups.flatMap(group => [group.primaryKey, ...group.rows.map(row => row.key)]).filter(Boolean);
}

function currentReportSelectionScope(filters, groups) {
  const keys = reportSelectionKeys(groups);
  return [
    currentReportFilterScopeKey(),
    filters.type,
    filters.from,
    filters.to,
    (filters.categories || []).join(","),
    (filters.statuses || []).join(","),
    filters.sortOrder || "default",
    keys.join("|")
  ].join("::");
}

function renderReportRecordSelector(filters) {
  if (!els.hoursRecordSelector || !els.hoursRecordSelectionList) return;
  if (filters.type === "email_activity") {
    els.hoursRecordSelector.hidden = true;
    return;
  }
  els.hoursRecordSelector.hidden = false;
  if (els.hoursRecordSelectorTitle) {
    els.hoursRecordSelectorTitle.textContent = filters.type === "mds" ? "Choose MDS Billing Time Blocks" : (filters.type === "hours" ? "Choose Record Entries" : "Choose Records");
  }
  if (els.hoursRecordSelectorSite) {
    const guidance = filters.type === "mds"
      ? "Selected Reg/OT time blocks and Expense lines are exported. Untagged hours and expenses without an amount remain out of the MDS workbook."
      : (filters.type === "hours"
      ? "All matching secondary and activity records are listed and selected by default."
      : (filters.type === "open"
        ? "Choose which records feed the prioritized Open Items Report; urgency sections remain unchanged."
        : "Primary records use Created Date; secondary records use Work Date when present, otherwise Created Date."));
    els.hoursRecordSelectorSite.textContent = `Active site: ${reportSiteName()} · ${guidance}`;
  }

  const groups = reportSelectionGroups(filters);
  const scopeKey = currentReportSelectionScope(filters, groups);
  const allKeys = reportSelectionKeys(groups);
  if (!reportSelectionInitialized || reportSelectionScopeKey !== scopeKey) {
    reportSelectedKeys = new Set(allKeys);
    reportSelectionInitialized = true;
    reportSelectionScopeKey = scopeKey;
  }

  if (els.selectAllHoursButton) els.selectAllHoursButton.disabled = !allKeys.length;
  if (els.clearHoursButton) els.clearHoursButton.disabled = !allKeys.length;

  if (!groups.length) {
    els.hoursRecordSelectionList.innerHTML = `<p class="report-empty">No records match the selected date, category, and status filters.</p>`;
    return;
  }

  const selectedCount = allKeys.filter(key => reportSelectedKeys.has(key)).length;
  els.hoursRecordSelectionList.innerHTML = `<div class="hours-selection-summary">${selectedCount} of ${allKeys.length} ${allKeys.length === 1 ? "record" : "records"} selected</div>${groups.map(group => `
    <section class="hours-selection-group">
      <label class="hours-selection-group-heading">
        <input type="checkbox" class="hoursPrimaryChoice" data-record-id="${escapeHtml(group.record.id || "")}" data-primary-key="${escapeHtml(group.primaryKey || "")}" />
        <span>${escapeHtml(group.record.description || "Untitled primary record")}</span>
        <span class="hours-primary-count">${group.primaryKey ? "Primary · " : ""}${group.rows.length} ${group.rows.length === 1 ? "record entry" : "record entries"}</span>
      </label>
      <div class="hours-selection-rows">${group.rows.map(row => `
        <label class="hours-selection-row">
          <input type="checkbox" class="hoursRecordChoice" data-hours-key="${escapeHtml(row.key)}" ${reportSelectedKeys.has(row.key) ? "checked" : ""} />
          <span class="hours-selection-text">${row.parentComment ? `<span class="hours-activity-parent">${escapeHtml(row.parentComment.text || "Untitled secondary record")} › </span>` : ""}${escapeHtml(row.comment.text || "Untitled secondary record")}</span>
          <span class="hours-selection-meta">${escapeHtml(formatShortDate(row.date) || row.date || "not stated")}${filters.type === "hours" || filters.type === "mds" ? ` · ${commentBillingType(row.comment) === "expense" ? `${escapeHtml(formatCurrency(expenseAmountForComment(row.comment), expenseCurrencyForComment(row.comment)))} · ${escapeHtml(expenseTypeLabel(row.comment.expenseType))}` : (row.hours != null && row.hours > 0 ? `${escapeHtml(formatHoursInputValue(row.hours))} hrs` : "0 hrs (not recorded)")}${filters.type === "mds" ? ` · ${commentBillingType(row.comment) === "regular" ? "Reg" : (commentBillingType(row.comment) === "overtime" ? "OT" : (commentBillingType(row.comment) === "expense" ? "Expense" : "untagged"))}` : ""}` : ""} · ${escapeHtml(statusLabel(row.comment.status))}</span>
        </label>`).join("")}</div>
    </section>`).join("")}`;
  syncReportPrimaryCheckboxStates();
}

function syncReportPrimaryCheckboxStates() {
  if (!els.hoursRecordSelectionList) return;
  els.hoursRecordSelectionList.querySelectorAll(".hours-selection-group").forEach(group => {
    const primary = group.querySelector(".hoursPrimaryChoice");
    const children = Array.from(group.querySelectorAll(".hoursRecordChoice"));
    if (!primary) return;
    const keys = [primary.dataset.primaryKey, ...children.map(child => child.dataset.hoursKey)].filter(Boolean);
    const selected = keys.filter(key => reportSelectedKeys.has(key)).length;
    primary.checked = !!keys.length && selected === keys.length;
    primary.indeterminate = selected > 0 && selected < keys.length;
    primary.setAttribute("aria-checked", primary.indeterminate ? "mixed" : String(primary.checked));
  });
}

function handleReportRecordSelectionChange(event) {
  const primary = event.target.closest(".hoursPrimaryChoice");
  if (primary) {
    const group = primary.closest(".hours-selection-group");
    if (!group) return;
    const primaryKey = primary.dataset.primaryKey || "";
    if (primaryKey) {
      if (primary.checked) reportSelectedKeys.add(primaryKey);
      else reportSelectedKeys.delete(primaryKey);
    }
    group.querySelectorAll(".hoursRecordChoice").forEach(checkbox => {
      const key = checkbox.dataset.hoursKey || "";
      checkbox.checked = primary.checked;
      if (!key) return;
      if (primary.checked) reportSelectedKeys.add(key);
      else reportSelectedKeys.delete(key);
    });
    reportSelectionInitialized = true;
    generateReport();
    return;
  }
  const checkbox = event.target.closest(".hoursRecordChoice");
  if (!checkbox) return;
  const key = checkbox.dataset.hoursKey || "";
  if (!key) return;
  if (checkbox.checked) reportSelectedKeys.add(key);
  else reportSelectedKeys.delete(key);
  reportSelectionInitialized = true;
  generateReport();
}

function selectAllReportRows() {
  const childKeys = Array.from(document.querySelectorAll(".hoursRecordChoice")).map(input => input.dataset.hoursKey).filter(Boolean);
  const primaryKeys = Array.from(document.querySelectorAll(".hoursPrimaryChoice")).map(input => input.dataset.primaryKey).filter(Boolean);
  reportSelectedKeys = new Set([...primaryKeys, ...childKeys]);
  reportSelectionInitialized = true;
  generateReport();
}

function clearReportRows() {
  reportSelectedKeys = new Set();
  reportSelectionInitialized = true;
  generateReport();
}

function selectedReportRecords(filters) {
  return reportSelectionGroups(filters).map(group => {
    const primarySelected = !!group.primaryKey && reportSelectedKeys.has(group.primaryKey);
    const selectedRows = group.rows.filter(row => reportSelectedKeys.has(row.key));
    if (!primarySelected && !selectedRows.length) return null;
    return {
      ...group.record,
      comments: selectedRows.map(row => row.parentComment ? { ...row.comment, __reportParentText: row.parentComment.text || "Untitled secondary record", __reportLevel: "activity" } : row.comment),
      flags: primarySelected ? [...(group.record.flags || [])] : [],
      __reportPrimarySelected: primarySelected,
      __reportPreserveCommentOrder: true
    };
  }).filter(Boolean);
}

function generateReport() {
  if (!els.reportOutput) return;
  ensureReportDateDefaults();
  const filters = getReportFilters();
  const activityOnly = filters.type === "email_activity";
  document.querySelectorAll(".reportCategory").forEach(input => {
    const group = input.closest("fieldset");
    if (group) group.hidden = activityOnly;
  });
  const statusGroup = els.reportStatusOpen?.closest("fieldset");
  if (statusGroup) statusGroup.hidden = activityOnly;
  if (els.exportHoursExcelButton) els.exportHoursExcelButton.hidden = filters.type !== "hours";
  if (els.exportMdsExcelButton) els.exportMdsExcelButton.hidden = filters.type !== "mds";
  renderReportRecordSelector(filters);
  const records = filters.type === "hours" || filters.type === "mds" ? getHoursReportSourceRecords(filters) : selectedReportRecords(filters);
  const meta = buildReportMeta(filters, records);
  let body = "";
  if (filters.type === "open") body = renderOpenItemsReport(records, filters);
  else if (filters.type === "hours") body = renderHoursReport(records, filters);
  else if (filters.type === "mds") body = renderMdsBillingReport(records, filters);
  else if (filters.type === "email_activity") body = renderCommunicationActivityReport(filters);
  else body = renderDailySiteReport(records, filters);
  els.reportOutput.innerHTML = renderReportHeader(meta) + body;
}

function reportTypeTitle(type) {
  if (type === "open") return "Open Items Report";
  if (type === "hours") return "Hours Report — Record Entries";
  if (type === "mds") return "MDS Billing Report";
  if (type === "email_activity") return "Communication Activity Report";
  return "Daily Site Report";
}

function buildReportMeta(filters, records) {
  const activityOnly = filters.type === "email_activity";
  return {
    site: reportSiteName(),
    title: reportTypeTitle(filters.type),
    dateRange: reportDateRangeLabel(filters.from, filters.to),
    categories: activityOnly ? "Email activity log" : reportCategoryFilterLabel(filters),
    statuses: activityOnly ? "All activity" : reportStatusFilterLabel(filters),
    order: reportSortOrderLabel(filters),
    generatedAt: formatDateTime(new Date().toISOString()),
    countSummary: reportCountSummary(filters, records)
  };
}

function renderReportHeader(meta) {
  return `<header class="report-title-block">
    <h1>${escapeHtml(meta.site)}</h1>
    <h2>${escapeHtml(meta.title)}</h2>
    <div class="report-header-grid" aria-label="Report summary">
      ${reportHeaderItem("Date Range", meta.dateRange)}
      ${reportHeaderItem("Filters", `${meta.categories} · ${meta.statuses}`)}
      ${reportHeaderItem("Date Order", meta.order)}
      ${reportHeaderItem("Generated", meta.generatedAt)}
      ${reportHeaderItem("Report Summary", meta.countSummary)}
    </div>
  </header>`;
}

function reportHeaderItem(label, value) {
  return `<div class="report-header-item"><span class="report-label">${escapeHtml(label)}</span><span class="report-value">${escapeHtml(value || "not stated")}</span></div>`;
}

function reportCategoryFilterLabel(filters) {
  const categories = filters.categories || [];
  const all = reportCategoryOrder();
  if (!categories.length || categories.length === all.length) return "All categories";
  return categories.map(category => categoryLabel(category)).join(", ");
}

function reportStatusFilterLabel(filters) {
  const statuses = filters.statuses || [];
  if (statuses.includes("open") && statuses.includes("closed")) return "Open and Closed";
  if (statuses.includes("open")) return "Open only";
  if (statuses.includes("closed")) return "Closed only";
  return "No status selected";
}

function reportSortOrderLabel(filters) {
  const direction = resolvedReportSortOrder(filters);
  if (direction === "priority") return "Urgency priority (Open Items default)";
  const sequence = direction === "date_desc" ? "Newest to oldest" : "Oldest to newest";
  if (filters.type === "email_activity") return `${sequence} by activity timestamp`;
  if (filters.type === "hours" || filters.type === "mds") return `${sequence} by secondary Work Date (Created Date fallback)`;
  return `${sequence}; primary Created Date, secondary Work Date (Created Date fallback)`;
}

function reportCountSummary(filters, records) {
  if (filters.type === "hours") {
    const rows = collectHoursReportRows(records, filters);
    const timeEntries = rows.filter(row => row.hours != null && row.hours > 0).length;
    const total = rows.reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    return `${rows.length} selected ${rows.length === 1 ? "record" : "records"} · ${timeEntries} time ${timeEntries === 1 ? "entry" : "entries"} · Total Hours: ${formatHoursInputValue(total) || "0"}`;
  }
  if (filters.type === "mds") {
    const rows = collectHoursReportRows(records, filters);
    const billable = rows.filter(row => row.hours != null && row.hours > 0 && isTimeBillingType(commentBillingType(row.comment)));
    const expenseRows = rows.filter(row => commentBillingType(row.comment) === "expense" && expenseAmountForComment(row.comment) > 0);
    const regular = billable.filter(row => commentBillingType(row.comment) === "regular").reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    const overtime = billable.filter(row => commentBillingType(row.comment) === "overtime").reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    const expenses = expenseTotalsByCurrency(expenseRows);
    return `${billable.length} tagged ${billable.length === 1 ? "time block" : "time blocks"} · ${expenseRows.length} ${expenseRows.length === 1 ? "expense" : "expenses"} · Reg: ${formatHoursInputValue(regular) || "0"} · OT: ${formatHoursInputValue(overtime) || "0"} · Expenses: ${formatCurrency(expenses.CAD, "CAD")} CAD · ${formatCurrency(expenses.USD, "USD")} USD`;
  }
  if (filters.type === "email_activity") {
    const entries = getEmailActivityReportEntries(filters);
    const drafts = entries.filter(entry => entry.action === "draftCreated").length;
    const opened = entries.filter(entry => entry.action === "draftOpened").length;
    const sent = entries.filter(entry => entry.status === "user_marked_sent").length;
    return `${entries.length} activity ${entries.length === 1 ? "entry" : "entries"} · ${drafts} draft${drafts === 1 ? "" : "s"} created · ${opened} opened · ${sent} marked sent`;
  }
  if (filters.type === "open") {
    const data = collectOpenItemsReportData(records, filters);
    const totalActive = data.overdue.length + data.dueSoon.length + data.upcoming.length + data.otherOpenPrimaries.length + data.openUpdates.length + data.openFlags.length;
    return `${totalActive} open ${totalActive === 1 ? "item" : "items"}${data.closedRecords.length ? ` · ${data.closedRecords.length} closed included` : ""}`;
  }
  const secondaryCount = records.reduce((total, record) => total + getReportComments(record, filters).length, 0);
  return `${records.length} primary ${records.length === 1 ? "record" : "records"} · ${secondaryCount} secondary ${secondaryCount === 1 ? "update" : "updates"}`;
}

function reportSiteName() {
  const inputName = els.activeMemorySiteInput ? els.activeMemorySiteInput.value.trim() : "";
  const packageName = siteIsStated(currentPackage?.site) ? currentPackage.site : "";
  return inputName || packageName || "Unnamed Site";
}

function reportDateRangeLabel(from, to) {
  if (from && to && from !== to) return `${formatShortDate(from)} to ${formatShortDate(to)}`;
  if (from || to) return formatShortDate(from || to);
  return "All dates";
}

function reportCategoryOrder() {
  return ["event", "action", "followup", "scheduled", "safety", "communication", "document"];
}

function renderDailySiteReport(records, filters = getReportFilters()) {
  if (!records.length) return `<p class="report-empty">No records match the selected filters.</p>`;
  const summary = currentPackage?.dailySummary ? `<section class="report-section"><h3>Summary</h3><p>${escapeHtml(currentPackage.dailySummary)}</p></section>` : "";
  return `${summary}<section class="report-section"><h3>Selected Records</h3>${renderReportRecordList(records, { includeUpdates: true, includeFlags: true, filters })}</section>`;
}

function getEmailActivityReportEntries(filters = getReportFilters()) {
  const direction = resolvedReportSortOrder(filters);
  return normalizeEmailActivityLog(currentPackage?.emailActivityLog)
    .filter(entry => {
      const date = dateFromIso(entry.timestamp);
      if (filters.from && date && date < filters.from) return false;
      if (filters.to && date && date > filters.to) return false;
      return true;
    })
    .sort((left, right) => compareReportDates(dateFromIso(left.timestamp), dateFromIso(right.timestamp), direction)
      || (new Date(left.timestamp) - new Date(right.timestamp)) * (direction === "date_desc" ? -1 : 1));
}

function emailActivityActionLabel(action) {
  const labels = {
    draftCreated: "Draft Created",
    draftOpened: "Draft Opened",
    draftCopied: "Draft Copied",
    cancelled: "Cancelled",
    statusUpdated: "Status Updated"
  };
  return labels[String(action || "")] || "Activity Recorded";
}

function renderCommunicationActivityReport(filters = getReportFilters()) {
  const entries = getEmailActivityReportEntries(filters);
  if (!entries.length) return `<p class="report-empty">No communication activity matches the selected date range.</p>`;
  return `<section class="report-section"><h3>Email Draft Activity</h3><ul class="report-list">${entries.map(entry => {
    const recipient = [entry.recipientSnapshot?.department || entry.recipientSnapshot?.company, entry.recipientSnapshot?.name, entry.recipientSnapshot?.email].filter(Boolean).join(" — ") || "recipient not stated";
    const context = resolveEmailActivityRecordContext(entry);
    const secondary = context.secondaryRecordSummary ? `<div class="report-meta">Secondary record: ${escapeHtml(context.secondaryRecordSummary)}</div>` : "";
    return `<li><strong>${escapeHtml(entry.subject || "Email draft")}</strong><div class="report-meta">${escapeHtml(formatDateTime(entry.timestamp))} · ${escapeHtml(emailActivityActionLabel(entry.action))} · ${escapeHtml(entry.status || "not sent")}</div><div class="report-meta">To: ${escapeHtml(recipient)} · Intent: ${escapeHtml(entry.intent || "not stated")}</div><div class="report-meta">Primary record: ${escapeHtml(context.parentRecordSummary)}</div>${secondary}<div class="report-meta">Email preview: ${escapeHtml(activityPreview(context.messagePreview))}</div></li>`;
  }).join("")}</ul></section>`;
}

function renderOpenItemsReport(records, filters = getReportFilters()) {
  const data = collectOpenItemsReportData(records, filters);
  const sections = [];
  sections.push(renderDeliverableItemsSection("Overdue Deliverables", data.overdue, "No overdue deliverables."));
  sections.push(renderDeliverableItemsSection("Due Within 7 Days", data.dueSoon, "No deliverables due within 7 days."));
  if (data.upcoming.length) sections.push(renderDeliverableItemsSection("Upcoming Deliverables", data.upcoming, ""));
  sections.push(`<section class="report-section"><h3>Other Open Primary Records</h3>${data.otherOpenPrimaries.length ? renderReportRecordList(data.otherOpenPrimaries, { includeUpdates: false, includeFlags: false, filters }) : `<p class="report-empty">No other open primary records match the selected filters.</p>`}</section>`);
  sections.push(`<section class="report-section"><h3>Open Secondary Updates</h3>${data.openUpdates.length ? `<ul class="report-list">${data.openUpdates.map(item => renderReportSecondaryItem(item.comment, item.record)).join("")}</ul>` : `<p class="report-empty">No open secondary updates match the selected filters.</p>`}</section>`);
  sections.push(`<section class="report-section"><h3>Open Flags</h3>${data.openFlags.length ? `<ul class="report-list">${data.openFlags.map(item => renderReportFlagItem(item.flag, item.record)).join("")}</ul>` : `<p class="report-empty">No open flags attached to the matching records.</p>`}</section>`);
  if (data.closedRecords.length) {
    sections.push(`<section class="report-section report-closed-section"><h3>Closed Records Included by Filter</h3>${renderReportRecordList(data.closedRecords, { includeUpdates: false, includeFlags: true, filters })}</section>`);
  }
  return sections.join("");
}

function collectOpenItemsReportData(records, filters) {
  const openPrimaryRecords = records.filter(record => record.__reportPrimarySelected !== false && normalizeLegacyStatus(record.status) !== "closed");
  const deliverables = collectActiveDeliverableItems(records, filters);
  const overdue = deliverables.filter(item => item.status === "red");
  const dueSoon = deliverables.filter(item => item.status === "yellow");
  const upcoming = deliverables.filter(item => item.status === "green");
  const deliverableParentIds = new Set(deliverables.map(item => item.record.id));
  const deliverableCommentIds = new Set(deliverables.filter(item => item.comment).map(item => item.comment.id));
  const otherOpenPrimaries = openPrimaryRecords.filter(record => !deliverableParentIds.has(record.id));
  const openUpdates = [];
  const openFlags = [];
  records.forEach(record => {
    getReportComments(record, filters)
      .filter(comment => normalizeLegacyStatus(comment.status) !== "closed" && !deliverableCommentIds.has(comment.id))
      .forEach(comment => openUpdates.push({ record, comment }));
    if (record.__reportPrimarySelected !== false) {
      getReportFlags(record, filters)
        .filter(flag => normalizeLegacyStatus(flag.status) !== "closed")
        .forEach(flag => openFlags.push({ record, flag }));
    }
  });
  const closedRecords = (filters.statuses || []).includes("closed") ? records.filter(record => record.__reportPrimarySelected !== false && normalizeLegacyStatus(record.status) === "closed") : [];
  return { overdue, dueSoon, upcoming, otherOpenPrimaries, openUpdates, openFlags, closedRecords };
}

function collectActiveDeliverableItems(records, filters) {
  const items = [];
  records.forEach(record => {
    const primaryOpen = normalizeLegacyStatus(record.status) !== "closed";
    if (record.__reportPrimarySelected !== false && primaryOpen && deliverableApplies(record)) {
      const info = deliverableInfoForItem(record);
      if (info) items.push({ kind: "Primary Record", record, item: record, date: info.date, status: info.status });
    }
    getReportComments(record, filters).forEach(comment => {
      if (normalizeLegacyStatus(comment.status) === "closed" || !deliverableApplies(comment)) return;
      const info = deliverableInfoForItem(comment);
      if (info) items.push({ kind: "Secondary Update", record, comment, item: comment, date: info.date, status: info.status });
    });
  });
  const direction = resolvedReportSortOrder(filters);
  return items.sort((a, b) => {
    if (direction === "priority") {
      const priority = deliverablePriorityValue(a.status) - deliverablePriorityValue(b.status);
      if (priority) return priority;
      return String(a.date || "").localeCompare(String(b.date || ""));
    }
    const leftDate = a.comment ? commentReportDate(a.comment, a.record) : recordReportDate(a.record);
    const rightDate = b.comment ? commentReportDate(b.comment, b.record) : recordReportDate(b.record);
    return compareReportDates(leftDate, rightDate, direction)
      || compareReportDates(a.date, b.date, direction);
  });
}

function renderDeliverableItemsSection(title, items, emptyText) {
  if (!items.length && !emptyText) return "";
  return `<section class="report-section"><h3>${escapeHtml(title)}</h3>${items.length ? `<ul class="report-list report-priority-list">${items.map(renderDeliverablePriorityItem).join("")}</ul>` : `<p class="report-empty">${escapeHtml(emptyText)}</p>`}</section>`;
}

function renderDeliverablePriorityItem(item) {
  const text = item.comment ? (item.comment.text || "Untitled secondary update") : (item.record.description || "Untitled record");
  const parent = item.comment ? `<div class="report-meta">Primary Record: ${escapeHtml(item.record.description || "Untitled record")}</div>` : "";
  return `<li><strong>${escapeHtml(text)}</strong><div class="report-meta">${escapeHtml(item.kind)} · ${escapeHtml(categoryLabel(item.record.category))} · Open · Deliverable: ${escapeHtml(item.date)} · ${escapeHtml(reportDeliverableStatusText(item.status))}</div>${parent}</li>`;
}

function renderHoursReport(records, filters) {
  const rows = collectHoursReportRows(records, filters);
  if (!rows.length) return `<p class="report-empty">No secondary or activity records are selected for this report. Select one or more records above, or adjust the date range.</p>`;
  const total = rows.reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
  return `<section class="report-section hours-detail-section"><h3>Hours Detail</h3><div class="report-table-scroll hours-detail-scroll" tabindex="0" aria-label="Hours detail table. Scroll horizontally if needed."><table class="report-table hours-detail-table"><thead><tr><th>Date</th><th>Category</th><th>Primary Record</th><th>Secondary Record</th><th>Activity / Direct Entry</th><th>Start Time</th><th>End Time</th><th>Total Hours</th><th>Status</th></tr></thead><tbody>${rows.map(row => `<tr><td>${escapeHtml(formatShortDate(row.date) || row.date || "not stated")}</td><td>${escapeHtml(categoryLabel(row.record.category))}</td><td>${escapeHtml(row.record.description || "Untitled record")}</td><td>${escapeHtml(row.parentComment?.text || (row.level === "secondary" ? row.comment.text : "Untitled secondary record"))}</td><td>${escapeHtml(row.parentComment ? (row.comment.text || "Untitled activity record") : "—")}${renderDeliverableReportLine(row.comment)}</td><td>${escapeHtml(normalizeReportTimeValue(row.comment.startTime) || "-")}</td><td>${escapeHtml(normalizeReportTimeValue(row.comment.endTime) || "-")}</td><td>${row.hours != null && row.hours > 0 ? escapeHtml(formatHoursInputValue(row.hours)) : "0"}</td><td>${escapeHtml(statusLabel(row.comment.status))}</td></tr>`).join("")}</tbody></table></div><p class="report-hours-note">Totals use direct hours only. Parent totals are calculated in reports and are never written back into records.</p></section>
    <section class="report-section report-total-section"><h3>Cumulative Total Hours</h3><p class="report-total-hours">${escapeHtml(formatHoursInputValue(total))} hrs</p></section>`;
}

function renderMdsBillingReport(records, filters) {
  const selectedRows = collectHoursReportRows(records, filters);
  const billableRows = selectedRows.filter(row => row.hours != null && row.hours > 0 && isTimeBillingType(commentBillingType(row.comment)));
  const expenseRows = selectedRows.filter(row => commentBillingType(row.comment) === "expense" && expenseAmountForComment(row.comment) > 0);
  const untaggedRows = selectedRows.filter(row => row.hours != null && row.hours > 0 && !isTimeBillingType(commentBillingType(row.comment)));
  if (!billableRows.length && !expenseRows.length) {
    return `<p class="report-empty">No selected billing lines are ready for MDS billing. Choose Reg, OT, or Expense beside the secondary record, then enter the required hours or expense amount.</p>`;
  }
  const regular = billableRows.filter(row => commentBillingType(row.comment) === "regular").reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
  const overtime = billableRows.filter(row => commentBillingType(row.comment) === "overtime").reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
  const expenses = expenseTotalsByCurrency(expenseRows);
  const rowsHtml = billableRows.map(row => `<tr><td>${escapeHtml(formatShortDate(row.date) || row.date || "not stated")}</td><td>${escapeHtml(commentBillingType(row.comment) === "regular" ? "Regular" : "Overtime")}</td><td>${escapeHtml(row.record.description || "Untitled record")}</td><td>${escapeHtml(row.comment.text || "Untitled secondary record")}</td><td>${escapeHtml(normalizeReportTimeValue(row.comment.startTime) || "-")}</td><td>${escapeHtml(normalizeReportTimeValue(row.comment.endTime) || "-")}</td><td>${escapeHtml(formatHoursInputValue(row.hours))}</td></tr>`).join("");
  const expenseHtml = expenseRows.length ? `<section class="report-section hours-detail-section"><h3>MDS Expenses</h3><div class="report-table-scroll hours-detail-scroll" tabindex="0" aria-label="MDS expense detail table. Scroll horizontally if needed."><table class="report-table hours-detail-table"><thead><tr><th>Work Date</th><th>Expense Type</th><th>Primary Record</th><th>Description</th><th>Amount</th><th>Currency</th></tr></thead><tbody>${expenseRows.map(row => `<tr><td>${escapeHtml(formatShortDate(row.date) || row.date || "not stated")}</td><td>${escapeHtml(expenseTypeLabel(row.comment.expenseType))}</td><td>${escapeHtml(row.record.description || "Untitled record")}</td><td>${escapeHtml(row.comment.text || "Untitled secondary record")}</td><td>${escapeHtml(formatCurrency(expenseAmountForComment(row.comment), expenseCurrencyForComment(row.comment)))}</td><td>${escapeHtml(expenseCurrencyForComment(row.comment))}</td></tr>`).join("")}</tbody></table></div></section>` : "";
  const untaggedNote = untaggedRows.length ? `<p class="report-hours-note">${untaggedRows.length} selected ${untaggedRows.length === 1 ? "hour block is" : "hour blocks are"} untagged and will be excluded from the MDS workbook.</p>` : "";
  const labourHtml = billableRows.length ? `<section class="report-section hours-detail-section"><h3>MDS Labour Detail</h3><div class="report-table-scroll hours-detail-scroll" tabindex="0" aria-label="MDS billing detail table. Scroll horizontally if needed."><table class="report-table hours-detail-table"><thead><tr><th>Date</th><th>Type</th><th>Primary Record</th><th>Secondary Record</th><th>Start Time</th><th>End Time</th><th>Hours</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>${untaggedNote}</section>` : untaggedNote;
  return `${labourHtml}${expenseHtml}<section class="report-section report-total-section"><h3>MDS Billing Totals</h3><p class="report-total-hours">Reg ${escapeHtml(formatHoursInputValue(regular) || "0")} hrs · OT ${escapeHtml(formatHoursInputValue(overtime) || "0")} hrs · Labour Total ${escapeHtml(formatHoursInputValue(regular + overtime) || "0")} hrs · Expenses ${escapeHtml(formatCurrency(expenses.CAD, "CAD"))} CAD · ${escapeHtml(formatCurrency(expenses.USD, "USD"))} USD</p><p class="report-hours-note">Export MDS Excel creates one Saturday–Friday timesheet tab for each covered week, plus a final Expenses Summary tab.</p></section>`;
}

function collectHoursReportRows(records, filters, options = {}) {
  const selectedOnly = options.selectedOnly !== false;
  const rows = reportSelectionGroups(filters).flatMap(group => group.rows);
  const selected = !selectedOnly || !reportSelectionInitialized ? rows : rows.filter(row => reportSelectedKeys.has(row.key));
  return sortReportSecondaryRows(selected, filters);
}

function reportCommentHours(comment) {
  const stored = parseHoursInput(comment?.totalHours);
  if (stored != null && stored > 0) return stored;
  const start = normalizeReportTimeValue(comment?.startTime);
  const end = normalizeReportTimeValue(comment?.endTime);
  if (!start || !end) return null;
  return calculateHoursFromTimes(start, end);
}

function renderReportRecordList(records, options = {}) {
  return `<ul class="report-list">${records.map(record => renderReportRecordItem(record, options)).join("")}</ul>`;
}

function renderReportRecordItem(record, options = {}) {
  const filters = options.filters || getReportFilters();
  const flags = options.includeFlags ? getReportFlags(record, filters) : [];
  const updates = options.includeUpdates ? getReportComments(record, filters) : [];
  const flagHtml = flags.length ? `<ul class="report-sublist report-flag-list">${flags.map(flag => renderReportFlagItem(flag, record)).join("")}</ul>` : "";
  const updateHtml = updates.length ? `<ul class="report-sublist report-secondary-list">${updates.map(comment => renderReportSecondaryItem(comment, record)).join("")}</ul>` : "";
  const primarySelected = record.__reportPrimarySelected !== false;
  const primaryMeta = primarySelected
    ? `Primary Record · ${escapeHtml(categoryLabel(record.category))} · ${escapeHtml(formatShortDate(recordReportDate(record)) || "not stated")} · ${escapeHtml(statusLabel(record.status))}`
    : "Primary Record context for selected secondary records";
  return `<li><strong>${escapeHtml(record.description || "Untitled record")}</strong><div class="report-meta">${primaryMeta}</div>${primarySelected ? renderDeliverableReportLine(record) : ""}${flagHtml}${updateHtml}</li>`;
}

function renderReportSecondaryItem(comment, record) {
  const activityContext = comment.__reportLevel === "activity" ? `<div class="report-meta">Under secondary record: ${escapeHtml(comment.__reportParentText || "Untitled secondary record")}</div>` : "";
  const kind = comment.__reportLevel === "activity" ? "Activity Record" : "Secondary Record";
  return `<li><strong>${escapeHtml(comment.text || "Untitled secondary update")}</strong><div class="report-meta">${kind} · ${escapeHtml(categoryLabel(record.category))} · ${escapeHtml(formatShortDate(commentReportDate(comment, record)) || "not stated")} · ${escapeHtml(statusLabel(comment.status))}</div>${activityContext}${renderDeliverableReportLine(comment)}${renderReportCommentTimeBlock(comment)}${renderReportCommentTimestamp(comment, record)}</li>`;
}

function renderReportFlagItem(flag, record) {
  const type = flag.type === "clarify" ? "Clarify" : (flag.type === "incomplete" ? "Incomplete" : "Flag");
  const resolution = flag.resolution ? `<div class="report-meta">Resolution: ${escapeHtml(flag.resolution)}</div>` : "";
  return `<li><strong>${escapeHtml(type)} Flag:</strong> ${escapeHtml(flag.text || "Record flag")}<div class="report-meta">Primary Record: ${escapeHtml(record.description || "Untitled record")} · ${escapeHtml(statusLabel(flag.status))}</div>${resolution}</li>`;
}

function getReportComments(record, filters = getReportFilters()) {
  if (record.__reportPreserveCommentOrder) {
    return (record.comments || []).filter(comment => reportCommentMatchesFilters(comment, record, filters));
  }
  const comments = [];
  (record.comments || []).forEach(comment => {
    if (reportCommentMatchesFilters(comment, record, filters)) comments.push(comment);
    if (normalizeLegacyStatus(comment.status) === "closed") return;
    (comment.activities || []).forEach(activity => {
      if (reportCommentMatchesFilters(activity, record, filters)) comments.push({ ...activity, __reportParentText: comment.text || "Untitled secondary record", __reportLevel: "activity" });
    });
  });
  const direction = resolvedReportSortOrder(filters);
  if (direction === "priority" && record.__reportPreserveCommentOrder) return comments;
  if (direction === "priority") return comments.sort((a, b) => String(commentReportDate(a, record) || "").localeCompare(String(commentReportDate(b, record) || "")));
  return comments.sort((a, b) => compareReportDates(commentReportDate(a, record), commentReportDate(b, record), direction)
    || String(a.createdAt || "").localeCompare(String(b.createdAt || "")) * (direction === "date_desc" ? -1 : 1));
}

function getReportFlags(record, filters = getReportFilters()) {
  return (record.flags || []).filter(flag => reportStatusMatches(normalizeLegacyStatus(flag.status), filters));
}

function reportCommentMatchesFilters(comment, record, filters) {
  const date = commentReportDate(comment, record);
  if (!reportStatusMatches(normalizeLegacyStatus(comment.status), filters)) return false;
  if (filters.from && date && date < filters.from) return false;
  if (filters.to && date && date > filters.to) return false;
  return true;
}

function reportStatusMatches(status, filters) {
  return !filters.statuses.length || filters.statuses.includes(normalizeLegacyStatus(status));
}

function sortReportRecordsByDate(records) {
  return [...records].sort((a, b) => String(recordReportDate(a) || "").localeCompare(String(recordReportDate(b) || "")) || compareRecordChronologyAsc(a, b));
}

function statusLabel(status) {
  return normalizeLegacyStatus(status).toUpperCase() === "CLOSED" ? "Closed" : "Open";
}

function reportDeliverableStatusText(status, closed = false) {
  if (closed) return "Closed";
  if (status === "red") return "Overdue";
  if (status === "yellow") return "Due within 7 days";
  if (status === "green") return "Upcoming";
  return "Not active";
}

function renderReportCommentTimeBlock(comment) {
  const start = normalizeReportTimeValue(comment?.startTime);
  const end = normalizeReportTimeValue(comment?.endTime);
  const hours = reportCommentHours(comment);
  if (!start && !end && (hours == null || hours <= 0)) return "";
  const parts = [];
  if (start) parts.push(`Start Time: ${start}`);
  if (end) parts.push(`End Time: ${end}`);
  if (hours != null && hours > 0) parts.push(`Total Hours: ${formatHoursInputValue(hours)}`);
  return `<div class="report-meta report-update-timeblock">${escapeHtml(parts.join(" · "))}</div>`;
}

function normalizeReportTimeValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const compact = text.match(/^(\d{1,2})(\d{2})$/);
  if (compact) return `${compact[1].padStart(2, "0")}:${compact[2]}`;
  const colon = text.match(/^(\d{1,2}):(\d{2})$/);
  if (colon) return `${colon[1].padStart(2, "0")}:${colon[2]}`;
  return text;
}

function renderReportCommentTimestamp(comment, parentRecord) {
  const timestamp = reportCommentTimestampLabel(comment, parentRecord);
  return timestamp ? `<div class="report-meta report-update-timestamp">${escapeHtml(timestamp)}</div>` : "";
}

function reportCommentTimestampLabel(comment, parentRecord) {
  const created = comment?.createdAt || parentRecord?.createdAt || "";
  const updated = comment?.updatedAt || "";
  const closed = comment?.closedAt || "";
  const parts = [];
  if (created) parts.push(`Created ${formatShortDateTime(created)}`);
  if (updated && updated !== created) parts.push(`Updated ${formatShortDateTime(updated)}`);
  if (closed) parts.push(`Closed ${formatShortDateTime(closed)}`);
  return parts.join(" · ");
}

function printCurrentReport() {
  // v0.6.50: print exactly what is currently displayed in the report output.
  // Do not regenerate the report here, because regenerating can change the visible
  // report type/filter state immediately before print. The hardcopy must match the
  // on-screen report, especially the v0.6.44 Hours Detail table format.
  if (!els.reportOutput) return;
  if (!String(els.reportOutput.innerHTML || "").trim()) generateReport();
  prepareVisibleReportPrintClone();
  const cleanup = () => cleanupVisibleReportPrintClone();
  window.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(cleanup, 3000);
  window.print();
}

function prepareVisibleReportPrintClone() {
  cleanupVisibleReportPrintClone();
  if (!els.reportOutput) return;
  const printRoot = document.createElement("div");
  printRoot.id = "printReportRoot";
  printRoot.setAttribute("aria-hidden", "true");
  const reportClone = els.reportOutput.cloneNode(true);
  reportClone.id = "printReportOutput";
  reportClone.classList.add("report-print-output");
  printRoot.appendChild(reportClone);
  document.body.appendChild(printRoot);
}

function cleanupVisibleReportPrintClone() {
  const existing = document.getElementById("printReportRoot");
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
}

function copyCurrentReportText() {
  generateReport();
  const rawText = els.reportOutput ? els.reportOutput.innerText.trim() : "";
  const text = rawText.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) return showToast("No report text to copy.");
  copyText(text);
}

function hoursReportSecondaryCellText(comment) {
  const parts = [String(comment?.text || "Untitled update").trim() || "Untitled update"];
  if (deliverableApplies(comment)) {
    const deliverable = normalizeDeliverable(comment.deliverable);
    parts.push(`Deliverable: ${formatShortDate(deliverable.date)} · ${deliverableStatusForDate(deliverable.date).toUpperCase()}`);
  }
  return parts.join("\n");
}

function sanitizeHoursExcelFilenamePart(value, fallback) {
  const text = String(value || "").trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
    .replace(/\s+/g, "_")
    .replace(/^[_ .]+|[_ .]+$/g, "");
  return text || fallback;
}

function hoursExcelFilename(filters) {
  const site = sanitizeHoursExcelFilenamePart(reportSiteName(), "Unnamed_Site");
  const datePart = filters.from && filters.to
    ? (filters.from === filters.to ? filters.from : `${filters.from}_to_${filters.to}`)
    : (filters.from || filters.to || "all_dates");
  return `MDS_Hours_${site}_${datePart}.xlsx`;
}

function mdsExcelFilename(filters) {
  const site = sanitizeHoursExcelFilenamePart(reportSiteName(), "MDS_Billing");
  const datePart = filters.from && filters.to
    ? (filters.from === filters.to ? filters.from : `${filters.from}_to_${filters.to}`)
    : (filters.from || filters.to || "selected_period");
  return `MDS_Billing_${site}_${datePart}.xlsx`;
}

async function exportHoursReportExcel() {
  const filters = getReportFilters();
  if (filters.type !== "hours") return showToast("Choose Hours Report before exporting Excel.");
  const rows = collectHoursReportRows(getHoursReportSourceRecords(filters), filters);
  if (!rows.length) return showToast("Select at least one secondary or activity record to export.");
  if (!window.SiteScribeHoursExcel || typeof window.SiteScribeHoursExcel.exportWorkbook !== "function") {
    return showToast("Excel export is unavailable. Reload SiteScribe and try again.");
  }

  const meta = buildReportMeta(filters, getHoursReportSourceRecords(filters));
  const payload = {
    filename: hoursExcelFilename(filters),
    meta: {
      ...meta,
      filters: `${meta.categories} · ${meta.statuses} · ${meta.order}`,
      appVersion: APP_VERSION
    },
    rows: rows.map(row => ({
      date: row.date,
      category: categoryLabel(row.record.category),
      primary: row.record.description || "Untitled record",
      secondary: row.parentComment ? `${row.parentComment.text || "Untitled secondary record"}\nActivity: ${hoursReportSecondaryCellText(row.comment)}` : hoursReportSecondaryCellText(row.comment),
      start: normalizeReportTimeValue(row.comment.startTime) || "-",
      end: normalizeReportTimeValue(row.comment.endTime) || "-",
      hours: row.hours != null && row.hours > 0 ? row.hours : 0,
      status: statusLabel(row.comment.status)
    }))
  };

  try {
    els.exportHoursExcelButton.disabled = true;
    els.exportHoursExcelButton.textContent = "Preparing Excel…";
    const result = await window.SiteScribeHoursExcel.exportWorkbook(payload);
    setStatus(`Hours Report Excel exported with ${result.rowCount} selected ${result.rowCount === 1 ? "record" : "records"}.`);
  } catch (error) {
    console.error("Hours Report Excel export failed.", error);
    showToast("Excel export failed. Try again or reload SiteScribe.");
  } finally {
    els.exportHoursExcelButton.disabled = false;
    els.exportHoursExcelButton.textContent = "Export Excel";
  }
}

async function exportMdsReportExcel() {
  const filters = getReportFilters();
  if (filters.type !== "mds") return showToast("Choose MDS Billing Report before exporting Excel.");
  const selectedRows = collectHoursReportRows(getHoursReportSourceRecords(filters), filters);
  const rows = selectedRows
    .filter(row => row.hours != null && row.hours > 0 && isTimeBillingType(commentBillingType(row.comment)))
    .map(row => ({
      date: row.date,
      hourType: commentBillingType(row.comment),
      hours: Number(row.hours) || 0,
      primary: row.record.description || "Untitled record",
      text: row.parentComment ? `${row.parentComment.text || "Untitled secondary record"} — ${row.comment.text || "Untitled activity record"}` : (row.comment.text || "Untitled secondary record"),
      start: normalizeReportTimeValue(row.comment.startTime) || "",
      end: normalizeReportTimeValue(row.comment.endTime) || ""
    }));
  const expenses = selectedRows
    .filter(row => commentBillingType(row.comment) === "expense" && expenseAmountForComment(row.comment) > 0)
    .map(row => ({
      date: row.date,
      primary: row.record.description || "Untitled record",
      text: row.parentComment ? `${row.parentComment.text || "Untitled secondary record"} — ${row.comment.text || "Untitled activity record"}` : (row.comment.text || "Untitled secondary record"),
      expenseType: expenseTypeLabel(row.comment.expenseType),
      amount: expenseAmountForComment(row.comment),
      currency: expenseCurrencyForComment(row.comment)
    }));
  if (!rows.length && !expenses.length) return showToast("Select at least one Reg/OT time block or Expense line to export.");
  if (!window.SiteScribeMdsExcel || typeof window.SiteScribeMdsExcel.exportWorkbook !== "function") {
    return showToast("MDS Excel export is unavailable. Reload SiteScribe and try again.");
  }
  try {
    els.exportMdsExcelButton.disabled = true;
    els.exportMdsExcelButton.textContent = "Preparing MDS Excel…";
    const result = await window.SiteScribeMdsExcel.exportWorkbook({
      filename: mdsExcelFilename(filters),
      period: filters.from || filters.to || "",
      sortOrder: resolvedReportSortOrder(filters),
      rows,
      expenses
    });
    setStatus(`MDS Excel exported with ${result.timeRowCount} ${result.timeRowCount === 1 ? "time block" : "time blocks"} and ${result.expenseRowCount} ${result.expenseRowCount === 1 ? "expense" : "expenses"} across ${result.weekCount} ${result.weekCount === 1 ? "week" : "weeks"}.`);
  } catch (error) {
    console.error("MDS Excel export failed.", error);
    showToast("MDS Excel export failed. Try again or reload SiteScribe.");
  } finally {
    els.exportMdsExcelButton.disabled = false;
    els.exportMdsExcelButton.textContent = "Export MDS Excel";
  }
}

function render() {
  ensurePackageUiConfig();
  applyUiConfigToScreen();
  renderRecords();
  if (selectedRecordId) renderDetail(false);
}

function renderActiveMemorySummary() {
  syncActiveMemorySiteInput();
  if (!els.activeMemorySummary) return;
  const records = (currentPackage && Array.isArray(currentPackage.records)) ? currentPackage.records : [];
  const site = currentPackage?.site || "not stated";
  const shiftDate = currentPackage?.shiftDate || "not stated";
  const open = records.filter(record => normalizeLegacyStatus(record.status) !== "closed").length;
  const closed = records.length - open;
  const flags = records.reduce((total, record) => total + getOpenFlags(record).length, 0);
  const source = currentPackageRecord?.sourceLabel || currentPackage?.source?.captureMethod || "manual entry";
  if (!records.length) {
    els.activeMemorySummary.innerHTML = `<div class="active-memory-title">No active records loaded yet.</div><div class="active-memory-meta">Bring in site notes or add a manual record to start the working memory.</div>`;
    return;
  }
  els.activeMemorySummary.innerHTML = `<div class="active-memory-title">${escapeHtml(site)}</div><div class="active-memory-meta">${escapeHtml(shiftDate)} · ${open} open · ${closed} closed · ${flags} open flags · ${escapeHtml(source)}</div>`;
}

function renderRecords() {
  const records = (currentPackage && Array.isArray(currentPackage.records)) ? currentPackage.records : [];
  updateClosedToggleButton();
  if (!records.length) {
    els.recordsRoot.className = "records-root empty";
    els.recordsRoot.textContent = subtitleForBox("B05") || "Load a JSON package or create a record to begin.";
    updateSiteWalkSummaries();
    return;
  }
  els.recordsRoot.className = "records-root";
  const hideClosed = getClosedRecordsHidden();
  const sortedAll = sortRecordsForWorkingMemory(records);
  const hiddenClosedCount = hideClosed ? sortedAll.filter(record => normalizeLegacyStatus(record.status) === "closed").length : 0;
  const sorted = hideClosed ? sortedAll.filter(record => normalizeLegacyStatus(record.status) !== "closed") : sortedAll;
  const mode = getWorkingMemorySortMode();
  const modeLabel = mode === "manual" ? "Manual order" : (mode === "date_asc" ? "Oldest first" : "Newest first");
  const closedNote = hiddenClosedCount ? ` · ${hiddenClosedCount} closed hidden` : "";
  const rowsHtml = sorted.length ? sorted.map(renderRecordLine).join("") : `<div class="working-memory-empty-filter">No open records. Use Show Closed to view closed records.</div>`;
  els.recordsRoot.innerHTML = `<div class="working-memory-mode">${escapeHtml(modeLabel + closedNote)}</div><div class="status-record-block ${escapeHtml(mode)}">${rowsHtml}</div>`;
  updateSiteWalkSummaries();
}

function renderRecordLine(record) {
  const openFlagCount = getOpenFlags(record).length;
  const openComments = (record.comments || []).filter(comment => normalizeLegacyStatus(comment.status) !== "closed").length;
  const totalComments = (record.comments || []).length;
  const status = normalizeLegacyStatus(record.status);
  const collapsed = shouldCollapseSecondaryRecords(record);
  const disclosure = totalComments
    ? `<button type="button" class="secondary-branch-toggle" data-action="toggle-primary-children" data-record-id="${escapeHtml(record.id)}" aria-expanded="${collapsed ? "false" : "true"}" aria-label="${collapsed ? "Show" : "Hide"} ${totalComments} secondary record${totalComments === 1 ? "" : "s"}" title="${collapsed ? "Show" : "Hide"} secondary records"><span class="record-indicator-line update-indicator-line"><span class="secondary-toggle-indicator ${collapsed ? "collapsed" : "expanded"}">${collapsed ? "▸" : "▾"}</span><span class="secondary-toggle-count">${totalComments}</span></span></button>`
    : `<span class="record-indicator-line update-indicator-line"><span class="secondary-toggle-placeholder"></span></span>`;
  const flagIndicator = openFlagCount
    ? `<span class="record-indicator-line flag-indicator-line"><span class="flag-toggle-indicator" title="${openFlagCount} open record flag${openFlagCount === 1 ? "" : "s"}">▸</span><span class="flag-toggle-count">${openFlagCount}</span></span>`
    : "";
  const rowDeliverableInfo = primaryRowDeliverableInfo(record, collapsed);
  const canMove = !isRecordLocked(record);
  const dragGrip = `<span class="record-drag-grip${canMove ? "" : " is-locked"}" draggable="${canMove ? "true" : "false"}" title="${canMove ? "Drag to reorder or move" : "Reopen record to move"}" aria-label="${canMove ? "Drag to reorder or move" : "Record is closed and cannot be moved"}">⠿</span>`;
  const mainRow = renderCompactRecordRow({
    classes: "record-line",
    dataAttrs: `data-record-id="${escapeHtml(record.id)}" role="button" tabindex="0" aria-label="Show or hide secondary records for: ${escapeHtml(record.description || "Untitled record")}"`,
    status,
    dotClass: "dot",
    leftHtml: `<span class="record-row-leading">${dragGrip}<span class="record-leading">${renderDeliverableSquare(rowDeliverableInfo)}${disclosure}${flagIndicator}<span class="dot ${status === "closed" ? "closed" : ""}"></span></span></span>`,
    titleClass: "record-title",
    text: record.description || "Untitled record",
    titleSuffixHtml: `<span class="primary-mobile-tail"><span class="primary-mobile-tail-meta">${escapeHtml(formatShortRecordDateOnlyMobile(record))}</span><span class="pill status-pill copy-primary-pill" data-action="copy-primary" role="button" tabindex="0" title="Copy primary record and all secondary records">COPY</span><span class="pill status-pill open-primary-pill ${status === "closed" ? "closed" : ""}" data-action="open-primary" role="button" tabindex="0" title="Open primary record">${escapeHtml(status.toUpperCase())}</span></span>`,
    metaHtml: `<span class="primary-date-full">${escapeHtml(formatShortRecordDateTime(record))}</span><span class="primary-date-mobile">${escapeHtml(formatShortRecordDateOnlyMobile(record))}</span> · <span class="primary-category-full">${escapeHtml(categoryIdLabel(record.category))}</span><span class="primary-category-mobile">${escapeHtml(categoryMobileLabel(record.category))}</span>`,
    rightHtml: `<span class="pill status-pill copy-primary-pill" data-action="copy-primary" role="button" tabindex="0" title="Copy primary record and all secondary records">COPY</span><span class="pill status-pill open-primary-pill ${status === "closed" ? "closed" : ""}" data-action="open-primary" role="button" tabindex="0" title="Open primary record">${escapeHtml(status.toUpperCase())}</span>`
  });
  return `<div class="record-stack ${status === "closed" ? "closed-primary-stack" : "open-primary-stack"}">${mainRow}${collapsed ? "" : renderInlineSecondaryRecords(record)}</div>`;
}


function formatPrimaryRecordForClipboard(record) {
  const lines = [];
  const status = normalizeLegacyStatus(record.status).toUpperCase();
  lines.push(`Primary Record: ${record.description || "Untitled record"}`);
  lines.push(`Category: ${categoryLabel(record.category)}`);
  lines.push(`Status: ${status}`);
  lines.push(`Record Date: ${formatDate(recordCreationDate(record))}`);
  if (record.createdAt) lines.push(`Created: ${formatDateTime(record.createdAt)}`);
  if (record.updatedAt) lines.push(`Updated: ${formatDateTime(record.updatedAt)}`);
  if (record.closedAt) lines.push(`Closed: ${formatDateTime(record.closedAt)}`);
  if (deliverableApplies(record)) {
    const d = normalizeDeliverable(record.deliverable);
    lines.push(`Deliverable: ${d.date} (${deliverableStatusForDate(d.date)})`);
  }
  if (record.sourceText) {
    lines.push("");
    lines.push(`Source: ${record.sourceText}`);
  }

  const flags = record.flags || [];
  if (flags.length) {
    lines.push("");
    lines.push("Record Flags:");
    flags.forEach(flag => {
      lines.push(`- ${String(flag.type || "flag").toUpperCase()} (${normalizeLegacyStatus(flag.status)}): ${flag.text || ""}`);
      if (flag.resolution) lines.push(`  Resolution: ${flag.resolution}`);
    });
  }

  const comments = record.comments || [];
  lines.push("");
  lines.push(`Secondary Records (${comments.length}):`);
  if (!comments.length) {
    lines.push("- none");
  } else {
    comments.forEach((comment, index) => {
      const statusText = normalizeLegacyStatus(comment.status);
      lines.push(`${index + 1}. ${comment.text || "Untitled secondary record"}`);
      lines.push(`   Status: ${statusText}`);
      const meta = [];
      if (comment.createdAt) meta.push(`Created: ${formatDateTime(comment.createdAt)}`);
      if (comment.updatedAt) meta.push(`Updated: ${formatDateTime(comment.updatedAt)}`);
      if (comment.closedAt) meta.push(`Closed: ${formatDateTime(comment.closedAt)}`);
      if (meta.length) lines.push(`   ${meta.join(" | ")}`);
      const timeMeta = [];
      if (comment.startTime) timeMeta.push(`Start Time: ${comment.startTime}`);
      if (comment.endTime) timeMeta.push(`End Time: ${comment.endTime}`);
      if (comment.totalHours) timeMeta.push(`Total Hrs: ${comment.totalHours}`);
      if (timeMeta.length) lines.push(`   ${timeMeta.join(" | ")}`);
      if (deliverableApplies(comment)) {
        const d = normalizeDeliverable(comment.deliverable);
        lines.push(`   Deliverable: ${d.date} (${deliverableStatusForDate(d.date)})`);
      }
    });
  }

  return lines.join("\n");
}

function renderCompactRecordRow(options) {
  const status = normalizeLegacyStatus(options.status);
  const selectedClass = options.selected ? " selected" : "";
  const closedClass = status === "closed" ? " closed" : "";
  const dataAttrs = options.dataAttrs || "";
  const rowClass = `compact-record-row ${options.classes || ""}${closedClass}${selectedClass}`.trim();
  const dotClass = `${options.dotClass || "secondary-dot"}${closedClass}`.trim();
  const titleClass = options.titleClass || "secondary-record-title";
  const text = options.text || "Untitled record";
  const titleSuffix = options.titleSuffixHtml || "";
  const meta = options.metaHtml ? `<span class="record-inline-meta">${options.metaHtml}</span>` : (options.meta ? `<span class="record-inline-meta">${escapeHtml(options.meta)}</span>` : "");
  const rightHtml = options.rightHtml || "";
  const expandHtml = options.expandHtml || "";
  const leftHtml = options.leftHtml || `<span class="${dotClass}"></span>`;
  return `<div class="${rowClass}" ${dataAttrs}>
    ${leftHtml}
    <div class="${titleClass}" title="${escapeHtml(text)}"><span class="record-title-text">${escapeHtml(text)}</span>${titleSuffix}</div>
    <div class="record-right ${options.rightClass || ""}">
      ${meta}
      ${rightHtml}
    </div>
    ${expandHtml}
  </div>`;
}

function renderInlineSecondaryRecords(record) {
  const comments = Array.isArray(record.comments) ? record.comments : [];
  if (!comments.length) return "";
  const sorted = sortSecondaryRecordsForRecord(record);
  const expanded = expandedInlineSecondaryRecordIds.has(record.id);
  const visible = expanded ? sorted : sorted.slice(0, 5);
  const hiddenCount = Math.max(0, sorted.length - 5);
  const moreLine = hiddenCount
    ? `<div class="secondary-more-line" data-record-id="${escapeHtml(record.id)}" data-secondary-list-action="${expanded ? "collapse" : "expand"}" role="button" tabindex="0" aria-expanded="${expanded ? "true" : "false"}">${expanded ? "show less" : `show more... ${hiddenCount} additional secondary record${hiddenCount === 1 ? "" : "s"}`}</div>`
    : "";
  return `<div class="inline-secondary-list">${visible.map(comment => `${renderInlineSecondaryRecord(record, comment)}${renderInlineActivityRecords(record, comment)}`).join("")}${moreLine}</div>`;
}

function setInlineSecondaryExpansion(recordId, expanded) {
  if (!recordId) return;
  if (expanded) expandedInlineSecondaryRecordIds.add(recordId);
  else expandedInlineSecondaryRecordIds.delete(recordId);
  renderRecords();
  const control = els.recordsRoot?.querySelector(`.secondary-more-line[data-record-id="${cssEscape(recordId)}"]`);
  if (control) control.focus();
}

function renderInlineSecondaryRecord(record, comment) {
  const status = normalizeLegacyStatus(comment.status);
  const compactDate = formatShortDate(secondaryCollapsedDisplayDate(comment));
  const canMove = !isRecordLocked(record) && !isCommentMovementLocked(comment);
  const activityCount = Array.isArray(comment.activities) ? comment.activities.length : 0;
  const activitiesCollapsed = isCommentActivityCollapsed(comment.id);
  const activityToggle = activityCount
    ? `<button type="button" class="secondary-branch-toggle activity-branch-toggle" data-action="toggle-secondary-activities" data-record-id="${escapeHtml(record.id)}" data-comment-id="${escapeHtml(comment.id)}" aria-expanded="${activitiesCollapsed ? "false" : "true"}" aria-label="${activitiesCollapsed ? "Show" : "Hide"} ${activityCount} activity record${activityCount === 1 ? "" : "s"}" title="${activitiesCollapsed ? "Show" : "Hide"} activity records"><span class="secondary-toggle-indicator ${activitiesCollapsed ? "collapsed" : "expanded"}">${activitiesCollapsed ? "▸" : "▾"}</span><span class="secondary-toggle-count">${activityCount}</span></button>`
    : "";
  const dragGrip = `<span class="record-drag-grip${canMove ? "" : " is-locked"}" draggable="${canMove ? "true" : "false"}" title="${canMove ? "Drag to reorder or move" : "Reopen record or remove its deliverable to move"}" aria-label="${canMove ? "Drag to reorder or move" : "Secondary record cannot be moved"}">⠿</span>`;
  return renderCompactRecordRow({
    classes: "secondary-record-line",
    dataAttrs: `data-record-id="${escapeHtml(record.id)}" data-comment-id="${escapeHtml(comment.id)}" role="button" tabindex="0" aria-label="Show or hide activity records for: ${escapeHtml(comment.text || "Untitled secondary record")}"`,
    status,
    selected: false,
    leftHtml: `<span class="record-row-leading">${dragGrip}<span class="secondary-leading">${renderDeliverableSquare(deliverableInfoForItem(comment, { closed: status === "closed" }))}${activityToggle}<span class="secondary-dot ${status === "closed" ? "closed" : ""}"></span></span></span>`,
    text: comment.text || "Untitled secondary record",
    meta: compactDate,
    rightHtml: `${secondaryHoursBadgeHtml(comment)}<button type="button" class="pill status-pill open-secondary-pill ${status === "closed" ? "closed" : ""}" data-action="open-secondary" title="Open secondary record">${escapeHtml(status.toUpperCase())}</button>`
  });
}

function renderInlineActivityRecords(record, comment) {
  const activities = Array.isArray(comment.activities) ? comment.activities : [];
  if (!activities.length || isCommentActivityCollapsed(comment.id)) return "";
  return `<div class="inline-activity-list">${sortActivityRecordsForComment(comment).map(activity => renderInlineActivityRecord(record, comment, activity)).join("")}</div>`;
}

function sortActivityRecordsForComment(comment) {
  const activities = Array.isArray(comment?.activities) ? [...comment.activities] : [];
  const hasManual = activities.some(activity => Number.isFinite(Number(activity.activitySortOrder)));
  if (hasManual) {
    return activities.sort((left, right) => {
      const leftOrder = Number.isFinite(Number(left.activitySortOrder)) ? Number(left.activitySortOrder) : Number.MAX_SAFE_INTEGER;
      const rightOrder = Number.isFinite(Number(right.activitySortOrder)) ? Number(right.activitySortOrder) : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || compareRecordChronologyDesc(left, right);
    });
  }
  return sortSecondaryRecordsForDisplay(activities);
}

function reorderActivityWithinComment(recordId, commentId, activityId, targetActivityId, position = "after") {
  const record = getRecordById(recordId);
  const comment = (record?.comments || []).find(item => item.id === commentId);
  if (!record || !comment || isRecordLocked(record) || isCommentLocked(comment)) return lockedRecordMessage();
  const activities = Array.isArray(comment.activities) ? comment.activities : [];
  const source = activities.find(activity => activity.id === activityId);
  if (!source || source.id === targetActivityId || isCommentMovementLocked(source)) return commentMovementLockedMessage(source);
  const ordered = sortActivityRecordsForComment(comment).filter(activity => activity.id !== activityId);
  let targetIndex = ordered.findIndex(activity => activity.id === targetActivityId);
  if (targetIndex < 0) targetIndex = ordered.length;
  else if (position === "after") targetIndex += 1;
  ordered.splice(targetIndex, 0, source);
  ordered.forEach((activity, index) => { activity.activitySortOrder = (index + 1) * 1000; });
  comment.activities = ordered;
  comment.updatedAt = new Date().toISOString();
  record.updatedAt = comment.updatedAt;
  markDirty();
  render();
  setStatus("Activity record reordered within its secondary record.");
  showToast("Activity reordered.");
}

function renderInlineActivityRecord(record, comment, activity) {
  const status = normalizeLegacyStatus(activity.status);
  const compactDate = formatShortDate(secondaryCollapsedDisplayDate(activity));
  const canMove = !isRecordLocked(record) && !isCommentLocked(comment) && !isCommentMovementLocked(activity);
  const dragGrip = `<span class="record-drag-grip${canMove ? "" : " is-locked"}" draggable="${canMove ? "true" : "false"}" title="${canMove ? "Drag to reorder" : "Reopen the parent record or remove its deliverable to move"}" aria-label="${canMove ? "Drag to reorder activity" : "Activity record cannot be moved"}">⠿</span>`;
  return renderCompactRecordRow({
    classes: "activity-record-line secondary-record-line",
    dataAttrs: `data-record-id="${escapeHtml(record.id)}" data-comment-id="${escapeHtml(comment.id)}" data-activity-id="${escapeHtml(activity.id)}" role="button" tabindex="0" aria-label="Open activity record: ${escapeHtml(activity.text || "Untitled activity record")}"`,
    status,
    selected: activity.id === selectedActivityId,
    leftHtml: `<span class="record-row-leading">${dragGrip}<span class="secondary-leading">${renderDeliverableSquare(deliverableInfoForItem(activity, { closed: status === "closed" || normalizeLegacyStatus(comment.status) === "closed" }))}<span class="secondary-dot ${status === "closed" ? "closed" : ""}"></span></span></span>`,
    text: activity.text || "Untitled activity record",
    meta: compactDate,
    rightHtml: `${secondaryHoursBadgeHtml(activity)}<button type="button" class="pill status-pill open-activity-pill ${status === "closed" ? "closed" : ""}" data-action="open-activity" title="Open activity record">${escapeHtml(status.toUpperCase())}</button>`
  });
}

function renderDetail(openPanel = true) {
  const record = getSelectedRecord();
  if (!record) {
    closeDetail();
    return;
  }
  if (openPanel) {
    els.detailPanel.classList.add("open");
    els.detailPanel.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("detail-panel-open");
  }
  const status = normalizeLegacyStatus(record.status);
  const primaryLocked = status === "closed";
  const parentComment = getSelectedComment();
  const selectedActivity = getSelectedActivity();
  const activityEditor = !!parentComment && (selectedActivity || newActivityParentId === parentComment.id);
  const selectedComment = selectedActivity || (activityEditor ? null : parentComment);
  const locked = primaryLocked || isCommentLocked(parentComment) || isCommentLocked(selectedActivity);
  const statusControlsLocked = primaryLocked || (activityEditor && isCommentLocked(parentComment));
  const secondaryDetail = !!parentComment;
  els["detail-title"].textContent = activityEditor ? "Activity Record" : (secondaryDetail ? "Secondary Record" : "Primary Record");
  const selectedCommentAttrs = parentComment ? ` data-record-id="${escapeHtml(record.id)}" data-comment-id="${escapeHtml(parentComment.id)}"${selectedActivity ? ` data-activity-id="${escapeHtml(selectedActivity.id)}"` : ""}${activityEditor && !selectedActivity ? " data-new-activity=\"true\"" : ""}` : "";
  const lockedBanner = locked ? `<div class="locked-banner">Closed record locked. Reopen this record before editing child records, resolving flags, moving records, or changing related data.</div>` : "";
  const primaryDetail = `
    <section class="record-detail-section primary-record-card">
      <div class="primary-record-heading-row">
        <h3>Primary Record</h3>
        <div class="primary-record-actions">
          ${recordStatusButtons(status)}
          <button type="button" class="secondary small" data-action="copy-record" title="Copy primary record and all secondary records">Copy Record</button>
        </div>
      </div>
      <p class="primary-record-description">${escapeHtml(record.description || "Untitled record")}</p>
      <div class="primary-record-meta-strip" aria-label="Primary record information">
        ${compactMetaItem("Category", categoryLabel(record.category))}
        ${compactMetaItem("Record date", formatDate(recordCreationDate(record)))}
        ${compactMetaItem("Created", formatDateTime(record.createdAt))}
        ${compactMetaItem("Updated", formatDateTime(record.updatedAt || record.createdAt))}
        ${status === "closed" ? compactMetaItem("Closed", formatDateTime(record.closedAt || record.updatedAt)) : ""}
      </div>
      ${renderDeliverableEditor(record, "record", locked, true)}
      ${renderRecordFlags(record)}
    </section>`;
  const secondaryParentContext = `
    <section class="record-detail-section secondary-parent-context" aria-label="Parent primary record">
      <span class="secondary-parent-label">Under primary record</span>
      <p>${escapeHtml(record.description || "Untitled record")}</p>
      <p class="muted">Close this detail and use the Working Memory branch to open a different record.</p>
    </section>`;
  const activityParentContext = `
    <section class="record-detail-section secondary-parent-context" aria-label="Parent secondary record">
      <span class="secondary-parent-label">Under secondary record</span>
      <p>${escapeHtml(parentComment?.text || "Untitled secondary record")}</p>
      <p class="muted">Close this detail and use the Working Memory branch to open a different record.</p>
    </section>`;
  const sourceText = secondaryDetail ? (selectedComment?.sourceText || parentComment?.sourceText) : record.sourceText;
  const branchGuidance = `
    <section class="record-detail-section secondary-branch-guidance">
      <h3>Secondary Records</h3>
      <p class="muted">${(record.comments || []).length} secondary record${(record.comments || []).length === 1 ? "" : "s"}. Close this detail and use the small branch control in Working Memory to show and open them.</p>
    </section>`;
  els.detailContent.innerHTML = `
    ${lockedBanner}
    ${secondaryDetail ? (activityEditor ? activityParentContext : secondaryParentContext) : primaryDetail}
    <details class="record-detail-section source-text-card">
      <summary>Source Text</summary>
      <p class="muted source-text-content">${escapeHtml(sourceText || "not stated")}</p>
    </details>
    <section class="record-detail-section secondary-editor-card">
      <h3>${activityEditor ? (selectedActivity ? "Edit Activity Record" : "Add Activity Record") : (selectedComment ? "Edit Secondary Record" : "Add Secondary Record")}</h3>
      ${locked ? `<p class="muted">${primaryLocked ? "Reopen this primary record to add or edit secondary records." : (activityEditor && isCommentLocked(parentComment) ? "Reopen the parent secondary record before editing this activity record." : "This record is closed. Use Reopen below before editing.")}</p>` : `<textarea id="commentEditor" rows="2" placeholder="Enter a field observation or secondary record."${selectedCommentAttrs}>${escapeHtml(selectedComment?.text || "")}</textarea>
      <div class="secondary-quick-entry-row">
        <div class="update-time-editor" aria-label="Secondary record time tracking">
          <label>Start <input id="commentStartTime" type="text" inputmode="numeric" data-time-text="1" maxlength="5" autocomplete="off" placeholder="07:30" value="${escapeHtml(selectedComment?.startTime || "")}"${commentEditorBillingType(selectedComment) === "expense" ? " disabled" : ""}${selectedCommentAttrs} /></label>
          <label>End <input id="commentEndTime" type="text" inputmode="numeric" data-time-text="1" maxlength="5" autocomplete="off" placeholder="11:45" value="${escapeHtml(selectedComment?.endTime || "")}"${commentEditorBillingType(selectedComment) === "expense" ? " disabled" : ""}${selectedCommentAttrs} /></label>
          <label>Hrs hh:mm <input id="commentTotalHours" type="text" inputmode="text" autocomplete="off" data-hours-exact="${escapeHtml(selectedComment?.totalHours == null ? "" : String(selectedComment.totalHours))}" value="${escapeHtml(formatHoursClock(selectedComment?.totalHours))}"${commentEditorBillingType(selectedComment) === "expense" ? " disabled" : ""}${selectedCommentAttrs} /></label>
          <label>Work Date <input id="commentWorkDate" type="date" autocomplete="off" value="${escapeHtml(commentEditorWorkDate(selectedComment, record))}"${selectedCommentAttrs} /></label>
          <label class="billing-type-editor">Billing <select id="commentBillingType"${selectedCommentAttrs}><option value="">None</option><option value="regular"${commentEditorBillingType(selectedComment) === "regular" ? " selected" : ""}>Reg</option><option value="overtime"${commentEditorBillingType(selectedComment) === "overtime" ? " selected" : ""}>OT</option><option value="expense"${commentEditorBillingType(selectedComment) === "expense" ? " selected" : ""}>Expense</option></select></label>
          <div id="commentExpenseFields" class="expense-fields"${commentEditorBillingType(selectedComment) === "expense" ? "" : " hidden"}>
            <label>Amount <input id="commentExpenseAmount" type="text" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${escapeHtml(formatExpenseInputValue(selectedComment?.expenseAmount))}"${selectedCommentAttrs} /></label>
            <label class="expense-currency-choice">Currency <select id="commentExpenseCurrency"${selectedCommentAttrs}><option value="CAD"${expenseCurrencyForComment(selectedComment) === "CAD" ? " selected" : ""}>CAD</option><option value="USD"${expenseCurrencyForComment(selectedComment) === "USD" ? " selected" : ""}>USD</option></select></label>
            <label>Expense Type <select id="commentExpenseType"${selectedCommentAttrs}><option value="">Select type</option>${EXPENSE_TYPES.map(([id, label]) => `<option value="${id}"${normalizeExpenseType(selectedComment?.expenseType) === id ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select></label>
          </div>
          <p id="commentTimeEntryNote" class="time-entry-note" role="status" hidden></p>
        </div>
        ${renderDeliverableEditor(selectedComment || { deliverable: { apply: false, date: "" } }, "comment", false, true)}
      </div>
      ${selectedComment ? `<div class="update-timestamp-line">Created ${escapeHtml(formatDateTime(selectedComment.createdAt))} · Updated ${escapeHtml(formatDateTime(selectedComment.updatedAt || selectedComment.createdAt))}${normalizeLegacyStatus(selectedComment.status) === "closed" ? ` · Closed ${escapeHtml(formatDateTime(selectedComment.closedAt || selectedComment.updatedAt))}` : ""}</div>` : ""}
      ${selectedComment ? renderEmailActionProof(selectedComment, locked) : ""}
      <div class="secondary-editor-footer${selectedComment ? "" : " secondary-new-footer"}">
        ${selectedComment ? renderSelectedCommentStatusControls(selectedComment, statusControlsLocked, selectedActivity ? selectedActivity.id : "") : ""}
        <div class="secondary-editor-actions">
          <button type="button" class="secondary small" data-action="clear-comment-selection">${activityEditor ? "Back to Secondary" : (selectedComment ? "Start New" : "Clear")}</button>
          <button type="button" class="small secondary-save-action" data-action="save-comment">${selectedActivity ? "Save Changes" : (activityEditor ? "Add Activity" : (selectedCommentId ? "Save Changes" : "Add Secondary"))}</button>
        </div>
      </div>`}
      ${locked && selectedComment ? `<div class="secondary-editor-footer secondary-locked-recovery-footer">
        ${renderSelectedCommentStatusControls(selectedComment, statusControlsLocked, selectedActivity ? selectedActivity.id : "")}
      </div>` : ""}
    </section>
    ${secondaryDetail && !activityEditor ? renderInlineActivityEntry(record, parentComment, locked) : ""}
    ${secondaryDetail ? "" : branchGuidance}
  `;
  resizeCommentEditor();
  resizeActivityEntryEditor();
}

function renderInlineActivityEntry(record, parentComment, locked = false) {
  if (!record || !parentComment || locked) return "";
  return `<section class="record-detail-section secondary-editor-card activity-entry-card" aria-label="Add activity record">
    <h3>Add Activity Record</h3>
    <p class="muted small-hint">Add a trackable activity under “${escapeHtml(parentComment.text || "Untitled secondary record")}” without leaving this screen.</p>
    <textarea id="activityEntryEditor" rows="2" placeholder="Enter a third-level activity record."></textarea>
    <div class="secondary-quick-entry-row">
      <div class="update-time-editor" aria-label="Activity record time tracking">
        <label>Start <input id="activityEntryStartTime" type="text" inputmode="numeric" data-time-text="1" maxlength="5" autocomplete="off" placeholder="07:30" /></label>
        <label>End <input id="activityEntryEndTime" type="text" inputmode="numeric" data-time-text="1" maxlength="5" autocomplete="off" placeholder="11:45" /></label>
        <label>Hrs hh:mm <input id="activityEntryTotalHours" type="text" inputmode="text" autocomplete="off" data-hours-exact="" /></label>
        <label>Work Date <input id="activityEntryWorkDate" type="date" autocomplete="off" value="${escapeHtml(todayString())}" /></label>
        <label class="billing-type-editor">Billing <select id="activityEntryBillingType"><option value="">None</option><option value="regular" selected>Reg</option><option value="overtime">OT</option><option value="expense">Expense</option></select></label>
        <div id="activityEntryExpenseFields" class="expense-fields" hidden>
          <label>Amount <input id="activityEntryExpenseAmount" type="text" inputmode="decimal" autocomplete="off" placeholder="0.00" /></label>
          <label class="expense-currency-choice">Currency <select id="activityEntryExpenseCurrency"><option value="CAD" selected>CAD</option><option value="USD">USD</option></select></label>
          <label>Expense Type <select id="activityEntryExpenseType"><option value="">Select type</option>${EXPENSE_TYPES.map(([id, label]) => `<option value="${id}">${escapeHtml(label)}</option>`).join("")}</select></label>
        </div>
        <p id="activityEntryTimeEntryNote" class="time-entry-note" role="status" hidden></p>
      </div>
      ${renderDeliverableEditor({ deliverable: { apply: false, date: "" } }, "activityEntry", false, true)}
    </div>
    <div class="secondary-editor-footer secondary-new-footer"><div class="secondary-editor-actions"><button type="button" class="small secondary-save-action" data-action="add-inline-activity">Add Activity</button></div></div>
  </section>`;
}

function focusNewSecondaryRecordEditor() {
  const editor = document.getElementById("commentEditor");
  if (!editor || selectedCommentId || isRecordLocked(getSelectedRecord())) return;
  const editorCard = editor.closest(".secondary-editor-card");
  if (editorCard) editorCard.scrollIntoView({ block: "start", behavior: "auto" });
  editor.focus({ preventScroll: true });
  const end = editor.value.length;
  if (typeof editor.setSelectionRange === "function") editor.setSelectionRange(end, end);
}

function resizeCommentEditor() {
  const editor = document.getElementById("commentEditor");
  if (!editor) return;
  editor.style.height = "auto";
  editor.style.height = `${Math.min(Math.max(editor.scrollHeight, 58), 180)}px`;
  editor.style.overflowY = editor.scrollHeight > 180 ? "auto" : "hidden";
}

function resizeActivityEntryEditor() {
  const editor = document.getElementById("activityEntryEditor");
  if (!editor) return;
  editor.style.height = "auto";
  editor.style.height = `${Math.min(Math.max(editor.scrollHeight, 58), 180)}px`;
  editor.style.overflowY = editor.scrollHeight > 180 ? "auto" : "hidden";
}

function renderEmailActionProof(comment, parentLocked = false) {
  const action = comment?.action;
  if (!action || action.type !== "communication" || action.method !== "email_draft") return "";
  const recipientId = Array.isArray(action.recipientIds) ? action.recipientIds[0] : "";
  const contact = getCurrentSiteContact(recipientId);
  const recipientEmail = action.to || contact?.email || "";
  const unresolvedTo = normalizeNameList(action.unresolvedRecipientNames);
  const unresolvedCc = normalizeNameList(action.unresolvedCcRecipientNames);
  const recipientName = contact?.fullName || contact?.name || recipientId || unresolvedTo[0] || "Unresolved contact";
  const ccEmails = action.cc || normalizeIdList(action.ccRecipientIds).map(id => getCurrentSiteContact(id)?.email || "").filter(Boolean).join(", ");
  const completed = action.state === "completed" || normalizeLegacyStatus(comment.status) === "closed";
  const disabled = parentLocked || completed ? " disabled" : "";
  const contactStatus = contact && recipientEmail
    ? `${recipientName} · ${contact.role || contact.company || "Project contact"}`
    : `Contact unresolved: ${unresolvedTo.length ? unresolvedTo.join(", ") : recipientName}. Check this site's Contacts / Departments or enter the approved address below.`;
  const unresolvedCcNotice = unresolvedCc.length ? `<p class="muted email-action-contact">Unresolved CC: ${escapeHtml(unresolvedCc.join(", "))}. Confirm the approved CC address before opening the draft.</p>` : "";
  return `<section class="email-action-proof" aria-label="Email action proof">
    <div class="email-action-heading">
      <h3>Email Action</h3>
      <span class="pill ${completed ? "closed" : ""}">${escapeHtml(completed ? "COMPLETED" : "DRAFT")}</span>
    </div>
    <p class="muted email-action-contact">${escapeHtml(contactStatus)}</p>
    <label class="field-label">To
      <input id="emailActionTo" type="email" multiple autocomplete="off" value="${escapeHtml(recipientEmail)}"${disabled}>
    </label>
    <label class="field-label">CC
      <input id="emailActionCc" type="email" multiple autocomplete="off" value="${escapeHtml(ccEmails)}"${disabled}>
    </label>
    ${unresolvedCcNotice}
    <label class="field-label">Subject
      <input id="emailActionSubject" type="text" autocomplete="off" value="${escapeHtml(action.subject || "")}"${disabled}>
    </label>
    <label class="field-label">Message
      <textarea id="emailActionBody" rows="8"${disabled}>${escapeHtml(action.body || "")}</textarea>
    </label>
    ${action.openedAt ? `<p class="update-timestamp-line">Last opened in email app: ${escapeHtml(formatDateTime(action.openedAt))}</p>` : ""}
    ${action.completedAt ? `<p class="update-timestamp-line">Confirmed sent: ${escapeHtml(formatDateTime(action.completedAt))}</p>` : ""}
    ${completed ? "" : `<div class="button-row">
      <button type="button" data-action="open-email-action">OPEN IN EMAIL APP</button>
      <button type="button" class="secondary" data-action="mark-email-action-sent">MARK SENT</button>
    </div>`}
    <p class="muted small-hint">SiteScribe prepares this draft but does not send it. Add attachments and press Send in your email application, then return here and confirm with MARK SENT.</p>
  </section>`;
}

function renderSelectedCommentStatusControls(comment, parentLocked = false, activityId = "") {
  const status = normalizeLegacyStatus(comment.status);
  if (parentLocked) {
    return `<div class="selected-secondary-status"><span class="secondary-status-caption">Status</span><span class="secondary-state-badge ${status === "closed" ? "closed" : ""}">${escapeHtml(status.toUpperCase())}</span></div>`;
  }
  const activityAttr = activityId ? ` data-activity-id="${escapeHtml(activityId)}"` : "";
  const actionButton = status === "closed"
    ? `<button type="button" class="small secondary" data-action="set-comment-status" data-comment-id="${escapeHtml(comment.id)}"${activityAttr} data-status="open">Reopen</button>
       <button type="button" class="small danger" data-action="delete-comment" data-comment-id="${escapeHtml(comment.id)}"${activityAttr}>Delete</button>`
    : `<button type="button" class="small secondary" data-action="set-comment-status" data-comment-id="${escapeHtml(comment.id)}"${activityAttr} data-status="closed">Close Record</button>`;
  return `<div class="selected-secondary-status" aria-label="Secondary record status">
    <span class="secondary-status-caption">Status</span>
    <span class="secondary-state-badge ${status === "closed" ? "closed" : ""}">${escapeHtml(status.toUpperCase())}</span>
    ${actionButton}
  </div>`;
}

function handleDetailKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest(".detail-update-line");
  if (!row || event.target.closest("button, input, textarea, select")) return;
  event.preventDefault();
  row.click();
}

function renderComments(record, locked = false) {
  const comments = record.comments || [];
  if (!comments.length) return `<p class="muted">No secondary records yet.</p>`;
  const sorted = sortSecondaryRecordsForRecord(record);
  const firstClosedIndex = sorted.findIndex(comment => normalizeLegacyStatus(comment.status) === "closed");
  if (firstClosedIndex < 0) return sorted.map(comment => renderCommentLine(comment, locked)).join("");
  const openBlock = sorted.slice(0, firstClosedIndex).map(comment => renderCommentLine(comment, locked)).join("");
  const closedBlock = sorted.slice(firstClosedIndex).map(comment => renderCommentLine(comment, locked)).join("");
  return `${openBlock}<div class="closed-secondary-divider">Closed Secondary Records</div>${closedBlock}`;
}

function sortSecondaryRecordsForRecord(record) {
  const comments = Array.isArray(record?.comments) ? record.comments : [];
  return record?.secondarySortMode === "manual"
    ? secondaryRecordsInManualOrder(comments)
    : sortSecondaryRecordsForDisplay(comments);
}

function sortSecondaryRecordsForDisplay(comments) {
  // Secondary records always return to chronological display order after a
  // save, import, or drag operation. Older packages may still contain
  // secondarySortOrder values; they are retained for schema compatibility but
  // intentionally do not override the date order here.
  const baseCompare = compareRecordChronologyDesc;
  const deliverableCompare = (a, b) => {
    const aInfo = deliverableInfoForItem(a);
    const bInfo = deliverableInfoForItem(b);
    const priority = deliverablePriorityValue(aInfo && aInfo.status) - deliverablePriorityValue(bInfo && bInfo.status);
    if (priority) return priority;
    if (aInfo && bInfo && aInfo.date !== bInfo.date) return String(aInfo.date || "").localeCompare(String(bInfo.date || ""));
    return baseCompare(a, b);
  };
  return [
    ...comments.filter(comment => normalizeLegacyStatus(comment.status) !== "closed").sort(deliverableCompare),
    ...comments.filter(comment => normalizeLegacyStatus(comment.status) === "closed").sort(baseCompare)
  ];
}

function compareRecordChronologyDesc(a, b) {
  const aTime = sortableRecordTime(a);
  const bTime = sortableRecordTime(b);
  if (aTime !== bTime) return bTime - aTime;
  return String(a.id || "").localeCompare(String(b.id || ""));
}

function compareRecordChronologyAsc(a, b) {
  const aTime = sortableRecordTime(a);
  const bTime = sortableRecordTime(b);
  if (aTime !== bTime) return aTime - bTime;
  return String(a.id || "").localeCompare(String(b.id || ""));
}

function sortableRecordTime(item) {
  const raw = item.createdAt || item.sourceDate || item.updatedAt || "";
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

function renderCommentLine(comment, locked = false) {
  const status = normalizeLegacyStatus(comment.status);
  const rowLocked = locked || status === "closed";
  const timeMeta = updateTimeMetaHtml(comment) || escapeHtml(formatShortDateTime(comment.createdAt || comment.updatedAt));
  return renderCompactRecordRow({
    classes: "comment-line detail-update-line",
    dataAttrs: `data-comment-id="${escapeHtml(comment.id)}" role="button" tabindex="0" aria-label="Open secondary record: ${escapeHtml(comment.text || "Untitled secondary record")}"`,
    status,
    selected: comment.id === selectedCommentId,
    leftHtml: `<span class="secondary-leading">${renderDeliverableSquare(deliverableInfoForItem(comment, { closed: status === "closed" }))}<span class="secondary-dot ${status === "closed" ? "closed" : ""}"></span></span>`,
    text: comment.text || "Untitled secondary record",
    metaHtml: timeMeta,
    rightClass: "detail-update-right",
    rightHtml: `${secondaryHoursBadgeHtml(comment)}<span class="secondary-state-badge ${status === "closed" ? "closed" : ""}" aria-hidden="true">${escapeHtml(status.toUpperCase())}</span>`
  });
}

function handleDetailInput(event) {
  const target = event.target;
  if (!target) return;
  if (target.id === "commentEditor") {
    resizeCommentEditor();
    return;
  }
  if (target.id === "activityEntryEditor") {
    resizeActivityEntryEditor();
    return;
  }
  if (target.id === "commentStartTime" || target.id === "commentEndTime") {
    updateCommentHoursCalculation();
    return;
  }
  // v0.8.9: date boxes report an incomplete entry the same way time boxes do.
  if (target.id === "commentWorkDate" || target.id === "commentDeliverableDate" || target.id === "recordDeliverableDate") {
    refreshCommentEntryWarning();
    if (target.id === "recordDeliverableDate") target.classList.toggle("time-input-incomplete", inputEntryIsPartial(target));
    return;
  }
  if (target.id === "activityEntryWorkDate" || target.id === "activityEntryDeliverableDate") {
    refreshActivityEntryWarning();
    return;
  }
  if (target.id === "activityEntryStartTime" || target.id === "activityEntryEndTime") {
    updateActivityEntryHoursCalculation();
    return;
  }
  if (target.id === "recordDeliverableApply") {
    updateDeliverableDateDisabled("record");
    return;
  }
  if (target.id === "commentDeliverableApply") {
    updateDeliverableDateDisabled("comment");
    return;
  }
  if (target.id === "activityEntryDeliverableApply") {
    updateDeliverableDateDisabled("activityEntry");
  }
}

function handleDetailFocusOut(event) {
  const target = event.target;
  if (!target) return;
  // v0.8.10: settle a typed time to HH:MM before the commit below reads the box.
  settleTimeTextEntry(target);
  if (target.id === "recordDeliverableApply") {
    updateDeliverableDateDisabled("record");
    if (!target.checked) commitRecordDeliverableEditor();
    return;
  }
  if (target.id === "recordDeliverableDate") {
    commitRecordDeliverableEditor();
    return;
  }
  if (target.id === "commentDeliverableApply") {
    updateDeliverableDateDisabled("comment");
    if (!target.checked) commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
    return;
  }
  if (target.id === "activityEntryDeliverableApply") {
    updateDeliverableDateDisabled("activityEntry");
    return;
  }
  if (["commentEditor", "commentStartTime", "commentEndTime", "commentTotalHours", "commentWorkDate", "commentBillingType", "commentExpenseAmount", "commentExpenseCurrency", "commentExpenseType", "commentDeliverableDate"].includes(target.id)) {
    commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
  }
}

function handleDetailChange(event) {
  const target = event.target;
  if (!target) return;
  // v0.8.10: settle a typed time to HH:MM before the commit below reads the box.
  settleTimeTextEntry(target);
  if (target.id === "recordDeliverableApply") {
    updateDeliverableDateDisabled("record");
    if (!target.checked) commitRecordDeliverableEditor();
    return;
  }
  if (target.id === "recordDeliverableDate") {
    commitRecordDeliverableEditor();
    return;
  }
  if (target.id === "commentDeliverableApply") {
    updateDeliverableDateDisabled("comment");
    if (!target.checked) commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
    return;
  }
  if (target.id === "activityEntryDeliverableApply") {
    updateDeliverableDateDisabled("activityEntry");
    return;
  }
  if (target.id === "activityEntryBillingType" || target.id === "activityEntryExpenseCurrency") {
    synchronizeActivityEntryBillingFields();
    return;
  }
  if (target.id === "commentBillingType" || target.id === "commentExpenseCurrency") {
    synchronizeCommentBillingFields();
    commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
    return;
  }
  if (["commentEditor", "commentStartTime", "commentEndTime", "commentTotalHours", "commentWorkDate", "commentExpenseAmount", "commentExpenseType", "commentDeliverableDate"].includes(target.id)) {
    commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
  }
}


function commitRecordDeliverableEditor() {
  const record = getSelectedRecord();
  if (!record || isRecordLocked(record)) return false;
  updateDeliverableDateDisabled("record");
  const next = readDeliverableEditor("record");
  // v0.8.9: hold the stored deliverable while its date is only partly entered.
  if (next.partial) return false;
  if (deliverableEquals(record.deliverable, next)) return false;
  const now = new Date().toISOString();
  record.deliverable = next;
  record.updatedAt = now;
  markDirty({ reason: "record deliverable updated" });
  render();
  renderDetail(false);
  return true;
}

// v0.8.9: mark a partly entered time or date box and explain it, so an incomplete entry is visible
// instead of silently reading as empty. A blank Hrs field was previously the only clue.
function updateEntryWarning(noteId, entries) {
  const incomplete = [];
  entries.forEach(entry => {
    const partial = inputEntryIsPartial(entry.input);
    if (entry.input) entry.input.classList.toggle("time-input-incomplete", partial);
    if (partial) incomplete.push(entry.label);
  });
  const note = document.getElementById(noteId);
  if (!note) return;
  if (!incomplete.length) {
    note.textContent = "";
    note.hidden = true;
    return;
  }
  const subject = incomplete.length === 1
    ? `${incomplete[0]} is incomplete`
    : `${incomplete.slice(0, -1).join(", ")} and ${incomplete[incomplete.length - 1]} are incomplete`;
  note.textContent = `${subject} — finish the entry. Anything already saved is kept until a complete value is entered.`;
  note.hidden = false;
}

function refreshCommentEntryWarning() {
  updateEntryWarning("commentTimeEntryNote", [
    { input: document.getElementById("commentStartTime"), label: "Start time" },
    { input: document.getElementById("commentEndTime"), label: "End time" },
    { input: document.getElementById("commentWorkDate"), label: "Work date" },
    { input: document.getElementById("commentDeliverableDate"), label: "Deliverable date" }
  ]);
}

function refreshActivityEntryWarning() {
  updateEntryWarning("activityEntryTimeEntryNote", [
    { input: document.getElementById("activityEntryStartTime"), label: "Start time" },
    { input: document.getElementById("activityEntryEndTime"), label: "End time" },
    { input: document.getElementById("activityEntryWorkDate"), label: "Work date" },
    { input: document.getElementById("activityEntryDeliverableDate"), label: "Deliverable date" }
  ]);
}

function updateCommentHoursCalculation() {
  const startInput = document.getElementById("commentStartTime");
  const endInput = document.getElementById("commentEndTime");
  const hoursInput = document.getElementById("commentTotalHours");
  if (!startInput || !endInput || !hoursInput) return;
  refreshCommentEntryWarning();
  const hours = calculateHoursFromTimes(startInput.value, endInput.value);
  if (hours == null) return;
  setHoursInputValue(hoursInput, hours);
}

function handleDetailClick(event) {
  const action = event.target.dataset.action;
  const record = getSelectedRecord();
  if (!record) return;
  const recordLocked = isRecordLocked(record);

  if (action === "open-email-action") {
    openSelectedEmailAction(record);
    return;
  }
  if (action === "mark-email-action-sent") {
    markSelectedEmailActionSent(record);
    return;
  }

  const commentLine = event.target.closest(".comment-line");
  if (commentLine && !action) {
    if (selectedCommentId && selectedCommentId !== commentLine.dataset.commentId) {
      commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
    }
    selectedCommentId = commentLine.dataset.commentId;
    selectedFlagId = null;
    renderDetail();
    return;
  }

  const flagExpanded = event.target.closest(".flag-expanded");
  if (flagExpanded && !action) {
    return;
  }

  const flagLine = event.target.closest(".flag-line");
  if (flagLine && !action) {
    selectedFlagId = selectedFlagId === flagLine.dataset.flagId ? null : flagLine.dataset.flagId;
    selectedCommentId = null;
    renderDetail();
    return;
  }

  if (action === "copy-record") {
    copyText(formatPrimaryRecordForClipboard(record));
    return;
  }
  if (recordLocked && action && action !== "copy-record" && action !== "set-record-status" && action !== "toggle-flag-details") {
    lockedRecordMessage();
    return;
  }
  if (action === "set-record-status") {
    const nextStatus = event.target.dataset.status;
    if (recordLocked && nextStatus !== "open") {
      lockedRecordMessage();
      return;
    }
    applyStatusTimestamps(record, nextStatus);
    markDirty();
    render();
    renderDetail();
    return;
  }
  if (action === "set-comment-status") {
    const comment = (record.comments || []).find(item => item.id === event.target.dataset.commentId);
    if (comment) {
      const activity = event.target.dataset.activityId ? (comment.activities || []).find(item => item.id === event.target.dataset.activityId) : null;
      const target = activity || comment;
      const nextStatus = event.target.dataset.status;
      const currentStatus = normalizeLegacyStatus(target.status);

      // v0.8.9: flush pending editor edits before a close, while the target is still unlocked.
      // The commit inside the nextStatus === "open" branch below can never run for these controls:
      // renderSelectedCommentStatusControls only emits Close Record / Reopen for the selected
      // record, so selectedCommentId !== comment.id is never true there. Closing therefore relied
      // entirely on an incidental focusout, and a pending edit could be lost. Committing here must
      // happen before applyStatusTimestamps, because isCommentLocked refuses the commit once the
      // record is closed.
      if (nextStatus !== "open" && currentStatus !== nextStatus) {
        commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
      }

      // v0.6.43: The OPEN pill on an already-open secondary/update should act like
      // tapping the secondary body: select it and load it into the editor.
      if (nextStatus === "open") {
        if (selectedCommentId && selectedCommentId !== comment.id) {
          commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
        }
        selectedCommentId = comment.id;
        selectedActivityId = activity ? activity.id : null;
        newActivityParentId = null;
        selectedFlagId = null;
      }

      if ((isCommentLocked(comment) || isCommentLocked(target)) && nextStatus !== "open") {
        lockedRecordMessage();
        return;
      }
      if (currentStatus !== nextStatus) {
        applyStatusTimestamps(target, nextStatus);
        if (activity) comment.updatedAt = target.updatedAt;
        record.updatedAt = target.updatedAt;
        markDirty();
        render();
      }
      renderDetail();
      return;
    }
  }
  if (action === "delete-comment") {
    const commentId = event.target.dataset.commentId;
    const comments = Array.isArray(record.comments) ? record.comments : [];
    const index = comments.findIndex(item => item.id === commentId);
    const comment = index >= 0 ? comments[index] : null;
    if (!comment) return;
    const activityId = event.target.dataset.activityId || "";
    if (activityId) {
      const activities = Array.isArray(comment.activities) ? comment.activities : [];
      const activityIndex = activities.findIndex(item => item.id === activityId);
      const activity = activityIndex >= 0 ? activities[activityIndex] : null;
      if (!activity) return;
      if (normalizeLegacyStatus(activity.status) !== "closed") {
        showToast("Only closed activity records can be deleted.");
        return;
      }
      const ok = window.confirm(`Delete this closed activity record?\n\n${String(activity.text || "Untitled activity").trim().slice(0, 90)}\n\nThis cannot be undone unless you restore from an exported JSON backup.`);
      if (!ok) return;
      activities.splice(activityIndex, 1);
      comment.activities = activities;
      comment.updatedAt = new Date().toISOString();
      record.updatedAt = comment.updatedAt;
      selectedActivityId = null;
      markDirty({ reason: "closed activity deleted" });
      render();
      renderDetail();
      showToast("Closed activity record deleted.");
      return;
    }
    if (normalizeLegacyStatus(comment.status) !== "closed") {
      showToast("Only closed secondary records can be deleted.");
      return;
    }
    const preview = String(comment.text || "Untitled update").trim().slice(0, 90);
    const ok = window.confirm(`Delete this closed secondary record?

${preview}${preview.length >= 90 ? "..." : ""}

This cannot be undone unless you restore from an exported JSON backup.`);
    if (!ok) return;
    comments.splice(index, 1);
    record.comments = comments;
    record.updatedAt = new Date().toISOString();
    if (selectedCommentId === commentId) selectedCommentId = null;
    markDirty({ reason: "closed secondary deleted" });
    render();
    renderDetail();
    showToast("Closed secondary record deleted.");
    return;
  }
  if (action === "save-comment") addOrUpdateComment();
  if (action === "add-inline-activity") addInlineActivity();
  if (action === "start-activity") {
    const parent = getSelectedComment();
    if (!parent || isCommentLocked(parent)) return lockedRecordMessage();
    selectedActivityId = null;
    newActivityParentId = parent.id;
    renderDetail();
    return;
  }
  if (action === "clear-comment-selection") {
    if (selectedActivityId || newActivityParentId) {
      selectedActivityId = null;
      newActivityParentId = null;
    } else {
      selectedCommentId = null;
    }
    renderDetail();
  }
  if (action === "toggle-flag-details") {
    selectedFlagId = selectedFlagId === event.target.dataset.flagId ? null : event.target.dataset.flagId;
    selectedCommentId = null;
    renderDetail();
  }
  if (action === "set-flag-status") {
    const flag = (record.flags || []).find(item => item.id === event.target.dataset.flagId);
    if (flag) {
      const nextStatus = event.target.dataset.status;
      if (normalizeLegacyStatus(flag.status) === "closed" && nextStatus !== "open") {
        lockedRecordMessage();
        return;
      }
      if (nextStatus !== "open") saveFlagResolutionFromEditor(flag);
      flag.status = nextStatus;
      flag.updatedAt = new Date().toISOString();
      record.updatedAt = flag.updatedAt;
      if (flag.status === "closed") {
        flag.resolvedAt = flag.resolvedAt || flag.updatedAt;
        selectedFlagId = null;
      }
      markDirty();
      render();
      renderDetail();
    }
  }
  if (action === "save-flag-resolution") {
    const flag = (record.flags || []).find(item => item.id === event.target.dataset.flagId);
    if (flag) {
      if (normalizeLegacyStatus(flag.status) === "closed") {
        lockedRecordMessage();
        return;
      }
      saveFlagResolutionFromEditor(flag);
      flag.updatedAt = new Date().toISOString();
      record.updatedAt = flag.updatedAt;
      markDirty();
      render();
      renderDetail();
      showToast("Flag resolution saved.");
    }
  }
  if (action === "resolve-flag") {
    const flag = (record.flags || []).find(item => item.id === event.target.dataset.flagId);
    if (flag) {
      if (normalizeLegacyStatus(flag.status) === "closed") {
        lockedRecordMessage();
        return;
      }
      saveFlagResolutionFromEditor(flag);
      flag.status = "closed";
      flag.updatedAt = new Date().toISOString();
      record.updatedAt = flag.updatedAt;
      flag.resolvedAt = flag.updatedAt;
      selectedFlagId = null;
      markDirty();
      render();
      renderDetail();
      showToast("Flag resolved.");
    }
  }
}

function readEmailActionEditor(action) {
  return {
    ...action,
    to: String(document.getElementById("emailActionTo")?.value || action.to || "").trim(),
    cc: String(document.getElementById("emailActionCc")?.value || action.cc || "").trim(),
    subject: String(document.getElementById("emailActionSubject")?.value || action.subject || "").trim(),
    body: String(document.getElementById("emailActionBody")?.value || action.body || "").trim()
  };
}

function getSelectedEmailAction(record) {
  const parent = (record?.comments || []).find(item => item.id === selectedCommentId);
  const comment = getSelectedActivity() || parent;
  if (!comment || !comment.action || comment.action.type !== "communication" || comment.action.method !== "email_draft") return null;
  return { comment, parent, action: comment.action };
}

function normalizeMailtoBody(body) {
  return String(body || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\r\n");
}

function encodeMailtoComponent(value) {
  return encodeURIComponent(String(value || ""))
    .replace(/[!'()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeMailtoRecipientList(value) {
  return encodeMailtoComponent(String(value || "").replace(/[\r\n]/g, ""))
    .replace(/%40/gi, "@")
    .replace(/%2C/gi, ",")
    .replace(/%3B/gi, ";");
}

function buildEmailActionMailtoUri(action) {
  const queryParts = [];
  const cc = String(action?.cc || "").replace(/[\r\n]/g, "");
  const subject = String(action?.subject || "");
  const normalizedBody = normalizeMailtoBody(action?.body);
  if (cc) queryParts.push(`cc=${encodeMailtoComponent(cc)}`);
  if (subject) queryParts.push(`subject=${encodeMailtoComponent(subject)}`);
  if (normalizedBody) queryParts.push(`body=${encodeMailtoComponent(normalizedBody)}`);
  const recipientPath = encodeMailtoRecipientList(action?.to);
  return `mailto:${recipientPath}${queryParts.length ? `?${queryParts.join("&")}` : ""}`;
}

function openSelectedEmailAction(record) {
  const selected = getSelectedEmailAction(record);
  if (!selected || isRecordLocked(record) || isCommentLocked(selected.comment)) return lockedRecordMessage();
  const next = readEmailActionEditor(selected.action);
  if (!next.to) return showToast("Enter the recipient email address first.");
  if (normalizeNameList(next.unresolvedCcRecipientNames).length && !next.cc) return showToast("Enter the unresolved CC email address first.");
  if (!next.subject) return showToast("Enter an email subject first.");
  const now = new Date().toISOString();
  selected.comment.action = { ...next, state: "prepared", openedAt: now };
  selected.comment.updatedAt = now;
  record.updatedAt = now;
  logExistingEmailAction(record, selected.comment, next, "draftOpened");
  markDirty({ reason: "email action opened" });
  const mailto = buildEmailActionMailtoUri(next);
  const emailLink = document.createElement("a");
  emailLink.href = mailto;
  emailLink.target = "_blank";
  emailLink.rel = "noopener";
  emailLink.hidden = true;
  document.body.appendChild(emailLink);
  emailLink.click();
  emailLink.remove();
  renderDetail(false);
  showToast("Email draft opened if supported. SiteScribe has not sent it.");
}

function markSelectedEmailActionSent(record) {
  const selected = getSelectedEmailAction(record);
  if (!selected || isRecordLocked(record) || isCommentLocked(selected.comment)) return lockedRecordMessage();
  const next = readEmailActionEditor(selected.action);
  if (!next.to) return showToast("Enter the recipient email address first.");
  if (normalizeNameList(next.unresolvedCcRecipientNames).length && !next.cc) return showToast("Enter the unresolved CC email address first.");
  if (!next.subject) return showToast("Enter an email subject first.");
  const ok = window.confirm(`Confirm that you sent this email outside SiteScribe?\n\nTo: ${next.to || "not stated"}\nSubject: ${next.subject || "not stated"}\n\nSiteScribe cannot verify delivery.`);
  if (!ok) return;
  const now = new Date().toISOString();
  selected.comment.action = { ...next, state: "completed", completedAt: now };
  applyStatusTimestamps(selected.comment, "closed");
  record.updatedAt = now;
  logExistingEmailAction(record, selected.comment, next, "statusUpdated", "user_marked_sent");
  markDirty({ reason: "email action confirmed sent" });
  render();
  renderDetail(false);
  showToast("Email action marked sent; secondary record closed.");
}

function saveFlagResolutionFromEditor(flag) {
  if (!flag || !flag.id) return;
  const editor = document.getElementById(`flagResolution_${flag.id}`);
  if (!editor) return;
  flag.resolution = editor.value.trim();
}

async function addOrUpdateComment() {
  const record = getSelectedRecord();
  if (!record) return;
  if (isRecordLocked(record)) {
    lockedRecordMessage();
    return;
  }
  const editor = document.getElementById("commentEditor");
  const text = editor ? editor.value.trim() : "";
  if (!text) {
    showToast("Enter secondary text first.");
    return;
  }
  const billingFields = getCommentTimeFieldsFromEditor();
  if (billingFields.billingType === "expense" && billingFields.expenseAmount == null) {
    showToast("Enter an expense amount for an Expense line.");
    return;
  }
  if (billingFields.billingType === "expense" && billingFields.expenseType === "other" && !text) {
    showToast("Describe an Other expense in the secondary record text.");
    return;
  }
  const now = new Date().toISOString();
  record.comments = Array.isArray(record.comments) ? record.comments : [];

  const parentComment = getSelectedComment();
  const activityMode = !!parentComment && (selectedActivityId || newActivityParentId === parentComment.id);
  if (activityMode) {
    if (isCommentLocked(parentComment)) {
      lockedRecordMessage();
      return;
    }
    parentComment.activities = Array.isArray(parentComment.activities) ? parentComment.activities : [];
    const existing = selectedActivityId ? parentComment.activities.find(activity => activity.id === selectedActivityId) : null;
    if (existing) {
      if (isCommentLocked(existing)) {
        lockedRecordMessage();
        return;
      }
      existing.text = text;
      applyCommentTimeFields(existing, billingFields);
      existing.deliverable = getCommentDeliverableFromEditor();
      existing.updatedAt = now;
      parentComment.updatedAt = now;
      record.updatedAt = now;
      newActivityParentId = null;
      markDirty();
      render();
      renderDetail();
      await forceAutoSaveNow("activity record updated");
      showToast("Activity record saved.");
      return;
    }
    const activity = normalizeComment({ id: createId("act"), text, status: "open", createdAt: now, updatedAt: now, closedAt: "", deliverable: { apply: false, date: "" } });
    applyCommentTimeFields(activity, billingFields);
    activity.deliverable = getCommentDeliverableFromEditor();
    parentComment.activities.push(activity);
    parentComment.updatedAt = now;
    record.updatedAt = now;
    selectedActivityId = activity.id;
    newActivityParentId = null;
    markDirty();
    render();
    renderDetail();
    await forceAutoSaveNow("activity record added");
    showToast("Activity record added.");
    return;
  }

  if (selectedCommentId) {
    const existing = record.comments.find(comment => comment.id === selectedCommentId);
    if (existing) {
      if (isCommentLocked(existing)) {
        lockedRecordMessage();
        return;
      }
      existing.text = text;
      applyCommentTimeFields(existing, billingFields);
      existing.deliverable = getCommentDeliverableFromEditor();
      existing.updatedAt = now;
      record.updatedAt = now;
      selectedCommentId = null;
      markDirty();
      render();
      renderDetail();
      focusCommentEditorSoon();
      await forceAutoSaveNow("secondary record updated");
      showToast("Update saved. Ready for another update.");
      return;
    }
  }

  const comment = { id: createId("com"), text, status: "open", createdAt: now, updatedAt: now, closedAt: "", deliverable: { apply: false, date: "" } };
  applyCommentTimeFields(comment, billingFields);
  comment.deliverable = getCommentDeliverableFromEditor();
  if (record.secondarySortMode === "manual") {
    const existingOrders = record.comments
      .map(item => Number(item.secondarySortOrder))
      .filter(Number.isFinite);
    comment.secondarySortOrder = (existingOrders.length ? Math.min(...existingOrders) : 1000) - 1000;
  }
  record.comments.push(comment);
  record.updatedAt = now;
  selectedCommentId = null;
  markDirty();
  render();
  renderDetail();
  focusCommentEditorSoon();
  await forceAutoSaveNow("secondary record added");
  showToast("Update added. Ready for another update.");
}

async function addInlineActivity() {
  const record = getSelectedRecord();
  const parentComment = getSelectedComment();
  const editor = document.getElementById("activityEntryEditor");
  const text = editor ? editor.value.trim() : "";
  if (!record || !parentComment || isRecordLocked(record) || isCommentLocked(parentComment)) return lockedRecordMessage();
  if (!text) return showToast("Enter activity text first.");
  const fields = getActivityEntryTimeFields();
  if (fields.billingType === "expense" && fields.expenseAmount == null) return showToast("Enter an expense amount for an Expense activity.");
  const now = new Date().toISOString();
  const activity = normalizeComment({ id: createId("act"), text, status: "open", createdAt: now, updatedAt: now, closedAt: "", deliverable: { apply: false, date: "" } });
  applyCommentTimeFields(activity, fields);
  activity.deliverable = readDeliverableEditor("activityEntry");
  parentComment.activities = Array.isArray(parentComment.activities) ? parentComment.activities : [];
  parentComment.activities.push(activity);
  parentComment.updatedAt = now;
  record.updatedAt = now;
  markDirty();
  render();
  renderDetail();
  await forceAutoSaveNow("activity record added inline");
  focusInlineActivityEntrySoon();
  showToast("Activity record added. Ready for another activity.");
}

function focusInlineActivityEntrySoon() {
  setTimeout(() => {
    const editor = document.getElementById("activityEntryEditor");
    if (!editor) return;
    editor.value = "";
    ["activityEntryStartTime", "activityEntryEndTime", "activityEntryTotalHours", "activityEntryExpenseAmount", "activityEntryExpenseType"].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });
    const workDate = document.getElementById("activityEntryWorkDate");
    const billing = document.getElementById("activityEntryBillingType");
    const currency = document.getElementById("activityEntryExpenseCurrency");
    if (workDate) workDate.value = todayString();
    if (billing) billing.value = "regular";
    if (currency) currency.value = "CAD";
    const deliverableApply = document.getElementById("activityEntryDeliverableApply");
    const deliverableDate = document.getElementById("activityEntryDeliverableDate");
    if (deliverableApply) deliverableApply.checked = false;
    if (deliverableDate) deliverableDate.value = "";
    updateDeliverableDateDisabled("activityEntry");
    synchronizeActivityEntryBillingFields();
    resizeActivityEntryEditor();
    editor.focus({ preventScroll: true });
  }, 0);
}

function focusCommentEditorSoon() {
  setTimeout(() => {
    const editor = document.getElementById("commentEditor");
    if (editor) {
      editor.value = "";
      const startInput = document.getElementById("commentStartTime");
      const endInput = document.getElementById("commentEndTime");
      const hoursInput = document.getElementById("commentTotalHours");
      const workDateInput = document.getElementById("commentWorkDate");
      const billingTypeInput = document.getElementById("commentBillingType");
      const expenseAmountInput = document.getElementById("commentExpenseAmount");
      const expenseCurrencyInput = document.getElementById("commentExpenseCurrency");
      const expenseTypeInput = document.getElementById("commentExpenseType");
      if (startInput) startInput.value = "";
      if (endInput) endInput.value = "";
      if (hoursInput) setHoursInputValue(hoursInput, null);
      if (workDateInput) workDateInput.value = todayString();
      if (billingTypeInput) billingTypeInput.value = "regular";
      if (expenseAmountInput) expenseAmountInput.value = "";
      if (expenseCurrencyInput) expenseCurrencyInput.value = "CAD";
      if (expenseTypeInput) expenseTypeInput.value = "";
      synchronizeCommentBillingFields();
      const deliverableApply = document.getElementById("commentDeliverableApply");
      const deliverableDate = document.getElementById("commentDeliverableDate");
      if (deliverableApply) deliverableApply.checked = false;
      if (deliverableDate) { deliverableDate.value = ""; deliverableDate.disabled = true; }
      resizeCommentEditor();
      editor.focus({ preventScroll: true });
    }
  }, 0);
}

function getCommentEditorDraft() {
  const editor = document.getElementById("commentEditor");
  return {
    text: editor ? editor.value.trim() : "",
    ...getCommentTimeFieldsFromEditor(),
    deliverable: getCommentDeliverableFromEditor()
  };
}

function getCommentEditorTargetIds() {
  const editor = document.getElementById("commentEditor");
  const startInput = document.getElementById("commentStartTime");
  const endInput = document.getElementById("commentEndTime");
  const hoursInput = document.getElementById("commentTotalHours");
  const workDateInput = document.getElementById("commentWorkDate");
  const billingTypeInput = document.getElementById("commentBillingType");
  const expenseAmountInput = document.getElementById("commentExpenseAmount");
  const expenseCurrencyInput = document.getElementById("commentExpenseCurrency");
  const expenseTypeInput = document.getElementById("commentExpenseType");
  const deliverableApply = document.getElementById("commentDeliverableApply");
  const deliverableDate = document.getElementById("commentDeliverableDate");
  const source = editor || startInput || endInput || hoursInput || workDateInput || billingTypeInput || expenseAmountInput || expenseCurrencyInput || expenseTypeInput || deliverableApply || deliverableDate;
  return {
    recordId: source?.dataset?.recordId || selectedRecordId || "",
    commentId: source?.dataset?.commentId || selectedCommentId || "",
    activityId: source?.dataset?.activityId || selectedActivityId || "",
    newActivity: source?.dataset?.newActivity === "true"
  };
}

function getCommentTimeFieldsFromEditor() {
  const startInput = document.getElementById("commentStartTime");
  const endInput = document.getElementById("commentEndTime");
  const hoursInput = document.getElementById("commentTotalHours");
  const workDateInput = document.getElementById("commentWorkDate");
  const billingTypeInput = document.getElementById("commentBillingType");
  const expenseAmountInput = document.getElementById("commentExpenseAmount");
  const expenseCurrencyInput = document.getElementById("commentExpenseCurrency");
  const expenseTypeInput = document.getElementById("commentExpenseType");
  const startTime = normalizeTimeInput(startInput ? startInput.value : "");
  const endTime = normalizeTimeInput(endInput ? endInput.value : "");
  const billingType = normalizeBillingType(billingTypeInput ? billingTypeInput.value : "");
  let totalHours = readHoursInputValue(hoursInput);
  if (totalHours == null) totalHours = calculateHoursFromTimes(startTime, endTime);
  const expenseAmount = parseExpenseAmount(expenseAmountInput ? expenseAmountInput.value : "");
  const expenseCurrency = normalizeExpenseCurrency(expenseCurrencyInput ? expenseCurrencyInput.value : "CAD");
  const expenseType = normalizeExpenseType(expenseTypeInput ? expenseTypeInput.value : "");
  const workDate = normalizeDateOnly(workDateInput ? workDateInput.value : "");
  // v0.8.9: carry the partial-entry state so applyCommentTimeFields can tell "cleared" from "half typed".
  const startTimePartial = inputEntryIsPartial(startInput);
  const endTimePartial = inputEntryIsPartial(endInput);
  const workDatePartial = inputEntryIsPartial(workDateInput);
  if (billingType === "expense") return { startTime: "", endTime: "", totalHours: 0, billingType, expenseAmount, expenseCurrency, expenseType, workDate, startTimePartial: false, endTimePartial: false, workDatePartial };
  return { startTime, endTime, totalHours, billingType, expenseAmount: null, expenseCurrency: "", expenseType: "", workDate, startTimePartial, endTimePartial, workDatePartial };
}

function getActivityEntryTimeFields() {
  const startTime = normalizeTimeInput(document.getElementById("activityEntryStartTime")?.value || "");
  const endTime = normalizeTimeInput(document.getElementById("activityEntryEndTime")?.value || "");
  const billingType = normalizeBillingType(document.getElementById("activityEntryBillingType")?.value || "");
  let totalHours = readHoursInputValue(document.getElementById("activityEntryTotalHours"));
  if (totalHours == null) totalHours = calculateHoursFromTimes(startTime, endTime);
  const expenseAmount = parseExpenseAmount(document.getElementById("activityEntryExpenseAmount")?.value || "");
  const expenseCurrency = normalizeExpenseCurrency(document.getElementById("activityEntryExpenseCurrency")?.value || "CAD");
  const expenseType = normalizeExpenseType(document.getElementById("activityEntryExpenseType")?.value || "");
  const workDate = normalizeDateOnly(document.getElementById("activityEntryWorkDate")?.value || "");
  const startTimePartial = inputEntryIsPartial(document.getElementById("activityEntryStartTime"));
  const endTimePartial = inputEntryIsPartial(document.getElementById("activityEntryEndTime"));
  const workDatePartial = inputEntryIsPartial(document.getElementById("activityEntryWorkDate"));
  if (billingType === "expense") return { startTime: "", endTime: "", totalHours: 0, billingType, expenseAmount, expenseCurrency, expenseType, workDate, startTimePartial: false, endTimePartial: false, workDatePartial };
  return { startTime, endTime, totalHours, billingType, expenseAmount: null, expenseCurrency: "", expenseType: "", workDate, startTimePartial, endTimePartial, workDatePartial };
}

function updateActivityEntryHoursCalculation() {
  const start = document.getElementById("activityEntryStartTime");
  const end = document.getElementById("activityEntryEndTime");
  const hours = document.getElementById("activityEntryTotalHours");
  if (!start || !end || !hours) return;
  refreshActivityEntryWarning();
  const calculated = calculateHoursFromTimes(start.value, end.value);
  if (calculated != null) setHoursInputValue(hours, calculated);
}

function synchronizeActivityEntryBillingFields() {
  const billing = document.getElementById("activityEntryBillingType");
  const expenseFields = document.getElementById("activityEntryExpenseFields");
  const isExpense = normalizeBillingType(billing?.value) === "expense";
  if (expenseFields) expenseFields.hidden = !isExpense;
  ["activityEntryStartTime", "activityEntryEndTime", "activityEntryTotalHours"].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.disabled = isExpense;
    input.classList.toggle("billing-disabled", isExpense);
    if (isExpense) input.value = "";
  });
}

function synchronizeCommentBillingFields() {
  const billingTypeInput = document.getElementById("commentBillingType");
  const expenseFields = document.getElementById("commentExpenseFields");
  const startInput = document.getElementById("commentStartTime");
  const endInput = document.getElementById("commentEndTime");
  const hoursInput = document.getElementById("commentTotalHours");
  const isExpense = normalizeBillingType(billingTypeInput?.value) === "expense";
  if (expenseFields) expenseFields.hidden = !isExpense;
  [startInput, endInput, hoursInput].forEach(input => {
    if (!input) return;
    input.disabled = isExpense;
    input.classList.toggle("billing-disabled", isExpense);
    if (isExpense) input.value = "";
  });
  // v0.8.11: drop the stamped exact value too, so an expense record cannot read back a stale one.
  if (isExpense && hoursInput && hoursInput.dataset) hoursInput.dataset.hoursExact = "";
}

function getCommentDeliverableFromEditor() {
  updateDeliverableDateDisabled("comment");
  return readDeliverableEditor("comment");
}

function commentDraftDiffers(comment, draft) {
  if (!comment || !draft) return false;
  const currentHours = parseHoursInput(comment.totalHours);
  const draftHours = draft.totalHours == null ? null : Number(draft.totalHours);
  return String(comment.text || "").trim() !== String(draft.text || "").trim()
    // v0.8.9: a partly entered time box states no opinion about the stored value, so it must not
    // register as a difference and trigger a commit that would rewrite the rest of the row.
    || (!draft.startTimePartial && normalizeTimeInput(comment.startTime || "") !== normalizeTimeInput(draft.startTime || ""))
    || (!draft.endTimePartial && normalizeTimeInput(comment.endTime || "") !== normalizeTimeInput(draft.endTime || ""))
    || (currentHours == null ? null : Number(currentHours)) !== (draftHours == null ? null : Number(draftHours))
    || commentBillingType(comment) !== normalizeBillingType(draft.billingType)
    || expenseAmountForComment(comment) !== (draft.expenseAmount || 0)
    || expenseCurrencyForComment(comment) !== normalizeExpenseCurrency(draft.expenseCurrency)
    || normalizeExpenseType(comment.expenseType) !== normalizeExpenseType(draft.expenseType)
    || (!draft.workDatePartial && normalizeDateOnly(comment.workDate) !== normalizeDateOnly(draft.workDate))
    || (!(draft.deliverable && draft.deliverable.partial) && !deliverableEquals(comment.deliverable, draft.deliverable));
}

function commitSelectedCommentEditorChanges(options = {}) {
  const targetIds = getCommentEditorTargetIds();
  if (targetIds.newActivity) return false;
  const record = targetIds.recordId ? getRecordById(targetIds.recordId) : getSelectedRecord();
  const commentId = targetIds.commentId || selectedCommentId;
  if (!record || !commentId || isRecordLocked(record)) return false;
  const comment = (record.comments || []).find(item => item.id === commentId);
  if (!comment || isCommentLocked(comment)) return false;
  const activity = targetIds.activityId ? (comment.activities || []).find(item => item.id === targetIds.activityId) : null;
  const target = activity || comment;
  if (isCommentLocked(target)) return false;
  const draft = getCommentEditorDraft();
  if (!draft.text && !draft.startTime && !draft.endTime && draft.totalHours == null && !draft.billingType && draft.expenseAmount == null && !draft.workDate) return false;
  if (!commentDraftDiffers(target, draft)) return false;
  const now = new Date().toISOString();
  target.text = draft.text || target.text || "Untitled update";
  applyCommentTimeFields(target, draft);
  // v0.8.9: leave the stored deliverable alone while its date is only partly entered.
  if (!draft.deliverable || !draft.deliverable.partial) target.deliverable = normalizeDeliverable(draft.deliverable);
  target.updatedAt = now;
  if (activity) comment.updatedAt = now;
  record.updatedAt = now;
  markDirty({ reason: "update field committed", skipAutoSave: !!options.saveNow });
  if (options.renderRows) {
    renderActiveMemorySummary();
    renderRecords();
  }
  if (options.saveNow) forceAutoSaveNow("update field committed");
  return true;
}

function applyCommentTimeFields(comment, fields) {
  if (!comment || !fields) return;
  // v0.8.9: an empty box still clears the stored value, but a half-entered time is not an empty
  // box. When the control reports a partial entry the saved time is preserved rather than deleted,
  // so an interrupted or incomplete entry can no longer destroy an already-recorded time.
  const timeEntryPartial = !!(fields.startTimePartial || fields.endTimePartial);
  if (fields.startTime) comment.startTime = fields.startTime;
  else if (!fields.startTimePartial) delete comment.startTime;
  if (fields.endTime) comment.endTime = fields.endTime;
  else if (!fields.endTimePartial) delete comment.endTime;
  if (fields.totalHours != null) comment.totalHours = fields.totalHours;
  else if (!timeEntryPartial) delete comment.totalHours;
  const workDate = normalizeDateOnly(fields.workDate);
  if (workDate) comment.workDate = workDate;
  else if (!fields.workDatePartial) delete comment.workDate;
  const billingType = normalizeBillingType(fields.billingType);
  if (billingType) comment.billingType = billingType;
  else delete comment.billingType;
  // Keep the older field for compatibility with prior saved-site files and rollbacks.
  if (isTimeBillingType(billingType)) comment.hourType = billingType;
  else delete comment.hourType;
  const expenseAmount = parseExpenseAmount(fields.expenseAmount);
  if (billingType === "expense" && expenseAmount != null) comment.expenseAmount = expenseAmount;
  else delete comment.expenseAmount;
  if (billingType === "expense") comment.expenseCurrency = normalizeExpenseCurrency(fields.expenseCurrency);
  else delete comment.expenseCurrency;
  const expenseType = normalizeExpenseType(fields.expenseType);
  if (billingType === "expense" && expenseType) comment.expenseType = expenseType;
  else delete comment.expenseType;
}

function normalizeHourType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "regular" || normalized === "overtime" ? normalized : "";
}

function formatExpenseInputValue(value) {
  const amount = parseExpenseAmount(value);
  return amount == null ? "" : amount.toFixed(2);
}

// v0.8.9: A segmented date control reports value === "" for two very different states: a box the
// operator deliberately cleared, and a box where only some segments are filled (a date with no
// year yet). Treating the second as the first deleted an already-saved value and left the
// dependent field blank with no warning. validity.badInput separates them, so a half-entered
// value is never mistaken for a clear. This applied to the segmented time control too until
// v0.8.10 replaced it; the date boxes still use this path.
// v0.8.10: the Start/End boxes are plain text so a 24-hour time can be typed straight through.
// A text box holds the literal keystrokes, so it has its own half-entered state: "2" or "20" is
// neither a usable time nor a deliberate clear. Detect that the same way and keep the same
// protection -- an unfinished entry must never delete an already-stored time.
function timeTextInputIsPartial(input) {
  const raw = String(input.value || "").trim();
  return raw !== "" && !normalizeTimeInput(raw);
}

function inputEntryIsPartial(input) {
  if (!input || input.disabled) return false;
  if (isTimeTextInput(input)) return timeTextInputIsPartial(input);
  if (String(input.value || "").trim()) return false;
  return !!(input.validity && input.validity.badInput);
}

function isTimeTextInput(input) {
  return !!(input && input.dataset && input.dataset.timeText === "1");
}

// Settle a completed entry to canonical HH:MM on blur or change, so "2000", "20:00" and "8:05"
// all display and store identically. Text that does not parse is left exactly as typed so the
// operator can see what is unfinished and correct it.
function normalizeTimeTextInput(input) {
  if (!isTimeTextInput(input) || input.disabled) return false;
  const raw = String(input.value || "").trim();
  if (!raw) {
    if (input.value !== "") input.value = "";
    return true;
  }
  const normalized = normalizeTimeInput(raw);
  if (normalized && normalized !== input.value) input.value = normalized;
  return true;
}

function settleTimeTextEntry(target) {
  if (!normalizeTimeTextInput(target)) return;
  if (target.id === "activityEntryStartTime" || target.id === "activityEntryEndTime") updateActivityEntryHoursCalculation();
  else updateCommentHoursCalculation();
}

function normalizeTimeInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const compact = raw.replace(/\s+/g, "");
  let match = compact.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    match = compact.match(/^(\d{1,2})(\d{2})$/);
  }
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseTimeMinutes(value) {
  const normalized = normalizeTimeInput(value);
  if (!normalized) return null;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateHoursFromTimes(startTime, endTime) {
  const start = parseTimeMinutes(startTime);
  const end = parseTimeMinutes(endTime);
  if (start == null || end == null) return null;
  let minutes = end - start;
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
}

function parseHoursInput(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  // v0.8.11: the Hrs box now displays H:MM, so accept that form alongside the decimal form it has
  // always taken -- "1:17" and "1.28" mean the same elapsed time. A bare number stays decimal
  // hours and is never read as a compact clock value, so "130" is still 130 hours, not 1:30.
  const clock = text.match(/^(\d{1,4}):([0-5]\d)$/);
  if (clock) return Math.round((Number(clock[1]) + Number(clock[2]) / 60) * 100) / 100;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number * 100) / 100;
}

// v0.8.11: elapsed time as H:MM for the editor box and the B05 row badge. Reports, the Hours
// table, MDS billing and the Excel exports keep the decimal form, which is the accepted output
// format and is not changed here.
function formatHoursClock(value) {
  if (value == null || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  const totalMinutes = Math.round(Math.abs(number) * 60);
  return `${number < 0 ? "-" : ""}${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

// Write a calculated value into an Hrs box and stamp the exact decimal beside it.
function setHoursInputValue(input, hours) {
  if (!input) return;
  input.value = formatHoursClock(hours);
  if (input.dataset) input.dataset.hoursExact = hours == null ? "" : String(hours);
}

// H:MM resolves only to the minute, so a stored value that is not minute-aligned (1.29) renders
// as 1:17 and would read back as 1.28. When the box still holds exactly what was rendered, return
// the stamped value instead, so opening a record can never silently re-round its stored hours.
// Once the operator edits the box, the typed text wins.
function readHoursInputValue(input) {
  if (!input) return null;
  const text = String(input.value || "").trim();
  const exact = input.dataset ? input.dataset.hoursExact : undefined;
  if (exact !== undefined && text === formatHoursClock(exact)) return parseHoursInput(exact);
  return parseHoursInput(text);
}

function formatHoursInputValue(value) {
  if (value == null || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(Math.round(number * 100) / 100);
}

function formatHoursLabel(value) {
  const input = formatHoursInputValue(value);
  return input ? `${input}hrs` : "";
}

function secondaryHoursBadgeHtml(comment) {
  // v0.8.11: matches the editor box so the same number reads the same way on the same screen.
  const hours = formatHoursClock(comment && comment.totalHours);
  return hours ? `<span class="secondary-hours-label">Hours: ${escapeHtml(hours)}</span>` : "";
}

function secondaryCollapsedDisplayDate(comment) {
  return normalizeDateOnly(comment?.workDate)
    || dateFromIso(comment?.createdAt)
    || dateFromIso(comment?.updatedAt)
    || "";
}

function updateTimeMetaHtml(comment) {
  if (!comment) return "";
  const displayDate = formatShortDate(secondaryCollapsedDisplayDate(comment)) || "not stated";
  const createdTime = formatShortTime(comment.createdAt || comment.updatedAt);
  const dateAndCreatedTime = [displayDate, createdTime].filter(Boolean).join(" · ");
  const hoursLabel = formatHoursLabel(comment.totalHours);
  if (!hoursLabel) {
    return `<span class="update-time-desktop">${escapeHtml(dateAndCreatedTime)}</span><span class="update-time-mobile">${escapeHtml(displayDate)}</span>`;
  }
  const start = normalizeTimeInput(comment.startTime || "");
  const end = normalizeTimeInput(comment.endTime || "");
  const desktop = start && end ? `${dateAndCreatedTime} · ${start}-${end}` : dateAndCreatedTime;
  const mobile = displayDate;
  return `<span class="update-time-desktop">${escapeHtml(desktop)}</span><span class="update-time-mobile">${escapeHtml(mobile)}</span>`;
}

function applyStatusTimestamps(item, nextStatus) {
  if (!item) return;
  const normalizedStatus = normalizeLegacyStatus(nextStatus);
  const now = new Date().toISOString();
  item.status = normalizedStatus;
  item.updatedAt = now;
  if (normalizedStatus === "closed") {
    item.closedAt = now;
  } else {
    item.closedAt = "";
  }
}

function openClosedButtons(kind, status, id = "") {
  const attr = kind === "record" ? "data-action=\"set-record-status\"" : `data-action=\"set-comment-status\" data-comment-id=\"${escapeHtml(id)}\"`;
  return `<button type="button" class="small ${status === "open" ? "" : "secondary"}" ${attr} data-status="open">OPEN</button>
    <button type="button" class="small ${status === "closed" ? "" : "secondary"}" ${attr} data-status="closed">CLOSED</button>`;
}

function recordStatusButtons(status) {
  if (status === "closed") {
    return `<button type="button" class="small secondary" data-action="set-record-status" data-status="open">REOPEN</button>
      <span class="pill locked-pill">LOCKED</span>`;
  }
  return openClosedButtons("record", status);
}

async function initDatabase() {
  if (!("indexedDB" in window)) {
    dbAvailable = false;
    setStatus("Browser storage is unavailable. Email Current Memory and Dropbox remain available.");
    return;
  }
  try {
    db = await openDatabase();
    dbAvailable = true;
  } catch (error) {
    console.error(error);
    dbAvailable = false;
    setStatus("Browser storage is unavailable. Email Current Memory and Dropbox remain available.");
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
  });
}

function transaction(mode = "readonly") {
  if (!db) throw new Error("Database not available");
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

function savePackageToDb(record) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error || new Error("Save failed"));
  });
}

function getAllPackagesFromDb() {
  return new Promise((resolve, reject) => {
    if (!dbAvailable) return resolve([]);
    const request = transaction("readonly").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Read failed"));
  });
}

function getPackageFromDb(id) {
  return new Promise((resolve, reject) => {
    const request = transaction("readonly").get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Read failed"));
  });
}

function deletePackageFromDb(id) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error("Delete failed"));
  });
}

function createPackageRecord(data, sourceLabel, options = {}) {
  data = attachTemplateLibraryToPackage ? attachTemplateLibraryToPackage(data) : data;
  const now = new Date().toISOString();
  const existingId = !options.forceNew && currentPackageRecord && currentPackageRecord.id;
  return {
    id: existingId || createId("pkg"),
    packageType: data.packageType || "sitescribe_two_level_records",
    site: data.site || "not stated",
    shiftDate: data.shiftDate || todayString(),
    processedAt: data.processedAt || now,
    importedAt: (!options.forceNew && currentPackageRecord?.importedAt) || now,
    savedSiteOrder: (!options.forceNew && Number.isFinite(Number(currentPackageRecord?.savedSiteOrder))) ? Number(currentPackageRecord.savedSiteOrder) : Date.now(),
    lastModified: now,
    sourceLabel: sourceLabel || (!options.forceNew && currentPackageRecord?.sourceLabel) || "manual entry",
    title: `${data.site || "not stated"} - ${data.shiftDate || todayString()}`,
    statusSummary: summarizeStatus(data),
    data: structuredCloneSafe(data)
  };
}

async function saveCurrentPackageToLocalStorage(options = {}) {
  const silent = !!options.silent;
  const previousModifiedAt = currentPackage?.reviewConsole?.modifiedAt || "";
  const previousLocalSavedAt = currentPackage?.reviewConsole?.localSavedAt || "";
  commitPendingConfigDraft({ reason: "save_to_local_storage", skipDirty: true });
  commitActiveMemorySiteInput({ silent: true });
  if (!dbAvailable) {
    if (!silent) setStatus("Browser storage is unavailable. Use Email Current Memory or Dropbox instead.");
    return false;
  }
  try {
    attachTemplateLibraryToPackage(currentPackage);
    ensurePackageFreshnessMetadata(currentPackage);
    const localSavedAt = new Date().toISOString();
    currentPackage.reviewConsole = {
      ...(currentPackage.reviewConsole || {}),
      appName: "SiteScribe Review Console",
      appVersion: APP_VERSION,
      modifiedAt: localSavedAt,
      localSavedAt,
      sourceLabel: currentPackageRecord?.sourceLabel || "manual entry",
      localPackageId: currentPackageRecord?.id || "not saved yet",
      model: "two-level-records-with-record-flags"
    };
    currentPackageRecord = createPackageRecord(currentPackage, currentPackageRecord?.sourceLabel || "manual entry");
    // v0.5.99: do not force the active B02/Saved Sites row open during save/autosave.
    // selectedArchivePackageId controls whether the title/date editor is expanded.
    // Preserve the user's current collapsed/expanded state instead of selecting the active row.
    activeSiteFileOpen = true;
    await savePackageToDb(currentPackageRecord);
    rememberActiveWorkingCopy(currentPackageRecord.id);
    dirty = false;
    await refreshArchive();
    if (!silent) {
      setStatus("Saved to local storage.");
      showToast("Saved locally.");
    }
    return true;
  } catch (error) {
    if (currentPackage && currentPackage.reviewConsole) {
      currentPackage.reviewConsole.modifiedAt = previousModifiedAt;
      currentPackage.reviewConsole.localSavedAt = previousLocalSavedAt;
    }
    console.error(error);
    if (!silent) setStatus(`Could not save locally: ${error.message}`);
    else setStatus(`Background save failed: ${error.message}`);
    return false;
  }
}

async function refreshArchive() {
  try {
    const records = await getAllPackagesFromDb();
    // v0.6.04: preserve the physical Saved Sites list position.
    // Opening/highlighting/saving a site must not move it to the front just because
    // lastModified changed. New records keep their insertion/import order; existing
    // records stay where the user saw them in B02.
    renderArchive(sortSavedSitesForDisplay(records));
  } catch (error) {
    console.error(error);
    els.localArchive.className = "archive-list empty";
    els.localArchive.textContent = "Local archive unavailable.";
  }
}

function sortSavedSitesForDisplay(records) {
  return [...(records || [])].sort((a, b) => {
    const aOrder = Number.isFinite(Number(a.savedSiteOrder)) ? Number(a.savedSiteOrder) : null;
    const bOrder = Number.isFinite(Number(b.savedSiteOrder)) ? Number(b.savedSiteOrder) : null;
    if (aOrder !== null && bOrder !== null && aOrder !== bOrder) return aOrder - bOrder;
    if (aOrder !== null && bOrder === null) return -1;
    if (aOrder === null && bOrder !== null) return 1;
    const aCreated = String(a.importedAt || a.createdAt || a.processedAt || a.id || "");
    const bCreated = String(b.importedAt || b.createdAt || b.processedAt || b.id || "");
    return aCreated.localeCompare(bCreated);
  });
}

function renderArchive(records) {
  if (!records.length) {
    els.localArchive.className = "archive-list empty";
    els.localArchive.textContent = dbAvailable ? "No saved sites." : "Local storage unavailable.";
    updateSiteWalkSummaries();
    return;
  }
  els.localArchive.className = "archive-list";
  const activeId = currentPackageRecord && currentPackageRecord.id ? currentPackageRecord.id : "";
  els.localArchive.innerHTML = records.map(record => {
    const isActive = activeId && record.id === activeId;
    const isSelected = selectedArchivePackageId === record.id;
    const title = String(record.site || "").trim() || "Unnamed SiteScribe site";
    const contentUpdatedAt = savedSiteContentUpdatedAt(record);
    const editBox = isSelected ? `
      <div class="archive-edit-box" data-edit-box="${escapeHtml(record.id)}">
        <label class="field-label">Title / Site Name
          <input class="archive-title-input" type="text" value="${escapeHtml(record.site || "")}" autocomplete="off" />
        </label>
        <label class="field-label">Date
          <input class="archive-date-input" type="date" value="${escapeHtml(record.shiftDate || "")}" />
        </label>
        <div class="button-row">
          <button type="button" class="secondary small" data-action="save-package-meta">Save Title/Date</button>
        </div>
      </div>` : "";
    return `<div class="archive-item${isActive ? " active-archive-item" : ""}${isSelected ? " selected-archive-item" : ""}" data-package-id="${escapeHtml(record.id)}" draggable="true">
      <div class="archive-main">
        <div class="archive-title dropbox-file-name">${escapeHtml(title)}${isActive ? ' <span class="active-site-badge">OPENED</span>' : ''}</div>
        <div class="record-meta archive-content-updated dropbox-file-meta dropbox-freshness-line">Content updated: ${escapeHtml(formatDateTime(contentUpdatedAt))}</div>
        ${editBox}
      </div>
      <div class="button-row archive-actions">
        <button type="button" class="small" data-action="open-package">OPEN</button>
        <button type="button" class="secondary small archive-contacts-button" data-action="open-package-contacts" title="Open this saved site's Contacts / Departments setup">Contacts / Depts</button>
        <button type="button" class="secondary small" data-action="export-package">Export</button>
        <button type="button" class="danger small" data-action="delete-package">Delete</button>
      </div>
    </div>`;
  }).join("");
  updateSiteWalkSummaries();
}

function handleSavedSitesDragStart(event) {
  const item = event.target.closest(".archive-item");
  if (!item || !item.dataset.packageId) return;
  if (event.target.closest("button, input, textarea, select, label")) {
    event.preventDefault();
    return;
  }
  savedSitesDragPackageId = item.dataset.packageId;
  savedSitesDropIntent = null;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/sitescribe-saved-site-move", savedSitesDragPackageId);
  event.dataTransfer.setData("text/plain", "sitescribe-saved-site-move");
  item.classList.add("dragging");
}

function handleSavedSitesDragOver(event) {
  const sourceId = getSavedSitesDragPackageId(event);
  if (!sourceId) return;
  const item = event.target.closest(".archive-item");
  clearSavedSitesDropTargets();
  savedSitesDropIntent = null;
  updateWorkingMemoryAutoScroll(event);
  if (!item || !item.dataset.packageId || item.dataset.packageId === sourceId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  const dropIntent = getSavedSiteDropIntent(event, item);
  savedSitesDropIntent = { targetPackageId: item.dataset.packageId, ...dropIntent };
  if (dropIntent.action === "merge") item.classList.add("archive-merge-target");
  else item.classList.add(`archive-reorder-${dropIntent.position}`);
}

function getSavedSiteDropIntent(event, item) {
  const rect = item.getBoundingClientRect();
  const height = rect.height || 1;
  const ratio = Math.max(0, Math.min(1, (event.clientY - rect.top) / height));
  if (ratio < 0.25) return { action: "reorder", position: "before" };
  if (ratio > 0.75) return { action: "reorder", position: "after" };
  return { action: "merge", position: "inside" };
}

function handleSavedSitesDragLeave(event) {
  const item = event.target.closest(".archive-item");
  const entering = event.relatedTarget;
  if (item && (!entering || !item.contains(entering))) item.classList.remove("archive-reorder-before", "archive-reorder-after", "archive-merge-target");
}

async function handleSavedSitesDrop(event) {
  const sourceId = getSavedSitesDragPackageId(event);
  const intent = savedSitesDropIntent;
  if (!sourceId || !intent || !intent.targetPackageId || sourceId === intent.targetPackageId) {
    finishSavedSitesDrag();
    return;
  }
  event.preventDefault();
  clearSavedSitesDropTargets();
  try {
    if (intent.action === "merge") await mergeSavedSiteIntoTarget(sourceId, intent.targetPackageId);
    else await reorderSavedSites(sourceId, intent.targetPackageId, intent.position);
    savedSitesSuppressClickUntil = Date.now() + 250;
  } catch (error) {
    console.error(error);
    setStatus(`Saved Sites drag/drop failed: ${error.message}`);
  } finally {
    finishSavedSitesDrag();
  }
}

function getSavedSitesDragPackageId(event) {
  if (savedSitesDragPackageId) return savedSitesDragPackageId;
  try {
    return event.dataTransfer && event.dataTransfer.getData("application/sitescribe-saved-site-move") || "";
  } catch (_) {
    return "";
  }
}

function clearSavedSitesDropTargets() {
  if (!els.localArchive) return;
  els.localArchive.querySelectorAll(".archive-reorder-before, .archive-reorder-after, .archive-merge-target, .dragging").forEach(item => {
    item.classList.remove("archive-reorder-before", "archive-reorder-after", "archive-merge-target", "dragging");
  });
}

function finishSavedSitesDrag() {
  savedSitesDragPackageId = null;
  savedSitesDropIntent = null;
  stopWorkingMemoryAutoScroll();
  clearSavedSitesDropTargets();
}

async function reorderSavedSites(sourceId, targetId, position) {
  if (!dbAvailable) throw new Error("Local storage is unavailable.");
  const records = sortSavedSitesForDisplay(await getAllPackagesFromDb());
  const sourceIndex = records.findIndex(record => record.id === sourceId);
  if (sourceIndex < 0) throw new Error("Source saved site not found.");
  const [source] = records.splice(sourceIndex, 1);
  const targetIndex = records.findIndex(record => record.id === targetId);
  if (targetIndex < 0) throw new Error("Target saved site not found.");
  const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
  records.splice(insertIndex, 0, source);

  const updatedRecords = records.map((record, index) => ({
    ...record,
    savedSiteOrder: (index + 1) * 1000
  }));

  await Promise.all(updatedRecords.map(record => savePackageToDb(record)));
  const active = updatedRecords.find(record => currentPackageRecord && record.id === currentPackageRecord.id);
  if (active) currentPackageRecord = structuredCloneSafe(active);
  await refreshArchive();
  setStatus("Saved Sites order updated.");
  showToast("Saved Sites reordered.");
}

async function mergeSavedSiteIntoTarget(sourceId, targetId) {
  if (!dbAvailable) throw new Error("Local storage is unavailable.");
  if (!sourceId || !targetId || sourceId === targetId) throw new Error("Choose two different saved sites to merge.");

  const sourceRecord = await getPackageFromDb(sourceId);
  const targetRecord = await getPackageFromDb(targetId);
  if (!sourceRecord || !sourceRecord.data) throw new Error("Source saved site not found.");
  if (!targetRecord || !targetRecord.data) throw new Error("Receiving saved site not found.");

  const sourceLabel = savedSiteLabel(sourceRecord);
  const targetLabel = savedSiteLabel(targetRecord);
  const ok = confirm(`Merge saved site "${sourceLabel}" into "${targetLabel}"?

Records from ${sourceLabel} will be added to ${targetLabel}. The receiving saved site keeps its name. The separate ${sourceLabel} saved-site row will be removed. Export first if you want a separate backup.`);
  if (!ok) {
    setStatus("Saved Sites merge cancelled.");
    showToast("Merge cancelled.");
    return;
  }

  const targetData = normalizeImportedPackage(structuredCloneSafe(targetRecord.data));
  const sourceData = normalizeImportedPackage(structuredCloneSafe(sourceRecord.data));
  const preservedSite = siteIsStated(targetRecord.site) ? targetRecord.site : targetData.site;
  const preservedShiftDate = targetRecord.shiftDate || targetData.shiftDate || todayString();

  const summary = appendPackageRecords(targetData, sourceData, sourceLabel);
  targetData.site = preservedSite || "not stated";
  targetData.shiftDate = preservedShiftDate;
  targetData.reviewConsole = {
    ...(targetData.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    modifiedAt: new Date().toISOString(),
    model: "two-level-records-with-record-flags",
    savedSiteMergeRule: "source-merged-into-receiver-receiver-name-preserved"
  };

  const updatedTarget = {
    ...targetRecord,
    site: targetData.site,
    shiftDate: targetData.shiftDate,
    title: `${targetData.site || "not stated"} - ${targetData.shiftDate || todayString()}`,
    lastModified: new Date().toISOString(),
    statusSummary: summarizeStatus(targetData),
    data: structuredCloneSafe(targetData)
  };

  await savePackageToDb(updatedTarget);
  await deletePackageFromDb(sourceId);
  if (selectedArchivePackageId === sourceId) selectedArchivePackageId = null;

  if (currentPackageRecord && (currentPackageRecord.id === sourceId || currentPackageRecord.id === targetId)) {
    openSavedPackageAsActive(updatedTarget);
  } else {
    await refreshArchive();
  }

  setStatus(`Merged ${summary.added} records from ${sourceLabel} into ${targetLabel}; skipped ${summary.skipped} duplicates.`);
  showToast("Saved sites merged.");
}

function savedSiteLabel(record) {
  if (!record) return "not stated";
  return `${record.site || "not stated"} | ${record.shiftDate || "not stated"}`;
}

function appendPackageRecords(targetPackage, incomingPackage, sourceLabel) {
  if (!targetPackage || !Array.isArray(targetPackage.records)) targetPackage.records = [];
  if (!incomingPackage || !Array.isArray(incomingPackage.records)) incomingPackage = { records: [] };

  const existingRecordIds = new Set((targetPackage.records || []).map(record => record.id).filter(Boolean));
  const existingFlagIds = new Set((targetPackage.records || []).flatMap(record => (record.flags || []).map(flag => flag.id)).filter(Boolean));
  const existingCommentIds = new Set((targetPackage.records || []).flatMap(record => (record.comments || []).map(comment => comment.id)).filter(Boolean));
  const existingActivityIds = new Set((targetPackage.records || []).flatMap(record => (record.comments || []).flatMap(comment => (comment.activities || []).map(activity => activity.id))).filter(Boolean));
  const existingKeys = new Set((targetPackage.records || []).map(record => importDedupeKey(record)));
  let added = 0;
  let skipped = 0;
  const recordIdMap = new Map();
  const commentIdMap = new Map();
  const activityIdMap = new Map();

  incomingPackage.records.forEach(sourceRecord => {
    const record = normalizeRecord(structuredCloneSafe(sourceRecord));
    const key = importDedupeKey(record);
    if (existingKeys.has(key)) {
      skipped += 1;
      return;
    }
    const sourceRecordId = record.id;
    if (!record.id || existingRecordIds.has(record.id)) record.id = createId("rec");
    if (sourceRecordId) recordIdMap.set(sourceRecordId, record.id);
    existingRecordIds.add(record.id);
    record.flags = (record.flags || []).map(flag => {
      const normalized = normalizeFlag(flag);
      if (!normalized.id || existingFlagIds.has(normalized.id)) normalized.id = createId("flag");
      existingFlagIds.add(normalized.id);
      return normalized;
    });
    record.comments = (record.comments || []).map(comment => {
      const normalized = normalizeComment(comment);
      const sourceCommentId = normalized.id;
      if (!normalized.id || existingCommentIds.has(normalized.id)) normalized.id = createId("com");
      if (sourceCommentId) commentIdMap.set(sourceCommentId, normalized.id);
      existingCommentIds.add(normalized.id);
      normalized.activities = (normalized.activities || []).map(activity => {
        const normalizedActivity = normalizeComment({ ...activity, activities: [] });
        const sourceActivityId = normalizedActivity.id;
        if (!normalizedActivity.id || existingActivityIds.has(normalizedActivity.id)) normalizedActivity.id = createId("act");
        if (sourceActivityId) activityIdMap.set(sourceActivityId, normalizedActivity.id);
        existingActivityIds.add(normalizedActivity.id);
        return normalizedActivity;
      });
      return normalized;
    });
    targetPackage.records.push(record);
    existingKeys.add(key);
    added += 1;
  });

  targetPackage.importHistory = Array.isArray(targetPackage.importHistory) ? targetPackage.importHistory : [];
  targetPackage.importHistory.push({
    sourceLabel,
    importedAt: new Date().toISOString(),
    sourceSite: incomingPackage.site || "not stated",
    sourceShiftDate: incomingPackage.shiftDate || "not stated",
    recordsAdded: added,
    duplicateRecordsSkipped: skipped
  });

  targetPackage.source = targetPackage.source || { captureMethod: "merged import", rawText: "" };
  const incomingRaw = incomingPackage.source && incomingPackage.source.rawText ? incomingPackage.source.rawText : "";
  if (incomingRaw) {
    targetPackage.source.rawText = [targetPackage.source.rawText, `--- Imported from ${sourceLabel} ---`, incomingRaw].filter(Boolean).join("\n");
  }
  const activityLogSummary = mergeEmailActivityLog(targetPackage, incomingPackage, sourceLabel, recordIdMap, commentIdMap, activityIdMap);
  return { added, skipped, ...activityLogSummary };
}

// Communication activity is intentionally merged separately from records.  Importing
// records must never replace the active site's routing configuration.
function mergeEmailActivityLog(targetPackage, incomingPackage, sourceLabel, recordIdMap = new Map(), commentIdMap = new Map(), activityIdMap = new Map()) {
  targetPackage.emailActivityLog = normalizeEmailActivityLog(targetPackage.emailActivityLog);
  const incoming = normalizeEmailActivityLog(incomingPackage && incomingPackage.emailActivityLog);
  const exactEntries = new Set(targetPackage.emailActivityLog.map(entry => stableJsonForComparison(entry)));
  const ids = new Set(targetPackage.emailActivityLog.map(entry => entry.id).filter(Boolean));
  let activityLogsAdded = 0;
  let activityLogsSkipped = 0;
  let activityLogConflicts = 0;

  incoming.forEach(entry => {
    const candidate = structuredCloneSafe(entry);
    if (recordIdMap.has(candidate.parentRecordId)) candidate.parentRecordId = recordIdMap.get(candidate.parentRecordId);
    if (recordIdMap.has(candidate.recordId)) candidate.recordId = recordIdMap.get(candidate.recordId);
    if (commentIdMap.has(candidate.recordId)) candidate.recordId = commentIdMap.get(candidate.recordId);
    if (activityIdMap.has(candidate.recordId)) candidate.recordId = activityIdMap.get(candidate.recordId);
    const signature = stableJsonForComparison(candidate);
    if (exactEntries.has(signature)) {
      activityLogsSkipped += 1;
      return;
    }
    if (!candidate.id || ids.has(candidate.id)) {
      const originalId = candidate.id || "not stated";
      candidate.id = createId("email_log");
      candidate.importConflict = { type: "duplicate_log_id", originalId, sourceLabel, detectedAt: new Date().toISOString() };
      activityLogConflicts += 1;
    }
    ids.add(candidate.id);
    exactEntries.add(stableJsonForComparison(candidate));
    targetPackage.emailActivityLog.push(candidate);
    activityLogsAdded += 1;
  });
  return { activityLogsAdded, activityLogsSkipped, activityLogConflicts };
}

function stableJsonForComparison(value) {
  const sortValue = item => {
    if (Array.isArray(item)) return item.map(sortValue);
    if (item && typeof item === "object") return Object.keys(item).sort().reduce((out, key) => {
      out[key] = sortValue(item[key]);
      return out;
    }, {});
    return item;
  };
  return JSON.stringify(sortValue(value));
}

async function handleArchiveClick(event) {
  if (Date.now() < savedSitesSuppressClickUntil) return;
  const item = event.target.closest(".archive-item");
  if (!item) return;
  const id = item.dataset.packageId;
  if (!id) return;
  const button = event.target.closest("[data-action]");

  if (!button) {
    if (event.target.closest("input, textarea, select, label")) return;
    selectedArchivePackageId = selectedArchivePackageId === id ? null : id;
    await refreshArchive();
    return;
  }

  const action = button.dataset.action;
  try {
    const record = await getPackageFromDb(id);
    if (!record) throw new Error("Package not found");
    if (action === "open-package") {
      openSavedPackageAsActive(record);
      return;
    }
    if (action === "open-package-contacts") {
      openSavedPackageAsActive(record);
      openCommunicationSetupPanel();
      setStatus(`Editing Contacts / Departments for saved site: ${record.site || "not stated"}.`);
      return;
    }
    if (action === "save-package-meta") {
      const titleInput = item.querySelector(".archive-title-input");
      const dateInput = item.querySelector(".archive-date-input");
      const newSite = String(titleInput && titleInput.value || "").trim() || "not stated";
      const newDate = String(dateInput && dateInput.value || "").trim() || record.shiftDate || todayString();
      const updatedRecord = updateSavedPackageMetadata(record, newSite, newDate);
      await savePackageToDb(updatedRecord);
      if (currentPackageRecord && currentPackageRecord.id === updatedRecord.id) {
        currentPackageRecord = structuredCloneSafe(updatedRecord);
        currentPackage = structuredCloneSafe(updatedRecord.data);
        activeSiteFileOpen = true;
        hardSwitchActiveMemorySiteInputDelayed();
        dirty = false;
        render();
      }
      selectedArchivePackageId = updatedRecord.id;
      await refreshArchive();
      setStatus("Saved site title/date updated.");
      showToast("Saved site updated.");
      return;
    }
    if (action === "export-package") downloadJson(record.data, filenameForPackage(record.data, "sitescribe_reviewed"));
    if (action === "delete-package") {
      if (!confirm("Delete this saved package from local storage? This does not delete exported JSON files.")) return;
      await deletePackageFromDb(id);
      if (selectedArchivePackageId === id) selectedArchivePackageId = null;
      if (currentPackageRecord && currentPackageRecord.id === id) {
        currentPackageRecord = null;
        activeSiteFileOpen = false;
        currentPackage = createEmptyPackage();
        selectedRecordId = null;
        selectedCommentId = null;
        selectedFlagId = null;
        dirty = false;
        if (els.activeMemorySiteInput) els.activeMemorySiteInput.value = "";
        closeDetail();
        render();
      }
      await refreshArchive();
      setStatus("Saved site deleted from local storage. File load and export still work.");
    }
  } catch (error) {
    console.error(error);
    setStatus(`Archive action failed: ${error.message}`);
  }
}

function updateSavedPackageMetadata(record, siteName, shiftDate) {
  const now = new Date().toISOString();
  const updatedData = structuredCloneSafe(record.data || createEmptyPackage());
  updatedData.site = siteName || "not stated";
  updatedData.shiftDate = shiftDate || updatedData.shiftDate || todayString();
  updatedData.reviewConsole = {
    ...(updatedData.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    savedSiteTitleDateEditedAt: now
  };
  return {
    ...record,
    site: updatedData.site,
    shiftDate: updatedData.shiftDate,
    title: `${updatedData.site || "not stated"} - ${updatedData.shiftDate || todayString()}`,
    lastModified: now,
    statusSummary: summarizeStatus(updatedData),
    data: updatedData
  };
}


function latestIsoTimestamp(values) {
  let latest = "";
  let latestTime = -Infinity;
  (values || []).forEach(value => {
    if (!value) return;
    const time = new Date(value).getTime();
    if (Number.isFinite(time) && time > latestTime) {
      latestTime = time;
      latest = String(value);
    }
  });
  return latest;
}

function derivePackageContentUpdatedAt(pkg) {
  if (!pkg || typeof pkg !== "object") return "";
  const rc = pkg.reviewConsole || {};
  const timestamps = [rc.contentUpdatedAt, rc.siteNameEditedAt, rc.templateAppliedAt, pkg.processedAt, pkg.importedAt];
  (pkg.records || []).forEach(record => {
    timestamps.push(record.createdAt, record.updatedAt, record.closedAt);
    (record.comments || []).forEach(comment => {
      timestamps.push(comment.createdAt, comment.updatedAt, comment.closedAt, comment.action?.openedAt, comment.action?.completedAt);
    });
    (record.flags || []).forEach(flag => timestamps.push(flag.createdAt, flag.updatedAt, flag.resolvedAt));
  });
  (pkg.packageFlags || []).forEach(flag => timestamps.push(flag.createdAt, flag.updatedAt, flag.resolvedAt));
  (pkg.importHistory || []).forEach(item => timestamps.push(item.importedAt));
  timestamps.push(pkg.communicationConfig?.updatedAt);
  (pkg.emailActivityLog || []).forEach(entry => timestamps.push(entry.timestamp, entry.updatedAt, entry.followUpUpdatedAt));
  return latestIsoTimestamp(timestamps) || rc.modifiedAt || "";
}

// v0.8.12: the B02 saved-site line previously showed record.lastModified, which markDirty bumps on
// every save -- including a pure view-state toggle such as expanding a branch or Hide Closed. That
// is a touch time, not a content time, so the line disagreed with the B01 Dropbox row while
// claiming the same meaning, and a file that was genuinely in sync looked stale. Show the
// package's own content timestamp instead: it is the same value the Dropbox freshness pill uses
// for the local side, so an identical date in B02 and B01 now means genuinely in sync.
// The derivation and the record dates remain as fallbacks for older saved sites.
function savedSiteContentUpdatedAt(record) {
  const pkg = record && record.data;
  return (pkg && pkg.reviewConsole && pkg.reviewConsole.contentUpdatedAt)
    || derivePackageContentUpdatedAt(pkg)
    || (record && record.processedAt)
    || (record && record.importedAt)
    || (record && record.lastModified)
    || "";
}

function ensurePackageFreshnessMetadata(pkg) {
  if (!pkg || typeof pkg !== "object") return pkg;
  pkg.reviewConsole = pkg.reviewConsole || {};
  if (!pkg.reviewConsole.contentUpdatedAt) {
    pkg.reviewConsole.contentUpdatedAt = derivePackageContentUpdatedAt(pkg) || new Date().toISOString();
  }
  return pkg;
}

function buildReviewedExportData() {
  commitPendingConfigDraft({ reason: "export_or_email", skipDirty: true });
  commitActiveMemorySiteInput({ silent: true });
  ensurePackageFreshnessMetadata(currentPackage);
  const data = attachTemplateLibraryToPackage(structuredCloneSafe(currentPackage || createEmptyPackage()));
  data.reviewConsole = {
    ...(data.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    modifiedAt: dirty ? new Date().toISOString() : data.reviewConsole?.modifiedAt,
    exportedAt: new Date().toISOString(),
    sourceLabel: currentPackageRecord?.sourceLabel || "manual entry",
    localPackageId: currentPackageRecord?.id || "not saved locally",
    model: "two-level-records-with-record-flags"
  };
  return data;
}

function exportPackage() {
  if (!currentPackage) return;
  const data = buildReviewedExportData();
  downloadJson(data, filenameForPackage(data, "sitescribe_reviewed"));
  setStatus("Current memory exported.");
}

async function emailJsonPackage() {
  if (!currentPackage) return;
  const data = buildReviewedExportData();
  const filename = filenameForPackage(data, "sitescribe_reviewed");
  const jsonText = JSON.stringify(data, null, 2);
  const subject = `SiteScribe JSON export - ${data.site || "site not stated"} - ${data.shiftDate || todayString()}`;
  const body = "Attached is the current SiteScribe reviewed JSON export. Import this file on the other device before editing there.";

  try {
    const file = new File([jsonText], filename, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share({
        title: subject,
        text: body,
        files: [file]
      });
      setStatus("Share sheet opened for current JSON package.");
      return;
    }
  } catch (error) {
    console.warn("File share unavailable; falling back to download and mailto.", error);
  }

  downloadJson(data, filename);
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + "\n\nThe JSON file has also been downloaded. Attach it to this email before sending.")}`;
  window.location.href = mailto;
  setStatus("JSON downloaded. Email draft opened if supported; attach the downloaded JSON before sending.");
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}




function normalizeRecord(record) {
  const createdAt = record.createdAt || record.created || record.timestamp || (record.sourceDate ? `${record.sourceDate}T00:00:00` : new Date().toISOString());
  const updatedAt = record.updatedAt || createdAt;
  const normalized = {
    id: record.id || createId("rec"),
    category: cueToCategory(normalizeCue(record.category || "")) || record.category || "event",
    description: typeof record.description === "string" ? record.description : formatLegacyValue(record.description || record),
    status: normalizeLegacyStatus(record.status),
    createdAt,
    updatedAt,
    closedAt: record.closedAt || "",
    sourceDate: record.sourceDate || record.sourceLogDate || dateFromIso(createdAt) || todayString(),
    sourceText: typeof record.sourceText === "string" ? record.sourceText : formatLegacyValue(record.sourceText || record.description || ""),
    flags: Array.isArray(record.flags) ? record.flags.map(normalizeFlag) : [],
    comments: Array.isArray(record.comments) ? record.comments.map(comment => normalizeComment(comment, createdAt)) : [],
    deliverable: normalizeDeliverable(record.deliverable || { apply: false, date: "" })
  };
  [
    "promotedFromRecordId",
    "promotedFromCommentId",
    "promotedFromCategory",
    "promotedAt",
    "promotedType",
    "sortOrder",
    "secondarySortMode"
  ].forEach(key => {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") normalized[key] = record[key];
  });
  const intent = normalizeIntentValue(record.intent);
  if (intent) normalized.intent = intent;
  ["intentSource", "intentConfidence"].forEach(key => {
    if (record[key] !== undefined && record[key] !== null && String(record[key]).trim()) normalized[key] = String(record[key]).trim();
  });
  if (record.directedTo && typeof record.directedTo === "object") normalized.directedTo = normalizeDirectedTo(record.directedTo);
  return normalized;
}

function normalizeIdList(value) {
  if (value == null || value === "") return [];
  const raw = Array.isArray(value) ? value : [value];
  return [...new Set(raw.map(item => String(item || "").trim()).filter(Boolean))];
}

function normalizeFlag(flag) {
  return {
    id: flag.id || createId("flag"),
    type: flag.type === "clarification" ? "clarify" : (flag.type || "incomplete"),
    text: typeof flag.text === "string" ? flag.text : formatLegacyValue(flag),
    status: normalizeLegacyStatus(flag.status),
    sourceText: typeof flag.sourceText === "string" ? flag.sourceText : formatLegacyValue(flag.sourceText || flag.text || ""),
    resolution: typeof flag.resolution === "string" ? flag.resolution : (typeof flag.answer === "string" ? flag.answer : ""),
    createdAt: flag.createdAt || new Date().toISOString(),
    updatedAt: flag.updatedAt || flag.createdAt || new Date().toISOString(),
    resolvedAt: flag.resolvedAt || ""
  };
}

function normalizeComment(comment, fallbackCreatedAt = "") {
  const createdAt = comment.createdAt || comment.created || comment.timestamp || fallbackCreatedAt || new Date().toISOString();
  const updatedAt = comment.updatedAt || createdAt;
  const normalized = {
    id: comment.id || createId("com"),
    text: typeof comment.text === "string" ? comment.text : formatLegacyValue(comment),
    status: normalizeLegacyStatus(comment.status),
    createdAt,
    updatedAt,
    closedAt: comment.closedAt || ""
  };
  [
    "sourceText",
    "movedFromRecordId",
    "movedFromCommentId",
    "movedFromFlagId",
    "movedFromCategory",
    "movedFromSourceDate",
    "startTime",
    "endTime",
    "totalHours",
    "hourType",
    "billingType",
    "expenseAmount",
    "expenseCurrency",
    "expenseType",
    "workDate",
    "secondarySortOrder",
    "activitySortOrder",
    "movedAt",
    "movedType"
  ].forEach(key => {
    if (comment[key] !== undefined && comment[key] !== null && comment[key] !== "") normalized[key] = comment[key];
  });
  const intent = normalizeIntentValue(comment.intent);
  if (intent) normalized.intent = intent;
  ["intentSource", "intentConfidence"].forEach(key => {
    if (comment[key] !== undefined && comment[key] !== null && String(comment[key]).trim()) normalized[key] = String(comment[key]).trim();
  });
  if (comment.directedTo && typeof comment.directedTo === "object") normalized.directedTo = normalizeDirectedTo(comment.directedTo);
  if (normalized.startTime) normalized.startTime = normalizeTimeInput(normalized.startTime);
  if (normalized.endTime) normalized.endTime = normalizeTimeInput(normalized.endTime);
  if (normalized.totalHours !== undefined) {
    const parsedHours = parseHoursInput(normalized.totalHours);
    if (parsedHours == null) delete normalized.totalHours;
    else normalized.totalHours = parsedHours;
  }
  const workDate = normalizeDateOnly(normalized.workDate);
  if (workDate) normalized.workDate = workDate;
  else delete normalized.workDate;
  const billingType = normalizeBillingType(normalized.billingType, normalized.hourType);
  if (billingType) normalized.billingType = billingType;
  else delete normalized.billingType;
  if (isTimeBillingType(billingType)) normalized.hourType = billingType;
  else delete normalized.hourType;
  const expenseAmount = parseExpenseAmount(normalized.expenseAmount);
  if (billingType === "expense" && expenseAmount != null) normalized.expenseAmount = expenseAmount;
  else delete normalized.expenseAmount;
  if (billingType === "expense") normalized.expenseCurrency = normalizeExpenseCurrency(normalized.expenseCurrency);
  else delete normalized.expenseCurrency;
  const expenseType = normalizeExpenseType(normalized.expenseType);
  if (billingType === "expense" && expenseType) normalized.expenseType = expenseType;
  else delete normalized.expenseType;
  normalized.deliverable = normalizeDeliverable(comment.deliverable || { apply: false, date: "" });
  if (comment.action && typeof comment.action === "object") normalized.action = normalizeAction(comment.action);
  normalized.activities = Array.isArray(comment.activities)
    ? comment.activities.map(activity => normalizeComment({ ...activity, activities: [] }, createdAt))
    : [];
  return normalized;
}

function normalizeIntentValue(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
}

function normalizeDirectedTo(value) {
  const source = value && typeof value === "object" ? value : {};
  const normalized = {
    status: String(source.status || "unresolved").trim(),
    recipientType: String(source.recipientType || "").trim(),
    groupId: String(source.groupId || "").trim(),
    contactId: String(source.contactId || "").trim()
  };
  if (source.reason) normalized.reason = String(source.reason).trim();
  return normalized;
}

function createEmptyCommunicationConfig() {
  return {
    schemaVersion: "1.0",
    updatedAt: "",
    internalDepartments: [],
    externalCompanies: [],
    intents: []
  };
}

function normalizeCommunicationConfig(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? structuredCloneSafe(value) : {};
  const normalized = {
    ...source,
    schemaVersion: String(source.schemaVersion || source.version || "1.0").trim(),
    updatedAt: String(source.updatedAt || "").trim(),
    internalDepartments: normalizeRecipientGroups(source.internalDepartments, "department"),
    externalCompanies: normalizeRecipientGroups(source.externalCompanies || source.subtrades, "company"),
    intents: normalizeIntentCatalog(source.intents || source.intentCatalog)
  };
  delete normalized.version;
  delete normalized.subtrades;
  delete normalized.intentCatalog;
  return normalized;
}

function normalizeRecipientGroups(groups, kind) {
  return (Array.isArray(groups) ? groups : []).map(group => {
    const source = group && typeof group === "object" ? structuredCloneSafe(group) : {};
    const normalized = {
      ...source,
      id: String(source.id || createId(kind === "department" ? "dept" : "company")).trim(),
      name: String(source.name || source.label || "").trim(),
      type: kind,
      aliases: normalizeNameList(source.aliases),
      allowedIntents: normalizeIdList(source.allowedIntents || source.intents),
      keywords: normalizeNameList(source.keywords),
      defaultContactId: String(source.defaultContactId || "").trim(),
      defaultCcContactIds: normalizeIdList(source.defaultCcContactIds || source.defaultCc),
      active: source.active !== false,
      contacts: normalizeCommunicationContacts(source.contacts)
    };
    delete normalized.label;
    delete normalized.intents;
    delete normalized.defaultCc;
    return normalized;
  });
}

function normalizeCommunicationContacts(contacts) {
  return (Array.isArray(contacts) ? contacts : []).map(contact => {
    const source = contact && typeof contact === "object" ? structuredCloneSafe(contact) : {};
    return {
      ...source,
      id: String(source.id || createId("contact")).trim(),
      name: String(source.name || source.fullName || "").trim(),
      fullName: String(source.fullName || source.name || "").trim(),
      email: String(source.email || "").trim(),
      phone: String(source.phone || "").trim(),
      company: String(source.company || "").trim(),
      role: String(source.role || "").trim(),
      aliases: normalizeNameList(source.aliases),
      active: source.active !== false
    };
  });
}

function normalizeIntentCatalog(intents) {
  return (Array.isArray(intents) ? intents : []).map(intent => {
    if (typeof intent === "string") return { id: normalizeIntentValue(intent), label: String(intent).trim() };
    const source = intent && typeof intent === "object" ? structuredCloneSafe(intent) : {};
    const id = normalizeIntentValue(source.id || source.intent || source.label);
    return { ...source, id, label: String(source.label || source.id || "").trim(), aliases: normalizeNameList(source.aliases), keywords: normalizeNameList(source.keywords), active: source.active !== false };
  }).filter(intent => intent.id);
}

function renderManualIntentOptions() {
  if (!els.mainEntryIntent) return;
  const intents = communicationIntentCatalog(currentPackage?.communicationConfig);
  els.mainEntryIntent.innerHTML = intents.filter(intent => intent.active !== false).map(intent =>
    `<option value="${escapeHtml(intent.id)}"${intent.id === "documentation_internal" ? " selected" : ""}>${escapeHtml(intent.label)}</option>`
  ).join("");
}

function allCommunicationGroups() {
  const config = normalizeCommunicationConfig(currentPackage?.communicationConfig);
  return [...config.internalDepartments, ...config.externalCompanies];
}

function contactForRouting(group, id) {
  return (group?.contacts || []).find(contact => contact.id === id) || null;
}

function sourceExplicitlyNames(source, values) {
  const text = String(source || "").toLowerCase();
  return (values || []).some(value => value && text.includes(String(value).toLowerCase()));
}

function resolveRecordRouting(item, parentRecord = null) {
  const intent = normalizeIntentValue(item?.intent) || "documentation_internal";
  const source = `${item?.sourceText || ""} ${item?.description || item?.text || ""}`;
  if (intent === "documentation_internal") return { status: "not_recommended", reason: "Internal documentation record; no email is recommended." };
  const candidates = [];
  allCommunicationGroups().forEach(group => {
    if (group.active === false || !(group.allowedIntents || []).includes(intent)) return;
    const contact = contactForRouting(group, group.defaultContactId);
    const names = [group.name, ...(group.aliases || []), contact?.name, contact?.fullName, ...(contact?.aliases || [])];
    const explicit = sourceExplicitlyNames(source, names);
    const keywordHits = (group.keywords || []).filter(keyword => keyword && source.toLowerCase().includes(keyword.toLowerCase())).length;
    if (explicit || group.defaultContactId) candidates.push({ group, contact, explicit, keywordHits });
  });
  const explicit = candidates.filter(candidate => candidate.explicit);
  const pool = explicit.length ? explicit : candidates;
  if (explicit.length > 1 || (!explicit.length && pool.length !== 1)) return { status: "unresolved", reason: pool.length ? "More than one configured recipient matches this intent; choose in Communication Setup or revise the record intent." : "No active configured recipient accepts this intent." };
  const candidate = pool[0];
  if (!candidate?.contact || candidate.contact.active === false || !candidate.contact.email) return { status: "unresolved", reason: "The configured recipient is inactive or has no email address." };
  return {
    status: "resolved", recipientType: candidate.group.type === "department" ? "internalDepartment" : "externalCompany", groupId: candidate.group.id, contactId: candidate.contact.id,
    reason: candidate.explicit ? "The source explicitly names this configured recipient." : `Matches ${intent.replace(/_/g, " ")} and the group's configured default contact.`,
    recipientSnapshot: { department: candidate.group.type === "department" ? candidate.group.name : "", company: candidate.group.type === "company" ? candidate.group.name : candidate.contact.company || "", name: candidate.contact.fullName || candidate.contact.name, role: candidate.contact.role || "", email: candidate.contact.email, phone: candidate.contact.phone || "" }
  };
}

function buildRoutingDraft(item, routing, parentRecord) {
  const subject = String(item.description || item.text || parentRecord?.description || "SiteScribe record").trim();
  const source = String(item.sourceText || parentRecord?.sourceText || subject).trim();
  return { type: "communication", method: "email_draft", purpose: normalizeIntentValue(item.intent) || "other", state: "prepared", recipientIds: [routing.contactId], ccRecipientIds: [], unresolvedRecipientNames: [], unresolvedCcRecipientNames: [], to: routing.recipientSnapshot.email, cc: "", subject, body: `${source}\n\nPlease review and advise.`, source: "site_routing_v0.6.83" };
}

// v0.6.80 — Site-specific Communication Setup (Phase 2 only).
// The draft is deliberately separate from currentPackage until the user presses Save.
function communicationIntentCatalog(config) {
  const configured = normalizeIntentCatalog(config?.intents);
  return configured.length ? configured : structuredCloneSafe(DEFAULT_INTENT_CATALOG);
}

function communicationList(value) {
  return String(value || "").split(/[;,\n]/).map(item => item.trim()).filter(Boolean);
}

function communicationListText(value) {
  return (Array.isArray(value) ? value : []).join(", ");
}

function communicationSelectorId(value) {
  const text = String(value || "");
  return window.CSS && typeof window.CSS.escape === "function"
    ? window.CSS.escape(text)
    : text.replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`);
}

function communicationGroupCollection(kind) {
  if (!communicationSetupDraft) return [];
  return kind === "department" ? communicationSetupDraft.internalDepartments : communicationSetupDraft.externalCompanies;
}

function openCommunicationSetupPanel() {
  if (!currentPackage || typeof currentPackage !== "object") currentPackage = createEmptyPackage();
  communicationSetupDraft = normalizeCommunicationConfig(structuredCloneSafe(currentPackage.communicationConfig));
  communicationSetupDirty = false;
  contactPrefillSelections = new Map();
  renderCommunicationSetup();
  els.communicationSetupPanel?.classList.add("open");
  els.communicationSetupPanel?.classList.remove("hidden");
  els.communicationSetupPanel?.setAttribute("aria-hidden", "false");
}

function closeCommunicationSetupPanel() {
  if (communicationSetupDirty && !window.confirm("Discard unsaved Communication Setup changes?")) return;
  communicationSetupDraft = null;
  communicationSetupDirty = false;
  contactPrefillSelections = new Map();
  els.communicationSetupPanel?.classList.remove("open");
  els.communicationSetupPanel?.classList.add("hidden");
  els.communicationSetupPanel?.setAttribute("aria-hidden", "true");
}

async function openAllSiteContactsPanel() {
  if (!dbAvailable) {
    setStatus("All Site Contacts is unavailable because browser storage is not available.");
    showToast("Browser storage is unavailable.");
    return;
  }
  if (els.allSiteContactsButton) {
    els.allSiteContactsButton.disabled = true;
    els.allSiteContactsButton.textContent = "Loading Contacts…";
  }
  try {
    allSiteContacts = buildAllSiteContacts(await getAllPackagesFromDb());
    if (els.allSiteContactsSearch) els.allSiteContactsSearch.value = "";
    renderAllSiteContacts();
    els.allSiteContactsPanel?.classList.add("open");
    els.allSiteContactsPanel?.classList.remove("hidden");
    els.allSiteContactsPanel?.setAttribute("aria-hidden", "false");
    els.allSiteContactsSearch?.focus();
  } catch (error) {
    console.error(error);
    setStatus(`All Site Contacts could not be opened: ${error.message}`);
    showToast("Could not read saved-site contacts.");
  } finally {
    if (els.allSiteContactsButton) {
      els.allSiteContactsButton.disabled = false;
      els.allSiteContactsButton.textContent = "All Site Contacts";
    }
  }
}

function closeAllSiteContactsPanel() {
  els.allSiteContactsPanel?.classList.remove("open");
  els.allSiteContactsPanel?.classList.add("hidden");
  els.allSiteContactsPanel?.setAttribute("aria-hidden", "true");
}

function buildAllSiteContacts(savedSiteRecords) {
  const contactsByPerson = new Map();
  (savedSiteRecords || []).forEach(record => {
    const config = normalizeCommunicationConfig(record?.data?.communicationConfig);
    const site = String(record?.site || record?.data?.site || "Unnamed saved site").trim() || "Unnamed saved site";
    [...config.internalDepartments, ...config.externalCompanies].forEach(group => {
      const kind = group.type === "company" ? "Company / Subtrade" : "Department";
      const groupName = String(group.name || `Unnamed ${kind.toLowerCase()}`).trim();
      (group.contacts || []).forEach(contact => {
        const fullName = String(contact.fullName || contact.name || "").trim();
        const email = String(contact.email || "").trim();
        const phone = String(contact.phone || "").trim();
        const role = String(contact.role || "").trim();
        if (!fullName && !email && !phone) return;
        const key = email ? `email:${email.toLowerCase()}` : `name:${fullName.toLowerCase()}|phone:${phone}`;
        if (!contactsByPerson.has(key)) {
          contactsByPerson.set(key, {
            fullName: fullName || email || phone,
            email,
            phone,
            role,
            aliases: normalizeNameList(contact.aliases),
            active: contact.active !== false,
            locations: []
          });
        }
        const person = contactsByPerson.get(key);
        if (!person.email && email) person.email = email;
        if (!person.phone && phone) person.phone = phone;
        if (!person.role && role) person.role = role;
        person.aliases = normalizeNameList([...(person.aliases || []), ...(contact.aliases || [])]);
        const location = { site, kind, groupName, role };
        if (!person.locations.some(item => item.site === location.site && item.kind === location.kind && item.groupName === location.groupName && item.role === location.role)) person.locations.push(location);
      });
    });
  });
  return [...contactsByPerson.values()]
    .map(person => ({ ...person, locations: person.locations.sort((a, b) => `${a.site}|${a.groupName}`.localeCompare(`${b.site}|${b.groupName}`)) }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

async function refreshAllSiteContacts() {
  if (!dbAvailable) return [];
  allSiteContacts = buildAllSiteContacts(await getAllPackagesFromDb());
  return allSiteContacts;
}

function contactPrefillKey(contact) {
  const email = String(contact?.email || "").trim().toLowerCase();
  const fullName = String(contact?.fullName || contact?.name || "").trim().toLowerCase();
  const phone = String(contact?.phone || "").trim();
  return email ? `email:${email}` : `name:${fullName}|phone:${phone}`;
}

function buildContactPrefillSources(savedSiteRecords) {
  const currentId = String(currentPackageRecord?.id || "").trim();
  return (savedSiteRecords || [])
    .filter(record => String(record?.id || "").trim() !== currentId)
    .map(record => {
      const contactsByPerson = new Map();
      const config = normalizeCommunicationConfig(record?.data?.communicationConfig);
      [...config.internalDepartments, ...config.externalCompanies].forEach(group => {
        (group.contacts || []).forEach(contact => {
          const normalized = normalizeCommunicationContacts([contact])[0];
          if (![normalized.fullName, normalized.email, normalized.phone].some(Boolean)) return;
          const key = contactPrefillKey(normalized);
          const existing = contactsByPerson.get(key);
          if (!existing) {
            contactsByPerson.set(key, normalized);
            return;
          }
          ["fullName", "name", "email", "phone", "role"].forEach(field => {
            if (!existing[field] && normalized[field]) existing[field] = normalized[field];
          });
          existing.aliases = normalizeNameList([...(existing.aliases || []), ...(normalized.aliases || [])]);
          existing.active = existing.active !== false || normalized.active !== false;
        });
      });
      const site = String(record?.site || record?.data?.site || "Unnamed saved site").trim() || "Unnamed saved site";
      const shiftDate = String(record?.shiftDate || record?.data?.shiftDate || "").trim();
      return {
        id: String(record?.id || "").trim(),
        site,
        label: shiftDate ? `${site} — ${shiftDate}` : site,
        contacts: [...contactsByPerson.values()].sort((a, b) => String(a.fullName || a.name).localeCompare(String(b.fullName || b.name)))
      };
    })
    .filter(source => source.id && source.contacts.length)
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function refreshContactPrefillSources() {
  contactPrefillSources = dbAvailable ? buildContactPrefillSources(await getAllPackagesFromDb()) : [];
  return contactPrefillSources;
}

function renderAllSiteContacts() {
  if (!els.allSiteContactsList) return;
  const query = String(els.allSiteContactsSearch?.value || "").trim().toLowerCase();
  const visible = allSiteContacts.filter(person => {
    if (!query) return true;
    return [person.fullName, person.email, person.phone, person.role, ...person.locations.flatMap(location => [location.site, location.kind, location.groupName, location.role])]
      .join(" ").toLowerCase().includes(query);
  });
  const locationCount = visible.reduce((total, person) => total + person.locations.length, 0);
  if (els.allSiteContactsSummary) els.allSiteContactsSummary.textContent = `${visible.length} contact${visible.length === 1 ? "" : "s"} shown · ${locationCount} saved site / department entr${locationCount === 1 ? "y" : "ies"}.`;
  if (!visible.length) {
    els.allSiteContactsList.innerHTML = `<div class="all-site-contacts-empty">${allSiteContacts.length ? "No saved contacts match that search." : "No contacts have been saved in any site on this device yet."}</div>`;
    return;
  }
  els.allSiteContactsList.innerHTML = visible.map(person => {
    const meta = [person.email, person.phone, person.role].filter(Boolean).map(escapeHtml).join(" · ");
    const locations = person.locations.map(location => `<div class="all-site-contact-location"><strong>${escapeHtml(location.site)}</strong> — ${escapeHtml(location.kind)}: ${escapeHtml(location.groupName)}${location.role ? ` · ${escapeHtml(location.role)}` : ""}</div>`).join("");
    return `<article class="all-site-contact-card"><div class="all-site-contact-name">${escapeHtml(person.fullName)}</div>${meta ? `<div class="all-site-contact-meta">${meta}</div>` : ""}<div class="all-site-contact-locations">${locations}</div></article>`;
  }).join("");
}

function renderCommunicationSetup() {
  if (!communicationSetupDraft) return;
  const config = normalizeCommunicationConfig(communicationSetupDraft);
  communicationSetupDraft = config;
  const site = firstStatedSiteName(currentPackage?.site, currentPackageRecord?.site) || "Unsaved site";
  if (els.communicationSetupSite) els.communicationSetupSite.textContent = `${site} — contacts and routing saved with this site`;
  const warnings = validateCommunicationConfig(config);
  if (els.communicationSetupWarnings) {
    els.communicationSetupWarnings.innerHTML = warnings.length
      ? `<strong>Review before routing:</strong><ul>${warnings.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<strong>Configuration checks passed.</strong> Recipient groups can be used by a later routing phase once intent controls are added.`;
  }
  if (els.communicationSetupFields) {
    els.communicationSetupFields.innerHTML = [
      renderCommunicationGroupSection("department", "Internal Departments", "Department / internal team"),
      renderCommunicationGroupSection("company", "External Companies / Subtrades", "Company / subtrade")
    ].join("");
    els.communicationSetupFields.querySelectorAll(".communication-group-card").forEach(card => enableCommunicationGroupDrag(card));
  }
}

function renderCommunicationGroupSection(kind, title, emptyLabel) {
  const groups = communicationGroupCollection(kind);
  if (!groups.length) return `<section class="communication-group-section"><h3>${escapeHtml(title)}</h3><p class="muted small-hint">No ${escapeHtml(emptyLabel.toLowerCase())} entries yet.</p></section>`;
  return `<section class="communication-group-section"><h3>${escapeHtml(title)}</h3>${groups.map(group => renderCommunicationGroup(group, kind)).join("")}</section>`;
}

function renderCommunicationGroup(group, kind) {
  const intents = communicationIntentCatalog(communicationSetupDraft);
  const defaultOptions = [`<option value="">No default contact</option>`].concat((group.contacts || []).map(contact =>
    `<option value="${escapeHtml(contact.id)}" ${contact.id === group.defaultContactId ? "selected" : ""}>${escapeHtml(contact.fullName || contact.name || "Unnamed contact")}${contact.active === false ? " (inactive)" : ""}</option>`
  )).join("");
  const intentOptions = intents.map(intent => `<label class="communication-check"><input type="checkbox" data-communication-field="group-intent" data-group-kind="${kind}" data-group-id="${escapeHtml(group.id)}" value="${escapeHtml(intent.id)}" ${(group.allowedIntents || []).includes(intent.id) ? "checked" : ""} /> ${escapeHtml(intent.label || intent.id)}</label>`).join("");
  return `<details class="communication-group-card" data-group-kind="${kind}" data-group-id="${escapeHtml(group.id)}" open>
    <summary><span class="communication-group-drag-grip" title="Drag to reorder this ${kind}" aria-label="Drag to reorder this ${kind}">⠿</span><span class="communication-group-title">${escapeHtml(group.name || `Unnamed ${kind === "department" ? "department" : "company"}`)}</span><small>${(group.contacts || []).length} contact${(group.contacts || []).length === 1 ? "" : "s"}</small><span class="communication-group-chevron" aria-hidden="true">▼</span></summary>
    <div class="communication-group-fields" data-group-kind="${kind}" data-group-id="${escapeHtml(group.id)}">
      <div class="communication-grid">
        <label> ${kind === "department" ? "Department" : "Company / Subtrade"}<input data-communication-field="group-name" value="${escapeHtml(group.name)}" /></label>
        <label>Default contact<select data-communication-field="group-default-contact">${defaultOptions}</select></label>
        <label class="communication-wide">Aliases <input data-communication-field="group-aliases" value="${escapeHtml(communicationListText(group.aliases))}" placeholder="Safety, Safety Manager" /></label>
        <label class="communication-wide">Keywords <input data-communication-field="group-keywords" value="${escapeHtml(communicationListText(group.keywords))}" placeholder="hazard, lift plan, schedule" /></label>
      </div>
      <fieldset class="communication-intents"><legend>Allowed routing intents</legend>${intentOptions}</fieldset>
      <label class="communication-active"><input type="checkbox" data-communication-field="group-active" ${group.active !== false ? "checked" : ""} /> Active group</label>
      <div class="communication-contact-heading"><h4>Contacts</h4><button type="button" class="secondary small" data-communication-action="add-contact" data-group-kind="${kind}" data-group-id="${escapeHtml(group.id)}">Add Contact</button><button type="button" class="danger small" data-communication-action="remove-group" data-group-kind="${kind}" data-group-id="${escapeHtml(group.id)}">Remove Group</button></div>
      <div class="communication-contacts">${(group.contacts || []).map(contact => renderCommunicationContact(contact, kind, group.id)).join("") || `<p class="muted small-hint">Add at least one contact before using this group for routing.</p>`}</div>
    </div>
  </details>`;
}

function enableCommunicationGroupDrag(card) {
  const grip = card.querySelector(".communication-group-drag-grip");
  if (!grip || grip.dataset.dragBound === "1") return;
  grip.dataset.dragBound = "1";
  let state = null;
  const acquireGestureLock = () => {
    const preventPageGesture = event => event.preventDefault();
    document.documentElement.classList.add("communication-group-reorder-active");
    document.addEventListener("touchmove", preventPageGesture, { capture: true, passive: false });
    document.addEventListener("gesturestart", preventPageGesture, { capture: true, passive: false });
    return () => {
      document.removeEventListener("touchmove", preventPageGesture, { capture: true });
      document.removeEventListener("gesturestart", preventPageGesture, { capture: true });
      document.documentElement.classList.remove("communication-group-reorder-active");
    };
  };
  const cleanup = () => {
    if (!state) return;
    state.releaseGestureLock?.();
    state.ghost?.remove();
    state.line?.remove();
    card.classList.remove("drag-source");
    try { grip.releasePointerCapture(state.pointerId); } catch (error) {}
    state = null;
  };
  const persistOrder = kind => {
    // renderCommunicationSetup rebuilds every <details> card. Capture the
    // state of the whole group list before that redraw, otherwise all cards
    // other than the dragged one are recreated with their HTML `open` default.
    const section = card.closest(".communication-group-section");
    const openStates = new Map([...section.querySelectorAll(`.communication-group-card[data-group-kind="${kind}"]`)]
      .map(item => [item.dataset.groupId, item.open]));
    communicationSetupDraft = readCommunicationSetupInputs();
    const groupList = communicationGroupCollection(kind);
    const order = [...section.querySelectorAll(`.communication-group-card[data-group-kind="${kind}"]`)].map(item => item.dataset.groupId);
    groupList.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    communicationSetupDirty = true;
    renderCommunicationSetup();
    (els.communicationSetupFields?.querySelectorAll(`.communication-group-card[data-group-kind="${kind}"]`) || []).forEach(item => {
      if (openStates.has(item.dataset.groupId)) item.open = openStates.get(item.dataset.groupId);
    });
  };
  // The grip lives inside <summary>. A completed pointer gesture would otherwise
  // also activate the summary's native toggle, expanding a collapsed card.
  grip.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
  });
  grip.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    state = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false, ghost: null, line: null, releaseGestureLock: acquireGestureLock() };
    grip.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  });
  grip.addEventListener("pointermove", event => {
    if (!state || event.pointerId !== state.pointerId) return;
    if (!state.dragging && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < 8) return;
    const kind = card.dataset.groupKind;
    const section = card.closest(".communication-group-section");
    if (!state.dragging) {
      state.dragging = true;
      card.classList.add("drag-source");
      state.ghost = document.createElement("div");
      state.ghost.className = "communication-group-drag-ghost";
      state.ghost.textContent = card.querySelector(".communication-group-title")?.textContent || "Contacts group";
      state.line = document.createElement("div");
      state.line.className = "communication-group-drop-line";
      document.body.appendChild(state.ghost);
    }
    state.ghost.style.left = `${Math.max(8, Math.min(event.clientX + 12, window.innerWidth - state.ghost.offsetWidth - 8))}px`;
    state.ghost.style.top = `${Math.max(8, Math.min(event.clientY + 12, window.innerHeight - state.ghost.offsetHeight - 8))}px`;
    const cards = [...section.querySelectorAll(`.communication-group-card[data-group-kind="${kind}"]`)].filter(candidate => candidate !== card);
    const before = cards.find(candidate => event.clientY < candidate.getBoundingClientRect().top + candidate.getBoundingClientRect().height / 2);
    if (before) section.insertBefore(state.line, before); else section.appendChild(state.line);
    event.preventDefault();
  });
  const finish = event => {
    if (!state || event.pointerId !== state.pointerId) return;
    const kind = card.dataset.groupKind;
    const moved = state.dragging && state.line?.parentNode;
    if (moved) state.line.parentNode.insertBefore(card, state.line);
    cleanup();
    if (moved) persistOrder(kind);
    event.preventDefault();
    event.stopPropagation();
  };
  grip.addEventListener("pointerup", finish);
  grip.addEventListener("pointercancel", cleanup);
  grip.addEventListener("lostpointercapture", cleanup);
}

function renderCommunicationContact(contact, kind, groupId) {
  const isBlank = ![contact.fullName, contact.name, contact.email, contact.phone, contact.role, ...(contact.aliases || [])].some(value => String(value || "").trim());
  const selection = contactPrefillSelections.get(contact.id) || {};
  const selectedSource = contactPrefillSources.find(source => source.id === selection.sourceId) || null;
  const sourceOptions = contactPrefillSources.map(source => `<option value="${escapeHtml(source.id)}" ${source.id === selection.sourceId ? "selected" : ""}>${escapeHtml(source.label)}</option>`).join("");
  const contactOptions = (selectedSource?.contacts || []).map((person, index) => {
    const detail = [person.email, person.phone, person.role].filter(Boolean).join(" · ");
    return `<option value="${index}" ${String(index) === String(selection.contactIndex) ? "selected" : ""}>${escapeHtml(person.fullName || person.name)}${detail ? ` — ${escapeHtml(detail)}` : ""}</option>`;
  }).join("");
  const prefill = isBlank ? `<div class="communication-wide contact-prefill"><span class="contact-prefill-title">Copy contact details from another saved site</span><label>Source site<select data-communication-action="prefill-source-site" data-group-kind="${kind}" data-group-id="${escapeHtml(groupId)}" data-contact-id="${escapeHtml(contact.id)}"><option value="">Choose a source site (optional)</option>${sourceOptions || `<option value="" disabled>No other saved sites with contacts available</option>`}</select></label><label>Contact from selected site<select data-communication-action="prefill-contact" data-group-kind="${kind}" data-group-id="${escapeHtml(groupId)}" data-contact-id="${escapeHtml(contact.id)}" ${selectedSource ? "" : "disabled"}><option value="">${selectedSource ? "Choose a contact to copy" : "Choose a source site first"}</option>${contactOptions}</select></label><small>The details are copied into this site only. Later edits do not affect the source site.</small></div>` : "";
  return `<article class="communication-contact-card" data-contact-id="${escapeHtml(contact.id)}">
    <div class="communication-grid">
      ${prefill}
      <label>Full name<input data-communication-field="contact-name" value="${escapeHtml(contact.fullName || contact.name)}" /></label>
      <label>Role<input data-communication-field="contact-role" value="${escapeHtml(contact.role)}" /></label>
      <label>Email<input type="email" data-communication-field="contact-email" value="${escapeHtml(contact.email)}" inputmode="email" /></label>
      <label>Phone<input type="tel" data-communication-field="contact-phone" value="${escapeHtml(contact.phone)}" /></label>
      <label class="communication-wide">Aliases<input data-communication-field="contact-aliases" value="${escapeHtml(communicationListText(contact.aliases))}" placeholder="Name or role aliases" /></label>
    </div>
    <div class="communication-contact-actions"><label class="communication-active"><input type="checkbox" data-communication-field="contact-active" ${contact.active !== false ? "checked" : ""} /> Active contact</label><button type="button" class="danger small" data-communication-action="remove-contact" data-group-kind="${kind}" data-group-id="${escapeHtml(groupId)}" data-contact-id="${escapeHtml(contact.id)}">Remove</button></div>
  </article>`;
}

function readCommunicationSetupInputs() {
  if (!communicationSetupDraft || !els.communicationSetupFields) return normalizeCommunicationConfig(communicationSetupDraft);
  const config = structuredCloneSafe(communicationSetupDraft);
  ["department", "company"].forEach(kind => {
    const groups = kind === "department" ? config.internalDepartments : config.externalCompanies;
    groups.forEach(group => {
      const root = els.communicationSetupFields.querySelector(`[data-group-kind="${kind}"][data-group-id="${communicationSelectorId(group.id)}"]`);
      if (!root) return;
      const get = field => root.querySelector(`[data-communication-field="${field}"]`);
      group.name = String(get("group-name")?.value || "").trim();
      group.aliases = communicationList(get("group-aliases")?.value);
      group.keywords = communicationList(get("group-keywords")?.value);
      group.defaultContactId = String(get("group-default-contact")?.value || "").trim();
      group.active = Boolean(get("group-active")?.checked);
      group.allowedIntents = [...root.querySelectorAll('[data-communication-field="group-intent"]:checked')].map(input => input.value);
      (group.contacts || []).forEach(contact => {
        const contactRoot = root.querySelector(`[data-contact-id="${communicationSelectorId(contact.id)}"]`);
        if (!contactRoot) return;
        const getContact = field => contactRoot.querySelector(`[data-communication-field="${field}"]`);
        contact.fullName = String(getContact("contact-name")?.value || "").trim();
        contact.name = contact.fullName;
        contact.role = String(getContact("contact-role")?.value || "").trim();
        contact.email = String(getContact("contact-email")?.value || "").trim();
        contact.phone = String(getContact("contact-phone")?.value || "").trim();
        contact.aliases = communicationList(getContact("contact-aliases")?.value);
        contact.active = Boolean(getContact("contact-active")?.checked);
        if (kind === "company") contact.company = group.name;
      });
    });
  });
  config.intents = communicationIntentCatalog(config);
  return normalizeCommunicationConfig(config);
}

async function handleCommunicationSetupClick(event) {
  // The contact-prefill <select> also has data-communication-action so the
  // delegated change handler can recognize it. Restrict clicks to buttons:
  // otherwise opening the native select redraws the editor immediately and
  // closes its option list before a person can be selected.
  const button = event.target.closest("button[data-communication-action]");
  if (!button) return;
  communicationSetupDraft = readCommunicationSetupInputs();
  const kind = button.dataset.groupKind;
  const groups = communicationGroupCollection(kind);
  const group = groups.find(item => item.id === button.dataset.groupId);
  if (!group) return;
  if (button.dataset.communicationAction === "add-contact") {
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Loading Contacts…";
    try {
      await refreshContactPrefillSources();
    } catch (error) {
      console.error(error);
      allSiteContacts = [];
      setStatus("Saved-site contact sources could not be loaded. You can still enter this contact manually.");
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
    group.contacts.push(normalizeCommunicationContacts([{ id: createId("contact"), name: "", fullName: "", email: "", phone: "", role: "", aliases: [], active: true }])[0]);
  }
  if (button.dataset.communicationAction === "remove-contact") {
    group.contacts = group.contacts.filter(contact => contact.id !== button.dataset.contactId);
    if (group.defaultContactId === button.dataset.contactId) group.defaultContactId = "";
  }
  if (button.dataset.communicationAction === "remove-group") {
    if (!window.confirm(`Remove ${group.name || "this group"} and its contacts from this site?`)) return;
    const index = groups.findIndex(item => item.id === group.id);
    groups.splice(index, 1);
  }
  communicationSetupDirty = true;
  renderCommunicationSetup();
}

function handleCommunicationSetupChange(event) {
  const select = event.target.closest('select[data-communication-action]');
  if (!select) return;
  communicationSetupDraft = readCommunicationSetupInputs();
  const kind = select.dataset.groupKind;
  const groups = communicationGroupCollection(kind);
  const group = groups.find(item => item.id === select.dataset.groupId);
  const contact = group?.contacts?.find(item => item.id === select.dataset.contactId);
  if (!contact) return;
  const selection = contactPrefillSelections.get(contact.id) || {};
  if (select.dataset.communicationAction === "prefill-source-site") {
    contactPrefillSelections.set(contact.id, { sourceId: String(select.value || ""), contactIndex: "" });
    communicationSetupDirty = true;
    renderCommunicationSetup();
    return;
  }
  if (select.dataset.communicationAction !== "prefill-contact" || !select.value) return;
  const sourceSite = contactPrefillSources.find(source => source.id === selection.sourceId);
  const source = sourceSite?.contacts?.[Number(select.value)];
  if (!source) return;
  contact.fullName = String(source.fullName || "").trim();
  contact.name = contact.fullName;
  contact.email = String(source.email || "").trim();
  contact.phone = String(source.phone || "").trim();
  contact.role = String(source.role || "").trim();
  contact.aliases = normalizeNameList(source.aliases);
  contact.active = source.active !== false;
  contactPrefillSelections.delete(contact.id);
  communicationSetupDirty = true;
  renderCommunicationSetup();
  setStatus(`${contact.fullName || "Contact"} copied from ${sourceSite.label}. Review and save this site's Contacts / Departments when ready.`);
}

function addCommunicationGroup(kind) {
  communicationSetupDraft = readCommunicationSetupInputs();
  const groups = communicationGroupCollection(kind);
  groups.push(normalizeRecipientGroups([{ id: createId(kind === "department" ? "dept" : "company"), name: "", type: kind, aliases: [], keywords: [], allowedIntents: [], defaultContactId: "", active: true, contacts: [] }], kind)[0]);
  communicationSetupDirty = true;
  renderCommunicationSetup();
}

function validateCommunicationConfig(config) {
  const warnings = [];
  const aliases = new Map();
  [...(config.internalDepartments || []), ...(config.externalCompanies || [])].forEach(group => {
    const label = group.name || "Unnamed recipient group";
    if (!group.name) warnings.push(`${label}: group name is required.`);
    if (group.active !== false && group.allowedIntents?.length && !group.contacts?.length) warnings.push(`${label}: an active routable group has no contacts.`);
    if (group.active !== false && group.contacts?.length && !group.defaultContactId) warnings.push(`${label}: choose a default contact before using automatic routing.`);
    const defaultContact = (group.contacts || []).find(contact => contact.id === group.defaultContactId);
    if (group.defaultContactId && !defaultContact) warnings.push(`${label}: default contact no longer exists.`);
    if (defaultContact && (defaultContact.active === false || !defaultContact.email)) warnings.push(`${label}: default contact is inactive or has no email.`);
    [group.name, ...(group.aliases || [])].filter(Boolean).forEach(alias => {
      const key = alias.toLowerCase();
      if (aliases.has(key) && aliases.get(key) !== group.id) warnings.push(`Duplicate group alias: “${alias}” is used more than once.`);
      else aliases.set(key, group.id);
    });
    (group.contacts || []).forEach(contact => {
      if (!contact.fullName && !contact.name) warnings.push(`${label}: a contact is missing a name.`);
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) warnings.push(`${label}: ${contact.fullName || contact.name || "contact"} has an invalid email address.`);
    });
  });
  return [...new Set(warnings)];
}

async function saveCommunicationSetup() {
  if (!communicationSetupDraft || communicationSetupSaveInProgress) return;
  communicationSetupSaveInProgress = true;
  const saveButton = els.saveCommunicationSetupButton;
  const originalLabel = saveButton?.textContent || "Save Contacts / Departments";
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving Contacts / Departments…";
  }
  const config = readCommunicationSetupInputs();
  config.schemaVersion = "1.0";
  config.updatedAt = new Date().toISOString();
  currentPackage.communicationConfig = normalizeCommunicationConfig(config);
  renderManualIntentOptions();
  communicationSetupDraft = structuredCloneSafe(currentPackage.communicationConfig);
  communicationSetupDirty = false;
  // This button is an explicit persistence action. Do not leave contacts in the
  // normal 750 ms background-save queue: a site switch, iOS backgrounding, or
  // browser close immediately after tapping Save must not lose them.
  markDirty({ reason: "communication setup saved", skipAutoSave: true });
  renderCommunicationSetup();
  setStatus("Saving Contacts / Departments to this site's working copy…");
  try {
    await waitForAutoSaveIdle();
    const saved = await forceAutoSaveNow("contacts / departments explicitly saved");
    if (!saved) throw new Error("browser storage is unavailable");
    setStatus("Contacts / Departments saved to this site and this device.");
    showToast("Contacts / Departments saved.");
  } catch (error) {
    console.error(error);
    communicationSetupDirty = true;
    setStatus("Contacts / Departments could not be saved to this device. Keep this screen open and use Dropbox or Email Current Memory as a backup.");
    showToast("Contacts were not saved. Please try again.");
  } finally {
    communicationSetupSaveInProgress = false;
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = originalLabel;
    }
  }
}

function normalizeEmailActivityLog(value) {
  return (Array.isArray(value) ? value : []).map(entry => normalizeEmailActivityEntry(entry));
}

function normalizeEmailActivityEntry(entry) {
  const source = entry && typeof entry === "object" ? structuredCloneSafe(entry) : {};
  const action = String(source.action || "draftCreated").trim();
  const status = String(source.status || "not_sent").trim();
  return {
    ...source,
    id: String(source.id || createId("email_log")).trim(),
    timestamp: String(source.timestamp || source.createdAt || new Date().toISOString()).trim(),
    recordId: String(source.recordId || "").trim(),
    parentRecordId: String(source.parentRecordId || "").trim(),
    intent: normalizeIntentValue(source.intent),
    sourceExcerpt: String(source.sourceExcerpt || "").trim(),
    parentRecordSummary: String(source.parentRecordSummary || "").trim(),
    secondaryRecordSummary: String(source.secondaryRecordSummary || "").trim(),
    messagePreview: String(source.messagePreview || source.bodyPreview || "").trim(),
    recipientRef: source.recipientRef && typeof source.recipientRef === "object" ? structuredCloneSafe(source.recipientRef) : {},
    recipientSnapshot: source.recipientSnapshot && typeof source.recipientSnapshot === "object" ? structuredCloneSafe(source.recipientSnapshot) : {},
    subject: String(source.subject || "").trim(),
    action,
    status,
    followUpRequired: Boolean(source.followUpRequired),
    followUpDate: normalizeDateOnly(source.followUpDate || ""),
    note: String(source.note || "").trim()
  };
}

function addEmailActivityEntry({ recordId, parentRecordId, item, parentRecord, routing, action, status = "not_sent" }) {
  if (!currentPackage) return;
  currentPackage.emailActivityLog = normalizeEmailActivityLog(currentPackage.emailActivityLog);
  currentPackage.emailActivityLog.push(normalizeEmailActivityEntry({
    id: createId("email_log"), timestamp: new Date().toISOString(), recordId, parentRecordId,
    intent: item?.intent, sourceExcerpt: item?.sourceText || "", parentRecordSummary: parentRecord?.description || "", secondaryRecordSummary: isEmailDraftSecondary(item) ? "" : (item?.text || ""), messagePreview: action?.body || "", recipientRef: { recipientType: routing.recipientType, groupId: routing.groupId, contactId: routing.contactId },
    recipientSnapshot: structuredCloneSafe(routing.recipientSnapshot || {}), subject: action?.subject || "", action: action?.state === "prepared" ? "draftCreated" : "draftOpened", status
  }));
}

function routingForExistingAction(action) {
  const contactId = normalizeIdList(action?.recipientIds)[0];
  for (const group of allCommunicationGroups()) {
    const contact = contactForRouting(group, contactId);
    if (contact) return { recipientType: group.type === "department" ? "internalDepartment" : "externalCompany", groupId: group.id, contactId, recipientSnapshot: { department: group.type === "department" ? group.name : "", company: group.type === "company" ? group.name : contact.company || "", name: contact.fullName || contact.name, role: contact.role || "", email: contact.email || "", phone: contact.phone || "" } };
  }
  return { recipientType: "", groupId: "", contactId: contactId || "", recipientSnapshot: { email: action?.to || "" } };
}

function logExistingEmailAction(record, comment, action, eventAction, status = "not_sent") {
  addEmailActivityEntry({ recordId: comment?.id, parentRecordId: record?.id, item: comment, parentRecord: record, routing: routingForExistingAction(action), action, status });
  const entry = currentPackage.emailActivityLog[currentPackage.emailActivityLog.length - 1];
  if (entry) entry.action = eventAction;
}

function isEmailDraftSecondary(item) {
  return Boolean(item?.action?.type === "communication" && item?.action?.method === "email_draft");
}

function resolveEmailActivityRecordContext(entry) {
  const parent = (currentPackage?.records || []).find(record => record.id === entry.parentRecordId);
  const secondary = (parent?.comments || []).find(comment => comment.id === entry.recordId);
  return {
    parentRecordSummary: entry.parentRecordSummary || parent?.description || "Record no longer available",
    secondaryRecordSummary: entry.secondaryRecordSummary || (!isEmailDraftSecondary(secondary) ? secondary?.text || "" : ""),
    messagePreview: entry.messagePreview || secondary?.action?.body || "No draft text was retained for this older activity entry."
  };
}

function activityPreview(text, limit = 230) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1).trimEnd()}…` : normalized;
}

function renderCommunicationActivityEntry(entry) {
  const recipient = [entry.recipientSnapshot?.department || entry.recipientSnapshot?.company, entry.recipientSnapshot?.name, entry.recipientSnapshot?.email].filter(Boolean).join(" — ") || "recipient not stated";
  const context = resolveEmailActivityRecordContext(entry);
  const secondary = context.secondaryRecordSummary ? `<div class="activity-detail-row"><b>Secondary record:</b> ${escapeHtml(context.secondaryRecordSummary)}</div>` : "";
  return `<details class="communication-activity-entry"><summary><span class="communication-activity-summary"><strong>${escapeHtml(entry.subject || "Email draft")}</strong><span>${escapeHtml(formatDateTime(entry.timestamp))} · ${escapeHtml(emailActivityActionLabel(entry.action))} · ${escapeHtml(entry.status)}</span><span>To: ${escapeHtml(recipient)}</span></span><span class="communication-activity-chevron" aria-hidden="true">▼</span></summary><div class="communication-activity-detail"><div class="activity-detail-row"><b>Primary record:</b> ${escapeHtml(context.parentRecordSummary)}</div>${secondary}<div class="activity-detail-row"><b>Intent:</b> ${escapeHtml(entry.intent || "not stated")}</div><div class="activity-draft-preview"><b>Email text:</b><div>${escapeHtml(activityPreview(context.messagePreview, 900))}</div></div></div></details>`;
}

function openCommunicationActivityPanel() {
  if (!currentPackage) return;
  if (els.communicationActivitySite) els.communicationActivitySite.textContent = `${firstStatedSiteName(currentPackage.site, currentPackageRecord?.site) || "Current site"} — newest first`;
  const entries = normalizeEmailActivityLog(currentPackage.emailActivityLog).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (els.communicationActivityLog) els.communicationActivityLog.innerHTML = entries.length ? entries.map(renderCommunicationActivityEntry).join("") : `<p class="muted">No email activity has been recorded for this site yet.</p>`;
  els.communicationActivityPanel?.classList.add("open"); els.communicationActivityPanel?.classList.remove("hidden"); els.communicationActivityPanel?.setAttribute("aria-hidden", "false");
}

function closeCommunicationActivityPanel() { els.communicationActivityPanel?.classList.remove("open"); els.communicationActivityPanel?.classList.add("hidden"); els.communicationActivityPanel?.setAttribute("aria-hidden", "true"); }

async function clearEmailActivityLog() {
  if (!currentPackage) return;
  const entries = normalizeEmailActivityLog(currentPackage.emailActivityLog);
  if (!entries.length) return showToast("There is no email activity to clear for this site.");
  const countLabel = `${entries.length} email activity ${entries.length === 1 ? "entry" : "entries"}`;
  const confirmed = window.confirm(`Clear ${countLabel} from this site?\n\nThis clears the activity history only. It does not delete records, email-draft secondary items, contacts, or reports.\n\nUpdate the Dropbox site file separately if you also want the cleared log saved there.`);
  if (!confirmed) return;
  currentPackage.emailActivityLog = [];
  markDirty({ reason: "email activity log cleared", skipAutoSave: true });
  openCommunicationActivityPanel();
  setStatus("Clearing Email Activity from this site's working copy…");
  try {
    await waitForAutoSaveIdle();
    const saved = await forceAutoSaveNow("email activity log cleared");
    if (!saved) throw new Error("browser storage is unavailable");
    setStatus("Email Activity cleared for this site on this device.");
    showToast("Email Activity cleared. Records and drafts were not changed.");
  } catch (error) {
    console.error(error);
    setStatus("Email Activity was cleared in this session but could not be saved to this device.");
    showToast("Activity clear could not be saved. Keep this site open and try again.");
  }
}

function normalizeAction(action) {
  const normalized = {
    type: String(action.type || "").trim(),
    method: String(action.method || "").trim(),
    purpose: String(action.purpose || "").trim(),
    state: String(action.state || "accepted").trim(),
    recipientIds: normalizeIdList(action.recipientIds),
    ccRecipientIds: normalizeIdList(action.ccRecipientIds),
    unresolvedRecipientNames: normalizeNameList(action.unresolvedRecipientNames),
    unresolvedCcRecipientNames: normalizeNameList(action.unresolvedCcRecipientNames),
    to: String(action.to || "").trim(),
    cc: String(action.cc || "").trim(),
    subject: String(action.subject || "").trim(),
    body: String(action.body || "").trim()
  };
  ["source", "openedAt", "completedAt"].forEach(key => {
    if (action[key]) normalized[key] = String(action[key]);
  });
  return normalized;
}

function normalizeNameList(value) {
  return normalizeIdList(value);
}


function formatLegacyValue(value) {
  if (value == null) return "not stated";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(formatLegacyValue).join("; ");
  return Object.entries(value).map(([key, val]) => `${humanizeKey(key)}: ${formatLegacyValue(val)}`).join(" | ");
}

function humanizeKey(key) {
  return String(key).replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").replace(/^./, char => char.toUpperCase());
}

function legacyDedupeKey(category, sourceText) {
  return `${category}::${String(sourceText || "").toLowerCase().replace(/\s+/g, " ").trim()}`;
}

function normalizeLegacyStatus(status) {
  const closed = new Set(["closed", "done", "dismissed", "resolved", "sent", "verified", "cancelled", "canceled"]);
  return closed.has(String(status || "open").toLowerCase()) ? "closed" : "open";
}

function getOpenFlags(record) {
  return (record.flags || []).filter(flag => normalizeLegacyStatus(flag.status) !== "closed");
}


function renderLinkedRecordRows(record, relation) {
  ensureRecordLinks(record);
  const ids = relation === "parent" ? record.parentIds : record.childIds;
  return ids
    .map(id => getRecordById(id))
    .filter(Boolean)
    .sort(compareRecordChronologyDesc)
    .map(linked => renderLinkedRecordLine(linked, relation))
    .join("");
}

function renderLinkedRecordLine(linked, relation) {
  const status = normalizeLegacyStatus(linked.status);
  return renderCompactRecordRow({
    classes: "linked-record-line",
    dataAttrs: `data-linked-record-id="${escapeHtml(linked.id)}"`,
    status,
    dotClass: "secondary-dot linked-dot",
    text: linked.description || "Untitled linked record",
    meta: `${relation} · ${formatShortRecordDateTime(linked)} · ${categoryIdLabel(linked.category)} · ${shortRecordId(linked.id)}`,
    rightClass: "detail-update-right linked-record-right",
    rightHtml: `<button type="button" class="secondary small" data-action="unlink-linked-record" data-linked-record-id="${escapeHtml(linked.id)}">Unlink</button>`
  });
}

function ensureRecordLinks(record) {
  if (!record) return;
  record.parentIds = normalizeIdList(record.parentIds || []);
  record.childIds = normalizeIdList(record.childIds || []);
}

function getRecordById(id) {
  return (currentPackage.records || []).find(record => record.id === id) || null;
}

function shortRecordId(id) {
  const text = String(id || "");
  return text.length > 16 ? `${text.slice(0, 8)}...${text.slice(-5)}` : text;
}

function shortRecordOptionLabel(record) {
  return `${shortRecordId(record.id)} · ${categoryIdLabel(record.category)} · ${formatShortRecordDateTime(record)} · ${record.description || "Untitled record"}`;
}

function renderRecordFlags(record) {
  const locked = isRecordLocked(record);
  const flags = record.flags || [];
  if (!flags.length) return "";
  const sorted = [
    ...flags.filter(flag => normalizeLegacyStatus(flag.status) !== "closed").sort(compareRecordChronologyDesc),
    ...flags.filter(flag => normalizeLegacyStatus(flag.status) === "closed").sort(compareRecordChronologyDesc)
  ];
  const rows = sorted.map(flag => renderFlagLine(flag, locked)).join("");
  return `<div class="record-flags-block"><h4>Record Flags</h4><div class="flags-list">${rows}</div></div>`;
}

function renderFlagLine(flag, locked = false) {
  const status = normalizeLegacyStatus(flag.status);
  const isOpen = selectedFlagId === flag.id;
  const type = flag.type === "clarify" ? "clarify" : "incomplete";
  const title = flag.text || "Record flag";
  const source = flag.sourceText || "not stated";
  const label = flag.type === "clarify" ? "Clarification Answer / Resolution" : "Resolution / Notes";
  const resolvedMeta = flag.resolvedAt ? `<div class="record-meta">Resolved ${escapeHtml(formatDateTime(flag.resolvedAt))}</div>` : "";
  const expanded = isOpen ? `<div class="flag-expanded">
      <div class="flag-expanded-description" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
      <div class="record-meta"><strong>Source:</strong> ${escapeHtml(source)}</div>
      ${resolvedMeta}
      <label class="field-label" for="flagResolution_${escapeHtml(flag.id)}">${escapeHtml(label)}</label>
      <textarea id="flagResolution_${escapeHtml(flag.id)}" class="flag-resolution" rows="3" placeholder="Enter how this flag was clarified or resolved.">${escapeHtml(flag.resolution || "")}</textarea>
      ${(locked || status === "closed") ? `<p class="muted compact-note">${locked ? "Reopen the main record" : "Reopen this flag"} to edit or resolve this flag.</p>` : `<div class="button-row flag-action-row">
        <button type="button" class="secondary small" data-action="save-flag-resolution" data-flag-id="${escapeHtml(flag.id)}">Save Resolution</button>
        <button type="button" class="small" data-action="resolve-flag" data-flag-id="${escapeHtml(flag.id)}">Resolve Flag</button>
      </div>`}
    </div>` : "";
  const flagRow = renderCompactRecordRow({
    classes: "flag-row-main",
    status,
    selected: isOpen,
    dotClass: "secondary-dot flag-dot",
    text: title,
    meta: `${formatShortDateTime(flag.createdAt || flag.updatedAt)} · ${type}`,
    rightClass: "detail-update-right flag-right",
    rightHtml: `${locked ? `<span class="pill status-pill secondary-status-pill ${status === "closed" ? "closed" : ""}">${escapeHtml(status.toUpperCase())}</span>` : (status === "closed" ? `<button type="button" class="small secondary" data-action="set-flag-status" data-flag-id="${escapeHtml(flag.id)}" data-status="open">REOPEN</button><span class="pill locked-pill">LOCKED</span>` : `<button type="button" class="small" data-action="set-flag-status" data-flag-id="${escapeHtml(flag.id)}" data-status="open">OPEN</button>
        <button type="button" class="small secondary" data-action="set-flag-status" data-flag-id="${escapeHtml(flag.id)}" data-status="closed">CLOSED</button>`)}`
  });
  return `<div class="flag-line compact-flag-line ${status === "closed" ? "closed" : ""} ${isOpen ? "selected" : ""}" data-flag-id="${escapeHtml(flag.id)}">
    ${flagRow}
    ${expanded}
  </div>`;
}

function findRelatedRecord(records, sourceText) {
  const tokens = importantTokens(sourceText);
  if (!tokens.length) return null;
  let best = null;
  let bestScore = 0;
  records.forEach(record => {
    const hay = `${record.description || ""} ${record.sourceText || ""}`.toLowerCase();
    const score = tokens.filter(token => hay.includes(token)).length;
    if (score > bestScore) { best = record; bestScore = score; }
  });
  return bestScore ? best : null;
}

function importantTokens(text) {
  return String(text || "").toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 3).slice(0, 12);
}

function getSelectedRecord() {
  return (currentPackage.records || []).find(record => record.id === selectedRecordId) || null;
}

function getSelectedComment() {
  const record = getSelectedRecord();
  return record ? (record.comments || []).find(comment => comment.id === selectedCommentId) || null : null;
}

function getSelectedActivity() {
  const comment = getSelectedComment();
  return comment ? (comment.activities || []).find(activity => activity.id === selectedActivityId) || null : null;
}

function closeDetail() {
  const committed = commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
  if (dirty) forceAutoSaveNow(committed ? "detail closed after update commit" : "detail closed with pending changes");
  els.detailPanel.classList.remove("open");
  els.detailPanel.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("detail-panel-open");
  selectedCommentId = null;
  selectedActivityId = null;
  newActivityParentId = null;
  selectedFlagId = null;
  if (committed) setStatus("Update changes saved automatically.");
}

function markDirty(options = {}) {
  dirty = true;
  if (options.contentChanged !== false) {
    ensurePackageFreshnessMetadata(currentPackage);
    currentPackage.reviewConsole.contentUpdatedAt = new Date().toISOString();
  }
  if (currentPackageRecord) currentPackageRecord.lastModified = new Date().toISOString();
  if (!options.skipAutoSave) scheduleAutoSave(options.reason || "change");
}

function waitForAutoSaveIdle() {
  if (!autoSaveInProgress) return Promise.resolve();
  return new Promise(resolve => {
    const check = () => {
      if (!autoSaveInProgress) resolve();
      else setTimeout(check, 25);
    };
    check();
  });
}

function packageShouldAutoSave() {
  const records = currentPackage && Array.isArray(currentPackage.records) ? currentPackage.records : [];
  return !!(records.length || siteIsStated(currentPackage?.site));
}

function scheduleAutoSave(reason = "change") {
  if (!dbAvailable || !packageShouldAutoSave()) return;
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => runAutoSave(reason), 750);
}

function forceAutoSaveNow(reason = "change") {
  if (!dbAvailable || !packageShouldAutoSave()) return Promise.resolve(false);
  clearTimeout(autoSaveTimer);
  autoSaveTimer = null;
  return runAutoSave(reason);
}

async function runAutoSave(reason = "change") {
  if (!dbAvailable || !packageShouldAutoSave()) return false;
  if (autoSaveInProgress) {
    autoSaveQueued = true;
    return false;
  }
  autoSaveInProgress = true;
  try {
    const saved = await saveCurrentPackageToLocalStorage({ silent: true, auto: true, reason });
    if (saved) setStatus(`Auto-saved on this device at ${formatAutoSaveTime()}.`);
    return saved;
  } finally {
    autoSaveInProgress = false;
    if (autoSaveQueued) {
      autoSaveQueued = false;
      scheduleAutoSave("queued change");
    }
  }
}

function formatAutoSaveTime() {
  try {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch (error) {
    return "now";
  }
}

function metaBox(label, value) {
  return `<div class="meta-box"><div class="meta-label">${escapeHtml(label)}</div><div class="meta-value">${escapeHtml(value || "not stated")}</div></div>`;
}

function compactMetaItem(label, value) {
  return `<span class="primary-meta-item"><span class="primary-meta-label">${escapeHtml(label)}</span><span class="primary-meta-value">${escapeHtml(value || "not stated")}</span></span>`;
}

function groupBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}

function dateFromIso(value) {
  if (!value) return "";
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}


function normalizeDeliverable(value) {
  const source = value && typeof value === "object" ? value : {};
  const legacyDate = source.date || source.dueDate || source.deliverableDate || "";
  const date = normalizeDateOnly(legacyDate);
  const apply = Boolean(source.apply || source.enabled || source.active || date);
  return {
    apply: Boolean(apply && date),
    date: apply && date ? date : ""
  };
}

function normalizeDateOnly(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function deliverableApplies(item) {
  const deliverable = normalizeDeliverable(item && item.deliverable);
  return Boolean(deliverable.apply && deliverable.date);
}

function deliverableStatusForDate(dateValue) {
  const date = normalizeDateOnly(dateValue);
  if (!date) return "none";
  const today = new Date(todayString() + "T00:00:00");
  const due = new Date(date + "T00:00:00");
  if (Number.isNaN(due.getTime())) return "none";
  const days = Math.floor((due - today) / 86400000);
  if (days < 0) return "red";
  if (days <= 7) return "yellow";
  return "green";
}

function deliverableInfoForItem(item, options = {}) {
  if (!item || !deliverableApplies(item)) return null;
  const deliverable = normalizeDeliverable(item.deliverable);
  const status = deliverableStatusForDate(deliverable.date);
  if (status === "none") return null;
  return {
    status,
    date: deliverable.date,
    closed: Boolean(options.closed || normalizeLegacyStatus(item.status) === "closed"),
    ownerId: item.id || ""
  };
}

function deliverablePriorityValue(status) {
  if (status === "red") return 0;
  if (status === "yellow") return 1;
  if (status === "green") return 2;
  return 3;
}

function bestDeliverableInfo(infos) {
  const usable = (infos || []).filter(Boolean);
  if (!usable.length) return null;
  return usable.sort((a, b) => {
    const priority = deliverablePriorityValue(a.status) - deliverablePriorityValue(b.status);
    if (priority) return priority;
    return String(a.date || "").localeCompare(String(b.date || ""));
  })[0];
}

function activeRecordDeliverableInfo(record) {
  if (!record || normalizeLegacyStatus(record.status) === "closed") return null;
  const infos = [deliverableInfoForItem(record)];
  (record.comments || []).forEach(comment => {
    if (normalizeLegacyStatus(comment.status) !== "closed") {
      infos.push(deliverableInfoForItem(comment));
      (comment.activities || []).forEach(activity => {
        if (normalizeLegacyStatus(activity.status) !== "closed") infos.push(deliverableInfoForItem(activity));
      });
    }
  });
  return bestDeliverableInfo(infos);
}

function primaryRowDeliverableInfo(record, collapsed) {
  if (!record) return null;
  const status = normalizeLegacyStatus(record.status);
  const own = deliverableInfoForItem(record, { closed: status === "closed" });
  if (own) return own;
  const comments = (record.comments || []).flatMap(comment => {
    const commentClosed = status === "closed" || normalizeLegacyStatus(comment.status) === "closed";
    return [
      deliverableInfoForItem(comment, { closed: commentClosed }),
      ...(comment.activities || []).map(activity => deliverableInfoForItem(activity, { closed: commentClosed || normalizeLegacyStatus(activity.status) === "closed" }))
    ];
  });
  const bestChild = bestDeliverableInfo(comments);
  if (!bestChild) return null;
  return collapsed || status === "closed" ? bestChild : null;
}

function renderDeliverableSquare(info, extraClass = "") {
  if (!info) return `<span class="deliverable-square-placeholder"></span>`;
  const label = `Deliverable ${info.status}: ${formatShortDate(info.date)}`;
  return `<span class="deliverable-square deliverable-${escapeHtml(info.status)}${info.closed ? " deliverable-closed" : ""}${extraClass ? " " + escapeHtml(extraClass) : ""}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"></span>`;
}

function renderDeliverableReportLine(item) {
  if (!deliverableApplies(item)) return "";
  const d = normalizeDeliverable(item.deliverable);
  const status = deliverableStatusForDate(d.date);
  return `<div class="report-meta report-deliverable-line">Deliverable: ${escapeHtml(formatShortDate(d.date))} · ${escapeHtml(status.toUpperCase())}</div>`;
}

function renderDeliverableEditor(item, prefix, locked = false, compact = false) {
  const deliverable = normalizeDeliverable(item && item.deliverable);
  const checked = deliverable.apply ? " checked" : "";
  const disabled = locked || !deliverable.apply ? " disabled" : "";
  const compactClass = compact ? " compact-deliverable-editor" : "";
  const hiddenDateClass = compact && !deliverable.apply ? " deliverable-date-hidden" : "";
  return `<div class="deliverable-editor${compactClass}" data-deliverable-editor="${escapeHtml(prefix)}">
    <label class="deliverable-apply-label"><input id="${escapeHtml(prefix)}DeliverableApply" type="checkbox"${checked}${locked ? " disabled" : ""}> ${compact ? "Deliverable date" : "Apply deliverable date"}</label>
    <label class="deliverable-date-label${hiddenDateClass}">${compact ? "Due" : "Date"} <input id="${escapeHtml(prefix)}DeliverableDate" type="date" value="${escapeHtml(deliverable.date)}"${disabled}></label>
  </div>`;
}

function updateDeliverableDateDisabled(prefix) {
  const applyInput = document.getElementById(`${prefix}DeliverableApply`);
  const dateInput = document.getElementById(`${prefix}DeliverableDate`);
  if (!applyInput || !dateInput) return;
  dateInput.disabled = !applyInput.checked || applyInput.disabled;
  dateInput.classList.toggle("deliverable-date-disabled", !applyInput.checked || applyInput.disabled);
  const dateLabel = dateInput.closest(".deliverable-date-label");
  if (dateLabel && dateInput.closest(".compact-deliverable-editor")) {
    dateLabel.classList.toggle("deliverable-date-hidden", !applyInput.checked);
  }
}

function readDeliverableEditor(prefix) {
  const applyInput = document.getElementById(`${prefix}DeliverableApply`);
  const dateInput = document.getElementById(`${prefix}DeliverableDate`);
  const apply = Boolean(applyInput && applyInput.checked);
  const date = normalizeDateOnly(dateInput ? dateInput.value : "");
  // v0.8.9: a half-entered deliverable date reads as empty and would clear the whole deliverable.
  // Report it so the caller can leave the stored deliverable alone until the date is complete.
  return { apply: Boolean(apply && date), date: apply && date ? date : "", partial: inputEntryIsPartial(dateInput) };
}

function deliverableEquals(a, b) {
  const left = normalizeDeliverable(a);
  const right = normalizeDeliverable(b);
  return left.apply === right.apply && left.date === right.date;
}

function formatDateTime(value) {
  if (!value) return "not stated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatDate(value) {
  return formatShortDate(value) || String(value || "not stated");
}


function formatShortRecordDateOnlyMobile(record) {
  return formatShortDateCompact(recordCreationDate(record) || "") || "n/s";
}

function formatShortDateCompact(value) {
  const text = formatShortDate(value);
  return String(text || "").replace(/\s+/g, "");
}

function formatShortRecordDateTime(record) {
  const dateSource = recordCreationDate(record) || "";
  const timeSource = record?.createdAt || record?.sourceTime || record?.time || record?.startTime || record?.eventTime || "";
  const datePart = formatShortDate(dateSource);
  const timePart = formatShortTime(timeSource);
  return [datePart, timePart].filter(Boolean).join(" · ") || "not stated";
}

function formatShortDateTime(value) {
  const datePart = formatShortDate(value);
  const timePart = formatShortTime(value);
  return [datePart, timePart].filter(Boolean).join(" · ") || "not stated";
}

function formatShortDate(value) {
  if (!value) return "";
  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let date;
  if (match) date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  else date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const currentYear = new Date().getFullYear();
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(date.getFullYear() !== currentYear ? { year: "numeric" } : {}) });
}

function formatShortTime(value) {
  if (!value) return "";
  const text = String(value);
  const timeOnly = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  let date;
  if (timeOnly) {
    const hours = Number(timeOnly[1]);
    const minutes = Number(timeOnly[2] || "0");
    date = new Date();
    let normalizedHours = hours;
    const marker = (timeOnly[3] || "").toLowerCase();
    if (marker === "pm" && normalizedHours < 12) normalizedHours += 12;
    if (marker === "am" && normalizedHours === 12) normalizedHours = 0;
    date.setHours(normalizedHours, minutes, 0, 0);
  } else {
    date = new Date(text);
  }
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function normalizeCue(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function categoryIdLabel(category) {
  return String(category || "event").toLowerCase();
}

function categoryMobileLabel(category) {
  return categoryIdLabel(category).slice(0, 4);
}

function categoryLabel(category) {
  const labels = {
    event: "Event / Timeline Record",
    action: "Action / To-Do",
    followup: "Follow-Up / Waiting",
    scheduled: "Scheduled Event / Appointment",
    safety: "Safety Issue",
    communication: "Communication / Email",
    document: "Document / Required File"
  };
  return labels[category] || humanizeKey(category || "event");
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied.");
  } catch (_) {
    showToast("Copy unavailable in this browser.");
  }
}

function setStatus(message) {
  if (!els.statusLine) return;
  const text = String(message || "");
  if (/^Opened( saved)?( legacy)? site/i.test(text) || /^Opened .*Use Save (to Local Storage|in Browser)/i.test(text) || /^Opened .*Default template/i.test(text)) {
    els.statusLine.textContent = b01HardcodedStatusPrompt();
    return;
  }
  els.statusLine.textContent = text;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 1700);
}

function flashHint(message) {
  els.entryHint.textContent = message;
  setTimeout(() => {
    els.entryHint.textContent = "";
  }, 1800);
}

function summarizeStatus(data) {
  const records = data.records || [];
  const open = records.filter(record => normalizeLegacyStatus(record.status) !== "closed").length;
  const closed = records.length - open;
  return `${records.length} records | ${open} open | ${closed} closed`;
}

function filenameForPackage(data, prefix) {
  const date = data.shiftDate || todayString();
  return `${prefix}_${date}.json`;
}



/* v0.6.09 template version/repository merge logic.
   Template records now carry templateVersion. Imported site files merge uiTemplates
   into the browser template library by matching template names, then comparing
   template versions so older JSON files cannot silently downgrade newer browser
   templates. B01 status also prints app/template version information. */

/* v0.6.00 template-manager CONFIG override
   This block supersedes the earlier per-site CONFIG editor. It keeps the B-box
   buttons as focused config entry points, but the config box now manages a
   template library. Sites carry templateId; legacy/no-template sites assume
   the Default template. */
var CONFIG_TEMPLATE_LIBRARY_STORAGE_KEY = "sitescribe_config_template_library_v1";
var selectedConfigTemplateId = "default";
var editingConfigTemplateId = "default";
var currentConfigBoxId = "B01";
var templateDraftDirty = false;

function normalizeTemplateVersion(value) {
  const text = String(value || "").trim();
  return text || "1.0.0";
}

function templateVersionParts(value) {
  return normalizeTemplateVersion(value).split(".").map(part => {
    const n = parseInt(part, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

function compareTemplateVersions(a, b) {
  const aa = templateVersionParts(a);
  const bb = templateVersionParts(b);
  const len = Math.max(aa.length, bb.length, 3);
  for (let i = 0; i < len; i += 1) {
    const av = aa[i] || 0;
    const bv = bb[i] || 0;
    if (av !== bv) return av > bv ? 1 : -1;
  }
  return 0;
}

function bumpTemplateVersion(value) {
  const parts = templateVersionParts(value);
  while (parts.length < 3) parts.push(0);
  parts[2] = (parts[2] || 0) + 1;
  return `${parts[0] || 1}.${parts[1] || 0}.${parts[2]}`;
}

function templateNameKey(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function defaultTemplateRecordFromLegacyStorage() {
  let config = cloneUiConfig(DEFAULT_UI_CONFIG);
  try {
    const raw = window.localStorage ? window.localStorage.getItem(DEFAULT_TEMPLATE_STORAGE_KEY) : "";
    if (raw) config = mergeUiConfig(JSON.parse(raw));
  } catch (_) {}
  return {
    id: "default",
    name: "Default",
    uiConfig: mergeUiConfig(config),
    templateVersion: "1.0.0",
    locked: true,
    createdAt: "system",
    updatedAt: new Date().toISOString()
  };
}

function normalizeTemplateRecord(template) {
  const fallback = defaultTemplateRecordFromLegacyStorage();
  const id = String(template && template.id ? template.id : "").trim() || createTemplateId(String(template && template.name ? template.name : "Template"));
  return {
    id,
    name: String(template && template.name ? template.name : (id === "default" ? "Default" : id)).trim() || "Template",
    uiConfig: mergeUiConfig((template && template.uiConfig) || fallback.uiConfig),
    templateVersion: normalizeTemplateVersion((template && (template.templateVersion || template.version)) || fallback.templateVersion || "1.0.0"),
    locked: id === "default" || !!(template && template.locked),
    createdAt: (template && template.createdAt) || new Date().toISOString(),
    updatedAt: (template && template.updatedAt) || new Date().toISOString()
  };
}

function getTemplateLibrary() {
  let library = null;
  try {
    const raw = window.localStorage ? window.localStorage.getItem(CONFIG_TEMPLATE_LIBRARY_STORAGE_KEY) : "";
    if (raw) library = JSON.parse(raw);
  } catch (_) { library = null; }
  if (!library || typeof library !== "object") {
    library = { version: 1, templates: [defaultTemplateRecordFromLegacyStorage()] };
  }
  if (!Array.isArray(library.templates)) library.templates = [];
  const byId = new Map();
  library.templates.forEach(item => {
    const normalized = normalizeTemplateRecord(item);
    byId.set(normalized.id, normalized);
  });
  if (!byId.has("default")) byId.set("default", defaultTemplateRecordFromLegacyStorage());
  library.templates = Array.from(byId.values()).sort((a, b) => {
    if (a.id === "default") return -1;
    if (b.id === "default") return 1;
    return a.name.localeCompare(b.name);
  });
  library.version = 1;
  return library;
}

function saveTemplateLibrary(library) {
  const normalized = getTemplateLibraryFromObject(library);
  try {
    if (window.localStorage) window.localStorage.setItem(CONFIG_TEMPLATE_LIBRARY_STORAGE_KEY, JSON.stringify(normalized));
  } catch (_) {}
  const defaultTemplate = normalized.templates.find(template => template.id === "default");
  if (defaultTemplate) saveDefaultTemplateUiConfig(defaultTemplate.uiConfig);
  return normalized;
}

function getTemplateLibraryFromObject(library) {
  const source = library && typeof library === "object" ? library : { templates: [] };
  const byId = new Map();
  (Array.isArray(source.templates) ? source.templates : []).forEach(template => {
    const normalized = normalizeTemplateRecord(template);
    byId.set(normalized.id, normalized);
  });
  if (!byId.has("default")) byId.set("default", defaultTemplateRecordFromLegacyStorage());
  return {
    version: 1,
    templates: Array.from(byId.values()).sort((a, b) => {
      if (a.id === "default") return -1;
      if (b.id === "default") return 1;
      return a.name.localeCompare(b.name);
    })
  };
}

function getTemplateById(templateId) {
  const library = getTemplateLibrary();
  return library.templates.find(template => template.id === templateId) || library.templates.find(template => template.id === "default") || defaultTemplateRecordFromLegacyStorage();
}


function createTemplateId(name) {
  const base = String(name || "template").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "template";
  const library = getTemplateLibrary();
  const ids = new Set(library.templates.map(template => template.id));
  let id = base;
  let counter = 2;
  while (ids.has(id)) id = `${base}_${counter++}`;
  return id;
}

function currentSiteTemplateId() {
  const id = String(currentPackage && currentPackage.templateId ? currentPackage.templateId : "").trim();
  return id || "default";
}

function ensurePackageUiConfig() {
  if (!currentPackage || typeof currentPackage !== "object") currentPackage = createEmptyPackage();
  if (!currentPackage.templateId) {
    currentPackage.templateId = "default";
    attachTemplateLibraryToPackage(currentPackage);
    currentPackage.reviewConsole = {
      ...(currentPackage.reviewConsole || {}),
      appName: "SiteScribe Review Console",
      appVersion: APP_VERSION,
      model: "two-level-records-with-record-flags",
      templateMigratedAt: new Date().toISOString(),
      templateMigrationSource: "default"
    };
  }
  const template = getTemplateById(currentPackage.templateId || "default");
  currentPackage.uiConfig = mergeUiConfig(template.uiConfig);
  currentPackage.templateVersion = normalizeTemplateVersion(template.templateVersion);
  return currentPackage.uiConfig;
}

function getActiveUiConfig() {
  if (currentPackage && currentPackage.templateId) return mergeUiConfig(getTemplateById(currentPackage.templateId).uiConfig);
  return mergeUiConfig(getTemplateById("default").uiConfig);
}

function createEmptyPackage() {
  const now = new Date().toISOString();
  const template = getTemplateById("default");
  return {
    packageType: "sitescribe_two_level_records",
    version: "1.1",
    site: "not stated",
    shiftDate: todayString(),
    processedAt: now,
    templateId: "default",
    templateVersion: normalizeTemplateVersion(template.templateVersion),
    uiConfig: mergeUiConfig(template.uiConfig),
    source: { captureMethod: "manual entry", rawText: "" },
    dailySummary: "",
    reviewConsole: {
      appName: "SiteScribe Review Console",
      appVersion: APP_VERSION,
      model: "two-level-records-with-record-flags",
      workingMemorySort: "date_desc"
    },
    packageFlags: [],
    communicationConfig: createEmptyCommunicationConfig(),
    emailActivityLog: [],
    records: []
  };
}


function closeConfigPanel() {
  if (templateDraftDirty || configDraftDirty) saveCurrentTemplateFromConfig({ silent: true });
  if (!els.configPanel) return;
  els.configPanel.classList.remove("open");
  els.configPanel.classList.add("hidden");
  els.configPanel.setAttribute("aria-hidden", "true");
  applyUiConfigToScreen();
  renderActiveMemorySummary();
}


/* v0.6.02 legacy-template switch fix.
   Switching to a legacy/no-template site must not inherit the previously
   selected template in the CONFIG panel. Legacy JSON is assigned Default,
   the active selection/editing pointers are reset to the active site's
   templateId, and the rendered screen is forced to use that active site
   template. */




function fillConfigInputs(config, activeBoxId = "B01") {
  if (!els.configFields) return;
  const template = getTemplateById(editingConfigTemplateId || selectedConfigTemplateId || "default");
  const merged = mergeUiConfig(config || template.uiConfig);
  const boxIds = ["B01", "B02", "B04", "B05"];
  const requested = boxIds.includes(activeBoxId) ? activeBoxId : "B01";
  currentConfigBoxId = requested;
  const nav = `<div class="config-box-tabs" role="tablist" aria-label="Config boxes">${boxIds.map(id => `<button type="button" class="secondary small config-box-tab${id === requested ? " active" : ""}" data-template-action="box" data-box-id="${id}">${id}</button>`).join("")}</div>`;
  const specs = getConfigBoxFieldSpecs();
  const spec = specs[requested];
  const titleInput = spec.title ? `<label class="field-label">Title<input id="configTitleInput" data-config-kind="title" data-box-id="${requested}" type="text" value="${escapeHtml(merged.titles[requested] || DEFAULT_UI_CONFIG.titles[requested] || requested)}" /></label>` : "";
  const subtitleInput = spec.subtitle ? `<label class="field-label">Subtitle / prompt<input id="configSubtitleInput" data-config-kind="subtitle" data-box-id="${requested}" type="text" value="${escapeHtml(merged.subtitles[requested] || DEFAULT_UI_CONFIG.subtitles[requested] || "")}" /></label>` : "";
  const pillInputs = (spec.pills || []).map(([key, label]) => {
    const value = (merged.pills[spec.pillGroup] && merged.pills[spec.pillGroup][key]) || (DEFAULT_UI_CONFIG.pills[spec.pillGroup] && DEFAULT_UI_CONFIG.pills[spec.pillGroup][key]) || "";
    return `<label class="field-label">${escapeHtml(label)}<input data-config-kind="pill" data-pill-group="${spec.pillGroup}" data-pill-key="${key}" type="text" value="${escapeHtml(value)}" /></label>`;
  }).join("");
  els.configFields.innerHTML = `${templateListHtml()}${nav}<div class="config-box-editor" data-active-config-box="${requested}" data-editing-template-id="${escapeHtml(template.id)}"><h3>${escapeHtml(spec.heading)}</h3><p class="muted">${escapeHtml(spec.note)}</p><div class="config-grid ${requested === "B01" ? "config-grid-b01" : ""}">${titleInput}${subtitleInput}${pillInputs}</div></div>`;
  configDraftDirty = false;
  templateDraftDirty = false;
}

function getConfigBoxFieldSpecs() {
  return {
    B01: {
      heading: "B01 - Bring In Site Notes",
      note: "Rename the panel title and visible JSON/report pills.",
      title: true,
      subtitle: false,
      pillGroup: "B01",
      pills: [["loadJson", "Load JSON pill"], ["reports", "Reports pill"]]
    },
    B02: {
      heading: "B02 - Saved Sites",
      note: "B02 has the Saved Sites title plus Refresh and New Blank Site. Bulk clear is not exposed in the normal workflow.",
      title: true,
      subtitle: false,
      pillGroup: "B02",
      pills: [["refresh", "Refresh pill"], ["newBlank", "New Blank Site pill"]]
    },
    B04: {
      heading: "B04 - Record Intake",
      note: "Rename the overall Record Intake title, the manual-entry guidance, and the add-record pill. Parse Notes remains a distinct protected workflow.",
      title: true,
      subtitle: true,
      pillGroup: "B04",
      pills: [["addRecord", "Add Record pill"]]
    },
    B05: {
      heading: "B05 - Working Memory",
      note: "Rename the working-memory title, empty-list prompt, and list-control pills.",
      title: true,
      subtitle: true,
      pillGroup: "B05",
      pills: [["sortNewest", "Sort Newest pill"], ["sortOldest", "Sort Oldest pill"], ["hideClosed", "Hide Closed pill"], ["showClosed", "Show Closed pill"]]
    }
  };
}

function readConfigInputs() {
  const template = getTemplateById(editingConfigTemplateId || selectedConfigTemplateId || "default");
  const base = mergeUiConfig(template.uiConfig);
  if (!els.configFields) return base;
  const clean = (value, fallback) => String(value || "").trim() || fallback;
  els.configFields.querySelectorAll("input[data-config-kind]").forEach(input => {
    const kind = input.dataset.configKind;
    if (kind === "title") {
      const boxId = input.dataset.boxId;
      base.titles[boxId] = clean(input.value, DEFAULT_UI_CONFIG.titles[boxId] || boxId);
    }
    if (kind === "subtitle") {
      const boxId = input.dataset.boxId;
      base.subtitles[boxId] = clean(input.value, DEFAULT_UI_CONFIG.subtitles[boxId] || "");
    }
    if (kind === "pill") {
      const group = input.dataset.pillGroup;
      const key = input.dataset.pillKey;
      base.pills[group] = base.pills[group] || {};
      base.pills[group][key] = clean(input.value, (DEFAULT_UI_CONFIG.pills[group] && DEFAULT_UI_CONFIG.pills[group][key]) || key);
    }
  });
  return mergeUiConfig(base);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function uiConfigsAreEqual(a, b) {
  return stableJson(mergeUiConfig(a)) === stableJson(mergeUiConfig(b));
}

function saveCurrentTemplateFromConfig(options = {}) {
  if (!editingConfigTemplateId) editingConfigTemplateId = selectedConfigTemplateId || "default";
  const existing = getTemplateById(editingConfigTemplateId);
  const nextUiConfig = mergeUiConfig(readConfigInputs());
  const changed = !uiConfigsAreEqual(existing.uiConfig, nextUiConfig);
  const saved = changed ? saveTemplateRecord({
    ...existing,
    uiConfig: nextUiConfig,
    templateVersion: bumpTemplateVersion(existing.templateVersion),
    updatedAt: new Date().toISOString()
  }) : existing;

  editingConfigTemplateId = saved.id;
  selectedConfigTemplateId = saved.id;
  templateDraftDirty = false;
  configDraftDirty = false;

  if (changed && currentPackage && currentPackage.templateId === saved.id) {
    currentPackage.uiConfig = mergeUiConfig(saved.uiConfig);
    currentPackage.templateVersion = normalizeTemplateVersion(saved.templateVersion);
    attachTemplateLibraryToPackage(currentPackage);
    applyUiConfigToScreen();
    markDirty({ reason: "template changed" });
  }
  if (!options.silent) {
    fillConfigInputs(saved.uiConfig, currentConfigBoxId || "B01");
    if (changed) {
      setStatus(`Template saved: ${saved.name} v${normalizeTemplateVersion(saved.templateVersion)}.`);
      showToast("Template saved.");
    } else {
      setStatus(`No template changes to save: ${saved.name} remains v${normalizeTemplateVersion(saved.templateVersion)}.`);
      showToast("No template changes.");
    }
  }
  return saved;
}

function applyConfigTitles() {
  if (!selectedConfigTemplateId) selectedConfigTemplateId = "default";
  if (templateDraftDirty || configDraftDirty) saveCurrentTemplateFromConfig({ silent: true });
  if (!currentPackage || typeof currentPackage !== "object") currentPackage = createEmptyPackage();
  const template = getTemplateById(selectedConfigTemplateId);
  currentPackage.templateId = template.id;
  currentPackage.templateVersion = normalizeTemplateVersion(template.templateVersion);
  currentPackage.uiConfig = mergeUiConfig(template.uiConfig);
  attachTemplateLibraryToPackage(currentPackage);
  currentPackage.reviewConsole = {
    ...(currentPackage.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    templateAppliedAt: new Date().toISOString(),
    templateAppliedName: template.name
  };
  markDirty({ reason: "template applied" });
  applyUiConfigToScreen();
  fillConfigInputs(template.uiConfig, currentConfigBoxId || "B01");
  setStatus(`Template applied to current site: ${template.name}.`);
  showToast("Template applied to site.");
}

function restoreConfigDefaults() {
  if (!selectedConfigTemplateId) selectedConfigTemplateId = currentSiteTemplateId();
  editingConfigTemplateId = selectedConfigTemplateId;
  fillConfigInputs(getTemplateById(editingConfigTemplateId).uiConfig, currentConfigBoxId || "B01");
  setStatus(`Loaded template for editing: ${getTemplateById(editingConfigTemplateId).name}.`);
  showToast("Template loaded for editing.");
}

async function saveConfigToSite() {
  saveCurrentTemplateFromConfig({ silent: false });
}

function handleTemplateConfigClick(event) {
  const templateButton = event.target.closest("[data-template-id]");
  if (templateButton) {
    if (templateDraftDirty || configDraftDirty) saveCurrentTemplateFromConfig({ silent: true });
    selectedConfigTemplateId = templateButton.dataset.templateId || "default";
    editingConfigTemplateId = selectedConfigTemplateId;
    fillConfigInputs(getTemplateById(editingConfigTemplateId).uiConfig, currentConfigBoxId || "B01");
    return;
  }
  const action = event.target.closest("[data-template-action]");
  if (!action) return;
  const actionName = action.dataset.templateAction;
  if (actionName === "create") {
    createNewConfigTemplate();
    return;
  }
  if (actionName === "box") {
    if (templateDraftDirty || configDraftDirty) saveCurrentTemplateFromConfig({ silent: true });
    currentConfigBoxId = action.dataset.boxId || "B01";
    fillConfigInputs(getTemplateById(editingConfigTemplateId || selectedConfigTemplateId || "default").uiConfig, currentConfigBoxId);
  }
}

function createNewConfigTemplate() {
  if (templateDraftDirty || configDraftDirty) saveCurrentTemplateFromConfig({ silent: true });
  const nameValue = prompt("Name the new template:", "");
  if (nameValue === null) return;
  const name = String(nameValue || "").trim();
  if (!name) {
    showToast("Template name required.");
    setStatus("Template was not created. Enter a template name first.");
    return;
  }
  const id = createTemplateId(name);
  const source = getTemplateById(selectedConfigTemplateId || "default");
  const template = saveTemplateRecord({
    id,
    name,
    templateVersion: "1.0.0",
    uiConfig: mergeUiConfig(source.uiConfig),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  selectedConfigTemplateId = template.id;
  editingConfigTemplateId = template.id;
  fillConfigInputs(template.uiConfig, currentConfigBoxId || "B01");
  setStatus(`New template created: ${template.name}.`);
  showToast("Template created.");
}

function commitPendingConfigDraft(options = {}) {
  if (!configDraftDirty && !templateDraftDirty) return false;
  if (!els.configFields) return false;
  const beforeTemplate = getTemplateById(editingConfigTemplateId || selectedConfigTemplateId || "default");
  const beforeVersion = normalizeTemplateVersion(beforeTemplate.templateVersion);
  const saved = saveCurrentTemplateFromConfig({ silent: true });
  const changed = compareTemplateVersions(saved.templateVersion, beforeVersion) !== 0 || !uiConfigsAreEqual(beforeTemplate.uiConfig, saved.uiConfig);
  if (changed && currentPackage && currentPackage.templateId === saved.id) {
    currentPackage.uiConfig = mergeUiConfig(saved.uiConfig);
    currentPackage.templateVersion = normalizeTemplateVersion(saved.templateVersion);
    if (!options.skipDirty) markDirty({ reason: "template config changed" });
  }
  return changed;
}



function legacyDescription(item) {
  if (!item || typeof item !== "object") return String(item || "Untitled record");
  return item.description || item.task || item.issue || item.title || item.actionLabel || item.subject || item.notes || formatLegacyValue(item) || "Untitled record";
}

document.addEventListener("DOMContentLoaded", () => {
  if (els.configFields) els.configFields.addEventListener("click", handleTemplateConfigClick);
  if (els.configFields) els.configFields.addEventListener("input", () => { templateDraftDirty = true; configDraftDirty = true; });
  if (els.applyConfigButton) els.applyConfigButton.textContent = "Apply";
  if (els.restoreConfigDefaultsButton) els.restoreConfigDefaultsButton.textContent = "Edit Template";
  if (els.saveConfigToSiteButton) els.saveConfigToSiteButton.textContent = "Save";
});


/* v0.6.01 template persistence and selection fixes.
   Sites now carry a snapshot of the template library in uiTemplates so a
   custom template such as "To Do" can be saved/exported with the site and
   recovered after switching files or devices. Only the actively selected
   template gets the blue selected highlight; the current-site template is a
   badge only. */
function packageTemplateLibraryFromData(data) {
  if (!data || typeof data !== "object") return null;
  if (data.uiTemplates && Array.isArray(data.uiTemplates.templates)) return data.uiTemplates;
  if (data.templateLibrary && Array.isArray(data.templateLibrary.templates)) return data.templateLibrary;
  if (data.reviewConsole && data.reviewConsole.uiTemplates && Array.isArray(data.reviewConsole.uiTemplates.templates)) return data.reviewConsole.uiTemplates;
  return null;
}

function mergeTemplateLibraryFromPackage(data) {
  const incoming = packageTemplateLibraryFromData(data);
  if (!incoming || !Array.isArray(incoming.templates)) return false;
  const local = getTemplateLibrary();
  const byId = new Map();
  const byName = new Map();
  local.templates.forEach(template => {
    const normalized = normalizeTemplateRecord(template);
    byId.set(normalized.id, normalized);
    byName.set(templateNameKey(normalized.name), normalized);
  });

  let changed = false;
  incoming.templates.forEach(template => {
    const normalized = normalizeTemplateRecord(template);
    const nameKey = templateNameKey(normalized.name);
    const existingByName = byName.get(nameKey);

    if (existingByName) {
      // Names must match before templates are compared. If names match, versions decide.
      if (compareTemplateVersions(normalized.templateVersion, existingByName.templateVersion) > 0) {
        byId.delete(existingByName.id);
        byId.set(normalized.id, normalized);
        byName.set(nameKey, normalized);
        changed = true;
      }
      return;
    }

    const existingById = byId.get(normalized.id);
    if (!existingById) {
      byId.set(normalized.id, normalized);
      byName.set(nameKey, normalized);
      changed = true;
      return;
    }

    // Same ID but different name is not considered the same template; keep both by assigning a unique ID.
    let unique = { ...normalized, id: createTemplateId(normalized.name) };
    byId.set(unique.id, unique);
    byName.set(nameKey, unique);
    changed = true;
  });

  if (changed) saveTemplateLibrary({ version: 1, templates: Array.from(byId.values()) });
  return changed;
}

function attachTemplateLibraryToPackage(pkg) {
  if (!pkg || typeof pkg !== "object") return pkg;
  const templateId = String(pkg.templateId || "default").trim() || "default";
  const template = getTemplateById(templateId);
  pkg.templateId = template.id || "default";
  pkg.uiConfig = mergeUiConfig(template.uiConfig);
  pkg.uiTemplates = getTemplateLibrary();
  pkg.templateVersion = normalizeTemplateVersion(template.templateVersion);
  pkg.reviewConsole = {
    ...(pkg.reviewConsole || {}),
    templateLibraryIncludedAt: new Date().toISOString(),
    templateLibraryVersion: 1,
    activeTemplateName: template.name,
    activeTemplateVersion: normalizeTemplateVersion(template.templateVersion)
  };
  return pkg;
}


/* v0.6.02 legacy-template switch fix.
   Switching to a legacy/no-template site must not inherit the previously
   selected template in the CONFIG panel. Legacy JSON is assigned Default,
   the active selection/editing pointers are reset to the active site's
   templateId, and the rendered screen is forced to use that active site
   template. */
function packageHasExplicitTemplateId(data) {
  return !!(data && typeof data === "object" && String(data.templateId || "").trim());
}

function resetConfigTemplateSelectionToActiveSite() {
  const id = currentSiteTemplateId();
  selectedConfigTemplateId = id || "default";
  editingConfigTemplateId = selectedConfigTemplateId;
}

function forceLegacyPackageToDefaultTemplate(pkg, sourceLabel = "legacy") {
  if (!pkg || typeof pkg !== "object") return pkg;
  pkg.templateId = "default";
  const template = getTemplateById("default");
  pkg.templateVersion = normalizeTemplateVersion(template.templateVersion);
  pkg.uiConfig = mergeUiConfig(template.uiConfig);
  pkg.uiTemplates = getTemplateLibrary();
  pkg.templateVersion = normalizeTemplateVersion(template.templateVersion);
  pkg.reviewConsole = {
    ...(pkg.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    templateMigratedAt: new Date().toISOString(),
    templateMigrationSource: sourceLabel || "legacy_default"
  };
  return pkg;
}

function templateListHtml() {
  const library = getTemplateLibrary();
  const currentId = currentSiteTemplateId();
  return `<div class="config-template-row"><h3>Templates</h3><button type="button" class="secondary small" data-template-action="create">Create New Template</button></div><div class="config-template-list" role="listbox" aria-label="Templates">${library.templates.map(template => {
    const selected = template.id === selectedConfigTemplateId;
    const current = template.id === currentId;
    const version = normalizeTemplateVersion(template.templateVersion);
    return `<button type="button" class="config-template-item${selected ? " active" : ""}${current ? " current-site-template" : ""}" aria-selected="${selected ? "true" : "false"}" data-template-id="${escapeHtml(template.id)}"><span class="config-template-name">${escapeHtml(template.name)} <small class="config-template-version">v${escapeHtml(version)}</small></span>${current ? `<small>Current site</small>` : ""}</button>`;
  }).join("")}</div>`;
}

function openConfigPanel(boxId = "") {
  ensurePackageUiConfig();
  currentConfigBoxId = ["B01", "B02", "B04", "B05"].includes(boxId) ? boxId : (currentConfigBoxId || "B01");
  selectedConfigTemplateId = currentSiteTemplateId();
  editingConfigTemplateId = selectedConfigTemplateId;
  fillConfigInputs(getTemplateById(editingConfigTemplateId).uiConfig, currentConfigBoxId);
  if (!els.configPanel) return;
  els.configPanel.classList.add("open");
  els.configPanel.classList.remove("hidden");
  els.configPanel.setAttribute("aria-hidden", "false");
  const first = els.configFields && els.configFields.querySelector("input");
  if (first) setTimeout(() => first.focus(), 0);
}

function saveTemplateRecord(template) {
  const library = getTemplateLibrary();
  const normalized = normalizeTemplateRecord(template);
  const index = library.templates.findIndex(item => item.id === normalized.id);
  if (index >= 0) library.templates[index] = normalized;
  else library.templates.push(normalized);
  saveTemplateLibrary(library);
  if (currentPackage && currentPackage.templateId === normalized.id) attachTemplateLibraryToPackage(currentPackage);
  return normalized;
}


/* v0.6.02 overrides: legacy/no-template package switches must select Default. */
function normalizeImportedPackage(data) {
  if (!data || typeof data !== "object") throw new Error("JSON root must be an object");
  mergeTemplateLibraryFromPackage(data);
  const hadTemplateId = packageHasExplicitTemplateId(data);
  if (Array.isArray(data.records)) {
    const normalized = structuredCloneSafe(data);
    normalized.packageType = "sitescribe_two_level_records";
    normalized.version = normalized.version || "1.0";
    normalized.site = normalized.site || "not stated";
    normalized.shiftDate = normalized.shiftDate || todayString();
    normalized.processedAt = normalized.processedAt || new Date().toISOString();
    normalized.source = normalized.source || { captureMethod: "not stated", rawText: "" };
    normalized.dailySummary = normalized.dailySummary || "";
    normalized.packageFlags = Array.isArray(normalized.packageFlags) ? normalized.packageFlags : [];
    normalized.communicationConfig = normalizeCommunicationConfig(normalized.communicationConfig);
    normalized.emailActivityLog = normalizeEmailActivityLog(normalized.emailActivityLog);
    normalized.templateId = hadTemplateId ? String(normalized.templateId || "default").trim() : "default";
    normalized.uiConfig = mergeUiConfig(getTemplateById(normalized.templateId).uiConfig);
    normalized.reviewConsole = { ...(normalized.reviewConsole || {}), appName: "SiteScribe Review Console", appVersion: APP_VERSION, model: "two-level-records-with-record-flags" };
    if (!hadTemplateId) forceLegacyPackageToDefaultTemplate(normalized, "legacy_json_open");
    normalized.records = normalized.records.map(normalizeRecord);
    return normalized;
  }
  const converted = convertLegacyPackage(data);
  if (!hadTemplateId) forceLegacyPackageToDefaultTemplate(converted, "legacy_json_convert");
  return converted;
}

function convertLegacyPackage(data) {
  mergeTemplateLibraryFromPackage(data);
  const pkg = createEmptyPackage();
  pkg.site = data.site || "not stated";
  pkg.shiftDate = data.shiftDate || todayString();
  pkg.processedAt = data.processedAt || new Date().toISOString();
  pkg.templateId = packageHasExplicitTemplateId(data) ? String(data.templateId || "default").trim() : "default";
  pkg.uiConfig = mergeUiConfig(getTemplateById(pkg.templateId).uiConfig);
  pkg.source = data.source || { captureMethod: "not stated", rawText: "" };
  pkg.dailySummary = data.dailySummary || "";
  pkg.communicationConfig = normalizeCommunicationConfig(data.communicationConfig);
  pkg.emailActivityLog = normalizeEmailActivityLog(data.emailActivityLog);
  pkg.reviewConsole = {
    ...(pkg.reviewConsole || {}),
    appName: "SiteScribe Review Console",
    appVersion: APP_VERSION,
    model: "two-level-records-with-record-flags",
    templateMigratedAt: packageHasExplicitTemplateId(data) ? "" : new Date().toISOString(),
    templateMigrationSource: packageHasExplicitTemplateId(data) ? "" : "default"
  };
  pkg.records = [];
  const seen = new Set();
  const add = (category, item) => {
    const sourceText = item && typeof item === "object" ? (item.sourceText || formatLegacyValue(item)) : String(item || "");
    const key = legacyDedupeKey(category, sourceText);
    if (seen.has(key)) return;
    seen.add(key);
    let finalCategory = category;
    if (category === "scheduled" && !hasScheduledDateOrTime(formatLegacyValue(item))) finalCategory = "action";
    const record = normalizeRecord({
      id: createId("rec"),
      category: finalCategory,
      description: legacyDescription(item),
      status: normalizeLegacyStatus(item && item.status),
      createdAt: pkg.processedAt,
      updatedAt: pkg.processedAt,
      closedAt: "",
      sourceDate: pkg.shiftDate,
      sourceText,
      flags: Array.isArray(item && item.flags) ? item.flags.map(normalizeFlag) : [],
      comments: []
    });
    pkg.records.push(record);
  };
  (data.events || []).forEach(item => add("event", item));
  (data.safetyIssues || []).forEach(item => add("safety", item));
  (data.emails || data.communications || []).forEach(item => add("communication", item));
  (data.appointments || []).forEach(item => add("scheduled", item));
  (data.todos || data.actions || []).forEach(item => add("action", item));
  (data.followups || []).forEach(item => add("followup", item));
  (data.documents || []).forEach(item => add("document", item));
  (data.missingInfo || []).forEach(item => {
    const related = findRelatedRecord(pkg.records, item);
    const flag = normalizeFlag({ id: createId("flag"), type: "incomplete", text: formatLegacyValue(item), status: "open", sourceText: formatLegacyValue(item), createdAt: pkg.processedAt });
    if (related) related.flags.push(flag); else pkg.packageFlags.push(flag);
  });
  (data.clarificationRequired || []).forEach(item => {
    const related = findRelatedRecord(pkg.records, item);
    const flag = normalizeFlag({ id: createId("flag"), type: "clarify", text: formatLegacyValue(item), status: "open", sourceText: formatLegacyValue(item), createdAt: pkg.processedAt });
    if (related) related.flags.push(flag); else pkg.packageFlags.push(flag);
  });
  if (!packageHasExplicitTemplateId(data)) forceLegacyPackageToDefaultTemplate(pkg, "legacy_json_convert");
  return pkg;
}

function openSavedPackageAsActive(record, options = {}) {
  if (!record || !record.data) throw new Error("Saved package has no stored data");
  const missingTemplateOnSavedData = !packageHasExplicitTemplateId(record.data);
  const normalizedData = normalizeImportedPackage(structuredCloneSafe(record.data));

  currentPackage = normalizedData;
  resetConfigTemplateSelectionToActiveSite();
  currentPackageRecord = {
    ...record,
    data: structuredCloneSafe(normalizedData)
  };
  selectedArchivePackageId = null;
  activeSiteFileOpen = true;
  rememberActiveWorkingCopy(currentPackageRecord.id);
  resetConfigTemplateSelectionToActiveSite();
  hardSwitchActiveMemorySiteInputDelayed();
  selectedRecordId = null;
  selectedCommentId = null;
  selectedFlagId = null;
  dirty = !!missingTemplateOnSavedData;

  if (els.mainEntry) els.mainEntry.value = "";
  closeDetail();
  if (els.recordsRoot) els.recordsRoot.innerHTML = "";
  if (els.activeMemorySummary) els.activeMemorySummary.innerHTML = "";
  render();
  resetConfigTemplateSelectionToActiveSite();
  if (configPanelIsOpen()) fillConfigInputs(getTemplateById(editingConfigTemplateId).uiConfig, currentConfigBoxId || "B01");
  hardSwitchActiveMemorySiteInputDelayed();
  refreshArchive();

  const count = Array.isArray(currentPackage.records) ? currentPackage.records.length : 0;
  if (options.restoring) {
    setStatus(`Restored working copy: ${record.site || "not stated"} | ${record.shiftDate || "not stated"} | ${count} records.`);
  } else if (missingTemplateOnSavedData) {
    setStatus(`Opened saved legacy site: ${record.site || "not stated"} | ${record.shiftDate || "not stated"} | ${count} records. Default template was assigned; Save/Export/Email will preserve it.`);
    showToast("Legacy saved site assigned to Default template.");
  } else {
    setStatus(`Opened saved site: ${record.site || "not stated"} | ${record.shiftDate || "not stated"} | ${count} records.`);
    showToast("Saved memory opened.");
  }
}
