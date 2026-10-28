import type {
  BlocResult,
  CampResult,
  PartyResult,
  RawSnapshot,
  ResultsInsights,
  ResultsMeta,
  ResultsPayload,
} from '../../shared/election/types'
import {
  BLOC_ORDER,
  BLOCS,
  CAMPS,
  partyMeta,
} from '../../shared/election/parties'
import { ELECTION_CONFIG } from '../../shared/election/config'
import { buildComparison } from './history'
import {
  allocateSeats,
  effectiveNumberOfParties,
  gallagherIndex,
} from '../../shared/election/allocation'

const TOTAL_SEATS = ELECTION_CONFIG.totalSeats
const MAJORITY = ELECTION_CONFIG.majority
const THRESHOLD_PCT = ELECTION_CONFIG.thresholdPct

export function normalizeResults(raw: RawSnapshot, mode: 'live' | 'snapshot'): ResultsPayload {
  const rawParties = raw.parties
    .filter((party) => party.code !== '' && party.votes > 0)
    .map((party) => ({ ...party, votes: Math.max(0, Math.floor(party.votes)) }))

  const summedVotes = rawParties.reduce((sum, party) => sum + party.votes, 0)
  const validVotes = raw.totals.validVotes || summedVotes
  const allocation = allocateSeats(
    rawParties.map((party) => ({ code: party.code, votes: party.votes })),
    { totalSeats: TOTAL_SEATS, thresholdPct: THRESHOLD_PCT, validVotes },
  )

  const parties: PartyResult[] = rawParties
    .map((party) => {
      const meta = partyMeta(party.code)
      const seats = allocation.seats[party.code] ?? 0
      const votePct = (party.votes / validVotes) * 100
      const seatPct = (seats / TOTAL_SEATS) * 100
      return {
        ...meta,
        nameHe: meta.nameHe || party.nameHe || party.code,
        color: party.color || meta.color,
        votes: party.votes,
        votePct,
        passesThreshold: allocation.eligibleCodes.includes(party.code),
        seats,
        seatPct,
        representationGap: seatPct - votePct,
        votesPerSeat: seats > 0 ? party.votes / seats : null,
        rank: 0,
      }
    })
    .sort((a, b) => b.seats - a.seats || b.votes - a.votes)
    .map((party, index) => ({ ...party, rank: index + 1 }))

  const blocs: BlocResult[] = BLOC_ORDER.map((id) => {
    const members = parties.filter((party) => party.bloc === id)
    const votes = members.reduce((sum, party) => sum + party.votes, 0)
    const seats = members.reduce((sum, party) => sum + party.seats, 0)
    return {
      id,
      nameHe: BLOCS[id].nameHe,
      nameEn: BLOCS[id].nameEn,
      color: BLOCS[id].color,
      icon: BLOCS[id].icon,
      votes,
      votePct: validVotes > 0 ? (votes / validVotes) * 100 : 0,
      seats,
      seatPct: (seats / TOTAL_SEATS) * 100,
      partyCodes: members
        .filter((party) => party.votes > 0)
        .sort((a, b) => b.seats - a.seats || b.votes - a.votes)
        .map((party) => party.code),
    }
  }).filter((bloc) => bloc.partyCodes.length > 0)

  const camps: CampResult[] = (['netanyahu', 'change', 'unclear'] as const).map((id) => {
    const members = parties.filter((party) => party.camp === id)
    return {
      id,
      nameHe: CAMPS[id].nameHe,
      nameEn: CAMPS[id].nameEn,
      color: CAMPS[id].color,
      seats: members.reduce((sum, party) => sum + party.seats, 0),
      partyCodes: members
        .filter((party) => party.seats > 0)
        .sort((a, b) => b.seats - a.seats)
        .map((party) => party.code),
    }
  })

  const eligible = parties.filter((party) => party.passesThreshold)
  const belowThreshold = parties.filter((party) => !party.passesThreshold)
  const wastedVotes = belowThreshold.reduce((sum, party) => sum + party.votes, 0)
  const quota = allocation.eligibleVotes / TOTAL_SEATS
  const participants = parties.filter((party) => party.votes > 0)
  const largest = [...parties].sort((a, b) => b.seats - a.seats || b.votes - a.votes)[0]

  const insights: ResultsInsights = {
    thresholdVotes: allocation.thresholdVotes,
    wastedVotes,
    wastedPct: validVotes > 0 ? (wastedVotes / validVotes) * 100 : 0,
    wastedSeatsEquivalent: quota > 0 ? wastedVotes / quota : 0,
    quota,
    gallagher: gallagherIndex(
      participants.map((party) => ({ votePct: party.votePct, seatPct: party.seatPct })),
    ),
    effectivePartiesVotes: effectiveNumberOfParties(
      participants.map((party) => party.votePct),
    ),
    effectivePartiesSeats: effectiveNumberOfParties(parties.map((party) => party.seatPct)),
    eligibleParties: eligible.length,
    belowThresholdParties: belowThreshold.length,
    largestPartyCode: largest?.code ?? '',
    largestPartySeats: largest?.seats ?? 0,
    majority: MAJORITY,
    turnoutPct:
      raw.totals.eligibleVoters > 0
        ? (raw.totals.voters / raw.totals.eligibleVoters) * 100
        : 0,
    overrepresented: [...parties]
      .filter((party) => party.seats > 0 && party.representationGap > 0)
      .sort((a, b) => b.representationGap - a.representationGap)
      .slice(0, 4)
      .map((party) => ({ code: party.code, representationGap: party.representationGap })),
    underrepresented: [...parties]
      .filter((party) => party.representationGap < 0)
      .sort((a, b) => a.representationGap - b.representationGap)
      .slice(0, 4)
      .map((party) => ({ code: party.code, representationGap: party.representationGap })),
  }

  const meta: ResultsMeta = {
    election: ELECTION_CONFIG.election,
    titleHe: 'הבחירות לכנסת ה-26',
    titleEn: '26th Knesset election',
    date: ELECTION_CONFIG.date,
    generatedAt: raw.generatedAt,
    fetchedAt: new Date().toISOString(),
    mode,
    sourceName: raw.source.name,
    sourceUrl: raw.source.url,
    officialUrl: raw.source.officialUrl,
    thresholdPct: THRESHOLD_PCT,
    totalSeats: TOTAL_SEATS,
    eligibleVoters: raw.totals.eligibleVoters,
    stations: raw.totals.stations,
    stationsCounted: raw.totals.stationsCounted,
    voters: raw.totals.voters,
    validVotes,
    invalidVotes: raw.totals.invalidVotes,
    turnoutPct:
      raw.totals.eligibleVoters > 0
        ? (raw.totals.voters / raw.totals.eligibleVoters) * 100
        : 0,
  }

  return {
    meta,
    parties,
    blocs,
    camps,
    insights,
    comparison: buildComparison(parties, blocs, camps, insights, meta),
  }
}

