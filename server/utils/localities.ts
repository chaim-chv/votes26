import { PARTY_META } from '../../shared/election/parties'
import type {
  LocalityDetail,
  LocalityParty,
  LocalitySummary,
  LocalityTopParty,
  NeighborhoodSummary,
  PartyLocalities,
  PartyLocality,
} from '../../shared/election/types'
import type {
  MunicipalData,
  NeighborhoodData,
  VoteFeature,
} from './votes-data'
import neighborhoodNamesJson from '../data/neighborhood-names.json'
import {
  previousLocalityShare,
  previousNeighborhoodShare,
  previousPartyLocalityShare,
} from './history'

type NeighborhoodName = {
  setlCode: string
  locality: string
  name: string
}

const neighborhoodNames = neighborhoodNamesJson as Record<string, NeighborhoodName>

const neighborhoodCounts = new Map<string, number>()
for (const item of Object.values(neighborhoodNames)) {
  if (!item.setlCode) continue
  neighborhoodCounts.set(item.setlCode, (neighborhoodCounts.get(item.setlCode) ?? 0) + 1)
}

const NON_PARTY_CODES = new Set(['', 'חיצוניות', 'קלפי אחרת'])

function number(value: unknown): number {
  return Number(value ?? 0) || 0
}

function partyCodes(data: MunicipalData | NeighborhoodData): string[] {
  return (data.parties ?? []).filter(
    (code) => code && !NON_PARTY_CODES.has(code) && Object.hasOwn(PARTY_META, code),
  )
}

function nationalTotals(data: MunicipalData) {
  const codes = partyCodes(data)
  const votes = new Map<string, number>()
  let validVotes = 0
  for (const feature of Object.values(data.features ?? {})) {
    validVotes += number(feature['כשרים'])
    for (const code of codes) {
      const current = votes.get(code) ?? 0
      votes.set(code, current + number(feature[code]))
    }
  }
  return { codes, votes, validVotes }
}

function topParty(feature: VoteFeature, codes: string[]): LocalityTopParty | null {
  const validVotes = number(feature['כשרים'])
  let best: { code: string; votes: number } | null = null
  for (const code of codes) {
    const votes = number(feature[code])
    if (!best || votes > best.votes) best = { code, votes }
  }
  if (!best || best.votes === 0) return null
  const meta = PARTY_META[best.code]!
  return {
    code: best.code,
    nameHe: meta.nameHe,
    nameEn: meta.nameEn,
    color: meta.color,
    votes: best.votes,
    votePct: validVotes > 0 ? (best.votes / validVotes) * 100 : 0,
  }
}

function localityParties(
  feature: VoteFeature,
  codes: string[],
  nationalVotes: Map<string, number>,
  nationalValidVotes: number,
): LocalityParty[] {
  const validVotes = number(feature['כשרים'])
  return codes
    .map((code) => {
      const meta = PARTY_META[code]!
      const votes = number(feature[code])
      const votePct = validVotes > 0 ? (votes / validVotes) * 100 : 0
      const nationalVotePct =
        nationalValidVotes > 0 ? ((nationalVotes.get(code) ?? 0) / nationalValidVotes) * 100 : 0
      return {
        code,
        nameHe: meta.nameHe,
        nameEn: meta.nameEn,
        ballot: meta.ballot,
        color: meta.color,
        bloc: meta.bloc,
        camp: meta.camp,
        votes,
        votePct,
        nationalVotePct,
        vsNational: votePct - nationalVotePct,
        previousVotePct: null,
        voteShareChange: null,
      }
    })
    .filter((party) => party.votes > 0)
    .sort((a, b) => b.votes - a.votes)
}

function turnout(voters: number, eligible: number) {
  return eligible > 0 ? (voters / eligible) * 100 : 0
}

export function buildLocalitySummaries(data: MunicipalData): LocalitySummary[] {
  const codes = partyCodes(data)
  return Object.entries(data.features ?? {})
    .map(([code, feature]) => {
      const voters = number(feature['מצביעים'])
      const validVotes = number(feature['כשרים'])
      const invalidVotes = number(feature['פסולים'])
      const eligibleVoters = number(feature['בזב'])
      return {
        code,
        name: feature['שם ישוב'] || `#${code}`,
        voters,
        validVotes,
        invalidVotes,
        eligibleVoters,
        turnoutPct: turnout(voters, eligibleVoters),
        topParty: topParty(feature, codes),
        neighborhoodCount: neighborhoodCounts.get(code) ?? 0,
      }
    })
    .filter((locality) => locality.voters > 0 || locality.validVotes > 0)
    .sort((a, b) => b.validVotes - a.validVotes || a.name.localeCompare(b.name, 'he'))
}

export function buildLocalityDetail(
  data: MunicipalData,
  code: string,
  neighborhoods: NeighborhoodData,
): LocalityDetail | null {
  const feature = data.features?.[code]
  if (!feature) return null

  const { codes, votes: nationalVotes, validVotes: nationalValidVotes } = nationalTotals(data)
  const voters = number(feature['מצביעים'])
  const validVotes = number(feature['כשרים'])
  const invalidVotes = number(feature['פסולים'])
  const eligibleVoters = number(feature['בזב'])
  const parties = localityParties(feature, codes, nationalVotes, nationalValidVotes).map(
    (party) => {
      const previous = previousLocalityShare(code, party.code, party.votePct)
      return { ...party, ...previous }
    },
  )

  const neighborhoodRows = Object.entries(neighborhoods.features ?? {})
    .map(([id, neighborhood]) => {
      const info = neighborhoodNames[id]
      if (!info || info.setlCode !== code) return null
      const nVoters = number(neighborhood['מצביעים'])
      const nValid = number(neighborhood['כשרים'])
      const nInvalid = number(neighborhood['פסולים'])
      return {
        id,
        name: info.name || `#${id}`,
        voters: nVoters,
        validVotes: nValid,
        invalidVotes: nInvalid,
        turnoutPct: turnout(nVoters, number(neighborhood['בזב'])),
        topParty: topParty(neighborhood, codes),
        parties: localityParties(neighborhood, codes, nationalVotes, nationalValidVotes)
          .slice(0, 5)
          .map((party) => {
            const previous = previousNeighborhoodShare(id, party.code, party.votePct)
            return { ...party, ...previous }
          }),
      } satisfies NeighborhoodSummary
    })
    .filter((row): row is NeighborhoodSummary => Boolean(row))
    .sort((a, b) => b.validVotes - a.validVotes)

  return {
    code,
    name: feature['שם ישוב'] || `#${code}`,
    voters,
    validVotes,
    invalidVotes,
    eligibleVoters,
    turnoutPct: turnout(voters, eligibleVoters),
    topParty: topParty(feature, codes),
    neighborhoodCount: neighborhoodRows.length,
    generatedAt: data.generated || new Date().toISOString(),
    parties,
    neighborhoods: neighborhoodRows,
  }
}

export function buildPartyLocalities(
  data: MunicipalData,
  code: string,
  minValidVotes = 50,
): PartyLocalities | null {
  if (!Object.hasOwn(PARTY_META, code)) return null

  let totalVotes = 0
  let localitiesScanned = 0
  const rows: PartyLocality[] = []
  for (const [localityCode, feature] of Object.entries(data.features ?? {})) {
    const votes = number(feature[code])
    const validVotes = number(feature['כשרים'])
    if (votes <= 0) continue
    localitiesScanned += 1
    totalVotes += votes
    const votePct = validVotes > 0 ? (votes / validVotes) * 100 : 0
    const previous = previousPartyLocalityShare(localityCode, code, votePct)
    rows.push({
      code: localityCode,
      name: feature['שם ישוב'] || `#${localityCode}`,
      votes,
      votePct,
      ...previous,
      validVotes,
      turnoutPct: turnout(number(feature['מצביעים']), number(feature['בזב'])),
    })
  }

  if (rows.length === 0) return null

  return {
    code,
    generatedAt: data.generated || new Date().toISOString(),
    totalVotes,
    localitiesScanned,
    minValidVotes,
    topByVotes: [...rows].sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, 'he')).slice(0, 12),
    topByShare: rows
      .filter((row) => row.validVotes >= minValidVotes)
      .sort((a, b) => b.votePct - a.votePct || b.votes - a.votes)
      .slice(0, 12),
  }
}
