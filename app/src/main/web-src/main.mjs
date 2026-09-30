import { dom } from './core/dom.mjs';
import { createAutoBackup } from './data/store.mjs';
import {
  bindNavigation,
  handleAppBack,
  nav,
  registerRoutes
} from './core/router.mjs';
import { bindModalBackdrop } from './ui/primitives.mjs';
import { addDay, homeView, routinesView } from './views/home.mjs';
import { builderView } from './views/builder.mjs';
import { exerciseView, historyView, summaryView } from './views/history.mjs';
import { workoutView } from './views/workout.mjs';
import { settingsView } from './views/settings.mjs';
import {
  bindTimerLifecycle,
  restoreRestTimer,
  resumeTimers
} from './services/timers.mjs';
import { bindNativeBackupCallbacks } from './services/backup.mjs';
import { bindNativeRestAlarmCallbacks } from './features/rest-alarm.mjs';

registerRoutes({
  home: homeView,
  routines: routinesView,
  history: historyView,
  settings: settingsView,
  builder: builderView,
  workout: workoutView,
  exercise: exerciseView,
  summary: summaryView
});

bindNavigation();
bindModalBackdrop();
bindTimerLifecycle();
bindNativeBackupCallbacks();
bindNativeRestAlarmCallbacks();

dom.add.onclick = addDay;
window.VantaLiftHandleBack = handleAppBack;
window.GymProResume = resumeTimers;

nav('home');
restoreRestTimer();
createAutoBackup(false);
