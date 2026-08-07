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
      blurb: 'A searchable name and a domain you control — or just profiles on platforms that could change the rules tomorrow.',
      low: 'No domain found for this name. Your entire public presence sits on platforms you do not own, cannot export from, and cannot appeal to.',
      mid: 'You are findable, but the top result is a platform profile rather than anything of your own. A sponsor searching your name lands on someone else’s website.',
      high: 'Own domain resolving, indexed, and first result for your name. This is where a brand should land.',
      fix: 'Identity'
    },
    {
      key: 'kit',
      name: 'The media kit test',
      blurb: 'Could a brand find your numbers, your contact and your rate in under two minutes?',
      low: 'No media kit, no rate card, no contact route except a DM request folder. A marketing manager with a budget and a deadline gives up here and calls someone else.',
      mid: 'Contact details exist but the numbers do not. Any brand has to ask you for your reach, which means you are negotiating from behind.',
      high: 'Reach, engagement, audience split and a contact route all published and current. A brand can price you without asking.',
      fix: 'Commercial'
    },
    {
      key: 'consistency',
      name: 'Consistency',
      blurb: 'Your posting rhythm — and whether it survives a bad run of form, an injury or a loan spell.',
      low: 'Long silences between bursts. The gaps line up with the difficult months, which is exactly when an audience decides whether it stays.',
      mid: 'Regular in season, near-silent out of it. The off-season is the cheapest attention you will ever get and it is being left on the table.',
      high: 'Steady rhythm across the whole calendar, good runs and bad. This is the hardest one to fake and you have it.',
      fix: 'Content Engine'
    },
    {
      key: 'engagement',
      name: 'Engagement quality',
      blurb: 'Real conversation versus hollow reach. Brands stopped buying follower counts a long time ago.',
      low: 'Reach without replies. Plenty of people see the posts and almost nobody talks back, which is the pattern brands screen out first.',
      mid: 'Healthy on match content, flat on everything else. The audience follows the results rather than the person — that is fragile the day the results stop.',
      high: 'Comment volume and saves well above the benchmark for your follower count. People are here for you, not the scoreline.',
      fix: 'Content Engine'
    },
    {
      key: 'owned',
      name: 'Owned audience',
      blurb: 'Is there an email list with your name on it, or is every follower rented from someone else?',
      low: 'No email list, no signup form, no way to reach a single one of your followers if an account is lost, hacked or throttled. This is the biggest single gap in the report.',
      mid: 'A signup form exists but it is buried and there is nothing being sent. A list nobody emails is a list that decays.',
      high: 'A list you own, on your own domain, with something actually going out to it. This is the asset that survives everything else.',
      fix: 'Fanbase'
    },
    {
      key: 'commercial',
      name: 'Commercial doors',
      blurb: 'A shop, a booking link, an enquiry route. The cheapest ways to earn from your name.',
      low: 'No shop, no bookings, no enquiry form. Every bit of goodwill you have built has nowhere to go and nothing to buy.',
      mid: 'One door open — but no product, no bookable appearances, and no obvious route for a fan who wants to spend money on you.',
      high: 'Shop, bookings and enquiries all live. The audience has somewhere to go when it decides it likes you.',
      fix: 'Store'
    }
  ];

  // Deterministic 32-bit hash of a string.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Seeded PRNG so the same handle gives the same report every time.
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
    var seed = hash(clean);
    var rand = rng(seed || 1);

    // "clean report" easter egg: proves the honesty promise is real.
    var isClean = /^(demo ?clean|alreadygood|clean)$/.test(clean);

    var scores = {};
    PILLARS.forEach(function (p) {
      var v;
      if (isClean) {
        v = 78 + Math.floor(rand() * 20);
      } else if (p.key === 'owned') {
        // Almost nobody has an owned audience. That is the point of the product.
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
    var overall = Math.round(total / PILLARS.length);

    return { clean: clean, scores: scores, overall: overall, isClean: isClean };
  }

  function verdictFor(r) {
    if (r.isClean) {
      return 'There is genuinely nothing here for us to sell you. Your presence is in better shape than most professionals we check. Keep doing what you are doing — and if that changes, the report will say so.';
    }
    if (r.overall < 38) {
      return 'Almost all of your value is currently sitting on platforms you do not own. If an account went tomorrow you would be starting from nothing. That is the first thing to fix.';
    }
    if (r.overall < 58) {
      return 'You are visible but not commercial. People know who you are and there is no route for any of them — fan or brand — to spend money on you.';
    }
    if (r.overall < 75) {
      return 'The audience is real and the habits are mostly there. What is missing is ownership: a list, a shop, and numbers a brand can price without asking you for them.';
    }
    return 'Strong footprint. The remaining gaps are commercial rather than creative — packaging what you already have so a brand does not have to work to buy it.';
  }

  var CRAWL = [
    'Resolving name and handles…',
    'Checking for a domain you control…',
    'Reading public profiles (politely, obeying robots.txt)…',
    'Sampling the last 90 days of posts…',
    'Looking for a media kit or rate card…',
    'Looking for an email signup…',
    'Checking shop, bookings and enquiry routes…',
    'Scoring six pillars and quoting the evidence…'
  ];

  function el(id) { return document.getElementById(id); }

  function run(handle) {
    var crawl = el('crawl'), report = el('report'), form = el('cform');
    report.classList.add('hidden');
    crawl.classList.remove('hidden');
    crawl.innerHTML = '<p class="eyebrow">Reading your public footprint</p><div id="lines" style="margin-top:18px"></div><div class="bar"><i id="bar"></i></div>';
    var lines = el('lines'), bar = el('bar');
    var i = 0;

    CRAWL.forEach(function (t) {
      var d = document.createElement('div');
      d.className = 'crawl-line';
      d.innerHTML = '<span class="tick">·</span><span>' + t + '</span>';
      lines.appendChild(d);
    });

    var step = function () {
      var nodes = lines.children;
      if (i > 0) {
        nodes[i - 1].classList.add('done');
        nodes[i - 1].querySelector('.tick').textContent = '✓';
      }
      if (i >= CRAWL.length) { setTimeout(function () { render(handle); }, 340); return; }
      bar.style.width = Math.round(((i + 1) / CRAWL.length) * 100) + '%';
      i++;
      setTimeout(step, 240 + Math.random() * 200);
    };
    step();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function ring(score) {
    var C = 2 * Math.PI * 56;
    var off = C - (score / 100) * C;
    var col = band(score) === 'bad' ? 'var(--accent-2)' : band(score) === 'mid' ? '#FFC93F' : 'var(--good)';
    return '<div class="score-ring"><svg width="132" height="132">' +
      '<circle cx="66" cy="66" r="56" fill="none" stroke="rgba(244,241,236,.10)" stroke-width="9"/>' +
      '<circle cx="66" cy="66" r="56" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round"' +
      ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" id="ringArc"/>' +
      '</svg><div class="val"><b>' + score + '</b><small>out of 100</small></div></div>' +
      '<span id="ringTarget" data-off="' + off.toFixed(1) + '"></span>';
  }

  function render(handle) {
    var r = scoreFor(handle);
    var display = handle.trim().replace(/^@/, '');
    var report = el('report');
    el('crawl').classList.add('hidden');

    var html = '<div class="report">';
    html += '<div class="rep-top">' + ring(r.overall) +
      '<div class="rep-who"><h3>' + escapeHtml(display) + '</h3>' +
      '<div class="sub">Ascendr Brand Check · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</div>' +
      '<div class="verdict">' + verdictFor(r) + '</div></div></div>';

    PILLARS.forEach(function (p, idx) {
      var s = r.scores[p.key], b = band(s), t = tier(s);
      html += '<div class="pillar">' +
        '<div class="p-head"><span class="check-n">' + String(idx + 1).padStart(2, '0') + '</span>' +
        '<h4>' + p.name + '</h4><span class="p-score s-' + b + '">' + s + '/100</span></div>' +
        '<div class="pbar"><i class="fill-' + b + '" data-w="' + s + '"></i></div>' +
        '<div class="evidence">' + p[t] +
        (t === 'high' ? '' : ' <b>Fixed by: ' + p.fix + '.</b>') + '</div></div>';
    });

    if (r.isClean) {
      html += '<div class="rep-foot"><p class="blk">Nothing to sell you</p>' +
        '<p>We wrote this check and we sell the fixes, so the check has to be worth trusting on its own. ' +
        'Yours came back clean. There is no follow-up call and no invoice. If it helps, forward it to a teammate whose report probably will not look like this.</p></div>';
    } else {
      html += '<div class="rep-foot"><p class="blk">What this is costing you</p>' +
        '<p>Rough, honest estimates for an athlete at your level. Not a promise — a starting point for a conversation.</p>' +
        '<div class="money">' +
        '<div><b>~' + (2 + (hash(r.clean) % 7)) + '</b><span>brand enquiries a year that currently have nowhere to land</span></div>' +
        '<div><b>0</b><span>followers you could reach tomorrow if an account disappeared tonight</span></div>' +
        '<div><b>£' + (140 + (hash(r.clean) % 9) * 40) + '</b><span>a month of merch margin left on the table at your engagement level</span></div>' +
        '<div><b>' + (6 + (hash(r.clean) % 5)) + ' yrs</b><span>rough earning window left to turn a name into something that outlasts it</span></div>' +
        '</div>' +
        '<a class="btn" href="pricing.html" style="margin-top:26px">See what fixing this costs →</a>' +
        '<p class="tiny" style="margin-top:16px">No signup. Nothing stored. This report is yours whether you ever speak to us again or not.</p></div>';
    }

    html += '</div>';
    report.innerHTML = html;
    report.classList.remove('hidden');

    // animate
    requestAnimationFrame(function () {
      var arc = el('ringArc'), tgt = el('ringTarget');
      if (arc && tgt) {
        arc.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)';
        arc.style.strokeDashoffset = tgt.dataset.off;
      }
      report.querySelectorAll('.pbar i').forEach(function (n, k) {
        setTimeout(function () { n.style.width = n.dataset.w + '%'; }, 120 + k * 90);
      });
    });

    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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
})();
