/* Ascendr — motion layer.

   Rules learned the hard way:
   1. CSS never hides content. Reveals start from the visible state and are set
      up here, so if this file fails the page still reads perfectly.
   2. The masked-line reveal needs overflow:hidden on the line box, but a tight
      line-height clips Anton's ascenders. So this file owns BOTH the overflow
      and a temporary looser line-height, and clears them when it's done. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;
  var animate = !reduce && canObserve;

  /* ---- masked line reveal ---- */
  function lines() {
    var groups = [].slice.call(document.querySelectorAll('[data-lines]'));
    if (!groups.length || !animate) return;

    groups.forEach(function (g) {
      var masks = [].slice.call(g.querySelectorAll('.mline'));
      if (!masks.length) return;

      masks.forEach(function (m) {
        m.style.lineHeight = '1.06';
        m.style.overflow = 'hidden';
        var inner = m.firstElementChild;
        if (!inner) return;
        inner.style.display = 'block';
        inner.style.transform = 'translateY(105%)';
        inner.style.willChange = 'transform';
      });

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          masks.forEach(function (m, i) {
            var inner = m.firstElementChild;
            if (!inner) return;
            inner.style.transition = 'transform 1.05s cubic-bezier(.16,1,.3,1) ' + (i * 0.09) + 's';
            inner.style.transform = 'translateY(0)';
          });

          // clear everything afterwards so nothing is left clipped or transformed
          setTimeout(function () {
            masks.forEach(function (m) {
              m.style.overflow = '';
              m.style.lineHeight = '';
              var inner = m.firstElementChild;
              if (!inner) return;
              inner.style.transition = '';
              inner.style.transform = '';
              inner.style.willChange = '';
            });
          }, 1500 + masks.length * 90);
        });
      });
    });
  }

  /* ---- scroll reveal ---- */
  function reveals() {
    var els = [].slice.call(document.querySelectorAll('[data-rv]'));
    if (!els.length || !animate) return;

    document.documentElement.classList.add('rv-on');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseFloat(el.dataset.rv) || 0;
        setTimeout(function () { el.classList.add('in'); }, d * 1000);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    els.forEach(function (e) { io.observe(e); });

    // safety net: nothing stays hidden for more than 4s
    setTimeout(function () {
      els.forEach(function (e) { e.classList.add('in'); });
    }, 4000);
  }

  /* ---- count-up numbers ---- */
  function counters() {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length || !animate) return;   // markup holds the final figure already

    function fmt(v, dec, suffix, prefix) {
      var s = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-GB');
      return (prefix || '') + s + (suffix || '');
    }

    function run(el) {
      var target = parseFloat(el.dataset.count);
      var dec = (el.dataset.count.split('.')[1] || '').length;
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var dur = 1400, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)), dec, suffix, prefix);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.35 });

    els.forEach(function (e) { e.textContent = '0'; io.observe(e); });
  }

  /* ---- nav darken on scroll ---- */
  function navState() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var on = false;
    function check() {
      var should = window.scrollY > 40;
      if (should !== on) { on = should; nav.classList.toggle('stuck', on); }
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
  }

  /* ---- hero parallax ---- */
  function parallax() {
    if (!animate) return;
    var bg = document.querySelector('.hero-bg');
    if (!bg) return;
    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          bg.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
        }
        raf = null;
      });
    }, { passive: true });
  }

  function init() {
    try { navState(); } catch (e) {}
    try { reveals(); } catch (e) {}
    try { counters(); } catch (e) {}
    try { parallax(); } catch (e) {}
    try { lines(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
