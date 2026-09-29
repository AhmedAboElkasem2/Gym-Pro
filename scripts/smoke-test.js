const fs=require('fs');
const path=require('path');
const vm=require('vm');

function makeEl(){
  const classes=new Set();
  return {
    innerHTML:'',textContent:'',value:'',checked:false,disabled:false,dataset:{},style:{},
    classList:{
      add(c){classes.add(c)},remove(c){classes.delete(c)},
      toggle(c,on){if(on===undefined){classes.has(c)?classes.delete(c):classes.add(c)}else{on?classes.add(c):classes.delete(c)}},
      contains(c){return classes.has(c)}
    },
    querySelector(){return makeEl()},querySelectorAll(){return []},
    onclick:null,onchange:null,oninput:null,onfocus:null
  };
}
const nodes=new Map();
const document={
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,makeEl());return nodes.get(sel)},
  querySelectorAll(){return []},
  addEventListener(){}
};
const store=new Map();
const localStorage={
  getItem(k){return store.has(k)?store.get(k):null},
  setItem(k,v){store.set(k,String(v))},
  removeItem(k){store.delete(k)}
};
document.querySelector('#modal').classList.add('hide');
const window={addEventListener(){},GymNative:{startRestAlarm(){return true},cancelRestAlarm(){}}};
const sandbox={
  console,document,window,localStorage,
  scrollTo(){},setTimeout(){return 1},clearTimeout(){},
  setInterval(){return 1},clearInterval(){},
  confirm(){return false},prompt(){return null},
  navigator:{clipboard:{writeText:async()=>{}}},
  Date,Math,JSON,Map,Set
};
sandbox.globalThis=sandbox;
const context=vm.createContext(sandbox);

const root='app/src/main/assets';
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...index.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
if(!scripts.length)throw new Error('No application scripts declared');
for(const src of scripts){
  const code=fs.readFileSync(path.join(root,src),'utf8');
  const unsafe=(code.match(/(^|[^$])\$\([^)]*\)\.forEach/gm)||[]);
  if(unsafe.length)throw new Error('Unsafe single-element selector in '+src+': '+unsafe.join(' | '));
  new vm.Script(code,{filename:src}).runInContext(context);
}

if(!nodes.get('#app')?.innerHTML.includes('NEXT WORKOUT'))throw new Error('Smart Home did not render');
if(typeof window.VantaLiftHandleBack!=='function')throw new Error('App back handler is missing');
if(window.VantaLiftHandleBack()!==false)throw new Error('Home back should delegate to Android exit');

const hint12=vm.runInContext(`S.performance={'smoke':[ {w:35,reps:12},{w:35,reps:8} ]};S.settings.unit='kg';progressionSuggestion({key:'smoke',sets:2})`,context);
if(!hint12||!hint12.text.includes('40 kg'))throw new Error('12+ progression rule or +5 kg increment failed');
const hint13=vm.runInContext(`S.performance={'smoke':[ {w:35,reps:13},{w:35,reps:8} ]};progressionSuggestion({key:'smoke',sets:2})`,context);
if(!hint13)throw new Error('Progression hint must appear above 12 reps');
const noHint=vm.runInContext(`S.performance={'smoke':[ {w:35,reps:11},{w:35,reps:10} ]};progressionSuggestion({key:'smoke',sets:2})`,context);
if(noHint!==null)throw new Error('Progression hint must stay hidden below 12 reps');

const locked=vm.runInContext(`work={r:{name:'Smoke'}};nav('history')`,context);
if(locked!==false)throw new Error('Workout navigation lock failed');
vm.runInContext(`work=null;nav('home')`,context);

if(localStorage.getItem('gympro-v2')===undefined)throw new Error('Storage contract changed unexpectedly');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
if(css.includes('backdrop-filter'))throw new Error('Expensive backdrop-filter must stay disabled');
if(/background-attachment\s*:\s*fixed/.test(css))throw new Error('Fixed background must stay disabled');
console.log('VantaLift runtime smoke test passed');
