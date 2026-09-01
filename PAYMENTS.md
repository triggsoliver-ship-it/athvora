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

If a link charges anything other than the figure in the last column, it is
wrong — the customer is being shown one price and billed another. Check this
table against the Stripe dashboard before switching a link on, and again
whenever a price on the site changes.

Athvora (Keelson Holdings Ltd, company 17359226) **is not registered for VAT**.
Every Payment Link must therefore be configured with **no tax collected** and
**no VAT added**. The pricing page says "every price on this page is the whole
price and there is no VAT to add", and Stripe has to agree with it.

All amounts are **GBP**. All monthly figures are **recurring monthly**. All
setup figures are **one-off**.

| Key | Where it appears | Product | Exact price the link must charge |
|---|---|---|---|
| `starter` | `/pricing` — Starter tier card | Athvora Starter | **£99/month recurring. No setup fee.** |
| `pro` | `/pricing` — Pro tier card **and** the "All five — Pro" module row (both use this one key) | Athvora Pro | **£999 one-off setup + £399/month recurring.** |
| `founding` | `/founding` — "Take your place" | Founding Athlete (Pro at half price) | **£199/month recurring. No setup fee.** Rate held 12 months, then moves to standard Pro — see terms of supply §5. |
| `identity` | `/pricing` — module 01 | Identity | **£499 one-off setup + £39/month recurring.** |
| `content` | `/pricing` — module 02 | Content Engine | **£299 one-off setup + £199/month recurring.** |
| `store` | `/pricing` — module 03 | Store | **£249 one-off setup + £29/month recurring.** |
| `fanbase` | `/pricing` — module 04 | Fanbase | **£49/month recurring. NO setup charge — see the warning below.** |
| `commercial` | `/pricing` — module 05 | Commercial | **£299 one-off setup + £149/month recurring.** |

### Fanbase — read this before creating the link

The setup column for Fanbase on the pricing page is an em-dash (`—`), not a
number. Every other module shows a figure. Nobody has decided whether that
em-dash means "no setup fee" or "not published yet".

The `fanbase` link is specified above as **£49/month with no setup charge**,
because that is the only reading a customer can take from the page as it
stands. If a Fanbase setup fee is in fact meant to exist, **change the pricing
page first**, then this file, then the link — in that order. Do not put a
charge on the link that the page does not show.

## Deliberately not wired

These have no key, no button and no checkout. They keep their existing
"talk to us" / mailto behaviour, because none of them has a single confirmed
price a Payment Link could charge. Adding one requires a human decision first.

| Item | Where | Why not |
|---|---|---|
| Athvora Elite | `/pricing`, under the tiers | "From £1,999/mo" — a floor, not a price. Quoted individually. |
| Squad licence | `/pricing`, Squads section | £49/head (Starter) or £199/head (Pro), minimum twenty. Per-seat, negotiated, and not something a single link can express. |
| Union member benefit | `/pricing`, Squads section | "From £15" per head — a floor, and the union pays, not the athlete. |
| Academy & released players | `/pricing`, Squads section | Free for 12 months. Nothing to charge. |
| Annual, up front | `/pricing`, Squads section | "Two months free on any tier" — a modifier on the tiers above, not a product. |
| Agent white label | `/partners` | Priced per agency. |
| Fanbase **setup fee** | `/pricing`, module 04 | The em-dash above. |

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
5. The Payment Link URL starts `https://buy.stripe.com/`.
6. Paste it into `ATHVORA_CHECKOUT` in `assets/checkout.js`, deploy, and click
   the button on the live page. Confirm Stripe shows the same number the page
   does.
