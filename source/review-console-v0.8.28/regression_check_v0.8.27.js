const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const importHelp='Open import choices for this file. Current memory is never silently replaced.';
const deleteHelp='Delete only this Dropbox file after confirmation. Browser-saved sites are not deleted.';
function oldPresentation(source){
 return source.replaceAll(` title="${importHelp}"`,'').replaceAll(` title="${deleteHelp}"`,'')
  .replace('setSyncResult("Manual Dropbox backup/import ready.");','setSyncResult("Manual Dropbox backup/import ready. LIST views Dropbox JSON files; IMPORT opens SiteScribe choices; SAVE NEW BACKUP COPY uploads a timestamped copy; UPDATE DROPBOX SITE FILE replaces the stable site file after confirmation. No generalized sync.");');
}
// Prove that Dropbox behavior did not change beyond the three help strings.
const dropbox=fs.readFileSync('dropbox-sync-proof.js','utf8');
assert.equal(crypto.createHash('sha256').update(oldPresentation(dropbox)).digest('hex'),'8f5e7d607433b346033ea726181f6e39eb21acc44d7c29a2c67914903b4715ce');
const previousFs={...fs,readFileSync(path,...args){
 const value=fs.readFileSync(path,...args);
 if(path==='dropbox-sync-proof.js'){const old=oldPresentation(Buffer.isBuffer(value)?value.toString('utf8'):value);return Buffer.isBuffer(value)?Buffer.from(old):old;}
 return path==='index.html'||path==='app.js'?value.replaceAll('0.8.27','0.8.26'):value;
}};
new Function('require',fs.readFileSync('regression_check_v0.8.26.js','utf8'))(name=>name==='node:fs'?previousFs:require(name));
const html=fs.readFileSync('index.html','utf8');
assert.doesNotMatch(html,/<p class="dropbox-helper-text">/);
assert.match(html,/id="dropboxSyncResultLine"[^>]*>Last action: no Dropbox action run yet\.<\/p>/);
for(const id of ['connectDropboxButton','listDropboxFilesButton','updateDropboxSiteFileButton','saveNewDropboxBackupCopyButton','saveDropboxSettingsButton']){
 const button=html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`));assert(button,id);assert.match(button[0],/desktop-tooltip/);assert.match(button[0],/data-tooltip="[^"\n]+"/);
}
assert.equal((dropbox.match(new RegExp(`title="${deleteHelp.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`,'g'))||[]).length,2);
assert(dropbox.includes(`title="${importHelp}"`));
assert.match(html,/app\.js\?v=0\.8\.27/);assert.match(html,/dropbox-sync-proof\.js\?v=0\.8\.27/);
console.log('PASS Dropbox instructions removed, all action pills retain hover help, and operation code is byte-identical after reversing only help strings');
