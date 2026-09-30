import { $, dom } from '../core/dom.mjs';
import { closeModal, openModal, toast } from '../ui/primitives.mjs';

export const REST_COMPLETE_MESSAGE =
  'The Rest Time Is Over, Get up and BE HULK';

export function showRestAlarmDialog() {
  if (dom.modal.dataset.variant === 'rest-alarm' && !dom.modal.classList.contains('hide')) return;
  openModal(
    `<div class="rest-alarm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="restAlarmTitle">
      <div class="rest-alarm-badge">REST COMPLETE</div>
      <div class="rest-alarm-icon" aria-hidden="true">⚡</div>
      <h2 id="restAlarmTitle">The Rest Time Is Over, Get up and <span>BE HULK</span></h2>
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
    closeModal(true);
  } catch {
    toast('Could not stop the alarm. Tap OK to retry.');
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
