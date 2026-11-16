/* ==========================================================================
   Додаткові ефекти (v2-effects). Вмикаються класами на <html>:
   fx-marquee, fx-reveal, fx-parallax. При prefers-reduced-motion — вимкнені.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* ---------- fx-marquee: дублюємо стрічку для безшовного циклу ---------- */
  if (root.classList.contains('fx-marquee')) {
    document.querySelectorAll('.ticker__track').forEach(function (track) {
      Array.prototype.slice.call(track.children).forEach(function (node) {
        track.appendChild(node.cloneNode(true));
      });
      track.classList.add('is-looped');
    });
  }

  /* ---------- fx-reveal: поява блоків під час прокрутки ---------- */
  if (root.classList.contains('fx-reveal') && 'IntersectionObserver' in window) {
    var targets = [
      '.section__title',
      '.categories__item',
      '.slider__track',
      '.product-grid > li',
      '.about__inner',
      '.advantage-card',
      '.faq__list'
    ];

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll(targets.join(',')).forEach(function (el) {
      // Невелика затримка для карток в одному ряду (до 6 у ряду)
      var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--fx-delay', (siblings % 6) * 60 + 'ms');
      el.classList.add('fx-reveal-item');
      observer.observe(el);
    });
  }

  /* ---------- fx-parallax: банер рухається повільніше за сторінку ---------- */
  if (root.classList.contains('fx-parallax')) {
    var desktop = window.matchMedia('(min-width: 1024px)');
    var hero = document.querySelector('.hero');
    var img = document.querySelector('.hero__img');
    var ticking = false;

    var render = function () {
      ticking = false;
      if (!desktop.matches) {
        img.style.transform = '';
        return;
      }
      var y = window.scrollY;
      if (y > hero.offsetHeight) return;
      img.style.transform = 'translate3d(0, ' + (y * 0.25).toFixed(1) + 'px, 0)';
    };

    if (hero && img) {
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(render);
        }
      }, { passive: true });
      desktop.addEventListener('change', render);
      render();
    }
  }
})();
