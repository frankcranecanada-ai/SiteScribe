#!/usr/bin/env node
/* Focused v0.7.11 parse-email review and communication-report regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const parser = fs.readFileSync("sitescribe-add-data.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const checks = [
  ["version is v0.7.11", /const APP_VERSION = "v0\.7\.11"/.test(app) && /v0\.7\.11/.test(html)],
  ["Communication Activity Report is selectable", /value="email_activity">Communication Activity Report/.test(html) && /function renderCommunicationActivityReport\(/.test(app)],
  ["activity report uses the active site's embedded log", /normalizeEmailActivityLog\(currentPackage\?\.emailActivityLog\)/.test(app)],
  ["activity report is date-range filtered", /function getEmailActivityReportEntries\(filters = getReportFilters\(\)\)/.test(app) && /dateFromIso\(entry\.timestamp\)/.test(app)],
  ["activity report does not apply record-only categories/status", /group\.hidden = activityOnly/.test(app) && /statuses: activityOnly \? "All activity"/.test(app)],
  ["selected parser emails remain explicit", /Create draft \(unchecked by default\)/.test(parser) && /state\.selectedEmailKeys/.test(parser)],
  ["selected draft opens for user review after append", /focusFirstSelectedEmailDraft/.test(app) && /The first selected email draft is now open for review/.test(parser)],
  ["editable draft still requires user to open mail", /OPEN IN EMAIL APP/.test(app) && /SiteScribe prepares this draft but does not send it/.test(app)],
  ["email activity remains site-embedded", /currentPackage\.emailActivityLog\.push/.test(app)],
  ["Contacts backdrop remains inert", !/communicationSetupPanel\) els\.communicationSetupPanel\.addEventListener\("click"/.test(app)],
  ["Contacts Close retains the unsaved-change safeguard", /function closeCommunicationSetupPanel\(\) \{\s*if \(communicationSetupDirty && !window\.confirm\("Discard unsaved Communication Setup changes\?"\)\) return;/.test(app)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
if (failed.length) process.exit(1);
