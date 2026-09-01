/* Athvora — checkout links.

   Every Stripe Payment Link on this site lives in the object below and nowhere
   else, so a URL can be swapped in one place and every button that sells that
   thing changes across the site. The price each link MUST charge is written
   down in PAYMENTS.md; if a link charges a different figure from the one
   printed on the page, that is a bug, and PAYMENTS.md is how you catch it.

   Four rules this file follows, and the reason for each:

   1. Nothing here is a secret. A Stripe Payment Link is a public URL. No Stripe
      API key — secret or publishable — ever belongs in this repository.

   2. The HTML ships with the contact fallback already in the href. This file
      only ever UPGRADES a link that has a real, configured Stripe URL behind
      it. A half-configured deploy therefore degrades to "email us", never to a
      button pointing nowhere. If this file fails to load at all, every CTA on
      the site is still a working mailto.

   3. A value is only accepted if it is an https://buy.stripe.com/ or
      https://checkout.stripe.com/ URL. A placeholder, a typo, a relative path
      or an http:// link is ignored rather than shipped as a broken checkout.

   4. Buttons and sentences that only make sense once a link exists ship with
      the site's existing .hidden class on them and are revealed here. Same
      principle, other way up: the page can never promise a checkout it hasn't
      got. */

var ATHVORA_CHECKOUT = {

  /* Athvora Starter — £99/month, no setup fee. /pricing tier card. */
  starter:    'https://buy.stripe.com/9B64gyh0F8NF2v98UIeIw0d',

  /* Athvora Pro — £399/month plus a one-off £999 setup fee. /pricing, on both
     the Pro tier card and the "All five — Pro" module row. */
  pro:        'https://buy.stripe.com/6oU14m5hX9RJb1FdaYeIw0e',

  /* Founding Athlete — Athvora Pro at £199/month, no setup fee, rate held for
     12 months. /founding only. Twenty places, allocated by hand. */
  founding:   'https://buy.stripe.com/bJe14m4dT6FxglZc6UeIw0f',

  /* Athvora Elite — £1,999/month. /pricing, under the two tier cards. Carried
     a "from" price and no real CTA until 1 September 2026, when the floor
     became the price and the page was changed in the same commit. No setup
     fee is published for Elite, so this link must be a single monthly line
     item; if a setup fee is ever added, change the page and PAYMENTS.md
     first. */
  elite:      'https://buy.stripe.com/3cI6oG7q5bZRd9Nfj6eIw0t',

  /* Identity module — two line items: £499 one-off setup and £39/month, so
     the first payment is £538. */
  identity:   'https://buy.stripe.com/5kQ28qh0Fd3V8Txfj6eIw0p',

  /* Content Engine module — two line items: £299 one-off setup and £199/month,
     so the first payment is £498. */
  content:    'https://buy.stripe.com/28E9AS8u92phc5J1sgeIw0q',

  /* Store module — two line items: £249 one-off setup and £29/month, so the
     first payment is £278. */
  store:      'https://buy.stripe.com/bJe6oG7q57JBd9N2wkeIw0r',

  /* Commercial module — two line items: £299 one-off setup and £149/month, so
     the first payment is £448. */
  commercial: 'https://buy.stripe.com/fZu9AS39P7JBd9Nc6UeIw0s',

  /* Fanbase module — £49/month, and no setup charge. The setup column for
     Fanbase on the pricing page is an em-dash, which has never been resolved
     into a number. Do not put a setup fee on this link without fixing the page
     first — see PAYMENTS.md. */
  fanbase:    'https://buy.stripe.com/14A14m4dTbZR0n1c6UeIw0g'
};

/* Deliberately absent, because none of them has a single confirmed price: the
   Squad licence (£49 or £199 per head, minimum twenty), the union member
   benefit ("from £15"), and any Fanbase setup fee. Those stay "talk to us"
   until a human decides the number. Adding a key here without adding the row
   to PAYMENTS.md defeats the point of both. */

(function () {
  'use strict';

  var STRIPE = /^https:\/\/(buy|checkout)\.stripe\.com\//;

  function link(key) {
    var v = ATHVORA_CHECKOUT && ATHVORA_CHECKOUT[key];
    return (typeof v === 'string' && STRIPE.test(v)) ? v : null;
  }

  /* true if ANY of a space-separated list of keys is configured */
  function anyLive(keys) {
    return String(keys || '').split(/\s+/).some(function (k) {
      return k && link(k);
    });
  }

  function relabel(a, text) {
    if (!text) return;
    var span = a.querySelector('span:not(.arw)');
    if (span) span.textContent = text;
  }

  function each(sel, fn) {
    [].slice.call(document.querySelectorAll(sel)).forEach(fn);
  }

  function init() {
    /* Upgrade any CTA that has a configured link behind it. Anything without
       one is left exactly as the markup shipped it — a mailto, or hidden. */
    each('[data-buy]', function (a) {
      var href = link(a.getAttribute('data-buy'));
      if (!href) return;
      a.setAttribute('href', href);
      a.setAttribute('rel', 'noopener');
      a.setAttribute('data-buy-state', 'live');
      a.classList.remove('hidden');
      relabel(a, a.getAttribute('data-buy-label'));
    });

    /* Copy that is only true once a link is live... */
    each('[data-buy-live]', function (el) {
      if (anyLive(el.getAttribute('data-buy-live'))) el.classList.remove('hidden');
    });

    /* ...and copy that is only true until it is. */
    each('[data-buy-off]', function (el) {
      if (anyLive(el.getAttribute('data-buy-off'))) el.classList.add('hidden');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
