/* Focused regression check: opening the prefill select must not redraw the editor. */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const mustContain = (text, fragment, label) => {
  if (!text.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
};
const mustNotContain = (text, fragment, label) => {
  if (text.includes(fragment)) throw new Error(`Unexpected ${label}: ${fragment}`);
};

mustContain(app, 'const APP_VERSION = "v0.7.04"', "release version");
mustContain(app, "async function refreshAllSiteContacts()", "saved-site contact refresh");
mustContain(app, 'const button = event.target.closest("button[data-communication-action]");', "button-only communication click delegation");
mustNotContain(app, 'const button = event.target.closest("[data-communication-action]");', "broad communication click delegation");
mustContain(app, 'select[data-communication-action="prefill-contact"]', "contact prefill select");
mustContain(app, "function handleCommunicationSetupChange(event)", "prefill selection change handler");
mustContain(app, "contact.fullName = String(source.fullName", "name prefill");
mustContain(app, "contact.email = String(source.email", "email prefill");
mustContain(app, "contact.phone = String(source.phone", "phone prefill");
mustContain(app, "contact.role = String(source.role", "role prefill");
mustContain(app, "contact.aliases = normalizeNameList(source.aliases)", "aliases prefill");
mustContain(app, "contact.active = source.active !== false", "active-status prefill");
mustContain(app, "await refreshAllSiteContacts()", "Add Contact contact-list load");
console.log("v0.7.04 contact dropdown regression check passed.");
