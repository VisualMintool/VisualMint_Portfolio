/* ==========================================
   ANFA VISUALS - script.js (lightweight)
   ========================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // iPhone par touch se :active kaam kare
  document.addEventListener('touchstart', () => {}, { passive: true });

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const hamburger = $('.hamburger');
  const navMenu = $('.nav-links');
  const navLinks = $$('.nav-link');

  function setMenu(open) {
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

  /* ---------- Scroll: header + back-to-top (sirf state badalne par kaam) ---------- */
  const header = $('header');
  const backToTop = $('#backToTop');
  let ticking = false;
  let isScrolled = false;
  let isPastTop = false;

  function onScroll() {
    const y = window.scrollY;
    const scrolled = y > 50;
    const past = y > 500;
    if (scrolled !== isScrolled) { isScrolled = scrolled; header.classList.toggle('scrolled', scrolled); }
    if (past !== isPastTop) { isPastTop = past; backToTop.classList.toggle('show', past); }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- Active nav link (scroll par layout nahi padhta) ---------- */
  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach(sec => spyObserver.observe(sec));

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Counter animation ---------- */
  function countUp(el, target, duration = 1500) {
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(p * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(start);
  }

  const heroStats = $('.hero-stats');
  if (heroStats) {
    const statObserver = new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        $$('.stat-number', heroStats).forEach(n => countUp(n, parseInt(n.dataset.count, 10)));
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    statObserver.observe(heroStats);
  }

  /* ---------- Scroll reveal (hover effects ke saath conflict nahi karta) ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Service cards (scroll ruk jane par, screen se bahar ho to band) ---------- */
  const serviceCards = $$('.serviceCard');
  let cardObserver = null;
  let activeCard = null;
  let offscreen = false;
  let wasAbove = false;
  let closeTimer = null;

  function closeAll() {
    clearTimeout(closeTimer);
    serviceCards.forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-expanded', 'false');
    });
    if (cardObserver) {
      cardObserver.disconnect();
      cardObserver = null;
    }
    activeCard = null;
    offscreen = false;
  }

  function autoClose() {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight;
    const above = wasAbove;
    closeAll();
    if (above) {
      // Card upar tha: band hone se page jump na kare
      const diff = h - document.documentElement.scrollHeight;
      if (diff > 0 && Math.abs(window.scrollY - y) < 1) {
        window.scrollTo({ top: y - diff, behavior: 'instant' });
      }
    }
  }

  // Scroll chal raha ho to kuch nahi; rukne ke 150ms baad band
  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { if (activeCard && offscreen) autoClose(); }, 150);
  }

  window.addEventListener('scroll', () => {
    if (activeCard && offscreen) scheduleClose();
  }, { passive: true });

  function toggleCard(card) {
    const wasActive = card.classList.contains('active');
    closeAll();
    if (wasActive) return;

    card.classList.add('active');
    card.setAttribute('aria-expanded', 'true');
    activeCard = card;

    // -80px: navbar ke peeche chhupa hua hissa bhi "bahar" maana jaye
    cardObserver = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      offscreen = !entry.isIntersecting;
      wasAbove = entry.boundingClientRect.bottom < 80;
      if (offscreen) scheduleClose();
      else clearTimeout(closeTimer);
    }, { rootMargin: '-80px 0px 0px 0px' });
    cardObserver.observe(card);
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => toggleCard(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });

  /* ---------- Typing effect ---------- */
  const typed = $('.typed-text');
  if (typed && !reduceMotion) {
    const text = typed.textContent;
    typed.textContent = '';
    let i = 0;
    (function type() {
      if (i < text.length) {
        typed.textContent += text.charAt(i++);
        setTimeout(type, 90);
      }
    })();
  }

  /* ---------- Email card: copy + mobile par mail app ---------- */
  const emailCard = $('#emailCard');
  if (emailCard) {
    const label = $('.contact-label', emailCard);
    const email = emailCard.getAttribute('href').replace('mailto:', '');
    const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        const box = document.createElement('textarea');
        box.value = text;
        box.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(box);
        box.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
        box.remove();
        return ok;
      }
    }

    emailCard.addEventListener('click', e => {
      e.preventDefault();
      const copied = copyText(email);
      if (isMobile) window.location.href = 'mailto:' + email;
      copied.then(ok => {
        if (!ok) return;
        label.textContent = 'Email copied ✓';
        setTimeout(() => { label.textContent = 'Email'; }, 2000);
      });
    });
  }

})();
