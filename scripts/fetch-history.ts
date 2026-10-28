/**
 * Snapshot the 25th Knesset result for comparison.
 *
 * The feed has vote rows and locality/neighbourhood data, but no official seat
 * counts. Official 2022 seats are stored explicitly below.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { PARTY_META } from '../shared/election/parties'

const BASE = 'https://elections.govmap.gov.il/data/votes'
const DATA_URL = `${BASE}/25/municipal_data.json`
const NEIGHBORHOOD_URL = `${BASE}/25/neighborhood_data.json`
const GEOMETRY_URL = `${BASE}/25/neighborhood_geometry.topojson`
const OFFICIAL_ELIGIBLE = 6_785_290

const OFFICIAL_SEATS: Record<string, number> = {
  מחל: 32,
  פה: 24,
  ט: 14,
  כן: 12,
  שס: 11,
  ג: 7,
  ל: 6,
  עם: 5,
  ום: 5,
  אמת: 4,
}

const NAMES: Record<string, { he: string; en: string }> = {
  מחל: { he: 'הליכוד', en: 'Likud' },
  פה: { he: 'יש עתיד', en: 'Yesh Atid' },
  ט: { he: 'הציונות הדתית', en: 'Religious Zionism' },
  כן: { he: 'המחנה הממלכתי', en: 'National Unity' },
  שס: { he: 'ש"ס', en: 'Shas' },
  ג: { he: 'יהדות התורה', en: 'United Torah Judaism' },
  ל: { he: 'ישראל ביתנו', en: 'Yisrael Beiteinu' },
  עם: { he: 'רע"ם', en: "Ra'am" },
  ום: { he: 'חד"ש-תע"ל', en: "Hadash–Ta'al" },
  אמת: { he: 'העבודה', en: 'Labor' },
  מרץ: { he: 'מרצ', en: 'Meretz' },
  ד: { he: 'בל"ד', en: 'Balad' },
}

type Feature = Record<string, string | number | undefined>

type Data = {
  generated?: string
  parties?: string[]
  features?: Record<string, Feature>
  totals?: { kalpi?: number; kalpi_counted?: number }
}

type Geometry = {
  properties?: { id?: number | string; SETL_CODE?: number | string; 'שם ישוב'?: string; neighborhood_name?: string }
}

const headers = {
  accept: 'application/json',
  referer: 'https://elections.govmap.gov.il/',
  'user-agent': 'votes26/0.1 (+https://github.com/chaim-chv/votes26)',
}

async function json<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return (await response.json()) as T
}

const [data, neighborhoodData, geometry] = await Promise.all([
  json<Data>(DATA_URL),
  json<Data>(NEIGHBORHOOD_URL),
  json<{ objects?: { neighborhood?: { geometries?: Geometry[] } } }>(GEOMETRY_URL),
])

const featureValues = Object.values(data.features ?? {})
const partyCodes = new Set<string>((data.parties ?? []).filter(Boolean))
const totals = featureValues.reduce(
  (acc, feature) => {
    acc.voters += Number(feature['מצביעים'] ?? 0)
    acc.validVotes += Number(feature['כשרים'] ?? 0)
    acc.invalidVotes += Number(feature['פסולים'] ?? 0)
    return acc
  },
  { voters: 0, validVotes: 0, invalidVotes: 0 },
)

function nameOf(code: string) {
  return NAMES[code] ?? { he: PARTY_META[code]?.nameHe ?? code, en: PARTY_META[code]?.nameEn ?? code }
}

const parties = [...partyCodes]
  .map((code) => {
    const votes = featureValues.reduce((sum, feature) => sum + Number(feature[code] ?? 0), 0)
    const meta = PARTY_META[code]
    const name = nameOf(code)
    return {
      code,
      nameHe: name.he,
      nameEn: name.en,
      color: meta?.color ?? '#64748b',
      votes,
      votePct: totals.validVotes ? (votes / totals.validVotes) * 100 : 0,
      seats: OFFICIAL_SEATS[code] ?? 0,
      aboveThreshold: (OFFICIAL_SEATS[code] ?? 0) > 0,
    }
  })
  .filter((party) => party.votes > 0)
  .sort((a, b) => b.votes - a.votes)

const localities: Record<string, unknown> = {}
for (const [code, feature] of Object.entries(data.features ?? {})) {
  if (code === '9999') continue
  const votes: Record<string, number> = {}
  for (const party of parties) {
    const count = Number(feature[party.code] ?? 0)
    if (count > 0) votes[party.code] = count
  }
  localities[code] = {
    nameHe: feature['שם ישוב'] || code,
    voters: Number(feature['מצביעים'] ?? 0),
    validVotes: Number(feature['כשרים'] ?? 0),
    invalidVotes: Number(feature['פסולים'] ?? 0),
    eligibleVoters: Number(feature['בזב'] ?? 0),
    votes,
  }
}

const geometryById = new Map<string, Geometry['properties']>()
for (const item of geometry.objects?.neighborhood?.geometries ?? []) {
  if (item.properties?.id) geometryById.set(String(item.properties.id), item.properties)
}

const neighborhoods: Record<string, unknown> = {}
for (const [id, feature] of Object.entries(neighborhoodData.features ?? {})) {
  const info = geometryById.get(id)
  if (!info) continue
  const votes: Record<string, number> = {}
  for (const party of parties) {
    const count = Number(feature[party.code] ?? 0)
    if (count > 0) votes[party.code] = count
  }
  neighborhoods[id] = {
    setlCode: String(info.SETL_CODE ?? ''),
    locality: info['שם ישוב'] ?? '',
    nameHe: info.neighborhood_name ?? info['שם ישוב'] ?? '',
    voters: Number(feature['מצביעים'] ?? 0),
    validVotes: Number(feature['כשרים'] ?? 0),
    invalidVotes: Number(feature['פסולים'] ?? 0),
    votes,
  }
}

const snapshot = {
  version: 1,
  election: 25,
  date: '2022-11-01',
  titleHe: 'הבחירות לכנסת ה-25',
  titleEn: '2022 Knesset election',
  generatedAt: data.generated || new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  source: DATA_URL,
  totals: {
    eligibleVoters: OFFICIAL_ELIGIBLE,
    voters: totals.voters,
    validVotes: totals.validVotes,
    invalidVotes: totals.invalidVotes,
    stations: Number(data.totals?.kalpi ?? 0),
    stationsCounted: Number(data.totals?.kalpi_counted ?? 0),
    turnoutPct: (totals.voters / OFFICIAL_ELIGIBLE) * 100,
  },
  parties,
  localities,
  neighborhoods,
  excluded: { pseudoLocalities: ['9999'] },
}

const out = resolve(import.meta.dir, '../server/data/history/25.json')
await mkdir(dirname(out), { recursive: true })
await writeFile(out, `${JSON.stringify(snapshot)}\n`, 'utf8')
console.log(`Saved 2022 history: ${parties.length} parties, ${Object.keys(localities).length} localities, ${Object.keys(neighborhoods).length} neighbourhoods`)
