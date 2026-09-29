'use strict';
// Exercise progress, summary, history, and personal records.
function exercise(){
 const info=exerciseLibrary().find(x=>x.key===exerciseKey),entries=exerciseEntries(exerciseKey),rec=S.records[exerciseKey]||null,name=info?.name||entries[0]?.name||rec?.name||exerciseKey||'Exercise';
 T.textContent=name;
 const recent=entries.slice(0,8).reverse(),max=Math.max(1,...recent.map(e=>e.maxWeight||0));
 A.innerHTML=`<div class="row"><button class="btn" id="exerciseBack">← Back</button></div>
 <div class="exercise-hero"><span>EXERCISE PROGRESS</span><h2>${esc(name)}</h2>${rec?`<div class="record-pill">PR · ${rec.w} ${S.settings.unit} × ${rec.reps}</div>`:''}</div>
 ${recent.length?`<div class="card"><div class="section compact"><h3>Weight trend</h3><span>LAST ${recent.length}</span></div><div class="progress-bars">${recent.map(e=>`<div class="bar-col"><div class="bar-value">${e.maxWeight}</div><div class="bar" style="height:${Math.max(12,Math.round((e.maxWeight/max)*100))}%"></div><small>${new Date(e.ts).toLocaleDateString(undefined,{month:'numeric',day:'numeric'})}</small></div>`).join('')}</div></div>`:'<div class="empty">Your detailed exercise history starts with your next logged workout.</div>'}
 <div class="section"><h3>Sessions</h3><span>${entries.length}</span></div>
 ${entries.map(e=>`<div class="card exercise-session"><b>${new Date(e.ts).toLocaleDateString()} · ${esc(e.routineName||'Workout')}</b><div class="chips">${e.sets.map(s=>`<span class="chip">${s.w} ${S.settings.unit} × ${s.reps}</span>`).join('')}</div></div>`).join('')}`;
 $('#exerciseBack').onclick=()=>nav(exerciseReturnView==='workout'&&work?'workout':exerciseReturnView||'history');
}
function summary(){
 const h=summaryData;if(!h)return nav('history');T.textContent='Workout Complete';
 A.innerHTML=`<section class="summary-hero ${h.prs?.length?'has-pr':''}">${h.prs?.length?'<div class="pr-burst">NEW PR 🔥</div>':''}<small>SESSION COMPLETE</small><h2>${esc(h.name)}</h2><p>${fmtElapsed(h.durationMs||h.mins*60000)}</p></section>
 <div class="stats"><div class="stat"><b>${h.sets}</b><span>SETS</span></div><div class="stat"><b>${h.details?.length||0}</b><span>EXERCISES</span></div><div class="stat"><b>${h.prs?.length||0}</b><span>NEW PRs</span></div></div>
 ${h.prs?.length?`<div class="section"><h3>Records</h3><span>🔥</span></div>${h.prs.map(p=>`<button class="card pr-card" data-summary-pr="${esc(p.key)}"><b>${esc(p.name)}</b><span>${p.w} ${S.settings.unit} × ${p.reps}</span></button>`).join('')}`:''}
 ${h.note?`<div class="card"><small class="mut">WORKOUT NOTE</small><p class="note summary-note">${esc(h.note)}</p></div>`:''}
 <div class="row summary-actions"><button class="btn primary" id="summaryHome">Home</button><button class="btn" id="summaryHistory">History</button></div>`;
 $('#summaryHome').onclick=()=>nav('home');$('#summaryHistory').onclick=()=>nav('history');$$('[data-summary-pr]').forEach(b=>b.onclick=()=>openExercise(b.dataset.summaryPr,'summary'));
}
function confirmHistoryDelete(historyId){
 const item=S.history.find(h=>h.id===historyId);if(!item)return;
 open(`<h2>Delete session?</h2><p class="mut">Remove <b>${esc(item.name)}</b> and its detailed exercise log from history?</p><div class="row"><button class="btn" id="keepHistory">Cancel</button><button class="btn danger" id="deleteHistoryNow">Delete</button></div>`);
 $('#keepHistory').onclick=close;
 $('#deleteHistoryNow').onclick=()=>{
  S.history=S.history.filter(h=>h.id!==historyId);
  Object.keys(S.exerciseLog||{}).forEach(key=>{S.exerciseLog[key]=(S.exerciseLog[key]||[]).filter(e=>e.sessionId!==historyId);if(!S.exerciseLog[key].length)delete S.exerciseLog[key]});
  rebuildRecords();save(true);close();history();toast('Session deleted');
 };
}
function history(){
 const totalSets=S.history.reduce((sum,h)=>sum+(+h.sets||0),0),totalMinutes=S.history.reduce((sum,h)=>sum+(+h.mins||0),0);
 const records=Object.values(S.records||{}).filter(r=>r&&r.ts>0).sort((a,b)=>b.ts-a.ts);
 T.textContent='History';
 A.innerHTML=`<div class="stats"><div class="stat"><b>${S.history.length}</b><span>WORKOUTS</span></div><div class="stat"><b>${totalSets}</b><span>TOTAL SETS</span></div><div class="stat"><b>${totalMinutes}</b><span>MINUTES</span></div></div>
 ${records.length?`<div class="section"><h3>Personal records</h3><span>${records.length}</span></div><div class="records-strip">${records.slice(0,6).map(r=>`<button class="record-card" data-record-key="${esc(r.key)}"><span>PR 🔥</span><b>${esc(r.name||r.key)}</b><small>${r.w} ${S.settings.unit} × ${r.reps}</small></button>`).join('')}</div>`:''}
 <div class="section"><h3>Sessions</h3><span>NEWEST</span></div>
 ${S.history.map(h=>`<div class="card history"><div class="history-copy"><b>${esc(h.name)}</b><span class="mut">${new Date(h.ts).toLocaleDateString()} · ${h.mins} min · ${h.sets} sets</span>${h.note?`<small class="history-note">${esc(h.note)}</small>`:''}${h.prs?.length?`<small class="history-pr">${h.prs.length} PR${h.prs.length>1?'s':''} 🔥</small>`:''}</div><button class="history-delete" data-delete-history="${h.id}" aria-label="Delete history session"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9v8m4-8v8m4-8v8M5 6h14M9 6V4h6v2m-9 0 1 15h10l1-15"/></svg></button></div>`).join('')||'<div class="empty">No workouts logged yet</div>'}`;
 $$('[data-delete-history]').forEach(b=>b.onclick=()=>confirmHistoryDelete(b.dataset.deleteHistory));
 $$('[data-record-key]').forEach(b=>b.onclick=()=>openExercise(b.dataset.recordKey,'history'));
}
