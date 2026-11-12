#!/usr/bin/env node
/* Focused v0.7.07 static regression check. */
const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const checks = [
  ['version is v0.7.07', /const APP_VERSION = "v0\.7\.07"/.test(app) && /v0\.7\.07/.test(html)],
  ['prior indigo Site Walk colour restored', /\.site-walk-header \{[^}]*background: #5c6bc0/.test(css)],
  ['communication group keeps details collapse behaviour', /<details class="communication-group-card"[^>]*open>/.test(app)],
  ['communication group title includes a dedicated grip', /communication-group-drag-grip/.test(app)],
  ['communication group title uses the primary-row light-blue background', /\.communication-group-card > summary \{[^}]*background: #eaf3ff/.test(css)],
  ['communication group drag persists site-local order', /const persistOrder/.test(app) && /groupList\.sort/.test(app)],
  ['collapsed group stays collapsed after reordering', /persistOrder\(kind, wasOpen\)/.test(app) && /restoredCard\.open = wasOpen/.test(app) && /grip\.addEventListener\("click"/.test(app)],
  ['communication drag has exclusive gesture lock', /communication-group-reorder-active/.test(app) && /communication-group-reorder-active/.test(css)],
  ['normal contact controls remain present', /Add Contact/.test(app) && /Save Contacts \/ Departments/.test(html)]
];
const failed = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`));
if (failed.length) process.exit(1);
