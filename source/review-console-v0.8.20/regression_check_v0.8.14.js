#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("dropbox-sync-proof.js", "utf8");
const match = source.match(/const OTHER_APP_JSON_FILES = new Set\((\[[^\]]+\])\);/);
assert.ok(match, "Dropbox exclusion list is present");
const excluded = new Set(vm.runInNewContext(match[1]));
const isListed = name => name.toLowerCase().endsWith(".json") && !excluded.has(name.toLowerCase());

assert.equal(isListed("le-initial-sms-receipts-v1.json"), false);
assert.equal(isListed("LE-INITIAL-SMS-RECEIPTS-V1.JSON"), false);
assert.equal(isListed("MDS_Billing_site.json"), true);
assert.equal(isListed("another-unrecognized.json"), true);
assert.match(source, /\.filter\(entry => !OTHER_APP_JSON_FILES\.has\(String\(entry\.name \|\| ""\)\.toLowerCase\(\)\)\)/);
assert.match(source, /const DROPBOX_PATHS = \["", "\/incoming", "\/saved-sites"\]/);
console.log("PASS specific Lift Estimator JSON is excluded while normal SiteScribe JSON remains listed");
