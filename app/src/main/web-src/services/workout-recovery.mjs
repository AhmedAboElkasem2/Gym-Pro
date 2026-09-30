import { session } from '../core/session.mjs';
import { state } from '../data/store.mjs';
import { loadActiveWorkout, saveActiveWorkout } from '../data/active-workout.mjs';
import { toast } from '../ui/primitives.mjs';

export function persistWorkout() {
  try { saveActiveWorkout(session.workout); }
  catch { toast('Could not save your active workout. Check available storage.'); }
}

export function restoreWorkout() {
  session.workout = loadActiveWorkout(localStorage, state.history);
  return session.workout ? 'workout' : 'home';
}
