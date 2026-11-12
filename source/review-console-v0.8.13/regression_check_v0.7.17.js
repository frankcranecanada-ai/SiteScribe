#!/usr/bin/env node
/* Focused v0.7.17 compact Dropbox file-row check. */
const fs = require("fs");
const dropbox = fs.readFileSync("dropbox-sync-proof.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const recognizedBlock = dropbox.match(/if \(filePreview\.state === "sitescribe"\) \{[\s\S]*?\n      \}/)?.[0] || "";
const mobileBlock = css.match(/@media \(max-width: 640px\) \{\n  \.dropbox-file-row \{[\s\S]*?\n\}/)?.[0] || "";
const checks = [
  ["version is v0.7.17", /const APP_VERSION = "v0\.7\.17"/.test(app) && /v0\.7\.17/.test(html)],
  ["recognized row keeps title and freshness pill", /dropbox-file-name/.test(recognizedBlock) && /dropbox-freshness-badge/.test(recognizedBlock)],
  ["recognized row keeps only Content updated metadata", /Content updated:/.test(recognizedBlock) && !/Saved locally:|Date inside file:|Records:|Package:|Summary:|fileMeta/.test(recognizedBlock)],
  ["recognized row keeps Import and Delete", /dropbox-import-button/.test(recognizedBlock) && /dropbox-delete-button/.test(recognizedBlock)],
  ["mobile retains right-side action column", /grid-template-columns: minmax\(0, 1fr\) auto/.test(mobileBlock) && /flex-direction: column/.test(mobileBlock)],
  ["warning rows retain diagnostics", /dropbox-file-warning-text/.test(dropbox) && /\$\{fileMeta\}/.test(dropbox)]
];

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
