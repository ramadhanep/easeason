import { describe, it, expect } from 'vitest'
import { buildSeasonalMarkdown, type SeasonalData } from '../shared/seasonal'

const fixture: SeasonalData = {
  meta: {
    symbol: 'NVDA',
    name: 'NVIDIA',
    currentPrice: 100,
    firstYear: 2020,
    lastYear: 2024,
    currentYear: 2025,
  },
  profiles: [
    {
      id: 'all-years',
      label: 'All Years',
      years: [2020, 2021, 2022, 2023, 2024],
      points: [
        { day: 1, pct: 0, factor: 1 },
        { day: 2, pct: 10, factor: 1.1 },
      ],
    },
  ],
  currentYear: {
    year: 2025,
    points: [
      { day: 1, pct: 0, factor: 1 },
      { day: 2, pct: -5, factor: 0.95 },
    ],
  },
}

describe('buildSeasonalMarkdown', () => {
  it('includes title and asset meta', () => {
    const md = buildSeasonalMarkdown(fixture)
    expect(md).toContain('# NVDA — Historical Seasonality')
    expect(md).toContain('Asset: **NVIDIA** (NVDA)')
    expect(md).toContain('Price: 100')
  })

  it('lists every profile and the current-year YTD row', () => {
    const md = buildSeasonalMarkdown(fixture)
    expect(md).toContain('| All Years | 2020, 2021, 2022, 2023, 2024 | 2020 – 2024 |')
    expect(md).toContain('| 2025 YTD | 2025 | 2025 – 2025 |')
  })

  it('emits a seasonal data table with day rows and per-series columns', () => {
    const md = buildSeasonalMarkdown(fixture)
    expect(md).toContain('| Day | Date | All Years | 2025 YTD |')
    expect(md).toContain('| 1 | Jan 1 | 0.00% | 0.00% |')
    expect(md).toContain('| 2 | Jan 2 | 10.00% | -5.00% |')
  })
})

describe('profileDescription', () => {
  it('returns a description for known ids and empty string otherwise', async () => {
    const { profileDescription } = await import('../shared/seasonal')
    expect(profileDescription('all-years')).not.toBe('')
    expect(profileDescription('nope')).toBe('')
  })
})
