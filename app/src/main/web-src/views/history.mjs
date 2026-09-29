import { $, $$, dom } from '../core/dom.mjs';
import { session } from '../core/session.mjs';
import { normalize, clone } from '../core/utils.mjs';
import { state, exerciseEntries, recalculateRecords, save } from '../data/store.mjs';
import { buildExerciseLibrary } from '../domain/training.mjs';
import { closeModal, escapeHtml, openModal, toast } from '../ui/primitives.mjs';
import { formatElapsed } from '../services/timers.mjs';
import { nav, openExercise } from '../core/router.mjs';

function library() {
  return buildExerciseLibrary(state, normalize, clone);
}

export function exerciseView() {
  const key = session.exerciseKey;
  const info = library().find((item) => item.key === key);
  const entries = exerciseEntries(key);
  const record = state.records[key] || null;
  const name = info?.name || entries[0]?.name || record?.name || key || 'Exercise';
  dom.title.textContent = name;

  const recent = entries.slice(0, 8).reverse();
  const max = Math.max(1, ...recent.map((entry) => entry.maxWeight || 0));

  dom.app.innerHTML = `<div class="row"><button class="btn" id="exerciseBack">← Back</button></div>
  <div class="exercise-hero"><span>EXERCISE PROGRESS</span><h2>${escapeHtml(name)}</h2>${record ? `<div class="record-pill">PR · ${record.w} ${state.settings.unit} × ${record.reps}</div>` : ''}</div>
  ${recent.length ? `<div class="card"><div class="section compact"><h3>Weight trend</h3><span>LAST ${recent.length}</span></div><div class="progress-bars">${recent.map((entry) => `<div class="bar-col"><div class="bar-value">${entry.maxWeight}</div><div class="bar" style="height:${Math.max(12, Math.round((entry.maxWeight / max) * 100))}%"></div><small>${new Date(entry.ts).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</small></div>`).join('')}</div></div>` : '<div class="empty">Your detailed exercise history starts with your next logged workout.</div>'}
  <div class="section"><h3>Sessions</h3><span>${entries.length}</span></div>
  ${entries.map((entry) => `<div class="card exercise-session"><b>${new Date(entry.ts).toLocaleDateString()} · ${escapeHtml(entry.routineName || 'Workout')}</b><div class="chips">${entry.sets.map((set) => `<span class="chip">${set.w} ${state.settings.unit} × ${set.reps}</span>`).join('')}</div></div>`).join('')}`;

  $('#exerciseBack').onclick = () => nav(
    session.exerciseReturnView === 'workout' && session.workout
      ? 'workout'
      : session.exerciseReturnView || 'history'
  );
}

export function summaryView() {
  const history = session.summary;
  if (!history) return nav('history');
  dom.title.textContent = 'Workout Complete';

  dom.app.innerHTML = `<section class="summary-hero ${history.prs?.length ? 'has-pr' : ''}">${history.prs?.length ? '<div class="pr-burst">NEW PR 🔥</div>' : ''}<small>SESSION COMPLETE</small><h2>${escapeHtml(history.name)}</h2><p>${formatElapsed(history.durationMs || history.mins * 60_000)}</p></section>
  <div class="stats"><div class="stat"><b>${history.sets}</b><span>SETS</span></div><div class="stat"><b>${history.details?.length || 0}</b><span>EXERCISES</span></div><div class="stat"><b>${history.prs?.length || 0}</b><span>NEW PRs</span></div></div>
  ${history.prs?.length ? `<div class="section"><h3>Records</h3><span>🔥</span></div>${history.prs.map((record) => `<button class="card pr-card" data-summary-pr="${escapeHtml(record.key)}"><b>${escapeHtml(record.name)}</b><span>${record.w} ${state.settings.unit} × ${record.reps}</span></button>`).join('')}` : ''}
  ${history.note ? `<div class="card"><small class="mut">WORKOUT NOTE</small><p class="note summary-note">${escapeHtml(history.note)}</p></div>` : ''}
  <div class="row summary-actions"><button class="btn primary" id="summaryHome">Home</button><button class="btn" id="summaryHistory">History</button></div>`;

  $('#summaryHome').onclick = () => nav('home');
  $('#summaryHistory').onclick = () => nav('history');
  $$('[data-summary-pr]').forEach((button) => {
    button.onclick = () => openExercise(button.dataset.summaryPr, 'summary');
  });
}

function confirmHistoryDelete(historyId) {
  const item = state.history.find((entry) => entry.id === historyId);
  if (!item) return;
  openModal(`<h2>Delete session?</h2><p class="mut">Remove <b>${escapeHtml(item.name)}</b> and its detailed exercise log from history?</p><div class="row"><button class="btn" id="keepHistory">Cancel</button><button class="btn danger" id="deleteHistoryNow">Delete</button></div>`);
  $('#keepHistory').onclick = closeModal;
  $('#deleteHistoryNow').onclick = () => {
    state.history = state.history.filter((entry) => entry.id !== historyId);
    Object.keys(state.exerciseLog || {}).forEach((key) => {
      state.exerciseLog[key] = (state.exerciseLog[key] || []).filter((entry) => entry.sessionId !== historyId);
      if (!state.exerciseLog[key].length) delete state.exerciseLog[key];
    });
    recalculateRecords();
    save(true);
    closeModal();
    historyView();
    toast('Session deleted');
  };
}

export function historyView() {
  const totalSets = state.history.reduce((sum, entry) => sum + (+entry.sets || 0), 0);
  const totalMinutes = state.history.reduce((sum, entry) => sum + (+entry.mins || 0), 0);
  const records = Object.values(state.records || {})
    .filter((record) => record && record.ts > 0)
    .sort((a, b) => b.ts - a.ts);

  dom.title.textContent = 'History';
  dom.app.innerHTML = `<div class="stats"><div class="stat"><b>${state.history.length}</b><span>WORKOUTS</span></div><div class="stat"><b>${totalSets}</b><span>TOTAL SETS</span></div><div class="stat"><b>${totalMinutes}</b><span>MINUTES</span></div></div>
  ${records.length ? `<div class="section"><h3>Personal records</h3><span>${records.length}</span></div><div class="records-strip">${records.slice(0, 6).map((record) => `<button class="record-card" data-record-key="${escapeHtml(record.key)}"><span>PR 🔥</span><b>${escapeHtml(record.name || record.key)}</b><small>${record.w} ${state.settings.unit} × ${record.reps}</small></button>`).join('')}</div>` : ''}
  <div class="section"><h3>Sessions</h3><span>NEWEST</span></div>
  ${state.history.map((entry) => `<div class="card history"><div class="history-copy"><b>${escapeHtml(entry.name)}</b><span class="mut">${new Date(entry.ts).toLocaleDateString()} · ${entry.mins} min · ${entry.sets} sets</span>${entry.note ? `<small class="history-note">${escapeHtml(entry.note)}</small>` : ''}${entry.prs?.length ? `<small class="history-pr">${entry.prs.length} PR${entry.prs.length > 1 ? 's' : ''} 🔥</small>` : ''}</div><button class="history-delete" data-delete-history="${entry.id}" aria-label="Delete history session"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9v8m4-8v8m4-8v8M5 6h14M9 6V4h6v2m-9 0 1 15h10l1-15"/></svg></button></div>`).join('') || '<div class="empty">No workouts logged yet</div>'}`;

  $$('[data-delete-history]').forEach((button) => {
    button.onclick = () => confirmHistoryDelete(button.dataset.deleteHistory);
  });
  $$('[data-record-key]').forEach((button) => {
    button.onclick = () => openExercise(button.dataset.recordKey, 'history');
  });
}
