const fs=require('fs');
const vm=require('vm');

function makeEl(){
  return {
    innerHTML:'', textContent:'', value:'', checked:false, dataset:{}, style:{},
    classList:{add(){},remove(){},toggle(){}},
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
const unsafe=[...code.matchAll(/(?<!\\$)\\$\\([^\\)\\n]*\\)\\.forEach/g)];
if(unsafe.length) throw new Error('Unsafe single-element selector used with forEach: '+unsafe.map(x=>x[0]).join(', '));
new vm.Script(code,{filename:'app.js'}).runInNewContext(sandbox);
if(!nodes.get('#app') || !nodes.get('#app').innerHTML.includes('Train. Log.')) throw new Error('Home screen did not render');
console.log('Gym Pro runtime smoke test passed');
