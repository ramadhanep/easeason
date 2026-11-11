import YahooFinance from 'yahoo-finance2'
import { getStockName } from './stocks'
import {
  getElectionCycleLabel,
  TRUMP_YEARS,
  calculateDailyReturns,
  buildHirschProfile,
  buildFullSeasonProfile,
  fullSeasonStartPhase,
  buildCurrentYearProfile,
  buildLatestSeasons,
  buildMonthlyReturns,
  buildForwardWindow,
  type MonthlyRow,
  type LatestSeason,
  type PriceRow,
} from './math'
import type { SeasonalData, SeasonalProfile } from '#shared/seasonal'

const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] })

type Row = { date: Date; adjclose: number }

const START_YEAR = 1971
const MIN_DAYS = 200

export { getElectionCycleLabel }

function toPriceRow(r: Row): PriceRow {
  const year = r.date.getUTCFullYear()
  const start = Date.UTC(year, 0, 0)
  const doy = Math.floor((r.date.getTime() - start) / 86400000)
  return { year, doy, price: r.adjclose }
}

export async function fetchHistoricalData(symbol: string): Promise<Row[]> {
  const result = await yf.chart(symbol, {
    period1: new Date(START_YEAR, 0, 1),
    period2: new Date(),
    interval: '1d',
  })

  if (!result.quotes?.length) {
    return []
  }

  const rows: Row[] = []
  for (const q of result.quotes) {
    if (q.adjclose != null && Number.isFinite(q.adjclose)) {
      rows.push({
        date: q.date instanceof Date ? q.date : new Date(q.date),
        adjclose: q.adjclose,
      })
    }
  }
  return rows
}

function stripIncompleteYears(rows: Row[]): Row[] {
  const byYear = new Map<number, number>()
  for (const r of rows) {
    const y = r.date.getUTCFullYear()
    byYear.set(y, (byYear.get(y) ?? 0) + 1)
  }
  return rows.filter((r) => (byYear.get(r.date.getUTCFullYear()) ?? 0) >= MIN_DAYS)
}

export type SeasonalResponse = SeasonalData & {
  latestSeasons: LatestSeason[]
  fullSeasonStart: number
  monthly: MonthlyRow[]
}

export function computeSeasonal(symbol: string, rows: Row[], now = new Date()): SeasonalResponse {
  const currentYear = now.getUTCFullYear()
  const hist = stripIncompleteYears(rows.filter((r) => r.date.getUTCFullYear() < currentYear))
  const current = rows.filter((r) => r.date.getUTCFullYear() === currentYear)

  const histReturns = calculateDailyReturns(hist.map(toPriceRow))
  const cvReturns = calculateDailyReturns(current.map(toPriceRow))

  const firstYear = hist.length ? Math.min(...histReturns.map((r) => r.year)) : undefined
  const lastYear = hist.length ? Math.max(...histReturns.map((r) => r.year)) : undefined

  const profiles: SeasonalProfile[] = []

  if (histReturns.length) {
    const years = [...new Set(histReturns.map((r) => r.year))].sort((a, b) => a - b)
    profiles.push({
      id: 'all-years',
      label: 'All Years',
      years,
      points: buildHirschProfile(histReturns),
    })
    const startPhase = fullSeasonStartPhase(currentYear)
    const fullSeasonYears = years.filter((year) => (((year - startPhase) % 4) + 4) % 4 === 0 && [1, 2, 3].every((n) => years.includes(year + n)))
    if (fullSeasonYears.length) {
      profiles.push({
        id: 'full-seasons',
        label: 'Full Seasons',
        years: fullSeasonYears.flatMap((year) => [year, year + 1, year + 2, year + 3]),
        points: buildFullSeasonProfile(histReturns, startPhase),
      })
    }
  }

  const cycleGroups = new Map<string, typeof histReturns>()
  for (const r of histReturns) {
    const c = getElectionCycleLabel(r.year)
    if (!cycleGroups.has(c)) cycleGroups.set(c, [])
    cycleGroups.get(c)!.push(r)
  }
  for (const [cycle, group] of cycleGroups) {
    const id = cycle.toLowerCase().replace(/\s+/g, '-')
    profiles.push({
      id,
      label: cycle,
      years: [...new Set(group.map((r) => r.year))].sort((a, b) => a - b),
      points: buildHirschProfile(group),
    })
  }

  const trumpReturns = histReturns.filter((r) => TRUMP_YEARS.includes(r.year))
  if (trumpReturns.length) {
    profiles.push({
      id: 'trump-years',
      label: 'Trump Presidency Years',
      years: TRUMP_YEARS.filter((y) => y < currentYear),
      points: buildHirschProfile(trumpReturns),
    })
  }

  const currentPoints = buildCurrentYearProfile(cvReturns, currentYear)
  const lastClose = rows.length ? rows[rows.length - 1]!.adjclose : undefined

  return {
    meta: {
      symbol,
      name: symbol,
      currentPrice: lastClose,
      firstYear,
      lastYear,
      currentYear,
    },
    profiles,
    currentYear: currentPoints.length ? { year: currentYear, points: currentPoints } : undefined,
    fullSeasonStart: fullSeasonStartPhase(currentYear),
    monthly: buildMonthlyReturns([...histReturns, ...cvReturns]),
    forward: forwardWithLabels(histReturns, now),
    latestSeasons: buildLatestSeasons(calculateDailyReturns(rows.map(toPriceRow)), currentYear),
  }
}

// Labels use the current year's calendar (monthLabel assumes a leap year, off by one from March).
function forwardWithLabels(returns: Parameters<typeof buildForwardWindow>[0], now: Date) {
  const w = buildForwardWindow(returns, toPriceRow({ date: now, adjclose: 0 }).doy)
  if (!w) return undefined
  const label = (doy: number) => new Date(Date.UTC(now.getUTCFullYear(), 0, doy)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return { ...w, fromLabel: label(w.fromDay), toLabel: label(w.toDay) }
}

const CACHE_TTL_MS = 30 * 60 * 1000
const CACHE = new Map<string, { t: number; response: SeasonalResponse }>()
const MAX_CACHE_ENTRIES = 100

function cleanupCache(): void {
  const now = Date.now()
  for (const [key, val] of CACHE) {
    if (now - val.t >= CACHE_TTL_MS) CACHE.delete(key)
  }
  if (CACHE.size > MAX_CACHE_ENTRIES) {
    const oldest = [...CACHE.entries()].sort((a, b) => a[1].t - b[1].t)
    const toDrop = Math.floor(oldest.length - MAX_CACHE_ENTRIES / 2)
    for (const [key] of oldest.slice(0, toDrop)) {
      CACHE.delete(key)
    }
  }
}

export async function getSeasonalData(symbol: string, now = new Date()): Promise<SeasonalResponse> {
  cleanupCache()
  const hit = CACHE.get(symbol)
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) return hit.response

  const rows = await fetchHistoricalData(symbol)

  const response = computeSeasonal(symbol, rows, now)
  response.meta.name = getStockName(symbol) || symbol

  if (response.profiles.length) CACHE.set(symbol, { t: Date.now(), response })
  return response
}
