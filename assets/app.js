/* Ascendr — motion layer.

   Design rule: CSS must never hide content. Every reveal here starts from the
   visible state and is set up imperatively, so if this file fails to load or
   throws, the page still reads perfectly. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;
  var animate = !reduce && canObserve;

  /* ---- masked line reveal, driven entirely from JS ---- */
  function lines() {
    var groups = [].slice.call(document.querySelectorAll('[data-lines]'));
    if (!groups.length || !animate) return;

    groups.forEach(function (g) {
      var inners = [].slice.call(g.querySelectorAll('.mline > span'));
      // hide
      inners.forEach(function (s) {
        s.style.transform = 'translateY(105%)';
        s.style.willChange = 'transform';
      });
      // reveal on the next frame so the transition has a start value
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          inners.forEach(function (s, i) {
            s.style.transition = 'transform 1.05s cubic-bezier(.16,1,.3,1) ' + (i * 0.09) + 's';
            s.style.transform = 'translateY(0)';
          });
          // clean up so nothing is left in a transformed state
          setTimeout(function () {
            inners.forEach(function (s) {
              s.style.willChange = '';
              s.style.transform = '';
              s.style.transition = '';
            });
          }, 1400 + inners.length * 90);
        });
      });
    });
  }

  /* ---- scroll reveal ---- */
  function reveals() {
    var els = [].slice.call(document.querySelectorAll('[data-rv]'));
    if (!els.length || !animate) return;

    // only now do we allow the hidden state to apply
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

    // safety net: if anything is still hidden after 4s, show it
    setTimeout(function () {
      els.forEach(function (e) { e.classList.add('in'); });
    }, 4000);
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
      var dur = 1400, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)), dec, suffix, prefix);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // markup already contains the final figure, so with no JS it just reads correctly
    if (!animate) return;

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
