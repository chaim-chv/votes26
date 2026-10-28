import type { PartyResult } from './types'
import { allocateSeats } from './allocation'

export interface ThresholdScenario {
  thresholdPct: number
  thresholdVotes: number
  eligibleCodes: string[]
  eligibleVotes: number
  wastedVotes: number
  wastedPct: number
  quota: number
  seats: Record<string, number>
  parties: PartyResult[]
}

/**
 * Re-run the seat allocation at a hypothetical threshold using the same
 * national vote totals. This is a simulation, not an official scenario.
 */
export function applyThreshold(
  parties: PartyResult[],
  thresholdPct: number,
  validVotes: number,
  totalSeats = 120,
): ThresholdScenario {
  const allocation = allocateSeats(
    parties.map((party) => ({ code: party.code, votes: party.votes })),
    { thresholdPct, validVotes, totalSeats },
  )

  const eligible = new Set(allocation.eligibleCodes)
  const updated = parties
    .map((party) => {
      const seats = allocation.seats[party.code] ?? 0
      const seatPct = (seats / totalSeats) * 100
      return {
        ...party,
        seats,
        passesThreshold: eligible.has(party.code),
        seatPct,
        seatDelta: seatPct - party.votePct,
        votesPerSeat: seats > 0 ? party.votes / seats : null,
      }
    })
    .sort((a, b) => b.seats - a.seats || b.votes - a.votes)
    .map((party, index) => ({ ...party, rank: index + 1 }))

  const wastedVotes = updated
    .filter((party) => !party.passesThreshold)
    .reduce((sum, party) => sum + party.votes, 0)

  return {
    thresholdPct,
    thresholdVotes: allocation.thresholdVotes,
    eligibleCodes: allocation.eligibleCodes,
    eligibleVotes: allocation.eligibleVotes,
    wastedVotes,
    wastedPct: validVotes > 0 ? (wastedVotes / validVotes) * 100 : 0,
    quota: totalSeats > 0 ? allocation.eligibleVotes / totalSeats : 0,
    seats: allocation.seats,
    parties: updated,
  }
}
