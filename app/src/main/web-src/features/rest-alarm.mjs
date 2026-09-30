import { $, dom } from '../core/dom.mjs';
import { closeModal, openModal } from '../ui/primitives.mjs';

export const REST_COMPLETE_MESSAGE =
  'The Rest Time Is Over , Get up and BE HULK';

export function showRestAlarmDialog() {
  openModal(
    `<div class="rest-alarm-dialog">
      <div class="rest-alarm-badge">REST COMPLETE</div>
      <div class="rest-alarm-icon" aria-hidden="true">⚡</div>
      <h2>The Rest Time Is Over , Get up and <span>BE HULK</span></h2>
      <p>Your next set is waiting.</p>
      <button class="btn rest-alarm-ok" id="restAlarmOk">OK</button>
    </div>`,
    { persistent: true, variant: 'rest-alarm' }
  );

  $('#restAlarmOk').onclick = acknowledgeRestAlarm;
}

export function acknowledgeRestAlarm() {
  try {
    window.GymNative?.acknowledgeRestAlarm?.();
  } finally {
    closeModal(true);
  }
}

export function bindNativeRestAlarmCallbacks() {
  window.VantaLiftRestAlarmActive = showRestAlarmDialog;

  try {
    if (window.GymNative?.isRestAlarmActive?.()) {
      showRestAlarmDialog();
    }
  } catch {}
}
