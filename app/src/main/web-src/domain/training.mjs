export const PROGRESSION_REP_THRESHOLD = 12;
export const PROGRESSION_WEIGHT_STEP = 5;

export function bestSet(sets = []) {
  return sets
    .map((set) => ({ w: +set.w || 0, reps: +set.reps || 0 }))
    .filter((set) => set.w > 0 || set.reps > 0)
    .sort((a, b) => b.w - a.w || b.reps - a.reps)[0] || null;
}

export function isBetterSet(candidate, current) {
  return Boolean(
    candidate &&
    (!current || candidate.w > current.w || (candidate.w === current.w && candidate.reps > current.reps))
  );
}

export function progressionSuggestion(performance, settings, exercise) {
  const sets = (performance[exercise.key] || []).filter(
    (set) => (+set.w || 0) > 0 || (+set.reps || 0) > 0
  );
  if (!sets.length) return null;

  const workingSets = sets.slice(0, Math.max(1, +exercise.sets || 1));
  const qualifyingSets = workingSets.filter(
    (set) => (+set.reps || 0) >= PROGRESSION_REP_THRESHOLD
  );
  if (!qualifyingSets.length) return null;

  const topWeight = Math.max(...qualifyingSets.map((set) => +set.w || 0), 0);
  return {
    ready: true,
    nextWeight: topWeight + PROGRESSION_WEIGHT_STEP,
    text: `${PROGRESSION_REP_THRESHOLD}+ reps reached · consider ${topWeight + PROGRESSION_WEIGHT_STEP} ${settings.unit} next time`
  };
}

export function nextRoutine(state) {
  if (!state.routines.length) return null;
  const last = state.history[0];
  if (!last) return state.routines[0];
  const index = state.routines.findIndex(
    (routine) => routine.id === last.routineId || routine.name === last.name
  );
  return state.routines[(index < 0 ? 0 : index + 1) % state.routines.length];
}

export function workoutStreak(history, now = new Date()) {
  const days = [...new Set(history.map((entry) => {
    const date = new Date(entry.ts);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }))].sort((a, b) => b - a);
  if (!days.length) return 0;

  const dayMs = 86_400_000;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (today.getTime() - days[0] > dayMs) return 0;

  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (Math.round((days[index - 1] - days[index]) / dayMs) === 1) streak += 1;
    else break;
  }
  return streak;
}

export function latestPr(records) {
  return Object.values(records || {})
    .filter((record) => record && record.ts > 0)
    .sort((a, b) => b.ts - a.ts)[0] || null;
}

export function recordCount(records) {
  return Object.values(records || {}).filter((record) => record && record.ts > 0).length;
}

export function rebuildRecords(performance = {}, exerciseLog = {}) {
  const records = {};
  Object.entries(performance).forEach(([key, sets]) => {
    const best = bestSet(sets);
    if (best) records[key] = { ...best, name: key, key, ts: 0 };
  });

  Object.entries(exerciseLog).forEach(([key, entries]) => {
    (entries || []).slice().reverse().forEach((entry) => {
      (entry.sets || []).forEach((set) => {
        const current = records[key];
        if (isBetterSet(set, current)) {
          records[key] = {
            w: +set.w || 0,
            reps: +set.reps || 0,
            name: entry.name || key,
            key,
            ts: entry.ts || 0
          };
        }
      });
    });
  });
  return records;
}

export function buildExerciseLibrary(state, normalize, clone) {
  const map = new Map();
  state.routines.forEach((day) => {
    day.exercises.forEach((group) => {
      group.choices.forEach((choice) => {
        const key = choice.key || normalize(choice.name);
        if (!key || !choice.name) return;
        if (!map.has(key)) {
          map.set(key, {
            key,
            name: choice.name,
            choice: clone(choice),
            note: group.note || '',
            source: day.name
          });
        }
      });
    });
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
