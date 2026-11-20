#!/usr/bin/env node
/* Focused v0.7.23 landscape phone reports scrolling regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const landscapeStart = css.indexOf("@media (orientation: landscape) and (max-height: 600px) and (max-width: 900px)");
const landscapeEnd = css.indexOf("@media print", landscapeStart);
const landscapeRule = landscapeStart >= 0 && landscapeEnd > landscapeStart ? css.slice(landscapeStart, landscapeEnd) : "";
const checks = [
  ["version is v0.7.23", /const APP_VERSION = "v0\.7\.23"/.test(app) && /v0\.7\.23/.test(html)],
  ["landscape phone rule is present", landscapeRule.length > 0],
  ["landscape report overlay can scroll vertically", /\.reports-panel\s*\{[\s\S]*?overflow-y:\s*auto/.test(landscapeRule)],
  ["landscape report card no longer traps vertical content", /\.reports-card\s*\{[\s\S]*?min-height:\s*auto;[\s\S]*?max-height:\s*none;[\s\S]*?overflow:\s*visible/.test(landscapeRule)],
  ["wide Hours and MDS table surface preserves horizontal scrolling", /\.hours-detail-scroll\s*\{[\s\S]*?overflow-x:\s*auto !important;[\s\S]*?touch-action:\s*pan-x pan-y/.test(landscapeRule)],
  ["Hours table remains independently scrollable", /\.hours-detail-scroll\s*\{[\s\S]*?overflow-x:\s*scroll/.test(css) && /min-width:\s*1040px/.test(css)],
  ["detail Work Date display remains protected", /function secondaryCollapsedDisplayDate/.test(app) && /formatShortDate\(secondaryCollapsedDisplayDate\(comment\)\)/.test(app)],
  ["editor Work Date fallback remains protected", /function commentEditorWorkDate/.test(app) && /dateFromIso\(comment.createdAt\)/.test(app)],
  ["report date sorting remains present", /id="reportSortOrder"/.test(html) && /function resolvedReportSortOrder/.test(app)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
