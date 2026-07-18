/* ============================================================
   Bassam Anouti — ICONIC · Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');

  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  /* ---- Build artwork cards from data (image + museum placard) ---- */
  const cards = Array.from(document.querySelectorAll('.artwork-card'));

  const sizeOf = (dims) => (dims || '').split('.')[0].trim();       // "700 x 700 mm"

  cards.forEach(card => {
    const d = card.dataset;
    const size = sizeOf(d.dimensions);

    const frame = document.createElement('div');
    frame.className = 'artwork-card__frame';
    if (d.image) {
      const img = document.createElement('img');
      img.src = d.image;
      img.alt = d.title;
      img.loading = 'lazy';
      frame.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'artwork-card__placeholder';
      const pt = document.createElement('span'); pt.className = 'pt'; pt.textContent = d.title;
      const pd = document.createElement('span'); pd.className = 'pd'; pd.textContent = size;
      ph.append(pt, pd);
      frame.appendChild(ph);
    }

    const label = document.createElement('figcaption');
    label.className = 'artwork-card__label';
    const title = document.createElement('span'); title.className = 'artwork-card__title'; title.textContent = d.title;
    const meta  = document.createElement('span'); meta.className  = 'artwork-card__meta';
    meta.textContent = `${d.category} · ${size}`;
    label.append(title, meta);

    card.replaceChildren(frame, label);

    // keyboard-operable — cards behave like buttons
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${d.title} — view details`);
  });

  /* ---- Gallery filtering (by category section) ---- */
  const filterBtns = document.querySelectorAll('.gallery__filter');
  const catSections = document.querySelectorAll('.cat');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      catSections.forEach(section => {
        section.style.display = (cat === 'all' || section.dataset.category === cat) ? '' : 'none';
      });
    });
  });

  /* ---- Modal ---- */
  const backdrop = document.querySelector('.modal-backdrop');
  const modal    = document.querySelector('.modal');
  const modalClose = modal.querySelector('.modal__close');
  const modalCategory   = modal.querySelector('.modal__category');
  const modalTitle      = modal.querySelector('.modal__title');
  const modalDimensions = modal.querySelector('.modal__dimensions');
  const modalBody       = modal.querySelector('.modal__body');
  const modalImage      = modal.querySelector('.modal__image');

  const openModal = (card) => {
    const d = card.dataset;
    modalCategory.textContent   = d.category;
    modalTitle.textContent      = d.title;
    modalDimensions.textContent = d.dimensions;
    modalBody.innerHTML         = d.description;

    if (d.image) {
      const img = document.createElement('img');
      img.src = d.image; img.alt = d.title;
      modalImage.replaceChildren(img);
    } else {
      modalImage.innerHTML =
        `<div class="artwork-card__placeholder"><span class="pt">${d.title}</span><span class="pd">${sizeOf(d.dimensions)}</span></div>`;
    }

    modalBody.scrollTop = 0;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  };

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  const closeModal = () => {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };
  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    // Elements already in (or above) the viewport at load show immediately —
    // no flash of hidden content; only below-fold elements animate on scroll.
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }
});
