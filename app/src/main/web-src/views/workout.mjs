import { persistWorkout } from '../services/workout-recovery.mjs';
import { $, $$, dom } from '../core/dom.mjs';
import { session } from '../core/session.mjs';
import { clone, escapeHtml, uid } from '../core/utils.mjs';
import { state, lastExerciseEntry, save } from '../data/store.mjs';
import { progressionSuggestion } from '../domain/training.mjs';
import { completeWorkout } from '../domain/workout-completion.mjs';
import { blankRows, choice, exerciseSpec, toast, videoLink } from '../ui/primitives.mjs';
import { nav, openExercise, showWorkoutExitDialog } from '../core/router.mjs';
import {
  getRestSeconds,
  formatRest,
  startRestTimer,
  startWorkoutClock,
  stopRestTimer,
  stopWorkoutClock
} from '../services/timers.mjs';

function selected(exercise) {
  return choice(exercise, session.workout.choiceKeys[exercise.id]);
}

function warmupMax(value) {
  if (!value || value === '0') return 0;
  const match = String(value).match(/(\d+)\s*~\s*(\d+)/);
  return match ? +match[2] : (+value || 1);
}

export function startWorkout(id) {
  const routine = state.routines.find((item) => item.id === id);
  if (!routine) return;
  if (!routine.exercises.length) {
    session.routineId = id;
    nav('builder');
    toast('Add exercises first');
    return;
  }

  stopWorkoutClock();
  session.workout = {
    id: uid(),
    r: routine,
    start: Date.now(),
    choiceKeys: {},
    rows: {},
    warm: {},
    note: ''
  };

  routine.exercises.forEach((exercise) => {
    const selectedChoice = exercise.choices[0];
    session.workout.choiceKeys[exercise.id] = selectedChoice.key;
    session.workout.rows[exercise.id] = blankRows(selectedChoice);
    session.workout.warm[exercise.id] = [];
  });
  nav('workout');
}

export function workoutView() {
  const routine = session.workout?.r;
  if (!routine) return nav('home');
  persistWorkout();
  dom.title.textContent = routine.name;

  dom.app.innerHTML = `<div class="worktop"><button class="btn" id="exit">← Exit</button><div class="work-metrics"><div class="elapsed" id="workoutClock"><span>WORKOUT</span><b>00:00:00</b></div><button class="timer" id="restBtn">Rest ${formatRest(getRestSeconds())}</button></div></div>
  <div class="section"><h3>Workout</h3><span>LIVE SESSION</span></div>
  ${routine.exercises.map((exercise, index) => {
    const selectedChoice = selected(exercise);
    const options = exercise.choices;
    const warmups = session.workout.warm[exercise.id];
    const last = lastExerciseEntry(selectedChoice.key);
    const progression = progressionSuggestion(state.performance, state.settings, selectedChoice);
    return `<div class="card ex workout-card"><div class="exhead"><div><b>${index + 1}. ${escapeHtml(selectedChoice.name)}</b><div class="mut">${exerciseSpec(selectedChoice)}</div></div><div class="row">${videoLink(selectedChoice)}<button class="btn mini" data-work-stats="${escapeHtml(selectedChoice.key)}">Stats</button></div></div>
    ${progression ? `<div class="progression ready">↗ ${escapeHtml(progression.text)}</div>` : ''}
    ${options.length > 1 ? `<div class="chips">${options.map((option) => `<button class="chip ${option.key === selectedChoice.key ? 'on' : ''}" data-choice="${escapeHtml(option.key)}" data-ex="${exercise.id}">${escapeHtml(option.name)}</button>`).join('')}</div>` : ''}
    ${exercise.note ? `<details><summary>Note</summary><p class="note">${escapeHtml(exercise.note)}</p></details>` : ''}
    ${selectedChoice.warmup && selectedChoice.warmup !== '0' ? `<div class="warmbox"><div class="warmhead"><span>Warm-up · suggested ${escapeHtml(selectedChoice.warmup)}</span><button class="btn mini" data-addwarm="${exercise.id}">+ Set</button></div>${warmups.map((set, warmupIndex) => `<div class="setrow warmrow"><span>W${warmupIndex + 1}</span><input class="input" type="number" step=".5" placeholder="kg" data-wf="w" data-ex="${exercise.id}" data-i="${warmupIndex}" value="${set.w ?? ''}"><input class="input" type="number" placeholder="reps" data-wf="reps" data-ex="${exercise.id}" data-i="${warmupIndex}" value="${set.reps ?? ''}"><button class="xbtn" data-rmwarm="${exercise.id}" data-i="${warmupIndex}">×</button></div>`).join('')}</div>` : ''}
    <div class="setrow labels"><span>SET</span><span>WEIGHT</span><span>REPS</span><span>✓</span></div>
    ${session.workout.rows[exercise.id].map((set, setIndex) => `<div class="setrow"><span>${setIndex + 1}</span><input class="input" type="number" step=".5" data-f="w" data-ex="${exercise.id}" data-i="${setIndex}" value="${set.w}"><input class="input" type="number" data-f="reps" data-ex="${exercise.id}" data-i="${setIndex}" value="${set.reps}"><input class="check" type="checkbox" data-f="done" data-ex="${exercise.id}" data-i="${setIndex}" ${set.done ? 'checked' : ''}></div>${last?.sets?.[setIndex] ? `<div class="last-set-note">Last set ${setIndex + 1}: <b>${last.sets[setIndex].w} ${state.settings.unit} × ${last.sets[setIndex].reps}</b></div>` : ''}`).join('')}</div>`;
  }).join('')}
  <div class="card workout-note-card"><label>WORKOUT NOTE</label><textarea id="workoutNote" class="input" placeholder="Energy, pain, form, what to improve next time...">${escapeHtml(session.workout.note || '')}</textarea></div>
  <button class="btn primary block finish" id="finish">Finish workout</button>`;

  $('#exit').onclick = showWorkoutExitDialog;
  $('#finish').onclick = finishWorkout;
  $('#restBtn').onclick = () => getRestSeconds() ? stopRestTimer() : startRestTimer();
  $('#workoutNote').oninput = (event) => { session.workout.note = event.target.value; persistWorkout(); };

  $$('[data-work-stats]').forEach((button) => {
    button.onclick = () => openExercise(button.dataset.workStats, 'workout');
  });
  $$('[data-f]').forEach((element) => {
    element.onchange = () => {
      const set = session.workout.rows[element.dataset.ex][+element.dataset.i];
      const field = element.dataset.f;
      if (field === 'done') {
        set.done = element.checked;
        persistWorkout();
        if (element.checked) startRestTimer();
      } else {
        set[field] = element.value;
        persistWorkout();
      }
    };
  });
  $$('[data-f]:not([data-f=done])').forEach(element => { element.oninput = element.onchange; });
  $$('[data-wf]').forEach((element) => {
    element.onchange = () => {
      session.workout.warm[element.dataset.ex][+element.dataset.i][element.dataset.wf] = element.value;
      persistWorkout();
    };
  });
  $$('[data-wf]').forEach(element => { element.oninput = element.onchange; });
  $$('[data-addwarm]').forEach((button) => {
    button.onclick = () => {
      const exercise = routine.exercises.find((item) => item.id === button.dataset.addwarm);
      const selectedChoice = selected(exercise);
      const warmups = session.workout.warm[exercise.id];
      const max = warmupMax(selectedChoice.warmup);
      if (warmups.length >= max) return toast(`Max warm-up: ${max}`);
      warmups.push({ w: '', reps: '' });
      workoutView();
    };
  });
  $$('[data-rmwarm]').forEach((button) => {
    button.onclick = () => {
      session.workout.warm[button.dataset.rmwarm].splice(+button.dataset.i, 1);
      workoutView();
    };
  });
  $$('[data-choice]').forEach((button) => {
    button.onclick = () => {
      const exercise = routine.exercises.find((item) => item.id === button.dataset.ex);
      session.workout.choiceKeys[exercise.id] = button.dataset.choice;
      const selectedChoice = selected(exercise);
      session.workout.rows[exercise.id] = blankRows(selectedChoice);
      session.workout.warm[exercise.id] = [];
      workoutView();
    };
  });
  startWorkoutClock();
}

export function finishWorkout() {
  if (!session.workout) return;
  const historyEntry = completeWorkout(state, session.workout, { idFactory: () => session.workout.id });
  session.summary = clone(historyEntry);
  save(true);
  stopWorkoutClock();
  session.workout = null;
  persistWorkout();
  stopRestTimer();
  nav('summary');
}
