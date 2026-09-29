const fs=require('fs');
const path=require('path');

const root='app/src/main/assets';
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...index.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
if(scripts.length<10) throw new Error('Expected modular script architecture');
if(scripts[scripts.length-1]!=='app.js') throw new Error('app.js must be the final composition root');

for(const src of scripts){
  const full=path.join(root,src);
  if(!fs.existsSync(full)) throw new Error('Missing module: '+src);
}
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
if(app.length>1800) throw new Error('app.js must remain a small composition root');
if(app.includes('const SEED=')) throw new Error('Seed data leaked into app.js');
if(app.includes('function settings(')||app.includes('function workout(')) throw new Error('Feature logic leaked into app.js');

const required=[
  'core/dom.js','core/utils.js','core/state.js','core/router.js',
  'data/seed-data.js','data/store.js','domain/workout-finish.js',
  'services/timers.js','services/backup.js','ui/primitives.js',
  'views/home.js','views/builder.js','views/workout.js','views/history.js','views/settings.js'
];
for(const module of required){
  if(!scripts.includes(module)) throw new Error('Architecture module missing: '+module);
}
console.log('VantaLift architecture test passed');

const javaRoot='app/src/main/java/com/ahmed/gympro';
const javaModules=[
  'MainActivity.java','RestAlarmScheduler.java','BackupFileManager.java',
  'GymNativeBridge.java','VantaWebViewClient.java','WindowInsetsHelper.java'
];
for(const file of javaModules){
  if(!fs.existsSync(path.join(javaRoot,file))) throw new Error('Native architecture module missing: '+file);
}
const mainActivity=fs.readFileSync(path.join(javaRoot,'MainActivity.java'),'utf8');
const mainLines=mainActivity.split('\n').length;
if(mainLines>170) throw new Error('MainActivity became a God Activity: '+mainLines+' lines');
if(mainActivity.includes('class GymNativeBridge')) throw new Error('Native bridge leaked back into MainActivity');
if(mainActivity.includes('setExactAndAllowWhileIdle')) throw new Error('Alarm scheduling leaked back into MainActivity');
if(mainActivity.includes('ACTION_CREATE_DOCUMENT')) throw new Error('Backup file I/O leaked back into MainActivity');
