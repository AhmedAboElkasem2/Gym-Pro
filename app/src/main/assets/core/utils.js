'use strict';
// Small deterministic helpers shared across features.
const clone=x=>JSON.parse(JSON.stringify(x)),uid=()=>Math.random().toString(36).slice(2,10),norm=s=>(s||'').trim().toLowerCase().replace(/\s+/g,' '),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
