import { $, $$ } from '../core/dom.mjs';
import { clone, normalize, uid } from '../core/utils.mjs';
import { state, save } from '../data/store.mjs';
import { getExerciseLibrary } from '../features/exercise-library.mjs';
import { closeModal, escapeHtml, openModal, toast } from '../ui/primitives.mjs';

export function openExerciseEditor(routine, exercise, onDone) {
  const draft = exercise
    ? clone(exercise)
    : {
        id: uid(),
        name: '',
        choices: [{ key: '', name: '', sets: 2, reps: '8-12', warmup: '1~2', rest: '3~5', link: '', preset: [] }],
        note: ''
      };

  draft.choices.forEach((choice) => {
    if (choice._originalName === undefined) choice._originalName = choice.name || '';
    if (choice._originalKey === undefined) choice._originalKey = choice.key || '';
  });

  const performanceText = (choice) => {
    const source = state.performance[choice.key] || choice.preset || [];
    return source.map((set) => `${set.w ?? ''}-${set.reps ?? ''}`).filter((value) => value !== '-').join(', ');
  };

  const parsePerformance = (value) => String(value || '')
    .split(/[\n,،]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/(-?\d+(?:\.\d+)?)\s*(?:-|x|×)\s*(\d+)/i);
      return match ? { w: +match[1], reps: +match[2] } : null;
    })
    .filter(Boolean);

  const syncDraft = () => {
    $$('.choice-editor').forEach((box) => {
      const index = +box.dataset.ci;
      const choice = draft.choices[index];
      if (!choice) return;
      choice.name = box.querySelector('[data-ce="name"]').value.trim();
      choice.sets = Math.max(1, +box.querySelector('[data-ce="sets"]').value || 1);
      choice.reps = box.querySelector('[data-ce="reps"]').value.trim() || '8-12';
      choice.warmup = box.querySelector('[data-ce="warmup"]').value.trim() || '0';
      choice.rest = box.querySelector('[data-ce="rest"]').value.trim();
      choice.link = box.querySelector('[data-ce="link"]').value.trim();
      choice._perf = parsePerformance(box.querySelector('[data-ce="perf"]').value);
    });
    const note = $('#noteEdit');
    if (note) draft.note = note.value.trim();
  };

  const render = () => {
    openModal(`<h2>${exercise ? 'Edit exercise' : 'Add exercise'}</h2>
    <p class="mut">Edit the primary exercise, alternatives, current performance, warm-up, rest and video.</p>
    <div id="choiceEditors">${draft.choices.map((choice, index) => `<div class="choice-editor" data-ci="${index}">
      <div class="choice-edit-head"><b>${index === 0 ? 'PRIMARY' : 'ALTERNATIVE ' + index}</b><div class="row">
        ${index > 0 ? `<button class="btn mini" data-primary="${index}">Make primary</button><button class="btn danger mini" data-removechoice="${index}">Delete option</button>` : ''}
      </div></div>
      <div class="field"><label>EXERCISE NAME</label><div class="name-picker"><input class="input exercise-name-input" autocomplete="off" data-ce="name" data-name-index="${index}" value="${escapeHtml(choice.name || '')}"><div class="name-suggestions" data-name-menu="${index}"></div></div></div>
      <div class="grid2">
        <div class="field"><label>WORKING SETS</label><input type="number" class="input" data-ce="sets" value="${choice.sets || 1}"></div>
        <div class="field"><label>TARGET REPS</label><input class="input" data-ce="reps" value="${escapeHtml(choice.reps || '')}"></div>
        <div class="field"><label>WARM-UP SETS</label><input class="input" data-ce="warmup" value="${escapeHtml(choice.warmup ?? '0')}"></div>
        <div class="field"><label>REST (MIN)</label><input class="input" data-ce="rest" value="${escapeHtml(choice.rest || '')}"></div>
      </div>
      <div class="field"><label>CURRENT WEIGHTS / REPS</label><input class="input" data-ce="perf" placeholder="45-9, 45-8" value="${escapeHtml(performanceText(choice))}"><small class="mut">weight-reps, e.g. 45-9, 45-8</small></div>
      <div class="field"><label>VIDEO LINK</label><input class="input" data-ce="link" value="${escapeHtml(choice.link || '')}"></div>
    </div>`).join('')}</div>
    <button class="btn block" id="addChoice">+ Add alternative</button>
    <div class="field"><label>NOTES</label><textarea id="noteEdit" class="input">${escapeHtml(draft.note || '')}</textarea></div>
    <div class="row edit-actions"><button class="btn" id="cancelEdit">Cancel</button>${exercise ? '<button class="btn danger" id="deleteExercise">Delete exercise</button>' : ''}<button class="btn primary" id="saveExercise">Save changes</button></div>`);

    $('#cancelEdit').onclick = closeModal;

    const showNameSuggestions = (input) => {
      const index = +input.dataset.nameIndex;
      const menu = $('[data-name-menu="' + index + '"]');
      if (!menu) return;
      if (input.value.trim() !== '') {
        menu.classList.remove('show');
        menu.innerHTML = '';
        return;
      }
      const current = draft.choices[index];
      const items = getExerciseLibrary().filter((item) => item.key !== (current?.key || '')).slice(0, 40);
      menu.innerHTML = items.length
        ? items.map((item) => `<button type="button" class="name-suggestion" data-pick-existing="${escapeHtml(item.key)}" data-pick-index="${index}"><span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.source)} · synced</small></span><span>↻</span></button>`).join('')
        : '<div class="name-suggestion-empty">No other exercises yet</div>';
      menu.classList.add('show');

      $$('[data-pick-existing]').forEach((button) => {
        button.onclick = () => {
          syncDraft();
          const targetIndex = +button.dataset.pickIndex;
          const item = getExerciseLibrary().find((entry) => entry.key === button.dataset.pickExisting);
          if (!item) return;
          const chosen = clone(item.choice);
          chosen.key = item.key;
          chosen._pickedKey = item.key;
          chosen._originalKey = item.key;
          chosen._originalName = chosen.name;
          const latest = state.performance[item.key];
          if (latest?.length) chosen.preset = clone(latest);
          draft.choices[targetIndex] = chosen;
          if (targetIndex === 0 && item.note) draft.note = item.note;
          render();
        };
      });
    };

    $$('.exercise-name-input').forEach((input) => {
      input.oninput = () => showNameSuggestions(input);
      input.onfocus = () => showNameSuggestions(input);
    });

    $('#addChoice').onclick = () => {
      syncDraft();
      const primary = draft.choices[0] || {};
      draft.choices.push({
        key: '',
        name: '',
        sets: primary.sets || 2,
        reps: primary.reps || '8-12',
        warmup: primary.warmup ?? '0',
        rest: primary.rest || '',
        link: '',
        preset: [],
        _originalName: '',
        _originalKey: ''
      });
      render();
    };

    $$('[data-removechoice]').forEach((button) => {
      button.onclick = () => {
        syncDraft();
        if (draft.choices.length <= 1) return toast('Keep at least one option');
        draft.choices.splice(+button.dataset.removechoice, 1);
        render();
      };
    });

    $$('[data-primary]').forEach((button) => {
      button.onclick = () => {
        syncDraft();
        const index = +button.dataset.primary;
        const [selected] = draft.choices.splice(index, 1);
        draft.choices.unshift(selected);
        render();
      };
    });

    if (exercise) {
      $('#deleteExercise').onclick = () => {
        if (!confirm('Delete this exercise completely?')) return;
        routine.exercises = routine.exercises.filter((item) => item.id !== exercise.id);
        save();
        closeModal();
        onDone();
      };
    }

    $('#saveExercise').onclick = () => {
      syncDraft();
      if (!draft.choices.length || !draft.choices[0].name) return toast('Exercise name required');

      draft.choices = draft.choices.filter((choice) => choice.name).map((choice) => {
        const oldKey = choice.key;
        const originalName = choice._originalName ?? choice.name;
        const originalKey = choice._originalKey || oldKey;
        const manuallyRenamed = normalize(choice.name) !== normalize(originalName);
        const newKey = choice._pickedKey || (originalKey && !manuallyRenamed ? originalKey : normalize(choice.name));
        const performance = choice._perf || [];

        delete choice._perf;
        delete choice._pickedKey;
        delete choice._originalName;
        delete choice._originalKey;

        if (oldKey && oldKey !== newKey && state.performance[oldKey] && !state.performance[newKey]) {
          state.performance[newKey] = state.performance[oldKey];
        }
        if (performance.length) state.performance[newKey] = performance;

        choice.key = newKey;
        choice.preset = performance.length
          ? performance
          : state.performance[newKey]
            ? clone(state.performance[newKey])
            : (choice.preset || []);
        return choice;
      });

      if (!draft.choices.length) return toast('Keep at least one exercise option');
      draft.name = draft.choices[0].name;
      if (exercise) Object.assign(exercise, draft);
      else routine.exercises.push(draft);
      save();
      closeModal();
      onDone();
      toast('Exercise updated');
    };
  };

  render();
}
