(() => {
  const {frame,prop,held,hand,shape,box,mark,progress:P,motion:K,point:V,C}=MV;
  const G=(o={})=>({x:1230,y:950,facing:1,view:'q',emotion:'sad',
    look:[.8,.15],l:[-65,-207],r:[70,-230],...o});
  const B=(o={})=>({x:1490,y:950,facing:-1,view:'q',emotion:'quiet',
    look:[-.5,.3],l:[-67,-210],r:[61,-195],bag:true,...o});
  const packet=(g,open=0,tip=true)=>{
    held('plan',g,'l',lerp(.4,.76,open),{folded:open<.4,key:'finalplan'});
    if(tip) {
      const p=hand(g,'l');
      prop('candle',p[0]+3,p[1]-10,.7,{key:'savedcandle'});
      // The lower candle is enclosed by a folded paper flap, leaving its old wick visible.
      shape('packetfold',[[p[0]-19,p[1]-18],[p[0]+22,p[1]-12],
        [p[0]+26,p[1]+13],[p[0]-21,p[1]+15]],C.cream,true);
      mark('packetcrease',[[p[0]-18,p[1]-17],[p[0]+3,p[1]+1],[p[0]+22,p[1]-12]],.35,C.wood);
    }
  };
  function travelCoat(b,k=1,at=null,coat=true) {
    const p=at||[b.x-85,b.y-55];
    if(k>.01) {
      mark('departurestrap',[[b.x-46,b.y-305],[b.x-72,b.y-245],[p[0],p[1]-117]],2.1,'#837F72');
      if(coat) prop('coat',p[0]+6,p[1]-40,.67,{key:'coatonstrap',rot:.06});
    }
  }
  const doorScene=(t,l,d,o)=>frame(t,l,d,{set:'door',table:false,chairs:false,...o});
  MV.register(7,[
    // S31: first he packs the last object, then she retrieves the memory, then follows.
    (t,l,d,q)=>{
      const lift=P(q,.03,.24),bw=P(q,.32,.74),gw=P(q,.58,.94);
      const boy=B({x:lerp(1260,1490,bw),y:lerp(960,950,bw),bag:q>=.25,
        walk:bw>0&&bw<1?bw*1.9:0,
        l:K(q,[[0,[46,-198]],[.15,[-70,-242]],[.28,[-67,-210]],[1,[-67,-210]]]),
        r:K(q,[[0,[70,-223]],[.24,[-36,-295]],[.34,[61,-195]],[1,[61,-195]]]),
        look:K(q,[[0,[.2,.8]],[.29,[.7,.1]],[.72,[.7,.1]],[.86,[-.45,.3]],[1,[-.45,.3]]])
      });
      const girl=G({x:lerp(860,1150,gw),y:lerp(960,950,gw),
        l:K(q,[[0,[75,-160]],[.2,[100,-160]],[.32,[100,-160]],
          [.45,[-25,-218]],[.58,[-65,-207]],[1,[-65,-207]]]),
        r:K(q,[[0,[88,-168]],[.2,[103,-146]],[.43,[16,-215]],[.55,[70,-230]],[1,[70,-230]]]),
        walk:gw>0&&gw<1?gw*1.9:0,
        look:K(q,[[0,[.8,.3]],[.24,[.5,.9]],[.49,[.5,.9]],[.65,[.9,.1]],[1,[.9,.1]]]),
        headTilt:K(q,[[0,.04],[.28,.06],[.52,.06],[.75,-.02],[1,-.02]])
      });
      const carry=V([1310,925],[boy.x-85,boy.y-55],lift);
      boy.l=V([carry[0]-boy.x,carry[1]-boy.y-166*lerp(1,.8,lift)],[-67,-210],P(q,.24,.33));
      const drawerOpen=P(q,.18,.28)*(1-P(q,.47,.56));
      frame(t,l,d,{cam:[1125,565,1.02],girl,boy,props:[
        {kind:'cup',x:820,y:713,s:.85,key:'owncup'},
        {kind:'cup',x:1100,y:713,s:.85,key:'secondcup'}
      ],after:()=>{
        if(q<.25) prop('bag',carry[0],carry[1],lerp(1,.8,lift),{key:'boybag'});
        travelCoat(boy,lift,carry,q>=.25);
        if(q<.25) {
          const cp=V([1300,850],[carry[0]+6,carry[1]-40],lift);
          prop('coat',cp[0],cp[1],lerp(.8,.67,lift),{key:'coatonstrap',rot:.06*lift});
        }
        if(drawerOpen>.001) {
          box('retrievaldrawerinside',815,779,290,35*drawerOpen,'#8E8A7D',3);
          if(q<.32) {
            prop('plan',960,797,.4,{folded:true,key:'finalplan'});
            prop('candle',963,787,.7,{key:'savedcandle'});
          }
          box('retrievaldrawerfront',807,795+26*drawerOpen,307,31,'#B6A082',3);
          mark('retrievaldrawerknob',[[948,811+26*drawerOpen],[976,811+26*drawerOpen]],1.1,C.wood);
        }
        if(q>=.32) packet(girl,0,true);
      }});
    },
    // S32: the opening paper is an invitation; the visible bag makes her fold it inward.
    (t,l,d,q)=>{
      const opened=P(q,.12,.31)*(1-P(q,.52,.72));
      const girl=G({x:1150,
        l:K(q,[[0,[-65,-207]],[.29,[-35,-267]],[.45,[-35,-267]],[.75,[-28,-285]],[1,[-28,-285]]]),
        r:K(q,[[0,[70,-230]],[.27,[25,-270]],[.46,[25,-270]],[.75,[20,-270]],[1,[20,-270]]]),
        look:K(q,[[0,[.9,.1]],[.26,[.9,.1]],[.43,[.95,.85]],[.57,[.95,.85]],[.79,[.1,.6]],[1,[.1,.6]]]),
        headTilt:K(q,[[0,-.02],[.3,-.025],[.52,.02],[.78,.05],[1,.05]]),
        smile:K(q,[[0,-.1],[.28,.2],[.44,.2],[.7,-.45],[1,-.45]])
      });
      const boy=B({look:V([-.45,.3],[.7,.15],P(q,.54,.76)),
        headTilt:lerp(-.015,.015,P(q,.57,.81))});
      doorScene(t,l,d,{girl,boy,cam:[1300,565,1.33],after:()=>{
        travelCoat(boy);packet(girl,opened,true);
      }});
    },
    // S33: reaching the handle is interrupted by her footstep; nobody leaves.
    (t,l,d,q)=>{
      const step=P(q,.28,.51),reach=P(q,.07,.27),listen=P(q,.48,.65);
      const girl=G({x:lerp(1150,1230,step),l:[-28,-285],r:[20,-270],
        walk:step>0&&step<1?step*.65:0,
        headTilt:lerp(.05,-.02,P(q,.38,.58)),
        look:V([.1,.6],[.95,.05],P(q,.18,.39)),smile:-.45});
      const boy=B({view:q>.18&&q<.66?'back':'q',
        r:V([61,-195],[220,-405],reach),
        look:V([.7,.15],[-.9,.05],listen),
        headTilt:K(q,[[0,.015],[.45,.015],[.57,-.03],[.78,-.015],[1,-.015]])});
      doorScene(t,l,d,{girl,boy,cam:[1350,553,1.27],after:()=>{
        travelCoat(boy);packet(girl,0,true);
      }});
    },
    // S34: she lowers the question, reaches the actual collar, then their eyes meet.
    (t,l,d,q)=>{
      const lower=P(q,.19,.39),tidy=P(q,.56,.72),meet=P(q,.73,.84);
      const girl=G({
        l:V([-28,-285],[-65,-207],lower),
        r:K(q,[[0,[20,-270]],[.35,[59,-240]],[.46,[59,-240]],
          [.58,[224,-320]],[.7,[247,-313]],[.8,[247,-313]],[1,[247,-313]]]),
        headTilt:K(q,[[0,-.02],[.17,-.045],[.4,.025],[.61,-.025],[1,-.025]]),
        look:K(q,[[0,[.95,.05]],[.23,[.95,.05]],[.42,[.65,.6]],[.58,[.9,.35]],[.82,[.95,-.08]],[1,[.95,-.08]]]),
        talk:q>.15&&q<.22,smile:K(q,[[0,-.45],[.23,-.12],[.43,-.35],[.78,.08],[1,.08]]),wet:true
      });
      const boy=B({
        r:V([220,-405],[61,-195],P(q,.15,.37)),
        look:V([-.9,.05],[-.95,-.04],meet),
        headTilt:K(q,[[0,-.015],[.3,-.055],[.52,-.025],[.82,0],[1,0]]),
        smile:lerp(-.15,.05,meet)
      });
      doorScene(t,l,d,{girl,boy,cam:[1360,558,1.42],after:()=>{
        travelCoat(boy);packet(girl,0,true);
        const cy=boy.y-320;
        // An uplifted cloth corner flattens under her hand, visibly on his shirt.
        shape('raisedcollar',[[boy.x-38,cy],[boy.x-29,cy-18*(1-tidy)],
          [boy.x-7,cy+16],[boy.x,cy+17]],C.boy,true);
        mark('collaredge',[[boy.x-37,cy],[boy.x-15,cy+lerp(-11,13,tidy)],[boy.x,cy+17]],.7,'#556F7A');
        if(q>.55) {
          const h=hand(girl,'r');MV.oval('collartouch',h[0],h[1]+4,11,14,C.skin);
        }
      }});
    },
    // S35 continues the collar hand, then holds it in the unfinished space between them.
    (t,l,d,q)=>{
      const retreat=P(q,.08,.36),crack=P(q,.48,.73),release=P(q,.8,.95);
      const open=.18*crack;
      const handle=[1710-295*.88*open,545];
      const girl=G({l:[-65,-207],r:V([247,-313],[110,-235],retreat),
        headTilt:lerp(-.025,.045,P(q,.59,.81)),
        look:V([.95,-.08],[.55,.8],P(q,.6,.82)),
        smile:K(q,[[0,.08],[.3,-.15],[.65,-.3],[1,-.3]]),wet:true});
      const boy=B({
        r:V(V([61,-195],[handle[0]-1490,handle[1]-950],P(q,.35,.49)),[61,-195],release),
        look:K(q,[[0,[-.95,-.04]],[.35,[-.95,-.04]],[.55,[.8,.1]],[.8,[-.5,.3]],[1,[-.5,.3]]]),
        view:q>.43&&q<.77?'back':'q',
        headTilt:lerp(0,.015,P(q,.56,.76))
      });
      doorScene(t,l,d,{girl,boy,doorOpen:open,cam:[1350,540,1.28],after:()=>{
        travelCoat(boy);packet(girl,0,true);
      }});
    }
  ]);
})();
