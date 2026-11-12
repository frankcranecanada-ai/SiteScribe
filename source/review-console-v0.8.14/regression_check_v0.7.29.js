#!/usr/bin/env node
/* Focused v0.7.29 iPhone promotion-zone regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const promotionStart = app.indexOf("function isPromoteSecondaryDrop(event, payload)");
const promotionEnd = app.indexOf("function promoteCommentToPrimaryRecord", promotionStart);
const promotionHelper = promotionStart >= 0 && promotionEnd > promotionStart ? app.slice(promotionStart, promotionEnd) : "";
const primaryStart = app.indexOf("function renderRecordLine(record)");
const primaryEnd = app.indexOf("function formatPrimaryRecordForClipboard", primaryStart);
const primaryRenderer = primaryStart >= 0 && primaryEnd > primaryStart ? app.slice(primaryStart, primaryEnd) : "";
const secondaryStart = app.indexOf("function renderInlineSecondaryRecord(record, comment)");
const secondaryEnd = app.indexOf("function renderDetail", secondaryStart);
const secondaryRenderer = secondaryStart >= 0 && secondaryEnd > secondaryStart ? app.slice(secondaryStart, secondaryEnd) : "";
const checks = [
  ["version is v0.7.29", /const APP_VERSION = "v0\.7\.29"/.test(app) && /v0\.7\.29/.test(html) && /app\.js\?v=0\.7\.29/.test(html)],
  ["iPhone clientX zero cannot trigger the promotion target", /Number\.isFinite\(clientX\) \|\| clientX <= 0\) return false;/.test(promotionHelper)],
  ["promotion requires the narrow primary-alignment edge", /leftEdgeAllowance = Math\.min\(16, Math\.max\(8, secondaryLeft - primaryLeft - 4\)\)/.test(promotionHelper) && /clientX <= primaryLeft \+ leftEdgeAllowance/.test(promotionHelper)],
  ["the old broad 42px promotion zone is absent", !/primaryLeft \+ 42/.test(promotionHelper)],
  ["primary and secondary rows retain labelled six-dot grips", /record-drag-grip/.test(primaryRenderer) && /Drag to reorder or move/.test(primaryRenderer) && /record-drag-grip/.test(secondaryRenderer) && /Drag to reorder or move/.test(secondaryRenderer)],
  ["only grips start a working-memory drag", /event\.target\.closest\(\"\.record-drag-grip\"\)/.test(app) && /grip\.getAttribute\(\"draggable\"\) !== \"true\"/.test(app)],
  ["valid move and reorder feedback remains visible", /\.record-line\.drop-target \{[\s\S]*?outline: 2px dashed var\(--brand\)/.test(css) && /\.compact-record-row\.reorder-before \{ border-top: 3px solid var\(--brand\)/.test(css) && /\.compact-record-row\.reorder-after \{ border-bottom: 3px solid var\(--brand\)/.test(css)],
  ["new secondary Reg default and MDS date sorting remain protected", /function commentEditorBillingType/.test(app) && /: "regular"/.test(app) && /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
