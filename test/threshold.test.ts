import { describe, expect, test } from 'bun:test'
import snapshot from '../server/data/snapshot.json'
import { normalizeResults } from '../server/utils/normalize'
import { applyThreshold } from '../shared/election/threshold'
import type { RawSnapshot } from '../shared/election/types'

const results = normalizeResults(snapshot as RawSnapshot, 'snapshot')
const validVotes = results.meta.validVotes

describe('applyThreshold', () => {
  test('reproduces the current allocation at 3.25%', () => {
    const scenario = applyThreshold(results.parties, 3.25, validVotes)
    expect(scenario.parties.reduce((sum, party) => sum + party.seats, 0)).toBe(120)
    expect([...scenario.eligibleCodes].sort()).toEqual(
      results.parties
        .filter((party) => party.passesThreshold)
        .map((party) => party.code)
        .sort(),
    )
    expect(scenario.seats).toEqual(
      Object.fromEntries(results.parties.map((party) => [party.code, party.seats])),
    )
  })

  test('a zero threshold admits every party and still allocates 120 seats', () => {
    const scenario = applyThreshold(results.parties, 0, validVotes)
    expect(scenario.eligibleCodes.length).toBe(results.parties.length)
    expect(scenario.parties.reduce((sum, party) => sum + party.seats, 0)).toBe(120)
    expect(scenario.wastedVotes).toBe(0)
  })

  test('a higher threshold wastes more votes and reduces the eligible count', () => {
    const current = applyThreshold(results.parties, 3.25, validVotes)
    const higher = applyThreshold(results.parties, 6, validVotes)
    expect(higher.eligibleCodes.length).toBeLessThan(current.eligibleCodes.length)
    expect(higher.wastedVotes).toBeGreaterThan(current.wastedVotes)
    expect(higher.parties.reduce((sum, party) => sum + party.seats, 0)).toBe(120)
  })
})
