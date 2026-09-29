const fs=require('fs');

const src=fs.readFileSync('app/src/main/web-src/data/seed-data.mjs','utf8');
const marker='export const SEED=';
const start=src.indexOf(marker);
const end=src.indexOf(';',start);
if(start<0||end<0) throw new Error('Could not locate SEED data');
const seed=JSON.parse(src.slice(start+marker.length,end));

const posteriorA=seed.routines.find(r=>r.id==='posterior-a');
if(!posteriorA) throw new Error('Posterior A not found');

// Recover the edits visible in Ahmed's truncated old backup.
posteriorA.exercises=posteriorA.exercises.filter(e=>e.id!=='lat-row-machine-7511');
const first=posteriorA.exercises.find(e=>e.id==='wide-grip-seated-cable-row-9407');
if(first){
  first.name='T Bar Row';
  if(first.choices&&first.choices[0]){
    first.choices[0].key='t bar row';
    first.choices[0].name='T Bar Row';
    first.choices[0].link='';
  }
}

seed.performance=seed.performance||{};
seed.history=seed.history||[];
seed.settings={unit:'kg',rest:180,...(seed.settings||{})};
seed.schema=3;

fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync('dist/Recovered-Gym-Pro-Backup.json',JSON.stringify(seed,null,2),'utf8');
console.log('Recovered backup created');
