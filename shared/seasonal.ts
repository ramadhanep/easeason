export interface SeasonalPoint {
  day: number
  pct: number
  factor: number
}

export interface SeasonalProfile {
  id: string
  label: string
  years: number[]
  points: SeasonalPoint[]
}

export interface SeasonalMeta {
  symbol: string
  name: string
  currentPrice?: number
  firstYear?: number
  lastYear?: number
  currentYear: number
}

export interface SeasonalData {
  meta: SeasonalMeta
  profiles: SeasonalProfile[]
  currentYear?: { year: number; points: SeasonalPoint[] }
}

export const PROFILE_DESCRIPTION: Record<string, string> = {
  'all-years': 'Average seasonal path across every valid historical year.',
  'election': 'Average path across U.S. presidential election years (year % 4 == 0).',
  'pre-election': 'Average path across years before a presidential election (year % 4 == 3).',
  'mid-term': 'Average path across mid-term years (year % 4 == 2).',
  'post-election': 'Average path across years after a presidential election (year % 4 == 1).',
  'trump-years': 'Average path across the defined Trump-administration years.',
  'current-year': 'Direct cumulative return of the current year to date.',
}

export function profileDescription(id: string): string {
  return PROFILE_DESCRIPTION[id] ?? ''
}

function monthLabel(doy: number): string {
  const d = new Date(Date.UTC(2020, 0, 0))
  d.setUTCDate(d.getUTCDate() + doy)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtNum(n?: number): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
}

export function buildSeasonalMarkdown(data: SeasonalData): string {
  const lines: string[] = []
  const m = data.meta

  lines.push(`# ${m.symbol} — Historical Seasonality`)
  lines.push('')
  lines.push(`Asset: **${m.name}** (${m.symbol})`)
  lines.push(`Price: ${fmtNum(m.currentPrice)}`)
  lines.push(`Historical data range: ${m.firstYear ?? m.currentYear} – ${m.lastYear ?? m.currentYear}`)
  lines.push(`Current year: ${m.currentYear}`)
  lines.push('')

  lines.push('## Profiles')
  lines.push('')
  lines.push('| Profile | Years | Range |')
  lines.push('|---|---|---|')
  const profiles = [
    ...data.profiles,
    ...(data.currentYear ? [{ id: 'current-year', label: `${data.currentYear.year} YTD`, years: [data.currentYear.year], points: [] }] : []),
  ]
  for (const p of profiles) {
    const years = p.years.length ? p.years.join(', ') : '—'
    const range = p.years.length
      ? `${Math.min(...p.years)} – ${Math.max(...p.years)}`
      : '—'
    lines.push(`| ${p.label} | ${years} | ${range} |`)
  }
  lines.push('')

  for (const p of profiles) {
    lines.push(`### ${p.label}`)
    lines.push('')
    const desc = profileDescription(p.id)
    if (desc) lines.push(desc)
    if (p.years.length && p.id !== 'all-years') lines.push(`Years included: ${p.years.join(', ')}.`)
    lines.push('')
  }

  const allSeries: Array<{ label: string; points: SeasonalPoint[] }> = [
    ...data.profiles.map((p) => ({ label: p.label, points: p.points })),
    ...(data.currentYear ? [{ label: `${data.currentYear.year} YTD`, points: data.currentYear.points }] : []),
  ]

  const maxDays = Math.max(...allSeries.map((s) => s.points.length), 0)
  lines.push('## Seasonal Data')
  lines.push('')
  lines.push(
    'Each column shows cumulative % change over days 1–365 (Jan 1 → Dec 31). Values not available for an asset are blank.',
  )
  lines.push('')
  const header = ['| Day', 'Date', ...allSeries.map((s) => s.label)].join(' | ') + ' |'
  const sep = ['|:---', ':---', ...allSeries.map(() => '---')].join(' | ')
  lines.push(header)
  lines.push(sep + ' |')
  for (let day = 1; day <= maxDays; day++) {
    const row: string[] = [String(day), monthLabel(day)]
    for (const s of allSeries) {
      const pt = s.points.find((p) => p.day === day)
      row.push(pt ? `${pt.pct.toFixed(2)}%` : '')
    }
    lines.push(`| ${row.join(' | ')} |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('Historical statistics based on available market data. Not financial advice.')
  lines.push('Source: Yahoo Finance')

  return lines.join('\n')
}
