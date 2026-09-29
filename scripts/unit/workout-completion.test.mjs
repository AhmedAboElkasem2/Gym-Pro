import test from 'node:test';
import assert from 'node:assert/strict';
import { completeWorkout } from '../../app/src/main/web-src/domain/workout-completion.mjs';

test('workout completion updates performance, history, exercise log, and PRs', () => {
  const state = {
    performance: {},
    records: { press: { w: 30, reps: 10, name: 'Press', key: 'press', ts: 1 } },
    exerciseLog: {},
    history: []
  };
  const workout = {
    start: 1_000,
    note: 'solid session',
    r: {
      id: 'day-a',
      name: 'Day A',
      exercises: [{
        id: 'exercise-1',
        choices: [{ key: 'press', name: 'Press' }]
      }]
    },
    choiceKeys: { 'exercise-1': 'press' },
    rows: {
      'exercise-1': [
        { w: 35, reps: 12, done: true },
        { w: 35, reps: 8, done: true }
      ]
    }
  };

  const result = completeWorkout(state, workout, {
    now: 61_000,
    idFactory: () => 'session-1'
  });

  assert.equal(result.id, 'session-1');
  assert.equal(result.sets, 2);
  assert.equal(result.mins, 1);
  assert.equal(result.note, 'solid session');
  assert.equal(result.prs.length, 1);
  assert.deepEqual(state.performance.press, [{ w: 35, reps: 12 }, { w: 35, reps: 8 }]);
  assert.equal(state.exerciseLog.press[0].sessionId, 'session-1');
  assert.equal(state.records.press.w, 35);
  assert.equal(state.records.press.reps, 12);
  assert.equal(state.history[0].id, 'session-1');
});

test('unfinished sets do not enter detailed history', () => {
  const state = { performance: {}, records: {}, exerciseLog: {}, history: [] };
  const workout = {
    start: 0,
    note: '',
    r: { id: 'd', name: 'D', exercises: [{ id: 'e', choices: [{ key: 'k', name: 'K' }] }] },
    choiceKeys: { e: 'k' },
    rows: { e: [{ w: 50, reps: 10, done: false }] }
  };
  const result = completeWorkout(state, workout, { now: 60_000, idFactory: () => 'x' });
  assert.equal(result.sets, 0);
  assert.equal(result.details.length, 0);
  assert.equal(state.exerciseLog.k, undefined);
});
