(() => {
  const {frame,progress:P,point:V,held,prop}=MV;
  const G=(o={})=>({x:1230,y:950,facing:1,emotion:'sad',look:[.5,.2],l:[-65,-207],r:[155,-280],...o});
  const B=(o={})=>({x:1490,y:950,facing:-1,emotion:'quiet',look:[-.5,.3],l:[-67,-210],r:[61,-195],bag:true,bagSide:-1,...o});
  const bundle=(g,s=.4)=>{held('plan',g,'l',s,{folded:true,key:'finalplan'});};
  const departingCoat=b=>{
    MV.mark('departing-strap',[[b.x-46,645],[b.x-72,705],[b.x-85,778]],.85,MV.C.wood);
    prop('coat',b.x-79,855,.67,{key:'departing-coat',rot:.06});
  };
  MV.register(8,[
    (t,l,d,q)=>{
      const k=P(q,.12,.48),back=P(q,.63,.88),g=G({lean:-.015-k*.025+back*.025,r:V([110,-235],[166,-284],k*(1-back)),headTilt:-.025*k});
      const b=B();frame(t,l,d,{set:'door',table:false,chairs:false,doorOpen:.18,cam:[1350,540,1.28],girl:g,boy:b,after:()=>{bundle(g);departingCoat(b);}});
    },
    (t,l,d,q)=>{
      const k=P(q,.14,.5),g=G({r:V([60,-205],[-15,-263],k),l:[-43,-267],look:[-.35,.85],headTilt:.035});
      const b=B();frame(t,l,d,{set:'door',table:false,chairs:false,doorOpen:.18,cam:[1220,587,1.65],girl:g,boy:b,after:()=>{
        bundle(g,.48);const h=MV.hand(g,'l');prop('candle',h[0]+3,h[1]-10,.7,{key:'savedcandle'});departingCoat(b);
      }});
    },
    (t,l,d,q)=>{
      const k=P(q,.12,.58),g=G({l:[-65,-207],r:V([62,-204],[165,-281],k),headTilt:-.035,look:[.8,.2]});
      const b=B({look:[-.8,.3]});frame(t,l,d,{set:'door',table:false,chairs:false,doorOpen:.18,cam:[1350,565,1.32],girl:g,boy:b,after:()=>{bundle(g);departingCoat(b);}});
    },
    (t,l,d,q)=>{
      const k=P(q,.15,.78),g=G({r:V([165,-281],[65,-198],k),look:[.4,.5+k*.2],headTilt:lerp(-.035,.025,k)});
      const b=B();frame(t,l,d,{set:'door',table:false,chairs:false,doorOpen:.18,cam:[1235,565,1.55],girl:g,boy:b,after:()=>{bundle(g);departingCoat(b);}});
    },
    (t,l,d,q)=>{
      const aside=P(q,.08,.47),leave=P(q,.4,.98),g=G({x:lerp(1230,1110,aside),r:[63,-198],walk:aside<1?aside*.7:0,headTilt:.015,look:[.75,0]});
      const boy=B({x:lerp(1490,2310,leave),view:leave>.05?'side':'q',facing:leave>.05?1:-1,walk:leave*3.5,look:[leave>.05?1:-.6,.2]});
      frame(t,l,d,{set:'door',table:false,chairs:false,doorOpen:lerp(.18,.95,aside),cam:[1380,565,1.12],girl:g,boy,after:()=>{bundle(g);departingCoat(boy);}});
    },
    (t,l,d,q)=>{
      const approach=P(q,.03,.23),k=P(q,.26,.66),opening=lerp(.95,0,k);
      const handleX=1450+295*(1-opening*.88)-35;
      const gx=lerp(1110,handleX-120,approach);
      const g=G({x:gx,view:q<.15?'q':'side',facing:1,
        r:V([65,-198],[handleX-gx,-405],approach),
        walk:q>.03&&q<.66?approach*.7+k*.8:0,
        smile:Math.sin(Math.PI*P(q,.08,.52))*.35,look:[.6,lerp(.1,.9,k)],headTilt:.05*k});
      frame(t,l,d,{set:'door',table:false,chairs:false,doorOpen:opening,cam:[1440,565,1.18],girl:g,after:()=>bundle(g)});
    },
    (t,l,d,q)=>{
      const k=P(q,.1,.66),g=G({x:800,y:960,l:V([-65,-207],[110,-158],k),r:V([65,-198],[164,-152],k),look:[.25,.8],headTilt:.05});
      frame(t,l,d,{girl:g,rightChair:40,cam:[950,632,1.28],props:[{kind:'cup',x:820,y:713,s:.85,key:'owncup'},{kind:'cup',x:1100,y:713,s:.85,key:'secondcup'}],after:()=>{
        if(q<.73) {const h=MV.hand(g,'l');prop('plan',h[0],h[1],.43*(1-P(q,.56,.73)),{key:'returnplan',folded:true});}
        MV.mark('drawerslide',[[810,795],[1060,795+Math.sin(Math.PI*k)*35]],.65,MV.C.wood);
      }});
    },
    (t,l,d,q)=>{
      const k=P(q,.35,.78),cupx=lerp(1100,930,k),move=P(q,.8,.98),gx=lerp(900,1100,move),rh=V([cupx-8,712],[1240,705],move);
      const g=G({x:gx,y:960,emotion:'sad',wet:true,r:[rh[0]-gx,rh[1]-960],l:[-60,-225],look:[.65,lerp(0,.4,move)],walk:move>0&&move<1?move*.8:0,talk:q>.12&&q<.18,headTilt:.02});
      frame(t,l,d,{girl:g,rightChair:40,cam:[1010,590,1.2],props:[{kind:'cup',x:820,y:713,s:.85,key:'owncup'},{kind:'tray',x:930,y:718,s:.75,key:'sidetray'},{kind:'cup',x:cupx,y:713-Math.sin(Math.PI*k)*33,s:.85,key:'secondcup'}]});
    },
    (t,l,d,q)=>{
      const push=P(q,.08,.48),sit=P(q,.52,.83),g=G({x:lerp(1100,800,sit),y:960,l:[-60,-225],r:V([140,-255],[60,-225],sit),look:[lerp(.55,0,sit),.4],headTilt:.025*(1-sit)});
      frame(t,l,d,{girl:g,rightChair:lerp(40,0,push),cam:[960,565,1.04],props:[{kind:'cup',x:820,y:713,s:.85,key:'owncup'},{kind:'tray',x:930,y:718,s:.75,key:'sidetray'},{kind:'cup',x:930,y:713,s:.85,key:'secondcup'}],fade:P(q,.87,1)*.85});
    }
  ]);
})();
