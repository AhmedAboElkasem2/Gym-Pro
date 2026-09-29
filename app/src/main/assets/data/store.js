'use strict';
// Persistence, migrations, backup snapshots, and record read-model helpers.
const AUTO_BACKUP_KEY='vantalift-auto-backups-v1';
function bestSet(sets){return (sets||[]).map(s=>({w:+s.w||0,reps:+s.reps||0})).filter(s=>s.w>0||s.reps>0).sort((a,b)=>b.w-a.w||b.reps-a.reps)[0]||null}
function isBetterSet(a,b){return !!a&&(!b||a.w>b.w||(a.w===b.w&&a.reps>b.reps))}
function migrateData(x){if(!x||!Array.isArray(x.routines))x=clone(SEED);x.performance=(x.performance&&typeof x.performance==='object')?x.performance:{};x.history=Array.isArray(x.history)?x.history:[];x.settings={...clone(SEED.settings),...(x.settings||{})};x.exerciseLog=(x.exerciseLog&&typeof x.exerciseLog==='object')?x.exerciseLog:{};x.records=(x.records&&typeof x.records==='object')?x.records:{};Object.entries(x.performance).forEach(([key,sets])=>{if(!x.records[key]){const b=bestSet(sets);if(b)x.records[key]={...b,name:key,key,ts:0}}});x.schema=3;return x}
function load(){try{return migrateData(JSON.parse(localStorage.getItem(K)))}catch{return migrateData(clone(SEED))}}
function readAutoBackups(){try{return JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY))||[]}catch{return[]}}
function createAutoBackup(force=false){try{const list=readAutoBackups(),now=Date.now();if(!force&&list[0]&&now-list[0].ts<21600000)return;list.unshift({id:uid(),ts:now,data:clone(S)});localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(list.slice(0,5)))}catch{}}
function save(forceBackup=false){localStorage.setItem(K,JSON.stringify(S));createAutoBackup(forceBackup)}
function exerciseEntries(key){return Array.isArray(S.exerciseLog[key])?S.exerciseLog[key]:[]}
function lastExerciseEntry(key){return exerciseEntries(key)[0]||null}
function targetRange(value){const nums=String(value||'').match(/\d+/g)?.map(Number)||[];return {min:nums[0]||0,max:nums[1]||nums[0]||0}}
function progressionSuggestion(ch){const sets=(S.performance[ch.key]||[]).filter(s=>(+s.w||0)>0||(+s.reps||0)>0);if(!sets.length)return null;const done=sets.slice(0,Math.max(1,+ch.sets||1)),qualified=done.filter(s=>(+s.reps||0)>=12);if(!qualified.length)return null;const top=Math.max(...qualified.map(s=>+s.w||0),0);return {text:'12+ reps reached · consider '+(top+5)+' '+S.settings.unit+' next time',ready:true}}
function nextRoutine(){if(!S.routines.length)return null;const last=S.history[0];if(!last)return S.routines[0];let i=S.routines.findIndex(r=>r.id===last.routineId||r.name===last.name);return S.routines[(i<0?0:i+1)%S.routines.length]}
function workoutStreak(){const days=[...new Set(S.history.map(h=>{const d=new Date(h.ts);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()}))].sort((a,b)=>b-a);if(!days.length)return 0;const day=86400000,today=new Date();today.setHours(0,0,0,0);if(today.getTime()-days[0]>day)return 0;let streak=1;for(let i=1;i<days.length;i++){if(Math.round((days[i-1]-days[i])/day)===1)streak++;else break}return streak}
function latestPR(){return Object.values(S.records||{}).filter(r=>r&&r.ts>0).sort((a,b)=>b.ts-a.ts)[0]||null}
function recordCount(){return Object.values(S.records||{}).filter(r=>r&&r.ts>0).length}
function rebuildRecords(){const next={};Object.entries(S.performance||{}).forEach(([key,sets])=>{const b=bestSet(sets);if(b)next[key]={...b,name:key,key,ts:0}});Object.entries(S.exerciseLog||{}).forEach(([key,entries])=>(entries||[]).slice().reverse().forEach(entry=>(entry.sets||[]).forEach(set=>{const cur=next[key];if(isBetterSet(set,cur))next[key]={w:+set.w||0,reps:+set.reps||0,name:entry.name||key,key,ts:entry.ts||0}})));S.records=next}
