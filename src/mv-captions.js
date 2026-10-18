// Supplied LRC is line-level only: no invented character progress or lip-sync.
window.overlayHook=(ctx,t)=>{
  if(window.LOOP)return;
  const row=MV_LYRICS.lines.find(row=>t>=row.start&&t<row.end);
  if(!row)return;
  // Long last-line holds include instrumental space. These are conservative display windows,
  // explicitly separate from measured singing endpoints; no word timing is claimed.
  if((row.i===27&&t>110)||(row.i===63&&t>229)||(row.i===78&&t>285))return;
  const alpha=Math.min(1,(t-row.start)*8, Math.max(0,(row.end-t)*7));
  ctx.save();ctx.globalAlpha=alpha;
  ctx.font='500 42px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  ctx.lineWidth=7;ctx.strokeStyle='rgba(239,231,216,.96)';ctx.strokeText(row.text,960,1003);
  ctx.fillStyle='#494649';ctx.fillText(row.text,960,1003);ctx.restore();
};
