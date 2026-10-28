export interface AllocationInput {
  code: string
  votes: number
}

export interface AllocationOptions {
  totalSeats?: number
  thresholdPct?: number
  /**
   * The denominator for the threshold. Defaults to the sum of party votes.
   * Pass the official valid-vote count when it differs by a handful of votes.
   */
  validVotes?: number
}

export interface AllocationResult {
  seats: Record<string, number>
  eligibleCodes: string[]
  thresholdVotes: number
  eligibleVotes: number
  quota: number
  baseSeats: Record<string, number>
  remainders: Record<string, number>
  leftoverSeats: number
  method: 'bader-offer-largest-remainder'
}

/**
 * Allocate Knesset seats using the Bader–Ofer rule.
 *
 * 1. Only lists at or above the electoral threshold participate.
 * 2. Each qualifying list receives floor(votes / quota) seats, where the quota
 *    is qualifying votes divided by 120.
 * 3. Remaining seats go to the largest remainders. This implementation does not
 *    apply the optional surplus-vote agreements signed between lists, so a
 *    final official result can differ by a seat or two.
 */
export function allocateSeats(
  parties: AllocationInput[],
  options: AllocationOptions = {},
): AllocationResult {
  const totalSeats = options.totalSeats ?? 120
  const thresholdPct = options.thresholdPct ?? 3.25
  const clean = parties
    .filter((party) => party.votes > 0)
    .map((party) => ({ code: party.code, votes: Math.max(0, Math.floor(party.votes)) }))

  const summedVotes = clean.reduce((sum, party) => sum + party.votes, 0)
  const validVotes = options.validVotes ?? summedVotes
  const thresholdVotes = (validVotes * thresholdPct) / 100
  const eligible = clean
    .filter((party) => party.votes + 1e-9 >= thresholdVotes)
    .sort((a, b) => b.votes - a.votes || a.code.localeCompare(b.code, 'he'))

  if (eligible.length === 0 || totalSeats <= 0) {
    return {
      seats: Object.fromEntries(clean.map((party) => [party.code, 0])),
      eligibleCodes: [],
      thresholdVotes,
      eligibleVotes: 0,
      quota: 0,
      baseSeats: {},
      remainders: {},
      leftoverSeats: 0,
      method: 'bader-offer-largest-remainder',
    }
  }

  const eligibleVotes = eligible.reduce((sum, party) => sum + party.votes, 0)
  const quota = eligibleVotes / totalSeats
  const seats: Record<string, number> = {}
  const baseSeats: Record<string, number> = {}
  const remainders: Record<string, number> = {}

  for (const party of eligible) {
    const exact = (party.votes * totalSeats) / eligibleVotes
    const base = Math.floor(exact + 1e-9)
    baseSeats[party.code] = base
    remainders[party.code] = exact - base
    seats[party.code] = base
  }

  let leftoverSeats = totalSeats - Object.values(seats).reduce((sum, n) => sum + n, 0)
  const byRemainder = [...eligible].sort(
    (a, b) =>
      remainders[b.code]! - remainders[a.code]! ||
      b.votes - a.votes ||
      a.code.localeCompare(b.code, 'he'),
  )

  let index = 0
  while (leftoverSeats > 0 && byRemainder.length > 0) {
    const party = byRemainder[index % byRemainder.length]!
    seats[party.code] = (seats[party.code] ?? 0) + 1
    leftoverSeats -= 1
    index += 1
  }

  for (const party of clean) {
    if (!(party.code in seats)) seats[party.code] = 0
  }

  return {
    seats,
    eligibleCodes: eligible.map((party) => party.code),
    thresholdVotes,
    eligibleVotes,
    quota,
    baseSeats,
    remainders,
    leftoverSeats: totalSeats - Object.values(baseSeats).reduce((sum, n) => sum + n, 0),
    method: 'bader-offer-largest-remainder',
  }
}

export function gallagherIndex(
  entries: Array<{ votePct: number; seatPct: number }>,
): number {
  const sum = entries.reduce(
    (total, entry) => total + (entry.votePct - entry.seatPct) ** 2,
    0,
  )
  return Math.sqrt(sum / 2)
}

export function effectiveNumberOfParties(shares: number[]): number {
  const total = shares.reduce((sum, share) => sum + share, 0)
  if (total <= 0) return 0
  const normalized = shares.map((share) => share / total)
  const sumSquares = normalized.reduce((sum, share) => sum + share ** 2, 0)
  return sumSquares > 0 ? 1 / sumSquares : 0
}
