import { describe, expect, test } from 'bun:test'
import {
  buildLocalityDetail,
  buildLocalitySummaries,
  buildPartyLocalities,
} from '../server/utils/localities'
import type { MunicipalData, NeighborhoodData } from '../server/utils/votes-data'

const municipal: MunicipalData = {
  generated: '2026-10-28T10:00:00+00:00',
  parties: ['מחל', 'דרך', ''],
  features: {
    '4013': {
      'שם ישוב': 'אורטל',
      בזב: 300,
      מצביעים: 200,
      פסולים: 2,
      כשרים: 198,
      מחל: 80,
      דרך: 118,
    },
    '5000': {
      'שם ישוב': 'תל אביב - יפו',
      בזב: 1000,
      מצביעים: 600,
      פסולים: 5,
      כשרים: 595,
      מחל: 200,
      דרך: 395,
    },
  },
}

const neighborhoods: NeighborhoodData = {
  parties: ['מחל', 'דרך'],
  features: {
    '4693': {
      בזב: 300,
      מצביעים: 200,
      פסולים: 2,
      כשרים: 198,
      מחל: 80,
      דרך: 118,
    },
  },
}

describe('locality helpers', () => {
  test('summarises localities with a leading party and turnout', () => {
    const summaries = buildLocalitySummaries(municipal)
    expect(summaries).toHaveLength(2)
    const telAviv = summaries.find((item) => item.code === '5000')!
    expect(telAviv.name).toBe('תל אביב - יפו')
    expect(telAviv.validVotes).toBe(595)
    expect(telAviv.topParty?.code).toBe('דרך')
    expect(telAviv.topParty?.votes).toBe(395)
    expect(telAviv.turnoutPct).toBeCloseTo(60)
  })

  test('builds a locality detail and joins named neighbourhoods', () => {
    const detail = buildLocalityDetail(municipal, '4013', neighborhoods)
    expect(detail).not.toBeNull()
    expect(detail?.name).toBe('אורטל')
    expect(detail?.parties[0]?.code).toBe('דרך')
    expect(detail?.parties[0]?.nationalVotePct).toBeGreaterThan(0)
    expect(detail?.neighborhoods).toHaveLength(1)
    expect(detail?.neighborhoods[0]?.name).toBe('אורטל')
    expect(detail?.neighborhoods[0]?.topParty?.code).toBe('דרך')
  })

  test('returns null for an unknown locality', () => {
    expect(buildLocalityDetail(municipal, '99999', neighborhoods)).toBeNull()
  })

  test('finds a party’s strongest localities by votes and share', () => {
    const profile = buildPartyLocalities(municipal, 'דרך', 50)
    expect(profile).not.toBeNull()
    expect(profile?.totalVotes).toBe(513)
    expect(profile?.topByVotes[0]?.code).toBe('5000')
    expect(profile?.topByShare[0]?.code).toBe('5000')
  })
})
