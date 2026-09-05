---
description: Write a seasonality article for a ticker. Usage: /seasonality <hex-color> <paste-raw-data-from-context-page>
---

Write a seasonality article in markdown.

**Input:** `$ARGUMENTS`
- First token is a hex color for the thumbnail brand color (e.g. `#FF6B35`)
- Everything after is raw seasonal data copied from the `/explore/[symbol]/context` page

**Output:** A complete markdown article to `content/research/{symbol}-seasonality.md`.

## Frontmatter

```yaml
---
title: "{SYMBOL} Seasonality Through the Election Cycle"
description: "How {COMPANY_NAME} has historically moved across election-cycle profiles, monthly checkpoints, and {CURRENT_YEAR} year-to-date."
publishedOn: {TODAY_YYYY-MM-DD}
image: /img/easeason-seasonality-{symbol-lowercase}.png
thumbnail: /img/easeason-seasonality-{symbol-lowercase}.png
tags:
  - {SYMBOL}
  - election-cycle
---
```

## Article body structure

Follow this exact structure. Use the raw data to fill in all values.

### 1. Title + intro paragraph
`# {SYMBOL} Seasonality Through the Election Cycle`

One paragraph intro. Mention how long the asset has traded publicly (calculate from data range), and that the article breaks it down by U.S. presidential election cycle. Note the sample size (number of years).

### 2. `## Reading the chart`
Standard paragraph explaining the "All Years" line and election-cycle profiles. List each profile with its modulo rule:

- **Election** — year % 4 == 0
- **Post-Election** — year % 4 == 1
- **Mid-Term** — year % 4 == 2
- **Pre-Election** — year % 4 == 3
- **Trump Presidency Years** — the defined Trump-administration years (2016–2019, 2024–2025)
- **{CURRENT_YEAR} YTD** — the direct cumulative return of the current year, so far

End with: "Open the explorer page and toggle each profile to compare."

Then add a centered link block:
```html
<div class="my-8 border rounded-lg p-6 text-center">
  <a href="/explore/{SYMBOL}" class="font-medium underline underline-offset-4">Open {SYMBOL} explorer →</a>
</div>
```

### 3. `## Seasonal chart`
Image tag: `![{SYMBOL} historical seasonality](/img/easeason-seasonality-{symbol-lowercase}.png)`

### 4. `## Snapshot`
Table with Price, Historical data range, and Current year.

### 5. `## Profiles`
Table with columns: Profile | Range | Years. Include all profiles from the raw data plus current year YTD.

### 6. `## Monthly checkpoints`
Cumulative % change from Jan 1, sampled at each month-end. Calculate from the raw seasonal data day-by-day table. Use these day numbers for month boundaries:

| Month | Day |
|---|---|
| Jan | 31 |
| Feb | 59 |
| Mar | 90 |
| Apr | 120 |
| May | 151 |
| Jun | 181 |
| Jul | 212 |
| Aug | 243 |
| Sep | 273 |
| Oct | 304 |
| Nov | 334 |
| Dec* | 364 |

Use `—` for months where data is not yet available in the current year. Mark Dec with asterisk and note it's one day short of year-end.

### 7. `## Highlights`
3-4 bullet points with bold lead-in sentences. Analyze the raw data to find:
- How current year compares to historical pace
- Which profile is strongest / weakest
- Any notable divergence or pattern
- Post-Election year behavior if relevant

Use actual numbers from the monthly checkpoints table. Bold key figures.

### 8. `## Caveats`
Standard disclaimer paragraph:
"This is historical statistics, not a forecast. Averages smooth over individual outlier years, so trade the summary above with that in mind. Full daily data is available on the [explorer page](/explore/{SYMBOL})."

### 9. Footer
```
---
Historical statistics based on available market data. Not financial advice.
Source: Yahoo Finance
```

## Rules
- Write in English
- Tone: analytical, concise, data-driven. No hype, no predictions.
- All percentages must come from the raw data, never invented
- Monthly checkpoint values: use `toFixed(1)` format (e.g. `3.3%`, `-5.8%`)
- If a profile has no data for a month, leave cell empty in the table
- Company name: extract from raw data header (the "Asset: **Name** (SYMBOL)" line)
