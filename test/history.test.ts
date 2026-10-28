import { describe, expect, test } from 'bun:test'
import snapshot from '../server/data/snapshot.json'
import { normalizeResults } from '../server/utils/normalize'
import { history, previousLocalityShare } from '../server/utils/history'
import type { RawSnapshot } from '../shared/election/types'

const result = normalizeResults(snapshot as RawSnapshot, 'snapshot')
const comparison = result.comparison!

describe('2022 comparison', () => {
  test('the historical baseline is complete', () => {
    expect(history.election).toBe(25)
    expect(history.parties.reduce((sum, party) => sum + party.seats, 0)).toBe(120)
    expect(history.totals.validVotes).toBeGreaterThan(4_000_000)
    expect(history.localities['9999']).toBeUndefined()
  })

  test('same parties use the published 2022 seats', () => {
    expect(comparison.parties['מחל']?.relation).toBe('same')
    expect(comparison.parties['מחל']?.previousSeats).toBe(32)
    expect(comparison.parties['מחל']?.seatChange).toBe(-6)
  })

  test('new and merged parties do not get a fake party-level delta', () => {
    expect(comparison.parties['דרך']?.relation).toBe('new')
    expect(comparison.parties['דרך']?.comparable).toBe(false)
    expect(comparison.parties['אמת']?.relation).toBe('merged')
    expect(comparison.parties['אמת']?.comparable).toBe(false)
    expect(comparison.parties['אמת']?.previousSeats).toBe(4)
    expect(comparison.parties['ט']?.groupId).toBe('rz-stream')
  })

  test('group comparisons and bloc/camp baselines are coherent', () => {
    expect(comparison.groups.find((group) => group.id === 'labor-meretz')?.previousSeats).toBe(4)
    expect(comparison.groups.find((group) => group.id === 'rz-stream')?.previousSeats).toBe(14)
    expect(comparison.groups.find((group) => group.id === 'joint-list')?.previousSeats).toBe(5)
    expect(comparison.camps.netanyahu.previousSeats).toBe(64)
    expect(comparison.camps.change.previousSeats).toBe(56)
    expect(comparison.blocs.right.previousSeats).toBe(52)
    expect(comparison.blocs.haredi.previousSeats).toBe(18)
    expect(comparison.blocs['center-left'].previousSeats).toBe(40)
    expect(comparison.blocs.arab.previousSeats).toBe(10)
  })

  test('locality shares are compared only for the same identity', () => {
    const same = previousLocalityShare('3000', 'מחל', 20)
    expect(same.previousVotePct).not.toBeNull()
    const newParty = previousLocalityShare('3000', 'דרך', 20)
    expect(newParty.previousVotePct).toBeNull()
  })
})
