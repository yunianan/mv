// A separate rooftop night. Dark outerwear and extinguished lamps distinguish it.
(() => {
  const {frame,actor,prop,hand,shape,oval,mark,box,C,progress:P,point:V,motion:M}=MV;
  const G=(o={})=>({x:850,y:970,s:.96,facing:1,view:'q',emotion:'sad',
    l:[-50,-233],r:[95,-235],look:[.7,.3],smile:-.35,...o});
  const B=(o={})=>({x:1120,y:950,facing:-1,view:'q',emotion:'worried',
    l:[-100,-228],r:[65,-217],look:[-.65,.35],smile:-.1,...o});
  const night={set:'roof',memory:true,table:false,chairs:false,unlit:true};
  const girlCoat='#997B76',boyCoat='#697985';
  // Full coats and sleeves use the same brush geometry as the shared actors.
  // Hands are redrawn last, so the dark cuffs never swallow a contact.
  function dressed(who,t,o,phase) {
    actor(who,t,o,phase);
    const col=who==='girl'?girlCoat:boyCoat;
    const bob=o.walk?Math.abs(Math.sin(o.walk*TAU))*4:0;
    push();translate(o.x,o.y-bob);scale(o.s??1);rotate(o.lean||0);
    if(phase==='body') {
      shape(who+'nightcoat',[[-57,-316],[-76,-265],[-68,-173],[65,-174],
        [76,-265],[54,-316],[24,-328],[0,-306],[-25,-328]],col,true);
      mark(who+'nightlapels',[[-29,-325],[-12,-283],[0,-305],[16,-282],[31,-324]],.65,C.cream);
      mark(who+'nightseam',[[0,-303],[2,-180]],.5,C.ink);
    } else {
      const breath=Math.sin(t*1.6+(who==='girl'?0:1.2))*1.8;
      [[-1,o.l||[-75,-203]],[1,o.r||[75,-203]]].forEach(([dir,h],i)=>{
        const a=[dir*55,-297+breath];
        const elbow=[lerp(a[0],h[0],.54)+dir*22,lerp(a[1],h[1],.56)+23];
        shape(who+'nightarm'+i,ribbon([a,elbow,[h[0],h[1]-5]],35,24),col,true);
        oval(who+'nighthand'+i,h[0],h[1]+5,14,18,C.skin);
        mark(who+'nightthumb'+i,[[h[0]+dir*9,h[1]-3],[h[0]+dir*4,h[1]+7]],.4,'#BB907B');
      });
    }
    pop();
  }
  function pair(t,g,b) {
    dressed('boy',t,b,'body');dressed('girl',t,g,'body');
    dressed('boy',t,b,'arms');dressed('girl',t,g,'arms');
  }
  function rooftopDoor() {
    box('c6-roof-doorway',1435,150,315,696,'#6E787E',3);
    box('c6-roof-door',1450,163,295,676,'#A2978B',3);
    box('c6-roof-door-glass',1490,228,215,235,'#899598',3);
    mark('c6-roof-door-mullion',[[1597,230],[1597,462]],1,C.cream);
    oval('c6-roof-door-handle',1710,545,8,8,C.wood);
    mark('c6-roof-frame',[[1422,844],[1422,135],[1768,135],[1768,844]],1.6,'#A39B84');
    // Folded birthday furniture is present only as an inactive silhouette.
    shape('c6-folded-table',[[250,752],[291,731],[437,795],[416,821]],'#A99B86');
    mark('c6-folded-table-feet',[[293,785],[252,912],[392,812],[434,918]],1.5,C.wood);
  }
  function inverse(o,p) {
    const a=o.lean||0,dx=(p[0]-o.x)/(o.s??1),dy=(p[1]-o.y)/(o.s??1);
    return [dx*Math.cos(a)+dy*Math.sin(a),-dx*Math.sin(a)+dy*Math.cos(a)];
  }
  function sharedHand(g,gs,b,bs,p,k=1) {
    g[gs]=V(g[gs],inverse(g,p),k);b[bs]=V(b[bs],inverse(b,p),k);
  }
  function groundedBag() {prop('bag',1405,955,.78,{key:'c6-nightbag'});}

  MV.register(6,[
    // S27 / 171–178. Two departing steps, a held decision, then a return.
    (t,l,d,q)=>{
      const out=P(q,.06,.28),lower=P(q,.36,.49),turn=P(q,.5,.6),back=P(q,.61,.88);
      const bx=M(q,[[0,1190],[.28,1375],[.58,1375],[.88,1120],[1,1120]]);
      const b=B({x:bx,facing:q<.55?1:-1,
        view:q<.49?'side':q<.57?'front':'q',
        l:[-45,-195],r:V([75,-214],[30,-125],lower),
        headTilt:M(q,[[0,.025],[.29,.025],[.42,.065],[.61,-.035],[1,-.035]]),
        look:[lerp(.7,-.8,turn),lerp(.35,.05,back)],
        walk:q<.28?out*2:q>.61&&q<.88?back*2:0});
      const g=G({view:q<.82?'back':'q',
        r:V([-42,-276],[90,-240],P(q,.83,.96)),l:[45,-275],
        headTilt:lerp(.015,-.035,P(q,.8,.96)),look:[.75,.2],
        smile:lerp(-.5,-.2,P(q,.87,.98))});
      frame(t,l,d,{...night,cam:[1130,570,1.03],after:()=>{
        rooftopDoor();pair(t,g,b);
        if(q<.49) {
          const hp=hand(b,'r');
          // Carry by the handle, then put the bottom on the floor.
          prop('bag',hp[0],hp[1]+166*.78,.78,{key:'c6-nightbag'});
        } else groundedBag();
      }});
    },
    // S28 / 178–185. Blocked reach, listening, consent, a tighter hug, repair.
    (t,l,d,q)=>{
      const ask=P(q,.07,.2),block=P(q,.13,.24),allow=P(q,.3,.4);
      const near=P(q,.42,.58),tight=P(q,.59,.65),flinch=P(q,.65,.7);
      const loosen=P(q,.71,.77),again=P(q,.81,.92);
      const gx=M(q,[[0,850],[.4,850],[.58,900],[.65,912],[.77,900],[1,900]]);
      const bx=M(q,[[0,1120],[.4,1120],[.58,1100],[.65,1088],[.77,1110],[1,1110]]);
      const g=G({x:gx,y:970-5*flinch,s:.96,
        r:V(V([95,-235],[135,-285],block),[145,-270],allow),
        l:V([-50,-233],[88,-235],near),
        lean:M(q,[[0,0],[.59,.015],[.69,-.015],[.78,0],[.94,.01],[1,.01]]),
        headTilt:M(q,[[0,-.035],[.25,-.045],[.46,.005],[.64,.025],[.7,-.055],[.79,-.015],[1,.025]]),
        look:[.8,M(q,[[0,.2],[.29,.2],[.5,.4],[.68,-.2],[.8,.25],[1,.35]])],
        smile:M(q,[[0,-.35],[.35,-.2],[.6,.35],[.7,-.2],[.8,.1],[.94,.65],[1,.65]]),
        closed:(q>.54&&q<.64)||q>.91});
      const b=B({x:bx,
        l:V(V([-100,-228],[-140,-280],ask),[-145,-268],near),
        r:V([65,-217],[-85,-235],near),
        headTilt:M(q,[[0,-.035],[.14,.055],[.31,.055],[.52,-.035],[.71,-.07],[.81,-.025],[1,-.025]]),
        look:[-.8,lerp(.5,.15,near)],talk:q>.07&&q<.3,
        smile:lerp(-.15,.5,again)});
      g.r=V(g.r,[95,-235],loosen*(1-again));
      g.r=V(g.r,[155,-270],again);
      b.l=V(b.l,[-120,-228],loosen);
      b.r=V(b.r,[-55,-205],loosen);
      b.l=V(b.l,[-145,-260],again*.65);
      b.r=V(b.r,[-85,-235],again*.65);
      frame(t,l,d,{...night,cam:[1010,590,1.18],after:()=>{
        rooftopDoor();pair(t,g,b);groundedBag();
        if(q>.16&&q<.35) {
          const h=hand(g,'r');
          // Upright palm reads as a boundary instead of a returned grasp.
          oval('c6-stopping-palm',h[0],h[1]-5,13,23,C.skin);
          mark('c6-stopping-fingers',[[h[0]-6,h[1]-22],[h[0]-5,h[1]-4]],.4,'#BB907B');
        }
      }});
    },
    // S29 / 185–192. She leads his hands to her waist before he follows.
    (t,l,d,q)=>{
      const turn=P(q,.07,.24),step=P(q,.24,.46),guide=P(q,.5,.67),embrace=P(q,.7,.86);
      const g=G({x:lerp(900,1110,step),y:lerp(965,1018,step),s:.94,
        view:q<.13?'q':q<.27?'back':'side',facing:1,
        l:V([88,-235],[-54,-218],step),r:V([155,-270],[-8,-235],step),
        headTilt:lerp(.025,-.025,turn),
        look:[.6,lerp(.25,-.1,turn)],smile:lerp(.4,.65,embrace),
        closed:q>.88});
      const b=B({x:lerp(1110,986,step),y:950,facing:q<.27?-1:1,
        view:q<.2?'q':q<.34?'front':'side',
        l:V([-136,-250],[100,-151],step),
        r:V([-75,-225],[115,-127],step),
        headTilt:lerp(-.025,.025,guide),look:[.5,.6],smile:.4});
      // First he straightens the back of her coat, with the other hand kept low.
      if(q>.25&&q<.47) {
        const collar=[g.x-35,g.y-309*(g.s??1)];
        b.l=V(b.l,inverse(b,collar),P(q,.25,.34)*(1-P(q,.39,.47)));
      }
      const waist=[g.x-42,g.y-220*(g.s??1)];
      sharedHand(g,'l',b,'r',waist,guide);
      b.l=V(b.l,inverse(b,[g.x+25,g.y-245*(g.s??1)]),embrace);
      // The small tremble resolves, rather than growing into a new action.
      const tremble=Math.sin(q*86)*1.3*guide*(1-embrace);
      g.l[1]+=tremble;
      frame(t,l,d,{...night,cam:[1085,605,1.19],after:()=>{
        rooftopDoor();pair(t,g,b);groundedBag();
      }});
    },
    // S30 / 192–197. Reflection passes; she speaks and he makes listening space.
    (t,l,d,q)=>{
      const spark=P(q,.04,.12)*(1-P(q,.16,.3)),speak=P(q,.4,.58),space=P(q,.61,.78);
      const g=G({x:1110,y:1018,s:.94,view:'side',facing:1,
        l:[-44.68,-220],r:V([-8,-235],[45,-246],speak),
        headTilt:lerp(-.025,-.105,speak),closed:q<.3,
        look:[lerp(.6,-.5,speak),lerp(-.1,-.65,speak)],
        smile:lerp(.65,.2,speak),talk:q>.48&&q<.91});
      const b=B({x:lerp(986,960,space),y:950,view:'side',facing:1,
        l:V(inverse({x:986,y:950},[1135,787.7]),[125,-180],space),
        r:V(inverse({x:986,y:950},[1068,811.2]),[95,-138],space),
        headTilt:lerp(.025,.1,space),look:[.7,lerp(.6,.8,space)],
        smile:lerp(.4,.3,space)});
      g.l=V(g.l,[-50,-205],space);
      frame(t,l,d,{...night,cam:[1085,605,1.19],after:()=>{
        rooftopDoor();
        if(spark>.01) {
          // Only reflections, never a competing sky spectacle.
          mark('c6-fire-reflection-a',[[1512,274],[1542+spark*37,310],[1548,350]],.8,'#D8BA92');
          mark('c6-fire-reflection-b',[[1634,268],[1608-spark*25,311],[1657,333]],.65,'#D8BA92');
        }
        pair(t,g,b);groundedBag();
        if(spark>.01) {
          oval('c6-eye-glint-g',g.x+35,625,2+spark*2,2,C.cream);
          oval('c6-eye-glint-b',b.x+43,539,2+spark*2,2,C.cream);
        }
      }});
    }
  ]);
})();
