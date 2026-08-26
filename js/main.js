/**
 * main.js — Mugumya & Co Advocates
 * Handles: theme toggle, navbar scroll shrink,
 *          mobile nav, scroll reveal animations
 */

(function () {
  'use strict';

  /* ────────────────────────────────────────────
     1. THEME TOGGLE
     Reads system preference → stores in memory
     (no localStorage — blocked in sandboxed iframes)
  ──────────────────────────────────────────── */
  const root = document.documentElement;

  // Detect system preference
  let currentTheme = 'light';

  // Apply initial theme
  root.setAttribute('data-theme', currentTheme);

  const ICONS = {
    dark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`,
    light: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`
  };

  function applyTheme(theme) {
    currentTheme = theme;
    root.setAttribute('data-theme', theme);

    // Update every toggle button on the page
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.innerHTML = theme === 'dark' ? ICONS.light : ICONS.dark;
      btn.setAttribute(
        'aria-label',
        'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'
      );
    });
  }

  // Set correct icon on load
  applyTheme(currentTheme);

  // Wire up all toggle buttons
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
  });

  /* ────────────────────────────────────────────
     2. NAVBAR — scroll shrink & shadow
  ──────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    let lastScroll = 0;

    function onScroll() {
      const y = window.scrollY;

      // Add shadow when scrolled past 20px
      if (y > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ────────────────────────────────────────────
     3. MOBILE NAV — hamburger toggle
  ──────────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('open');

      mobileNav.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));

      // Lock body scroll when nav is open
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close nav when a link is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  /* ────────────────────────────────────────────
     4. ACTIVE NAV LINK — highlight current page
  ──────────────────────────────────────────── */
  (function markActiveLink() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    const allLinks = document.querySelectorAll(
      '.navbar__links a, .mobile-nav a'
    );

    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkFile = href.split('/').pop().split('#')[0] || 'index.html';

      if (linkFile === currentFile) {
        link.setAttribute('aria-current', 'page');
        link.style.color = 'var(--color-accent)';
      }
    });
  })();

  /* ────────────────────────────────────────────
     5. SCROLL REVEAL — IntersectionObserver
     Add class="reveal" (and optionally
     "reveal-delay-1" through "reveal-delay-5")
     to any element you want to animate in.
  ──────────────────────────────────────────── */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach(el => observer.observe(el));
  }

  // Run after DOM is fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }

  /* ────────────────────────────────────────────
     6. ANIMATED COUNTERS — data-target attribute
     Usage: <span class="counter" data-target="60">0</span>
  ──────────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(el => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }

})();
