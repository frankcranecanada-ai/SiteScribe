/*
  SiteScribe Review Console v0.6.66 - Dropbox OAuth callback helper

  Deploy this file beside dropbox-callback.html at the unprotected web root:
    https://www.ecrinc.ca/dropbox-callback.js

  This helper exchanges the Dropbox OAuth PKCE code and stores the session token in
  sessionStorage for the same origin, then returns to the SiteScribe page that started
  the connection. It does not import, upload, delete, or modify SiteScribe data.
*/

(function SiteScribeDropboxCallback() {
  "use strict";

  const STORAGE_PREFIX = "sitescribe_dropbox_sync_proof_";
  const APP_KEY_STORAGE_KEY = "sitescribe_dropbox_app_key";

  document.addEventListener("DOMContentLoaded", runCallback);

  async function runCallback() {
    const status = document.getElementById("callbackStatus");
    const details = document.getElementById("callbackDetails");

    try {
      if (!window.Dropbox || !window.Dropbox.DropboxAuth) {
        throw new Error("Dropbox JavaScript SDK was not loaded.");
      }

      const params = new URLSearchParams(window.location.search);
      const error = params.get("error") || "";
      const errorDescription = params.get("error_description") || "";
      if (error) {
        throw new Error(`${error}: ${errorDescription || "Dropbox authorization was not completed."}`);
      }

      const code = params.get("code") || "";
      if (!code) {
        write(status, "No Dropbox authorization code was found.");
        write(details, "Open SiteScribe and press CONNECT DROPBOX to start again.");
        return;
      }

      const appKey = sessionStorage.getItem(STORAGE_PREFIX + "app_key_for_callback") || getStoredAppKey();
      const codeVerifier = sessionStorage.getItem(STORAGE_PREFIX + "code_verifier") || "";
      const redirectUri = sessionStorage.getItem(STORAGE_PREFIX + "redirect_uri") || getCleanRedirectUri();
      const returnUri = sessionStorage.getItem(STORAGE_PREFIX + "return_uri") || (window.location.origin + "/sitescribe/");

      if (!appKey) throw new Error("Missing Dropbox app key. Return to SiteScribe, enter the app key, save settings, and connect again.");
      if (!codeVerifier) throw new Error("Missing PKCE verifier. Return to SiteScribe and connect again from the same browser tab/session.");

      write(status, "Connecting Dropbox...");
      write(details, "Finishing the Dropbox authorization handshake.");

      const dbxAuth = new Dropbox.DropboxAuth({ clientId: appKey });
      dbxAuth.setCodeVerifier(codeVerifier);
      const response = await dbxAuth.getAccessTokenFromCode(redirectUri, code);
      const result = response && response.result ? response.result : response;

      if (!result || !result.access_token) throw new Error("Dropbox token response did not include an access token.");

      sessionStorage.setItem(STORAGE_PREFIX + "access_token", result.access_token);
      if (result.expires_in) {
        const expiresAt = Date.now() + Number(result.expires_in) * 1000;
        sessionStorage.setItem(STORAGE_PREFIX + "expires_at", String(expiresAt));
      }
      if (result.refresh_token) {
        sessionStorage.setItem(STORAGE_PREFIX + "refresh_token", result.refresh_token);
      }
      sessionStorage.removeItem(STORAGE_PREFIX + "code_verifier");
      sessionStorage.setItem(STORAGE_PREFIX + "callback_status", "Dropbox authorization complete through callback page. Use LIST DROPBOX JSON FILES.");

      write(status, "Dropbox connected.");
      write(details, "Returning to SiteScribe...");
      window.location.replace(returnUri);
    } catch (error) {
      console.error("Dropbox callback failed", error);
      sessionStorage.setItem(STORAGE_PREFIX + "callback_status", `Dropbox callback failed: ${error.message || error}`);
      write(status, "Dropbox callback failed.");
      write(details, error.message || String(error));
    }
  }

  function getStoredAppKey() {
    try {
      return String(window.localStorage && window.localStorage.getItem(APP_KEY_STORAGE_KEY) || "").trim();
    } catch (_) {
      return "";
    }
  }

  function getCleanRedirectUri() {
    return window.location.origin + window.location.pathname;
  }

  function write(node, text) {
    if (node) node.textContent = text;
  }
})();
