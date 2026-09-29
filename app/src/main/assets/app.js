'use strict';
// Composition root: wire application events after every feature module is loaded.
Array.from(document.querySelectorAll('nav button')).forEach(b=>b.onclick=()=>{if(isWorkoutNavigationLocked()){toast('Finish or exit workout first');return}nav(b.dataset.v)});$('#add').onclick=addDay;M.onclick=e=>{if(e.target===M)close()};nav('home');restoreRestTimer();createAutoBackup(false)
