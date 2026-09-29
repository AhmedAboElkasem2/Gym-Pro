import { $, $$ } from '../core/dom.mjs';
import { clone, normalize, uid } from '../core/utils.mjs';
import { state, save } from '../data/store.mjs';
import { buildExerciseLibrary } from '../domain/training.mjs';
import { closeModal, escapeHtml, openModal, toast } from '../ui/primitives.mjs';

export function getExerciseLibrary() {
  return buildExerciseLibrary(state, normalize, clone);
}

export function addExerciseFlow(routine, { openEditor, onChanged }) {
  const inDay = new Set(
    routine.exercises.flatMap((exercise) => exercise.choices.map((choice) => choice.key || normalize(choice.name)))
  );
  const library = getExerciseLibrary().filter((item) => !inDay.has(item.key));

  const draw = (items) => {
    const box = $('#existingExerciseList');
    if (!box) return;
    box.innerHTML = items.length
      ? items.map((item) => `<button class="existing-exercise" data-existing="${escapeHtml(item.key)}"><span><b>${escapeHtml(item.name)}</b><small>From ${escapeHtml(item.source)} · weights & reps synced</small></span><span class="syncmark">SYNC +</span></button>`).join('')
      : '<div class="empty">No matching exercises</div>';

    $$('[data-existing]').forEach((button) => {
      button.onclick = () => {
        const item = library.find((entry) => entry.key === button.dataset.existing);
        if (!item) return;
        const exercise = clone(item.choice);
        exercise.key = item.key;
        const latest = state.performance[item.key];
        if (latest?.length) exercise.preset = clone(latest);
        routine.exercises.push({
          id: uid(),
          name: exercise.name,
          choices: [exercise],
          note: item.note || ''
        });
        save();
        closeModal();
        onChanged();
        toast('Existing exercise added & synced');
      };
    });
  };

  openModal(
    '<h2>Add exercise</h2>' +
    '<p class="mut">Reuse an existing exercise to keep weights and reps synced between training days, or create a completely new one.</p>' +
    '<button class="btn primary block" id="createNewExercise">+ Create New Exercise</button>' +
    '<div class="section"><h3>Add Existing Exercise</h3><span>SYNCED</span></div>' +
    '<div class="field"><input id="existingSearch" class="input" placeholder="Search exercises..."></div>' +
    '<div id="existingExerciseList"></div>' +
    '<button class="btn block" id="cancelAddExercise">Cancel</button>'
  );

  $('#createNewExercise').onclick = () => openEditor(routine, null, onChanged);
  $('#cancelAddExercise').onclick = closeModal;
  $('#existingSearch').oninput = (event) => {
    const query = normalize(event.target.value);
    draw(library.filter((item) => normalize(item.name).includes(query)));
  };
  draw(library);
}
