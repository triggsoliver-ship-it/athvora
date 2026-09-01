# Payments

Every Stripe Payment Link on athvora.co.uk is configured in one place:
the `ATHVORA_CHECKOUT` object at the top of **`assets/checkout.js`**.

Paste the Payment Link URL against the key. Nothing else needs touching.

```js
var ATHVORA_CHECKOUT = {
  starter: 'https://buy.stripe.com/...',
  ...
};
```

**Never commit a Stripe API key**, secret or publishable. A Payment Link URL is
public by design and is the only Stripe value that belongs in this repo.

## What each key must charge

If a link charges anything other than the figures in the last two columns, it
is wrong — the customer is being shown one price and billed another. Check this
table against the Stripe dashboard before switching a link on, and again
whenever a price on the site changes.

Athvora (Keelson Holdings Ltd, company 17359226) **is not registered for VAT**.
Every Payment Link must therefore be configured with **no tax collected** and
**no VAT added**. The pricing page says "every price on this page is the whole
price and there is no VAT to add", and Stripe has to agree with it.

All amounts are **GBP**. All monthly figures are **recurring monthly**. All
setup figures are **one-off**. Where a product has a setup fee the link carries
**two line items** — the one-off setup and the first month — so the total
Stripe asks for on day one is larger than the monthly price. That day-one total
is the last column, and it is the number the page has to make obvious.

| Key | Where it appears | Product | Exact price the link must charge | Total due on the first payment |
|---|---|---|---|---|
| `starter` | `/pricing` — Starter tier card | Athvora Starter | **£99/month recurring. No setup fee.** | **£99** — one line item |
| `pro` | `/pricing` — Pro tier card **and** the "All five — Pro" module row (both use this one key) | Athvora Pro | **£999 one-off setup + £399/month recurring.** | **£1,398** — two line items |
| `elite` | `/pricing` — under the two tier cards | Athvora Elite | **£1,999/month recurring. No setup fee is published.** | **£1,999** — one line item |
| `founding` | `/founding` — "Take your place" | Founding Athlete (Pro at half price) | **£199/month recurring. No setup fee.** Rate held 12 months, then moves to standard Pro — see terms of supply §5. | **£199** — one line item |
| `identity` | `/pricing` — module 01 | Identity | **£499 one-off setup + £39/month recurring.** | **£538** — two line items |
| `content` | `/pricing` — module 02 | Content Engine | **£299 one-off setup + £199/month recurring.** | **£498** — two line items |
| `store` | `/pricing` — module 03 | Store | **£249 one-off setup + £29/month recurring.** | **£278** — two line items |
| `fanbase` | `/pricing` — module 04 | Fanbase | **£49/month recurring. NO setup charge — see the warning below.** | **£49** — one line item |
| `commercial` | `/pricing` — module 05 | Commercial | **£299 one-off setup + £149/month recurring.** | **£448** — two line items |

### Link status — 1 September 2026

All nine keys are live. Nothing in `ATHVORA_CHECKOUT` is an empty string any
more.

| Key | Status | Configured value |
|---|---|---|
| `starter` | **LIVE** | `https://buy.stripe.com/9B64gyh0F8NF2v98UIeIw0d` |
| `pro` | **LIVE** | `https://buy.stripe.com/6oU14m5hX9RJb1FdaYeIw0e` |
| `elite` | **LIVE** | `https://buy.stripe.com/3cI6oG7q5bZRd9Nfj6eIw0t` |
| `founding` | **LIVE** | `https://buy.stripe.com/bJe14m4dT6FxglZc6UeIw0f` |
| `identity` | **LIVE** | `https://buy.stripe.com/5kQ28qh0Fd3V8Txfj6eIw0p` |
| `content` | **LIVE** | `https://buy.stripe.com/28E9AS8u92phc5J1sgeIw0q` |
| `store` | **LIVE** | `https://buy.stripe.com/bJe6oG7q57JBd9N2wkeIw0r` |
| `commercial` | **LIVE** | `https://buy.stripe.com/fZu9AS39P7JBd9Nc6UeIw0s` |
| `fanbase` | **LIVE** | `https://buy.stripe.com/14A14m4dTbZR0n1c6UeIw0g` |

The four module links and the Elite link were added on 1 September 2026. The
four that were already live — `starter`, `pro`, `founding`, `fanbase` — were
not touched in that change and are byte-for-byte what they were.

### Saying the first-payment total out loud

Four of the nine links charge a setup fee on the first payment, and a fifth
(`pro`) charges the largest one on the site. A customer who reads "£39/mo" on a
card and then lands on a £538 Stripe checkout abandons, or pays and disputes.
So `/pricing` now states the day-one total in two places:

- **On each module price line**, next to the button: `£499 · then £39/mo ·
  £538 today`, and the same for Content Engine (£498), Store (£278) and
  Commercial (£448).
- **In a sentence under the module grid**: setup is charged together with the
  first month, as two lines on one checkout — £538 Identity, £498 Content
  Engine, £278 Store, £448 Commercial, £1,398 for all five as Pro; Fanbase has
  no setup fee so it is £49 either way; and nothing is added for VAT.

Both are plain page copy rather than a `data-buy-label`, so they are visible
whether or not `assets/checkout.js` runs, and they do not depend on a key being
configured. **If a price or a setup fee changes, change these two places too.**

### Athvora Elite — read this before relying on the link

Elite carried a "from" price of £1,999/mo, a plain-text "talk to us" and no
real CTA until 1 September 2026, when the floor was made the price. `/pricing`
and the terms of supply now both say a flat **£1,999 per month**, and the page
has a buy CTA on the same upgrade-only pattern as every other tier.

**No setup fee has ever been published for Elite.** The page therefore promises
a first payment of £1,999, and the `elite` link must be a single monthly line
item to match. If Elite is in fact meant to carry a setup fee, change the
pricing page and this file **first**, then the link — the same order the
Fanbase note below insists on.

### Fanbase — read this before creating the link

The setup column for Fanbase on the pricing page is an em-dash (`—`), not a
number. Every other module shows a figure. Nobody has decided whether that
em-dash means "no setup fee" or "not published yet".

The `fanbase` link is specified above as **£49/month with no setup charge**,
because that is the only reading a customer can take from the page as it
stands. If a Fanbase setup fee is in fact meant to exist, **change the pricing
page first**, then this file, then the link — in that order. Do not put a
charge on the link that the page does not show.

> **Still to verify in Stripe.** Checklist item 1 — "price in Stripe matches
> the row in the table above, to the penny" — is the one thing that cannot be
> confirmed from this repository. All nine URLs were supplied as
> already-created Payment Links; what each one actually charges, its currency,
> its recurring interval, how many line items it has and whether tax collection
> is off are only visible in the Stripe dashboard. Open each of the nine and
> check it against the table above. In particular: `pro`, `identity`,
> `content`, `store` and `commercial` must each show **two** line items and a
> day-one total matching the last column, while `starter`, `elite`, `founding`
> and `fanbase` must each show **one**.

## Deliberately not wired

These have no key, no button and no checkout. They keep their existing
"talk to us" / mailto behaviour, because none of them has a single confirmed
price a Payment Link could charge. Adding one requires a human decision first.

| Item | Where | Why not |
|---|---|---|
| Squad licence | `/pricing`, Squads section | £49/head (Starter) or £199/head (Pro), minimum twenty. Per-seat, negotiated, and not something a single link can express. |
| Union member benefit | `/pricing`, Squads section, and `/partners` | "From £15" per head — a floor, and the union pays, not the athlete. |
| Academy & released players | `/pricing`, Squads section | Free for 12 months. Nothing to charge. |
| Annual, up front | `/pricing`, Squads section | "Two months free on any tier" — a modifier on the tiers above, not a product. |
| Agent white label | `/partners` | Priced per agency. |
| Fanbase **setup fee** | `/pricing`, module 04 | The em-dash above. |

Athvora Elite used to be the first row of this table. It is now wired — see the
Elite note above.

## How the fallback works

`assets/checkout.js` never creates a button. The HTML already contains a
working `mailto:` link for every CTA; the script only rewrites the `href` and
the label **when a configured link exists**, and only when that value matches
`https://buy.stripe.com/` or `https://checkout.stripe.com/`.

So:

- **Key left as `''`** → the CTA stays the contact link it already was.
- **Key set to something that isn't a Stripe URL** (a typo, a Price ID, a
  relative path, an `http://` link) → ignored, same fallback. It will not ship
  as a broken checkout.
- **`assets/checkout.js` fails to load at all** → every CTA on the site is
  still a working `mailto:`.
- Sentences that are only true once a link is live (the Stripe/card-details
  note on `/pricing`, the "take your place" note on `/founding`) carry
  `data-buy-live` and ship with the site's existing `.hidden` class on them
  until the script takes it off.

There is therefore no state in which a half-configured deploy shows a dead
checkout button. A half-configured deploy shows an email address.

Values checked against the regex, all of which fall through to the contact
link: an empty string, `REPLACE_ME`, a Price ID, `http://buy.stripe.com/...`,
`https://buy.stripe.com` with no trailing slash, `//buy.stripe.com/...`, a
relative path, `undefined`, `null`, a number, `https://BUY.stripe.com/...`, a
value with a leading space, `https://buy.stripe.com@evil.example/...`, and the
lookalike hosts `https://buy.stripe.com.evil.example/...` and
`https://evil.example/https://buy.stripe.com/x`.

Two things the prefix check cannot catch, both by design and neither a reason
to loosen or complicate it:

- `https://buy.stripe.com/` — a bare origin **with** a trailing slash — passes.
  It would send a customer to Stripe's own site rather than a checkout. Paste
  whole URLs.
- A placeholder shaped like a real link, e.g.
  `https://buy.stripe.com/REPLACE_ME`, passes. Only checklist item 7 — click
  the button on the live page — catches that one.

The one CTA that ships hidden rather than falling back is "Take your place"
on `/founding`: the "Apply for a place" button beside it already carries the
contact behaviour, so a second mailto would be noise. Its `href` is a mailto
anyway, so even a hand-edit that unhid it could not produce a dead link.

## Founding Athletes — why there is still an application step

Founding is a genuine limited offer of twenty places with a contractual
condition attached (permission to measure and publish results for 90 days).
There is no inventory counter on a static site and no approval workflow, so
the page keeps **Apply for a place** as the primary action and offers
**Take your place** as the second step for athletes who have already been
offered one.

The page states, and the terms of supply repeat, that if someone pays for a
place that has already gone they are refunded in full immediately. That is the
honest way to sell twenty of something from a page that cannot count.

## Headers

`vercel.json` has to let Stripe through:

- `Permissions-Policy` previously contained `payment=()`, which switched the
  Payment Request API off entirely. It is now
  `payment=(self "https://buy.stripe.com" "https://checkout.stripe.com")`,
  so Apple Pay and Google Pay work in Stripe's flow and nowhere else.
- `Content-Security-Policy` now allows `https://buy.stripe.com` and
  `https://checkout.stripe.com` in `form-action` and `connect-src`.

No Stripe script, iframe or font is loaded into these pages, so `script-src`,
`frame-src` and `img-src` are deliberately left alone. Checkout is a plain
navigation to Stripe's own domain.

## Checklist before switching a link on

1. Price in Stripe matches the row in the table above, to the penny.
2. Currency is GBP.
3. Tax collection is **off** — Athvora is not VAT registered.
4. Recurring interval is monthly; any setup fee is a separate one-off line.
5. The number of line items, and the day-one total Stripe shows, match the last
   column of the table — and match what `/pricing` says the first payment is.
6. The Payment Link URL starts `https://buy.stripe.com/`.
7. Paste it into `ATHVORA_CHECKOUT` in `assets/checkout.js`, deploy, and click
   the button on the live page. Confirm Stripe shows the same number the page
   does.
