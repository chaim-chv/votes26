export type VoteFeature = Record<string, string | number | undefined> & {
  'שם ישוב'?: string
  בזב?: number
  מצביעים?: number
  פסולים?: number
  כשרים?: number
}

export type MunicipalData = {
  generated?: string
  parties?: string[]
  totals?: {
    kalpi?: number
    kalpi_counted?: number
    votes_counted?: number
  }
  features?: Record<string, VoteFeature>
}

export type NeighborhoodData = {
  generated?: string
  parties?: string[]
  features?: Record<string, VoteFeature>
}

export type CatalogData = {
  elections?: Record<
    string,
    {
      title?: string
      parties?: Record<string, { name?: string; color?: string }>
    }
  >
}

const headers = {
  accept: 'application/json',
  referer: 'https://elections.govmap.gov.il/',
  'user-agent':
    'votes26/0.1 (+https://github.com/chaim-chv/votes26; open-source election results viewer)',
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(9_000),
  })
  if (!response.ok) {
    throw new Error(`Source answered ${response.status} for ${url}`)
  }
  return (await response.json()) as T
}

const CACHE_TTL_MS = 60_000
const cache = new Map<string, { at: number; value: unknown }>()

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as T
  const value = await loader()
  cache.set(key, { at: Date.now(), value })
  return value
}

export function getMunicipalData(): Promise<MunicipalData> {
  const config = useRuntimeConfig()
  return cached('municipal', () => getJson<MunicipalData>(config.votesSourceUrl))
}

export function getNeighborhoodData(): Promise<NeighborhoodData> {
  const config = useRuntimeConfig()
  return cached('neighborhood', () =>
    getJson<NeighborhoodData>(config.votesNeighborhoodUrl),
  )
}

export function getCatalog(): Promise<CatalogData> {
  const config = useRuntimeConfig()
  return cached('catalog', () =>
    getJson<CatalogData>(config.votesCatalogUrl).catch(() => ({}) as CatalogData),
  )
}
