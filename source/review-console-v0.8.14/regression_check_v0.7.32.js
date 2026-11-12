#!/usr/bin/env node
/* Focused v0.7.32 Dropbox-update listing plus B04 regression check. */
const fs = require("fs");
const addData = require("./sitescribe-add-data.js");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const dropbox = fs.readFileSync("dropbox-sync-proof.js", "utf8");

const rawText = "Sep 21 — E-House delivered at 08:00.";
const instruction = "Create one Phase 4A schedule primary with the dated items as secondary records.";
const context = { site: "MDS Cherry Point MCAS", shiftDate: "2026-09-14", captureMethod: "SiteScribe Add Data" };
const request = addData.buildRequest(rawText, context, [], instruction);
const plainRequest = addData.buildRequest(rawText, context, []);
const staged = addData.normalizePackageForStaging({
  records: [{ id: "schedule", category: "scheduled", description: "Phase 4A — Schedule Baseline", sourceText: rawText, comments: [] }]
}, context, [], rawText, instruction);

const instructionStart = request.indexOf("--- BEGIN OPERATOR INSTRUCTION ---");
const instructionEnd = request.indexOf("--- END OPERATOR INSTRUCTION ---");
const rawStart = request.indexOf("--- BEGIN RAW NOTES ---");
const checks = [
  ["version and cache markers are v0.7.32", /const APP_VERSION = "v0\.7\.32"/.test(app) && /v0\.7\.32/.test(html) && /app\.js\?v=0\.7\.32/.test(html) && /sitescribe-add-data\.js\?v=0\.7\.32/.test(html) && /dropbox-sync-proof\.js\?v=0\.7\.32/.test(html) && /styles\.css\?v=0\.7\.32/.test(html) && /const MODULE_VERSION = "v0\.7\.32"/.test(addDataSource())],
  ["successful stable Dropbox update forces a list using the verified upload client", /const listResult = await listDropboxJsonFiles\(\{ client: dbx, afterSiteUpdate: true \}\);/.test(dropbox)],
  ["Dropbox list reports whether the refreshed current-file list was shown", /Dropbox list refreshed with \$\{listResult\.listedCount\} JSON file\(s\); the current file is shown above\./.test(dropbox) && /automatic confirmation list could not be refreshed/.test(dropbox)],
  ["list helper returns an explicit verification result", /async function listDropboxJsonFiles\(options = \{\}\)/.test(dropbox) && /listedCount: dedupedEntries\.length/.test(dropbox) && /readableCount/.test(dropbox)],
  ["B04 clearly identifies the button as a parser launcher", /Open Note Parser/.test(html) && /Open the parser to paste notes or schedule text, add an optional instruction/.test(html) && /Open the note parser or add one record manually/.test(app)],
  ["Parse Notes exposes a separate optional instruction field", /id="addDataParserInstruction"/.test(addDataSource()) && /Parsing instruction <span>\(optional\)<\/span>/.test(addDataSource()) && /maxlength="2000"/.test(addDataSource())],
  ["instruction is sent before raw source notes and retains the source unchanged", instructionStart >= 0 && instructionEnd > instructionStart && rawStart > instructionEnd && request.includes(instruction) && request.includes(rawText)],
  ["no instruction produces no instruction block", !plainRequest.includes("BEGIN OPERATOR INSTRUCTION")],
  ["staging separates operator guidance from source text", staged.source.rawText === rawText && staged.source.parserInstruction === instruction && staged.records[0].sourceText === rawText],
  ["review discloses the instruction without adding it to source text", /Parsing instruction used/.test(addDataSource()) && /not added to source text/.test(addDataSource())],
  ["clear and append-close paths clear the instruction", /state\.parserInstruction = "";/.test(addDataSource()) && /addDataParserInstruction"\)\.value = ""/.test(addDataSource())],
  ["instruction styling is present and scoped to Parse Notes", /#addDataParserInstruction/.test(css) && /\.add-data-parser-instruction/.test(css)],
  ["protected B04 append remains operator-initiated", /Append \$\{count\} Accepted Record/.test(addDataSource()) && /Nothing enters Working Memory until Append Accepted Records is pressed/.test(addDataSource())],
  ["B04 continues to use the existing parser endpoint", /\/SiteScribe-Parser-Lite\/server\/parse\.php/.test(addDataSource())]
];

function addDataSource() {
  return fs.readFileSync("sitescribe-add-data.js", "utf8");
}

const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? "PASS" : "FAIL"} ${label}`));
process.exitCode = failed.length ? 1 : 0;
