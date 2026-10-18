(() => {
  const {frame,prop,held,hand,shape,box,mark,progress:P,motion:K,point:V,C}=MV;
  const G=(o={})=>({x:900,y:960,facing:1,view:'q',emotion:'worried',
    l:[-70,-245],r:[110,-225],look:[.45,.55],...o});
  const B=(o={})=>({x:1190,y:960,facing:-1,view:'q',emotion:'quiet',
    l:[-120,-222],r:[65,-225],look:[-.35,.7],...o});
  const cups=(own=true)=>[
    ...(own?[{kind:'cup',x:820,y:713,s:.85,key:'owncup'}]:[]),
    {kind:'cup',x:1100,y:713,s:.85,key:'secondcup'},
    {kind:'coat',x:1300,y:850,s:.8,key:'chaircoat'},
    {kind:'phone',x:819,y:710,s:.65,rot:1.45,lit:false,key:'message'}
  ];
  const bagBase=[1055,892], zipLeft=[1005,783], zipRight=[1110,783];
  function bag(at,cloth=0,zip=1,s=1) {
    prop('bag',at[0],at[1],s,{key:'departingbag'});
    const atPoint=p=>[at[0]+(p[0]-bagBase[0])*s,at[1]+(p[1]-bagBase[1])*s];
    // The caught blue sleeve is painted separately, so it is visibly tucked in.
    if(cloth>.002) shape('caughtsleeve',[
      [1024,779],[1020,779-39*cloth],
      [1041,776-47*cloth],[1060,779-19*cloth],
      [1064,785]
    ].map(atPoint),C.boy,true);
    const zx=lerp(zipLeft[0],zipRight[0],zip),zy=783;
    mark('closedzip',[[1001,zy],[zx,zy]].map(atPoint),.9*s,C.cream);
    mark('ziptab',[[zx,zy],[zx+4,zy+18],[zx-4,zy+24],[zx-8,zy+5],[zx,zy]].map(atPoint),.85*s,C.ink);
  }
  function zipGrip(girl) {
    const p=hand(girl,'r');
    // Two separate fingertips leave the lower pull ring visible beneath the pinch.
    MV.oval('zipfinger',p[0]-8,p[1]+1,7,10,C.skin);
    MV.oval('zipthumb',p[0]+5,p[1]-1,4.5,8,C.skin);
  }
  function drawer(corner=true) {
    box('chapter4drawerinside',815,774,290,39,'#8E8A7D',3);
    if(corner) {
      shape('planleftindrawer',[[921,778],[1001,770],[1034,792],[926,800]],C.cream,true);
      // This bowed line is the deliberate match to the roof light cord at 144.
      mark('planlightcorner',[[935,777],[969,784],[1000,776]],.65,C.pink);
    }
    box('chapter4drawerfront',807,795,307,43,'#B6A082',3);
    mark('chapter4drawerknob',[[948,816],[976,816]],1.2,'#8B806F');
  }
  MV.register(4,[
    // S18: catch -> one failed tug -> she notices -> tuck -> he yields -> zip.
    (t,l,d,q)=>{
      const notice=P(q,.14,.25),tuck=P(q,.29,.44),yieldHand=P(q,.39,.52);
      const close=P(q,.59,.79),settle=P(q,0,.2);
      const bagAt=V([1060,865],bagBase,settle),bagScale=lerp(.86,1,settle);
      const tug=K(q,[[0,0],[.1,11],[.15,0],[.25,11],[1,11]]);
      const boyZip=[bagAt[0]+(-50+tug)*bagScale-1190,bagAt[1]-109*bagScale-960];
      const girl=G({x:lerp(850,900,settle),
        r:K(q,[[0,[105,-225]],[.22,[105,-225]],[.32,[142,-202]],
          [.44,[142,-177]],[.55,[105,-177]],[.59,[105,-177]],[.79,[210,-177]],[1,[210,-177]]]),
        l:V([-70,-245],[-34,-240],notice),
        headTilt:K(q,[[0,.035],[.25,.055],[.57,.025],[.83,.01],[1,.01]]),
        look:[.65,lerp(.8,.55,close)],smile:0
      });
      const boy=B({
        l:V(boyZip,[-45,-265],yieldHand),
        r:[-82,-110],headTilt:lerp(-.025,.025,yieldHand),
        look:V([-.35,.9],[-.85,.4],P(q,.46,.61)),
        smile:lerp(0,-.15,P(q,.78,.92))
      });
      frame(t,l,d,{cam:[1035,651,1.24],girl,boy,props:cups(),after:()=>{
        bag(bagAt,1-tuck,close,bagScale);
        if(q>.57) zipGrip(girl);
      }});
    },
    // S19 opens on exactly the stopped hand from S18; meaning gets a long hold.
    (t,l,d,q)=>{
      const release=P(q,.67,.84),eyeUp=P(q,.26,.42);
      const girl=G({
        r:V([210,-177],[68,-226],release),
        l:[-34,-240],headTilt:K(q,[[0,.01],[.25,.01],[.42,-.025],[.62,-.025],[.88,.045],[1,.045]]),
        look:V([.65,.55],[.95,-.03],eyeUp*(1-P(q,.72,.94))),
        smile:K(q,[[0,0],[.39,0],[.49,.42],[.61,.42],[.83,-.18],[1,-.18]]),
        emotion:'hurt',wet:true
      });
      const boy=B({l:[-45,-265],r:[-82,-110],
        look:V([-.85,.4],[-.3,.85],P(q,.49,.69)),
        headTilt:lerp(.025,-.025,P(q,.52,.75)),smile:-.15});
      frame(t,l,d,{cam:[1000,625,2.08],girl,boy,props:cups(),after:()=>{
        bag(bagBase,0,1);
        if(q<.84) zipGrip(girl);
      }});
    },
    // S20: the offered drawing reverses before he can accept; his bag goes down later.
    (t,l,d,q)=>{
      const shift=P(q,.66,.88),gX=lerp(900,860,shift);
      const paper=K(q,[[0,[952,714]],[.13,[952,714]],[.31,[1040,703]],
        [.42,[1040,703]],[.59,[961,728]],[.67,[961,728]],[.86,[961,816]],[1,[961,816]]]);
      const bagAt=V(bagBase,[1310,925],P(q,.53,.85));
      const girl=G({x:gX,
        r:[paper[0]-gX,paper[1]-960],
        l:K(q,[[0,[-34,-240]],[.4,[-34,-240]],[.59,[30,-228]],[.86,[88,-168]],[1,[88,-168]]]),
        look:K(q,[[0,[.5,.7]],[.25,[.95,.1]],[.42,[.95,.1]],[.61,[.1,.85]],[1,[.1,.85]]]),
        headTilt:K(q,[[0,.045],[.3,-.012],[.43,-.012],[.64,.055],[1,.055]]),
        emotion:'sad',smile:K(q,[[0,-.18],[.29,.15],[.47,.15],[.68,-.35],[1,-.35]]),
        walk:shift>0&&shift<1?shift*.65:0
      });
      const boy=B({
        l:V([-45,-265],[-85,-225],P(q,.47,.63)),
        r:V([-82,-110],[bagAt[0]-1190,bagAt[1]-960-162],P(q,.44,.53)),
        headTilt:K(q,[[0,-.025],[.3,-.01],[.44,-.01],[.7,-.055],[1,-.055]]),
        look:K(q,[[0,[-.3,.85]],[.28,[-.85,.55]],[.43,[-.85,.55]],[.63,[.35,.9]],[1,[.35,.9]]])
      });
      frame(t,l,d,{cam:[1040,648,1.13],girl,boy,props:cups(),after:()=>{
        bag(bagAt,0,1);
        // A partly open drawer receives the paper; its lip occludes the sinking sheet.
        if(q<.67) prop('plan',paper[0],paper[1],.8,{key:'sharedplan',folded:q>.51,rot:lerp(-.05,0,P(q,.47,.64))});
        else {
          box('chapter4drawerinside',815,774,290,50,'#8E8A7D',3);
          prop('plan',paper[0],paper[1],.8,{key:'sharedplan',folded:true});
          drawer(q>.85);
        }
      }});
    },
    // S21: cup at lips, no sip or tilt; the tremor precedes the look at the paper.
    (t,l,d,q)=>{
      const up=P(q,.12,.32),down=P(q,.68,.87);
      const tremor=(P(q,.33,.4)-P(q,.59,.68))*Math.sin(q*95)*1.8;
      const cup=V(V([820,713],[863,626],up),[820,713],down);
      cup[0]+=tremor;cup[1]+=tremor*.48;
      const girl=G({x:860,l:[cup[0]-860,cup[1]-960],r:[88,-168],
        look:K(q,[[0,[.1,.85]],[.2,[.4,.4]],[.33,[.4,.4]],[.62,[.35,.55]],[.86,[.65,.9]],[1,[.65,.9]]]),
        headTilt:K(q,[[0,.055],[.29,.015],[.61,.015],[.87,.065],[1,.065]]),
        emotion:'hurt',wet:true,smile:K(q,[[0,-.35],[.26,-.12],[.6,-.12],[.84,-.45],[1,-.45]])
      });
      const boy=B({l:[-85,-225],r:[120,-197],
        look:K(q,[[0,[.35,.9]],[.24,[-.9,.15]],[.52,[-.9,.15]],[.76,[.1,.8]],[1,[.1,.8]]]),
        headTilt:lerp(-.055,-.015,P(q,.23,.45)),smile:-.15});
      frame(t,l,d,{cam:[887,623,1.5],girl,boy,props:cups(false),after:()=>{
        bag([1310,925],0,1);drawer(true);
        // Held at the bottom origin; the rim meets the mouth at full lift.
        held('cup',girl,'l',.85,{key:'owncup'});
      }});
    }
  ]);
})();
