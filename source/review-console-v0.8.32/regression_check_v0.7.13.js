#!/usr/bin/env node
/* Focused v0.7.13 email-activity reset regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const checks = [
  ["version is v0.7.13", /const APP_VERSION = "v0\.7\.13"/.test(app) && /v0\.7\.13/.test(html)],
  ["Email Activity has an explicit Clear Activity control", /id="clearCommunicationActivityButton"/.test(html)],
  ["Clear Activity requires confirmation", /function clearEmailActivityLog\(\)[\s\S]*window\.confirm/.test(app)],
  ["Clear Activity clears only the email log", /currentPackage\.emailActivityLog = \[\]/.test(app) && /does not delete records, email-draft secondary items, contacts, or reports/.test(app)],
  ["Clear Activity is persisted immediately", /forceAutoSaveNow\("email activity log cleared"\)/.test(app)],
  ["Mark Sent still alone closes an email-draft secondary", /function markSelectedEmailActionSent[\s\S]*applyStatusTimestamps\(selected\.comment, "closed"\)/.test(app)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
if (failed.length) process.exit(1);
