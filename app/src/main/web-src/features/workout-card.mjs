import { $ } from '../core/dom.mjs';
import { state, save } from '../data/store.mjs';
import { openModal, closeModal, escapeHtml, toast } from '../ui/primitives.mjs';

function text(ctx, value, x, y, size, color = '#fff', maxWidth = 920) {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px sans-serif`;
  while (ctx.measureText(String(value)).width > maxWidth && size > 18) {
    size -= 2; ctx.font = `700 ${size}px sans-serif`;
  }
  ctx.fillText(String(value), x, y, maxWidth);
}

export function drawWorkoutCard(canvas, history, athlete, unit) {
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, '#211319'); gradient.addColorStop(.45, '#101217'); gradient.addColorStop(1, '#08090c');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = '#ff465a'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(840, 0); ctx.lineTo(1080, 330); ctx.stroke();
  ctx.globalAlpha = .16; ctx.lineWidth = 100;
  ctx.beginPath(); ctx.moveTo(1030, 0); ctx.lineTo(500, 1920); ctx.stroke(); ctx.globalAlpha = 1;
  text(ctx, 'VantaLift', 80, 150, 62);
  text(ctx, 'SESSION COMPLETE', 80, 258, 26, '#ff6473');
  text(ctx, athlete || 'ATHLETE', 80, 356, 58);
  text(ctx, history.name || 'Workout', 80, 443, 50, '#c5c8d1');
  text(ctx, new Date(history.ts).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }), 80, 510, 28, '#898e9a');
  const metrics = [
    [Math.max(1, Math.round((history.durationMs || history.mins * 60_000) / 60_000)), 'MINUTES'],
    [history.sets || 0, 'WORKING SETS'],
    [(Math.round((+history.vol || 0) * 10) / 10).toLocaleString(), `VOLUME · ${unit} × REPS`],
    [history.prs?.length || 0, 'PERSONAL RECORDS']
  ];
  metrics.forEach(([value, label], index) => {
    const x = index % 2 ? 560 : 80, y = 645 + Math.floor(index / 2) * 245;
    ctx.fillStyle = '#1b1e26'; ctx.fillRect(x, y, 440, 205);
    text(ctx, value, x + 30, y + 105, 76, '#fff', 380);
    text(ctx, label, x + 30, y + 163, 21, '#ff6a78', 380);
  });
  const records = history.prs || [];
  text(ctx, records.length ? 'NEW PERSONAL BESTS' : 'BUILT ONE SET AT A TIME.', 80, 1215, 30, '#ff6473');
  records.slice(0, 3).forEach((record, index) => {
    const y = 1310 + index * 125;
    text(ctx, record.name, 80, y, 32, '#fff');
    text(ctx, `${record.w} ${unit} × ${record.reps}`, 80, y + 49, 34, '#aeb5c3');
  });
  if (records.length > 3) text(ctx, `+ ${records.length - 3} more records`, 80, 1690, 24, '#aeb5c3');
  text(ctx, 'SHOW UP. LIFT. REPEAT.', 80, 1800, 37);
  text(ctx, 'VANTALIFT / TRAINING LOG', 80, 1855, 20, '#777f8d');
}

export function openWorkoutCard(history) {
  openModal(`<h2>Your session. Your story.</h2><label class="mut">Name on card<input id="cardAthlete" class="input" maxlength="40" value="${escapeHtml(state.settings.athleteName || '')}" placeholder="Your name"></label><canvas id="workoutCardCanvas" class="workout-share-preview" aria-label="Workout achievement card"></canvas><div class="row"><button class="btn primary" id="shareCard">Share image</button><button class="btn" id="saveCard">Save PNG</button><button class="btn" id="closeCard">Close</button></div>`);
  const canvas = $('#workoutCardCanvas');
  const paint = () => drawWorkoutCard(canvas, history, $('#cardAthlete').value, state.settings.unit);
  $('#cardAthlete').oninput = paint;
  $('#closeCard').onclick = closeModal;
  const exportImage = async share => {
    state.settings.athleteName = $('#cardAthlete').value.trim(); save();
    const data = canvas.toDataURL('image/png');
    try {
      if (window.GymNative?.exportWorkoutCard) { window.GymNative.exportWorkoutCard(data, share); return; }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'VantaLift-workout.png', { type: 'image/png' });
      if (share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] });
      else { const anchor = document.createElement('a'); anchor.href = data; anchor.download = file.name; anchor.click(); }
    } catch (error) { if (error.name !== 'AbortError') toast('Could not export image. Please try again.'); }
  };
  $('#shareCard').onclick = () => exportImage(true);
  $('#saveCard').onclick = () => exportImage(false);
  window.GymProCardSaved = () => toast('Workout image saved');
  paint();
}
