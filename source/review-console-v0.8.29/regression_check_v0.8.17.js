const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
// Carry the complete nesting regression forward, changing only its release marker.
const nestingTest = fs.readFileSync('regression_check_v0.8.16.js','utf8').replace('v=0\\.8\\.16', 'v=0\\.8\\.17');
new Function('require', nestingTest)(require);
const ctx = vm.createContext({console, document:{addEventListener(){}},window:{},URL,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
const run = code => vm.runInContext(code,ctx);
run(`
 let dirtyCount=0;
 render=closeDetail=setStatus=showToast=()=>{};
 markDirty=()=>dirtyCount++;
 updateWorkingMemoryAutoScroll=clearWorkingMemoryDropTargets=stopWorkingMemoryAutoScroll=()=>{};
 function setup(same=true) {
   const activity={id:'act',text:'Work',createdAt:'2026-07-10T12:00:00Z',workDate:'2026-07-10',status:'open',sourceText:'Source notes',totalHours:2.5,billingType:'regular',action:{subject:'Draft'},activities:[]};
   const parent={id:'parent',text:'Parent',status:'open',totalHours:1,activities:[activity,{id:'sibling',status:'open',activities:[]}]};
   const source={id:'source',status:'open',comments:[parent]};
   const target=same?source:{id:'target',status:'open',comments:[{id:'other',text:'Other',status:'open',activities:[]}]};
   currentPackage={records:same?[source]:[source,target],reviewConsole:{}};
   dirtyCount=0;
   return {activity,parent,source,target,payload:{kind:'activity',sourceRecordId:'source',commentId:'parent',activityId:'act'}};
 }
`);
for(const same of [true,false]) {
 run(`var f=setup(${same}); var beforeActivity=JSON.stringify(f.activity);`);
 assert.equal(run(`moveActivityAsSecondary(f.payload,f.target.id)`),true);
 assert.equal(run(`f.target.comments.includes(f.activity)`),true);
 assert.equal(run(`f.parent.activities.length`),1);
 assert.equal(run(`f.parent.totalHours`),1);
 assert.equal(run(`f.activity.totalHours`),2.5);
 assert.equal(run(`f.activity.createdAt`),'2026-07-10T12:00:00Z');
 assert.equal(run(`f.activity.workDate`),'2026-07-10');
 assert.equal(run(`f.activity.sourceText`),'Source notes');
 assert.equal(run(`f.activity.action.subject`),'Draft');
 assert.equal(run(`dirtyCount`),1);
 // Save/export normalization keeps it at the secondary level, with no copy left below.
 assert.equal(run(`normalizeComment(JSON.parse(JSON.stringify(f.activity))).workDate`),'2026-07-10');
 // Reverse once more to exercise the requested round trip.
 assert.equal(run(`moveSecondaryAsActivity(f.target.id,'act','source','parent')`),true);
 assert.equal(run(`f.parent.activities.filter(a=>a.id==='act').length`),1);
 assert.equal(run(`f.target.comments.some(a=>a.id==='act')`),false);
}
for(const change of [`f.source.status='closed'`,`f.parent.status='closed'`,`f.activity.status='closed'`,`f.target.status='closed'`,`f.activity.deliverable={apply:true,date:'2026-11-20'}`,`f.payload.activityId='missing'`]) {
 run(`f=setup(false); ${change}; var snapshot=JSON.stringify(currentPackage);`);
 assert.equal(run(`moveActivityAsSecondary(f.payload,'target')`),false,change);
 assert.equal(run(`JSON.stringify(currentPackage)===snapshot`),true);
}
run(`
 f=setup();
 var primary={dataset:{recordId:'source'},classList:{add(){}},getBoundingClientRect:()=>({top:100,height:100})};
 var secondary={dataset:{recordId:'source',commentId:'parent'},classList:{add(){}},getBoundingClientRect:()=>({top:100,height:100})};
 var hit='primary';
 var event={clientY:150,target:{closest:s=>s==='.record-line'&&hit==='primary'?primary:s==='.secondary-record-line'&&hit==='secondary'?secondary:null},preventDefault(){},dataTransfer:{}};
 workingMemoryDragPayload=f.payload;
 handleWorkingMemoryDragOver(event);
`);
assert.equal(run(`workingMemoryDropIntent.action`),'promote-activity');
run(`handleWorkingMemoryDrop(event)`);
assert.equal(run(`f.source.comments.includes(f.activity)`),true);
for(const [y,expected] of [[110,'before'],[190,'after']]) {
 run(`f=setup(); workingMemoryDragPayload=f.payload; hit='secondary'; event.clientY=${y}; handleWorkingMemoryDragOver(event);`);
 assert.equal(run(`workingMemoryDropIntent.position`),expected);
 run(`handleWorkingMemoryDrop(event)`);
 assert.equal(run(`f.source.comments.indexOf(f.activity)`),expected==='before'?0:1);
}
run(`f=setup(); workingMemoryDragPayload=f.payload; event.clientY=150; handleWorkingMemoryDragOver(event);`);
assert.equal(run(`workingMemoryDropIntent`),null,'center of a secondary is not a promotion target');
run(`f=setup(); f.activity.billingType='expense'; f.activity.expenseAmount=45; f.activity.expenseCurrency='USD'; moveActivityAsSecondary(f.payload,'source');`);
assert.equal(run(`f.source.comments[1].expenseAmount`),45);
assert.equal(run(`f.source.comments[1].expenseCurrency`),'USD');
assert.match(fs.readFileSync('index.html','utf8'),/app\.js\?v=0\.8\.17/);
console.log('PASS activity-to-secondary same/cross-primary moves, nesting round trips, field preservation, locks, primary targets and secondary insertion edges');
