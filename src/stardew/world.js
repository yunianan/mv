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
  const RF = night ? '#4a3546' : P.wood, RFD = night ? '#33232f' : P.woodDark;
  const TRIM = night ? '#3a3345' : '#b9a98c';

  // 地基：一排石砌
  rect(g, x - 2, y + h - 5, w + 4, 5, TRIM);
  for (let i = 0; i < w + 4; i += 7) vline(g, x - 2 + i, y + h - 5, y + h - 1, night ? '#2c2635' : '#a3937a');

  // 墙
  rect(g, x, y, w, h - 5, WALL);
  for (let yy = y + 3; yy < y + h - 5; yy += 4) hline(g, x, x + w - 1, yy, LINE);

  // 屋顶：瓦，隔行换色；梯形从檐口收到屋脊
  for (let i = 0; i < 22; i++) {
    const ww = w + 16 - i * 2;
    rect(g, x - 8 + i, y + 2 - i, ww, 1, i % 4 === 0 ? RFD : RF);
  }
  // 屋脊压顶（宽度跟着屋顶最上面那一行，别往外伸）
  rect(g, x + 14, y - 20, w - 28, 2, night ? '#3a2a3a' : '#2e2320');
  rect(g, x + 14, y - 18, w - 28, 1, night ? '#4a3a4a' : '#8a6a4a');
  // 檐口（只留一根浅色压边，别画成横缝）
  rect(g, x - 6, y + 1, w + 12, 1, night ? '#43394f' : '#8a6a4a');
  rect(g, x + w + 4, y + 4, 2, h - 14, night ? '#332b3e' : '#7a5a42');

  // 烟囱
  const cx = x + w - 26;
  rect(g, cx, y - 30, 11, 14, night ? '#3b3247' : '#7d5f4a');
  rect(g, cx - 1, y - 33, 13, 4, night ? '#2c2536' : '#5e4636');
  for (let i = 0; i < 3; i++) px(g, cx + 3 + (i % 2), y - 36 - i * 3, night ? '#3e3648' : '#c9bda8');

  // 门：木纹 + 门把 + 门口暖光
  const dx = x + w / 2 - 7;
  rect(g, dx - 1, y + h - 26, 16, 26, night ? '#2b2434' : '#6b4f3a');
  rect(g, dx, y + h - 25, 14, 25, night ? '#403548' : P.wood);
  for (let i = 0; i < 5; i++) vline(g, dx + 2 + i * 3, y + h - 24, y + h - 2, night ? '#372e40' : '#8a6a4a');
  px(g, dx + 11, y + h - 13, night ? '#e8c07a' : P.lamp);
  // 门楣小檐
  rect(g, dx - 3, y + h - 28, 20, 2, night ? '#2b2434' : '#5e4636');
  // 门口落地的暖光
  rect(g, dx + 2, y + h, 10, 1, night ? '#7a5a3a' : '#e8c890');

  // 窗：四格 + 窗台 + 帷幔
  for (const wx of [x + 10, x + w - 22]) {
    rect(g, wx - 1, y + 7, 14, 12, night ? '#2b2434' : '#6b4f3a');
    rect(g, wx, y + 8, 12, 10, lit ? P.lamp : P.waterDark);
    if (lit) { rect(g, wx + 1, y + 9, 10, 8, P.lampLit); rect(g, wx + 2, y + 10, 5, 4, P.lamp); }
    vline(g, wx + 6, y + 8, y + 17, night ? '#2b2434' : '#6b4f3a');
    hline(g, wx, wx + 11, y + 13, night ? '#2b2434' : '#6b4f3a');
    rect(g, wx - 2, y + 19, 16, 2, night ? '#3a3345' : '#b9a98c');
    if (lit) { rect(g, wx + 1, y + 9, 3, 8, 'rgba(255,240,200,.35)'); }
  }

  // 爬墙的藤（一点点）
  for (let i = 0; i < 5; i++) px(g, x + 4 + i * 2, y + h - 16 + (i % 3), night ? '#2e3a34' : '#5f7a4a');

  // 屋顶小旗（风吹的）
  rect(g, x + 16, y - 24, 1, 6, night ? '#3a3345' : '#7a5a42');
  px(g, x + 17, y - 24, night ? '#5a4a5e' : '#c26a5a');
}
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
