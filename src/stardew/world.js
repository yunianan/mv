// 场景：农舍黄昏、巴士站、雨中空屋 —— 星露谷风格的 3/4 俯视
import { rect, px, hline, vline, dither, vgrad, P, W, H } from './px.js';

// —— 天空 ——
export function sky(g, mode = 'dusk') {
  if (mode === 'dusk') {
    vgrad(g, 0, 0, W, 96, [P.sky0, P.sky1, P.sky2, P.dawn0, P.dawn1, P.dawn2, P.dawn3]);
    // 云：一条一条的扁像素
    const cl = [[18, 34, 46, 3], [52, 52, 30, 2], [120, 26, 58, 3], [196, 40, 40, 2], [250, 30, 54, 3], [96, 60, 34, 2]];
    for (const [x, y, w, h] of cl) { hline(g, x, x + w - 1, y, P.dawn3); hline(g, x + 4, x + w - 5, y + 1, P.dawn2); if (h > 2) hline(g, x + 9, x + w - 9, y + 2, P.dawn1); }
    // 太阳低垂
    rect(g, 246, 62, 10, 10, P.sun); rect(g, 248, 60, 6, 2, P.sun); rect(g, 248, 74, 6, 2, P.sun);
  } else if (mode === 'night') {
    vgrad(g, 0, 0, W, 96, [P.black, P.sky0, P.sky1, P.sky2, P.sky3]);
  } else {
    vgrad(g, 0, 0, W, 96, [P.sky3, P.sky2, P.dawn0, P.dawn1]);
  }
  // 星
  if (mode === 'night') for (const [x, y] of [[30, 14], [74, 8], [126, 20], [180, 6], [232, 18], [288, 12], [52, 30], [210, 34]]) px(g, x, y, P.cream);
}

// —— 远山 ——
export function hills(g, y = 84) {
  const pts = [[0, y + 14], [24, y + 4], [52, y + 12], [86, y - 2], [118, y + 8], [150, y + 2], [186, y + 12], [216, y + 6], [250, y + 14], [284, y + 4], [320, y + 12]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    for (let x = x0; x < x1; x++) {
      const t = (x - x0) / (x1 - x0), yy = Math.round(y0 + (y1 - y0) * t);
      rect(g, x, yy, 1, y + 22 - yy, P.hillFar);
      px(g, x, yy, P.hillNear);
    }
  }
  // 近一层
  for (let x = 0; x < W; x++) {
    const yy = 104 + Math.round(5 * Math.sin(x / 26) + 3 * Math.sin(x / 9 + 1));
    rect(g, x, yy, 1, 132 - yy, P.hillNear);
    px(g, x, yy, P.hillLit);
  }
}

// —— 草地：一层一层的亮带，星露谷那种 ——
export function ground(g, y0 = 128, y1 = H, base = P.grass) {
  rect(g, 0, y0, W, y1 - y0, base);
  hline(g, 0, W - 1, y0, P.grassLit);
  // 草簇
  for (let i = 0; i < 150; i++) {
    const x = (i * 47 + 13) % W, y = y0 + 4 + ((i * 73) % (y1 - y0 - 6));
    px(g, x, y, P.grassDark); px(g, x + 1, y - 1, P.grassDark); px(g, x + 2, y, P.grassDark);
  }
  for (let i = 0; i < 60; i++) {
    const x = (i * 83 + 29) % W, y = y0 + 6 + ((i * 41) % (y1 - y0 - 8));
    px(g, x, y, P.grassHi); px(g, x, y - 1, P.grassHi);
  }
  // 小花
  for (let i = 0; i < 22; i++) {
    const x = (i * 137 + 61) % W, y = y0 + 10 + ((i * 59) % (y1 - y0 - 12));
    px(g, x, y, i % 3 ? '#f2c94c' : '#f08fa8'); px(g, x + 1, y, P.cream);
  }
}

// —— 房子 ——
export function house(g, x, y, w = 92, h = 54, lit = true, night = false) {
  const WALL = night ? '#6a6276' : P.cream, LINE = night ? '#5b5468' : P.dress;
  // 墙
  rect(g, x, y, w, h, WALL);
  for (let yy = y; yy < y + h; yy += 5) hline(g, x, x + w - 1, yy, LINE);
  // 屋顶
  for (let i = 0; i < 18; i++) {
    const ww = w + 10 - i * 2;
    rect(g, x - 5 + i, y - i, ww, 1, i % 3 === 0 ? P.woodDark : P.wood);
  }
  rect(g, x - 6, y + 17, w + 12, 3, P.woodDark);
  // 门
  const dx = x + w / 2 - 7;
  rect(g, dx, y + h - 24, 14, 24, P.woodDark);
  rect(g, dx + 1, y + h - 23, 12, 22, P.wood);
  vline(g, dx + 6, y + h - 23, y + h - 2, P.woodDark);
  px(g, dx + 11, y + h - 12, P.cream);
  // 窗
  for (const wx of [x + 10, x + w - 22]) {
    rect(g, wx, y + 8, 12, 10, P.woodDark);
    rect(g, wx + 1, y + 9, 10, 8, lit ? P.lamp : P.waterDark);
    if (lit) { rect(g, wx + 2, y + 10, 8, 6, P.lampLit); rect(g, wx + 3, y + 11, 4, 3, P.lamp); }
    vline(g, wx + 6, y + 9, y + 16, P.woodDark);
  }
}

// —— 栅栏 ——
export function fence(g, x0, x1, y) {
  vline(g, x0, y - 8, y + 3, P.woodLit); vline(g, x1, y - 8, y + 3, P.woodLit);
  hline(g, x0, x1, y - 5, P.woodLit); hline(g, x0, x1, y - 1, P.woodLit);
  for (let x = x0; x <= x1; x += 14) vline(g, x, y - 8, y + 3, P.woodLit);
}

// —— 巴士站：一根牌子 ＋ 一条木头长椅 ——
export function busstop(g, x, y) {
  fg:
  { vline(g, x, y - 30, y + 2, P.woodDark); }
  rect(g, x - 13, y - 30, 26, 14, P.cream);
  rect(g, x - 12, y - 29, 24, 12, P.wood);
  rect(g, x - 9, y - 26, 18, 6, P.cream);
  // 牌子上画一辆小巴
  rect(g, x - 7, y - 25, 14, 4, '#3e6ea8');
  rect(g, x - 6, y - 24, 4, 2, P.cream); rect(g, x + 1, y - 24, 4, 2, P.cream);
  px(g, x - 5, y - 21, P.ink2); px(g, x + 4, y - 21, P.ink2);
  // 长椅
  const bx = x + 28;
  rect(g, bx, y - 10, 34, 4, P.woodLit);
  rect(g, bx, y - 6, 34, 2, P.woodDark);
  vline(g, bx + 2, y - 6, y + 2, P.woodDark); vline(g, bx + 31, y - 6, y + 2, P.woodDark);
}

// —— 树（星露谷那种圆冠）——
export function tree(g, x, y, s = 1) {
  rect(g, x - 2, y - 8, 5, 12, P.woodDark);
  const r = 13 * s;
  for (let j = -2; j <= 2; j++) {
    const ww = Math.round(r * (1 - Math.abs(j) * .28));
    rect(g, x - ww / 2, y - 8 + j * 4 + 2, ww, 4, j === -2 ? P.grassHi : P.grassLit);
  }
  for (let j = -2; j <= 2; j++) {
    const ww = Math.round(r * (1 - Math.abs(j) * .28));
    hline(g, x - ww / 2, x + ww / 2, y - 6 + j * 4, P.grassHi);
  }
}

// —— 雨：斜线 ＋ 地面水花 ——
export function rain(g, t, n = 90) {
  for (let i = 0; i < n; i++) {
    const x = (i * 37 + Math.round(t * 60)) % (W + 40) - 20;
    const y = (i * 53 + Math.round(t * 190)) % (H + 30) - 10;
    vline(g, x, y, y + 4, '#8fa8c4');
    px(g, x - 1, y + 3, '#6a84a4');
  }
}

// —— 对话框（星露谷的木框）——
export function box(g, x, y, w, h) {
  rect(g, x, y, w, h, P.ink2);
  rect(g, x + 1, y + 1, w - 2, h - 2, '#3b2f46');
  rect(g, x + 2, y + 2, w - 4, 1, '#5a4a68');
  rect(g, x, y, w, 1, P.woodDark); rect(g, x, y + h - 1, w, 1, P.woodDark);
  rect(g, x, y, 1, h, P.woodDark); rect(g, x + w - 1, y, 1, h, P.woodDark);
  for (const [cx, cy] of [[x + 2, y + 2], [x + w - 4, y + 2], [x + 2, y + h - 4], [x + w - 4, y + h - 4]]) px(g, cx, cy, P.woodLit);
}
