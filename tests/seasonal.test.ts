import { describe, it, expect } from 'vitest'
import {
  getElectionCycleLabel,
  calculateDailyReturns,
  buildHirschProfile,
  buildCurrentYearProfile,
  TRUMP_YEARS,
} from '../server/utils/math'
import type { PriceRow } from '../server/utils/math'

describe('election cycle mapping', () => {
  it('maps year % 4 correctly', () => {
    expect(getElectionCycleLabel(2020)).toBe('Election')
    expect(getElectionCycleLabel(2021)).toBe('Post-Election')
    expect(getElectionCycleLabel(2022)).toBe('Mid-Term')
    expect(getElectionCycleLabel(2023)).toBe('Pre-Election')
  })

  it('keeps trump presidency years definition', () => {
    expect(TRUMP_YEARS).toEqual([2016, 2017, 2018, 2019, 2024, 2025])
  })
})

describe('daily returns', () => {
  it('computes day-over-day returns within same year', () => {
    const prices: PriceRow[] = [
      { year: 2020, doy: 1, price: 100 },
      { year: 2020, doy: 2, price: 110 },
      { year: 2020, doy: 3, price: 88 },
    ]
    const returns = calculateDailyReturns(prices)
    expect(returns).toHaveLength(2)
    expect(returns[0].ret).toBeCloseTo(0.1)
    expect(returns[1].ret).toBeCloseTo(-0.2)
  })

  it('does not bridge years (first row of year has no return)', () => {
    const prices: PriceRow[] = [
      { year: 2020, doy: 300, price: 100 },
      { year: 2021, doy: 1, price: 90 },
      { year: 2021, doy: 2, price: 99 },
    ]
    const returns = calculateDailyReturns(prices)
    expect(returns).toHaveLength(1)
    expect(returns[0].year).toBe(2021)
    expect(returns[0].doy).toBe(2)
    expect(returns[0].ret).toBeCloseTo(0.1)
  })

  it('groups same years together even when input order is interleaved', () => {
    const prices: PriceRow[] = [
      { year: 2020, doy: 2, price: 110 },
      { year: 2021, doy: 2, price: 20 },
      { year: 2020, doy: 1, price: 100 },
      { year: 2021, doy: 1, price: 10 },
    ]
    const returns = calculateDailyReturns(prices)
    expect(returns).toHaveLength(2)
    expect(returns[0]).toMatchObject({ year: 2020, doy: 2 })
    expect(returns[0].ret).toBeCloseTo(0.1)
    expect(returns[1]).toMatchObject({ year: 2021, doy: 2 })
    expect(returns[1].ret).toBeCloseTo(1)
  })
})

describe('profile aggregation', () => {
  it('compounds mean daily return into cumprod factor and pct', () => {
    const returns = [
      { doy: 1, year: 2020, ret: 0.1 },
      { doy: 2, year: 2020, ret: 0.2 },
    ]
    const points = buildHirschProfile(returns)
    expect(points).toHaveLength(2)
    expect(points[0].factor).toBeCloseTo(1.1)
    expect(points[0].pct).toBeCloseTo(10)
    expect(points[1].factor).toBeCloseTo(1.32)
    expect(points[1].pct).toBeCloseTo(32)
  })
})

describe('current year profile', () => {
  it('builds direct cumulative series for matching year only', () => {
    const returns = [
      { doy: 1, year: 2020, ret: 0.0 },
      { doy: 2, year: 2020, ret: 0.5 },
      { doy: 3, year: 2021, ret: 1.0 },
    ]
    const points = buildCurrentYearProfile(returns, 2020)
    expect(points.map((p) => p.day)).toEqual([1, 2])
    expect(points[0].factor).toBe(1)
    expect(points[1].factor).toBeCloseTo(1.5)
  })
})
