import { $, $$, dom } from './dom.mjs';
import { session } from './session.mjs';
import { closeModal, openModal, toast } from '../ui/primitives.mjs';
import { stopRestTimer, stopWorkoutClock } from '../services/timers.mjs';

const WORKOUT_ALLOWED_VIEWS = new Set(['workout', 'exercise']);
const routes = new Map();

export function registerRoutes(routeMap) {
  Object.entries(routeMap).forEach(([name, render]) => routes.set(name, render));
}

export function isWorkoutNavigationLocked() {
  return Boolean(session.workout);
}

function setGlobalAddVisibility(page) {
  if (!dom.add) return;
  dom.add.style.display = page === 'routines' && !isWorkoutNavigationLocked() ? 'grid' : 'none';
}

function setWorkoutNavigationLock() {
  const locked = isWorkoutNavigationLocked();
  dom.nav?.classList.toggle('workout-locked', locked);
  $$('nav button').forEach((button) => {
    button.disabled = locked;
    button.classList.toggle('locked', locked);
  });
}

export function nav(page) {
  if (isWorkoutNavigationLocked() && !WORKOUT_ALLOWED_VIEWS.has(page)) {
    setWorkoutNavigationLock();
    toast('Finish or exit workout first');
    return false;
  }

  session.view = page;
  setGlobalAddVisibility(page);
  setWorkoutNavigationLock();
  $$('nav button').forEach((button) => button.classList.toggle('on', button.dataset.v === page));

  const render = routes.get(page) || routes.get('home');
  render?.();
  scrollTo(0, 0);
  return true;
}

export function isModalOpen() {
  return !dom.modal.classList.contains('hide');
}

export function showWorkoutExitDialog() {
  openModal('<h2>Exit workout?</h2><p class="mut">Your unfinished sets will not be saved.</p><div class="row"><button class="btn" id="stayWorkout">Stay</button><button class="btn danger" id="exitWorkoutNow">Exit workout</button></div>');
  $('#stayWorkout').onclick = closeModal;
  $('#exitWorkoutNow').onclick = () => {
    closeModal();
    stopWorkoutClock();
    session.workout = null;
    stopRestTimer();
    nav('routines');
  };
}

export function handleAppBack() {
  if (isModalOpen()) {
    closeModal();
    return true;
  }
  if (session.view === 'workout' && session.workout) {
    showWorkoutExitDialog();
    return true;
  }
  if (session.view === 'exercise') {
    nav(session.exerciseReturnView === 'workout' && session.workout ? 'workout' : session.exerciseReturnView || 'history');
    return true;
  }
  if (session.view === 'summary') {
    nav('home');
    return true;
  }
  if (session.view === 'builder') {
    nav('routines');
    return true;
  }
  if (['routines', 'history', 'settings'].includes(session.view)) {
    nav('home');
    return true;
  }
  return false;
}

export function openExercise(key, returnView = session.view) {
  session.exerciseKey = key;
  session.exerciseReturnView = returnView;
  nav('exercise');
}

export function bindNavigation() {
  $$('nav button').forEach((button) => {
    button.onclick = () => {
      if (isWorkoutNavigationLocked()) {
        toast('Finish or exit workout first');
        return;
      }
      nav(button.dataset.v);
    };
  });
}
