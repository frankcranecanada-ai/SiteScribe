/*
  SiteScribe Review Console

  VERSION: v0.4.7

  versionHistory:
  - v0.1: Loaded one SiteScribe JSON package, validated required sections, rendered review/action cards, and provided copy buttons.
  - v0.2: Added collapsible sections with item counts, editable card fields, status buttons, in-memory JSON updates, and reviewed JSON export.
  - v0.2.1: Clarified in-memory edit behavior, added modified card badges, changed dirty-state wording, and added a reload/leave warning.
  - v0.2.2: Added clarification resolution logic, explicit Mark Resolved / Dismiss / Reopen buttons, active-vs-closed clarification sections.
  - v0.2.3: Fixed formatted copy-pill click handling.
  - v0.2.4: Compressed review UI and rendered closed clarifications as compact rows.
  - v0.3: Added IndexedDB persistent local storage, Local Archive / Saved Packages, reopen saved package, and persistent edits/status changes.
  - v0.3.1-v0.3.4: Improved JSON drop/import reliability and display de-duplication/routing.
  - v0.4: Added two-level front-end model: category/date-grouped main records plus secondary update lines only; fixed main descriptions; open/closed pills for main and secondary records; closed-record view.
  - v0.4.1: Fixed JSON import by using one shared file importer for both Choose JSON and drag/drop, and preventing browser file navigation without blocking the drop-zone handler.
  - v0.4.2: Fixed object rendering in legacy fields, added legacy duplicate suppression so one source item displays once, and kept clarification questions as the main record title instead of replacing them with answers.
  - v0.4.3: Converted Missing Information and Clarification Required from standalone main categories into record flags on related original records; added package-level unlinked flags and flag status controls.
  - v0.4.4: Simplified the detail screen by removing boxed main-description/meta blocks and using one secondary update/comment box with related OPEN/CLOSED pills.
  - v0.4.5: Secondary update line selection now loads the existing update into the edit box; saving updates that line instead of creating a duplicate, while New Update Instead creates separate secondary records.
  - v0.4.6: Clarified secondary item editor behavior: a blank/unselected editor creates new secondary records; selecting a secondary line loads it into the editor; saving while selected replaces that line only; Clear Selection returns the editor to new-item mode.
  - v0.4.7: Protected JSON import as a non-regression requirement; restored required v0.4 layout elements and hardened drag/drop plus file-picker loading so future builds must preserve them.
*/

const APP_NAME = "SiteScribe Review Console";
const APP_VERSION = "v0.4.7";
const DB_NAME = "sitescribe_review_console_db";
const DB_VERSION = 1;
const DB_STORE = "packages";

const CATEGORIES = [
  { id: "event", label: "Event / Timeline Record", cues: ["event", "timeline", "log"], help: "Something that happened on site." },
  { id: "action", label: "Action / To-Do", cues: ["action", "todo", "to-do", "task"], help: "Something that needs to be done." },
  { id: "followup", label: "Follow-Up / Waiting", cues: ["followup", "follow-up", "waiting", "wait"], help: "Something already started but needing later confirmation." },
  { id: "scheduled", label: "Scheduled Event / Appointment", cues: ["scheduled", "schedule", "appointment", "meeting"], help: "Something with a real date/time." },
  { id: "safety", label: "Safety Issue", cues: ["safety", "hazard", "warning", "violation"], help: "Hazard, correction, warning, violation, or unresolved safety concern." },
  { id: "communication", label: "Communication / Email", cues: ["communication", "email", "call", "message"], help: "Message to send, sent message, or communication record." },
  { id: "document", label: "Document / Required File", cues: ["document", "doc", "file", "insurance", "permit", "liftplan", "lift-plan"], help: "Insurance, lift plan, site docs, permits, drawings, reports, etc." }
];

const FLAG_CUES = new Map([
  ["missing", "incomplete"],
  ["gap", "incomplete"],
  ["clarification", "clarification"],
  ["clarify", "clarification"],
  ["unclear", "clarification"]
]);

const CLOSED_VIEW = { id: "closed", label: "Completed / Closed Record", help: "All closed items." };
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(category => [category.id, category]));
const CUE_MAP = new Map(CATEGORIES.flatMap(category => category.cues.map(cue => [cue, category.id])));
for (const [cue, flagType] of FLAG_CUES.entries()) CUE_MAP.set(cue, flagType);

const state = {
  db: null,
  dbAvailable: false,
  dbError: "",
  package: createEmptyPackage(),
  selectedRecordId: "",
  selectedCommentId: "",
  currentLocalPackageId: "",
  sourceLabel: "Manual entries",
  dirty: false,
  localArchive: []
};

const els = {
  appVersion: document.querySelector("#appVersion"),
  mainEntry: document.querySelector("#mainEntry"),
  addMainButton: document.querySelector("#addMainButton"),
  entryHint: document.querySelector("#entryHint"),
  saveLocalButton: document.querySelector("#saveLocalButton"),
  exportButton: document.querySelector("#exportButton"),
  fileInput: document.querySelector("#jsonFile"),
  sampleButton: document.querySelector("#sampleButton"),
  dropZone: document.querySelector("#dropZone"),
  statusLine: document.querySelector("#statusLine"),
  refreshArchiveButton: document.querySelector("#refreshArchiveButton"),
  localArchive: document.querySelector("#localArchive"),
  recordsRoot: document.querySelector("#recordsRoot"),
  detailPanel: document.querySelector("#detailPanel"),
  detailTitle: document.querySelector("#detail-title"),
  detailContent: document.querySelector("#detailContent"),
  closeDetailButton: document.querySelector("#closeDetailButton"),
  toast: document.querySelector("#toast")
};

init();

async function init() {
  els.appVersion.textContent = APP_VERSION;
  bindEvents();
  await initDatabase();
  await refreshArchive();
  render();
}

function bindEvents() {
  els.addMainButton.addEventListener("click", addMainRecordFromInput);
  els.mainEntry.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") addMainRecordFromInput();
  });
  els.saveLocalButton.addEventListener("click", saveCurrentPackageToLocalStorage);
  els.exportButton.addEventListener("click", () => exportPackage(state.package));
  els.fileInput.addEventListener("change", event => {
    const file = event.target.files && event.target.files[0];
    if (file) importJsonFile(file);
    event.target.value = "";
  });
  els.sampleButton.addEventListener("click", loadSample);
  els.refreshArchiveButton.addEventListener("click", refreshArchive);
  els.closeDetailButton.addEventListener("click", () => {
    state.selectedRecordId = "";
    state.selectedCommentId = "";
    renderDetail();
  });

  els.recordsRoot.addEventListener("click", event => {
    const recordButton = event.target.closest("[data-open-record]");
    if (!recordButton) return;
    state.selectedRecordId = recordButton.dataset.openRecord;
    state.selectedCommentId = "";
    renderDetail();
    els.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.detailContent.addEventListener("click", handleDetailClick);
  els.localArchive.addEventListener("click", handleArchiveClick);

  installDropProtection();

  window.addEventListener("beforeunload", event => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "You have edits that are not exported or saved locally.";
  });
}

function installDropProtection() {
  // PROTECTED REQUIREMENT: JSON drag/drop and file-picker import must never be removed in future builds.
  const blockBrowserFileOpen = event => {
    event.preventDefault();
  };

  const handleDrop = event => {
    event.preventDefault();
    event.stopPropagation();
    const file = getJsonFileFromDrop(event);
    if (file) {
      importJsonFile(file);
    } else {
      setStatus("Drop a .json file or use Choose JSON File.");
    }
    els.dropZone.classList.remove("dragover");
  };

  ["dragenter", "dragover"].forEach(type => {
    [window, document, document.documentElement, document.body].forEach(target => {
      if (target) target.addEventListener(type, blockBrowserFileOpen, false);
    });
    els.dropZone.addEventListener(type, event => {
      event.preventDefault();
      event.stopPropagation();
      els.dropZone.classList.add("dragover");
      event.dataTransfer.dropEffect = "copy";
    });
  });

  ["dragleave", "dragend"].forEach(type => {
    els.dropZone.addEventListener(type, event => {
      event.preventDefault();
      els.dropZone.classList.remove("dragover");
    });
  });

  // Critical: do not stop propagation globally. Earlier builds did that and
  // prevented the drop-zone handler from seeing the file, allowing the browser
  // to open the JSON as raw code. This shared handler imports the JSON whether
  // it is dropped on the box or elsewhere on the page.
  [window, document, document.documentElement, document.body].forEach(target => {
    if (target) target.addEventListener("drop", handleDrop, false);
  });
  els.dropZone.addEventListener("drop", handleDrop, false);

  els.dropZone.addEventListener("click", () => els.fileInput.click());
  els.dropZone.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      els.fileInput.click();
    }
  });
}

function getJsonFileFromDrop(event) {
  const files = Array.from(event.dataTransfer?.files || []);
  return files.find(file => isJsonLikeFile(file)) || files[0] || null;
}

function isJsonLikeFile(file) {
  const name = String(file?.name || "").toLowerCase();
  const type = String(file?.type || "").toLowerCase();
  return name.endsWith(".json") || type.includes("json") || type.includes("text/plain");
}

function importJsonFile(file) {
  if (!file) return;
  if (!isJsonLikeFile(file)) {
    setStatus("That does not look like a JSON file. Use a .json file.");
    return;
  }
  setStatus(`Reading ${file.name}...`);
  readJsonFile(file);
}

function createEmptyPackage() {
  const now = new Date().toISOString();
  return {
    packageType: "sitescribe_two_level_records",
    version: "1.0",
    site: "not stated",
    shiftDate: todayString(),
    processedAt: now,
    reviewConsole: {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      createdAt: now,
      model: "two-level-records-with-record-flags"
    },
    packageFlags: [],
    records: []
  };
}

function addMainRecordFromInput() {
  const raw = els.mainEntry.value.trim();
  if (!raw) {
    setStatus("Enter a main record first.");
    return;
  }

  const parsed = parseMainEntry(raw);
  if (!parsed.ok) {
    setStatus(parsed.message);
    flashHint(parsed.message);
    return;
  }

  const now = new Date().toISOString();
  const record = {
    id: createId("rec"),
    category: parsed.categoryId,
    description: parsed.description,
    status: "open",
    createdAt: now,
    sourceDate: todayString(),
    sourceText: raw,
    comments: [],
    flags: []
  };
  state.package.records.push(record);
  state.selectedRecordId = record.id;
  state.selectedCommentId = "";
  els.mainEntry.value = "";
  markDirty();
  render();
  setStatus("Record added.");
  showToast("Record added");
}

function parseMainEntry(raw) {
  const match = raw.match(/^\s*([^,:\s]+)\s*[,\-:]?\s*(.*)$/);
  if (!match) return { ok: false, message: "Entry must start with a classification word." };
  const cue = normalizeCue(match[1]);
  const categoryId = CUE_MAP.get(cue);
  if (!categoryId || categoryId === "closed") {
    return { ok: false, message: `Unknown classification word: ${match[1]}. Use event, todo, followup, appointment, safety, email, or document. Missing/clarification should be flags on the related record.` };
  }
  if (categoryId === "incomplete" || categoryId === "clarification") {
    return { ok: false, message: `${match[1]} is a flag, not a main category. Open the related record and add it as an update/flag.` };
  }
  const description = (match[2] || "").trim();
  if (!description) return { ok: false, message: "Add the item description after the classification word." };

  if (categoryId === "scheduled" && !hasScheduledDateOrTime(description)) {
    return {
      ok: true,
      categoryId: "action",
      description,
      routedFrom: "scheduled"
    };
  }
  return { ok: true, categoryId, description };
}

function hasScheduledDateOrTime(text) {
  const lower = text.toLowerCase();
  return /\b\d{1,2}(:\d{2})?\s*(am|pm)\b/.test(lower)
    || /\b\d{4}-\d{2}-\d{2}\b/.test(lower)
    || /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(lower);
}

function render() {
  renderRecords();
  renderDetail();
  renderArchive();
}

function renderRecords() {
  const records = [...state.package.records].sort((a, b) => compareDateDesc(a.sourceDate, b.sourceDate) || compareDateDesc(a.createdAt, b.createdAt));
  if (!records.length) {
    els.recordsRoot.innerHTML = renderPackageFlags() || `<div class="empty">No records yet.</div>`;
    return;
  }

  const dates = groupBy(records, record => record.sourceDate || dateFromIso(record.createdAt) || "not stated");
  const dateHtml = Object.entries(dates)
    .sort(([a], [b]) => compareDateDesc(a, b))
    .map(([date, dateRecords]) => renderDateGroup(date, dateRecords))
    .join("");

  els.recordsRoot.innerHTML = (renderPackageFlags() || "") + dateHtml;
}

function renderDateGroup(date, dateRecords) {
  const categoryGroups = {};
  for (const record of dateRecords) {
    if (!categoryGroups[record.category]) categoryGroups[record.category] = [];
    categoryGroups[record.category].push(record);
    if (record.status === "closed") {
      if (!categoryGroups.closed) categoryGroups.closed = [];
      categoryGroups.closed.push(record);
    }
  }

  const categories = [...CATEGORIES.map(c => c.id), "closed"];
  const content = categories
    .filter(categoryId => categoryGroups[categoryId]?.length)
    .map(categoryId => renderCategoryGroup(categoryId, categoryGroups[categoryId]))
    .join("");

  return `
    <details class="date-group" open>
      <summary><span>${escapeHtml(date)}</span><span class="count">${dateRecords.length} main ${dateRecords.length === 1 ? "record" : "records"}</span></summary>
      ${content}
    </details>
  `;
}

function renderCategoryGroup(categoryId, records) {
  const category = categoryId === "closed" ? CLOSED_VIEW : CATEGORY_BY_ID[categoryId];
  const open = categoryId !== "closed";
  return `
    <details class="category-group" ${open ? "open" : ""}>
      <summary><span>${escapeHtml(category.label)}</span><span class="count">${records.length}</span></summary>
      <div class="record-list">
        ${records.map(renderRecordLine).join("")}
      </div>
    </details>
  `;
}

function renderRecordLine(record) {
  const closed = record.status === "closed";
  const commentCount = record.comments?.length || 0;
  const openCommentCount = (record.comments || []).filter(comment => comment.status !== "closed").length;
  const openFlags = getOpenFlags(record);
  const flagBadges = openFlags.map(flag => flagBadge(flag)).join("");
  return `
    <button class="record-line ${closed ? "closed" : ""}" type="button" data-open-record="${escapeHtml(record.id)}">
      <span class="status-dot"></span>
      <span class="record-desc">${escapeHtml(record.description)}</span>
      <span class="record-flags">${flagBadges}</span>
      <span class="record-meta">${escapeHtml(commentCount)} updates · ${escapeHtml(openCommentCount)} open</span>
      <span class="badge ${closed ? "closed" : "open"}">${closed ? "CLOSED" : "OPEN"}</span>
    </button>
  `;
}

function renderDetail() {
  const record = getSelectedRecord();
  if (!record) {
    els.detailPanel.classList.add("hidden");
    els.detailContent.innerHTML = "";
    return;
  }

  els.detailPanel.classList.remove("hidden");
  els.detailTitle.textContent = CATEGORY_BY_ID[record.category]?.label || "Record Detail";
  const selectedComment = getSelectedComment(record);
  const selectedCommentStatus = selectedComment ? selectedComment.status : "open";
  els.detailContent.innerHTML = `
    <div class="detail-summary-line">
      <span class="status-dot"></span>
      <span class="detail-summary-text">${escapeHtml(record.description)}</span>
      <span class="muted-small">${escapeHtml(record.sourceDate)} · ${escapeHtml(record.status === "closed" ? "CLOSED" : "OPEN")}</span>
    </div>
    ${renderRecordFlags(record)}
    <div class="record-actions compact-actions">
      <span class="action-label">Main record:</span>
      ${openClosedButtons("main", record.status)}
      <button type="button" class="secondary small-button" data-copy-main>Copy Main</button>
    </div>
    <div class="comment-entry single-comment-entry">
      <label class="description-label" for="commentBox">Secondary update/comment</label>
      <textarea id="commentBox" rows="1" placeholder="Add update for this main item...">${escapeHtml(selectedComment ? selectedComment.text || "" : "")}</textarea>
      <div class="comment-actions">
        <button type="button" data-add-comment>${selectedComment ? "Save Edited Secondary Item" : "Create Secondary Item"}</button>
        ${selectedComment ? `<span class="action-label">Editing selected secondary item:</span>${openClosedButtons("comment", selectedCommentStatus)}<button type="button" class="secondary" data-clear-selected-comment>Clear Selection / New Item</button>` : `<span class="muted-small">Virgin text box: creates a new secondary item.</span>`}
      </div>
    </div>
    <h3>Secondary Items</h3>
    ${renderComments(record)}
  `;
}

function renderComments(record) {
  const comments = record.comments || [];
  if (!comments.length) return `<div class="empty">No secondary updates yet.</div>`;
  return `<div class="comment-list">${comments.map(comment => renderCommentLine(comment)).join("")}</div>`;
}

function renderCommentLine(comment) {
  const closed = comment.status === "closed";
  const selected = comment.id === state.selectedCommentId;
  return `
    <button class="comment-line ${closed ? "closed" : ""} ${selected ? "selected" : ""}" type="button" data-select-comment="${escapeHtml(comment.id)}">
      <span class="badge ${closed ? "closed" : "open"}">${closed ? "CLOSED" : "OPEN"}</span>
      <span>${escapeHtml(comment.text)}</span>
      <span class="comment-date">${escapeHtml(formatDateTime(comment.updatedAt || comment.createdAt))}</span>
    </button>
  `;
}

function handleDetailClick(event) {
  const record = getSelectedRecord();
  if (!record) return;

  if (event.target.closest("[data-copy-main]")) {
    copyText(`${CATEGORY_BY_ID[record.category]?.label || record.category}\n${record.description}\nStatus: ${record.status}`);
    return;
  }

  const selectComment = event.target.closest("[data-select-comment]");
  if (selectComment) {
    state.selectedCommentId = selectComment.dataset.selectComment;
    renderDetail();
    const box = document.querySelector("#commentBox");
    if (box) box.focus();
    return;
  }

  if (event.target.closest("[data-clear-selected-comment]")) {
    state.selectedCommentId = "";
    renderDetail();
    const box = document.querySelector("#commentBox");
    if (box) {
      box.value = "";
      box.focus();
    }
    return;
  }

  if (event.target.closest("[data-add-comment]")) {
    addOrUpdateComment(record);
    return;
  }

  const flagButton = event.target.closest("[data-set-flag-status]");
  if (flagButton) {
    const flag = (record.flags || []).find(item => item.id === flagButton.dataset.flagId);
    if (!flag) return;
    flag.status = flagButton.dataset.setFlagStatus;
    flag.statusChangedAt = new Date().toISOString();
    markDirty();
    render();
    return;
  }

  const statusButton = event.target.closest("[data-set-status]");
  if (statusButton) {
    const target = statusButton.dataset.statusTarget;
    const status = statusButton.dataset.setStatus;
    if (target === "main") {
      record.status = status;
      record.statusChangedAt = new Date().toISOString();
    } else if (target === "comment") {
      const comment = getSelectedComment(record);
      if (!comment) return;
      comment.status = status;
      comment.statusChangedAt = new Date().toISOString();
    }
    markDirty();
    render();
    return;
  }
}

function addOrUpdateComment(record) {
  const box = document.querySelector("#commentBox");
  const text = box?.value.trim() || "";
  if (!text) {
    setStatus("Enter a secondary update first.");
    return;
  }

  const now = new Date().toISOString();
  const selected = getSelectedComment(record);
  if (selected) {
    selected.text = text;
    selected.updatedAt = now;
    setStatus("Selected secondary item replaced.");
  } else {
    record.comments.push({
      id: createId("com"),
      text,
      status: "open",
      createdAt: now,
      updatedAt: now
    });
    setStatus("Secondary item created.");
  }
  state.selectedCommentId = "";
  markDirty();
  render();
}

function openClosedButtons(target, currentStatus) {
  return `
    <button type="button" class="pill ${currentStatus !== "closed" ? "active-open" : ""}" data-status-target="${escapeHtml(target)}" data-set-status="open">OPEN</button>
    <button type="button" class="pill ${currentStatus === "closed" ? "active-closed" : ""}" data-status-target="${escapeHtml(target)}" data-set-status="closed">CLOSED</button>
  `;
}

async function initDatabase() {
  if (!("indexedDB" in window)) {
    state.dbAvailable = false;
    state.dbError = "Local storage is unavailable in this browser. You can still export JSON.";
    setStatus(state.dbError);
    return;
  }
  try {
    state.db = await openDatabase();
    state.dbAvailable = true;
  } catch (error) {
    state.dbAvailable = false;
    state.dbError = "Local storage is unavailable in this browser. You can still export JSON.";
    setStatus(state.dbError);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(storeMode = "readonly") {
  if (!state.dbAvailable || !state.db) throw new Error("IndexedDB unavailable");
  return state.db.transaction(DB_STORE, storeMode).objectStore(DB_STORE);
}

function savePackageToDb(record) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

function getAllPackagesFromDb() {
  return new Promise((resolve, reject) => {
    const request = transaction("readonly").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function getPackageFromDb(id) {
  return new Promise((resolve, reject) => {
    const request = transaction("readonly").get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function deletePackageFromDb(id) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function createPackageRecord(data, sourceLabel) {
  const now = new Date().toISOString();
  const id = state.currentLocalPackageId || data.reviewConsole?.localPackageId || createId("pkg");
  const importedAt = data.reviewConsole?.importedAt || now;
  const recordCount = data.records?.length || 0;
  const openCount = (data.records || []).filter(record => record.status !== "closed").length;
  const closedCount = recordCount - openCount;
  const openFlagCount = (data.records || []).reduce((sum, record) => sum + getOpenFlags(record).length, 0) + ((data.packageFlags || []).filter(flag => flag.status !== "closed").length);
  data.reviewConsole = {
    ...(data.reviewConsole || {}),
    appName: APP_NAME,
    appVersion: APP_VERSION,
    localPackageId: id,
    sourceLabel,
    modifiedAt: now
  };
  return {
    id,
    packageType: data.packageType || "sitescribe_two_level_records",
    site: data.site || "not stated",
    shiftDate: data.shiftDate || "not stated",
    processedAt: data.processedAt || "not stated",
    importedAt,
    lastModified: now,
    sourceLabel,
    title: `${data.site || "not stated"} - ${data.shiftDate || "not stated"}`,
    statusSummary: `${recordCount} records, ${openCount} open, ${closedCount} closed, ${openFlagCount} flags`,
    data: structuredCloneSafe(data)
  };
}

async function saveCurrentPackageToLocalStorage() {
  if (!state.dbAvailable) {
    setStatus(state.dbError || "Local storage unavailable. Export JSON instead.");
    return;
  }
  const record = createPackageRecord(state.package, state.sourceLabel || "Manual entries");
  await savePackageToDb(record);
  state.currentLocalPackageId = record.id;
  state.dirty = false;
  await refreshArchive();
  setStatus("Saved locally.");
  showToast("Saved locally");
}

async function refreshArchive() {
  if (!state.dbAvailable) {
    renderArchive();
    return;
  }
  try {
    state.localArchive = (await getAllPackagesFromDb()).sort((a, b) => compareDateDesc(a.lastModified, b.lastModified));
  } catch (error) {
    state.localArchive = [];
    state.dbError = "Unable to read Local Archive.";
  }
  renderArchive();
}

function renderArchive() {
  if (!state.dbAvailable) {
    els.localArchive.innerHTML = `<div class="empty">${escapeHtml(state.dbError || "Local storage unavailable. Export JSON instead.")}</div>`;
    return;
  }
  if (!state.localArchive.length) {
    els.localArchive.innerHTML = `<div class="empty">No saved packages.</div>`;
    return;
  }
  els.localArchive.innerHTML = state.localArchive.map(record => `
    <article class="archive-card">
      <div class="archive-title">${escapeHtml(record.title)}</div>
      <div class="archive-meta">Processed: ${escapeHtml(record.processedAt)} · Modified: ${escapeHtml(formatDateTime(record.lastModified))}</div>
      <div class="archive-meta">Source: ${escapeHtml(record.sourceLabel || "not stated")} · ${escapeHtml(record.statusSummary || "")}</div>
      <div class="archive-actions">
        <button type="button" class="small-button" data-open-package="${escapeHtml(record.id)}">Open</button>
        <button type="button" class="secondary small-button" data-export-package="${escapeHtml(record.id)}">Export</button>
        <button type="button" class="danger small-button" data-delete-package="${escapeHtml(record.id)}">Delete</button>
      </div>
    </article>
  `).join("");
}

async function handleArchiveClick(event) {
  const open = event.target.closest("[data-open-package]");
  const exp = event.target.closest("[data-export-package]");
  const del = event.target.closest("[data-delete-package]");
  if (open) {
    const record = await getPackageFromDb(open.dataset.openPackage);
    if (!record) return;
    state.package = normalizeImportedPackage(record.data, record.sourceLabel);
    state.currentLocalPackageId = record.id;
    state.sourceLabel = record.sourceLabel || "Local Archive";
    state.selectedRecordId = "";
    state.dirty = false;
    render();
    setStatus("Saved package opened.");
  }
  if (exp) {
    const record = await getPackageFromDb(exp.dataset.exportPackage);
    if (record) exportPackage(record.data, record.sourceLabel, record.id);
  }
  if (del) {
    const ok = confirm("Delete this saved package from local storage? This does not delete exported JSON files.");
    if (!ok) return;
    await deletePackageFromDb(del.dataset.deletePackage);
    if (state.currentLocalPackageId === del.dataset.deletePackage) state.currentLocalPackageId = "";
    await refreshArchive();
    setStatus("Saved package deleted.");
  }
}

function exportPackage(pkg, sourceLabel = state.sourceLabel, localPackageId = state.currentLocalPackageId) {
  const now = new Date().toISOString();
  const exported = structuredCloneSafe(pkg);
  exported.reviewConsole = {
    ...(exported.reviewConsole || {}),
    appName: APP_NAME,
    appVersion: APP_VERSION,
    modifiedAt: state.dirty ? now : exported.reviewConsole?.modifiedAt,
    exportedAt: now,
    sourceLabel: sourceLabel || "not stated",
    localPackageId: localPackageId || ""
  };
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sitescribe_records_${exported.shiftDate || todayString()}.json`.replaceAll("/", "-");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  state.dirty = false;
  setStatus("JSON exported.");
  showToast("Exported");
}

function readJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state.package = normalizeImportedPackage(parsed, file.name);
      state.sourceLabel = file.name;
      state.currentLocalPackageId = state.package.reviewConsole?.localPackageId || "";
      state.selectedRecordId = "";
      state.selectedCommentId = "";
      state.dirty = false;
      render();
      setStatus(`Loaded ${file.name}.`);
    } catch (error) {
      setStatus("Could not read JSON file.");
    }
  };
  reader.readAsText(file);
}

async function loadSample() {
  try {
    const response = await fetch("samples/log1.json", { cache: "no-store" });
    const data = await response.json();
    state.package = normalizeImportedPackage(data, "samples/log1.json");
  } catch (error) {
    state.package = normalizeImportedPackage(createSamplePackage(), "generated sample");
  }
  state.sourceLabel = "sample";
  state.currentLocalPackageId = "";
  state.dirty = false;
  render();
  setStatus("Sample loaded.");
}

function normalizeImportedPackage(data, sourceLabel) {
  if (Array.isArray(data.records)) {
    return {
      ...data,
      packageType: data.packageType || "sitescribe_two_level_records",
      shiftDate: data.shiftDate || todayString(),
      processedAt: data.processedAt || new Date().toISOString(),
      records: data.records.map(normalizeRecord),
      packageFlags: Array.isArray(data.packageFlags) ? data.packageFlags.map(normalizeFlag) : [],
      reviewConsole: {
        ...(data.reviewConsole || {}),
        appName: APP_NAME,
        appVersion: APP_VERSION,
        sourceLabel
      }
    };
  }
  return convertLegacyPackage(data, sourceLabel);
}

function convertLegacyPackage(data, sourceLabel) {
  const pkg = createEmptyPackage();
  pkg.packageType = "sitescribe_two_level_records";
  pkg.site = data.site || "not stated";
  pkg.shiftDate = data.shiftDate || todayString();
  pkg.processedAt = data.processedAt || new Date().toISOString();
  pkg.source = data.source;
  pkg.dailySummary = data.dailySummary;
  pkg.reviewConsole.sourceLabel = sourceLabel;
  pkg.records = [];

  const seenLegacyRecords = new Set();
  const add = (category, description, sourceText, status = "open", comments = []) => {
    const cleanDescription = formatLegacyValue(description);
    const cleanSourceText = formatLegacyValue(sourceText || cleanDescription);
    if (!cleanDescription || cleanDescription === "not stated") return;

    const key = legacyDedupeKey(cleanSourceText || cleanDescription);
    if (seenLegacyRecords.has(key)) return;
    seenLegacyRecords.add(key);

    pkg.records.push(normalizeRecord({
      id: createId("rec"),
      category,
      description: cleanDescription,
      status,
      createdAt: pkg.processedAt,
      sourceDate: pkg.shiftDate,
      sourceText: cleanSourceText,
      comments
    }));
  };

  // Route legacy records into the two-level model. Order matters: the first
  // actionable version wins, so the same source text does not appear under
  // To-Do and Follow-Up at the same time.
  (data.events || []).forEach(item => add("event", item.description || item.summary || item.title, item.sourceText));
  (data.safetyIssues || []).forEach(item => add("safety", item.issue || item.description || item.title, item.sourceText, normalizeLegacyStatus(item)));
  (data.emails || []).forEach(item => add("communication", item.subject || item.body || item.actionLabel, item.sourceText, normalizeLegacyStatus(item)));
  (data.appointments || []).forEach(item => {
    const desc = [item.title, item.date, item.startTime].filter(Boolean).join(" - ") || item.notes || item.task;
    add(hasScheduledDateOrTime(desc) ? "scheduled" : "action", desc, item.sourceText || desc, normalizeLegacyStatus(item));
  });
  (data.todos || []).forEach(item => add("action", item.task || item.description || item.title, item.sourceText, normalizeLegacyStatus(item)));
  (data.followups || []).forEach(item => add("followup", item.task || item.description || item.title, item.sourceText, normalizeLegacyStatus(item)));
  (data.clarificationRequired || []).forEach(item => {
    const question = item.question || item.prompt || item.sourceText || formatLegacyValue(item);
    const flag = normalizeFlag({
      type: "clarification",
      text: question,
      status: normalizeLegacyStatus(item),
      sourceText: item.sourceText || question,
      createdAt: item.resolvedAt || item.dismissedAt || pkg.processedAt,
      closedAt: item.resolvedAt || item.dismissedAt || ""
    });
    const target = findRelatedRecord(pkg.records, flag.sourceText || flag.text);
    if (target) {
      target.flags.push(flag);
      const answer = item.answer || item.response || item.userResponse || item.resolution || item.resolvedValue;
      if (answer) target.comments.push(normalizeComment({
        id: createId("com"),
        text: "Clarification response: " + formatLegacyValue(answer),
        status: normalizeLegacyStatus(item),
        createdAt: item.resolvedAt || item.dismissedAt || pkg.processedAt,
        updatedAt: item.resolvedAt || item.dismissedAt || pkg.processedAt
      }));
    } else {
      pkg.packageFlags.push(flag);
    }
  });
  (data.missingInfo || []).forEach(item => {
    const text = formatLegacyValue(item);
    if (!text) return;
    const flag = normalizeFlag({ type: "incomplete", text, status: normalizeLegacyStatus(item), sourceText: text, createdAt: pkg.processedAt });
    const target = findRelatedRecord(pkg.records, text);
    if (target) target.flags.push(flag);
    else pkg.packageFlags.push(flag);
  });
  return pkg;
}

function normalizeRecord(record) {
  return {
    id: record.id || createId("rec"),
    category: CATEGORY_BY_ID[record.category] ? record.category : "action",
    description: formatLegacyValue(record.description || record.title || record.task || record.issue || record.question || record.sourceText || "not stated"),
    status: record.status === "closed" ? "closed" : "open",
    createdAt: record.createdAt || new Date().toISOString(),
    sourceDate: record.sourceDate || dateFromIso(record.createdAt) || todayString(),
    sourceText: formatLegacyValue(record.sourceText || record.description || record.title || ""),
    comments: Array.isArray(record.comments) ? record.comments.map(normalizeComment) : [],
    flags: Array.isArray(record.flags) ? record.flags.map(normalizeFlag) : []
  };
}


function normalizeFlag(flag) {
  return {
    id: flag.id || createId("flag"),
    type: flag.type === "clarification" ? "clarification" : "incomplete",
    text: formatLegacyValue(flag.text || flag.question || flag.missing || flag.description || flag.sourceText || ""),
    status: flag.status === "closed" ? "closed" : "open",
    sourceText: formatLegacyValue(flag.sourceText || flag.text || ""),
    createdAt: flag.createdAt || new Date().toISOString(),
    statusChangedAt: flag.statusChangedAt || flag.closedAt || ""
  };
}

function getOpenFlags(record) {
  return (record.flags || []).filter(flag => flag.status !== "closed");
}

function flagBadge(flag) {
  const label = flag.type === "clarification" ? "CLARIFY" : "INCOMPLETE";
  const cssClass = flag.type === "clarification" ? "clarify" : "incomplete";
  return `<span class="flag-badge ${cssClass}">${label}</span>`;
}

function renderRecordFlags(record) {
  const flags = record.flags || [];
  if (!flags.length) return "";
  return `
    <div class="record-flags-panel">
      <div class="description-label">Record Flags</div>
      <div class="flag-list">
        ${flags.map(flag => `
          <div class="flag-row ${flag.status === "closed" ? "closed" : ""}">
            ${flagBadge(flag)}
            <span class="flag-text">${escapeHtml(flag.text)}</span>
            <button type="button" class="pill ${flag.status !== "closed" ? "active-open" : ""}" data-flag-id="${escapeHtml(flag.id)}" data-set-flag-status="open">OPEN</button>
            <button type="button" class="pill ${flag.status === "closed" ? "active-closed" : ""}" data-flag-id="${escapeHtml(flag.id)}" data-set-flag-status="closed">CLOSED</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPackageFlags() {
  const flags = state.package.packageFlags || [];
  if (!flags.length) return "";
  return `
    <details class="package-flags" open>
      <summary><span>General note flags not linked to one record</span><span class="count">${flags.length}</span></summary>
      <div class="package-flag-list">
        ${flags.map(flag => `
          <div class="flag-row ${flag.status === "closed" ? "closed" : ""}">
            ${flagBadge(flag)}
            <span class="flag-text">${escapeHtml(flag.text)}</span>
          </div>
        `).join("")}
      </div>
    </details>
  `;
}

function findRelatedRecord(records, text) {
  const tokens = importantTokens(text);
  if (!tokens.length) return null;
  let best = null;
  let bestScore = 0;
  for (const record of records) {
    const haystack = `${record.description || ""} ${record.sourceText || ""}`.toLowerCase();
    let score = 0;
    for (const token of tokens) if (haystack.includes(token)) score += token.length > 5 ? 2 : 1;
    if (score > bestScore) {
      best = record;
      bestScore = score;
    }
  }
  return bestScore >= 2 ? best : null;
}

function importantTokens(text) {
  const stop = new Set(["the","and","for","with","from","that","this","not","stated","exact","date","time","info","information","missing","required","specific","details","company","contact","owner","task","tasks","address","email","phone","site","shift","supervisor"]);
  return formatLegacyValue(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(token => token.length >= 3 && !stop.has(token));
}

function normalizeComment(comment) {
  return {
    id: comment.id || createId("com"),
    text: formatLegacyValue(comment.text || comment.note || comment.update || comment.comment || ""),
    status: comment.status === "closed" ? "closed" : "open",
    createdAt: comment.createdAt || new Date().toISOString(),
    updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
  };
}

function formatLegacyValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return value.map(formatLegacyValue).filter(Boolean).join("; ");
  if (typeof value === "object") {
    const preferred = [
      "text", "message", "description", "task", "issue", "question", "title",
      "summary", "reason", "missing", "field", "value", "name", "sourceText"
    ];
    for (const key of preferred) {
      if (value[key] !== undefined && value[key] !== null && value[key] !== "") {
        const formatted = formatLegacyValue(value[key]);
        if (formatted) return formatted;
      }
    }
    return Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== "")
      .map(([key, entryValue]) => `${humanizeKey(key)}: ${formatLegacyValue(entryValue)}`)
      .filter(Boolean)
      .join("; ");
  }
  return String(value).trim();
}

function humanizeKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/^./, char => char.toUpperCase());
}

function legacyDedupeKey(value) {
  return formatLegacyValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function normalizeLegacyStatus(item) {
  const status = String(item.status || item.reviewStatus || "open").toLowerCase();
  return ["done", "closed", "dismissed", "resolved"].includes(status) ? "closed" : "open";
}

function getSelectedRecord() {
  return state.package.records.find(record => record.id === state.selectedRecordId) || null;
}

function getSelectedComment(record) {
  return (record.comments || []).find(comment => comment.id === state.selectedCommentId) || null;
}

function markDirty() {
  state.dirty = true;
  state.package.reviewConsole = {
    ...(state.package.reviewConsole || {}),
    appName: APP_NAME,
    appVersion: APP_VERSION,
    modifiedAt: new Date().toISOString(),
    sourceLabel: state.sourceLabel,
    localPackageId: state.currentLocalPackageId
  };
  setStatus(state.currentLocalPackageId ? "Local changes not saved." : "Edited in memory - export or save locally required.");
}

function metaBox(label, value) {
  return `<div class="meta-box"><span class="meta-label">${escapeHtml(label)}</span><span class="meta-value">${escapeHtml(value || "not stated")}</span></div>`;
}

function groupBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function compareDateDesc(a, b) {
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (Number.isNaN(da) && Number.isNaN(db)) return String(b).localeCompare(String(a));
  if (Number.isNaN(da)) return 1;
  if (Number.isNaN(db)) return -1;
  return db - da;
}

function dateFromIso(value) {
  if (!value || value === "not stated") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return "not stated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}

function normalizeCue(value) {
  return String(value || "").trim().toLowerCase().replaceAll(" ", "-");
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast("Copied");
}

function setStatus(message) {
  els.statusLine.textContent = message;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 1400);
}

function flashHint(message) {
  els.entryHint.textContent = message;
  setTimeout(() => {
    els.entryHint.textContent = "Main descriptions are fixed after creation. To change one, close it and create a new main record.";
  }, 3200);
}

function createSamplePackage() {
  const now = new Date().toISOString();
  return {
    packageType: "sitescribe_two_level_records",
    version: "1.0",
    site: "Kemptville Site",
    shiftDate: todayString(),
    processedAt: now,
    reviewConsole: { appName: APP_NAME, appVersion: APP_VERSION, createdAt: now, model: "two-level-records-with-record-flags" },
    packageFlags: [],
    records: [
      {
        id: createId("rec"),
        category: "action",
        description: "Make an appointment to discuss crane coming to site with TP Crawford",
        status: "open",
        createdAt: now,
        sourceDate: todayString(),
        sourceText: "todo, Make an appointment to discuss crane coming to site with TP Crawford",
        comments: []
      },
      {
        id: createId("rec"),
        category: "event",
        description: "Crane arrived on site and access road was clear",
        status: "open",
        createdAt: now,
        sourceDate: todayString(),
        sourceText: "event, Crane arrived on site and access road was clear",
        comments: [{ id: createId("com"), text: "Operator checked in.", status: "open", createdAt: now, updatedAt: now }]
      }
    ]
  };
}
