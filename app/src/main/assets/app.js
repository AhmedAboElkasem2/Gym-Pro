(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],A=$('#app'),T=$('#title'),M=$('#modal'),toastEl=$('#toast'),K='gympro-v2';
const SEED={"routines":[{"id":"anterior-a","name":"Anterior A","exercises":[{"id":"machine-shoulder-press-6649","name":"Machine Shoulder Press","choices":[{"key":"machine shoulder press","name":"Machine Shoulder Press","sets":1,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/DtJY_WLvH7Q","preset":[{"w":45,"reps":9}]},{"key":"db shoulder press","name":"DB Shoulder Press","sets":1,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"smith shoulder press","name":"Smith Shoulder Press","sets":1,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"حاول متعملش أرش بزيادة وتقلبه صدر أكتر من كتف"},{"id":"chest-press-machine-9858","name":"Chest Press Machine","choices":[{"key":"flat-chest-primary","name":"Chest Press Machine","sets":3,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/dnp30xZH2UI","preset":[{"w":35,"reps":11},{"w":35,"reps":8},{"w":35,"reps":7}]},{"key":"flat-chest-alt-machine","name":"Chest Press Machine","sets":3,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/dnp30xZH2UI","preset":[{"w":30,"reps":11},{"w":30,"reps":8},{"w":30,"reps":6}]},{"key":"flat-chest-cable","name":"Chest Cable","sets":3,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[{"w":25,"reps":12},{"w":25,"reps":8},{"w":25,"reps":8}]},{"key":"db-flat-press","name":"DB Flat Press","sets":3,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"smith-flat-press","name":"Smith Flat Press","sets":3,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"leg-press-6897","name":"Leg Press","choices":[{"key":"leg-press","name":"Leg Press","sets":2,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[{"w":165,"reps":10},{"w":165,"reps":9}]},{"key":"hack-squat","name":"Hack Squat","sets":2,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"https://youtube.com/shorts/UzXKN92fujQ","preset":[{"w":110,"reps":8},{"w":110,"reps":7}]},{"key":"smith-squat","name":"Smith Squat","sets":2,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[]}],"note":"في الهاك: حوالي 120° من ثني الركبة كفاية لاستهداف الكوادز، ولو تقدر انزل أكتر براحتك"},{"id":"machine-lateral-raises-sa-4542","name":"Machine Lateral Raises SA","choices":[{"key":"machine lateral raises sa","name":"Machine Lateral Raises SA","sets":3,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/ay-KscqBbd8","preset":[{"w":30,"reps":9},{"w":30,"reps":8},{"w":30,"reps":7}]},{"key":"cable lateral raises","name":"Cable Lateral Raises","sets":3,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"db lateral raises","name":"DB Lateral Raises","sets":3,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"حاول الحركة تطلع من الكتف مش من الجسم كله"},{"id":"overhead-extension-4601","name":"Overhead Extension","choices":[{"key":"overhead extension","name":"Overhead Extension","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/0sNnjugunwo","preset":[{"w":35,"reps":14},{"w":35,"reps":12}]},{"key":"db skull crusher","name":"DB Skull Crusher","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":"لو الكوع وجعك العب Pushdown"},{"id":"butterfly-3859","name":"Butterfly","choices":[{"key":"butterfly","name":"Butterfly","sets":1,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[{"w":70,"reps":11}]}],"note":""},{"id":"lat-pulldown-crunches-1726","name":"Lat Pulldown Crunches","choices":[{"key":"lat pulldown crunches","name":"Lat Pulldown Crunches","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/PoJb1yOd6Y4","preset":[{"w":45,"reps":20},{"w":55,"reps":15}]},{"key":"cable crunch","name":"Cable Crunch","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":"الحركة من ثني وفرد العمود الفقري"},{"id":"leg-extension-sl-1053","name":"Leg Extension SL","choices":[{"key":"leg extension sl","name":"Leg Extension SL","sets":2,"reps":"8~12","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/feQt2tJe_ks","preset":[{"w":65,"reps":10}]}],"note":"لو الجهاز مش موجود العب Banded Leg Extension"}]},{"id":"posterior-a","name":"Posterior A","exercises":[{"id":"wide-grip-seated-cable-row-9407","name":"Wide Grip Seated Cable Row","choices":[{"key":"wide grip seated cable row","name":"Wide Grip Seated Cable Row","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[{"w":60,"reps":11},{"w":60,"reps":10}]},{"key":"incline db row","name":"Incline DB Row","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"cable row","name":"Cable Row","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"افتح كيعانك لبره حسب راحة كتفك ومرونتك"},{"id":"lat-row-machine-7511","name":"Lat Row Machine","choices":[{"key":"lat row machine","name":"Lat Row Machine","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[{"w":60,"reps":12},{"w":60,"reps":10}]}],"note":""},{"id":"wide-grip-lat-pulldown-9475","name":"Wide Grip Lat Pulldown","choices":[{"key":"wide grip lat pulldown","name":"Wide Grip Lat Pulldown","sets":3,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"https://youtube.com/shorts/z9qcfPgQ4x0","preset":[{"w":65,"reps":12},{"w":65,"reps":10},{"w":65,"reps":8}]},{"key":"cable wide grip lat pulldown","name":"Cable Wide Grip Lat Pulldown","sets":3,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"","preset":[]}],"note":"ركز في مسار الكوع وضم لوحين الكتف"},{"id":"glute-raises-3421","name":"Glute Raises","choices":[{"key":"glute raises","name":"Glute Raises","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[{"w":20,"reps":18}]},{"key":"hip extension","name":"Hip Extension","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[]},{"key":"hip thrust","name":"Hip Thrust","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"hip-thrust-2280","name":"Hip Thrust","choices":[{"key":"hip thrust","name":"Hip Thrust","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[{"w":35,"reps":10}]}],"note":""},{"id":"sa-leaned-rear-delt-fly-6443","name":"SA Leaned Rear Delt Fly","choices":[{"key":"rear-delt-cable-a","name":"SA Leaned Rear Delt Fly","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/-FNusuPYDkM","preset":[{"w":10,"reps":8}]},{"key":"rear-delt-machine-a","name":"Rear Delt Flies Machine","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/-FNusuPYDkM","preset":[{"w":40,"reps":13}]},{"key":"reverse-pec-dec","name":"Reverse Pec Dec","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":"الكيبل هو الاختيار الأساسي للكتف الخلفي"},{"id":"seated-leg-curl-1751","name":"Seated Leg Curl","choices":[{"key":"seated leg curl","name":"Seated Leg Curl","sets":2,"reps":"8~12","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/j1nMlG_e79c","preset":[{"w":25,"reps":10},{"w":25,"reps":9}]},{"key":"lying leg curl","name":"Lying Leg Curl","sets":2,"reps":"8~12","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"لو الجهازين مش موجودين العب SLDL"},{"id":"preacher-curl-machine-sa-7506","name":"Preacher Curl Machine SA","choices":[{"key":"preacher curl machine sa","name":"Preacher Curl Machine SA","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[{"w":20,"reps":12},{"w":20,"reps":10}]},{"key":"face in curls","name":"Face In Curls","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":"الحركة من الكوع من غير مرجحة"},{"id":"leg-press-calf-raises-4947","name":"Leg Press Calf Raises","choices":[{"key":"leg press calf raises","name":"Leg Press Calf Raises","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/wfFMMCjSDDg","preset":[{"w":160,"reps":12},{"w":160,"reps":10}]},{"key":"smith calf raises","name":"Smith Calf Raises","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"wrist-curls-7183","name":"Wrist Curls","choices":[{"key":"wrist curls","name":"Wrist Curls","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/2jGS_GuSA90","preset":[{"w":75,"reps":10},{"w":75,"reps":8}]}],"note":"فرد الصوابع في الاستطالة واختار وزن يسمح بانقباض كامل"}]},{"id":"anterior-b","name":"Anterior B","exercises":[{"id":"incline-chest-cable-9977","name":"Incline Chest Cable","choices":[{"key":"incline-chest-cable","name":"Incline Chest Cable","sets":3,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/Z5SvP3R_Szg","preset":[{"w":25,"reps":11},{"w":25,"reps":9},{"w":25,"reps":7}]},{"key":"incline-chest-machine","name":"Incline Chest Press Machine","sets":2,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/Z5SvP3R_Szg","preset":[{"w":30,"reps":10},{"w":30,"reps":7}]},{"key":"db-incline-press","name":"DB Incline Press","sets":2,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"smith-incline-press","name":"Smith Incline Press","sets":2,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"machine-shoulder-press-6649","name":"Machine Shoulder Press","choices":[{"key":"machine shoulder press","name":"Machine Shoulder Press","sets":2,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/DtJY_WLvH7Q","preset":[{"w":40,"reps":12},{"w":40,"reps":8}]},{"key":"db shoulder press","name":"DB Shoulder Press","sets":2,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"smith shoulder press","name":"Smith Shoulder Press","sets":2,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"leg-extension-sl-1053","name":"Leg Extension SL","choices":[{"key":"leg extension sl","name":"Leg Extension SL","sets":2,"reps":"8~12","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/feQt2tJe_ks","preset":[{"w":65,"reps":11},{"w":65,"reps":9}]}],"note":""},{"id":"cable-lateral-raises-9723","name":"Cable Lateral Raises","choices":[{"key":"cable lateral raises","name":"Cable Lateral Raises","sets":2,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/WF9oZyEHnU4","preset":[{"w":15,"reps":10},{"w":15,"reps":9}]},{"key":"db lateral raises","name":"DB Lateral Raises","sets":2,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"يفضل الكابل"},{"id":"sa-tricep-pushdown-1639","name":"SA Tricep Pushdown","choices":[{"key":"sa tricep pushdown","name":"SA Tricep Pushdown","sets":3,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://www.youtube.com/shorts/Uliit9B7Xpg","preset":[{"w":45,"reps":15},{"w":45,"reps":9},{"w":45,"reps":9}]},{"key":"double rope pushdown","name":"Double Rope Pushdown","sets":3,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":"فرد للكوع فقط من غير مرجحة أو حركة زيادة من الكتف"},{"id":"pec-deck-990","name":"Pec Deck","choices":[{"key":"pec deck","name":"Pec Deck","sets":1,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[{"w":70,"reps":7}]},{"key":"cable fly","name":"Cable Fly","sets":1,"reps":"6~10","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"hip-adduction-9718","name":"Hip Adduction","choices":[{"key":"hip adduction","name":"Hip Adduction","sets":1,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/qfiyJLkQC3s","preset":[{"w":60,"reps":6}]},{"key":"cable hip adduction","name":"Cable Hip Adduction","sets":1,"reps":"6~8","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"ثبت نفسك بالمقبض ومتتحركش على الجهاز"},{"id":"reverse-grip-curls-sa-4733","name":"Reverse Grip Curls SA","choices":[{"key":"reverse grip curls sa","name":"Reverse Grip Curls SA","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[{"w":30,"reps":9},{"w":30,"reps":8}]},{"key":"db reverse curl","name":"DB Reverse Curl","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]},{"key":"barbell reverse curl","name":"Barbell Reverse Curl","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":""}]},{"id":"posterior-b","name":"Posterior B","exercises":[{"id":"t-bar-row-703","name":"T Bar Row","choices":[{"key":"t bar row","name":"T Bar Row","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/d0n2wyqP_0U","preset":[{"w":60,"reps":8},{"w":60,"reps":7}]},{"key":"incline db row","name":"Incline DB Row","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[]},{"key":"cable row","name":"Cable Row","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":"افتح كيعانك لبره حسب راحة كتفك ومرونتك"},{"id":"sa-lat-pullover-4299","name":"SA Lat Pullover","choices":[{"key":"sa-lat-pullover","name":"SA Lat Pullover","sets":2,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"https://youtube.com/shorts/nXwinX8Mf0Y","preset":[{"w":30,"reps":9},{"w":30,"reps":8}]},{"key":"sa-lat-row-cable","name":"SA Lat Row Cable","sets":2,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"","preset":[{"w":45,"reps":12},{"w":55,"reps":9}]},{"key":"lat-pullover-machine","name":"Lat Pullover Machine","sets":2,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"","preset":[{"w":80,"reps":6},{"w":60,"reps":10}]},{"key":"cable-sa-lat-row","name":"Cable SA Lat Row","sets":2,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"","preset":[]},{"key":"db-sa-lat-row","name":"DB SA Lat Row","sets":2,"reps":"6~8","warmup":"1~3","rest":"3~5","link":"","preset":[]}],"note":"Lat Pullover هو الاختيار الأساسي"},{"id":"face-away-curl-5799","name":"Face Away Curl","choices":[{"key":"face away curl","name":"Face Away Curl","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/ydM2_VRtEes","preset":[{"w":30,"reps":7},{"w":30,"reps":6}]},{"key":"db curls","name":"DB Curls","sets":2,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"rdl-8881","name":"RDL","choices":[{"key":"rdl","name":"RDL","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"https://youtube.com/shorts/Nc14nw0tRGw","preset":[{"w":40,"reps":7}]},{"key":"hip extension","name":"Hip Extension","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[]},{"key":"hip thrust","name":"Hip Thrust","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"hip-thrust-machine-2147","name":"Hip Thrust Machine","choices":[{"key":"hip thrust machine","name":"Hip Thrust Machine","sets":1,"reps":"5~8","warmup":"1~3","rest":"3~5","link":"","preset":[{"w":30,"reps":10}]}],"note":""},{"id":"sa-rear-delt-flies-3956","name":"SA Rear Delt Flies","choices":[{"key":"rear-delt-cable-b","name":"SA Rear Delt Flies","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/-FNusuPYDkM","preset":[{"w":15,"reps":12}]},{"key":"rear-delt-leaned-b","name":"SA Leaned Rear Delt Fly","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[{"w":10,"reps":11}]},{"key":"rear-delt-machine-b","name":"Rear Delt Fly Machine","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"https://youtube.com/shorts/-FNusuPYDkM","preset":[{"w":40,"reps":13}]},{"key":"reverse-pec-dec","name":"Reverse Pec Dec","sets":1,"reps":"6~10","warmup":"0","rest":"3~5","link":"","preset":[]}],"note":"الكيبل هو الاختيار الأساسي للكتف الخلفي"},{"id":"cable-shrugs-6691","name":"Cable Shrugs","choices":[{"key":"cable shrugs","name":"Cable Shrugs","sets":1,"reps":"6~10","warmup":"1","rest":"3~5","link":"https://www.youtube.com/shorts/S9OXkqZB_uc","preset":[{"w":70,"reps":10}]}],"note":""},{"id":"seated-leg-curl-1751","name":"Seated Leg Curl","choices":[{"key":"seated leg curl","name":"Seated Leg Curl","sets":2,"reps":"8~12","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/j1nMlG_e79c","preset":[{"w":25,"reps":10},{"w":25,"reps":9}]},{"key":"lying leg curl","name":"Lying Leg Curl","sets":2,"reps":"8~12","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""},{"id":"leg-press-calf-raises-4947","name":"Leg Press Calf Raises","choices":[{"key":"leg press calf raises","name":"Leg Press Calf Raises","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"https://youtube.com/shorts/wfFMMCjSDDg","preset":[{"w":160,"reps":11},{"w":160,"reps":11}]},{"key":"smith calf raises","name":"Smith Calf Raises","sets":2,"reps":"5~7","warmup":"1~2","rest":"3~5","link":"","preset":[]}],"note":""}]}],"performance":{},"history":[],"settings":{"unit":"kg","rest":180},"schema":2};
const clone=x=>JSON.parse(JSON.stringify(x)),uid=()=>Math.random().toString(36).slice(2,10),norm=s=>(s||'').trim().toLowerCase().replace(/\s+/g,' '),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S=load(),view='home',rid=null,work=null,timerId=null,timerLeft=0,restDeadline=+(localStorage.getItem('gympro-rest-deadline')||0),nativeRestScheduled=false;

function load(){try{let x=JSON.parse(localStorage.getItem(K));return x&&x.schema===2?x:clone(SEED)}catch{return clone(SEED)}}
function save(){localStorage.setItem(K,JSON.stringify(S))}
function toast(x){toastEl.textContent=x;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),1500)}
function open(html){M.innerHTML=`<div class="sheet">${html}</div>`;M.classList.remove('hide')}
function close(){M.classList.add('hide');M.innerHTML=''}
function choice(ex,key){return ex.choices.find(c=>c.key===key)||ex.choices[0]}
function blankRows(ch){let src=S.performance[ch.key]||ch.preset||[],n=Math.max(1,+ch.sets||1);return Array.from({length:n},(_,i)=>({w:src[i]?.w??'',reps:src[i]?.reps??'',done:false}))}
function video(ch){return ch.link?`<a class="video" href="${esc(ch.link)}" title="Exercise video">▶</a>`:''}
function spec(ch){return `${ch.sets} sets × ${esc(ch.reps)} reps${ch.warmup&&ch.warmup!=='0'?` · warm-up ${esc(ch.warmup)}`:' · no warm-up'}${ch.rest?` · rest ${esc(ch.rest)} min`:''}`}

function nav(v){view=v;$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));({home,routines,history,settings,builder,workout}[v]||home)();scrollTo(0,0)}
function card(r,i){return `<div class="card routine" data-r="${r.id}"><div class="idx">${String(i+1).padStart(2,'0')}</div><div class="grow"><h3>${esc(r.name)}</h3><p>${r.exercises.length} exercise groups · ${r.exercises.reduce((a,e)=>a+(+e.choices[0].sets||0),0)} working sets</p></div><div class="routine-actions"><button class="btn editday" data-editday="${r.id}">Edit</button><button class="btn" data-start="${r.id}">Start</button></div></div>`}
function bindCards(){$$('[data-r]').forEach(e=>e.onclick=x=>{if(x.target.closest('[data-start],[data-editday]'))return;rid=e.dataset.r;nav('builder')});$$('[data-editday]').forEach(b=>b.onclick=e=>{e.stopPropagation();rid=b.dataset.editday;nav('builder')});$$('[data-start]').forEach(b=>b.onclick=e=>{e.stopPropagation();start(b.dataset.start)})}

function home(){
 T.textContent='Training';let total=S.routines.reduce((a,r)=>a+r.exercises.length,0),week=S.history.filter(h=>h.ts>Date.now()-6048e5).length,n=S.routines[0];
 A.innerHTML=`<section class="hero"><small class="mut">ABOELKASEM PROGRAM</small><h2>Train. Log.<br>Progress.</h2><p class="mut">Your current A×P split is preloaded with weights, reps, alternatives and warm-up rules.</p>${n?`<button class="btn primary" data-start="${n.id}">Start ${esc(n.name)}</button>`:''}</section>
 <div class="stats"><div class="stat"><b>${week}</b><span>WORKOUTS / 7D</span></div><div class="stat"><b>${S.routines.length}</b><span>TRAINING DAYS</span></div><div class="stat"><b>${total}</b><span>EXERCISE GROUPS</span></div></div>
 <div class="section"><h3>Your routine</h3><span>PRELOADED</span></div>${S.routines.map(card).join('')}`;bindCards()
}
function routines(){
 T.textContent='Routine';A.innerHTML=`<div class="section"><h3>Training days</h3><span>${S.routines.length}</span></div>${S.routines.map(card).join('')||'<div class="empty">No training days</div>'}<button class="btn primary block" id="newDay">+ Add training day</button>`;
 bindCards();$('#newDay').onclick=addDay
}
function addDay(){open(`<h2>New training day</h2><div class="field"><label>DAY NAME</label><input id="dn" class="input" placeholder="Anterior C"></div><div class="row"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="saveDay">Create</button></div>`);$('#cancel').onclick=close;$('#saveDay').onclick=()=>{let n=$('#dn').value.trim();if(!n)return;S.routines.push({id:uid(),name:n,exercises:[]});save();close();routines()}}

function builder(){
 let r=S.routines.find(x=>x.id===rid);if(!r)return nav('routines');T.textContent=r.name;
 A.innerHTML=`<div class="row"><button class="btn" id="back">← Routine</button><button class="btn" id="rename">Rename</button><button class="btn danger" id="del">Delete</button></div>
 <div class="section"><h3>Exercises</h3><span>${r.exercises.length}</span></div>
 ${r.exercises.map((e,i)=>{let ch=e.choices[0];return `<div class="card ex"><div class="exhead"><div><b>${i+1}. ${esc(ch.name)}</b><div class="mut">${spec(ch)}</div></div><div class="row">${video(ch)}<button class="btn mini" data-edit="${e.id}">Edit</button></div></div>${e.choices.length>1?`<div class="chips">${e.choices.map((c,j)=>`<span class="chip ${j===0?'on':''}">${j===0?'PRIMARY · ':''}${esc(c.name)}</span>`).join('')}</div>`:''}${e.note?`<p class="note">${esc(e.note)}</p>`:''}</div>`}).join('')||'<div class="empty">No exercises yet</div>'}
 <div class="row"><button class="btn primary" id="addEx">+ Add exercise</button><button class="btn" id="go">Start workout</button></div>`;
 $('#back').onclick=()=>nav('routines');$('#rename').onclick=()=>{let n=prompt('New day name',r.name);if(n){r.name=n.trim();save();builder()}};$('#del').onclick=()=>{if(confirm('Delete this day?')){S.routines=S.routines.filter(x=>x.id!==r.id);save();nav('routines')}};$('#addEx').onclick=()=>addExerciseFlow(r);$('#go').onclick=()=>start(r.id);$$('[data-edit]').forEach(b=>b.onclick=()=>exForm(r,r.exercises.find(e=>e.id===b.dataset.edit)))
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

function start(id){
 let r=S.routines.find(x=>x.id===id);if(!r)return;if(!r.exercises.length){rid=id;nav('builder');return toast('Add exercises first')}
 work={r,start:Date.now(),choiceKeys:{},rows:{},warm:{}};r.exercises.forEach(e=>{let ch=e.choices[0];work.choiceKeys[e.id]=ch.key;work.rows[e.id]=blankRows(ch);work.warm[e.id]=[]});nav('workout')
}
function selected(e){return choice(e,work.choiceKeys[e.id])}
function warmMax(s){if(!s||s==='0')return 0;let m=String(s).match(/(\d+)\s*~\s*(\d+)/);return m?+m[2]:(+s||1)}
function workout(){
 let r=work?.r;if(!r)return nav('home');T.textContent=r.name;
 A.innerHTML=`<div class="worktop"><button class="btn" id="exit">← Exit</button><button class="timer" id="restBtn">Rest ${fmt(timerLeft)}</button></div>
 <div class="section"><h3>Workout</h3><span>weights & reps prefilled</span></div>
 ${r.exercises.map((e,i)=>{let ch=selected(e),opts=e.choices,wr=work.warm[e.id];return `<div class="card ex workout-card"><div class="exhead"><div><b>${i+1}. ${esc(ch.name)}</b><div class="mut">${spec(ch)}</div></div>${video(ch)}</div>
 ${opts.length>1?`<div class="chips">${opts.map(o=>`<button class="chip ${o.key===ch.key?'on':''}" data-choice="${esc(o.key)}" data-ex="${e.id}">${esc(o.name)}</button>`).join('')}</div>`:''}
 ${e.note?`<details><summary>Note</summary><p class="note">${esc(e.note)}</p></details>`:''}
 ${ch.warmup&&ch.warmup!=='0'?`<div class="warmbox"><div class="warmhead"><span>Warm-up · suggested ${esc(ch.warmup)}</span><button class="btn mini" data-addwarm="${e.id}">+ Set</button></div>${wr.map((s,j)=>`<div class="setrow warmrow"><span>W${j+1}</span><input class="input" type="number" step=".5" placeholder="kg" data-wf="w" data-ex="${e.id}" data-i="${j}" value="${s.w??''}"><input class="input" type="number" placeholder="reps" data-wf="reps" data-ex="${e.id}" data-i="${j}" value="${s.reps??''}"><button class="xbtn" data-rmwarm="${e.id}" data-i="${j}">×</button></div>`).join('')}</div>`:''}
 <div class="setrow labels"><span>SET</span><span>WEIGHT</span><span>REPS</span><span>✓</span></div>
 ${work.rows[e.id].map((s,j)=>`<div class="setrow"><span>${j+1}</span><input class="input" type="number" step=".5" data-f="w" data-ex="${e.id}" data-i="${j}" value="${s.w}"><input class="input" type="number" data-f="reps" data-ex="${e.id}" data-i="${j}" value="${s.reps}"><input class="check" type="checkbox" data-f="done" data-ex="${e.id}" data-i="${j}" ${s.done?'checked':''}></div>`).join('')}</div>`}).join('')}
 <button class="btn primary block finish" id="finish">Finish workout</button>`;
 $('#exit').onclick=()=>{open('<h2>Exit workout?</h2><p class="mut">Your unfinished sets will not be saved.</p><div class="row"><button class="btn" id="stayWorkout">Stay</button><button class="btn danger" id="exitWorkoutNow">Exit workout</button></div>');$('#stayWorkout').onclick=close;$('#exitWorkoutNow').onclick=()=>{close();work=null;stopTimer();nav('routines')}};$('#finish').onclick=finish;$('#restBtn').onclick=()=>timerLeft?stopTimer():startTimer();
 $$('[data-f]').forEach(el=>el.onchange=()=>{let s=work.rows[el.dataset.ex][+el.dataset.i],f=el.dataset.f;if(f==='done'){s.done=el.checked;if(el.checked)startTimer()}else s[f]=el.value});
 $$('[data-wf]').forEach(el=>el.onchange=()=>work.warm[el.dataset.ex][+el.dataset.i][el.dataset.wf]=el.value);
 $$('[data-addwarm]').forEach(b=>b.onclick=()=>{let e=r.exercises.find(x=>x.id===b.dataset.addwarm),ch=selected(e),arr=work.warm[e.id],mx=warmMax(ch.warmup);if(arr.length>=mx)return toast(`Max warm-up: ${mx}`);arr.push({w:'',reps:''});workout()});
 $$('[data-rmwarm]').forEach(b=>b.onclick=()=>{work.warm[b.dataset.rmwarm].splice(+b.dataset.i,1);workout()});
 $$('[data-choice]').forEach(b=>b.onclick=()=>{let e=r.exercises.find(x=>x.id===b.dataset.ex);work.choiceKeys[e.id]=b.dataset.choice;let ch=selected(e);work.rows[e.id]=blankRows(ch);work.warm[e.id]=[];workout()});
}
function fmt(s){s=Math.max(0,+s||0);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function scheduleNativeRest(seconds){try{return !!(window.GymNative&&window.GymNative.startRestAlarm&&window.GymNative.startRestAlarm(Math.max(1,Math.round(seconds))))}catch{return false}}
function cancelNativeRest(){try{if(window.GymNative&&window.GymNative.cancelRestAlarm)window.GymNative.cancelRestAlarm()}catch{}}
function fallbackRestAlarm(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const ctx=new AC(),now=ctx.currentTime;
  [0,.35,.7].forEach((d,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=i===1?900:1200;g.gain.setValueAtTime(.0001,now+d);g.gain.exponentialRampToValueAtTime(.35,now+d+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d+.22);o.connect(g);g.connect(ctx.destination);o.start(now+d);o.stop(now+d+.24)});
 }catch{}
}
function restCompleted(){
 if(timerId)clearInterval(timerId);timerId=null;timerLeft=0;restDeadline=0;localStorage.removeItem('gympro-rest-deadline');paintTimer();toast('Rest complete');
 if(!nativeRestScheduled)fallbackRestAlarm();
 nativeRestScheduled=false;
}
function tickRest(){
 if(!restDeadline)return;
 timerLeft=Math.max(0,Math.ceil((restDeadline-Date.now())/1000));paintTimer();
 if(timerLeft<=0)restCompleted();
}
function startTimer(){
 stopTimer(true,true);
 timerLeft=Math.max(30,+S.settings.rest||180);
 restDeadline=Date.now()+timerLeft*1000;
 localStorage.setItem('gympro-rest-deadline',String(restDeadline));
 nativeRestScheduled=scheduleNativeRest(timerLeft);
 paintTimer();timerId=setInterval(tickRest,500);
}
function stopTimer(reset=true,cancelNative=true){
 if(timerId)clearInterval(timerId);timerId=null;
 if(cancelNative)cancelNativeRest();
 nativeRestScheduled=false;
 if(reset){timerLeft=0;restDeadline=0;localStorage.removeItem('gympro-rest-deadline')}
 paintTimer();
}
function restoreRestTimer(){
 if(restDeadline>Date.now()){
  timerLeft=Math.max(0,Math.ceil((restDeadline-Date.now())/1000));
  nativeRestScheduled=true;
  if(timerId)clearInterval(timerId);
  timerId=setInterval(tickRest,500);paintTimer();
 }else if(restDeadline){restDeadline=0;localStorage.removeItem('gympro-rest-deadline')}
}
function paintTimer(){let b=$('#restBtn');if(b)b.textContent=`Rest ${fmt(timerLeft)}`}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickRest()});
window.addEventListener('focus',tickRest);
window.GymProResume=()=>{tickRest();paintTimer()};
function finish(){
 let sets=0,vol=0;work.r.exercises.forEach(e=>{let ch=selected(e),rows=work.rows[e.id];rows.forEach(s=>{if(s.done){sets++;vol+=(+s.w||0)*(+s.reps||0)}});S.performance[ch.key]=rows.map(s=>({w:+s.w||0,reps:+s.reps||0}))});
 S.history.unshift({id:uid(),name:work.r.name,ts:Date.now(),mins:Math.max(1,Math.round((Date.now()-work.start)/60000)),sets,vol});S.history=S.history.slice(0,100);save();work=null;stopTimer();nav('history');toast('Workout saved')
}
function history(){
 T.textContent='History';A.innerHTML=`<div class="stats"><div class="stat"><b>${S.history.length}</b><span>WORKOUTS</span></div><div class="stat"><b>${Math.round(S.history.reduce((a,h)=>a+h.vol,0))}</b><span>VOLUME</span></div><div class="stat"><b>${S.history.reduce((a,h)=>a+h.sets,0)}</b><span>SETS</span></div></div>
 <div class="section"><h3>Sessions</h3><span>NEWEST</span></div>${S.history.map(h=>`<div class="card history"><div><b>${esc(h.name)}</b><span class="mut">${new Date(h.ts).toLocaleDateString()} · ${h.mins} min · ${h.sets} sets</span></div><b>${Math.round(h.vol)} ${S.settings.unit}</b></div>`).join('')||'<div class="empty">No workouts logged yet</div>'}`
}
function settings(){
 T.textContent='Settings';A.innerHTML=`<div class="card"><div class="field"><label>WEIGHT UNIT</label><select id="unit" class="input"><option>kg</option><option>lb</option></select></div><div class="field"><label>DEFAULT REST TIMER (SECONDS)</label><input id="rest" type="number" class="input" value="${S.settings.rest||180}"></div>
 <div class="field"><label>BACKUP</label><button class="btn block" id="exp">Export JSON</button></div><div class="field"><button class="btn block" id="imp">Import JSON</button></div><button class="btn danger block" id="reset">Reset to AboElkasem program</button></div>`;
 $('#unit').value=S.settings.unit;$('#unit').onchange=e=>{S.settings.unit=e.target.value;save()};$('#rest').onchange=e=>{S.settings.rest=Math.max(30,+e.target.value||180);save()};
 $('#exp').onclick=()=>{open(`<h2>Export backup</h2><textarea class="input" id="bk">${esc(JSON.stringify(S,null,2))}</textarea><button class="btn primary block" id="copy">Copy</button>`);$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#bk').value);toast('Copied')}catch{toast('Select and copy manually')}}};
 $('#imp').onclick=()=>{open('<h2>Import backup</h2><textarea id="im" class="input"></textarea><button id="restore" class="btn primary block">Restore</button>');$('#restore').onclick=()=>{try{let x=JSON.parse($('#im').value);if(!x.routines)throw 0;S=x;S.schema=2;save();close();nav('home')}catch{toast('Invalid backup')}}};
 $('#reset').onclick=()=>{if(confirm('Reset everything and reload the prebuilt program?')){S=clone(SEED);save();nav('home')}}
}
$('nav button').forEach(b=>b.onclick=()=>nav(b.dataset.v));$('#add').onclick=()=>view==='routines'?addDay():nav('routines');M.onclick=e=>{if(e.target===M)close()};nav('home');restoreRestTimer()
})();