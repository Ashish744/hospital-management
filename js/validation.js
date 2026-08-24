/* ==========================================================================
   validation.js — one reusable validation engine for every form on the site.
   Rules live here once; every page (contact, login, create-account) wires
   its own fields to these functions instead of re-implementing checks.
   ========================================================================== */

const MeridianValidate = (() => {

  const NAME_RE = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;
  // RFC-5322-ish practical email check: local@domain.tld
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  const PHONE_RE = /^[0-9+()\-\s]{7,16}$/;

  function validateName(value){
    const v = (value || '').trim();
    if(!v) return { valid:false, message:'This field is required.' };
    if(!NAME_RE.test(v)) return { valid:false, message:'Letters only, please — no numbers or symbols.' };
    return { valid:true, message:'Looks good.' };
  }

  function validateEmail(value){
    const v = (value || '').trim();
    if(!v) return { valid:false, message:'This field is required.' };
    if(v.includes(' ')) return { valid:false, message:'Please enter a valid email address.' };
    if(!EMAIL_RE.test(v)) return { valid:false, message:'Please enter a valid email address.' };
    return { valid:true, message:'Email looks good.' };
  }

  function validatePhone(value){
    const v = (value || '').trim();
    if(!v) return { valid:false, message:'This field is required.' };
    if(!PHONE_RE.test(v)) return { valid:false, message:'Please enter a valid phone number.' };
    return { valid:true, message:'Looks good.' };
  }

  function validatePassword(value, { minLength = 8 } = {}){
    const v = value || '';
    if(!v) return { valid:false, message:'This field is required.' };
    if(v.length < minLength) return { valid:false, message:`Use at least ${minLength} characters.` };
    return { valid:true, message:'Strong enough.' };
  }

  function validateConfirmPassword(value, original){
    if(!value) return { valid:false, message:'Please confirm your password.' };
    if(value !== original) return { valid:false, message:'Passwords do not match.' };
    return { valid:true, message:'Passwords match.' };
  }

  function passwordStrength(value){
    const v = value || '';
    let score = 0;
    if(v.length >= 8) score++;
    if(v.length >= 12) score++;
    if(/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;
    if(v.length === 0) return { score:0, label:'' };
    if(score <= 1) return { score:1, label:'Weak' };
    if(score <= 3) return { score:2, label:'Okay' };
    if(score === 4) return { score:3, label:'Strong' };
    return { score:4, label:'Excellent' };
  }

  /**
   * Wires a single input to live validation (input + blur) and renders
   * an inline status message inside a sibling `.field-msg` element.
   * @param {HTMLInputElement} input
   * @param {(value:string)=>{valid:boolean,message:string}} validator
   */
  function bindField(input, validator){
    if(!input) return;
    const field = input.closest('.field');
    const msg = field ? field.querySelector('.field-msg') : null;

    const run = (showSuccess) => {
      const result = validator(input.value, input);
      field && field.classList.remove('is-valid','is-invalid');
      if(!input.value && !showSuccess){
        if(msg) msg.textContent = '';
        return result;
      }
      field && field.classList.add(result.valid ? 'is-valid' : 'is-invalid');
      if(msg){
        msg.textContent = result.message;
        if(window.gsap){
          gsap.fromTo(msg, { opacity:0, y:-4 }, { opacity:1, y:0, duration:.3, ease:'power2.out' });
        }
      }
      return result;
    };

    input.addEventListener('input', () => run(false));
    input.addEventListener('blur', () => run(true));
    return run;
  }

  /**
   * Binds an entire form; prevents submission while any bound field is invalid.
   * @param {HTMLFormElement} form
   * @param {Array<{input:HTMLInputElement, validator:Function}>} fields
   * @param {(data:Object)=>void} onValid
   */
  function bindForm(form, fields, onValid){
    if(!form) return;
    const runners = fields.map(f => ({ ...f, run: bindField(f.input, f.validator) }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;
      const data = {};
      runners.forEach(({ input, run }) => {
        const result = run(true);
        if(!result.valid) allValid = false;
        data[input.name || input.id] = input.value;
      });
      if(allValid && typeof onValid === 'function') onValid(data);
      else{
        const firstInvalid = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
        if(firstInvalid) firstInvalid.focus();
      }
    });
  }

  return {
    validateName, validateEmail, validatePhone,
    validatePassword, validateConfirmPassword, passwordStrength,
    bindField, bindForm
  };
})();

window.MeridianValidate = MeridianValidate;
