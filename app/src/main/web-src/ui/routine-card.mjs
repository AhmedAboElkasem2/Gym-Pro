import { $$ } from '../core/dom.mjs';
import { escapeHtml } from '../core/utils.mjs';

export function routineCardHtml(routine, index) {
  const workingSets = routine.exercises.reduce(
    (total, exercise) => total + (+exercise.choices[0].sets || 0),
    0
  );
  return `<div class="card routine" data-r="${routine.id}"><div class="idx">${String(index + 1).padStart(2, '0')}</div><div class="grow"><h3>${escapeHtml(routine.name)}</h3><p>${routine.exercises.length} exercise groups · ${workingSets} working sets</p></div><div class="routine-actions"><button class="btn editday" data-editday="${routine.id}">Edit</button><button class="btn" data-start="${routine.id}">Start</button></div></div>`;
}

export function bindRoutineCards({ onOpen, onEdit, onStart }) {
  $$('[data-r]').forEach((element) => {
    element.onclick = (event) => {
      if (event.target.closest('[data-start],[data-editday]')) return;
      onOpen(element.dataset.r);
    };
  });
  $$('[data-editday]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      onEdit(button.dataset.editday);
    };
  });
  $$('[data-start]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      onStart(button.dataset.start);
    };
  });
}
