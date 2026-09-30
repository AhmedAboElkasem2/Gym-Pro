import { $, $$ } from '../core/dom.mjs';
import { state, save } from '../data/store.mjs';
import { session } from '../core/session.mjs';
import { buildExerciseLibrary } from '../domain/training.mjs';
import { switchChoice, focusSets, focusTarget } from '../domain/workout-tools.mjs';
import { clone, normalize, escapeHtml } from '../core/utils.mjs';
import { persistWorkout } from '../services/workout-recovery.mjs';
import { blankRows, openModal, closeModal } from '../ui/primitives.mjs';

export function personalNote(choice) {
  return `<label class="exercise-note-label">MY SETUP · SAVED FOR NEXT TIME<textarea class="input personal-note" data-personal-note="${escapeHtml(choice.key)}" placeholder="Seat height, grip, technique…" maxlength="1000">${escapeHtml(state.exerciseNotes?.[choice.key] || '')}</textarea></label>`;
}

export function focusToolbar(workout) {
  const target = focusTarget(workout);
  const sets = focusSets(workout);
  const position = sets.findIndex(s => s.exerciseId === target?.exerciseId && s.index === target?.index);
  return `<div class="focus-toolbar"><button class="btn ${workout.focusMode ? 'primary' : ''}" id="focusToggle">${workout.focusMode ? '▦ All exercises' : '◎ Focus mode'}</button>${workout.focusMode ? `<div class="row"><button class="btn mini" id="focusPrev" ${position <= 0 ? 'disabled' : ''}>←</button><span>${position + 1} / ${sets.length} sets</span><button class="btn mini" id="focusNext" ${position >= sets.length - 1 ? 'disabled' : ''}>→</button></div>` : ''}</div>`;
}

export function selectWorkoutChoice(exercise, selected, render) {
  switchChoice(session.workout, exercise, selected, blankRows);
  persistWorkout();
  render();
}

function swapPicker(exercise, render) {
  const current = session.workout.choiceKeys[exercise.id];
  const library = buildExerciseLibrary(state, normalize, clone);
  const entries = [...exercise.choices.map(choice => ({ key: choice.key, name: choice.name, choice, source: 'Routine alternative' })), ...library]
    .filter((item, index, all) => item.key !== current && all.findIndex(other => other.key === item.key) === index);
  openModal(`<h2>Machine busy?</h2><p class="mut">Choose a suitable alternative. Each exercise keeps its own weights and completed sets.</p><input class="input" id="swapSearch" placeholder="Search your exercises" aria-label="Search alternatives"><div id="swapResults" class="swap-results"></div><button class="btn block" id="swapClose">Cancel</button>`);
  const paint = () => {
    const query = $('#swapSearch').value.trim().toLowerCase();
    const matches = entries.filter(item => item.name.toLowerCase().includes(query));
    $('#swapResults').innerHTML = matches.map((item, index) => `<button class="card swap-option" data-swap-index="${index}"><b>${escapeHtml(item.name)}</b><small class="mut">${escapeHtml(item.source)}</small></button>`).join('') || '<p class="mut">No alternatives in your routines yet. Add an exercise in the routine builder.</p>';
    $$('[data-swap-index]').forEach(button => { button.onclick = () => {
      const item = matches[Number(button.dataset.swapIndex)];
      closeModal();
      selectWorkoutChoice(exercise, item.choice, render);
    }; });
  };
  $('#swapSearch').oninput = paint;
  $('#swapClose').onclick = closeModal;
  paint();
}

export function bindWorkoutTools(render) {
  const workout = session.workout;
  $('#focusToggle').onclick = () => { workout.focusMode = !workout.focusMode; workout.focusCursor = null; render(); };
  for (const [id, delta] of [['#focusPrev', -1], ['#focusNext', 1]]) {
    const button = $(id);
    if (button) button.onclick = () => {
      const sets = focusSets(workout), target = focusTarget(workout);
      const index = sets.findIndex(s => s.exerciseId === target.exerciseId && s.index === target.index);
      workout.focusCursor = sets[Math.max(0, Math.min(sets.length - 1, index + delta))];
      render();
    };
  }
  $$('[data-swap]').forEach(button => { button.onclick = () => swapPicker(workout.r.exercises.find(ex => ex.id === button.dataset.swap), render); });
  $$('[data-personal-note]').forEach(input => { input.oninput = () => {
    state.exerciseNotes ||= {};
    state.exerciseNotes[input.dataset.personalNote] = input.value;
    save();
  }; });
}
