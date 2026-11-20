#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const app = fs.readFileSync("app.js", "utf8");

assert.match(html, /<title>SiteScribe Review Console v0\.8\.15<\/title>/);
assert.match(html, /styles\.css\?v=0\.8\.15/);
assert.match(html, /app\.js\?v=0\.8\.15/);
assert.match(app, /const APP_VERSION = "v0\.8\.15";/);

for (const id of ["emailJsonButton", "statusLine"]) {
  assert.equal((html.match(new RegExp(`id="${id}"`, "g")) || []).length, 1, `${id} occurs once`);
  const b01 = html.slice(html.indexOf('<section id="siteWalkB01"'), html.indexOf('<section id="siteWalkB02"'));
  assert.match(b01, new RegExp(`id="${id}"`), `${id} is inside B01`);
}
assert.doesNotMatch(html, /class="footer-actions"/);
assert.doesNotMatch(css, /\.footer-actions\s*\{/);
assert.match(css, /\.b01-status-line\s*\{/);
assert.match(html, /id="statusLine"[^>]*aria-live="polite"/);
assert.match(app, /els\.emailJsonButton\.addEventListener\("click", emailJsonPackage\)/);
assert.match(app, /function setStatus\(message\)/);
assert.match(app, /data-action="save-comment"/);
assert.match(app, /data-action="add-inline-activity"/);

console.log("PASS B01 owns email/status controls; fixed footer removed; record save actions remain");
