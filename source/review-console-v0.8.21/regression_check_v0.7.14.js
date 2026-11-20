#!/usr/bin/env node
/* Focused v0.7.14 email-activity record detail regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const checks = [
  ["version is v0.7.14", /const APP_VERSION = "v0\.7\.14"/.test(app) && /v0\.7\.14/.test(html)],
  ["new activity captures parent record and draft text", /parentRecordSummary: record\.description, messagePreview: action\.body/.test(app)],
  ["activity log uses collapsed expandable records", /<details class="communication-activity-entry">/.test(app) && /renderCommunicationActivityEntry/.test(app)],
  ["expanded entry identifies primary record", /Primary record:/.test(app) && /resolveEmailActivityRecordContext/.test(app)],
  ["expanded entry shows email text preview", /Email text:/.test(app) && /activityPreview\(context\.messagePreview, 900\)/.test(app)],
  ["communication report includes record and email preview", /Primary record: \$\{escapeHtml\(context\.parentRecordSummary\)\}/.test(app) && /Email preview:/.test(app)],
  ["collapsed activity card styling is present", /\.communication-activity-entry > summary/.test(css)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
