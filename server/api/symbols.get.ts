import { defineEventHandler } from 'h3'
import { getAllStocks } from '../utils/stocks'

const GROUPS: Array<{ key: string; label: string; test: (s: string) => boolean }> = [
  { key: 'crypto', label: 'Crypto', test: (s) => s.endsWith('-USD') },
  { key: 'idx', label: 'Indices', test: (s) => s.startsWith('^') },
  { key: 'us-stock', label: 'US Stocks', test: (s) => !s.endsWith('.JK') && !s.endsWith('-USD') && !s.startsWith('^') },
  { key: 'id-stock', label: 'IDX Stocks', test: (s) => s.endsWith('.JK') },
]

export default defineEventHandler(() => {
  const rows = getAllStocks()

  const groups: Record<string, { label: string; items: { symbol: string; name: string }[] }> = {}
  for (const g of GROUPS) {
    groups[g.key] = { label: g.label, items: rows.filter((r) => g.test(r.symbol)) }
  }
  return groups
})
