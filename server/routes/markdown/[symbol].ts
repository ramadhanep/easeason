import { defineEventHandler, createError, getRouterParam, setHeader } from 'h3'
import { getSeasonalData } from '../../utils/seasonal'
import { buildSeasonalMarkdown } from '#shared/seasonal'
import { getAllStocks } from '../../utils/stocks'

export default defineEventHandler(async (event) => {
  const symbol = getRouterParam(event, 'symbol')
  if (!symbol) throw createError({ statusCode: 400, statusMessage: 'symbol required' })

  const stocks = getAllStocks()
  if (!stocks.find((s) => s.symbol === symbol)) {
    throw createError({ statusCode: 404, statusMessage: 'Asset not found. Choose an asset from the supported list.' })
  }

  const data = await getSeasonalData(symbol)
  if (!data.profiles.length) throw createError({ statusCode: 404, statusMessage: `No data for ${symbol}` })

  const md = buildSeasonalMarkdown(data)
  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  return md
})
