/* Focused v0.7.05 Site Walk header consistency check. Run with: node regression_check_v0.7.05.js */
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const fail = message => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const mustContain = (text, token, label) => { if (!text.includes(token)) fail(`Missing ${label}: ${token}`); };

mustContain(app, 'const APP_VERSION = "v0.7.05"', "release version");
mustContain(html, 'styles.css?v=0.7.05', "stylesheet cache marker");
mustContain(css, 'background: var(--records-panel-bg)', "light-blue title-bar background");
mustContain(css, '.site-walk-drag-grip', "dot-matrix grip styling");
mustContain(css, 'touch-action: none', "drag gesture lock");
mustContain(app, 'toggleSiteWalkPanel(header.dataset.collapsePanel || "")', "header expand/collapse action");
mustContain(app, 'enableSiteWalkPanelDrag(panel, header)', "dot-matrix relocation action");
console.log("v0.7.05 Site Walk header consistency check passed.");
