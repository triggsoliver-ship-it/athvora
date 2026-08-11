/* Athvora — motion layer.

   Rules learned the hard way on this build:
   1. CSS never hides content. Reveals start from the visible state and are set
      up here, so if this file fails the page still reads perfectly.
   2. The hero headline is NOT animated. Every attempt (overflow mask, then an
      opacity/translate rise) left it half-painted in Chrome on first load. Big
      display type that is simply there beats big display type that sometimes
      isn't. The rest of the page carries the motion.
   3. No mix-blend-mode overlays, no will-change. Both broke compositing here. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;
  var animate = !reduce && canObserve;

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

    // safety net: nothing stays hidden for more than 3s
    setTimeout(function () {
      els.forEach(function (e) { e.classList.add('in'); });
    }, 3000);
  }

  /* ---- count-up numbers ---- */
  function counters() {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length || !animate) return;   // markup already holds the final figure

    function fmt(v, dec, suffix, prefix) {
      var s = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-GB');
      return (prefix || '') + s + (suffix || '');
    }

    function run(el) {
      var target = parseFloat(el.dataset.count);
      var dec = (el.dataset.count.split('.')[1] || '').length;
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var dur = 1300, t0 = null;
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

  function init() {
    try { navState(); } catch (e) {}
    try { reveals(); } catch (e) {}
    try { counters(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
