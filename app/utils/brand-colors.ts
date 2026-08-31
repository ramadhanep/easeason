export const BRAND_COLORS: Record<string, string> = {
  NVDA: '#76B900',
  MSFT: '#00A1F1',
  AMZN: '#FF9900',
  GOOGL: '#0057E7',
  META: '#0064e0',
  TSLA: '#CC0000',
  AAPL: '#1d1d1f',
  AVGO: '#CC092F',
  'BTC-USD': '#F7931A',
  'ETH-USD': '#8A92B2',
  SPY: '#1A4332',
  QQQ: '#0020C2',
}

export function brandColorFor(symbol: string): string | undefined {
  return BRAND_COLORS[symbol]
}

export function brandTextColor(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff'
}
