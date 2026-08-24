/* ==========================================================================
   main.js — core site behaviour (non-scroll-animation).
   Loader control, navigation, cursor, spotlight, magnetic buttons, page
   transitions. Scroll-triggered storytelling lives in animations.js.
   ========================================================================== */

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   1. PRELOADER
   Simulates asset-readiness with a progress fill, then hands off to
   window.initHeroSequence() (defined in animations.js) on exit.
--------------------------------------------------------------------- */
function initPreloader(){
  const loader = document.getElementById('preloader');
  if(!loader){ document.body.classList.add('is-ready'); return; }

  const fill = loader.querySelector('.loader-progress-fill');
  const percentEl = loader.querySelector('.loader-percent-value');
  const cells = loader.querySelectorAll('.loader-cell');

  const TOTAL_DURATION = 2000; // preloader shows for exactly 2 seconds
  const STEP_INTERVAL = 120;
  const startTime = Date.now();

  const tl = window.gsap ? gsap.timeline() : null;
  if(tl){
    tl.to(cells, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out' });
  } else {
    cells.forEach(c => { c.style.opacity = 1; c.style.transform = 'none'; });
  }

  const step = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
    if(fill) fill.style.width = progress + '%';
    if(percentEl) percentEl.textContent = Math.floor(progress) + '%';
    if(elapsed < TOTAL_DURATION){
      setTimeout(step, STEP_INTERVAL);
    } else {
      exitLoader();
    }
  };

  const exitLoader = () => {
    document.body.classList.add('is-ready');
    if(window.gsap){
      gsap.timeline({ onComplete: () => { loader.style.display = 'none'; } })
        .to(cells, { opacity: 0, y: -14, duration: .4, stagger: .05, ease: 'power2.in' })
        .to(loader, { yPercent: -100, duration: .8, ease: 'expo.inOut' }, '-=.15')
        .call(() => { if(window.initHeroSequence) window.initHeroSequence(); }, null, '-=.3');
    } else {
      loader.style.display = 'none';
      if(window.initHeroSequence) window.initHeroSequence();
    }
  };

  // Kick off immediately so the full 2s budget is used for the loader itself
  let started = false;
  const start = () => { if(started) return; started = true; step(); };
  window.addEventListener('load', start);
  // Safety net in case 'load' already fired
  if(document.readyState === 'complete') start();
}

/* ---------------------------------------------------------------------
   2. NAVBAR — entrance + scroll shadow + active link
--------------------------------------------------------------------- */
function initNavbar(){
  const nav = document.getElementById('navbar');
  if(!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mark active link by matching current filename
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === current || (current === '' && href === 'index.html')){
      a.classList.add('is-active');
    }
  });
}

/* ---------------------------------------------------------------------
   3. MOBILE MENU — full-screen animated nav
--------------------------------------------------------------------- */
function initMobileMenu(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if(!toggle || !menu) return;

  const links = menu.querySelectorAll('.mobile-menu-links a');
  const actions = menu.querySelector('.mobile-menu-actions');
  let open = false;

  const setOpen = (val) => {
    open = val;
    document.documentElement.classList.toggle('nav-open', open);
    document.documentElement.classList.toggle('no-scroll', open);
    document.body.classList.toggle('no-scroll', open);
    toggle.setAttribute('aria-expanded', String(open));

    if(window.gsap){
      if(open){
        gsap.to(menu, { clipPath: 'circle(150% at calc(100% - 46px) 46px)', duration: .7, ease: 'power3.inOut' });
        gsap.to(links, { opacity: 1, y: 0, duration: .6, stagger: .07, delay: .25, ease: 'power3.out' });
        gsap.to(actions, { opacity: 1, y: 0, duration: .6, delay: .25 + links.length * .07, ease: 'power3.out' });
      } else {
        gsap.to([links, actions], { opacity: 0, y: 28, duration: .3, ease: 'power2.in' });
        gsap.to(menu, { clipPath: 'circle(0px at calc(100% - 46px) 46px)', duration: .55, ease: 'power3.inOut', delay: .1 });
      }
    } else {
      menu.style.visibility = open ? 'visible' : 'hidden';
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));
  links.forEach(a => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('resize', () => { if(window.innerWidth > 1024 && open) setOpen(false); });
}

/* ---------------------------------------------------------------------
   4. CUSTOM CURSOR (desktop only)
--------------------------------------------------------------------- */
function initCustomCursor(){
  if(isTouch) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if(!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  const tick = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.querySelectorAll('a, button, .magnetic-target, .card-spotlight').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  });
}

/* ---------------------------------------------------------------------
   5. HOVER SPOTLIGHT — radial highlight that follows the cursor
--------------------------------------------------------------------- */
function initHoverSpotlight(){
  if(isTouch) return;
  document.querySelectorAll('.card-spotlight').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

/* ---------------------------------------------------------------------
   6. MAGNETIC BUTTONS
--------------------------------------------------------------------- */
function initMagneticButtons(){
  if(isTouch || !window.gsap) return;
  document.querySelectorAll('.magnetic-target').forEach(el => {
    const strength = 22;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width / 2;
      const relY = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: relX / r.width * strength, y: relY / r.height * strength, duration: .5, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ---------------------------------------------------------------------
   7. FOOTER GLOW — mouse-following glow behind the footer headline
--------------------------------------------------------------------- */
function initFooterGlow(){
  if(isTouch) return;
  const hero = document.querySelector('.footer-hero');
  if(!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--fx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--fy', (e.clientY - r.top) + 'px');
  });
}

/* ---------------------------------------------------------------------
   8. SCRAMBLE TEXT ON HOVER (buttons / small labels)
--------------------------------------------------------------------- */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scrambleInto(el, finalText, duration = 500){
  const start = performance.now();
  const original = finalText.split('');
  function frame(now){
    const progress = Math.min(1, (now - start) / duration);
    const revealCount = Math.floor(progress * original.length);
    el.textContent = original.map((ch, i) => {
      if(ch === ' ') return ' ';
      if(i < revealCount) return ch;
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }).join('');
    if(progress < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}
function initScrambleText(){
  document.querySelectorAll('.scramble').forEach(el => {
    const finalText = el.dataset.text || el.textContent;
    el.dataset.text = finalText;
    const target = el.closest('.magnetic-target') || el;
    target.addEventListener('mouseenter', () => { if(!isTouch) scrambleInto(el, finalText); });
  });

  // ambient "system online" style labels that scramble every so often
  document.querySelectorAll('.scramble-auto').forEach(el => {
    const finalText = el.textContent;
    setInterval(() => { if(!prefersReducedMotion) scrambleInto(el, finalText, 700); }, 6000 + Math.random() * 3000);
  });
}

/* ---------------------------------------------------------------------
   9. MOBILE ACCORDION (used by FAQ / expandable cards)
--------------------------------------------------------------------- */
function initExpandables(){
  document.querySelectorAll('.expandable').forEach(item => {
    const trigger = item.querySelector('.expandable-trigger');
    const panel = item.querySelector('.expandable-panel');
    if(!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if(window.gsap){
        gsap.to(panel, { height: isOpen ? 0 : panel.scrollHeight, duration: .45, ease: 'power2.inOut' });
      } else {
        panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
      }
    });
  });
}

/* ---------------------------------------------------------------------
   10. SIMPLE PAGE TRANSITIONS between internal HTML pages
--------------------------------------------------------------------- */
function initPageTransitions(){
  const overlay = document.getElementById('page-transition');
  if(!overlay || !window.gsap) return;

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.target === '_blank') return;
    if(!href.endsWith('.html')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.set(overlay, { display: 'flex' });
      gsap.fromTo(overlay, { yPercent: 100 }, {
        yPercent: 0, duration: .55, ease: 'power3.inOut',
        onComplete: () => { window.location.href = href; }
      });
    });
  });

  window.addEventListener('pageshow', () => {
    if(window.gsap){
      gsap.to(overlay, { yPercent: -100, duration: .6, ease: 'power3.inOut', delay: .05,
        onComplete: () => gsap.set(overlay, { display: 'none', yPercent: 100 }) });
    }
  });
}

/* ---------------------------------------------------------------------
   11. CATEGORY FILTER — pill buttons that show/hide tagged items
   Markup contract: .filter-bar[data-filter-target="#grid"] wraps buttons
   with [data-filter="value"]; matching items carry [data-category="value"].
--------------------------------------------------------------------- */
function initCategoryFilters(){
  document.querySelectorAll('.filter-bar').forEach(bar => {
    const targetSelector = bar.dataset.filterTarget;
    const container = targetSelector ? document.querySelector(targetSelector) : null;
    if(!container) return;
    const buttons = bar.querySelectorAll('[data-filter]');
    const items = container.querySelectorAll('[data-category]');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;

        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          if(window.gsap && !prefersReducedMotion){
            if(match){
              item.style.display = '';
              gsap.fromTo(item, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .35, ease: 'power2.out' });
            } else {
              gsap.to(item, { opacity: 0, scale: .94, duration: .25, ease: 'power2.in',
                onComplete: () => { item.style.display = 'none'; } });
            }
          } else {
            item.style.display = match ? '' : 'none';
          }
        });
      });
    });
  });
}

/* ---------------------------------------------------------------------
   INIT
--------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbar();
  initMobileMenu();
  initCustomCursor();
  initHoverSpotlight();
  initMagneticButtons();
  initFooterGlow();
  initScrambleText();
  initExpandables();
  initPageTransitions();
  initCategoryFilters();
});
