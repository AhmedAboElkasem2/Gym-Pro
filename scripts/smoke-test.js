const fs=require('fs');
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
    querySelector(){return makeEl()},
    querySelectorAll(){return []},
    closest(){return null},
    onclick:null,onchange:null,oninput:null,onfocus:null
  };
}
const nodes=new Map();
const document={
  hidden:false,
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
const window={addEventListener(){},GymNative:{startRestAlarm(){return true},cancelRestAlarm(){},acknowledgeRestAlarm(){},isRestAlarmActive(){return false}}};
const sandbox={
  console,document,window,localStorage,
  scrollTo(){},setTimeout(){return 1},clearTimeout(){},
  setInterval(){return 1},clearInterval(){},
  confirm(){return false},prompt(){return null},
  navigator:{clipboard:{writeText:async()=>{}}},
  Date,Math,JSON,Map,Set
};
sandbox.globalThis=sandbox;
const code=fs.readFileSync('app/src/main/assets/app.bundle.js','utf8');
new vm.Script(code,{filename:'app.bundle.js'}).runInNewContext(sandbox);
if(!nodes.get('#app')?.innerHTML.includes('NEXT WORKOUT')) throw new Error('Smart Home did not render');
if(typeof window.VantaLiftHandleBack!=='function') throw new Error('App back handler missing');
if(window.VantaLiftHandleBack()!==false) throw new Error('Home back should delegate to Android');
if(typeof window.GymProResume!=='function') throw new Error('Native resume callback missing');
if(typeof window.VantaLiftRestAlarmActive!=='function') throw new Error('Persistent rest alarm callback missing');
window.VantaLiftRestAlarmActive();
if(!nodes.get('#modal')?.innerHTML.includes('The Rest Time Is Over , Get up and')) throw new Error('Rest-complete Hulk dialog did not render');
if(!nodes.get('#modal')?.classList.contains('persistent-modal')) throw new Error('Rest-complete dialog must stay persistent until OK');
if(!store.has('vantalift-auto-backups-v1')) throw new Error('Startup auto-backup was not initialized');
const css=fs.readFileSync('app/src/main/assets/styles.css','utf8');
if(css.includes('backdrop-filter')) throw new Error('Expensive backdrop-filter must stay disabled');
if(/background-attachment\s*:\s*fixed/.test(css)) throw new Error('Fixed background must stay disabled');
if(!css.includes('@keyframes routineLedSpin')) throw new Error('Routine LED effect missing');
if(!css.includes('@keyframes triLedSpin')) throw new Error('Shared tri-color LED effect missing');
if(!css.includes('.smart-hero-surface')) throw new Error('Home hero tri-color LED surface missing');
console.log('VantaLift bundled runtime smoke test passed');
