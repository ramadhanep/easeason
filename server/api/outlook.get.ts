import { defineEventHandler, getQuery, createError } from 'h3'
import { getSeasonalData } from '../utils/seasonal'
import { getAllStocks } from '../utils/stocks'

const MAX_SYMBOLS = 30
const WINDOW_DAYS = 30
const SPARK_STEP = 7

export interface Outlook {
  spark: number[]
  todayIdx: number
  next30: number
}

// Compact "next 30 days" view per symbol, built from the cached All Years profile.
export default defineEventHandler(async (event) => {
  const { symbols } = getQuery(event)
  if (typeof symbols !== 'string' || !symbols) {
    throw createError({ statusCode: 400, statusMessage: 'symbols query param required' })
  }
  const known = new Set(getAllStocks().map((s) => s.symbol))
  const list = [...new Set(symbols.split(','))].filter((s) => known.has(s)).slice(0, MAX_SYMBOLS)

  const now = new Date()
  const today = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 86400000)

  const out: Record<string, Outlook> = {}
  const settled = await Promise.allSettled(list.map((s) => getSeasonalData(s)))
  settled.forEach((r, i) => {
    if (r.status !== 'fulfilled') return
    const pts = r.value.profiles.find((p) => p.id === 'all-years')?.points
    if (!pts?.length) return
    const factorAt = (day: number) => ([...pts].reverse().find((p) => p.day <= day) ?? pts[0]!).factor
    const spark: number[] = []
    for (let d = 1; d <= 365; d += SPARK_STEP) spark.push((factorAt(d) - 1) * 100)
    out[list[i]!] = {
      spark,
      todayIdx: Math.min(spark.length - 1, Math.floor((today - 1) / SPARK_STEP)),
      next30: (factorAt(Math.min(365, today + WINDOW_DAYS)) / factorAt(today) - 1) * 100,
    }
  })
  return out
})
