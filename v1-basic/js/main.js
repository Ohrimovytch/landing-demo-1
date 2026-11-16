/* ==========================================================================
   ARTLINE — Чорна п’ятниця 2026. Базова логіка (v1-basic)
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Посилання з js/links.js ---------- */
  function applyLinks() {
    var links = window.LANDING_LINKS || {};
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var url = links[el.getAttribute('data-link')];
      if (url && url !== '#') {
        el.setAttribute('href', url);
      } else {
        // Заглушка: не відкриваємо порожню вкладку, доки посилання не вставлене
        el.addEventListener('click', function (event) { event.preventDefault(); });
      }
    });
  }

  /* ---------- Фон сторінки: підключаємо після завантаження ---------- */
  function enableBackground() {
    document.documentElement.classList.add('bg-ready');
  }

  /* ---------- Категорії: «Розгорнути» на мобільному ---------- */
  function initCategoriesToggle() {
    var button = document.querySelector('[data-categories-toggle]');
    if (!button) return;
    var list = document.getElementById(button.getAttribute('aria-controls'));
    var label = button.querySelector('[data-toggle-text]');

    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      list.classList.toggle('is-expanded', !expanded);
      label.textContent = expanded ? 'Розгорнути' : 'Згорнути';
    });
  }

  /* ---------- Слайдер: стрілки й точки поверх нативної прокрутки ---------- */
  function initSlider(root) {
    var track = root.querySelector('[data-slider-track]');
    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    var dotsBox = root.querySelector('[data-slider-dots]');
    var dots = [];

    function behavior() {
      return reduceMotion.matches ? 'auto' : 'smooth';
    }

    function pageCount() {
      return Math.max(1, Math.ceil((track.scrollWidth - 1) / track.clientWidth));
    }

    function currentPage() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 2) return pageCount() - 1;
      return Math.round(track.scrollLeft / track.clientWidth);
    }

    function goTo(page) {
      var maxScroll = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: Math.min(page * track.clientWidth, maxScroll), behavior: behavior() });
    }

    function buildDots() {
      var count = pageCount();
      dotsBox.innerHTML = '';
      dots = [];
      dotsBox.hidden = count < 2;
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', 'Сторінка ' + (i + 1) + ' з ' + count);
        dot.setAttribute('aria-controls', track.id);
        dot.addEventListener('click', goTo.bind(null, i));
        dotsBox.appendChild(dot);
        dots.push(dot);
      }
      update();
    }

    function update() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      var page = currentPage();
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
      dots.forEach(function (dot, i) {
        if (i === page) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    prev.addEventListener('click', function () { goTo(currentPage() - 1); });
    next.addEventListener('click', function () { goTo(currentPage() + 1); });

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildDots, 150);
    });

    buildDots();
  }

  applyLinks();
  initCategoriesToggle();
  document.querySelectorAll('[data-slider]').forEach(initSlider);

  if (document.readyState === 'complete') enableBackground();
  else window.addEventListener('load', enableBackground);
})();
