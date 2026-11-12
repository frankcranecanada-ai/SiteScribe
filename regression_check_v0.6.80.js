const fs = require("fs");
const vm = require("vm");
const source = fs.readFileSync("app.js", "utf8") + "\nglobalThis.__schemaTest = { createEmptyPackage, normalizeImportedPackage, appendPackageRecords, normalizeCommunicationConfig, communicationIntentCatalog, validateCommunicationConfig };";
const context = {
  console,
  Date,
  JSON,
  Map,
  Set,
  Math,
  structuredClone: value => JSON.parse(JSON.stringify(value)),
  document: { addEventListener() {} },
  window: { localStorage: { getItem() { return null; }, setItem() {} } }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "app.js" });

const api = context.__schemaTest;
const legacy = api.normalizeImportedPackage({
  packageType: "sitescribe_two_level_records",
  site: "Legacy Site",
  records: [{ id: "rec_1", category: "safety", description: "Guardrail", sourceText: "Guardrail missing", comments: [] }]
});
if (!legacy.communicationConfig || !Array.isArray(legacy.emailActivityLog)) throw new Error("Legacy normalization did not create communication fields.");

const configured = api.normalizeImportedPackage({
  packageType: "sitescribe_two_level_records",
  site: "Configured Site",
  communicationConfig: {
    internalDepartments: [{ id: "dept_safety", name: "Safety", aliases: ["MDS Safety"], allowedIntents: ["safety_notification"], defaultContactId: "contact_safety", contacts: [{ id: "contact_safety", name: "Jordan", email: "jordan@example.test", active: true }] }],
    externalCompanies: [{ id: "company_maxim", name: "Maxim Crane", allowedIntents: ["lift_planning"], defaultContactId: "maxim_planner", contacts: [{ id: "maxim_planner", fullName: "Pat Planner", email: "planner@maxim.example.test", active: true }] }]
  },
  emailActivityLog: [{ id: "email_log_1", timestamp: "2026-07-30T12:00:00Z", recordId: "com_1", parentRecordId: "rec_1", intent: "Safety Notification", recipientSnapshot: { name: "Jordan", email: "jordan@example.test" }, action: "draftCreated", status: "not_sent" }],
  records: [{ id: "rec_1", category: "safety", description: "Guardrail", sourceText: "Guardrail missing", intent: "Safety Notification", comments: [{ id: "com_1", text: "Notify safety", intent: "Safety Notification" }] }]
});
if (configured.records[0].intent !== "safety_notification" || configured.records[0].comments[0].intent !== "safety_notification") throw new Error("Intent normalization failed.");
if (configured.communicationConfig.internalDepartments[0].contacts[0].email !== "jordan@example.test") throw new Error("Embedded internal contact was not preserved.");
if (configured.communicationConfig.externalCompanies[0].contacts[0].email !== "planner@maxim.example.test") throw new Error("Embedded external contact was not preserved.");
if (!api.communicationIntentCatalog(configured.communicationConfig).some(intent => intent.id === "safety_notification")) throw new Error("Default intent catalog is not available for an empty configured catalog.");
if (api.validateCommunicationConfig(configured.communicationConfig).length) throw new Error("Valid configured recipient groups produced warnings.");

const warningConfig = api.normalizeCommunicationConfig({ internalDepartments: [{ id: "dept_1", name: "Safety", allowedIntents: ["safety_notification"], contacts: [{ id: "contact_1", name: "No Email", email: "not-an-email" }] }] });
const warnings = api.validateCommunicationConfig(warningConfig).join(" | ");
if (!/default contact/i.test(warnings) || !/invalid email/i.test(warnings)) throw new Error("Configuration validation did not flag unsafe routing setup.");

const target = api.createEmptyPackage();
target.records = [{ id: "rec_1", category: "event", description: "Existing", sourceText: "Existing", comments: [] }];
target.emailActivityLog = [{ id: "email_log_1", timestamp: "2026-07-29T12:00:00Z", recordId: "rec_1", recipientSnapshot: { name: "Existing" }, action: "draftCreated", status: "not_sent" }];
const summary = api.appendPackageRecords(target, configured, "regression fixture");
if (target.communicationConfig.internalDepartments.length !== 0) throw new Error("Append overwrote the target communication configuration.");
if (target.emailActivityLog.length !== 2 || summary.activityLogConflicts !== 1) throw new Error("Activity-log conflict preservation failed.");

console.log("PASS: v0.6.80 site communication setup schema, validation, legacy safety, intent preservation, and safe append.");
