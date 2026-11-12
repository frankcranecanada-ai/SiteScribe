#!/usr/bin/env node
/* Focused v0.7.26 B02 compact action-grid regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const archiveStart = app.indexOf("function renderArchive(records)");
const archiveEnd = app.indexOf("function handleSavedSitesDragStart", archiveStart);
const archiveRenderer = archiveStart >= 0 && archiveEnd > archiveStart ? app.slice(archiveStart, archiveEnd) : "";
const checks = [
  ["version is v0.7.26", /const APP_VERSION = "v0\.7\.26"/.test(app) && /v0\.7\.26/.test(html)],
  ["B02 retains compact title and Content updated line", /const title = \[record\.site, record\.shiftDate\]/.test(archiveRenderer) && /archive-content-updated">Content updated:/.test(archiveRenderer)],
  ["B02 retains all four actions", /data-action="open-package"/.test(archiveRenderer) && /data-action="open-package-contacts"/.test(archiveRenderer) && /data-action="export-package"/.test(archiveRenderer) && /data-action="delete-package"/.test(archiveRenderer)],
  ["B02 action rail is a two-column grid", /\.archive-list \.archive-actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(2, max-content\)/.test(css)],
  ["B02 row and list spacing are tightened", /\.archive-list:not\(\.empty\)\s*\{[\s\S]*?gap:\s*5px/.test(css) && /\.archive-list \.archive-item\s*\{[\s\S]*?padding:\s*6px 7px/.test(css)],
  ["B02 action pills are compact", /\.archive-list \.archive-actions button\s*\{[\s\S]*?padding:\s*4px 8px;[\s\S]*?font-size:\s*0\.70rem/.test(css)],
  ["B02 active OPENED badge remains", /active-site-badge">OPENED/.test(archiveRenderer)],
  ["new secondary Reg default remains protected", /function commentEditorBillingType/.test(app) && /: "regular"/.test(app)],
  ["landscape report scrolling repair remains present", /@media \(orientation: landscape\) and \(max-height: 600px\)/.test(css)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
