#!/usr/bin/env node
/* Focused v0.7.20 secondary Work Date fallback regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const helper = app.match(/function commentEditorWorkDate\(comment, parentRecord\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
const checks = [
  ["version is v0.7.20", /const APP_VERSION = "v0\.7\.20"/.test(app) && /v0\.7\.20/.test(html)],
  ["existing Work Date remains first priority", /normalizeDateOnly\(comment\.workDate\)/.test(helper)],
  ["legacy record falls back to Created Date before Updated Date", helper.indexOf("dateFromIso(comment.createdAt)") > 0 && helper.indexOf("dateFromIso(comment.updatedAt)") > helper.indexOf("dateFromIso(comment.createdAt)")],
  ["parent record date is a later fallback", helper.indexOf("recordReportDate(parentRecord)") > helper.indexOf("dateFromIso(comment.updatedAt)")],
  ["today is reserved for new or completely undated records", /if \(!comment\) return todayString\(\)/.test(helper) && helper.trim().endsWith("}") && /\|\| todayString\(\);/.test(helper)],
  ["editor uses the dedicated fallback helper", /id="commentWorkDate"[\s\S]*?commentEditorWorkDate\(selectedComment, record\)/.test(app)],
  ["new-entry reset still uses today", /if \(workDateInput\) workDateInput\.value = todayString\(\)/.test(app)],
  ["workDate persistence remains present", /if \(workDate\) comment\.workDate = workDate/.test(app)],
  ["report Work Date fallback remains present", /normalizeDateOnly\(comment\?\.workDate\) \|\| dateFromIso\(comment\?\.createdAt\)/.test(app)],
  ["v0.7.19 report sorting remains present", /id="reportSortOrder"/.test(html) && /function resolvedReportSortOrder/.test(app)],
  ["report sorting retains primary and secondary date helpers", /sortReportPrimaryRecords\(workingRecords, filters\)/.test(app) && /return sortReportSecondaryRows\(selected, filters\)/.test(app)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)],
  ["CSS integrity safeguard remains", /\.site-walk-panel\s*\{[^}]*overflow:\s*hidden/.test(css)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
