---
title: "AMZN Seasonality Through the Election Cycle"
description: "How Amazon historically moved across election-cycle profiles, monthly checkpoints, and 2026 year-to-date."
publishedOn: 2026-09-01
image: /img/easeason-seasonality-amzn.png
thumbnail: /img/easeason-seasonality-amzn.png
tags:
  - AMZN
  - election-cycle
---

# AMZN Seasonality Through the Election Cycle

Amazon has traded on major exchanges since 1997, but only from 1998 onward is the series complete enough to build seasonality in this dataset — that still gives us a full 28-year sample broken down by the U.S. presidential election cycle.

## Reading the chart

The "All Years" line shows the average cumulative path across all valid years. The election-cycle profiles break those same years into groups by year type:

- **Election** — year % 4 == 0
- **Post-Election** — year % 4 == 1
- **Mid-Term** — year % 4 == 2
- **Pre-Election** — year % 4 == 3
- **Trump Presidency Years** — the defined Trump-administration years (2016–2019, 2024–2025)
- **2026 YTD** — the direct cumulative return of the current year, so far

Open the explorer page and toggle each profile to compare.

<div class="my-8 border rounded-lg p-6 text-center">
  <a href="/explore/AMZN" class="font-medium underline underline-offset-4">Open AMZN explorer →</a>
</div>

## Seasonal chart

![AMZN historical seasonality](/img/easeason-seasonality-amzn.png)

## Snapshot

| | |
|---|---|
| Price | $258.75 |
| Historical data range | 1998 – 2025 (28 years) |
| Current year | 2026 |

## Profiles

| Profile | Range | Years |
|---|---|---|
| All Years | 1998 – 2025 | all 28 |
| Pre-Election | 1999 – 2023 | 1999, 2003, 2007, 2011, 2015, 2019, 2023 |
| Election | 2000 – 2024 | 2000, 2004, 2008, 2012, 2016, 2020, 2024 |
| Post-Election | 2001 – 2025 | 2001, 2005, 2009, 2013, 2017, 2021, 2025 |
| Mid-Term | 1998 – 2022 | 1998, 2002, 2006, 2010, 2014, 2018, 2022 |
| Trump Presidency Years | 2016 – 2025 | 2016, 2017, 2018, 2019, 2024, 2025 |
| 2026 YTD | 2026 | 2026 |

## Monthly checkpoints

Cumulative % change from Jan 1, sampled at each month-end (the December row is day 364, one day short of year-end).

| Month | All Years | Pre-Election | Election | Post-Election | Mid-Term | Trump Presidency Years | 2026 YTD |
|---|---|---|---|---|---|---|---|
| Jan | 5.4% | 10.0% | -9.3% | 16.7% | 4.3% | 11.4% | — |
| Feb | 1.4% | 13.6% | -15.3% | 0.1% | 7.2% | 11.9% | — |
| Mar | 9.8% | 30.7% | -8.0% | 2.3% | 13.9% | 16.9% | -7.0% |
| Apr | 21.7% | 56.8% | 0.0% | 17.8% | 12.3% | 24.1% | 18.4% |
| May | 25.2% | 57.9% | 2.3% | 26.7% | 12.6% | 31.2% | 15.4% |
| Jun | 33.1% | 73.1% | 3.2% | 23.5% | 31.3% | 39.2% | 6.7% |
| Jul | 37.9% | 83.9% | -1.3% | 33.4% | 31.8% | 40.3% | — |
| Aug | 42.3% | 94.7% | 9.4% | 21.5% | 38.9% | 41.4% | — |
| Sep | 49.1% | 116.5% | 9.6% | 19.1% | 51.8% | 43.0% | — |
| Oct | 55.6% | 128.0% | -1.9% | 39.0% | 60.2% | 48.7% | — |
| Nov | 77.2% | 152.2% | -5.9% | 75.7% | 97.8% | 53.1% | — |
| Dec* | 78.4% | 149.1% | -5.8% | 73.8% | 97.5% | 54.6% | — |

## Highlights

- **2026 is trailing its own historical pace.** 2026 is a Mid-Term year, yet AMZN is up only about **+6.7%** year-to-date through the last confirmed data point (end of June), against the ~**+33.1%** the All-Years average typically shows by mid-year.
- **Pre-Election years are the strongest seasonal tailwind**, climbing steadily from January to about **+149.1%** by year-end.
- **Election years are the seasonal laggard** — mostly flat to slightly negative across the year and settling around **-5.8%** by December.
- **Mid-Term and Post-Election years power the big back-halves**, with Mid-Term averaging ~**+97.5%** and Post-Election ~**+73.8%** by year-end.

## Caveats

This is historical statistics, not a forecast. AMZN has a long, stable history here (1998–2025), so the cycle averages carry less noise than a newer ticker — but recent years and the partial 2026 YTD column can shift fast. Trade the summary above with that in mind. Full daily data is available on the [explorer page](/explore/AMZN).

---

Historical statistics based on available market data. Not financial advice.
Source: Yahoo Finance
