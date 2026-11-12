/* Focused regression check: saved-site contacts replace the legacy contact import. */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const addData = fs.readFileSync(path.join(root, "sitescribe-add-data.js"), "utf8");

const mustContain = (text, fragment, label) => {
  if (!text.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
};
const mustNotContain = (text, fragment, label) => {
  if (text.includes(fragment)) throw new Error(`Unexpected ${label}: ${fragment}`);
};

mustContain(app, 'const APP_VERSION = "v0.7.03"', "release version");
mustContain(html, 'id="allSiteContactsButton"', "All Site Contacts button");
mustContain(html, 'id="allSiteContactsPanel"', "All Site Contacts panel");
mustContain(app, "async function openAllSiteContactsPanel()", "saved-site contact lookup");
mustContain(app, "function buildAllSiteContacts(savedSiteRecords)", "contact aggregation");
mustContain(app, "await getAllPackagesFromDb()", "all-saved-sites query");
mustContain(app, "getCurrentSiteContacts()", "active-site parser contact source");
mustContain(addData, "ensureSiteContacts", "parser active-site contacts");
mustNotContain(app, "importLegacyContactsIntoCommunicationSetup", "legacy import handler");
mustNotContain(app, "CONTACTS_FILE", "deployment contact file dependency");
mustNotContain(html, "importLegacyContactsButton", "legacy import button");
if (fs.existsSync(path.join(root, "sitescribe_contacts.json"))) throw new Error("Legacy deployment contact file still present.");
console.log("v0.7.02 All Site Contacts regression check passed.");
