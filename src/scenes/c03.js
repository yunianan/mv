// Chapter 3: the remembered answer, then the unreturned gesture.
// Every contact and action is derived from shot progress; no frame state.
(() => {
  const {frame,prop,held,hand,mark,oval,shape,box,C,progress:P,point:V,motion:M}=MV;
  const G=(o={})=>({x:760,y:960,facing:1,view:'q',emotion:'soft',
    l:[-65,-235],r:[145,-250],look:[.6,.15],...o});
  const B=(o={})=>({x:1160,y:960,facing:-1,view:'q',emotion:'soft',
    l:[-150,-250],r:[65,-226],look:[-.6,.2],...o});
  const roof={set:'roof',memory:true,leftChair:115,rightChair:-120};
  const present=()=>[
    {kind:'cup',x:820,y:713,s:.85,key:'owncup'},
    {kind:'cup',x:1100,y:713,s:.85,key:'secondcup'},
    {kind:'phone',x:819,y:710,s:.65,rot:1.45,lit:false,key:'message'},
    {kind:'coat',x:1300,y:850,s:.8,key:'waitingcoat'}
  ];
  function moonOnPaper(k) {
    if(k<=0)return;
    const pts=[];
    for(let i=0;i<=18;i++) {
      const a=-Math.PI/2+Math.PI*1.8*k*i/18;
      pts.push([985+Math.cos(a)*23,690+Math.sin(a)*19]);
    }
    mark('c3-overlarge-moon',pts,.75,C.blue);
  }
  // A cord with two separate ends, attached to the actual hands/ears.
  function listeningCord(a,b) {
    mark('c3-shared-song',[a,[a[0]+25,a[1]+85],[990,781],
      [b[0]-25,b[1]+88],b],.65,C.cream);
    oval('c3-earbud-g',a[0],a[1],5,8,C.cream);
    oval('c3-earbud-b',b[0],b[1],5,8,C.cream);
  }

  MV.register(3,[
    // S12 / 74–81. Her idea, his silly moon, her playful correction.
    (t,l,d,q)=>{
      const indicate=P(q,.07,.23),lower=P(q,.25,.4),draw=P(q,.3,.53);
      const take=P(q,.55,.68),correct=P(q,.71,.88),settle=P(q,.87,1);
      const gh=V(V([120,-255],[140,-420],indicate),[215,-260],lower);
      const g=G({r:V(gh,[225-30*correct,-260+8*Math.sin(correct*Math.PI)],take),
        headTilt:M(q,[[0,0],[.24,-.06],[.5,.025],[.72,-.045],[1,-.02]]),
        look:[.7,M(q,[[0,.25],[.22,-.7],[.42,.5],[.7,.1],[1,.45]])],
        smile:lerp(.3,1,P(q,.49,.68)),closed:q>.58&&q<.66,talk:q>.12&&q<.24});
      const b=B({l:V([-175,-257],[-95,-222],P(q,.66,.79)),
        r:V([62,-225],[78,-270],P(q,.61,.75)),
        headTilt:M(q,[[0,0],[.32,-.025],[.56,.045],[.8,-.02],[1,-.01]]),
        smile:lerp(.45,1,P(q,.48,.68)),look:[-.7,q<.6?.45:.05],
        closed:q>.73&&q<.8,talk:q>.33&&q<.45});
      frame(t,l,d,{...roof,cam:[960,590,1.15],girl:g,boy:b,
        props:[{kind:'plan',x:960,y:718,s:1.18,key:'roofplan'}],
        after:()=>{
          moonOnPaper(draw);
          held('pen',q<.665?b:g,q<.665?'l':'r',.65,{key:'sharedpen'});
          if(correct>0)mark('c3-her-correction',[[981,685],[981+28*correct,684-12*correct]],.7,C.pink);
          // His other hand opens after surrendering the pen; her shoulders settle.
          if(settle>.1)mark('c3-last-plan-stroke',[[956,705],[975,701],[995,705]],.4,C.blue);
        }});
    },
    // S13 / 81–88. A disagreement becomes a jointly drawn compromise.
    (t,l,d,q)=>{
      const offer=P(q,.22,.4),near=P(q,.43,.61),join=P(q,.64,.79);
      const bx=lerp(1160,1100,near),gx=760;
      const g=G({r:V([-40,-282],[195,-260],offer),
        l:V([50,-280],[-45,-237],P(q,.59,.73)),
        smile:M(q,[[0,-.1],[.2,-.15],[.44,.15],[.72,.8],[1,.8]]),
        look:[.65,M(q,[[0,0],[.2,.2],[.4,.6],[.68,.45],[1,.1]])],
        headTilt:M(q,[[0,-.045],[.23,-.04],[.45,.02],[.8,-.025],[1,-.025]]),
        talk:q>.04&&q<.16});
      const b=B({x:bx,l:V([45,-282],[985-bx,-258],join),
        r:V([-45,-276],[65,-223],near),
        look:[-.65,q<.4?-.1:.45],headTilt:lerp(.045,-.02,join),
        smile:lerp(-.1,.75,P(q,.49,.73)),talk:q>.13&&q<.23});
      frame(t,l,d,{...roof,rightChair:-120-60*near,cam:[960,600,1.18],girl:g,boy:b,
        props:[{kind:'plan',x:960,y:718,s:1.18,key:'roofplan'}],after:()=>{
          moonOnPaper(1);
          if(q<.43)held('pen',g,'r',.65,{key:'sharedpen'});
          else if(q<.76)prop('pen',lerp(955,985,P(q,.64,.76)),700,.65,{key:'sharedpen'});
          else held('pen',b,'l',.65,{key:'sharedpen'});
          if(join>0)mark('c3-compromise',[[913,681],[948,690],[979,689],[979+30*join,681]],.65,C.pink);
        }});
    },
    // S14 / 88–95. Set the cake down, make a wish, share an earphone, blow.
    (t,l,d,q)=>{
      const cake=P(q,.03,.18),offer=P(q,.37,.48),ears=P(q,.49,.63);
      const blow=P(q,.68,.76),closer=P(q,.81,.94);
      const gx=lerp(760,794,closer),bx=lerp(1160,1126,closer);
      const cx=lerp(1040,960,cake),cy=lerp(683,713,cake);
      const receive=V([150,-255],[210,-308],offer);
      const gh=V(receive,[65,-412],ears);
      const bh=V(V([cx-70-bx,cy-960],[-160,-309],offer),[-65,-412],ears);
      const g=G({x:gx,r:gh,l:[-58,-252],
        closed:(q>.22&&q<.31)||(q>.69&&q<.76),
        look:[q>.89?.5:.45,q>.92?-.75:.2],
        headTilt:M(q,[[0,-.015],[.25,.035],[.34,-.04],[.63,-.025],[.75,-.065],[.94,-.035],[1,-.035]]),
        smile:M(q,[[0,.65],[.34,.9],[.7,0],[.82,1],[1,1]]),talk:q>.69&&q<.76});
      const b=B({x:bx,l:bh,r:V([cx+70-bx,cy-960],[70,-230],P(q,.18,.27)),
        headTilt:M(q,[[0,-.02],[.3,.025],[.57,.01],[.76,.035],[.93,-.035],[1,-.035]]),
        look:[-.7,q>.92?-.75:.15],smile:lerp(.6,1,P(q,.77,.86)),
        closed:q>.8&&q<.88});
      frame(t,l,d,{...roof,cam:[960,587,1.17],girl:g,boy:b,
        props:[{kind:'cake',x:cx,y:cy,s:.83,key:'birthdaycake',flame:q<.76}],
        after:()=>{
          if(q>.35)listeningCord(hand(g,'r'),hand(b,'l'));
          if(blow>0&&blow<1)mark('c3-candle-breath',[[gx+92,606],[900,614],[944,609]],.45,C.cream);
        }});
    },
    // S15 / 95–100. He offers; she closes the gap and returns the embrace.
    (t,l,d,q)=>{
      const offer=P(q,.07,.25),accept=P(q,.28,.43),approach=P(q,.47,.72);
      const embrace=P(q,.73,.88),settle=P(q,.88,1);
      const g=G({x:lerp(815,929,approach),y:lerp(970,1060,approach),s:.92,
        view:'side',r:V([105,-250],[175,-272],accept),
        l:V([-60,-232],[82,-295],embrace),
        lean:lerp(0,.12,approach),headTilt:lerp(-.03,.07,approach),
        look:[.8,lerp(-.65,.35,accept)],closed:q>.73,
        smile:lerp(.65,1,embrace)});
      const b=B({x:1095,y:950,view:'side',
        l:V([-75,-225],[-190,-238],offer),
        r:V([70,-226],[-65,-265],embrace),
        headTilt:lerp(-.02,-.09,approach),look:[-.8,lerp(-.5,.7,approach)],
        smile:lerp(.65,.95,embrace),closed:q>.89});
      // Until she steps closer, both hands share one exact meeting point.
      const joined=V(hand(b,'l'),[1040,775],approach);
      if(q>.27) {
        const inv=(o,p)=>{
          const dx=(p[0]-o.x)/(o.s??1),dy=(p[1]-o.y)/(o.s??1),a=o.lean||0;
          return [dx*Math.cos(a)+dy*Math.sin(a),-dx*Math.sin(a)+dy*Math.cos(a)];
        };
        g.r=V(g.r,inv(g,joined),accept);
        b.l=V(b.l,inv(b,joined),accept);
      }
      frame(t,l,d,{set:'roof',memory:true,table:false,chairs:false,
        cam:[1000,620,1.24],girl:g,boy:b,after:()=>{
          if(settle>.05)mark('c3-resting-fingers',[[1037,770],[1044,777],[1051,775]],.4,C.skin);
        }});
    },
    // S16 / 100–109. Match her sleeve contact to the present cup handle.
    (t,l,d,q)=>{
      const release=P(q,.08,.2),reach=P(q,.27,.47),withdraw=P(q,.55,.7);
      const cx=M(q,[[0,850],[.24,850],[.47,925],[.54,925],[.7,845],[1,845]]);
      const candleHand=[cx-680,-249];
      const g=G({x:680,r:V([180,-252],candleHand,release),
        l:[-55,-227],emotion:'sad',smile:lerp(.25,-.55,withdraw),
        look:[M(q,[[0,.3],[.28,.45],[.46,.85],[.62,.8],[.75,.2],[1,.2]]),
          M(q,[[0,.5],[.4,.35],[.55,.1],[.74,.8],[1,.8]])],
        headTilt:lerp(-.025,.04,withdraw)});
      const b=B({x:1260,emotion:'quiet',
        l:V([-130,-231],[-92,-211],P(q,.65,.8)),r:[65,-220],
        headTilt:M(q,[[0,.035],[.62,.035],[.78,-.025],[1,-.025]]),
        look:[lerp(-.15,-.7,P(q,.66,.8)),lerp(.65,.1,P(q,.66,.8))],smile:0});
      frame(t,l,d,{cam:[819,545,1.18],girl:g,boy:b,
        props:[...present(),{kind:'plan',x:960,y:718,s:.8,key:'oldplan',folded:true},
          {kind:'candle',x:cx,y:713,s:.9,key:'oldcandle',flame:false}],
        after:()=>{}});
    },
    // S17 / 109–116. She puts the mementos away. He lifts the open bag.
    (t,l,d,q)=>{
      const collect=P(q,.07,.23),lower=P(q,.25,.43),close=P(q,.44,.53);
      const lift=P(q,.56,.78),notice=P(q,.81,.94);
      const gx=lerp(680,850,P(q,.55,.78)),bx=lerp(1260,1190,lift);
      const cx=lerp(845,925,collect),cy=lerp(713,801,lower);
      const bagx=lerp(1325,1060,lift),bagy=lerp(952,865,lift),bs=.86;
      const g=G({x:gx,r:V([cx-gx,cy-960],[45,-235],close),
        l:[-60,-225],emotion:'sad',smile:-.4,
        look:[lerp(.2,.75,notice),lerp(.8,.35,notice)],headTilt:lerp(.045,-.015,notice)});
      const b=B({x:bx,l:[bagx-bx-25,bagy-145*bs-960],
        r:[bagx-bx+25,bagy-145*bs-960],emotion:'quiet',
        look:[-.45,.8],headTilt:lerp(.015,-.035,lift),smile:0});
      frame(t,l,d,{cam:[990,600,1.08],girl:g,boy:b,
        props:[...present(),{kind:'bag',x:bagx,y:bagy,s:bs,key:'departurebag',open:true}],
        after:()=>{
          if(q<.53) {
            const dy=lerp(45,20,close);
            box('c3-drawer-open',815,767,290,dy+31,C.wood,3);
            prop('plan',lerp(960,933,collect),lerp(718,797,lower),.8,{key:'oldplan',folded:true});
            prop('candle',cx,cy,.9,{key:'oldcandle',flame:false});
            // The front lip occludes the saved objects as her hand releases them.
            box('c3-drawer-lip',815,lerp(800,775,close),290,24,'#B6A082',3);
          }
        }});
    }
  ]);
})();
