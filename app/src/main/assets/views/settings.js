'use strict';
// Settings and local backup management.
function settings(){
 const backups=readAutoBackups();
 T.textContent='Settings';A.innerHTML=`<div class="card"><div class="field"><label>WEIGHT UNIT</label><select id="unit" class="input"><option>kg</option><option>lb</option></select></div><div class="field"><label>DEFAULT REST TIMER (SECONDS)</label><input id="rest" type="number" class="input" value="${S.settings.rest||180}"></div>
 <div class="field"><label>BACKUP FILES</label><button class="btn primary block" id="saveBackup">Save Backup File (.json)</button></div><div class="field"><button class="btn block" id="loadBackup">Import Backup File</button></div>
 <div class="field"><button class="btn block" id="copyBackup">Copy Backup JSON</button></div><div class="field"><button class="btn block" id="pasteBackup">Paste Backup JSON</button></div>
 <div class="field"><label>AUTO BACKUPS</label><button class="btn block backup-manager" id="manageBackups"><span>Manage local snapshots</span><b>${backups.length}/5</b></button></div>
 <button class="btn danger block" id="reset">Reset to AboElkasem program</button></div>
 <div class="developer-card"><div class="developer-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path class="dev-hex" d="M24 3 40 12v24L24 45 8 36V12Z"/><path class="dev-code" d="m20 16-7 8 7 8m8-16 7 8-7 8m-2-19-4 22"/></svg></div><div><span>DEVELOPED BY</span><strong>Ahmed AboElkasem</strong><small>Crafted for VantaLift</small></div></div>`;
 $('#unit').value=S.settings.unit;$('#unit').onchange=e=>{S.settings.unit=e.target.value;save()};$('#rest').onchange=e=>{S.settings.rest=Math.max(30,+e.target.value||180);save()};
 $('#saveBackup').onclick=saveBackupFile;$('#loadBackup').onclick=openBackupFile;$('#manageBackups').onclick=manageAutoBackups;
 $('#copyBackup').onclick=()=>{const data=JSON.stringify(S,null,2);open('<h2>Copy backup JSON</h2><textarea class="input" id="bk">'+esc(data)+'</textarea><button class="btn primary block" id="copy">Copy</button>');$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#bk').value);toast('Copied')}catch{toast('Select and copy manually')}}};
 $('#pasteBackup').onclick=()=>{open('<h2>Paste backup JSON</h2><textarea id="im" class="input" placeholder="Paste the full JSON here"></textarea><button id="restore" class="btn primary block">Restore</button>');$('#restore').onclick=()=>applyBackupText($('#im').value)};
 $('#reset').onclick=()=>{if(confirm('Reset everything and reload the prebuilt program?')){createAutoBackup(true);S=migrateData(clone(SEED));save();nav('home')}};
}
