/**
 * Election-wide constants.
 *
 * `eligibleVoters` comes from the Central Elections Committee national results
 * page (7,331,981 on 28 Oct 2026). The Govmap feed does not include it.
 */
export const ELECTION_CONFIG = {
  election: 26 as const,
  date: '2026-10-27',
  totalSeats: 120 as const,
  majority: 61 as const,
  thresholdPct: 3.25,
  eligibleVoters: 7_331_981,
} as const
