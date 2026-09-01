import { defineEventHandler, getQuery, createError } from 'h3'
import { getSeasonalData } from '../utils/seasonal'

export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event)
  if (!symbol || typeof symbol !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'symbol query param required' })
  }

  try {
    const data = await getSeasonalData(symbol)
    if (!data.profiles.length) {
      throw createError({ statusCode: 404, statusMessage: `No data found for symbol: ${symbol}` })
    }
    return data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load market data. Yahoo Finance may be temporarily unavailable.',
    })
  }
})
