const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.SITESCRIBE_PLAYWRIGHT_MODULE || 'playwright');

const root = __dirname;
const proofDir = path.resolve(root, '../../work/hours-v0.8.31');
const server = http.createServer((request, response) => {
  const file = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  try {
    response.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    response.end(fs.readFileSync(file));
  } catch {
    response.writeHead(404).end();
  }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.SITESCRIBE_CHROMIUM || undefined });
  try {
    for (const width of [390, 1366]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 640, hasTouch: width < 640 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
      await page.goto(base + '/index.html');
      await page.waitForFunction(() => window.SiteScribeReportPdf);
      await page.evaluate(() => {
        currentPackage = createEmptyPackage();
        currentPackage.site = 'Synthetic hours layout test';
        currentPackage.records = [normalizeRecord({ id: 'p', description: 'Synthetic primary record', category: 'event', status: 'open', createdAt: '2026-11-18T12:00:00Z', comments: [
          { id: 'parent-zero', text: 'BILLING', status: 'open', workDate: '2026-11-18', totalHours: 0, activities: [
            { id: 'positive-activity', text: 'Day 1 - Travel to site, obtain access pass, review safety protocols, and meet the crew before moving equipment', status: 'open', workDate: '2026-11-18', startTime: '08:30', endTime: '18:00', totalHours: 9.5 },
            { id: 'zero-activity', text: 'Zero-hour activity excluded from billing', status: 'open', workDate: '2026-11-18', totalHours: 0 }
          ] },
          { id: 'positive-secondary', text: 'Positive secondary entry', status: 'open', workDate: '2026-11-18', totalHours: 2 },
          { id: 'zero-secondary', text: 'Zero-hour secondary excluded from billing', status: 'open', workDate: '2026-11-18', totalHours: 0 }
        ] })];
        reportSelectionInitialized = false;
        els.reportType.value = 'hours';
        els.reportFromDate.value = '2026-01-01';
        els.reportToDate.value = '2026-12-31';
        els.reportsPanel.classList.add('open');
        generateReport();
      });
      const table = page.locator('.hours-report-table');
      assert.equal(await table.count(), 1);
      assert.equal(await table.locator('thead th').count(), 9);
      assert.equal(await table.locator('tbody tr').count(), 2);
      assert.equal(await page.locator('#hoursRecordSelectionList .hoursRecordChoice').count(), 2);
      assert.equal(await page.evaluate(() => reportChildRows(currentPackage.records[0], { ...getReportFilters(), type: 'mds' }).length), 5);
      assert.match(await page.locator('#reportOutput').innerText(), /Total Hours: 11\.5/);
      assert.doesNotMatch(await page.locator('#reportOutput').innerText(), /Zero-hour/);
      const geometry = await table.evaluate(element => {
        const header = element.tHead.rows[0].cells;
        const activity = [...element.tBodies[0].rows].find(row => row.cells[4].querySelector('.report-activity-title'));
        const cell = activity.cells[4];
        const range = document.createRange();
        range.selectNodeContents(cell.querySelector('.report-activity-title'));
        const scroll = element.closest('.hours-detail-scroll');
        return {
          widths: [...header].map(item => item.getBoundingClientRect().width),
          textRight: range.getBoundingClientRect().right,
          cellRight: cell.getBoundingClientRect().right,
          scrollWidth: scroll.scrollWidth,
          clientWidth: scroll.clientWidth
        };
      });
      assert(geometry.widths.every(value => value >= 65), JSON.stringify(geometry));
      assert(geometry.textRight <= geometry.cellRight + 1, JSON.stringify(geometry));
      if (width < 640) assert(geometry.scrollWidth > geometry.clientWidth);
      const payload = await page.evaluate(async () => {
        let captured = null;
        window.SiteScribeHoursExcel.exportWorkbook = async value => { captured = value; return { rowCount: value.rows.length }; };
        await exportHoursReportExcel();
        return captured;
      });
      assert.equal(payload.rows.length, 2);
      assert.deepEqual(payload.rows.map(row => row.hours).sort((a, b) => a - b), [2, 9.5]);
      fs.mkdirSync(proofDir, { recursive: true });
      await page.locator('.hours-detail-section').screenshot({ path: path.join(proofDir, `hours-${width}.png`) });
      if (width === 1366) {
        await page.emulateMedia({ media: 'print' });
        await page.evaluate(() => prepareVisibleReportPrintClone());
        const printGeometry = await page.locator('#printReportRoot .hours-report-table').evaluate(element => {
          const row = [...element.tBodies[0].rows].find(item => item.cells[4].querySelector('.report-activity-title'));
          const cell = row.cells[4];
          const range = document.createRange(); range.selectNodeContents(cell.querySelector('.report-activity-title'));
          return { textRight: range.getBoundingClientRect().right, cellRight: cell.getBoundingClientRect().right };
        });
        assert(printGeometry.textRight <= printGeometry.cellRight + 1, JSON.stringify(printGeometry));
        await page.emulateMedia({ media: 'screen' });
        await page.evaluate(() => cleanupVisibleReportPrintClone());
      }
      await page.evaluate(() => {
        currentPackage.records[0].comments.forEach(comment => {
          comment.totalHours = 0;
          comment.activities?.forEach(activity => { activity.totalHours = 0; activity.startTime = ''; activity.endTime = ''; });
        });
        reportSelectionInitialized = false;
        generateReport();
      });
      assert.equal(await page.locator('.hours-report-table').count(), 0);
      assert.equal(await page.locator('#hoursRecordSelectionList .hoursRecordChoice').count(), 0);
      assert.match(await page.locator('#hoursRecordSelectionList').innerText(), /No entries with more than 0 hours/);
      assert.match(await page.locator('#reportOutput').innerText(), /No positive-hour secondary or activity entries/);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS Hours Report layout, positive-hour selection and Excel at ${width}px`);
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
