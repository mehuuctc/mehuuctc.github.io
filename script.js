/* ============================================================
   AFSAN HABIB PORTFOLIO — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── HELPERS ──────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── ELEMENTS ─────────────────────────────────────────────── */
  const header      = qs('.site-header');
  const hamburger   = qs('#hamburger');
  const navLinks    = qs('#nav-links');
  const navOverlay  = qs('#nav-overlay');
  const allNavLinks = qsa('.nav__link');
  const sections    = qsa('section[id]');
  const contactForm = qs('#contact-form');
  const submitBtn   = qs('#submit-btn');
  const formSuccess = qs('#form-success');

  /* ── 1. SCROLLED HEADER ───────────────────────────────────── */
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 2. SMOOTH SCROLLING ──────────────────────────────────── */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMobileMenu();
    // Accessibility: move focus to the section
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ── 3. MOBILE MENU ───────────────────────────────────────── */
  function openMobileMenu() {
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Inject "Hire me" CTA into mobile drawer once
    if (!qs('.nav__cta-mobile', navLinks)) {
      const li = document.createElement('li');
      li.className = 'nav__cta-mobile';
      const a = document.createElement('a');
      a.href = 'mailto:hello@afsanhabib.dev';
      a.className = 'btn btn--primary';
      a.textContent = 'Hire me';
      li.appendChild(a);
      navLinks.appendChild(li);
    }
  }

  function closeMobileMenu() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  navOverlay.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ── 4. ACTIVE NAV LINK (IntersectionObserver) ────────────── */
  function getNavHeight() {
    return parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 72;
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        allNavLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, {
    root: null,
    rootMargin: `-${getNavHeight()}px 0px -50% 0px`,
    threshold: 0,
  });

  sections.forEach((sec) => sectionObserver.observe(sec));

  /* ── 5. FADE-UP ON SCROLL ─────────────────────────────────── */
  const animateTargets = qsa([
    '.project-card',
    '.skill-block',
    '.contact-info-card',
    '.section-header',
    '.about-stat-card',
    '.timeline__card',
    '.about__copy',
    '.about__cards',
  ].join(', '));

  animateTargets.forEach((el) => el.classList.add('fade-up'));

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.07 }
  );

  animateTargets.forEach((el) => fadeObserver.observe(el));

  /* ── 6. STAGGER WITHIN GRIDS ──────────────────────────────── */
  const staggerContainers = [
    '.works__grid',
    '.skills__grid',
    '.about__cards',
    '.contact__info',
    '.timeline',
  ];

  staggerContainers.forEach((sel) => {
    const container = qs(sel);
    if (!container) return;
    qsa('.fade-up', container).forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
    });
  });

  /* ── 8. CONTACT FORM VALIDATION & SUBMISSION ──────────────── */
  function validateField(input) {
    const errEl = qs(`#${input.id}-error`);
    if (!errEl) return true;
    let msg = '';

    if (input.required && !input.value.trim()) {
      msg = 'This field is required.';
    } else if (input.type === 'email' && input.value &&
               !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      msg = 'Please enter a valid email address.';
    } else if (input.id === 'message' && input.value.trim().length < 10) {
      msg = 'Message must be at least 10 characters.';
    }

    errEl.textContent = msg;
    input.classList.toggle('invalid', !!msg);
    return !msg;
  }

  if (contactForm) {
    qsa('.form-input', contactForm).forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) validateField(input);
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formSuccess) formSuccess.textContent = '';

      const inputs = qsa('.form-input', contactForm);
      const allValid = inputs.map(validateField).every(Boolean);
      if (!allValid) {
        const first = qs('.form-input.invalid', contactForm);
        if (first) first.focus();
        return;
      }

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      await new Promise((res) => setTimeout(res, 1400));

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      contactForm.reset();
      inputs.forEach((i) => i.classList.remove('invalid'));

      if (formSuccess) {
        formSuccess.textContent = "✓ Message sent! I'll get back to you within 24 hours.";
        setTimeout(() => { formSuccess.textContent = ''; }, 6000);
      }
    });
  }

})();



const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const successMessage = document.getElementById('form-success');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault(); // Stop standard page redirect

  // 1. Basic Client-Side Validation (Since you have 'novalidate' on HTML)
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  
  // Clear previous error messages
  document.getElementById('name-error').textContent = '';
  document.getElementById('email-error').textContent = '';
  document.getElementById('message-error').textContent = '';
  successMessage.textContent = '';

  let hasError = false;

  if (!name) {
    document.getElementById('name-error').textContent = 'Name is required.';
    hasError = true;
  }
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required.';
    hasError = true;
  }
  if (!message) {
    document.getElementById('message-error').textContent = 'Message is required.';
    hasError = true;
  }

  if (hasError) return; // Stop if validation fails

  // 2. Show Loading Spinner
  submitBtn.classList.add('loading'); // Assumes your CSS triggers the spinner with a .loading class
  submitBtn.disabled = true;
  successMessage.style.color = '#fff'; // Adjust color based on your theme
  successMessage.textContent = 'Sending your message...';

  // 3. Prepare Form Data
  const formData = new FormData(contactForm);

  try {
    // 4. Send Request to Web3Forms API
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.status === 200) {
      // Success!
      successMessage.style.color = '#4BB543'; // Green success color
      successMessage.textContent = 'Message sent successfully! I will get back to you within 24 hours.';
      contactForm.reset(); // Clear the inputs
    } else {
      // API level error
      successMessage.style.color = '#ff3333';
      successMessage.textContent = result.message || 'Something went wrong. Please try again.';
    }
  } catch (error) {
    // Network level error
    successMessage.style.color = '#ff3333';
    successMessage.textContent = 'Network error. Please check your internet connection and try again.';
  } finally {
    // 5. Reset Button UI
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});
