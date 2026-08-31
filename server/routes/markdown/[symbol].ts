import { getStockName } from '../../utils/stocks'
import { defineEventHandler, createError, getRouterParam, setHeader } from 'h3'
import { fetchHistoricalData, computeSeasonal } from '../../utils/seasonal'
import type { SeasonalResponse } from '../../utils/seasonal'
import { buildSeasonalMarkdown, type SeasonalData } from '#shared/seasonal'

interface Cached {
  t: number
  response: SeasonalResponse
}
const CACHE = new Map<string, Cached>()

async function getData(symbol: string): Promise<SeasonalData> {
  const hit = CACHE.get(symbol)
  if (hit && Date.now() - hit.t < 30 * 60 * 1000) return hit.response as unknown as SeasonalData

  const name = getStockName(symbol) || symbol

  const rows = await fetchHistoricalData(symbol)
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: `No data for ${symbol}` })

  const response = computeSeasonal(symbol, rows)
  response.meta.name = name
  CACHE.set(symbol, { t: Date.now(), response })
  return response as unknown as SeasonalData
}

export default defineEventHandler(async (event) => {
  const symbol = getRouterParam(event, 'symbol')
  if (!symbol) throw createError({ statusCode: 400, statusMessage: 'symbol required' })

  const data = await getData(symbol)
  const md = buildSeasonalMarkdown(data)
  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  return md
})
