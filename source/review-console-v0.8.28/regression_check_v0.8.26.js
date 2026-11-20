const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const previousFs={...fs,readFileSync(path,...args){const value=fs.readFileSync(path,...args);return path==='index.html'||path==='app.js'?value.replaceAll('0.8.26','0.8.23'):value;}};
new Function('require',fs.readFileSync('regression_check_v0.8.23.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
const pdf=require('./sitescribe-report-pdf.js');
assert.equal(pdf.safeLink('https://www.dropbox.com/scl/fi/id/f.pdf?rlkey=KEY&dl=0'),'https://www.dropbox.com/scl/fi/id/f.pdf?rlkey=KEY&dl=0');
for(const url of ['javascript:alert(1)','file:///C:/secret','https://user:pass@example.com/f'])assert.equal(pdf.safeLink(url),'');
const clicks=[],shares=[],downloads=[],notices=[];
const element=()=>({hidden:true,children:[],textContent:'',appendChild(n){this.children.push(n);return n;},replaceChildren(){this.children=[];},click(){clicks.push(this.href);}});
const status=element(),nav={};let generated=0;
const engine={createBlob:async()=>{generated++;return new Blob(['%PDF-1.7\nPDF fixture'],{type:'application/pdf'});}};
const ctx=vm.createContext({console,document:{addEventListener(){},getElementById:id=>id==='reportEmailStatus'?status:null,createElement:element,createTextNode:text=>({textContent:text})},navigator:nav,window:{location:{href:''},SiteScribeReportPdf:engine,print(){throw Error('Print must not be called');}},URL,File,Blob,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);const run=code=>vm.runInContext(code,ctx);
ctx.download=file=>downloads.push(file);ctx.notice=text=>notices.push(text);
run(`els.emailReportButton={disabled:false,textContent:'Email PDF'};els.reportOutput={textContent:'Report',innerHTML:'<p>Report</p>'};generateReport=()=>{};getReportFilters=()=>({type:'daily'});reportSiteName=()=> 'Test site';downloadReportEmailFile=download;setStatus=showToast=notice;`);
function setup(mobile=false){clicks.length=shares.length=downloads.length=notices.length=0;status.hidden=true;status.replaceChildren();nav.userAgent=mobile?'iPhone':'Windows';nav.canShare=()=>true;nav.share=async data=>shares.push(data);}
async function main(){
 setup();await run('emailCurrentReport()');assert.equal(downloads.length,1);assert.equal(shares.length,0);assert.equal(clicks.length,1);assert.match(downloads[0].name,/\.pdf$/);assert.equal(downloads[0].type,'application/pdf');assert.match(await downloads[0].text(),/^%PDF-/);assert.match(new URL(clicks[0]).searchParams.get('body'),/PDF report/);assert(status.children.some(n=>n.textContent==='Open email draft'));assert.equal(run('els.emailReportButton.textContent'),'Email PDF');
 setup(true);await run('emailCurrentReport()');assert.equal(shares.length,1);assert.equal(shares[0].files[0].type,'application/pdf');assert.equal(downloads.length,0);assert.equal(clicks.length,0);
 setup(true);nav.share=async()=>{throw Object.assign(Error('cancel'),{name:'AbortError'});};await run('emailCurrentReport()');assert.equal(downloads.length,0);assert.equal(clicks.length,0);
 setup(true);nav.canShare=()=>false;await run('emailCurrentReport()');assert.equal(downloads.length,1);assert.equal(clicks.length,0);
 setup();engine.createBlob=async()=>{throw Error('renderer unavailable');};await run('emailCurrentReport()');assert.equal(downloads.length,0);assert.equal(clicks.length,0);assert.match(notices.join(' '),/Could not prepare PDF/);assert.equal(run('els.emailReportButton.disabled'),false);assert.equal(run('els.emailReportButton.textContent'),'Email PDF');
 assert(generated>=4);const html=fs.readFileSync('index.html','utf8');assert.match(html,/>Email PDF<\/button>/);assert.match(html,/app\.js\?v=0\.8\.26/);assert(html.indexOf('pdfmake.min.js')<html.indexOf('vfs_fonts.js'));assert(html.indexOf('vfs_fonts.js')<html.indexOf('sitescribe-report-pdf.js'));assert(html.indexOf('sitescribe-report-pdf.js')<html.indexOf('src="app.js'));
 console.log('PASS direct Email PDF generation, PDF MIME/filename, LE desktop/mobile handoff, cancellation/error recovery and no print dialog');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
