# easeason — Product & Build Specification

> **Purpose:** Build easeason as a small, public, open-source market seasonality exploration tool.
>
> **Primary goal:** Ship a polished, usable v1 in one focused night. Prefer simplicity and working UX over feature breadth.

---

## 1. Product Definition

### Product

**easeason**

### Positioning

> **Explore historical market seasonality.**

easeason is a public research/visualization tool for exploring how assets have historically moved throughout the year, including U.S. presidential election-cycle patterns.

It is **not** a prediction engine, trading system, portfolio manager, or AI product.

### Primary users

1. Retail investors who want to visually explore seasonality.
2. The creator/researcher using easeason as a personal research instrument.

### Product principle

The chart is the product.

The user should be able to:

1. Find an asset.
2. See its seasonal history.
3. Toggle different seasonal profiles.
4. Compare the profiles visually.
5. Inspect exact points with a tooltip.
6. Export the chart as PNG.
7. Read optional static research articles.

No account is required.

No authentication.

No database is required for v1.

The application can be fully public.

---

# 2. Scope

## v1 MUST HAVE

### Asset exploration

- Curated asset list from `server/utils/stocks-data.ts`.
- Categories:
  - Crypto
  - US Stocks
  - IDX Stocks
  - Indices
- Searchable Command/Combobox UI.
- Asset route should be shareable:
  - `/explore/NVDA`
  - `/explore/BTC-USD`
  - etc.

### Seasonal profiles

Support:

- All Years
- Election
- Pre-Election
- Mid-Term
- Post-Election
- Trump Presidency Years
- Current Year

### Chart

- Interactive line chart.
- Toggle profiles on/off from legend.
- Hover tooltip.
- Responsive.
- Percentage view.
- Growth Factor view.
- Clean zero/reference line.
- Clear current-year distinction.
- Export chart as PNG.
- Chart should remain readable when several profiles are enabled.

### Asset information

Show:

- Symbol
- Name
- Current/latest price if available
- Historical data range
- Current year
- Number of historical years used where useful

### Static research

Optional `/research` page and article routes.

Articles are manually authored Markdown files and committed to the repository.

There is:

- No CMS.
- No editor.
- No database.
- No LLM integration.
- No API connection to an AI model.

Example:

```text
content/
  research/
    nvda-election-cycle.md
    magnificent-seven-seasonality.md
    bitcoin-seasonality.md
```

The creator can use any external LLM manually to research/write an article, then save the final content as Markdown and push it to the repository.

easeason only renders the static article.

---

# 3. Explicitly Out of Scope

Do NOT build these in v1:

- Authentication
- User accounts
- User portfolios
- Database
- AI/LLM integration
- AI-generated articles
- AI-generated conclusions
- Price predictions
- Year-end target prices
- Financial recommendations
- Backtesting
- Risk metrics
- Trading signals
- Arbitrary ticker input outside curated assets
- Payments
- Notifications
- Social features
- Comments
- Admin dashboard
- CMS
- Multi-user saved charts
- Complex analytics dashboard
- Overengineered profile/plugin architecture

If a feature is not necessary for the core seasonal chart experience, defer it.

---

# 4. Product UX

## Homepage

The homepage should immediately communicate what easeason does.

Suggested structure:

```text
easeason

Explore historical market seasonality.

See how stocks, crypto, and indices have
historically moved throughout the year.

[ Search stocks, crypto, indices... ]

Popular
NVDA   BTC-USD   SPY   QQQ   ETH-USD
```

Keep the page spacious.

Do not create a traditional finance dashboard.

Avoid excessive cards, gradients, badges, shadows, and decorative UI.

---

# 5. Explore Page

Route:

```text
/explore/[symbol]
```

Example:

```text
/explore/NVDA
```

Suggested layout:

```text
--------------------------------------------------

NVDA
NVIDIA Corporation

$181.42

--------------------------------------------------

[ Chart ] [ Statistics ] [ Animate ]     [.PNG] [Context]

  [ Percentage ] [ Growth Factor ]

[legend / profile toggles]

                 chart

--------------------------------------------------

Statistics (when Statistics tab active):

| Profile | Avg % | Median % | Std Dev | Win Rate | Best | Worst | Year-end |
|---|---|---|---|---|---|---|---|
| All Years | 12.4% | 14.1% | 8.2 | 62% | 45.3% | -18.7% | 12.4% |

--------------------------------------------------

Animate (when Animate tab active):

Chart line progressively reveals Jan 1 → Dec 31.
Click again to stop and reset.

--------------------------------------------------

Data & Methodology

Historical statistics based on available market data.
Not financial advice.

--------------------------------------------------
```

The chart should occupy most of the visual attention.

---

# 6. Seasonal Profile Model

The canonical profiles are:

```ts
type SeasonalProfileId =
  | 'all-years'
  | 'election'
  | 'pre-election'
  | 'mid-term'
  | 'post-election'
  | 'trump-years'
  | 'current-year'
```

### U.S. election cycle

Use the existing mathematical mapping:

```text
year % 4

0 = Election
1 = Post-Election
2 = Mid-Term
3 = Pre-Election
```

Do not change this behavior without explicitly validating it against the original research implementation.

---

# 7. Trump Presidency Years

Trump Presidency Years are a custom historical comparison profile.

For the current research definition:

```text
2016
2017
2018
2019
2024
2025
```

2026 is NOT included because it is the current year and should remain represented by `Current Year`.

Keep this definition in one obvious server-side configuration/function rather than scattering year checks throughout the application.

Example concept:

```ts
const TRUMP_YEARS = [2016, 2017, 2018, 2019, 2024, 2025]
```

Do not build a generic political-period framework for v1.

The implementation should simply make it easy to add another explicitly defined period later.

---

# 8. Seasonal Math

The seasonal math should remain faithful to the existing research implementation.

## Fetch

Fetch daily historical OHLCV data from Yahoo Finance server-side.

Target:

```text
1971-01-01 → now
```

The available history depends on the asset.

Do not fabricate missing history.

## Cleaning

For historical profiles:

- Drop years with fewer than 200 trading days where the existing implementation requires this.
- Allow newer/short-history assets to use whatever valid historical years remain.
- Handle missing/partial data gracefully.

## Daily return

For each year:

```text
return[i] = adjclose[i] / adjclose[i - 1] - 1
```

First row of each year:

```text
0
```

## Profile

For a selected group of years:

1. Align observations by day-of-year/trading-calendar position according to the existing implementation.
2. Calculate mean daily return.
3. Compound:

```text
factor = cumprod(1 + meanDailyReturn)
```

4. Percentage:

```text
pct = (factor - 1) * 100
```

## Current year

Current year is the direct cumulative return series for that year's daily returns.

Do not average the current year with historical years.

---

# 9. API Contract

Primary endpoint:

```http
GET /api/seasonal?symbol=NVDA
```

Response should be data-only.

Do NOT return UI state such as `visible`.

Do NOT return prediction fields.

Suggested shape:

```ts
interface SeasonalResponse {
  meta: {
    symbol: string
    name: string
    currentPrice?: number
    firstYear?: number
    lastYear?: number
    currentYear: number
  }

  profiles: SeasonalProfile[]

  currentYear?: {
    year: number
    points: SeasonalPoint[]
  }
}

interface SeasonalProfile {
  id: SeasonalProfileId
  label: string
  years: number[]
  points: SeasonalPoint[]
}

interface SeasonalPoint {
  day: number
  pct: number
  factor: number
}
```

Frontend controls visibility.

Server owns data computation.

---

# 10. Server Architecture

Keep the backend small.

Recommended structure:

```text
server/
├── api/
│   ├── seasonal.get.ts
│   └── symbols.get.ts
│
├── routes/
│   └── markdown/
│       └── [symbol].ts
│
└── utils/
    ├── math.ts
    ├── seasonal.ts
    ├── stocks.ts
    └── stocks-data.ts
```

Do not create many abstractions.

`seasonal.ts` can contain the pure mathematical functions.

Potential functions:

```ts
fetchHistoricalData()
calculateDailyReturns()
getElectionCycle()
buildAllYearsProfile()
buildCycleProfile()
buildTrumpYearsProfile()
buildCurrentYearProfile()
```

If the file becomes genuinely difficult to maintain, refactor later.

Do not prematurely create factories, registries, strategy classes, or generic engines.

---

# 11. Caching

Historical calculations are expensive enough that repeated requests should not always hit Yahoo Finance.

Implement simple server-side caching.

Conceptually:

```text
request
  ↓
cache hit?
  ├── yes → return cached result
  └── no
       ↓
    Yahoo Finance
       ↓
    calculate
       ↓
      cache
       ↓
     return
```

A per-symbol cache is enough for v1.

The cache can have a reasonable TTL because historical seasonality does not need second-by-second freshness.

Do not introduce Redis or an external cache service for v1.

---

# 12. Frontend Architecture

Recommended:

```text
app/
├── pages/
│   ├── index.vue
│   └── explore/
│       ├── [symbol]/
│       │   ├── index.vue
│       │   └── context.vue
│       └── research/
│           ├── index.vue
│           └── [slug].vue
│
├── components/
│   ├── AppHeader.vue
│   ├── ArticleThumbnail.vue
│   └── SeasonalChart.vue
│
└── utils/
    └── brand.ts
```

Use components where they improve readability.

Do not create a component for every `<div>`.

---

# 13. UI System

Use:

- Nuxt
- Vue
- TypeScript
- shadcn-vue
- Tailwind
- existing shadcn theming
- system/light/dark theme support if already easy to enable

Visual direction:

> Modern startup / minimalist / black & white / typography-first.

Use shadcn primitives rather than inventing a separate design system.

Preferred components:

- Button
- Card
- Command
- Input
- Badge
- Separator
- Skeleton
- DropdownMenu
- Tooltip

Do not add unnecessary UI libraries.

---

# 14. Visual Rules

The UI should feel closer to a modern developer/startup product than a trading terminal.

Prefer:

- White/black/neutral palette
- Strong typography
- Large whitespace
- Thin borders
- Subtle separators
- Minimal shadows
- Small radius where appropriate
- Compact controls
- Clear hierarchy

Avoid:

- Neon finance colors
- Green/red everywhere
- Giant dashboard cards
- Excessive gradients
- Glassmorphism
- Decorative illustrations
- Excessive animation
- Dense terminal-like layouts

Color can still be used minimally to distinguish chart series.

The UI itself should remain monochrome/minimal.

---

# 15. Chart UX

The chart is the most important component.

## Default visible profiles

Recommended default:

```text
All Years
Current Year
```

Other profiles can be enabled from the legend.

Reason:

Showing all seven profiles immediately can create visual noise.

## Legend

Legend items are interactive.

Example:

```text
● All Years
● Current Year
○ Election
○ Pre-Election
○ Mid-Term
○ Post-Election
○ Trump Presidency Years
```

Clicking a legend item toggles the corresponding series.

Visibility is local frontend state.

## Tooltip

Tooltip should show all visible series at the hovered point.

Example:

```text
Sep 18

All Years       +12.8%
Election        +14.1%
Mid-Term         +8.4%
Trump Presidency Years     +16.2%
2026            +19.7%
```

Use clear formatting.

## Reference line

Clearly show:

```text
0%
```

This represents the starting point.

## Scale toggle

The Chart view provides a sub-toggle:

```text
Percentage
Growth Factor
```

User-facing terminology should be simple.

Avoid exposing implementation terminology such as `cumprod`.

## Statistics tab

A table showing per-profile statistics:

- Average % return
- Median % return
- Standard deviation
- Win rate (% of days with positive return)
- Best (max % return)
- Worst (min % return)
- Year-end (final cumulative % return)

Computed client-side from existing profile `points[]`.

## Animate tab

A progressive chart reveal from Jan 1 to Dec 31.

- Click Animate to start — the chart line progressively appears.
- Click again to stop and reset.
- Uses ECharts `dataZoom` slider approach (window slides left to right).
- Returns to Chart view automatically when animation completes.

---

# 16. Chart Export

Implement:

> **Download PNG**

The exported chart should be clean enough to use in research articles.

Ideally include:

```text
easeason

NVDA — Historical Seasonality

[chart]

Source: Yahoo Finance
Historical statistics, not financial advice.
```

The export should not be a raw browser screenshot.

If a proper chart export is difficult with the selected chart library, use a practical implementation that still produces a readable PNG.

Do not block the v1 launch over pixel-perfect export.

---

# 17. Research Articles

Research is static content.

No LLM integration.

No dynamic AI analysis.

The creator manually performs analysis outside the application and writes the final article into Markdown.

Example:

```text
content/
└── research/
    ├── nvda-seasonality.md
    ├── magnificent-seven.md
    └── bitcoin-seasonality.md
```

Each article can contain:

```yaml
---
title: "NVDA Seasonality Through the Election Cycle"
description: "..."
publishedOn: 2026-08-31
tags:
  - NVDA
  - election-cycle
---
```

Then Markdown body.

Articles can link users back to the relevant explorer page:

```text
/explore/NVDA
```

The article system should remain static and simple.

---

# 18. Research Page UX

Keep it editorial.

Example:

```text
Research

Independent notes on market seasonality.

--------------------------------------------

NVDA Seasonality Through the Election Cycle
Aug 31, 2026

How NVDA behaved across election-cycle
profiles and the current year.

Read article →

--------------------------------------------

Magnificent 7 Seasonality
Aug XX, 2026

...
```

No CMS.

No comments.

No author management.

No database.

---

# 19. Error States

The app should gracefully handle:

### Unknown symbol

```text
Asset not found

Choose an asset from the supported list.
```

### Yahoo data unavailable

```text
Unable to load market data.

Yahoo Finance may be temporarily unavailable.
Please try again later.
```

### Insufficient history

Do not fail simply because an asset does not have data back to 1971.

Show:

```text
Historical data available from 2022.
```

and calculate profiles from the available valid years.

### Loading

Use shadcn Skeleton.

Avoid full-page spinner if possible.

---

# 20. Disclaimer

Use a small, non-intrusive disclaimer:

> Historical statistics based on available market data. Not financial advice.

Do not repeatedly warn users throughout the interface.

The product is a visualization/research tool, not a recommendation engine.

---

# 21. Performance

Priorities:

1. Fast initial UI.
2. Avoid duplicate Yahoo requests.
3. Cache seasonal calculations.
4. Lazy-load expensive chart code if useful.
5. Keep client bundle reasonable.

Do not optimize prematurely.

A correct and simple implementation is more important than micro-optimizations.

---

# 22. SEO / Sharing

Each explore page should have useful metadata.

For example:

```text
NVDA Seasonality | easeason
```

Description:

```text
Explore NVIDIA's historical seasonal patterns,
including U.S. election-cycle profiles.
```

Shareable URL:

```text
/explore/NVDA
```

This is important because research articles can link directly to charts.

---

# 23. Future Features — DO NOT BUILD NOW

Keep these ideas documented but out of v1.

### Asset comparison

```text
NVDA vs MSFT vs AAPL
```

### Research presets

```text
Magnificent 7
Crypto
Mega Cap Tech
IDX Banks
```

### Additional historical periods

Potential examples:

```text
Obama Years
Biden Years
Fed Hiking Periods
Fed Cutting Periods
Bull Markets
Bear Markets
```

Only add these after the profile model proves useful.

### Advanced charting

Potential future features:

- ~~Date-range selection~~ — partially covered by Animate (progressive reveal).
- Trading-day alignment
- ~~Median seasonality~~ — partially covered by Statistics tab.
- Percentile bands
- Min/max envelopes
- ~~Individual historical years~~ — already exists as profile overlays.
- Download CSV
- SVG export

### Research enhancements

Potential future features:

- Tags
- Related assets
- Article → chart deep links
- Embedded interactive charts
- Research index/search

None of these are required for the first public release.

---

# 24. Development Strategy

Build vertically.

Do not spend the whole night building infrastructure first.

### Step 1 — Project foundation

- Nuxt project
- TypeScript
- shadcn-vue
- Tailwind
- Theme
- Basic layout
- Header
- Homepage

### Step 2 — Asset data

- `stocks-data.ts`
- Parse curated symbols
- Build search/Command UI
- Create `/explore/[symbol]`

### Step 3 — Yahoo integration

- Server-side `yahoo-finance2`
- Fetch historical data
- Handle errors
- Add simple cache

### Step 4 — Seasonal math

Implement and test:

- Daily returns
- Election cycle classification
- All Years
- Election
- Pre-Election
- Mid-Term
- Post-Election
- Trump Presidency Years
- Current Year

Validate at least a few known symbols against the original research implementation.

### Step 5 — Chart

- Render All Years + Current Year
- Add remaining profiles
- Interactive legend
- Tooltip
- Percentage / Growth Factor
- Responsive behavior

### Step 6 — Export

- Download PNG
- Add basic chart title/source/disclaimer

### Step 7 — Polish

- Loading state
- Empty state
- Error state
- Mobile layout
- Dark/light mode
- Spacing/typography
- Metadata

### Step 8 — Research

Only after the explorer works:

- Add static Markdown content
- Research index
- Article page
- Article → explorer links

### Step 9 — Tests

At minimum:

- Election cycle mapping
- Daily return calculation
- Profile aggregation
- Trump year selection
- Current year calculation
- Missing/short history handling

---

# 25. Definition of Done

easeason v1 is done when:

- [ ] Public user can open the homepage.
- [ ] User can search/select a curated asset.
- [ ] User is routed to `/explore/[symbol]`.
- [ ] Historical Yahoo data loads server-side.
- [ ] Seasonal calculation works.
- [ ] All Years works.
- [ ] Election works.
- [ ] Pre-Election works.
- [ ] Mid-Term works.
- [ ] Post-Election works.
- [ ] Trump Presidency Years works.
- [ ] Current Year works.
- [ ] Legend toggles each series.
- [ ] Tooltip works.
- [ ] Percentage/Growth Factor toggle works.
- [ ] Statistics tab works (avg, median, std dev, win rate, best, worst, year-end).
- [ ] Animate tab works (progressive chart reveal).
- [ ] Context page provides markdown export with statistics.
- [ ] PNG export works.
- [ ] Loading/error/empty states work.
- [ ] Mobile layout is usable.
- [ ] Light/dark theme works.
- [ ] No authentication exists.
- [ ] No database exists.
- [ ] No LLM integration exists.
- [ ] No prediction/target-price claims exist.
- [ ] Static Markdown research pages work.
- [ ] Core seasonal math has tests.

---

# 26. Important Engineering Guardrails

These rules are especially important when using an AI coding agent.

### Rule 1 — Do not overengineer

Prefer:

```ts
function buildTrumpYearsProfile(...)
```

over building a generalized political-period framework.

### Rule 2 — Do not invent features

If a feature is not in this document, do not add it merely because it seems useful.

### Rule 3 — Keep server and UI responsibilities separate

Server:

- Fetch data
- Calculate data
- Cache data

Client:

- Display data
- Toggle visibility
- Change chart view
- Export
- Navigation

### Rule 4 — No prediction language

Do not introduce:

- Prediction
- Forecast
- Target
- Expected price
- Buy/sell
- Signal

The product visualizes historical statistics.

### Rule 5 — Preserve mathematical correctness

Do not modify the seasonal math simply to make the chart look nicer.

If there is a conflict between visual assumptions and the existing research implementation, validate the math first.

### Rule 6 — Keep the product small

The ideal v1 is:

```text
Search
  ↓
Asset
  ↓
Chart
  ↓
Explore profiles
  ↓
Export PNG
```

Everything else is secondary.

---

# 27. Suggested Initial Repository

```text
easeason/
├── app/
│   ├── components/
│   ├── pages/
│   └── composables/
│
├── content/
│   └── research/
│
├── server/
│   ├── api/
│   ├── config/
│   ├── data/
│   └── utils/
│
├── tests/
│
├── public/
│
├── nuxt.config.ts
├── package.json
└── PRODUCT.md
```

Keep the repository easy for another developer to understand in five minutes.

---

# 28. Final Product Philosophy

easeason should feel like a small, opinionated tool.

Not:

> Bloomberg clone

Not:

> Trading terminal

Not:

> AI stock picker

Not:

> Quant platform

Instead:

> **A clean little tool that makes seasonal market patterns easy to explore.**

The strongest experience is:

```text
"I wonder how NVDA usually behaves
around this time of year."

        ↓

Open easeason

        ↓

Search NVDA

        ↓

See the chart

        ↓

Toggle Election / Mid-Term / Trump Presidency Years

        ↓

Compare with 2026

        ↓

Download the chart

        ↓

Use it in research
```

Ship this first.

Then let actual usage determine what deserves to exist next.
