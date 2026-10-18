import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const path=resolve(process.argv[2]||resolve(root,'assets/song.lrc'));
const shots=JSON.parse(readFileSync(resolve(root,'shots.json'),'utf8'));
const duration=shots.duration;
const raw=readFileSync(path,'utf8').replace(/^\uFEFF/,'');
const offset=Number(raw.match(/\[offset:([+-]?\d+)\]/i)?.[1]||0)/1000;
const entries=[];
for(const row of raw.split(/\r?\n/)){
  const stamps=[...row.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
  const content=row.replace(/\[[^\]]*\]/g,'').trim();
  if(!content)continue;
  for(const stamp of stamps){
    const start=Number(stamp[1])*60+Number(stamp[2])+offset;
    // This song's supplied file has title/credits at 0,4,8,12; vocals begin at16.
    if(start>=16&&start<duration)entries.push({start,text:content});
  }
}
entries.sort((a,b)=>a.start-b.start);
if(!entries.length)throw new Error('No vocal rows found at/after16s. Check the song version and UTF-8 LRC.');
for(let i=1;i<entries.length;i++)if(entries[i].start<=entries[i-1].start)throw new Error('LRC vocal timestamps must be strictly increasing.');
const lyrics={schema_version:1,precision:'line',lines:entries.map((row,i)=>({i,...row,end:entries[i+1]?.start??duration,words:[]})),notes:'Imported local LRC; line timing only. End is next line boundary, not measured singing endpoint.'};
writeFileSync(resolve(root,'lyrics.json'),JSON.stringify(lyrics,null,2)+'\n');
writeFileSync(resolve(root,'src/mv-data.js'),`const MV_DATA = ${JSON.stringify(shots)};\nconst MV_LYRICS = ${JSON.stringify(lyrics)};\n`);
console.log(`Imported ${lyrics.lines.length} vocal rows. Generated lyrics.json and src/mv-data.js (gitignored).`);
