#!/usr/bin/env node
/* Focused v0.7.22 primary-screen secondary-date regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const helper = app.match(/function secondaryCollapsedDisplayDate\(comment\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
const inlineStart = app.indexOf("function renderInlineSecondaryRecord(record, comment)");
const inlineEnd = app.indexOf("function renderDetail", inlineStart);
const inlineRenderer = inlineStart >= 0 && inlineEnd > inlineStart ? app.slice(inlineStart, inlineEnd) : "";
const checks = [
  ["version is v0.7.22", /const APP_VERSION = "v0\.7\.22"/.test(app) && /v0\.7\.22/.test(html)],
  ["secondary display date chooses Work Date first", /normalizeDateOnly\(comment\?\.workDate\)/.test(helper)],
  ["secondary display date falls back to Created Date", helper.indexOf("dateFromIso(comment?.createdAt)") > 0],
  ["primary-screen inline secondary rows resolve the compact date", /const compactDate = formatShortDate\(secondaryCollapsedDisplayDate\(comment\)\)/.test(inlineRenderer)],
  ["primary-screen inline secondary rows render the compact date in the right rail", /meta: compactDate/.test(inlineRenderer)],
  ["inline date is date-only", !/formatShortDateTime\(comment/.test(inlineRenderer)],
  ["detail compact rows retain the shared display-date helper", /formatShortDate\(secondaryCollapsedDisplayDate\(comment\)\)/.test(app)],
  ["v0.7.20 editor fallback remains protected", /function commentEditorWorkDate/.test(app) && /dateFromIso\(comment.createdAt\)/.test(app)],
  ["report sorting remains present", /id="reportSortOrder"/.test(html) && /function resolvedReportSortOrder/.test(app)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)],
  ["compact-row layout retains a right-aligned secondary rail", /\.secondary-record-line \.record-right\s*\{[\s\S]*?justify-content:\s*flex-end/.test(css)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
