// Original human cast and shared watercolor set. Every pose is a pure function of song time.
// Local actor coordinates: feet (0,0), shoulder (+/-58,-300), face (0,-420).
const MV = (() => {
  const C = {ink:'#494649', paper:'#EFE7D8', wall:'#D8DDD5', blue:'#7A9298',
    girl:'#D9AD65', skirt:'#81929C', boy:'#7393A0', pants:'#B4ADA1',
    skin:'#EBC6AC', hair:'#775342', dark:'#4B4541', wood:'#B79A7A',
    warm:'#D9B774', pink:'#B67567', night:'#637C8C', cream:'#F4E5C8'};
  function shape(key,pts,col,detail=false) {
    boilSeed(key);
    // p5.brush's curved Plot wash can miss its interior under nested transforms.
    // A softened closed polygon preserves the opaque underpainting and ink contour.
    const softened=pts.flatMap((p,i)=>{const n=pts[(i+1)%pts.length];return [point(p,n,.16),point(p,n,.84)];});
    paint(softened,{wash:col,washOp:255,fill:detail?mixCol(col,C.paper,.2):null,fillOp:detail?75:0,
      bleed:.12,tex:.65,border:.25,ink:C.ink,sw:.42});
  }
  function oval(key,x,y,rx,ry,col,detail=false) {shape(key,ellPts(x,y,rx,ry,22,.5),col,detail);}
  function box(key,x,y,w,h,col,r=5) {shape(key,rrPts(x,y,w,h,r,.5),col);}
  function mark(key,pts,weight=.55,col=C.ink) {boilSeed(key);inkLine(pts,weight,col,'inkfine',.5);}
  const progress=(p,a,b)=>ease(seg(p,a,b));
  const motion=(p,keys)=>kf(p,keys);
  const point=(a,b,k)=>a.map((v,i)=>lerp(v,b[i],k));

  function prop(kind,x,y,s=1,o={}) {
    const key=o.key||kind;
    const flatPhone=kind==='phone'&&Math.abs(o.rot||0)>1;
    push();translate(x,y);scale(s);rotate(flatPhone?0:(o.rot||0));
    if(kind==='cup') {
      mark(key+'handle',[[32,-39],[53,-44],[58,-20],[40,-9]],1.1,o.color||C.blue);
      shape(key+'body',[[-36,-52],[35,-52],[31,-3],[21,4],[-25,3]],o.color||C.cream,true);
      oval(key+'rim',0,-52,35,8,C.paper);
      mark(key+'tea',[[-24,-52],[0,-49],[25,-52]],.5,C.wood);
      mark(key+'foot',[[-23,6],[18,7]],.45);
    } else if(kind==='phone') {
      if(flatPhone) {
        box(key,-47,-3,94,28,C.dark,5);box(key+'screen',-40,1,78,19,o.lit===false?'#9CA7A2':'#C6D8D2',2);
        if(o.lit!==false){oval(key+'avatar',-29,10,5,5,C.pink);mark(key+'msg',[[-15,8],[21,8]],.55,C.blue);}
      } else {
        box(key,-29,-67,58,88,C.dark,8);
        box(key+'screen',-23,-58,46,67,o.lit===false?'#9CA7A2':'#C6D8D2',4);
        if(o.lit!==false) {oval(key+'avatar',-12,-43,6,6,C.pink);mark(key+'msg',[[-1,-45],[14,-45]],.8,C.blue);mark(key+'msg2',[[-15,-28],[14,-28]],.8,C.blue);}
      }
    } else if(kind==='plan') {
      shape(key,[[-83,-55],[79,-59],[89,40],[-78,47]],C.cream,true);
      mark(key+'roof',[[-58,12],[0,-18],[59,12]],.6,C.blue);
      mark(key+'rail',[[-52,19],[52,19]],.45,C.blue);
      for(let j=0;j<4;j++)mark(key+j,[[-45+j*29,-3],[-45+j*29,20]],.35,C.blue);
      mark(key+'crease',[[3,-49],[-1,37]],.35,'#BCA98E');
      if(!o.folded) {mark(key+'lights',[[-60,-29],[0,-15],[60,-29]],.4,C.pink);}
    } else if(kind==='candle') {
      box(key,-7,-35,14,34,C.pink,2);mark(key+'wick',[[0,-36],[1,-42]],.6);
      if(o.flame) {shape(key+'fire',[[0,-65],[9,-49],[0,-39],[-8,-48]],C.warm);}
    } else if(kind==='cake') {
      oval(key+'plate',0,4,103,17,C.cream);
      box(key+'body',-85,-70,170,69,'#D8B59A',8);
      shape(key+'icing',[[-87,-65],[-72,-80],[73,-79],[88,-64],[84,-48],[65,-52],[39,-45],[6,-52],[-25,-44],[-54,-52],[-83,-46]],C.cream,true);
      prop('candle',0,-75,.8,{key:key+'c',flame:o.flame!==false});
      oval(key+'berry',-48,-77,9,8,C.pink);
    } else if(kind==='bag') {
      shape(key,[[-66,-110],[-53,-143],[49,-145],[70,-111],[68,-1],[-65,0]],'#8E8C7E',true);
      mark(key+'handle',[[-25,-142],[-19,-166],[21,-165],[30,-141]],1.2);
      mark(key+'zip',[[-56,-107],[0,-111],[56,-107]],.7);
      box(key+'pocket',-43,-72,86,55,'#A29E8A',8);
      if(o.open)shape(key+'cloth',[[-35,-131],[-30,-170],[8,-163],[29,-140],[25,-119]],C.boy);
    } else if(kind==='coat') {
      shape(key,[[-41,-116],[-65,-89],[-74,-32],[-48,-27],[-40,8],[40,8],[46,-27],[69,-34],[59,-94],[34,-119],[0,-98]],'#B8AD9C',true);
      mark(key+'lapel',[[-22,-108],[0,-70],[23,-109]],.6);
    } else if(kind==='pen') {mark(key,[[-32,5],[31,-9]],1.8,C.blue);}
    else if(kind==='tray') {oval(key,0,0,83,22,C.wood);}
    else if(kind==='earbuds') {mark(key,[[-34,-34],[-16,-5],[11,-9],[35,-35]],.55);oval(key+'l',-34,-35,5,8,C.cream);oval(key+'r',35,-35,5,8,C.cream);}
    pop();
  }

  function actor(who,t,o={},phase='all') {
    const female=who==='girl', key=who, x=o.x??(female?650:1250), y=o.y??960, s=o.s??1;
    const facing=o.facing??(female?1:-1), view=o.view||'q', back=view==='back', side=view==='side';
    const em=o.emotion||'quiet', mood=o.mood??0;
    const breathe=Math.sin(t*1.6+(female?0:1.2))*1.8;
    const walk=o.walk||0, step=Math.sin(walk*TAU), bob=walk?Math.abs(step)*4:0;
    const lean=o.lean||0, shirt=female?C.girl:C.boy;
    push();translate(x,y-bob);scale(s);rotate(lean);
    if(phase!=='arms') {
      if(female) {
        shape(key+'skirt',[[-59,-230],[59,-230],[87,-103],[23,-91],[-72,-106]],C.skirt,true);
        shape(key+'leg1',[[-47,-109],[-19,-107],[-20+step*14,-12],[-45+step*14,-12]],C.skin);
        shape(key+'leg2',[[17,-106],[45,-109],[45-step*14,-10],[19-step*14,-10]],C.skin);
      } else {
        shape(key+'trousers',[[-60,-235],[63,-235],[52,-10],[13,-10],[0,-154],[-15,-10],[-55,-10]],C.pants,true);
      }
      oval(key+'shoe1',-34+step*14,-6,29,13,'#726257');
      oval(key+'shoe2',34-step*14,-6,29,13,'#726257');
      if(female)shape(key+'hairback',[[-79,-465],[-64,-515],[15,-530],[74,-485],[92,-351],[47,-328],[-72,-341]],C.hair,true);
      const dy=breathe;
      shape(key+'torso',[[-57,-312+dy],[-72,-266],[-57,-209],[60,-210],[70,-263],[55,-315+dy],[24,-328],[-22,-328]],shirt,true);
      shape(key+'neck',[[-20,-350],[21,-350],[20,-315],[-19,-315]],C.skin);
      mark(key+'collar',[[-36,-320],[0,-303],[35,-320]],.65,female?'#AD8E62':'#556F7A');
      if(!female)mark(key+'shirtseam',[[0,-303],[2,-219]],.45,'#536D78');
      else {mark(key+'cuff',[[-55,-225],[52,-224]],.5,'#AD8E62');}
      flushBrush();
      push();translate(0,dy);rotate(o.headTilt||0);
      if(back) {
        oval(key+'backhead',0,-423,83,97,female?C.hair:C.dark,true);
        mark(key+'part',[[-23,-510],[-8,-469],[7,-446]],.55,'#A28166');
      } else {
        const faceX=side?facing*18:facing*7;
        oval(key+'earL',-76,-414,12,20,C.skin);oval(key+'earR',76,-414,12,20,C.skin);
        shape(key+'face',[[faceX-76,-461],[faceX-66,-491],[faceX-24,-510],[faceX+43,-501],[faceX+77,-465],[faceX+74,-404],[faceX+44,-360],[faceX+3,-348],[faceX-43,-361],[faceX-73,-408]],C.skin,true);
        flushBrush();
        if(female) {
          shape(key+'fringe',[[-80,-432],[-87,-470],[-54,-514],[0,-527],[59,-507],[81,-468],[75,-421],[53,-445],[38,-482],[5,-459],[-32,-476],[-57,-449]],C.hair,true);
          mark(key+'hairshine',[[-55,-491],[-23,-504],[10,-504]],.8,'#A47C58');
          oval(key+'clip',57,-457,13,4,C.warm);
        } else {
          shape(key+'fringe',[[-80,-437],[-88,-475],[-66,-488],[-74,-505],[-31,-512],[-8,-533],[24,-518],[62,-518],[84,-482],[77,-444],[60,-454],[48,-484],[15,-465],[-14,-480],[-51,-463]],C.dark,true);
          mark(key+'hairshine',[[-48,-499],[-19,-508],[10,-503]],.7,'#776B5C');
        }
        flushBrush();
        const look=o.look||[facing*.35,em==='sad'?.4:0], ey=-417+look[1]*7;
        const blink=(Math.sin(t*.8+(female?.3:2.4))>.997)||o.closed;
        const eyes=side?[facing*40]:[-31+faceX*.5,35+faceX*.5];
        eyes.forEach((ex,i)=>{
          if(blink||em==='laugh') mark(key+'eye'+i,[[ex-10,ey+2],[ex,ey+5],[ex+10,ey]],.9);
          else {
            oval(key+'white'+i,ex,ey,11,14,'#F0E1CC');
            oval(key+'pupil'+i,ex+look[0]*4,ey+look[1]*2,5.5,9,C.ink);
            mark(key+'lid'+i,[[ex-11,ey-8],[ex,ey-12],[ex+11,ey-8]],.6);
          }
          const sad=em==='sad'||em==='worried'||em==='hurt';
          mark(key+'brow'+i,[[ex-12,ey-30+(sad?(i===0?6:-5):0)],[ex+9,ey-30+(sad?(i===0?-5:6):0)]],.75,female?C.hair:C.dark);
        });
        mark(key+'nose',[[faceX+6,-409],[faceX+11,-397],[faceX+4,-394]],.4,'#B68B77');
        const my=-379, smile=(em==='happy'||em==='soft'||em==='laugh')?1:em==='sad'?-1:0;
        const amount=o.smile??smile;
        mark(key+'mouth',[[faceX-13,my],[faceX,my+amount*7],[faceX+13,my]],.65,'#A36F63');
        if(o.talk)oval(key+'talk',faceX,my+3,6,4,C.pink);
        if(em==='happy'||em==='soft'||em==='laugh') {
          mark(key+'cheek1',[[-50,-393],[-37,-390]],2.2,'#C48B79');mark(key+'cheek2',[[43,-390],[56,-394]],2.2,'#C48B79');
        }
        if(o.wet) mark(key+'wet',[[eyes[0]-7,ey+14],[eyes[0]+8,ey+14]],.9,'#CDDCD8');
      }
      pop();
    }
    if(phase!=='body') {
      const lh=o.l||[-75,-203], rh=o.r||[75,-203];
      [[-1,lh],[1,rh]].forEach(([dir,h],i)=>{
        const shoulder=[dir*55,-297+breathe], elbow=[lerp(shoulder[0],h[0],.54)+dir*22,lerp(shoulder[1],h[1],.56)+23];
        boilSeed(key+'arm'+i);
        paint(ribbon([shoulder,elbow,[h[0],h[1]-3]],32,21),{wash:shirt,washOp:240,ink:C.ink,sw:.48});
        oval(key+'hand'+i,h[0],h[1]+5,14,18,C.skin);
        mark(key+'thumb'+i,[[h[0]+dir*9,h[1]-3],[h[0]+dir*4,h[1]+7]],.4,'#BB907B');
      });
    }
    if(o.bag)prop('bag',(o.bagSide??facing)*65,-78,.8,{key:key+'bag'});
    if(o.coat)prop('coat',facing*77,-185,.72,{key:key+'coat'});
    pop();
  }
  function hand(o,side='r') {
    const h=o[side]||[side==='r'?75:-75,-203], s=o.s??1, rot=o.lean||0;
    return [(o.x??650)+s*(h[0]*Math.cos(rot)-h[1]*Math.sin(rot)),(o.y??960)+s*(h[0]*Math.sin(rot)+h[1]*Math.cos(rot))];
  }
  function held(kind,o,side='r',s=.65,opts={}) {const p=hand(o,side);prop(kind,p[0],p[1],s,opts);}
  function chair(x,y,offset=0) {
    push();translate(x+offset,y);
    box('chairback'+x,-81,-185,162,179,'#AAA496',13);
    mark('chairrail'+x,[[-57,-148],[57,-148]],.7);
    shape('chairseat'+x,[[-97,-12],[92,-13],[111,32],[-110,34]],'#C1AE95');
    mark('chairlegL'+x,[[-75,31],[-90,132]],1.8,'#8E8A7E');
    mark('chairlegR'+x,[[75,31],[89,132]],1.8,'#8E8A7E');pop();
  }
  function table(o={}) {
    const x=o.x??960,y=o.y??740,w=o.w??970;
    shape('tabletop',[[x-w/2,y-33],[x+w/2,y-33],[x+w/2+48,y+29],[x-w/2-48,y+29]],'#CDBB9E',true);
    box('tablefront',x-w/2-48,y+29,w+96,55,'#B6A082',3);
    mark('tablelegL',[[x-w/2+42,y+82],[x-w/2+18,982]],3,'#9C8E78');
    mark('tablelegR',[[x+w/2-42,y+82],[x+w/2-18,982]],3,'#9C8E78');
    mark('drawer',[[x-145,y+45],[x+145,y+45]],.5,'#8B806F');
    mark('drawerknob',[[x-14,y+59],[x+14,y+59]],1.2,'#8B806F');
  }
  function background(set,t,o={}) {
    const warm=o.memory, roof=set==='roof', door=set==='door';
    boilSeed('wall');paint(rectPts(40,40,1840,900,4),{fill:warm?'#D4B780':'#B8C5C2',fillOp:50,bleed:.22,ink:null,tex:1});
    shape('floor',[[40,838],[1880,838],[1880,1040],[40,1040]],warm?'#CEBC99':'#C2C4B8');
    mark('floorseam',[[50,839],[1860,839]],.55,'#A6AD9F');
    if(roof) {
      shape('roofsky',[[100,95],[1820,95],[1820,690],[100,690]],warm?'#7D8694':C.night,true);
      oval('moon',1430,220,49,49,'#E1D4AA',true);
      for(let i=0;i<13;i++) {const x=220+hash(i+20)*1420,y=145+hash(i+38)*300;mark('star'+i,[[x-3,y],[x+3,y]],.6,'#E9D7B1');}
      shape('hills',[[100,633],[290,575],[475,614],[710,560],[935,598],[1160,541],[1420,604],[1670,568],[1820,615],[1820,738],[100,738]],'#8C999A');
      box('roofrail',90,669,1740,24,'#BFB9A6',3);
      for(let i=0;i<9;i++)mark('railpost'+i,[[160+i*200,689],[160+i*200,846]],1.1,'#8C9790');
      if(o.lights!==false) {
        mark('lightcord',[[155,235],[560,337],[1000,359],[1440,306],[1790,205]],.7,C.ink);
        for(let i=0;i<9;i++){const x=200+i*182,y=245+108*Math.sin(i/8*Math.PI);oval('bulb'+i,x,y+14,9,14,o.unlit?'#A6A59D':'#E8C27E');}
      }
      if(o.fireworks){const k=o.fireworks;for(let i=0;i<9;i++){const a=i*TAU/9;mark('fire'+i,[[1450+Math.cos(a)*45*k,250+Math.sin(a)*45*k],[1450+Math.cos(a)*140*k,250+Math.sin(a)*140*k]],1.1,'#DEBE92');}}
    } else {
      shape('windowglass',[[210,168],[810,168],[810,590],[210,590]],'#91A5A6',true);
      shape('seaview',[[215,440],[400,426],[630,451],[806,433],[806,584],[215,584]],'#B0BFBB');
      oval('windowmoon',684,249,27,28,'#E3DBBD');
      mark('windowframe',[[207,165],[814,165],[814,593],[207,593],[207,165]],1.4,'#D4C9B0');
      mark('windowmullion',[[510,168],[510,591]],1.4,'#D4C9B0');
      shape('curtain',[[130,120],[235,135],[211,606],[117,641]],'#D9D2BD',true);
      box('picture',1012,222,165,144,'#C3B99E',3);
      shape('pictureart',[[1027,346],[1068,281],[1102,310],[1138,271],[1160,347]],'#99A99C');
      const open=o.doorOpen||0;
      box('doorway',1435,150,315,696,'#667B7E',3);
      const dw=295*(1-open*.88);
      box('doorpanel',1450,163,dw,676,'#ACB3A5',3);
      if(dw>50)oval('doorhandle',1450+dw-35,545,8,8,'#D5C39F');
      mark('doorframe',[[1422,844],[1422,135],[1768,135],[1768,844]],1.6,'#A39B84');
      oval('plantshadow',181,914,101,18,'#B1B9A7');
      box('plantpot',129,786,105,118,'#BAA68C',12);
      mark('stem',[[180,795],[177,658]],1.3,'#819681');
      shape('leaf1',[[180,744],[114,685],[109,647],[163,674],[180,744]],'#91A58B');
      shape('leaf2',[[179,711],[221,646],[252,638],[233,680],[179,711]],'#9AA98A');
    }
  }
  function frame(t,lt,dur,o={}) {
    const q=dur?clamp(lt/dur):0, set=o.set||'room';
    const cam=o.cam||[960,540,1];
    camBegin(cam[0]+Math.sin(t*.18)*2,cam[1]+Math.sin(t*.23)*1.2,cam[2],0);
    background(set,t,o);
    flushBrush();
    if(o.chairs!==false) {chair(645,849,o.leftChair||0);chair(1280,849,o.rightChair||0);}
    flushBrush();
    if(o.girl)actor('girl',t,o.girl,'body');
    if(o.boy)actor('boy',t,o.boy,'body');
    flushBrush();
    if(o.table!==false)table(o.table||{});
    flushBrush();
    if(o.girl)actor('girl',t,o.girl,'arms');
    if(o.boy)actor('boy',t,o.boy,'arms');
    for(const p of o.props||[])prop(p.kind,p.x,p.y,p.s??1,p);
    if(o.after)o.after(q);
    camEnd();
    // Keep chapter changes as deliberate match cuts; no automatic all-purpose dissolve.
    if(o.fade)flash(o.fade,C.paper);
  }
  function register(chapter,functions) {
    const rows=MV_DATA.shots.filter(s=>s.chapter===chapter);
    if(rows.length!==functions.length)throw new Error('Chapter '+chapter+' shot count mismatch');
    shots(rows.map((s,i)=>[s.t0,(t,lt)=>{const dur=s.t1-s.t0;functions[i](t,lt,dur,clamp(lt/dur),s);} ]));
  }
  LOOPS.cast = t=> {
    const poses=[{x:330,view:'front',emotion:'quiet'},{x:740,view:'q',emotion:'soft'},{x:1150,view:'side',emotion:'sad'},{x:1560,view:'back'}];
    poses.forEach((o,i)=>actor(t<4?'girl':'boy',t,{...o,y:900,s:1.1,facing:i===2?-1:1}));
  };
  LOOPS.cast.len=8;
  LOOPS.material=t=>{
    background('room',t,{});flushBrush();
    boilSeed('sample');paint(rectPts(400,300,350,400),{wash:C.skin,washOp:255,ink:C.ink});
    shape('testbox',rectPts(800,300,350,400),C.skin,true);
    paint(rectPts(1200,300,350,400),{wash:C.skin,washOp:255,fill:C.skin,fillOp:65,bleed:0,tex:0,border:0,ink:null});
  };LOOPS.material.len=1;
  return {C,shape,oval,box,mark,prop,actor,hand,held,background,frame,register,progress,motion,point};
})();
