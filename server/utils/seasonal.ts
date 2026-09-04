import YahooFinance from 'yahoo-finance2'
import { getStockName } from './stocks'
import {
  getElectionCycleLabel,
  TRUMP_YEARS,
  calculateDailyReturns,
  buildHirschProfile,
  buildCurrentYearProfile,
  type PriceRow,
  type Point,
} from './math'

const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] })

type Row = { date: Date; adjclose: number }

const START_YEAR = 1971
const MIN_DAYS = 200

export { getElectionCycleLabel }

function toPriceRow(r: Row): PriceRow {
  const year = r.date.getFullYear()
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
    const y = r.date.getFullYear()
    byYear.set(y, (byYear.get(y) ?? 0) + 1)
  }
  return rows.filter((r) => (byYear.get(r.date.getFullYear()) ?? 0) >= MIN_DAYS)
}

export interface SeasonalProfile {
  id: string
  label: string
  years: number[]
  points: Point[]
}

export interface SeasonalResponse {
  meta: {
    symbol: string
    name: string
    currentPrice?: number
    firstYear?: number
    lastYear?: number
    currentYear: number
  }
  profiles: SeasonalProfile[]
  currentYear?: { year: number; points: Point[] }
}

export function computeSeasonal(symbol: string, rows: Row[], now = new Date()): SeasonalResponse {
  const currentYear = now.getFullYear()
  const hist = stripIncompleteYears(rows.filter((r) => r.date.getFullYear() < currentYear))
  const current = rows.filter((r) => r.date.getFullYear() === currentYear)

  const histReturns = calculateDailyReturns(hist.map(toPriceRow))
  const cvReturns = calculateDailyReturns(current.map(toPriceRow))

  const firstYear = hist.length ? Math.min(...histReturns.map((r) => r.year)) : undefined
  const lastYear = hist.length ? Math.max(...histReturns.map((r) => r.year)) : undefined

  const profiles: SeasonalProfile[] = []

  if (histReturns.length) {
    profiles.push({
      id: 'all-years',
      label: 'All Years',
      years: [...new Set(histReturns.map((r) => r.year))].sort((a, b) => a - b),
      points: buildHirschProfile(histReturns),
    })
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
  }
}

const CACHE_TTL_MS = 30 * 60 * 1000
const CACHE = new Map<string, { t: number; response: SeasonalResponse }>()

export async function getSeasonalData(symbol: string, now = new Date()): Promise<SeasonalResponse> {
  const hit = CACHE.get(symbol)
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) return hit.response

  const rows = await fetchHistoricalData(symbol)

  const response = computeSeasonal(symbol, rows, now)
  response.meta.name = getStockName(symbol) || symbol

  if (response.profiles.length) CACHE.set(symbol, { t: Date.now(), response })
  return response
}
