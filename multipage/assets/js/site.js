(() => {
  const body = document.body;
  const nav = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => body.classList.add('is-ready'));

  const updateNav = () => nav?.classList.toggle('is-scrolled', window.scrollY > 32);
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  const closeMenu = () => {
    nav?.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    body.style.overflow = '';
  };

  menuButton?.addEventListener('click', () => {
    const open = !nav.classList.contains('menu-open');
    nav.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    body.style.overflow = open ? 'hidden' : '';
  });

  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('menu-open')) {
      closeMenu();
      menuButton?.focus();
    }
  });

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  const pointerStage = document.querySelector('[data-pointer-stage]');
  if (pointerStage && !reducedMotion) {
    pointerStage.addEventListener('pointermove', event => {
      const rect = pointerStage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 22;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 22;
      pointerStage.style.setProperty('--mx', `${x}px`);
      pointerStage.style.setProperty('--my', `${y}px`);
    });
    pointerStage.addEventListener('pointerleave', () => {
      pointerStage.style.setProperty('--mx', '0px');
      pointerStage.style.setProperty('--my', '0px');
    });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-transition]');
    if (!link || reducedMotion || event.metaKey || event.ctrlKey || event.shiftKey || link.target === '_blank') return;
    const destination = link.href;
    if (!destination || destination.startsWith('mailto:')) return;
    event.preventDefault();
    body.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = destination; }, 220);
  });

  const contentRoot = body.dataset.siteRoot || '';
  const escapeHTML = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const safeImage = image => {
    if (!image || typeof image.src !== 'string' || !image.src.startsWith('media/cropped/')) return null;
    if (/do not publish/i.test(image.chromeNote || '')) return null;
    return image;
  };

  const imageFigure = (image, className = '', loading = 'lazy') => {
    const asset = safeImage(image);
    if (!asset) return '';
    return `<figure class="art-fragment ${className}">
      <img src="${escapeHTML(contentRoot + asset.src)}" alt="${escapeHTML(asset.alt || 'Artwork detail by Bassam Anouti')}" loading="${loading === 'eager' ? 'eager' : 'lazy'}" decoding="async">
    </figure>`;
  };

  const workMedia = work => {
    const images = (work.images || []).map(safeImage).filter(Boolean).slice(0, 2);
    if (!images.length) {
      return `<div class="work-media work-media--empty" aria-label="Artwork detail not currently available">
        <span>Visual detail<br>in preparation</span>
      </div>`;
    }
    return `<div class="work-media work-media--${images.length}">
      ${images.map((image, index) => imageFigure(image, `art-fragment--${index + 1}`)).join('')}
    </div>`;
  };

  const workMeta = work => [work.date, work.origin, work.dimensions, work.medium]
    .filter(Boolean)
    .map(escapeHTML)
    .join('<span aria-hidden="true">·</span>');

  const renderHome = content => {
    const stage = document.querySelector('[data-home-art]');
    const facts = document.querySelector('[data-home-facts]');
    if (!stage) return;
    const iconic = content.series.find(series => series.slug === 'iconic');
    const bestiaire = content.series.find(series => series.slug === 'bestiaire-mythique');
    const iconicImage = iconic?.groups?.[0]?.works?.[0]?.images?.[1] || iconic?.groups?.[0]?.works?.[0]?.images?.[0];
    const bestiaireImage = bestiaire?.groups?.[0]?.works?.[0]?.images?.[0];
    stage.innerHTML = `${imageFigure(iconicImage, 'home-fragment home-fragment--iconic', 'eager')}${imageFigure(bestiaireImage, 'home-fragment home-fragment--bestiaire', 'eager')}`;
    if (facts) {
      const workCount = content.series.flatMap(series => series.groups || []).flatMap(group => group.works || []).length;
      const places = (content.artist?.places || []).join(' · ');
      facts.innerHTML = `<span>${content.series.length} series</span><span>${workCount} works indexed</span><span>${escapeHTML(places)}</span>`;
    }
  };

  const renderSeriesIndex = content => {
    const container = document.querySelector('[data-series-worlds]');
    if (!container) return;
    container.innerHTML = content.series.map((series, index) => {
      const works = (series.groups || []).flatMap(group => group.works || []);
      const image = works.flatMap(work => work.images || []).map(safeImage).find(Boolean);
      const groups = (series.groups || []).map(group => group.title).join(' · ');
      return `<article class="series-world series-world--${escapeHTML(series.slug)} reveal is-visible">
        <a class="series-world__link" href="${escapeHTML(contentRoot + `series/${series.slug}/`)}" data-transition aria-label="Explore ${escapeHTML(series.title)}">
          <div class="series-world__media">${imageFigure(image)}</div>
          <div class="series-world__number">0${index + 1}</div>
          <div class="series-world__copy">
            <p class="kicker">${escapeHTML(series.date)} · ${works.length} works</p>
            <h2>${escapeHTML(series.title)}</h2>
            <p>${escapeHTML(series.subtitle || series.statement)}</p>
            <span class="series-world__groups">${escapeHTML(groups)}</span>
          </div>
          <span class="series-world__enter">Enter series <span aria-hidden="true">↗</span></span>
        </a>
      </article>`;
    }).join('');
  };

  const renderSeriesPage = content => {
    const container = document.querySelector('[data-series-page]');
    const slug = body.dataset.series;
    if (!container || !slug) return;
    const series = content.series.find(item => item.slug === slug);
    if (!series) return;
    const heroStage = document.querySelector('[data-series-hero]');
    const allWorks = (series.groups || []).flatMap(group => group.works || []);
    const heroImages = allWorks.flatMap(work => work.images || []).map(safeImage).filter(Boolean).slice(0, 2);
    if (heroStage) {
      heroStage.innerHTML = heroImages.map((image, index) =>
        imageFigure(image, `series-hero-fragment series-hero-fragment--${index + 1}`, 'eager')
      ).join('');
    }
    const chapterNav = (series.groups || []).map((group, index) =>
      `<a href="#${escapeHTML(group.slug)}"><span>0${index + 1}</span>${escapeHTML(group.title)}</a>`
    ).join('');
    const chapters = (series.groups || []).map((group, groupIndex) => {
      const works = (group.works || []).map((work, workIndex) => {
        const number = String(workIndex + 1).padStart(2, '0');
        return `<article class="work-sequence__item" id="${escapeHTML(work.slug)}">
          <div class="work-sequence__index" aria-hidden="true">${number}</div>
          ${workMedia(work)}
          <div class="work-copy">
            <p class="work-copy__meta">${workMeta(work)}</p>
            <h3>${escapeHTML(work.title)}</h3>
            <p>${escapeHTML(work.summary)}</p>
          </div>
        </article>`;
      }).join('');
      return `<section class="series-chapter-block" id="${escapeHTML(group.slug)}" aria-labelledby="${escapeHTML(group.slug)}-title">
        <header class="chapter-heading reveal is-visible">
          <p class="route-number">0${groupIndex + 1} / ${escapeHTML(series.title)}</p>
          <h2 id="${escapeHTML(group.slug)}-title">${escapeHTML(group.title)}</h2>
          <span>${group.works.length} works</span>
        </header>
        <div class="work-sequence">${works}</div>
      </section>`;
    }).join('');
    container.innerHTML = `<section class="series-statement">
      <div class="series-statement__aside">
        <p class="kicker">${escapeHTML(series.date)}</p>
        <nav class="chapter-nav" aria-label="${escapeHTML(series.title)} chapters">${chapterNav}</nav>
      </div>
      <div class="series-statement__copy"><p>${escapeHTML(series.statement)}</p></div>
    </section>${chapters}`;
  };

  const renderExhibitions = content => {
    const container = document.querySelector('[data-exhibitions]');
    if (!container) return;
    const verified = (content.exhibitions || []).filter(exhibition => exhibition.verified === true);
    if (!verified.length) {
      container.innerHTML = `<div class="archive-state reveal is-visible">
        <p class="kicker">Archive in review</p>
        <p>The exhibition chronology is being source-checked with the artist. Only confirmed public presentations will appear here.</p>
        <span>No unverified event has been published.</span>
      </div>`;
      return;
    }
    container.innerHTML = `<ol class="exhibition-list">${verified.map(exhibition => `<li>
      <time>${escapeHTML(exhibition.year)}</time>
      <div><h2>${escapeHTML(exhibition.title)}</h2><p>${escapeHTML(exhibition.venue)}</p></div>
      <span>${escapeHTML(exhibition.location)}</span>
    </li>`).join('')}</ol>`;
  };

  const renderContact = content => {
    const facts = document.querySelector('[data-contact-facts]');
    const action = document.querySelector('[data-contact-action]');
    if (!facts) return;
    const contact = content.contact || {};
    const emailConfirmed = contact.email && !/not independently confirmed/i.test(contact.email_note || '') &&
      !(contact.needs_confirmation || []).some(item => item.includes(contact.email));
    const rows = [];
    if (contact.location) rows.push(`<div><dt>Based in</dt><dd>${escapeHTML(contact.location)}</dd></div>`);
    if (contact.instagram) rows.push(`<div><dt>Instagram</dt><dd><a href="${escapeHTML(contact.instagram)}" target="_blank" rel="noreferrer">View profile ↗</a></dd></div>`);
    if (contact.artsy) rows.push(`<div><dt>Artsy</dt><dd><a href="${escapeHTML(contact.artsy)}" target="_blank" rel="noreferrer">View profile ↗</a></dd></div>`);
    facts.innerHTML = rows.join('');
    if (emailConfirmed && action) {
      action.innerHTML = `<a class="contact-mail" href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a>`;
    } else if (action) {
      action.innerHTML = `<p class="contact-pending">Direct contact details are being verified.</p>`;
    }
  };

  const loadContent = async () => {
    if (!document.querySelector('[data-content]')) return;
    try {
      const response = await fetch(new URL(`${contentRoot}data/site-content.json`, document.baseURI));
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      const content = await response.json();
      renderHome(content);
      renderSeriesIndex(content);
      renderSeriesPage(content);
      renderExhibitions(content);
      renderContact(content);
    } catch (error) {
      console.error(error);
      document.querySelectorAll('[data-content]').forEach(region => {
        if (!region.children.length) region.innerHTML = '<p class="content-error">Content is temporarily unavailable.</p>';
      });
    }
  };

  loadContent();
})();
