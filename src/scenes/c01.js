(() => {
  const {frame,prop,held,progress:P,point:V}=MV;
  const G=(o={})=>({x:800,y:960,facing:1,emotion:'worried',l:[-60,-224],r:[85,-235],...o});
  const B=(o={})=>({x:1260,y:960,facing:-1,emotion:'quiet',l:[-120,-230],r:[65,-220],look:[-.2,.6],...o});
  const cups=(phone=true)=>[{kind:'cup',x:820,y:713,s:.85,key:'owncup'},{kind:'cup',x:1100,y:713,s:.85,key:'secondcup'},...(phone?[{kind:'phone',x:940,y:709,s:.65,rot:1.45,key:'message'}]:[])];
  MV.register(1,[
    (t,l,d,q)=>{const k=P(q,.12,.74),x=lerp(905,1100,k),g=G({r:[x-800-10,-253]});
      frame(t,l,d,{cam:[1000,701,1.7],girl:g,props:[{kind:'cup',x,y:713,s:.85,key:'secondcup'}]});},
    (t,l,d,q)=>{const k=P(q,.12,.6),g=G({headTilt:-.04,r:V([290,-253],[85,-230],k),look:[.9,-.2]});
      frame(t,l,d,{cam:[1040,580,1.05],girl:g,boy:B({x:1570,y:950,s:.94,coat:true,l:[-70,-200]}),props:cups(false),rightChair:25});},
    (t,l,d,q)=>{const k=P(q,.06,.58),boy=B({x:lerp(1550,1260,k),y:lerp(950,960,k),walk:k>0&&k<1?k*1.5:0});
      frame(t,l,d,{girl:G({look:[q>.55?.65:.2,q>.55?.1:.4]}),boy,props:[...cups(false),{kind:'phone',x:835,y:713,s:.65,rot:1.45,lit:q>.48},{kind:'coat',x:1300,y:850,s:.8}],after:()=>{}});},
    (t,l,d,q)=>{const k=P(q,.08,.53),x=lerp(835,950,k),g=G({r:[x-800,-252],headTilt:-.04,look:[.6,.1]});
      frame(t,l,d,{cam:[960,615,1.22],girl:g,boy:B({l:[-155,-256],headTilt:.02}),props:[...cups(false),{kind:'phone',x,y:709,s:.65,rot:1.45}]});},
    (t,l,d,q)=>{const k=P(q,.15,.65),boy=B({headTilt:lerp(0,-.07,k),l:[-155,-250+Math.sin(q*10)*4],look:[-.3,.9],talk:q>.45&&q<.56});
      frame(t,l,d,{cam:[1235,535,1.65],girl:G({r:[150,-252]}),boy,props:cups()});},
    (t,l,d,q)=>{const k=P(q,.1,.6),g=G({r:V([5,-254],[175,-254],k),smile:q>.6?.3:0,look:[.8,0]});
      frame(t,l,d,{cam:[960,600,1.18],girl:g,boy:B({l:[-148,-249],talk:q>.65&&q<.74}),props:cups(),after:()=>{
        const x=lerp(830,1000,k);MV.mark('pothandle',[[x-27,679],[x-49,695],[x-26,711]],1.2,MV.C.wood);MV.box('teapot',x-28,665,57,43,MV.C.cream,10);MV.mark('potspout',[[x+27,681],[x+53,667]],1.3,MV.C.wood);
        if(q>.48&&q<.76)MV.mark('teastream',[[x+53,669],[1088,671]],.6,MV.C.wood);
      }});},
    (t,l,d,q)=>{const k=P(q,.12,.58),x=lerp(950,819,k),g=G({r:[x-800,-250],look:[.2,lerp(0,.8,k)],emotion:'sad',headTilt:lerp(0,.05,k)});
      frame(t,l,d,{cam:[770,570,1.45],girl:g,boy:B(),props:[...cups(false),{kind:'phone',x,y:710,s:.65,rot:1.45,lit:q<.55}]});}
  ]);
})();
