export const CYCLE_LABELS: Record<number, string> = {
  0: 'Election',
  1: 'Post-Election',
  2: 'Mid-Term',
  3: 'Pre-Election',
}

export const TRUMP_YEARS = [2016, 2017, 2018, 2019, 2024, 2025]

export function getElectionCycleLabel(year: number): string {
  return CYCLE_LABELS[year % 4]!
}

export type RetRow = { doy: number; year: number; ret: number }
export type PriceRow = { year: number; doy: number; price: number }
export type Point = { day: number; pct: number; factor: number }

export function calculateDailyReturns(prices: PriceRow[]): RetRow[] {
  const sorted = [...prices].sort((a, b) => a.year - b.year || a.doy - b.doy)
  const out: RetRow[] = []
  let prev: { year: number; price: number } | null = null
  for (const p of sorted) {
    if (prev && prev.year === p.year && prev.price !== 0) {
      out.push({ doy: p.doy, year: p.year, ret: p.price / prev.price - 1 })
    }
    prev = { year: p.year, price: p.price }
  }
  return out
}

export function buildHirschProfile(returns: RetRow[]): Point[] {
  const map = new Map<number, { sum: number; n: number }>()
  for (const r of returns) {
    const acc = map.get(r.doy) ?? { sum: 0, n: 0 }
    acc.sum += r.ret
    acc.n += 1
    map.set(r.doy, acc)
  }
  const days = [...map.entries()].sort((a, b) => a[0] - b[0])
  let factor = 1
  const out: Point[] = []
  for (const [doy, { sum, n }] of days) {
    factor *= 1 + sum / n
    out.push({ day: doy, pct: (factor - 1) * 100, factor })
  }
  return out
}

export function buildCurrentYearProfile(returns: RetRow[], year: number): Point[] {
  const days = returns
    .filter((r) => r.year === year)
    .sort((a, b) => a.doy - b.doy)
  let factor = 1
  const out: Point[] = []
  for (const r of days) {
    factor *= 1 + r.ret
    out.push({ day: r.doy, pct: (factor - 1) * 100, factor })
  }
  return out
}
