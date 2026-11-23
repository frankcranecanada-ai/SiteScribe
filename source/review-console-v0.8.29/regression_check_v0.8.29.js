const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
// Normalize checkout line endings; these UTF-8 source hashes work on Windows
// and in the standalone source ZIP, without requiring an older sibling folder.
const hash=s=>crypto.createHash('sha256').update(String(s).replaceAll('\r\n','\n')).digest('hex');
const app=fs.readFileSync('app.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('styles.css','utf8');
assert.equal(hash(app.replaceAll('0.8.29','0.8.27')),'7752c2339b65084c48df83a69d9a01b5d02ec75e0b6dec6537930bda6ad563fb','App behaviour must remain byte-identical after the version bump');
const unchanged={
 'dropbox-sync-proof.js':'0d182cc45bfd4557e08b5099b48a3055fe70cdcb788c65fce70972bd9725854d',
 'sitescribe-parser-core.js':'2c3d9c223ff63516d31662c2760e47e5c7a8ebcd9cd7dcc98d59e03c5ac28035',
 'sitescribe-add-data.js':'240435084009c80989f88bd36a16e5bfba7d07bca66a88fdfb66349bd140c7ad',
 'sitescribe-hours-excel.js':'cdc552a40c8959d491a1f6d8172ab3c847a311b75e89c9cfee50c11a3ad90507',
 'sitescribe-mds-excel.js':'373f749f58a516e392a085a19001c59dfdf0db86d6e740fd0603de673340e7e2',
 'sitescribe-report-pdf.js':'c0dca812496589776e43bc482bcd131fb37369f8cd7446df08ba9e5e02857b64',
 'pdfmake.min.js':'d69c826c67a1d943a8ef602abdfbe5f15d680f3533aa345b19549fae69828f10',
 'vfs_fonts.js':'1483ed267fe00ad90a3834441b019d856dd41ed079b2614404b2fcef425db6fc',
 'exceljs.min.js':'b039e32bfb7164dadd84a6973b30200dc07e1b58e1f21c546378fca6920a1f94'
};
for(const [name,expected]of Object.entries(unchanged))assert.equal(hash(fs.readFileSync(name,'utf8')),expected,name+' changed');
const previousFs={...fs,readFileSync(path,...args){let value=fs.readFileSync(path,...args);if(typeof value==='string')value=value.replaceAll('\r\n','\n');return path==='index.html'||path==='app.js'?value.replaceAll('0.8.29','0.8.27').replace('<span class="detail-close-label">Close</span><span class="detail-back-label">Back</span>','Close'):value;}};
new Function('require',fs.readFileSync('regression_check_v0.8.27.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
assert.equal(hash(css.replaceAll('\r\n','\n').slice(0,117241)),'6dc4f7dc8892463ae61a3157358c99c25243d3053b84387e28487e5436e07fe7','Previous CSS changed');
assert.match(css,/\.secondary-editor-card \.expense-fields\s*\{\s*grid-column: 1 \/ -1;/);
assert.match(css,/touch-action: pan-y pinch-zoom;/);
assert.match(css,/\.toast \{ pointer-events: none; cursor: default; \}/);
assert.match(css,/#recordsRoot \.record-drag-grip\s*\{\s*width: 28px;\s*min-height: 32px;/);
for(const token of ['min-height: 36px','inset: 7px 0','height: 100dvh','position: sticky','.detail-back-label'])assert(css.includes(token),token);
assert.match(css, /#siteWalkB05 \.secondary-record-line\.has-activity-records:not\(\.activity-record-line\):not\(\.closed\)\s*\{\s*background: #eaf2fb;/);
assert.match(css, /#siteWalkB05 \.secondary-record-line\.has-activity-records:not\(\.activity-record-line\):not\(\.closed\):hover\s*\{\s*background: #e0ecf9;/);
assert.match(css, /#siteWalkB05 \.secondary-record-line\.has-activity-records\.closed:not\(\.activity-record-line\)\s*\{\s*background: #e9eef4;/);
assert.match(app, /classes: `secondary-record-line\$\{activityCount \? " has-activity-records" : ""\}`/);
for(const match of html.matchAll(/(?:styles\.css|app\.js|dropbox-sync-proof\.js)\?v=([^" ]+)/g))assert.equal(match[1],'0.8.29');
assert.match(html,/<title>SiteScribe Review Console v0\.8\.29<\/title>/);
assert.match(html,/id="closeDetailButton"[^>]*><span class="detail-close-label">Close<\/span><span class="detail-back-label">Back<\/span>/);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate static DOM IDs');
const declarations=[...app.matchAll(/^function\s+(\w+)\s*\(/gm)].map(m=>m[1]);assert.equal(declarations.length,new Set(declarations).size,'Duplicate function declarations');
let depth=0;for(const c of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'')){if(c==='{')depth++;if(c==='}')depth--;assert(depth>=0,'Unbalanced CSS');}assert.equal(depth,0);
console.log('PASS v0.8.29 B05 parent shading, inherited responsive editor checks, versions and structural integrity; application/data logic unchanged');
