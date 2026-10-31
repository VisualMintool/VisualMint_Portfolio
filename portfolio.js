/* ==========================================
   ANFA VISUALS - portfolio.js
   assets/portfolio/manifest.json se images padhta hai aur
   category filter + masonry gallery + lightbox chalata hai.
   Is file mein koi image ka naam likhne ki zaroorat nahi.
   ========================================== */
(() => {
  'use strict';

  const MANIFEST_URL = 'assets/portfolio/manifest.json';
  const PAGE_SIZE = 12; // ek baar mein itni images dikhao, phir "Load more"

  // Folder ka naam -> filter ka label
  const LABELS = {
    thumbnails: 'Thumbnails',
    logos: 'Logos',
    'social-media': 'Social Media & Posts',
    other: 'Other'
  };

  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const filtersEl = document.getElementById('galleryFilters');
  const statusEl = document.getElementById('galleryStatus');
  const moreBtn = document.getElementById('galleryMore');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImage');
  const lbCap = document.getElementById('lbCaption');
  const lbClose = lb.querySelector('.lb-close');
  const lbPrev = lb.querySelector('.lb-prev');
  const lbNext = lb.querySelector('.lb-next');

  let items = [];
  let filtered = [];
  let shown = 0;
  let currentFilter = 'all';
  let cols = [];
  let heights = [];

  /* ---------- Helpers ---------- */
  const toUrl = path => path.split('/').map(encodeURIComponent).join('/');

  function prettyName(src) {
    const file = src.split('/').pop().replace(/\.[^.]+$/, '');
    return file.replace(/[-_]+/g, ' ').trim() || 'Portfolio image';
  }

  const columnCount = () => (grid.clientWidth >= 860 ? 3 : 2);

  /* ---------- Masonry (original proportion, left-to-right order) ---------- */
  function buildColumns(n) {
    grid.textContent = '';
    cols = [];
    heights = [];
    for (let i = 0; i < n; i++) {
      const col = document.createElement('div');
      col.className = 'gallery-col';
      grid.appendChild(col);
      cols.push(col);
      heights.push(0);
    }
  }

  function createEl(item) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-item';
    btn.setAttribute('aria-label', 'Open ' + item.alt);
    btn.style.aspectRatio = item.width && item.height ? item.width + ' / ' + item.height : '4 / 3';

    const img = new Image();
    img.alt = item.alt;
    img.decoding = 'async';
    img.loading = 'lazy';
    if (item.width && item.height) {
      img.width = item.width;
      img.height = item.height;
    }
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      if (img.naturalWidth && img.naturalHeight) {
        btn.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
      }
    });
    img.addEventListener('error', () => { btn.hidden = true; });
    img.src = item.url;

    const tag = document.createElement('span');
    tag.className = 'gallery-tag';
    tag.textContent = item.label;

    btn.append(img, tag);
    btn.addEventListener('click', () => openLightbox(filtered.indexOf(item)));
    return btn;
  }

  function place(item) {
    let c = 0;
    for (let i = 1; i < heights.length; i++) {
      if (heights[i] < heights[c] - 0.001) c = i;
    }
    if (!item.el) item.el = createEl(item);
    cols[c].appendChild(item.el);
    heights[c] += (item.width && item.height ? item.height / item.width : 0.75) + 0.05;
  }

  function updateUI() {
    const hasMore = shown < filtered.length;
    moreBtn.hidden = !hasMore;
    if (!items.length) {
      statusEl.textContent = 'Portfolio images are coming soon.';
    } else if (!filtered.length) {
      statusEl.textContent = 'No images in this category yet.';
    } else {
      statusEl.textContent = hasMore ? `Showing ${shown} of ${filtered.length}` : '';
    }
  }

  function renderAll() {
    buildColumns(columnCount());
    filtered.slice(0, shown).forEach(place);
    updateUI();
  }

  function loadMore() {
    const next = Math.min(shown + PAGE_SIZE, filtered.length);
    for (let i = shown; i < next; i++) place(filtered[i]);
    shown = next;
    updateUI();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filtered = filter === 'all' ? items : items.filter(i => i.category === filter);
    shown = Math.min(PAGE_SIZE, filtered.length);
    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
      const on = btn.dataset.filter === filter;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    renderAll();
  }

  /* ---------- Lightbox ---------- */
  let lastFocus = null;
  let touchX = null;

  function showImage(i) {
    if (!filtered.length) return;
    const total = filtered.length;
    const index = (i + total) % total;
    const item = filtered[index];

    lb.dataset.index = index;
    lbImg.classList.remove('ready');
    lbImg.onload = () => lbImg.classList.add('ready');
    lbImg.src = item.url;
    lbImg.alt = item.alt;
    lbCap.textContent = `${item.label}  •  ${index + 1} / ${total}`;

    const multi = total > 1;
    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;
    if (multi) {
      new Image().src = filtered[(index + 1) % total].url;
      new Image().src = filtered[(index - 1 + total) % total].url;
    }
  }

  const step = d => showImage(Number(lb.dataset.index || 0) + d);

  function openLightbox(i) {
    if (i < 0) return;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showImage(i);
    lbClose.focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => step(-1));
  lbNext.addEventListener('click', () => step(1));
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lb-stage')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      // focus lightbox ke andar hi rahe
      const btns = [lbClose, lbPrev, lbNext].filter(b => !b.hidden);
      const pos = btns.indexOf(document.activeElement);
      e.preventDefault();
      btns[(pos + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  });

  lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- Events ---------- */
  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (btn && btn.dataset.filter !== currentFilter) setFilter(btn.dataset.filter);
  });

  moreBtn.addEventListener('click', loadMore);

  // Button screen ke qareeb aaye to khud aur images load ho jayein
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !moreBtn.hidden) loadMore();
    }, { rootMargin: '500px 0px' }).observe(moreBtn);
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (items.length && columnCount() !== cols.length) renderAll();
    }, 150);
  });

  /* ---------- Start ---------- */
  function init(data) {
    const seen = new Set();
    items = (Array.isArray(data.items) ? data.items : [])
      .filter(i => i && typeof i.src === 'string' && LABELS[i.category] && !seen.has(i.src) && seen.add(i.src))
      .map(i => {
        const label = LABELS[i.category];
        return Object.assign({}, i, {
          label,
          url: toUrl(i.src),
          alt: prettyName(i.src) + ' - ' + label
        });
      });

    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
      const f = btn.dataset.filter;
      const n = f === 'all' ? items.length : items.filter(i => i.category === f).length;
      const count = btn.querySelector('.count');
      if (count) count.textContent = n;
    });

    setFilter('all');
  }

  statusEl.textContent = 'Loading portfolio...';

  fetch(MANIFEST_URL, { cache: 'no-cache' })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(init)
    .catch(() => {
      statusEl.textContent = location.protocol === 'file:'
        ? 'Gallery needs a web server (GitHub Pages or VS Code Live Server). It will not load when the file is opened directly.'
        : 'The portfolio could not be loaded right now. Please refresh the page.';
    });
})();
