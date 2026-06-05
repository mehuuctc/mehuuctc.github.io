/**
 * afsan.dev — Portfolio JavaScript
 * Author  : Afsan Habib
 * Version : 1.0.0
 * Modules :
 *   1. Navigation (sticky scroll + active link highlight)
 *   2. Mobile Menu (hamburger overlay)
 *   3. Smooth Scroll (internal anchor links)
 *   4. Scroll Reveal (Intersection Observer)
 *   5. Typing Effect (hero heading)
 *   6. Skills Animation (stagger on reveal)
 *   7. Contact Form (client-side validation + submission)
 *   8. Footer Year (dynamic copyright)
 *   9. Custom Cursor (subtle accent dot)
 *  10. Timeline Counter Animation
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Shorthand querySelector
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand querySelectorAll → Array
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element[]}
 */
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/**
 * Throttle a function call
 * @param {Function} fn
 * @param {number} limit — ms
 * @returns {Function}
 */
function throttle(fn, limit = 100) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} delay — ms
 * @returns {Function}
 */
function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. NAVIGATION — sticky scroll class + active section highlight
═══════════════════════════════════════════════════════════════════════════ */
function initNavigation() {
  const header   = $('#nav-header');
  const navLinks = $$('.nav-link');

  if (!header) return;

  /* ── Sticky scroll shadow ── */
  const onScroll = throttle(() => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active link via Intersection Observer ── */
  const sections = $$('section[id]');

  if (!sections.length || !navLinks.length) return;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('data-section') === id;
            link.classList.toggle('is-active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
          });
        }
      }),
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 };
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. MOBILE MENU — hamburger toggle with a11y + focus trap
═══════════════════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger    = $('#hamburger');
  const mobileMenu   = $('#mobile-menu');
  const mobileLinks  = $$('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  /* Focus trap helpers */
  const focusableSelectors =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let focusableElements = [];
  let firstFocusable, lastFocusable;

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  function openMenu() {
    isOpen = true;
    mobileMenu.hidden = false;
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    /* Stagger link animations */
    mobileLinks.forEach((link, i) => {
      link.style.opacity    = '0';
      link.style.transform  = 'translateX(30px)';
      link.style.transition = `opacity 0.35s ${i * 0.06}s ease, transform 0.35s ${i * 0.06}s ease`;
      requestAnimationFrame(() => {
        link.style.opacity   = '1';
        link.style.transform = 'translateX(0)';
      });
    });

    /* Set up focus trap */
    focusableElements = $$(focusableSelectors, mobileMenu);
    firstFocusable    = focusableElements[0];
    lastFocusable     = focusableElements[focusableElements.length - 1];
    mobileMenu.addEventListener('keydown', trapFocus);
    firstFocusable?.focus();
  }

  function closeMenu() {
    isOpen = false;
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    mobileMenu.removeEventListener('keydown', trapFocus);

    /* Wait for CSS transition before hiding */
    mobileMenu.style.opacity   = '0';
    mobileMenu.style.transform = 'translateX(100%)';
    setTimeout(() => {
      mobileMenu.hidden          = true;
      mobileMenu.style.opacity   = '';
      mobileMenu.style.transform = '';
    }, 400);

    hamburger.focus();
  }

  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  hamburger.addEventListener('click', toggleMenu);

  /* Close on link click */
  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));
  const mobileResume = $('.mobile-resume', mobileMenu);
  mobileResume?.addEventListener('click', closeMenu);

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  /* Close on backdrop click (outside menu inner) */
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. SMOOTH SCROLL — intercept all anchor[href^="#"] clicks
═══════════════════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      10
    ) || 72;

    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    /* Update URL without triggering a jump */
    history.pushState(null, '', `#${targetId}`);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. SCROLL REVEAL — Intersection Observer for .reveal elements
═══════════════════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  /* Respect prefers-reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* Animate once */
        }
      });
    },
    { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
  );

  $$('.reveal').forEach((el) => observer.observe(el));
}

/**
 * Add reveal classes to elements that should animate on scroll.
 * Called once on DOMContentLoaded before initScrollReveal.
 */
function assignRevealClasses() {
  const revealMap = [
    { selector: '.about-text',       delay: '' },
    { selector: '.about-sidebar',    delay: 'reveal-delay-2' },
    { selector: '.skill-category',   delay: '' },
    { selector: '.timeline-item',    delay: '' },
    { selector: '.project-card',     delay: '' },
    { selector: '.contact-intro',    delay: '' },
    { selector: '.contact-form-wrapper', delay: 'reveal-delay-2' },
    { selector: '.section-heading',  delay: '' },
    { selector: '.section-subheading', delay: 'reveal-delay-1' },
  ];

  revealMap.forEach(({ selector, delay }) => {
    $$(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (delay) el.classList.add(delay);
      /* Auto-stagger siblings */
      else if (i > 0 && i <= 4) {
        el.classList.add(`reveal-delay-${i}`);
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. TYPING EFFECT — cycles through role titles in the hero
═══════════════════════════════════════════════════════════════════════════ */
function initTypingEffect() {
  const target = $('.hero-title-accent');
  if (!target) return;

  /* Respect reduced motion — skip animation */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words  = ['Engineer', 'Architect', 'Alchemist', 'Innovator'];
  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let paused   = false;

  const TYPING_SPEED  = 100;
  const DELETING_SPEED = 55;
  const PAUSE_AFTER   = 2200;
  const PAUSE_EMPTY   = 400;

  function type() {
    if (paused) return;

    const currentWord = words[wordIdx];

    if (deleting) {
      charIdx--;
      target.textContent = currentWord.slice(0, charIdx);

      if (charIdx === 0) {
        deleting = false;
        wordIdx  = (wordIdx + 1) % words.length;
        paused   = true;
        setTimeout(() => { paused = false; tick(); }, PAUSE_EMPTY);
        return;
      }
    } else {
      charIdx++;
      target.textContent = currentWord.slice(0, charIdx);

      if (charIdx === currentWord.length) {
        paused = true;
        setTimeout(() => {
          paused   = false;
          deleting = true;
          tick();
        }, PAUSE_AFTER);
        return;
      }
    }

    tick();
  }

  function tick() {
    setTimeout(type, deleting ? DELETING_SPEED : TYPING_SPEED);
  }

  /* Start after hero load animation */
  setTimeout(tick, 1800);
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. SKILLS SECTION — stagger skill tags on reveal
═══════════════════════════════════════════════════════════════════════════ */
function initSkillsAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const skillCategories = $$('.skill-category');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const tags = $$('.skill-tag', entry.target);
        tags.forEach((tag, i) => {
          tag.style.opacity   = '0';
          tag.style.transform = 'translateY(12px) scale(0.95)';
          setTimeout(() => {
            tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            tag.style.opacity    = '1';
            tag.style.transform  = 'translateY(0) scale(1)';
          }, i * 60 + 100);
        });

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  skillCategories.forEach((cat) => {
    /* Initially hide tags */
    $$('.skill-tag', cat).forEach((tag) => {
      tag.style.opacity   = '0';
      tag.style.transform = 'translateY(12px) scale(0.95)';
    });
    observer.observe(cat);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. CONTACT FORM — validation + mock submission
═══════════════════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form       = $('#contact-form');
  const submitBtn  = $('#form-submit');
  const statusEl   = $('#form-status');

  if (!form) return;

  /* ── Field validation ── */
  const validators = {
    name: {
      validate: (v) => v.trim().length >= 2,
      message:  'Please enter your full name (at least 2 characters).',
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message:  'Please enter a valid email address.',
    },
    subject: {
      validate: (v) => v.trim().length >= 4,
      message:  'Subject must be at least 4 characters.',
    },
    message: {
      validate: (v) => v.trim().length >= 20,
      message:  'Message must be at least 20 characters.',
    },
  };

  function showFieldError(input, message) {
    input.style.borderColor = '#ef4444';
    input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';
    let errEl = input.parentElement.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className   = 'field-error';
      errEl.style.cssText = `
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: #ef4444;
        margin-top: 4px;
        letter-spacing: 0.03em;
      `;
      input.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errEl.id || `${input.id}-error`);
    errEl.id = `${input.id}-error`;
  }

  function clearFieldError(input) {
    input.style.borderColor = '';
    input.style.boxShadow   = '';
    input.removeAttribute('aria-invalid');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.remove();
  }

  function validateField(input) {
    const name      = input.getAttribute('name');
    const validator = validators[name];
    if (!validator) return true;

    if (!validator.validate(input.value)) {
      showFieldError(input, validator.message);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  /* Live validation on blur */
  $$('.form-input', form).forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  /* ── Status helpers ── */
  function showStatus(message, type) {
    statusEl.textContent  = message;
    statusEl.className    = `form-status is-${type}`;
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className   = 'form-status';
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    /* Validate all fields */
    const inputs   = $$('.form-input', form);
    const allValid = inputs
      .map((input) => validateField(input))
      .every(Boolean);

    if (!allValid) {
      showStatus('⚠ Please fix the errors above before submitting.', 'error');
      const firstInvalid = inputs.find(
        (i) => i.getAttribute('aria-invalid') === 'true'
      );
      firstInvalid?.focus();
      return;
    }

    /* Collect data */
    const formData = new FormData(form);
    const payload  = Object.fromEntries(formData.entries());

    /* Loading state */
    const btnText        = submitBtn.querySelector('.btn-text');
    const originalText   = btnText.textContent;
    submitBtn.disabled   = true;
    btnText.textContent  = 'Sending…';
    submitBtn.style.opacity = '0.7';

    try {
      /**
       * ─── INTEGRATION POINT ───────────────────────────────────────────────
       * Replace the simulated fetch below with your real endpoint, e.g.:
       *   const res = await fetch('https://formspree.io/f/YOUR_ID', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json' },
       *     body: JSON.stringify(payload),
       *   });
       *   if (!res.ok) throw new Error('Server error');
       * ─────────────────────────────────────────────────────────────────────
       */
      await new Promise((resolve) => setTimeout(resolve, 1400)); /* Simulate */

      /* Success */
      showStatus(
        `✓ Message sent! Thanks, ${payload.name.split(' ')[0]}. I'll get back to you within 24 hours.`,
        'success'
      );
      form.reset();
      inputs.forEach(clearFieldError);

    } catch (err) {
      showStatus(
        '✕ Something went wrong. Please email me directly at afsan@afsan.dev',
        'error'
      );
      console.error('[ContactForm]', err);
    } finally {
      submitBtn.disabled      = false;
      btnText.textContent     = originalText;
      submitBtn.style.opacity = '';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. FOOTER YEAR — auto-update copyright year
═══════════════════════════════════════════════════════════════════════════ */
function initFooterYear() {
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. CUSTOM CURSOR — subtle accent-colored trailing dot on desktop
═══════════════════════════════════════════════════════════════════════════ */
function initCustomCursor() {
  /* Only on devices with a fine pointer (desktop mouse) */
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 10px; height: 10px;
    background: var(--color-accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.15s ease, opacity 0.3s ease;
    opacity: 0;
    mix-blend-mode: screen;
  `;

  const ring = document.createElement('div');
  ring.setAttribute('aria-hidden', 'true');
  ring.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 36px; height: 36px;
    border: 1.5px solid rgba(0, 245, 212, 0.4);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.08s ease, width 0.2s ease, height 0.2s ease, opacity 0.3s ease;
    opacity: 0;
  `;

  document.body.appendChild(ring);
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left    = `${mouseX}px`;
    cursor.style.top     = `${mouseY}px`;
    cursor.style.opacity = '1';
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  /* Lag the ring slightly */
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left      = `${ringX}px`;
    ring.style.top       = `${ringY}px`;
    ring.style.opacity   = '1';
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    raf = requestAnimationFrame(animateRing);
  }
  raf = requestAnimationFrame(animateRing);

  /* Scale up on interactive elements */
  const interactive = 'a, button, .skill-tag, .project-card, .social-link, .nav-link';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) {
      cursor.style.transform = 'translate(-50%, -50%) scale(2)';
      ring.style.width  = '54px';
      ring.style.height = '54px';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.width  = '36px';
      ring.style.height = '36px';
    }
  });

  /* Hide when leaving window */
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    ring.style.opacity   = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    ring.style.opacity   = '1';
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   10. COUNTER ANIMATION — animate stat numbers in hero
═══════════════════════════════════════════════════════════════════════════ */
function initCounterAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stats = $$('.stat-number');

  function animateCounter(el, target, duration = 1200) {
    const isSymbol = isNaN(parseInt(target));
    if (isSymbol) return; /* Skip ∞ */

    const num       = parseInt(target);
    const hasPlus   = el.innerHTML.includes('+');
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * num);

      if (hasPlus) {
        el.innerHTML = `${current}<span class="stat-plus">+</span>`;
      } else {
        el.textContent = current;
      }

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = el.textContent.replace('+', '').trim();
        animateCounter(el, target);
        observer.unobserve(el);
      });
    },
    { threshold: 0.8 }
  );

  stats.forEach((stat) => observer.observe(stat));
}

/* ═══════════════════════════════════════════════════════════════════════════
   11. ACTIVE NAV HIGHLIGHT on load (for direct URL with hash)
═══════════════════════════════════════════════════════════════════════════ */
function initHashHighlight() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  const activeLink = $(`.nav-link[data-section="${hash}"]`);
  if (activeLink) {
    $$('.nav-link').forEach((l) => l.classList.remove('is-active'));
    activeLink.classList.add('is-active');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   12. PROJECT CARDS — tilt effect on hover (desktop only)
═══════════════════════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = $$('.project-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -4;
      const rotateY = ((e.clientX - centerX) / (rect.width  / 2)) *  4;

      card.style.transform = `
        translateY(-4px)
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform    = '';
      card.style.transition   = 'transform 0.5s ease, border-color 0.25s ease, box-shadow 0.25s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'border-color 0.25s ease, box-shadow 0.25s ease';
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   13. HERO BACKGROUND — subtle mouse parallax on grid
═══════════════════════════════════════════════════════════════════════════ */
function initHeroParallax() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroGlow = $('.hero-glow');
  const heroGrid = $('.hero-grid-bg');
  if (!heroGlow || !heroGrid) return;

  const hero = $('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', throttle((e) => {
    const rect  = hero.getBoundingClientRect();
    const xPct  = (e.clientX - rect.left) / rect.width  - 0.5;
    const yPct  = (e.clientY - rect.top)  / rect.height - 0.5;

    heroGlow.style.transform = `translate(${xPct * 30}px, ${yPct * 20}px)`;
    heroGrid.style.transform = `translate(${xPct * 8}px, ${yPct * 6}px)`;
  }, 30));

  hero.addEventListener('mouseleave', () => {
    heroGlow.style.transform = '';
    heroGrid.style.transform = '';
    heroGlow.style.transition = 'transform 0.8s ease';
    heroGrid.style.transition = 'transform 0.8s ease';
  });
  hero.addEventListener('mouseenter', () => {
    heroGlow.style.transition = '';
    heroGrid.style.transition = '';
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   14. BACK TO TOP — keyboard shortcut (Alt + T) & escape overlay close
═══════════════════════════════════════════════════════════════════════════ */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    /* Alt + T → scroll to top */
    if (e.altKey && e.key === 't') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    /* Alt + C → jump to contact */
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      const contact = $('#contact');
      if (contact) contact.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   15. TIMELINE ENTRANCE — slide in from left
═══════════════════════════════════════════════════════════════════════════ */
function initTimelineAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = $$('.timeline-item');

  items.forEach((item) => {
    const card = $('.timeline-card', item);
    if (!card) return;
    card.style.opacity   = '0';
    card.style.transform = 'translateX(-20px)';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (!entry.isIntersecting) return;
        const card = $('.timeline-card', entry.target);
        if (!card) return;
        setTimeout(() => {
          card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          card.style.opacity    = '1';
          card.style.transform  = 'translateX(0)';
        }, 100);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOT — initialise everything after DOM is ready
═══════════════════════════════════════════════════════════════════════════ */
function boot() {
  /* Assign reveal classes before the observer attaches */
  assignRevealClasses();

  /* Core modules */
  initNavigation();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initFooterYear();
  initHashHighlight();

  /* Visual enhancements */
  initTypingEffect();
  initSkillsAnimation();
  initCounterAnimation();
  initCardTilt();
  initHeroParallax();
  initTimelineAnimation();
  initCustomCursor();

  /* UX utilities */
  initKeyboardShortcuts();
  initContactForm();

  /* Mark page as JS-enhanced */
  document.documentElement.classList.add('js-loaded');
}

/* Run after DOM is fully parsed */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot(); /* Already ready */
}
