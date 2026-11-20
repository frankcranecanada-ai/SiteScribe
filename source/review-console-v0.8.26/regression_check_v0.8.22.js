const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const previousFs={...fs,readFileSync(path,...args){const value=fs.readFileSync(path,...args);return path==='index.html'||path==='app.js'?value.replaceAll('0.8.22','0.8.21'):value;}};
new Function('require',fs.readFileSync('regression_check_v0.8.21.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
const classes=new Set();
const ctx=vm.createContext({console,document:{addEventListener(){},documentElement:{classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)}}},window:{},URL,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
const run=code=>vm.runInContext(code,ctx);
const json=code=>JSON.parse(run(`JSON.stringify(${code})`));
run(`
 currentPackage=createEmptyPackage();
 currentPackage.records=[normalizeRecord({id:'p1',description:'Primary one',status:'open',createdAt:'2026-01-01T12:00:00Z',sortOrder:2000,secondarySortMode:'manual',comments:[
  {id:'s1',text:'Secondary one',status:'open',workDate:'2026-07-01',totalHours:2,secondarySortOrder:2000,activities:[{id:'a1',text:'Activity one',status:'open',workDate:'2026-01-10',totalHours:1,activitySortOrder:2000},{id:'a2',text:'Activity two',status:'open',workDate:'2026-06-01',totalHours:3,activitySortOrder:1000}]},
  {id:'s2',text:'Secondary two',status:'open',workDate:'2026-02-01',totalHours:4,secondarySortOrder:1000,activities:[{id:'a3',text:'Activity three',status:'open',workDate:'2026-11-01',totalHours:5}]},
  {id:'closed',text:'Closed secondary',status:'closed',workDate:'2026-08-01',activities:[{id:'blocked',text:'Hidden under closed parent',status:'open',workDate:'2026-01-10',totalHours:99}]}
 ]}),normalizeRecord({id:'p2',description:'Primary two',status:'open',createdAt:'2026-02-01T12:00:00Z',sortOrder:1000,comments:[]})];
 setWorkingMemorySortMode('manual');
 var filters={type:'daily',from:'2026-01-01',to:'2026-12-31',sortOrder:'date_asc',statuses:['open','closed'],categories:[]};
 var before=JSON.stringify(currentPackage);
`);
assert.deepEqual(json('reportSelectorGroups(filters).map(g=>g.record.id)'),['p2','p1']);
assert.deepEqual(json('reportSelectionGroups(filters).map(g=>g.record.id)'),['p1','p2'],'output primary sort must remain chronological');
assert.deepEqual(json("reportSelectorGroups(filters).find(g=>g.record.id==='p1').rows.map(r=>r.comment.id)"),['s2','a3','s1','a2','a1','closed']);
for(const type of ['daily','open','hours','mds']) {
 for(const order of ['default','date_asc','date_desc']) {
  run(`filters.type='${type}';filters.sortOrder='${order}';`);
  assert.deepEqual(json('reportSelectionKeys(reportSelectorGroups(filters)).sort()'),json('reportSelectionKeys(reportSelectionGroups(filters)).sort()'),'picker must keep exactly the eligible keys');
 }
}
run(`filters.type='hours';filters.sortOrder='date_asc';filters.from='2026-01-10';filters.to='2026-01-10';var group=reportSelectorGroups(filters)[0];var branches=reportSelectorBranches(group);`);
assert.equal(run('branches.length'),1);
assert.equal(run('branches[0].parent.id'),'s1');
assert.equal(run('branches[0].secondaryRow'),null);
assert.deepEqual(json('branches[0].activities.map(r=>r.comment.id)'),['a1']);
const context=run('renderReportSelectionBranch(branches[0],filters)');
assert.match(context,/Secondary one/);
assert.match(context,/Parent context only/);
assert.equal((context.match(/class="hoursRecordChoice"/g)||[]).length,1,'context parent is not an eligible selectable row');
assert.doesNotMatch(context,/Hidden under closed parent/);
run(`filters.from='2026-01-01';filters.to='2026-12-31'; reportSelectionInitialized=false;`);
assert.equal(run('collectHoursReportRows([],filters).reduce((sum,r)=>sum+(r.hours||0),0)'),15);
run(`reportSelectionInitialized=true;reportSelectedKeys=new Set(['p1::s1::a1']);`);
assert.deepEqual(json('collectHoursReportRows([],filters).map(r=>r.comment.id)'),['a1']);
assert.equal(run('JSON.stringify(currentPackage)===before'),true,'picker cannot mutate data or direct totals');
// Check renderer class only marks B05 secondaries that actually own children.
assert.match(run("renderInlineSecondaryRecord(currentPackage.records[0],currentPackage.records[0].comments[0])"),/secondary-record-line has-activity-records/);
assert.doesNotMatch(run("renderInlineSecondaryRecord(currentPackage.records[1],{id:'leaf',text:'No children',status:'open',activities:[]})"),/has-activity-records/);
assert.doesNotMatch(run("renderInlineActivityRecord(currentPackage.records[0],currentPackage.records[0].comments[0],currentPackage.records[0].comments[0].activities[0])"),/has-activity-records/);
run(`els.reportsPanel={classList:{add(){},remove(){}},setAttribute(){}};ensureReportDateDefaults=setCustomAiReportPrototypeVisibility=generateReport=()=>{};openReportsPanel();`);
assert.equal(classes.has('reports-panel-open'),true);
run('closeReportsPanel()');
assert.equal(classes.has('reports-panel-open'),false);
const css=fs.readFileSync('styles.css','utf8');
assert.match(css,/#siteWalkB05 \.secondary-record-line\.has-activity-records \.record-title-text\s*\{\s*font-weight: 600/);
assert.match(css,/html\.reports-panel-open body \{ overflow: hidden/);
assert.match(css,/\.reports-card \{ min-height: 0; max-height: none; max-width: 100%; overflow: visible/);
assert.match(fs.readFileSync('index.html','utf8'),/app\.js\?v=0\.8\.22/);
console.log('PASS B05-order report picker hierarchy, contextual parents, unchanged eligibility/output totals, report scroll lock and child-owning secondary emphasis');
