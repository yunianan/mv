import { SHOT_LIST, TOTAL } from '../scenes.js';
console.log('total', TOTAL.toFixed(2), 'shots', SHOT_LIST.length);
for (const s of SHOT_LIST) if (s.t0 > 50 && s.t0 < 64) console.log(s.t0.toFixed(2), '-', s.t1.toFixed(2), s.set, JSON.stringify(s.args||{}).slice(0,36), '|', (s.line||'').slice(0,10));