#!/usr/bin/env node
/* Focused v0.7.12 secondary-editor backdrop safety regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const checks = [
  ["version is v0.7.12", /const APP_VERSION = "v0\.7\.12"/.test(app) && /v0\.7\.12/.test(html)],
  ["secondary editor Close pill remains wired", /els\.closeDetailButton\.addEventListener\("click", closeDetail\)/.test(app)],
  ["secondary editor backdrop is inert", !/els\.detailPanel\.addEventListener\("click"/.test(app)],
  ["Contacts backdrop remains inert", !/communicationSetupPanel\) els\.communicationSetupPanel\.addEventListener\("click"/.test(app)],
  ["secondary field commits still run on leaving a field", /els\.detailContent\.addEventListener\("focusout", handleDetailFocusOut\)/.test(app)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
if (failed.length) process.exit(1);
