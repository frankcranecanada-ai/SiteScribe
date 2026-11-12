# SiteScribe — Session Handoff, 2026-08-26 evening

**Purpose:** complete record of one working session, written so the next session can pick up cold.
**Outcome:** a new candidate `v0.8.9` exists, is fully verified, and is **NOT ACCEPTED**. The user has not tested it yet.

---

## 1. Read this first — current state in one table

| Thing | Where | State |
|---|---|---|
| Working copy (work here) | `C:\Users\ECR1\Desktop\claude code\sitescribe` | Created this session |
| Master / deploy source | `C:\Users\ECR1\Desktop\ALL APPS\1SiteScribe-review-console` | **UNTOUCHED**. Nothing copied back |
| Last user-accepted baseline | `source\review-console-v0.7.33\` | Accepted |
| Previous candidate | `source\review-console-v0.8.8\` | Not accepted, unmodified |
| **New candidate** | `source\review-console-v0.8.9\` | **Not accepted — needs user test** |
| Root nine deploy files | working-copy root | Mirror v0.8.9, SHA-256 verified |
| Protected, never edit | `source\review-console-v0.7.18\` | Untouched |

**No Git on this project.** The user does not want it used here.

---

## 2. What was done, in order

### 2.1 Working copy created

Copied master → `Desktop\claude code\sitescribe` with robocopy: **2304 files, 66.09 MB**, counts and byte totals matched on both sides. Excluded only the master's own `backups\` folder. The nine deploy files were SHA-256 verified identical to master at the time of copy.

### 2.2 Backups (standing rule: zip before writing any file)

- `ALL APPS\1SiteScribe-review-console\backups\SiteScribe-review-console_PRE-WORKINGCOPY_20260826_161815.zip` (37.5 MB) — master state before any work
- `sitescribe\backups\sitescribe_PRE-v0.8.9_20260826_194120.zip` (37.5 MB) — working copy before the v0.8.9 edits

### 2.3 Defect investigated and reproduced

Then fixed as v0.8.9. Details in sections 3–5.

---

## 3. The reported defect

The user's words:

> I opened a primary record. then entered a secondary record with start time at 15:00 and end time at 16:00 but did not calculate the hrs field. i closed the secondary record. reopened it and the 16:00 end time was missing. i put 16:00 and then the 1hr appeared in the hrs field.

Later clarification: they use 24-hour entry, and typing `15` into the hour box auto-fills `PM` — so the control is rendering under a 12-hour locale with an AM/PM segment.

### Root cause

A segmented control — `<input type="time">` and `<input type="date">` alike — reports `value === ""` in **two different situations**:

1. a box the operator deliberately cleared, and
2. a box where only **some** segments are filled.

Under a 12-hour locale the time box is `hh:mm AM/PM`. Typing `16` sets the hour and meridiem and leaves the **minutes** blank. The box looks filled but reads as empty to the page.

`applyCommentTimeFields` treated that empty read as a deliberate clear and ran `delete comment.endTime`. So an empty box did not merely fail to save a new value — **it erased an already-stored one**. The same commit rewrote `startTime` from the still-complete start box, which is exactly why start survived and end did not.

`updateCommentHoursCalculation` returns early whenever either time reads empty, so the Hrs field stayed blank. **That blank field was the only indication anything was wrong.**

Reproduced live and confirmed durable: a secondary holding `endTime: "16:00"` lost the key permanently, surviving a full page reload. It could persist as `startTime` + `totalHours` with **no** `endTime` — an orphaned hours value that would reach Hours and MDS output.

**This is not a v0.8 regression.** `applyCommentTimeFields` is byte-identical in v0.7.33 (line 4483) and v0.8.8 (line 4983).

### Second, separate defect

The commit inside the `set-comment-status` branch **could never run**. `Close Record` and `Reopen` are emitted only by `renderSelectedCommentStatusControls` for the *selected* record, so the guard `selectedCommentId !== comment.id` was never true. Closing relied entirely on an incidental `focusout` to flush pending editor edits.

Proved by A/B — identical sequence, complete `17:00` typed with only `input` fired, then closed with a bare click producing no focus shift:

| Build | Result after close |
|---|---|
| v0.8.8 | reverted to 16:00, hours 1 — **edit lost** |
| v0.8.9 | 17:00, hours 2 — **edit saved** |

---

## 4. What v0.8.9 changes

All line numbers are in `source\review-console-v0.8.9\app.js` (8227 lines). Search by function name before editing.

### `app.js`

| Function | Line | Change |
|---|---:|---|
| `inputEntryIsPartial` | 5109 | **New.** Uses `validity.badInput` to separate a half-entered control from an empty one. Works for `time` and `date`. Returns false for a disabled control and for any control holding a value |
| `getCommentTimeFieldsFromEditor` | 4925 | Now also returns `startTimePartial`, `endTimePartial`, `workDatePartial` |
| `getActivityEntryTimeFields` | 4951 | Same three flags |
| `applyCommentTimeFields` | 5062 | Preserves `startTime`, `endTime`, `totalHours`, `workDate` when the matching control reports partial. **A genuinely empty control still clears** — deliberate clearing is unchanged |
| `commentDraftDiffers` | 5013 | A partly entered time/date box states no opinion, so it does not register as a difference and cannot trigger a commit that rewrites the row |
| `commitSelectedCommentEditorChanges` | 5031 | Holds the stored deliverable while its date is partial |
| `updateEntryWarning` | 4312 | **New.** Marks every offending control and names them all in one note |
| `refreshCommentEntryWarning` | 4333 | **New.** Start time / End time / Work date / Deliverable date |
| `refreshActivityEntryWarning` | 4342 | **New.** Same for the activity composer |
| `updateCommentHoursCalculation` | 4351 | Calls the warning refresh |
| `commitRecordDeliverableEditor` | 4293 | `if (next.partial) return false;` — holds the stored deliverable |
| `readDeliverableEditor` | 7291 | Returns a `partial` flag for the deliverable date |
| `handleDetailInput` | 4189 | Routes `commentWorkDate`, `commentDeliverableDate`, `recordDeliverableDate`, `activityEntryWorkDate`, `activityEntryDeliverableDate` into the warning refresh |
| `handleDetailClick` | 4362 | **Close-commit fix at line 4436** |

**The close-commit fix (line 4436)** — placement matters:

```js
if (nextStatus !== "open" && currentStatus !== nextStatus) {
  commitSelectedCommentEditorChanges({ renderRows: true, saveNow: true });
}
```

It **must** run before `applyStatusTimestamps`, because `isCommentLocked` refuses a commit once the record is closed. The old unreachable commit in the `nextStatus === "open"` branch was **left in place and documented**, not removed.

### New DOM and CSS

- `#commentTimeEntryNote` — app.js:3968
- `#activityEntryTimeEntryNote` — app.js:4010
- `.update-time-editor input.time-input-incomplete` — styles.css:1614 (uses existing `--danger` / `--danger-bg`)
- `.time-entry-note` — styles.css:1618, `[hidden]` at 1628

Message shown: *"End time and Work date are incomplete — finish the entry. Anything already saved is kept until a complete value is entered."*

### Version markers (all agree at v0.8.9)

`app.js` release block + `APP_VERSION` (line 209) · `index.html` title, version pill, and four `?v=` markers · `sitescribe-add-data.js` `MODULE_VERSION`

### Explicitly NOT changed

Capped three-level model, B05 row/pill behaviour, the v0.8.8 closed-record recovery footer, deletion confirmation, drag rules, reports, Excel output, Dropbox auth/redirect/scope/naming, protected import choices, MDS billing metadata, the parser. No API key or credential introduced. No automatic status change, email, or date change introduced.

---

## 5. Verification performed

- `node --check` clean on all 7 first-party JS files
- Focused regression `regression_check_v0.8.9.js`: **32 PASS, 0 FAIL, exit 0**
- No duplicate first-party function declarations; no duplicate DOM IDs
- CSS brace balance 974 / 974
- Root vs candidate SHA-256: 9/9 match
- Deploy ZIP flat, exactly nine files; source ZIP carries release notes, verification, and the regression
- No console errors at any point

### The regression genuinely catches the defect

Run unchanged against a scratch copy of the v0.8.8 sources it exits 1 with **16 failures**. The harness extracts the *real shipped functions* from `app.js` (`inputEntryIsPartial`, `applyCommentTimeFields` and dependencies plus `EXPENSE_TYPES`) and executes them, so the behavioural checks test shipped code rather than matching source text. If those functions ever disappear it reports a `NOTE` and clean `FAIL`s instead of crashing. The v0.8.8 folder was not modified — copies were used in a scratch directory.

### Isolated browser tests, one claim each

Editor loaded with 15:00 / 16:00 / 2026-09-19, then exactly **one** field made partial:

- **Work date partial** → start 15:00, end 16:00, workDate 2026-09-19, hours 1 all preserved
- **End time partial** → same, all preserved
- **Genuine clear** → value removed as before, other fields untouched
- **Reopen** → status open, values intact, editor repopulated
- v0.8.8 recovery footer and the inline activity composer both still behave

### ⚠ Known limit — the one thing NOT proven

The Browser pane could not deliver real OS-level keystrokes in this session. **The segment-by-segment typing that produces a genuinely partial control was never reproduced by actually typing.** The tests supplied the browser's own `validity` signal directly to the real code path. That Chrome sets `badInput` for a partly filled time/date box is taken from HTML constraint-validation behaviour and **has not been confirmed by hand on this machine.**

**This is the first thing the user should check.**

### A false alarm, recorded so it is not re-chased

An intermediate test appeared to show `startTime` and `endTime` being deleted. **That run was invalid** — the harness had mutated `validity` across several commits and re-renders until the editor was blank, which the interface cannot reach: `clear-comment-selection` sets `selectedCommentId = null` before `renderDetail` (app.js:4527-4534), so a blank editor cannot commit over a selected record. Clean isolated re-runs passed.

Related observation, **not** acted on: the all-empty bail in `commitSelectedCommentEditorChanges` (app.js:5043) is weakened by `billingType` defaulting to `"regular"`. It is unreachable for the reason above, so it was deliberately left alone.

---

## 6. What the user still needs to do

1. **Test v0.8.9 and explicitly accept or reject it.** It is not a baseline until they say so.
   - Type **only the hour** into End, confirm the box goes red with the note, and confirm a previously saved end time is **not** lost ← the unproven case
   - Enter a complete start and end, confirm Hrs still calculates
   - Deliberately clear an end time, confirm it is still removed
   - Same for Work Date and the deliverable date
   - Close and reopen a secondary and an activity, confirm times survive
   - Closed primary / closed parent secondary still block descendant recovery
   - Desktop **and** iPhone
2. **If accepted:** copy the nine deploy files back to the master folder so the deploy source stays current.
3. Run the manual core list in `REGRESSION_CHECKLIST.md`.

---

## 7. Open items and known-stale docs

**`AGENTS.md` is stale.** It still names `source/review-console-v0.7.18/` as source authority and asserts a two-level record model. The 2026-08-26 handoff supersedes both — v0.7.33 is the accepted baseline and the v0.8 line is three-level. The user explicitly authorized branching from v0.8.8 this session.

**`REGRESSION_CHECKLIST.md` is stale the same way** — it still lists "No third-level records are created" and "Local JSON export contains … two-level records".

Both should be corrected as their own small change.

Carried over from the earlier handoff, still open:
- Functional AI reporting — prototype only, no proxy/API design authorized
- Saved AI prompts — placeholders, nothing persisted
- `model: "two-level-records-with-record-flags"` stale metadata string in package output — needs a focused, separately tested compatibility change
- v0.8 line acceptance

---

## 8. Artifacts

```text
artifacts\SiteScribe_Review_Console_v0.8.9_Partial_Entry_Protection_Deployable.zip   <- current
artifacts\SiteScribe_Review_Console_v0.8.9_Partial_Entry_Protection_Source.zip       <- current
artifacts\SiteScribe_Review_Console_v0.8.9_Partial_Time_Entry_Protection_*.SUPERSEDED.zip
```

The two `.SUPERSEDED.zip` files are an earlier v0.8.9 cut that covered **only** the time fields, before the date fields were added. Retired rather than deleted. Ignore them; they were never tested or accepted. All 50 older artifacts are retained for rollback.

Evidence lives in:

```text
source\review-console-v0.8.9\RELEASE_NOTES_v0.8.9.txt
source\review-console-v0.8.9\VERIFICATION_v0.8.9.txt
source\review-console-v0.8.9\regression_check_v0.8.9.js
```

---

## 9. Environment notes for the next session

**Local test servers** — configured in `C:\Users\ECR1\Desktop\claude code\.claude\launch.json` (Claude Code's own config, not SiteScribe's). Entries added this session:

| Name | Port | Serves |
|---|---|---|
| `sitescribe` | 8777 | working-copy root (currently mirrors v0.8.9) |
| `sitescribe-v089` | 8778 | the v0.8.9 candidate folder |

The pre-existing `sling-estimator` entry was preserved. The original file is backed up in the session scratchpad.

**Leftovers not cleaned up:**
- Test records in the browser storage for `localhost:8777` and `localhost:8778` (isolated from real data)
- Both dev servers may still be running

**Gotchas found the hard way:**
- The browser caches `index.html`, so a stale version pill can appear after a mirror. Hard-refresh. Asset markers (`?v=`) do change, so JS/CSS reload correctly
- `.claude\launch.json` resolves from the **project cwd** (`Desktop\claude code`), not from the app subfolder
- Heredocs in the Bash tool mangle `\\` — use forward slashes in JSON paths, or the Write tool
- robocopy exits 1 on success ("files copied"); anything ≥ 8 is a real failure
- The primary OPEN control in B05 is a `<span data-action="open-primary">`, not a `<button>`

**Regression command:**

```bash
cd "C:/Users/ECR1/Desktop/claude code/sitescribe/source/review-console-v0.8.9" && node ./regression_check_v0.8.9.js
```
