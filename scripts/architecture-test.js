const fs=require('fs');
const path=require('path');

const webRoot='app/src/main/web-src';
const index=fs.readFileSync('app/src/main/assets/index.html','utf8');
const scripts=[...index.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
if(JSON.stringify(scripts)!==JSON.stringify(['app.bundle.js'])) throw new Error('Runtime must load only the generated bundle');

const required=[
  'main.mjs',
  'core/dom.mjs','core/session.mjs','core/utils.mjs','core/router.mjs',
  'data/seed-data.mjs','data/store.mjs',
  'domain/training.mjs','domain/workout-completion.mjs',
  'services/timers.mjs','services/backup.mjs',
  'ui/primitives.mjs','ui/routine-card.mjs',
  'features/exercise-library.mjs',
  'views/home.mjs','views/builder.mjs','views/exercise-editor.mjs',
  'views/workout.mjs','views/history.mjs','views/settings.mjs'
];
for(const file of required){
  const full=path.join(webRoot,file);
  if(!fs.existsSync(full)) throw new Error('Missing ES module: '+file);
  const code=fs.readFileSync(full,'utf8');
  if(!['data/seed-data.mjs','core/session.mjs','core/utils.mjs','core/dom.mjs','domain/training.mjs'].includes(file) && !code.includes('import ')) {
    throw new Error('Module has no explicit dependencies/imports: '+file);
  }
}

const main=fs.readFileSync(path.join(webRoot,'main.mjs'),'utf8');
if(!main.includes('registerRoutes')) throw new Error('Composition root must register routes');
if(main.includes('innerHTML=')) throw new Error('Composition root contains view rendering');
if(main.split('\n').length>60) throw new Error('Composition root is too large');

const sourceFiles=required.map(file=>fs.readFileSync(path.join(webRoot,file),'utf8')).join('\n');
if(/\bS\b/.test(sourceFiles)) throw new Error('Legacy global persistent state symbol S remains');
if(/\bwork\b\s*=/.test(sourceFiles)) throw new Error('Legacy global workout state assignment remains');
if(!sourceFiles.includes('export const PROGRESSION_REP_THRESHOLD = 12')) throw new Error('Progression threshold is not explicit domain policy');
if(!sourceFiles.includes('export const PROGRESSION_WEIGHT_STEP = 5')) throw new Error('Progression increment is not explicit domain policy');

const javaRoot='app/src/main/java/com/ahmed/gympro';
const nativeModules=['MainActivity.java','RestAlarmScheduler.java','BackupFileManager.java','GymNativeBridge.java','VantaWebViewClient.java','WindowInsetsHelper.java'];
for(const file of nativeModules){
  if(!fs.existsSync(path.join(javaRoot,file))) throw new Error('Missing native module: '+file);
}
const activity=fs.readFileSync(path.join(javaRoot,'MainActivity.java'),'utf8');
if(activity.split('\n').length>170) throw new Error('MainActivity became a God Activity');
if(activity.includes('setExactAndAllowWhileIdle')) throw new Error('Alarm scheduling leaked into MainActivity');
if(activity.includes('ACTION_CREATE_DOCUMENT')) throw new Error('Backup I/O leaked into MainActivity');

if(!fs.existsSync('app/src/main/assets/app.bundle.js')) throw new Error('Generated web bundle missing');
console.log('VantaLift ES-module architecture guard passed');

const gradle=fs.readFileSync('app/build.gradle','utf8');
if(!gradle.includes('tasks.register("bundleWeb", Exec)')) throw new Error('Gradle must own web bundling');
if(!gradle.includes('preBuild.dependsOn bundleWeb')) throw new Error('Android build must depend on the web bundle');
