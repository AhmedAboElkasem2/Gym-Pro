import { SEED } from './seed-data.mjs';
import { clone, uid } from '../core/utils.mjs';
import { bestSet, rebuildRecords } from '../domain/training.mjs';

export const STORAGE_KEY = 'gympro-v2';
export const AUTO_BACKUP_KEY = 'vantalift-auto-backups-v1';

export function migrateData(input) {
  const state = input && Array.isArray(input.routines) ? input : clone(SEED);
  state.performance = state.performance && typeof state.performance === 'object' ? state.performance : {};
  state.history = Array.isArray(state.history) ? state.history : [];
  state.settings = { ...clone(SEED.settings), ...(state.settings || {}) };
  state.exerciseLog = state.exerciseLog && typeof state.exerciseLog === 'object' ? state.exerciseLog : {};
  state.records = state.records && typeof state.records === 'object' ? state.records : {};

  Object.entries(state.performance).forEach(([key, sets]) => {
    if (!state.records[key]) {
      const best = bestSet(sets);
      if (best) state.records[key] = { ...best, name: key, key, ts: 0 };
    }
  });
  state.exerciseNotes = state.exerciseNotes && typeof state.exerciseNotes === 'object' && !Array.isArray(state.exerciseNotes) ? state.exerciseNotes : {};
  state.schema = 4;
  return state;
}

function loadInitialState() {
  try {
    return migrateData(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return migrateData(clone(SEED));
  }
}

export const state = loadInitialState();

export function replaceState(nextState) {
  const migrated = migrateData(nextState);
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, migrated);
  return state;
}

export function readAutoBackups() {
  try {
    return JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY)) || [];
  } catch {
    return [];
  }
}

export function createAutoBackup(force = false) {
  try {
    const list = readAutoBackups();
    const now = Date.now();
    if (!force && list[0] && now - list[0].ts < 21_600_000) return;
    list.unshift({ id: uid(), ts: now, data: clone(state) });
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(list.slice(0, 5)));
  } catch {}
}

export function save(forceBackup = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  createAutoBackup(forceBackup);
}

export function exerciseEntries(key) {
  return Array.isArray(state.exerciseLog[key]) ? state.exerciseLog[key] : [];
}

export function lastExerciseEntry(key) {
  return exerciseEntries(key)[0] || null;
}

export function recalculateRecords() {
  state.records = rebuildRecords(state.performance, state.exerciseLog);
  return state.records;
}
