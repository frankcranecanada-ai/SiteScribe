#!/usr/bin/env node
/* Focused v0.7.25 B02 Saved Sites compact-row regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const archiveStart = app.indexOf("function renderArchive(records)");
const archiveEnd = app.indexOf("function handleSavedSitesDragStart", archiveStart);
const archiveRenderer = archiveStart >= 0 && archiveEnd > archiveStart ? app.slice(archiveStart, archiveEnd) : "";
const checks = [
  ["version is v0.7.25", /const APP_VERSION = "v0\.7\.25"/.test(app) && /v0\.7\.25/.test(html)],
  ["B02 title uses site and date as one compact file title", /const title = \[record\.site, record\.shiftDate\]\.filter\(Boolean\)\.join\(" — "\)/.test(archiveRenderer)],
  ["B02 shows one Content updated line", /archive-content-updated">Content updated:/.test(archiveRenderer)],
  ["B02 no longer renders the verbose status summary", !/record\.statusSummary/.test(archiveRenderer)],
  ["B02 preserves its active OPENED badge", /active-site-badge">OPENED/.test(archiveRenderer)],
  ["B02 preserves OPEN, Contacts, Export, and Delete actions", /data-action="open-package"/.test(archiveRenderer) && /data-action="open-package-contacts"/.test(archiveRenderer) && /data-action="export-package"/.test(archiveRenderer) && /data-action="delete-package"/.test(archiveRenderer)],
  ["B02 rows use compact two-column file-row layout", /\.archive-list \.archive-item\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto/.test(css)],
  ["B02 controls remain in a right-side vertical action rail", /\.archive-list \.archive-actions\s*\{[\s\S]*?flex-direction:\s*column/.test(css)],
  ["new secondary Reg default remains protected", /function commentEditorBillingType/.test(app) && /: "regular"/.test(app)],
  ["landscape report scrolling repair remains present", /@media \(orientation: landscape\) and \(max-height: 600px\)/.test(css)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
