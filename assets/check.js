/* Ascendr Brand Check — demo engine.
   Deterministic from the input string, so the same handle always returns the
   same report. In production these scores come from a real crawl of public
   pages and social profiles; here they are generated so the flow is reviewable. */

(function () {
  'use strict';

  var PILLARS = [
    {
      key: 'exists',
      name: 'Do you exist?',
      low: 'No domain found for this name. Your entire public presence sits on platforms you do not own, cannot export from, and cannot appeal to.',
      mid: 'You are findable, but the top result is a platform profile rather than anything of your own. A sponsor searching your name lands on someone else’s website.',
      high: 'Own domain resolving, indexed, and first result for your name. This is where a brand should land.',
      fix: 'Identity'
    },
    {
      key: 'kit',
      name: 'The media kit test',
      low: 'No media kit, no rate card, no contact route except a DM request folder. A marketing manager with a budget and a deadline gives up here and calls someone else.',
      mid: 'Contact details exist but the numbers do not. Any brand has to ask you for your reach, which means you are negotiating from behind.',
      high: 'Reach, engagement, audience split and a contact route all published and current. A brand can price you without asking.',
      fix: 'Commercial'
    },
    {
      key: 'consistency',
      name: 'Consistency',
      low: 'Long silences between bursts. The gaps line up with the difficult months, which is exactly when an audience decides whether it stays.',
      mid: 'Regular in season, near-silent out of it. The off-season is the cheapest attention you will ever get and it is being left on the table.',
      high: 'Steady rhythm across the whole calendar, good runs and bad. This is the hardest one to fake and you have it.',
      fix: 'Content Engine'
    },
    {
      key: 'engagement',
      name: 'Engagement quality',
      low: 'Reach without replies. Plenty of people see the posts and almost nobody talks back, which is the pattern brands screen out first.',
      mid: 'Healthy on match content, flat on everything else. The audience follows the results rather than the person — that is fragile the day the results stop.',
      high: 'Comment volume and saves well above the benchmark for your follower count. People are here for you, not the scoreline.',
      fix: 'Content Engine'
    },
    {
      key: 'owned',
      name: 'Owned audience',
      low: 'No email list, no signup form, no way to reach a single one of your followers if an account is lost, hacked or throttled. This is the biggest single gap in the report.',
      mid: 'A signup form exists but it is buried and there is nothing being sent. A list nobody emails is a list that decays.',
      high: 'A list you own, on your own domain, with something actually going out to it. This is the asset that survives everything else.',
      fix: 'Fanbase'
    },
    {
      key: 'commercial',
      name: 'Commercial doors',
      low: 'No shop, no bookings, no enquiry form. Every bit of goodwill you have built has nowhere to go and nothing to buy.',
      mid: 'One door open — but no product, no bookable appearances, and no obvious route for a fan who wants to spend money on you.',
      high: 'Shop, bookings and enquiries all live. The audience has somewhere to go when it decides it likes you.',
      fix: 'Store'
    }
  ];

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;  s >>>= 0;
      return s / 4294967296;
    };
  }

  function band(n) { return n < 45 ? 'bad' : n < 72 ? 'mid' : 'good'; }
  function tier(n) { return n < 45 ? 'low' : n < 72 ? 'mid' : 'high'; }

  function scoreFor(handle) {
    var clean = handle.trim().toLowerCase().replace(/^@/, '');
    var rand = rng(hash(clean) || 1);
    var isClean = /^(demo ?clean|alreadygood|clean)$/.test(clean);

    var scores = {};
    PILLARS.forEach(function (p) {
      var v;
      if (isClean) {
        v = 78 + Math.floor(rand() * 20);
      } else if (p.key === 'owned') {
        v = Math.floor(rand() * 26);
      } else if (p.key === 'exists' || p.key === 'kit') {
        v = 12 + Math.floor(rand() * 52);
      } else {
        v = 24 + Math.floor(rand() * 62);
      }
      scores[p.key] = Math.max(3, Math.min(99, v));
    });

    var total = 0;
    PILLARS.forEach(function (p) { total += scores[p.key]; });
    return { clean: clean, scores: scores, overall: Math.round(total / PILLARS.length), isClean: isClean };
  }

  function verdictFor(r) {
    if (r.isClean) return 'There is nothing here for us to sell you. Your presence is in better shape than most professionals we check. Keep doing what you are doing — and if that changes, the report will say so.';
    if (r.overall < 38) return 'Almost all of your value is sitting on platforms you do not own. If an account went tomorrow you would be starting from nothing. That is the first thing to fix.';
    if (r.overall < 58) return 'You are visible but not commercial. People know who you are, and there is no route for any of them — fan or brand — to spend money on you.';
    if (r.overall < 75) return 'The audience is real and the habits are mostly there. What is missing is ownership: a list, a shop, and numbers a brand can price without asking you for them.';
    return 'Strong footprint. The remaining gaps are commercial rather than creative — packaging what you already have so a brand does not have to work to buy it.';
  }

  var CRAWL = [
    'Resolving name and handles',
    'Checking for a domain you control',
    'Reading public profiles (politely, obeying robots.txt)',
    'Sampling the last 90 days of posts',
    'Looking for a media kit or rate card',
    'Looking for an email signup',
    'Checking shop, bookings and enquiry routes',
    'Scoring six pillars and quoting the evidence'
  ];

  function el(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function run(handle) {
    var crawl = el('crawl'), report = el('report');
    report.classList.add('hidden');
    crawl.classList.remove('hidden');
    crawl.innerHTML =
      '<p class="eyebrow nb">Reading the public footprint</p>' +
      '<div id="lines" style="margin-top:20px"></div>' +
      '<div class="bar"><i id="bar"></i></div>';

    var lines = el('lines'), bar = el('bar'), i = 0;

    CRAWL.forEach(function (t) {
      var d = document.createElement('div');
      d.className = 'cl';
      d.innerHTML = '<span class="tk">•</span><span>' + t + '…</span>';
      lines.appendChild(d);
    });

    (function step() {
      var nodes = lines.children;
      if (i > 0) {
        nodes[i - 1].classList.add('done');
        nodes[i - 1].querySelector('.tk').textContent = '✓';
      }
      if (i >= CRAWL.length) { setTimeout(function () { render(handle); }, 320); return; }
      bar.style.width = Math.round(((i + 1) / CRAWL.length) * 100) + '%';
      i++;
      setTimeout(step, 220 + Math.random() * 190);
    })();

    crawl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function ring(score) {
    var C = 2 * Math.PI * 66;
    var off = C - (score / 100) * C;
    var b = band(score);
    var col = b === 'bad' ? 'var(--ember)' : b === 'mid' ? 'var(--amber)' : 'var(--mint)';
    return '<div class="ring"><svg width="150" height="150" aria-hidden="true">' +
      '<circle cx="75" cy="75" r="66" fill="none" stroke="rgba(240,238,233,.09)" stroke-width="10"/>' +
      '<circle id="arc" cx="75" cy="75" r="66" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round"' +
      ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/></svg>' +
      '<div class="rv"><b id="sv">0</b><small>out of 100</small></div></div>' +
      '<span id="arcT" data-off="' + off.toFixed(1) + '" data-score="' + score + '" hidden></span>';
  }

  function render(handle) {
    var r = scoreFor(handle);
    var report = el('report');
    el('crawl').classList.add('hidden');

    var h = '<div class="report">';
    h += '<div class="rtop">' + ring(r.overall) +
      '<div class="rwho"><h3>' + esc(handle.trim().replace(/^@/, '')) + '</h3>' +
      '<div class="rsub">Ascendr Brand Check · ' +
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
      '</div><div class="rverd">' + verdictFor(r) + '</div></div></div>';

    PILLARS.forEach(function (p, idx) {
      var s = r.scores[p.key], b = band(s), t = tier(s);
      h += '<div class="pil">' +
        '<div class="ph"><b class="pn">' + String(idx + 1).padStart(2, '0') + '</b>' +
        '<h4>' + p.name + '</h4>' +
        '<span class="psc s-' + b + '">' + s + '<span style="opacity:.4">/100</span></span></div>' +
        '<div class="pbar"><i class="f-' + b + '" data-w="' + s + '"></i></div>' +
        '<div class="ev">' + p[t] + (t === 'high' ? '' : ' <b>Fixed by: ' + p.fix + '.</b>') + '</div></div>';
    });

    if (r.isClean) {
      h += '<div class="rfoot"><h4>Nothing to sell you</h4>' +
        '<p>We wrote this check and we sell the fixes, so the check has to be worth trusting on its own. ' +
        'Yours came back clean. There is no follow-up call and no invoice. If it helps, forward it to a teammate ' +
        'whose report probably will not look like this.</p></div>';
    } else {
      var seed = hash(r.clean);
      h += '<div class="rfoot"><h4>What this is costing you</h4>' +
        '<p>Rough, honest estimates for an athlete at your level. Not a promise — a starting point for a conversation.</p>' +
        '<div class="cost">' +
        '<div><b>~' + (2 + (seed % 7)) + '</b><span>brand enquiries a year that currently have nowhere to land</span></div>' +
        '<div><b>0</b><span>followers you could reach tomorrow if an account disappeared tonight</span></div>' +
        '<div><b>£' + (140 + (seed % 9) * 40) + '</b><span>a month of merch margin left on the table at your engagement level</span></div>' +
        '<div><b>' + (6 + (seed % 5)) + ' yrs</b><span>rough earning window left to turn a name into something that outlasts it</span></div>' +
        '</div>' +
        '<a class="btn" href="pricing.html" style="margin-top:28px"><span>See what fixing this costs</span><span class="arw">→</span></a>' +
        '<p class="tiny" style="margin-top:18px">No signup. Nothing stored. This report is yours whether you ever speak to us again or not.</p>' +
        '</div>';
    }

    report.innerHTML = h + '</div>';
    report.classList.remove('hidden');

    requestAnimationFrame(function () {
      var arc = el('arc'), t = el('arcT'), sv = el('sv');
      if (arc && t) {
        arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)';
        arc.style.strokeDashoffset = t.dataset.off;
      }
      if (sv && t) {
        var target = parseInt(t.dataset.score, 10), t0 = null;
        (function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1200, 1);
          sv.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
      report.querySelectorAll('.pbar i').forEach(function (n, k) {
        setTimeout(function () { n.style.width = n.dataset.w + '%'; }, 200 + k * 95);
      });
    });

    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = el('cform');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = el('handle').value.trim();
      if (v.length < 2) { el('handle').focus(); return; }
      run(v);
    });
    document.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        el('handle').value = c.dataset.v;
        run(c.dataset.v);
      });
    });
  });

  if (typeof module !== 'undefined') module.exports = { scoreFor: scoreFor, verdictFor: verdictFor, band: band };
})();
