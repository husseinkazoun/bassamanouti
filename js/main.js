/* ============================================
   Bassam Anouti Portfolio — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll ---- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ---- Mobile menu ---- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ---- Gallery filtering ---- */
  const filterBtns = document.querySelectorAll('.gallery__filter');
  const cards      = document.querySelectorAll('.artwork-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.category;
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
          requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 350);
        }
      });
    });
  });

  /* ---- Modal ---- */
  const backdrop = document.querySelector('.modal-backdrop');
  const modal    = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal__close');

  const modalCategory   = modal.querySelector('.modal__category');
  const modalTitle      = modal.querySelector('.modal__title');
  const modalDimensions = modal.querySelector('.modal__dimensions');
  const modalBody       = modal.querySelector('.modal__body');
  const modalImage      = modal.querySelector('.modal__image');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const data = card.dataset;
      modalCategory.textContent   = data.category;
      modalTitle.textContent      = data.title;
      modalDimensions.textContent = data.dimensions;
      modalBody.innerHTML         = data.description;

      // Image handling
      const imgSrc = data.image;
      if (imgSrc) {
        modalImage.innerHTML = `<img src="${imgSrc}" alt="${data.title}">`;
      } else {
        modalImage.innerHTML = `
          <div class="artwork-card__placeholder">
            <div class="placeholder-title">${data.title}</div>
            <div class="placeholder-dim">${data.dimensions}</div>
          </div>`;
      }

      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
});
