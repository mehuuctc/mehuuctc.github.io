/**
 * AFSAN HABIB PORTFOLIO — script.js
 * Vanilla JS — All interactions, animations, and behaviors
 */

'use strict';

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Scale on interactive elements
  const interactives = 'a, button, [data-filter], input, textarea, .project-card, .service-card';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(56,189,248,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(56,189,248,0.5)';
    });
  });
})();


/* ============================================================
   2. NAVBAR — Scroll + Active Section + Hamburger
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const links     = navLinks ? navLinks.querySelectorAll('.nav-link') : [];

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add scrolled class
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
    updateActiveLink();
  }, { passive: true });

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger && hamburger.classList.remove('open');
      navLinks && navLinks.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on backdrop click
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active section highlight
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentId  = '';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 120) currentId = section.id;
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  updateActiveLink();
})();


/* ============================================================
   3. TYPING ANIMATION
   ============================================================ */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const words = [
    'Data Engineer',
    'Django Developer',
    // 'ETL Pipeline Specialist',
    // 'Backend Engineer',
    // 'Python Expert',
  ];

  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 120;

  function type() {
    const currentWord = words[wordIdx];

    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    el.textContent = currentWord.substring(0, charIdx);

    if (!isDeleting && charIdx === currentWord.length) {
      // Pause at end of word
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      delay = 300;
    } else {
      delay = isDeleting ? 60 : 120;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 800);
})();


/* ============================================================
   4. MARQUEE — Tech Stack Slider
   ============================================================ */
(function initMarquee() {
  const inner = document.getElementById('marqueeInner');
  if (!inner) return;

  const techs = [
    'Django', 'PostgreSQL', 'Apache Airflow', 'Docker', 'Git', 'Linux','ETL Pipelines', 'Data Warehousing',
     'REST APIs', 'AWS', 'Data Modeling',
     'Backend Engineering',
  ];

  // Build items (duplicate for seamless loop)
  function buildItems() {
    return techs.map(t => {
      const span = document.createElement('span');
      span.className = 'marquee-item';
      span.textContent = t;
      return span;
    });
  }

  // Add two sets for seamless infinite loop
  [...buildItems(), ...buildItems()].forEach(el => inner.appendChild(el));
})();


/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Small stagger for grouped elements
        entry.target.style.transitionDelay = `${idx * 0.05}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   6. SKILL BARS — Animate on scroll
   ============================================================ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.getAttribute('data-width');
        // Small delay so CSS transition fires
        requestAnimationFrame(() => {
          fill.style.width = width + '%';
        });
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => observer.observe(fill));
})();


/* ============================================================
   7. ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
})();


/* ============================================================
   8. PROJECT FILTER
   ============================================================ */
(function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.project-card');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const matches  = filter === 'all' || category === filter;

        if (matches) {
          card.classList.remove('hidden');
          // Small animation
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* ============================================================
   9. TESTIMONIAL SLIDER
   ============================================================ */
(function initTestimonials() {
  const track   = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const dotsEl  = document.getElementById('testiDots');
  if (!track) return;

  const cards    = track.querySelectorAll('.testimonial-card');
  const total    = cards.length;
  let current    = 0;
  let autoTimer  = null;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Auto-advance
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  });
})();


/* ============================================================
   10. CONTACT FORM — Validation
   ============================================================ */
(function initContactForm() {
  const form     = document.getElementById('contactForm');
  const success  = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  function getField(id)       { return document.getElementById(id); }
  function getError(fieldId)  { return document.getElementById(fieldId + 'Error'); }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, msg) {
    field.classList.add('error');
    const errEl = getError(field.id);
    if (errEl) errEl.textContent = msg;
  }

  function clearError(field) {
    field.classList.remove('error');
    const errEl = getError(field.id);
    if (errEl) errEl.textContent = '';
  }

  // Validate on input
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const field = getField(id);
    if (field) {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('blur', () => validateField(field));
    }
  });

  function validateField(field) {
    const value = field.value.trim();
    clearError(field);

    if (!value) {
      showError(field, 'This field is required.');
      return false;
    }

    if (field.type === 'email' && !validateEmail(value)) {
      showError(field, 'Please enter a valid email address.');
      return false;
    }

    if (field.id === 'name' && value.length < 2) {
      showError(field, 'Name must be at least 2 characters.');
      return false;
    }

    if (field.id === 'message' && value.length < 10) {
      showError(field, 'Message must be at least 10 characters.');
      return false;
    }

    return true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields  = ['name', 'email', 'subject', 'message'].map(id => getField(id));
    const isValid = fields.every(f => f && validateField(f));

    if (!isValid) return;

    // Simulate send (replace with actual fetch to backend)
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';

    setTimeout(() => {
      form.reset();
      fields.forEach(f => f && clearError(f));
      success.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';

      setTimeout(() => success.classList.remove('visible'), 5000);
    }, 1200);
  });
})();


/* ============================================================
   11. SMOOTH SCROLL — All anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   12. MOUSE PARALLAX — Hero orbs
   ============================================================ */
(function initParallax() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;

    orbs.forEach((orb, i) => {
      const depth  = (i + 1) * 0.3;
      const tx = x * depth;
      const ty = y * depth;
      orb.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  }, { passive: true });
})();


/* ============================================================
   13. LAZY LOADING — Images (IntersectionObserver)
   ============================================================ */
(function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
})();


/* ============================================================
   14. BACK TO TOP — Extra smooth
   ============================================================ */
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   15. PAGE LOAD — Remove opacity flash
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);
});
