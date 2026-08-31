import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineEventHandler } from 'h3'

const GROUPS: Array<{ key: string; label: string; test: (s: string) => boolean }> = [
  { key: 'crypto', label: 'Crypto', test: (s) => s.endsWith('-USD') },
  { key: 'idx', label: 'Indices', test: (s) => s.startsWith('^') && s.endsWith('JKSE') || s.startsWith('^IXIC') || s.startsWith('^GSPC') },
  { key: 'id-stock', label: 'IDX Stocks', test: (s) => s.endsWith('.JK') },
  { key: 'us-stock', label: 'US Stocks', test: () => true },
]

export default defineEventHandler(() => {
  const csv = readFileSync(path.resolve(process.cwd(), 'server/data/stocks.csv'), 'utf8')
  const rows = csv
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(',')
      return { symbol: l.slice(0, i), name: l.slice(i + 1) }
    })

  const groups: Record<string, { label: string; items: { symbol: string; name: string }[] }> = {}
  for (const g of GROUPS) {
    groups[g.key] = { label: g.label, items: rows.filter((r) => g.test(r.symbol)) }
  }
  return groups
})
