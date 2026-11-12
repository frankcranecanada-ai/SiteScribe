const fs = require("fs");
const vm = require("vm");
const source = fs.readFileSync("app.js", "utf8") + "\nglobalThis.__schemaTest = { createEmptyPackage, normalizeImportedPackage, appendPackageRecords };";
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
  communicationConfig: { internalDepartments: [{ id: "dept_safety", name: "Safety", contacts: [{ id: "contact_safety", name: "Jordan", email: "jordan@example.test" }] }] },
  emailActivityLog: [{ id: "email_log_1", timestamp: "2026-07-30T12:00:00Z", recordId: "com_1", parentRecordId: "rec_1", intent: "Safety Notification", recipientSnapshot: { name: "Jordan", email: "jordan@example.test" }, action: "draftCreated", status: "not_sent" }],
  records: [{ id: "rec_1", category: "safety", description: "Guardrail", sourceText: "Guardrail missing", intent: "Safety Notification", comments: [{ id: "com_1", text: "Notify safety", intent: "Safety Notification" }] }]
});
if (configured.records[0].intent !== "safety_notification" || configured.records[0].comments[0].intent !== "safety_notification") throw new Error("Intent normalization failed.");
if (configured.communicationConfig.internalDepartments[0].contacts[0].email !== "jordan@example.test") throw new Error("Embedded contact configuration was not preserved.");

const target = api.createEmptyPackage();
target.records = [{ id: "rec_1", category: "event", description: "Existing", sourceText: "Existing", comments: [] }];
target.emailActivityLog = [{ id: "email_log_1", timestamp: "2026-07-29T12:00:00Z", recordId: "rec_1", recipientSnapshot: { name: "Existing" }, action: "draftCreated", status: "not_sent" }];
const summary = api.appendPackageRecords(target, configured, "regression fixture");
if (target.communicationConfig.internalDepartments.length !== 0) throw new Error("Append overwrote the target communication configuration.");
if (target.emailActivityLog.length !== 2 || summary.activityLogConflicts !== 1) throw new Error("Activity-log conflict preservation failed.");

console.log("PASS: v0.6.79 schema normalization, intent preservation, and safe activity-log append.");
