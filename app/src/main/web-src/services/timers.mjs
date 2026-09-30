import { $ } from '../core/dom.mjs';
import { state } from '../data/store.mjs';
import { session } from '../core/session.mjs';
import { toast } from '../ui/primitives.mjs';

const REST_DEADLINE_KEY = 'gympro-rest-deadline';

let restTimerId = null;
let restSeconds = 0;
let workoutClockId = null;
let restDeadline = +(localStorage.getItem(REST_DEADLINE_KEY) || 0);
let nativeRestScheduled = false;

export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor((+ms || 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function formatRest(seconds) {
  const value = Math.max(0, +seconds || 0);
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function getRestSeconds() {
  return restSeconds;
}

export function paintWorkoutClock() {
  if (!session.workout) return;
  const element = $('#workoutClock b');
  if (element) element.textContent = formatElapsed(Date.now() - session.workout.start);
}

export function startWorkoutClock() {
  stopWorkoutClock();
  paintWorkoutClock();
  if (session.workout) workoutClockId = setInterval(paintWorkoutClock, 1000);
}

export function stopWorkoutClock() {
  if (workoutClockId) clearInterval(workoutClockId);
  workoutClockId = null;
}

function scheduleNativeRest(seconds) {
  try {
    return Boolean(
      window.GymNative?.startRestAlarm &&
      window.GymNative.startRestAlarm(Math.max(1, Math.round(seconds)))
    );
  } catch {
    return false;
  }
}

function cancelNativeRest() {
  try {
    window.GymNative?.cancelRestAlarm?.();
  } catch {}
}

function fallbackRestAlarm() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const now = context.currentTime;
    [0, .35, .7].forEach((delay, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = index === 1 ? 900 : 1200;
      gain.gain.setValueAtTime(.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(.35, now + delay + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + .22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + .24);
    });
  } catch {}
}

function paintRestTimer() {
  const button = $('#restBtn');
  if (button) button.textContent = `Rest ${formatRest(restSeconds)}`;
}

function restCompleted() {
  if (restTimerId) clearInterval(restTimerId);
  restTimerId = null;
  restSeconds = 0;
  restDeadline = 0;
  localStorage.removeItem(REST_DEADLINE_KEY);
  paintRestTimer();
  toast('Rest complete');
  if (!window.GymNative && !nativeRestScheduled) fallbackRestAlarm();
  nativeRestScheduled = false;
}

export function tickRest() {
  if (window.GymNative?.getRestRemainingMillis) {
    const remaining = Number(window.GymNative.getRestRemainingMillis());
    if (remaining > 0) restDeadline = Date.now() + remaining;
    else if (restDeadline && !window.GymNative.isRestAlarmActive?.()) {
      // A notification Skip must clear the web timer without playing a completion alert.
      stopRestTimer(true, false);
      return;
    }
  }
  if (!restDeadline) return;
  restSeconds = Math.max(0, Math.ceil((restDeadline - Date.now()) / 1000));
  paintRestTimer();
  if (restSeconds <= 0) restCompleted();
}

export function startRestTimer() {
  if (window.GymNative?.isRestAlarmActive?.()) {
    window.VantaLiftRestAlarmActive?.();
    return;
  }
  stopRestTimer(true, true);
  restSeconds = Math.max(30, +state.settings.rest || 180);
  restDeadline = Date.now() + restSeconds * 1000;
  localStorage.setItem(REST_DEADLINE_KEY, String(restDeadline));
  nativeRestScheduled = scheduleNativeRest(restSeconds);
  if (window.GymNative && !nativeRestScheduled) {
    stopRestTimer();
    toast('Rest alarm could not start. Check alarms & reminders permission, then try again.');
    return;
  }
  paintRestTimer();
  restTimerId = setInterval(tickRest, 500);
}

export function stopRestTimer(reset = true, cancelNative = true) {
  if (restTimerId) clearInterval(restTimerId);
  restTimerId = null;
  if (cancelNative) cancelNativeRest();
  nativeRestScheduled = false;
  if (reset) {
    restSeconds = 0;
    restDeadline = 0;
    localStorage.removeItem(REST_DEADLINE_KEY);
  }
  paintRestTimer();
}

export function restoreRestTimer() {
  if (window.GymNative?.getRestRemainingMillis) {
    const remaining = Number(window.GymNative.getRestRemainingMillis());
    restDeadline = remaining > 0 ? Date.now() + remaining : 0;
    if (restDeadline) localStorage.setItem(REST_DEADLINE_KEY, String(restDeadline));
    else localStorage.removeItem(REST_DEADLINE_KEY);
  }
  if (restDeadline > Date.now()) {
    restSeconds = Math.max(0, Math.ceil((restDeadline - Date.now()) / 1000));
    nativeRestScheduled = true;
    if (restTimerId) clearInterval(restTimerId);
    restTimerId = setInterval(tickRest, 500);
    paintRestTimer();
  } else {
    stopRestTimer(true, false);
  }
}

export function resumeTimers() {
  restoreRestTimer();
  tickRest();
  paintRestTimer();
  paintWorkoutClock();
}

export function bindTimerLifecycle() {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resumeTimers();
  });
  window.addEventListener('focus', resumeTimers);
}
