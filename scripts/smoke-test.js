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
if(!nodes.get('#app') || !nodes.get('#app').innerHTML.includes('Train. Log.')) throw new Error('Home screen did not render');
if(typeof window.VantaLiftHandleBack!=='function') throw new Error('App back handler is missing');
if(window.VantaLiftHandleBack()!==false) throw new Error('Home back should delegate to Android exit');
if(code.includes('TRAINING VOLUME')) throw new Error('History must not expose training volume');
if(!code.includes('paintWorkoutClock')||!code.includes('00:00:00')) throw new Error('Workout duration timer is missing');
if(css.includes('backdrop-filter')) throw new Error('Expensive backdrop-filter must stay disabled');
if(/background-attachment\s*:\s*fixed/.test(css)) throw new Error('Fixed background must stay disabled');
if(!code.includes('Ahmed AboElkasem')) throw new Error('Developer credit is missing');
if(!code.includes('data-delete-history')) throw new Error('History delete control is missing');
if(!code.includes('setGlobalAddVisibility')) throw new Error('Routine-only add visibility logic is missing');
console.log('VantaLift runtime smoke test passed');
