#!/usr/bin/env node
/* Focused v0.7.19 report date-ordering regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const tooltipRule = css.match(/#listDropboxFilesButton\.desktop-tooltip::after\s*\{[\s\S]*?\}/)?.[0] || "";

const checks = [
  ["version is v0.7.19", /const APP_VERSION = "v0\.7\.19"/.test(app) && /v0\.7\.19/.test(html)],
  ["report Date Order selector has all choices", /id="reportSortOrder"/.test(html) && /value="default"/.test(html) && /value="date_asc"/.test(html) && /value="date_desc"/.test(html)],
  ["sort selector is cached and observed", /"reportSortOrder"/.test(app) && /els\.reportSortOrder/.test(app)],
  ["report defaults are explicit", /filters\.type === "open"\) return "priority"/.test(app) && /filters\.type === "email_activity"\) return "date_desc"/.test(app) && /return "date_asc"/.test(app)],
  ["primary report date prefers Created Date", /return dateFromIso\(record\?\.createdAt\) \|\| dateFromIso\(record\?\.updatedAt\) \|\| record\?\.sourceDate \|\| record\?\.sourceLogDate/.test(app)],
  ["secondary report date prefers Work Date", /return normalizeDateOnly\(comment\?\.workDate\) \|\| dateFromIso\(comment\?\.createdAt\)/.test(app)],
  ["primary and secondary sort helpers are used", /sortReportPrimaryRecords\(workingRecords, filters\)/.test(app) && /sortReportSecondaryRows\(sortSecondaryRecordsForRecord\(record\)/.test(app)],
  ["Hours and MDS rows share secondary sorting", /return sortReportSecondaryRows\(selected, filters\)/.test(app)],
  ["report header states effective date order", /reportHeaderItem\("Date Order", meta\.order\)/.test(app) && /secondary Work Date \(Created Date fallback\)/.test(app)],
  ["MDS export receives and applies sort order", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds) && /sortOrder === "date_desc"/.test(mds)],
  ["sorting does not mutate record arrays", /return \[\.\.\.records\]\.sort/.test(app) && /return \[\.\.\.rows\]\.sort/.test(app)],
  ["v0.7.18 Dropbox tooltip safeguard remains", /left:\s*0/.test(tooltipRule) && /translate\(0,\s*3px\)/.test(tooltipRule) && /\.site-walk-panel\s*\{[^}]*overflow:\s*hidden/.test(css)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
