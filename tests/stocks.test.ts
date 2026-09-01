import { describe, it, expect } from 'vitest'
import { groupStocks, getAllStocks, type Stock } from '../server/utils/stocks'

const sample: Stock[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'TLKM.JK', name: 'Telkom' },
  { symbol: 'AAPL', name: 'Apple' },
]

describe('groupStocks', () => {
  it('sorts each symbol into exactly one category', () => {
    const g = groupStocks(sample)
    const total = Object.values(g).reduce((n, grp) => n + grp.items.length, 0)
    expect(total).toBe(sample.length)
    expect(g.crypto.items.map((s) => s.symbol)).toEqual(['BTC-USD'])
  })

  it('classifies crypto by -USD suffix', () => {
    expect(groupStocks(sample).crypto.items).toHaveLength(1)
    expect(groupStocks(sample).crypto.label).toBe('Crypto')
  })

  it('classifies indices by ^ prefix', () => {
    expect(groupStocks(sample).idx.items.map((s) => s.symbol)).toEqual(['^GSPC'])
  })

  it('classifies IDX stocks by .JK suffix and US otherwise', () => {
    const g = groupStocks(sample)
    expect(g['id-stock'].items.map((s) => s.symbol)).toEqual(['TLKM.JK'])
    expect(g['us-stock'].items.map((s) => s.symbol)).toEqual(['NVDA', 'AAPL'])
  })

  it('covers every curated asset', () => {
    const all = getAllStocks()
    const g = groupStocks(all)
    const total = Object.values(g).reduce((n, grp) => n + grp.items.length, 0)
    expect(total).toBe(all.length)
  })
})
