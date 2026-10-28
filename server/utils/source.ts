import type { RawSnapshot } from '../../shared/election/types'
import { ELECTION_CONFIG } from '../../shared/election/config'
import { PARTY_META } from '../../shared/election/parties'
import {
  getCatalog,
  getMunicipalData,
  type MunicipalData,
} from './votes-data'

const OFFICIAL_URL = 'https://votes26.bechirot.gov.il/nationalresults?lang=he'

export async function fetchLiveSnapshot(): Promise<RawSnapshot> {
  const config = useRuntimeConfig()
  const [data, catalog] = await Promise.all([
    getMunicipalData(),
    getCatalog(),
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
      url: config.votesSourceUrl,
      catalogUrl: config.votesCatalogUrl,
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

export type { MunicipalData }
