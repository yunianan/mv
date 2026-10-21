// 星露谷风格像素画：320×180 原生，6 倍最近邻放大到 1920×1080
// 调色板 ≤ 30 色；所有形状都对齐到像素格；渐变靠抖动，不靠插值。

export const W = 320, H = 180, SCALE = 6;

export const P = {
  ink: '#141019',
  black: '#221a26',
  sky0: '#171a33', sky1: '#232a4d', sky2: '#3a4472', sky3: '#5c5f96',
  dawn0: '#8c6a9a', dawn1: '#c98a86', dawn2: '#e8a884', dawn3: '#f7c69a',
  sun: '#ffe0a8',
  hillFar: '#2b3457', hillNear: '#37456b', hillLit: '#4b5c86',
  grassDark: '#2c5238', grass: '#3d7345', grassLit: '#5c9550', grassHi: '#83b85c',
  path: '#b98a5e', pathDark: '#96684250', pathLit: '#cfa273',
  wood: '#8a5738', woodDark: '#5f3a26', woodLit: '#b97d4a',
  waterDark: '#20405e', water: '#2e6480', waterLit: '#4b92a6', foam: '#9fd0d8',
  white: '#fff6e4', cream: '#f2e0bc',
  lamp: '#ffd074', lampLit: '#ff9a3c',
  hair: '#2a2230', hairHi: '#4a3f52',
  skin: '#f2cbab', skinDark: '#cf9f82', skinLit: '#ffe3c8',
  shirt: '#c9493f', shirtDark: '#8f2f30', overall: '#3e6ea8', overallDark: '#2b4d7a', overallLit: '#5b8cc4',
  boot: '#5d3f2a', bootLit: '#8a6242',
  herHair: '#7a4630', herHairHi: '#a4654a', dress: '#f0d9b8', dressDark: '#c9ac86', herShoe: '#d0433c',
  ink2: '#2e2436',
};

// —— 画布：先画在 320×180 的缓冲上，再整数放大 ——
export function canvas() {
  const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
  const g = buf.getContext('2d'); g.imageSmoothingEnabled = false;
  const out = document.createElement('canvas'); out.width = W * SCALE; out.height = H * SCALE;
  const o = out.getContext('2d'); o.imageSmoothingEnabled = false;
  return { buf, g, out, o };
}
export function present(c, bg = P.sky0, cam = null) {
  c.o.fillStyle = bg; c.o.fillRect(0, 0, c.out.width, c.out.height);
  if (!cam) { c.o.drawImage(c.buf, 0, 0, W * SCALE, H * SCALE); return c.out; }
  const z = cam.z ?? 1, ox = cam.ox ?? 0, oy = cam.oy ?? 0;
  c.o.drawImage(c.buf, ox, oy, c.out.width * z, c.out.height * z);
  return c.out;
}

// —— 基本形状：一切都是整数格 ——
export const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
export const px = (g, x, y, col) => rect(g, x, y, 1, 1, col);
export const hline = (g, x0, x1, y, col) => rect(g, x0, y, x1 - x0 + 1, 1, col);
export const vline = (g, x, y0, y1, col) => rect(g, x, y0, 1, y1 - y0 + 1, col);

// 4×4 Bayer
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
export function dither(g, x, y, w, h, a, b, level = 8) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const t = BAYER[(y + j) & 3][(x + i) & 3];
    px(g, x + i, y + j, t < level ? a : b);
  }
}
// 竖向渐变（两条色之间用抖动过渡）
export function vgrad(g, x, y, w, h, stops) {
  const n = stops.length - 1;
  for (let j = 0; j < h; j++) {
    const t = (j / Math.max(1, h - 1)) * n;
    const i = Math.min(n - 1, Math.floor(t)), f = t - i;
    const lvl = Math.round(f * 16);
    if (lvl <= 0) hline(g, x, x + w - 1, y + j, stops[i]);
    else if (lvl >= 16) hline(g, x, x + w - 1, y + j, stops[i + 1]);
    else dither(g, x, y + j, w, 1, stops[i], stops[i + 1], lvl);
  }
}

// —— 像素中文：小字号渲染后按阈值二值化，得到硬边 ——
let _f = null;
export function text(g, str, x, y, col, size = 12, align = 'left') {
  if (!_f) { _f = document.createElement('canvas'); _f.width = 960; _f.height = 40; }
  const f = _f.getContext('2d');
  f.clearRect(0, 0, _f.width, _f.height);
  f.font = `${size}px "Microsoft YaHei", "SimHei", sans-serif`;
  f.textBaseline = 'top'; f.fillStyle = '#000'; f.textAlign = 'left';
  const w = Math.ceil(f.measureText(str).width);
  f.fillText(str, 0, 0);
  const img = f.getImageData(0, 0, w + 2, size + 6);
  const d = img.data;
  const ox = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? Math.round(x - w) : Math.round(x);
  g.fillStyle = col;
  for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) {
    if (d[(j * img.width + i) * 4 + 3] > 110) g.fillRect(ox + i, y + j, 1, 1);
  }
  return w;
}
