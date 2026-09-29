'use strict';
// Exercise discovery and synced reuse across training days.
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
