document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Project filtering ---------- */
  const filterBar = document.getElementById('filterBar');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  }

  /* ---------- Architecture showcase ---------- */
  const archDetails = {
    user: "Sends a request in plain language — a question, a document, a task. The application's job starts with turning that into something structured.",
    api: "A well-defined boundary between the client and the AI system. Handles auth, validation, and rate limiting before anything reaches a model.",
    app: "The engineering layer: orchestrates the request, decides whether retrieval or tools are needed, and shapes the final response. This is where most of the actual code lives.",
    rag: "Retrieval-augmented generation and tool calls pull in the specific data or actions the request needs — search results, documents, database records — so the model isn't answering from memory alone.",
    llm: "The language model reasons over the request plus whatever context RAG or tools supplied, and produces a draft response.",
    response: "The output is validated, formatted, and returned — structured data, not just raw model text, so the rest of the system can rely on it."
  };

  const archDiagram = document.getElementById('archDiagram');
  const archDetail = document.getElementById('archDetail');

  if (archDiagram && archDetail) {
    const nodes = archDiagram.querySelectorAll('.arch-node');
    const keyEl = archDetail.querySelector('.arch-detail-key');
    const textEl = archDetail.querySelector('.arch-detail-text');

    archDiagram.addEventListener('click', (e) => {
      const node = e.target.closest('.arch-node');
      if (!node) return;
      nodes.forEach(n => n.classList.remove('is-active'));
      node.classList.add('is-active');
      keyEl.textContent = node.textContent;
      textEl.textContent = archDetails[node.dataset.key] || '';
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.gh-num[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-title, .section-lead, .project-card, .skill-card, .timeline-item, .cert-card, .dash-card, .fact'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 8 ? '0 1px 0 rgba(20,22,26,.06)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');

    const fields = [
      { id: 'cf-name', err: 'err-name', validate: v => v.trim().length > 1, msg: 'Please enter your name.' },
      { id: 'cf-email', err: 'err-email', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email.' },
      { id: 'cf-subject', err: 'err-subject', validate: v => v.trim().length > 2, msg: 'Please add a short subject.' },
      { id: 'cf-message', err: 'err-message', validate: v => v.trim().length > 9, msg: 'Message should be at least 10 characters.' },
    ];

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      // Honeypot check
      const honeypot = document.getElementById('cf-website');
      if (honeypot && honeypot.value) {
        status.textContent = 'Something went wrong. Please try again.';
        status.classList.add('is-error');
        return;
      }

      let valid = true;
      fields.forEach(f => {
        const input = document.getElementById(f.id);
        const errEl = document.getElementById(f.err);
        const row = input.closest('.form-row');
        const ok = f.validate(input.value);
        row.classList.toggle('has-error', !ok);
        errEl.textContent = ok ? '' : f.msg;
        if (!ok) valid = false;
      });

      if (!valid) {
        status.textContent = 'Please fix the highlighted fields.';
        status.classList.add('is-error');
        return;
      }

      // Frontend-only placeholder — will POST to the Django /api/contact/ endpoint.
      status.textContent = "please contact me directly via Email: afsan.uct@gmail.com or WhatsApp: +8801834740464";
      status.classList.add('is-success');
      form.reset();
    });
  }

});
