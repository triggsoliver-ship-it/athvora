/* Ascendr — motion layer.

   Rules learned the hard way on this build:
   1. CSS never hides content. Every reveal starts from the visible state and is
      set up here, so if this file fails the page still reads perfectly.
   2. No overflow-clipping masks on type. A tight line-height plus overflow:hidden
      clips Anton's ascenders, and tearing the mask down again left stale
      composited layers in Chrome. The headline now uses the same opacity/rise
      as everything else — less clever, always correct.
   3. No will-change. It bought nothing here and caused the stale layers. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;
  var animate = !reduce && canObserve;

  var EASE = 'cubic-bezier(.16,1,.3,1)';

  /* ---- headline: staggered rise, line by line ---- */
  function lines() {
    var groups = [].slice.call(document.querySelectorAll('[data-lines]'));
    if (!groups.length || !animate) return;

    groups.forEach(function (g) {
      var ls = [].slice.call(g.querySelectorAll('.mline'));
      if (!ls.length) return;

      ls.forEach(function (l) {
        l.style.opacity = '0';
        l.style.transform = 'translateY(22px)';
      });

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ls.forEach(function (l, i) {
            l.style.transition = 'opacity .8s ' + EASE + ' ' + (i * 0.1) + 's, transform .9s ' + EASE + ' ' + (i * 0.1) + 's';
            // land on explicit final values and leave them there, so nothing
            // is removed later and no stale layer can survive
            l.style.opacity = '1';
            l.style.transform = 'translateY(0)';
          });
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
