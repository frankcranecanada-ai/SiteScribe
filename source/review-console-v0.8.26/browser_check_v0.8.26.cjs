// Isolated local-browser QA; all external traffic blocked, no real email/share.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.SITESCRIBE_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=__dirname,out=path.resolve(root,'../../work/tmp/pdfs');fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'text/plain');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.SITESCRIBE_CHROMIUM?{executablePath:process.env.SITESCRIBE_CHROMIUM}:{}),args:['--disable-gpu']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():(external.push(r.request().url()),r.abort()));
  await page.goto(base+'/index.html');await page.waitForFunction(()=>window.SiteScribeReportPdf&&window.pdfMake);
  await page.evaluate(async()=>{
   await initDatabase();currentPackage=createEmptyPackage();currentPackage.site='PDF report verification';
   currentPackage.records=[normalizeRecord({id:'p',description:'Primary project record',category:'event',status:'open',createdAt:'2026-01-01T12:00:00Z',comments:Array.from({length:12},(_,i)=>({id:'s'+i,text:'Secondary '+i+' - Review drawings https://www.dropbox.com/scl/fi/id/Review-Plan.pdf?rlkey=KEY&dl=0',status:'open',workDate:'2026-05-01',totalHours:2,billingType:'regular',activities:[{id:'a'+i,text:'Activity '+i+' - Open drawing https://www.dropbox.com/scl/fi/child/Detail.pdf?rlkey=CHILD&dl=0',status:'open',workDate:'2026-06-01',totalHours:1,billingType:'regular'},{id:'b'+i,text:'Activity '+i+' - Verify installation details and report findings to the team.',status:'open',workDate:'2026-07-01',totalHours:0.5,billingType:'overtime'}]}))})];render();
   window.__downloads=[];window.__drafts=[];window.__shares=[];
   downloadReportEmailFile=file=>window.__downloads.push(file);
   document.addEventListener('click',e=>{const a=e.target.closest('a[href^="mailto:"]');if(a){e.preventDefault();window.__drafts.push(a.href);}},true);
   Object.defineProperty(navigator,'userAgent',{configurable:true,value:'Windows'});
   Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shares.push(data)});
   await openReportsPanel();document.getElementById('reportFromDate').value='2026-01-01';document.getElementById('reportToDate').value='2026-11-20';generateReport();
  });
  assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('reportsPanel')).position),'fixed','App CSS must be loaded for browser layout checks');
  const baseline=await page.evaluate(()=>JSON.stringify(currentPackage.records));
  for(const type of ['daily','hours','mds']){
   await page.selectOption('#reportType',type);await page.evaluate(()=>window.__downloads=[]);await page.click('#emailReportButton');
   await page.waitForFunction(()=>window.__downloads.length===1,{},{timeout:60000});
   const data=await page.evaluate(async()=>({name:__downloads[0].name,type:__downloads[0].type,bytes:Array.from(new Uint8Array(await __downloads[0].arrayBuffer())),definition:SiteScribeReportPdf.buildDefinition(document.getElementById('reportOutput')).pageOrientation}));
   assert.equal(data.type,'application/pdf');assert.equal(Buffer.from(data.bytes).subarray(0,5).toString(),'%PDF-');assert.equal(data.definition,type==='daily'?'portrait':'landscape');fs.writeFileSync(path.join(out,`sitescribe-${type}-qa.pdf`),Buffer.from(data.bytes));console.log(`PASS ${type}: ${data.bytes.length} PDF bytes, ${data.definition}`);
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(currentPackage.records)),baseline);assert.equal(await page.evaluate(()=>__shares.length),0);assert.equal(await page.evaluate(()=>__drafts.length),3);
  await page.evaluate(()=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:'iPhone'});window.__downloads=[];});await page.click('#emailReportButton');await page.waitForFunction(()=>__shares.length===1,{},{timeout:60000});assert.equal(await page.evaluate(()=>__shares[0].files[0].type),'application/pdf');assert.equal(await page.evaluate(()=>__downloads.length),0);
  await page.setViewportSize({width:390,height:844});await page.locator('#reportEmailStatus').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'email-pdf-ui.png')});
  assert.deepEqual(errors,[]);assert(!external.some(url=>url.includes('dropbox.com')));console.log('PASS real PDF generation, desktop/mobile dispatch, records unchanged, no Dropbox-file fetches or print dialog');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
