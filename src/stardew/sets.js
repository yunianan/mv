// 场景库：每个 set 都只依赖 (g, t, lt, u, spec)，纯函数，可任意顺序求值
import { rect, px, hline, vline, P, W, H, dither, vgrad } from './px.js';
import { sky, hills, ground, house, fence, tree, busstop, rain } from './world.js';
import { actor } from './sprite.js';

// ───────────── 通用零件 ─────────────
const BAYT = (y, x, n) => ((x * 7 + y * 13) % n) === 0;
function dimWallS(g) {
  for (let y = 0; y < 62; y++) for (let x = 0; x < W; x++) {
    const lv = (1 - y / 62) * .5;
    if (lv > .02 && BAYT(y, x, Math.max(2, Math.round(2 / lv)))) px(g, x, y, '#191322');
  }
}
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
export function cassette(g, x, y, s = 1, label = true) {
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
  rect(g, 0, 0, W, H, alone ? '#151118' : '#1b1520');
  for (let y = 0; y < 96; y += 6) hline(g, 0, W - 1, y, '#221b28');
  for (let r = 30; r > 0; r -= 3) for (let a = 0; a < 40; a++) {
    const th = a / 40 * 6.2832;
    const x = Math.round(272 + Math.cos(th) * r), y = Math.round(26 + Math.sin(th) * r * .8);
    if (x >= 0 && x < W && y >= 0 && y < H && BAYT(x, y, 3)) px(g, x, y, '#3a2f33');
  }
  rect(g, 0, 96, W, H - 96, '#5a4232');
  for (let y = 96; y < H; y += 13) hline(g, 0, W - 1, y, '#4a3527');
  hline(g, 0, W - 1, 96, '#6d5138'); hline(g, 0, W - 1, 97, '#7c5c40');
  const bx = alone ? 150 : 112, by = alone ? 112 : 110;
  bowlBig(g, bx, by, alone ? 1.1 : 1);
  if (!alone) bowlBig(g, 246, 112, .72);
  chopsticks(g, 150, 134, .92);
  if (!alone) chopsticks(g, 24, 142, .8);
  greensPlate(g, alone ? 232 : 174, 141, .85);
  steam2(g, bx + 4, by - 30, t, 1);
  if (!alone) steam2(g, 248, 82, t + 1.3, .7);
  dither(g, 0, 0, W, H, alone ? 'rgba(16,20,32,.42)' : 'rgba(20,14,22,.18)', 'rgba(0,0,0,0)', 12);
}
function bowlBig(g, cx, cy, sc) {
  const w = Math.round(64 * sc), h = Math.round(26 * sc);
  const hw = w / 2;
  // 碗身（从上往下收）
  for (let i = 0; i < h; i++) {
    const u2 = i / h;
    const half = Math.round(hw * (1 - .34 * u2));
    const col = u2 < .12 ? '#efe9dd' : (u2 < .7 ? '#e6dfd1' : '#d2cabb');
    hline(g, cx - half, cx + half, cy + i, col);
  }
  hline(g, cx - Math.round(hw * .66), cx + Math.round(hw * .66), cy + h - 1, '#a9a294');
  // 蓝边（碗身上三分之一）
  const by2 = cy + Math.round(h * .5);
  for (let i = 0; i < 2; i++) {
    const half = Math.round(hw * (1 - .34 * (by2 - cy + i) / h));
    hline(g, cx - half + 1, cx + half - 1, by2 + i, i ? '#2f5878' : '#5a8cb4');
  }
  // 碗口椭圆
  for (let x = -hw; x <= hw; x++) {
    const t = Math.sqrt(Math.max(0, 1 - (x / hw) ** 2));
    vline(g, Math.round(cx + x), cy - Math.round(4 * t), cy + Math.round(3 * t), '#f6f1e6');
  }
  // 米饭：椭圆内填白，中间隆起两像素
  for (let x = -hw + 3; x <= hw - 3; x++) {
    const t = Math.sqrt(Math.max(0, 1 - (x / (hw - 7)) ** 2));
    vline(g, Math.round(cx + x), cy - Math.round(3 * t) - 2, cy + Math.round(2 * t) - 1, '#fdfbf5');
  }
  for (let i = 0; i < 6; i++) px(g, cx - 12 + i * 5, cy - 2 - (i % 3), '#ffffff');
  // 碗底阴影
  for (let i = -hw * .7; i <= hw * .7; i += 2) px(g, Math.round(cx + i), cy + h, '#38281e');
}function chopsticks(g, x, y, sc) {
  const len = Math.round(92 * sc);
  for (let k = 0; k < 2; k++) {
    const y0 = y + k * 3;
    for (let i = 0; i < len; i++) {
      const yy = y0 - Math.round(i * .16);
      rect(g, x + i, yy, 1, 2, '#e0cda6');
    }
    for (let i = 0; i < len; i++) {
      const yy = y0 - Math.round(i * .16) + 2;
      px(g, x + i, yy, '#a8906e');
    }
  }
}function greensPlate(g, cx, cy, sc) {
  const w = Math.round(66 * sc), h = Math.round(15 * sc);
  const hw = w / 2, hh = h / 2;
  // 浅口盘：椭圆盘沿 + 盘心阴影
  for (let y = -hh; y <= hh; y++) {
    const t = Math.sqrt(Math.max(0, 1 - (y / hh) ** 2));
    const half = Math.round(hw * t);
    hline(g, Math.round(cx - half), Math.round(cx + half), Math.round(cy + y), '#e6dfd1');
  }
  for (let y = -hh + 2; y <= hh - 2; y++) {
    const t = Math.sqrt(Math.max(0, 1 - (y / (hh - 2)) ** 2));
    const half = Math.round((hw - 4) * t);
    hline(g, Math.round(cx - half), Math.round(cx + half), Math.round(cy + y), '#cfc6b4');
  }
  // 菜：几团叶子互相压着
  const leaves = [
    [-14, -1, 10, 5, '#2b512a'], [-2, -4, 11, 6, '#3d6b34'], [11, -1, 10, 5, '#356030'],
    [-7, 2, 10, 4, '#44763c'], [6, 2, 9, 4, '#3d6b34'], [0, -8, 8, 3, '#4d8342'],
  ];
  for (const [dx, dy, rw, rh, col] of leaves) {
    for (let y = -rh; y <= rh; y++) {
      const t = Math.sqrt(Math.max(0, 1 - (y / rh) ** 2));
      const half = Math.round(rw * t);
      hline(g, Math.round(cx + dx * sc - half), Math.round(cx + dx * sc + half), Math.round(cy + dy * sc + y), col);
    }
  }
  // 叶间暗缝 + 朝上的高光
  for (const [dx, dy, rw, rh] of leaves) {
    hline(g, Math.round(cx + dx * sc - rw * .5), Math.round(cx + dx * sc + rw * .4), Math.round(cy + dy * sc - rh + 1), '#79a862');
    hline(g, Math.round(cx + dx * sc - rw * .8), Math.round(cx + dx * sc + rw * .8), Math.round(cy + dy * sc + rh), '#1e341b');
  }
  // 几粒蒜末
  for (let i = 0; i < 5; i++) px(g, Math.round(cx - 18 + i * 8), Math.round(cy + 2 + (i % 2) * 2), '#efe8d2');
  // 一点油光
  for (let i = 0; i < 6; i++) px(g, Math.round(cx - 14 + i * 6), Math.round(cy - 4 + (i % 3)), '#8fbb72');
}function steam2(g, x, y, t, sc) {
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 18; i++) {
      const ph = (t * .55 + k * .33 + i / 18) % 1;
      const yy = y - Math.round(ph * 44 * sc);
      const xx = x + Math.round(Math.sin((ph * 2.2 + k) * 3.14) * 6 * sc);
      if (BAYT(xx, yy, 3)) px(g, xx, yy, ph > .6 ? '#8f8798' : '#c3bccb');
    }
  }
}function steam(g, x, y, t) {
  for (let i = 0; i < 3; i++) {
    const ph = (t * .8 + i * .33) % 1;
    const yy = y - Math.round(ph * 10);
    const xx = x + Math.round(Math.sin((ph + i) * 3.1) * 2);
    if (BAYT(xx, yy, 3)) px(g, xx, yy, '#cfc4d8');
  }
}
function hand(g, x, y, dir) {
  const sk = '#e8b8a0', dk = '#b98a76';
  rect(g, x, y, 12, 4, sk); rect(g, x + 2, y - 3, 8, 4, sk);
  rect(g, x + 1, y + 3, 10, 1, dk);
  hline(g, x + (dir > 0 ? 11 : 0), x + (dir > 0 ? 18 : 7), y + 1, '#e8dcc4');
}
// ───────────── 8. 鞋（门槛特写） ─────────────
// 帆布鞋按行画：一行一串 [y, x0, x1, 色键]，1 格 = s 像素
const SHOE_ART = [
  // 红帆布鞋：鞋尖朝右；鞋底 2 行，鞋帮 7 行，后跟领口抬高
  [1, 4, 9, 'R'],
  [2, 3, 10, 'R'],
  [3, 2, 11, 'R'], [3, 12, 26, 'l'],
  [4, 2, 11, 'R'], [4, 12, 28, 'r'],
  [5, 2, 6, 'R'], [5, 7, 20, 'p'], [5, 21, 29, 'r'],
  [6, 2, 6, 'R'], [6, 7, 20, 'p'], [6, 21, 29, 'r'],
  [7, 2, 6, 'R'], [7, 7, 20, 'p'], [7, 21, 30, 'r'],
  [8, 2, 6, 'R'], [8, 7, 20, 'p'], [8, 21, 27, 'r'], [8, 28, 31, 'W'],
  [9, 2, 6, 'R'], [9, 7, 27, 'r'], [9, 28, 31, 'W'],
  [10, 2, 31, 'W'],
  [11, 2, 31, 'w'],
  [12, 3, 30, 'k'],
];
const SHOE_HIS = [
  // 旧皮鞋：鞋帮高、颜色暗，鞋尖同样朝右
  [0, 3, 9, 'd'],
  [1, 2, 10, 'd'],
  [2, 2, 11, 'd'], [2, 12, 26, 'o'],
  [3, 2, 11, 'd'], [3, 12, 27, 'o'],
  [4, 2, 11, 'd'], [4, 12, 28, 'o'],
  [5, 2, 11, 'd'], [5, 12, 29, 'o'],
  [6, 2, 29, 'o'],
  [7, 2, 30, 'o'],
  [8, 2, 30, 'o'],
  [9, 2, 30, 'o'],
  [10, 3, 30, 'B'],
  [11, 3, 29, 'b'],
  [12, 4, 28, 'k'],
];const SHOE_MAP = {
  k: '#0d0b12', r: '#b3352f', R: '#8a2622', p: '#9c2c27', l: '#d8544a', w: '#e6dcc6', W: '#f6efdd',
  o: '#8a5f3e', d: '#5e4029', B: '#2a1a12', b: '#4a3524',
};
// 先描一圈 1px 黑边，再上行内颜色，读起来才像像素道具
function shoeArt(g, x, y, s, art, map) {
  for (const [ry, x0, x1] of art) {
    rect(g, x + (x0 - 1) * s, y + ry * s, (x1 - x0 + 3) * s, s, map.k);
    rect(g, x + x0 * s, y + (ry - 1) * s, (x1 - x0 + 1) * s, s, map.k);
  }
  for (const [ry, x0, x1, key] of art) {
    const c = map[key];
    if (!c) continue;
    rect(g, x + x0 * s, y + ry * s, (x1 - x0 + 1) * s, s, c);
  }
  // 鞋带：三根白条压在鞋舌上
  if (art === SHOE_ART) {
    for (const ly of [5, 7]) rect(g, x + 9 * s, y + ly * s, 10 * s, s, map.w);
  }
}
export function shoes(g, t, lt, u, s) {
  const pair = (s && s.pair) !== false;
  // 墙 0..104，地板 104..180，左边一道门框
  rect(g, 0, 0, W, 62, '#2a2130');
  rect(g, 0, 58, W, 4, '#3c2f38');
  rect(g, 0, 0, 14, 62, '#3a2a2e');
  rect(g, 13, 0, 1, 62, '#57403f');
  floorPlanks(g, 62, '#5a4436', '#3a2a22', '#6b5242');
  // 墙面上淡下暗（低机位看到的是地板，墙只留一条）
  dimWallS(g);  const sc = 3;
  if (pair) shoeArt(g, 176, 100, sc, SHOE_HIS, SHOE_MAP);
  shoeArt(g, 34, 96, sc, SHOE_ART, SHOE_MAP);
  // 接地阴影：鞋底正下方一条实线 + 再往下两层抖动
  rect(g, 36, 139, 100, 2, '#241a14');
  for (let i = 1; i <= 3; i++) for (let xx = 36 + i * 2; xx < 136 - i * 2; xx += 2) px(g, xx, 140 + i, '#2e2118');
  if (pair) { rect(g, 178, 143, 100, 2, '#241a14'); for (let i = 1; i <= 3; i++) for (let xx = 178 + i * 2; xx < 278 - i * 2; xx += 2) px(g, xx, 144 + i, '#2e2118'); }
  if (s && s.untie) {
    rect(g, 96, 120, 16, 10, P.skin);
    rect(g, 104, 128, 6, 14, P.skinDark);
    hline(g, 88, 118, 132, '#efe6d2');
  }
  dither(g, 0, 0, W, 18, 'rgba(12,10,18,.45)', 'rgba(0,0,0,0)', 6);
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

// ───────────── 9b. 磁带播到尽头 ─────────────
export function deckEnd(g, t, lt, u, s) {
  // 和 deckJam 同一台机器，但带子快到头：左盘收小、右盘变大、最后停住
  const clunk = u > .88 && ((t * 24) | 0) % 2 === 0 ? 1 : 0;
  rect(g, 0, 0, W, H, '#171320');
  for (let y = 0; y < H; y += 5) hline(g, 0, W - 1, y, '#1f1927');
  const bx = 40, by = 34 + clunk, bw = 240, bh = 108;
  rect(g, bx, by, bw, bh, '#292333');
  rect(g, bx, by, bw, 3, '#3b3450');
  rect(g, bx, by + bh - 3, bw, 3, '#1d1826');
  // 两盘：带芯半径随播放变化
  const spin = u < .88 ? -t * 2.2 * (1 - u * .8) : 0;
  const reels = [[104, 4 - u * 2], [216, 9 + u * 7]];
  for (const [cx, rr] of reels) {
    rect(g, cx - 28, by + 14, 56, 44, '#15111a');
    rect(g, cx - 24, by + 17, 48, 38, '#221d2b');
    // 卷在盘上的磁带：实心盘 + 两圈压线
    const R = Math.min(15, Math.round(rr * 1.6));
    for (let dy = -R; dy <= R; dy++) {
      const half = Math.round(Math.sqrt(Math.max(0, R * R - dy * dy)));
      hline(g, cx - half, cx + half, by + 36 + dy, '#2f2a3a');
    }
    for (let dy = -R; dy <= R; dy++) {
      const half = Math.round(Math.sqrt(Math.max(0, R * R - dy * dy)));
      if (Math.abs(dy) === R || Math.abs(dy) === R - 3) hline(g, cx - half, cx + half, by + 36 + dy, '#453e56');
      else if (Math.abs(dy) === R - 6) hline(g, cx - half, cx + half, by + 36 + dy, '#3a3448');
    }
    for (let i = 0; i < 8; i++) {
      const th = spin + i * Math.PI / 4;
      px(g, Math.round(cx + Math.cos(th) * 10), Math.round(by + 36 + Math.sin(th) * 10), '#8d879b');
    }
    rect(g, cx - 6, by + 30, 12, 12, '#3b3450');
    rect(g, cx - 2, by + 34, 4, 4, '#8d879b');
  }
  // 走带窗：两根带在磁头上来回
  rect(g, bx + 20, by + 60, 200, 4, '#15111a');
  hline(g, bx + 104, bx + 216, by + 56, '#4a4458');
  hline(g, bx + 104, bx + 216, by + 57, '#332d40');
  rect(g, bx + 140, by + 54, 40, 6, '#1d1826');
  rect(g, bx + 150, by + 55, 20, 4, '#3a3448');
  // 按键：PLAY 在 u>.88 弹起来
  const keys = ['#3b3450', '#3b3450', '#3b3450', '#3b3450', '#3b3450'];
  keys[1] = u > .88 ? '#3b3450' : '#6d6580';
  keys.forEach((c, i) => rect(g, bx + 26 + i * 26, by + bh - 22, 20, 8, c));
  rect(g, bx + 26 + 26, by + bh - 24, 20, 2, u > .88 ? '#2a2536' : '#8d879b');
  // 计数器：滚到 0000
  const ctr = Math.max(0, Math.round(48 * (1 - u)));
  rect(g, bx + 170, by + 9, 33, 11, '#141019');
  for (let i = 0; i < 4; i++) {
    const dv = Math.floor(ctr / Math.pow(10, 3 - i)) % 10;
    const dx = bx + 172 + i * 7;
    pixDigits(g, dx, by + 11, dv);
  }
  // 电源灯：u>.88 熄
  rect(g, bx + bw - 16, by + 10, 5, 5, u > .88 ? '#2a2536' : '#66d08a');
  dither(g, 0, 0, W, 26, '#0d0a12', 'rgba(0,0,0,0)', 5);
  if (s && s.spill != null) {
    const len = Math.round(70 * s.spill);
    for (let i = 0; i < len; i++) px(g, 150 + i, 118 + Math.round(Math.sin(i / 9) * 4), '#3a3448');
  }
}
function pixDigits(g, x, y, v, sc = 1) {
  const SEG = [
    '1111110', '0110000', '1101101', '1111001', '0110011',
    '1011011', '1011111', '1110000', '1111111', '1111011',
  ][v];
  const col = '#d8cfae';
  for (let i = 0; i < 7; i++) if (SEG[i] === '1') {
    const [dx, dy, w, h] = [[1, 0, 4, 1], [5, 1, 1, 3], [5, 5, 1, 3], [1, 9, 4, 1], [0, 5, 1, 3], [0, 1, 1, 3], [1, 4, 4, 1]][i];
    rect(g, x + dx * sc, y + dy * sc, w * sc, h * sc, col);
  }
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
export function endCard(g, t, lt, u, s) {
  const style = (s && s.style) || 'wide';
  if (style === 'blank') { rect(g, 0, 0, W, H, '#0b0910'); dither(g, 0, 0, W, H, '#100d16', '#0b0910', 9); return; }
  if (style === 'card') {
    // 最后的黑场卡：一盘磁带躺在雨里
    rect(g, 0, 0, W, H, '#0b0910');
    dither(g, 0, 0, W, H, '#131019', '#0b0910', 7);
    cassette(g, 136, 96, 1.1, true);
    rect(g, 130, 128, 60, 2, '#1c161f');
    rainSplash(g, t, 150, 10);
    return;
  }
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
  shoes, deckJam, deckEnd, seatEmpty, windowRain, busArrive, endCard, riverStand,
};
