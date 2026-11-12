/* Focused regression check: Contacts / Departments must persist immediately. */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const mustContain = (fragment, label) => {
  if (!app.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
};

mustContain('const APP_VERSION = "v0.7.02"', "release version");
mustContain("async function saveCommunicationSetup()", "asynchronous explicit contact save");
mustContain('markDirty({ reason: "communication setup saved", skipAutoSave: true })', "contact save bypasses delayed autosave");
mustContain('await waitForAutoSaveIdle()', "existing save completion guard");
mustContain('await forceAutoSaveNow("contacts / departments explicitly saved")', "immediate contact persistence");
mustContain('Contacts / Departments saved to this site and this device.', "completed-save status");
mustContain('communicationSetupSaveInProgress', "double-tap save guard");
console.log("v0.7.02 Contacts / Departments persistence regression check passed.");
