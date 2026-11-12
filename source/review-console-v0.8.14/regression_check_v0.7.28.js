#!/usr/bin/env node
/* Focused v0.7.28 B05 drag-grip regression check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const mds = fs.readFileSync("sitescribe-mds-excel.js", "utf8");

const primaryStart = app.indexOf("function renderRecordLine(record)");
const primaryEnd = app.indexOf("function formatPrimaryRecordForClipboard", primaryStart);
const primaryRenderer = primaryStart >= 0 && primaryEnd > primaryStart ? app.slice(primaryStart, primaryEnd) : "";
const secondaryStart = app.indexOf("function renderInlineSecondaryRecord(record, comment)");
const secondaryEnd = app.indexOf("function renderDetail", secondaryStart);
const secondaryRenderer = secondaryStart >= 0 && secondaryEnd > secondaryStart ? app.slice(secondaryStart, secondaryEnd) : "";
const dragStart = app.indexOf("function handleWorkingMemoryDragStart(event)");
const dragEnd = app.indexOf("function handleWorkingMemoryDragOver", dragStart);
const dragHandler = dragStart >= 0 && dragEnd > dragStart ? app.slice(dragStart, dragEnd) : "";
const checks = [
  ["version is v0.7.28", /const APP_VERSION = "v0\.7\.28"/.test(app) && /v0\.7\.28/.test(html) && /app\.js\?v=0\.7\.28/.test(html)],
  ["primary records render a labelled six-dot drag grip", /class=\"record-drag-grip/.test(primaryRenderer) && /Drag to reorder or move/.test(primaryRenderer) && />⠿<\/span>/.test(primaryRenderer)],
  ["secondary records render the same labelled drag grip", /class=\"record-drag-grip/.test(secondaryRenderer) && /Drag to reorder or move/.test(secondaryRenderer) && />⠿<\/span>/.test(secondaryRenderer)],
  ["only grips are draggable, not record rows", !/data-record-id=.*draggable=/.test(primaryRenderer) && !/data-comment-id=.*draggable=/.test(secondaryRenderer) && /draggable=\"\$\{canMove \? \"true\" : \"false\"\}\"/.test(primaryRenderer) && /draggable=\"\$\{canMove \? \"true\" : \"false\"\}\"/.test(secondaryRenderer)],
  ["drag start is restricted to an enabled grip", /event\.target\.closest\(\"\.record-drag-grip\"\)/.test(dragHandler) && /grip\.getAttribute\(\"draggable\"\) !== \"true\"/.test(dragHandler)],
  ["grip click cannot open a record", /event\.target\.closest\(\"\.record-drag-grip\"\)/.test(app) && /event\.preventDefault\(\);\s*return;\s*}\s*const secondaryRow/.test(app)],
  ["grips are hover-visible on desktop and lightly visible on touch", /\.record-line:hover \.record-drag-grip/.test(css) && /@media \(hover: none\), \(pointer: coarse\)/.test(css)],
  ["valid reorder targets retain clear insertion lines", /\.compact-record-row\.reorder-before \{ border-top: 3px solid var\(--brand\);/.test(css) && /\.compact-record-row\.reorder-after \{ border-bottom: 3px solid var\(--brand\);/.test(css)],
  ["valid move-under targets retain their highlight", /\.record-line\.drop-target \{[\s\S]*?outline: 2px dashed var\(--brand\)/.test(css)],
  ["new secondary Reg default and MDS date sorting remain protected", /function commentEditorBillingType/.test(app) && /: "regular"/.test(app) && /sortOrder: resolvedReportSortOrder\(filters\)/.test(app) && /compareDatedRows/.test(mds)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
