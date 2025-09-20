// main.js — page-wipe + scroll animations (play/reverse; NO wipe-left)
document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile nav
  const burger = document.querySelector('.dcp-burger');
  const nav = document.querySelector('.dcp-nav');
  burger?.addEventListener('click', () => nav?.classList.toggle('dcp-open'));

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href') || '';
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  });

  // PAGE WIPE for inter-page links only
  const overlay = document.querySelector('.page-wipe');
  document.querySelectorAll('a[data-wipe], .dcp-nav a[href$=".html"][href^="views/"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      e.preventDefault();
      if (overlay) {
        overlay.classList.add('is-active');
        setTimeout(() => { window.location.href = href; }, 500);
      } else { window.location.href = href; }
    });
  });

  // ===== Scroll animations: Play on enter / Reverse on leave (both directions) =====
  const scrollSelectors = [
    '.hero-cards .card',
    '.dcp-how-it-works-section .dcp-step-card',
    '.about-big-card',
    '.dcp-contacts-section .dcp-contact-card',
    '.dcp-contacts-section .dcp-map-card',
    '.dcp-footer .dcp-col'
  ];

  const inView = (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return (r.bottom >= 0 && r.right >= 0 && r.top <= vh && r.left <= vw);
  };

  const targets = [];
  scrollSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('scroll-fx');          // NO wipe-left
      if (inView(el)) el.classList.add('in'); // above-the-fold visible
      else el.classList.add('out');           // offscreen hidden
      targets.push(el);
    });
  });

  // Observer toggles in/out both directions
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {             // Play (enter / enter-back)
        el.classList.add('in');
        el.classList.remove('out');
      } else {                                // Reverse (leave / leave-back)
        el.classList.add('out');
        el.classList.remove('in');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => io.observe(el));

  // Reduced motion: show everything
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el => { el.classList.add('in'); el.classList.remove('out'); });
  }

  // Per-element initial failsafe (just in case of late styles)
  setTimeout(() => {
    targets.forEach(el => {
      if (inView(el) && getComputedStyle(el).opacity === '0') {
        el.classList.add('in');
        el.classList.remove('out');
      }
    });
  }, 600);
});
