import { describe, it, expect } from 'vitest'
import { fetchHistoricalData, computeSeasonal } from '../server/utils/seasonal'

describe('api pipeline', () => {
  it('fetch + compute returns profiles for real data', async () => {
    const rows = await fetchHistoricalData('AAPL')
    const res = computeSeasonal('AAPL', rows)
    expect(rows.length).toBeGreaterThan(0)
    expect(res.profiles.length).toBeGreaterThan(0)
  }, 30000)
})
