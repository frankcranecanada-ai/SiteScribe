/*
  SiteScribe Review Console v0.6.97 - protected Dropbox behavior plus site-embedded communication configuration and activity-log schema round-trip support.

  Scope:
  - Preserve v0.6.62 Dropbox Pull Proof: list Dropbox JSON files and IMPORT one selected JSON through the existing SiteScribe import choices.
  - Restore known-working v0.6.67 upload plumbing and split it into SAVE NEW BACKUP COPY and UPDATE DROPBOX SITE FILE. This is not sync.
  - Preserve Dropbox JSON list newest-first sorting by Dropbox modified date for stack-style backup review.
  - Configure the public Dropbox App Key in the client and keep only Redirect URI in Advanced Dropbox Settings.
  - Support a dedicated OAuth callback page, normally https://www.ecrinc.ca/dropbox-callback.html, to reduce protected-folder login friction on mobile.

  Safety non-goals:
  - Do not automatically import Dropbox files on startup.
  - Do not add generalized sync or background sync.
  - Do not upload all saved sites.
  - Do not move or rename Dropbox files.
  - Deletion is available only as a deliberate, per-listed-file action with a
    filename-and-path confirmation. It never affects browser memory, Saved
    Sites, or the currently loaded SiteScribe package.
  - Do not silently overwrite IndexedDB, Saved Sites, Working Memory, reports, records, or Parser compatibility.
  - Do not modify protected JSON file picker or drag/drop import paths.

  Developer setup:
  1. Create a Dropbox app with App folder access, normally named "SiteScribe Lite".
  2. Enable permissions/scopes for reading metadata and file content.
  3. Add these OAuth Redirect URIs in the Dropbox app console:
       https://www.ecrinc.ca/dropbox-callback.html
       https://www.ecrinc.ca/sitescribe/
       https://www.ecrinc.ca/sitescribe/index.html
  4. Configure the public Dropbox app key in DROPBOX_APP_KEY below. This is a public client identifier, not the app secret.
  5. Upload dropbox-callback.html and dropbox-callback.js to the unprotected web root so the callback URL is:
       https://www.ecrinc.ca/dropbox-callback.html

  Security:
  - Do not put a Dropbox app secret in this file.
  - Do not hardcode a permanent Dropbox access token in this file.
*/

(function SiteScribeDropboxSyncProof() {
  "use strict";

  const DROPBOX_APP_KEY = "ddvj4s3ues3m8sp";
  const APP_KEY_STORAGE_KEY = "sitescribe_dropbox_app_key";
  const REDIRECT_URI_STORAGE_KEY = "sitescribe_dropbox_redirect_uri";
  const STORAGE_PREFIX = "sitescribe_dropbox_sync_proof_";
  const PERSISTENT_REFRESH_TOKEN_KEY = STORAGE_PREFIX + "persistent_refresh_token";
  const DROPBOX_PATHS = ["", "/incoming", "/saved-sites"];
  const OTHER_APP_JSON_FILES = new Set(["le-initial-sms-receipts-v1.json"]);
  const DROPBOX_BACKUP_FOLDER = "/saved-sites";

  let elements = {};
  let dropboxConnectionVerified = false;

  document.addEventListener("DOMContentLoaded", initDropboxSyncProof);

  function initDropboxSyncProof() {
    elements = {
      panel: document.getElementById("dropboxSyncPanel"),
      settingsDetails: document.getElementById("dropboxSettingsDetails"),
      appKeyInput: document.getElementById("dropboxAppKeyInput"),
      toggleAppKeyButton: document.getElementById("toggleDropboxAppKeyButton"),
      redirectUriInput: document.getElementById("dropboxRedirectUriInput"),
      saveSettingsButton: document.getElementById("saveDropboxSettingsButton"),
      settingsHint: document.getElementById("dropboxSettingsHint"),
      maskedKeySummary: document.getElementById("dropboxMaskedKeySummary"),
      connectionSummary: document.getElementById("dropboxConnectionSummary"),
      redirectSummary: document.getElementById("dropboxRedirectSummary"),
      connectButton: document.getElementById("connectDropboxButton"),
      listButton: document.getElementById("listDropboxFilesButton"),
      updateButton: document.getElementById("updateDropboxSiteFileButton"),
      backupButton: document.getElementById("saveNewDropboxBackupCopyButton"),
      statusLine: document.getElementById("dropboxStatusLine"),
      resultLine: document.getElementById("dropboxSyncResultLine"),
      filesList: document.getElementById("dropboxFilesList")
    };

    if (!elements.panel) return;

    populateDropboxSettingsInputs();
    migrateSessionRefreshTokenToPersistentStorage();

    if (elements.saveSettingsButton) elements.saveSettingsButton.addEventListener("click", saveDropboxSettingsFromInputs);
    if (elements.toggleAppKeyButton) elements.toggleAppKeyButton.addEventListener("click", toggleDropboxAppKeyVisibility);
    if (elements.appKeyInput) elements.appKeyInput.addEventListener("input", updateDropboxSafeSummary);
    if (elements.redirectUriInput) elements.redirectUriInput.addEventListener("input", () => { updateDropboxSettingsHint(); updateDropboxSafeSummary(); });
    if (elements.connectButton) elements.connectButton.addEventListener("click", connectDropbox);
    if (elements.listButton) elements.listButton.addEventListener("click", listDropboxJsonFiles);
    if (elements.backupButton) elements.backupButton.addEventListener("click", saveNewDropboxBackupCopy);
    if (elements.updateButton) elements.updateButton.addEventListener("click", updateDropboxSiteFile);
    if (elements.filesList) {
      elements.filesList.addEventListener("click", event => {
        const deleteButton = event.target.closest("[data-dropbox-delete-path]");
        if (deleteButton) {
          event.preventDefault();
          deleteDropboxJsonFile(deleteButton.dataset.dropboxDeletePath || "", deleteButton.dataset.dropboxDeleteName || "Dropbox JSON", deleteButton);
          return;
        }
        const button = event.target.closest("[data-dropbox-import-path]");
        if (!button) return;
        event.preventDefault();
        importDropboxJsonFile(button.dataset.dropboxImportPath || "", button.dataset.dropboxImportName || "Dropbox JSON", button);
      });
    }

    setDropboxStatus("Dropbox: NOT CONNECTED — connect before using Dropbox files.", "error");
    setSyncResult("Manual Dropbox backup/import ready. LIST views Dropbox JSON files; IMPORT opens SiteScribe choices; SAVE NEW BACKUP COPY uploads a timestamped copy; UPDATE DROPBOX SITE FILE replaces the stable site file after confirmation. No generalized sync.");
    updateDropboxSafeSummary();

    handleDropboxRedirectIfNeeded()
      .then(async () => {
        const callbackStatus = sessionStorage.getItem(STORAGE_PREFIX + "callback_status") || "";
        if (callbackStatus) {
          sessionStorage.removeItem(STORAGE_PREFIX + "callback_status");
          setSyncResult(callbackStatus);
        }
        if (hasStoredDropboxCredentials()) {
          setDropboxStatus("Dropbox: checking saved connection…", "checking");
          setSyncResult("Checking the saved Dropbox connection before enabling file actions.", "checking");
          await getDropboxClient({ operation: "startup connection check" });
        }
        updateDropboxSafeSummary();
      })
      .catch(error => {
        console.error("Dropbox redirect handling failed", error);
        setDropboxStatus("Dropbox: authentication failed. See console for details.");
      });
  }

  function populateDropboxSettingsInputs() {
    const appKey = getConfiguredAppKey() || getStoredAppKey();
    const redirectUri = getStoredRedirectUri() || getDefaultCallbackRedirectUri();
    if (elements.appKeyInput) elements.appKeyInput.value = appKey;
    if (elements.redirectUriInput) elements.redirectUriInput.value = redirectUri;
    updateDropboxSettingsHint();
    updateDropboxSafeSummary();
  }

  function toggleDropboxAppKeyVisibility() {
    if (!elements.appKeyInput || !elements.toggleAppKeyButton) return;
    const shouldShow = elements.appKeyInput.type === "password";
    elements.appKeyInput.type = shouldShow ? "text" : "password";
    elements.toggleAppKeyButton.textContent = shouldShow ? "HIDE APP KEY" : "SHOW APP KEY";
    elements.toggleAppKeyButton.setAttribute("aria-pressed", shouldShow ? "true" : "false");
  }

  function saveDropboxSettingsFromInputs() {
    const configuredKey = getConfiguredAppKey();
    const appKey = configuredKey || (elements.appKeyInput ? String(elements.appKeyInput.value || "").trim() : "");
    const redirectUri = elements.redirectUriInput ? String(elements.redirectUriInput.value || "").trim() : "";

    try {
      if (!configuredKey) {
        if (appKey) window.localStorage.setItem(APP_KEY_STORAGE_KEY, appKey);
        else window.localStorage.removeItem(APP_KEY_STORAGE_KEY);
      }

      if (redirectUri) window.localStorage.setItem(REDIRECT_URI_STORAGE_KEY, redirectUri);
      else window.localStorage.removeItem(REDIRECT_URI_STORAGE_KEY);

      updateDropboxSettingsHint();
      if (elements.appKeyInput) elements.appKeyInput.type = "password";
      if (elements.toggleAppKeyButton) {
        elements.toggleAppKeyButton.textContent = "SHOW APP KEY";
        elements.toggleAppKeyButton.setAttribute("aria-pressed", "false");
      }
      updateDropboxSafeSummary();
      setDropboxStatus("Dropbox: redirect setting saved. Use CONNECT DROPBOX.");
      setSyncResult("Dropbox redirect setting saved in this browser. The public App Key is already configured; no site records or Dropbox files were changed.");
    } catch (error) {
      console.error("Dropbox settings save failed", error);
      setDropboxStatus("Dropbox: could not save settings in this browser.");
    }
  }

  async function connectDropbox() {
    if (!isDropboxSdkAvailable()) return;
    const appKey = getDropboxAppKey();
    if (!appKey) return;

    const redirectUri = getDropboxRedirectUri();
    const returnUri = getCleanRedirectUri();
    const dbxAuth = new Dropbox.DropboxAuth({ clientId: appKey });

    try {
      setDropboxStatus("Dropbox: preparing authorization…");
      setSyncResult("Opening Dropbox authorization. No SiteScribe or Dropbox data has been changed.");
      const authUrl = await dbxAuth.getAuthenticationUrl(
        redirectUri,
        undefined,
        "code",
        "offline",
        undefined,
        undefined,
        true
      );

      sessionStorage.setItem(STORAGE_PREFIX + "code_verifier", dbxAuth.codeVerifier);
      sessionStorage.setItem(STORAGE_PREFIX + "redirect_uri", redirectUri);
      sessionStorage.setItem(STORAGE_PREFIX + "return_uri", returnUri);
      sessionStorage.setItem(STORAGE_PREFIX + "app_key_for_callback", appKey);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Dropbox auth URL creation failed", error);
      setDropboxStatus("Dropbox: could not start authorization.");
      setSyncResult(`Dropbox connection not started: ${summarizeDropboxError(error)}`);
    }
  }

  async function handleDropboxRedirectIfNeeded() {
    if (!isDropboxSdkAvailable(false)) return;

    const code = getQueryParam("code");
    if (!code) return;

    const appKey = getDropboxAppKey() || sessionStorage.getItem(STORAGE_PREFIX + "app_key_for_callback") || "";
    if (!appKey) return;

    const codeVerifier = sessionStorage.getItem(STORAGE_PREFIX + "code_verifier");
    const redirectUri = sessionStorage.getItem(STORAGE_PREFIX + "redirect_uri") || getCleanRedirectUri();

    if (!codeVerifier) {
      setDropboxStatus("Dropbox: missing PKCE verifier. Please connect again.");
      clearDropboxQueryParams();
      return;
    }

    const dbxAuth = new Dropbox.DropboxAuth({ clientId: appKey });
    dbxAuth.setCodeVerifier(codeVerifier);

    const response = await dbxAuth.getAccessTokenFromCode(redirectUri, code);
    const result = response && response.result ? response.result : response;

    storeDropboxTokenResult(result);
    sessionStorage.removeItem(STORAGE_PREFIX + "code_verifier");
    clearDropboxQueryParams();
    setDropboxStatus("Dropbox: connected for this browser session.");
    updateDropboxSafeSummary();
    setSyncResult("Dropbox authorization complete. Use LIST DROPBOX JSON FILES.");
  }

  function storeDropboxTokenResult(result) {
    if (!result || !result.access_token) {
      throw new Error("Dropbox token response did not include an access token.");
    }

    sessionStorage.setItem(STORAGE_PREFIX + "access_token", result.access_token);
    if (result.expires_in) {
      const expiresAt = Date.now() + Number(result.expires_in) * 1000;
      sessionStorage.setItem(STORAGE_PREFIX + "expires_at", String(expiresAt));
    }
    if (result.refresh_token) {
      sessionStorage.setItem(STORAGE_PREFIX + "refresh_token", result.refresh_token);
      setPersistentRefreshToken(result.refresh_token);
    }
    dropboxConnectionVerified = true;
  }

  async function listDropboxJsonFiles(options = {}) {
    const listOptions = options && typeof options === "object" ? options : {};
    if (!isDropboxSdkAvailable()) return { ok: false, reason: "Dropbox SDK is unavailable." };

    const dbx = listOptions.client || await getDropboxClient({ operation: "list Dropbox files" });
    if (!dbx) return { ok: false, reason: "Dropbox connection could not be verified." };

    setSyncResult(listOptions.afterSiteUpdate
      ? "Dropbox site file updated. Listing Dropbox to confirm the current file..."
      : "Listing Dropbox JSON files...");
    renderDropboxFiles([]);

    const allEntries = [];
    const errors = [];

    for (const path of DROPBOX_PATHS) {
      try {
        const entries = await listFolderAll(dbx, path);
        entries
          .filter(entry => entry && entry[".tag"] === "file")
          .filter(entry => String(entry.name || "").toLowerCase().endsWith(".json"))
          .filter(entry => !OTHER_APP_JSON_FILES.has(String(entry.name || "").toLowerCase()))
          .forEach(entry => allEntries.push({ folder: path, entry }));
      } catch (error) {
        if (isDropboxAuthorizationError(error)) {
          markDropboxReconnectRequired("Dropbox authorization expired while listing files. Press CONNECT DROPBOX, then list the files again.");
          return { ok: false, reason: "Dropbox authorization expired while listing files." };
        }
        errors.push(formatDropboxError(path, error));
      }
    }

    const dedupedEntries = dedupeDropboxEntries(allEntries);

    dedupedEntries.sort((a, b) => {
      const aDate = a.entry.server_modified || "";
      const bDate = b.entry.server_modified || "";
      return bDate.localeCompare(aDate) || String(a.entry.name || "").localeCompare(String(b.entry.name || ""));
    });

    setSyncResult(`Found ${dedupedEntries.length} JSON file(s). Reading SiteScribe metadata previews...`);
    const previewEntries = await enrichDropboxEntriesWithMetadata(dbx, dedupedEntries);
    renderDropboxFiles(previewEntries);

    const readableCount = previewEntries.filter(item => item.preview && item.preview.state === "sitescribe").length;
    const errorSuffix = errors.length ? " Errors: " + errors.join(" | ") : "";
    setSyncResult(`Listed ${dedupedEntries.length} Dropbox JSON file(s), newest first. ${readableCount} recognized SiteScribe preview(s).${errorSuffix}`);
    return {
      ok: errors.length < DROPBOX_PATHS.length,
      partial: errors.length > 0,
      listedCount: dedupedEntries.length,
      readableCount,
      errors
    };
  }

  async function listFolderAll(dbx, path) {
    let response = await dbx.filesListFolder({ path, recursive: false, include_deleted: false });
    let result = response && response.result ? response.result : response;
    const entries = Array.isArray(result.entries) ? result.entries.slice() : [];

    while (result.has_more && result.cursor) {
      response = await dbx.filesListFolderContinue({ cursor: result.cursor });
      result = response && response.result ? response.result : response;
      entries.push(...(Array.isArray(result.entries) ? result.entries : []));
    }

    return entries;
  }

  function dedupeDropboxEntries(items) {
    const seen = new Set();
    const result = [];
    items.forEach(item => {
      const path = String(item && item.entry && (item.entry.path_lower || item.entry.path_display) || "").toLowerCase();
      if (!path || seen.has(path)) return;
      seen.add(path);
      result.push(item);
    });
    return result;
  }

  async function enrichDropboxEntriesWithMetadata(dbx, items) {
    const enriched = [];
    for (const item of items) {
      const rawPath = item && item.entry ? (item.entry.path_display || item.entry.path_lower || "") : "";
      if (!rawPath) {
        enriched.push({ ...item, preview: unreadableDropboxPreview("Dropbox path was missing.") });
        continue;
      }

      try {
        const response = await dbx.filesDownload({ path: rawPath });
        const result = response && response.result ? response.result : response;
        const text = await fileDownloadResultToText(result);
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          enriched.push({ ...item, preview: unreadableDropboxPreview(`Unreadable JSON preview: ${parseError.message}`) });
          continue;
        }
        enriched.push({ ...item, preview: buildSiteScribeJsonPreview(data) });
      } catch (error) {
        console.warn("Dropbox metadata preview failed", rawPath, error);
        enriched.push({ ...item, preview: unreadableDropboxPreview(`Preview unavailable: ${summarizeError(error)}`) });
      }
    }
    return enriched;
  }

  function unreadableDropboxPreview(message) {
    return {
      state: "unreadable",
      title: "Unreadable JSON preview",
      detail: message || "Unreadable JSON preview.",
      importable: false
    };
  }

  function buildSiteScribeJsonPreview(data) {
    const pkg = unwrapPossibleSiteScribePackage(data);
    if (!isRecognizedSiteScribeJson(pkg)) {
      return {
        state: "unrecognized",
        title: "JSON file — not recognized as SiteScribe format",
        detail: "Valid JSON, but no recognized SiteScribe packageType, records array, or legacy SiteScribe sections were found.",
        importable: false
      };
    }

    const records = previewRecordsForPackage(pkg);
    const open = records.filter(item => normalizePreviewStatus(item && item.status) !== "closed").length;
    const closed = records.length - open;
    const siteName = firstNonBlank(
      pkg.site,
      pkg.memoryName,
      pkg.name,
      pkg.title,
      pkg.reviewConsole && pkg.reviewConsole.siteName,
      "Unnamed SiteScribe package"
    );
    const shiftDate = firstNonBlank(pkg.shiftDate, pkg.sourceDate, pkg.date, "not stated");
    const packageType = firstNonBlank(pkg.packageType, "sitescribe json");
    const summary = shortenPreviewSummary(pkg.dailySummary || pkg.summary || "");
    const freshness = previewFreshnessMetadata(pkg, records);

    return {
      state: "sitescribe",
      title: siteName,
      shiftDate,
      packageType,
      recordsCount: records.length,
      openCount: open,
      closedCount: closed,
      contentUpdatedAt: freshness.contentUpdatedAt,
      localSavedAt: freshness.localSavedAt,
      summary,
      importable: true
    };
  }

  function previewFreshnessMetadata(pkg, records) {
    const rc = pkg && pkg.reviewConsole && typeof pkg.reviewConsole === "object" ? pkg.reviewConsole : {};
    const timestamps = [rc.contentUpdatedAt, rc.siteNameEditedAt, rc.templateAppliedAt, pkg && pkg.processedAt, pkg && pkg.importedAt];
    (records || []).forEach(record => {
      timestamps.push(record && record.createdAt, record && record.updatedAt, record && record.closedAt);
      (record && record.comments || []).forEach(comment => {
        timestamps.push(comment.createdAt, comment.updatedAt, comment.closedAt, comment.action && comment.action.openedAt, comment.action && comment.action.completedAt);
      });
      (record && record.flags || []).forEach(flag => timestamps.push(flag.createdAt, flag.updatedAt, flag.resolvedAt));
    });
    const contentUpdatedAt = latestValidTimestamp(timestamps) || rc.modifiedAt || "";
    return { contentUpdatedAt, localSavedAt: rc.localSavedAt || "" };
  }

  function latestValidTimestamp(values) {
    let latest = "";
    let latestTime = -Infinity;
    (values || []).forEach(value => {
      if (!value) return;
      const time = new Date(value).getTime();
      if (Number.isFinite(time) && time > latestTime) {
        latestTime = time;
        latest = String(value);
      }
    });
    return latest;
  }

  function unwrapPossibleSiteScribePackage(data) {
    if (!data || typeof data !== "object") return data;
    if (data.data && typeof data.data === "object" && isRecognizedSiteScribeJson(data.data)) return data.data;
    return data;
  }

  function isRecognizedSiteScribeJson(pkg) {
    if (!pkg || typeof pkg !== "object") return false;
    const packageType = String(pkg.packageType || "").toLowerCase();
    if (packageType.includes("sitescribe")) return true;
    if (Array.isArray(pkg.records)) {
      if (!pkg.records.length) return !!(pkg.site || pkg.shiftDate || pkg.reviewConsole);
      return pkg.records.some(record => record && typeof record === "object" && (
        "category" in record ||
        "description" in record ||
        "sourceText" in record ||
        "comments" in record ||
        "flags" in record
      ));
    }
    return ["events", "followups", "emails", "appointments", "todos", "safetyIssues", "clarificationRequired", "missingInfo"]
      .some(key => Array.isArray(pkg[key]));
  }

  function previewRecordsForPackage(pkg) {
    if (!pkg || typeof pkg !== "object") return [];
    if (Array.isArray(pkg.records)) return pkg.records;
    const legacyKeys = ["events", "followups", "emails", "appointments", "todos", "safetyIssues"];
    const rows = [];
    legacyKeys.forEach(key => {
      if (!Array.isArray(pkg[key])) return;
      pkg[key].forEach(item => rows.push(item && typeof item === "object" ? item : { status: "open" }));
    });
    return rows;
  }

  function normalizePreviewStatus(status) {
    const text = String(status || "open").trim().toLowerCase();
    if (["closed", "done", "resolved", "dismissed", "cancelled", "canceled", "sent"].includes(text)) return "closed";
    return "open";
  }

  function firstNonBlank(...values) {
    for (const value of values) {
      const text = String(value || "").trim();
      if (text && text.toLowerCase() !== "not stated") return text;
    }
    return "";
  }

  function shortenPreviewSummary(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    return text.length > 170 ? `${text.slice(0, 167)}...` : text;
  }

  async function saveNewDropboxBackupCopy() {
    return uploadCurrentSiteToDropbox({ mode: "backup" });
  }

  async function updateDropboxSiteFile() {
    return uploadCurrentSiteToDropbox({ mode: "update" });
  }

  async function uploadCurrentSiteToDropbox(options) {
    const saveMode = options && options.mode === "update" ? "update" : "backup";
    if (!isDropboxSdkAvailable()) return;

    const dbx = await getDropboxClient({ operation: "upload to Dropbox" });
    if (!dbx) {
      setSyncResult("Dropbox is not connected. Press CONNECT DROPBOX and complete authorization before uploading.", "error");
      return;
    }

    if (!window.SiteScribeDropboxImportBridge || typeof window.SiteScribeDropboxImportBridge.prepareCurrentExportForDropbox !== "function") {
      setSyncResult("Dropbox upload unavailable: SiteScribe export bridge was not found.");
      return;
    }

    setBackupButtonDisabled(true);
    setSyncResult("Saving the current site locally before Dropbox upload...");
    let exportInfo;
    try {
      exportInfo = await window.SiteScribeDropboxImportBridge.prepareCurrentExportForDropbox();
    } catch (error) {
      console.error("Dropbox preflight local save failed", error);
      setSyncResult(`Dropbox upload stopped: local save failed. ${summarizeError(error)}`);
      setBackupButtonDisabled(false);
      return;
    }
    if (!exportInfo || !exportInfo.ok || !exportInfo.data) {
      setSyncResult(exportInfo && exportInfo.reason ? exportInfo.reason : "No current site is open to upload to Dropbox.");
      setBackupButtonDisabled(false);
      return;
    }

    const data = exportInfo.data;
    const filename = saveMode === "update"
      ? buildDropboxStableSiteFilename(data, exportInfo.filename)
      : buildDropboxBackupFilename(data, exportInfo.filename);
    const dropboxPath = `${DROPBOX_BACKUP_FOLDER}/${filename}`;
    const contents = JSON.stringify(data, null, 2);

    if (saveMode === "update") {
      const message = `Update existing Dropbox site file?\n\nThis will replace ${dropboxPath} with the current SiteScribe site.`;
      if (!window.confirm(message)) {
        setSyncResult("Dropbox site file update cancelled. No Dropbox file was changed.");
        setBackupButtonDisabled(false);
        return;
      }
    }

    setSyncResult(saveMode === "update"
      ? `Local save complete. Updating Dropbox site file: ${dropboxPath}...`
      : `Local save complete. Saving new Dropbox backup copy: ${dropboxPath}...`);

    try {
      await ensureDropboxFolder(dbx, DROPBOX_BACKUP_FOLDER);
      const uploadOptions = {
        path: dropboxPath,
        contents,
        mode: saveMode === "update" ? { ".tag": "overwrite" } : { ".tag": "add" },
        autorename: false,
        mute: false
      };
      if (saveMode !== "update") uploadOptions.strict_conflict = true;

      const response = await dbx.filesUpload(uploadOptions);
      const result = response && response.result ? response.result : response;
      const uploadedPath = result && (result.path_display || result.path_lower) || dropboxPath;

      if (saveMode === "update") {
        const listResult = await listDropboxJsonFiles({ client: dbx, afterSiteUpdate: true });
        if (listResult && listResult.ok) {
          const partial = listResult.partial ? " Some folders could not be read; inspect the displayed list for details." : "";
          setSyncResult(`Local save and Dropbox site update completed: ${uploadedPath}. Dropbox list refreshed with ${listResult.listedCount} JSON file(s); the current file is shown above.${partial}`);
        } else {
          setSyncResult(`Dropbox site file updated: ${uploadedPath}. The automatic confirmation list could not be refreshed${listResult?.reason ? `: ${listResult.reason}` : ""}. Use LIST DROPBOX JSON FILES to retry.`, "error");
        }
      } else {
        setSyncResult(`New Dropbox backup copy saved: ${uploadedPath}. Refreshing newest-first list...`);
        await listDropboxJsonFiles();
        setSyncResult(`Local save and new Dropbox backup completed: ${uploadedPath}.`);
      }
    } catch (error) {
      console.error(saveMode === "update" ? "Dropbox site-file update failed" : "Dropbox backup-copy save failed", error);
      if (isDropboxAuthorizationError(error)) markDropboxReconnectRequired(formatDropboxUploadFailure(error, saveMode));
      else setSyncResult(formatDropboxUploadFailure(error, saveMode), "error");
    } finally {
      setBackupButtonDisabled(false);
    }
  }

  async function ensureDropboxFolder(dbx, folderPath) {
    if (!folderPath || folderPath === "/") return;
    try {
      await dbx.filesCreateFolderV2({ path: folderPath, autorename: false });
    } catch (error) {
      const summary = summarizeError(error).toLowerCase();
      if (summary.includes("conflict/folder") || summary.includes("path/conflict/folder") || summary.includes("conflict")) return;
      throw error;
    }
  }

  function buildDropboxBackupFilename(data, fallbackFilename) {
    const site = safeFilenameSegment(firstNonBlank(
      data && data.site,
      data && data.memoryName,
      data && data.name,
      ""
    ));
    const sourceDate = safeDateSegment(data && (data.shiftDate || data.sourceDate || data.date)) || todayDateSegment();
    const stamp = backupTimestampSegment(new Date());
    const fallbackBase = safeFilenameSegment(String(fallbackFilename || "").replace(/\.json$/i, ""));
    const base = site ? `${site}_${sourceDate}` : (fallbackBase || `sitescribe_current_site_${sourceDate}`);
    return `${base}_backup_${stamp}.json`;
  }

  function buildDropboxStableSiteFilename(data, fallbackFilename) {
    const site = safeFilenameSegment(firstNonBlank(
      data && data.site,
      data && data.memoryName,
      data && data.name,
      ""
    ));
    const fallbackBase = safeFilenameSegment(String(fallbackFilename || "").replace(/\.json$/i, ""));
    const base = site || fallbackBase || "sitescribe_current_site";
    return `${base}_site.json`;
  }

  function formatDropboxUploadFailure(error, mode) {
    const summary = summarizeError(error);
    const lower = summary.toLowerCase();
    const action = mode === "update" ? "Dropbox site file update" : "New Dropbox backup copy";
    if (lower.includes("expired") || lower.includes("invalid_access_token") || lower.includes("expired_access_token") || lower.includes("401")) {
      return `${action} failed: Dropbox authorization expired or was rejected. Use CONNECT DROPBOX again. Details: ${summary}`;
    }
    if (lower.includes("missing_scope") || lower.includes("scope") || lower.includes("files.content.write")) {
      return `${action} failed: Dropbox write permission may be missing. Confirm the Dropbox app has files.content.write enabled, then reconnect Dropbox. Details: ${summary}`;
    }
    if (lower.includes("conflict")) {
      return mode === "update"
        ? `${action} failed because Dropbox reported a path conflict. Details: ${summary}`
        : `${action} stopped: a same-name file already exists. No Dropbox file was overwritten. Details: ${summary}`;
    }
    if (lower.includes("path") || lower.includes("malformed") || lower.includes("not_found")) {
      return `${action} failed because Dropbox rejected the path. Details: ${summary}`;
    }
    if (lower.includes("network") || lower.includes("failed to fetch")) {
      return `${action} failed because of a network/API connection problem. Details: ${summary}`;
    }
    return `${action} failed: ${summary}`;
  }

  function safeFilenameSegment(value) {
    return String(value || "")
      .trim()
      .replace(/\.json$/i, "")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/[^A-Za-z0-9._ -]+/g, " ")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 90);
  }

  function safeDateSegment(value) {
    const text = String(value || "").trim();
    const match = text.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  }

  function todayDateSegment() {
    return new Date().toISOString().slice(0, 10);
  }

  function backupTimestampSegment(date) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  function isDropboxConflictError(error) {
    return summarizeError(error).toLowerCase().includes("conflict");
  }

  function setBackupButtonDisabled(disabled) {
    if (elements.backupButton) elements.backupButton.disabled = !!disabled;
    if (elements.updateButton) elements.updateButton.disabled = !!disabled;
  }

  async function importDropboxJsonFile(path, name, sourceButton = null) {
    if (!path) {
      setSyncResult("Dropbox import unavailable: file path was missing.");
      return;
    }
    if (!isDropboxSdkAvailable()) return;

    setDropboxImportButtonState(sourceButton, "DOWNLOADING…", true);
    const dbx = await getDropboxClient({ operation: `download ${name || path}` });
    if (!dbx) return;

    if (!window.SiteScribeDropboxImportBridge || typeof window.SiteScribeDropboxImportBridge.importJsonData !== "function") {
      setSyncResult("Dropbox import unavailable: SiteScribe import bridge was not found.");
      return;
    }

    setSyncResult(`Downloading Dropbox JSON: ${name || path}...`);
    setImportButtonsDisabled(true);

    try {
      const response = await dbx.filesDownload({ path });
      const result = response && response.result ? response.result : response;
      const text = await fileDownloadResultToText(result);
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setSyncResult(`Dropbox JSON parse failed for ${name || path}: ${parseError.message}`);
        return;
      }

      setSyncResult(`Downloaded ${name || path}. Opening SiteScribe import choices...`);
      const importResult = await window.SiteScribeDropboxImportBridge.importJsonData(data, `Dropbox: ${name || path}`, { allowReplaceCurrent: true });
      if (importResult && importResult.mode === "cancel") {
        setSyncResult(`Dropbox import cancelled for ${name || path}. No local data changed.`);
        setDropboxImportButtonState(sourceButton, "IMPORT", false);
        return;
      }
      if (importResult && importResult.mode === "create") {
        setSyncResult(`Dropbox JSON imported as a new saved site: ${name || path}.`);
        setDropboxImportButtonState(sourceButton, "IMPORTED", false);
        return;
      }
      if (importResult && importResult.mode === "append") {
        const summary = importResult.summary || {};
        setSyncResult(`Dropbox JSON appended from ${name || path}. Added ${summary.added || 0}; skipped ${summary.skipped || 0}. Working copy autosaved.`);
        setDropboxImportButtonState(sourceButton, "IMPORTED", false);
        return;
      }
      if (importResult && importResult.mode === "replace") {
        setSyncResult(`Dropbox JSON replaced the current browser Working Memory: ${name || path}.`);
        setDropboxImportButtonState(sourceButton, "IMPORTED", false);
        return;
      }
      setSyncResult(`Dropbox JSON import workflow finished for ${name || path}.`);
      setDropboxImportButtonState(sourceButton, "IMPORT", false);
    } catch (error) {
      console.error("Dropbox JSON import failed", error);
      if (isDropboxAuthorizationError(error)) {
        markDropboxReconnectRequired(`Dropbox authorization failed while downloading ${name || path}.`);
        setDropboxImportButtonState(sourceButton, "RECONNECT REQUIRED", true, true);
      } else {
        setSyncResult(`Dropbox JSON download/import failed for ${name || path}: ${summarizeError(error)}`, "error");
        setDropboxImportButtonState(sourceButton, "IMPORT FAILED", false, true);
      }
    } finally {
      if (!elements.filesList || !elements.filesList.classList || !elements.filesList.classList.contains("dropbox-files-stale")) setImportButtonsDisabled(false);
    }
  }

  async function fileDownloadResultToText(result) {
    const candidate = result && (result.fileBlob || result.fileBinary || result.file || result);
    if (!candidate) throw new Error("Dropbox download result did not include file content.");
    if (typeof candidate === "string") return candidate;
    if (typeof Blob !== "undefined" && candidate instanceof Blob) return candidate.text();
    if (candidate && typeof candidate.text === "function") return candidate.text();
    if (candidate instanceof ArrayBuffer) return new TextDecoder("utf-8").decode(candidate);
    if (ArrayBuffer.isView(candidate)) return new TextDecoder("utf-8").decode(candidate);
    if (candidate && typeof candidate.arrayBuffer === "function") {
      const buffer = await candidate.arrayBuffer();
      return new TextDecoder("utf-8").decode(buffer);
    }
    throw new Error("Dropbox file content format was not recognized.");
  }

  async function deleteDropboxJsonFile(path, name, sourceButton = null) {
    const safePath = String(path || "").trim();
    if (!safePath) {
      setSyncResult("Dropbox file could not be deleted because its path was missing.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Delete this Dropbox JSON file?\n\n${name || "Unnamed JSON"}\n${safePath}\n\nThis permanently removes only this Dropbox file. Your browser working copy, Saved Sites, and currently open SiteScribe data are not affected.`
    );
    if (!confirmed) {
      setSyncResult(`Delete cancelled: ${name || safePath}.`);
      return;
    }

    const dbx = await getDropboxClient({ operation: "delete Dropbox file" });
    if (!dbx) return;

    setDropboxDeleteButtonState(sourceButton, "DELETING…", true);
    setImportButtonsDisabled(true);
    setDropboxDeleteButtonsDisabled(true);
    setSyncResult(`Deleting Dropbox file: ${name || safePath}…`);

    try {
      await dbx.filesDeleteV2({ path: safePath });
      setSyncResult(`Dropbox file deleted: ${safePath}. Refreshing the list…`, "success");
      await listDropboxJsonFiles();
    } catch (error) {
      if (isDropboxAuthorizationError(error)) {
        markDropboxReconnectRequired("Dropbox authorization expired while deleting a file. Press CONNECT DROPBOX, then list the files again.");
      } else {
        console.error("Dropbox file deletion failed", safePath, error);
        setSyncResult(`Dropbox file was not deleted: ${name || safePath}. ${summarizeError(error)}`, "error");
        setDropboxDeleteButtonState(sourceButton, "DELETE FAILED", false, true);
      }
    } finally {
      if (!elements.filesList || !elements.filesList.classList || !elements.filesList.classList.contains("dropbox-files-stale")) {
        setImportButtonsDisabled(false);
        setDropboxDeleteButtonsDisabled(false);
      }
    }
  }

  function setImportButtonsDisabled(disabled) {
    if (!elements.filesList) return;
    elements.filesList.querySelectorAll("[data-dropbox-import-path]").forEach(button => {
      button.disabled = !!disabled;
    });
  }

  function setDropboxDeleteButtonsDisabled(disabled) {
    if (!elements.filesList) return;
    elements.filesList.querySelectorAll("[data-dropbox-delete-path]").forEach(button => {
      button.disabled = !!disabled;
    });
  }

  function setDropboxDeleteButtonState(button, text, disabled, error = false) {
    if (!button) return;
    button.textContent = text;
    button.disabled = !!disabled;
    if (button.classList) button.classList.toggle("dropbox-delete-error", !!error);
  }

  function setDropboxImportButtonState(button, text, disabled, error = false) {
    if (!button) return;
    button.textContent = text;
    button.disabled = !!disabled;
    if (button.classList) button.classList.toggle("dropbox-import-error", !!error);
    if (typeof button.setAttribute === "function") button.setAttribute("aria-busy", text === "DOWNLOADING…" ? "true" : "false");
  }

  async function getDropboxClient(options = {}) {
    const operation = options.operation || "use Dropbox";
    const accessToken = sessionStorage.getItem(STORAGE_PREFIX + "access_token") || "";
    const refreshToken = sessionStorage.getItem(STORAGE_PREFIX + "refresh_token") || getPersistentRefreshToken();
    const expiresAt = Number(sessionStorage.getItem(STORAGE_PREFIX + "expires_at") || "0");
    const appKey = getDropboxAppKey();

    if (!accessToken && !refreshToken) {
      markDropboxReconnectRequired(`Dropbox is not connected. Connect Dropbox before attempting to ${operation}.`);
      return null;
    }

    try {
      const auth = new Dropbox.DropboxAuth({ clientId: appKey });
      if (accessToken && typeof auth.setAccessToken === "function") auth.setAccessToken(accessToken);
      if (refreshToken && typeof auth.setRefreshToken === "function") auth.setRefreshToken(refreshToken);
      if (expiresAt && typeof auth.setAccessTokenExpiresAt === "function") auth.setAccessTokenExpiresAt(new Date(expiresAt));

      const shouldRefresh = !!(refreshToken && (!accessToken || (expiresAt && Date.now() >= expiresAt - 60000)));
      if (shouldRefresh) {
        setDropboxStatus("Dropbox: refreshing saved authorization…", "checking");
        setSyncResult(`Refreshing Dropbox authorization before attempting to ${operation}.`, "checking");
        await refreshDropboxAuth(auth);
        persistDropboxAuthState(auth, refreshToken);
      }

      let dbx = new Dropbox.Dropbox({ auth });
      try {
        await dbx.filesListFolder({ path: "", recursive: false, include_deleted: false, limit: 1 });
      } catch (error) {
        if (!refreshToken || !isDropboxAuthorizationError(error)) throw error;
        setDropboxStatus("Dropbox: renewing rejected authorization…", "checking");
        setSyncResult(`Dropbox rejected the saved access token. Attempting automatic renewal before ${operation}.`, "checking");
        await refreshDropboxAuth(auth, true);
        persistDropboxAuthState(auth, refreshToken);
        dbx = new Dropbox.Dropbox({ auth });
        await dbx.filesListFolder({ path: "", recursive: false, include_deleted: false, limit: 1 });
      }

      dropboxConnectionVerified = true;
      clearDropboxDisconnectedPresentation();
      setDropboxStatus("Dropbox: connected and verified.", "success");
      updateDropboxSafeSummary();
      return dbx;
    } catch (error) {
      console.error(`Dropbox connection check failed before ${operation}`, error);
      if (isDropboxAuthorizationError(error)) {
        markDropboxReconnectRequired(`Dropbox authorization expired or was rejected. Press CONNECT DROPBOX before attempting to ${operation}.`);
      } else {
        dropboxConnectionVerified = false;
        setDropboxStatus("Dropbox: connection check failed.", "error");
        setSyncResult(`Could not verify Dropbox before attempting to ${operation}: ${summarizeError(error)}`, "error");
      }
      return null;
    }
  }

  async function refreshDropboxAuth(auth, force = false) {
    if (force && typeof auth.refreshAccessToken === "function") {
      await auth.refreshAccessToken();
      return;
    }
    if (typeof auth.checkAndRefreshAccessToken === "function") {
      await auth.checkAndRefreshAccessToken();
      return;
    }
    if (typeof auth.refreshAccessToken === "function") {
      await auth.refreshAccessToken();
      return;
    }
    throw new Error("The loaded Dropbox SDK cannot refresh this authorization. Connect Dropbox again.");
  }

  function persistDropboxAuthState(auth, fallbackRefreshToken) {
    const token = typeof auth.getAccessToken === "function" ? auth.getAccessToken() : "";
    const refreshToken = typeof auth.getRefreshToken === "function" ? auth.getRefreshToken() : fallbackRefreshToken;
    const expiresAt = typeof auth.getAccessTokenExpiresAt === "function" ? auth.getAccessTokenExpiresAt() : null;
    if (token) sessionStorage.setItem(STORAGE_PREFIX + "access_token", token);
    if (refreshToken) {
      sessionStorage.setItem(STORAGE_PREFIX + "refresh_token", refreshToken);
      setPersistentRefreshToken(refreshToken);
    }
    if (expiresAt) sessionStorage.setItem(STORAGE_PREFIX + "expires_at", String(new Date(expiresAt).getTime()));
  }

  function getStoredAccessToken() {
    const token = sessionStorage.getItem(STORAGE_PREFIX + "access_token");
    const expiresAt = Number(sessionStorage.getItem(STORAGE_PREFIX + "expires_at") || "0");

    return token || "";
  }

  function renderDropboxFiles(items) {
    if (!elements.filesList) return;

    if (!items.length) {
      elements.filesList.innerHTML = '<div class="dropbox-empty">No Dropbox JSON files listed yet.</div>';
      return;
    }

    const rows = items.map(({ folder, entry, preview }) => {
      const rawName = entry.name || "unnamed.json";
      const rawPath = entry.path_display || entry.path_lower || folder;
      const name = escapeHtml(rawName);
      const modified = escapeHtml(formatDateTime(entry.server_modified));
      const source = escapeHtml(dropboxSourceLabel(rawPath, folder));
      const path = escapeHtml(rawPath);
      const fileMeta = `<div class="dropbox-file-meta dropbox-source-line">Source: ${source} · Uploaded to Dropbox: ${modified}</div><div class="dropbox-file-path">File: ${name}</div><div class="dropbox-file-path">Path: ${path}</div>`;
      const filePreview = preview || unreadableDropboxPreview("Preview not available.");

      if (filePreview.state === "sitescribe") {
        const title = escapeHtml(filePreview.title || rawName);
        const freshness = dropboxFreshnessStatus(filePreview);
        return `
          <div class="dropbox-file-row dropbox-file-row-previewed">
            <div class="dropbox-file-main">
              <div class="dropbox-file-name">${title} <span class="dropbox-freshness-badge ${escapeHtml(freshness.className)}">${escapeHtml(freshness.label)}</span></div>
              <div class="dropbox-file-meta dropbox-freshness-line">Content updated: ${escapeHtml(formatDateTime(filePreview.contentUpdatedAt))}</div>
            </div>
            <div class="dropbox-file-actions">
              <button type="button" class="secondary small dropbox-import-button" data-dropbox-import-path="${path}" data-dropbox-import-name="${name}">IMPORT</button>
              <button type="button" class="secondary small dropbox-delete-button" data-dropbox-delete-path="${path}" data-dropbox-delete-name="${name}">DELETE</button>
            </div>
          </div>
        `;
      }

      const warningTitle = filePreview.state === "unrecognized" ? "JSON file — not recognized as SiteScribe format" : "Unreadable JSON preview";
      const detail = filePreview.detail || warningTitle;
      return `
        <div class="dropbox-file-row dropbox-file-row-warning">
          <div class="dropbox-file-main">
            <div class="dropbox-file-name">${escapeHtml(warningTitle)}</div>
            <div class="dropbox-file-warning-text">${escapeHtml(detail)}</div>
            ${fileMeta}
          </div>
          <div class="dropbox-file-actions">
            <button type="button" class="secondary small dropbox-delete-button" data-dropbox-delete-path="${path}" data-dropbox-delete-name="${name}">DELETE</button>
          </div>
        </div>
      `;
    }).join("");

    elements.filesList.innerHTML = rows;
  }

  function dropboxFreshnessStatus(filePreview) {
    const bridge = window.SiteScribeDropboxImportBridge;
    const active = bridge && typeof bridge.getCurrentFreshnessInfo === "function" ? bridge.getCurrentFreshnessInfo() : null;
    if (!active || !sameSiteIdentity(active, filePreview)) return { label: "NOT OPEN", className: "freshness-unknown" };
    const localTime = new Date(active.contentUpdatedAt || "").getTime();
    const dropboxTime = new Date(filePreview.contentUpdatedAt || "").getTime();
    if (!Number.isFinite(localTime) || !Number.isFinite(dropboxTime)) return { label: "UNKNOWN", className: "freshness-unknown" };
    if (Math.abs(localTime - dropboxTime) < 1000) return { label: "CURRENT", className: "freshness-current" };
    if (localTime > dropboxTime) return { label: "LOCAL NEWER", className: "freshness-local-newer" };
    return { label: "DROPBOX NEWER", className: "freshness-dropbox-newer" };
  }

  function sameSiteIdentity(active, preview) {
    const normalize = value => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
    return normalize(active.site) === normalize(preview.title)
      && normalize(active.shiftDate) === normalize(preview.shiftDate);
  }

  function dropboxSourceLabel(path, folder) {
    const lowerPath = String(path || "").toLowerCase();
    const lowerFolder = String(folder || "").toLowerCase();
    if (lowerPath.startsWith("/incoming/") || lowerPath === "/incoming" || lowerFolder === "/incoming") return "incoming";
    if (lowerPath.startsWith("/saved-sites/") || lowerPath === "/saved-sites" || lowerFolder === "/saved-sites") return "saved-sites";
    return "root";
  }

  function getDropboxAppKey() {
    const storedKey = getStoredAppKey();
    const configuredKey = getConfiguredAppKey();
    const inputKey = elements.appKeyInput ? String(elements.appKeyInput.value || "").trim() : "";
    const appKey = configuredKey || inputKey || storedKey;
    if (!appKey) {
      if (elements.settingsDetails) elements.settingsDetails.open = true;
      setDropboxStatus("Dropbox: public App Key required in this browser.");
      setSyncResult("Dropbox connection not started. Advanced Dropbox Settings is open: paste the public App Key, confirm the callback URL, and press SAVE DROPBOX SETTINGS.");
      if (elements.appKeyInput && typeof elements.appKeyInput.focus === "function") elements.appKeyInput.focus();
      return "";
    }
    return appKey;
  }

  function getConfiguredAppKey() {
    const configuredKey = String(DROPBOX_APP_KEY || "").trim();
    return configuredKey === "PASTE_DROPBOX_APP_KEY_HERE" ? "" : configuredKey;
  }

  function getStoredAppKey() {
    try {
      return String(window.localStorage && window.localStorage.getItem(APP_KEY_STORAGE_KEY) || "").trim();
    } catch (_) {
      return "";
    }
  }

  function getDropboxRedirectUri() {
    const inputUri = elements.redirectUriInput ? String(elements.redirectUriInput.value || "").trim() : "";
    return inputUri || getStoredRedirectUri() || getDefaultCallbackRedirectUri();
  }

  function getStoredRedirectUri() {
    try {
      return String(window.localStorage && window.localStorage.getItem(REDIRECT_URI_STORAGE_KEY) || "").trim();
    } catch (_) {
      return "";
    }
  }

  function getPersistentRefreshToken() {
    try {
      return String(window.localStorage && window.localStorage.getItem(PERSISTENT_REFRESH_TOKEN_KEY) || "").trim();
    } catch (_) {
      return "";
    }
  }

  function setPersistentRefreshToken(token) {
    const cleanToken = String(token || "").trim();
    if (!cleanToken) return;
    try {
      window.localStorage.setItem(PERSISTENT_REFRESH_TOKEN_KEY, cleanToken);
    } catch (error) {
      console.warn("Dropbox persistent authorization could not be stored in this browser", error);
    }
  }

  function clearPersistentRefreshToken() {
    try {
      window.localStorage.removeItem(PERSISTENT_REFRESH_TOKEN_KEY);
    } catch (_) {
      // The session credentials have still been cleared even if local storage is unavailable.
    }
  }

  function migrateSessionRefreshTokenToPersistentStorage() {
    const sessionRefreshToken = sessionStorage.getItem(STORAGE_PREFIX + "refresh_token") || "";
    if (sessionRefreshToken) setPersistentRefreshToken(sessionRefreshToken);
  }

  function getDefaultCallbackRedirectUri() {
    return window.location.origin + "/dropbox-callback.html";
  }

  function updateDropboxSettingsHint() {
    if (!elements.settingsHint) return;
    const redirectUri = elements.redirectUriInput && elements.redirectUriInput.value ? elements.redirectUriInput.value : getDefaultCallbackRedirectUri();
    elements.settingsHint.textContent = `The public Dropbox App Key is configured in SiteScribe. Only a custom redirect setting is stored in this browser. Recommended mobile redirect: ${redirectUri}. Add this exact URI to Dropbox OAuth Redirect URIs.`;
  }

  function updateDropboxSafeSummary() {
    const appKey = getConfiguredAppKey() || (elements.appKeyInput && String(elements.appKeyInput.value || "").trim()) || getStoredAppKey();
    const redirectUri = (elements.redirectUriInput && String(elements.redirectUriInput.value || "").trim()) || getStoredRedirectUri() || getDefaultCallbackRedirectUri();
    const hasCredentials = hasStoredDropboxCredentials();

    if (elements.connectionSummary) {
      elements.connectionSummary.textContent = dropboxConnectionVerified
        ? "Dropbox: connected and verified"
        : (hasCredentials ? "Dropbox: verification required" : "Dropbox: not connected");
      if (elements.connectionSummary.classList) {
        elements.connectionSummary.classList.toggle("dropbox-connection-ok", dropboxConnectionVerified);
        elements.connectionSummary.classList.toggle("dropbox-connection-warning", !dropboxConnectionVerified && hasCredentials);
        elements.connectionSummary.classList.toggle("dropbox-connection-error", !dropboxConnectionVerified && !hasCredentials);
      }
    }
    if (elements.redirectSummary) {
      const isCallback = /\/dropbox-callback\.html$/i.test(redirectUri);
      elements.redirectSummary.textContent = isCallback ? "Callback redirect: active" : "Callback redirect: custom";
    }
    if (elements.maskedKeySummary) {
      elements.maskedKeySummary.textContent = getConfiguredAppKey() ? "App key: configured" : (appKey ? `App key: ${maskDropboxAppKey(appKey)}` : "App key not saved");
    }
  }

  function hasCurrentDropboxToken() {
    const token = sessionStorage.getItem(STORAGE_PREFIX + "access_token") || "";
    const expiresAt = Number(sessionStorage.getItem(STORAGE_PREFIX + "expires_at") || "0");
    return !!(token && (!expiresAt || Date.now() <= expiresAt));
  }

  function hasStoredDropboxCredentials() {
    return !!(
      sessionStorage.getItem(STORAGE_PREFIX + "access_token")
      || sessionStorage.getItem(STORAGE_PREFIX + "refresh_token")
      || getPersistentRefreshToken()
    );
  }

  function isDropboxAuthorizationError(error) {
    const summary = summarizeError(error).toLowerCase();
    return summary.includes("invalid_access_token")
      || summary.includes("expired_access_token")
      || summary.includes("access token")
      || summary.includes("unauthorized")
      || summary.includes("auth")
      || summary.includes("401");
  }

  function clearDropboxDisconnectedPresentation() {
    if (elements.filesList && elements.filesList.classList) elements.filesList.classList.remove("dropbox-files-stale");
    if (elements.connectButton && elements.connectButton.classList) elements.connectButton.classList.remove("dropbox-connect-required");
    if (elements.filesList) {
      elements.filesList.querySelectorAll("[data-dropbox-import-path]").forEach(button => {
        if (button.textContent === "RECONNECT REQUIRED" || button.textContent === "IMPORT FAILED") button.textContent = "IMPORT";
        if (button.classList) button.classList.remove("dropbox-import-error");
        button.disabled = false;
      });
      elements.filesList.querySelectorAll("[data-dropbox-delete-path]").forEach(button => {
        if (button.textContent === "DELETE FAILED") button.textContent = "DELETE";
        if (button.classList) button.classList.remove("dropbox-delete-error");
        button.disabled = false;
      });
    }
  }

  function markDropboxReconnectRequired(message) {
    dropboxConnectionVerified = false;
    sessionStorage.removeItem(STORAGE_PREFIX + "access_token");
    sessionStorage.removeItem(STORAGE_PREFIX + "expires_at");
    sessionStorage.removeItem(STORAGE_PREFIX + "refresh_token");
    clearPersistentRefreshToken();
    setDropboxStatus("Dropbox: NOT CONNECTED — reconnect required.", "error");
    setSyncResult(message || "Dropbox is not connected. Press CONNECT DROPBOX and complete authorization before trying again.", "error");
    if (elements.connectButton && elements.connectButton.classList) elements.connectButton.classList.add("dropbox-connect-required");
    if (elements.filesList) {
      if (elements.filesList.classList) elements.filesList.classList.add("dropbox-files-stale");
      elements.filesList.querySelectorAll("[data-dropbox-import-path]").forEach(button => {
        setDropboxImportButtonState(button, "RECONNECT REQUIRED", true, true);
      });
      elements.filesList.querySelectorAll("[data-dropbox-delete-path]").forEach(button => {
        setDropboxDeleteButtonState(button, "RECONNECT REQUIRED", true, true);
      });
    }
    updateDropboxSafeSummary();
  }

  function maskDropboxAppKey(value) {
    const text = String(value || "").trim();
    if (!text) return "not saved";
    const suffix = text.slice(-4);
    return `${"•".repeat(Math.max(8, Math.min(14, text.length - suffix.length)))}${suffix}`;
  }

  function isDropboxSdkAvailable(showStatus = true) {
    const ok = window.Dropbox && window.Dropbox.Dropbox && window.Dropbox.DropboxAuth;
    if (!ok && showStatus) {
      setDropboxStatus("Dropbox: JavaScript SDK not loaded. Check the Dropbox SDK script tag and internet access.");
      setSyncResult("Dropbox connection not started because the Dropbox JavaScript SDK did not load. Check Firefox tracking protection or content blocking, then reload SiteScribe.");
    }
    return Boolean(ok);
  }

  function getCleanRedirectUri() {
    return window.location.origin + window.location.pathname;
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function clearDropboxQueryParams() {
    if (!window.history || !window.history.replaceState) return;
    window.history.replaceState({}, document.title, getCleanRedirectUri() + window.location.hash);
  }

  function formatDropboxError(path, error) {
    const summary = error && error.error && error.error.error_summary
      ? error.error.error_summary
      : error && error.error_summary
        ? error.error_summary
        : error && error.message
          ? error.message
          : "unknown error";
    return `${path || "/"}: ${summary}`;
  }

  function summarizeError(error) {
    if (!error) return "unknown error";
    if (error.error && error.error.error_summary) return error.error.error_summary;
    if (error.error_summary) return error.error_summary;
    if (error.message) return error.message;
    return String(error);
  }

  function formatDateTime(value) {
    if (!value) return "not stated";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function setDropboxStatus(text, state = "") {
    if (elements.statusLine) elements.statusLine.textContent = text;
    if (elements.statusLine && elements.statusLine.classList) {
      elements.statusLine.classList.toggle("dropbox-feedback-error", state === "error");
      elements.statusLine.classList.toggle("dropbox-feedback-checking", state === "checking");
      elements.statusLine.classList.toggle("dropbox-feedback-success", state === "success");
    }
    updateDropboxSafeSummary();
  }

  function setSyncResult(text, state = "") {
    if (!elements.resultLine) return;
    const cleanText = String(text || "").trim();
    elements.resultLine.textContent = cleanText.toLowerCase().startsWith("last action:") ? cleanText : `Last action: ${cleanText}`;
    if (elements.resultLine.classList) {
      elements.resultLine.classList.toggle("dropbox-feedback-error", state === "error");
      elements.resultLine.classList.toggle("dropbox-feedback-checking", state === "checking");
      elements.resultLine.classList.toggle("dropbox-feedback-success", state === "success");
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Browser-console test hooks only. Do not use these for automatic import/upload.
  window.SiteScribeDropboxSyncProof = {
    listDropboxJsonFiles,
    connectDropbox,
    importDropboxJsonFile,
    saveNewDropboxBackupCopy,
    updateDropboxSiteFile,
    saveDropboxSettingsFromInputs,
    updateDropboxSafeSummary
  };
})();
