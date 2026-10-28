import historyJson from '../data/history/25.json'
import type {
  BlocComparison,
  CampComparison,
  ComparisonGroup,
  ComparisonMetric,
  ComparisonPayload,
  LocalityParty,
  PartyComparison,
  PartyResult,
  ResultsInsights,
  ResultsMeta,
} from '../../shared/election/types'
import {
  HISTORY_BLOC_BY_CODE,
  HISTORY_CAMP_BY_CODE,
  HISTORY_DATE,
  HISTORY_GROUPS,
  HISTORY_LABEL_EN,
  HISTORY_LABEL_HE,
  historyGroup,
  historyLink,
} from '../../shared/election/history'
import { effectiveNumberOfParties, gallagherIndex } from '../../shared/election/allocation'
import { ELECTION_CONFIG } from '../../shared/election/config'

export interface HistoryParty {
  code: string
  nameHe: string
  nameEn: string
  color: string
  votes: number
  votePct: number
  seats: number
  aboveThreshold: boolean
}

export interface HistoryLocality {
  nameHe: string
  voters: number
  validVotes: number
  invalidVotes: number
  eligibleVoters: number
  votes: Record<string, number>
}

export interface HistoryNeighborhood extends HistoryLocality {
  setlCode: string
  locality: string
}

export interface HistorySnapshot {
  election: 25
  date: string
  generatedAt: string
  totals: {
    eligibleVoters: number
    voters: number
    validVotes: number
    invalidVotes: number
    stations: number
    stationsCounted: number
    turnoutPct: number
  }
  parties: HistoryParty[]
  localities: Record<string, HistoryLocality>
  neighborhoods: Record<string, HistoryNeighborhood>
}

export const history = historyJson as unknown as HistorySnapshot
const historyPartyByCode = new Map(history.parties.map((party) => [party.code, party]))

function change(current: number, previous: number): ComparisonMetric {
  return { current, previous, change: current - previous }
}

function previousGroupValues(codes: string[]) {
  const parties = codes
    .map((code) => historyPartyByCode.get(code))
    .filter((party): party is HistoryParty => Boolean(party))
  const votes = parties.reduce((sum, party) => sum + party.votes, 0)
  return {
    seats: parties.reduce((sum, party) => sum + party.seats, 0),
    votes,
    votePct: history.totals.validVotes > 0 ? (votes / history.totals.validVotes) * 100 : 0,
  }
}

function partyComparison(party: PartyResult, parties: PartyResult[]): PartyComparison {
  const link = historyLink(party.code)
  if (link.relation === 'new') {
    return {
      relation: 'new',
      comparable: false,
      groupId: null,
      previousSeats: null,
      seatChange: null,
      previousVotes: null,
      voteChange: null,
      previousVotePct: null,
      voteShareChange: null,
      previousCodes: [],
    }
  }

  if (link.groupId) {
    const group = historyGroup(link.groupId)
    const previous = previousGroupValues(link.previousCodes)
    const currentParties = parties.filter((item) => group?.currentCodes.includes(item.code))
    const currentSeats = currentParties.reduce((sum, item) => sum + item.seats, 0)
    const currentVotes = currentParties.reduce((sum, item) => sum + item.votes, 0)
    const currentVotePct =
      parties.reduce((sum, item) => sum + item.votes, 0) > 0
        ? (currentVotes /
            parties.reduce((sum, item) => sum + item.votes, 0)) *
          100
        : 0
    return {
      relation: link.relation,
      comparable: false,
      groupId: link.groupId,
      previousSeats: previous.seats,
      seatChange: currentSeats - previous.seats,
      previousVotes: previous.votes,
      voteChange: currentVotes - previous.votes,
      previousVotePct: previous.votePct,
      voteShareChange: currentVotePct - previous.votePct,
      previousCodes: link.previousCodes,
      noteHe: link.noteHe,
      noteEn: link.noteEn,
    }
  }

  const previous = link.previousCodes
    .map((code) => historyPartyByCode.get(code))
    .filter((item): item is HistoryParty => Boolean(item))
  if (previous.length === 0) {
    return {
      relation: 'new',
      comparable: false,
      groupId: null,
      previousSeats: null,
      seatChange: null,
      previousVotes: null,
      voteChange: null,
      previousVotePct: null,
      voteShareChange: null,
      previousCodes: [],
    }
  }
  const previousSeats = previous.reduce((sum, item) => sum + item.seats, 0)
  const previousVotes = previous.reduce((sum, item) => sum + item.votes, 0)
  const previousVotePct =
    history.totals.validVotes > 0 ? (previousVotes / history.totals.validVotes) * 100 : 0
  return {
    relation: link.relation,
    comparable: true,
    groupId: null,
    previousSeats,
    seatChange: party.seats - previousSeats,
    previousVotes,
    voteChange: party.votes - previousVotes,
    previousVotePct,
    voteShareChange: party.votePct - previousVotePct,
    previousCodes: link.previousCodes,
    noteHe: link.noteHe,
    noteEn: link.noteEn,
  }
}

function buildGroups(parties: PartyResult[]): ComparisonGroup[] {
  return HISTORY_GROUPS.map((group) => {
    const current = parties.filter((party) => group.currentCodes.includes(party.code))
    const previous = previousGroupValues(group.previousCodes)
    const currentSeats = current.reduce((sum, party) => sum + party.seats, 0)
    const currentVotes = current.reduce((sum, party) => sum + party.votes, 0)
    const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0)
    const currentVotePct = totalVotes > 0 ? (currentVotes / totalVotes) * 100 : 0
    return {
      id: group.id,
      nameHe: group.nameHe,
      nameEn: group.nameEn,
      currentCodes: group.currentCodes,
      previousCodes: group.previousCodes,
      currentSeats,
      previousSeats: previous.seats,
      seatChange: currentSeats - previous.seats,
      currentVotes,
      previousVotes: previous.votes,
      voteChange: currentVotes - previous.votes,
      currentVotePct,
      previousVotePct: previous.votePct,
      voteShareChange: currentVotePct - previous.votePct,
    }
  })
}

function previousSystem() {
  const validVotes = history.totals.validVotes
  const thresholdVotes = (validVotes * ELECTION_CONFIG.thresholdPct) / 100
  const eligible = history.parties.filter((party) => party.votes >= thresholdVotes)
  const wastedVotes = validVotes - eligible.reduce((sum, party) => sum + party.votes, 0)
  return {
    wastedPct: validVotes > 0 ? (wastedVotes / validVotes) * 100 : 0,
    gallagher: gallagherIndex(
      history.parties.map((party) => ({
        votePct: party.votePct,
        seatPct: (party.seats / ELECTION_CONFIG.totalSeats) * 100,
      })),
    ),
    effectivePartiesSeats: effectiveNumberOfParties(
      history.parties.map((party) => (party.seats / ELECTION_CONFIG.totalSeats) * 100),
    ),
    eligibleParties: eligible.length,
  }
}

function buildBlocs(blocs: Array<{ id: string; seats: number; votePct: number }>) {
  const result = {} as Record<string, BlocComparison>
  const previous = previousSystem()
  void previous
  for (const bloc of blocs) {
    const members = history.parties.filter(
      (party) => HISTORY_BLOC_BY_CODE[party.code] === bloc.id,
    )
    const previousSeats = members.reduce((sum, party) => sum + party.seats, 0)
    const previousVotes = members.reduce((sum, party) => sum + party.votes, 0)
    const previousVotePct =
      history.totals.validVotes > 0 ? (previousVotes / history.totals.validVotes) * 100 : 0
    result[bloc.id] = {
      previousSeats,
      seatChange: bloc.seats - previousSeats,
      previousVotePct,
      voteShareChange: bloc.votePct - previousVotePct,
    }
  }
  return result
}

function buildCamps(camps: Array<{ id: string; seats: number }>) {
  const result = {} as Record<string, CampComparison>
  for (const camp of camps) {
    const previousSeats = history.parties
      .filter((party) => HISTORY_CAMP_BY_CODE[party.code] === camp.id)
      .reduce((sum, party) => sum + party.seats, 0)
    result[camp.id] = { previousSeats, seatChange: camp.seats - previousSeats }
  }
  return result
}

export function buildComparison(
  parties: PartyResult[],
  blocs: Array<{ id: string; seats: number; votePct: number }>,
  camps: Array<{ id: string; seats: number }>,
  insights: ResultsInsights,
  meta: ResultsMeta,
): ComparisonPayload {
  const previous = previousSystem()
  const comparisons = Object.fromEntries(
    parties.map((party) => [party.code, partyComparison(party, parties)]),
  )
  return {
    against: 25,
    labelHe: HISTORY_LABEL_HE,
    labelEn: HISTORY_LABEL_EN,
    previousStatus: 'final',
    currentStatus: 'provisional',
    turnout: change(meta.turnoutPct, history.totals.turnoutPct),
    validVotes: change(meta.validVotes, history.totals.validVotes),
    parties: comparisons,
    groups: buildGroups(parties),
    blocs: buildBlocs(blocs) as ComparisonPayload['blocs'],
    camps: buildCamps(camps) as ComparisonPayload['camps'],
    system: {
      wastedPct: change(insights.wastedPct, previous.wastedPct),
      gallagher: change(insights.gallagher, previous.gallagher),
      effectivePartiesSeats: change(
        insights.effectivePartiesSeats,
        previous.effectivePartiesSeats,
      ),
      eligibleParties: change(insights.eligibleParties, previous.eligibleParties),
    },
    noteHe: `${HISTORY_LABEL_HE} · תוצאות סופיות. 2026 · ספירה זמנית; המנדטים של 2026 מחושבים, והמנדטים של 2022 רשמיים.`,
    noteEn: `${HISTORY_LABEL_EN} · final results. 2026 · counted so far; 2026 seats are calculated, 2022 seats are official.`,
  }
}

export function previousLocalityShare(
  localityCode: string,
  partyCode: string,
  currentVotePct: number,
): { previousVotePct: number | null; voteShareChange: number | null } {
  const link = historyLink(partyCode)
  if (link.relation !== 'same') return { previousVotePct: null, voteShareChange: null }
  const locality = history.localities[localityCode]
  if (!locality) return { previousVotePct: null, voteShareChange: null }
  const votes = link.previousCodes.reduce((sum, code) => sum + (locality.votes[code] ?? 0), 0)
  const previousVotePct =
    locality.validVotes > 0 ? (votes / locality.validVotes) * 100 : 0
  return { previousVotePct, voteShareChange: currentVotePct - previousVotePct }
}

export function previousNeighborhoodShare(
  neighborhoodId: string,
  partyCode: string,
  currentVotePct: number,
): { previousVotePct: number | null; voteShareChange: number | null } {
  const link = historyLink(partyCode)
  if (link.relation !== 'same') return { previousVotePct: null, voteShareChange: null }
  const neighborhood = history.neighborhoods[neighborhoodId]
  if (!neighborhood) return { previousVotePct: null, voteShareChange: null }
  const votes = link.previousCodes.reduce(
    (sum, code) => sum + (neighborhood.votes[code] ?? 0),
    0,
  )
  const previousVotePct =
    neighborhood.validVotes > 0 ? (votes / neighborhood.validVotes) * 100 : 0
  return { previousVotePct, voteShareChange: currentVotePct - previousVotePct }
}

export function previousPartyLocalityShare(
  localityCode: string,
  partyCode: string,
  currentVotePct: number,
) {
  return previousLocalityShare(localityCode, partyCode, currentVotePct)
}

export function withLocalityComparison(party: LocalityParty, localityCode: string): LocalityParty {
  const previous = previousLocalityShare(localityCode, party.code, party.votePct)
  return { ...party, ...previous }
}

export {
  HISTORY_DATE,
  HISTORY_LABEL_HE,
  HISTORY_LABEL_EN,
}
