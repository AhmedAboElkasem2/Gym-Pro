import test from 'node:test';
import assert from 'node:assert/strict';
const nodes = new Map();
const storage = new Map();
globalThis.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) };
globalThis.document = { querySelector(selector) {
  if (!nodes.has(selector)) {
    const classes = new Set();
    nodes.set(selector, {innerHTML:'', dataset:{}, classList:{ contains:k=>classes.has(k), add:k=>classes.add(k), remove:k=>classes.delete(k), toggle:(k,on)=>on?classes.add(k):classes.delete(k) }});
  }
  return nodes.get(selector);
} };
globalThis.window = {GymNative:{}};
const {showRestAlarmDialog, acknowledgeRestAlarm} = await import('../../app/src/main/web-src/features/rest-alarm.mjs');
const {openModal, closeModal} = await import('../../app/src/main/web-src/ui/primitives.mjs');
const {startRestTimer,getRestSeconds,stopRestTimer} = await import('../../app/src/main/web-src/services/timers.mjs');
const modal = document.querySelector('#modal');

test('Hulk dialog cannot close from back, backdrop, click event, or unrelated modal', () => {
  showRestAlarmDialog();
  assert.match(modal.innerHTML,/The Rest Time Is Over, Get up and/);
  assert.equal(closeModal(),false);
  assert.equal(closeModal({type:'click'}),false);
  openModal('unrelated');
  assert.match(modal.innerHTML,/BE HULK/);
});
test('OK acknowledges once and closes the persistent dialog', () => {
  let acknowledgements=0;
  window.GymNative.acknowledgeRestAlarm=()=>acknowledgements++;
  showRestAlarmDialog();
  document.querySelector('#restAlarmOk').onclick();
  assert.equal(acknowledgements,1);
  assert.equal(modal.classList.contains('hide'),true);
});
test('failed native acknowledgement keeps OK available', () => {
  window.GymNative.acknowledgeRestAlarm=()=>{throw Error('bridge failed')};
  showRestAlarmDialog();
  acknowledgeRestAlarm();
  assert.equal(modal.classList.contains('persistent-modal'),true);
});
test('new rest cannot silence an active alarm', () => {
  let cancellations=0;
  window.GymNative.isRestAlarmActive=()=>true;
  window.GymNative.cancelRestAlarm=()=>cancellations++;
  window.VantaLiftRestAlarmActive=showRestAlarmDialog;
  startRestTimer();
  assert.equal(cancellations,0);
  assert.equal(getRestSeconds(),0);
});
test('failed native scheduling does not silently fall back to a background web timer', () => {
  window.GymNative.isRestAlarmActive=()=>false;
  window.GymNative.startRestAlarm=()=>false;
  startRestTimer();
  assert.equal(getRestSeconds(),0);
  assert.equal(storage.has('gympro-rest-deadline'),false);
  stopRestTimer();
});
