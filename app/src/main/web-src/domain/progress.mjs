export function metricValue(entry, metric) {
  const sets = entry.sets || [];
  if (metric === 'reps') return Math.max(0, ...sets.map(set => +set.reps || 0));
  if (metric === 'volume') return sets.reduce((sum, set) => sum + (+set.w || 0) * (+set.reps || 0), 0);
  return Math.max(0, ...sets.map(set => +set.w || 0));
}

export function progressSeries(entries, metric = 'weight', limit = 20) {
  return entries.slice().sort((a, b) => a.ts - b.ts).slice(-limit).map(entry => ({
    ts: entry.ts, value: metricValue(entry, metric)
  }));
}
