// Chapter 5: the birthday seen from its small reciprocal acts of care.
(() => {
  const {frame,prop,hand,shape,oval,box,mark,C,progress:P,point:V,motion:M}=MV;
  const G=(o={})=>({x:850,y:960,facing:1,view:'q',emotion:'soft',
    l:[-55,-225],r:[110,-255],look:[.7,.2],...o});
  const B=(o={})=>({x:1070,y:960,facing:-1,view:'q',emotion:'soft',
    l:[-100,-245],r:[65,-220],look:[-.7,.2],...o});
  const roof={set:'roof',memory:true,leftChair:205,rightChair:-210};
  function clip(p,key='c5-clip') {
    shape(key,[[p[0]-5,p[1]-11],[p[0]+5,p[1]-10],[p[0]+6,p[1]+13],
      [p[0]-5,p[1]+12]],C.wood,true);
    mark(key+'split',[[p[0],p[1]-9],[p[0]+1,p[1]+8]],.55,C.ink);
  }
  function cord(key,points,lit=false) {
    mark(key,points,.72,C.ink);
    points.slice(1,-1).forEach((p,i)=>{
      mark(key+'drop'+i,[[p[0],p[1]],[p[0],p[1]+10]],.45,C.ink);
      oval(key+'bulb'+i,p[0],p[1]+16,6,10,lit?C.warm:'#B5B2A0');
    });
  }
  function utensil(key,p,dir,bite=false) {
    mark(key,[[p[0],p[1]],[p[0]+dir*32,p[1]-1]],.9,C.cream);
    oval(key+'bowl',p[0]+dir*33,p[1]-1,9,4,C.cream);
    if(bite)shape(key+'bite',[[p[0]+dir*25,p[1]-3],[p[0]+dir*39,p[1]-4],
      [p[0]+dir*35,p[1]-16],[p[0]+dir*27,p[1]-12]],'#D8B59A',true);
  }
  function grip(key,p) {
    mark(key,[[p[0]-7,p[1]+4],[p[0]+3,p[1]+6],[p[0]+8,p[1]+2]],.65,'#BB907B');
  }
  function hangingCoat(key,p) {
    shape(key,[[p[0]-13,p[1]],[p[0]+17,p[1]-3],[p[0]+38,p[1]+25],
      [p[0]+49,p[1]+89],[p[0]+22,p[1]+95],[p[0]+20,p[1]+126],
      [p[0]-43,p[1]+121],[p[0]-34,p[1]+28]],'#B8AD9C',true);
    mark(key+'lapel',[[p[0]-7,p[1]+2],[p[0]+1,p[1]+37],[p[0]+16,p[1]+7]],.6,C.wood);
  }

  MV.register(5,[
    // S22 / 144–151. Her raised hand is occupied; he anticipates the free palm.
    (t,lt,dur,q)=>{
      const ask=P(q,.15,.30),offer=P(q,.27,.45),receive=P(q,.46,.57),
        attach=P(q,.61,.82),settle=P(q,.84,.97);
      const g=G({y:840,
        r:M(q,[[0,[125,-450]],[.55,[125,-450]],[.82,[123,-448]],[1,[120,-442]]]),
        l:V(V([-45,-225],[90,-245],ask),[105,-430],attach),
        look:M(q,[[0,[.8,-.9]],[.25,[.75,.3]],[.51,[.75,.3]],[.75,[.75,-.9]],[1,[.5,-.6]]]),
        headTilt:M(q,[[0,-.04],[.28,.02],[.56,.02],[.79,-.06],[1,-.03]]),
        smile:lerp(.4,.9,receive),talk:q>.20&&q<.29});
      const b=B({x:1040,
        l:[-115,-115],r:V([45,-205],[-100,-365],offer),
        look:V([-.5,.7],[-.8,-.65],offer),headTilt:lerp(.02,-.045,offer),
        smile:lerp(.55,1,P(q,.46,.62))});
      if(q>.45)b.r=V([-100,-365],[35,-220],P(q,.57,.73));
      frame(t,lt,dur,{...roof,chairs:false,table:false,lights:false,
        cam:[970,541,1.05],girl:g,boy:b,after:()=>{
          box('c5-stooltop',767,844,168,23,C.wood,8);
          mark('c5-stoollegL',[[785,865],[775,950]],2,C.wood);
          mark('c5-stoollegR',[[916,865],[925,950]],2,C.wood);
          const raised=hand(g,'r');
          cord('c5-hanging-cord',[[180,235],[550,330],[810,365],raised,[1200,355],[1740,245]],settle>.5);
          // One clip transfers at coincident palms, then travels in her hand.
          const cp=q<.50?hand(b,'r'):hand(g,'l');clip(cp);
          grip('c5-clipgrip',cp);
          // His other palm touches the stool edge throughout the exchange.
          grip('c5-stoolgrip',hand(b,'l'));
        }});
    },

    // S23 / 151–158. A pulled knot becomes a task they solve together.
    (t,lt,dur,q)=>{
      const stop=P(q,.24,.36),laugh=P(q,.47,.61),
        untie=P(q,.62,.84),raise=P(q,.85,.98);
      const g=G({x:850,
        view:q>.17&&q<.42?'side':'q',facing:q>.17&&q<.42?-1:1,
        r:M(q,[[0,[115,-320]],[.15,[90,-285]],[.37,[90,-285]],
          [.62,[125,-269]],[.84,[125,-285]],[1,[115,-410]]]),
        l:V([-55,-225],[95,-244],P(q,.52,.70)),
        look:M(q,[[0,[.7,-.3]],[.18,[-.9,.1]],[.41,[-.9,.1]],
          [.56,[.8,.5]],[.83,[.8,.65]],[1,[.5,-.7]]]),
        headTilt:M(q,[[0,-.025],[.18,-.085],[.39,-.085],[.6,.055],[.85,.02],[1,-.035]]),
        smile:M(q,[[0,.4],[.15,-.45],[.4,-.45],[.61,1],[1,.85]]),
        closed:q>.55&&q<.64});
      const b=B({x:1120,
        l:M(q,[[0,[-135,-320]],[.19,[-145,-280]],[.37,[-100,-240]],
          [.62,[-100,-240]],[.84,[-95,-285]],[1,[-60,-410]]]),
        r:V([65,-230],[50,-290],stop),
        look:[-.8,lerp(.3,.65,stop)],headTilt:lerp(-.035,-.075,stop),
        smile:lerp(.05,.9,laugh)});
      frame(t,lt,dur,{...roof,table:false,chairs:false,lights:false,
        cam:[1000,600,1.16],girl:g,boy:b,after:()=>{
          const a=hand(g,'r'),bhand=hand(b,'l'),gy=lerp(650,500,raise),by=lerp(650,505,raise);
          const knot=lerp(38,0,untie),mid=[995,lerp(707,655,untie)-raise*95];
          cord('c5-tangled-cord',[[180,235],[650,350],[825,gy],a,
            [mid[0]-knot,mid[1]],[mid[0]+knot,mid[1]-knot],
            [mid[0]-knot*.6,mid[1]-knot*.8],bhand,[1175,by],[1740,245]],raise>.7);
          grip('c5-unknot-g',a);grip('c5-unknot-b',bhand);
          if(stop>.2&&untie<.1) {
            const h=hand(b,'r');mark('c5-open-palm',[[h[0]-12,h[1]-4],[h[0]-2,h[1]+2],[h[0]+12,h[1]-5]],.55,C.skin);
          }
        }});
    },

    // S24 / 158–164. He catches her crooked slice; each then feeds the other.
    (t,lt,dur,q)=>{
      const cut=P(q,.04,.18),catchSlice=P(q,.17,.28),
        give=P(q,.33,.52),returnGift=P(q,.67,.85);
      const g=G({x:850,
        r:M(q,[[0,[110,-310]],[.18,[118,-292]],[.30,[147,-260]],
          [.52,[180,-379]],[.57,[180,-379]],[.66,[122,-250]],[1,[105,-250]]]),
        l:[-55,-248],
        headTilt:M(q,[[0,.02],[.2,-.045],[.31,.025],[.52,-.02],[.76,-.045],[1,.015]]),
        look:[.8,lerp(.65,.05,give)],smile:lerp(.45,1,catchSlice),
        talk:q>.81&&q<.90,closed:q>.91&&q<.97});
      const b=B({x:1070,
        r:[-40,-245],
        l:M(q,[[0,[-75,-240]],[.61,[-73,-260]],[.67,[-73,-260]],
          [.85,[-180,-379]],[.90,[-180,-379]],[1,[-85,-247]]]),
        look:[-.8,lerp(.65,.05,give)],
        headTilt:M(q,[[0,-.02],[.22,-.055],[.43,-.045],[.56,.025],[.78,-.015],[1,.015]]),
        smile:lerp(.55,1,catchSlice),talk:q>.49&&q<.57,closed:q>.58&&q<.64});
      frame(t,lt,dur,{...roof,cam:[965,600,1.29],girl:g,boy:b,
        props:[{kind:'cake',x:960,y:713,s:.83,key:'birthdaycake',flame:false}],after:()=>{
          const plate=hand(b,'r');oval('c5-catchingplate',plate[0],plate[1],48,9,C.cream);
          const slice=V([995,651],[plate[0]+4,plate[1]-8],catchSlice);
          if(q<.32)shape('c5-crooked-slice',[[slice[0]-19,slice[1]],[slice[0]+20,slice[1]+4],
            [slice[0]+13,slice[1]-27],[slice[0]-16,slice[1]-23]],'#D8B59A',true);
          if(q<.30){const h=hand(g,'r');mark('c5-cake-knife',[[h[0],h[1]],[h[0]+20,h[1]-19-12*cut]],1.3,C.cream);}
          else utensil('c5-her-spoon',hand(g,'r'),1,q>.32&&q<.57);
          if(q>.60)utensil('c5-his-spoon',hand(b,'l'),-1,q>.66&&q<.90);
          grip('c5-plategrip',plate);
        }});
    },

    // S25 / 164–169. The hand leads the rise; the coat answers her small shiver.
    (t,lt,dur,q)=>{
      const join=P(q,.04,.16),rise=P(q,.18,.36),pick=P(q,.36,.52),
        cover=P(q,.56,.80),settle=P(q,.82,.97);
      const gx=lerp(850,875,settle),gy=960,by=960,s=lerp(.94,1,rise);
      const meeting=M(q,[[0,[970,720]],[.16,[970,720]],[.36,[955,705]],[1,[955,705]]]);
      const g=G({x:gx,y:gy,s,view:'side',
        r:V([110,-250],[(meeting[0]-gx)/s,(meeting[1]-gy)/s],join),
        l:V([-55,-225],[45,-245],cover),
        look:[.65,M(q,[[0,.1],[.34,-.95],[.7,-.95],[.94,-.1],[1,-.1]])],
        headTilt:M(q,[[0,-.02],[.38,-.085],[.72,-.085],[.97,.015],[1,.015]]),
        smile:lerp(.65,1,cover)});
      const b=B({x:1070,y:by,s,view:'side',
        r:V([65,-220],[(meeting[0]-1070)/s,(meeting[1]-by)/s],join),
        l:M(q,[[0,[90,-170]],[.35,[90,-170]],[.52,[40,-410]],
          [.80,[-140,-293]],[.87,[-140,-293]],[1,[-75,-245]]]),
        look:[-.8,lerp(-.8,.1,cover)],headTilt:lerp(-.05,-.08,cover),
        smile:lerp(.6,1,settle)});
      frame(t,lt,dur,{...roof,table:false,cam:[990,610,1.19],girl:g,boy:b,after:()=>{
        if(q<.36)hangingCoat('c5-birthday-held-coat',hand(b,'l'));
        else if(q<.80) {
          const h=hand(b,'l'),top=V(h,[gx+53,gy-315],cover);
          const width=lerp(45,125,cover);
          shape('c5-coat-travel',[[top[0]-width,top[1]],[top[0]+14,top[1]-4],
            [top[0]+32,top[1]+57],[top[0]+15,top[1]+136],
            [top[0]-width-7,top[1]+139],[top[0]-width-24,top[1]+62]],'#B8AD9C',true);
          grip('c5-coat-carrygrip',h);
        } else {
          shape('c5-coat-on-shoulders',[[gx-64,gy-315],[gx+57,gy-320],
            [gx+81,gy-274],[gx+65,gy-174],[gx-72,gy-176],[gx-86,gy-270]],'#B8AD9C',true);
          mark('c5-coat-lapel',[[gx-14,gy-313],[gx+8,gy-271],[gx+29,gy-316]],.65,C.wood);
          const h=hand(g,'l');oval('c5-girl-coat-hand',h[0],h[1]+5,14,18,C.skin);
          grip('c5-girl-holds-coat',h);
        }
        if(join>.75){grip('c5-held-right-hands',meeting);}
      }});
    },

    // S26 / 169–171. Match the warm coat to the coat he picks up to leave.
    (t,lt,dur,q)=>{
      const pickup=P(q,.05,.34),notice=P(q,.24,.41),withdraw=P(q,.47,.82),smooth=P(q,.83,.98);
      const g=G({x:860,emotion:'hurt',wet:true,
        r:V([165,-240],[-37,-231],withdraw),l:[-55,-224],
        look:V([.85,.15],[.05,.9],notice),
        headTilt:lerp(-.02,.06,withdraw),smile:lerp(.12,-.35,notice)});
      g.r[1]+=Math.sin(smooth*Math.PI)*5;
      const b=B({x:1190,emotion:'quiet',
        r:V([110,-197],[60,-245],pickup),l:[-85,-225],
        look:[.1,.8],headTilt:lerp(-.015,-.05,pickup),smile:-.15});
      frame(t,lt,dur,{set:'room',cam:[1020,620,1.20],girl:g,boy:b,
        props:[{kind:'cup',x:820,y:713,s:.85,key:'owncup'},
          {kind:'cup',x:1100,y:713,s:.85,key:'secondcup'},
          {kind:'phone',x:819,y:710,s:.65,rot:1.45,lit:false,key:'message'},
          {kind:'bag',x:1310,y:925,s:.94,key:'departurebag'}],after:()=>{
          hangingCoat('c5-presentcoat',hand(b,'r'));
          grip('c5-coat-pickupgrip',hand(b,'r'));
          if(withdraw>.8)grip('c5-own-sleeve',hand(g,'r'));
        }});
    }
  ]);
})();
