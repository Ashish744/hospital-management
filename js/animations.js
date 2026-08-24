/* ==========================================================================
   animations.js — GSAP animation architecture.
   Every scroll-triggered effect is registered as a named preset and applied
   declaratively via data-attributes, so sections don't share one identical
   "fade up" motion — each has its own animation personality (see README).
   ========================================================================== */

(function(){
  if(!window.gsap){ console.warn('GSAP not loaded — animations.js skipped.'); return; }

  gsap.registerPlugin(ScrollTrigger);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  /* ----------------------------------------------------------------
     SPLIT TEXT — lightweight custom splitter (chars or words)
  ---------------------------------------------------------------- */
  function splitText(el, mode = 'words'){
    const text = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);
    const units = mode === 'chars' ? text.split('') : text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    units.forEach(unit => {
      if(unit === '') return;
      if(/^\s+$/.test(unit)){ frag.appendChild(document.createTextNode(unit)); return; }
      const span = document.createElement('span');
      span.className = mode === 'chars' ? 'split-char' : 'split-word';
      span.textContent = unit;
      span.setAttribute('aria-hidden', 'true');
      frag.appendChild(span);
    });
    el.appendChild(frag);
    return el.querySelectorAll(mode === 'chars' ? '.split-char' : '.split-word');
  }

  function initSplitTextTargets(){
    document.querySelectorAll('[data-split]').forEach(el => {
      const mode = el.dataset.split === 'chars' ? 'chars' : 'words';
      const units = splitText(el, mode);
      if(el.dataset.splitAuto === 'true'){
        gsap.set(units, { yPercent: 120, opacity: 0, rotate: 4 });
        ScrollTrigger.create({
          trigger: el, start: 'top 85%',
          onEnter: () => gsap.to(units, { yPercent: 0, opacity: 1, rotate: 0, duration: .9, stagger: 0.025, ease: 'power4.out' })
        });
      }
    });
  }

  /* ----------------------------------------------------------------
     SCROLL REVEAL PRESETS — applied via data-animate="preset"
  ---------------------------------------------------------------- */
  const presets = {
    'fade-up': (el) => gsap.fromTo(el, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out' }),
    'fade-left': (el) => gsap.fromTo(el, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: 'power3.out' }),
    'fade-right': (el) => gsap.fromTo(el, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: 'power3.out' }),
    'scale-reveal': (el) => gsap.fromTo(el, { scale: .88, opacity: 0 }, { scale: 1, opacity: 1, duration: .85, ease: 'back.out(1.5)' }),
    'blur-reveal': (el) => gsap.fromTo(el, { filter: 'blur(14px)', opacity: 0, y: 20 }, { filter: 'blur(0px)', opacity: 1, y: 0, duration: 1, ease: 'power2.out' }),
    'rotate-reveal': (el) => gsap.fromTo(el, { rotateX: -35, opacity: 0, transformPerspective: 700 }, { rotateX: 0, opacity: 1, duration: .9, ease: 'power3.out' }),
    'mask-reveal': (el) => {
      const dir = el.dataset.maskDir || 'left';
      const clipFrom = {
        left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)',
        bottom: 'inset(0 0 100% 0)', top: 'inset(100% 0 0 0)'
      }[dir];
      gsap.fromTo(el, { clipPath: clipFrom }, { clipPath: 'inset(0 0 0 0)', duration: 1.1, ease: 'power4.inOut' });
    }
  };

  function initScrollReveal(){
    document.querySelectorAll('[data-animate]').forEach(el => {
      const preset = presets[el.dataset.animate];
      if(!preset) return;
      if(reduced){ gsap.set(el, { clearProps: 'all', opacity: 1 }); return; }
      ScrollTrigger.create({
        trigger: el,
        start: el.dataset.start || 'top 88%',
        onEnter: () => preset(el)
      });
    });
  }

  function initStaggerGroups(){
    document.querySelectorAll('[data-stagger-group]').forEach(group => {
      const items = group.querySelectorAll('[data-stagger-item]');
      if(!items.length) return;
      if(reduced){ gsap.set(items, { opacity: 1, y: 0 }); return; }
      gsap.set(items, { y: 36, opacity: 0 });
      ScrollTrigger.create({
        trigger: group, start: 'top 85%',
        onEnter: () => gsap.to(items, { y: 0, opacity: 1, duration: .7, stagger: .1, ease: 'power3.out' })
      });
    });
  }

  /* ----------------------------------------------------------------
     COUNTERS — animate 0 → target when in view
  ---------------------------------------------------------------- */
  function initCounters(){
    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseFloat(el.dataset.counter);
      const decimals = (el.dataset.counter.split('.')[1] || '').length;
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => { el.textContent = obj.val.toFixed(decimals); }
        })
      });
    });
  }

  /* ----------------------------------------------------------------
     HERO — choreographed entrance timeline (called by main.js after loader)
  ---------------------------------------------------------------- */
  window.initHeroSequence = function(){
    const nav = document.getElementById('navbar');
    const hero = document.querySelector('.hero');
    if(!hero){
      if(nav) gsap.to(nav, { y: 0, duration: .6, ease: 'power3.out' });
      // Dashboard pages have no .hero — hand off to their own entrance sequence if present.
      if(window.initDashboardEntrance) window.initDashboardEntrance();
      // Same idea for the login / create-account pages' push-in scene.
      if(window.initAuthPushIn) window.initAuthPushIn();
      return;
    }

    const badge = hero.querySelector('.eyebrow');
    const heading = hero.querySelector('[data-hero-heading]');
    const sub = hero.querySelector('.hero-copy .lede');
    const actions = hero.querySelector('.hero-actions');
    const maskFill = hero.querySelector('.mask-fill');
    const cards = hero.querySelectorAll('.floating-card');
    const stats = hero.querySelector('.hero-stats-strip');
    const scrollInd = hero.querySelector('.scroll-indicator');

    const headingUnits = heading ? splitText(heading, 'words') : [];

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if(nav) tl.to(nav, { y: 0, duration: .7, ease: 'power3.out' }, 0);
    if(badge) tl.fromTo(badge, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, .15);
    if(headingUnits.length){
      gsap.set(headingUnits, { yPercent: 130, opacity: 0 });
      tl.to(headingUnits, { yPercent: 0, opacity: 1, duration: .9, stagger: .045 }, .3);
    }
    if(sub) tl.fromTo(sub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .7);
    if(actions) tl.fromTo(actions, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .8);
    if(maskFill){
      tl.to(maskFill, { scaleY: 0, duration: 1, ease: 'power4.inOut' }, .5);
    }
    if(cards.length) tl.to(cards, { opacity: 1, y: 0, duration: .7, stagger: .12 }, 1.0);
    if(stats) tl.fromTo(stats, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6 }, 1.2);
    if(scrollInd) tl.fromTo(scrollInd, { opacity: 0 }, { opacity: 1, duration: .5 }, 1.4);

    // continuous ambient motion after entrance settles
    tl.call(() => { if(!reduced) startAmbientLoops(); });
  };

  function startAmbientLoops(){
    // floating cards drift
    document.querySelectorAll('.floating-card').forEach((card, i) => {
      gsap.to(card, {
        y: '+=14', duration: 3.2 + i * 0.6, ease: 'sine.inOut',
        yoyo: true, repeat: -1
      });
    });
    // hero background line: slow pulse-drawn stroke
    const line = document.querySelector('.hero-bg-line path');
    if(line){
      const len = line.getTotalLength ? line.getTotalLength() : 1000;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, { strokeDashoffset: 0, duration: 3.4, ease: 'power2.inOut' });
    }
    // scroll-indicator subtle pulse handled in CSS
  }

  /* ----------------------------------------------------------------
     PATIENT JOURNEY — pinned horizontal scroll (desktop); vertical on mobile
  ---------------------------------------------------------------- */
  function initJourneyScroll(){
    const pin = document.querySelector('.journey-pin');
    const track = document.querySelector('.journey-track');
    if(!pin || !track) return;

    if(isMobile){
      pin.style.height = 'auto';
      return;
    }

    const getScrollAmount = () => {
      const padRight = parseFloat(getComputedStyle(track).paddingRight) || 40;
      return track.scrollWidth - window.innerWidth + padRight;
    };

    let tween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => '+=' + (getScrollAmount() + window.innerHeight),
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true
      }
    });
  }

  /* ----------------------------------------------------------------
     WHY CHOOSE US — sticky storytelling, active item follows scroll
  ---------------------------------------------------------------- */
  function initWhySticky(){
    const items = document.querySelectorAll('.why-item');
    if(!items.length) return;
    items.forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter: () => setActiveWhy(i),
        onEnterBack: () => setActiveWhy(i)
      });
    });
    function setActiveWhy(i){
      items.forEach((it, idx) => it.classList.toggle('is-active', idx === i));
      const stat = document.querySelector('.why-visual-stat [data-counter]');
      // keep visual in sync if section provides per-item imagery via data-bg
      const img = document.querySelector('.why-visual img');
      const src = items[i].dataset.image;
      if(img && src && img.dataset.current !== src){
        img.dataset.current = src;
        gsap.to(img, { opacity: 0, duration: .25, onComplete: () => {
          img.src = src;
          gsap.to(img, { opacity: .85, duration: .35 });
        }});
      }
    }
  }

  /* ----------------------------------------------------------------
     TESTIMONIALS — auto-rotating slider with manual controls
  ---------------------------------------------------------------- */
  function initTestimonials(){
    const stage = document.querySelector('.testi-stage');
    if(!stage) return;
    const cards = stage.querySelectorAll('.testi-card');
    const dots = document.querySelectorAll('.testi-dot');
    const prev = document.querySelector('.testi-arrow--prev');
    const next = document.querySelector('.testi-arrow--next');
    let index = 0, timer;

    function show(i){
      const prevIndex = index;
      index = (i + cards.length) % cards.length;
      if(index === prevIndex && cards[index].classList.contains('is-active')) return;

      cards.forEach((c, idx) => c.classList.toggle('is-active', idx === index));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === index));

      if(window.gsap && !reduced){
        // Fade the outgoing card out explicitly — GSAP sets opacity via
        // inline style, which otherwise permanently overrides the CSS
        // ".testi-card{opacity:0}" rule once a card has been shown, causing
        // every previously-shown card to stay stuck visible (double-exposure).
        if(prevIndex !== index){
          gsap.to(cards[prevIndex], { opacity: 0, y: -12, duration: .35, ease: 'power2.in' });
        }
        gsap.fromTo(cards[index], { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out', delay: prevIndex !== index ? .15 : 0 });
      }
    }
    function restart(){
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5500);
    }
    show(0); restart();
    next && next.addEventListener('click', () => { show(index + 1); restart(); });
    prev && prev.addEventListener('click', () => { show(index - 1); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); restart(); }));
  }

  /* ----------------------------------------------------------------
     MORPHING HEADLINE — automatic word swap (hero substrip / CTA)
  ---------------------------------------------------------------- */
  function initMorphText(){
    document.querySelectorAll('[data-morph]').forEach(el => {
      const words = el.dataset.morph.split(',').map(w => w.trim()).filter(Boolean);
      if(words.length < 2) return;
      let i = 0;
      el.textContent = words[0];
      setInterval(() => {
        if(reduced) return;
        i = (i + 1) % words.length;
        gsap.to(el, {
          yPercent: -120, opacity: 0, duration: .35, ease: 'power2.in',
          onComplete: () => {
            el.textContent = words[i];
            gsap.fromTo(el, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: 'power3.out' });
          }
        });
      }, 2600);
    });
  }

  /* ----------------------------------------------------------------
     3D CARD TILT (doctor cards) — desktop only, cursor-driven
  ---------------------------------------------------------------- */
  function initCardTilt(){
    if(isMobile) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const inner = card.querySelector('[data-tilt-inner]') || card;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(inner, { rotateY: px * 12, rotateX: -py * 12, duration: .5, ease: 'power2.out', transformPerspective: 800 });
      });
      card.addEventListener('mouseleave', () => gsap.to(inner, { rotateY: 0, rotateX: 0, duration: .6, ease: 'power3.out' }));
    });
  }

  /* ----------------------------------------------------------------
     TRAVELING PULSE — a bright "comet" segment that runs continuously
     along any <path class="pulse-travel">, like a live ECG trace. Used
     by the home hero's vitals strip and the interior-page hero lines.
  ---------------------------------------------------------------- */
  function initTravelingPulse(){
    document.querySelectorAll('.pulse-travel').forEach(path => {
      const len = path.getTotalLength();
      if(reduced){
        path.style.strokeDasharray = 'none';
        path.style.opacity = .8;
        return;
      }
      const comet = len * 0.16;
      gsap.set(path, { strokeDasharray: `${comet} ${len - comet}`, strokeDashoffset: 0, opacity: 1 });
      gsap.to(path, { strokeDashoffset: -len, duration: 2.6, ease: 'none', repeat: -1 });
    });
  }

  /* ----------------------------------------------------------------
     PAGE HERO DECOR — draws in the interior-page pulse line once, then
     sets the floating medical icons drifting continuously (About/
     Services/Blog/Contact hero backgrounds). Also cycles the ambient
     aurora blobs through the brand palette so the background keeps
     changing on its own.
  ---------------------------------------------------------------- */
  function initPageHeroDecor(){
    document.querySelectorAll('.page-hero-line path').forEach(path => {
      if(reduced){ return; }
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', delay: .2 });
    });

    if(reduced) return;

    document.querySelectorAll('.page-hero-icon').forEach((icon, i) => {
      gsap.to(icon, {
        y: '+=18', duration: 3 + i * 0.5, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: i * 0.2
      });
      gsap.to(icon, {
        rotate: i % 2 === 0 ? 8 : -8, duration: 4 + i * 0.4, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: i * 0.15
      });
    });

    // Aurora blobs: drift slowly and cycle through the brand palette so
    // the background reads as "always changing" without needing photos.
    // (Literal hex values here, not var() — GSAP needs resolved colors
    // to interpolate between, it won't resolve custom properties itself.)
    const palette = ['#1C9C8F', '#FF6B52', '#BFE8DE'];
    document.querySelectorAll('.page-hero-blob').forEach((blob, i) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 6 + i * 1.5, ease: 'sine.inOut' } });
      tl.to(blob, { x: i % 2 === 0 ? 60 : -60, y: 40, scale: 1.15 }, 0);
      gsap.to(blob, {
        backgroundColor: palette[(i + 1) % palette.length],
        duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 1.2
      });
    });
  }

  /* ----------------------------------------------------------------
     INIT
  ---------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initSplitTextTargets();
    initScrollReveal();
    initStaggerGroups();
    initCounters();
    initJourneyScroll();
    initWhySticky();
    initTestimonials();
    initMorphText();
    initCardTilt();
    initPageHeroDecor();
    initTravelingPulse();

    window.addEventListener('resize', () => ScrollTrigger.refresh());
  });
})();
