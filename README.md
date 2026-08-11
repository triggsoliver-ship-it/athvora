# ATHVORA — concept demo

**Your career builds attention. Don't give it away.**

The commercial operating system for an athlete's name. Athvora builds an athlete's audience,
brand and business while they play — one flat fee, 15 minutes of their week, and 0% of
anything they earn.

Live at **[athvora.co.uk](https://athvora.co.uk)**. (Spelling matters: *Athora* without the V
is an unrelated insurance group.)

## What's here

| Page | What it shows |
|---|---|
| `index.html` | The funnel: outcome-led hero, rented-vs-owned, before/after, You Play We Build, 0%, Score trajectory, eight-years/fifty-years |
| `check.html` | **The Athvora Score** — six scored pillars, indicative value ranges, and an ownership checklist |
| `pricing.html` | One product: Athvora Pro £399/mo (Starter £99 for emerging athletes). À-la-carte breakdown kept for transparency |
| `demo/` | Three fully built fictional athlete profiles: Championship footballer, Premiership women's rugby flanker, county cricketer |

## Honesty notes — kept deliberately visible on the site

- All three athletes are fictional and labelled as such on every page.
- The Score is generated deterministically from the input string (same input, same report).
  The £ ranges are derived from the Score band and labelled as demo figures, not valuations.
- Pricing is indicative. No testimonials appear anywhere because none exist yet.
- Nothing is stored. The forms post nowhere.

Type **`clean`** into the Score to see the honest all-clear — the report that says there's
nothing to sell you. That mechanic is the whole trust proposition.

## Running locally

Static files, no build step.

```bash
python3 -m http.server 8000
```

## Deploying

Static site on Vercel (project: ascendr-demo — repo predates the rebrand).
`vercel.json` disables clean URLs. Domain: athvora.co.uk via IONOS DNS.
