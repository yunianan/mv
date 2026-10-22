// 星露谷风格 · 《恋人》MV —— 整首 275.9 秒，逐镜头渲染
// 渲染：node core/render/video.mjs <此目录> --fps 24 --workers 3
import { canvas, present, rect, px, hline, vline, P, W, H, SCALE } from './px.js';

const cf = canvas();   // 第二个世界缓冲：只在切场景的交叉淡入时用
import { loadSprites } from './sprite.js';
import { SETS, cassette } from './sets.js';
import { SHOT_LIST, TOTAL } from './scenes.js';

const qs = new URLSearchParams(location.search);
const c = canvas();
const g = c.g;
const START = parseFloat(qs.get('from') || '0');
const END = parseFloat(qs.get('to') || String(TOTAL));

// —— 对话框：画在放大后的画面上（屏幕空间），不受镜头推拉 ——
function panel(x, y, w, h) {
  const o = c.o, k = SCALE;
  const R = (a, b, cw, ch, col) => { o.fillStyle = col; o.fillRect(Math.round(a * k), Math.round(b * k), Math.round(cw * k), Math.round(ch * k)); };
  const ink = '#1a1020', cream = '#e8d3a8', fill = '#33243c';
  R(x + 2, y + 2, w, h, 'rgba(0,0,0,.34)');
  R(x + 2, y, w - 4, h, ink); R(x, y + 2, w, h - 4, ink);
  R(x + 1, y + 1, 1, 1, ink); R(x + w - 2, y + 1, 1, 1, ink);
  R(x + 1, y + h - 2, 1, 1, ink); R(x + w - 2, y + h - 2, 1, 1, ink);
  R(x + 4, y + 1, w - 8, 1, cream); R(x + 4, y + h - 2, w - 8, 1, cream);
  R(x + 1, y + 4, 1, h - 8, cream); R(x + w - 2, y + 4, 1, h - 8, cream);
  R(x + 5, y + 3, w - 10, h - 6, fill);
}

function lyric(str, y = 160, x = 40, size = 42) {
  const o = c.o;
  o.save();
  o.font = `700 ${size}px "Microsoft YaHei", "SimHei", sans-serif`;
  o.textBaseline = 'middle'; o.textAlign = 'left';
  o.letterSpacing = `${SCALE}px`;
  o.fillStyle = '#160f1c';
  o.fillText(str, x * SCALE + SCALE, y * SCALE + SCALE);
  o.fillStyle = '#fff6e4';
  o.fillText(str, x * SCALE, y * SCALE);
  o.restore();
}

// 片名卡（用屏幕空间大字）
// 三个片名方案，用 ?tt=A / B / C 切换
const TT = (new URLSearchParams(location.search).get('tt') || 'P').toUpperCase();

// ── 像素字：把系统字渲染成 1 位图再逐格铺，和画面同像素格 ──
const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const tcv = document.createElement('canvas');
tcv.width = 400; tcv.height = 100;
const tcx = tcv.getContext('2d');
function tbit(str, size) {
  tcx.clearRect(0, 0, 400, 100);
  tcx.font = `700 ${size}px "Microsoft YaHei", sans-serif`;
  tcx.textAlign = 'center'; tcx.textBaseline = 'middle';
  tcx.fillStyle = '#fff';
  tcx.fillText(str, 200, 50);
  const im = tcx.getImageData(0, 0, 400, 100).data;
  return (x, y) => (x < 0 || y < 0 || x >= 400 || y >= 100 ? false : im[(y * 400 + x) * 4 + 3] > 120);
}
// 逐格铺像素字，按字形包围盒居中；put(x,y,color) 决定落在哪个画布
function pixTextPut(str, cx, cy, size, col, put, outline) {
  const on = tbit(str, size);
  let minx = 400, miny = 100, maxx = -1, maxy = -1;
  for (let y = 0; y < 100; y++) for (let x = 0; x < 400; x++) {
    if (!on(x, y)) continue;
    if (x < minx) minx = x; if (y < miny) miny = y;
    if (x > maxx) maxx = x; if (y > maxy) maxy = y;
  }
  if (maxx < 0) return { w: 0, h: 0 };
  const x0 = Math.round(cx - (minx + maxx + 1) / 2), y0 = Math.round(cy - (miny + maxy + 1) / 2);
  if (outline) {
    for (let y = miny - 1; y <= maxy + 1; y++) for (let x = minx - 1; x <= maxx + 1; x++) {
      if (!on(x, y)) continue;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (!on(x + dx, y + dy)) put(x0 + x + dx, y0 + y + dy, outline);
      }
    }
  }
  for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) if (on(x, y)) put(x0 + x, y0 + y, col);
  return { w: maxx - minx + 1, h: maxy - miny + 1 };
}
function pixText(g, str, cx, cy, size, col, outline) {
  return pixTextPut(str, cx, cy, size, col, (x, y, c) => px(g, x, y, c), outline);
}
function dim(g, level, col = '#0b0910') {
  const th = level * 16;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (BAY[y & 3][x & 3] < th) px(g, x, y, col);
}
// 竖向渐变的压暗：上面浓、往下散，避免整屏一块死板棋盘
function dimV(g, top, y0, y1, col = '#0b0910') {
  for (let y = 0; y < H; y++) {
    const lv = y <= y0 ? top : y >= y1 ? 0 : top * (1 - (y - y0) / (y1 - y0));
    if (lv <= 0.02) continue;
    const th = lv * 16;
    for (let x = 0; x < W; x++) if (BAY[y & 3][x & 3] < th) px(g, x, y, col);
  }
}

// 片名：两种方案，都是「像素字」——和画面同一套格子
//  P 片名卡：抖动压暗 + 居中大字 + 一条细线
//  T 道具：右下角一盘磁带，贴纸上的字就是片名
function worldTitle(g, main, t) {
  if (TT === 'T') {
    const s = 2.4, x = 172, y = 104;
    cassette(g, x, y, s, false);
    // 自己贴一张干净的米色标签，片名写在上面
    const lx = Math.round(x + 3 * s), ly = Math.round(y + 4 * s);
    const lw = Math.round(38 * s), lh = Math.round(13 * s);
    rect(g, lx, ly, lw, lh, '#efe6d2');
    rect(g, lx, ly, lw, 1, '#d8c69e');
    rect(g, lx, ly + lh - 1, lw, 1, '#c9b48c');
    rect(g, lx + 2, ly + 2, 3, 3, '#b03a3a');
    pixText(g, main, lx + lw * .58, ly + lh * .48, 16, '#2a2430');
    return;
  }
  // P：黑场片名卡，4.15s 起用抖动慢慢散开，露出雨夜
  const cover = t < 4.15 ? 1 : clamp(1 - (t - 4.15) / 0.30, 0, 1);
  if (cover >= 0.999) rect(g, 0, 0, W, H, '#0b0910');
  else if (cover > 0.02) dim(g, cover, '#0b0910');
  pixText(g, main, 160, 86, 42, '#fff6e4', '#141019');
  rect(g, 118, 112, 84, 2, '#b0704e');
  rect(g, 118, 114, 84, 1, '#2a1e1e');
}

function titleCard(main, sub) {
  const o = c.o, cx = W * SCALE / 2;
  o.save(); o.textBaseline = 'middle'; o.textAlign = 'center';
  if (TT === 'T') {
    o.textAlign = 'left';
    o.fillStyle = '#cfbfb0'; o.font = '500 22px "Microsoft YaHei", sans-serif';
    o.letterSpacing = '4px';
    o.fillText(sub, 84, 1032);
  } else {
    o.fillStyle = '#d5c6b8'; o.font = '500 24px "Microsoft YaHei", sans-serif';
    o.letterSpacing = '5px';
    o.fillText(sub, cx, 726);
  }
  o.restore();
}
// 屏幕空间雨：实色、细线，三层靠颜色深浅分远近（半透明叠抖动会被看成第二个方向）
const rh = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
const RAIN_LAYERS = [
  { n: 110, w: 1, len: 24, sp: 760, col: '#53718f' },
  { n: 70, w: 1, len: 40, sp: 1300, col: '#8fb2d2' },
  { n: 30, w: 2, len: 58, sp: 2000, col: '#d3e6f8' },
];
function rainScreen(o, t, WD, HD, q = 1) {
  const slope = .40;
  o.save();
  o.lineCap = 'butt';
  o.globalAlpha = 1;
  for (const L of RAIN_LAYERS) {
    const n = Math.round(L.n * q);
    o.strokeStyle = L.col; o.lineWidth = L.w;
    o.beginPath();
    for (let i = 0; i < n; i++) {
      const r1 = rh(i * 3.7 + L.len), r2 = rh(i * 9.1 + 5);
      const spd = L.sp * (.85 + r2 * .3);
      const y = ((r1 * (HD + L.len) + t * spd) % (HD + L.len)) - L.len;
      const x = ((r2 * WD - y * slope) % WD + WD) % WD;
      o.moveTo(x, y);
      o.lineTo(x + L.len * slope, y - L.len);
    }
    o.stroke();
  }
  o.restore();
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// ── 镜头组：同一场景 + 同一参数 + 时间相邻的镜头合成一段「长镜头」，
// 组内切换只换字幕、机位连续 ──
const KEY = s => s.set + '|' + JSON.stringify(s.args || {});
const RUNS = [];
{
  let cur = null;
  for (let i = 0; i < SHOT_LIST.length; i++) {
    const s0 = SHOT_LIST[i];
    if (!cur || KEY(s0) !== cur.key) cur = { key: KEY(s0), t0: s0.t0, t1: s0.t1, cam: s0.cam || { x: 140, y: 104, z0: 1, z1: 1.06 } };
    cur.t1 = s0.t1;
    RUNS[i] = cur;
  }
}
function shotIdx(t) {
  let lo = 0, hi = SHOT_LIST.length - 1;
  if (t <= SHOT_LIST[0].t0) return 0;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (SHOT_LIST[mid].t0 <= t) lo = mid; else hi = mid - 1;
  }
  return lo;
}
// 段落交界：7 帧压黑
const SECTIONS = [26.02, 67.86, 149.82, 228.39];
function sectionDip(t) {
  for (const b of SECTIONS) {
    const d = Math.abs(t - b);
    if (d < .16) return 1 - d / .16;
  }
  return 0;
}
function renderAt(dst, shot, tt) {
  dst.g.clearRect(0, 0, W, H);
  const u = clamp((tt - shot.t0) / Math.max(.001, shot.t1 - shot.t0), 0, 1);
  const fn = SETS[shot.set] || SETS.busStop;
  fn(dst.g, tt, tt - shot.t0, u, shot.args);
  const cam = shot.cam || { x: 140, y: 104, z0: 1, z1: 1.06 };
  const z = cam.z0 + (cam.z1 - cam.z0) * u;
  present(dst, P.sky0, { z, ox: -(z - 1) * cam.x * SCALE, oy: -(z - 1) * cam.y * SCALE });
}

function draw(t) {
  g.clearRect(0, 0, W, H);
  const idx = shotIdx(t);
  const s = SHOT_LIST[idx];
  const u = clamp((t - s.t0) / Math.max(.001, s.t1 - s.t0), 0, 1);
  const lt = t - s.t0;
  const fn = SETS[s.set] || SETS.busStop;
  fn(g, t, lt, u, s.args);
  if (idx === 0) worldTitle(g, '恋人', t);

  const run = RUNS[idx];
  const cam = run.cam || s.cam || { x: 140, y: 104, z0: 1, z1: 1.06 };
  const ru = clamp((t - run.t0) / Math.max(.001, run.t1 - run.t0), 0, 1);
  // 组开场 0.55 秒：机位稍微「落定」，不是硬停
  const st = clamp((t - run.t0) / .55, 0, 1);
  const settle = 1 - Math.pow(1 - st, 3);
  const z = (cam.z0 + (cam.z1 - cam.z0) * ru) * (1 + .018 * (1 - settle));
  const fx = cam.x * SCALE, fy = cam.y * SCALE;
  document.body.replaceChildren(present(c, P.sky0, { z, ox: -(z - 1) * fx, oy: -(z - 1) * fy + (1 - settle) * 7 }));

  // 换场景：0.26 秒交叉淡入，上一镜的余像叠在上面慢慢退掉
  const prev = idx > 0 ? SHOT_LIST[idx - 1] : null;
  if (prev && RUNS[idx] !== RUNS[idx - 1] && !window.__noXF && t - s.t0 < .28) {
    const nearSec = SECTIONS.some(b => Math.abs(s.t0 - b) < .22);
    if (!nearSec) {
      const xf = clamp((t - s.t0) / .28, 0, 1);
      const k = xf * xf * (3 - 2 * xf);
      renderAt(cf, prev, Math.max(prev.t0 + .02, prev.t1 - .06));
      c.o.save();
      c.o.globalAlpha = 1 - k;
      c.o.drawImage(cf.out, 0, 0);
      c.o.restore();
      c.o.globalAlpha = 1;
    }
  }

  const rainy = s.set === 'rainHouse' || s.set === 'busArrive' || s.set === 'endCard' ||
    (s.set === 'busStop' && s.args && s.args.mode === 'rain') ||
    (s.set === 'river' && s.args && s.args.rain);
  if (rainy) rainScreen(c.o, t, c.out.width, c.out.height, s.set === 'endCard' ? 1.25 : 1);

  if (s.line) {
    // 字幕框跟着切点淡入淡出，别「啪」地出现
    const fin = clamp((t - s.t0) / .12, 0, 1);
    const nxt = SHOT_LIST[idx + 1];
    const keep = nxt && nxt.line === s.line;
    const fout = keep ? 1 : clamp((s.t1 - t) / .12, 0, 1);
    const a = Math.min(fin, fout);
    if (a > .01) {
      c.o.save(); c.o.globalAlpha = a;
      panel(14, 150, 292, 26);
      lyric(s.line, 164, 40, 42);
      c.o.restore();
    }
  }
  const dip = sectionDip(t);
  if (dip > .01) {
    c.o.save(); c.o.globalAlpha = dip * .92; c.o.fillStyle = '#0a0812';
    c.o.fillRect(0, 0, c.out.width, c.out.height);
    c.o.restore();
  }
  if (t < 4.45) {
    const a = t < 4.15 ? 1 : (4.45 - t) / 0.30;
    if (a > 0.02) {
      c.o.save(); c.o.globalAlpha = a;
      titleCard('恋人', 'based on 李荣浩《恋人》 ／ Stardew Valley fan film');
      c.o.restore();
    }
  }
  if (t > 258) {
    const a = t > 268 ? 1 : (t - 258) / 10;
    c.o.save(); c.o.globalAlpha = a;
    const o = c.o;
    o.textAlign = 'center'; o.font = '700 64px "Microsoft YaHei", sans-serif';
    o.letterSpacing = '10px'; o.fillStyle = '#160f1c';
    o.fillText('恋人', W * SCALE / 2 + 5, 62 * SCALE + 5);
    o.fillStyle = '#fff6e4';
    o.fillText('恋人', W * SCALE / 2, 62 * SCALE);
    o.font = '500 26px "Microsoft YaHei", sans-serif';
    o.letterSpacing = '4px'; o.fillStyle = '#b9a9c6';
    o.fillText('那年夏天，我把磁带留在了录音机里', W * SCALE / 2, 96 * SCALE);
    o.restore();
  }
}

await loadSprites();
window.render = draw;
window.DUR = TOTAL;
draw(START);
window.READY = true;
