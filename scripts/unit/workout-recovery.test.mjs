import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_WORKOUT_KEY, saveActiveWorkout, loadActiveWorkout } from '../../app/src/main/web-src/data/active-workout.mjs';
const values = new Map();
const storage = {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
const workout = {id:'session-1',start:12345,r:{name:'Day A',exercises:[{id:'e1',choices:[{key:'bench',name:'Bench'}]}]},choiceKeys:{e1:'bench'},rows:{e1:[{w:'60',reps:'10',done:true},{w:'60',reps:'',done:false}]},warm:{e1:[{w:'20',reps:'10'}]},note:'Keep elbows tucked'};

test('fresh process restores same workout, working/warmup sets, note and clock start',()=>{
  saveActiveWorkout(workout,storage);
  const recovered=loadActiveWorkout(storage,[]);
  assert.deepEqual(recovered,workout);
  assert.notEqual(recovered,workout);
});
test('each edit replaces the recovery snapshot',()=>{
  saveActiveWorkout({...workout,note:'Updated',rows:{e1:[{w:'65',reps:'9',done:true}]}},storage);
  assert.equal(loadActiveWorkout(storage).rows.e1[0].w,'65');
  assert.equal(loadActiveWorkout(storage).note,'Updated');
});
test('completed session cannot resurrect if process dies between history save and snapshot clear',()=>{
  saveActiveWorkout(workout,storage);
  assert.equal(loadActiveWorkout(storage,[{id:'session-1'}]),null);
  assert.equal(storage.has?.(ACTIVE_WORKOUT_KEY) ?? values.has(ACTIVE_WORKOUT_KEY),false);
});
test('explicit exit clears unfinished session',()=>{
  saveActiveWorkout(workout,storage);saveActiveWorkout(null,storage);
  assert.equal(loadActiveWorkout(storage),null);
});
test('corrupt or incomplete snapshot never breaks startup',()=>{
  for(const raw of ['{','null',JSON.stringify({version:1,workout:{...workout,rows:{}}}),JSON.stringify({version:99,workout})]) {
    storage.setItem(ACTIVE_WORKOUT_KEY,raw);assert.equal(loadActiveWorkout(storage),null);
  }
});
