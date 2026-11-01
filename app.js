
const hdr=document.getElementById('hdr'),util=document.getElementById('util');
addEventListener('scroll',()=>{
  const s=scrollY>60;
  hdr.classList.toggle('fixed',s);
  util.style.display=s?'none':'flex';
},{passive:true});

const mmenu=document.getElementById('mmenu');
document.getElementById('burger').onclick=()=>mmenu.classList.add('open');
document.getElementById('mclose').onclick=()=>mmenu.classList.remove('open');
mmenu.querySelectorAll('a').forEach(a=>a.onclick=()=>mmenu.classList.remove('open'));

const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.rev').forEach(el=>io.observe(el));

/* ============ HERO SLIDER (3 slajda, svaki sa svojim tekstom) ============ */
(function(){
  const hero=document.querySelector('.hero-multi');
  if(!hero)return;
  const slides=[...hero.querySelectorAll('.hero-slide')];
  if(slides.length<2)return;
  const DUR=7000;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i=0,timer;
  function go(n){
    i=(n+slides.length)%slides.length;
    slides.forEach((s,k)=>{const on=k===i;s.classList.toggle('active',on);s.inert=!on;s.setAttribute('aria-hidden',on?'false':'true')});
    clearTimeout(timer);
    if(!reduce)timer=setTimeout(()=>go(i+1),DUR);
  }
  go(0);
})();

/* ============ SLAJDER SLIKA U KORAKU (.chap-img.slides) ============ */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('.chap-img.slides').forEach(box=>{
    const imgs=[...box.querySelectorAll('img')];
    if(imgs.length<2)return;
    const ind=document.createElement('span');ind.className='slides-ind';ind.setAttribute('aria-hidden','true');
    ind.innerHTML=imgs.map(()=>'<span></span>').join('');box.appendChild(ind);
    const bars=[...ind.children];bars[0].classList.add('on');
    let i=0;
    setInterval(()=>{imgs[i].classList.remove('on');bars[i].classList.remove('on');i=(i+1)%imgs.length;imgs[i].classList.add('on');bars[i].classList.add('on')},4500);
  });
})();

/* ============ STAT COUNTERS ============ */
(function(){
  const nums=[...document.querySelectorAll('.stat .n[data-count]')];
  if(!nums.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const DUR=1400;
  const easeOutExpo=t=>t>=1?1:1-Math.pow(2,-10*t);
  const run=el=>{
    const to=Number(el.dataset.count),suf=el.dataset.suffix||'';
    if(reduce.matches){el.textContent=to+suf;return}
    const t0=performance.now();
    const step=now=>{
      const p=Math.min((now-t0)/DUR,1);
      el.textContent=Math.round(to*easeOutExpo(p))+suf;
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){run(e.target);cio.unobserve(e.target)}})},{threshold:.4});
  nums.forEach(el=>cio.observe(el));
})();

const gEls=[...document.querySelectorAll('.gallery .g img')];
if(gEls.length){
  const lb=document.createElement('div');lb.className='lb';
  lb.innerHTML='<span class="x">&times;</span><span class="nav prev">&#8249;</span><img alt=""><span class="nav next">&#8250;</span><span class="count"></span>';
  document.body.appendChild(lb);
  const lbImg=lb.querySelector('img'),cnt=lb.querySelector('.count');let idx=0;
  const show=i=>{idx=(i+gEls.length)%gEls.length;lbImg.src=gEls[idx].src;cnt.textContent=(idx+1)+' / '+gEls.length};
  gEls.forEach((im,i)=>im.parentElement.addEventListener('click',()=>{show(i);lb.classList.add('open')}));
  lb.querySelector('.x').onclick=()=>lb.classList.remove('open');
  lb.querySelector('.prev').onclick=e=>{e.stopPropagation();show(idx-1)};
  lb.querySelector('.next').onclick=e=>{e.stopPropagation();show(idx+1)};
  lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};
  addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)});
}

/* ============ SIGNATURE SHOWCASE (kinetic filmstrip) ============ */
(function(){
  const track=document.querySelector('.show-track');
  if(!track)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let hover=false,offscreen=true;
  const sync=()=>{track.style.animationPlayState=(hover||offscreen||reduce.matches)?'paused':'running'};
  track.addEventListener('mouseenter',()=>{hover=true;sync()});
  track.addEventListener('mouseleave',()=>{hover=false;sync()});
  if('IntersectionObserver' in window){
    new IntersectionObserver(([e])=>{offscreen=!e.isIntersecting;sync()},{threshold:.1}).observe(track);
  }else{
    offscreen=false;
  }
  sync();
})();

/* ============ PARALLAX (filmstrip + projektne naslovne slike, 3D dojam pri scrollu) ============ */
(function(){
  const cards=[...document.querySelectorAll('.show-card, .tile .ph')];
  if(!cards.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches)return;
  /* omotaj svaku sliku u .ph-in koji je viši od okvira, tako da translateY otkriva rezervu bez praznine */
  const phs=cards.map(card=>{
    const img=card.querySelector('img');
    const ph=document.createElement('span');
    ph.className='ph-in';
    img.parentNode.insertBefore(ph,img);
    ph.appendChild(img);
    return ph;
  });
  const RANGE=46; /* px maksimalnog pomaka gore/dolje */
  function update(){
    const h=innerHeight;
    cards.forEach((card,i)=>{
      const r=card.getBoundingClientRect();
      if(r.bottom<0||r.top>h)return;
      const p=(r.top+r.height/2-h/2)/h; /* ~ -0.5..0.5 dok kartica prolazi kroz viewport */
      phs[i].style.transform=`translateY(${(-p*RANGE*2).toFixed(1)}px)`;
    });
  }
  /* izravan poziv na scroll (bez rAF-gatinga) - par getBoundingClientRect poziva na 8 kartica je zanemarivo, a ne ovisi o tome je li rAF throttlean u pozadinskom tabu */
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update);
  update();
})();

/* ============ FLOATING BADGE DETAIL (tap-to-toggle na touch uređajima, hover/focus rade preko CSS-a) ============ */
(function(){
  const badges=[...document.querySelectorAll('.fbadge[data-detail]')];
  if(!badges.length)return;
  badges.forEach(b=>{
    b.setAttribute('tabindex','0');
    b.addEventListener('click',()=>{
      if(matchMedia('(hover: hover)').matches)return;
      const wasOpen=b.classList.contains('show-detail');
      badges.forEach(o=>o.classList.remove('show-detail'));
      if(!wasOpen)b.classList.add('show-detail');
    });
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.fbadge'))badges.forEach(b=>b.classList.remove('show-detail'));
  });
})();

/* ============ GRID SPOTLIGHT HOVER (grid3/grid2 dim-ostalih efekt, JS umjesto CSS :hover da gapovi između kartica ne okidaju dim na sve) ============ */
(function(){
  document.querySelectorAll('.grid3, .grid2').forEach(grid=>{
    grid.querySelectorAll(':scope > .tile').forEach(tile=>{
      tile.addEventListener('mouseenter',()=>{grid.classList.add('hovering');tile.classList.add('hovered')});
      tile.addEventListener('mouseleave',()=>{grid.classList.remove('hovering');tile.classList.remove('hovered')});
    });
  });
})();

// "Detaljnije" na stranicama usluga
(function(){document.querySelectorAll('.std-toggle').forEach(btn=>{const more=document.getElementById(btn.getAttribute('aria-controls'));const lab=btn.querySelector('.std-lab');if(!more)return;btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));more.classList.toggle('open',open);lab.textContent=open?'Zatvori':'Detaljnije';});});})();

// Google karta i pristanak na kolacice (samo na Kontaktu)
(function(){const w=document.querySelector('.map-wrap');if(!w)return;const b=w.querySelector('.map-load'),bar=document.getElementById('cookie-bar'),off=w.querySelector('.map-off');const KEY='dama-kolacici';const get=()=>{try{return localStorage.getItem(KEY)}catch(e){return null}};const set=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};function load(){const f=document.createElement('iframe');f.className='map';f.src=b.dataset.src;f.title=b.dataset.title;f.referrerPolicy='no-referrer-when-downgrade';b.replaceWith(f);off.hidden=false;}function accept(){set('da');bar.hidden=true;load();}const s=get();if(s==='da')load();else if(s!=='ne')bar.hidden=false;b.addEventListener('click',accept);bar.querySelector('.ck-yes').addEventListener('click',accept);bar.querySelector('.ck-no').addEventListener('click',()=>{set('ne');bar.hidden=true;});off.addEventListener('click',()=>{set('ne');location.reload();});})();

// Prikaz odabrane datoteke u kontakt formi
(function(){const i=document.getElementById('prilog');if(!i)return;const t=document.querySelector('.file-name');i.addEventListener('change',()=>{t.textContent=[...i.files].map(f=>f.name).join(', ');});})();

// O nama: slike u kolazu klize razlicitom brzinom dok se skrola
(function(){const els=[...document.querySelectorAll('.on-i[data-speed]')];if(!els.length||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const wide=matchMedia('(min-width:821px)');let tick=false;function run(){tick=false;const vh=innerHeight;els.forEach(e=>{if(!wide.matches){e.style.transform='';return}const r=e.getBoundingClientRect(),cur=new DOMMatrix(getComputedStyle(e).transform).m42,mid=r.top-cur+r.height/2;if(mid<-vh||mid>vh*2)return;e.style.transform=`translate3d(0,${((mid-vh/2)*parseFloat(e.dataset.speed)).toFixed(1)}px,0)`;});}function on(){if(!tick){tick=true;requestAnimationFrame(run)}}addEventListener('scroll',on,{passive:true});addEventListener('resize',on);run();})();
