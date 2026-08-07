# Ascendr — concept demo

**Build your audience. Own your brand.**

A shareable concept demo for Ascendr: a complete digital brand operation for professional
athletes, sold as a flat monthly fee that never takes a percentage of what the athlete earns.

## What's here

| Page | What it shows |
|---|---|
| `index.html` | Positioning, the five modules, the "eight years / fifty years" argument |
| `check.html` | **The Brand Check — it works.** Enter any name or handle and get a scored six-pillar report |
| `pricing.html` | Three tiers (£39 / £399 / £1,999), à-la-carte modules, squad and union rates, no-lock-in terms |
| `demo/` | Three fully built fictional athlete profiles: a Championship footballer, a Premiership women's rugby flanker, a county cricketer |

## The Brand Check

Top-of-funnel diagnostic, ported from the ScaleYourClub playbook. Scores six pillars and
quotes evidence on every line:

1. Do you exist? — own domain vs. rented platform profiles
2. The media kit test — could a brand price you in two minutes?
3. Consistency — does the rhythm survive a bad run of form?
4. Engagement quality — conversation vs. hollow reach
5. Owned audience — an email list, or nothing?
6. Commercial doors — shop, bookings, enquiries

Scores are generated deterministically from the input string, so the same handle always
returns the same report. In production these come from a real crawl of public pages.

Type **`clean`** to see the honest all-clear report — the one that says there's nothing to
sell you. That mechanic is the whole trust proposition.

## Caveats, stated plainly

- All three athletes are fictional. Any resemblance to a real player is because the problem is this common.
- Pricing is indicative and deliberately open to argument.
- The Brand Check generates illustrative scores; it does not crawl live profiles.
- Product images are placeholders.
- Nothing is stored. The newsletter form is a demo and posts nowhere.

## Running locally

Static files, no build step.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Static site — deploys to Vercel with no configuration. `vercel.json` just enables clean URLs.
