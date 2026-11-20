#!/usr/bin/env node
/* Focused v0.7.16 MDS Billing closed-record exclusion check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const reportGroups = app.match(/function reportSelectionGroups\(filters\) \{[\s\S]*?\n\}/)?.[0] || "";
const checks = [
  ["version is v0.7.16", /const APP_VERSION = "v0\.7\.16"/.test(app) && /v0\.7\.16/.test(html)],
  ["closed primary records are excluded from MDS billing rows", /filters\.type === "mds" && normalizeLegacyStatus\(record\.status\) === "closed"/.test(reportGroups)],
  ["closed secondary records are excluded from MDS billing rows", /filters\.type === "mds" && normalizeLegacyStatus\(comment\.status\) === "closed"/.test(reportGroups)],
  ["MDS screen and Excel share the filtered row collector", /function renderMdsBillingReport[\s\S]*?collectHoursReportRows\(records, filters\)/.test(app) && /async function exportMdsReportExcel[\s\S]*?collectHoursReportRows\(getHoursReportSourceRecords\(filters\), filters\)/.test(app)],
  ["normal Hours Report still uses the shared collector without a closed-only override", /function renderHoursReport[\s\S]*?collectHoursReportRows\(records, filters\)/.test(app)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
