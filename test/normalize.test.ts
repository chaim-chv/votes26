import { describe, expect, test } from 'bun:test'
import snapshot from '../server/data/snapshot.json'
import { normalizeResults } from '../server/utils/normalize'
import type { RawSnapshot } from '../shared/election/types'

const result = normalizeResults(snapshot as RawSnapshot, 'snapshot')

describe('normalizeResults', () => {
  test('normalizes the bundled snapshot', () => {
    expect(result.meta.election).toBe(26)
    expect(result.meta.mode).toBe('snapshot')
    expect(result.meta.totalSeats).toBe(120)
    expect(result.meta.stations).toBeGreaterThan(0)
    expect(result.meta.validVotes).toBeGreaterThan(2_900_000)
  })

  test('summary numbers agree', () => {
    expect(result.parties.reduce((sum, party) => sum + party.seats, 0)).toBe(120)
    expect(result.insights.eligibleParties).toBe(
      result.parties.filter((party) => party.passesThreshold).length,
    )
    expect(result.insights.belowThresholdParties).toBe(
      result.parties.filter((party) => !party.passesThreshold).length,
    )
    expect(result.blocs.reduce((sum, bloc) => sum + bloc.seats, 0)).toBe(120)
  })

  test('camps split the house without overlap', () => {
    const seats = result.camps.reduce((sum, camp) => sum + camp.seats, 0)
    expect(seats).toBe(120)
    expect(result.camps.every((camp) => camp.seats >= 0)).toBe(true)
  })

  test('includes parties below the threshold without giving them seats', () => {
    const below = result.parties.filter((party) => !party.passesThreshold)
    expect(below.length).toBeGreaterThan(0)
    expect(below.every((party) => party.seats === 0)).toBe(true)
    expect(result.insights.wastedVotes).toBe(
      below.reduce((sum, party) => sum + party.votes, 0),
    )
  })
})
