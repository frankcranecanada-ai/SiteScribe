#!/usr/bin/env node
/* Focused v0.7.09 site-scoped contact-copy regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const checks = [
  ["version is v0.7.09", /const APP_VERSION = "v0\.7\.09"/.test(app) && /v0\.7\.09/.test(html)],
  ["source list is built per saved site", /function buildContactPrefillSources/.test(app) && /contactsByPerson/.test(app)],
  ["current site is excluded as a source", /filter\(record => String\(record\?\.id \|\| ""\)\.trim\(\) !== currentId\)/.test(app)],
  ["blank contact has a source-site selection", /data-communication-action="prefill-source-site"/.test(app) && /Source site/.test(app)],
  ["contact selector waits for source site", /Choose a source site first/.test(app) && /selectedSource \? "" : "disabled"/.test(app)],
  ["contact selection copies the complete contact detail set", /contact\.email = String\(source\.email/.test(app) && /contact\.phone = String\(source\.phone/.test(app) && /contact\.role = String\(source\.role/.test(app) && /contact\.aliases = normalizeNameList\(source\.aliases\)/.test(app)],
  ["copy remains unlinked and site-specific", /contactPrefillSelections\.delete\(contact\.id\)/.test(app) && /Later edits do not affect the source site/.test(app)],
  ["two-step picker is mobile friendly", /\.contact-prefill \{ display: grid; grid-template-columns: repeat\(2/.test(css) && /\.contact-prefill \{ grid-template-columns: 1fr; \}/.test(css)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
if (failed.length) process.exit(1);
