(() => {
  const {frame,prop,hand,shape,oval,box,mark,progress:P,motion:M,point:V,C}=MV;
  const G=(o={})=>({x:800,y:960,facing:1,view:'q',emotion:'worried',
    l:[-35,-220],r:[85,-249],look:[.6,.3],...o});
  const B=(o={})=>({x:1260,y:960,facing:-1,view:'q',emotion:'quiet',
    l:[-150,-245],r:[70,-220],look:[-.5,.5],...o});
  const roomProps=()=>[
    {kind:'cup',x:820,y:713,s:.85,key:'owncup'},
    {kind:'cup',x:1100,y:713,s:.85,key:'secondcup'},
    {kind:'phone',x:805,y:710,s:.65,rot:1.45,lit:false,key:'message'},
    {kind:'coat',x:1300,y:850,s:.8,key:'waitingcoat'}
  ];

  // A flat, hand-painted fold. Width changes describe a drawn paper fold,
  // never a projected plane. The little people make his recognition legible.
  function plan(x,y,fold=0) {
    const w=86-40*fold, h=44-6*fold;
    shape('c02-plan',[[x-w,y-h],[x+w-4,y-h-4],[x+w+5,y+h-4],[x-w+3,y+h]],C.cream,true);
    mark('c02-fold',[[x+3,y-h+4],[x-1,y+h-4]],.48,'#BCA98E');
    mark('c02-roof',[[x-w*.78,y+9],[x,y-18],[x+w*.78,y+9]],.55,C.blue);
    mark('c02-rail',[[x-w*.7,y+20],[x+w*.7,y+20]],.45,C.blue);
    const room=1-.65*fold;
    mark('c02-lights',[[x-w*.75,y-29],[x,y-17],[x+w*.72,y-30]],.5,C.pink);
    for(let i=0;i<5;i++)oval('c02-bulb'+i,x-w*.64+i*w*.31,y-22+Math.sin(i*.8)*5,2.6,4,C.warm);
    [-1,1].forEach((dir,i)=>{
      const px=x+dir*22*room;
      oval('c02-personhead'+i,px,y+1,4,5,i?C.blue:C.pink);
      mark('c02-personbody'+i,[[px,y+7],[px+dir*2,y+18],[px-5,y+25],[px+dir*2,y+18],[px+7,y+25]],.6,i?C.blue:C.pink);
      mark('c02-personarm'+i,[[px-8,y+12],[px,y+10],[px+8,y+13]],.55,i?C.blue:C.pink);
    });
    if(fold>.01)mark('c02-foldedge',[[x+w-11,y-h+2],[x+w-8,y+h-6]],.4,'#BCA98E');
  }
  function drawer(open) {
    if(open<=.001)return;
    const dy=open*48;
    box('c02-drawershadow',816,784,288,dy+12,'#807A6C',3);
    shape('c02-drawerinside',[[820,786],[1100,786],[1107,798+dy],[813,798+dy]],'#A69279');
    box('c02-drawerfront',810,794+dy,300,34,'#BEAA8C',3);
    mark('c02-drawerhandle',[[945,810+dy],[975,810+dy]],1.2,'#827A69');
  }
  function fingers(key,p,tight=0) {
    // Small pigment strokes keep the grip visible above the paper edge.
    mark(key,[[p[0]-8,p[1]+3],[p[0]+3,p[1]+5],[p[0]+9,p[1]+1]],.65,tight>.2?'#F1D9C1':'#BB907B');
  }

  MV.register(2,[
    // S08 — she substitutes a shared plan for the unanswered question.
    (t,lt,dur,q)=>{
      const reach=P(q,.03,.16), open=P(q,.17,.30), lift=P(q,.32,.49),
        offer=P(q,.56,.77), unfold=P(q,.63,.82), close=P(q,.49,.62);
      const gx=800, px=lerp(960,967,offer),
        py=lerp(814+open*15,716,lift), fold=lerp(1,.10,unfold);
      const rh=V([819,710],[960,810+open*48],reach);
      const carry=V([960,810+open*48],[px-(86-40*fold),py],lift);
      const r=q<.30?rh:carry;
      const g=G({x:gx,r:[r[0]-gx,r[1]-960],
        l:V([-60,-224],[-35,-220],P(q,.57,.74)),
        look:V([.1,.8],[.85,-.1],P(q,.73,.89)),
        headTilt:M(q,[[0,.05],[.28,.075],[.62,.025],[.88,-.025],[1,-.025]]),
        smile:.24*P(q,.76,.91)});
      const boy=B({look:V([-.2,.65],[-.65,.6],P(q,.69,.86)),
        headTilt:-.025*P(q,.77,.93)});
      frame(t,lt,dur,{set:'room',cam:[985,620,1.23],girl:g,boy,props:roomProps(),after:()=>{
        drawer(open*(1-close));
        if(q>=.30) {plan(px,py,fold);fingers('c02-retrievegrip',hand(g,'r'));}
        else if(open>.05){const h=hand(g,'r');oval('c02-drawerhand',h[0],h[1]+5,14,18,C.skin);}
      }});
    },

    // S09 — recognition arrives first; his gaze then chooses the coat.
    (t,lt,dur,q)=>{
      const recognize=P(q,.09,.27), evade=P(q,.43,.62),
        herSmile=P(q,.30,.45), herFall=P(q,.66,.84);
      const boy=B({smile:.48*recognize*(1-evade),
        look:V([-.65,.6],[.7,.75],evade),
        headTilt:M(q,[[0,-.025],[.26,.012],[.45,.012],[.64,-.065],[1,-.065]]),
        r:V([70,-220],[55,-175],P(q,.56,.74))});
      const g=G({r:[85,-244],l:[-35,-220],
        smile:.42*herSmile*(1-herFall),look:V([.85,-.1],[.05,.9],herFall),
        headTilt:lerp(-.025,.065,herFall)});
      frame(t,lt,dur,{set:'room',cam:[1003,588,1.34],girl:g,boy,props:roomProps(),after:()=>{
        plan(967,716,.10);fingers('c02-offergrip',hand(g,'r'));
      }});
    },

    // S10 — the paper first travels toward him, then turns back to her.
    (t,lt,dur,q)=>{
      const retract=P(q,.30,.57),
        fold=P(q,.53,.70), press=P(q,.70,.80), release=P(q,.84,.97);
      const px=M(q,[[0,967],[.18,982],[.30,982],[.59,925],[1,925]]),
        py=M(q,[[0,716],[.52,716],[.72,738],[1,742]]), fw=lerp(.10,1,fold);
      const rightX=M(q,[[0,885],[.18,901],[.53,957],[.72,950],[.82,950],[1,940]]),
        rightY=py-6-5*press+4*release;
      const g=G({r:[rightX-800,rightY-960],
        l:V([-35,-220],[79,-218],P(q,.43,.65)),
        look:[.05,.9],headTilt:.065+.025*retract,
        smile:lerp(0,-.25,P(q,.15,.37))});
      const boy=B({look:V([.7,.75],[-.35,.8],P(q,.63,.82)),
        l:V([-150,-245],[-110,-227],P(q,.35,.60))});
      frame(t,lt,dur,{set:'room',cam:[900,638,1.39],girl:g,boy,props:roomProps(),after:()=>{
        drawer(.48*P(q,.79,.93));
        plan(px,py,fw);
        fingers('c02-pressedknuckle',hand(g,'r'),press*(1-release));
        fingers('c02-leftpapergrip',hand(g,'l'));
        if(press*(1-release)>.15) {
          const h=hand(g,'r');mark('c02-knuckletension',[[h[0]-5,h[1]-5],[h[0]+3,h[1]-5]],1.1,'#F2DDC7');
        }
      }});
    },

    // S11 — a small rolling candle offers a memory when he offers no answer.
    (t,lt,dur,q)=>{
      const roll=P(q,.06,.21), lower=P(q,.50,.62), place=P(q,.66,.84);
      const catchX=lerp(923,891,roll), catchY=lerp(735,751,roll),
        hx=M(q,[[0,940],[.12,925],[.25,891],[.65,891],[.84,960],[1,920]]),
        hy=M(q,[[0,746],[.12,746],[.25,751],[.65,751],[.84,711],[1,725]]);
      const g=G({r:[hx-800,hy-960],l:[79,-218],
        look:M(q,[[0,[.05,.9]],[.30,[.05,.9]],[.46,[.85,-.1]],
          [.55,[.85,-.1]],[.69,[.15,.85]],[1,[.15,.85]]]),
        headTilt:M(q,[[0,.09],[.27,.11],[.46,-.025],[.59,-.025],[.75,.06],[1,.06]]),
        smile:lerp(-.25,-.05,place)});
      const boy=B({look:V([-.35,.8],[-.05,1],lower),
        headTilt:lerp(-.065,-.11,lower),
        l:V([-110,-227],[-95,-216],P(q,.54,.71))});
      frame(t,lt,dur,{set:'room',cam:[895,619,1.38],girl:g,boy,props:roomProps(),after:()=>{
        drawer(.48*(1-P(q,.26,.39)));
        plan(925,742,1-P(q,.67,.84)*.46);
        if(q<.25) {
          prop('candle',catchX,catchY,.90,{key:'oldbirthdaycandle',rot:lerp(1.3,1.55,roll)});
        } else if(q<.84) {
          // Candle bottom follows exactly the world hand position through the lift.
          const h=hand(g,'r');prop('candle',h[0],h[1],.90,{key:'oldbirthdaycandle',rot:lerp(1.55,0,place)});
        } else {
          prop('candle',960,711,.90,{key:'oldbirthdaycandle',rot:0});
        }
        fingers('c02-candlegrip',hand(g,'r'));
      }});
    }
  ]);
})();
