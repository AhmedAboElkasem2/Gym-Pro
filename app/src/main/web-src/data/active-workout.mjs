// Separate from completed history/backups: this is a recoverable, unfinished session.
export const ACTIVE_WORKOUT_KEY = 'vantalift-active-workout-v1';

export function saveActiveWorkout(workout, storage = localStorage) {
  if (!workout) { storage.removeItem(ACTIVE_WORKOUT_KEY); return; }
  storage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({version: 1, workout}));
}

export function loadActiveWorkout(storage = localStorage, history = []) {
  try {
    const value = JSON.parse(storage.getItem(ACTIVE_WORKOUT_KEY) || 'null');
    const w = value?.workout;
    if (value?.version !== 1 || !w || typeof w.id !== 'string' || !Number.isFinite(w.start)
        || !Array.isArray(w.r?.exercises) || !w.r.exercises.length || !w.choiceKeys || !w.rows || !w.warm) return null;
    if (history.some(entry => entry.id === w.id)) {
      storage.removeItem(ACTIVE_WORKOUT_KEY);
      return null;
    }
    for (const exercise of w.r.exercises) {
      if (!Array.isArray(exercise.choices) || !exercise.choices.length
          || !exercise.choices.some(choice => choice.key === w.choiceKeys[exercise.id])
          || !Array.isArray(w.rows[exercise.id]) || !Array.isArray(w.warm[exercise.id])
          || w.rows[exercise.id].some(row => !row || typeof row.done !== 'boolean')) return null;
    }
    return w;
  } catch { return null; }
}
