const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const context = vm.createContext({ console, document: { addEventListener() {} }, window: {}, URL, File, Blob, setTimeout, clearTimeout });
vm.runInContext(app, context);
const rows = vm.runInContext(`(() => {
  const record = normalizeRecord({ id: 'p', description: 'Synthetic primary', category: 'event', status: 'open', createdAt: '2026-11-18T12:00:00Z', comments: [
    { id: 'zero-parent', text: 'Zero-hour parent', status: 'open', workDate: '2026-11-18', totalHours: 0, activities: [
      { id: 'positive-child', text: 'Positive activity', status: 'open', workDate: '2026-11-18', totalHours: 2 },
      { id: 'zero-child', text: 'Zero activity', status: 'open', workDate: '2026-11-18', totalHours: 0 }
    ] },
    { id: 'positive-secondary', text: 'Positive secondary', status: 'open', workDate: '2026-11-18', totalHours: 1.5 },
    { id: 'zero-secondary', text: 'Zero secondary', status: 'open', workDate: '2026-11-18', totalHours: 0 }
  ] });
  const filters = { type: 'hours', from: '', to: '', categories: [], statuses: ['open', 'closed'], sortOrder: 'date_asc' };
  const summary = type => reportChildRows(record, { ...filters, type }).map(row => ({ id: row.comment.id, parent: row.parentComment?.id || null, hours: row.hours }));
  return { hours: summary('hours'), mds: summary('mds') };
})()`, context);
const actual = JSON.parse(JSON.stringify(rows));
assert.deepEqual(actual.hours.sort((left, right) => left.id.localeCompare(right.id)), [
  { id: 'positive-child', parent: 'zero-parent', hours: 2 },
  { id: 'positive-secondary', parent: null, hours: 1.5 }
]);
assert.equal(actual.mds.length, 5, 'Other report types keep their existing selection rows');

for (const [year, month, day, expected] of [
  [2024, 1, 10, { from: '2024-02-01', to: '2024-02-29' }],
  [2025, 1, 10, { from: '2025-02-01', to: '2025-02-28' }],
  [2026, 10, 23, { from: '2026-11-01', to: '2026-11-30' }],
  [2026, 11, 31, { from: '2026-12-01', to: '2026-12-31' }]
]) {
  const bounds = vm.runInContext(`reportDateBoundsForCurrentMonth(new Date(${year}, ${month}, ${day}))`, context);
  assert.deepEqual(JSON.parse(JSON.stringify(bounds)), expected);
}

assert.match(app, /const APP_VERSION = "v0\.8\.32";/);
assert.match(html, /<title>SiteScribe Review Console v0\.8\.32<\/title>/);
for (const match of html.matchAll(/(?:styles\.css|app\.js|dropbox-sync-proof\.js)\?v=([^" ]+)/g)) assert.equal(match[1], '0.8.32');
assert.match(app, /<table class="report-table hours-detail-table hours-report-table">/);
assert.match(app, /<tr class="hours-report-total-row">/);
assert.match(app, /return `\$\{rows\.length\} selected[\s\S]*?time \$\{timeEntries === 1/);
assert.match(css, /\.hours-report-table tbody tr:nth-last-child\(2\)\s*\{[^}]*break-after: avoid/);
assert.match(css, /\.report-header-item\s*\{\s*min-width: 0;\s*padding: 2px 0;/);
assert.match(css, /#reportOutput \.hours-detail-scroll \.hours-report-table\s*\{/);
const dateGroup = html.match(/<div class="report-date-fields"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
assert(dateGroup.indexOf('id="reportFromDate"') >= 0 && dateGroup.indexOf('id="reportToDate"') > dateGroup.indexOf('id="reportFromDate"'));
assert.match(css, /\.report-date-fields\s*\{\s*display: grid;/);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate static DOM IDs');
const declarations = [...app.matchAll(/^function\s+(\w+)\s*\(/gm)].map(match => match[1]);
assert.equal(declarations.length, new Set(declarations).size, 'Duplicate function declarations');
let depth = 0;
for (const char of css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '')) {
  if (char === '{') depth++;
  if (char === '}') depth--;
  assert(depth >= 0, 'Unbalanced CSS');
}
assert.equal(depth, 0, 'Unbalanced CSS');
console.log('PASS v0.8.32 calendar-month dates, grouped fields, compact report header, table total, hours selection and structural integrity');
