// 把 star/ 的模块打成单个自包含 HTML（内联 JS + base64 精灵），整片循环播放
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || '.';
const out = process.argv[3] || 'stardew-film.html';
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');

const strip = src => src
  .replace(/^\s*import[^;]+;\s*$/gm, '')
  .replace(/^export\s+/gm, '');

const FILES = ['px.js', 'world.js', 'sprite.js', 'sets.js', 'scenes.js', 'film.js'];
const body = FILES.map(f => `// ===== ${f} =====\n` + strip(read(f))).join('\n\n');

const shell = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>恋人 · 星露谷风格 MV</title>
<style>
  html, body { margin: 0; height: 100%; background: #101018; overflow: hidden; }
  body { display: grid; place-items: center; }
  canvas { image-rendering: pixelated; display: block; max-width: 100vw; max-height: 100vh; }
  .lag { position: fixed; bottom: 10px; width: 100%; text-align: center; color: #7d7488;
         font: 12px/1.6 "Microsoft YaHei", sans-serif; letter-spacing: .06em; }
</style>
</head>
<body>
<div class="lag">整片 4 分 36 秒 · 无声预览（歌曲版权不在本仓）· 声音版见 sample 或自行对齐音轨</div>
<script type="module">
${body}

// —— 24 fps 循环播放整片；?still=1 时交给外部逐帧渲染 ——
if (!/still/.test(location.search)) {
  const t0 = performance.now();
  const STEP = 1000 / 24;
  let last = -1;
  function tick() {
    const ms = performance.now() - t0;
    const total = window.DUR || 275.925;
    const t = (ms / 1000) % total;
    const f = Math.floor(ms / STEP);
    if (f !== last) { last = f; window.render(t); }
    requestAnimationFrame(tick);
  }
  tick();
}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(dir, out), shell, 'utf8');
console.log('wrote', path.join(dir, out), (shell.length / 1024 / 1024).toFixed(2) + 'MB');
