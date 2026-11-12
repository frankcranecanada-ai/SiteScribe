#!/usr/bin/env node
/* Focused v0.7.15 mobile secondary editor and scroll containment check. */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const checks = [
  ["version is v0.7.15", /const APP_VERSION = "v0\.7\.15"/.test(app) && /v0\.7\.15/.test(html)],
  ["mobile time controls use two readable rows", /\.secondary-editor-card \.update-time-editor \{\s*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\) minmax\(54px, 0\.7fr\);/.test(css) && /update-time-editor > label:nth-child\(4\)[\s\S]*?grid-column: span 2/.test(css)],
  ["detail card owns vertical scrolling", /\.detail-card \{[\s\S]*?overflow-y: auto;[\s\S]*?overscroll-behavior: contain;[\s\S]*?touch-action: pan-y;/.test(css)],
  ["background page locks while detail is open", /html\.detail-panel-open,[\s\S]*?overflow: hidden;/.test(css) && /document\.documentElement\.classList\.add\("detail-panel-open"\)/.test(app) && /document\.documentElement\.classList\.remove\("detail-panel-open"\)/.test(app)],
  ["secondary backdrop remains inert", !/detailPanel\.addEventListener\("click"/.test(app)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
