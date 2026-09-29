'use strict';
// Backup import/export orchestration and native callbacks.
function normalizeBackup(x){return migrateData(x)}
function applyBackupText(raw){
 try{const x=normalizeBackup(JSON.parse(String(raw||'').trim()));createAutoBackup(true);S=x;save();close();nav('home');toast('Backup restored')}catch(err){toast('Invalid backup');open('<h2>Invalid backup</h2><p class="mut">The backup file/text is incomplete or not valid JSON.</p><button class="btn block" id="closeInvalid">Close</button>');$('#closeInvalid').onclick=close}
}
function saveBackupFile(){const data=JSON.stringify(S,null,2);try{if(window.GymNative&&window.GymNative.saveBackupFile){window.GymNative.saveBackupFile(data);return}}catch{}open('<h2>Export backup</h2><p class="mut">File export is unavailable here. Copy the full JSON below.</p><textarea class="input" id="bk">'+esc(data)+'</textarea><button class="btn primary block" id="copy">Copy JSON</button>');$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#bk').value);toast('Copied')}catch{toast('Select and copy manually')}}}
function openBackupFile(){try{if(window.GymNative&&window.GymNative.openBackupFile){window.GymNative.openBackupFile();return}}catch{}open('<h2>Import backup</h2><textarea id="im" class="input" placeholder="Paste the full JSON here"></textarea><button id="restore" class="btn primary block">Restore</button>');$('#restore').onclick=()=>applyBackupText($('#im').value)}
function manageAutoBackups(){
 const list=readAutoBackups();
 open(`<h2>Auto backups</h2><p class="mut">VantaLift keeps up to 5 local snapshots automatically.</p>${list.length?list.map((b,i)=>`<div class="backup-row"><div><b>Backup ${i+1}</b><small>${new Date(b.ts).toLocaleString()}</small></div><div class="row"><button class="btn mini" data-restore-auto="${b.id}">Restore</button><button class="btn danger mini" data-delete-auto="${b.id}">Delete</button></div></div>`).join(''):'<div class="empty">No automatic backups yet</div>'}<button class="btn block" id="closeBackups">Close</button>`);
 $('#closeBackups').onclick=close;
 $$('[data-restore-auto]').forEach(btn=>btn.onclick=()=>{const item=readAutoBackups().find(x=>x.id===btn.dataset.restoreAuto);if(!item)return;createAutoBackup(true);S=migrateData(clone(item.data));save();close();nav('home');toast('Auto backup restored')});
 $$('[data-delete-auto]').forEach(btn=>btn.onclick=()=>{const next=readAutoBackups().filter(x=>x.id!==btn.dataset.deleteAuto);localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(next));manageAutoBackups()});
}
window.GymProImportBackup=(raw)=>applyBackupText(raw);
window.GymProBackupSaved=()=>toast('Backup file saved');
window.GymProBackupError=(msg)=>toast(msg||'Backup file error');
