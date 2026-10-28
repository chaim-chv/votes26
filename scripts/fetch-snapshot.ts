/**
 * Refresh the bundled fallback snapshot from the official Govmap feed.
 *
 * Run with `bun run snapshot` while the feed is reachable. The app keeps this
 * file in the repository so a network failure never leaves the UI empty.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { ELECTION_CONFIG } from '../shared/election/config'
import { PARTY_META, partyMeta } from '../shared/election/parties'
import type { RawSnapshot } from '../shared/election/types'

const DATA_URL =
  process.env.VOTES_SOURCE_URL ||
  'https://elections.govmap.gov.il/data/votes/latest/municipal_data.json'
const CATALOG_URL =
  process.env.VOTES_CATALOG_URL ||
  'https://elections.govmap.gov.il/data/votes/elections.json'
const OFFICIAL_URL = 'https://votes26.bechirot.gov.il/nationalresults?lang=he'

type Feature = Record<string, string | number | undefined> & {
  'שם ישוב'?: string
  בזב?: number
  מצביעים?: number
  פסולים?: number
  כשרים?: number
}

type SourceData = {
  generated?: string
  parties?: string[]
  totals?: {
    kalpi?: number
    kalpi_counted?: number
    votes_counted?: number
  }
  features?: Record<string, Feature>
}

type Catalog = {
  elections?: Record<
    string,
    {
      title?: string
      parties?: Record<string, { name?: string; color?: string }>
    }
  >
}

const headers = {
  accept: 'application/json',
  referer: 'https://elections.govmap.gov.il/',
  'user-agent':
    'votes26/0.1 (+https://github.com/chaim-chv/votes26; open-source election results viewer)',
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return (await response.json()) as T
}

const [data, catalog] = await Promise.all([
  getJson<SourceData>(DATA_URL),
  getJson<Catalog>(CATALOG_URL).catch(() => ({}) as Catalog),
])

const features = Object.values(data.features ?? {})
const partyCodes = new Set<string>([
  ...Object.keys(catalog.elections?.['26']?.parties ?? {}),
  ...(data.parties ?? []),
  ...Object.keys(PARTY_META),
])
partyCodes.delete('')

const totals = features.reduce(
  (acc, feature) => {
    acc.voters += Number(feature['מצביעים'] ?? 0)
    acc.validVotes += Number(feature['כשרים'] ?? 0)
    acc.invalidVotes += Number(feature['פסולים'] ?? 0)
    return acc
  },
  { voters: 0, validVotes: 0, invalidVotes: 0 },
)

const parties = [...partyCodes]
  .map((code) => {
    const meta = partyMeta(code)
    const catalogParty = catalog.elections?.['26']?.parties?.[code]
    const votes = features.reduce((sum, feature) => sum + Number(feature[code] ?? 0), 0)
    return {
      code,
      nameHe: catalogParty?.name || meta.nameHe,
      color: catalogParty?.color || meta.color,
      votes,
    }
  })
  .filter((party) => party.votes > 0)
  .sort((a, b) => b.votes - a.votes)

const snapshot: RawSnapshot = {
  version: 1,
  generatedAt: data.generated || new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  source: {
    name: 'Govmap — Elections 2026',
    url: DATA_URL,
    catalogUrl: CATALOG_URL,
    officialUrl: OFFICIAL_URL,
  },
  totals: {
    stations: Number(data.totals?.kalpi ?? 0),
    stationsCounted: Number(data.totals?.kalpi_counted ?? 0),
    voters: totals.voters,
    validVotes: totals.validVotes,
    invalidVotes: totals.invalidVotes,
    eligibleVoters: ELECTION_CONFIG.eligibleVoters,
  },
  parties,
}

const out = resolve(import.meta.dir, '../server/data/snapshot.json')
await mkdir(dirname(out), { recursive: true })
await writeFile(out, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

console.log(
  `Saved ${parties.length} parties, ${totals.validVotes.toLocaleString('en-US')} valid votes to ${out}`,
)
