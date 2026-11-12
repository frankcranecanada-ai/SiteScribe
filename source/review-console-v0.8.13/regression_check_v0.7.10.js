#!/usr/bin/env node
/* Focused v0.7.10 Contacts / Departments backdrop-safety regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const checks = [
  ["version is v0.7.10", /const APP_VERSION = "v0\.7\.10"/.test(app) && /v0\.7\.10/.test(html)],
  ["Contacts / Departments retains its explicit Close pill", /id="closeCommunicationSetupButton"[^>]*>Close</.test(html) && /closeCommunicationSetupButton\) els\.closeCommunicationSetupButton\.addEventListener\("click", closeCommunicationSetupPanel\)/.test(app)],
  ["Contacts / Departments backdrop has no close-on-outside-click handler", !/communicationSetupPanel\) els\.communicationSetupPanel\.addEventListener\("click"/.test(app)],
  ["Close keeps the unsaved-change safeguard", /function closeCommunicationSetupPanel\(\) \{\s*if \(communicationSetupDirty && !window\.confirm\("Discard unsaved Communication Setup changes\?"\)\) return;/.test(app)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
if (failed.length) process.exit(1);
