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
