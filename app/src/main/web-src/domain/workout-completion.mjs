import { loggedChoices } from './workout-tools.mjs';
import { bestSet, isBetterSet } from './training.mjs';

export function completeWorkout(state, workout, { now = Date.now(), idFactory }) {
  const sessionId = idFactory();
  const details = [];
  const prs = [];
  let completedSets = 0;
  let volume = 0;

  const byKey = new Map();
  workout.r.exercises.flatMap(exercise => loggedChoices(workout, exercise)).forEach(({ choice, rows }) => {
    const entry = byKey.get(choice.key) || { choice, rows: [] };
    entry.rows.push(...rows);
    byKey.set(choice.key, entry);
  });
  byKey.forEach(({ choice, rows }) => {
    const completed = rows
      .filter((set) => set.done)
      .map((set) => ({ w: +set.w || 0, reps: +set.reps || 0 }));

    completed.forEach((set) => {
      completedSets += 1;
      volume += set.w * set.reps;
    });

    state.performance[choice.key] = rows.map((set) => ({
      w: +set.w || 0,
      reps: +set.reps || 0
    }));

    if (!completed.length) return;

    const previousRecord = state.records[choice.key] || null;
    const best = bestSet(completed);
    const entry = {
      sessionId,
      ts: now,
      routineId: workout.r.id,
      routineName: workout.r.name,
      key: choice.key,
      name: choice.name,
      sets: completed,
      maxWeight: Math.max(...completed.map((set) => set.w), 0),
      totalReps: completed.reduce((sum, set) => sum + set.reps, 0)
    };

    state.exerciseLog[choice.key] = [entry, ...(state.exerciseLog[choice.key] || [])].slice(0, 100);
    details.push(entry);

    if (best && isBetterSet(best, previousRecord)) {
      const record = {
        w: best.w,
        reps: best.reps,
        name: choice.name,
        key: choice.key,
        ts: now
      };
      state.records[choice.key] = record;
      prs.push(record);
    }
  });

  const historyEntry = {
    id: sessionId,
    routineId: workout.r.id,
    name: workout.r.name,
    ts: now,
    mins: Math.max(1, Math.round((now - workout.start) / 60_000)),
    durationMs: now - workout.start,
    sets: completedSets,
    vol: volume,
    note: (workout.note || '').trim(),
    details,
    prs
  };

  state.history.unshift(historyEntry);
  state.history = state.history.slice(0, 100);
  return historyEntry;
}
