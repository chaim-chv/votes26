import type { RawSnapshot } from '../../shared/election/types'
import { ELECTION_CONFIG } from '../../shared/election/config'
import { PARTY_META } from '../../shared/election/parties'

const OFFICIAL_URL = 'https://votes26.bechirot.gov.il/nationalresults?lang=he'

type Feature = Record<string, string | number | undefined> & {
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
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(9_000),
  })
  if (!response.ok) {
    throw new Error(`Source answered ${response.status} for ${url}`)
  }
  return (await response.json()) as T
}

export async function fetchLiveSnapshot(): Promise<RawSnapshot> {
  const config = useRuntimeConfig()
  const dataUrl = config.votesSourceUrl
  const catalogUrl = config.votesCatalogUrl

  const [data, catalog] = await Promise.all([
    getJson<SourceData>(dataUrl),
    getJson<Catalog>(catalogUrl).catch(() => ({}) as Catalog),
  ])

  const features = Object.values(data.features ?? {})
  if (features.length === 0) throw new Error('Source returned no locality rows')

  const partyCodes = new Set<string>([
    ...Object.keys(catalog.elections?.['26']?.parties ?? {}),
    ...(data.parties ?? []),
    ...Object.keys(PARTY_META),
  ])
  partyCodes.delete('')

  type Totals = { voters: number; validVotes: number; invalidVotes: number }
  const totals = features.reduce<Totals>(
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
      const catalogParty = catalog.elections?.['26']?.parties?.[code]
      const meta = PARTY_META[code]
      const votes = features.reduce(
        (sum, feature) => sum + Number(feature[code] ?? 0),
        0,
      )
      return {
        code,
        nameHe: catalogParty?.name || meta?.nameHe || code,
        color: catalogParty?.color || meta?.color || '#64748b',
        votes,
      }
    })
    .filter((party) => party.votes > 0)
    .sort((a, b) => b.votes - a.votes)

  if (parties.length === 0) throw new Error('Source returned no party votes')

  return {
    version: 1,
    generatedAt: data.generated || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    source: {
      name: 'Govmap — Elections 2026',
      url: dataUrl,
      catalogUrl,
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
}
