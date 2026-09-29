import { $, $$, dom } from '../core/dom.mjs';
import { session } from '../core/session.mjs';
import { state, save } from '../data/store.mjs';
import { escapeHtml, exerciseSpec, videoLink } from '../ui/primitives.mjs';
import { nav, openExercise } from '../core/router.mjs';
import { addExerciseFlow } from '../features/exercise-library.mjs';
import { openExerciseEditor } from './exercise-editor.mjs';
import { startWorkout } from './workout.mjs';

function moveExercise(routine, id, delta) {
  const index = routine.exercises.findIndex((exercise) => exercise.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= routine.exercises.length) return;
  [routine.exercises[index], routine.exercises[target]] = [routine.exercises[target], routine.exercises[index]];
  save();
  builderView();
}

function bindExerciseReorder(routine) {
  let dragged = null;
  $$('[data-ex-card]').forEach((card) => {
    card.ondragstart = () => {
      dragged = card.dataset.exCard;
      card.classList.add('dragging');
    };
    card.ondragend = () => {
      dragged = null;
      card.classList.remove('dragging');
    };
    card.ondragover = (event) => event.preventDefault();
    card.ondrop = (event) => {
      event.preventDefault();
      if (!dragged || dragged === card.dataset.exCard) return;
      const from = routine.exercises.findIndex((item) => item.id === dragged);
      const to = routine.exercises.findIndex((item) => item.id === card.dataset.exCard);
      if (from < 0 || to < 0) return;
      const [item] = routine.exercises.splice(from, 1);
      routine.exercises.splice(to, 0, item);
      save();
      builderView();
    };
  });
  $$('[data-move-up]').forEach((button) => {
    button.onclick = () => moveExercise(routine, button.dataset.moveUp, -1);
  });
  $$('[data-move-down]').forEach((button) => {
    button.onclick = () => moveExercise(routine, button.dataset.moveDown, 1);
  });
}

export function builderView() {
  const routine = state.routines.find((item) => item.id === session.routineId);
  if (!routine) return nav('routines');
  dom.title.textContent = routine.name;

  dom.app.innerHTML = `<div class="row"><button class="btn" id="back">← Routine</button><button class="btn" id="rename">Rename</button><button class="btn danger" id="del">Delete</button></div><div class="section"><h3>Exercises</h3><span>DRAG TO REORDER</span></div>
  ${routine.exercises.map((exercise, index) => {
    const choice = exercise.choices[0];
    return `<div class="card ex reorder-card" draggable="true" data-ex-card="${exercise.id}"><div class="exhead"><div class="reorder-title"><span class="drag-handle">⋮⋮</span><div><b>${index + 1}. ${escapeHtml(choice.name)}</b><div class="mut">${exerciseSpec(choice)}</div></div></div><div class="row">${videoLink(choice)}<button class="btn mini" data-stats="${escapeHtml(choice.key)}">Stats</button><button class="btn mini" data-edit="${exercise.id}">Edit</button></div></div>${exercise.choices.length > 1 ? `<div class="chips">${exercise.choices.map((item, choiceIndex) => `<span class="chip ${choiceIndex === 0 ? 'on' : ''}">${choiceIndex === 0 ? 'PRIMARY · ' : ''}${escapeHtml(item.name)}</span>`).join('')}</div>` : ''}${exercise.note ? `<p class="note">${escapeHtml(exercise.note)}</p>` : ''}<div class="reorder-fallback"><button data-move-up="${exercise.id}">↑</button><button data-move-down="${exercise.id}">↓</button></div></div>`;
  }).join('') || '<div class="empty">No exercises yet</div>'}
  <div class="row"><button class="btn primary" id="addEx">+ Add exercise</button><button class="btn" id="go">Start workout</button></div>`;

  $('#back').onclick = () => nav('routines');
  $('#rename').onclick = () => {
    const name = prompt('New day name', routine.name);
    if (!name) return;
    routine.name = name.trim();
    save();
    builderView();
  };
  $('#del').onclick = () => {
    if (!confirm('Delete this day?')) return;
    state.routines = state.routines.filter((item) => item.id !== routine.id);
    save(true);
    nav('routines');
  };
  $('#addEx').onclick = () => addExerciseFlow(routine, {
    openEditor: openExerciseEditor,
    onChanged: builderView
  });
  $('#go').onclick = () => startWorkout(routine.id);

  $$('[data-edit]').forEach((button) => {
    button.onclick = () => openExerciseEditor(
      routine,
      routine.exercises.find((exercise) => exercise.id === button.dataset.edit),
      builderView
    );
  });
  $$('[data-stats]').forEach((button) => {
    button.onclick = () => openExercise(button.dataset.stats, 'builder');
  });
  bindExerciseReorder(routine);
}
