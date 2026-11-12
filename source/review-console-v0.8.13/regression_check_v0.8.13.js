#!/usr/bin/env node
/* Focused v0.8.13 portrait two-line B05 row regression check.
   Carries the v0.8.12 B02 content-date checks forward.
   Carries the v0.8.11 H:MM hours-display checks forward.
   Carries the v0.8.10 typed 24-hour time-entry checks, the v0.8.9 partial-entry protection +
   close-commit checks, and the v0.8.8 closed-secondary recovery-footer checks forward. */
const fs = require("fs");
const addData = require("./sitescribe-add-data.js");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const dropbox = fs.readFileSync("dropbox-sync-proof.js", "utf8");
const parserCore = fs.readFileSync("sitescribe-parser-core.js", "utf8");

const rawText = "Sep 21 — E-House delivered at 08:00.";
const instruction = "Create a Schedule primary, an E-House delivery secondary, and activity records only for separately trackable execution details.";
const context = { site: "MDS Cherry Point MCAS", shiftDate: "2026-09-14", captureMethod: "SiteScribe Add Data" };
const request = addData.buildRequest(rawText, context, [], instruction);
const staged = addData.normalizePackageForStaging({
  packageType: "sitescribe_three_level_records",
  records: [{ id: "schedule", category: "scheduled", description: "Phase 4A", sourceText: rawText, comments: [{ id: "ehouse", text: "E-House delivery", sourceText: rawText, activities: [{ id: "arrival", text: "Truck arrival", sourceText: rawText, totalHours: 1.5, activities: [{ id: "blocked", text: "must be discarded" }] }] }] }]
}, context, [], rawText, instruction);
const activity = staged.records[0].comments[0].activities[0];

// --- v0.8.9 live-code harness -------------------------------------------------
// Extract the real shipped functions from app.js and execute them, so this check
// exercises the actual behaviour rather than only matching source text. This is the
// check that would have caught the reported defect: a partly entered End time
// deleting an already-saved endTime.
function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`regression harness: ${name} not found in app.js`);
  let depth = 0;
  let started = false;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") { depth++; started = true; }
    else if (source[i] === "}") {
      depth--;
      if (started && depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`regression harness: unbalanced braces in ${name}`);
}

function extractArrayConst(source, name) {
  const start = source.indexOf(`const ${name} = [`);
  if (start < 0) throw new Error(`regression harness: ${name} not found in app.js`);
  let depth = 0;
  let started = false;
  for (let i = source.indexOf("[", start); i < source.length; i++) {
    if (source[i] === "[") { depth++; started = true; }
    else if (source[i] === "]") {
      depth--;
      if (started && depth === 0) return `${source.slice(start, i + 1)};`;
    }
  }
  throw new Error(`regression harness: unbalanced brackets in ${name}`);
}

const HARNESS_FNS = ["inputEntryIsPartial", "applyCommentTimeFields", "normalizeDateOnly", "normalizeBillingType", "isTimeBillingType", "parseExpenseAmount", "normalizeExpenseCurrency", "normalizeExpenseType",
  // v0.8.10: the typed-time path. These must execute, not merely exist, because the whole point
  // of the change is that a text box holding "20" is neither a value nor a deliberate clear.
  "isTimeTextInput", "timeTextInputIsPartial", "normalizeTimeInput", "normalizeTimeTextInput", "parseTimeMinutes", "calculateHoursFromTimes",
  // v0.8.11: the H:MM display path. The round trip must execute, because the risk in showing a
  // rounded value in an editable box is that reading it back silently re-rounds what is stored.
  "formatHoursClock", "parseHoursInput", "formatHoursInputValue", "setHoursInputValue", "readHoursInputValue",
  // v0.8.12: the B02 saved-site date. This must execute, because the whole defect was that the
  // line showed a touch time while claiming to be a content time.
  "savedSiteContentUpdatedAt", "derivePackageContentUpdatedAt", "latestIsoTimestamp"];
// Build the harness defensively: a build that has lost these functions must report a clean FAIL
// rather than crashing the whole run, so the remaining protected checks still get reported.
let harnessError = "";
let live = null;
try {
  const consts = extractArrayConst(app, "EXPENSE_TYPES");
  const src = HARNESS_FNS.map(name => extractFunction(app, name)).join("\n");
  live = new Function(`${consts}\n${src}\nreturn { ${HARNESS_FNS.join(", ")} };`)();
} catch (err) {
  harnessError = String((err && err.message) || err);
}

const timeFieldsBase = { billingType: "regular", expenseAmount: null, expenseCurrency: "", expenseType: "", workDate: "" };

function runTimeFields(stored, fields) {
  const subject = Object.assign({ text: "x" }, stored);
  if (!live) return subject;
  try {
    live.applyCommentTimeFields(subject, Object.assign({}, timeFieldsBase, fields));
  } catch (err) {
    harnessError = harnessError || String((err && err.message) || err);
  }
  return subject;
}

function safePartial(input) {
  if (!live) return null;
  try {
    return live.inputEntryIsPartial(input);
  } catch (err) {
    return null;
  }
}

const STORED = { startTime: "15:00", endTime: "16:00", totalHours: 1 };
// A stored end time must survive a partly entered End box.
const partialCase = runTimeFields(STORED, { startTime: "15:00", endTime: "", totalHours: null, startTimePartial: false, endTimePartial: true });
// A genuinely empty End box must still clear the stored value: deliberate clearing still works.
const clearedCase = runTimeFields(STORED, { startTime: "15:00", endTime: "", totalHours: null, startTimePartial: false, endTimePartial: false });
// A partly entered Start box must not erase a stored start time either.
const partialStartCase = runTimeFields(STORED, { startTime: "", endTime: "16:00", totalHours: null, startTimePartial: true, endTimePartial: false });
// v0.8.9 date fields: a partly entered Work Date must not erase the stored one.
const STORED_DATED = { startTime: "15:00", endTime: "16:00", totalHours: 1, workDate: "2026-09-19" };
const partialWorkDateCase = runTimeFields(STORED_DATED, { startTime: "15:00", endTime: "16:00", totalHours: 1, workDate: "", startTimePartial: false, endTimePartial: false, workDatePartial: true });
const clearedWorkDateCase = runTimeFields(STORED_DATED, { startTime: "15:00", endTime: "16:00", totalHours: 1, workDate: "", startTimePartial: false, endTimePartial: false, workDatePartial: false });

function fakeTimeInput(value, badInput, disabled) {
  return { value, disabled: !!disabled, validity: { badInput: !!badInput } };
}

// --- v0.8.10 typed 24-hour time entry ----------------------------------------
// A text box carries the literal keystrokes, so it reports its own unfinished state through
// dataset.timeText rather than validity.badInput. Date boxes keep the badInput path above.
function fakeTimeTextInput(value, disabled) {
  return { value, disabled: !!disabled, dataset: { timeText: "1" }, validity: { badInput: false } };
}

function liveCall(name, ...args) {
  if (!live) return null;
  try { return live[name](...args); } catch (err) { return null; }
}

// Thread the real functions together: text "20" must normalize to nothing, be flagged partial,
// and leave an already-stored end time untouched. This is the v0.8.9 defect re-expressed on the
// v0.8.10 typed path -- if the partial flag were dropped, the stored 16:00 would be deleted.
const typedEndPartial = liveCall("inputEntryIsPartial", fakeTimeTextInput("20"));
const typedEndPartialCase = runTimeFields(STORED, { startTime: "15:00", endTime: liveCall("normalizeTimeInput", "20") || "", totalHours: null, startTimePartial: false, endTimePartial: typedEndPartial });
const settleComplete = fakeTimeTextInput("2000");
const settleCompleteHandled = liveCall("normalizeTimeTextInput", settleComplete);
const settleUnfinished = fakeTimeTextInput("20");
liveCall("normalizeTimeTextInput", settleUnfinished);
const settleBlank = fakeTimeTextInput("   ");
liveCall("normalizeTimeTextInput", settleBlank);

// --- v0.8.11 H:MM hours display ----------------------------------------------
// The Hrs box is editable, so a rounded H:MM display could read back as a different stored
// number. An untouched box must return exactly what was stamped on it; an edited box must return
// what the operator typed.
const hoursUntouched = { value: "1:17", dataset: { hoursExact: "1.29" } };
const hoursEdited = { value: "1:30", dataset: { hoursExact: "1.29" } };
const hoursEmpty = { value: "", dataset: { hoursExact: "" } };
const hoursNoStamp = { value: "1:17", dataset: {} };
const hoursWriteBox = { value: "", dataset: {} };
liveCall("setHoursInputValue", hoursWriteBox, 1.28);
const hoursClearBox = { value: "9:99", dataset: { hoursExact: "3" } };
liveCall("setHoursInputValue", hoursClearBox, null);
// --- end live-code harness ---------------------------------------------------

const checks = [
  ["version and changed cache markers are v0.8.13", /const APP_VERSION = "v0\.8\.13"/.test(app) && /v0\.8\.13/.test(html) && /app\.js\?v=0\.8\.13/.test(html) && /sitescribe-add-data\.js\?v=0\.8\.13/.test(html) && /dropbox-sync-proof\.js\?v=0\.8\.13/.test(html) && /styles\.css\?v=0\.8\.13/.test(html) && /const MODULE_VERSION = "v0\.8\.13"/.test(addDataSource())],
  ["normalization preserves one activity level and discards a fourth", staged.packageType === "sitescribe_three_level_records" && activity.text === "Truck arrival" && Array.isArray(activity.activities) && activity.activities.length === 0],
  ["parser request explicitly permits only the capped third level", /capped three-level model/.test(request) && /Activity records must never contain children/.test(request) && /activities\[\]/.test(request)],
  ["B04 keeps operator instruction separate from source text", staged.source.rawText === rawText && staged.source.parserInstruction === instruction && staged.records[0].sourceText === rawText],
  ["B05 row bodies toggle their own branches while OPEN pills open record detail", /toggleSecondaryDisplay\(row\.dataset\.recordId\);/.test(app) && /toggleCommentActivityDisplay\(secondaryRow\.dataset\.recordId, secondaryRow\.dataset\.commentId\);/.test(app) && /data-action="open-primary"/.test(app) && /data-action="open-secondary"/.test(app) && /\.secondary-state-badge\[data-action\]\s*\{\s*pointer-events:\s*auto;/.test(css)],
  ["B05 primary, secondary, and activity OPEN controls share the compact oval pill treatment", /pill status-pill open-primary-pill/.test(app) && /pill status-pill open-secondary-pill/.test(app) && /pill status-pill open-activity-pill/.test(app) && /button\.pill\.status-pill/.test(css)],
  ["AI Report selector offers blank and site-specific saved-prompt prototypes", /value="blank">Blank custom report/.test(html) && /Saved prompts for this site/.test(html) && /schedule_delivery_status/.test(html) && /crane_window_readiness/.test(html) && /open_work_hours/.test(html) && /els\.aiReportMode\.value !== "none"/.test(app) && !/customAiReport.*fetch\(/.test(app)],
  ["closed secondary keeps its editor locked but restores Reopen/Delete controls under an open primary", /const statusControlsLocked = primaryLocked \|\| \(activityEditor && isCommentLocked\(parentComment\)\);/.test(app) && /locked && selectedComment/.test(app) && /secondary-locked-recovery-footer/.test(app) && /This record is closed\. Use Reopen below before editing\./.test(app) && /data-status="open">Reopen<\//.test(app) && /Only closed secondary records can be deleted/.test(app)],
  ["secondary detail has a full inline activity-entry composer instead of an Add Activity navigation pill", /function renderInlineActivityEntry/.test(app) && /id="activityEntryEditor"/.test(app) && /data-action="add-inline-activity"/.test(app) && /function addInlineActivity/.test(app) && !/data-action="start-activity">Add Activity<\//.test(app)],
  ["activity detail uses the existing secondary editor fields", /Add Activity/.test(app) && /Edit Activity Record/.test(app) && /data-new-activity/.test(app) && /targetIds\.newActivity\) return false/.test(app)],
  ["activity drag is capped within its own secondary", /kind: "activity"/.test(app) && /reorderActivityWithinComment/.test(app) && /targetActivityRow\.dataset\.commentId === payload\.commentId/.test(app)],
  ["reports traverse activities and use direct hours", /function reportChildRows/.test(app) && /parentComment: comment/.test(app) && /Totals use direct hours only/.test(app)],
  ["MDS and Hours exports keep activity context", /Activity: \$\{hoursReportSecondaryCellText/.test(app) && /row\.parentComment \?/.test(app)],
  ["closed secondary excludes activity report traversal", /if \(commentClosed\) return;/.test(app)],
  ["legacy two-level packages remain acceptable to parser validation", /sitescribe_two_level_records/.test(parserCore) && /sitescribe_three_level_records/.test(parserCore)],
  ["Dropbox post-update list protection remains", /listDropboxJsonFiles\(\{ client: dbx, afterSiteUpdate: true \}\)/.test(dropbox)],
  ["v0.8.9 partial End entry preserves the stored end time instead of deleting it", !!live && partialCase.endTime === "16:00" && partialCase.startTime === "15:00"],
  ["v0.8.9 partial End entry preserves stored direct hours", !!live && partialCase.totalHours === 1],
  ["v0.8.9 a deliberately cleared End box still clears the stored end time", !!live && !Object.prototype.hasOwnProperty.call(clearedCase, "endTime") && clearedCase.startTime === "15:00"],
  ["v0.8.9 partial Start entry preserves the stored start time", !!live && partialStartCase.startTime === "15:00" && partialStartCase.endTime === "16:00"],
  ["v0.8.9 inputEntryIsPartial separates a half-entered box from an empty one", safePartial(fakeTimeInput("", true, false)) === true && safePartial(fakeTimeInput("", false, false)) === false && safePartial(fakeTimeInput("16:00", false, false)) === false && safePartial(fakeTimeInput("", true, true)) === false && safePartial(null) === false],
  ["v0.8.9 editors carry the partial-entry flags through to the model write", /startTimePartial = inputEntryIsPartial\(startInput\)/.test(app) && /endTimePartial = inputEntryIsPartial\(endInput\)/.test(app) && /startTimePartial = inputEntryIsPartial\(document\.getElementById\("activityEntryStartTime"\)\)/.test(app) && /else if \(!fields\.endTimePartial\) delete comment\.endTime;/.test(app)],
  ["v0.8.9 a partly entered time does not register as an editor difference", /!draft\.startTimePartial && normalizeTimeInput\(comment\.startTime/.test(app) && /!draft\.endTimePartial && normalizeTimeInput\(comment\.endTime/.test(app)],
  ["v0.8.9 an incomplete time box is marked and explained in both editors", /id="commentTimeEntryNote"/.test(app) && /id="activityEntryTimeEntryNote"/.test(app) && /function updateEntryWarning/.test(app) && /refreshCommentEntryWarning\(\)/.test(app) && /refreshActivityEntryWarning\(\)/.test(app) && /time-input-incomplete/.test(css) && /\.time-entry-note/.test(css)],
  ["v0.8.9 closing a record commits pending editor edits before the status changes", (function () { const branch = app.slice(app.indexOf('if (action === "set-comment-status")')); const commit = branch.indexOf('if (nextStatus !== "open" && currentStatus !== nextStatus) {'); const stamp = branch.indexOf("applyStatusTimestamps(target, nextStatus)"); return commit > -1 && stamp > -1 && commit < stamp; })()],
  ["v0.8.9 partial Work Date entry preserves the stored work date", !!live && partialWorkDateCase.workDate === "2026-09-19"],
  ["v0.8.9 a deliberately cleared Work Date still clears the stored value", !!live && !Object.prototype.hasOwnProperty.call(clearedWorkDateCase, "workDate")],
  ["v0.8.9 editors carry the work-date partial flag and applyCommentTimeFields honours it", /workDatePartial = inputEntryIsPartial\(workDateInput\)/.test(app) && /workDatePartial = inputEntryIsPartial\(document\.getElementById\("activityEntryWorkDate"\)\)/.test(app) && /else if \(!fields\.workDatePartial\) delete comment\.workDate;/.test(app)],
  ["v0.8.9 a partly entered deliverable date holds the stored deliverable instead of clearing it", /partial: inputEntryIsPartial\(dateInput\)/.test(app) && /if \(next\.partial\) return false;/.test(app) && /if \(!draft\.deliverable \|\| !draft\.deliverable\.partial\) target\.deliverable = normalizeDeliverable/.test(app)],
  ["v0.8.9 a partly entered date does not register as an editor difference", /!draft\.workDatePartial && normalizeDateOnly\(comment\.workDate\)/.test(app) && /!\(draft\.deliverable && draft\.deliverable\.partial\) && !deliverableEquals/.test(app)],
  ["v0.8.9 date boxes route to the incomplete-entry warning", /target\.id === "commentWorkDate" \|\| target\.id === "commentDeliverableDate"/.test(app) && /target\.id === "activityEntryWorkDate"/.test(app) && /function refreshCommentEntryWarning/.test(app) && /function refreshActivityEntryWarning/.test(app)],
  ["v0.8.10 secondary and activity Start/End are typed text boxes, not locale time controls", /id="commentStartTime" type="text" inputmode="numeric" data-time-text="1"/.test(app) && /id="commentEndTime" type="text" inputmode="numeric" data-time-text="1"/.test(app) && /id="activityEntryStartTime" type="text" inputmode="numeric" data-time-text="1"/.test(app) && /id="activityEntryEndTime" type="text" inputmode="numeric" data-time-text="1"/.test(app) && !/id="[A-Za-z]+" type="time"/.test(app)],
  ["v0.8.10 Work Date and deliverable dates keep the native date control", /id="commentWorkDate" type="date"/.test(app) && /id="activityEntryWorkDate" type="date"/.test(app) && /DeliverableDate" type="date"/.test(app)],
  ["v0.8.10 a 24-hour time typed as 2000, 20:00 or 8:05 settles to HH:MM", !!live && liveCall("normalizeTimeInput", "2000") === "20:00" && liveCall("normalizeTimeInput", "20:00") === "20:00" && liveCall("normalizeTimeInput", "8:05") === "08:05" && liveCall("normalizeTimeInput", "805") === "08:05" && liveCall("normalizeTimeInput", "23:59") === "23:59" && liveCall("normalizeTimeInput", "2400") === "" && liveCall("normalizeTimeInput", "1999") === ""],
  ["v0.8.10 a half-typed time is unfinished, not a value and not a clear", !!live && liveCall("inputEntryIsPartial", fakeTimeTextInput("2")) === true && liveCall("inputEntryIsPartial", fakeTimeTextInput("20")) === true && liveCall("inputEntryIsPartial", fakeTimeTextInput("20:0")) === true && liveCall("inputEntryIsPartial", fakeTimeTextInput("2000")) === false && liveCall("inputEntryIsPartial", fakeTimeTextInput("20:00")) === false && liveCall("inputEntryIsPartial", fakeTimeTextInput("")) === false && liveCall("inputEntryIsPartial", fakeTimeTextInput("20", true)) === false],
  ["v0.8.10 an unfinished typed time still cannot delete a stored one", !!live && typedEndPartial === true && typedEndPartialCase.endTime === "16:00" && typedEndPartialCase.startTime === "15:00" && typedEndPartialCase.totalHours === 1],
  ["v0.8.10 exiting the box settles a complete time and leaves an unfinished one alone", settleCompleteHandled === true && settleComplete.value === "20:00" && settleUnfinished.value === "20" && settleBlank.value === "" && liveCall("normalizeTimeTextInput", fakeTimeInput("16:00", false, false)) === false],
  ["v0.8.10 blur and change settle the typed time before the commit reads the box", /function settleTimeTextEntry/.test(app) && /function handleDetailFocusOut\(event\) \{\s*const target = event\.target;\s*if \(!target\) return;[\s\S]{0,160}?settleTimeTextEntry\(target\);/.test(app) && /function handleDetailChange\(event\) \{\s*const target = event\.target;\s*if \(!target\) return;[\s\S]{0,160}?settleTimeTextEntry\(target\);/.test(app)],
  ["v0.8.10 24-hour hours arithmetic and the overnight wrap are unchanged", !!live && liveCall("calculateHoursFromTimes", "15:00", "16:00") === 1 && liveCall("calculateHoursFromTimes", "19:43", "21:00") === 1.28 && liveCall("calculateHoursFromTimes", "07:43", "21:00") === 13.28 && liveCall("calculateHoursFromTimes", "20:00", "02:00") === 6 && liveCall("calculateHoursFromTimes", "20", "21:00") === null],
  ["v0.8.11 both Hrs boxes are labelled Hrs hh:mm and carry the exact-value stamp", /<label>Hrs hh:mm <input id="commentTotalHours" type="text" inputmode="text" autocomplete="off" data-hours-exact=/.test(app) && /<label>Hrs hh:mm <input id="activityEntryTotalHours" type="text" inputmode="text" autocomplete="off" data-hours-exact=""/.test(app) && /value="\$\{escapeHtml\(formatHoursClock\(selectedComment\?\.totalHours\)\)\}"/.test(app)],
  ["v0.8.11 elapsed time renders as H:MM", !!live && liveCall("formatHoursClock", 1.28) === "1:17" && liveCall("formatHoursClock", 2) === "2:00" && liveCall("formatHoursClock", 1.25) === "1:15" && liveCall("formatHoursClock", 0.5) === "0:30" && liveCall("formatHoursClock", 13.28) === "13:17" && liveCall("formatHoursClock", null) === "" && liveCall("formatHoursClock", "") === ""],
  ["v0.8.11 the reported 07:43-09:00 case reads 1:17 rather than 1.28", !!live && liveCall("formatHoursClock", liveCall("calculateHoursFromTimes", "19:43", "21:00")) === "1:17" && liveCall("formatHoursClock", liveCall("calculateHoursFromTimes", "20:00", "21:00")) === "1:00"],
  ["v0.8.11 the Hrs box accepts H:MM and decimal, and a bare number stays decimal hours", !!live && liveCall("parseHoursInput", "1:17") === 1.28 && liveCall("parseHoursInput", "1.28") === 1.28 && liveCall("parseHoursInput", "2:00") === 2 && liveCall("parseHoursInput", "0:30") === 0.5 && liveCall("parseHoursInput", "130") === 130 && liveCall("parseHoursInput", "1:60") === null && liveCall("parseHoursInput", "-1") === null && liveCall("parseHoursInput", "") === null],
  ["v0.8.11 an untouched Hrs box returns the exact stored value, never the rounded display", !!live && liveCall("readHoursInputValue", hoursUntouched) === 1.29 && liveCall("readHoursInputValue", hoursEdited) === 1.5 && liveCall("readHoursInputValue", hoursEmpty) === null && liveCall("readHoursInputValue", hoursNoStamp) === 1.28 && liveCall("readHoursInputValue", null) === null],
  ["v0.8.11 writing a calculated value stamps the exact decimal beside it", hoursWriteBox.value === "1:17" && hoursWriteBox.dataset.hoursExact === "1.28" && hoursClearBox.value === "" && hoursClearBox.dataset.hoursExact === ""],
  ["v0.8.11 the Working Memory hours badge matches the editor box", /const hours = formatHoursClock\(comment && comment\.totalHours\);/.test(app) && /secondary-hours-label">Hours: /.test(app)],
  ["v0.8.11 reports, MDS billing and both Excel exports keep the decimal form", /report-total-hours">\$\{escapeHtml\(formatHoursInputValue\(total\)\)\} hrs/.test(app) && /Reg \$\{escapeHtml\(formatHoursInputValue\(regular\) \|\| "0"\)\} hrs/.test(app) && !/formatHoursClock/.test(fs.readFileSync("sitescribe-hours-excel.js", "utf8")) && !/formatHoursClock/.test(fs.readFileSync("sitescribe-mds-excel.js", "utf8"))],
  ["v0.8.11 the widened Hrs column and non-wrapping labels are in the stylesheet", /grid-template-columns: 104px 104px 84px 136px 76px auto/.test(css) && /white-space: nowrap;/.test(css)],
  ["v0.8.12 the B02 saved-site line reads the content date, not record.lastModified", /const contentUpdatedAt = savedSiteContentUpdatedAt\(record\);/.test(app) && /function savedSiteContentUpdatedAt/.test(app) && !/const contentUpdatedAt = record\.lastModified \|\| record\.processedAt/.test(app) && /archive-content-updated dropbox-file-meta dropbox-freshness-line">Content updated:/.test(app)],
  ["v0.8.12 a browsed-but-unedited site reports its content date, not its touch time", !!live && liveCall("savedSiteContentUpdatedAt", { lastModified: "2026-08-30T12:43:01.000Z", processedAt: "2026-08-01T00:00:00.000Z", data: { reviewConsole: { contentUpdatedAt: "2026-08-28T21:37:17.000Z" }, records: [] } }) === "2026-08-28T21:37:17.000Z"],
  ["v0.8.12 a legacy saved site with no stored stamp falls back to derivation then record dates", !!live && liveCall("savedSiteContentUpdatedAt", { lastModified: "2026-08-30T12:43:01.000Z", processedAt: "2026-08-01T00:00:00.000Z", data: { records: [{ createdAt: "2026-08-05T10:00:00.000Z", updatedAt: "2026-08-27T09:00:00.000Z", comments: [] }] } }) === "2026-08-27T09:00:00.000Z" && liveCall("savedSiteContentUpdatedAt", { lastModified: "2026-08-30T12:43:01.000Z", processedAt: "2026-08-01T00:00:00.000Z", data: { records: [] } }) === "2026-08-01T00:00:00.000Z" && liveCall("savedSiteContentUpdatedAt", { lastModified: "2026-08-30T12:43:01.000Z", data: {} }) === "2026-08-30T12:43:01.000Z" && liveCall("savedSiteContentUpdatedAt", null) === ""],
  ["v0.8.12 a real content edit still moves the B02 date", !!live && liveCall("savedSiteContentUpdatedAt", { lastModified: "2026-08-30T12:43:01.000Z", data: { reviewConsole: { contentUpdatedAt: "2026-08-30T11:00:00.000Z" }, records: [] } }) === "2026-08-30T11:00:00.000Z"],
  ["v0.8.12 markDirty view-state handling and the Dropbox freshness comparison are unchanged", /if \(options\.contentChanged !== false\) \{/.test(app) && /if \(currentPackageRecord\) currentPackageRecord\.lastModified = new Date\(\)\.toISOString\(\);/.test(app) && /contentChanged: false, reason: "secondary display toggled"/.test(app) && /const localTime = new Date\(active\.contentUpdatedAt \|\| ""\)\.getTime\(\);/.test(dropbox) && /label: "CURRENT"/.test(dropbox)],
  ["v0.8.13 portrait phones get a two-line secondary row scoped by orientation", /@media \(max-width: 640px\) and \(orientation: portrait\) \{[\s\S]*?\.secondary-record-line \{[\s\S]*?grid-template-columns: auto minmax\(0, 1fr\);/.test(css) && /@media \(max-width: 640px\) and \(orientation: portrait\) \{[\s\S]*?\.secondary-record-line \.record-right \{[\s\S]*?grid-column: 2;[\s\S]*?width: 100%;/.test(css)],
  ["v0.8.13 the single-line layout survives for landscape, desktop and primary rows", /\.secondary-record-line \{\s*grid-template-columns: auto minmax\(0, 1fr\) auto;/.test(css) && !/\.record-line \{[^}]*grid-column: 2;/.test(css) && (css.match(/orientation: portrait/g) || []).length === 1],
  ["v0.8.13 is a stylesheet-only change: row markup and rendering are untouched", /<div class="\$\{rowClass\}" \$\{dataAttrs\}>/.test(app) && /<div class="record-right \$\{options\.rightClass \|\| ""\}">/.test(app) && /classes: "secondary-record-line"/.test(app) && /classes: "activity-record-line secondary-record-line"/.test(app) && /rightHtml: `\$\{secondaryHoursBadgeHtml\(comment\)\}/.test(app)],
  ["v0.8.13 the hours badge and work date are still rendered, not removed", /function secondaryHoursBadgeHtml/.test(app) && /secondary-hours-label">Hours: /.test(app) && /meta: compactDate/.test(app) && /const compactDate = formatShortDate\(secondaryCollapsedDisplayDate\(comment\)\)/.test(app)],
  ["B04 append remains operator-initiated", /Append \$\{count\} Accepted Record/.test(addDataSource()) && /Nothing enters Working Memory until Append Accepted Records is pressed/.test(addDataSource())]
];

function addDataSource() { return fs.readFileSync("sitescribe-add-data.js", "utf8"); }
if (harnessError) console.log(`NOTE live-code harness unavailable: ${harnessError}`);
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
