// 分镜表：整首歌 0 → 275.9 秒，切成一串镜头
// 每个镜头 = { t0, t1, set, args, cam, line?, panelAt? }
// cam = { x, y, z0, z1 }（世界格坐标；z 是推近倍率）
import { W, H } from './px.js';

// 36 句歌词：与 `恋人-李荣浩.lrc` 的 36 个时间戳一一对应
export const LINES = [
  '那年夏天的雨，好像下不完。',
  '我在公交站，第一次看见她。',
  '她抱着一只纸袋，鞋带松了。',
  '我说，你的鞋带开了。',
  '她低头，笑了一下。',
  '那以后的每个黄昏，我们坐同一班车。',
  '河堤的木栈道上，影子比人长。',
  '她把红鞋子挂在栏杆上，说这样凉快。',
  '雨落进河里，一圈一圈。',
  '我住的那间屋子，窗户朝西。',
  '她把磁带塞进录音机，说倒着录的。',
  '按下录音键，只有雨声。',
  '晚饭是白饭和青菜，她挑掉葱。',
  '她说她八月要走，很久以前就想好的。',
  '我没问为什么，也没问去哪里。',
  '那天她穿了红色的鞋子。',
  '我把鞋带解开，又系上。',
  '别解开，她说，系紧一点。',
  '雨在窗外下了整夜。',
  '天亮的时候，雨小了一点。',
  '我们去了河边，谁都没说话。',
  '她说，你要记得那条路。',
  '我说，我记得。',
  '八月的最后一天，车来了。',
  '她把鞋带解开，递给我。',
  '车只停三分钟。',
  '她上车，没有回头。',
  '我在原地站到车灯看不见。',
  '后来的每个夏天，雨都下得像那天。',
  '我搬到河边，房间朝西。',
  '录音机还在，磁带还在。',
  '我按下 PLAY，里面只有雨声。',
  '我听了很久，很久。',
  '那盘磁带，我没有再擦掉。',
  '如果能倒回去，我还会说那句话。',
  '那年夏天，我把磁带留在了录音机里。',
];

// LRC 时间戳（秒）
export const STAMPS = [
  26.02, 33.37, 38.40, 46.91, 50.75, 53.97, 58.27, 61.04, 65.06,
  67.86, 74.36, 81.02, 87.97, 91.48, 121.56, 129.26, 132.65, 137.01,
  140.49, 142.62, 147.20, 149.82, 155.86, 163.23, 170.02, 173.70,
  178.72, 185.51, 192.74, 199.08, 202.44, 205.78, 211.21, 218.50,
  224.81, 228.39,
];
export const TOTAL = 275.925;

// 镜头语言：句内慢推，句间换景
const CAM = {
  wide:   { x: 140, y: 104, z0: 1.00, z1: 1.06 },
  push:   { x: 150, y: 100, z0: 1.02, z1: 1.12 },
  close:  { x: 150, y: 92,  z0: 1.05, z1: 1.14 },
  tight:  { x: 150, y: 100, z0: 1.45, z1: 1.58 },
  left:   { x: 96,  y: 104, z0: 1.04, z1: 1.12 },
  drift:  { x: 180, y: 96,  z0: 1.26, z1: 1.14 },
  foot:   { x: 112, y: 106, z0: 1.05, z1: 1.14 },
  meal:   { x: 160, y: 96, z0: 1.06, z1: 1.16 },
};

// 36 个主镜头（顺序对应 36 句）
const MAIN = [
  ['busStop',   { mode: 'rain', who: 'none' }, CAM.wide],     // 1 那年夏天的雨
  ['busStop',   { mode: 'dusk', who: 'her'  }, CAM.push],     // 2 第一次看见她
  ['busStop',   { mode: 'dusk', who: 'both' }, CAM.left],     // 3 纸袋 / 鞋带
  ['shoes',     { pair: true },                CAM.foot],     // 4 鞋带开了
  ['busStop',   { mode: 'dusk', who: 'her'  }, CAM.close],    // 5 她笑了一下
  ['busStop',   { mode: 'dusk', who: 'both' }, CAM.wide],     // 6 同一班车
  ['river',     { walk: true },                CAM.wide],     // 7 影子比人长
  ['shoes',     { pair: true, untie: true },   CAM.foot],     // 8 红鞋挂栏杆
  ['river',     { walk: false, rain: true },    CAM.drift],    // 9 雨落进河里
  ['rainHouse', {},                            CAM.wide],     // 10 窗户朝西
  ['roomNight', {},                            CAM.push],     // 11 磁带 / 倒着录
  ['deckJam',   { jam: false, spill: .25 },    CAM.tight],    // 12 只有雨声
  ['tableFood', {},                            CAM.meal],     // 13 白饭和青菜
  ['tableFood', {},                            CAM.meal],     // 14 她说八月要走
  ['roomNight', { actor: false },              CAM.drift],    // 15 我没问为什么
  ['shoes',     { pair: false },               CAM.foot],     // 16 红色的鞋子
  ['shoes',     { pair: true, untie: true },   CAM.foot],     // 17 解开又系上
  ['shoes',     { pair: true },                CAM.foot],     // 18 系紧一点
  ['windowRain', {},                           CAM.push],     // 19 下了整夜
  ['windowRain', {},                           CAM.drift],    // 20 雨小了一点
  ['riverStand', {},                           CAM.wide],     // 21 河堤，没说话
  ['riverStand', {},                           CAM.close],    // 22 记得那条路
  ['riverStand', {},                           CAM.left],     // 23 我记得
  ['busArrive', {},                            CAM.wide],     // 24 车来了
  ['shoes',     { pair: true, untie: true },   CAM.foot],     // 25 鞋带递给我
  ['busArrive', {},                            CAM.push],     // 26 只停三分钟
  ['busStop',   { mode: 'night', who: 'her' }, CAM.drift],    // 27 她没有回头
  ['busStop',   { mode: 'night', who: 'him' }, CAM.wide],     // 28 站到车灯看不见
  ['roadBus',   {},                            CAM.wide],     // 29 后来的每个夏天
  ['rainHouse', {},                            CAM.push],     // 30 搬到河边
  ['roomNight', {},                            CAM.push],     // 31 录音机还在
  ['tapeBig',   {},                            CAM.tight],    // 32 按下 PLAY
  ['deckJam',   { jam: true, spill: .8 },      CAM.tight],    // 33 听了很久
  ['tapeBig',   {},                            CAM.drift],    // 34 没有再擦掉
  ['deckJam',   { jam: true, spill: 1 },       CAM.tight],    // 35 如果能倒回去
  ['rainHouse', {},                            CAM.wide],     // 36 磁带留在录音机里
];

// 空白段补镜头（前奏 / 间奏 / 尾奏）：[t0, t1, set, args, cam]
const GAPS = [
  [0.0, 9.0, 'rainHouse', {}, CAM.wide],
  [9.0, 18.0, 'windowRain', {}, CAM.push],
  [18.0, 26.02, 'busStop', { mode: 'rain', who: 'none' }, CAM.left],
  [96.5, 104.0, 'tapeBig', {}, CAM.tight],
  [104.0, 112.0, 'river', { walk: false }, CAM.drift],
  [112.0, 121.56, 'windowRain', {}, CAM.wide],
  [241.5, 249.5, 'roomNight', {}, CAM.drift],
  [249.5, 257.5, 'deckEnd', {}, { x: 160, y: 86, z0: 1.02, z1: 1.10 }],
  [257.5, 264.5, 'endCard', { style: 'card' }, CAM.push],
  [264.5, TOTAL, 'endCard', { style: 'blank' }, CAM.wide],
];

function shot(t0, t1, set, args, cam, line) {
  return { t0, t1, set, args: args || {}, cam, line };
}

export function buildShots() {
  const out = [];
  // 主镜头：每句从它的时间戳开始，到下一句或空白段开始为止
  for (let i = 0; i < 36; i++) {
    const t0 = STAMPS[i];
    const t1 = i < 35 ? STAMPS[i + 1] : 241.5;
    const [set, args, cam] = MAIN[i];
    // 长句（> 7.5s）里，字幕只压前 6.5 秒，后面交给空镜
    if (t1 - t0 > 7.5) {
      out.push(shot(t0, t0 + 6.5, set, args, cam, LINES[i]));
      out.push(shot(t0 + 6.5, t1, set, args, { ...cam, z0: cam.z1, z1: cam.z0 }, null));
    } else {
      out.push(shot(t0, t1, set, args, cam, LINES[i]));
    }
  }
  // 空白段按时间插进去
  for (const [t0, t1, set, args, cam] of GAPS) out.push(shot(t0, t1, set, args, cam, null));
  // 去掉被主镜头盖住的空镜（重叠时主镜头优先）
  const mains = out.filter(s => s.line);
  const gaps = out.filter(s => !s.line);
  const kept = [];
  for (const gp of gaps) {
    const covered = mains.some(m => m.t0 <= gp.t0 + 0.01 && m.t1 >= gp.t1 - 0.01);
    if (!covered && gp.t1 > gp.t0) kept.push(gp);
  }
  // 剪切：重叠处让位给主镜头
  const all = [...mains, ...kept].sort((a, b) => a.t0 - b.t0);
  const fixed = [];
  for (const s of all) {
    if (fixed.length && s.t0 < fixed[fixed.length - 1].t1) {
      const prev = fixed[fixed.length - 1];
      if (s.line) prev.t1 = Math.min(prev.t1, s.t0);
      else continue;
    }
    fixed.push({ ...s });
  }
  return fixed.filter(s => s.t1 - s.t0 > 0.25);
}

export const SHOT_LIST = buildShots();
