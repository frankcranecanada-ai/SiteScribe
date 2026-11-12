# SiteScribe Protected Regression Checklist

Run the changed-area tests plus this core checklist before every candidate release.

## Import, storage, and export

- [ ] File-picker JSON import works.
- [ ] Drag-and-drop JSON import works.
- [ ] Dropbox Import routes through Create New Saved Site / Append To Current / Cancel.
- [ ] Import never silently overwrites an existing site.
- [ ] Append merges without duplicate creation or source-text loss.
- [ ] Saved Sites persist after reload.
- [ ] Local JSON export contains the current site and its full three-level records (primary, secondary, activity).
- [ ] Legacy two-level JSON still imports; its secondaries normalize to `activities: []`.
- [ ] An attempted fourth level in imported JSON is discarded, not preserved.
- [ ] `sourceText`, deliverables, flags, contacts/routing, template selection, and email activity survive save/load.
- [ ] Update Dropbox Site File and Save New Backup Copy remain distinct and functional.

## Records and deliverables

- [ ] Primary, secondary, and activity records sort correctly.
- [ ] A child deliverable can raise its parent group’s priority.
- [ ] Closed state overrides active deliverable priority.
- [ ] Closed primaries, secondaries, and activities remain visible, deemphasized, and locked until reopened.
- [ ] Closing a secondary does not close the primary.
- [ ] A closed primary locks all descendants; a closed secondary locks its own activities.
- [ ] A closed secondary or activity whose ancestors are open shows Reopen and Delete below the lock notice.
- [ ] A record under a closed ancestor shows status only; the ancestor must be reopened first.
- [ ] Adding a secondary or an activity on mobile does not lose time/date/billing fields.
- [ ] Manual record creation preserves entry rhythm and does not force-open detail.
- [ ] Activities are created only under a secondary, and no fourth-level record is created.
- [ ] Activities reorder only within their own secondary; they cannot be promoted or moved between parents.
- [ ] Hours stay direct-only. Parent totals appear in report/export output and are never written back to a parent record.

## Contacts, routing, and email

- [ ] Contacts / Departments are saved with the correct site.
- [ ] Explicit Save Contacts / Departments waits for the local write to complete.
- [ ] Reordering one department/company preserves every card’s collapsed/expanded state.
- [ ] Mobile grip movement locks page scrolling and does not toggle the header.
- [ ] Source-site then contact selection prefills an independent copy in the current site.
- [ ] The current site is excluded from the source-site copy list.
- [ ] Routing suggestions remain unchecked until the user selects them.
- [ ] Selected parse-email recommendation opens an editable draft.
- [ ] No automatic send occurs.
- [ ] Email Activity is site-specific and expandable with source record and draft preview.
- [ ] Clear Activity requires confirmation and does not delete records or contacts.
- [ ] Do not change the email-draft secondary-record model without explicit approval.

## Panel and mobile safety

- [ ] Contacts / Departments backdrop is inert; explicit Close remains functional.
- [ ] Secondary editor backdrop is inert; explicit Close remains functional.
- [ ] Background page is locked while mobile secondary detail is open.
- [ ] Mobile Hours Detail table scrolls horizontally.
- [ ] Site Walk and Contacts title-bar drag locks release after drop/cancel.

## Reports

- [ ] Daily Site Report uses current site/date scope.
- [ ] Open Items includes open flags and deliverables.
- [ ] Hours Report preserves the accepted table format and totals.
- [ ] Reports traverse activities with parent-secondary context; a closed secondary excludes its activities.
- [ ] MDS Billing excludes closed secondaries, their activities, and all entries under closed primaries.
- [ ] Hours and MDS Excel exports preserve activity context.
- [ ] Communication Activity Report uses only the active site’s log.
- [ ] Print, copy, and applicable Excel exports work.
- [ ] B03 remains absent from report output.

## Dropbox UI

- [ ] Recognized file rows show bold name/status, Content updated, Import, and Delete only.
- [ ] Unreadable-file rows retain diagnostic detail.
- [ ] LIST DROPBOX JSON FILES tooltip remains inside the B01 border.
- [ ] Dropbox errors do not modify Working Memory or local sites.

## Removed controls that must stay removed

- [ ] Load Sample.
- [ ] Clear All Sites.
- [ ] Standalone CONFIG pill.
- [ ] Visible B03 Active Working Memory panel.
- [ ] Visible Apply Site Name control.

## Acceptance

- [ ] Version strings and cache markers agree.
- [ ] Deployable ZIP is the expected flat nine-file set.
- [ ] Full source ZIP contains release notes and regression evidence.
- [ ] Previous user-accepted package remains available for rollback.
- [ ] User tested desktop and relevant iPhone behavior.
- [ ] User explicitly accepted the candidate as the new baseline.
