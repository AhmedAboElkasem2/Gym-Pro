import test from 'node:test';
import assert from 'node:assert/strict';
import { switchChoice, focusTarget, advanceFocus } from '../../app/src/main/web-src/domain/workout-tools.mjs';
import { completeWorkout } from '../../app/src/main/web-src/domain/workout-completion.mjs';
import { progressSeries } from '../../app/src/main/web-src/domain/progress.mjs';
import { saveActiveWorkout, loadActiveWorkout } from '../../app/src/main/web-src/data/active-workout.mjs';

function fixture() {
  const a = { key: 'a', name: 'Machine press', sets: 2 }, b = { key: 'b', name: 'Dumbbell press', sets: 2 };
  const group = { id: 'g', choices: [a, b] };
  const workout = { id: 'session', r: { id: 'routine', name: 'Push', exercises: [group] }, start: 100,
    rows: { g: [{ w: 60, reps: 10, done: true }, { w: 60, reps: 9, done: false }] },
    warm: { g: [{ w: 20, reps: 10 }] }, choiceKeys: { g: 'a' } };
  return { group, workout, a, b };
}
const blank = () => [{ w: 25, reps: 8, done: false }];

test('switching away and back restores sets and warmups without mixing histories', () => {
  const { group, workout, a, b } = fixture();
  switchChoice(workout, group, b, blank);
  workout.rows.g[0].done = true;
  switchChoice(workout, group, a, blank);
  assert.equal(workout.rows.g[0].w, 60);
  assert.equal(workout.rows.g[0].done, true);
  assert.equal(workout.warm.g[0].w, 20);
  switchChoice(workout, group, b, blank);
  assert.equal(workout.rows.g[0].w, 25);
  assert.equal(workout.rows.g[0].done, true);
  const state = { performance: {}, records: {}, exerciseLog: {}, history: [] };
  const result = completeWorkout(state, workout, { now: 600100, idFactory: () => 'session' });
  assert.equal(result.sets, 2);
  assert.equal(result.vol, 800);
  assert.equal(state.exerciseLog.a[0].sets[0].w, 60);
  assert.equal(state.exerciseLog.b[0].sets[0].w, 25);
});

test('substitutions and focus cursor survive a process recreation', () => {
  const { group, workout, b } = fixture();
  switchChoice(workout, group, b, blank);
  workout.focusMode = true;
  advanceFocus(workout);
  const map = new Map(), storage = { setItem: (k, v) => map.set(k, v), getItem: k => map.get(k), removeItem: k => map.delete(k) };
  saveActiveWorkout(workout, storage);
  assert.deepEqual(loadActiveWorkout(storage), workout);
});

test('focus advances to the next unfinished set and allows review after completion', () => {
  const { workout } = fixture();
  assert.equal(focusTarget(workout).index, 1);
  workout.rows.g[1].done = true;
  advanceFocus(workout);
  assert.equal(focusTarget(workout).index, 1);
});

test('charts sort sessions and separate top weight, best reps and volume', () => {
  const entries = [{ ts: 20, sets: [{ w: 50, reps: 10 }, { w: 55, reps: 8 }] }, { ts: 10, sets: [{ w: 40, reps: 12 }] }];
  assert.deepEqual(progressSeries(entries).map(p => p.value), [40, 55]);
  assert.deepEqual(progressSeries(entries, 'reps').map(p => p.value), [12, 10]);
  assert.equal(progressSeries(entries, 'volume', 1)[0].value, 940);
  assert.equal(entries[0].ts, 20);
});
