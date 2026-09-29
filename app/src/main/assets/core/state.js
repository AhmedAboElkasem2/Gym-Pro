'use strict';
// Session-only mutable state. Persistent state is owned by data/store.js.
let S=load(),view='home',rid=null,work=null,summaryData=null,exerciseKey=null,exerciseReturnView='history',timerId=null,timerLeft=0,workoutClockId=null,restDeadline=+(localStorage.getItem('gympro-rest-deadline')||0),nativeRestScheduled=false;
