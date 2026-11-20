const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync('app.js', 'utf8');
const ctx = vm.createContext({ console, document: {addEventListener() {}}, window: {}, URL, setTimeout, clearTimeout });
vm.runInContext(app, ctx);
vm.runInContext(`
  let notices = [], dirtyCount = 0;
  showToast = text => notices.push(text);
  setStatus = () => {};
  markDirty = () => dirtyCount++;
  render = closeDetail = () => {};
  updateWorkingMemoryAutoScroll = clearWorkingMemoryDropTargets = stopWorkingMemoryAutoScroll = () => {};
  function setupMove(sameParent = false) {
    const leaf = {id:'leaf', text:'Work', status:'open', sourceText:'Original notes', createdAt:'2026-07-10T12:00:00Z', workDate:'2026-07-10', totalHours:2.5, billingType:'regular', action:{subject:'Draft'}, activities:[]};
    const parent = {id:'parent',text:'Destination',status:'open',totalHours:1, activities:[{id:'existing',text:'Earlier',activities:[]}]};
    const source = {id:'source',status:'open',comments: sameParent ? [leaf,parent] : [leaf]};
    const target = sameParent ? source : {id:'target',status:'open',comments:[parent]};
    currentPackage = {records: sameParent ? [source] : [source,target],reviewConsole:{}};
    notices=[]; dirtyCount=0;
    return {leaf,parent,source,target};
  }
`, ctx);
function run(s) { return vm.runInContext(s, ctx); }
for (const same of [false, true]) {
  run(`var fixture = setupMove(${same}); var snapshot = JSON.stringify(fixture.leaf);`);
  assert.equal(run(`moveSecondaryAsActivity('source','leaf',fixture.target.id,'parent')`), true);
  assert.equal(run(`fixture.parent.activities[1] === fixture.leaf`), true);
  assert.equal(run(`fixture.source.comments.includes(fixture.leaf)`), false);
  assert.equal(run(`fixture.parent.totalHours`), 1);
  assert.equal(run(`fixture.leaf.totalHours`), 2.5);
  assert.equal(run(`fixture.leaf.workDate`), '2026-07-10');
  assert.equal(run(`fixture.leaf.createdAt`), '2026-07-10T12:00:00Z');
  assert.equal(run(`fixture.leaf.sourceText`), 'Original notes');
  assert.equal(run(`fixture.leaf.action.subject`), 'Draft');
  assert.equal(run(`dirtyCount`), 1);
  assert.equal(run(`isCommentActivityCollapsed('parent')`), false);
}
for (const mutation of [
  `fixture.leaf.activities.push({id:'child',activities:[]})`,
  `fixture.source.status='closed'`, `fixture.target.status='closed'`,
  `fixture.parent.status='closed'`, `fixture.leaf.status='closed'`,
  `fixture.leaf.deliverable={apply:true,date:'2026-11-20'}`
]) {
  run(`fixture=setupMove(); ${mutation}; var before=JSON.stringify(currentPackage);`);
  assert.equal(run(`moveSecondaryAsActivity('source','leaf','target','parent')`), false, mutation);
  assert.equal(run(`JSON.stringify(currentPackage) === before`), true, 'blocked move must not mutate data');
}
run(`fixture=setupMove();`);
assert.equal(run(`moveSecondaryAsActivity('source','leaf','source','leaf')`), false);
// Exercise actual dragover and drop routing, including the top/bottom reorder zones.
run(`
  var row = {dataset:{recordId:'target',commentId:'parent'}, getBoundingClientRect:()=>({top:100,height:100}), classList:{add(){}}};
  var event = {clientY:150,clientX:100, target:{closest:s=>s==='.secondary-record-line'?row:null}, preventDefault(){}, dataTransfer:{}};
  isPromoteSecondaryDrop = () => false;
  workingMemoryDragPayload={kind:'comment',sourceRecordId:'source',commentId:'leaf'};
  handleWorkingMemoryDragOver(event);
`);
assert.equal(run(`workingMemoryDropIntent.action`), 'move-comment-as-activity');
run(`handleWorkingMemoryDrop(event)`);
assert.equal(run(`fixture.parent.activities.some(a=>a.id==='leaf')`), true);
for (const y of [110,190]) {
  run(`fixture=setupMove(); workingMemoryDragPayload={kind:'comment',sourceRecordId:'source',commentId:'leaf'}; event.clientY=${y}; handleWorkingMemoryDragOver(event);`);
  assert.equal(run(`workingMemoryDropIntent.action`), 'move-comment-at');
  assert.equal(run(`workingMemoryDropIntent.position`), y===110?'before':'after');
}
run(`fixture=setupMove(); fixture.leaf.activities=[{id:'child',activities:[]}]; var protectedSnapshot=JSON.stringify(currentPackage); event.clientY=150; handleWorkingMemoryDragOver(event); handleWorkingMemoryDrop(event);`);
assert.equal(run(`JSON.stringify(currentPackage)===protectedSnapshot`), true);
assert.equal(run(`notices.some(text=>text.includes('fourth level'))`), true);
run(`fixture=setupMove(); fixture.leaf.billingType='expense'; fixture.leaf.expenseAmount=45; fixture.leaf.expenseCurrency='USD'; fixture.leaf.expenseType='travel'; moveSecondaryAsActivity('source','leaf','target','parent');`);
assert.equal(run(`fixture.parent.activities[1].expenseAmount`), 45);
assert.equal(run(`fixture.parent.activities[1].expenseCurrency`), 'USD');
assert.match(fs.readFileSync('styles.css','utf8'), /\.secondary-record-line\.drop-target/);
assert.match(fs.readFileSync('index.html','utf8'), /app\.js\?v=0\.8\.16/);
assert.doesNotMatch(fs.readFileSync('index.html','utf8'), /class="footer-actions"/);
console.log('PASS secondary-to-activity moves (same/cross primary), metadata preservation, locked/fourth-level guards, center-drop and edge reorder routing');
