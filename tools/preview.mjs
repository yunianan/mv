// Targeted local frame QA, never a complete video render.
import puppeteer from 'puppeteer-core';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=resolve(import.meta.dirname,'..');process.chdir(root);
const mode=process.argv[2]||'shots';
const data=JSON.parse(readFileSync('shots.json','utf8'));
const out='out/check/final';mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,protocolTimeout:0,
  args:['--allow-file-access-from-files','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-renderer-backgrounding']});
const page=await browser.newPage();
page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
await page.goto(pathToFileURL(resolve('studio.html')).href+'?render',{waitUntil:'networkidle0'});
await page.waitForFunction('window.ready===true');
const results=[];
async function sheet(name,times,cols=3,w=480,crop=null,at=null) {
  const result=await page.evaluate((ts,cols,w,crop,at)=>window.renderSheet(ts,cols,w,crop,at),times,cols,w,crop,at);
  writeFileSync(`${out}/${name}.jpg`,Buffer.from(result.url.split(',')[1],'base64'));
  results.push({name,times,ms:result.ms});console.log(`${name}: ${times.length} frames, ${Math.round(result.ms.reduce((a,b)=>a+b,0)/times.length)} ms/frame`);
  return result;
}
try {
  await page.evaluate(()=>window.renderAt(0));
  if(mode==='shots') {
    const chapters=process.argv[3]?process.argv[3].split(',').map(Number):[1,2,3,4,5,6,7,8];
    for(const ch of chapters) {
      const rows=data.shots.filter(s=>s.chapter===ch);
      const times=rows.flatMap(s=>[s.t0+.08,(s.t0+s.t1)/2,s.t1-.08]);
      const result=await sheet('chapter-'+ch,times,3,480);
      // Each shot also has its own three-frame sheet, from the same reviewed frames.
      const urls=await page.evaluate(async(url,count)=>{
        const img=new Image();img.src=url;await img.decode();const urls=[];
        for(let i=0;i<count;i++){const cv=document.createElement('canvas');cv.width=1440;cv.height=270;cv.getContext('2d').drawImage(img,0,i*270,1440,270,0,0,1440,270);urls.push(cv.toDataURL('image/jpeg',.94));}return urls;
      },result.url,rows.length);
      rows.forEach((s,i)=>writeFileSync(`${out}/${s.id}.jpg`,Buffer.from(urls[i].split(',')[1],'base64')));
    }
  } else if(mode==='seams') {
    for(let i=1;i<data.shots.length;i++) {
      if(process.argv[3]&&!process.argv[3].split(',').includes(data.shots[i].id))continue;
      const t=data.shots[i].t0;
      await sheet(`seam-${data.shots[i-1].id}-${data.shots[i].id}`,[t-2/24,t-1/24,t,t+1/24],4,320);
    }
  } else if(mode==='motion'||mode==='faces') {
    const moments=[['cup',1.6],['candle',67.6],['right-hand',97.4],['zip',121.5],['light-knot',156.1],['cake',162],['hug-release',183.05],['collar',222.8],['let-go',256],['leave',260]];
    if(mode==='motion')for(const [name,start] of moments)await sheet('motion-'+name,Array.from({length:7},(_,i)=>Math.round(start*24+i)/24),7,320);
    for(const [name,t,at]of [
      ['her-smile',56,[800,540,380,340]],['zip-realization',126,[900,540,440,400]],
      ['past-response',86,[1140,540,410,380]],['embrace',183.3,[1000,540,500,400]],
      ['final-silence',280,[900,540,340,340]],['zip-contact',123.5,[1110,783,260,230]]])await sheet('face-'+name,[t,t+.16],2,480,null,at);
  } else throw new Error('mode must be shots, seams or motion');
  writeFileSync(`${out}/${mode}-report.json`,JSON.stringify({mode,frames:results.reduce((n,r)=>n+r.times.length,0),results},null,2));
} finally {await browser.close();}
