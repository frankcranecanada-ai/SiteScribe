const assert=require('node:assert/strict');
const fs=require('node:fs');
const previousFs={...fs,readFileSync(path,...args){
  const value=fs.readFileSync(path,...args);
  return path==='index.html' ? value.replaceAll('0.8.20','0.8.19') : value;
}};
new Function('require',fs.readFileSync('regression_check_v0.8.19.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
const css=fs.readFileSync('styles.css','utf8');
assert.match(css,/#updateDropboxSiteFileButton\s*\{\s*border-color: var\(--ok\);\s*box-shadow: inset 0 0 0 1px var\(--ok\);\s*\}/);
assert.match(fs.readFileSync('index.html','utf8'),/styles\.css\?v=0\.8\.20/);
assert.match(fs.readFileSync('app.js','utf8'),/const APP_VERSION = "v0\.8\.20";/);
// Dropbox logic is identical to the previous release.
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('dropbox-sync-proof.js')).digest('hex'),'8f5e7d607433b346033ea726181f6e39eb21acc44d7c29a2c67914903b4715ce');
console.log('PASS scoped green Dropbox-update border, cache markers and unchanged Dropbox logic');
