/* Focused regression check: a new contact can be prefilled from All Site Contacts. */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const mustContain = (text, fragment, label) => {
  if (!text.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
};

mustContain(app, 'const APP_VERSION = "v0.7.03"', "release version");
mustContain(app, "async function refreshAllSiteContacts()", "saved-site contact refresh");
mustContain(app, 'data-communication-action="prefill-contact"', "new contact prefill dropdown");
mustContain(app, "function handleCommunicationSetupChange(event)", "prefill selection handler");
mustContain(app, "contact.fullName = String(source.fullName", "name prefill");
mustContain(app, "contact.email = String(source.email", "email prefill");
mustContain(app, "contact.phone = String(source.phone", "phone prefill");
mustContain(app, "contact.role = String(source.role", "role prefill");
mustContain(app, "contact.aliases = normalizeNameList(source.aliases)", "aliases prefill");
mustContain(app, "contact.active = source.active !== false", "active-status prefill");
mustContain(app, "await refreshAllSiteContacts()", "Add Contact contact-list load");
mustContain(css, ".contact-prefill", "prefill visual treatment");
console.log("v0.7.03 contact prefill regression check passed.");
