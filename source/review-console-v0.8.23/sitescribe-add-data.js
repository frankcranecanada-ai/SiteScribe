(function initSiteScribeAddData(root, factory) {
  const core = root && root.SiteScribeParserCore
    ? root.SiteScribeParserCore
    : (typeof module === "object" && module.exports ? require("./sitescribe-parser-core.js") : null);
  const api = factory(root, core);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SiteScribeAddData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSiteScribeAddData(root, core) {
  "use strict";

  const MODULE_VERSION = "v0.8.13";
  const REQUIRED_CORE_VERSION = "1.0.1";
  const MAX_PARSER_INSTRUCTION_LENGTH = 2000;
  const CATEGORY_OPTIONS = ["event", "action", "followup", "scheduled", "safety", "communication", "document"];
  const MODEL_NAME = "two-level-records-with-record-flags";
  const FEATURE_ENABLED = !(root && root.SITESCRIBE_ADD_DATA_ENABLED === false);
  const API_ENDPOINT = String(root && root.SITESCRIBE_ADD_DATA_API_ENDPOINT || "/SiteScribe-Parser-Lite/server/parse.php");

  const state = {
    overlay: null,
    context: null,
    rawText: "",
    parserInstruction: "",
    package: null,
    acceptedIds: new Set(),
    selectedEmailKeys: new Set(),
    validationMessages: [],
    busy: false,
    busyStartedAt: null,
    busyTimer: null
  };

  function defaultRequestTemplate() {
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
      "- Keep the capped three-level model: primary records in records[], secondary records in comments[], and activity records in a secondary record's activities[] only. Activity records must never contain children.",
      "- If one source note contains a main issue plus related updates, instructions, follow-ups, status changes, or end-of-day notes, create one primary record and place those independent child records in comments[]. Use activities[] only when the source or the operator instruction clearly establishes that a secondary record is a container for separately trackable execution details.",
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
      "- Every primary, secondary, and activity record must include deliverable: { \"apply\": boolean, \"date\": \"YYYY-MM-DD or blank\" }.",
      "- Every primary and secondary record must include intent using one of the configured intent IDs when possible. Use documentation_internal only for factual internal records that do not require communication.",
      "- Intent mapping: a safety-category record must use safety_notification; lift planning, crane configuration, rigging, ground-bearing pressure, parts-of-line, planned work, or scheduling records must use planning_scheduling; an explicit request for a document must use document_request; a direct request for action or confirmation must use action_required. Do not use documentation_internal as a generic default for those records.",
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
      "        { \"id\": \"com_unique_id\", \"text\": \"secondary update\", \"status\": \"open\", \"createdAt\": \"ISO timestamp\", \"updatedAt\": \"ISO timestamp\", \"sourceText\": \"supporting wording\", \"deliverable\": { \"apply\": false, \"date\": \"\" }, \"activities\": [{ \"id\": \"act_unique_id\", \"text\": \"separately trackable activity\", \"status\": \"open\", \"createdAt\": \"ISO timestamp\", \"updatedAt\": \"ISO timestamp\", \"sourceText\": \"supporting wording\", \"deliverable\": { \"apply\": false, \"date\": \"\" } }], \"action\": { \"type\": \"communication\", \"method\": \"email_draft\", \"purpose\": \"request_decision\", \"state\": \"proposed or needs_information\", \"recipientIds\": [\"known_contact_id\"], \"ccRecipientIds\": [], \"unresolvedRecipientNames\": [], \"unresolvedCcRecipientNames\": [], \"subject\": \"editable subject\", \"body\": \"editable body\", \"source\": \"parser_ai\" } }",
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

  function buildRequest(rawText, context, contacts, parserInstruction = "") {
    if (!core || core.version !== REQUIRED_CORE_VERSION) throw new Error(`SiteScribe Parser Core v${REQUIRED_CORE_VERSION} is required.`);
    const request = core.buildRequest({
      rawText,
      context,
      categories: CATEGORY_OPTIONS,
      template: { name: "SiteScribe Standard", version: "v1.3", text: defaultRequestTemplate() },
      appVersion: MODULE_VERSION,
      modelName: MODEL_NAME,
      contacts
    });
    const instruction = String(parserInstruction || "").trim();
    if (!instruction) return request;
    const instructionBlock = [
      "",
      "Operator parsing instruction (guidance only; not source evidence):",
      "--- BEGIN OPERATOR INSTRUCTION ---",
      instruction,
      "--- END OPERATOR INSTRUCTION ---",
      "Apply this instruction only when it remains consistent with every critical rule and the required JSON shape above.",
      "Do not treat the instruction as a fact, source evidence, recipient, date, owner, obligation, or sourceText."
    ].join("\n");
    const rawNotesMarker = "\nRaw site notes:\n--- BEGIN RAW NOTES ---";
    return request.includes(rawNotesMarker)
      ? request.replace(rawNotesMarker, `${instructionBlock}${rawNotesMarker}`)
      : `${request}${instructionBlock}`;
  }

  function suggestedIntent(item) {
    const category = String(item && item.category || "").toLowerCase();
    const source = [item?.sourceText, item?.description, item?.text].filter(Boolean).join(" ");
    if (category === "safety") return "safety_notification";
    if (/\b(?:lift\s*plan|crane\s+(?:configuration|mobilization|setup)|rigging|ground\s*(?:bearing|pressure)|parts?[-\s]of[-\s]line|planned\s+(?:lift|work)|schedule|scheduling)\b/i.test(source)) return "planning_scheduling";
    if (category === "document") return "document_request";
    if (category === "scheduled") return "planning_scheduling";
    if (category === "followup") return "follow_up";
    if (category === "communication" || category === "action") return "action_required";
    return "documentation_internal";
  }

  function resolveStagedIntent(item) {
    const supplied = String(item && item.intent || "").trim();
    // An explicit non-documentation intent remains the parser's suggestion. This
    // repair exists only for the generic default that hid valid routing candidates.
    if (supplied && supplied !== "documentation_internal") return { intent: supplied, source: "parser_suggested" };
    const repaired = suggestedIntent(item);
    return {
      intent: repaired,
      source: supplied === "documentation_internal" && repaired !== supplied
        ? "local_category_source_repair"
        : (supplied ? "parser_suggested" : "local_category_default")
    };
  }

  function normalizeEmailComment(comment, fallbackSourceText, contacts, recordIndex, commentIndex) {
    const sourceText = String(comment && comment.sourceText || fallbackSourceText || "");
    const text = String(comment && (comment.text || comment.description) || "");
    const stagedIntent = resolveStagedIntent({ ...(comment || {}), sourceText, text });
    const output = {
      ...(comment || {}),
      id: String(comment && comment.id || `adddata_com_${recordIndex + 1}_${commentIndex + 1}`),
      text,
      status: comment && comment.status === "closed" ? "closed" : "open",
      sourceText,
      intent: stagedIntent.intent,
      intentSource: String(comment && comment.intentSource || stagedIntent.source),
      deliverable: comment && typeof comment.deliverable === "object" ? comment.deliverable : { apply: false, date: "" }
    };
    if (comment && comment.action && typeof comment.action === "object") {
      output.action = core.normalizeEmailAction(comment.action);
    } else {
      const repaired = core.buildEmailAction([text, sourceText].filter(Boolean).join(" "), contacts);
      if (repaired) output.action = core.normalizeEmailAction({ ...repaired.action, source: "parser_deterministic_repair" });
    }
    return output;
  }

  function normalizePackageForStaging(json, context, contacts, rawText, parserInstruction = "") {
    if (!json || typeof json !== "object" || !Array.isArray(json.records)) throw new Error("The parser result does not contain records[].");
    const now = new Date().toISOString();
    const seenIds = new Set();
    const records = json.records.map((record, recordIndex) => {
      let id = String(record && record.id || `adddata_rec_${Date.now()}_${recordIndex + 1}`);
      if (seenIds.has(id)) id = `${id}_${recordIndex + 1}`;
      seenIds.add(id);
      const sourceText = String(record && (record.sourceText || record.description) || "");
      const sourceDate = String(record && record.sourceDate || context.shiftDate || "");
      const stagedIntent = resolveStagedIntent({ ...(record || {}), sourceText });
      return {
        ...(record || {}),
        id,
        category: CATEGORY_OPTIONS.includes(record && record.category) ? record.category : "event",
        description: String(record && record.description || ""),
        status: record && record.status === "closed" ? "closed" : "open",
        createdAt: String(record && record.createdAt || now),
        updatedAt: String(record && record.updatedAt || now),
        closedAt: String(record && record.closedAt || ""),
        sourceDate,
        sourceText,
        intent: stagedIntent.intent,
        intentSource: String(record && record.intentSource || stagedIntent.source),
        deliverable: record && typeof record.deliverable === "object" ? record.deliverable : { apply: false, date: "" },
        flags: Array.isArray(record && record.flags) ? record.flags : [],
      comments: (Array.isArray(record && record.comments) ? record.comments : [])
          .map((comment, commentIndex) => {
            const normalizedComment = normalizeEmailComment(comment, sourceText, contacts, recordIndex, commentIndex);
            normalizedComment.activities = (Array.isArray(comment && comment.activities) ? comment.activities : [])
              .map((activity, activityIndex) => ({ ...normalizeEmailComment(activity, normalizedComment.sourceText, contacts, recordIndex, `${commentIndex}_${activityIndex}`), activities: [] }));
            return normalizedComment;
          })
      };
    });
    return {
      packageType: "sitescribe_three_level_records",
      version: "1.1",
      site: context.site,
      shiftDate: context.shiftDate,
      processedAt: String(json.processedAt || now),
      source: {
        captureMethod: "SiteScribe Add Data",
        rawText: String(rawText || ""),
        parserInstruction: String(parserInstruction || "").trim()
      },
      dailySummary: String(json.dailySummary || ""),
      packageFlags: Array.isArray(json.packageFlags) ? json.packageFlags : [],
      parser: { appName: "SiteScribe Shared Parser Core", coreVersion: REQUIRED_CORE_VERSION, integrationVersion: MODULE_VERSION },
      reviewConsole: { appName: "SiteScribe Review Console", appVersion: MODULE_VERSION, model: MODEL_NAME },
      records
    };
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function bridge() {
    return root && root.SiteScribeAddDataBridge;
  }

  function setStatus(message, tone) {
    if (!state.overlay) return;
    const node = state.overlay.querySelector("#addDataStatus");
    if (!node) return;
    node.className = `add-data-status${tone ? ` ${tone}` : ""}`;
    if (tone === "busy") {
      node.replaceChildren();
      const indicator = root.document.createElement("span");
      indicator.className = "add-data-busy-indicator";
      indicator.setAttribute("aria-hidden", "true");
      const messageNode = root.document.createElement("span");
      messageNode.className = "add-data-busy-message";
      messageNode.textContent = String(message || "Parsing notes…");
      const elapsed = root.document.createElement("span");
      elapsed.id = "addDataBusyElapsed";
      elapsed.className = "add-data-busy-elapsed";
      node.append(indicator, messageNode, elapsed);
      updateBusyElapsed();
      return;
    }
    node.textContent = String(message || "");
  }

  function updateBusyElapsed() {
    if (!state.overlay || !state.busyStartedAt) return;
    const elapsed = state.overlay.querySelector("#addDataBusyElapsed");
    if (!elapsed) return;
    const seconds = Math.max(0, Math.floor((Date.now() - state.busyStartedAt) / 1000));
    elapsed.textContent = `${seconds}s elapsed`;
  }

  function resizeRawText() {
    if (!state.overlay) return;
    const raw = state.overlay.querySelector("#addDataRawText");
    if (!raw) return;
    raw.style.height = "auto";
    raw.style.height = `${Math.min(Math.max(raw.scrollHeight, 96), 288)}px`;
    raw.style.overflowY = raw.scrollHeight > 288 ? "auto" : "hidden";
  }

  function setBusy(busy) {
    state.busy = Boolean(busy);
    if (!state.overlay) return;
    if (state.busy) {
      state.busyStartedAt = Date.now();
      if (state.busyTimer) root.clearInterval(state.busyTimer);
      state.busyTimer = root.setInterval(updateBusyElapsed, 250);
      state.overlay.classList.add("add-data-is-parsing");
      state.overlay.setAttribute("aria-busy", "true");
    } else {
      if (state.busyTimer) root.clearInterval(state.busyTimer);
      state.busyTimer = null;
      state.busyStartedAt = null;
      state.overlay.classList.remove("add-data-is-parsing");
      state.overlay.removeAttribute("aria-busy");
    }
    state.overlay.querySelectorAll("button, input, textarea").forEach(control => {
      if (control.id === "closeAddDataButton") return;
      control.disabled = state.busy;
    });
    const parseButton = state.overlay.querySelector("#parseAddDataButton");
    if (parseButton) parseButton.textContent = state.busy ? "Parsing…" : "Parse for Review";
    if (!state.busy) renderProposals();
  }

  function apiResultText(data) {
    if (!data || typeof data !== "object") return "";
    if (data.json && typeof data.json === "object") return JSON.stringify(data.json);
    return [data.resultText, data.outputText, data.output_text, data.text].find(value => typeof value === "string") || "";
  }

  async function safeReadJson(response) {
    const text = await response.text();
    if (!text.trim()) return {};
    try { return JSON.parse(text); }
    catch (error) { return { ok: false, error: text.slice(0, 500) }; }
  }

  async function parseRawData() {
    if (state.busy || !state.overlay) return;
    const currentBridge = bridge();
    const context = currentBridge && currentBridge.getCurrentContext();
    const rawText = String(state.overlay.querySelector("#addDataRawText")?.value || "").trim();
    const parserInstruction = String(state.overlay.querySelector("#addDataParserInstruction")?.value || "").trim();
    if (!context || !context.ready) return setStatus("Open or create a named Saved Site before parsing notes.", "error");
    if (!rawText) return setStatus("Enter one note or a block of raw notes first.", "error");
    if (parserInstruction.length > MAX_PARSER_INSTRUCTION_LENGTH) return setStatus(`Keep the parsing instruction to ${MAX_PARSER_INSTRUCTION_LENGTH} characters or fewer.`, "error");
    const contacts = typeof currentBridge.ensureSiteContacts === "function"
      ? await currentBridge.ensureSiteContacts()
      : currentBridge.getSiteContacts();
    let request;
    try { request = buildRequest(rawText, context, contacts, parserInstruction); }
    catch (error) { return setStatus(error.message || error, "error"); }

    const startedAt = Date.now();
    setBusy(true);
    setStatus("Parsing notes through Shared Parser Core v1.0.1…", "busy");
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          request,
          context,
          appVersion: MODULE_VERSION,
          modelName: MODEL_NAME,
          template: { name: "SiteScribe Standard", version: "v1.3" }
        })
      });
      const data = await safeReadJson(response);
      if (!response.ok || !data || data.ok === false) throw new Error(data.error || data.message || `HTTP ${response.status}`);
      const resultText = apiResultText(data);
      const extracted = core.extractJson(resultText);
      if (!extracted.ok) throw new Error(extracted.message);
      const validation = core.validateResult(extracted.json, CATEGORY_OPTIONS);
      if (!validation.ok) throw new Error(validation.messages.join(" "));
      state.context = context;
      state.rawText = rawText;
      state.parserInstruction = parserInstruction;
      state.package = normalizePackageForStaging(extracted.json, context, contacts, rawText, parserInstruction);
      state.package.records.forEach(record => {
        record.emailRecommendation = { routing: currentBridge.getRoutingRecommendation(record, null) };
        (record.comments || []).forEach(comment => {
          comment.emailRecommendation = { routing: currentBridge.getRoutingRecommendation(comment, record) };
          (comment.activities || []).forEach(activity => { activity.emailRecommendation = { routing: currentBridge.getRoutingRecommendation(activity, record) }; });
        });
      });
      state.acceptedIds = new Set(state.package.records.map(record => record.id));
      state.selectedEmailKeys = new Set();
      state.validationMessages = validation.messages;
      renderProposals();
      const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      setStatus(`Parse completed in ${seconds} second${seconds === 1 ? "" : "s"}. Review ${state.package.records.length} proposed record${state.package.records.length === 1 ? "" : "s"}.`, "success");
    } catch (error) {
      setStatus(`Parse Notes failed: ${error.message || error}`, "error");
    } finally {
      setBusy(false);
    }
  }

  function contactLabel(id) {
    const contacts = bridge()?.getSiteContacts?.() || [];
    const contact = contacts.find(item => item.id === id);
    return contact ? (contact.fullName || contact.name || id) : id;
  }

  function emailActionSummary(action) {
    if (!action || action.type !== "communication" || action.method !== "email_draft") return "";
    const resolvedTo = (action.recipientIds || []).map(contactLabel);
    const unresolvedTo = core.normalizeNameList(action.unresolvedRecipientNames);
    const resolvedCc = (action.ccRecipientIds || []).map(contactLabel);
    const unresolvedCc = core.normalizeNameList(action.unresolvedCcRecipientNames);
    const needs = core.emailDraftRequiredInformationMissing(action);
    return `<div class="add-data-email-summary ${needs ? "needs-info" : "complete"}">
      <strong>Email draft${needs ? " — needs information" : ""}</strong>
      <span>To: ${escapeHtml([...resolvedTo, ...unresolvedTo].join(", ") || "not stated")}</span>
      ${resolvedCc.length || unresolvedCc.length ? `<span>CC: ${escapeHtml([...resolvedCc, ...unresolvedCc].join(", "))}</span>` : ""}
      <span>Subject: ${escapeHtml(action.subject || "not stated")}</span>
    </div>`;
  }

  function renderProposals() {
    if (!state.overlay) return;
    const rootNode = state.overlay.querySelector("#addDataProposals");
    const appendButton = state.overlay.querySelector("#appendAddDataButton");
    const reviewSection = state.overlay.querySelector("#addDataReviewSection");
    const commitActions = state.overlay.querySelector("#addDataCommitActions");
    const commitHint = state.overlay.querySelector("#addDataCommitHint");
    if (!state.package || !state.package.records.length) {
      rootNode.innerHTML = `<div class="add-data-empty">No proposed records yet.</div>`;
      if (appendButton) appendButton.disabled = true;
      if (reviewSection) reviewSection.hidden = true;
      if (commitActions) commitActions.hidden = true;
      if (commitHint) commitHint.hidden = true;
      return;
    }
    if (reviewSection) reviewSection.hidden = false;
    if (commitActions) commitActions.hidden = false;
    if (commitHint) commitHint.hidden = false;
    const instruction = String(state.parserInstruction || state.package.source?.parserInstruction || "").trim();
    const instructionSummary = instruction ? `<details class="add-data-parser-instruction" open><summary>Parsing instruction used</summary><p>${escapeHtml(instruction)}</p><small>Sent separately to the parser; it is not added to source text.</small></details>` : "";
    rootNode.innerHTML = `${instructionSummary}${state.package.records.map((record, index) => {
      const included = state.acceptedIds.has(record.id);
      const primaryRecommendation = record.emailRecommendation;
      const recommendationHtml = (recommendation, key) => recommendation ? `<div class="add-data-routing ${recommendation.routing?.status === "resolved" ? "resolved" : "unresolved"}"><strong>${recommendation.routing?.status === "resolved" ? "Email option" : "Email routing warning"}</strong><span>${escapeHtml(recommendation.routing?.status === "resolved" ? `${recommendation.routing.recipientSnapshot.department || recommendation.routing.recipientSnapshot.company} → ${recommendation.routing.recipientSnapshot.name}` : recommendation.routing?.reason || "No safe recipient")}</span><small>${escapeHtml(recommendation.routing?.reason || "")}</small>${recommendation.routing?.status === "resolved" ? `<label><input type="checkbox" data-add-data-email="${escapeHtml(key)}" ${state.selectedEmailKeys.has(key) ? "checked" : ""}> Create draft (unchecked by default)</label>` : ""}</div>` : "";
      const comments = (record.comments || []).map(comment => {
        const activities = (comment.activities || []).map(activity => `
          <div class="add-data-activity">
            <span class="add-data-secondary-label">Activity</span>
            <span>${escapeHtml(activity.text || "Untitled activity record")}</span>
            ${emailActionSummary(activity.action)}
            ${recommendationHtml(activity.emailRecommendation, `activity:${record.id}:${comment.id}:${activity.id}`)}
          </div>`).join("");
        return `
        <div class="add-data-secondary">
          <span class="add-data-secondary-label">Secondary</span>
          <span>${escapeHtml(comment.text || "Untitled secondary record")}</span>
          ${emailActionSummary(comment.action)}
          ${recommendationHtml(comment.emailRecommendation, `secondary:${record.id}:${comment.id}`)}
          ${activities}
        </div>`;
      }).join("");
      const flags = (record.flags || []).map(flag => `<li>${escapeHtml(flag.text || flag.description || "Review required")}</li>`).join("");
      const deliverable = record.deliverable && record.deliverable.apply && record.deliverable.date
        ? `<span class="add-data-deliverable">Deliverable ${escapeHtml(record.deliverable.date)}</span>` : "";
      return `<article class="add-data-proposal ${included ? "included" : "excluded"}" data-proposal-id="${escapeHtml(record.id)}">
        <label class="add-data-proposal-toggle">
          <input type="checkbox" data-add-data-include="${escapeHtml(record.id)}" ${included ? "checked" : ""}>
          <span>${included ? "Include" : "Exclude"}</span>
        </label>
        <div class="add-data-proposal-body">
          <div class="add-data-proposal-heading">
            <span class="add-data-category">${escapeHtml(record.category)}</span>
            <strong>${index + 1}. ${escapeHtml(record.description || "Untitled proposed record")}</strong>
            ${deliverable}
          </div>
          ${flags ? `<div class="add-data-warning"><strong>Needs review</strong><ul>${flags}</ul></div>` : ""}
          <div class="add-data-intent"><strong>Intent:</strong> ${escapeHtml(record.intent || "documentation_internal")}</div>
          ${recommendationHtml(primaryRecommendation, `primary:${record.id}`)}
          ${comments ? `<div class="add-data-secondary-list">${comments}</div>` : ""}
          <details><summary>Source text</summary><p>${escapeHtml(record.sourceText || "not stated")}</p></details>
        </div>
      </article>`;
    }).join("")}`;
    const count = state.acceptedIds.size;
    if (appendButton) {
      appendButton.disabled = !count;
      appendButton.textContent = `Append ${count} Accepted Record${count === 1 ? "" : "s"}`;
    }
    const warningNode = state.overlay.querySelector("#addDataValidationWarnings");
    if (warningNode) warningNode.innerHTML = state.validationMessages.length
      ? `<details><summary>${state.validationMessages.length} parser warning${state.validationMessages.length === 1 ? "" : "s"}</summary><ul>${state.validationMessages.map(message => `<li>${escapeHtml(message)}</li>`).join("")}</ul></details>`
      : "";
  }

  async function appendAccepted() {
    if (!state.package || state.busy) return;
    const acceptedRecords = state.package.records.filter(record => state.acceptedIds.has(record.id));
    if (!acceptedRecords.length) return setStatus("Include at least one proposed record before appending.", "error");
    setBusy(true);
    try {
      const outgoing = bridge().prepareSelectedEmailDrafts({ ...state.package, records: acceptedRecords }, [...state.selectedEmailKeys]);
      const summary = bridge().appendAcceptedPackage(outgoing, `Add Data ${new Date().toISOString()}`);
      const openedDraft = state.selectedEmailKeys.size && typeof bridge().focusFirstSelectedEmailDraft === "function"
        ? bridge().focusFirstSelectedEmailDraft(outgoing, [...state.selectedEmailKeys])
        : false;
      setStatus(`Appended ${summary.added} record${summary.added === 1 ? "" : "s"}; skipped ${summary.skipped} duplicate${summary.skipped === 1 ? "" : "s"}.${openedDraft ? " The first selected email draft is now open for review." : ""}`, "success");
      state.rawText = "";
      state.package = null;
      state.acceptedIds = new Set();
      state.selectedEmailKeys = new Set();
      state.validationMessages = [];
      setBusy(false);
      closeOverlay({ force: true, preserveRaw: false });
    } catch (error) {
      setStatus(error.message || error, "error");
    } finally {
      setBusy(false);
    }
  }

  function clearStaging() {
    if (!state.overlay || state.busy) return;
    state.rawText = "";
    state.parserInstruction = "";
    state.package = null;
    state.acceptedIds = new Set();
    state.selectedEmailKeys = new Set();
    state.validationMessages = [];
    const raw = state.overlay.querySelector("#addDataRawText");
    if (raw) raw.value = "";
    const parserInstruction = state.overlay.querySelector("#addDataParserInstruction");
    if (parserInstruction) parserInstruction.value = "";
    resizeRawText();
    renderProposals();
    setStatus("Parse Notes staging cleared.");
  }

  async function loadTextFile(file) {
    if (!file) return;
    if (!/\.(txt|md|eml)$/i.test(file.name || "") && !/^text\//i.test(file.type || "") && file.type !== "message/rfc822") {
      return setStatus("Parse Notes currently accepts typed/pasted text and .txt, .md, or .eml files.", "error");
    }
    try {
      const text = await file.text();
      const raw = state.overlay.querySelector("#addDataRawText");
      raw.value = [raw.value.trim(), text.trim()].filter(Boolean).join("\n\n");
      resizeRawText();
      setStatus(`Loaded ${file.name || "text file"}.`);
    } catch (error) {
      setStatus("The selected text file could not be read.", "error");
    }
  }

  function closeOverlay(options = {}) {
    if (!state.overlay || (state.busy && !options.force)) return;
    state.rawText = options.preserveRaw === false
      ? ""
      : String(state.overlay.querySelector("#addDataRawText")?.value || "");
    state.parserInstruction = options.preserveRaw === false
      ? ""
      : String(state.overlay.querySelector("#addDataParserInstruction")?.value || "");
    if (options.preserveRaw === false) state.overlay.querySelector("#addDataRawText").value = "";
    if (options.preserveRaw === false) state.overlay.querySelector("#addDataParserInstruction").value = "";
    state.overlay.classList.remove("open");
    state.overlay.setAttribute("aria-hidden", "true");
  }

  function openOverlay() {
    const currentBridge = bridge();
    if (!currentBridge) return;
    state.context = currentBridge.getCurrentContext();
    state.overlay.querySelector("#addDataCurrentSite").textContent = state.context.site || "No named site open";
    state.overlay.querySelector("#addDataCurrentDate").textContent = state.context.shiftDate || "not stated";
    state.overlay.querySelector("#addDataRawText").value = state.rawText;
    state.overlay.querySelector("#addDataParserInstruction").value = state.parserInstruction;
    resizeRawText();
    state.overlay.classList.add("open");
    state.overlay.setAttribute("aria-hidden", "false");
    renderProposals();
    setStatus(state.context.ready ? "" : "Open or create a named Saved Site before parsing notes.", state.context.ready ? "" : "error");
    setTimeout(() => {
      resizeRawText();
      state.overlay.querySelector("#addDataRawText")?.focus();
    }, 0);
  }

  function createOverlay(document) {
    const overlay = document.createElement("aside");
    overlay.id = "addDataOverlay";
    overlay.className = "add-data-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `<div class="add-data-card" role="dialog" aria-modal="true" aria-labelledby="addDataTitle">
      <div class="detail-header">
        <div><h2 id="addDataTitle">Parse Notes</h2><p class="muted">Paste notes, review proposals, then append accepted records.</p></div>
        <button id="closeAddDataButton" type="button" class="secondary">Close</button>
      </div>
      <div class="add-data-context">
        <div><span>Site</span><strong id="addDataCurrentSite"></strong></div>
        <div><span>Date</span><strong id="addDataCurrentDate"></strong></div>
      </div>
      <label class="field-label" for="addDataRawText">Notes to parse</label>
      <textarea id="addDataRawText" rows="4" placeholder="Type or paste notes, email text, or a daily log."></textarea>
      <label class="field-label add-data-parser-instruction-label" for="addDataParserInstruction">Parsing instruction <span>(optional)</span></label>
      <textarea id="addDataParserInstruction" rows="3" maxlength="2000" placeholder="Example: Create one Phase 4A schedule primary and place the dated schedule items beneath it as secondary records."></textarea>
      <p class="muted small-hint add-data-parser-instruction-hint">Sent separately with this parse to guide grouping and review. It is not source text, does not invent facts, and is cleared when this intake is cleared or appended.</p>
      <div class="button-row add-data-intake-actions">
        <label class="secondary button-like" for="addDataTextFile">Import Text</label>
        <input id="addDataTextFile" class="visually-hidden-file" type="file" accept=".txt,.md,.eml,text/plain,text/markdown,message/rfc822">
        <button id="parseAddDataButton" type="button">Parse for Review</button>
        <button id="clearAddDataButton" type="button" class="secondary small">Clear</button>
      </div>
      <p id="addDataStatus" class="add-data-status" aria-live="polite"></p>
      <div id="addDataValidationWarnings" class="add-data-validation-warnings"></div>
      <section id="addDataReviewSection" class="add-data-review-section" hidden>
        <h3>Proposed Records</h3>
        <div id="addDataProposals" class="add-data-proposals"><div class="add-data-empty">No proposed records yet.</div></div>
      </section>
      <div id="addDataCommitActions" class="button-row add-data-commit-actions" hidden>
        <button id="appendAddDataButton" type="button" class="small" disabled>Append Accepted Records</button>
        <button id="cancelAddDataButton" type="button" class="secondary small">Cancel</button>
      </div>
      <p id="addDataCommitHint" class="muted small-hint add-data-commit-hint" hidden>Nothing enters Working Memory until Append Accepted Records is pressed. SiteScribe does not send email or automatically save to Dropbox.</p>
    </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  function initializeBrowser() {
    const document = root && root.document;
    if (!document) return;
    const launchButton = document.getElementById("addDataButton");
    const hint = document.getElementById("addDataFeatureHint");
    if (!FEATURE_ENABLED) {
      if (launchButton) launchButton.hidden = true;
      if (hint) hint.hidden = true;
      return;
    }
    if (!core || core.version !== REQUIRED_CORE_VERSION || !bridge()) {
      if (launchButton) launchButton.disabled = true;
      if (hint) hint.textContent = `Parse Notes unavailable: Shared Parser Core v${REQUIRED_CORE_VERSION} did not load.`;
      return;
    }
    state.overlay = createOverlay(document);
    launchButton.addEventListener("click", openOverlay);
    state.overlay.addEventListener("click", event => {
      if (event.target === state.overlay || event.target.id === "closeAddDataButton" || event.target.id === "cancelAddDataButton") closeOverlay();
      if (event.target.id === "parseAddDataButton") parseRawData();
      if (event.target.id === "clearAddDataButton") clearStaging();
      if (event.target.id === "appendAddDataButton") appendAccepted();
      const checkbox = event.target.closest("[data-add-data-include]");
      if (checkbox) {
        if (checkbox.checked) state.acceptedIds.add(checkbox.dataset.addDataInclude);
        else state.acceptedIds.delete(checkbox.dataset.addDataInclude);
        renderProposals();
      }
      const emailCheckbox = event.target.closest("[data-add-data-email]");
      if (emailCheckbox) {
        if (emailCheckbox.checked) state.selectedEmailKeys.add(emailCheckbox.dataset.addDataEmail);
        else state.selectedEmailKeys.delete(emailCheckbox.dataset.addDataEmail);
        renderProposals();
      }
    });
    state.overlay.querySelector("#addDataTextFile").addEventListener("change", event => {
      loadTextFile(event.target.files && event.target.files[0]);
      event.target.value = "";
    });
    const rawText = state.overlay.querySelector("#addDataRawText");
    rawText.addEventListener("input", resizeRawText);
    rawText.addEventListener("dragover", event => { event.preventDefault(); rawText.classList.add("drag-over"); });
    rawText.addEventListener("dragleave", () => rawText.classList.remove("drag-over"));
    rawText.addEventListener("drop", event => {
      event.preventDefault();
      rawText.classList.remove("drag-over");
      loadTextFile(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && state.overlay.classList.contains("open")) closeOverlay();
    });
  }

  if (root && root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", initializeBrowser);
    else initializeBrowser();
  }

  return {
    version: MODULE_VERSION,
    requiredCoreVersion: REQUIRED_CORE_VERSION,
    featureEnabled: FEATURE_ENABLED,
    apiEndpoint: API_ENDPOINT,
    defaultRequestTemplate,
    buildRequest,
    normalizePackageForStaging
  };
});
