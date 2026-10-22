// 场景库：每个 set 都只依赖 (g, t, lt, u, spec)，纯函数，可任意顺序求值
import { rect, px, hline, vline, P, W, H, dither, vgrad } from './px.js';
import { sky, hills, ground, house, fence, tree, busstop, rain } from './world.js';
import { actor } from './sprite.js';

// ───────────── 通用零件 ─────────────
const clampS = (v, a, b) => (v < a ? a : v > b ? b : v);
const ease = u => 1 - Math.pow(1 - clampS(u, 0, 1), 3);

// ── 雨 ──
// 三层视差：远(短慢暗) / 中 / 近(长快亮)。每滴是一条斜线，落速恒定，接地时溅起小水花。
const h1 = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

function rainLayer(g, t, n, len, speed, col, x0, y0, x1, y1, slope = .38, seed = 0) {
  const w = Math.max(1, x1 - x0), span = Math.max(1, y1 - y0);
  for (let i = 0; i < n; i++) {
    const r1 = h1(i * 3.1 + seed), r2 = h1(i * 7.7 + seed * 2 + 1);
    const spd = speed * (.8 + r2 * .4);
    const y = y0 + ((r1 * span + t * spd) % (span + len)) - len;
    if (y < y0 - len || y > y1) continue;
    const headX = ((r2 * w - (y - y0) * slope + seed * 13) % w + w) % w + x0;
    for (let j = 0; j < len; j++) {
      const yy = Math.round(y) - j;
      if (yy < y0 || yy > y1) continue;
      const xx = Math.round(headX + j * slope);
      if (xx < x0 || xx >= x1) continue;
      px(g, xx, yy, j === 0 ? '#dceaf8' : col);
    }
  }
}

// 雨幕：背景层（画在人和物之前）
function rainBack(g, t, y1 = 150, q = 1) {
  rainLayer(g, t, Math.round(64 * q), 3, 54, '#4a6b94', 0, 0, W, y1, .5, 1);
  rainLayer(g, t, Math.round(34 * q), 6, 110, '#7fa3c8', 0, 0, W, y1, .6, 2);
}
// 近景雨：画在人之后，稀、长、亮，制造纵深
function rainFront(g, t, y1 = 150, q = 1) {
  rainLayer(g, t, Math.round(14 * q), 8, 200, '#a9c8e4', 0, 0, W, y1, .68, 3);
}
// 地面水花：只在接地那一行，2 帧生命，像爆开的小水冠
function rainSplash(g, t, yLine, n = 14, q = 1) {
  const frames = Math.floor(t * 12);
  for (let i = 0; i < n * q; i++) {
    const r = h1(i * 5.3 + 11), r2 = h1(i * 2.7 + 5);
    const x = Math.round(r * W);
    const phase = (frames + i * 3) % 6;
    if (phase > 1) continue;
    px(g, x, yLine, '#cfe6f6');
    px(g, x - 1, yLine - 1, '#9dc0dd');
    px(g, x + 1, yLine - 1, '#9dc0dd');
    if (r2 > .7) px(g, x, yLine - 2, '#e8f4ff');
  }
}function puddle(g, x, y, w, t) {
  rect(g, x, y, w, 2, P.water);
  rect(g, x + 2, y, w - 4, 1, P.waterLit);
  const r = Math.floor((t * 2) % 3);
  hline(g, x + 4 + r * 3, x + 9 + r * 3, y + 1, P.foam);
}
function wall(g, top = 0, bot = 104, dark = false) {
  rect(g, 0, top, W, bot - top, dark ? '#241d2b' : '#3a2d38');
  for (let y = top + 8; y < bot; y += 12) hline(g, 0, W - 1, y, dark ? '#2a2231' : '#42333f');
  for (let x = 6; x < W; x += 26) vline(g, x, top, bot, dark ? '#2a2231' : '#42333f');
}
function floorPlanks(g, y0 = 104, col = '#4a3730', dark = '#382821', lit = '#5b443a') {
  rect(g, 0, y0, W, H - y0, col);
  let row = 0;
  for (let y = y0; y < H; y += 16, row++) {
    hline(g, 0, W - 1, y, lit);
    hline(g, 0, W - 1, y + 1, dark);
    if (row % 3 === 1) for (let x = (row % 2) * 120; x < W; x += 240) vline(g, x, y + 2, y + 15, dark);
  }
  rect(g, 0, y0, W, 1, lit);
}function windowBox(g, x, y, w, h, mode, t) {
  rect(g, x - 3, y - 3, w + 6, h + 6, P.woodDark);
  rect(g, x, y, w, h, mode === 'night' ? '#141c30' : '#2b3f5e');
  if (mode === 'rain') { rainLayer(g, t, 16, 2, 34, '#4c6b90', x + 1, y + 1, x + w - 1, y + h - 3, .3, 5); rainLayer(g, t, 10, 3, 60, '#88aacb', x + 1, y + 1, x + w - 1, y + h - 3, .34, 6); }
  if (mode === 'night') { px(g, x + 5, y + 6, '#dfe6f2'); px(g, x + 14, y + 12, '#c9d4e6'); }
  vline(g, x + (w >> 1), y, y + h, P.woodDark);
  hline(g, x, x + w, y + (h >> 1), P.woodDark);
  rect(g, x - 5, y + h + 3, w + 10, 3, P.wood);
}
function deck(g, x, y, on) {
  // 录音机：底座 + 两个带盘 + 按钮
  rect(g, x, y, 54, 20, '#2f2b38');
  rect(g, x, y, 54, 2, '#4a4457');
  rect(g, x + 3, y + 4, 19, 12, '#15121c');
  rect(g, x + 32, y + 4, 19, 12, '#15121c');
  for (const cx of [x + 12, x + 41]) {
    rect(g, cx - 6, y + 5, 12, 10, '#241f2e');
    rect(g, cx - 4, y + 7, 8, 6, '#3b3450');
    px(g, cx - 1, y + 9, on ? P.lamp : '#5a5470');
    if (on) { px(g, cx + 1, y + 7, '#6b6485'); px(g, cx - 2, y + 12, '#6b6485'); }
  }
  rect(g, x + 24, y + 6, 4, 10, '#3d3749');
  for (let i = 0; i < 4; i++) rect(g, x + 5 + i * 6, y + 17, 4, 2, i === 1 && on ? P.lamp : '#565068');
  rect(g, x + 40, y + 17, 9, 2, '#565068');
}
function cassette(g, x, y, s = 1, label = true) {
  const w = 44 * s, h = 28 * s;
  rect(g, x, y, w, h, '#33303c');
  rect(g, x + 1 * s, y + 1 * s, w - 2 * s, h - 2 * s, '#474354');
  rect(g, x + 3 * s, y + 3 * s, w - 6 * s, 12 * s, P.cream);
  rect(g, x + 4 * s, y + 4 * s, w - 8 * s, 1 * s, '#d8c69e');
  rect(g, x + 4 * s, y + 15 * s, w - 8 * s, 8 * s, '#15131c');
  for (const cx of [x + 13 * s, x + 31 * s]) {
    rect(g, cx - 4 * s, y + 16 * s, 8 * s, 6 * s, '#3b3848');
    px(g, cx - 1 * s, y + 18 * s, '#8d879b');
  }
  hline(g, x + 5 * s, x + w - 5 * s, y + 14 * s, '#2a2734');
  if (label) { rect(g, x + 6 * s, y + 5 * s, 14 * s, 1 * s, '#c9584f'); rect(g, x + 6 * s, y + 8 * s, 20 * s, 1 * s, '#8d8272'); }
}
function bowl(g, x, y, rice = true) {
  rect(g, x, y, 18, 3, P.cream);
  rect(g, x + 1, y + 3, 16, 5, '#e6d4ae');
  rect(g, x + 2, y + 8, 14, 2, '#cbb894');
  if (rice) { rect(g, x + 3, y + 1, 12, 2, '#fff6e4'); }
}
function greens(g, x, y, n = 6) { for (let i = 0; i < n; i++) { px(g, x + (i * 3) % 11, y - (i % 3), '#5f8f3e'); px(g, x + (i * 3) % 11 + 1, y - (i % 3), '#7fae52'); } }
function chair(g, x, y, col = P.wood) {
  rect(g, x, y - 16, 3, 22, col); rect(g, x + 16, y - 16, 3, 22, col);
  rect(g, x, y - 18, 20, 3, P.woodLit);
  rect(g, x, y - 1, 20, 3, col); rect(g, x + 2, y + 2, 2, 8, P.woodDark); rect(g, x + 16, y + 2, 2, 8, P.woodDark);
}
function cup(g, x, y) {
  rect(g, x, y, 7, 6, P.cream); rect(g, x + 1, y - 1, 5, 1, P.white);
  rect(g, x + 7, y + 1, 2, 3, P.cream);
}
function glow(g, x, y, r, col) {
  for (let i = r; i > 0; i--) {
    const a = i / r;
    if (a > .66) dither(g, x - i, y - i, i * 2, i * 2, col, 'rgba(0,0,0,0)', 4);
  }
}

// ───────────── 1. 雨夜空屋外景 ─────────────
export function rainHouse(g, t, lt, u) {
  sky(g, 'night');
  hills(g, 78);
  ground(g, 118, H, '#243a2c');
  tree(g, 268, 122, 1.2); tree(g, 42, 120, .9);
  house(g, 96, 84, 92, 50, true, true);
  // 窗里的暖光随呼吸变化
  const k = .82 + .18 * Math.sin(t * 1.6);
  for (const wx of [112, 158]) {
    rect(g, wx, 104, 9, 8, P.lampLit);
    rect(g, wx + 1, 105, 7, 6, k > .9 ? '#ffd9a0' : '#ffe9c0');
  }
  rect(g, 138, 112, 10, 20, P.woodDark);
  fence(g, 8, 88, 128);
  rainSplash(g, t, 152, 16);
  puddle(g, 60, 150, 26, t); puddle(g, 200, 156, 34, t);
}

// ───────────── 2. 屋内·夜（录音机在桌上） ─────────────
export function roomNight(g, t, lt, u, s) {
  wall(g, 0, 104, true);
  floorPlanks(g, 104);
  windowBox(g, 36, 30, 52, 40, 'rain', t);
  // 台灯
  rect(g, 214, 62, 3, 42, '#1d1826');
  rect(g, 206, 56, 18, 7, '#2a2334');
  rect(g, 208, 58, 14, 4, P.lampLit);
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; px(g, Math.round(215 + Math.cos(a) * 22), Math.round(66 + Math.sin(a) * 16), '#8a6a48'); }
  // 桌子
  rect(g, 150, 96, 104, 6, P.woodLit);
  rect(g, 150, 102, 104, 20, P.wood);
  rect(g, 150, 120, 104, 3, P.woodDark);
  rect(g, 156, 122, 4, 16, P.woodDark); rect(g, 244, 122, 4, 16, P.woodDark);
  deck(g, 176, 78, true);
  cassette(g, 236, 82, .55);
  if (s && s.actor !== false) actor(g, 'sebastian', 120, 96, { dir: 'right', frame: Math.floor(t * 4) });
  chair(g, 96, 118, P.wood);
  rect(g, 0, 104, W, 2, '#1b1622');
}

// ───────────── 3. 磁带特写（放在录音机上） ─────────────
export function tapeBig(g, t, lt, u) {
  rect(g, 0, 0, W, H, '#1b1725');
  for (let y = 0; y < H; y += 6) hline(g, 0, W - 1, y, '#221d2c');
  rect(g, 56, 40, 208, 96, '#2a2436');
  rect(g, 56, 40, 208, 3, '#3b3450');
  // 机器上的两个带盘
  for (const cx of [104, 216]) {
    rect(g, cx - 26, 54, 52, 40, '#171319');
    rect(g, cx - 22, 57, 44, 34, '#241f2e');
    const a = t * 1.2;
    for (let i = 0; i < 6; i++) {
      const th = a + i * Math.PI / 3;
      px(g, Math.round(cx + Math.cos(th) * 13), Math.round(74 + Math.sin(th) * 10), '#6b6485');
    }
    rect(g, cx - 5, 69, 10, 10, '#3b3450');
  }
  cassette(g, 120, 100, 1.55);
  // 角落里的手电光
  dither(g, 0, 0, W, 26, '#0e0b14', 'rgba(0,0,0,0)', 5);
  dither(g, 0, 152, W, 28, '#0e0b14', 'rgba(0,0,0,0)', 12);
}

// ───────────── 4. 公交站（那年·雨 / 黄昏 / 现在·夜） ─────────────
export function busStop(g, t, lt, u, s) {
  const mode = (s && s.mode) || 'dusk';
  if (mode === 'rain') { sky(g, 'night'); } else if (mode === 'night') { sky(g, 'night'); } else { sky(g, 'dusk'); }
  hills(g, 82);
  ground(g, 122);
  for (const [x, w, h] of [[6, 24, 16], [36, 20, 12], [62, 30, 20], [100, 18, 10]]) {
    rect(g, x, 126 - h, w, h, mode === 'dusk' ? P.cream : '#4a4458');
    for (let i = 0; i < 8; i++) rect(g, x - 4 + i, 126 - h - i, w + 8 - i * 2, 1, i % 3 ? P.wood : P.woodDark);
    if (mode === 'dusk') for (let wx = x + 4; wx < x + w - 4; wx += 9) rect(g, wx, 126 - h + 5, 4, 4, P.lampLit);
    else for (let wx = x + 4; wx < x + w - 4; wx += 9) rect(g, wx, 126 - h + 5, 4, 4, '#2b2a3c');
  }
  rect(g, 0, 144, W, 22, P.pathDark);
  rect(g, 0, 146, W, 18, P.path);
  for (let x = 6; x < W; x += 30) hline(g, x, x + 14, 154, P.cream);
  busstop(g, 190, 146);
  tree(g, 268, 144, 1.2); tree(g, 24, 146, 1.0);
  const who = (s && s.who) || 'both';
  if (who === 'none') { if (mode === 'rain') { rainSplash(g, t, 150, 14); puddle(g, 40, 150, 30, t); } return; }
  if (who === 'her') actor(g, 'penny', 150, 118, { dir: 'right', frame: Math.floor(t * 3) });
  else if (who === 'him') actor(g, 'sebastian', 150, 118, { dir: 'left', frame: Math.floor(t * 3) });
  else {
    actor(g, 'sebastian', 132, 118, { dir: 'right', frame: Math.floor(t * 3) });
    actor(g, 'penny', 170, 118, { dir: 'left', frame: Math.floor(t * 3) });
  }
  if (mode === 'rain') { rainSplash(g, t, 150, 14); puddle(g, 40, 150, 30, t); }
  if (mode === 'night') { px(g, 200, 132, P.lamp); px(g, 200, 133, P.lampLit); }
}

// ───────────── 5. 公路·公交驶过 ─────────────
export function roadBus(g, t, lt, u, s) {
  sky(g, 'dusk'); hills(g, 80); ground(g, 120);
  for (const [x, w, h] of [[10, 26, 18], [48, 22, 14], [86, 30, 22]]) {
    rect(g, x, 124 - h, w, h, P.cream);
    for (let i = 0; i < 9; i++) rect(g, x - 4 + i, 124 - h - i, w + 8 - i * 2, 1, i % 3 ? P.wood : P.woodDark);
  }
  rect(g, 0, 138, W, 26, P.pathDark);
  rect(g, 0, 142, W, 20, P.path);
  for (let i = 0; i < 6; i++) hline(g, 8 + i * 56, 40 + i * 56, 152, P.cream);
  tree(g, 300, 140, 1.1);
  const bx = -60 + ((lt * 66) % 420);
  busSide(g, bx, 168, false);
}

function busSide(g, x, yb, door) {
  const b = '#3f5480', bd = '#26314e', win = '#f4dfae', wheel = '#1b1522';
  rect(g, x, yb - 40, 104, 40, b);
  rect(g, x, yb - 40, 104, 4, '#5a71a4');
  rect(g, x, yb - 9, 104, 9, bd);
  for (let i = 0; i < 4; i++) rect(g, x + 22 + i * 21, yb - 34, 16, 14, win);
  rect(g, x + 3, yb - 34, 13, 14, win);
  rect(g, x + 3, yb - 34, 13, 7, '#cfe0f0');
  rect(g, x + 17, yb - 6, 16, 8, wheel); rect(g, x + 71, yb - 6, 16, 8, wheel);
  rect(g, x + 21, yb - 4, 8, 4, '#5c5c6c'); rect(g, x + 75, yb - 4, 8, 4, '#5c5c6c');
  rect(g, x + 1, yb - 22, 3, 6, '#ffe9a8');
  rect(g, x + 4, yb - 46, 34, 6, P.cream);
  rect(g, x + 6, yb - 45, 30, 4, '#2b3550');
  if (door) { rect(g, x + 18, yb - 34, 10, 26, '#10151f'); rect(g, x + 22, yb - 32, 1, 22, '#3f5480'); }
}

// 河面上的雨圈
function ripple(g, x, y, t, seed) {
  const ph = ((t * .55 + seed * .37) % 1);
  const r = 1 + Math.round(ph * 6);
  const col = ph > .55 ? '#4d7a80' : '#6f9ba0';
  for (let a = 0; a < 12; a++) {
    const th = a / 12 * 6.283;
    px(g, Math.round(x + Math.cos(th) * r), Math.round(y + Math.sin(th) * r * .45), col);
  }
}
function rainRipples(g, t, y0, y1) {
  for (let i = 0; i < 22; i++) {
    const r1 = h1(i * 5.3), r2 = h1(i * 8.7 + 3);
    const x = Math.round(r1 * W), y = Math.round(y0 + r2 * (y1 - y0));
    ripple(g, x, y, t, i);
  }
}
// ───────────── 6. 河堤 / 木栈桥 ─────────────
function riverBands(g, t, dusk = true, rain = false) {
  sky(g, dusk ? 'dusk' : 'night');
  hills(g, 76);
  // 远岸
  rect(g, 0, 86, W, 10, dusk ? '#3a4a62' : '#232c42');
  // 水面（远深近浅）
  rect(g, 0, 96, W, 20, P.waterDark);
  dither(g, 0, 96, W, 20, '#2f5b62', P.waterDark, 8);
  for (let i = 0; i < 16; i++) {
    const y = 98 + ((i % 5) * 3.4 | 0), x = ((i * 53 + Math.floor(t * 6)) % W);
    hline(g, x, x + 4 + (i % 3) * 3, y, i % 4 ? P.waterLit : P.foam);
  }
  if (rain) rainRipples(g, t, 98, 114);
  // 栈桥：桥面在上，木桩插进水里
  rect(g, 0, 116, W, 2, P.woodLit);
  rect(g, 0, 118, W, 8, P.wood);
  for (let x = 3; x < W; x += 15) vline(g, x, 116, 125, P.woodDark);
  rect(g, 0, 126, W, 12, '#1d1a1e');
  for (let x = 9; x < W; x += 44) { rect(g, x, 125, 3, 9, P.woodDark); px(g, x + 1, 134, P.wood); }
  ground(g, 138, H, '#2f4a34');
}
export function river(g, t, lt, u, s) {
  riverBands(g, t, true, !!(s && s.rain));
  tree(g, 30, 138, 1.1); tree(g, 288, 136, 1.2);
  const walk = (s && s.walk) !== false;
  const off = walk ? Math.round(u * 26) : 0;
  actor(g, 'sebastian', 92 + off, 84, { dir: 'right', frame: Math.floor(t * 6) });
  actor(g, 'penny', 112 + off, 84, { dir: 'right', frame: Math.floor(t * 6) + 2 });
  rect(g, 92 + off, 116, 14, 1, '#2b2420'); rect(g, 112 + off, 116, 14, 1, '#2b2420');
  if (s && s.single) { /* 一个人 */ }
}
// ───────────── 7. 饭桌（两人 / 一人） ─────────────
export function tableFood(g, t, lt, u, s) {
  const alone = !!(s && s.alone);
  // 墙 0..78，地板 78..180
  rect(g, 0, 0, W, 70, alone ? '#1c2130' : '#3a2330');
  for (let x = 0; x < W; x += 26) vline(g, x, 0, 70, alone ? '#222839' : '#452b3a');
  rect(g, 0, 66, W, 4, alone ? '#141a26' : '#2a1a24');
  floorPlanks(g, 70, alone ? '#5a4436' : '#6b5040', '#3f2c22', alone ? '#6b5242' : '#7d6250');
  windowBox(g, alone ? 208 : 22, 12, 60, 40, alone ? 'rain' : 'dusk', t);
  // 桌子：桌面 y=96，腿到 150
  const ty = 92;
  rect(g, 54, ty, 212, 6, P.woodLit);
  rect(g, 54, ty + 6, 212, 3, P.wood);
  rect(g, 54, ty + 9, 212, 2, P.woodDark);
  rect(g, 64, ty + 11, 4, 42, P.woodDark); rect(g, 252, ty + 11, 4, 42, P.woodDark);
  // 桌上
  if (alone) { bowl(g, 116, ty - 10); cup(g, 150, ty - 8); greens(g, 132, ty - 8, 5); }
  else { bowl(g, 92, ty - 10); bowl(g, 150, ty - 10); greens(g, 122, ty - 8, 7); cup(g, 176, ty - 8); }
  // 人：坐在桌后，脚被桌子挡住
  if (alone) actor(g, 'sebastian', 74, 60, { dir: 'right', frame: 0 });
  else {
    actor(g, 'sebastian', 80, 60, { dir: 'right', frame: 0 });
    actor(g, 'penny', 208, 60, { dir: 'left', frame: 0 });
  }
  if (alone) dither(g, 0, 0, W, H, 'rgba(18,22,34,.4)', 'rgba(0,0,0,0)', 10);
}

// ───────────── 8. 鞋（门槛特写） ─────────────
function bigShoe(g, x, y, kind) {
  const red = kind === 'red';
  const up = red ? P.herShoe : P.boot;
  const hi = red ? '#e0564c' : P.bootLit;
  const lo = red ? '#8f2f2a' : '#2a1a12';
  const sole = red ? P.cream : '#3b2a1e';
  // 鞋身（脚尖朝右，逐行收边）
  const rows = [
    [0, 40, 54], [2, 34, 60], [4, 30, 64], [6, 28, 68], [8, 27, 70],
    [10, 26, 70], [12, 26, 70], [14, 26, 70],
  ];
  rows.forEach(([dy, x0, x1]) => rect(g, x + x0, y - 24 + dy, x1 - x0, 2, up));
  rect(g, x + 26, y - 24, 30, 3, hi);
  // 后跟
  rect(g, x + 26, y - 24, 8, 22, lo);
  rect(g, x + 26, y - 24, 3, 20, up);
  // 鞋舌 + 鞋带
  rect(g, x + 40, y - 22, 8, 8, lo);
  for (let i = 0; i < 4; i++) rect(g, x + 38 + i * 6, y - 20 + i * 3, 5, 2, red ? '#fff6e4' : '#8a6a4a');
  // 白底 + 大底
  rect(g, x + 24, y - 2, 48, 4, sole);
  rect(g, x + 24, y + 2, 48, 2, '#d8ccb0');
  rect(g, x + 22, y + 4, 52, 2, '#120d14');
  // 鞋头包边
  rect(g, x + 66, y - 8, 4, 7, sole);
  if (red) {
    // 双结：两根带子
    rect(g, x + 30, y - 28, 10, 4, '#e8dcc4');
    rect(g, x + 36, y - 31, 8, 3, '#e8dcc4');
    px(g, x + 44, y - 32, '#e8dcc4'); px(g, x + 28, y - 29, '#e8dcc4');
  }
}
export function shoes(g, t, lt, u, s) {
  const pair = (s && s.pair) !== false;
  rect(g, 0, 0, W, 100, '#232a3a');
  rect(g, 0, 94, W, 6, '#39405a');
  floorPlanks(g, 100, '#5a4436', '#3a2a22', '#6b5242');
  const baseY = 140;
  rect(g, 40, baseY + 3, 80, 4, '#2f2118');
  bigShoe(g, 36, baseY, 'red');
  if (pair) { rect(g, 128, baseY + 3, 80, 4, '#2f2118'); bigShoe(g, 124, baseY, 'brown'); }
  if (s && s.untie) {
    rect(g, 88, 104, 18, 12, P.skin);
    rect(g, 96, 112, 6, 16, P.skinDark);
    hline(g, 74, 108, 118, '#e8dcc4');
    px(g, 106, 119, '#e8dcc4');
  }
  dither(g, 0, 0, W, 22, 'rgba(12,10,18,.45)', 'rgba(0,0,0,0)', 6);
}
// ───────────── 9. 卡带 / 倒带特写 ─────────────
export function deckJam(g, t, lt, u, s) {
  rect(g, 0, 0, W, H, '#1a1622');
  for (let y = 0; y < H; y += 5) hline(g, 0, W - 1, y, '#221c2a');
  rect(g, 40, 34, 240, 108, '#292333');
  rect(g, 40, 34, 240, 3, '#3b3450');
  for (const cx of [104, 216]) {
    rect(g, cx - 28, 48, 56, 44, '#15111a');
    rect(g, cx - 24, 51, 48, 38, '#221d2b');
    const a = -t * (s && s.jam ? 2.4 : .5);
    for (let i = 0; i < 8; i++) {
      const th = a + i * Math.PI / 4;
      px(g, Math.round(cx + Math.cos(th) * 15), Math.round(70 + Math.sin(th) * 12), '#7a7390');
    }
    rect(g, cx - 6, 64, 12, 12, '#3b3450');
    rect(g, cx - 2, 68, 4, 4, '#8d879b');
  }
  // 磁带被吐出 / 拉出的一截
  cassette(g, 128, 96, 1.2);
  const spill = s && s.spill != null ? s.spill : .5;
  const len = Math.round(70 * spill);
  for (let i = 0; i < len; i++) {
    const y = 112 + Math.round(Math.sin(i / 9 + t * 2) * 5) + Math.round(i / 14);
    px(g, 150 + i, y, i % 3 ? '#2a2634' : '#4a4458');
  }
  dither(g, 0, 0, W, 22, '#0e0b14', 'rgba(0,0,0,0)', 5);
}

// ───────────── 10. 空屋·空椅（两只杯子） ─────────────
export function seatEmpty(g, t, lt, u, s) {
  wall(g, 0, 104, true);
  floorPlanks(g, 104);
  windowBox(g, 40, 26, 56, 42, 'rain', t);
  rect(g, 150, 96, 104, 6, P.woodLit);
  rect(g, 150, 102, 104, 18, P.wood);
  rect(g, 150, 120, 104, 3, P.woodDark);
  cup(g, 164, 88); cup(g, 190, 88);
  chair(g, 214, 118, P.wood);
  if (s && s.actor) actor(g, 'sebastian', 120, 96, { dir: 'right', frame: 0 });
  // 夜里的一点点光
  dither(g, 0, 0, W, H, 'rgba(14,16,30,.38)', 'rgba(0,0,0,0)', 12);
}

// ───────────── 11. 窗（雨） ─────────────
export function windowRain(g, t, lt, u) {
  // 墙：竖板 + 一条靠窗的暖光
  rect(g, 0, 0, W, H, '#241f2e');
  for (let x = 0; x < W; x += 21) vline(g, x, 0, H, '#2b2536');
  for (let y = 0; y < H; y += 26) hline(g, 0, W - 1, y, '#221d2c');
  // 窗
  const wx = 96, wy = 26, ww = 128, wh = 92;
  rect(g, wx - 5, wy - 5, ww + 10, wh + 10, P.woodDark);
  rect(g, wx - 3, wy - 3, ww + 6, wh + 6, P.wood);
  rect(g, wx, wy, ww, wh, '#16243a');
  // 窗外：村子剪影 + 一点窗火
  for (let i = 0; i < 6; i++) {
    const bx = wx + 4 + i * 21, bh = 10 + (i * 7 % 14);
    rect(g, bx, wy + wh - 12 - bh, 16, bh + 12, '#101a2c');
    if (i % 2) rect(g, bx + 5, wy + wh - 14 - bh, 3, 3, '#e8b86a');
  }
  // 雨：贴在玻璃上，斜、密、短
  rainLayer(g, t, 26, 5, 40, '#3f5f86', wx + 1, wy + 1, wx + ww - 1, wy + wh - 2, 1.0, 11);
  rainLayer(g, t, 16, 7, 72, '#7fa3c8', wx + 1, wy + 1, wx + ww - 1, wy + wh - 2, 1.0, 12);
  rainLayer(g, t, 6, 9, 130, '#cfe4f6', wx + 1, wy + 1, wx + ww - 1, wy + wh - 2, 1.0, 13);
  // 窗棂
  vline(g, wx + ww / 2, wy, wy + wh, P.woodDark);
  hline(g, wx, wx + ww, wy + wh / 2, P.woodDark);
  rect(g, wx - 7, wy + wh + 3, ww + 14, 4, P.wood);
  rect(g, wx - 7, wy + wh + 7, ww + 14, 2, P.woodDark);
  // 玻璃上的水汽：靠边的一圈更暗
  dither(g, wx, wy, ww, 6, '#0e1a2c', 'rgba(0,0,0,0)', 4);
  dither(g, wx, wy + wh - 8, ww, 8, '#0e1a2c', 'rgba(0,0,0,0)', 4);
  // 台灯在玻璃上的暖反光
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * 6.283;
    px(g, Math.round(wx + 22 + Math.cos(a) * 9), Math.round(wy + wh - 26 + Math.sin(a) * 7), '#8a6a48');
  }
  px(g, wx + 22, wy + wh - 26, '#c99a5c');
}
// ───────────── 12. 车来了·门开 ─────────────
export function busArrive(g, t, lt, u, s) {
  sky(g, 'night'); hills(g, 82); ground(g, 122);
  for (const [x, w, h] of [[6, 24, 16], [36, 20, 12], [62, 30, 20]]) {
    rect(g, x, 126 - h, w, h, '#4a4458');
    for (let i = 0; i < 8; i++) rect(g, x - 4 + i, 126 - h - i, w + 8 - i * 2, 1, i % 3 ? '#5b5468' : '#3f3a4c');
  }
  rect(g, 0, 144, W, 22, P.pathDark);
  rect(g, 0, 146, W, 18, P.path);
  for (let x = 6; x < W; x += 30) hline(g, x, x + 14, 154, '#cfe0f0');
  busstop(g, 96, 146);
  actor(g, 'sebastian', 120, 118, { dir: 'left', frame: 0 });
  const p = clampS((lt - .3) / 1.6, 0, 1);
  const bx = 330 - (330 - 176) * ease(p);
  if (lt > .3) {
    busSide(g, bx, 168, p > .92);
    // 车灯扫过站台
    if (p > .5) { const a = clampS((p - .5) * 2, 0, 1); dither(g, 0, 146, 176, 18, 'rgba(255,224,150,' + (.22 * a).toFixed(2) + ')', 'rgba(0,0,0,0)', 5); }
  } rainSplash(g, t, 150, 12);
}

// ───────────── 13. 片名卡 ─────────────
export function endCard(g, t, lt, u) {
  sky(g, 'night'); hills(g, 86); ground(g, 122, H, '#1e2f28');
  for (let i = 0; i < 3; i++) rect(g, 20 + i * 34, 100 - i * 4, 28, 22 + i * 4, '#232a3d');
  busstop(g, 250, 146);
  tree(g, 40, 144, 1.3); rainSplash(g, t, 150, 18);
  puddle(g, 120, 156, 60, t);
  dither(g, 0, 0, W, H, 'rgba(8,10,20,.3)', 'rgba(0,0,0,0)', 12);
}

// ───────────── 14. 河堤黄昏·只站着 ─────────────
export function riverStand(g, t, lt, u, s) {
  riverBands(g, t, true);
  tree(g, 288, 136, 1.2);
  actor(g, 'sebastian', 104, 84, { dir: 'right', frame: 0 });
  actor(g, 'penny', 136, 84, { dir: 'left', frame: 0 });
  rect(g, 104, 116, 14, 1, '#2b2420'); rect(g, 136, 116, 14, 1, '#2b2420');
}
export const SETS = {
  rainHouse, roomNight, tapeBig, busStop, roadBus, river, tableFood,
  shoes, deckJam, seatEmpty, windowRain, busArrive, endCard, riverStand,
};
