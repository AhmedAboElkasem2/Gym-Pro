import { $, dom } from '../core/dom.mjs';
import { state } from '../data/store.mjs';
import { escapeHtml } from '../core/utils.mjs';

export function toast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), 1500);
}

export function openModal(html, options = {}) {
  dom.modal.innerHTML = `<div class="sheet">${html}</div>`;
  dom.modal.classList.toggle('persistent-modal', Boolean(options.persistent));
  dom.modal.dataset.variant = options.variant || '';
  dom.modal.classList.remove('hide');
}

export function closeModal(force = false) {
  if (!force && dom.modal.classList.contains('persistent-modal')) return false;
  dom.modal.classList.add('hide');
  dom.modal.classList.remove('persistent-modal');
  dom.modal.dataset.variant = '';
  dom.modal.innerHTML = '';
  return true;
}

export function choice(exercise, key) {
  return exercise.choices.find((item) => item.key === key) || exercise.choices[0];
}

export function blankRows(exercise) {
  const source = state.performance[exercise.key] || exercise.preset || [];
  const count = Math.max(1, +exercise.sets || 1);
  return Array.from({ length: count }, (_, index) => ({
    w: source[index]?.w ?? '',
    reps: source[index]?.reps ?? '',
    done: false
  }));
}

export function videoLink(exercise) {
  return exercise.link
    ? `<a class="video" href="${escapeHtml(exercise.link)}" title="Exercise video">▶</a>`
    : '';
}

export function exerciseSpec(exercise) {
  const warmup = exercise.warmup && exercise.warmup !== '0'
    ? ` · warm-up ${escapeHtml(exercise.warmup)}`
    : ' · no warm-up';
  const rest = exercise.rest ? ` · rest ${escapeHtml(exercise.rest)} min` : '';
  return `${exercise.sets} sets × ${escapeHtml(exercise.reps)} reps${warmup}${rest}`;
}

export function bindModalBackdrop() {
  dom.modal.onclick = (event) => {
    if (event.target === dom.modal) closeModal();
  };
}

export { $, escapeHtml };
