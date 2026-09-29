import { $, $$, dom } from '../core/dom.mjs';
import { session } from '../core/session.mjs';
import { uid } from '../core/utils.mjs';
import { state, save } from '../data/store.mjs';
import { latestPr, nextRoutine, recordCount, workoutStreak } from '../domain/training.mjs';
import { openModal, closeModal, escapeHtml } from '../ui/primitives.mjs';
import { bindRoutineCards, routineCardHtml } from '../ui/routine-card.mjs';
import { nav, openExercise } from '../core/router.mjs';
import { startWorkout } from './workout.mjs';

function bindCards() {
  bindRoutineCards({
    onOpen: (id) => {
      session.routineId = id;
      nav('builder');
    },
    onEdit: (id) => {
      session.routineId = id;
      nav('builder');
    },
    onStart: startWorkout
  });
}

export function homeView() {
  dom.title.textContent = 'Training';
  const total = state.routines.reduce((sum, routine) => sum + routine.exercises.length, 0);
  const week = state.history.filter((entry) => entry.ts > Date.now() - 604_800_000).length;
  const next = nextRoutine(state);
  const last = state.history[0];
  const pr = latestPr(state.records);
  const streak = workoutStreak(state.history);

  dom.app.innerHTML = `<section class="hero smart-hero"><small class="mut">NEXT WORKOUT</small><h2>${next ? escapeHtml(next.name) : 'Build your routine'}</h2><p class="mut">${last ? `Last session: ${escapeHtml(last.name)} · ${last.mins || 0} min` : 'Your A×P program is ready.'}</p>${next ? `<button class="btn primary" data-start="${next.id}">Start ${escapeHtml(next.name)}</button>` : ''}</section>
  <div class="stats"><div class="stat"><b>${week}</b><span>WORKOUTS / 7D</span></div><div class="stat"><b>${streak}</b><span>DAY STREAK</span></div><div class="stat"><b>${recordCount(state.records)}</b><span>PRs</span></div></div>
  ${pr ? `<button class="card smart-pr" data-open-exercise="${escapeHtml(pr.key || '')}"><span>LAST PR 🔥</span><b>${escapeHtml(pr.name || pr.key || 'Exercise')}</b><small>${pr.w} ${state.settings.unit} × ${pr.reps}</small></button>` : ''}
  <div class="section"><h3>Your routine</h3><span>${total} EXERCISE GROUPS</span></div>${state.routines.map(routineCardHtml).join('')}`;

  bindCards();
  $$('[data-open-exercise]').forEach((button) => {
    button.onclick = () => openExercise(button.dataset.openExercise, 'home');
  });
}

export function routinesView() {
  dom.title.textContent = 'Routine';
  dom.app.innerHTML = `<div class="section"><h3>Training days</h3><span>${state.routines.length}</span></div>${state.routines.map(routineCardHtml).join('') || '<div class="empty">No training days</div>'}<button class="btn primary block" id="newDay">+ Add training day</button>`;
  bindCards();
  $('#newDay').onclick = addDay;
}

export function addDay() {
  openModal('<h2>New training day</h2><div class="field"><label>DAY NAME</label><input id="dn" class="input" placeholder="Anterior C"></div><div class="row"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="saveDay">Create</button></div>');
  $('#cancel').onclick = closeModal;
  $('#saveDay').onclick = () => {
    const name = $('#dn').value.trim();
    if (!name) return;
    state.routines.push({ id: uid(), name, exercises: [] });
    save();
    closeModal();
    routinesView();
  };
}
