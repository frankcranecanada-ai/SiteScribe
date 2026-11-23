const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.SITESCRIBE_PLAYWRIGHT_MODULE || 'playwright');

const root = __dirname;
const proofDir = path.resolve(root, '../../work/reports-v0.8.32');
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
    fs.mkdirSync(proofDir, { recursive: true });
    for (const width of [320, 390, 1200]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 640, hasTouch: width < 640, timezoneId: 'America/Toronto' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
      await page.goto(base + '/index.html');
      await page.waitForFunction(() => window.SiteScribeReportPdf);
      const expected = await page.evaluate(async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const lastDay = String(new Date(year, now.getMonth() + 1, 0).getDate()).padStart(2, '0');
        const range = { from: `${year}-${month}-01`, to: `${year}-${month}-${lastDay}` };
        currentPackage = createEmptyPackage();
        currentPackage.site = 'Synthetic date and print test';
        currentPackage.records = [normalizeRecord({ id: 'p', description: 'Synthetic primary', category: 'event', status: 'open', createdAt: '2024-01-01T12:00:00Z', comments: [
          { id: 'open', text: 'BILLING', status: 'open', workDate: range.from, totalHours: 0, activities: [
            { id: 'open-activity', text: 'Day 1 - Travel to site, obtain access pass, review safety protocols, and meet the crew before moving equipment', status: 'open', workDate: range.from, totalHours: 2 }
          ] },
          { id: 'closed', text: 'Closed time entry', status: 'closed', workDate: range.from, totalHours: 3 }
        ] })];
        els.reportType.value = 'hours';
        await openReportsPanel();
        return range;
      });
      const from = page.locator('#reportFromDate');
      const to = page.locator('#reportToDate');
      assert.equal(await from.inputValue(), expected.from);
      assert.equal(await to.inputValue(), expected.to);
      assert.equal(await page.locator('.report-date-fields label').count(), 2);
      const group = await page.locator('.report-date-fields').boundingBox();
      const fromBox = await from.boundingBox();
      const toBox = await to.boundingBox();
      assert(fromBox.x >= group.x - 1 && toBox.x + toBox.width <= group.x + group.width + 1);
      if (width <= 360) assert(toBox.y > fromBox.y + fromBox.height);
      else assert(Math.abs(toBox.y - fromBox.y) < 2 && toBox.x > fromBox.x);
      await page.locator('.report-toolbar').screenshot({ path: path.join(proofDir, `toolbar-${width}.png`) });
      await from.fill('2025-01-05');
      await to.fill('2025-02-04');
      await page.evaluate(() => generateReport());
      assert.equal(await from.inputValue(), '2025-01-05');
      assert.equal(await to.inputValue(), '2025-02-04');
      await page.evaluate(async () => { closeReportsPanel(); await openReportsPanel(); });
      assert.equal(await from.inputValue(), expected.from);
      assert.equal(await to.inputValue(), expected.to);
      if (width === 1200) {
        assert.equal(await page.locator('.hours-report-table tbody tr:not(.hours-report-total-row)').count(), 2);
        assert.equal(await page.locator('.hours-report-total-row td').first().innerText(), '5');
        assert.equal(await page.locator('.report-total-section').count(), 0);
        assert.equal(await page.locator('.report-header-item').count(), 5);
        assert.equal(await page.locator('.report-header-item').first().evaluate(item => getComputedStyle(item).borderTopWidth), '0px');
        assert.deepEqual(await page.locator('.hours-report-status').allTextContents(), ['Open', 'Closed']);
        await page.evaluate(() => prepareVisibleReportPrintClone());
        await page.emulateMedia({ media: 'print' });
        const print = await page.locator('#printReportRoot .hours-report-table').evaluate(table => {
          const statuses = [...table.tBodies[0].rows].filter(row => !row.classList.contains('hours-report-total-row')).map(row => row.cells[8]);
          const header = table.tHead.rows[0].cells[8];
          const activityCell = [...table.tBodies[0].rows].find(row => row.cells[4].querySelector('.report-activity-title')).cells[4];
          const range = document.createRange(); range.selectNodeContents(activityCell.querySelector('.report-activity-title'));
          return {
            widths: [...table.tHead.rows[0].cells].map(cell => cell.getBoundingClientRect().width),
            shortStatuses: statuses.map(cell => getComputedStyle(cell, '::after').content),
            heading: getComputedStyle(header, '::after').content,
            legend: getComputedStyle(table.closest('.hours-detail-scroll'), '::after').content,
            activityTextRight: range.getBoundingClientRect().right,
            activityCellRight: activityCell.getBoundingClientRect().right
          };
        });
        assert(print.widths.every(value => value > 18), JSON.stringify(print));
        assert(print.activityTextRight <= print.activityCellRight + 1, JSON.stringify(print));
        assert.deepEqual(print.shortStatuses, ['"O"', '"C"']);
        assert.equal(print.heading, '"St"');
        assert.match(print.legend, /O = Open/);
        await page.locator('#printReportRoot .hours-detail-section').screenshot({ path: path.join(proofDir, 'hours-print.png') });
        await page.pdf({ path: path.join(proofDir, 'hours-print.pdf'), format: 'Letter', printBackground: true });
      }
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS grouped month dates and compact print status at ${width}px`);
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
