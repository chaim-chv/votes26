export type Locale = 'he' | 'en'

export type BlocId = 'right' | 'haredi' | 'center-left' | 'arab' | 'other'

export type CampId = 'netanyahu' | 'change' | 'unclear'

export type DataMode = 'live' | 'snapshot'

export interface PartyMeta {
  code: string
  nameHe: string
  nameEn: string
  fullNameHe?: string
  color: string
  ballot: string
  bloc: BlocId
  camp: CampId
  order: number
}

export interface RawPartyVotes {
  code: string
  nameHe?: string
  color?: string
  votes: number
}

export interface RawTotals {
  stations: number
  stationsCounted: number
  voters: number
  validVotes: number
  invalidVotes: number
  eligibleVoters: number
}

export interface RawSnapshot {
  version: number
  generatedAt: string
  fetchedAt: string
  source: {
    name: string
    url: string
    catalogUrl: string
    officialUrl: string
  }
  totals: RawTotals
  parties: RawPartyVotes[]
}

export interface PartyResult extends PartyMeta {
  votes: number
  votePct: number
  passesThreshold: boolean
  seats: number
  seatPct: number
  seatDelta: number
  votesPerSeat: number | null
  rank: number
}

export interface BlocResult {
  id: BlocId
  nameHe: string
  nameEn: string
  color: string
  icon: string
  votes: number
  votePct: number
  seats: number
  seatPct: number
  partyCodes: string[]
}

export interface CampResult {
  id: CampId
  nameHe: string
  nameEn: string
  color: string
  seats: number
  partyCodes: string[]
}

export interface CoalitionScenario {
  id: 'netanyahu' | 'change' | 'all'
  seats: number
  partyCodes: string[]
}

export interface ResultsInsights {
  thresholdVotes: number
  wastedVotes: number
  wastedPct: number
  wastedSeatsEquivalent: number
  quota: number
  gallagher: number
  effectivePartiesVotes: number
  effectivePartiesSeats: number
  eligibleParties: number
  belowThresholdParties: number
  largestPartyCode: string
  largestPartySeats: number
  majority: 61
  turnoutPct: number
  overrepresented: Array<{
    code: string
    seatDelta: number
  }>
  underrepresented: Array<{
    code: string
    seatDelta: number
  }>
}

export interface ResultsMeta {
  election: 26
  titleHe: string
  titleEn: string
  date: string
  generatedAt: string
  fetchedAt: string
  mode: DataMode
  sourceName: string
  sourceUrl: string
  officialUrl: string
  thresholdPct: number
  totalSeats: 120
  eligibleVoters: number
  stations: number
  stationsCounted: number
  voters: number
  validVotes: number
  invalidVotes: number
  turnoutPct: number
}

export interface ResultsPayload {
  meta: ResultsMeta
  parties: PartyResult[]
  blocs: BlocResult[]
  camps: CampResult[]
  insights: ResultsInsights
}
