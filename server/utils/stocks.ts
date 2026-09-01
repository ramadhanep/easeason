import stocksData from './stocks-data'

export interface Stock {
  symbol: string
  name: string
}

const STOCKS: Stock[] = stocksData

export function getAllStocks(): Stock[] {
  return STOCKS
}

export function getStockName(symbol: string): string | undefined {
  return STOCKS.find((r) => r.symbol === symbol)?.name
}

const GROUPS: Array<{ key: string; label: string; test: (s: string) => boolean }> = [
  { key: 'crypto', label: 'Crypto', test: (s) => s.endsWith('-USD') },
  { key: 'idx', label: 'Indices', test: (s) => s.startsWith('^') },
  { key: 'us-stock', label: 'US Stocks', test: (s) => !s.endsWith('.JK') && !s.endsWith('-USD') && !s.startsWith('^') },
  { key: 'id-stock', label: 'IDX Stocks', test: (s) => s.endsWith('.JK') },
]

export interface StockGroup {
  label: string
  items: Stock[]
}

export function groupStocks(rows: Stock[]): Record<string, StockGroup> {
  const groups: Record<string, StockGroup> = {}
  for (const g of GROUPS) {
    groups[g.key] = { label: g.label, items: rows.filter((r) => g.test(r.symbol)) }
  }
  return groups
}
