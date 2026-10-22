// 星露谷风格 · 《恋人》MV —— 整首 275.9 秒，逐镜头渲染
// 渲染：node core/render/video.mjs <此目录> --fps 24 --workers 3
import { canvas, present, rect, P, W, H, SCALE } from './px.js';
import { loadSprites } from './sprite.js';
import { SETS } from './sets.js';
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
function titleCard(main, sub) {
  const o = c.o;
  o.save();
  o.textAlign = 'center'; o.textBaseline = 'middle';
  o.font = '700 92px "Microsoft YaHei", sans-serif';
  o.letterSpacing = '14px';
  o.fillStyle = '#160f1c';
  o.fillText(main, W * SCALE / 2 + 6, 74 * SCALE + 6);
  o.fillStyle = '#fff6e4';
  o.fillText(main, W * SCALE / 2, 74 * SCALE);
  o.font = '600 34px "Microsoft YaHei", sans-serif';
  o.letterSpacing = '8px';
  o.fillStyle = '#c9b9d6';
  o.fillText(sub, W * SCALE / 2, 132 * SCALE);
  o.restore();
}

function shotAt(t) {
  let lo = 0, hi = SHOT_LIST.length - 1;
  if (t <= SHOT_LIST[0].t0) return SHOT_LIST[0];
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (SHOT_LIST[mid].t0 <= t) lo = mid; else hi = mid - 1;
  }
  return SHOT_LIST[lo];
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// 屏幕空间雨：放大之后才画，所以雨丝是 1–3 px 的细线，不会变成 6 px 方块
const rh = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
const RAIN_LAYERS = [
  { n: 120, w: 1, len: 26, sp: 820, a: .22, col: '#93b6d6' },
  { n: 64, w: 2, len: 52, sp: 1500, a: .40, col: '#c3daf0' },
  { n: 26, w: 3, len: 92, sp: 2400, a: .62, col: '#e8f4ff' },
];
function rainScreen(o, t, WD, HD, q = 1) {
  const slope = .40;
  o.save();
  o.lineCap = 'butt';
  for (const L of RAIN_LAYERS) {
    const n = Math.round(L.n * q);
    o.strokeStyle = L.col; o.lineWidth = L.w; o.globalAlpha = L.a;
    o.beginPath();
    for (let i = 0; i < n; i++) {
      const r1 = rh(i * 3.7 + L.len), r2 = rh(i * 9.1 + 5);
      const spd = L.sp * (.85 + r2 * .3);
      const y = ((r1 * (HD + L.len) + t * spd) % (HD + L.len)) - L.len;
      const x = ((r2 * WD - y * slope) % WD + WD) % WD;
      const x2 = x + L.len * slope;
      o.moveTo(x, y); o.lineTo(x2, y - L.len);
    }
    o.stroke();
  }
  o.restore();
  o.globalAlpha = 1;
}

// ── 镜头组：同一场景 + 同一参数 + 时间相邻的镜头合成一段「长镜头」，
// 组内切换只换字幕、机位连续，不再每次从 z0 重来 ──
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

// 段落交界：来一下 7 帧的压黑，让换段有个呼吸（不是溶镜）
const SECTIONS = [26.02, 67.86, 149.82, 228.39];
function sectionDip(t) {
  for (const b of SECTIONS) {
    const d = Math.abs(t - b);
    if (d < .16) return 1 - d / .16;
  }
  return 0;
}

function draw(t) {
  g.clearRect(0, 0, W, H);
  const idx = shotIdx(t);
  const s = SHOT_LIST[idx];
  const u = clamp((t - s.t0) / Math.max(.001, s.t1 - s.t0), 0, 1);
  const lt = t - s.t0;
  const fn = SETS[s.set] || SETS.busStop;
  fn(g, t, lt, u, s.args);

  const run = RUNS[idx];
  const cam = run.cam || s.cam || { x: 140, y: 104, z0: 1, z1: 1.06 };
  const ru = clamp((t - run.t0) / Math.max(.001, run.t1 - run.t0), 0, 1);
  // 组开场 0.55 秒：机位稍微「落定」，不是硬停
  const st = clamp((t - run.t0) / .55, 0, 1);
  const settle = 1 - Math.pow(1 - st, 3);
  const z = (cam.z0 + (cam.z1 - cam.z0) * ru) * (1 + .018 * (1 - settle));
  const fx = cam.x * SCALE, fy = cam.y * SCALE;
  document.body.replaceChildren(present(c, P.sky0, { z, ox: -(z - 1) * fx, oy: -(z - 1) * fy + (1 - settle) * 7 }));

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
  if (t < 5.2) {
    const a = t < 4.0 ? 1 : (5.2 - t) / 1.2;
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
