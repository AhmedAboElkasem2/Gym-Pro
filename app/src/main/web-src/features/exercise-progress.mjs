import { $, $$ } from '../core/dom.mjs';
import { escapeHtml } from '../core/utils.mjs';
import { progressSeries } from '../domain/progress.mjs';

const labels = { weight: 'Top weight', reps: 'Best reps', volume: 'Session volume' };

export function progressPanel() {
  return `<section class="card"><div class="section compact"><h3>Your progress</h3><select id="trendRange" class="input trend-range" aria-label="Chart range"><option value="8">Last 8</option><option value="20" selected>Last 20</option><option value="100">All saved</option></select></div><div class="chips">${Object.entries(labels).map(([key, label]) => `<button class="chip ${key === 'weight' ? 'on' : ''}" data-metric="${key}">${label}</button>`).join('')}</div><div id="trendGraph"></div></section>`;
}

export function bindProgress(entries, unit) {
  let metric = 'weight';
  const paint = () => {
    const series = progressSeries(entries, metric, +$('#trendRange').value);
    const suffix = metric === 'reps' ? 'reps' : metric === 'volume' ? `${unit}·reps` : unit;
    if (!series.length) { $('#trendGraph').innerHTML = '<p class="mut">Complete a session to start your chart.</p>'; return; }
    const maximum = Math.max(1, ...series.map(point => point.value));
    const points = series.map((point, index) => ({ ...point, x: series.length === 1 ? 160 : 30 + index / (series.length - 1) * 260, y: 132 - point.value / maximum * 106 }));
    const last = series.at(-1), previous = series.at(-2);
    const delta = previous ? last.value - previous.value : null;
    const date = ts => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    $('#trendGraph').innerHTML = `<div class="trend-summary"><strong>${last.value.toLocaleString()} <small>${escapeHtml(suffix)}</small></strong><span class="mut">${delta === null ? 'First session' : `${delta > 0 ? '+' : ''}${delta.toLocaleString()} vs previous`}</span></div>
      <svg class="trend-chart" viewBox="0 0 320 166" role="img" aria-label="${labels[metric]} across ${series.length} sessions">
      ${[0, .5, 1].map(fraction => `<line x1="30" x2="290" y1="${132 - fraction * 106}" y2="${132 - fraction * 106}" stroke="#30343c"/><text x="26" y="${136 - fraction * 106}" text-anchor="end" fill="#a5a9b3" font-size="9">${Math.round(maximum * fraction)}</text>`).join('')}
      <polyline points="${points.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="#ff5867" stroke-width="3" stroke-linejoin="round"/>
      ${points.map((p, index) => `<circle class="trend-point" data-trend-point="${index}" cx="${p.x}" cy="${p.y}" r="5" fill="#fff" stroke="#ff5867" stroke-width="2" tabindex="0" role="button" aria-label="${escapeHtml(date(p.ts))}: ${p.value} ${escapeHtml(suffix)}"><title>${escapeHtml(date(p.ts))}: ${p.value}</title></circle>`).join('')}
      <text x="30" y="157" fill="#a5a9b3" font-size="10">${escapeHtml(date(series[0].ts))}</text><text x="290" y="157" text-anchor="end" fill="#a5a9b3" font-size="10">${escapeHtml(date(last.ts))}</text></svg>
      <div class="mut trend-detail" id="trendDetail" aria-live="polite">Tap a point for the session value</div>`;
    $$('[data-trend-point]').forEach(point => {
      const select = () => { const entry = series[+point.dataset.trendPoint]; $('#trendDetail').textContent = `${date(entry.ts)} · ${entry.value.toLocaleString()} ${suffix}`; };
      point.onclick = select;
      point.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') select(); };
    });
  };
  $$('[data-metric]').forEach(button => { button.onclick = () => { metric = button.dataset.metric; $$('[data-metric]').forEach(b => b.classList.toggle('on', b === button)); paint(); }; });
  $('#trendRange').onchange = paint;
  paint();
}
