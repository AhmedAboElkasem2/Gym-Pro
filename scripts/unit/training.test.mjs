import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESSION_REP_THRESHOLD,
  PROGRESSION_WEIGHT_STEP,
  bestSet,
  progressionSuggestion,
  nextRoutine
} from '../../app/src/main/web-src/domain/training.mjs';

test('progression policy is explicit and stable', () => {
  assert.equal(PROGRESSION_REP_THRESHOLD, 12);
  assert.equal(PROGRESSION_WEIGHT_STEP, 5);
});

test('progression stays hidden below 12 reps', () => {
  const result = progressionSuggestion(
    { press: [{ w: 35, reps: 11 }, { w: 35, reps: 10 }] },
    { unit: 'kg' },
    { key: 'press', sets: 2 }
  );
  assert.equal(result, null);
});

test('one set at 12 or more reps triggers +5kg suggestion', () => {
  for (const reps of [12, 13, 15]) {
    const result = progressionSuggestion(
      { press: [{ w: 35, reps }, { w: 35, reps: 8 }] },
      { unit: 'kg' },
      { key: 'press', sets: 2 }
    );
    assert.ok(result);
    assert.equal(result.nextWeight, 40);
    assert.match(result.text, /40 kg/);
  }
});

test('bestSet prefers weight then reps', () => {
  assert.deepEqual(
    bestSet([{ w: 30, reps: 15 }, { w: 35, reps: 8 }, { w: 35, reps: 10 }]),
    { w: 35, reps: 10 }
  );
});

test('nextRoutine advances from latest logged routine', () => {
  const state = {
    routines: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }],
    history: [{ routineId: 'b', name: 'B' }]
  };
  assert.equal(nextRoutine(state).id, 'c');
});
