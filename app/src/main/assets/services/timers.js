'use strict';
// Workout clock and rest-timer lifecycle, including the native alarm bridge.
function fmtElapsed(ms){
 const total=Math.max(0,Math.floor((+ms||0)/1000)),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function paintWorkoutClock(){
 if(!work)return;
 const el=$('#workoutClock b');if(el)el.textContent=fmtElapsed(Date.now()-work.start);
}
function startWorkoutClock(){
 if(workoutClockId)clearInterval(workoutClockId);
 workoutClockId=null;paintWorkoutClock();
 if(work)workoutClockId=setInterval(paintWorkoutClock,1000);
}
function stopWorkoutClock(){
 if(workoutClockId)clearInterval(workoutClockId);
 workoutClockId=null;
}
function fmt(s){s=Math.max(0,+s||0);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function scheduleNativeRest(seconds){try{return !!(window.GymNative&&window.GymNative.startRestAlarm&&window.GymNative.startRestAlarm(Math.max(1,Math.round(seconds))))}catch{return false}}
function cancelNativeRest(){try{if(window.GymNative&&window.GymNative.cancelRestAlarm)window.GymNative.cancelRestAlarm()}catch{}}
function fallbackRestAlarm(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const ctx=new AC(),now=ctx.currentTime;
  [0,.35,.7].forEach((d,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=i===1?900:1200;g.gain.setValueAtTime(.0001,now+d);g.gain.exponentialRampToValueAtTime(.35,now+d+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d+.22);o.connect(g);g.connect(ctx.destination);o.start(now+d);o.stop(now+d+.24)});
 }catch{}
}
function restCompleted(){
 if(timerId)clearInterval(timerId);timerId=null;timerLeft=0;restDeadline=0;localStorage.removeItem('gympro-rest-deadline');paintTimer();toast('Rest complete');
 if(!nativeRestScheduled)fallbackRestAlarm();
 nativeRestScheduled=false;
}
function tickRest(){
 if(!restDeadline)return;
 timerLeft=Math.max(0,Math.ceil((restDeadline-Date.now())/1000));paintTimer();
 if(timerLeft<=0)restCompleted();
}
function startTimer(){
 stopTimer(true,true);
 timerLeft=Math.max(30,+S.settings.rest||180);
 restDeadline=Date.now()+timerLeft*1000;
 localStorage.setItem('gympro-rest-deadline',String(restDeadline));
 nativeRestScheduled=scheduleNativeRest(timerLeft);
 paintTimer();timerId=setInterval(tickRest,500);
}
function stopTimer(reset=true,cancelNative=true){
 if(timerId)clearInterval(timerId);timerId=null;
 if(cancelNative)cancelNativeRest();
 nativeRestScheduled=false;
 if(reset){timerLeft=0;restDeadline=0;localStorage.removeItem('gympro-rest-deadline')}
 paintTimer();
}
function restoreRestTimer(){
 if(restDeadline>Date.now()){
  timerLeft=Math.max(0,Math.ceil((restDeadline-Date.now())/1000));
  nativeRestScheduled=true;
  if(timerId)clearInterval(timerId);
  timerId=setInterval(tickRest,500);paintTimer();
 }else if(restDeadline){restDeadline=0;localStorage.removeItem('gympro-rest-deadline')}
}
function paintTimer(){let b=$('#restBtn');if(b)b.textContent=`Rest ${fmt(timerLeft)}`}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tickRest();paintWorkoutClock()}});
window.addEventListener('focus',()=>{tickRest();paintWorkoutClock()});
window.GymProResume=()=>{tickRest();paintTimer();paintWorkoutClock()};
