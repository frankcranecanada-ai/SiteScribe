const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
// Run the preceding movement suites against this candidate, updating only
// their historical HTML-cache-marker expectations in memory.
const movementSuite = fs.readFileSync('regression_check_v0.8.17.js','utf8')
  .replaceAll('v=0\\\\.8\\\\.17','v=0\\\\.8\\\\.18')
  .replaceAll('v=0\\.8\\.17','v=0\\.8\\.18');
new Function('require',movementSuite)(require);
const ctx = vm.createContext({console,document:{addEventListener(){}},window:{},URL,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
const run=code=>vm.runInContext(code,ctx);
run(String.raw`
 var record={id:'p',description:'Primary',status:'open',sourceDate:'2026-07-10',sourceText:'Original',flags:[{type:'review',status:'open',text:'Flag'}],comments:[
  {id:'s1',text:'Secondary one\ncontinued',status:'open',activities:[
   {id:'a1',text:'Activity one\ncontinued activity',status:'open',workDate:'2026-07-10',startTime:'08:00',endTime:'09:00',totalHours:1,billingType:'regular',sourceText:'Activity source\ncontinued source',activities:[{text:'INVALID FOURTH'}]},
   {id:'a2',text:'Activity two',status:'closed',closedAt:'2026-07-11T12:00:00Z',totalHours:0,deliverable:{apply:true,date:'2026-07-12'},activities:[]}
  ]},
  {id:'s2',text:'Secondary two',status:'closed',activities:[{id:'a3',text:'Expense activity',status:'open',billingType:'expense',expenseAmount:45,expenseCurrency:'USD',expenseType:'travel',activities:[]}]}
 ]};
 var before=JSON.stringify(record);
 var output=formatPrimaryRecordForClipboard(record);
`);
const output=run('output');
assert.match(output,/Primary Record: Primary/);
assert.match(output,/Record Flags:\n- REVIEW \(open\): Flag/);
assert.match(output,/1\. Secondary one\n   continued/);
assert.match(output,/   Activity Records \(2\):\n      1\.1\. Activity one\n         continued activity/);
assert.match(output,/         Status: closed/);
assert.match(output,/      1\.2\. Activity two/);
assert.match(output,/      2\.1\. Expense activity/);
assert.match(output,/         Work Date: .*Start Time: 08:00 \| End Time: 09:00 \| Total Hrs: 1/);
assert.match(output,/         Total Hrs: 0/);
assert.match(output,/         Expense: 45 USD/);
assert.match(output,/         Deliverable: 2026-07-12/);
assert.match(output,/         Source: Activity source\n         continued source/);
assert.doesNotMatch(output,/INVALID FOURTH/);
assert.equal(run('JSON.stringify(record)===before'),true,'Copy must not mutate records');
assert.equal(output.split('1.1. Activity one').length-1,1);
assert.equal(run(String.raw`formatPrimaryRecordForClipboard({...record,comments:[]}).includes('Secondary Records (0):\n- none')`),true);
assert.equal(run(`formatPrimaryRecordForClipboard({...record,comments:[{text:'Legacy secondary',status:'open'}]}).includes('Activity Records')`),false);
// Exercise the actual clipboard handler path with a mocked browser clipboard.
ctx.navigator={clipboard:{writeText(text){ctx.copiedText=text;return Promise.resolve();}}};
run('showToast=()=>{}; copyText(formatPrimaryRecordForClipboard(record));');
assert.equal(ctx.copiedText,output);
assert.match(fs.readFileSync('index.html','utf8'),/app\.js\?v=0\.8\.18/);
console.log('PASS indented activity clipboard output, numbering, multiline text, dates/hours/expenses, closed records, legacy data, depth cap and non-mutation');
