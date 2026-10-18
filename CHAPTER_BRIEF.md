# Chapter animation contract

Project: 原创水彩 MV《我怀念的 · 留在右边的位置》. Date 2026-10-18.
Creative direction: original human characters, a song-specific relationship story, local frame-by-frame rendering.

Read `ANIMATION_GUIDE.md`, your chapter of `STORYBOARD.md`, `shots.json`, `src/mv-world.js`, and working `src/scenes/c01.js`. Keep what works if your file already exists. Only edit your own chapter file `src/scenes/c0N.js`; report shared changes, don't edit shared files or studio.html. Do not download or access external services.

Each file is one IIFE, ending `MV.register(N,[fn,...])` in exactly the chapter's shots.json order. fn(t,lt,dur,q,shot), q=lt/dur. Source song time only for idles, normalized q for own actions; no hardcoded song second boundaries. Time is pure, rendering out of order; no state, Math.random, clocks, or physics accumulation. No default Clawd.

Use MV API:
- `MV.frame(t,lt,dur,{ set:'room'|'roof'|'door', memory:true|false, cam:[cx,cy,zoom], girl:actorOptions, boy:actorOptions, table:false|{x,y,w}, chairs:false, rightChair:offset, props:[], after:()=>{}, doorOpen:0..1, lights:true, unlit:false, fireworks:0..1, fade:0..1 })`.
- full 1920x1080, default camera [960,540,1]; keep action above y=930, captions at1003. Camera model pairs [960,600,1.18], girlclose[730,550,1.5], boyclose[1230,540,1.5]. Don't crop ALL hands from action shots.
- actorOptions: x,y (feet),s(default1),facing(+1 girl/-1 boy),view:'q'|'front'|'side'|'back',emotion:'quiet'|'worried'|'sad'|'hurt'|'soft'|'happy'|'laugh',look:[-1..1,-1..1], headTilt radians, lean radians, l:[localHandX,localHandY],r:[...], closed,wet,smile(-1..1),talk:boolean,walk phase,bag,coat.
- Actor feet default y960, headcenter local(0,-420), shoulder (+/-55,-297); hands default +/-75,-203; localhand [150,-250] puts girl hand atx+150,y710 (on table). Girl x680,boy1260. Keep hands physically reachable, prefer moderate reaches; avoid many crisscrossed arms. Table x960 top740, prop base cupy713. Chairs645/1280.
- `MV.progress(q,a,b)` easedseg, `MV.motion(q,[[0,v],[.4,v],...])`, `MV.point([x,y],[x,y],k)`.
- Props `{kind:'cup'|'phone'|'plan'|'candle'|'cake'|'bag'|'coat'|'pen'|'tray'|'earbuds',x,y,s,key,rot,color,flame,lit,folded,open}`. Bottom origin, typicalcup .85, plan .8, candle .9, bag1, cake1.
- `MV.held(kind,actorOptions,'r'|'l',scale,opts)` in after() draws attached at exact actor hand position. `MV.hand(actor,side)` gives world coords. Held items should touch hands. Shared `shape(key,points,color,detail)`,`oval`,`box`,`mark` allow small custom props or actions, all p5.brush.
- frame order: background, chairs, body/head, table, foreground arms, props, after; hands should emerge above tabletop.
- Every person needs readable action and reaction, anticipation, main action, held consequence; use staggered easing and subtle secondary head/shoulder cues. No constant-speed drift slideshow. Same limited set, original colors. Warm roof is memory, room/door is present.
- One deliberate match/hard cut for each storyboard Out; do not add generic automatic fades to every cut. Head and body turn through flat drawn front/q/side/back, no 3D projection.

Continuity: coat starts on boy's arm, rests on chair at8–16, picked up169, on bag strap197. Bag starts by his feet, packed116, then door197. Plan and candle in drawer after109 and129; retrieved together197; stay left hand through final letting-go, returned269. He leaves only258–262. Separate night at171–197: no birthday cake, unlit lamps and deeper outerwear distinguish it.

Do not integrate scripts or full-render. Return files, number of shots, suggested review times and any API issue. Main renders and actually reviews all chapter images, motion strips and hand-offs after integration. Avoid parallel GPU rendering until asked; main owns preview queue. Need fixes? Edit your own file and preserve working parts.
