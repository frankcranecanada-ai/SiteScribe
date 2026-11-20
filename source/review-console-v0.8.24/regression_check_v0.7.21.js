#!/usr/bin/env node
/* Focused v0.7.21 compact secondary Work Date display regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const editorHelper = app.match(/function commentEditorWorkDate\(comment, parentRecord\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
const displayHelper = app.match(/function secondaryCollapsedDisplayDate\(comment\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
const compactMetaStart = app.indexOf("function updateTimeMetaHtml(comment)");
const compactMetaEnd = app.indexOf("function applyStatusTimestamps", compactMetaStart);
const compactMeta = compactMetaStart >= 0 && compactMetaEnd > compactMetaStart ? app.slice(compactMetaStart, compactMetaEnd) : "";
const checks = [
  ["version is v0.7.21", /const APP_VERSION = "v0\.7\.21"/.test(app) && /v0\.7\.21/.test(html)],
  ["compact display chooses Work Date first", /normalizeDateOnly\(comment\?\.workDate\)/.test(displayHelper)],
  ["compact display falls back to Created Date", displayHelper.indexOf("dateFromIso(comment?.createdAt)") > 0],
  ["compact display only uses Updated Date after Created Date", displayHelper.indexOf("dateFromIso(comment?.updatedAt)") > displayHelper.indexOf("dateFromIso(comment?.createdAt)")],
  ["compact secondary rows use the display-date helper", /formatShortDate\(secondaryCollapsedDisplayDate\(comment\)\)/.test(compactMeta)],
  ["mobile compact date uses the same display date", /const mobile = displayDate/.test(compactMeta)],
  ["existing editor Work Date fallback remains protected", /normalizeDateOnly\(comment\.workDate\)/.test(editorHelper) && editorHelper.indexOf("dateFromIso(comment.createdAt)") > 0],
  ["reports retain the same Work Date then Created Date rule", /normalizeDateOnly\(comment\?\.workDate\) \|\| dateFromIso\(comment\?\.createdAt\)/.test(app)],
  ["v0.7.19 report sorting remains present", /id="reportSortOrder"/.test(html) && /function resolvedReportSortOrder/.test(app)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)],
  ["CSS integrity safeguard remains", /\.site-walk-panel\s*\{[^}]*overflow:\s*hidden/.test(css)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
