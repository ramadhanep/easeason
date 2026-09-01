import { describe, it, expect, vi } from 'vitest'

import seasonalHandler from '../server/api/seasonal.get'
import markdownHandler from '../server/routes/markdown/[symbol]'

const { chartMock } = vi.hoisted(() => ({ chartMock: vi.fn() }))

vi.mock('yahoo-finance2', () => ({
  default: class {
    chart = chartMock
  },
}))

function seasonalCtx(query: string) {
  return { path: `/api/seasonal${query}`, method: 'GET', node: { req: {} } }
}

function markdownCtx(symbol: string) {
  return {
    path: `/markdown/${symbol}`,
    context: { params: { symbol } },
    node: { req: {}, res: { setHeader: vi.fn() } },
  }
}

function makeQuotes() {
  const quotes = []
  for (let year = 2000; year <= 2020; year++) {
    const days = year % 4 === 0 ? 366 : 365
    let price = 100
    for (let d = 1; d <= days; d++) {
      price = +(price * 1.001).toFixed(2)
      quotes.push({ date: new Date(Date.UTC(year, 0, d)), adjclose: price })
    }
  }
  return quotes
}

describe('handlers', () => {
  it('throws 400 when symbol query is missing', async () => {
    await expect(seasonalHandler(seasonalCtx(''))).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 404 when no market data exists', async () => {
    chartMock.mockResolvedValue({ quotes: [] })
    await expect(seasonalHandler(seasonalCtx('?symbol=NVDA'))).rejects.toMatchObject({ statusCode: 404 })
  })

  it('throws 500 when Yahoo fetch fails', async () => {
    chartMock.mockRejectedValue(new Error('network'))
    await expect(seasonalHandler(seasonalCtx('?symbol=NVDA'))).rejects.toMatchObject({ statusCode: 500 })
  })

  it('returns seasonal data for a valid symbol', async () => {
    chartMock.mockResolvedValue({ quotes: makeQuotes() })
    const res = await seasonalHandler(seasonalCtx('?symbol=AAPL'))
    expect(res.meta.symbol).toBe('AAPL')
    expect(res.profiles.length).toBeGreaterThan(0)
  })

  it('markdown route throws 400 without symbol param', async () => {
    await expect(markdownHandler(markdownCtx(''))).rejects.toMatchObject({ statusCode: 400 })
  })

  it('markdown route throws 404 for empty data', async () => {
    chartMock.mockResolvedValue({ quotes: [] })
    await expect(markdownHandler(markdownCtx('NVDA'))).rejects.toMatchObject({ statusCode: 404 })
  })

  it('markdown route returns text/markdown document', async () => {
    chartMock.mockResolvedValue({ quotes: makeQuotes() })
    const md = await markdownHandler(markdownCtx('AAPL'))
    expect(md).toContain('# AAPL — Historical Seasonality')
  })
})
