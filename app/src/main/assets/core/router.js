'use strict';
// Navigation policy, workout lock, and Android back integration.
const WORKOUT_ALLOWED_VIEWS=new Set(['workout','exercise']);
function isWorkoutNavigationLocked(){return !!work}
function setGlobalAddVisibility(page){const add=$('#add');if(!add)return;add.style.display=page==='routines'&&!isWorkoutNavigationLocked()?'grid':'none'}
function setWorkoutNavigationLock(){
 const locked=isWorkoutNavigationLocked(),navEl=$('nav');
 if(navEl)navEl.classList.toggle('workout-locked',locked);
 Array.from(document.querySelectorAll('nav button')).forEach(b=>{b.disabled=locked;b.classList.toggle('locked',locked)});
}
function nav(v){
 if(isWorkoutNavigationLocked()&&!WORKOUT_ALLOWED_VIEWS.has(v)){setWorkoutNavigationLock();toast('Finish or exit workout first');return false}
 view=v;setGlobalAddVisibility(v);setWorkoutNavigationLock();
 Array.from(document.querySelectorAll('nav button')).forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 ({home,routines,history,settings,builder,workout,exercise,summary}[v]||home)();scrollTo(0,0);return true
}
function isModalOpen(){return !M.classList.contains('hide')}
function showWorkoutExitDialog(){open('<h2>Exit workout?</h2><p class="mut">Your unfinished sets will not be saved.</p><div class="row"><button class="btn" id="stayWorkout">Stay</button><button class="btn danger" id="exitWorkoutNow">Exit workout</button></div>');$('#stayWorkout').onclick=close;$('#exitWorkoutNow').onclick=()=>{close();stopWorkoutClock();work=null;stopTimer();nav('routines')}}
function handleAppBack(){if(isModalOpen()){close();return true}if(view==='workout'&&work){showWorkoutExitDialog();return true}if(view==='exercise'){nav(exerciseReturnView==='workout'&&work?'workout':exerciseReturnView||'history');return true}if(view==='summary'){nav('home');return true}if(view==='builder'){nav('routines');return true}if(view==='routines'||view==='history'||view==='settings'){nav('home');return true}return false}
window.VantaLiftHandleBack=handleAppBack;
function openExercise(key,returnView=view){exerciseKey=key;exerciseReturnView=returnView;nav('exercise')}
