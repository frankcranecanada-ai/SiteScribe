#!/usr/bin/env node
/* Focused v0.8.6 custom-AI-report prompt-library prototype regression check. */
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

const checks = [
  ["version and changed cache markers are v0.8.6", /const APP_VERSION = "v0\.8\.6"/.test(app) && /v0\.8\.6/.test(html) && /app\.js\?v=0\.8\.6/.test(html) && /sitescribe-add-data\.js\?v=0\.8\.6/.test(html) && /dropbox-sync-proof\.js\?v=0\.8\.6/.test(html) && /styles\.css\?v=0\.8\.6/.test(html) && /const MODULE_VERSION = "v0\.8\.6"/.test(addDataSource())],
  ["normalization preserves one activity level and discards a fourth", staged.packageType === "sitescribe_three_level_records" && activity.text === "Truck arrival" && Array.isArray(activity.activities) && activity.activities.length === 0],
  ["parser request explicitly permits only the capped third level", /capped three-level model/.test(request) && /Activity records must never contain children/.test(request) && /activities\[\]/.test(request)],
  ["B04 keeps operator instruction separate from source text", staged.source.rawText === rawText && staged.source.parserInstruction === instruction && staged.records[0].sourceText === rawText],
  ["B05 row bodies toggle their own branches while OPEN pills open record detail", /toggleSecondaryDisplay\(row\.dataset\.recordId\);/.test(app) && /toggleCommentActivityDisplay\(secondaryRow\.dataset\.recordId, secondaryRow\.dataset\.commentId\);/.test(app) && /data-action="open-primary"/.test(app) && /data-action="open-secondary"/.test(app) && /\.secondary-state-badge\[data-action\]\s*\{\s*pointer-events:\s*auto;/.test(css)],
  ["B05 primary, secondary, and activity OPEN controls share the compact oval pill treatment", /pill status-pill open-primary-pill/.test(app) && /pill status-pill open-secondary-pill/.test(app) && /pill status-pill open-activity-pill/.test(app) && /button\.pill\.status-pill/.test(css)],
  ["AI Report selector offers blank and site-specific saved-prompt prototypes", /value="blank">Blank custom report/.test(html) && /Saved prompts for this site/.test(html) && /schedule_delivery_status/.test(html) && /crane_window_readiness/.test(html) && /open_work_hours/.test(html) && /els\.aiReportMode\.value !== "none"/.test(app) && !/customAiReport.*fetch\(/.test(app)],
  ["secondary detail has a full inline activity-entry composer instead of an Add Activity navigation pill", /function renderInlineActivityEntry/.test(app) && /id="activityEntryEditor"/.test(app) && /data-action="add-inline-activity"/.test(app) && /function addInlineActivity/.test(app) && !/data-action="start-activity">Add Activity<\//.test(app)],
  ["activity detail uses the existing secondary editor fields", /Add Activity/.test(app) && /Edit Activity Record/.test(app) && /data-new-activity/.test(app) && /targetIds\.newActivity\) return false/.test(app)],
  ["activity drag is capped within its own secondary", /kind: "activity"/.test(app) && /reorderActivityWithinComment/.test(app) && /targetActivityRow\.dataset\.commentId === payload\.commentId/.test(app)],
  ["reports traverse activities and use direct hours", /function reportChildRows/.test(app) && /parentComment: comment/.test(app) && /Totals use direct hours only/.test(app)],
  ["MDS and Hours exports keep activity context", /Activity: \$\{hoursReportSecondaryCellText/.test(app) && /row\.parentComment \?/.test(app)],
  ["closed secondary excludes activity report traversal", /if \(commentClosed\) return;/.test(app)],
  ["legacy two-level packages remain acceptable to parser validation", /sitescribe_two_level_records/.test(parserCore) && /sitescribe_three_level_records/.test(parserCore)],
  ["Dropbox post-update list protection remains", /listDropboxJsonFiles\(\{ client: dbx, afterSiteUpdate: true \}\)/.test(dropbox)],
  ["B04 append remains operator-initiated", /Append \$\{count\} Accepted Record/.test(addDataSource()) && /Nothing enters Working Memory until Append Accepted Records is pressed/.test(addDataSource())]
];

function addDataSource() { return fs.readFileSync("sitescribe-add-data.js", "utf8"); }
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
