const assert=require('node:assert/strict');
const fs=require('node:fs');
const previousFs={...fs,readFileSync(path,...args){
  const value=fs.readFileSync(path,...args);
  return path==='index.html'||path==='app.js' ? value.replaceAll('0.8.21','0.8.20') : value;
}};
new Function('require',fs.readFileSync('regression_check_v0.8.20.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
assert.match(fs.readFileSync('styles.css','utf8'),/#siteWalkB05 \.activity-record-line \.record-title-text\s*\{\s*font-style: italic;\s*\}/);
assert.match(fs.readFileSync('index.html','utf8'),/styles\.css\?v=0\.8\.21/);
assert.match(fs.readFileSync('app.js','utf8'),/const APP_VERSION = "v0\.8\.21";/);
console.log('PASS activity-description-only italics scoped to B05 and current cache markers');
