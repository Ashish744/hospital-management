/* ==========================================================================
   dashboard.js — behaviour for admin-dashboard.html and public-dashboard.html.
   Sidebar tab switching (where present), mobile sidebar drawer, profile
   dropdown, hand-built SVG/CSS charts, live table search, and settings
   toggles. Loaded alongside main.js + animations.js, which already provide
   the preloader, cursor, spotlight, and magnetic buttons for free.
   ========================================================================== */

const reducedMotionDash = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   ENTRANCE — called by animations.js once the preloader exits, since
   dashboards have no .hero for the normal hero timeline to hook into.
   Above-the-fold stat counters / charts are intentionally NOT driven by
   the generic ScrollTrigger system (they'd finish before the loader even
   lifts) — this function times them explicitly instead.
--------------------------------------------------------------------- */
window.initDashboardEntrance = function(){
  const topbar = document.querySelector('.dash-topbar');
  const sidebar = document.querySelector('.dash-sidebar');
  const main = document.querySelector('.dash-main');

  if(window.gsap && !reducedMotionDash){
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if(topbar) tl.fromTo(topbar, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, 0);
    if(sidebar) tl.fromTo(sidebar, { x: -18, opacity: 0 }, {
      x: 0, opacity: 1, duration: .6, onComplete: () => gsap.set(sidebar, { clearProps: 'transform' })
    }, .1);
    if(main) tl.fromTo(main, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6 }, .2);
    tl.call(() => animateActivePanel());
  } else {
    animateActivePanel();
  }
};

function animateActivePanel(){
  // Admin dashboard scopes animations to the active tab panel; the public
  // dashboard has no tabs at all, so fall back to the whole main area.
  const active = document.querySelector('.dash-panel.is-active') || document.querySelector('.dash-main');
  if(!active) return;
  animateDashCounters(active);
  animateCharts(active);
  staggerCards(active);
}

/* ---------------------------------------------------------------------
   STAT COUNTERS — [data-dash-counter] (deliberately not the site-wide
   [data-counter] attribute, since that one relies on ScrollTrigger).
--------------------------------------------------------------------- */
function animateDashCounters(scope){
  scope.querySelectorAll('[data-dash-counter]').forEach(el => {
    const target = parseFloat(el.dataset.dashCounter);
    const decimals = (el.dataset.dashCounter.split('.')[1] || '').length;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if(!window.gsap || reducedMotionDash){ el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.4, ease: 'power2.out',
      onUpdate: () => { el.textContent = prefix + obj.val.toFixed(decimals) + suffix; }
    });
  });
}

/* ---------------------------------------------------------------------
   CARD STAGGER — simple entrance for grids inside a panel
--------------------------------------------------------------------- */
function staggerCards(scope){
  const groups = scope.querySelectorAll('[data-dash-stagger]');
  groups.forEach(group => {
    const items = group.children;
    if(!items.length) return;
    if(!window.gsap || reducedMotionDash){ return; }
    gsap.fromTo(items, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .06, ease: 'power2.out' });
  });
}

/* ---------------------------------------------------------------------
   CHARTS — bar chart heights, donut stroke, line chart draw-in
--------------------------------------------------------------------- */
function animateCharts(scope){
  // Bar chart: read target height from data-value (0–100) on each .bar
  scope.querySelectorAll('.bar-chart .bar').forEach((bar, i) => {
    const value = parseFloat(bar.dataset.value || '0');
    if(window.gsap && !reducedMotionDash){
      gsap.to(bar, { height: value + '%', duration: 1, delay: i * 0.06, ease: 'power3.out' });
    } else {
      bar.style.height = value + '%';
    }
  });

  // Donut chart: stroke-dashoffset from data-percent on the value circle
  scope.querySelectorAll('.donut-value').forEach(circle => {
    const percent = parseFloat(circle.dataset.percent || '0');
    const r = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - percent / 100);
    circle.style.strokeDasharray = circumference;
    if(window.gsap && !reducedMotionDash){
      gsap.fromTo(circle, { strokeDashoffset: circumference }, { strokeDashoffset: offset, duration: 1.3, ease: 'power2.out' });
    } else {
      circle.style.strokeDashoffset = offset;
    }
  });

  // Line chart: draw the path, then fade in the area fill + points
  scope.querySelectorAll('.line-chart').forEach(svg => {
    const line = svg.querySelector('.line');
    const area = svg.querySelector('.area');
    const points = svg.querySelectorAll('circle');
    if(!line) return;
    const len = line.getTotalLength();
    if(window.gsap && !reducedMotionDash){
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(area, { opacity: 0 });
      gsap.set(points, { opacity: 0, scale: 0, transformOrigin: 'center' });
      const tl = gsap.timeline();
      tl.to(line, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' })
        .to(area, { opacity: .5, duration: .6 }, '-=.4')
        .to(points, { opacity: 1, scale: 1, duration: .4, stagger: .05, ease: 'back.out(2)' }, '-=.5');
    } else {
      line.style.strokeDasharray = 'none';
    }
  });
}

/* ---------------------------------------------------------------------
   SIDEBAR TAB SWITCHING — click a sidebar link, show its panel
--------------------------------------------------------------------- */
function initSidebarNav(){
  const links = document.querySelectorAll('.sidebar-link[data-panel]');
  if(!links.length) return;
  const panels = document.querySelectorAll('.dash-panel');
  if(!panels.length){
    initPublicSidebarNav(links);
    return;
  }
  const title = document.querySelector('[data-dash-title]');
  const subtitle = document.querySelector('[data-dash-subtitle]');
  const initialTarget = location.hash.slice(1);
  const initialPanel = initialTarget && document.getElementById(initialTarget);
  if(initialPanel){
    links.forEach(link => link.classList.toggle('is-active', link.dataset.panel === initialTarget));
    panels.forEach(panel => panel.classList.toggle('is-active', panel.id === initialTarget));
    if(title) title.textContent = document.querySelector(`[data-panel="${initialTarget}"]`)?.dataset.title || title.textContent;
    if(subtitle) subtitle.textContent = document.querySelector(`[data-panel="${initialTarget}"]`)?.dataset.subtitle || subtitle.textContent;
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.panel;
      if(link.classList.contains('is-active')) return;

      links.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');

      panels.forEach(p => p.classList.toggle('is-active', p.id === target));
      history.pushState(null, '', '#' + target);
      if(title) title.textContent = link.dataset.title || link.textContent.trim();
      if(subtitle) subtitle.textContent = link.dataset.subtitle || '';

      const activePanel = document.getElementById(target);
      if(activePanel){
        if(window.gsap && !reducedMotionDash){
          gsap.fromTo(activePanel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out' });
        }
        animateDashCounters(activePanel);
        animateCharts(activePanel);
        staggerCards(activePanel);
      }
      closeMobileSidebar();
    });
  });
}

function initPublicSidebarNav(links){
  const panelGroups = {
    overview: ['.welcome-banner', '.quick-actions', '.overview-glance'],
    appointment: ['#appointment', '#appointment + .card'],
    careteam: ['#careteam', '#careteam + .dash-stats'],
    services: ['#services', '#services + .dept-grid'],
    health: ['#health', '#health + .health-summary-grid'],
    history: ['#history', '#history + .card'],
    prescriptions: ['#prescriptions', '#prescriptions .section-title-row', '#prescriptions .rx-item'],
    messages: ['#messages', '#messages .section-title-row', '#messages .notif-list'],
    billing: ['#billing', '#billing + .chart-row'],
    documents: ['#documents', '#documents + .card']
  };
  const allGroups = Object.values(panelGroups).flatMap(selectors => selectors);
  const hideAll = () => {
    document.querySelectorAll(allGroups.join(',')).forEach(element => { element.hidden = true; });
  };
  const showPanel = (target) => {
    hideAll();
    (panelGroups[target] || []).forEach(selector => {
      document.querySelectorAll(selector).forEach(element => { element.hidden = false; });
    });
  };

  const initialTarget = location.hash.slice(1);
  const activeTarget = panelGroups[initialTarget] ? initialTarget : 'overview';
  showPanel(activeTarget);
  links.forEach(link => link.classList.toggle('is-active', link.dataset.panel === activeTarget));

  const syncHashPanel = () => {
    const target = location.hash.slice(1);
    if(!panelGroups[target]) return;
    showPanel(target);
    links.forEach(link => link.classList.toggle('is-active', link.dataset.panel === target));
  };
  window.addEventListener('load', syncHashPanel);
  window.addEventListener('hashchange', syncHashPanel);

  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.dataset.panel;
      links.forEach(item => item.classList.remove('is-active'));
      link.classList.add('is-active');
      showPanel(target);
      history.pushState(null, '', '#' + target);
      closeMobileSidebar();
    });
  });
}

/* ---------------------------------------------------------------------
   SCROLLSPY — for sidebars that link to page anchors instead of swapping
   panels (public dashboard). Ignores any link with [data-panel], since
   those are handled by initSidebarNav() above.
--------------------------------------------------------------------- */
function initSidebarScrollspy(){
  const links = Array.from(document.querySelectorAll('.sidebar-link:not([data-panel])[href^="#"]'));
  if(!links.length) return;
  const sections = links
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);
  if(!sections.length) return;

  const setActive = (id) => {
    links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
  };

  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(sec => observer.observe(sec));
  }

  links.forEach(link => {
    link.addEventListener('click', () => closeMobileSidebar());
  });
}

/* ---------------------------------------------------------------------
   MOBILE SIDEBAR DRAWER
--------------------------------------------------------------------- */
function closeMobileSidebar(){
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('no-scroll');
  document.documentElement.classList.remove('no-scroll');
  const toggle = document.querySelector('.sidebar-toggle');
  if(toggle){
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open sidebar');
  }
  const backdrop = document.querySelector('.sidebar-backdrop');
  if(backdrop) backdrop.classList.remove('is-visible');
}
function initSidebarToggle(){
  const toggle = document.querySelector('.sidebar-toggle');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if(!toggle) return;
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('sidebar-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close sidebar' : 'Open sidebar');
    document.body.classList.toggle('no-scroll', open);
    document.documentElement.classList.toggle('no-scroll', open);
    if(backdrop) backdrop.classList.toggle('is-visible', open);
  });
  if(backdrop) backdrop.addEventListener('click', closeMobileSidebar);
  window.addEventListener('resize', () => { if(window.innerWidth > 1024) closeMobileSidebar(); });
}

/* ---------------------------------------------------------------------
   PROFILE DROPDOWN
--------------------------------------------------------------------- */
function initProfileWidget(){
  const widget = document.querySelector('.profile-widget');
  if(!widget) return;
  const trigger = widget.querySelector('.profile-trigger');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('is-open');
  });
  document.addEventListener('click', (e) => {
    if(!widget.contains(e.target)) widget.classList.remove('is-open');
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') widget.classList.remove('is-open');
  });

  const logoutBtn = widget.querySelector('[data-logout]');
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
      try{ localStorage.removeItem('meridian_demo_session'); }catch(err){}
      window.location.href = 'index.html';
    });
  }
}

/* ---------------------------------------------------------------------
   TABLE SEARCH — live filter of table rows by visible text
--------------------------------------------------------------------- */
function initTableSearch(){
  document.querySelectorAll('[data-table-search]').forEach(input => {
    const table = document.querySelector(input.dataset.tableSearch);
    if(!table) return;
    const rows = table.querySelectorAll('tbody tr');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      rows.forEach(row => {
        const match = row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
      });
    });
  });
}

/* ---------------------------------------------------------------------
   SETTINGS TOGGLES
--------------------------------------------------------------------- */
function initToggles(){
  document.querySelectorAll('.toggle-switch').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('is-on'));
  });
}

/* ---------------------------------------------------------------------
   MESSAGES PANEL — clicking a conversation swaps the thread preview
--------------------------------------------------------------------- */
function initMessagesPanel(){
  document.querySelectorAll('.msg-list-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.msg-list-item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      const name = item.querySelector('.msg-list-name')?.textContent;
      const nameEl = document.querySelector('[data-thread-name]');
      if(nameEl && name) nameEl.textContent = name;
    });
  });
}

/* ---------------------------------------------------------------------
   PERSONALIZE FROM DEMO SESSION (public dashboard only)
--------------------------------------------------------------------- */
function personalizeFromSession(){
  const nameTargets = document.querySelectorAll('[data-session-name]');
  const emailTargets = document.querySelectorAll('[data-session-email]');
  if(!nameTargets.length && !emailTargets.length) return;
  try{
    const raw = localStorage.getItem('meridian_demo_session');
    if(!raw) return;
    const session = JSON.parse(raw);
    const label = session.email ? session.email.split('@')[0] : null;
    const display = label ? label.charAt(0).toUpperCase() + label.slice(1) : null;
    if(display) nameTargets.forEach(el => { el.textContent = display; });
    if(session.email) emailTargets.forEach(el => { el.textContent = session.email; });
  }catch(e){ /* no session — keep demo defaults already in the markup */ }
}

/* ---------------------------------------------------------------------
   INIT
--------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarNav();
  initSidebarScrollspy();
  initSidebarToggle();
  initProfileWidget();
  initTableSearch();
  initToggles();
  initMessagesPanel();
  personalizeFromSession();
});
