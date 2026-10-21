import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const shots=JSON.parse(readFileSync(resolve(root,'shots.json'),'utf8'));
const lyrics=JSON.parse(readFileSync(resolve(root,'lyrics.json'),'utf8'));
writeFileSync(resolve(root,'src/mv-data.js'),`const MV_DATA = ${JSON.stringify(shots)};\nconst MV_LYRICS = ${JSON.stringify(lyrics)};\n`);
console.log(`${shots.shots.length} shots / ${lyrics.lines.length} lines exported`);
