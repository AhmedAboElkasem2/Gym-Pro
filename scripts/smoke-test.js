const fs=require('fs');
const vm=require('vm');

function makeEl(){
  const classes=new Set();
  return {
    innerHTML:'', textContent:'', value:'', checked:false, dataset:{}, style:{},
    classList:{
      add(c){classes.add(c)},
      remove(c){classes.delete(c)},
      toggle(c,on){if(on===undefined){classes.has(c)?classes.delete(c):classes.add(c)}else{on?classes.add(c):classes.delete(c)}},
      contains(c){return classes.has(c)}
    },
    querySelector(){return makeEl()},
    querySelectorAll(){return []},
    onclick:null,onchange:null,oninput:null,onfocus:null
  };
}
const nodes=new Map();
const document={
  querySelector(sel){ if(!nodes.has(sel)) nodes.set(sel,makeEl()); return nodes.get(sel); },
  querySelectorAll(){ return []; },
  addEventListener(){}
};
const store=new Map();
const localStorage={
  getItem(k){return store.has(k)?store.get(k):null;},
  setItem(k,v){store.set(k,String(v));},
  removeItem(k){store.delete(k);}
};
document.querySelector('#modal').classList.add('hide');
const window={
  addEventListener(){},
  GymNative:{startRestAlarm(){return true;},cancelRestAlarm(){}}
};
const sandbox={
  console,document,window,localStorage,
  scrollTo(){},setTimeout(){return 1;},clearTimeout(){},
  setInterval(){return 1;},clearInterval(){},
  confirm(){return false;},prompt(){return null;},
  navigator:{clipboard:{writeText:async()=>{}}},
  Date,Math,JSON,Map,Set
};
sandbox.globalThis=sandbox;
const code=fs.readFileSync('app/src/main/assets/app.js','utf8');
const css=fs.readFileSync('app/src/main/assets/styles.css','utf8');
const unsafe=(code.match(/(^|[^$])\$\([^)]*\)\.forEach/gm)||[]);
if(unsafe.length) throw new Error('Unsafe single-element selector used with forEach: '+unsafe.join(' | '));
new vm.Script(code,{filename:'app.js'}).runInNewContext(sandbox);
if(!nodes.get('#app') || !nodes.get('#app').innerHTML.includes('NEXT WORKOUT')) throw new Error('Smart Home did not render');
if(typeof window.VantaLiftHandleBack!=='function') throw new Error('App back handler is missing');
if(window.VantaLiftHandleBack()!==false) throw new Error('Home back should delegate to Android exit');
if(code.includes('TRAINING VOLUME')) throw new Error('History must not expose training volume');
if(!code.includes('paintWorkoutClock')||!code.includes('00:00:00')) throw new Error('Workout duration timer is missing');
if(css.includes('backdrop-filter')) throw new Error('Expensive backdrop-filter must stay disabled');
if(/background-attachment\s*:\s*fixed/.test(css)) throw new Error('Fixed background must stay disabled');
if(!code.includes('Ahmed AboElkasem')) throw new Error('Developer credit is missing');
if(!code.includes('data-delete-history')) throw new Error('History delete control is missing');
if(!code.includes('setGlobalAddVisibility')) throw new Error('Routine-only add visibility logic is missing');
if(!code.includes("exerciseLog")) throw new Error("Exercise history data layer is missing");
if(!code.includes("progressionSuggestion")) throw new Error("Progression system is missing");
if(!code.includes("function summary()")) throw new Error("Workout summary is missing");
if(!code.includes("manageAutoBackups")) throw new Error("Auto backup manager is missing");
if(!code.includes("DRAG TO REORDER")) throw new Error("Routine reorder is missing");
if(!code.includes("NEXT WORKOUT")) throw new Error("Smart next workout is missing");
if(!code.includes("NEW PR 🔥")) throw new Error("PR celebration is missing");
if(!code.includes('x.schema=3')) throw new Error('Schema 3 migration is missing');
if(!code.includes('WORKOUT_ALLOWED_VIEWS')) throw new Error('Workout navigation allowlist is missing');
if(!code.includes('setWorkoutNavigationLock')) throw new Error('Workout navigation lock is missing');
if(!code.includes('Finish or exit workout first')) throw new Error('Workout navigation guard is missing');
if(!css.includes('nav.workout-locked')) throw new Error('Workout locked navigation styling is missing');
if(!css.includes('@keyframes routineLedSpin')||!css.includes('.routine::before')) throw new Error('Cyan routine LED trace is missing');
if(/\.routine::before[\s\S]*?(?:filter|backdrop-filter)\s*:/.test(css)) throw new Error('Routine LED effect must stay filter-free');
if(!code.includes("done.every(s=>(+s.reps||0)>=12)")||!code.includes("if(!ready)return null")) throw new Error('12-rep progression gate is missing');
console.log('VantaLift runtime smoke test passed');
