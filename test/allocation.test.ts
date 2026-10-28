import { describe, expect, test } from 'bun:test'
import {
  allocateSeats,
  effectiveNumberOfParties,
  gallagherIndex,
} from '../shared/election/allocation'

const finalVotes = [
  { code: 'מחל', votes: 607_519 },
  { code: 'דרך', votes: 490_877 },
  { code: 'רק', votes: 264_631 },
  { code: 'ודם', votes: 262_714 },
  { code: 'אמת', votes: 202_124 },
  { code: 'ג', votes: 200_220 },
  { code: 'ל', votes: 178_743 },
  { code: 'שס', votes: 168_101 },
  { code: 'ב', votes: 158_158 },
  { code: 'ט', votes: 143_963 },
  { code: 'עם', votes: 102_825 },
  { code: 'די', votes: 77_560 },
  { code: 'ך', votes: 48_550 },
]

describe('allocateSeats', () => {
  test('allocates 120 seats to the parties above 3.25%', () => {
    const result = allocateSeats(finalVotes)
    expect(result.eligibleCodes).toHaveLength(11)
    expect(result.eligibleCodes).not.toContain('די')
    expect(result.seats['די']).toBe(0)
    expect(Object.values(result.seats).reduce((sum, seats) => sum + seats, 0)).toBe(120)
    expect(result.seats).toEqual({
      מחל: 26,
      דרך: 21,
      רק: 11,
      ודם: 11,
      אמת: 9,
      ג: 9,
      ל: 8,
      שס: 7,
      ב: 7,
      ט: 6,
      עם: 5,
      די: 0,
      ך: 0,
    })
  })

  test('uses the valid-vote denominator for the threshold', () => {
    const result = allocateSeats(
      [
        { code: 'a', votes: 325 },
        { code: 'b', votes: 9_675 },
      ],
      { validVotes: 10_000 },
    )
    expect(result.eligibleCodes).toEqual(['b', 'a'])
    expect(result.thresholdVotes).toBe(325)
  })

  test('excludes a party just below the threshold', () => {
    const result = allocateSeats(
      [
        { code: 'a', votes: 324 },
        { code: 'b', votes: 9_676 },
      ],
      { validVotes: 10_000 },
    )
    expect(result.eligibleCodes).toEqual(['b'])
    expect(result.seats.a).toBe(0)
    expect(result.seats.b).toBe(120)
  })

  test('returns zero seats when no party qualifies', () => {
    const result = allocateSeats(
      [
        { code: 'a', votes: 1 },
        { code: 'b', votes: 2 },
      ],
      { validVotes: 100 },
    )
    expect(result.eligibleCodes).toEqual([])
    expect(Object.values(result.seats)).toEqual([0, 0])
    expect(result.quota).toBe(0)
  })

  test('breaks an exact remainder tie by votes', () => {
    const result = allocateSeats(
      [
        { code: 'a', votes: 2 },
        { code: 'b', votes: 2 },
        { code: 'c', votes: 1 },
      ],
      { validVotes: 5, totalSeats: 2, thresholdPct: 0 },
    )
    expect(result.seats.a + result.seats.b + result.seats.c).toBe(2)
    expect(result.seats.a).toBeGreaterThanOrEqual(result.seats.b)
  })
})

describe('proportionality helpers', () => {
  test('Gallagher index is zero for a perfectly proportional result', () => {
    expect(
      gallagherIndex([
        { votePct: 50, seatPct: 50 },
        { votePct: 50, seatPct: 50 },
      ]),
    ).toBe(0)
  })

  test('effective number of parties is 2 for two equal parties', () => {
    expect(effectiveNumberOfParties([50, 50])).toBeCloseTo(2)
    expect(effectiveNumberOfParties([100])).toBeCloseTo(1)
  })
})
