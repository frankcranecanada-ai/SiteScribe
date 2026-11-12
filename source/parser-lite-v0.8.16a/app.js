const APP_VERSION = "v0.8.16a";
const PRODUCTION_API_ENDPOINT = "server/parse.php";
const CONTACTS_FILE = "sitescribe_contacts.json";
const MODEL_NAME = "two-level-records-with-record-flags";
const PARSER_CORE = globalThis.SiteScribeParserCore;

if (!PARSER_CORE || PARSER_CORE.version !== "1.0.1") {
  throw new Error("SiteScribe Parser Core v1.0.1 is required.");
}

const CATEGORY_OPTIONS = [
  "event",
  "action",
  "followup",
  "scheduled",
  "safety",
  "communication",
  "document"
];

const SAMPLES = {
  event: "event: concrete pump arrived at 7:30 and started footing pour on the north side.",
  safety: "safety: ABC Mechanical left material blocking the east gate. I told Mike to move it.",
  document: "document: need crane lift plan and insurance before rooftop lift.",
  ambiguous: "followup: talk to Mike about gate.",
};

SAMPLES.all = [
  "Site: Kemptville Office Building",
  "Date: 2026-06-24",
  SAMPLES.event,
  SAMPLES.safety,
  SAMPLES.document,
  SAMPLES.ambiguous,
  "June 14/2026-safety, pile of wood at south entrance belongs to TL Mechanical, send email reminding TL Mechanical to clean it up."
].join("\n");

const state = {
  rawText: "",
  proposals: [],
  packageFlags: [],
  dailySummary: "",
  parserEngine: "manual-ai-bridge-v0.8",
  lastExport: null,
  sourceDateBasis: "not set",
  pendingImport: null,
  pendingStructuredImport: null,
  importChoiceMode: "raw",
  sourceLog: [],
  skippedFiles: [],
  lastParseTime: "",
  jsonBuildAttemptedNoAccepted: false,
  structuredJsonDetected: false,
  structuredRecordCount: 0,
  reviewFilter: "all",
  cleanupLastMessage: "Cleanup tools ready.",
  aiRequestBuilt: false,
  aiRequestText: "",
  aiTemplateName: "SiteScribe Standard",
  aiTemplateVersion: "v1.3",
  aiTemplateText: "",
  aiTemplateSavedAt: "",
  aiResultLoaded: false,
  aiResultRecordCount: 0,
  aiResultValidationWarningCount: 0,
  aiResultWarnings: [],
  aiResultSourceLabel: "",
  lastAiResultLoadTime: "",
  apiEndpoint: PRODUCTION_API_ENDPOINT,
  projectContacts: [],
  apiLastStatus: "not tested",
  apiLastCallTime: "",
  apiLastModel: "",
  apiBusyStartedAt: 0,
  apiProgressMessage: "",
  expandedProposalIndex: null,
  emailDraftsOpenByRecordId: {},
  expandedEmailDraftKey: null,
  secondaryRecordsOpenByRecordId: {},
  expandedSecondaryRecordKey: null,
};

const els = {};
let apiProgressTimer = null;
const API_PROGRESS_MESSAGES = [
  "building request",
  "contacting server",
  "waiting for AI response",
  "checking returned JSON",
  "preparing review records"
];

function resetEmailDraftReviewState() {
  state.emailDraftsOpenByRecordId = {};
  state.expandedEmailDraftKey = null;
  state.secondaryRecordsOpenByRecordId = {};
  state.expandedSecondaryRecordKey = null;
}

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  els.appVersion.textContent = APP_VERSION;
  initializeAiTemplate();
  loadProjectContacts();
  initializeApiSettings();
  bindEvents();
  collapseAllExpandablePanels();
  if (!els.dateInput.value) els.dateInput.value = todayString();
  setStatus("Ready.");
  renderDiagnostics();
  renderCleanupStatus();
}

async function loadProjectContacts() {
  try {
    const response = await fetch(CONTACTS_FILE, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.projectContacts = Array.isArray(data.contacts) ? data.contacts.map(normalizeProjectContact).filter(contact => contact.id) : [];
  } catch (error) {
    console.warn("SiteScribe contact file was not loaded.", error);
    state.projectContacts = [];
  }
}

function normalizeProjectContact(contact) {
  return {
    id: normalizeText(contact?.id),
    name: normalizeText(contact?.name || contact?.fullName),
    fullName: normalizeText(contact?.fullName || contact?.name),
    email: normalizeText(contact?.email),
    company: normalizeText(contact?.company),
    role: normalizeText(contact?.role),
    responsibilities: Array.isArray(contact?.responsibilities) ? contact.responsibilities.map(normalizeText).filter(Boolean) : []
  };
}

function collapseAllExpandablePanels() {
  document.querySelectorAll("details[open]").forEach(panel => {
    panel.removeAttribute("open");
  });
}

function cacheElements() {
  const ids = [
    "appVersion", "clearButton", "siteInput", "dateInput", "captureMethod", "rawText",
    "noteFile", "statusLine", "summaryOutput", "diagnosticsOutput", "recordsRoot", "addBlankRecordButton",
    "validationOutput", "validateButton", "buildJsonButton", "copyJsonButton", "downloadJsonButton",
    "jsonOutput", "toast", "importChoiceOverlay", "appendImportButton", "replaceImportButton", "cancelImportButton", "importChoiceText", "structuredJsonOverlay", "loadStructuredButton", "convertStructuredButton", "cancelStructuredButton", "structuredJsonText",
    "acceptAllButton", "rejectAllButton", "acceptCategorySelect", "acceptCategoryButton", "rejectCategorySelect", "rejectCategoryButton",
    "showAllButton", "showAcceptedButton", "showRejectedButton", "showWarningsButton", "bulkSourceDateInput", "bulkSourceDateButton",
    "bulkSiteInput", "bulkSiteButton", "filterStatus", "cleanupStatus", "cleanupSummary",
    "buildAiRequestButton", "copyAiRequestButton", "clearAiRequestButton", "aiRequestOutput",
    "aiTemplateNameInput", "aiTemplateVersionInput", "aiTemplateInput", "aiTemplateSummary", "saveAiTemplateButton", "restoreAiTemplateButton", "aiTemplateStatus",
    "apiEndpointInput", "saveApiEndpointButton", "resetApiEndpointButton", "testApiConnectionButton", "parseWithApiButton", "apiStatusLine", "apiModeSummary",
    "aiResultInput", "loadAiResultButton", "validateAiResultButton", "clearAiResultButton", "aiBridgeStatus"
  ];
  ids.forEach(id => { els[id] = document.getElementById(id); });
}

function bindEvents() {
  document.querySelectorAll(".sample").forEach(button => {
    button.addEventListener("click", () => loadSample(button.dataset.sample));
  });

  if (els.noteFile) {
    els.noteFile.addEventListener("change", event => {
      const files = Array.from(event.target.files || []);
      if (files.length) importDroppedOrSelectedFiles(files);
      event.target.value = "";
    });
  }

  installIntakeDropHandlers();

  els.clearButton.addEventListener("click", clearAll);
  els.addBlankRecordButton.addEventListener("click", addBlankRecord);
  els.validateButton.addEventListener("click", () => {
    const pkg = buildExportPackage();
    state.jsonBuildAttemptedNoAccepted = !(pkg.records || []).length;
    const result = validateExportPackage(pkg);
    renderValidation(result);
    els.jsonOutput.value = JSON.stringify(pkg, null, 2);
    state.lastExport = pkg;
    renderDiagnostics();
  });
  els.buildJsonButton.addEventListener("click", () => {
    const pkg = buildExportPackage();
    state.jsonBuildAttemptedNoAccepted = !(pkg.records || []).length;
    state.lastExport = pkg;
    els.jsonOutput.value = JSON.stringify(pkg, null, 2);
    renderValidation(validateExportPackage(pkg));
    renderDiagnostics();
    showToast("JSON built.");
  });
  els.copyJsonButton.addEventListener("click", copyJson);
  els.downloadJsonButton.addEventListener("click", downloadJson);

  els.recordsRoot.addEventListener("input", handleRecordInput);
  els.recordsRoot.addEventListener("change", handleRecordInput);
  els.recordsRoot.addEventListener("click", handleRecordClick);

  bindCleanupTools();
  bindAiBridge();

  if (els.appendImportButton) els.appendImportButton.addEventListener("click", () => resolveImportChoice("append"));
  if (els.replaceImportButton) els.replaceImportButton.addEventListener("click", () => resolveImportChoice("replace"));
  if (els.cancelImportButton) els.cancelImportButton.addEventListener("click", () => resolveImportChoice("cancel"));
  if (els.importChoiceOverlay) {
    els.importChoiceOverlay.addEventListener("click", event => {
      if (event.target === els.importChoiceOverlay) resolveImportChoice("cancel");
    });
  }

  if (els.loadStructuredButton) els.loadStructuredButton.addEventListener("click", () => resolveStructuredJsonChoice("load"));
  if (els.convertStructuredButton) els.convertStructuredButton.addEventListener("click", () => resolveStructuredJsonChoice("raw"));
  if (els.cancelStructuredButton) els.cancelStructuredButton.addEventListener("click", () => resolveStructuredJsonChoice("cancel"));
  if (els.structuredJsonOverlay) {
    els.structuredJsonOverlay.addEventListener("click", event => {
      if (event.target === els.structuredJsonOverlay) resolveStructuredJsonChoice("cancel");
    });
  }
}


function bindAiBridge() {
  if (els.buildAiRequestButton) els.buildAiRequestButton.addEventListener("click", buildAndDisplayAiRequest);
  if (els.copyAiRequestButton) els.copyAiRequestButton.addEventListener("click", copyAiRequest);
  if (els.clearAiRequestButton) els.clearAiRequestButton.addEventListener("click", clearAiRequest);
  if (els.saveAiTemplateButton) els.saveAiTemplateButton.addEventListener("click", saveAiTemplateFromUi);
  if (els.restoreAiTemplateButton) els.restoreAiTemplateButton.addEventListener("click", restoreDefaultAiTemplate);
  if (els.saveApiEndpointButton) els.saveApiEndpointButton.addEventListener("click", saveApiEndpointFromUi);
  if (els.resetApiEndpointButton) els.resetApiEndpointButton.addEventListener("click", resetApiEndpointToProduction);
  if (els.testApiConnectionButton) els.testApiConnectionButton.addEventListener("click", testApiConnection);
  if (els.parseWithApiButton) els.parseWithApiButton.addEventListener("click", parseWithApi);
  if (els.apiEndpointInput) els.apiEndpointInput.addEventListener("change", saveApiEndpointFromUi);
  if (els.validateAiResultButton) els.validateAiResultButton.addEventListener("click", validateDisplayedAiResult);
  if (els.loadAiResultButton) els.loadAiResultButton.addEventListener("click", loadDisplayedAiResult);
  if (els.clearAiResultButton) els.clearAiResultButton.addEventListener("click", clearAiResult);
  if (els.aiResultInput) {
    els.aiResultInput.addEventListener("dragover", event => {
      event.preventDefault();
      els.aiResultInput.classList.add("drag-over");
    });
    els.aiResultInput.addEventListener("dragleave", () => els.aiResultInput.classList.remove("drag-over"));
    els.aiResultInput.addEventListener("drop", handleAiResultDrop);
  }
}

function bindCleanupTools() {
  if (els.acceptAllButton) els.acceptAllButton.addEventListener("click", () => setAllProposalAcceptance(true));
  if (els.rejectAllButton) els.rejectAllButton.addEventListener("click", () => setAllProposalAcceptance(false));
  if (els.acceptCategoryButton) els.acceptCategoryButton.addEventListener("click", () => {
    setProposalAcceptanceByCategory(els.acceptCategorySelect.value, true);
  });
  if (els.rejectCategoryButton) els.rejectCategoryButton.addEventListener("click", () => {
    setProposalAcceptanceByCategory(els.rejectCategorySelect.value, false);
  });
  if (els.showAllButton) els.showAllButton.addEventListener("click", () => setReviewFilter("all"));
  if (els.showAcceptedButton) els.showAcceptedButton.addEventListener("click", () => setReviewFilter("accepted"));
  if (els.showRejectedButton) els.showRejectedButton.addEventListener("click", () => setReviewFilter("rejected"));
  if (els.showWarningsButton) els.showWarningsButton.addEventListener("click", () => setReviewFilter("warnings"));
  if (els.bulkSourceDateButton) els.bulkSourceDateButton.addEventListener("click", () => {
    bulkSetSourceDate(els.bulkSourceDateInput.value, activeBulkScope());
  });
  if (els.bulkSiteButton) els.bulkSiteButton.addEventListener("click", () => {
    bulkSetSiteName(els.bulkSiteInput.value);
  });
}

function loadSample(key) {
  const sampleText = SAMPLES[key] || "";
  els.rawText.value = sampleText;
  const dateInfo = resolveDateForImport({ rawText: sampleText, fallbackDate: todayString() });
  if (dateInfo.date) {
    els.dateInput.value = dateInfo.date;
    state.sourceDateBasis = dateInfo.basis;
  }
  const siteFromText = extractSiteFromText(sampleText);
  if (siteFromText) els.siteInput.value = siteFromText;
  state.sourceLog = [{ name: `Sample: ${key}`, kind: "sample", status: "loaded" }];
  state.skippedFiles = [];
  renderDiagnostics();
  showToast("Sample loaded.");
  setStatus(`Sample loaded. Date basis: ${state.sourceDateBasis}.`);
}

function installIntakeDropHandlers() {
  const targets = [els.rawText].filter(Boolean);
  targets.forEach(target => {
    target.addEventListener("dragover", event => {
      event.preventDefault();
      target.classList.add("drag-over");
    });
    target.addEventListener("dragleave", () => target.classList.remove("drag-over"));
    target.addEventListener("drop", handleIntakeDrop);
  });
}

async function handleIntakeDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  [els.rawText].filter(Boolean).forEach(el => el.classList.remove("drag-over"));

  const dt = event.dataTransfer;
  const files = Array.from(dt && dt.files ? dt.files : []);
  if (files.length) {
    await importDroppedOrSelectedFiles(files);
    return;
  }

  const plainText = dt ? dt.getData("text/plain") : "";
  const htmlText = dt ? dt.getData("text/html") : "";
  const normalized = await normalizeToRawText({
    kind: plainText ? "plain" : "html",
    name: "dropped text",
    text: plainText || htmlText,
  });
  if (normalizeText(normalized.rawText)) {
    requestApplyImportedPayload(parseImportedPayload(normalized.rawText, normalized.sourceMeta));
    return;
  }

  setStatus("Nothing readable was dropped. Paste copied text or drop a supported text/JSON/email file.");
  showToast("No readable text found.");
}

async function importDroppedOrSelectedFiles(files) {
  state.skippedFiles = [];
  const imageFiles = files.filter(isImageFile);
  const unsupportedFiles = files.filter(file => !isImageFile(file) && !isSupportedImportFile(file));
  const readableFiles = files.filter(isSupportedImportFile);

  const warnings = [];
  if (imageFiles.length) {
    warnings.push('Image OCR is not included in Parser Lite.');
    recordSkippedFiles(imageFiles, 'image', 'Image OCR is not included in Parser Lite.');
  }
  if (unsupportedFiles.length) {
    const unsupportedMessage = `Unsupported file(s) skipped: ${unsupportedFiles.map(file => file.name || 'unnamed file').join(', ')}`;
    warnings.push(unsupportedMessage);
    recordSkippedFiles(unsupportedFiles, 'unsupported', 'Unsupported file type.');
  }

  if (!readableFiles.length) {
    const message = warnings.length ? warnings.join(' ') : 'No supported text, JSON, email, or HTML files were found.';
    setStatus(message);
    showToast(warnings[0] || 'No supported files.');
    renderDiagnostics();
    return;
  }

  try {
    if (readableFiles.length === 1) {
      await importNoteFile(readableFiles[0], warnings);
      return;
    }

    const chunks = [];
    let newestModified = 0;
    for (const file of readableFiles) {
      const normalized = await normalizeToRawText({ kind: 'file', file });
      newestModified = Math.max(newestModified, file.lastModified || 0);
      chunks.push(`--- Source: ${file.name || 'dropped file'} ---\n${normalized.rawText}`);
    }
    const combined = chunks.join('\n\n');
    const imported = parseImportedPayload(combined, {
      name: `${readableFiles.length} imported files`,
      lastModified: newestModified,
      type: 'text/plain',
    });
    imported.sourceNames = readableFiles.map(file => file.name || 'dropped file');
    imported.captureMethod = 'multi-file text import';
    requestApplyImportedPayload(imported);
    if (warnings.length) setStatus(`${els.statusLine.textContent} ${warnings.join(' ')}`);
  } catch (error) {
    console.error(error);
    setStatus('Import failed. Check the file format.');
    showToast('Import failed.');
  }
}

async function importNoteFile(file, warnings = []) {
  try {
    const normalized = await normalizeToRawText({ kind: 'file', file });
    const imported = parseImportedPayload(normalized.rawText, normalized.sourceMeta);
    if (imported && imported.structuredSiteScribePackage) {
      showStructuredJsonChoice(imported);
    } else {
      requestApplyImportedPayload(imported);
    }
    if (warnings.length && !imported.structuredSiteScribePackage) setStatus(`${els.statusLine.textContent} ${warnings.join(' ')}`);
  } catch (error) {
    console.error(error);
    setStatus('Import failed. Check the file format.');
    showToast('Import failed.');
  }
}

function parseImportedPayload(text, file) {
  const fileDate = dateFromFile(file);
  const json = tryParseJson(text);

  if (json && typeof json === "object") {
    const structuredSiteScribePackage = isStructuredSiteScribePackage(json);
    const rawText = json.source && typeof json.source.rawText === "string"
      ? json.source.rawText
      : recordsToRawText(json.records || []) || text;

    const recordDate = firstRecordDate(json.records || []);
    const dateInfo = resolveDateForImport({
      rawText,
      packageDate: json.shiftDate,
      recordDate,
      fallbackDate: fileDate || todayString(),
    });

    const imported = {
      kind: structuredSiteScribePackage ? "structured-json" : "json",
      fileName: file && file.name ? file.name : "imported JSON",
      rawText,
      packageData: json,
      structuredSiteScribePackage,
      structuredRecordCount: Array.isArray(json.records) ? json.records.length : 0,
      site: extractSiteFromText(rawText) || usableText(json.site),
      shiftDate: dateInfo.date,
      dateBasis: dateInfo.basis,
      captureMethod: (json.source && json.source.captureMethod) || "JSON import",
      proposals: structuredSiteScribePackage && Array.isArray(json.records)
        ? json.records.map(record => importedRecordToProposal(record, dateInfo.date))
        : [],
      dailySummary: structuredSiteScribePackage ? (json.dailySummary || "") : "",
      packageFlags: structuredSiteScribePackage && Array.isArray(json.packageFlags)
        ? json.packageFlags.map(flag => normalizeImportedFlag(flag, dateInfo.date))
        : [],
    };
    return imported;
  }

  const dateInfo = resolveDateForImport({ rawText: text, fallbackDate: fileDate || todayString() });
  return {
    kind: "text",
    fileName: file && file.name ? file.name : "imported text",
    rawText: text,
    packageData: null,
    structuredSiteScribePackage: false,
    structuredRecordCount: 0,
    site: extractSiteFromText(text),
    shiftDate: dateInfo.date,
    dateBasis: dateInfo.basis,
    captureMethod: captureMethodFromFile(file),
    proposals: [],
    dailySummary: "",
    packageFlags: [],
  };
}

function isStructuredSiteScribePackage(json) {
  if (!json || typeof json !== "object") return false;
  if (json.packageType === "sitescribe_two_level_records") return true;
  if (Array.isArray(json.records) && json.reviewConsole && json.reviewConsole.model === MODEL_NAME) return true;
  return false;
}

function showStructuredJsonChoice(imported) {
  state.pendingStructuredImport = imported;
  if (els.structuredJsonText) {
    const count = imported.structuredRecordCount || (imported.proposals || []).length || 0;
    const name = imported.fileName || "imported JSON";
    els.structuredJsonText.textContent = `SiteScribe JSON package detected: ${name}. ${count} structured record(s) found. Load as editable review records, convert to raw text, or cancel?`;
  }
  if (els.structuredJsonOverlay) els.structuredJsonOverlay.hidden = false;
  setStatus("SiteScribe JSON package detected. Choose Load as Review Records, Convert to Raw Text, or Cancel.");
  renderDiagnostics();
}

function resolveStructuredJsonChoice(choice) {
  const imported = state.pendingStructuredImport;
  state.pendingStructuredImport = null;
  if (els.structuredJsonOverlay) els.structuredJsonOverlay.hidden = true;

  if (!imported || choice === "cancel") {
    renderDiagnostics();
    setStatus("Structured JSON import cancelled.");
    showToast("Import cancelled.");
    return;
  }

  if (choice === "raw") {
    requestApplyImportedPayload(structuredJsonToRawImport(imported));
    return;
  }

  requestApplyImportedPayload(imported);
}

function structuredJsonToRawImport(imported) {
  return {
    ...imported,
    kind: "json",
    proposals: [],
    packageFlags: [],
    dailySummary: "",
    structuredSiteScribePackage: false,
    convertFromStructured: true,
  };
}

function requestApplyImportedPayload(imported) {
  if (!imported) return;
  if (hasExistingIntakeOrReview()) {
    state.pendingImport = imported;
    state.importChoiceMode = imported.structuredSiteScribePackage ? "structured-records" : "raw";
    showImportChoice(imported);
    return;
  }
  applyImportedPayload(imported);
}

function hasExistingIntakeOrReview() {
  return Boolean(
    normalizeText(els.rawText.value) ||
    state.proposals.length ||
    state.packageFlags.length ||
    normalizeText(els.jsonOutput.value)
  );
}

function showImportChoice(imported) {
  const name = imported.fileName || "new source";
  const isAiResult = imported && imported.kind === "ai-result";
  const isStructured = imported && imported.structuredSiteScribePackage;
  if (els.importChoiceText) {
    els.importChoiceText.textContent = isAiResult
      ? `AI result detected in ${name}. Append AI records to the review list, replace current review records, or cancel?`
      : isStructured
        ? `Structured SiteScribe records detected in ${name}. Append imported records to the review list, replace current intake/review, or cancel?`
        : `New source detected: ${name}. Append to existing intake, replace current intake/review, or cancel?`;
  }
  if (els.appendImportButton) els.appendImportButton.textContent = isAiResult ? "Append to Review Records" : (isStructured ? "Append Review Records" : "Append to Intake");
  if (els.replaceImportButton) els.replaceImportButton.textContent = isAiResult ? "Replace Review Records" : (isStructured ? "Replace with Records" : "Replace Intake");
  if (els.importChoiceOverlay) {
    els.importChoiceOverlay.hidden = false;
  }
  setStatus(isAiResult ? "AI result detected. Choose Append to Review Records, Replace Review Records, or Cancel." : (isStructured ? "Structured records detected. Choose Append Review Records, Replace with Records, or Cancel." : "New source detected. Choose Append to Intake, Replace Intake, or Cancel."));
}

function resolveImportChoice(choice) {
  const imported = state.pendingImport;
  state.pendingImport = null;
  if (els.importChoiceOverlay) els.importChoiceOverlay.hidden = true;

  if (!imported || choice === "cancel") {
    renderDiagnostics();
    setStatus("Import cancelled.");
    showToast("Import cancelled.");
    return;
  }

  if (imported.kind === "ai-result") {
    if (choice === "append") appendAiResultRecords(imported);
    else replaceAiResultRecords(imported);
    return;
  }

  if (choice === "append") {
    appendImportedPayload(imported);
    return;
  }

  applyImportedPayload(imported);
}

function appendImportedPayload(imported) {
  if (imported && imported.structuredSiteScribePackage) {
    appendStructuredRecords(imported);
    return;
  }

  const existing = els.rawText.value || "";
  const sourceName = imported.fileName || "imported source";
  const incoming = imported.rawText || "";
  const separator = `\n\n--- Source: ${sourceName} ---\n`;
  els.rawText.value = existing.trim() ? `${existing.trim()}${separator}${incoming.trim()}` : incoming.trim();
  state.rawText = els.rawText.value;

  if (!els.siteInput.value.trim() && imported.site && imported.site !== "not stated") els.siteInput.value = imported.site;
  if (imported.shiftDate) {
    els.dateInput.value = imported.shiftDate;
    state.sourceDateBasis = imported.dateBasis || state.sourceDateBasis || "not set";
  }
  if (imported.captureMethod) setSelectValue(els.captureMethod, imported.captureMethod);

  state.lastExport = null;
  state.jsonBuildAttemptedNoAccepted = false;
  els.jsonOutput.value = "";
  addSourceLog(imported, "appended");
  renderSummary();
  renderRecords();
  renderValidation({ ok: false, messages: ["New source appended to intake. Click Parse / Structure to rebuild proposals from the combined intake."] });
  renderDiagnostics();
  setStatus(`Appended ${sourceName} to intake. Click Parse / Structure when ready.`);
  showToast("Source appended.");
}

function appendStructuredRecords(imported) {
  const incoming = Array.isArray(imported.proposals) ? imported.proposals : [];
  const cloned = incoming.map(record => createProposal({ ...record, id: record.id || createId("prop") }));
  state.proposals = [...state.proposals, ...cloned];
  state.packageFlags = [...(state.packageFlags || []), ...(imported.packageFlags || [])];
  if (!state.dailySummary && imported.dailySummary) state.dailySummary = imported.dailySummary;
  if (!els.siteInput.value.trim() && imported.site && imported.site !== "not stated") els.siteInput.value = imported.site;
  if (imported.shiftDate) {
    els.dateInput.value = imported.shiftDate;
    state.sourceDateBasis = imported.dateBasis || state.sourceDateBasis || "not set";
  }
  if (imported.captureMethod) setSelectValue(els.captureMethod, imported.captureMethod);
  state.parserEngine = "structured-json-review-v0.7";
  state.structuredJsonDetected = true;
  state.structuredRecordCount = (state.structuredRecordCount || 0) + incoming.length;
  state.lastExport = null;
  state.jsonBuildAttemptedNoAccepted = false;
  els.jsonOutput.value = "";
  addSourceLog(imported, "structured records appended");
  renderSummary();
  renderRecords();
  renderValidation({ ok: false, messages: [`Structured JSON records appended for review: ${incoming.length} record(s).`] });
  renderDiagnostics();
  setStatus(`Appended ${incoming.length} structured record(s) from ${imported.fileName || "SiteScribe JSON"}.`);
  showToast("Structured records appended.");
}

function applyImportedPayload(imported) {
  els.rawText.value = imported.rawText || "";
  if (imported.site && imported.site !== "not stated") els.siteInput.value = imported.site;
  else els.siteInput.value = "";
  if (imported.shiftDate) els.dateInput.value = imported.shiftDate;
  if (imported.captureMethod) setSelectValue(els.captureMethod, imported.captureMethod);

  state.rawText = imported.rawText || "";
  state.reviewFilter = "all";
  state.expandedProposalIndex = null;
  resetEmailDraftReviewState();
  state.packageFlags = imported.packageFlags || [];
  state.dailySummary = imported.dailySummary || "";
  state.parserEngine = imported.structuredSiteScribePackage ? "structured-json-review-v0.7" : (imported.kind === "json" ? "json-import-review-v0.7" : "rule-based-v0.7");
  state.sourceDateBasis = imported.dateBasis || "not set";
  state.lastExport = null;
  state.jsonBuildAttemptedNoAccepted = false;
  setSourceLog(imported, imported.structuredSiteScribePackage ? "structured records loaded" : "loaded");
  state.structuredJsonDetected = Boolean(imported.structuredSiteScribePackage);
  state.structuredRecordCount = imported.structuredSiteScribePackage ? (imported.structuredRecordCount || (imported.proposals || []).length) : 0;
  els.jsonOutput.value = "";

  if (imported.proposals && imported.proposals.length) {
    state.proposals = imported.proposals;
    renderSummary();
    renderRecords();
    renderValidation({ ok: false, messages: ["Imported existing records for review. Build or validate JSON after review."] });
    setStatus(`Imported ${imported.fileName}. Loaded ${state.proposals.length} record(s). Date basis: ${state.sourceDateBasis}.`);
  } else {
    state.proposals = [];
    renderSummary();
    renderRecords();
    renderValidation({ ok: false, messages: ["Imported raw text. Click Parse / Structure after review."] });
    setStatus(`Imported ${imported.fileName}. Date basis: ${state.sourceDateBasis}.`);
  }
  showToast("Import loaded.");
}

async function handleParse() {
  const rawText = els.rawText.value.trim();
  if (!rawText) {
    setStatus("Paste or load raw text first.");
    showToast("No raw text to parse.");
    return;
  }

  const dateInfo = resolveDateForImport({
    rawText,
    packageDate: els.dateInput.value,
    fallbackDate: todayString(),
  });
  if (dateInfo.date && (!els.dateInput.value || dateInfo.basis !== "date input")) {
    els.dateInput.value = dateInfo.date;
  }
  state.sourceDateBasis = dateInfo.basis;

  const context = getContext();
  setStatus("Parsing...");
  const result = await parseSourceText(rawText, context);

  state.rawText = rawText;
  state.proposals = result.proposedRecords || [];
  resetEmailDraftReviewState();
  state.reviewFilter = "all";
  state.expandedProposalIndex = null;
  state.packageFlags = result.packageFlags || [];
  state.dailySummary = result.dailySummary || "";
  state.parserEngine = result.parserEngine || "rule-based-v0.7";
  state.lastParseTime = nowIso();
  state.lastExport = null;
  state.jsonBuildAttemptedNoAccepted = false;
  els.jsonOutput.value = "";

  if (result.site && result.site !== "not stated" && !els.siteInput.value.trim()) {
    els.siteInput.value = result.site;
  }
  if (result.shiftDate && result.shiftDate !== "not stated") {
    els.dateInput.value = result.shiftDate;
  }

  renderSummary();
  renderRecords();
  renderValidation({ ok: false, messages: ["Build or validate JSON after review."] });
  renderDiagnostics();
  setStatus(`Parsed ${state.proposals.length} proposed record(s). Date basis: ${state.sourceDateBasis}.`);
}

function clearAll() {
  els.rawText.value = "";
  els.siteInput.value = "";
  els.dateInput.value = todayString();
  state.rawText = "";
  state.proposals = [];
  resetEmailDraftReviewState();
  state.packageFlags = [];
  state.dailySummary = "";
  state.parserEngine = "rule-based-v0.7";
  state.sourceDateBasis = "not set";
  state.sourceLog = [];
  state.skippedFiles = [];
  state.lastParseTime = "";
  state.jsonBuildAttemptedNoAccepted = false;
  state.structuredJsonDetected = false;
  state.structuredRecordCount = 0;
  state.pendingStructuredImport = null;
  state.importChoiceMode = "raw";
  state.reviewFilter = "all";
  state.expandedProposalIndex = null;
  state.cleanupLastMessage = "Cleanup tools ready.";
  state.aiRequestBuilt = false;
  state.aiRequestText = "";
  state.aiResultLoaded = false;
  state.aiResultRecordCount = 0;
  state.aiResultValidationWarningCount = 0;
  state.aiResultWarnings = [];
  state.aiResultSourceLabel = "";
  state.lastAiResultLoadTime = "";
  if (els.bulkSourceDateInput) els.bulkSourceDateInput.value = "";
  if (els.bulkSiteInput) els.bulkSiteInput.value = "";
  if (els.aiRequestOutput) els.aiRequestOutput.value = "";
  if (els.aiResultInput) els.aiResultInput.value = "";
  setAiBridgeStatus("AI bridge ready.");
  state.lastExport = null;
  els.jsonOutput.value = "";
  els.summaryOutput.className = "empty-state";
  els.summaryOutput.textContent = "No proposed records yet.";
  els.recordsRoot.className = "empty-state";
  els.recordsRoot.textContent = "No proposed records yet.";
  renderValidation({ ok: false, messages: ["Run validation after parsing or editing."] });
  setStatus("Ready.");
  renderDiagnostics();
  renderCleanupStatus();
}

function addBlankRecord() {
  const sourceDate = getContext().shiftDate;
  state.proposals.push(createProposal({
    category: "event",
    description: "",
    sourceText: "manual parser review entry",
    sourceDate,
    createdAt: isoFromSourceDate(sourceDate),
    updatedAt: nowIso(),
    flags: [],
    comments: [],
    accepted: true,
  }));
  state.expandedProposalIndex = state.proposals.length - 1;
  renderSummary();
  renderRecords();
}

function getContext() {
  return {
    site: normalizeText(els.siteInput.value) || "not stated",
    shiftDate: els.dateInput.value || "not stated",
    captureMethod: els.captureMethod.value || "plain text",
  };
}


// =====================================================
// MANUAL AI BRIDGE / SIMULATED API RETURN INTAKE
// This section does not perform API calls, store API keys, or send data.
// It prepares a manual AI request and accepts AI JSON through the same
// review-record pathway a future backend/API return can reuse.
// =====================================================
function buildAndDisplayAiRequest() {
  const rawText = els.rawText.value || state.rawText || "";
  if (!normalizeText(rawText)) {
    setAiBridgeStatus("Add raw intake text before building an AI request.");
    showToast("No raw intake for AI request.");
    return;
  }
  const request = buildAiParserRequest(rawText, getContext());
  state.aiRequestBuilt = true;
  state.aiRequestText = request;
  if (els.aiRequestOutput) els.aiRequestOutput.value = request;
  setAiBridgeStatus("AI request built. Use manual copy/paste or Parse with API if a server endpoint is configured.");
  renderDiagnostics();
  showToast("AI request built.");
}

function defaultAiRequestTemplate() {
  return [
    "You are the SiteScribe Parser.",
    "Convert the raw site notes into valid SiteScribe JSON only.",
    "Do not include markdown, explanations, commentary, or code fences in the response.",
    "Return one JSON object only.",
    "",
    "Critical rules:",
    "- Do not invent facts, names, dates, contacts, locations, email addresses, duties, or events.",
    "- Use \"not stated\" only when a required package-level value is missing.",
    "- Do not create packageFlags merely because site, shift date, or supervisor is not stated; only use packageFlags if the missing value blocks review.",
    "- Preserve sourceText for every primary record, secondary record, and flag when applicable.",
    "- Use only these category IDs: {{categories}}.",
    "- Attach missing or ambiguous information as flags on the related record when possible.",
    "- Use flags[] for missing information or clarification; do not create standalone clarification records.",
    "- Flag objects must use \"text\" for the flag wording. Do not use \"description\" for flags.",
    "- Keep the two-level model: primary records in records[] plus secondary records in comments[] only. No third-level nesting.",
    "- If one source note contains a main issue plus related updates, instructions, follow-ups, status changes, or end-of-day notes, create one primary record and place those independent child records in comments[].",
    "- Do not flatten every related detail into separate primary records unless the user clearly wrote it as a separate item.",
    "- Safety promotion rule: do not bury safety-critical hazards inside a miscellaneous or general follow-up record.",
    "- If a messy paragraph contains unrelated issues, promote safety-critical hazards, access hazards, fall hazards, missing guards/guardrails, blocked routes, electrical hazards, equipment conflicts, public-protection issues, or significant water/slip hazards into their own primary records.",
    "- Miscellaneous/general follow-up records are acceptable only for low-risk admin, coordination, housekeeping, or non-safety site notes.",
    "- If an item requires immediate safety review or could affect worker/public protection, create a safety record even if it appears inside a mixed paragraph.",
    "",
    "Result expectations:",
    "- Prefer safety only when the item affects worker safety, access/egress, fire route, fall protection, electrical risk, equipment conflicts, public protection, site security, significant slip/trip risk, or a similar construction-site hazard.",
    "- Use action for ordinary coordination, admin, supplies, cleanup, reminders, minor site organization, or non-safety follow-up.",
    "- Use communication when the record is mainly a conversation, notice, instruction, request, or confirmation between people or companies.",
    "- Use scheduled when the record is mainly a planned future event, planned work activity, appointment, lift, delivery, inspection, meeting, or site attendance with a date/time or clearly planned timing.",
    "- Use event when the record is mainly a factual site occurrence, completed activity, arrival, observed condition, daily log, or historical note.",
    "- Use document only for records mainly about forms, reports, drawings, permits, lift plans, insurance, safety documents, photos, attachments, or required paperwork.",
    "- Avoid vague primary records titled miscellaneous, general notes, several issues, or follow-up items when the source contains separable issues with different categories or safety levels.",
    "- Keep low-risk related details as secondary records when they belong under one primary record; promote separate high-risk items to their own primary records.",
    "- Simple independent instructions may become separate records.",
    "- If an action belongs under a primary record, put it in comments[] as a secondary record unless it is clearly separate or safety-critical.",
    "- If a scheduled item has no real date/time, classify it as action, not scheduled.",
    "- Status must be open or closed. Use open unless the note clearly says the item is closed/completed.",
    "- Every primary record and every secondary record must include deliverable: { \"apply\": boolean, \"date\": \"YYYY-MM-DD or blank\" }.",
    "- Set deliverable.apply=true only when the source clearly states a due, delivery, expected, required-by, scheduled-for, or completion date for that primary or secondary record.",
    "- If no deliverable date clearly fits, set deliverable.apply=false and deliverable.date=\"\". The Review Console user can enable/edit it later.",
    "- Resolve relative deliverable dates such as tomorrow, Friday, next Tuesday, or by July 15 using the Shift Date context when possible. If the date cannot be resolved confidently, leave apply=false and use a clarification flag if needed.",
    "",
    "Email-action rules:",
    "- Create an email action when the source explicitly instructs the user to email, contact by email, request a decision from, or copy a named person. Do not infer a new email action from ordinary mentions or from statements that an email was already sent.",
    "- Resolve every To and CC name only from the Project Contact Directory below. Never invent or return an email address or contact ID.",
    "- If a named To recipient is not in the directory, still create the email draft with recipientIds=[] and preserve the literal source name in unresolvedRecipientNames.",
    "- If a named CC recipient is not in the directory, still create the email draft and preserve the literal source name in unresolvedCcRecipientNames.",
    "- A draft with any unresolved To/CC name, no resolved To contact, missing subject, or missing body must use action.state=needs_information. Otherwise use proposed.",
    "- Keep the factual information as the primary record and create the email function as a secondary record.",
    "- The action secondary record must use action.type=communication, action.method=email_draft, a concise purpose, recipientIds, ccRecipientIds, unresolvedRecipientNames, unresolvedCcRecipientNames, an editable subject, and an editable body.",
    "- Put the explicit response-needed or action-due date on the action secondary record deliverable. If the date is unclear, leave the deliverable disabled and attach a clarification flag to the primary.",
    "- Do not claim the email was prepared, opened, sent, received, or acknowledged.",
    "- Do not omit an explicitly requested draft merely because a To or CC name cannot be resolved.",
    "",
    "Required output shape:",
    "{",
    "  \"packageType\": \"sitescribe_two_level_records\",",
    "  \"version\": \"1.0\",",
    "  \"site\": \"site name or not stated\",",
    "  \"shiftDate\": \"YYYY-MM-DD or not stated\",",
    "  \"processedAt\": \"ISO timestamp\",",
    "  \"source\": { \"captureMethod\": \"plain text\", \"rawText\": \"original raw notes\" },",
    "  \"dailySummary\": \"short summary\",",
    "  \"reviewConsole\": { \"appName\": \"SiteScribe Review Console\", \"appVersion\": \"v0.6.39 or later\", \"model\": \"two-level-records-with-record-flags\" },",
    "  \"packageFlags\": [],",
    "  \"records\": [",
    "    {",
    "      \"id\": \"rec_unique_id\",",
    "      \"category\": \"event|action|followup|scheduled|safety|communication|document\",",
    "      \"description\": \"clean record title\",",
    "      \"status\": \"open\",",
    "      \"createdAt\": \"ISO timestamp\",",
    "      \"updatedAt\": \"ISO timestamp\",",
    "      \"closedAt\": \"\",",
    "      \"sourceDate\": \"YYYY-MM-DD or not stated\",",
    "      \"sourceText\": \"exact original wording that supports this record\",",
    "      \"deliverable\": { \"apply\": false, \"date\": \"\" },",
    "      \"flags\": [],",
    "      \"comments\": [",
    "        { \"id\": \"com_unique_id\", \"text\": \"secondary update\", \"status\": \"open\", \"createdAt\": \"ISO timestamp\", \"updatedAt\": \"ISO timestamp\", \"sourceText\": \"supporting wording\", \"deliverable\": { \"apply\": false, \"date\": \"\" }, \"action\": { \"type\": \"communication\", \"method\": \"email_draft\", \"purpose\": \"request_decision\", \"state\": \"proposed or needs_information\", \"recipientIds\": [\"known_contact_id\"], \"ccRecipientIds\": [], \"unresolvedRecipientNames\": [], \"unresolvedCcRecipientNames\": [], \"subject\": \"editable subject\", \"body\": \"editable body\", \"source\": \"parser_ai\" } }",
    "      ]",
    "    }",
    "  ]",
    "}",
    "",
    "Context:",
    "Site / Memory Name: {{site}}",
    "Shift Date: {{shiftDate}}",
    "Capture Method: {{captureMethod}}",
    "Parser Lite Version: {{appVersion}}",
    "Template: {{templateName}} {{templateVersion}}",
    "Project Contact Directory:",
    "{{contacts}}",
    "",
    "Raw site notes:",
    "--- BEGIN RAW NOTES ---",
    "{{rawText}}",
    "--- END RAW NOTES ---"
  ].join("\n");
}

function initializeAiTemplate() {
  const fallback = {
    name: "SiteScribe Standard",
    version: "v1.3",
    text: defaultAiRequestTemplate(),
    savedAt: ""
  };
  let loaded = fallback;
  try {
    const stored = window.localStorage && window.localStorage.getItem("sitescribe_parser_lite_ai_template_v1_3");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && normalizeText(parsed.text)) {
        loaded = {
          name: normalizeText(parsed.name) || fallback.name,
          version: normalizeText(parsed.version) || fallback.version,
          text: parsed.text,
          savedAt: parsed.savedAt || ""
        };
      }
    }
  } catch (error) {
    loaded = fallback;
  }
  state.aiTemplateName = loaded.name;
  state.aiTemplateVersion = loaded.version;
  state.aiTemplateText = loaded.text;
  state.aiTemplateSavedAt = loaded.savedAt;
  syncAiTemplateUi();
}

function syncAiTemplateUi() {
  if (els.aiTemplateNameInput) els.aiTemplateNameInput.value = state.aiTemplateName || "SiteScribe Standard";
  if (els.aiTemplateVersionInput) els.aiTemplateVersionInput.value = state.aiTemplateVersion || "v1";
  if (els.aiTemplateInput) els.aiTemplateInput.value = state.aiTemplateText || defaultAiRequestTemplate();
  if (els.aiTemplateSummary) els.aiTemplateSummary.textContent = `${state.aiTemplateName || "SiteScribe Standard"} ${state.aiTemplateVersion || "v1"}`;
  if (els.aiTemplateStatus) {
    els.aiTemplateStatus.textContent = state.aiTemplateSavedAt
      ? `Template loaded. Last saved ${formatDateTime(state.aiTemplateSavedAt)}.`
      : "Default template loaded.";
  }
}

function saveAiTemplateFromUi() {
  const template = {
    name: normalizeText(els.aiTemplateNameInput && els.aiTemplateNameInput.value) || "SiteScribe Standard",
    version: normalizeText(els.aiTemplateVersionInput && els.aiTemplateVersionInput.value) || "v1",
    text: (els.aiTemplateInput && els.aiTemplateInput.value) || defaultAiRequestTemplate(),
    savedAt: new Date().toISOString()
  };
  if (!normalizeText(template.text)) {
    setAiTemplateStatus("Template cannot be blank.");
    showToast("Template cannot be blank.");
    return;
  }
  state.aiTemplateName = template.name;
  state.aiTemplateVersion = template.version;
  state.aiTemplateText = template.text;
  state.aiTemplateSavedAt = template.savedAt;
  try {
    window.localStorage.setItem("sitescribe_parser_lite_ai_template_v1_3", JSON.stringify(template));
    syncAiTemplateUi();
    setAiTemplateStatus("Template saved in this browser.");
    showToast("AI template saved.");
  } catch (error) {
    setAiTemplateStatus("Template updated for this session, but browser save failed.");
    showToast("Template save unavailable.");
  }
}

function restoreDefaultAiTemplate() {
  state.aiTemplateName = "SiteScribe Standard";
  state.aiTemplateVersion = "v1.3";
  state.aiTemplateText = defaultAiRequestTemplate();
  state.aiTemplateSavedAt = new Date().toISOString();
  if (els.aiTemplateNameInput) els.aiTemplateNameInput.value = state.aiTemplateName;
  if (els.aiTemplateVersionInput) els.aiTemplateVersionInput.value = state.aiTemplateVersion;
  if (els.aiTemplateInput) els.aiTemplateInput.value = state.aiTemplateText;
  try {
    window.localStorage.setItem("sitescribe_parser_lite_ai_template_v1_3", JSON.stringify({
      name: state.aiTemplateName,
      version: state.aiTemplateVersion,
      text: state.aiTemplateText,
      savedAt: state.aiTemplateSavedAt
    }));
  } catch (error) {
    // Browser storage is optional for template restore.
  }
  syncAiTemplateUi();
  setAiTemplateStatus("Default template restored.");
  showToast("Default AI template restored.");
}

function setAiTemplateStatus(message) {
  if (els.aiTemplateStatus) els.aiTemplateStatus.textContent = message;
}

function activeAiTemplateFromUi() {
  return {
    name: normalizeText(els.aiTemplateNameInput && els.aiTemplateNameInput.value) || state.aiTemplateName || "SiteScribe Standard",
    version: normalizeText(els.aiTemplateVersionInput && els.aiTemplateVersionInput.value) || state.aiTemplateVersion || "v1",
    text: (els.aiTemplateInput && els.aiTemplateInput.value) || state.aiTemplateText || defaultAiRequestTemplate()
  };
}

function buildAiParserRequest(rawText, context = {}) {
  const template = activeAiTemplateFromUi();
  const request = PARSER_CORE.buildRequest({
    rawText,
    context,
    categories: CATEGORY_OPTIONS,
    template,
    appVersion: APP_VERSION,
    modelName: MODEL_NAME,
    contacts: state.projectContacts
  });
  state.aiTemplateName = template.name;
  state.aiTemplateVersion = template.version;
  state.aiTemplateText = template.text;
  if (els.aiTemplateSummary) els.aiTemplateSummary.textContent = `${template.name} ${template.version}`;
  return request;
}
async function copyAiRequest() {
  const text = (els.aiRequestOutput && els.aiRequestOutput.value) || state.aiRequestText || "";
  if (!normalizeText(text)) {
    setAiBridgeStatus("Build an AI request before copying.");
    showToast("No AI request to copy.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setAiBridgeStatus("AI request copied. Paste it into ChatGPT.");
    showToast("AI request copied.");
  } catch (error) {
    if (els.aiRequestOutput) {
      els.aiRequestOutput.focus();
      els.aiRequestOutput.select();
    }
    setAiBridgeStatus("AI request selected for manual copy.");
    showToast("AI request selected.");
  }
}

function clearAiRequest() {
  state.aiRequestBuilt = false;
  state.aiRequestText = "";
  if (els.aiRequestOutput) els.aiRequestOutput.value = "";
  setAiBridgeStatus("AI request cleared.");
  renderDiagnostics();
}


function initializeApiSettings() {
  let endpoint = PRODUCTION_API_ENDPOINT;
  try {
    const stored = window.localStorage && window.localStorage.getItem("sitescribe_parser_lite_api_endpoint_override_v2");
    if (normalizeText(stored) && !isUnsafeLegacyEndpoint(stored)) endpoint = stored.trim();
  } catch (error) {
    endpoint = PRODUCTION_API_ENDPOINT;
  }
  state.apiEndpoint = endpoint || PRODUCTION_API_ENDPOINT;
  syncApiSettingsUi();
}

function isUnsafeLegacyEndpoint(endpoint) {
  const text = normalizeText(endpoint).toLowerCase();
  return !text || text.includes("localhost") || text.includes("127.0.0.1");
}

function syncApiSettingsUi() {
  if (els.apiEndpointInput) els.apiEndpointInput.value = state.apiEndpoint || PRODUCTION_API_ENDPOINT;
  if (els.apiStatusLine) els.apiStatusLine.textContent = `API mode idle. Endpoint: ${state.apiEndpoint || PRODUCTION_API_ENDPOINT}`;
  updateApiModeSummary();
}

function updateApiModeSummary() {
  if (!els.apiModeSummary) return;
  const status = state.apiLastStatus || "not tested";
  els.apiModeSummary.textContent = `endpoint ${status}`;
}

function getApiEndpointFromUi() {
  return normalizeText(els.apiEndpointInput && els.apiEndpointInput.value) || PRODUCTION_API_ENDPOINT;
}

function saveApiEndpointFromUi() {
  const endpoint = getApiEndpointFromUi();
  state.apiEndpoint = endpoint;
  try {
    window.localStorage.setItem("sitescribe_parser_lite_api_endpoint_override_v2", endpoint);
    setApiStatus(`API endpoint saved: ${endpoint}`);
    showToast("API endpoint saved.");
  } catch (error) {
    setApiStatus(`API endpoint set for this session: ${endpoint}`);
    showToast("API endpoint set.");
  }
  updateApiModeSummary();
}

function resetApiEndpointToProduction() {
  state.apiEndpoint = PRODUCTION_API_ENDPOINT;
  if (els.apiEndpointInput) els.apiEndpointInput.value = PRODUCTION_API_ENDPOINT;
  try {
    if (window.localStorage) {
      window.localStorage.removeItem("sitescribe_parser_lite_api_endpoint_v1");
      window.localStorage.removeItem("sitescribe_parser_lite_api_endpoint_override_v2");
    }
  } catch (error) {}
  setApiStatus(`API endpoint reset to production: ${PRODUCTION_API_ENDPOINT}`);
  showToast("Production endpoint restored.");
  updateApiModeSummary();
}

function setApiStatus(message) {
  state.apiLastStatus = message || state.apiLastStatus || "not tested";
  if (els.apiStatusLine) els.apiStatusLine.textContent = message;
  updateApiModeSummary();
}

async function testApiConnection() {
  const endpoint = getApiEndpointFromUi();
  state.apiEndpoint = endpoint;
  setApiBusy(true);
  startApiProgress("Testing API endpoint");
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });
    const data = await safeReadJson(response);
    if (!response.ok || (data && data.ok === false)) {
      throw new Error(apiErrorMessage(data, response.status));
    }
    state.apiLastCallTime = new Date().toISOString();
    state.apiLastModel = data && data.model ? data.model : "not reported";
    setApiStatus(`API endpoint reachable${state.apiLastModel !== "not reported" ? `; model ${state.apiLastModel}` : ""}.`);
    showToast("API endpoint reachable.");
  } catch (error) {
    setApiStatus(`API test failed: ${error.message || error}`);
    showToast("API test failed.");
  } finally {
    stopApiProgress();
    setApiBusy(false);
    renderDiagnostics();
  }
}

async function parseWithApi() {
  const parseStartedAt = Date.now();
  if (!(state.projectContacts || []).length) await loadProjectContacts();
  const rawText = els.rawText.value || state.rawText || "";
  if (!normalizeText(rawText)) {
    setApiStatus("Add raw intake text before using AI Parse.");
    showToast("No raw intake for AI Parse.");
    return;
  }
  const endpoint = getApiEndpointFromUi();
  state.apiEndpoint = endpoint;
  const request = buildAiParserRequest(rawText, getContext());
  state.aiRequestBuilt = true;
  state.aiRequestText = request;
  if (els.aiRequestOutput) els.aiRequestOutput.value = request;

  setApiBusy(true);
  startApiProgress("AI Parse processing");
  setAiBridgeStatus("AI Parse in progress. Validation and review loading will happen automatically.");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        request,
        context: getContext(),
        appVersion: APP_VERSION,
        modelName: MODEL_NAME,
        template: activeAiTemplateFromUi()
      })
    });
    const data = await safeReadJson(response);
    if (!response.ok || !data || data.ok === false) {
      throw new Error(apiErrorMessage(data, response.status));
    }
    const resultText = apiResultText(data);
    if (!normalizeText(resultText)) {
      throw new Error("API returned no JSON text.");
    }
    if (els.aiResultInput) els.aiResultInput.value = resultText;
    state.apiLastCallTime = new Date().toISOString();
    state.apiLastModel = data.model || data.modelUsed || state.apiLastModel || "not reported";
    setApiStatus(`AI Parse returned result${state.apiLastModel !== "not reported" ? ` from ${state.apiLastModel}` : ""}. Validating and loading automatically...`);
    const loaded = autoValidateAndLoadAiResult("API result");
    if (loaded) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - parseStartedAt) / 1000));
      setApiStatus(`Parse completed in ${elapsedSeconds} second${elapsedSeconds === 1 ? "" : "s"}. ${state.aiResultRecordCount || 0} record(s) loaded for review.`);
      setAiBridgeStatus(`AI response validated. ${state.aiResultRecordCount || 0} record(s) loaded for review.`);
      showToast("AI Parse complete.");
    }
  } catch (error) {
    setApiStatus(`AI Parse failed: ${error.message || error}`);
    setAiBridgeStatus("AI Parse failed. Manual copy/paste bridge is still available.");
    showToast("AI Parse failed.");
  } finally {
    stopApiProgress();
    setApiBusy(false);
    renderDiagnostics();
  }
}

function startApiProgress(prefix) {
  stopApiProgress();
  const startedAt = Date.now();
  state.apiBusyStartedAt = startedAt;
  let tickCount = 0;
  const baseLabel = prefix || "Processing";
  const tick = () => {
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const dots = ".".repeat((tickCount % 3) + 1);
    const message = API_PROGRESS_MESSAGES[tickCount % API_PROGRESS_MESSAGES.length];
    state.apiProgressMessage = `${baseLabel}${dots} ${message} · ${elapsed}s elapsed`;
    setApiStatus(state.apiProgressMessage);
    tickCount += 1;
  };
  tick();
  apiProgressTimer = window.setInterval(tick, 1000);
}

function stopApiProgress() {
  if (apiProgressTimer) {
    window.clearInterval(apiProgressTimer);
    apiProgressTimer = null;
  }
  state.apiBusyStartedAt = 0;
  state.apiProgressMessage = "";
}

function setApiBusy(isBusy) {
  [els.testApiConnectionButton, els.parseWithApiButton, els.saveApiEndpointButton].forEach(button => {
    if (button) button.disabled = Boolean(isBusy);
  });
}

async function safeReadJson(response) {
  const text = await response.text();
  if (!normalizeText(text)) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return { ok: false, error: text.slice(0, 500) };
  }
}

function apiErrorMessage(data, status) {
  if (data && data.error) return data.error;
  if (data && data.message) return data.message;
  return status ? `HTTP ${status}` : "Unknown API error";
}

function apiResultText(data) {
  if (!data || typeof data !== "object") return "";
  if (data.json && typeof data.json === "object") return JSON.stringify(data.json, null, 2);
  if (typeof data.resultText === "string") return data.resultText;
  if (typeof data.outputText === "string") return data.outputText;
  if (typeof data.output_text === "string") return data.output_text;
  if (typeof data.text === "string") return data.text;
  return "";
}

async function handleAiResultDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  if (els.aiResultInput) els.aiResultInput.classList.remove("drag-over");
  const dt = event.dataTransfer;
  const files = Array.from(dt && dt.files ? dt.files : []);
  if (files.length) {
    const file = files[0];
    if (!/\.(json|txt)$/i.test(file.name || "") && !/^(application\/json|text\/plain)$/i.test(file.type || "")) {
      setAiBridgeStatus("AI result drop supports .json or .txt files only.");
      showToast("Unsupported AI result file.");
      return;
    }
    try {
      const text = await readFileAsText(file);
      els.aiResultInput.value = text;
      setAiBridgeStatus(`AI result file loaded into return box: ${file.name || "dropped file"}. Use Import Pasted Result to validate and load it.`);
      showToast("AI result file loaded.");
    } catch (error) {
      setAiBridgeStatus("Unable to read AI result file.");
      showToast("AI result read failed.");
    }
    return;
  }
  const text = dt ? (dt.getData("text/plain") || dt.getData("text/html")) : "";
  if (normalizeText(text)) {
    els.aiResultInput.value = text;
    setAiBridgeStatus("Dropped AI result text loaded. Use Import Pasted Result to validate and load it.");
    showToast("AI result text loaded.");
  }
}


function autoValidateAndLoadAiResult(sourceLabel = "AI result") {
  const text = els.aiResultInput ? els.aiResultInput.value : "";
  const extracted = extractJsonFromAiText(text);
  if (!extracted.ok) {
    state.aiResultValidationWarningCount = 1;
    state.aiResultWarnings = [extracted.message];
    setAiBridgeStatus(extracted.message);
    renderDiagnostics();
    showToast("AI result invalid.");
    return false;
  }
  const validation = validateAiParserResult(extracted.json);
  state.aiResultValidationWarningCount = validation.messages.length;
  state.aiResultWarnings = validation.messages;
  if (!validation.ok) {
    setAiBridgeStatus(`AI result could not be loaded: ${validation.messages.join(" ")}`);
    renderDiagnostics();
    showToast("AI result not loaded.");
    return false;
  }
  loadAiResultAsReviewRecords(extracted.json, sourceLabel);
  return true;
}

function validateDisplayedAiResult() {
  const text = els.aiResultInput ? els.aiResultInput.value : "";
  const extracted = extractJsonFromAiText(text);
  if (!extracted.ok) {
    state.aiResultValidationWarningCount = 1;
    state.aiResultWarnings = [extracted.message];
    setAiBridgeStatus(extracted.message);
    renderDiagnostics();
    showToast("AI result invalid.");
    return null;
  }
  const validation = validateAiParserResult(extracted.json);
  state.aiResultValidationWarningCount = validation.messages.length;
  state.aiResultWarnings = validation.messages;
  setAiBridgeStatus(validation.messages.length ? `AI result parsed with ${validation.messages.length} warning(s).` : "AI result validation passed. This check is now automatic during AI Parse and Import Pasted Result.");
  renderDiagnostics();
  showToast(validation.ok ? "AI result valid." : "AI result has warnings.");
  return { json: extracted.json, validation };
}

function loadDisplayedAiResult() {
  const text = els.aiResultInput ? els.aiResultInput.value : "";
  const extracted = extractJsonFromAiText(text);
  if (!extracted.ok) {
    state.aiResultValidationWarningCount = 1;
    state.aiResultWarnings = [extracted.message];
    setAiBridgeStatus(extracted.message);
    renderDiagnostics();
    showToast("AI result invalid.");
    return;
  }
  autoValidateAndLoadAiResult("manual AI result");
}

function clearAiResult() {
  if (els.aiResultInput) els.aiResultInput.value = "";
  state.aiResultLoaded = false;
  state.aiResultRecordCount = 0;
  state.aiResultValidationWarningCount = 0;
  state.aiResultWarnings = [];
  state.aiResultSourceLabel = "";
  state.lastAiResultLoadTime = "";
  setAiBridgeStatus("AI result cleared.");
  renderDiagnostics();
}

function extractJsonFromAiText(text) {
  return PARSER_CORE.extractJson(text);
}

function extractBalancedJsonObject(text) {
  return PARSER_CORE.extractBalancedJsonObject(text);
}

function validateAiParserResult(json) {
  return PARSER_CORE.validateResult(json, CATEGORY_OPTIONS);
}

function handleAiParserResult(json, sourceLabel = "AI result") {
  const validation = validateAiParserResult(json);
  state.aiResultValidationWarningCount = validation.messages.length;
  state.aiResultWarnings = validation.messages;
  if (!validation.ok) {
    setAiBridgeStatus(`AI result could not be loaded: ${validation.messages.join(" ")}`);
    renderDiagnostics();
    showToast("AI result not loaded.");
    return;
  }
  loadAiResultAsReviewRecords(json, sourceLabel);
}

function loadAiResultAsReviewRecords(json, sourceLabel = "AI result") {
  const imported = parseImportedPayload(JSON.stringify(json), {
    name: sourceLabel,
    type: "application/json",
    lastModified: Date.now(),
  });
  imported.kind = "ai-result";
  imported.fileName = sourceLabel;
  imported.captureMethod = "AI Parser Bridge";
  imported.structuredSiteScribePackage = true;
  imported.structuredRecordCount = Array.isArray(json.records) ? json.records.length : 0;
  imported.proposals = (json.records || []).map(record => importedRecordToProposal(record, imported.shiftDate));
  imported.packageFlags = Array.isArray(json.packageFlags) ? json.packageFlags.map(flag => normalizeImportedFlag(flag, imported.shiftDate)) : [];
  imported.dailySummary = json.dailySummary || "";
  requestApplyAiResultPayload(imported);
}

function requestApplyAiResultPayload(imported) {
  if (!imported) return;
  const hasReviewRecords = Boolean((state.proposals || []).length || (state.packageFlags || []).length);
  if (hasReviewRecords) {
    state.pendingImport = imported;
    state.importChoiceMode = "ai-result";
    showImportChoice(imported);
    return;
  }
  replaceAiResultRecords(imported);
}

function appendAiResultRecords(imported) {
  const incoming = Array.isArray(imported.proposals) ? imported.proposals : [];
  const cloned = incoming.map(record => createProposal({ ...record, id: record.id || createId("prop") }));
  state.proposals = [...state.proposals, ...cloned];
  state.packageFlags = [...(state.packageFlags || []), ...(imported.packageFlags || [])];
  if (!state.dailySummary && imported.dailySummary) state.dailySummary = imported.dailySummary;
  applyAiResultMetadata(imported, cloned.length, "appended");
  renderSummary();
  renderRecords();
  renderValidation({ ok: false, messages: [`AI result appended for review: ${cloned.length} record(s).`] });
  setAiBridgeStatus(`AI result appended: ${cloned.length} record(s).`);
  setStatus(`AI result appended to review records from ${imported.fileName || "AI result"}.`);
  showToast("AI result appended.");
}

function replaceAiResultRecords(imported) {
  const incoming = Array.isArray(imported.proposals) ? imported.proposals : [];
  state.proposals = incoming.map(record => createProposal({ ...record, id: record.id || createId("prop") }));
  resetEmailDraftReviewState();
  state.packageFlags = imported.packageFlags || [];
  state.dailySummary = imported.dailySummary || "";
  state.reviewFilter = "all";
  state.expandedProposalIndex = null;
  applyAiResultMetadata(imported, state.proposals.length, "loaded");
  renderSummary();
  renderRecords();
  renderValidation({ ok: false, messages: [`AI result loaded for review: ${state.proposals.length} record(s).`] });
  setAiBridgeStatus(`AI result loaded as review records: ${state.proposals.length} record(s).`);
  setStatus(`AI result loaded as review records from ${imported.fileName || "AI result"}.`);
  showToast("AI result loaded.");
}

function applyAiResultMetadata(imported, recordCount, status) {
  if (!els.siteInput.value.trim() && imported.site && imported.site !== "not stated") els.siteInput.value = imported.site;
  if (imported.shiftDate) {
    els.dateInput.value = imported.shiftDate;
    state.sourceDateBasis = imported.dateBasis || state.sourceDateBasis || "AI result shiftDate";
  }
  state.parserEngine = "manual-ai-bridge-v0.7";
  state.structuredJsonDetected = true;
  state.structuredRecordCount = imported.structuredRecordCount || recordCount || 0;
  state.aiResultLoaded = true;
  state.aiResultRecordCount = recordCount || 0;
  state.aiResultSourceLabel = imported.fileName || "AI result";
  state.lastAiResultLoadTime = nowIso();
  state.lastExport = null;
  state.jsonBuildAttemptedNoAccepted = false;
  if (els.jsonOutput) els.jsonOutput.value = "";
  addSourceLog(imported, status || "AI result loaded");
  renderDiagnostics();
}

function setAiBridgeStatus(message) {
  if (els.aiBridgeStatus) els.aiBridgeStatus.textContent = message;
}

// =====================================================
// PARSER ENGINE ADAPTER
// Swap this section later for AI/API parsing.
// The UI, review page, validation, and export should keep
// calling parseSourceText regardless of the parser engine.
// =====================================================
async function parseSourceText(rawText, context = {}) {
  return ruleBasedParse(rawText, context);
}

function ruleBasedParse(rawText, context = {}) {
  const metadata = extractMetadata(rawText, context);
  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const proposedRecords = [];
  const packageFlags = [];

  for (const line of lines) {
    if (isMetadataLine(line) || isImportSeparatorLine(line)) continue;
    const parsed = parseLineToProposal(line, metadata);
    if (parsed) proposedRecords.push(parsed);
  }

  if (!metadata.site || metadata.site === "not stated") {
    packageFlags.push(createPackageFlag("incomplete", "Site name not stated.", "site metadata", metadata.shiftDate));
  }
  if (!metadata.shiftDate || metadata.shiftDate === "not stated") {
    packageFlags.push(createPackageFlag("incomplete", "Shift date not stated.", "date metadata", metadata.shiftDate));
  }

  return {
    parserEngine: "manual-ai-bridge-v0.8",
    site: metadata.site || "not stated",
    shiftDate: metadata.shiftDate || "not stated",
    dailySummary: createDailySummary(proposedRecords),
    proposedRecords,
    packageFlags,
    rawText,
  };
}

function extractMetadata(rawText, context = {}) {
  let site = context.site || "not stated";
  let shiftDate = context.shiftDate || "not stated";

  const siteMatch = rawText.match(/^\s*site\s*:\s*(.+)$/im);
  if (siteMatch) site = normalizeText(siteMatch[1]);

  const dateInfo = resolveDateForImport({ rawText, packageDate: shiftDate, fallbackDate: shiftDate });
  if (dateInfo.date) shiftDate = dateInfo.date;

  return { site: site || "not stated", shiftDate: shiftDate || "not stated" };
}

function isMetadataLine(line) {
  return /^\s*(site|date|supervisor)\s*:/i.test(line);
}

function isImportSeparatorLine(line) {
  const text = normalizeText(line);
  if (!text) return true;
  // v0.2/v0.2.1 append and multi-file imports add source separators to the raw intake.
  // These are transport markers only and must never become proposed records.
  return /^---\s*source\s*:.+---$/i.test(text)
    || /^source\s*file\s*:.+$/i.test(text)
    || /^imported\s*source\s*:.+$/i.test(text);
}

function parseLineToProposal(line, metadata) {
  const original = line;
  const lineDate = extractLeadingDate(line);
  if (lineDate.date) line = lineDate.remainder;

  // Date-only lines such as "June 24, 2026" establish source date,
  // but they are not records. Do not create blank/untitled proposals.
  if (!normalizeText(line) || isImportSeparatorLine(line)) return null;

  const sourceDate = lineDate.date || metadata.shiftDate || "not stated";
  const createdAt = isoFromSourceDate(sourceDate);

  const timeMatch = line.match(/^\[?([0-2]?\d:[0-5]\d)\]?\s*/);
  const timePrefix = timeMatch ? timeMatch[1] : "";
  if (timeMatch) line = line.slice(timeMatch[0].length).trim();

  // Time-only lines or timestamp-only separators are not records.
  if (!normalizeText(line) || isImportSeparatorLine(line)) return null;

  const cue = extractCue(line);
  let category = cue.category || inferCategory(line, timePrefix);
  let body = normalizeText(cue.body || line);

  if (!body) return null;

  if (category === "scheduled" && !hasScheduledDateOrTime(body)) {
    category = "action";
  }

  const description = buildDescription(category, body, timePrefix);
  const flags = buildFlags(body, category, original, { ...metadata, shiftDate: sourceDate });
  const comments = buildComments(body, category, original, sourceDate);
  const deliverable = detectDeliverable(body, sourceDate);

  return createProposal({
    category,
    description,
    status: "open",
    sourceDate,
    sourceText: original,
    deliverable,
    createdAt,
    updatedAt: createdAt,
    flags,
    comments,
    accepted: true,
  });
}

function extractCue(line) {
  const match = line.match(/^([A-Za-z][A-Za-z\-\/ ]{0,24})(?:\s*[:,-]\s*|\s+-\s+)(.+)$/);
  if (!match) return { category: "", body: line };
  const cueRaw = match[1].trim().toLowerCase();
  const body = match[2].trim();
  const category = cueToCategory(cueRaw);
  return { category, body };
}

function cueToCategory(cueRaw) {
  const cue = cueRaw.replace(/[^a-z\- ]/g, "").trim();
  if (["event", "timeline", "log", "daily log"].includes(cue)) return "event";
  if (["action", "todo", "to-do", "task"].includes(cue)) return "action";
  if (["followup", "follow-up", "waiting", "wait"].includes(cue)) return "followup";
  if (["scheduled", "schedule", "appointment", "meeting"].includes(cue)) return "scheduled";
  if (["safety", "hazard", "warning", "violation"].includes(cue)) return "safety";
  if (["communication", "email", "call", "message"].includes(cue)) return "communication";
  if (["document", "doc", "file", "insurance", "permit", "liftplan", "lift plan"].includes(cue)) return "document";
  return "";
}

function inferCategory(text, timePrefix) {
  const lower = text.toLowerCase();
  if (/\b(hazard|unsafe|blocked|blocking|warning|violation|ppe|fall|trip|electrical|excavation)\b/.test(lower)) return "safety";
  if (/\b(lift plan|insurance|permit|drawing|document|certificate|file)\b/.test(lower)) return "document";
  if (/\b(email|call|message|texted|notified)\b/.test(lower)) return "communication";
  if (/\b(follow up|follow-up|confirm|check back|waiting)\b/.test(lower)) return "followup";
  if (/\b(book|need|send|request|ask|schedule)\b/.test(lower)) return hasScheduledDateOrTime(lower) ? "scheduled" : "action";
  if (timePrefix || /\b(arrived|started|completed|observed|noticed|left|moved)\b/.test(lower)) return "event";
  return "event";
}

function buildDescription(category, body, timePrefix) {
  let text = sentenceCase(body);
  if (category === "document" && /^need\b/i.test(body)) {
    text = "Required document: " + sentenceCase(body.replace(/^need\s+/i, ""));
  }
  if (timePrefix && !text.includes(timePrefix)) {
    text = `${timePrefix} - ${text}`;
  }
  return text;
}


function detectDeliverable(text, sourceDate) {
  const body = String(text || "");
  const lower = body.toLowerCase();
  const hasDeliverableCue = /\b(deliver|delivery|due|by|before|required by|needed by|complete by|finish by|expected|scheduled for|booked for|on site|arrive|arrives|bring|supply)\b/.test(lower);
  if (!hasDeliverableCue) return { apply: false, date: "" };
  const date = findDeliverableDate(body, sourceDate);
  return date ? { apply: true, date } : { apply: false, date: "" };
}

function findDeliverableDate(text, sourceDate) {
  const source = String(text || "");
  const explicit = findDateInText(source);
  if (explicit) return explicit;

  const base = normalizeDate(sourceDate) || todayString();
  const lower = source.toLowerCase();
  if (/\btomorrow\b/.test(lower)) return addDaysToDate(base, 1);
  if (/\btoday\b/.test(lower)) return base;

  const nextWeekday = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (nextWeekday) return resolveWeekdayDate(base, nextWeekday[1], true);

  const weekday = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (weekday) return resolveWeekdayDate(base, weekday[1], false);

  const monthDay = lower.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b/i);
  if (monthDay) {
    const year = Number(base.slice(0, 4));
    let date = normalizeNamedMonthDate(monthDay[1], monthDay[2], String(year));
    if (date && date < base) date = normalizeNamedMonthDate(monthDay[1], monthDay[2], String(year + 1));
    if (date) return date;
  }

  return "";
}

function addDaysToDate(dateValue, days) {
  const date = new Date(`${normalizeDate(dateValue)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function resolveWeekdayDate(baseDate, weekdayName, forceNextWeek) {
  const weekdays = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const target = weekdays[String(weekdayName || "").toLowerCase()];
  if (target === undefined) return "";
  const date = new Date(`${normalizeDate(baseDate)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  let delta = target - date.getUTCDay();
  if (delta < 0 || (delta === 0 && forceNextWeek)) delta += 7;
  if (forceNextWeek && delta < 7) delta += 7;
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function normalizeDeliverable(value) {
  if (!value || typeof value !== "object") return { apply: false, date: "" };
  const date = normalizeDate(value.date) || "";
  return {
    apply: Boolean(value.apply && date),
    date: value.apply ? date : (date || "")
  };
}

function getDeliverableDisplayInfo(item) {
  if (!item) return { active: false, className: "deliverable-none", label: "No deliverable date" };
  const deliverable = normalizeDeliverable(item.deliverable);
  if (!deliverable.apply || !deliverable.date) {
    return { active: false, className: "deliverable-none", label: "No deliverable date" };
  }
  const today = todayString();
  const diffDays = daysBetweenDates(today, deliverable.date);
  let tone = "green";
  let label = `Deliverable ${deliverable.date}: more than 7 days away`;
  if (diffDays < 0) {
    tone = "red";
    label = `Deliverable ${deliverable.date}: overdue`;
  } else if (diffDays <= 7) {
    tone = "yellow";
    label = `Deliverable ${deliverable.date}: due within 7 days`;
  }
  const closed = item.status === "closed";
  return {
    active: true,
    tone,
    className: `deliverable-${tone}${closed ? " deliverable-closed" : ""}`,
    label: closed ? `${label}; closed record` : label,
    date: deliverable.date,
    diffDays,
  };
}

function getRecordDeliverableDisplayInfo(record) {
  const own = getDeliverableDisplayInfo(record);
  if (own.active) return own;
  const comments = Array.isArray(record && record.comments) ? record.comments : [];
  const activeComments = comments
    .map(comment => getDeliverableDisplayInfo(comment))
    .filter(info => info.active)
    .sort(compareDeliverableInfo);
  if (activeComments.length) {
    return {
      ...activeComments[0],
      label: `Linked secondary ${activeComments[0].label.charAt(0).toLowerCase()}${activeComments[0].label.slice(1)}`
    };
  }
  return own;
}

function compareDeliverableInfo(a, b) {
  const rank = { red: 0, yellow: 1, green: 2 };
  const aRank = rank[a.tone] ?? 9;
  const bRank = rank[b.tone] ?? 9;
  if (aRank !== bRank) return aRank - bRank;
  return String(a.date || "").localeCompare(String(b.date || ""));
}

function daysBetweenDates(fromDate, toDate) {
  const from = new Date(`${normalizeDate(fromDate)}T00:00:00Z`);
  const to = new Date(`${normalizeDate(toDate)}T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 9999;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function renderDeliverableSquare(info, extraClass = "") {
  const display = info && info.active ? info : { className: "deliverable-none", label: "No deliverable date" };
  return `<span class="deliverable-square ${display.className} ${extraClass}" title="${escapeHtml(display.label)}" aria-label="${escapeHtml(display.label)}"></span>`;
}

function buildFlags(body, category, sourceText, metadata) {
  const flags = [];
  const lower = body.toLowerCase();
  const sourceDate = metadata.shiftDate || "not stated";

  if (/\bmike\b/.test(lower) && /\bgate\b/.test(lower) && !/\beast gate|west gate|north gate|south gate\b/.test(lower)) {
    flags.push(createRecordFlag(
      "clarify",
      "Which Mike and which gate is this referring to?",
      sourceText,
      sourceDate
    ));
  }

  if (category === "communication" && !looksLikeEmailAddress(body) && /\bemail\b/.test(lower)) {
    flags.push(createRecordFlag("incomplete", "Recipient email address not stated.", sourceText, sourceDate));
  }

  if (/\bsend email\b/.test(lower) && !looksLikeEmailAddress(body)) {
    flags.push(createRecordFlag("incomplete", "Email address not stated for the requested email.", sourceText, sourceDate));
  }

  if (category === "scheduled" && !hasRealDate(body)) {
    flags.push(createRecordFlag("clarify", "Scheduled item has time wording but no explicit calendar date.", sourceText, sourceDate));
  }

  if (!metadata.shiftDate || metadata.shiftDate === "not stated") {
    flags.push(createRecordFlag("incomplete", "Source date not stated.", sourceText, sourceDate));
  }

  return flags;
}

function buildComments(body, category, sourceText, sourceDate) {
  const comments = [];
  const createdAt = isoFromSourceDate(sourceDate);
  const localEmailAction = buildLocalEmailAction(body);
  if (localEmailAction) {
    const commentText = sentenceCase(body.slice(localEmailAction.instructionIndex));
    comments.push({
      id: createId("com"),
      text: commentText,
      status: "open",
      createdAt,
      updatedAt: createdAt,
      sourceText,
      deliverable: detectDeliverable(commentText, sourceDate),
      action: localEmailAction.action,
    });
  }

  return comments;
}

function buildLocalEmailAction(body) {
  return PARSER_CORE.buildEmailAction(body, state.projectContacts);
}

function resolveLocalRecipientNames(names) {
  return PARSER_CORE.resolveRecipientNames(names, state.projectContacts);
}

function createDailySummary(records) {
  if (!records.length) return "No records were parsed from the source text.";
  const counts = countBy(records, r => r.category);
  const parts = Object.entries(counts).map(([category, count]) => `${count} ${category}`);
  return `Parsed ${records.length} proposed record(s): ${parts.join(", ")}.`;
}

function createProposal(input) {
  const sourceDate = input.sourceDate || "not stated";
  const createdAt = input.createdAt || isoFromSourceDate(sourceDate);
  return {
    id: input.id || createId("prop"),
    category: CATEGORY_OPTIONS.includes(input.category) ? input.category : "event",
    description: input.description || "",
    status: input.status === "closed" ? "closed" : "open",
    sourceDate,
    sourceText: input.sourceText || "",
    createdAt,
    updatedAt: input.updatedAt || createdAt,
    closedAt: input.closedAt || "",
    deliverable: normalizeDeliverable(input.deliverable),
    flags: Array.isArray(input.flags) ? input.flags : [],
    comments: Array.isArray(input.comments) ? input.comments : [],
    accepted: input.accepted !== false,
  };
}

function createRecordFlag(type, text, sourceText, sourceDate) {
  const createdAt = isoFromSourceDate(sourceDate);
  return {
    id: createId("flag"),
    type: type === "clarify" ? "clarify" : "incomplete",
    text,
    status: "open",
    resolution: "",
    sourceText: sourceText || text,
    createdAt,
    updatedAt: createdAt,
  };
}

function createPackageFlag(type, text, sourceText, sourceDate) {
  const createdAt = isoFromSourceDate(sourceDate);
  return {
    id: createId("pkgflag"),
    type,
    text,
    status: "open",
    sourceText,
    createdAt,
    updatedAt: createdAt,
  };
}

// =====================================================
// REVIEW UI
// =====================================================
function renderSummary() {
  const records = state.proposals;
  if (!records.length && !state.packageFlags.length) {
    els.summaryOutput.className = "compact-production-summary empty-state";
    els.summaryOutput.textContent = "No proposed records yet.";
    renderDiagnostics();
    renderCleanupStatus();
    return;
  }

  const accepted = records.filter(r => r.accepted).length;
  const flags = records.reduce((sum, r) => sum + (r.flags || []).length, 0) + state.packageFlags.length;
  const comments = records.reduce((sum, r) => sum + (r.comments || []).length, 0);
  const categoryCounts = countBy(records, r => r.category);
  const categoryRows = CATEGORY_OPTIONS
    .filter(category => categoryCounts[category])
    .map(category => `<span class="summary-chip">${escapeHtml(category)}: <strong>${categoryCounts[category]}</strong></span>`)
    .join("");
  els.summaryOutput.className = "compact-production-summary";
  els.summaryOutput.innerHTML = `
    <div class="summary-list compact-summary">
      <div class="summary-card"><strong>${records.length}</strong>Records Found</div>
      <div class="summary-card"><strong>${accepted}</strong>Accepted</div>
      <div class="summary-card"><strong>${flags}</strong>Needs Review</div>
      <div class="summary-card"><strong>${comments}</strong>Secondary Records</div>
    </div>
    ${categoryRows ? `<div class="summary-chips">${categoryRows}</div>` : ""}
    ${state.packageFlags.length ? `<p class="review-warning">${state.packageFlags.length} package warning${state.packageFlags.length === 1 ? "" : "s"} need review.</p>` : ""}
  `;
  renderDiagnostics();
  renderCleanupStatus();
}


// =====================================================
// DIAGNOSTICS LAYER
// Read-only parser/intake diagnostics. These helpers must not mutate
// records, source text, parsing results, or export packages.
// =====================================================
function collectDiagnostics() {
  const records = state.proposals || [];
  const accepted = records.filter(record => record.accepted !== false).length;
  const rejected = records.length - accepted;
  const categoryCounts = CATEGORY_OPTIONS.reduce((acc, category) => {
    acc[category] = records.filter(record => record.category === category).length;
    return acc;
  }, {});
  const flagCount = records.reduce((sum, record) => sum + ((record.flags || []).length), 0) + (state.packageFlags || []).length;
  const commentCount = records.reduce((sum, record) => sum + ((record.comments || []).length), 0);
  const rawText = els.rawText ? els.rawText.value : state.rawText;
  const detectedSite = normalizeText(els.siteInput && els.siteInput.value) || extractSiteFromText(rawText) || "not stated";
  const detectedDate = (els.dateInput && els.dateInput.value) || resolveDateForImport({ rawText, fallbackDate: "" }).date || "not stated";
  const sources = sourceLogForDiagnostics(rawText);
  const warnings = collectDiagnosticWarnings(records);

  return {
    sourceCount: sources.length,
    sourceNames: sources.map(source => source.name),
    detectedSite,
    detectedDate,
    proposedCount: records.length,
    acceptedCount: accepted,
    rejectedCount: rejected,
    categoryCounts,
    flagCount,
    commentCount,
    skippedCount: (state.skippedFiles || []).length,
    structuredJsonDetected: Boolean(state.structuredJsonDetected || sources.some(source => source.structuredSiteScribePackage)),
    structuredRecordCount: state.structuredRecordCount || sources.reduce((sum, source) => sum + (source.structuredRecordCount || 0), 0),
    aiRequestBuilt: Boolean(state.aiRequestBuilt),
    aiResultLoaded: Boolean(state.aiResultLoaded),
    aiResultRecordCount: state.aiResultRecordCount || 0,
    aiResultValidationWarningCount: state.aiResultValidationWarningCount || 0,
    aiResultSourceLabel: state.aiResultSourceLabel || "not loaded",
    lastAiResultLoadTime: state.lastAiResultLoadTime || "not loaded",
    apiEndpoint: state.apiEndpoint || PRODUCTION_API_ENDPOINT,
    apiLastStatus: state.apiLastStatus || "not tested",
    apiLastCallTime: state.apiLastCallTime || "not called",
    apiLastModel: state.apiLastModel || "not reported",
    warningCount: warnings.length,
    warnings,
    lastParseTime: state.lastParseTime || "not parsed yet",
    parserEngine: state.parserEngine || "not set",
  };
}

function sourceLogForDiagnostics(rawText) {
  const sources = Array.isArray(state.sourceLog) ? state.sourceLog.filter(source => source && source.name) : [];
  if (sources.length) return sources;
  if (normalizeText(rawText)) return [{ name: "manual / pasted intake", kind: "manual", status: "loaded" }];
  return [];
}

function collectDiagnosticWarnings(records) {
  const warnings = [];
  const skipped = state.skippedFiles || [];
  skipped.forEach(item => {
    if (item.reason === "Image OCR is not included in Parser Lite.") {
      warnings.push(`Image skipped: ${item.name}. Image OCR is not included in Parser Lite.`);
    } else {
      warnings.push(`Unsupported/skipped file: ${item.name}${item.reason ? ` (${item.reason})` : ""}.`);
    }
  });

  (state.aiResultWarnings || []).forEach(warning => warnings.push(`AI result warning: ${warning}`));

  if (state.lastParseTime && !records.length) warnings.push("No proposed records found after parse.");

  records.forEach((record, index) => {
    const number = index + 1;
    if (!normalizeText(record.description)) warnings.push(`Record ${number} has a blank description.`);
    if (!normalizeText(record.sourceDate) || record.sourceDate === "not stated") warnings.push(`Record ${number} is missing sourceDate.`);
    if (!CATEGORY_OPTIONS.includes(record.category)) warnings.push(`Record ${number} has an invalid category: ${record.category || "blank"}.`);
    const openFlags = (record.flags || []).filter(flag => flag.status !== "closed").length;
    if (openFlags) warnings.push(`Record ${number} has ${openFlags} open flag(s).`);
  });

  if (state.jsonBuildAttemptedNoAccepted) warnings.push("JSON build attempted with no accepted records.");
  return warnings;
}

function renderDiagnostics() {
  if (!els.diagnosticsOutput) return;
  const diagnostics = collectDiagnostics();
  const categoryChips = CATEGORY_OPTIONS.map(category => `
    <span class="diagnostic-chip">${escapeHtml(category)} <strong>${diagnostics.categoryCounts[category] || 0}</strong></span>
  `).join("");
  const sourceList = diagnostics.sourceNames.length
    ? diagnostics.sourceNames.map(name => `<li>${escapeHtml(name)}</li>`).join("")
    : `<li>No intake source loaded.</li>`;
  const warningList = diagnostics.warnings.length
    ? diagnostics.warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join("")
    : `<li>No diagnostics warnings.</li>`;

  els.diagnosticsOutput.innerHTML = `
    <div class="diagnostics-grid">
      <div class="diagnostic-card"><strong>${diagnostics.sourceCount}</strong><span>Intake Sources</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.proposedCount}</strong><span>Proposed Records</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.acceptedCount}</strong><span>Accepted</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.rejectedCount}</strong><span>Rejected</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.flagCount}</strong><span>Flags</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.commentCount}</strong><span>Secondary Records</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.skippedCount}</strong><span>Skipped Files</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.structuredRecordCount}</strong><span>Structured Records</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.aiResultRecordCount}</strong><span>AI Result Records</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.aiResultValidationWarningCount}</strong><span>AI Result Warnings</span></div>
      <div class="diagnostic-card"><strong>${diagnostics.warningCount}</strong><span>Warnings</span></div>
    </div>
    <div class="diagnostic-meta">
      <div><strong>Detected site:</strong> ${escapeHtml(diagnostics.detectedSite)}</div>
      <div><strong>Detected date:</strong> ${escapeHtml(diagnostics.detectedDate)}</div>
      <div><strong>Last parse:</strong> ${escapeHtml(formatDateTime(diagnostics.lastParseTime))}</div>
      <div><strong>Parser engine:</strong> ${escapeHtml(diagnostics.parserEngine)}</div>
      <div><strong>Structured JSON detected:</strong> ${diagnostics.structuredJsonDetected ? "yes" : "no"}</div>
      <div><strong>AI request built:</strong> ${diagnostics.aiRequestBuilt ? "yes" : "no"}</div>
      <div><strong>AI result loaded:</strong> ${diagnostics.aiResultLoaded ? "yes" : "no"}</div>
      <div><strong>AI result source:</strong> ${escapeHtml(diagnostics.aiResultSourceLabel)}</div>
      <div><strong>Last AI result load:</strong> ${escapeHtml(formatDateTime(diagnostics.lastAiResultLoadTime))}</div>
      <div><strong>API endpoint:</strong> ${escapeHtml(diagnostics.apiEndpoint)}</div>
      <div><strong>API status:</strong> ${escapeHtml(diagnostics.apiLastStatus)}</div>
      <div><strong>Last API call:</strong> ${escapeHtml(formatDateTime(diagnostics.apiLastCallTime))}</div>
      <div><strong>API model:</strong> ${escapeHtml(diagnostics.apiLastModel)}</div>
    </div>
    <div class="summary-chips diagnostics-categories">${categoryChips}</div>
    <details class="diagnostic-details">
      <summary>Source files / intake names</summary>
      <ul>${sourceList}</ul>
    </details>
    <details class="diagnostic-details" ${diagnostics.warnings.length ? "open" : ""}>
      <summary>Warnings</summary>
      <ul>${warningList}</ul>
    </details>
  `;
}

function setSourceLog(imported, status) {
  const names = imported && Array.isArray(imported.sourceNames) && imported.sourceNames.length
    ? imported.sourceNames
    : [imported && imported.fileName ? imported.fileName : "imported source"];
  state.sourceLog = names.map(name => ({
    name,
    kind: imported && imported.kind ? imported.kind : "source",
    status: status || "loaded",
    structuredSiteScribePackage: Boolean(imported && imported.structuredSiteScribePackage),
    structuredRecordCount: imported && imported.structuredRecordCount ? imported.structuredRecordCount : 0,
  }));
}

function addSourceLog(imported, status) {
  const names = imported && Array.isArray(imported.sourceNames) && imported.sourceNames.length
    ? imported.sourceNames
    : [imported && imported.fileName ? imported.fileName : "imported source"];
  names.forEach(name => {
    state.sourceLog.push({
      name,
      kind: imported && imported.kind ? imported.kind : "source",
      status: status || "loaded",
      structuredSiteScribePackage: Boolean(imported && imported.structuredSiteScribePackage),
      structuredRecordCount: imported && imported.structuredRecordCount ? imported.structuredRecordCount : 0,
    });
  });
}

function recordSkippedFiles(files, kind, reason) {
  (files || []).forEach(file => {
    state.skippedFiles.push({
      name: file && file.name ? file.name : "unnamed file",
      kind: kind || "unsupported",
      reason: reason || "Unsupported file type.",
    });
  });
}


// =====================================================
// REVIEW CLEANUP / BULK EDITING TOOLS
// These helpers operate only on proposed review records.
// They must not modify raw intake text, sourceText, parser rules, or export schema.
// =====================================================
function setAllProposalAcceptance(accepted) {
  if (!state.proposals.length) {
    setCleanupStatus("No proposed records to update.");
    return;
  }
  state.proposals.forEach(record => {
    record.accepted = Boolean(accepted);
    record.updatedAt = nowIso();
  });
  state.lastExport = null;
  els.jsonOutput.value = "";
  setCleanupStatus(`${accepted ? "Accepted" : "Rejected"} all ${state.proposals.length} proposed record(s).`);
  renderSummary();
  renderRecords();
  showToast(accepted ? "All records accepted." : "All records rejected.");
}

function setProposalAcceptanceByCategory(category, accepted) {
  const matches = state.proposals.filter(record => record.category === category);
  if (!matches.length) {
    setCleanupStatus(`No ${category} records found.`);
    renderCleanupStatus();
    return;
  }
  matches.forEach(record => {
    record.accepted = Boolean(accepted);
    record.updatedAt = nowIso();
  });
  state.lastExport = null;
  els.jsonOutput.value = "";
  setCleanupStatus(`${accepted ? "Accepted" : "Rejected"} ${matches.length} ${category} record(s).`);
  renderSummary();
  renderRecords();
  showToast(`${category} records updated.`);
}

function setReviewFilter(filter) {
  state.reviewFilter = ["all", "accepted", "rejected", "warnings"].includes(filter) ? filter : "all";
  setCleanupStatus(`Filter set: ${reviewFilterLabel(state.reviewFilter)}.`);
  renderRecords();
  renderDiagnostics();
}

function getVisibleProposals() {
  return getVisibleProposalEntries().map(entry => entry.record);
}

function getVisibleProposalEntries() {
  return (state.proposals || [])
    .map((record, index) => ({ record, index }))
    .filter(entry => proposalMatchesFilter(entry.record, state.reviewFilter));
}

function proposalMatchesFilter(record, filter) {
  if (filter === "accepted") return record.accepted !== false;
  if (filter === "rejected") return record.accepted === false;
  if (filter === "warnings") return proposalHasWarning(record);
  return true;
}

function proposalHasWarning(proposal) {
  if (!proposal) return false;
  if (!normalizeText(proposal.description)) return true;
  if (!normalizeText(proposal.sourceDate) || proposal.sourceDate === "not stated") return true;
  if (!CATEGORY_OPTIONS.includes(proposal.category)) return true;
  if ((proposal.flags || []).some(flag => flag.status !== "closed")) return true;
  return false;
}

function activeBulkScope() {
  return state.reviewFilter && state.reviewFilter !== "all" ? "visible" : "all";
}

function bulkSetSourceDate(date, scope = "all") {
  if (!date) {
    setCleanupStatus("Choose a source date before applying Bulk Set Source Date.");
    renderCleanupStatus();
    return;
  }
  const entries = scope === "visible" ? getVisibleProposalEntries() : (state.proposals || []).map((record, index) => ({ record, index }));
  if (!entries.length) {
    setCleanupStatus(`No ${scope === "visible" ? "visible" : "proposed"} records to update.`);
    renderCleanupStatus();
    return;
  }
  entries.forEach(({ record }) => {
    record.sourceDate = date;
    record.createdAt = isoFromSourceDate(date);
    record.updatedAt = nowIso();
    (record.flags || []).forEach(flag => {
      if (!flag.createdAt || flag.createdAt === isoFromSourceDate("not stated")) flag.createdAt = isoFromSourceDate(date);
      flag.updatedAt = flag.updatedAt || nowIso();
    });
    (record.comments || []).forEach(comment => {
      if (!comment.createdAt || comment.createdAt === isoFromSourceDate("not stated")) comment.createdAt = isoFromSourceDate(date);
      comment.updatedAt = comment.updatedAt || nowIso();
    });
  });
  state.lastExport = null;
  els.jsonOutput.value = "";
  setCleanupStatus(`Bulk Source Date applied to ${entries.length} ${scope === "visible" ? "visible" : "proposed"} record(s): ${date}.`);
  renderSummary();
  renderRecords();
  showToast("Source dates updated.");
}

function bulkSetSiteName(name) {
  const cleaned = normalizeText(name);
  if (!cleaned) {
    setCleanupStatus("Enter a Site / Memory Name before applying.");
    renderCleanupStatus();
    return;
  }
  els.siteInput.value = cleaned;
  if (els.bulkSiteInput) els.bulkSiteInput.value = cleaned;
  state.lastExport = null;
  els.jsonOutput.value = "";
  setCleanupStatus(`Export Site / Memory Name set to: ${cleaned}.`);
  renderSummary();
  renderDiagnostics();
  showToast("Site / Memory Name updated.");
}

function renderCleanupStatus() {
  const proposals = state.proposals || [];
  const visibleCount = getVisibleProposalEntries().length;
  const total = proposals.length;
  const acceptedCount = proposals.filter(record => record.accepted !== false).length;
  const rejectedCount = total - acceptedCount;

  if (els.filterStatus) {
    els.filterStatus.textContent = `Filter: ${reviewFilterLabel(state.reviewFilter)} · showing ${visibleCount} of ${total} proposed record(s).`;
  }
  if (els.cleanupSummary) {
    els.cleanupSummary.textContent = `${acceptedCount} accepted · ${rejectedCount} rejected · Filter: ${reviewFilterLabel(state.reviewFilter)}`;
  }
  if (els.cleanupStatus) els.cleanupStatus.textContent = state.cleanupLastMessage || "Cleanup tools ready.";
  updateFilterButtons();
}

function setCleanupStatus(message) {
  state.cleanupLastMessage = message;
  if (els.cleanupStatus) els.cleanupStatus.textContent = message;
}

function reviewFilterLabel(filter) {
  if (filter === "accepted") return "accepted only";
  if (filter === "rejected") return "rejected only";
  if (filter === "warnings") return "records with warnings";
  return "all records";
}

function updateFilterButtons() {
  const buttons = [els.showAllButton, els.showAcceptedButton, els.showRejectedButton, els.showWarningsButton].filter(Boolean);
  buttons.forEach(button => {
    const active = button.dataset.filterButton === state.reviewFilter;
    button.classList.toggle("active-filter", Boolean(active));
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function renderRecords() {
  if (!state.proposals.length) {
    els.recordsRoot.className = "empty-state";
    els.recordsRoot.textContent = "No proposed records yet.";
    renderCleanupStatus();
    return;
  }

  const visibleEntries = getVisibleProposalEntries();
  if (!visibleEntries.length) {
    els.recordsRoot.className = "empty-state";
    els.recordsRoot.textContent = `No proposed records match the active filter: ${reviewFilterLabel(state.reviewFilter)}.`;
    renderCleanupStatus();
    return;
  }

  els.recordsRoot.className = "";
  els.recordsRoot.innerHTML = visibleEntries.map(entry => renderRecordCard(entry.record, entry.index)).join("");
  renderCleanupStatus();
}

function buildRecordRowMeta(sourceDate, status, commentCount, warningCount, emailDraftCount = 0) {
  const parts = [];
  parts.push(formatShortRecordDate(sourceDate));
  if (status) parts.push(status);
  if (commentCount) parts.push(`${commentCount} secondary`);
  if (emailDraftCount) parts.push(`${emailDraftCount} email${emailDraftCount === 1 ? "" : "s"}`);
  if (warningCount) parts.push(`${warningCount} need${warningCount === 1 ? "s" : ""} review`);
  return parts.filter(Boolean).join(" · ");
}

function formatShortRecordDate(value) {
  if (!value || value === "not stated") return "not stated";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(match[2]) - 1;
  const day = String(Number(match[3]));
  const month = monthNames[monthIndex] || match[2];
  return `${month} ${day}`;
}

function renderRecordCard(record, index) {
  const expanded = state.expandedProposalIndex === index;
  const warningCount = recordWarningCount(record);
  const commentCount = (record.comments || []).length;
  const emailDraftCount = (record.comments || []).filter(commentHasEmailDraft).length;
  const status = record.status === "closed" ? "closed" : "open";
  const accepted = record.accepted !== false;
  const sourceDate = record.sourceDate && record.sourceDate !== "not stated" ? record.sourceDate : "not stated";
  const rowMeta = buildRecordRowMeta(sourceDate, status, commentCount, warningCount, emailDraftCount);
  const deliverableInfo = getRecordDeliverableDisplayInfo(record);

  return `
    <article class="record-card compact-record-card ${accepted ? "" : "rejected"} ${expanded ? "expanded" : ""}" data-index="${index}">
      <div class="proposal-row" data-action="toggle-record" role="button" tabindex="0" aria-expanded="${expanded ? "true" : "false"}">
        <input class="record-accept-checkbox" data-field="accepted" type="checkbox" ${accepted ? "checked" : ""} aria-label="Accept record">
        ${renderDeliverableSquare(deliverableInfo)}
        <span class="badge category-badge">${escapeHtml(record.category || "event")}</span>
        <span class="record-line-title" title="${escapeHtml(record.description || "Untitled proposed record")}">${escapeHtml(record.description || "Untitled proposed record")}</span>
        <span class="record-line-meta" title="${escapeHtml(rowMeta)}">${escapeHtml(rowMeta)}</span>
        <span class="record-row-chevron" aria-hidden="true">${expanded ? "▲" : "▼"}</span>
      </div>
      ${expanded ? renderRecordEditor(record, index) : ""}
    </article>
  `;
}

function renderRecordEditor(record, index) {
  const categoryOptions = CATEGORY_OPTIONS.map(category => `
    <option value="${category}" ${record.category === category ? "selected" : ""}>${category}</option>
  `).join("");
  const warningCount = recordWarningCount(record);
  const flags = record.flags || [];
  const comments = record.comments || [];
  const emailEntries = comments.map((comment, commentIndex) => ({ comment, commentIndex })).filter(entry => commentHasEmailDraft(entry.comment));
  const otherCommentEntries = comments.map((comment, commentIndex) => ({ comment, commentIndex })).filter(entry => !commentHasEmailDraft(entry.comment));

  return `
    <div class="record-editor-panel">
      <div class="editor-action-row">
        <span></span>
        <button class="small danger" data-action="delete-record" type="button">Delete Record</button>
      </div>
      <div class="record-grid review-grid compact-review-grid">
        <label>Category
          <select data-field="category">${categoryOptions}</select>
        </label>
        <label>Status
          <select data-field="status">
            <option value="open" ${record.status !== "closed" ? "selected" : ""}>open</option>
            <option value="closed" ${record.status === "closed" ? "selected" : ""}>closed</option>
          </select>
        </label>
        <div class="deliverable-edit ${record.deliverable && record.deliverable.apply ? "" : "deliverable-disabled"}">
          <div class="deliverable-edit-header">${renderDeliverableSquare(getDeliverableDisplayInfo(record), "deliverable-editor-square")}<span>Deliverable</span></div>
          <label class="checkbox-label">
            <input data-field="deliverableApply" type="checkbox" ${record.deliverable && record.deliverable.apply ? "checked" : ""}>
            Apply Deliverable
          </label>
          <label>Deliverable Date
            <input data-field="deliverableDate" type="date" value="${escapeHtml(record.deliverable && record.deliverable.date ? record.deliverable.date : "")}">
          </label>
        </div>
        <label>Source Date
          <input data-field="sourceDate" type="date" value="${escapeHtml(record.sourceDate === "not stated" ? "" : record.sourceDate)}">
        </label>
        <label class="full-span">Description / Clean Record Title
          <textarea data-field="description" rows="2">${escapeHtml(record.description)}</textarea>
        </label>
        <details class="metadata-box source-details full-span">
          <summary>Source Text / Original Wording</summary>
          <label class="source-text-field">
            <textarea data-field="sourceText" rows="3">${escapeHtml(record.sourceText)}</textarea>
          </label>
        </details>
      </div>

      <div class="secondary-record-add-row">
        <button class="small secondary" data-action="add-secondary-record" type="button">Add Secondary Record</button>
      </div>

      ${emailEntries.length ? renderEmailDraftsSection(record, index, emailEntries) : ""}
      ${renderSecondaryRecordsSection(record, index, otherCommentEntries)}

      <details class="metadata-box advanced-warning-box">
        <summary>Advanced / Warnings${warningCount ? ` (${warningCount})` : ""}</summary>
        <p class="muted">Flags are preserved for export but kept out of the normal record list.</p>
        <div class="flag-box buried-flag-box">
          <div class="record-top">
            <strong>Flags / Missing Information</strong>
            <button class="small secondary" data-action="add-flag" type="button">Add Flag</button>
          </div>
          ${flags.length ? flags.map((flag, flagIndex) => renderFlag(flag, flagIndex)).join("") : `<p class="muted">No flags.</p>`}
        </div>
      </details>
    </div>
  `;
}

function recordWarningCount(record) {
  let count = 0;
  if (!record) return count;
  if (!normalizeText(record.description)) count += 1;
  if (!normalizeText(record.sourceDate) || record.sourceDate === "not stated") count += 1;
  if (!CATEGORY_OPTIONS.includes(record.category)) count += 1;
  count += (record.flags || []).filter(flag => flag.status !== "closed").length;
  return count;
}

function flagDisplayText(flag) {
  if (!flag) return "";
  return normalizeText(flag.text)
    || normalizeText(flag.description)
    || normalizeText(flag.question)
    || normalizeText(flag.reason)
    || "";
}

function flagDisplaySourceText(flag, fallbackText = "") {
  if (!flag) return fallbackText || "";
  return normalizeText(flag.sourceText)
    || normalizeText(flag.source)
    || flagDisplayText(flag)
    || fallbackText
    || "";
}

function renderFlag(flag, flagIndex) {
  return `
    <div class="flag-row" data-flag-index="${flagIndex}">
      <label>Type
        <select data-flag-field="type">
          <option value="incomplete" ${flag.type !== "clarify" ? "selected" : ""}>incomplete</option>
          <option value="clarify" ${flag.type === "clarify" ? "selected" : ""}>clarify</option>
        </select>
      </label>
      <label>Status
        <select data-flag-field="status">
          <option value="open" ${flag.status !== "closed" ? "selected" : ""}>open</option>
          <option value="closed" ${flag.status === "closed" ? "selected" : ""}>closed</option>
        </select>
      </label>
      <label>Flag Text
        <textarea data-flag-field="text" rows="2">${escapeHtml(flagDisplayText(flag))}</textarea>
      </label>
      <label>Resolution / Answer
        <textarea data-flag-field="resolution" rows="2" placeholder="Optional review note or answer">${escapeHtml(flag.resolution || "")}</textarea>
      </label>
      <button class="small danger" data-action="delete-flag" type="button">Delete Flag</button>
    </div>
  `;
}

function commentHasEmailDraft(comment) {
  const action = comment && comment.action;
  return Boolean(action && action.type === "communication" && action.method === "email_draft");
}

function emailDraftRequiredInformationMissing(action) {
  return PARSER_CORE.emailDraftRequiredInformationMissing(action);
}

function emailDraftKey(record, comment) {
  return `${record && record.id || "record"}:${comment && comment.id || "comment"}`;
}

function secondaryRecordKey(record, secondaryRecord) {
  return `${record && record.id || "record"}:${secondaryRecord && secondaryRecord.id || "secondary"}`;
}

function emailPurposeLabel(value) {
  const text = normalizeText(value || "email draft").replace(/[_-]+/g, " ");
  return text ? text.replace(/\b\w/g, char => char.toUpperCase()) : "Email Draft";
}

function emailRecipientSummary(action) {
  const recipientIds = normalizeIdList(action && action.recipientIds);
  const unresolvedTo = normalizeNameList(action && action.unresolvedRecipientNames);
  const ccRecipientIds = normalizeIdList(action && action.ccRecipientIds);
  const unresolvedCc = normalizeNameList(action && action.unresolvedCcRecipientNames);
  const toNames = recipientIds.map(id => {
    const contact = (state.projectContacts || []).find(item => item.id === id);
    return contact ? (contact.fullName || contact.name || id) : id;
  });
  unresolvedTo.forEach(name => toNames.push(`${name} (unresolved)`));
  const ccNames = ccRecipientIds.map(id => {
    const contact = (state.projectContacts || []).find(item => item.id === id);
    return contact ? (contact.fullName || contact.name || id) : id;
  });
  unresolvedCc.forEach(name => ccNames.push(`${name} (unresolved)`));
  if (!toNames.length) toNames.push("Recipient required");
  return `${toNames.join(", ")}${ccNames.length ? ` · CC ${ccNames.join(", ")}` : ""}`;
}

function emailRecipientEditorValue(ids, unresolvedNames) {
  const names = normalizeIdList(ids).map(id => {
    const contact = (state.projectContacts || []).find(item => item.id === id);
    return contact ? (contact.fullName || contact.name || id) : id;
  });
  normalizeNameList(unresolvedNames).forEach(name => names.push(name));
  return names.join(", ");
}

function updateEmailRecipientsFromNames(action, value, isCc = false) {
  PARSER_CORE.updateRecipientsFromNames(action, value, state.projectContacts, isCc);
}

function ensureEmailDraftReviewState(record, emailEntries) {
  const recordId = record && record.id || "record";
  if (!Object.prototype.hasOwnProperty.call(state.emailDraftsOpenByRecordId, recordId)) {
    const firstIncomplete = emailEntries.find(entry => emailDraftRequiredInformationMissing(entry.comment.action));
    state.emailDraftsOpenByRecordId[recordId] = Boolean(firstIncomplete);
    if (firstIncomplete && !state.expandedEmailDraftKey) {
      state.expandedEmailDraftKey = emailDraftKey(record, firstIncomplete.comment);
    }
  }
}

function renderEmailDraftsSection(record, recordIndex, emailEntries) {
  ensureEmailDraftReviewState(record, emailEntries);
  const recordId = record && record.id || "record";
  const sectionOpen = Boolean(state.emailDraftsOpenByRecordId[recordId]);
  const attentionCount = emailEntries.filter(entry => emailDraftRequiredInformationMissing(entry.comment.action)).length;
  const attention = attentionCount ? `<span class="email-attention-badge">${attentionCount} NEED${attentionCount === 1 ? "S" : ""} INFORMATION</span>` : "";
  return `<section class="email-drafts-section ${sectionOpen ? "open" : ""}" data-email-record-id="${escapeHtml(recordId)}">
    <button class="email-drafts-toggle" data-action="toggle-email-drafts" type="button" aria-expanded="${sectionOpen ? "true" : "false"}">
      <span>EMAIL DRAFTS (${emailEntries.length})</span>
      <span class="email-drafts-toggle-meta">${attention}<span aria-hidden="true">${sectionOpen ? "▲" : "▼"}</span></span>
    </button>
    ${sectionOpen ? `<div class="email-drafts-list">${emailEntries.map(entry => renderEmailDraftRow(record, recordIndex, entry.comment, entry.commentIndex)).join("")}</div>` : ""}
  </section>`;
}

function renderEmailDraftRow(record, recordIndex, comment, commentIndex) {
  const action = comment.action || {};
  const key = emailDraftKey(record, comment);
  const expanded = state.expandedEmailDraftKey === key;
  const missing = emailDraftRequiredInformationMissing(action);
  const recipient = emailRecipientSummary(action);
  const purpose = emailPurposeLabel(action.purpose);
  const actionState = missing ? "NEEDS INFORMATION" : "READY";
  const dueDate = comment.deliverable && comment.deliverable.apply && comment.deliverable.date ? formatShortRecordDate(comment.deliverable.date) : "No due date";
  return `<div class="email-draft-item ${expanded ? "expanded" : ""} ${missing ? "needs-information" : ""}" data-email-draft-key="${escapeHtml(key)}">
    <button class="email-draft-summary" data-action="toggle-email-draft" data-comment-index="${commentIndex}" type="button" aria-expanded="${expanded ? "true" : "false"}">
      <span class="email-draft-recipient">${escapeHtml(recipient)}</span>
      <span class="email-draft-purpose">${escapeHtml(purpose)}</span>
      <span class="email-draft-due">${escapeHtml(dueDate)}</span>
      <span class="email-draft-state">${escapeHtml(actionState)}</span>
      <span class="email-draft-chevron" aria-hidden="true">${expanded ? "▲" : "▼"}</span>
    </button>
    ${expanded ? `<div class="email-draft-editor">${renderComment(comment, commentIndex)}</div>` : ""}
  </div>`;
}

function renderSecondaryRecordsSection(record, recordIndex, entries) {
  const recordId = record && record.id || "record";
  if (!Object.prototype.hasOwnProperty.call(state.secondaryRecordsOpenByRecordId, recordId)) {
    state.secondaryRecordsOpenByRecordId[recordId] = false;
  }
  const sectionOpen = Boolean(state.secondaryRecordsOpenByRecordId[recordId]);
  return `<section class="email-drafts-section secondary-records-section ${sectionOpen ? "open" : ""}" data-secondary-record-parent-id="${escapeHtml(recordId)}">
    <button class="email-drafts-toggle secondary-records-toggle" data-action="toggle-secondary-records" type="button" aria-expanded="${sectionOpen ? "true" : "false"}">
      <span>SECONDARY RECORDS (${entries.length})</span>
      <span class="email-drafts-toggle-meta"><span aria-hidden="true">${sectionOpen ? "▲" : "▼"}</span></span>
    </button>
    ${sectionOpen ? `<div class="email-drafts-list secondary-records-list">${entries.length ? entries.map(entry => renderSecondaryRecordRow(record, recordIndex, entry.comment, entry.commentIndex)).join("") : `<p class="muted secondary-records-empty">No secondary records.</p>`}</div>` : ""}
  </section>`;
}

function renderSecondaryRecordRow(record, recordIndex, secondaryRecord, commentIndex) {
  const key = secondaryRecordKey(record, secondaryRecord);
  const expanded = state.expandedSecondaryRecordKey === key;
  const deliverableInfo = getDeliverableDisplayInfo(secondaryRecord);
  const dueDate = secondaryRecord.deliverable && secondaryRecord.deliverable.apply && secondaryRecord.deliverable.date ? formatShortRecordDate(secondaryRecord.deliverable.date) : "No due date";
  const status = secondaryRecord.status === "closed" ? "CLOSED" : "OPEN";
  return `<div class="email-draft-item secondary-record-item ${expanded ? "expanded" : ""}" data-secondary-record-key="${escapeHtml(key)}">
    <button class="email-draft-summary secondary-record-summary" data-action="toggle-secondary-record" data-comment-index="${commentIndex}" type="button" aria-expanded="${expanded ? "true" : "false"}">
      <span class="secondary-record-summary-square">${renderDeliverableSquare(deliverableInfo)}</span>
      <span class="email-draft-recipient secondary-record-title">${escapeHtml(secondaryRecord.text || "Untitled secondary record")}</span>
      <span class="email-draft-purpose"></span>
      <span class="email-draft-due">${escapeHtml(dueDate)}</span>
      <span class="email-draft-state">${escapeHtml(status)}</span>
      <span class="email-draft-chevron" aria-hidden="true">${expanded ? "▲" : "▼"}</span>
    </button>
    ${expanded ? `<div class="email-draft-editor secondary-record-editor">${renderComment(secondaryRecord, commentIndex)}</div>` : ""}
  </div>`;
}

function renderComment(comment, commentIndex) {
  const deliverableInfo = getDeliverableDisplayInfo(comment);
  return `
    <div class="comment-row" data-comment-index="${commentIndex}">
      ${renderDeliverableSquare(deliverableInfo, "comment-deliverable-square")}
      <label>Status
        <select data-comment-field="status">
          <option value="open" ${comment.status !== "closed" ? "selected" : ""}>open</option>
          <option value="closed" ${comment.status === "closed" ? "selected" : ""}>closed</option>
        </select>
      </label>
      <label>Text
        <textarea data-comment-field="text" rows="2">${escapeHtml(comment.text || "")}</textarea>
      </label>
      <div class="deliverable-edit compact-deliverable ${comment.deliverable && comment.deliverable.apply ? "" : "deliverable-disabled"}">
        <div class="deliverable-edit-header">${renderDeliverableSquare(deliverableInfo, "deliverable-editor-square")}<span>Deliverable</span></div>
        <label class="checkbox-label">
          <input data-comment-field="deliverableApply" type="checkbox" ${comment.deliverable && comment.deliverable.apply ? "checked" : ""}>
          Apply Deliverable
        </label>
        <label>Deliverable Date
          <input data-comment-field="deliverableDate" type="date" value="${escapeHtml(comment.deliverable && comment.deliverable.date ? comment.deliverable.date : "")}">
        </label>
      </div>
      ${renderProposedEmailAction(comment.action)}
      <button class="small danger" data-action="delete-secondary-record" type="button">Delete Record</button>
    </div>
  `;
}

function renderProposedEmailAction(action) {
  if (!action || action.type !== "communication" || action.method !== "email_draft") return "";
  const contactLabel = emailRecipientSummary(action);
  const missing = emailDraftRequiredInformationMissing(action);
  const toValue = emailRecipientEditorValue(action.recipientIds, action.unresolvedRecipientNames);
  const ccValue = emailRecipientEditorValue(action.ccRecipientIds, action.unresolvedCcRecipientNames);
  return `<div class="proposed-email-action">
    <div class="proposed-email-action-heading"><strong>Email Draft</strong>${missing ? `<span class="email-attention-badge">NEEDS INFORMATION</span>` : ""}</div>
    <p class="muted small-note">${escapeHtml(contactLabel)}. Review or edit before export.</p>
    <label>To
      <input data-comment-action-name-field="to" type="text" value="${escapeHtml(toValue)}" placeholder="Recipient name">
    </label>
    <label>CC
      <input data-comment-action-name-field="cc" type="text" value="${escapeHtml(ccValue)}" placeholder="Optional CC name">
    </label>
    <label>Subject
      <textarea data-comment-action-field="subject" rows="2">${escapeHtml(action.subject || "")}</textarea>
    </label>
    <label>Draft Message
      <textarea data-comment-action-field="body" rows="5">${escapeHtml(action.body || "")}</textarea>
    </label>
  </div>`;
}

function handleRecordInput(event) {
  const card = event.target.closest(".record-card");
  if (!card) return;
  const index = Number(card.dataset.index);
  const record = state.proposals[index];
  if (!record) return;

  const field = event.target.dataset.field;
  if (field) {
    if (field === "accepted") record.accepted = event.target.checked;
    else if (field === "deliverableApply") {
      record.deliverable = normalizeDeliverable(record.deliverable);
      record.deliverable.apply = Boolean(event.target.checked);
      if (!record.deliverable.apply) record.deliverable.date = record.deliverable.date || "";
    } else if (field === "deliverableDate") {
      record.deliverable = normalizeDeliverable(record.deliverable);
      record.deliverable.date = event.target.value || "";
      record.deliverable.apply = Boolean(record.deliverable.date);
    }
    else {
      record[field] = event.target.value || (field === "sourceDate" ? "not stated" : "");
      if (field === "sourceDate" && record.sourceDate !== "not stated") {
        record.createdAt = isoFromSourceDate(record.sourceDate);
        (record.flags || []).forEach(flag => {
          if (!flag.createdAt) flag.createdAt = isoFromSourceDate(record.sourceDate);
        });
      }
    }
    record.updatedAt = nowIso();
    renderSummary();
    if (field === "category" || field === "accepted" || field === "sourceDate" || field === "deliverableApply" || field === "deliverableDate" || state.reviewFilter === "warnings") renderRecords();
    return;
  }

  const flagRow = event.target.closest("[data-flag-index]");
  if (flagRow) {
    const flagIndex = Number(flagRow.dataset.flagIndex);
    const flag = record.flags[flagIndex];
    if (!flag) return;
    const flagField = event.target.dataset.flagField;
    if (flagField) {
      flag[flagField] = event.target.value;
      flag.updatedAt = nowIso();
      renderSummary();
    }
    return;
  }

  const commentRow = event.target.closest("[data-comment-index]");
  if (commentRow) {
    const commentIndex = Number(commentRow.dataset.commentIndex);
    const comment = record.comments[commentIndex];
    if (!comment) return;
    const actionField = event.target.dataset.commentActionField;
    if (actionField && comment.action) {
      if (["recipientIds", "ccRecipientIds", "unresolvedRecipientNames", "unresolvedCcRecipientNames"].includes(actionField)) comment.action[actionField] = normalizeIdList(event.target.value);
      else comment.action[actionField] = event.target.value;
      comment.updatedAt = nowIso();
      renderSummary();
      if (event.type === "change") renderRecords();
      return;
    }
    const actionNameField = event.target.dataset.commentActionNameField;
    if (actionNameField && comment.action) {
      updateEmailRecipientsFromNames(comment.action, event.target.value, actionNameField === "cc");
      comment.action.state = emailDraftRequiredInformationMissing(comment.action) ? "needs_information" : "proposed";
      comment.updatedAt = nowIso();
      renderSummary();
      if (event.type === "change") renderRecords();
      return;
    }
    const commentField = event.target.dataset.commentField;
    if (commentField) {
      if (commentField === "deliverableApply") {
        comment.deliverable = normalizeDeliverable(comment.deliverable);
        comment.deliverable.apply = Boolean(event.target.checked);
        if (!comment.deliverable.apply) comment.deliverable.date = comment.deliverable.date || "";
      } else if (commentField === "deliverableDate") {
        comment.deliverable = normalizeDeliverable(comment.deliverable);
        comment.deliverable.date = event.target.value || "";
        comment.deliverable.apply = Boolean(comment.deliverable.date);
      } else {
        comment[commentField] = event.target.value;
      }
      comment.updatedAt = nowIso();
      renderSummary();
      if (commentField === "deliverableApply" || commentField === "deliverableDate") renderRecords();
    }
  }
}

function handleRecordClick(event) {
  const card = event.target.closest(".record-card");
  if (!card) return;
  const index = Number(card.dataset.index);
  const record = state.proposals[index];
  if (!record) return;

  const actionTarget = event.target.closest("[data-action]");
  const action = actionTarget ? actionTarget.dataset.action : "";

  if (action === "toggle-record") {
    const isInteractive = ["INPUT", "SELECT", "TEXTAREA", "LABEL"].includes(event.target.tagName);
    if (!isInteractive || event.target === actionTarget || event.target.closest("button")) {
      state.expandedProposalIndex = state.expandedProposalIndex === index ? null : index;
      renderRecords();
    }
    return;
  }

  if (!action) return;

  if (action === "toggle-email-drafts") {
    const recordId = record.id || "record";
    state.emailDraftsOpenByRecordId[recordId] = !state.emailDraftsOpenByRecordId[recordId];
    renderRecords();
    return;
  }

  if (action === "toggle-email-draft") {
    const commentIndex = Number(actionTarget.dataset.commentIndex);
    const comment = record.comments[commentIndex];
    if (!comment || !commentHasEmailDraft(comment)) return;
    const key = emailDraftKey(record, comment);
    state.emailDraftsOpenByRecordId[record.id || "record"] = true;
    const opening = state.expandedEmailDraftKey !== key;
    state.expandedEmailDraftKey = opening ? key : null;
    if (opening) state.expandedSecondaryRecordKey = null;
    renderRecords();
    return;
  }

  if (action === "toggle-secondary-records") {
    const recordId = record.id || "record";
    state.secondaryRecordsOpenByRecordId[recordId] = !state.secondaryRecordsOpenByRecordId[recordId];
    renderRecords();
    return;
  }

  if (action === "toggle-secondary-record") {
    const commentIndex = Number(actionTarget.dataset.commentIndex);
    const secondaryRecord = record.comments[commentIndex];
    if (!secondaryRecord || commentHasEmailDraft(secondaryRecord)) return;
    const key = secondaryRecordKey(record, secondaryRecord);
    const opening = state.expandedSecondaryRecordKey !== key;
    state.secondaryRecordsOpenByRecordId[record.id || "record"] = true;
    state.expandedSecondaryRecordKey = opening ? key : null;
    if (opening) state.expandedEmailDraftKey = null;
    renderRecords();
    return;
  }

  if (action === "delete-record") {
    delete state.emailDraftsOpenByRecordId[record.id || "record"];
    delete state.secondaryRecordsOpenByRecordId[record.id || "record"];
    if (state.expandedEmailDraftKey && state.expandedEmailDraftKey.startsWith(`${record.id}:`)) state.expandedEmailDraftKey = null;
    if (state.expandedSecondaryRecordKey && state.expandedSecondaryRecordKey.startsWith(`${record.id}:`)) state.expandedSecondaryRecordKey = null;
    state.proposals.splice(index, 1);
    if (state.expandedProposalIndex === index) state.expandedProposalIndex = null;
    else if (state.expandedProposalIndex > index) state.expandedProposalIndex -= 1;
    renderSummary();
    renderRecords();
    return;
  }

  if (action === "add-flag") {
    record.flags.push(createRecordFlag("clarify", "Clarification required.", record.sourceText, record.sourceDate));
    renderSummary();
    renderRecords();
    return;
  }

  if (action === "delete-flag") {
    const flagRow = event.target.closest("[data-flag-index]");
    const flagIndex = Number(flagRow.dataset.flagIndex);
    record.flags.splice(flagIndex, 1);
    renderSummary();
    renderRecords();
    return;
  }

  if (action === "add-secondary-record") {
    const createdAt = isoFromSourceDate(record.sourceDate);
    const secondaryRecord = {
      id: createId("com"),
      text: "",
      status: "open",
      createdAt,
      updatedAt: createdAt,
      sourceText: record.sourceText,
      deliverable: { apply: false, date: "" },
    };
    record.comments.push(secondaryRecord);
    state.secondaryRecordsOpenByRecordId[record.id || "record"] = true;
    state.expandedSecondaryRecordKey = secondaryRecordKey(record, secondaryRecord);
    state.expandedEmailDraftKey = null;
    renderSummary();
    renderRecords();
    return;
  }

  if (action === "delete-secondary-record") {
    const commentRow = event.target.closest("[data-comment-index]");
    const commentIndex = Number(commentRow.dataset.commentIndex);
    const removed = record.comments[commentIndex];
    if (removed && state.expandedEmailDraftKey === emailDraftKey(record, removed)) state.expandedEmailDraftKey = null;
    if (removed && state.expandedSecondaryRecordKey === secondaryRecordKey(record, removed)) state.expandedSecondaryRecordKey = null;
    record.comments.splice(commentIndex, 1);
    renderSummary();
    renderRecords();
  }
}

// =====================================================
// EXPORT AND VALIDATION
// =====================================================
function buildExportPackage() {
  const context = getContext();
  const now = nowIso();
  const reviewedRecords = state.proposals
    .filter(record => record.accepted)
    .map(record => normalizeRecordForExport(record, now));

  return {
    packageType: "sitescribe_two_level_records",
    version: "1.0",
    site: context.site || "not stated",
    shiftDate: context.shiftDate || "not stated",
    processedAt: now,
    source: {
      captureMethod: context.captureMethod,
      rawText: els.rawText.value || state.rawText || "",
    },
    dailySummary: state.dailySummary || createDailySummary(reviewedRecords),
    parser: {
      appName: "SiteScribe Parser Lite",
      appVersion: APP_VERSION,
      parserEngine: state.parserEngine,
      dateBasis: state.sourceDateBasis,
    },
    reviewConsole: {
      appName: "SiteScribe Review Console",
      appVersion: "v0.6.39 or later",
      model: MODEL_NAME,
    },
    packageFlags: (state.packageFlags || []).map(flag => normalizeFlagForExport(flag, now)),
    records: reviewedRecords,
  };
}

function normalizeRecordForExport(record, now) {
  const sourceDate = record.sourceDate || "not stated";
  const createdAt = record.createdAt || isoFromSourceDate(sourceDate);
  return {
    id: record.id && record.id.startsWith("rec_") ? record.id : createId("rec"),
    category: CATEGORY_OPTIONS.includes(record.category) ? record.category : "event",
    description: normalizeText(record.description),
    status: record.status === "closed" ? "closed" : "open",
    createdAt,
    updatedAt: record.updatedAt || now,
    closedAt: record.status === "closed" ? (record.closedAt || now) : "",
    sourceDate,
    sourceText: record.sourceText || "",
    deliverable: normalizeDeliverable(record.deliverable),
    flags: (record.flags || []).map(flag => normalizeFlagForExport(flag, now, record)).filter(flag => flag.text),
    comments: (record.comments || []).map(comment => {
      const output = {
        id: comment.id || createId("com"),
        text: normalizeText(comment.text),
        status: comment.status === "closed" ? "closed" : "open",
        createdAt: comment.createdAt || createdAt,
        updatedAt: comment.updatedAt || now,
        sourceText: comment.sourceText || record.sourceText || "",
        deliverable: normalizeDeliverable(comment.deliverable),
      };
      if (comment.action && comment.action.type === "communication" && comment.action.method === "email_draft") {
        output.action = normalizeEmailActionForExport(comment.action);
      }
      return output;
    }).filter(comment => comment.text),
  };
}

function normalizeFlagForExport(flag, now, record = null) {
  const recordSourceDate = record ? record.sourceDate : "not stated";
  const createdAt = flag.createdAt || isoFromSourceDate(recordSourceDate);
  const text = flagDisplayText(flag);
  const output = {
    id: flag.id || createId("flag"),
    type: flag.type === "clarify" ? "clarify" : "incomplete",
    text,
    status: flag.status === "closed" ? "closed" : "open",
    sourceText: flagDisplaySourceText(flag, (record ? record.sourceText : "") || text),
    createdAt,
    updatedAt: flag.updatedAt || now,
  };
  if (normalizeText(flag.resolution)) output.resolution = normalizeText(flag.resolution);
  return output;
}

function validateExportPackage(pkg) {
  const messages = [];
  if (!pkg || typeof pkg !== "object") messages.push("Package is not an object.");
  if (pkg.packageType !== "sitescribe_two_level_records") messages.push("packageType must be sitescribe_two_level_records.");
  if (!Array.isArray(pkg.records)) messages.push("records[] is missing.");
  if (Array.isArray(pkg.records) && pkg.records.length === 0) messages.push("No accepted records are available for export.");
  if (pkg.site === "not stated") messages.push("Site name is not stated. This is allowed but should be reviewed.");
  if (pkg.shiftDate === "not stated") messages.push("Shift date is not stated. This is allowed but should be reviewed.");

  (pkg.records || []).forEach((record, index) => {
    const prefix = `Record ${index + 1}`;
    if (!CATEGORY_OPTIONS.includes(record.category)) messages.push(`${prefix}: invalid category.`);
    if (!record.description) messages.push(`${prefix}: description is required.`);
    if (!record.sourceText) messages.push(`${prefix}: sourceText is required.`);
    if (!record.sourceDate || record.sourceDate === "not stated") messages.push(`${prefix}: sourceDate is not stated. This is allowed but should be reviewed.`);
    if (record.deliverable && record.deliverable.apply && !normalizeDate(record.deliverable.date)) messages.push(`${prefix}: deliverable date is applied but invalid or blank.`);
    if (!record.createdAt) messages.push(`${prefix}: createdAt is required.`);
    if (!Array.isArray(record.flags)) messages.push(`${prefix}: flags[] must exist.`);
    if (!Array.isArray(record.comments)) messages.push(`${prefix}: secondary records (comments[]) must exist.`);
    (record.flags || []).forEach((flag, flagIndex) => {
      if (!flagDisplayText(flag)) messages.push(`${prefix}, flag ${flagIndex + 1}: flag text is required.`);
      if (!["clarify", "incomplete"].includes(flag.type)) messages.push(`${prefix}, flag ${flagIndex + 1}: invalid flag type.`);
    });
  });

  const fatal = messages.some(message => /must|required|invalid|missing/.test(message));
  return {
    ok: !fatal,
    messages: messages.length ? messages : ["JSON structure passes Parser Lite validation."],
  };
}

function renderValidation(result) {
  els.validationOutput.className = `validation-box ${result.ok ? "pass" : result.messages.some(m => /must|required|invalid|missing/.test(m)) ? "fail" : ""}`;
  els.validationOutput.innerHTML = `<ul>${result.messages.map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`;
}

async function copyJson() {
  const pkg = buildExportPackage();
  if (!els.jsonOutput.value) state.jsonBuildAttemptedNoAccepted = !(pkg.records || []).length;
  const text = els.jsonOutput.value || JSON.stringify(pkg, null, 2);
  els.jsonOutput.value = text;
  renderDiagnostics();
  try {
    await navigator.clipboard.writeText(text);
    showToast("JSON copied.");
  } catch (error) {
    els.jsonOutput.select();
    document.execCommand("copy");
    showToast("JSON selected/copied where supported.");
  }
}

function downloadJson() {
  const pkg = buildExportPackage();
  state.jsonBuildAttemptedNoAccepted = !(pkg.records || []).length;
  const result = validateExportPackage(pkg);
  renderValidation(result);
  const text = JSON.stringify(pkg, null, 2);
  els.jsonOutput.value = text;
  state.lastExport = pkg;
  renderDiagnostics();

  const siteSlug = slugify(pkg.site === "not stated" ? "site" : pkg.site);
  const dateSlug = pkg.shiftDate === "not stated" ? todayString() : pkg.shiftDate;
  const filename = `sitescribe_parser_export_${dateSlug}_${siteSlug}.json`;
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSON downloaded.");
}

// =====================================================
// IMPORT HELPERS
// =====================================================
async function normalizeToRawText(source) {
  if (!source) return { rawText: '', sourceMeta: { name: 'unknown source' } };

  if (source.kind === 'file' && source.file) {
    const file = source.file;
    if (isImageFile(file)) {
      throw new Error('Image OCR is not included in Parser Lite.');
    }
    if (!isSupportedImportFile(file)) {
      throw new Error(`Unsupported file type: ${file.name || 'unnamed file'}`);
    }
    const text = await readFileAsText(file);
    return {
      rawText: normalizeImportedText(text, file),
      sourceMeta: file,
    };
  }

  const kind = source.kind || 'plain';
  const text = source.text || '';
  return {
    rawText: normalizeDroppedText(text, kind),
    sourceMeta: {
      name: source.name || 'dropped text',
      type: kind === 'html' ? 'text/html' : 'text/plain',
      lastModified: source.lastModified || 0,
    },
  };
}

function isImageFile(file) {
  const name = file && file.name ? file.name : '';
  const type = file && file.type ? file.type : '';
  return /^image\//i.test(type) || /\.(png|jpe?g|gif|webp|heic|heif|bmp|tif?f|svg)$/i.test(name);
}

function isSupportedImportFile(file) {
  const name = file && file.name ? file.name : '';
  const type = file && file.type ? file.type : '';
  if (/\.(txt|md|json|eml|html?|csv)$/i.test(name)) return true;
  if (/^(text\/plain|text\/markdown|text\/html|application\/json|message\/rfc822)$/i.test(type)) return true;
  return false;
}

function normalizeImportedText(text, file) {
  const name = file && file.name ? file.name : "";
  const type = file && file.type ? file.type : "";
  if (/\.(html?|eml)$/i.test(name) || /text\/html/i.test(type) || /message\/rfc822/i.test(type)) {
    return normalizeDroppedText(text, /\.eml$/i.test(name) || /message\/rfc822/i.test(type) ? "email" : "html");
  }
  return String(text || "").replace(/\u00a0/g, " ").trim();
}

function normalizeDroppedText(text, kind) {
  let value = String(text || "").replace(/\u00a0/g, " ");
  if (kind === "email") {
    value = value.replace(/^From:.*$/gmi, "")
      .replace(/^To:.*$/gmi, "")
      .replace(/^Cc:.*$/gmi, "")
      .replace(/^Bcc:.*$/gmi, "")
      .replace(/^Subject:\s*/gmi, "communication: ")
      .replace(/^Date:\s*/gmi, "Date: ");
  }
  if (kind === "html" || kind === "email") {
    value = value.replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<li>/gi, "- ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }
  return value.split(/\r?\n/).map(line => line.replace(/\s+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function captureMethodFromFile(file) {
  const name = file && file.name ? file.name : "";
  const type = file && file.type ? file.type : "";
  if (/\.json$/i.test(name) || /application\/json/i.test(type)) return "JSON import";
  if (/\.eml$/i.test(name) || /message\/rfc822/i.test(type)) return "email import";
  if (/\.html?$/i.test(name) || /text\/html/i.test(type)) return "HTML text import";
  if (/\.md$/i.test(name)) return "markdown text";
  return "plain text import";
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to read file."));
    reader.readAsText(file);
  });
}

function tryParseJson(text) {
  try {
    const trimmed = String(text || "").trim();
    if (!trimmed || !/^[{[]/.test(trimmed)) return null;
    return JSON.parse(trimmed);
  } catch (error) {
    return null;
  }
}

function importedRecordToProposal(record, defaultDate) {
  const sourceDate = normalizeDate(record.sourceDate) || dateFromIso(record.createdAt) || defaultDate || "not stated";
  const createdAt = record.createdAt || isoFromSourceDate(sourceDate);
  const flags = Array.isArray(record.flags) ? record.flags.map(flag => normalizeImportedFlag(flag, sourceDate)) : [];
  const comments = Array.isArray(record.comments) ? record.comments.map(comment => normalizeImportedComment(comment, sourceDate, record.sourceText)) : [];
  applyMissingContactFlagHints(comments, flags);
  return createProposal({
    id: record.id || createId("prop"),
    category: record.category,
    description: record.description || record.title || "",
    status: record.status,
    sourceDate,
    sourceText: record.sourceText || record.description || "",
    deliverable: normalizeDeliverable(record.deliverable),
    createdAt,
    updatedAt: record.updatedAt || createdAt,
    closedAt: record.closedAt || "",
    flags,
    comments,
    accepted: true,
  });
}

function normalizeImportedFlag(flag, defaultDate) {
  const sourceDate = dateFromIso(flag.createdAt) || defaultDate || "not stated";
  const createdAt = flag.createdAt || isoFromSourceDate(sourceDate);
  const text = flagDisplayText(flag);
  return {
    id: flag.id || createId("flag"),
    type: flag.type === "clarify" ? "clarify" : "incomplete",
    text,
    status: flag.status === "closed" ? "closed" : "open",
    resolution: flag.resolution || "",
    sourceText: flagDisplaySourceText(flag, text),
    createdAt,
    updatedAt: flag.updatedAt || createdAt,
  };
}

function normalizeImportedComment(comment, defaultDate, fallbackSourceText) {
  const sourceDate = dateFromIso(comment.createdAt) || defaultDate || "not stated";
  const createdAt = comment.createdAt || isoFromSourceDate(sourceDate);
  const normalized = {
    id: comment.id || createId("com"),
    text: comment.text || comment.description || "",
    status: comment.status === "closed" ? "closed" : "open",
    createdAt,
    updatedAt: comment.updatedAt || createdAt,
    sourceText: comment.sourceText || fallbackSourceText || "",
    deliverable: normalizeDeliverable(comment.deliverable),
  };
  if (comment.action && typeof comment.action === "object") {
    normalized.action = normalizeEmailAction(comment.action);
  } else {
    const repaired = buildLocalEmailAction([normalized.text, normalized.sourceText].filter(Boolean).join(" "));
    if (repaired) normalized.action = normalizeEmailAction({ ...repaired.action, source: "parser_deterministic_repair" });
  }
  return normalized;
}

function applyMissingContactFlagHints(comments, flags) {
  const emailComments = (comments || []).filter(comment => comment && comment.action && comment.action.method === "email_draft");
  if (!emailComments.length) return;
  (flags || []).forEach(flag => {
    const text = normalizeText(flag && flag.text);
    const ccMatch = text.match(/^(.+?)\s+was\s+(?:requested|named)\s+as\s+(?:a\s+)?cc\b/i);
    const toMatch = text.match(/^(.+?)\s+was\s+named\s+for\s+(?:a\s+)?requested\s+email\b/i);
    const match = ccMatch || toMatch;
    if (!match) return;
    const name = normalizeText(match[1]);
    if (!name) return;
    const matchingByText = emailComments.filter(comment => normalizeText(`${comment.text} ${comment.sourceText}`).toLowerCase().includes(name.toLowerCase()));
    const target = matchingByText[0] || (emailComments.length === 1 ? emailComments[0] : null);
    if (!target) return;
    const resolved = resolveLocalRecipientNames([name]);
    if (ccMatch) {
      target.action.ccRecipientIds = [...new Set([...normalizeIdList(target.action.ccRecipientIds), ...resolved.ids])];
      target.action.unresolvedCcRecipientNames = [...new Set([...normalizeNameList(target.action.unresolvedCcRecipientNames), ...resolved.unresolved])];
    } else {
      target.action.recipientIds = [...new Set([...normalizeIdList(target.action.recipientIds), ...resolved.ids])];
      target.action.unresolvedRecipientNames = [...new Set([...normalizeNameList(target.action.unresolvedRecipientNames), ...resolved.unresolved])];
    }
    if (emailDraftRequiredInformationMissing(target.action)) target.action.state = "needs_information";
  });
}

function normalizeIdList(value) {
  return PARSER_CORE.normalizeIdList(value);
}

function normalizeNameList(value) {
  return PARSER_CORE.normalizeNameList(value);
}

function normalizeEmailAction(action) {
  return PARSER_CORE.normalizeEmailAction(action);
}

function normalizeEmailActionForExport(action) {
  const normalized = normalizeEmailAction(action);
  normalized.state = emailDraftRequiredInformationMissing(normalized) ? "needs_information" : "accepted";
  return normalized;
}

function recordsToRawText(records) {
  if (!Array.isArray(records) || !records.length) return "";
  return records.map(record => record.sourceText || record.description || "").filter(Boolean).join("\n");
}

function firstRecordDate(records) {
  if (!Array.isArray(records)) return "";
  for (const record of records) {
    const date = normalizeDate(record.sourceDate) || dateFromIso(record.createdAt);
    if (date) return date;
  }
  return "";
}

function extractSiteFromText(text) {
  const siteMatch = String(text || "").match(/^\s*site\s*:\s*(.+)$/im);
  return siteMatch ? normalizeText(siteMatch[1]) : "";
}

function usableText(value) {
  const text = normalizeText(value);
  if (!text || /^not stated$/i.test(text)) return "";
  return text;
}

function setSelectValue(select, value) {
  if (!select) return;
  const existing = Array.from(select.options).find(option => option.value === value);
  if (existing) {
    select.value = value;
  } else {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
    select.value = value;
  }
}

// =====================================================
// DATE HELPERS
// =====================================================
function resolveDateForImport({ rawText = "", packageDate = "", recordDate = "", fallbackDate = "" } = {}) {
  const explicitDate = extractExplicitDate(rawText);
  if (explicitDate) return { date: explicitDate, basis: "explicit source date" };

  const normalizedPackageDate = normalizeDate(packageDate);
  if (normalizedPackageDate) return { date: normalizedPackageDate, basis: "package shiftDate / date input" };

  const normalizedRecordDate = normalizeDate(recordDate);
  if (normalizedRecordDate) return { date: normalizedRecordDate, basis: "imported record date" };

  const normalizedFallback = normalizeDate(fallbackDate);
  if (normalizedFallback) return { date: normalizedFallback, basis: fallbackDate ? "file modified date / fallback" : "fallback" };

  return { date: todayString(), basis: "today fallback" };
}

function extractExplicitDate(text) {
  const source = String(text || "");
  const dateLine = source.match(/^\s*date\s*:\s*(.+)$/im);
  if (dateLine) {
    const date = findDateInText(dateLine[1]);
    if (date) return date;
  }

  const leading = source.split(/\r?\n/).map(line => extractLeadingDate(line).date).find(Boolean);
  if (leading) return leading;

  return findDateInText(source);
}

function extractLeadingDate(line) {
  const source = String(line || "").trim();
  const date = findDateInText(source, true);
  if (!date) return { date: "", remainder: source };

  const patterns = [
    /^\s*\d{4}-\d{2}-\d{2}\s*[-,:]?\s*/,
    /^\s*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\s*[-,:]?\s*/,
    /^\s*[A-Za-z]+\s+\d{1,2}(?:,|\/|-)?\s*\d{4}\s*[-,:]?\s*/
  ];

  for (const pattern of patterns) {
    if (pattern.test(source)) {
      return { date, remainder: source.replace(pattern, "").trim() };
    }
  }

  return { date: "", remainder: source };
}

function findDateInText(text, mustStart = false) {
  const source = String(text || "");
  const prefix = mustStart ? "^\\s*" : "";

  const iso = new RegExp(`${prefix}(\\d{4}-\\d{2}-\\d{2})`, "i").exec(source);
  if (iso) return normalizeDate(iso[1]);

  const named = new RegExp(`${prefix}([A-Za-z]+)\\s+(\\d{1,2})(?:,|\\/|-)?\\s*(\\d{4})`, "i").exec(source);
  if (named) return normalizeNamedMonthDate(named[1], named[2], named[3]);

  const numeric = new RegExp(`${prefix}(\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4})`, "i").exec(source);
  if (numeric) return normalizeDate(numeric[1]);

  return "";
}

function normalizeDate(value) {
  const text = String(value || "").trim();
  if (!text || /^not stated$/i.test(text)) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const named = text.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,|\/|-)?\s*(\d{4})$/);
  if (named) return normalizeNamedMonthDate(named[1], named[2], named[3]);

  const parts = text.split(/[\/-]/).map(Number);
  if (parts.length === 3 && parts.every(n => Number.isFinite(n))) {
    let [a, b, c] = parts;
    if (c < 100) c += 2000;
    let month = a;
    let day = b;
    if (a > 12 && b <= 12) {
      day = a;
      month = b;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return "";
    return `${c}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return "";
}

function normalizeNamedMonthDate(monthName, dayValue, yearValue) {
  const monthMap = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
  };
  const month = monthMap[String(monthName || "").toLowerCase()];
  const day = Number(dayValue);
  const year = Number(yearValue);
  if (!month || !day || !year || day < 1 || day > 31) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateFromFile(file) {
  if (!file || !file.lastModified) return "";
  const date = new Date(file.lastModified);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function dateFromIso(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function isoFromSourceDate(sourceDate) {
  const date = normalizeDate(sourceDate);
  if (!date) return nowIso();
  return `${date}T00:00:00-04:00`;
}

// =====================================================
// GENERAL UTILITIES
// =====================================================
function normalizeText(value) {
  return PARSER_CORE.normalizeText(value);
}

function sentenceCase(value) {
  const text = normalizeText(value);
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/\s+([.,;:!?])/g, "$1");
}

function hasScheduledDateOrTime(value) {
  const text = String(value || "").toLowerCase();
  return hasRealDate(text) || /\b([0-2]?\d:[0-5]\d|[1-9]|1[0-2])\s*(am|pm)\b/.test(text) || /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(text);
}

function hasRealDate(value) {
  return /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b[A-Za-z]+\s+\d{1,2}(?:,|\/|-)\s*\d{4}\b/.test(String(value || ""));
}

function looksLikeEmailAddress(value) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(String(value || ""));
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function nowIso() {
  return new Date().toISOString();
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(value) {
  const text = String(value || "");
  if (!text || text === "not parsed yet") return "not parsed yet";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString();
}

function slugify(value) {
  return String(value || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "site";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setStatus(message) {
  els.statusLine.textContent = message;
}

let toastTimer = null;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1800);
}
