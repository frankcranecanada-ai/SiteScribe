# SiteScribe Review Console Test JSON Suite

Extract this zip into the active working directory:

```text
SiteScribe App Development/current/
```

Expected result after extraction:

```text
current/
  index.html
  app.js
  styles.css
  README.md
  samples/
    log1.json
    test-suite/
      native/
      legacy/
      edge-cases/
```

## Test files

### Native model

- `native/01_native_basic.json`  
  Tests the current `records[]` schema with all primary categories.

- `native/02_native_secondary_items.json`  
  Tests multiple secondary items, selection, editing, replacement, and closed secondary display.

- `native/03_native_flags.json`  
  Tests incomplete and clarification flags attached to records.

- `native/09_closed_records.json`  
  Tests closed main records, closed secondary records, and the Completed / Closed view.

### Legacy model

- `legacy/04_legacy_basic.json`  
  Tests conversion from legacy arrays into the two-level records model.

- `legacy/05_legacy_duplicates.json`  
  Tests duplicate suppression when the same `sourceText` appears in multiple legacy arrays.

- `legacy/06_legacy_object_values.json`  
  Tests object flattening and verifies the app does not display `[object Object]`.

- `legacy/07_unscheduled_appointment.json`  
  Tests routing: real date/time appointment goes to Scheduled; unscheduled appointment request goes to Action.

### Edge cases

- `edge-cases/08_package_level_flags.json`  
  Tests unlinked missing/clarification items as package-level flags, not standalone main records.

- `edge-cases/10_bad_or_edge_values.json`  
  Tests missing fields, unknown category normalization, invalid dates, object descriptions, and non-open/closed statuses.

## Basic regression checklist

For every future build:

1. Open `index.html` locally.
2. Confirm the visible version matches `APP_VERSION` in `app.js`.
3. Import one native file by drag-and-drop.
4. Import the same file by Choose JSON File.
5. Load bundled sample and confirm `samples/log1.json` works.
6. Import `legacy/05_legacy_duplicates.json` and confirm the duplicate source item appears once.
7. Import `legacy/06_legacy_object_values.json` and confirm no `[object Object]` appears.
8. Import `native/02_native_secondary_items.json`; select a secondary item, edit it, and save. Confirm it replaces the selected line only.
9. Use Clear Selection / New Item and add another secondary item. Confirm all secondary records remain listed.
10. Import `native/03_native_flags.json`; confirm flags appear as record badges and in the detail panel.
11. Save to Local Storage, reload the browser, open from Local Archive, and confirm state persists.
12. Export Reviewed JSON, then re-import it and confirm reviewed state remains.

## Protected non-regression item

JSON import is protected. Both drag-and-drop and Choose JSON File must keep working in every future version.
