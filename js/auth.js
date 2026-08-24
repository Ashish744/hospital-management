/* ==========================================================================
   auth.js — behaviour specific to login.html and create-account.html.
   Password visibility, live strength meter, and wiring both forms to the
   shared MeridianValidate engine from validation.js.
   ========================================================================== */

/* ----------------------------------------------------------------
   PUSH-IN SCENE — a small running figure "pushes" the auth panel in
   from the left. Called by animations.js's initHeroSequence once the
   preloader exits (same hand-off pattern as the dashboard entrance),
   so the reveal is timed to the moment the loader lifts away.
---------------------------------------------------------------- */
window.initAuthPushIn = function(){
  const scene = document.querySelector('.auth-push-scene');
  if(!scene || !window.gsap) return;

  const figure = scene.querySelector('.push-figure-wrap');
  const motionLines = scene.querySelector('.push-motion-lines');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(reducedMotion){
    gsap.set(scene, { xPercent: 0 });
    if(motionLines) gsap.set(motionLines, { opacity: 0 });
    return;
  }

  gsap.set(scene, { xPercent: -100 });
  if(motionLines) gsap.set(motionLines, { opacity: 0 });

  const tl = gsap.timeline({ delay: .25 });

  // the panel slides in as if being pushed the whole way
  tl.to(scene, { xPercent: 0, duration: 1.15, ease: 'power3.out' }, 0);

  // quick speed-lines flash right as the push starts
  if(motionLines){
    tl.to(motionLines, { opacity: 1, duration: .12 }, 0.05)
      .to(motionLines, { opacity: 0, duration: .35 }, 0.5);
  }

  // the figure itself leans/wobbles like it's straining to push, then
  // gives a little satisfied bounce once the panel lands
  if(figure){
    gsap.set(figure, { transformOrigin: '50% 100%' });
    tl.to(figure, { rotate: -5, duration: .15, ease: 'sine.inOut', repeat: 6, yoyo: true }, 0.1)
      .to(figure, { scale: 1.12, duration: .18, ease: 'back.out(3)' }, 1.05)
      .to(figure, { scale: 1, duration: .3, ease: 'power2.out' }, 1.23);
  }
};

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Password show/hide ---------------- */
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    const wrap = btn.closest('.input-wrap');
    const input = wrap ? wrap.querySelector('input') : null;
    if(!input) return;
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('is-visible', show);
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      if(window.gsap){
        gsap.fromTo(btn, { scale: .7, rotate: -15 }, { scale: 1, rotate: 0, duration: .35, ease: 'back.out(2)' });
      }
    });
  });

  /* ---------------- Password strength meter ---------------- */
  document.querySelectorAll('[data-strength-for]').forEach(meterWrap => {
    const input = document.getElementById(meterWrap.dataset.strengthFor);
    const label = meterWrap.querySelector('.strength-label');
    if(!input) return;
    input.addEventListener('input', () => {
      const { score, label: text } = MeridianValidate.passwordStrength(input.value);
      meterWrap.className = meterWrap.className.replace(/\bstrength-\d\b/g, '').trim();
      if(score > 0) meterWrap.classList.add('strength-' + score);
      if(label) label.textContent = text;
    });
  });

  /* ---------------- LOGIN FORM ---------------- */
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const roleButtons = document.querySelectorAll('[data-login-role]');
    const roleError = document.querySelector('.login-role-error');
    let selectedRole = '';

    roleButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedRole = button.dataset.loginRole;
        roleButtons.forEach(option => {
          const isSelected = option === button;
          option.classList.toggle('is-selected', isSelected);
          option.setAttribute('aria-pressed', String(isSelected));
        });
        if(roleError) roleError.textContent = '';
      });
    });

    MeridianValidate.bindForm(loginForm, [
      { input: email, validator: MeridianValidate.validateEmail },
      { input: password, validator: (v) => MeridianValidate.validatePassword(v, { minLength: 8 }) }
    ], (data) => {
      if(!selectedRole){
        if(roleError) roleError.textContent = 'Choose a portal before logging in.';
        if(roleButtons[0]) roleButtons[0].focus();
        return;
      }

      // Frontend-only demo: persist a lightweight session flag so
      // public-dashboard.html can recognise a "logged in" visitor.
      try{
        localStorage.setItem('meridian_demo_session', JSON.stringify({ email: data.email, loggedInAt: Date.now() }));
      }catch(e){ /* localStorage unavailable — non-fatal for the demo */ }

      const btn = loginForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Logging in…';
      btn.disabled = true;
      const destination = selectedRole === 'admin' ? 'admin-dashboard.html' : 'public-dashboard.html';
      setTimeout(() => { window.location.href = destination; }, 700);
    });
  }

  /* ---------------- CREATE ACCOUNT FORM ---------------- */
  const signupForm = document.getElementById('signup-form');
  if(signupForm){
    const first = document.getElementById('signup-first');
    const last = document.getElementById('signup-last');
    const email = document.getElementById('signup-email');
    const phone = document.getElementById('signup-phone');
    const password = document.getElementById('signup-password');
    const confirm = document.getElementById('signup-confirm');

    MeridianValidate.bindForm(signupForm, [
      { input: first, validator: MeridianValidate.validateName },
      { input: last, validator: MeridianValidate.validateName },
      { input: email, validator: MeridianValidate.validateEmail },
      { input: phone, validator: MeridianValidate.validatePhone },
      { input: password, validator: (v) => MeridianValidate.validatePassword(v, { minLength: 8 }) },
      { input: confirm, validator: (v) => MeridianValidate.validateConfirmPassword(v, password.value) }
    ], (data) => {
      const wrap = signupForm.closest('.auth-form-wrap');
      const success = wrap ? wrap.querySelector('.form-success') : null;
      if(success){
        signupForm.style.display = 'none';
        success.classList.add('is-visible');
        if(window.gsap) gsap.fromTo(success, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' });
      }
      setTimeout(() => { window.location.href = 'login.html'; }, 700);
    });

    // keep confirm-password validity live if the user edits the original password afterwards
    password.addEventListener('input', () => {
      if(confirm.value) confirm.dispatchEvent(new Event('input'));
    });
  }
});
