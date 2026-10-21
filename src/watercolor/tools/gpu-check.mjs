import puppeteer from 'puppeteer-core';
const cases=[['default',[]],['high-performance',['--force-high-performance-gpu']]];
for(const [name,extra]of cases){
  const b=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,
    args:['--use-angle=d3d11','--ignore-gpu-blocklist',...extra]});
  try{const p=await b.newPage();const result=await p.evaluate(()=>{
    const result={};for(const pref of ['default','high-performance']){
      const gl=document.createElement('canvas').getContext('webgl2',{powerPreference:pref});
      const ext=gl?.getExtension('WEBGL_debug_renderer_info');
      result[pref]=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';
    }return result;});console.log(name,JSON.stringify(result));}
  finally{await b.close();}
}
