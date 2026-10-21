# 《我怀念的》水彩 MV：留在右边的位置

用代码逐帧绘制的原创人物音乐视频工程。林夏试图从共同回忆中找回周屿的回应，最终仍不舍，却让开门，收起第二只杯子，把留给他的椅子推回桌下。

- 8章、44镜，约289.067秒。
- p5.js + p5.brush：原创人物、餐桌、屋顶、玄关、动作和水彩墨线。
- 每帧由歌曲时间独立计算，可并行、乱序和断点续渲。
- 目标1920×1080、24fps，6938张JPEG帧，最终合成H.264 / BT.709 MP4。
- 字幕使用本地导入的行级LRC，不虚构逐字高亮或口型同步。

仓库包含源码、分镜、时间数据和制作说明。歌曲音频、原始歌词、生成字幕文本、本地依赖及渲染输出均不提交。

## 在 Windows 本地运行

需要 Node.js 24、Microsoft Edge，以及可以从PATH访问的FFmpeg。

```powershell
git clone https://github.com/yunianan/-mv.git
cd ./-mv
npm ci
```

安装时会自动运行 `tools/patch-brush-resources.mjs`，为固定版本 `p5.brush 2.2.3` 应用上传遮罩资源补丁：复用同一个 Canvas，在尺寸变化时释放旧后备存储，减少 GPU 内存分配，并保留浏览器默认的 2D 硬件加速选择。重复执行补丁是安全的；版本或代码片段不匹配时会停止并报错。

把对应版本素材放到：

```text
assets/song.mp3
assets/song.lrc
```

本片分镜针对孙燕姿《我怀念的》约4:49录音室版本。导入时排除16秒以前的片名与词曲标注。

```powershell
npm run import-lyrics
```

打开 `studio.html` 可拖动时间条检查画面。用本地无界面Edge渲染检查图：

```powershell
node render.mjs --sheet=20,79,123,183,260,286 --cols=3 --w=480 --out=out/check/preview.jpg '--chrome=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
```

完整逐帧渲染和编码：

```powershell
.\逐帧渲染.ps1
```

输出：

```text
out/frames/f00000.jpg ... f06937.jpg
out/我怀念的-留在右边的位置-MV.mp4
```

中断后再次执行脚本会跳过完整帧。改过场景后，应清理对应时间范围的旧帧再重新渲染。
默认使用 1 个 worker，每 48 帧关闭并重建浏览器，控制 GPU 资源占用。每帧捕获前后检查 WebGL 上下文，并拒绝近黑画面；失败批次会重试，已有完整帧会保留。`--workers` 可调整并行数，但会增加显存和内存压力。
若只需编码完整的已有帧：

```powershell
.\逐帧渲染.ps1 -EncodeOnly
```

`render.mjs` 也支持 `--chrome`、`--ffmpeg`、`--workers`、`--range`、`--strip`、`--crop-at` 等参数。Windows默认D3D11，并优先高性能GPU。

## 源码布局

| 路径 | 内容 |
|---|---|
| `src/scenes/c01.js`–`c08.js` | 分章镜头和人物表演 |
| `src/mv-world.js` | 原创人物模型、道具、场景与共享API |
| `src/mv-captions.js` | 行级歌词字幕 |
| `src/config.js` | 音轨、时长、节奏参数 |
| `src/core.js` / `timeline.js` | 水彩引擎、合成、时间轴 |
| `tools/import-lyrics.mjs` | 导入本地LRC并生成运行数据 |
| `tools/patch-brush-resources.mjs` | 安装时自动应用 p5.brush Canvas 资源补丁 |
| `tools/preview.mjs` | 逐镜、动作条带、特写与转场检查 |
| `STORYBOARD.md` / `shots.json` | 逐镜动作、理解顺序与Out转场 |
| `TASTE.md` / `TIMELINE.md` | 角色、画面纪律和音乐结构 |

`audio.json` 的节拍为分析候选；歌词原始时间戳为整秒行级数据，精确逐词听音校准尚未完成。

## 致谢与许可证

工程改编自 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)，使用 [painted-animation](https://github.com/Joker-chichi/claude-mv-skill/tree/main/skills/painted-animation) 和 [ai-music-video](https://github.com/Dracowyn/ai-music-video-skill/tree/main/skills/ai-music-video) 的制作方法。

原创叙事和角色在此仓库的MIT许可范围内；保留原引擎MIT声明，见 `THIRD_PARTY_LICENSES/ClaudeAnimationBase-LICENSE`。npm依赖遵循各自许可证。
