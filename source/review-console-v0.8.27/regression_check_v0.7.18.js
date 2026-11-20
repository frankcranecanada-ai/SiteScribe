#!/usr/bin/env node
/* Focused v0.7.18 Dropbox list tooltip clipping check. */
const fs = require("fs");
const css = fs.readFileSync("styles.css", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const tooltipRule = css.match(/#listDropboxFilesButton\.desktop-tooltip::after\s*\{[\s\S]*?\}/)?.[0] || "";
const activeRule = css.match(/#listDropboxFilesButton\.desktop-tooltip:hover::after,[\s\S]*?\{[\s\S]*?\}/)?.[0] || "";
const checks = [
  ["version is v0.7.18", /const APP_VERSION = "v0\.7\.18"/.test(app) && /v0\.7\.18/.test(html)],
  ["list button and tooltip remain present", /id="listDropboxFilesButton"[^>]*class="[^"]*desktop-tooltip/.test(html) && /Show available SiteScribe JSON files/.test(html)],
  ["tooltip is left anchored inside B01", /left:\s*0/.test(tooltipRule) && /translate\(0,\s*3px\)/.test(tooltipRule)],
  ["hover and focus settle without horizontal translation", /hover::after/.test(activeRule) && /focus-visible::after/.test(activeRule) && /translate\(0,\s*0\)/.test(activeRule)],
  ["B01 clipping safeguard remains", /\.site-walk-panel\s*\{[^}]*overflow:\s*hidden/.test(css)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
