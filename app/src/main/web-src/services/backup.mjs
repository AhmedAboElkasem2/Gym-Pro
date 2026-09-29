import { $, $$ } from '../core/dom.mjs';
import { clone } from '../core/utils.mjs';
import {
  AUTO_BACKUP_KEY,
  createAutoBackup,
  migrateData,
  readAutoBackups,
  replaceState,
  save,
  state
} from '../data/store.mjs';
import { closeModal, escapeHtml, openModal, toast } from '../ui/primitives.mjs';
import { nav } from '../core/router.mjs';

export function normalizeBackup(value) {
  return migrateData(value);
}

export function applyBackupText(raw) {
  try {
    const next = normalizeBackup(JSON.parse(String(raw || '').trim()));
    createAutoBackup(true);
    replaceState(next);
    save();
    closeModal();
    nav('home');
    toast('Backup restored');
  } catch {
    toast('Invalid backup');
    openModal('<h2>Invalid backup</h2><p class="mut">The backup file/text is incomplete or not valid JSON.</p><button class="btn block" id="closeInvalid">Close</button>');
    $('#closeInvalid').onclick = closeModal;
  }
}

export function saveBackupFile() {
  const data = JSON.stringify(state, null, 2);
  try {
    if (window.GymNative?.saveBackupFile) {
      window.GymNative.saveBackupFile(data);
      return;
    }
  } catch {}

  openModal('<h2>Export backup</h2><p class="mut">File export is unavailable here. Copy the full JSON below.</p><textarea class="input" id="bk">' + escapeHtml(data) + '</textarea><button class="btn primary block" id="copy">Copy JSON</button>');
  $('#copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText($('#bk').value);
      toast('Copied');
    } catch {
      toast('Select and copy manually');
    }
  };
}

export function openBackupFile() {
  try {
    if (window.GymNative?.openBackupFile) {
      window.GymNative.openBackupFile();
      return;
    }
  } catch {}

  openModal('<h2>Import backup</h2><textarea id="im" class="input" placeholder="Paste the full JSON here"></textarea><button id="restore" class="btn primary block">Restore</button>');
  $('#restore').onclick = () => applyBackupText($('#im').value);
}

export function manageAutoBackups() {
  const list = readAutoBackups();
  openModal(`<h2>Auto backups</h2><p class="mut">VantaLift keeps up to 5 local snapshots automatically.</p>${list.length ? list.map((backup, index) => `<div class="backup-row"><div><b>Backup ${index + 1}</b><small>${new Date(backup.ts).toLocaleString()}</small></div><div class="row"><button class="btn mini" data-restore-auto="${backup.id}">Restore</button><button class="btn danger mini" data-delete-auto="${backup.id}">Delete</button></div></div>`).join('') : '<div class="empty">No automatic backups yet</div>'}<button class="btn block" id="closeBackups">Close</button>`);
  $('#closeBackups').onclick = closeModal;

  $$('[data-restore-auto]').forEach((button) => {
    button.onclick = () => {
      const backup = readAutoBackups().find((item) => item.id === button.dataset.restoreAuto);
      if (!backup) return;
      createAutoBackup(true);
      replaceState(clone(backup.data));
      save();
      closeModal();
      nav('home');
      toast('Auto backup restored');
    };
  });

  $$('[data-delete-auto]').forEach((button) => {
    button.onclick = () => {
      const next = readAutoBackups().filter((item) => item.id !== button.dataset.deleteAuto);
      localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(next));
      manageAutoBackups();
    };
  });
}

export function bindNativeBackupCallbacks() {
  window.GymProImportBackup = applyBackupText;
  window.GymProBackupSaved = () => toast('Backup file saved');
  window.GymProBackupError = (message) => toast(message || 'Backup file error');
}
