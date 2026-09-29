'use strict';
// Routine builder, exercise library, editing, and reorder behavior.
function moveExercise(r,id,delta){const i=r.exercises.findIndex(e=>e.id===id),j=i+delta;if(i<0||j<0||j>=r.exercises.length)return;[r.exercises[i],r.exercises[j]]=[r.exercises[j],r.exercises[i]];save();builder()}
function bindExerciseReorder(r){let dragged=null;$$('[data-ex-card]').forEach(card=>{card.ondragstart=()=>{dragged=card.dataset.exCard;card.classList.add('dragging')};card.ondragend=()=>{dragged=null;card.classList.remove('dragging')};card.ondragover=e=>e.preventDefault();card.ondrop=e=>{e.preventDefault();if(!dragged||dragged===card.dataset.exCard)return;const from=r.exercises.findIndex(x=>x.id===dragged),to=r.exercises.findIndex(x=>x.id===card.dataset.exCard);if(from<0||to<0)return;const item=r.exercises.splice(from,1)[0];r.exercises.splice(to,0,item);save();builder()}});$$('[data-move-up]').forEach(b=>b.onclick=()=>moveExercise(r,b.dataset.moveUp,-1));$$('[data-move-down]').forEach(b=>b.onclick=()=>moveExercise(r,b.dataset.moveDown,1))}
function builder(){
 let r=S.routines.find(x=>x.id===rid);if(!r)return nav('routines');T.textContent=r.name;
 A.innerHTML=`<div class="row"><button class="btn" id="back">← Routine</button><button class="btn" id="rename">Rename</button><button class="btn danger" id="del">Delete</button></div><div class="section"><h3>Exercises</h3><span>DRAG TO REORDER</span></div>
 ${r.exercises.map((e,i)=>{let ch=e.choices[0];return `<div class="card ex reorder-card" draggable="true" data-ex-card="${e.id}"><div class="exhead"><div class="reorder-title"><span class="drag-handle">⋮⋮</span><div><b>${i+1}. ${esc(ch.name)}</b><div class="mut">${spec(ch)}</div></div></div><div class="row">${video(ch)}<button class="btn mini" data-stats="${esc(ch.key)}">Stats</button><button class="btn mini" data-edit="${e.id}">Edit</button></div></div>${e.choices.length>1?`<div class="chips">${e.choices.map((cc,j)=>`<span class="chip ${j===0?'on':''}">${j===0?'PRIMARY · ':''}${esc(cc.name)}</span>`).join('')}</div>`:''}${e.note?`<p class="note">${esc(e.note)}</p>`:''}<div class="reorder-fallback"><button data-move-up="${e.id}">↑</button><button data-move-down="${e.id}">↓</button></div></div>`}).join('')||'<div class="empty">No exercises yet</div>'}
 <div class="row"><button class="btn primary" id="addEx">+ Add exercise</button><button class="btn" id="go">Start workout</button></div>`;
 $('#back').onclick=()=>nav('routines');$('#rename').onclick=()=>{let n=prompt('New day name',r.name);if(n){r.name=n.trim();save();builder()}};$('#del').onclick=()=>{if(confirm('Delete this day?')){S.routines=S.routines.filter(x=>x.id!==r.id);save(true);nav('routines')}};$('#addEx').onclick=()=>addExerciseFlow(r);$('#go').onclick=()=>start(r.id);
 $$('[data-edit]').forEach(b=>b.onclick=()=>exForm(r,r.exercises.find(e=>e.id===b.dataset.edit)));$$('[data-stats]').forEach(b=>b.onclick=()=>openExercise(b.dataset.stats,'builder'));bindExerciseReorder(r);
}
function exerciseLibrary(){
 const map=new Map();
 S.routines.forEach(day=>day.exercises.forEach(group=>group.choices.forEach(ch=>{
   const key=ch.key||norm(ch.name);if(!key||!ch.name)return;
   if(!map.has(key))map.set(key,{key:key,name:ch.name,choice:clone(ch),note:group.note||'',source:day.name});
 })));
 return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
function addExerciseFlow(r){
 const inDay=new Set(r.exercises.flatMap(e=>e.choices.map(ch=>ch.key||norm(ch.name))));
 const library=exerciseLibrary().filter(x=>!inDay.has(x.key));
 const draw=list=>{
   const box=$('#existingExerciseList');if(!box)return;
   box.innerHTML=list.length?list.map(x=>'<button class="existing-exercise" data-existing="'+esc(x.key)+'"><span><b>'+esc(x.name)+'</b><small>From '+esc(x.source)+' · weights & reps synced</small></span><span class="syncmark">SYNC +</span></button>').join(''):'<div class="empty">No matching exercises</div>';
   $$('[data-existing]').forEach(b=>b.onclick=()=>{
     const item=library.find(x=>x.key===b.dataset.existing);if(!item)return;
     const ch=clone(item.choice);ch.key=item.key;
     const latest=S.performance[item.key];
     if(latest&&latest.length)ch.preset=clone(latest);
     r.exercises.push({id:uid(),name:ch.name,choices:[ch],note:item.note||''});
     save();close();builder();toast('Existing exercise added & synced');
   });
 };
 open('<h2>Add exercise</h2>'+
 '<p class="mut">Reuse an existing exercise to keep weights and reps synced between training days, or create a completely new one.</p>'+
 '<button class="btn primary block" id="createNewExercise">+ Create New Exercise</button>'+
 '<div class="section"><h3>Add Existing Exercise</h3><span>SYNCED</span></div>'+
 '<div class="field"><input id="existingSearch" class="input" placeholder="Search exercises..."></div>'+
 '<div id="existingExerciseList"></div>'+
 '<button class="btn block" id="cancelAddExercise">Cancel</button>');
 $('#createNewExercise').onclick=()=>exForm(r);
 $('#cancelAddExercise').onclick=close;
 $('#existingSearch').oninput=e=>{const q=norm(e.target.value);draw(library.filter(x=>norm(x.name).includes(q)))};
 draw(library);
}

function exForm(r,e){
 const d=e?clone(e):{id:uid(),name:'',choices:[{key:'',name:'',sets:2,reps:'8-12',warmup:'1~2',rest:'3~5',link:'',preset:[]}],note:''};
 d.choices.forEach(ch=>{if(ch._originalName===undefined)ch._originalName=ch.name||'';if(ch._originalKey===undefined)ch._originalKey=ch.key||''});

 const perfText=ch=>{
   const src=S.performance[ch.key]||ch.preset||[];
   return src.map(s=>`${s.w??''}-${s.reps??''}`).filter(x=>x!=='-').join(', ');
 };
 const parsePerf=s=>String(s||'').split(/[\n,،]+/).map(x=>x.trim()).filter(Boolean).map(x=>{
   const m=x.match(/(-?\d+(?:\.\d+)?)\s*(?:-|x|×)\s*(\d+)/i);
   return m?{w:+m[1],reps:+m[2]}:null;
 }).filter(Boolean);
 const syncDraft=()=>{
   $$('.choice-editor').forEach(box=>{
     const i=+box.dataset.ci,ch=d.choices[i];if(!ch)return;
     ch.name=box.querySelector('[data-ce="name"]').value.trim();
     ch.sets=Math.max(1,+box.querySelector('[data-ce="sets"]').value||1);
     ch.reps=box.querySelector('[data-ce="reps"]').value.trim()||'8-12';
     ch.warmup=box.querySelector('[data-ce="warmup"]').value.trim()||'0';
     ch.rest=box.querySelector('[data-ce="rest"]').value.trim();
     ch.link=box.querySelector('[data-ce="link"]').value.trim();
     ch._perf=parsePerf(box.querySelector('[data-ce="perf"]').value);
   });
   const n=$('#noteEdit');if(n)d.note=n.value.trim();
 };
 const render=()=>{
   open(`<h2>${e?'Edit exercise':'Add exercise'}</h2>
   <p class="mut">Edit the primary exercise, alternatives, current performance, warm-up, rest and video.</p>
   <div id="choiceEditors">
   ${d.choices.map((ch,i)=>`<div class="choice-editor" data-ci="${i}">
     <div class="choice-edit-head"><b>${i===0?'PRIMARY':'ALTERNATIVE '+i}</b><div class="row">
       ${i>0?`<button class="btn mini" data-primary="${i}">Make primary</button><button class="btn danger mini" data-removechoice="${i}">Delete option</button>`:''}
     </div></div>
     <div class="field"><label>EXERCISE NAME</label><div class="name-picker"><input class="input exercise-name-input" autocomplete="off" data-ce="name" data-name-index="${i}" value="${esc(ch.name||'')}"><div class="name-suggestions" data-name-menu="${i}"></div></div></div>
     <div class="grid2">
       <div class="field"><label>WORKING SETS</label><input type="number" class="input" data-ce="sets" value="${ch.sets||1}"></div>
       <div class="field"><label>TARGET REPS</label><input class="input" data-ce="reps" value="${esc(ch.reps||'')}"></div>
       <div class="field"><label>WARM-UP SETS</label><input class="input" data-ce="warmup" value="${esc(ch.warmup??'0')}"></div>
       <div class="field"><label>REST (MIN)</label><input class="input" data-ce="rest" value="${esc(ch.rest||'')}"></div>
     </div>
     <div class="field"><label>CURRENT WEIGHTS / REPS</label><input class="input" data-ce="perf" placeholder="45-9, 45-8" value="${esc(perfText(ch))}"><small class="mut">weight-reps, e.g. 45-9, 45-8</small></div>
     <div class="field"><label>VIDEO LINK</label><input class="input" data-ce="link" value="${esc(ch.link||'')}"></div>
   </div>`).join('')}
   </div>
   <button class="btn block" id="addChoice">+ Add alternative</button>
   <div class="field"><label>NOTES</label><textarea id="noteEdit" class="input">${esc(d.note||'')}</textarea></div>
   <div class="row edit-actions"><button class="btn" id="cancelEdit">Cancel</button>${e?'<button class="btn danger" id="deleteExercise">Delete exercise</button>':''}<button class="btn primary" id="saveExercise">Save changes</button></div>`);

   $('#cancelEdit').onclick=close;
   const nameLibrary=()=>exerciseLibrary();
   const showNameSuggestions=(input)=>{
     const i=+input.dataset.nameIndex,menu=$('[data-name-menu="'+i+'"]');if(!menu)return;
     if(input.value.trim()!==''){menu.classList.remove('show');menu.innerHTML='';return}
     const current=d.choices[i],items=nameLibrary().filter(x=>x.key!==(current?.key||'')).slice(0,40);
     menu.innerHTML=items.length?items.map(x=>'<button type="button" class="name-suggestion" data-pick-existing="'+esc(x.key)+'" data-pick-index="'+i+'"><span><b>'+esc(x.name)+'</b><small>'+esc(x.source)+' · synced</small></span><span>↻</span></button>').join(''):'<div class="name-suggestion-empty">No other exercises yet</div>';
     menu.classList.add('show');
     $$('[data-pick-existing]').forEach(b=>b.onclick=()=>{
       syncDraft();
       const idx=+b.dataset.pickIndex,item=nameLibrary().find(x=>x.key===b.dataset.pickExisting);if(!item)return;
       const chosen=clone(item.choice);
       chosen.key=item.key;chosen._pickedKey=item.key;chosen._originalKey=item.key;chosen._originalName=chosen.name;
       const latest=S.performance[item.key];if(latest&&latest.length)chosen.preset=clone(latest);
       d.choices[idx]=chosen;
       if(idx===0&&item.note)d.note=item.note;
       render();
     });
   };
   $$('.exercise-name-input').forEach(input=>{
     input.oninput=()=>showNameSuggestions(input);
     input.onfocus=()=>showNameSuggestions(input);
   });
   $('#addChoice').onclick=()=>{syncDraft();let p=d.choices[0]||{};d.choices.push({key:'',name:'',sets:p.sets||2,reps:p.reps||'8-12',warmup:p.warmup??'0',rest:p.rest||'',link:'',preset:[],_originalName:'',_originalKey:''});render()};
   $$('[data-removechoice]').forEach(b=>b.onclick=()=>{syncDraft();if(d.choices.length<=1)return toast('Keep at least one option');d.choices.splice(+b.dataset.removechoice,1);render()});
   $$('[data-primary]').forEach(b=>b.onclick=()=>{syncDraft();let i=+b.dataset.primary,[x]=d.choices.splice(i,1);d.choices.unshift(x);render()});
   if(e)$('#deleteExercise').onclick=()=>{if(confirm('Delete this exercise completely?')){r.exercises=r.exercises.filter(x=>x.id!==e.id);save();close();builder()}};
   $('#saveExercise').onclick=()=>{
     syncDraft();
     if(!d.choices.length||!d.choices[0].name)return toast('Exercise name required');
     d.choices=d.choices.filter(ch=>ch.name).map(ch=>{
       const oldKey=ch.key;
       const originalName=ch._originalName??ch.name;
       const originalKey=ch._originalKey||oldKey;
       const manuallyRenamed=norm(ch.name)!==norm(originalName);
       const newKey=ch._pickedKey||(originalKey&&!manuallyRenamed?originalKey:norm(ch.name));
       const perf=ch._perf||[];
       delete ch._perf;delete ch._pickedKey;delete ch._originalName;delete ch._originalKey;
       if(oldKey&&oldKey!==newKey&&S.performance[oldKey]&&!S.performance[newKey])S.performance[newKey]=S.performance[oldKey];
       if(perf.length)S.performance[newKey]=perf;
       ch.key=newKey;
       ch.preset=perf.length?perf:(S.performance[newKey]?clone(S.performance[newKey]):(ch.preset||[]));
       return ch;
     });
     if(!d.choices.length)return toast('Keep at least one exercise option');
     d.name=d.choices[0].name;
     if(e)Object.assign(e,d);else r.exercises.push(d);
     save();close();builder();toast('Exercise updated');
   };
 };
 render();
}
