'use strict';
// Exercise editor form and alternative-management behavior.
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
