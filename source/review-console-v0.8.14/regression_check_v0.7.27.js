#!/usr/bin/env node
/* Focused v0.7.27 B02 / B01 file-information hierarchy regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const archiveStart = app.indexOf("function renderArchive(records)");
const archiveEnd = app.indexOf("function handleSavedSitesDragStart", archiveStart);
const archiveRenderer = archiveStart >= 0 && archiveEnd > archiveStart ? app.slice(archiveStart, archiveEnd) : "";
const checks = [
  ["version is v0.7.27", /const APP_VERSION = "v0\.7\.27"/.test(app) && /v0\.7\.27/.test(html)],
  ["B02 title is the saved site name only", /const title = String\(record\.site \|\| ""\)\.trim\(\) \|\| "Unnamed SiteScribe site";/.test(archiveRenderer)],
  ["B02 title uses the B01 Dropbox file-name treatment", /archive-title dropbox-file-name/.test(archiveRenderer)],
  ["B02 shows one B01-style Content updated line", /archive-content-updated dropbox-file-meta dropbox-freshness-line">Content updated:/.test(archiveRenderer)],
  ["B02 normal row does not display its shift date or status summary", !/\[record\.site, record\.shiftDate\]/.test(archiveRenderer) && !/statusSummary/.test(archiveRenderer)],
  ["B02 retains OPENED state and all four local actions", /active-site-badge">OPENED/.test(archiveRenderer) && /data-action="open-package"/.test(archiveRenderer) && /data-action="open-package-contacts"/.test(archiveRenderer) && /data-action="export-package"/.test(archiveRenderer) && /data-action="delete-package"/.test(archiveRenderer)],
  ["B02 action rail remains a compact two-column grid", /\.archive-list \.archive-actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(2, max-content\)/.test(css)],
  ["new secondary Reg default remains protected", /function commentEditorBillingType/.test(app) && /: "regular"/.test(app)],
  ["landscape report scrolling repair remains present", /@media \(orientation: landscape\) and \(max-height: 600px\)/.test(css)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
