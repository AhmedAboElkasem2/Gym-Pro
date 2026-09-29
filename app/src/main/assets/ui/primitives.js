'use strict';
// Reusable presentation helpers.
function toast(x){toastEl.textContent=x;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),1500)}
function open(html){M.innerHTML=`<div class="sheet">${html}</div>`;M.classList.remove('hide')}
function close(){M.classList.add('hide');M.innerHTML=''}
function choice(ex,key){return ex.choices.find(c=>c.key===key)||ex.choices[0]}
function blankRows(ch){let src=S.performance[ch.key]||ch.preset||[],n=Math.max(1,+ch.sets||1);return Array.from({length:n},(_,i)=>({w:src[i]?.w??'',reps:src[i]?.reps??'',done:false}))}
function video(ch){return ch.link?`<a class="video" href="${esc(ch.link)}" title="Exercise video">▶</a>`:''}
function spec(ch){return `${ch.sets} sets × ${esc(ch.reps)} reps${ch.warmup&&ch.warmup!=='0'?` · warm-up ${esc(ch.warmup)}`:' · no warm-up'}${ch.rest?` · rest ${esc(ch.rest)} min`:''}`}
