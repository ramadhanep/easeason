import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineEventHandler, getQuery, createError } from 'h3'
import { fetchHistoricalData, computeSeasonal } from '../utils/seasonal'
import type { SeasonalResponse } from '../utils/seasonal'

interface CachedData {
  t: number
  response: SeasonalResponse
}

const CACHE = new Map<string, CachedData>()

async function fetchDataWithCache(symbol: string) {
  const hit = CACHE.get(symbol)
  if (hit && Date.now() - hit.t < 30 * 60 * 1000) return hit.response

  const csv = readFileSync(path.resolve(process.cwd(), 'server/data/stocks.csv'), 'utf8')
  const nameRow = csv
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .find((l) => l.startsWith(`${symbol},`))
  const name = nameRow ? nameRow.split(',')[1] : symbol

  const rows = await fetchHistoricalData(symbol)
  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: `No data found for symbol: ${symbol}` })
  }

  const response = computeSeasonal(symbol, rows)
  response.meta.name = name

  CACHE.set(symbol, { t: Date.now(), response })
  return response
}

export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event)
  if (!symbol || typeof symbol !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'symbol query param required' })
  }

  try {
    return await fetchDataWithCache(symbol)
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load market data. Yahoo Finance may be temporarily unavailable.',
    })
  }
})
