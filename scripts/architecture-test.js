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
  'features/exercise-library.mjs','features/rest-alarm.mjs',
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
const nativeModules=['MainActivity.java','RestAlarmScheduler.java','RestAlarmReceiver.java','RestAlarmService.java','RestAlarmState.java','RestAlarmController.java','BackupFileManager.java','GymNativeBridge.java','VantaWebViewClient.java','WindowInsetsHelper.java'];
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

const homeView=fs.readFileSync(path.join(webRoot,'views/home.mjs'),'utf8');
const settingsView=fs.readFileSync(path.join(webRoot,'views/settings.mjs'),'utf8');
const styles=fs.readFileSync('app/src/main/assets/styles.css','utf8');
if(!homeView.includes('smart-hero tri-led-frame')) throw new Error('Home hero must use shared tri-color LED utility');
if(!settingsView.includes('developer-card tri-led-frame')) throw new Error('Developer card must use shared tri-color LED utility');
if(!styles.includes('.tri-led-frame::before')||!styles.includes('@keyframes triLedSpin')) throw new Error('Shared tri-color LED utility missing');
if(styles.includes('@keyframes developerLedSpin')) throw new Error('Legacy duplicated developer LED animation remains');
if(/\.tri-led-frame::before[\s\S]*?(?:filter|backdrop-filter)\s*:/.test(styles)) throw new Error('Shared tri-color LED must remain filter-free');

const restAlarmScheduler=fs.readFileSync(path.join(javaRoot,'RestAlarmScheduler.java'),'utf8');
const restAlarmService=fs.readFileSync(path.join(javaRoot,'RestAlarmService.java'),'utf8');
const restAlarmFeature=fs.readFileSync(path.join(webRoot,'features/rest-alarm.mjs'),'utf8');
const manifest=fs.readFileSync('app/src/main/AndroidManifest.xml','utf8');
if(!restAlarmScheduler.includes('setAlarmClock')) throw new Error('Rest alarm must use AlarmClock scheduling for lock-screen reliability');
if(!restAlarmService.includes('AUDIOFOCUS_GAIN_TRANSIENT')) throw new Error('Persistent rest alarm must request transient audio focus');
if(!restAlarmService.includes('setLooping(true)')) throw new Error('Persistent rest alarm sound must loop until acknowledged');
if(!restAlarmService.includes('VibrationEffect.createWaveform(pattern, 0)')) throw new Error('Persistent rest vibration must repeat');
if(!restAlarmService.includes('START_STICKY')) throw new Error('Persistent rest alarm service must survive process pressure');
if(!manifest.includes('android:foregroundServiceType="mediaPlayback"')) throw new Error('Rest alarm foreground service type is missing');
if(!manifest.includes('FOREGROUND_SERVICE_MEDIA_PLAYBACK')) throw new Error('Rest alarm media playback foreground-service permission is missing');
if(!restAlarmFeature.includes('The Rest Time Is Over , Get up and BE HULK')) throw new Error('Rest-complete Hulk message is missing');
if(!restAlarmFeature.includes('persistent: true')) throw new Error('Rest-complete dialog must be non-dismissible until OK');
