# easeason

> Explore historical market seasonality.

easeason is a small, public, open-source tool to explore how stocks, crypto, and indices have historically moved throughout the year — including U.S. presidential election-cycle patterns.

The **chart is the product**: find an asset, see its seasonal history, toggle different profiles, compare them, inspect exact points, and export the chart as a PNG.

It is **not** a prediction engine, trading system, portfolio manager, or AI product. No account, no authentication, no database.

## Features

- **Asset explorer** — curated assets grouped by Crypto, US Stocks, IDX Stocks, and Indices, with shareable routes `/explore/NVDA`, `/explore/BTC-USD`, etc.
- **Seasonal profiles** — All Years, Election, Pre-Election, Mid-Term, Post-Election, Trump Years, and Current Year.
- **Interactive chart** — hover tooltip across all visible series, legend toggles, Percentage / Growth Factor scale, responsive, dark/light theme.
- **PNG export** — download a clean chart suited for research use.
- **Markdown export** — on each `/explore/[symbol]` page: a "Profiles" section explains every series (year range + member years + description), and a `.md` button downloads the full seasonal data as a markdown table.
- **AI-ready URLs** — `GET /markdown/<symbol>` (e.g. `/markdown/NVDA`) returns a `text/markdown` document an LLM/agent (Claude Web, etc.) can scan directly to understand the profiles and seasonal numbers.
- **Research** — static Markdown articles, no CMS.
- **Server-side data** — Yahoo Finance via `yahoo-finance2`, with per-symbol caching.

## Tech Stack

- [Nuxt 4](https://nuxt.com) (Vue 3, TypeScript)
- [shadcn-vue](https://shadcn-vue.com) + [Tailwind CSS](https://tailwindcss.com)
- [ECharts](https://echarts.apache.org) via `vue-echarts`
- [@lucide/vue](https://lucide.dev) icons
- [@nuxt/content](https://content.nuxt.com) for Markdown research articles
- [vitest](https://vitest.dev) for tests

## Getting Started

```bash
# install
npm install

# development server on http://localhost:3000
npm run dev

# tests
npm test

# production build
npm run build
```

## How It Works

Daily historical OHLCV is fetched server-side from Yahoo Finance. The original research implementation's seasonal math is preserved:

- **Daily return:** `return[i] = adjclose[i] / adjclose[i-1] - 1` (first row of each year is `0`).
- **Cycle label:** `year % 4` → `0` Election, `1` Post-Election, `2` Mid-Term, `3` Pre-Election.
- **Profile:** mean daily return per day-of-year, compounded via `factor = cumprod(1 + meanDailyReturn)`, then `pct = (factor - 1) * 100`.
- **Current year:** direct cumulative return series of that year's daily returns (never averaged with history).
- **Trump Years:** a custom historical comparison period — `2016, 2017, 2018, 2019, 2024, 2025`.

Period/cycle definitions live in one place, `server/utils/math.ts`.

### API

```http
GET /api/seasonal?symbol=NVDA
```

Returns data only (no UI state, no predictions):

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
  currentYear?: { year: number; points: SeasonalPoint[] }
}

interface SeasonalProfile {
  id: 'all-years' | 'election' | 'pre-election' | 'mid-term' | 'post-election' | 'trump-years'
  label: string
  years: number[]
  points: SeasonalPoint[]
}
```

## Project Structure

```
easeason/
├── app/
│   ├── components/          # SeasonalChart + shadcn-vue ui/
│   ├── pages/               # index, explore/[symbol], research/*
│   └── assets/css/          # Tailwind + theme + prose styles
├── content/
│   └── research/            # static Markdown articles
├── server/
│   ├── api/                 # /api/seasonal, /api/symbols
│   ├── config/
│   ├── data/stocks.csv      # curated asset list
│   └── utils/               # math, seasonal, yahoo
├── tests/                   # vitest
├── content.config.ts
├── nuxt.config.ts
└── PRODUCT.md               # product specification
```

## Disclaimer

Historical statistics based on available market data. Not financial advice. This is a visualization/research tool, not a recommendation engine.
