# easeason

Explore historical market seasonality.

easeason is a small, public, open-source tool for exploring how stocks, crypto, and indices have historically moved throughout the year — including U.S. presidential election-cycle patterns.

It is a **research/visualization tool**, not a prediction engine, trading system, portfolio manager, or AI product. No account, no authentication, no database.

## Features

- **Asset explorer** — curated assets grouped into Crypto, US Stocks, IDX Stocks, and Indices, with shareable routes like `/explore/NVDA` and `/explore/BTC-USD`.
- **Seasonal profiles** — All Years, Election, Pre-Election, Mid-Term, Post-Election, Trump Years, and Current Year.
- **Interactive chart** — hover tooltip across all visible series, legend toggles, Percentage / Growth Factor scale, responsive, dark/light theme.
- **Statistics** — per-profile table showing average, median, std deviation, win rate, best, worst, and year-end returns.
- **Animate** — play a progressive chart reveal from Jan 1 to Dec 31.
- **PNG export** — download a clean chart suited for research use.
- **Markdown export** — the `/explore/[symbol]/context` page provides a copy-ready markdown document including statistics, series descriptions, and the full seasonal data table.
- **AI-ready URLs** — `GET /markdown/<symbol>` (e.g. `/markdown/NVDA`) returns a `text/markdown` document that an LLM/agent can scan directly to understand the seasonal numbers.
- **Research** — a static-content section with long-form seasonality articles, served from Markdown via `@nuxt/content`.
- **PWA** — installable as a Progressive Web App.

## Tech Stack

- [Nuxt 4](https://nuxt.com) + [TypeScript](https://www.typescriptlang.org)
- [shadcn-vue](https://shadcn-vue.com) UI components + [Tailwind CSS](https://tailwindcss.com)
- [ECharts](https://echarts.apache.org) via `vue-echarts`
- [@lucide/vue](https://lucide.dev) icons
- [@nuxt/content](https://content.nuxt.com) for the research articles
- [vitest](https://vitest.dev) for tests
- [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2) for market data

## Getting Started

```bash
# install dependencies
npm install

# development server on http://localhost:3000
npm run dev

# run tests
npm test

# production build
npm run build

# static site generation
npm run generate
```

## How It Works

Daily historical OHLCV data is fetched server-side from Yahoo Finance. The seasonal math:

- **Daily return:** `return[i] = adjclose[i] / adjclose[i-1] - 1` (first row of the year is `0`).
- **Cycle label:** `year % 4` → `0` = Election, `1` = Post-Election, `2` = Mid-Term, `3` = Pre-Election.
- **Profile:** mean daily return per day-of-year, compounded via `factor = cumprod(1 + meanDailyReturn)`, then `pct = (factor - 1) * 100`.
- **Current year:** direct cumulative return of the year's daily returns (never averaged against history).
- **Trump Years:** a custom historical comparison period — `2016, 2017, 2018, 2019, 2024, 2025`.

Period/cycle definitions live in one place: `server/utils/math.ts`.

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

Other endpoints:

```http
GET /api/symbols          # curated asset list, grouped by category
GET /markdown/<symbol>    # full seasonal data as text/markdown
```

## Project Structure

```
easeason/
├── app/
│   ├── components/        # SeasonalChart + shadcn-vue ui/
│   ├── pages/             # index, explore/[symbol], research/*
│   ├── utils/             # brand colors, formatters
│   └── assets/css/        # Tailwind + theme + prose styles
├── content/
│   └── research/          # static Markdown articles
├── server/
│   ├── api/               # /api/seasonal, /api/symbols
│   └── utils/             # math, seasonal, stocks + curated asset list (stocks-data.ts)
├── shared/                # types + markdown builder shared with server/api
├── public/img/            # generated thumbnail charts
├── tests/                 # vitest
├── content.config.ts
├── nuxt.config.ts
└── PRODUCT.md             # product specification
```

## Contributing

Contributions are welcome — including new research articles, bug fixes, and documentation. See [CONTRIBUTING.md](CONTRIBUTING.md) for a step-by-step guide on opening a pull request.

## License

easeason is licensed under the [GNU General Public License v3.0](LICENSE).

## Disclaimer

Historical statistics based on available market data. Not financial advice. easeason is a visualization/research tool, not a recommendation engine.
