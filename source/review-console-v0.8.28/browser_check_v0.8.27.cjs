const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.SITESCRIBE_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=__dirname,out=path.resolve(root,'../../work');
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{let data=fs.readFileSync(file);if(file.endsWith('dropbox-sync-proof.js'))data=data.toString().replace('  function renderDropboxFiles(items) {','  window.__qaRenderDropboxFiles = renderDropboxFiles;\n  function renderDropboxFiles(items) {');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'text/plain');res.end(data);}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.SITESCRIBE_CHROMIUM?{executablePath:process.env.SITESCRIBE_CHROMIUM}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base+'/index.html');await page.waitForFunction(()=>window.__qaRenderDropboxFiles);
  await page.evaluate(()=>__qaRenderDropboxFiles([{folder:'/saved-sites',entry:{name:'test.json',path_display:'/saved-sites/test.json'},preview:{state:'sitescribe',title:'Test site',contentUpdatedAt:'2026-11-20T12:00:00Z'}},{folder:'/saved-sites',entry:{name:'other.json',path_display:'/saved-sites/other.json'},preview:{state:'unrecognized',detail:'Not a site file'}}]));
  await page.evaluate(()=>{const panel=document.getElementById('siteWalkB01');if(panel.querySelector('.site-walk-header').getAttribute('aria-expanded')==='false')panel.querySelector('.site-walk-header').click();});
  assert.equal(await page.locator('.dropbox-helper-text').count(),0);
  for(const id of ['connectDropboxButton','listDropboxFilesButton','updateDropboxSiteFileButton','saveNewDropboxBackupCopyButton']){
   await page.locator('#'+id).hover();await page.waitForTimeout(600);
   const help=await page.locator('#'+id).evaluate(el=>({id:el.id,hover:el.matches(':hover'),content:getComputedStyle(el,'::after').content,opacity:getComputedStyle(el,'::after').opacity}));console.log(JSON.stringify(help));assert(help.content.length>10);assert.equal(help.opacity,'1');
  }
  for(const button of await page.locator('[data-dropbox-import-path],[data-dropbox-delete-path]').all())assert((await button.getAttribute('title')).length>20);
  for(const width of [1200,390]){
   await page.setViewportSize({width,height:900});
   const recovered=await page.evaluate(()=>{const panel=document.getElementById('dropboxSyncPanel'),after=panel.getBoundingClientRect().height;const p=document.createElement('p');p.className='dropbox-helper-text';p.textContent='LIST views Dropbox SiteScribe JSON files. IMPORT brings one selected file into SiteScribe using Create New / Append / Cancel. DELETE removes only the selected Dropbox file after confirmation. UPDATE replaces the stable Dropbox site file after confirmation. SAVE NEW BACKUP COPY creates a dated restore-point copy in /saved-sites.';panel.insertBefore(p,panel.querySelector('.dropbox-sync-actions'));const before=panel.getBoundingClientRect().height;p.remove();return before-after;});assert(recovered>20);console.log(`PASS ${width}px: removed paragraph recovers ${Math.round(recovered)}px; hover help present`);
  }
  await page.setViewportSize({width:1200,height:900});await page.locator('#listDropboxFilesButton').hover();await page.screenshot({path:path.join(out,'dropbox-help-v0.8.27.png')});
  console.log('PASS top-level hover tooltips and native Import/Delete titles; no live Dropbox operations');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
