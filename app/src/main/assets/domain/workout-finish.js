'use strict';
// Workout completion transaction: performance, history, logs, and PRs.
function finish(){
 const ended=Date.now(),sessionId=uid(),details=[],prs=[];let sets=0,vol=0;
 work.r.exercises.forEach(e=>{
  const ch=selected(e),rows=work.rows[e.id],completed=rows.filter(s=>s.done).map(s=>({w:+s.w||0,reps:+s.reps||0}));
  completed.forEach(s=>{sets++;vol+=s.w*s.reps});
  S.performance[ch.key]=rows.map(s=>({w:+s.w||0,reps:+s.reps||0}));
  if(completed.length){
   const prev=S.records[ch.key]||null,best=bestSet(completed),entry={sessionId,ts:ended,routineId:work.r.id,routineName:work.r.name,key:ch.key,name:ch.name,sets:completed,maxWeight:Math.max(...completed.map(s=>s.w),0),totalReps:completed.reduce((a,s)=>a+s.reps,0)};
   S.exerciseLog[ch.key]=[entry,...exerciseEntries(ch.key)].slice(0,20);details.push(entry);
   if(best&&isBetterSet(best,prev)){const rec={w:best.w,reps:best.reps,name:ch.name,key:ch.key,ts:ended};S.records[ch.key]=rec;prs.push(rec)}
  }
 });
 const historyEntry={id:sessionId,routineId:work.r.id,name:work.r.name,ts:ended,mins:Math.max(1,Math.round((ended-work.start)/60000)),durationMs:ended-work.start,sets,vol,note:(work.note||'').trim(),details,prs};
 S.history.unshift(historyEntry);S.history=S.history.slice(0,100);summaryData=clone(historyEntry);save(true);stopWorkoutClock();work=null;stopTimer();nav('summary');
}
