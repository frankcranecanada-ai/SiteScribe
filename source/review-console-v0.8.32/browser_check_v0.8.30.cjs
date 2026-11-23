const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.SITESCRIBE_PLAYWRIGHT_MODULE || 'playwright');

const root = __dirname;
const proofDir = path.resolve(root, '../../work/b05-v0.8.30');
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
    for (const width of [390, 1200]) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: width < 640, hasTouch: width < 640 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
      await page.goto(base + '/index.html');
      await page.waitForFunction(() => window.SiteScribeReportPdf);
      await page.evaluate(() => {
        currentPackage = createEmptyPackage();
        currentPackage.records = [normalizeRecord({
          id: 'primary', description: 'Primary test record', status: 'open', comments: [
            { id: 'parent', text: 'Secondary with an activity', status: 'open', activities: [{ id: 'activity', text: 'Child activity', status: 'open' }] },
            { id: 'leaf', text: 'Secondary without activities', status: 'open', activities: [] },
            { id: 'closed-leaf', text: 'Closed secondary without activities', status: 'closed', activities: [] },
            { id: 'closed', text: 'Closed secondary with an activity', status: 'closed', activities: [{ id: 'closed-activity', text: 'Closed child', status: 'closed' }] }
          ]
        }), normalizeRecord({ id: 'closed-primary', description: 'Closed primary record', status: 'closed', comments: [] })];
        currentPackage.reviewConsole.collapsedRecordIds = [];
        currentPackage.reviewConsole.collapsedActivityParentIds = [];
        renderRecords();
      });
      const parent = page.locator('#siteWalkB05 .inline-secondary-list > .secondary-record-line[data-comment-id="parent"]');
      const leaf = page.locator('#siteWalkB05 .inline-secondary-list > .secondary-record-line[data-comment-id="leaf"]');
      const activity = page.locator('#siteWalkB05 .activity-record-line[data-activity-id="activity"]');
      const closed = page.locator('#siteWalkB05 .inline-secondary-list > .secondary-record-line[data-comment-id="closed"]');
      const closedLeaf = page.locator('#siteWalkB05 .inline-secondary-list > .secondary-record-line[data-comment-id="closed-leaf"]');
      const closedActivity = page.locator('#siteWalkB05 .activity-record-line[data-activity-id="closed-activity"]');
      const closedPrimary = page.locator('#siteWalkB05 .record-line[data-record-id="closed-primary"]');
      const color = locator => locator.evaluate(element => getComputedStyle(element).backgroundColor);
      assert.equal(await parent.count(), 1);
      assert.equal(await parent.getAttribute('class').then(value => value.includes('has-activity-records')), true);
      assert.equal(await color(parent), 'rgb(234, 242, 251)');
      assert.equal(await color(leaf), 'rgb(248, 251, 255)');
      assert.equal(await color(activity), 'rgb(248, 251, 255)');
      assert.equal(await color(closed), 'rgb(255, 226, 170)');
      assert.equal(await color(closedLeaf), 'rgb(255, 237, 200)');
      assert.equal(await color(closedActivity), 'rgb(255, 237, 200)');
      assert.equal(await color(closedPrimary), 'rgb(255, 237, 200)');
      if (width < 640) assert.equal(await closedPrimary.evaluate(element => getComputedStyle(element.querySelector('.primary-mobile-tail'), '::before').backgroundColor), 'rgb(255, 237, 200)');
      fs.mkdirSync(proofDir, { recursive: true });
      await page.locator('#siteWalkB05').screenshot({ path: path.join(proofDir, `b05-${width}.png`) });
      await parent.hover();
      assert.equal(await color(parent), 'rgb(224, 236, 249)');
      await page.mouse.move(0, 0);
      await page.evaluate(() => {
        currentPackage.records[0].comments[0].activities = [];
        renderRecords();
      });
      assert.equal(await color(parent), 'rgb(248, 251, 255)');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS B05 closed amber and open parent shading at ${width}px`);
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
