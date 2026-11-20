#!/usr/bin/env node
/* Focused v0.7.24 new-secondary Reg billing default regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const editorBillingHelper = app.match(/function commentEditorBillingType\(comment\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
const renderStart = app.indexOf("function renderDetail(openPanel = true)");
const renderEnd = app.indexOf("function focusNewSecondaryRecordEditor", renderStart);
const editorRender = renderStart >= 0 && renderEnd > renderStart ? app.slice(renderStart, renderEnd) : "";
const resetStart = app.indexOf("setTimeout(() => {", app.indexOf("function saveNewComment"));
const resetEnd = app.indexOf("function getCommentEditorTargetIds", resetStart);
const newEntryReset = resetStart >= 0 && resetEnd > resetStart ? app.slice(resetStart, resetEnd) : "";
const checks = [
  ["version is v0.7.24", /const APP_VERSION = "v0\.7\.24"/.test(app) && /v0\.7\.24/.test(html)],
  ["new editor defaults billing to Reg", /return comment \? commentBillingType\(comment\) : "regular"/.test(editorBillingHelper)],
  ["existing editor records retain their saved billing code", /comment \? commentBillingType\(comment\)/.test(editorBillingHelper)],
  ["billing select uses the dedicated editor default", /commentEditorBillingType\(selectedComment\) === "regular"/.test(editorRender)],
  ["new-entry reset restores Reg", /billingTypeInput\) billingTypeInput\.value = "regular"/.test(newEntryReset)],
  ["billing persistence remains unchanged", /if \(billingType\) comment\.billingType = billingType/.test(app)],
  ["expense field behavior remains protected", /const isExpense = normalizeBillingType\(billingTypeInput\?\.value\) === "expense"/.test(app)],
  ["Work Date fallback remains protected", /function commentEditorWorkDate/.test(app) && /dateFromIso\(comment.createdAt\)/.test(app)],
  ["landscape report scrolling repair remains present", /@media \(orientation: landscape\) and \(max-height: 600px\)/.test(css)],
  ["MDS report sorting remains connected", /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
