'use strict';
// Active-workout rendering and input handling.
function start(id){
 let r=S.routines.find(x=>x.id===id);if(!r)return;if(!r.exercises.length){rid=id;nav('builder');return toast('Add exercises first')}
 stopWorkoutClock();work={r,start:Date.now(),choiceKeys:{},rows:{},warm:{},note:''};r.exercises.forEach(e=>{let ch=e.choices[0];work.choiceKeys[e.id]=ch.key;work.rows[e.id]=blankRows(ch);work.warm[e.id]=[]});nav('workout')
}
function selected(e){return choice(e,work.choiceKeys[e.id])}
function warmMax(s){if(!s||s==='0')return 0;let m=String(s).match(/(\d+)\s*~\s*(\d+)/);return m?+m[2]:(+s||1)}
function workout(){
 let r=work?.r;if(!r)return nav('home');T.textContent=r.name;
 A.innerHTML=`<div class="worktop"><button class="btn" id="exit">← Exit</button><div class="work-metrics"><div class="elapsed" id="workoutClock"><span>WORKOUT</span><b>00:00:00</b></div><button class="timer" id="restBtn">Rest ${fmt(timerLeft)}</button></div></div>
 <div class="section"><h3>Workout</h3><span>LIVE SESSION</span></div>
 ${r.exercises.map((e,i)=>{let ch=selected(e),opts=e.choices,wr=work.warm[e.id],last=lastExerciseEntry(ch.key),prog=progressionSuggestion(ch);return `<div class="card ex workout-card"><div class="exhead"><div><b>${i+1}. ${esc(ch.name)}</b><div class="mut">${spec(ch)}</div></div><div class="row">${video(ch)}<button class="btn mini" data-work-stats="${esc(ch.key)}">Stats</button></div></div>
 ${prog?`<div class="progression ready">↗ ${esc(prog.text)}</div>`:''}
 ${opts.length>1?`<div class="chips">${opts.map(o=>`<button class="chip ${o.key===ch.key?'on':''}" data-choice="${esc(o.key)}" data-ex="${e.id}">${esc(o.name)}</button>`).join('')}</div>`:''}
 ${e.note?`<details><summary>Note</summary><p class="note">${esc(e.note)}</p></details>`:''}
 ${ch.warmup&&ch.warmup!=='0'?`<div class="warmbox"><div class="warmhead"><span>Warm-up · suggested ${esc(ch.warmup)}</span><button class="btn mini" data-addwarm="${e.id}">+ Set</button></div>${wr.map((s,j)=>`<div class="setrow warmrow"><span>W${j+1}</span><input class="input" type="number" step=".5" placeholder="kg" data-wf="w" data-ex="${e.id}" data-i="${j}" value="${s.w??''}"><input class="input" type="number" placeholder="reps" data-wf="reps" data-ex="${e.id}" data-i="${j}" value="${s.reps??''}"><button class="xbtn" data-rmwarm="${e.id}" data-i="${j}">×</button></div>`).join('')}</div>`:''}
 <div class="setrow labels"><span>SET</span><span>WEIGHT</span><span>REPS</span><span>✓</span></div>
 ${work.rows[e.id].map((s,j)=>`<div class="setrow"><span>${j+1}</span><input class="input" type="number" step=".5" data-f="w" data-ex="${e.id}" data-i="${j}" value="${s.w}"><input class="input" type="number" data-f="reps" data-ex="${e.id}" data-i="${j}" value="${s.reps}"><input class="check" type="checkbox" data-f="done" data-ex="${e.id}" data-i="${j}" ${s.done?'checked':''}></div>${last?.sets?.[j]?`<div class="last-set-note">Last set ${j+1}: <b>${last.sets[j].w} ${S.settings.unit} × ${last.sets[j].reps}</b></div>`:''}`).join('')}</div>`}).join('')}
 <div class="card workout-note-card"><label>WORKOUT NOTE</label><textarea id="workoutNote" class="input" placeholder="Energy, pain, form, what to improve next time...">${esc(work.note||'')}</textarea></div>
 <button class="btn primary block finish" id="finish">Finish workout</button>`;
 $('#exit').onclick=showWorkoutExitDialog;$('#finish').onclick=finish;$('#restBtn').onclick=()=>timerLeft?stopTimer():startTimer();
 $('#workoutNote').oninput=e=>work.note=e.target.value;
 $$('[data-work-stats]').forEach(b=>b.onclick=()=>openExercise(b.dataset.workStats,'workout'));
 $$('[data-f]').forEach(el=>el.onchange=()=>{let s=work.rows[el.dataset.ex][+el.dataset.i],f=el.dataset.f;if(f==='done'){s.done=el.checked;if(el.checked)startTimer()}else s[f]=el.value});
 $$('[data-wf]').forEach(el=>el.onchange=()=>work.warm[el.dataset.ex][+el.dataset.i][el.dataset.wf]=el.value);
 $$('[data-addwarm]').forEach(b=>b.onclick=()=>{let e=r.exercises.find(x=>x.id===b.dataset.addwarm),ch=selected(e),arr=work.warm[e.id],mx=warmMax(ch.warmup);if(arr.length>=mx)return toast(`Max warm-up: ${mx}`);arr.push({w:'',reps:''});workout()});
 $$('[data-rmwarm]').forEach(b=>b.onclick=()=>{work.warm[b.dataset.rmwarm].splice(+b.dataset.i,1);workout()});
 Array.from(document.querySelectorAll('[data-choice]')).forEach(b=>b.onclick=()=>{let e=r.exercises.find(x=>x.id===b.dataset.ex);work.choiceKeys[e.id]=b.dataset.choice;let ch=selected(e);work.rows[e.id]=blankRows(ch);work.warm[e.id]=[];workout()});
 startWorkoutClock();
}
