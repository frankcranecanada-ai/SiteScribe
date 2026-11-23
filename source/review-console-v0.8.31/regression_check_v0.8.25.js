const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
// v0.8.24's platform-agnostic share expectation is intentionally replaced.
// Carry the unchanged report/record regressions forward from v0.8.23.
const previousFs={...fs,readFileSync(path,...args){const value=fs.readFileSync(path,...args);return path==='index.html'||path==='app.js'?value.replaceAll('0.8.25','0.8.23'):value;}};
new Function('require',fs.readFileSync('regression_check_v0.8.23.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
const clicks=[],shares=[],downloads=[],notices=[];
const element=()=>({hidden:true,children:[],textContent:'',appendChild(n){this.children.push(n);return n;},replaceChildren(){this.children=[];},click(){clicks.push(this.href);}});
const status=element(),nav={};
const ctx=vm.createContext({console,document:{addEventListener(){},getElementById:id=>id==='reportEmailStatus'?status:null,createElement:element,createTextNode:text=>({textContent:text})},navigator:nav,window:{location:{href:''}},URL,File,Blob,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
const run=code=>vm.runInContext(code,ctx);
ctx.download=file=>downloads.push(file);ctx.notice=text=>notices.push(text);
run(`els.emailReportButton={disabled:false};els.reportOutput={textContent:'Selected report',innerHTML:'<p><a href="https://www.dropbox.com/scl/fi/id/file.pdf?rlkey=KEY&amp;dl=0">Shared file</a></p>'};generateReport=()=>{};getReportFilters=()=>({type:'daily'});reportSiteName=()=> 'Test site';downloadReportEmailFile=download;setStatus=showToast=notice;`);
function setup(ua='Windows',platform='Win32',touch=0){clicks.length=shares.length=downloads.length=notices.length=0;status.hidden=true;status.replaceChildren();nav.userAgent=ua;nav.platform=platform;nav.maxTouchPoints=touch;nav.canShare=()=>true;nav.share=async payload=>shares.push(payload);run('els.emailReportButton.disabled=false');}
async function main(){
 for(const [ua,platform,touch] of [['Windows','Win32',0],['Windows','Win32',10],['Macintosh','MacIntel',0]]) {
  setup(ua,platform,touch);await run('emailCurrentReport()');
  assert.equal(shares.length,0,'Desktop must bypass the share sheet even if available');assert.equal(downloads.length,1);assert.equal(clicks.length,1);
  assert.match(clicks[0],/^mailto:\?subject=/);assert.equal(new URL(clicks[0]).searchParams.has('attachment'),false);
  assert.match(new URL(clicks[0]).searchParams.get('body'),/Attach the report file:/);
  assert(status.children.some(n=>n.textContent==='Open email draft'));assert(status.children.some(n=>n.textContent?.includes('Attach this file')));
  assert.equal(run('els.emailReportButton.disabled'),false);
  const html=await downloads[0].text();assert.match(html,/href="https:\/\/www.dropbox.com/);assert.match(html,/rlkey=KEY&amp;dl=0/);
 }
 for(const [ua,platform,touch] of [['iPhone','iPhone',5],['Android','Linux',5],['Macintosh','MacIntel',5]]) {
  setup(ua,platform,touch);await run('emailCurrentReport()');assert.equal(shares.length,1);assert.equal(downloads.length,0);assert.equal(clicks.length,0);
  const link=status.children.find(n=>n.textContent==='Open email draft');assert(link);link.click();assert.equal(clicks.length,1);
 }
 setup('iPhone');nav.canShare=()=>false;await run('emailCurrentReport()');assert.equal(downloads.length,1);assert.equal(clicks.length,0,'Mobile fallback provides a retry link without opening a second app automatically');
 setup('iPhone');nav.share=async()=>{throw Object.assign(Error('cancel'),{name:'AbortError'});};await run('emailCurrentReport()');assert.equal(downloads.length,0);assert.equal(clicks.length,0);assert.match(notices.join(' '),/cancelled/);
 setup('iPhone');nav.share=async()=>{throw Error('unavailable');};await run('emailCurrentReport()');assert.equal(downloads.length,1);assert.equal(clicks.length,0);
 setup();run('downloadReportEmailFile=()=>{throw Error("download failed")}');await run('emailCurrentReport()');assert.equal(clicks.length,0);assert.equal(run('els.emailReportButton.disabled'),false);
 const url='https://www.dropbox.com/scl/fi/a/F.pdf?rlkey=K&dl=0#part';
 const parts=JSON.parse(run(`JSON.stringify(reportLinkParts('See (${url}).'))`));assert.equal(parts.find(p=>p.href).href,url);
 assert.equal(run(`reportLinkParts('javascript:alert(1)').some(p=>p.href)`),false);
 const index=fs.readFileSync('index.html','utf8');assert.equal((index.match(/id="reportEmailStatus"/g)||[]).length,1);assert.match(index,/app\.js\?v=0\.8\.25/);
 console.log('PASS LE-style desktop download/draft/retry link; iPhone/Android/iPad sharing; cancellations, fallback, links and no automatic sends');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
