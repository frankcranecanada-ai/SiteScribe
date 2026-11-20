/* Focused regression check: saved-site Contacts / Departments access. */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const mustContain = (text, fragment, label) => {
  if (!text.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
};

mustContain(app, 'const APP_VERSION = "v0.7.02"', "release version");
mustContain(app, 'data-action="open-package-contacts"', "per-saved-site Contacts / Departments action");
mustContain(app, 'if (action === "open-package-contacts")', "saved-site contact action handler");
mustContain(app, 'openSavedPackageAsActive(record);\n      openCommunicationSetupPanel();', "site-specific opening sequence");
mustContain(app, "Contacts / Departments saved to this site", "site-specific save status");
mustContain(html, "Contacts / Departments", "renamed editor");
mustContain(html, "Save Contacts / Departments", "renamed save action");
if (html.includes('id="communicationSetupButton"')) throw new Error("Ambiguous global Communication Setup control is still present.");
mustContain(css, ".archive-actions .archive-contacts-button", "mobile contacts button layout");
console.log("v0.7.02 carried-forward Saved Site Contacts / Departments regression check passed.");
