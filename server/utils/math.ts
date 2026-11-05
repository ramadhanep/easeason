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

// Phase (year % 4) that opens the Full Seasons window so the current year always sits in the last box.
export function fullSeasonStartPhase(currentYear: number): number {
  return (((currentYear - 3) % 4) + 4) % 4
}

export function buildFullSeasonProfile(returns: RetRow[], startPhase = 0): Point[] {
  const cycles = new Map<number, RetRow[]>()
  for (const row of returns) {
    const cycleStart = row.year - ((((row.year - startPhase) % 4) + 4) % 4)
    const cycle = cycles.get(cycleStart) ?? []
    cycle.push(row)
    cycles.set(cycleStart, cycle)
  }

  const daily = new Map<number, { sum: number; n: number }>()
  for (const [cycleStart, cycle] of cycles) {
    const years = new Set(cycle.map((row) => row.year))
    if (years.size !== 4) continue
    for (const row of cycle) {
      const day = Math.floor(((Date.UTC(row.year, 0, 1) + (row.doy - 1) * 86400000) - Date.UTC(cycleStart, 0, 1)) / 86400000)
      const acc = daily.get(day) ?? { sum: 0, n: 0 }
      acc.sum += row.ret
      acc.n += 1
      daily.set(day, acc)
    }
  }

  let factor = 1
  return [...daily.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, { sum, n }]) => {
      factor *= 1 + sum / n
      return { day: day + 1, pct: (factor - 1) * 100, factor }
    })
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

export type LatestSeason = { id: string; label: string; year: number; points: Point[] }

// Rolling 4-box window [Y-3, Y-2, Y-1, Y]: consecutive years, current year always last.
export function buildLatestSeasons(returns: RetRow[], currentYear: number): LatestSeason[] {
  const out: LatestSeason[] = []
  const windowStart = currentYear - 3
  let carry = 1 // each box continues from where the previous box ended
  for (let box = 0; box < 4; box++) {
    const year = windowStart + box
    const offset = Math.round((Date.UTC(year, 0, 1) - Date.UTC(windowStart, 0, 1)) / 86400000)
    const points = buildCurrentYearProfile(returns, year).map((p) => {
      const factor = carry * p.factor
      return { day: p.day + offset, factor, pct: (factor - 1) * 100 }
    })
    if (!points.length) continue
    carry = points[points.length - 1]!.factor
    const label = CYCLE_LABELS[((year % 4) + 4) % 4]!
    out.push({ id: label.toLowerCase().replace(/\s+/g, '-'), label, year, points })
  }
  return out
}
