const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
// Carry previous clipboard/movement suites forward with only their HTML
// release-marker expectation virtualized; the actual app code is unchanged.
const previousFs={...fs,readFileSync(path,...args){
  const value=fs.readFileSync(path,...args);
  return path==='index.html' ? value.replaceAll('0.8.19','0.8.18') : value;
}};
new Function('require',fs.readFileSync('regression_check_v0.8.18.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
function element(extra={}){return {hidden:true,value:'',textContent:'',dataset:{recordId:'p'},attrs:{},focus(){this.focused=true;},setSelectionRange(){},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},...extra};}
const nodes={primaryTitleEditor:element(),primaryTitleInput:element(),editPrimaryTitleButton:element(),primaryTitleError:element(),commentEditor:element({value:'Unsaved secondary draft'})};
const display=element(),updated=element();
const ctx=vm.createContext({console,document:{addEventListener(){},getElementById:id=>nodes[id]},window:{},URL,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
const run=code=>vm.runInContext(code,ctx);
ctx.testDisplay=display;ctx.testUpdated=updated;
run(`
 let dirtyCount=0,rowRenders=0,savedSnapshot='',notices=[];
 els.detailContent={querySelector:selector=>selector==='.primary-record-description'?testDisplay:testUpdated};
 renderRecords=()=>rowRenders++;
 renderDetail=()=>{throw new Error('Must not rebuild detail or discard the secondary draft');};
 markDirty=()=>dirtyCount++;
 showToast=text=>notices.push(text);
 waitForAutoSaveIdle=()=>Promise.resolve();
 forceAutoSaveNow=async()=>{savedSnapshot=JSON.stringify(currentPackage);return true;};
 function setupTitle(){
  currentPackage={records:[{id:'p',description:'Original title',status:'open',createdAt:'2026-07-10T12:00:00Z',updatedAt:'2026-07-11T12:00:00Z',sourceDate:'2026-07-10',sourceText:'Source notes',comments:[{id:'s',text:'Secondary',workDate:'2026-07-10',totalHours:2.5,activities:[{id:'a',text:'Activity',expenseAmount:45,expenseCurrency:'USD'}]}]}]};
  selectedRecordId='p';selectedCommentId=null;
  dirtyCount=0;rowRenders=0;notices=[];
 }
`);
function reset(){run('setupTitle()');nodes.primaryTitleInput.dataset.recordId='p';nodes.primaryTitleInput.value='Original title';}
async function main(){
 reset();
 run('setPrimaryTitleEditing(true)');
 assert.equal(nodes.primaryTitleEditor.hidden,false);
 assert.equal(nodes.editPrimaryTitleButton.attrs['aria-expanded'],'true');
 nodes.primaryTitleInput.value='Cancelled title';
 run('setPrimaryTitleEditing(false)');
 assert.equal(run('getSelectedRecord().description'),'Original title');
 assert.equal(nodes.primaryTitleInput.value,'Original title');
 assert.equal(run('dirtyCount'),0);
 nodes.primaryTitleInput.value='   ';
 assert.equal(await run('savePrimaryTitle()'),false);
 assert.equal(nodes.primaryTitleError.hidden,false);
 assert.equal(nodes.primaryTitleInput.attrs['aria-invalid'],'true');
 assert.equal(run('dirtyCount'),0);
 reset();
 const before=JSON.parse(run('JSON.stringify(getSelectedRecord())'));
 nodes.primaryTitleInput.value='  New primary title  ';
 assert.equal(await run('savePrimaryTitle()'),true);
 const after=JSON.parse(run('JSON.stringify(getSelectedRecord())'));
 assert.equal(after.description,'New primary title');
 assert.notEqual(after.updatedAt,before.updatedAt);
 delete before.description;delete before.updatedAt;
 const rest={...after};delete rest.description;delete rest.updatedAt;
 assert.deepEqual(rest,before,'Only title and updated stamp may change');
 assert.equal(run('dirtyCount'),1);
 assert.equal(run('rowRenders'),1);
 assert.equal(display.textContent,'New primary title');
 assert.equal(nodes.commentEditor.value,'Unsaved secondary draft');
 assert.equal(nodes.primaryTitleEditor.hidden,true);
 assert.equal(JSON.parse(run('savedSnapshot')).records[0].description,'New primary title');
 assert.match(run('formatPrimaryRecordForClipboard(getSelectedRecord())'),/^Primary Record: New primary title/);
 assert.equal(await run('savePrimaryTitle()'),true);
 assert.equal(run('dirtyCount'),1,'Unchanged title is a no-op');
 reset();run("getSelectedRecord().status='closed'");nodes.primaryTitleInput.value='Blocked';
 assert.equal(await run('savePrimaryTitle()'),false);
 assert.equal(run('getSelectedRecord().description'),'Original title');
 assert.equal(run('dirtyCount'),0);
 reset();nodes.primaryTitleInput.dataset.recordId='other';nodes.primaryTitleInput.value='Stale';
 assert.equal(await run('savePrimaryTitle()'),false);
 assert.equal(run('dirtyCount'),0);
 reset();run('setPrimaryTitleEditing(true)');nodes.primaryTitleInput.value='Escape cancel';
 ctx.keyEvent={target:{id:'primaryTitleInput'},key:'Escape',preventDefault(){}};
 run('handleDetailKeydown(keyEvent)');
 assert.equal(nodes.primaryTitleEditor.hidden,true);
 assert.equal(run('getSelectedRecord().description'),'Original title');
 reset();nodes.primaryTitleInput.value='Retained if storage fails';run("forceAutoSaveNow=async()=>{throw Error('storage failed')}");
 assert.equal(await run('savePrimaryTitle()'),false);
 assert.equal(run('getSelectedRecord().description'),'Retained if storage fails');
 assert.match(run('notices.at(-1)'),/could not save/);
 const app=fs.readFileSync('app.js','utf8');
 assert.match(app,/primaryLocked \? "" : '<button id="editPrimaryTitleButton"/);
 assert.match(app,/data-action="save-primary-title"/);
 assert.match(app,/data-action="cancel-primary-title"/);
 assert.match(fs.readFileSync('styles.css','utf8'),/\.primary-title-editor\[hidden\]\s*\{\s*display: none/);
 assert.match(fs.readFileSync('index.html','utf8'),/app\.js\?v=0\.8\.19/);
 console.log('PASS in-detail primary title Save/Cancel/Escape, validation, locks, stale-editor guard, metadata/child/draft preservation and device-save failure');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
