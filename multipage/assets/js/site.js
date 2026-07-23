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
    if (open) navLinks?.querySelector('a')?.focus();
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

  // A url() kept in a custom property is resolved against the stylesheet that
  // *consumes* it (site.css) rather than this document, so a document-relative
  // path would resolve under assets/css/. Store a fully-resolved URL instead —
  // correct from every route and under any mount point.
  const atmosphereURL = src => new URL(src, document.baseURI).href;

  const imageFigure = (image, className = '', loading = 'lazy') => {
    const asset = safeImage(image);
    if (!asset) return '';
    const src = contentRoot + asset.src;
    const assetPath = escapeHTML(src);
    return `<figure class="art-fragment ${className}" style="--art-source: url(${escapeHTML(atmosphereURL(src))})">
      <img src="${assetPath}" alt="${escapeHTML(asset.alt || 'Artwork detail by Bassam Anouti')}" loading="${loading === 'eager' ? 'eager' : 'lazy'}" decoding="async">
    </figure>`;
  };

  const workMedia = work => {
    const images = (work.images || []).map(safeImage).filter(Boolean).slice(0, 2);
    if (!images.length) return '';
    return `<div class="work-media work-media--${images.length}">
      ${images.map((image, index) => imageFigure(image, `art-fragment--${index + 1}`)).join('')}
    </div>`;
  };

  // A series without its own subtitle falls back to its statement, which runs to
  // several sentences — the line clamp then cut it mid-word ("…new races of
  // hybrid…"). Take the opening sentence so the row reads as a deliberate
  // standfirst, matching the series that do carry a subtitle.
  const leadSentence = text => {
    const value = String(text ?? '').trim();
    const end = value.search(/[.!?](\s|$)/);
    return end === -1 ? value : value.slice(0, end + 1);
  };

  const workMeta = work => [work.date, work.origin, work.dimensions]
    .filter(Boolean)
    .map(escapeHTML)
    .join('<span aria-hidden="true">·</span>');

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
            <p>${escapeHTML(series.subtitle || leadSentence(series.statement))}</p>
            <span class="series-world__groups">${escapeHTML(groups)}</span>
          </div>
          <span class="series-world__enter">Enter series <span aria-hidden="true">↗</span></span>
        </a>
      </article>`;
    }).join('');
  };

  const renderIconicPlateLayout = (series, container, studyOnly = false) => {
    const imageOrders = {
      // The atmospheric layout uses one composed fragment per work. Several
      // source entries contain alternate crops of the same artwork; layering
      // those crops made the figure appear duplicated rather than integrated.
      // Semiramis archive uses crop C so the later appearance differs from the hero (crop B).
      'semiramis-and-ninyas': [1],
      'agrippina-and-nero': [0],
      'sitt-al-mulk-and-al-hakim': [0],
      'shajara-al-durr-and-izz-ad-din-aybak': [1],
      'seth-and-horus': [0]
    };

    // Deliberate left/right/center rhythm — avoid consecutive same-side History beats.
    const sceneLayouts = {
      'semiramis-and-ninyas': 'right',
      'agrippina-and-nero': 'left',
      'messalina-and-britannicus': 'right',
      'rodrigo-and-lucrezia-borgia': 'center',
      'al-khayzuran': 'left',
      'sitt-al-mulk-and-al-hakim': 'right',
      'shajara-al-durr-and-izz-ad-din-aybak': 'left',
      'seth-and-horus': 'left',
      'tantalus-and-pelops': 'right',
      'phaedra-and-hippolytus': 'center',
      'jocasta-and-oedipus': 'right',
      'baba-yaga': 'left',
      'kuchisake-onna': 'right'
    };

    const renderPlateWork = (work, index, groupTitle) => {
      const safeImages = (work.images || []).map(safeImage).filter(Boolean);
      const order = imageOrders[work.slug] || safeImages.map((_, imageIndex) => imageIndex);
      const images = order.map(imageIndex => safeImages[imageIndex]).filter(Boolean);
      const countName = images.length === 1 ? 'single' : images.length === 2 ? 'double' : 'triple';
      const figures = images.map((image, imageIndex) =>
        imageFigure(image, `plate-figure plate-figure--${imageIndex + 1}`, index === 0 && imageIndex === 0 ? 'eager' : 'lazy')
      ).join('');

      return `<article class="plate-work plate-work--${countName}" id="${escapeHTML(work.slug)}">
        <header class="plate-work__header">
          <p class="plate-work__index">${String(index + 1).padStart(2, '0')} / ${escapeHTML(groupTitle)}</p>
          <h2>${escapeHTML(work.title)}</h2>
          <p class="plate-work__meta">${workMeta(work)}</p>
        </header>
        <div class="plate-media plate-media--${countName}">${figures}</div>
        <div class="plate-work__caption">
          <p>${escapeHTML(work.summary)}</p>
          <span>Selected details · approved crops</span>
        </div>
      </article>`;
    };

    const renderAtmosphericWork = (work, index, group) => {
      const safeImages = (work.images || []).map(safeImage).filter(Boolean);
      const order = imageOrders[work.slug] || safeImages.map((_, imageIndex) => imageIndex);
      const images = order.map(imageIndex => safeImages[imageIndex]).filter(Boolean).slice(0, 2);
      const layout = sceneLayouts[work.slug] || (index % 2 ? 'right' : 'left');
      const countName = images.length > 1 ? 'double' : 'single';
      const figures = images.map((image, imageIndex) => imageFigure(
        image,
        `iconic-scene__figure iconic-scene__figure--${imageIndex + 1}`,
        index === 0 && imageIndex === 0 ? 'eager' : 'lazy'
      )).join('');

      return `<article class="iconic-scene iconic-scene--${layout} iconic-scene--${countName}" id="${escapeHTML(work.slug)}">
        <div class="iconic-scene__inner">
          <div class="iconic-scene__media" aria-label="Selected details from ${escapeHTML(work.title)}">${figures}</div>
          <header class="iconic-scene__copy">
            <p class="iconic-scene__index">${String(index + 1).padStart(2, '0')} / ${escapeHTML(group.title)}</p>
            <h3>${escapeHTML(work.title)}</h3>
            <p class="iconic-scene__meta">${workMeta(work)}</p>
            <p class="iconic-scene__summary">${escapeHTML(work.summary)}</p>
            ${work.medium ? `<span class="iconic-scene__note">${escapeHTML(work.medium)}</span>` : ''}
          </header>
        </div>
      </article>`;
    };

    const renderAtmosphericPending = (work, index, group) => `<article class="iconic-scene iconic-scene--pending" id="${escapeHTML(work.slug)}">
      <div class="iconic-scene__inner">
        <header class="iconic-scene__copy">
          <p class="iconic-scene__index">${String(index + 1).padStart(2, '0')} / ${escapeHTML(group.title)}</p>
          <h3>${escapeHTML(work.title)}</h3>
          <p class="iconic-scene__meta">${workMeta(work)}</p>
          <p class="iconic-scene__summary">${escapeHTML(work.summary)}</p>
          ${work.medium ? `<span class="iconic-scene__note">${escapeHTML(work.medium)}</span>` : ''}
        </header>
      </div>
    </article>`;

    if (studyOnly) {
      const history = (series.groups || []).find(group => group.slug === 'history');
      if (!history) return;
      const selectedSlugs = [
        'semiramis-and-ninyas',
        'agrippina-and-nero',
        'sitt-al-mulk-and-al-hakim'
      ];
      const selectedWorks = selectedSlugs
        .map(slug => (history.works || []).find(work => work.slug === slug))
        .filter(Boolean);
      const works = selectedWorks.map((work, index) => renderPlateWork(work, index, 'History')).join('');

      container.innerHTML = `<section class="plate-study-intro" aria-label="Presentation principle">
        <p class="kicker">History · Three-work study</p>
        <p>The crop is treated as a finished composition, not raw material. Scale creates drama; clear edges, natural proportions and measured space preserve the image.</p>
      </section>
      <section class="plate-study" aria-label="Selected Iconic works">${works}</section>
      <div class="plate-study-end">
        <p>End of presentation study</p>
        <a href="../iconic/" data-transition>Return to the complete Iconic series <span aria-hidden="true">→</span></a>
      </div>`;
      return;
    }

    const chapterNav = (series.groups || []).map((group, index) =>
      `<a href="#${escapeHTML(group.slug)}"><span>0${index + 1}</span>${escapeHTML(group.title)}</a>`
    ).join('');

    const chapters = (series.groups || []).map((group, groupIndex) => {
      const works = (group.works || []).map((work, workIndex) => {
        const hasImage = (work.images || []).map(safeImage).some(Boolean);
        return hasImage
          ? renderAtmosphericWork(work, workIndex, group)
          : renderAtmosphericPending(work, workIndex, group);
      }).join('');

      return `<section class="plate-chapter plate-chapter--${escapeHTML(group.slug)}" id="${escapeHTML(group.slug)}" aria-labelledby="${escapeHTML(group.slug)}-title">
        <header class="plate-chapter__header">
          <p class="route-number">0${groupIndex + 1} / Iconic</p>
          <h2 id="${escapeHTML(group.slug)}-title">${escapeHTML(group.title)}</h2>
          <span>${group.works.length} works</span>
        </header>
        <div class="plate-chapter__works">${works}</div>
      </section>`;
    }).join('');

    container.innerHTML = `<section class="plate-series-intro">
      <div class="plate-series-intro__aside">
        <p class="kicker">${escapeHTML(series.date)}</p>
        <nav class="chapter-nav" aria-label="Iconic chapters">${chapterNav}</nav>
      </div>
      <div class="plate-series-intro__copy"><p>${escapeHTML(series.statement)}</p></div>
    </section>
    ${chapters}
    <div class="plate-study-end">
      <p>End of Iconic</p>
      <a href="../" data-transition>Return to all work <span aria-hidden="true">→</span></a>
    </div>`;

    setupChapterRail(series.groups || []);
  };

  const setupChapterRail = groups => {
    if (!groups.length) return;
    document.querySelector('.chapter-rail')?.remove();
    const rail = document.createElement('nav');
    rail.className = 'chapter-rail';
    rail.setAttribute('aria-label', 'Chapter progress');
    rail.innerHTML = `<ol>${groups.map((group, index) => `<li>
      <a href="#${escapeHTML(group.slug)}" data-rail="${escapeHTML(group.slug)}">
        <span class="chapter-rail__num" aria-hidden="true">0${index + 1}</span>
        <span class="chapter-rail__tick" aria-hidden="true"></span>
        <span class="chapter-rail__label">${escapeHTML(group.title)}</span>
      </a></li>`).join('')}</ol>`;
    document.body.appendChild(rail);

    const links = {};
    rail.querySelectorAll('[data-rail]').forEach(link => { links[link.dataset.rail] = link; });
    const sections = groups.map(group => document.getElementById(group.slug)).filter(Boolean);
    let current = null;

    const setActive = slug => {
      if (slug === current) return;
      current = slug;
      for (const key in links) {
        const on = key === slug;
        links[key].classList.toggle('is-active', on);
        if (on) links[key].setAttribute('aria-current', 'true');
        else links[key].removeAttribute('aria-current');
      }
    };

    let ticking = false;
    const recompute = () => {
      ticking = false;
      const vh = window.innerHeight;
      const line = vh * 0.4;
      let anyVisible = false;
      let active = null;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < vh) anyVisible = true;
        if (rect.top <= line && rect.bottom >= line) active = el.id;
      }
      if (!active && anyVisible) {
        // between focus lines: keep nearest section above the line
        let best = null, bestTop = -Infinity;
        for (const el of sections) {
          const top = el.getBoundingClientRect().top;
          if (top <= line && top > bestTop) { bestTop = top; active = el.id; best = el; }
        }
      }
      rail.classList.toggle('is-visible', anyVisible);
      if (active) setActive(active);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(recompute); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    recompute();
  };

  const renderBestiaireLayout = (series, container) => {
    const chapterNav = (series.groups || []).map((group, index) =>
      `<a href="#${escapeHTML(group.slug)}"><span>0${index + 1}</span>${escapeHTML(group.title)}</a>`
    ).join('');

    const chapters = (series.groups || []).map((group, groupIndex) => {
      const specimens = (group.works || []).map((work, workIndex) => {
        const image = (work.images || []).map(safeImage).find(Boolean);
        const side = workIndex % 2 === 0 ? 'left' : 'right';
        const source = image ? escapeHTML(atmosphereURL(contentRoot + image.src)) : '';
        const figure = image
          ? imageFigure(image, 'specimen__fragment', groupIndex === 0 && workIndex === 0 ? 'eager' : 'lazy')
          : '';
        return `<article class="specimen specimen--${side}" id="${escapeHTML(work.slug)}"${source ? ` style="--art-source: url(${source})"` : ''}>
          <div class="specimen__media">${figure}</div>
          <div class="specimen__copy">
            <p class="specimen__index">${String(workIndex + 1).padStart(2, '0')} / ${escapeHTML(group.title)}</p>
            <h3>${escapeHTML(work.title)}</h3>
            <p class="specimen__meta">${workMeta(work)}</p>
            <p class="specimen__summary">${escapeHTML(work.summary)}</p>
          </div>
        </article>`;
      }).join('');

      return `<section class="bestiaire-chapter bestiaire-chapter--${escapeHTML(group.slug)}" id="${escapeHTML(group.slug)}" aria-labelledby="${escapeHTML(group.slug)}-title">
        <header class="bestiaire-chapter__header">
          <p class="route-number">0${groupIndex + 1} / Bestiaire Mythique</p>
          <h2 id="${escapeHTML(group.slug)}-title">${escapeHTML(group.title)}</h2>
          <span>${group.works.length} works</span>
        </header>
        <div class="bestiaire-field">${specimens}</div>
      </section>`;
    }).join('');

    container.innerHTML = `<section class="bestiaire-statement">
      <div class="bestiaire-statement__aside">
        <p class="kicker">${escapeHTML(series.date)}</p>
        <nav class="chapter-nav" aria-label="Bestiaire Mythique chapters">${chapterNav}</nav>
      </div>
      <div class="bestiaire-statement__copy"><p>${escapeHTML(series.statement)}</p></div>
    </section>
    ${chapters}
    <div class="bestiaire-end">
      <p>End of Bestiaire Mythique</p>
      <a href="../" data-transition>Return to all work <span aria-hidden="true">→</span></a>
    </div>`;
  };

  const renderSeriesPage = content => {
    const container = document.querySelector('[data-series-page]');
    const slug = body.dataset.series;
    if (!container || !slug) return;
    const series = content.series.find(item => item.slug === slug);
    if (!series) return;
    if (slug === 'iconic' && (body.dataset.seriesStudy === 'plate' || body.dataset.seriesLayout === 'plate')) {
      renderIconicPlateLayout(series, container, body.dataset.seriesStudy === 'plate');
      return;
    }
    if (slug === 'bestiaire-mythique' && body.dataset.seriesLayout === 'atmosphere') {
      renderBestiaireLayout(series, container);
      return;
    }
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
      const visualWorks = (group.works || []).filter(work => (work.images || []).map(safeImage).some(Boolean));
      const furtherWorks = (group.works || []).filter(work => !(work.images || []).map(safeImage).some(Boolean));
      const works = visualWorks.map((work, workIndex) => {
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
      const further = furtherWorks.length ? `<aside class="further-works" aria-label="Further works in ${escapeHTML(group.title)}">
        <p class="kicker">Further works</p>
        <ol>${furtherWorks.map(work => `<li><span>${escapeHTML(work.title)}</span><small>${workMeta(work)}</small></li>`).join('')}</ol>
      </aside>` : '';
      return `<section class="series-chapter-block" id="${escapeHTML(group.slug)}" aria-labelledby="${escapeHTML(group.slug)}-title">
        <header class="chapter-heading reveal is-visible">
          <p class="route-number">0${groupIndex + 1} / ${escapeHTML(series.title)}</p>
          <h2 id="${escapeHTML(group.slug)}-title">${escapeHTML(group.title)}</h2>
          <span>${group.works.length} works</span>
        </header>
        <div class="work-sequence">${works}</div>${further}
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
        <p class="kicker">Exhibitions</p>
        <p>No public exhibition record is listed at this time. Enquiries are welcome by email.</p>
        <span>Only confirmed public presentations are published.</span>
      </div>`;
      return;
    }
    container.innerHTML = `<ol class="exhibition-list">${verified.map(exhibition => `<li>
      <time>${escapeHTML(exhibition.year)}</time>
      <div><h2>${escapeHTML(exhibition.title)}</h2><p>${escapeHTML(exhibition.venue)}</p></div>
      <span>${escapeHTML(exhibition.location)}</span>
    </li>`).join('')}</ol>`;
  };

  const loadContent = async () => {
    if (!document.querySelector('[data-content]')) return;
    try {
      const response = await fetch(new URL(`${contentRoot}data/site-content.json`, document.baseURI));
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      const content = await response.json();
      renderSeriesIndex(content);
      renderSeriesPage(content);
      renderExhibitions(content);
    } catch (error) {
      console.error(error);
      document.querySelectorAll('[data-content]').forEach(region => {
        if (!region.children.length) region.innerHTML = '<p class="content-error">Content is temporarily unavailable.</p>';
      });
    }
  };

  loadContent();
})();
