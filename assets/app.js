/* Ascendr — motion layer.
   Scroll reveals, animated counters, sticky nav state, hero line reveal. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- hero masked-line reveal ---- */
  function ready() {
    document.querySelectorAll('[data-lines]').forEach(function (n) {
      n.classList.add('ready');
    });
  }

  /* ---- scroll reveal, staggered within a group ---- */
  function reveals() {
    var els = [].slice.call(document.querySelectorAll('[data-rv]'));
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseFloat(el.dataset.rv) || 0;
        setTimeout(function () { el.classList.add('in'); }, d * 1000);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- count-up numbers ---- */
  function counters() {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;

    function fmt(v, dec, suffix, prefix) {
      var s = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-GB');
      return (prefix || '') + s + (suffix || '');
    }

    function run(el) {
      var target = parseFloat(el.dataset.count);
      var dec = (el.dataset.count.split('.')[1] || '').length;
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      if (reduce) { el.textContent = fmt(target, dec, suffix, prefix); return; }
      var dur = 1400, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * e, dec, suffix, prefix);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.4 });
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
    if (reduce) return;
    var bg = document.querySelector('.hero-bg');
    if (!bg) return;
    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          bg.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
        }
        raf = null;
      });
    }, { passive: true });
  }

  function init() {
    navState();
    reveals();
    counters();
    parallax();
    requestAnimationFrame(function () { setTimeout(ready, 60); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
