import { defineEventHandler } from 'h3'
import { getAllStocks, groupStocks } from '../utils/stocks'

export default defineEventHandler(() => groupStocks(getAllStocks()))
