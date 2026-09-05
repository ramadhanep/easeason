import { defineEventHandler, getQuery, createError } from 'h3'
import { getSeasonalData } from '../utils/seasonal'
import { getAllStocks as getStockList } from '../utils/stocks'

export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event)
  if (!symbol || typeof symbol !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'symbol query param required' })
  }

  const stocks = getStockList()
  if (!stocks.find((s) => s.symbol === symbol)) {
    throw createError({ statusCode: 404, statusMessage: `Asset not found. Choose an asset from the supported list.` })
  }

  try {
    const data = await getSeasonalData(symbol)
    if (!data.profiles.length) {
      throw createError({ statusCode: 404, statusMessage: `No data found for symbol: ${symbol}` })
    }
    return data
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number') throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load market data. Yahoo Finance may be temporarily unavailable.',
    })
  }
})
