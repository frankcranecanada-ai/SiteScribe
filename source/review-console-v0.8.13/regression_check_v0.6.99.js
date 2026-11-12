/* Focused regression check: Site Walk touch relocation must be exclusive. */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const mustContain = (text, fragment, label) => {
  if (!text.includes(fragment)) throw new Error(`Missing ${label}: ${fragment}`);
};

mustContain(app, 'const APP_VERSION = "v0.7.02"', "release version");
mustContain(app, "function enableSiteWalkPanelDrag(panel, header)", "section drag function");
mustContain(app, 'document.addEventListener("touchmove", preventPageGesture, { capture: true, passive: false })', "non-passive touch scroll lock");
mustContain(app, 'document.addEventListener("gesturestart", preventPageGesture, { capture: true, passive: false })', "gesture lock");
mustContain(app, 'document.documentElement.classList.add("site-walk-reorder-active")', "active lock class");
mustContain(app, 'grip.addEventListener("lostpointercapture", cleanup)', "pointer-capture cleanup");
mustContain(css, "html.site-walk-reorder-active", "scroll lock CSS");
mustContain(css, ".site-walk-panel:not(.drag-source) { pointer-events: none; }", "other panel interaction lock");
mustContain(css, "min-width: 32px", "mobile-friendly grip target");
mustContain(html, 'id="appVersion"', "visible app version target");
console.log("v0.7.02 carried-forward Site Walk touch-lock regression check passed.");
