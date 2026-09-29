'use strict';
// Home and routine-list views.
function home(){
 T.textContent='Training';
 const total=S.routines.reduce((a,r)=>a+r.exercises.length,0),week=S.history.filter(h=>h.ts>Date.now()-6048e5).length;
 const next=nextRoutine(),last=S.history[0],pr=latestPR(),streak=workoutStreak();
 A.innerHTML=`<section class="hero smart-hero"><small class="mut">NEXT WORKOUT</small><h2>${next?esc(next.name):'Build your routine'}</h2><p class="mut">${last?`Last session: ${esc(last.name)} · ${last.mins||0} min`:'Your A×P program is ready.'}</p>${next?`<button class="btn primary" data-start="${next.id}">Start ${esc(next.name)}</button>`:''}</section>
 <div class="stats"><div class="stat"><b>${week}</b><span>WORKOUTS / 7D</span></div><div class="stat"><b>${streak}</b><span>DAY STREAK</span></div><div class="stat"><b>${recordCount()}</b><span>PRs</span></div></div>
 ${pr?`<button class="card smart-pr" data-open-exercise="${esc(pr.key||'')}"><span>LAST PR 🔥</span><b>${esc(pr.name||pr.key||'Exercise')}</b><small>${pr.w} ${S.settings.unit} × ${pr.reps}</small></button>`:''}
 <div class="section"><h3>Your routine</h3><span>${total} EXERCISE GROUPS</span></div>${S.routines.map(card).join('')}`;
 bindCards();$$('[data-open-exercise]').forEach(b=>b.onclick=()=>openExercise(b.dataset.openExercise,'home'));
}
function routines(){
 T.textContent='Routine';A.innerHTML=`<div class="section"><h3>Training days</h3><span>${S.routines.length}</span></div>${S.routines.map(card).join('')||'<div class="empty">No training days</div>'}<button class="btn primary block" id="newDay">+ Add training day</button>`;
 bindCards();$('#newDay').onclick=addDay
}
function addDay(){open(`<h2>New training day</h2><div class="field"><label>DAY NAME</label><input id="dn" class="input" placeholder="Anterior C"></div><div class="row"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="saveDay">Create</button></div>`);$('#cancel').onclick=close;$('#saveDay').onclick=()=>{let n=$('#dn').value.trim();if(!n)return;S.routines.push({id:uid(),name:n,exercises:[]});save();close();routines()}}
