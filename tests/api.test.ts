import { describe, it, expect, vi } from 'vitest'
import { fetchHistoricalData, computeSeasonal } from '../server/utils/seasonal'

function makeQuotes(): { date: Date; adjclose: number }[] {
  const rows: { date: Date; adjclose: number }[] = []
  for (let year = 2000; year <= 2024; year++) {
    const days = year % 4 === 0 ? 366 : 365
    let price = 100
    for (let d = 1; d <= days; d++) {
      price = +(price * (1 + (Math.sin(d) * 0.01))).toFixed(2)
      rows.push({ date: new Date(Date.UTC(year, 0, d)), adjclose: price })
    }
  }
  return rows
}

const mockQuotes = makeQuotes()

vi.mock('yahoo-finance2', () => {
  const chart = vi.fn(async () => ({ quotes: mockQuotes }))
  return { default: class { chart = chart } }
})

describe('api pipeline', () => {
  it('fetch returns filtered adjclose rows', async () => {
    const rows = await fetchHistoricalData('AAPL')
    expect(rows.length).toBe(mockQuotes.length)
    expect(rows[0]).toEqual({ date: mockQuotes[0].date, adjclose: mockQuotes[0].adjclose })
  })

  it('computeSeasonal returns profiles from fetched data', async () => {
    const rows = await fetchHistoricalData('AAPL')
    const res = computeSeasonal('AAPL', rows, new Date('2025-01-01'))
    expect(res.profiles.length).toBeGreaterThan(0)
    expect(res.profiles[0]).toMatchObject({ id: 'all-years' })
    expect(res.meta.currentYear).toBe(2025)
  })
})
