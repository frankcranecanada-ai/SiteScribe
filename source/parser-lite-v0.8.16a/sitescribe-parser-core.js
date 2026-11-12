(function initSiteScribeParserCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SiteScribeParserCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSiteScribeParserCore() {
  "use strict";

  const CORE_VERSION = "1.0.1";

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeIdList(value) {
    const raw = Array.isArray(value) ? value : String(value || "").split(",");
    return [...new Set(raw.map(item => normalizeText(item)).filter(Boolean))];
  }

  function normalizeNameList(value) {
    return normalizeIdList(value);
  }

  function safePromptContacts(contacts) {
    return (Array.isArray(contacts) ? contacts : []).map(contact => ({
      id: normalizeText(contact && contact.id),
      name: normalizeText(contact && (contact.name || contact.fullName)),
      fullName: normalizeText(contact && (contact.fullName || contact.name)),
      company: normalizeText(contact && contact.company),
      role: normalizeText(contact && contact.role),
      responsibilities: Array.isArray(contact && contact.responsibilities)
        ? contact.responsibilities.map(normalizeText).filter(Boolean)
        : []
    })).filter(contact => contact.id);
  }

  function buildRequest(options) {
    const settings = options || {};
    const context = settings.context || {};
    const template = settings.template || {};
    const rawText = String(settings.rawText || "");
    const templateText = String(template.text || "");
    const hadRawTextPlaceholder = templateText.includes("{{rawText}}");
    const replacements = {
      site: normalizeText(context.site) || "not stated",
      shiftDate: normalizeText(context.shiftDate) || "not stated",
      captureMethod: normalizeText(context.captureMethod) || "plain text",
      categories: (Array.isArray(settings.categories) ? settings.categories : []).join(", "),
      rawText,
      appVersion: normalizeText(settings.appVersion),
      modelName: normalizeText(settings.modelName),
      templateName: normalizeText(template.name),
      templateVersion: normalizeText(template.version),
      contacts: JSON.stringify(safePromptContacts(settings.contacts), null, 2)
    };
    let request = templateText;
    Object.entries(replacements).forEach(([key, value]) => {
      request = request.split(`{{${key}}}`).join(String(value));
    });
    if (!hadRawTextPlaceholder) {
      request += [
        "",
        "Raw site notes:",
        "--- BEGIN RAW NOTES ---",
        rawText,
        "--- END RAW NOTES ---"
      ].join("\n");
    }
    return request;
  }

  function extractBalancedJsonObject(text) {
    const source = String(text || "");
    const start = source.indexOf("{");
    if (start < 0) return "";
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "{") depth += 1;
      if (char === "}") {
        depth -= 1;
        if (depth === 0) return source.slice(start, index + 1).trim();
      }
    }
    return "";
  }

  function extractJson(text) {
    const source = String(text || "").trim();
    if (!source) return { ok: false, message: "Paste or drop an AI JSON result first." };
    const candidates = [source];
    const fencePattern = /```(?:json)?\s*([\s\S]*?)```/gi;
    let match;
    while ((match = fencePattern.exec(source)) !== null) {
      if (match[1]) candidates.push(match[1].trim());
    }
    const balanced = extractBalancedJsonObject(source);
    if (balanced) candidates.push(balanced);
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return { ok: true, json: parsed };
      } catch (error) {
        // Continue to the next candidate.
      }
    }
    return { ok: false, message: "No valid JSON object could be extracted from the AI result." };
  }

  function flagDisplayText(flag) {
    if (!flag) return "";
    return normalizeText(flag.text)
      || normalizeText(flag.description)
      || normalizeText(flag.question)
      || normalizeText(flag.reason);
  }

  function validateResult(json, categories) {
    const allowedCategories = Array.isArray(categories) ? categories : [];
    const messages = [];
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      return { ok: false, messages: ["AI result must be one JSON object."] };
    }
    if (json.packageType !== "sitescribe_two_level_records") messages.push('packageType should be "sitescribe_two_level_records".');
    if (!Array.isArray(json.records)) messages.push("records[] is missing or is not an array.");
    (Array.isArray(json.records) ? json.records : []).forEach((record, recordIndex) => {
      const prefix = `Record ${recordIndex + 1}`;
      if (!allowedCategories.includes(record.category)) messages.push(`${prefix}: invalid or missing category (${record.category || "blank"}).`);
      if (!normalizeText(record.description)) messages.push(`${prefix}: description is missing.`);
      if (!normalizeText(record.sourceText)) messages.push(`${prefix}: sourceText is missing.`);
      if (!normalizeText(record.sourceDate) || record.sourceDate === "not stated") messages.push(`${prefix}: sourceDate is missing or not stated.`);
      if (!Array.isArray(record.flags)) messages.push(`${prefix}: flags[] missing; it will be normalized to [].`);
      (Array.isArray(record.flags) ? record.flags : []).forEach((flag, flagIndex) => {
        if (!flagDisplayText(flag)) messages.push(`${prefix}, flag ${flagIndex + 1}: flag text is missing.`);
        if (!flag.text && flag.description) messages.push(`${prefix}, flag ${flagIndex + 1}: flag.description will be normalized to flag.text.`);
      });
      if (!Array.isArray(record.comments)) messages.push(`${prefix}: secondary records (comments[]) missing; they will be normalized to [].`);
      if (record.status && !["open", "closed"].includes(record.status)) messages.push(`${prefix}: status will be normalized to open.`);
      if (record.deliverable && typeof record.deliverable !== "object") messages.push(`${prefix}: deliverable will be normalized to apply=false.`);
      (Array.isArray(record.comments) ? record.comments : []).forEach((comment, commentIndex) => {
        if (comment.deliverable && typeof comment.deliverable !== "object") messages.push(`${prefix}, secondary record ${commentIndex + 1}: deliverable will be normalized to apply=false.`);
        if (!comment.action) return;
        const action = comment.action;
        if (action.type !== "communication" || action.method !== "email_draft" || !normalizeText(action.purpose)) {
          messages.push(`${prefix}, secondary record ${commentIndex + 1}: unsupported action type for the limited proof.`);
        }
        const unresolvedTo = normalizeNameList(action.unresolvedRecipientNames);
        const unresolvedCc = normalizeNameList(action.unresolvedCcRecipientNames);
        if (!normalizeIdList(action.recipientIds).length && !unresolvedTo.length) messages.push(`${prefix}, secondary record ${commentIndex + 1}: action recipient is missing.`);
        if (unresolvedTo.length) messages.push(`${prefix}, secondary record ${commentIndex + 1}: To recipient needs contact resolution: ${unresolvedTo.join(", ")}.`);
        if (unresolvedCc.length) messages.push(`${prefix}, secondary record ${commentIndex + 1}: CC recipient needs contact resolution: ${unresolvedCc.join(", ")}.`);
        if (!normalizeText(action.subject)) messages.push(`${prefix}, secondary record ${commentIndex + 1}: action subject is missing.`);
        if (!normalizeText(action.body)) messages.push(`${prefix}, secondary record ${commentIndex + 1}: action draft body is missing.`);
        if (action.to || action.email) messages.push(`${prefix}, secondary record ${commentIndex + 1}: direct email fields are ignored; Review Console resolves email locally from the contact ID.`);
      });
    });
    const fatal = json.packageType !== "sitescribe_two_level_records" || !Array.isArray(json.records);
    return { ok: !fatal, messages };
  }

  function resolveRecipientNames(names, contacts) {
    const ids = [];
    const unresolved = [];
    normalizeNameList(names).forEach(name => {
      const target = normalizeText(name).toLowerCase();
      const matches = (Array.isArray(contacts) ? contacts : []).filter(contact => {
        const fullName = normalizeText(contact && (contact.fullName || contact.name)).toLowerCase();
        const firstName = fullName.split(/\s+/)[0];
        return fullName === target || firstName === target;
      });
      if (matches.length === 1 && matches[0].id) ids.push(matches[0].id);
      else unresolved.push(name);
    });
    return { ids: [...new Set(ids)], unresolved: [...new Set(unresolved)] };
  }

  function trimRecipientPhrase(value) {
    return normalizeText(String(value || "").split(/\s+(?:regarding|about|concerning|for|to\s+(?:request|contact|confirm|provide|notify|ask|send|coordinate|book|secure|check|make|discuss|advise|arrange|follow)|(?:needs?|should|must|will|can)\s+to|so)\b|[,.;]/i)[0]);
  }

  function splitRecipientNames(value) {
    const text = normalizeText(value).replace(/^(?:to\s+)?/i, "");
    if (!text) return [];
    return text.split(/\s*(?:,|\band\b|&)\s*/i).map(normalizeText).filter(Boolean);
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function leadingRecipientPhrase(value) {
    const source = String(value || "");
    const boundaryPatterns = [
      /,/,
      /\s+(?:and\s+)?cc\b/i,
      /\s+with\s+.+?\s+copied\b/i,
      /\s+(?:about|regarding|concerning)\b/i,
      /\s+to\s+(?:request|contact|confirm|provide|notify|ask|send|coordinate|book|secure|check|make|discuss|advise|arrange|follow)\b/i,
      /\s+(?:needs?|should|must|will|can)\s+to\b/i
    ];
    const boundaries = boundaryPatterns.map(pattern => source.search(pattern)).filter(index => index >= 0);
    const end = boundaries.length ? Math.min(...boundaries) : source.length;
    return trimRecipientPhrase(source.slice(0, end));
  }

  function copiedRecipientPhrase(value) {
    const source = String(value || "");
    const ccMatch = source.match(/\b(?:cc|copy)\s+([^,.;]+)/i);
    if (ccMatch) return trimRecipientPhrase(ccMatch[1]);
    const copiedMatch = source.match(/\bwith\s+(.+?)\s+copied\b/i);
    return copiedMatch ? trimRecipientPhrase(copiedMatch[1]) : "";
  }

  function removeRecipientPrefix(value, toPhrase, ccPhrase) {
    let tail = normalizeText(value);
    if (toPhrase && tail.toLowerCase().startsWith(toPhrase.toLowerCase())) tail = tail.slice(toPhrase.length);
    tail = tail.replace(/^[\s,:;-]+/, "");
    if (ccPhrase) {
      const escapedCc = escapeRegExp(ccPhrase);
      tail = tail
        .replace(new RegExp(`^(?:and\\s+)?(?:cc|copy)\\s+${escapedCc}(?=\\b|[,.;])`, "i"), "")
        .replace(new RegExp(`^with\\s+${escapedCc}\\s+copied`, "i"), "");
    }
    return normalizeText(tail.replace(/^[\s,:;-]+/, ""));
  }

  function normalizeDraftInstruction(value, toNames, purpose) {
    let instruction = normalizeText(value).replace(/^[,:;-]+\s*/, "");
    if (!instruction) return "";
    const topicMatch = instruction.match(/^(?:about|regarding|concerning)\s+(.+)/i);
    if (topicMatch) {
      const topic = normalizeText(topicMatch[1]).replace(/[.!?]+$/, "");
      return purpose === "request_decision"
        ? `Please provide your decision regarding ${topic}.`
        : `Please review ${topic}.`;
    }
    instruction = instruction
      .replace(/^so\s+/i, "")
      .replace(/^to\s+/i, "")
      .replace(/^(?:needs?|should|must|will|can)\s+to\s+/i, "");
    const firstRecipient = normalizeText((toNames || [])[0]);
    if (firstRecipient) {
      const escapedRecipient = escapeRegExp(firstRecipient);
      instruction = instruction
        .replace(new RegExp(`^${escapedRecipient}\\s+(?:needs?|should|must|will|can)\\s+to\\s+`, "i"), "")
        .replace(new RegExp(`^${escapedRecipient}\\s+`, "i"), "");
    }
    instruction = instruction
      .replace(/^contacts\b/i, "contact")
      .replace(/^confirms\b/i, "confirm")
      .replace(/^provides\b/i, "provide")
      .replace(/^notifies\b/i, "notify")
      .replace(/^asks\b/i, "ask")
      .replace(/^books\b/i, "book")
      .replace(/^secures\b/i, "secure")
      .replace(/^sends\b/i, "send")
      .replace(/^coordinates\b/i, "coordinate")
      .replace(/^reviews\b/i, "review")
      .replace(/\b(and|,)\s+confirms\b/gi, "$1 confirm")
      .replace(/\b(and|,)\s+provides\b/gi, "$1 provide")
      .replace(/\b(and|,)\s+notifies\b/gi, "$1 notify")
      .replace(/\b(and|,)\s+contacts\b/gi, "$1 contact")
      .replace(/\b(and|,)\s+asks\b/gi, "$1 ask")
      .replace(/\b(and|,)\s+sends\b/gi, "$1 send");
    instruction = normalizeText(instruction).replace(/[.!?]+$/, "");
    if (!instruction) return "";
    if (!/^please\b/i.test(instruction)) instruction = `Please ${instruction.charAt(0).toLowerCase()}${instruction.slice(1)}`;
    return `${instruction}.`;
  }

  function emailInstructionTail(sentence, toPhrase, ccPhrase) {
    const command = normalizeText(sentence).match(/\b(?:send\s+(?:an?\s+)?email\s+to|send\s+email\s+to|email)\s+(.+)/i);
    if (!command) return "";
    return removeRecipientPrefix(command[1], toPhrase, ccPhrase);
  }

  function buildDraftBody(text, toNames, ccNames, purpose) {
    const sentences = String(text || "").match(/[^.!?]+[.!?]?/g) || [String(text || "")];
    const instructions = sentences
      .filter(sentence => /\b(?:send\s+(?:an?\s+)?email\s+to|send\s+email\s+to|email)\b/i.test(sentence))
      .map(sentence => {
        const match = normalizeText(sentence).match(/\b(?:send\s+(?:an?\s+)?email\s+to|send\s+email\s+to|email)\s+(.+)/i);
        const rest = match ? match[1] : "";
        const localTo = leadingRecipientPhrase(rest) || normalizeText(toNames && toNames[0]);
        const localCc = copiedRecipientPhrase(rest) || normalizeText(ccNames && ccNames[0]);
        return normalizeDraftInstruction(emailInstructionTail(sentence, localTo, localCc), toNames, purpose);
      })
      .filter(Boolean)
      .sort((left, right) => right.length - left.length);
    let instruction = instructions[0] || "";
    if (!instruction) instruction = purpose === "request_decision" ? "Please provide your decision on this item." : "Please review and coordinate this item.";
    const firstRecipient = normalizeText((toNames || [])[0]);
    const greetingName = firstRecipient ? firstRecipient.split(/\s+/)[0] : "there";
    return `Hi ${greetingName},\n\n${instruction}\n\nThanks,`;
  }

  function buildEmailSubject(text, purpose) {
    const source = normalizeText(text);
    if (/\btransformer\b/i.test(source) && /\b(?:delivery|shipper)\b/i.test(source)) {
      return purpose === "request_decision" ? "Decision needed: transformer delivery" : "Transformer delivery coordination";
    }
    if (/\bshipper\b/i.test(source)) return purpose === "request_decision" ? "Decision needed: shipper arrangements" : "Shipper coordination";
    const topicMatch = source.match(/\b(?:about|regarding|concerning)\s+([^.!?]+)/i);
    const topic = topicMatch ? normalizeText(topicMatch[1]).replace(/[,:;-]+$/, "") : "";
    if (purpose === "request_decision") return topic ? `Decision needed: ${topic.slice(0, 70)}` : "Decision needed";
    return topic ? `Coordination needed: ${topic.slice(0, 70)}` : "Coordination needed";
  }

  function buildEmailAction(body, contacts) {
    const text = normalizeText(body);
    if (!text || /\b(?:was|were|has been|have been|already)\s+emailed\b/i.test(text)) return null;
    const instruction = text.match(/\b(?:send\s+(?:an?\s+)?email\s+to|send\s+email\s+to|email)\s+(.+)/i);
    if (!instruction) return null;
    const rest = instruction[1];
    const toPhrase = leadingRecipientPhrase(rest);
    const ccPhrase = copiedRecipientPhrase(rest);
    const toResolved = resolveRecipientNames(splitRecipientNames(toPhrase), contacts);
    const ccResolved = resolveRecipientNames(splitRecipientNames(ccPhrase), contacts);
    const purpose = /\b(?:decision|decide|advise|approval|approve)\b/i.test(text) ? "request_decision" : "coordinate_information";
    const toNames = splitRecipientNames(toPhrase);
    const ccNames = splitRecipientNames(ccPhrase);
    const subject = buildEmailSubject(text, purpose);
    const state = !toResolved.ids.length || toResolved.unresolved.length || ccResolved.unresolved.length ? "needs_information" : "proposed";
    return {
      instructionIndex: instruction.index || 0,
      action: {
        type: "communication",
        method: "email_draft",
        purpose,
        state,
        recipientIds: toResolved.ids,
        ccRecipientIds: ccResolved.ids,
        unresolvedRecipientNames: toResolved.unresolved,
        unresolvedCcRecipientNames: ccResolved.unresolved,
        subject,
        body: buildDraftBody(text, toNames, ccNames, purpose),
        source: "parser_local"
      }
    };
  }

  function normalizeEmailAction(action) {
    const input = action || {};
    return {
      type: normalizeText(input.type),
      method: normalizeText(input.method),
      purpose: normalizeText(input.purpose),
      state: normalizeText(input.state) || "proposed",
      recipientIds: normalizeIdList(input.recipientIds),
      ccRecipientIds: normalizeIdList(input.ccRecipientIds),
      unresolvedRecipientNames: normalizeNameList(input.unresolvedRecipientNames),
      unresolvedCcRecipientNames: normalizeNameList(input.unresolvedCcRecipientNames),
      subject: String(input.subject || "").trim(),
      body: String(input.body || "").trim(),
      source: normalizeText(input.source) || "parser_ai"
    };
  }

  function emailDraftRequiredInformationMissing(action) {
    if (!action) return true;
    return !normalizeIdList(action.recipientIds).length
      || normalizeNameList(action.unresolvedRecipientNames).length > 0
      || normalizeNameList(action.unresolvedCcRecipientNames).length > 0
      || !normalizeText(action.subject)
      || !normalizeText(action.body);
  }

  function updateRecipientsFromNames(action, value, contacts, isCc) {
    const resolvedIds = [];
    const unresolvedNames = [];
    normalizeNameList(value).forEach(token => {
      const normalized = token.toLowerCase();
      const contact = (Array.isArray(contacts) ? contacts : []).find(item => [item.id, item.name, item.fullName, item.email]
        .filter(Boolean)
        .some(candidate => String(candidate).toLowerCase() === normalized));
      if (contact) resolvedIds.push(contact.id);
      else unresolvedNames.push(token);
    });
    if (isCc) {
      action.ccRecipientIds = [...new Set(resolvedIds)];
      action.unresolvedCcRecipientNames = [...new Set(unresolvedNames)];
    } else {
      action.recipientIds = [...new Set(resolvedIds)];
      action.unresolvedRecipientNames = [...new Set(unresolvedNames)];
    }
    return action;
  }

  return Object.freeze({
    version: CORE_VERSION,
    normalizeText,
    normalizeIdList,
    normalizeNameList,
    safePromptContacts,
    buildRequest,
    extractJson,
    extractBalancedJsonObject,
    validateResult,
    resolveRecipientNames,
    leadingRecipientPhrase,
    copiedRecipientPhrase,
    buildEmailAction,
    buildDraftBody,
    buildEmailSubject,
    normalizeEmailAction,
    emailDraftRequiredInformationMissing,
    updateRecipientsFromNames
  });
});
