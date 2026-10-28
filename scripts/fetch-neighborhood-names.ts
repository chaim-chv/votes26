/**
 * Build a compact id -> neighbourhood-name map from the Govmap TopoJSON.
 *
 * The neighbourhood vote rows are keyed by the geometry id but do not carry a
 * name. Names are static, so we save them once instead of downloading the
 * 1.3 MB geometry on every locality request.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const URL =
  process.env.NUXT_VOTES_NEIGHBORHOOD_GEOMETRY_URL ||
  process.env.VOTES_NEIGHBORHOOD_GEOMETRY_URL ||
  'https://elections.govmap.gov.il/data/votes/latest/neighborhood_geometry.topojson'

type Geometry = {
  properties?: {
    id?: number | string
    SETL_CODE?: number | string
    'שם ישוב'?: string
    neighborhood_name?: string
  }
}

type Topology = {
  objects?: {
    neighborhood?: { geometries?: Geometry[] }
  }
}

const response = await fetch(URL, {
  headers: {
    accept: 'application/json',
    referer: 'https://elections.govmap.gov.il/',
    'user-agent':
      'votes26/0.1 (+https://github.com/chaim-chv/votes26; open-source election results viewer)',
  },
})
if (!response.ok) throw new Error(`Geometry answered ${response.status}`)

const topology = (await response.json()) as Topology
const geometries = topology.objects?.neighborhood?.geometries ?? []
if (geometries.length === 0) throw new Error('Geometry contains no neighbourhoods')

const names: Record<string, { setlCode: string; locality: string; name: string }> = {}
for (const geometry of geometries) {
  const properties = geometry.properties
  if (!properties?.id) continue
  names[String(properties.id)] = {
    setlCode: String(properties.SETL_CODE ?? ''),
    locality: properties['שם ישוב'] ?? '',
    name: properties.neighborhood_name ?? properties['שם ישוב'] ?? '',
  }
}

const out = resolve(import.meta.dir, '../server/data/neighborhood-names.json')
await mkdir(dirname(out), { recursive: true })
await writeFile(out, `${JSON.stringify(names, null, 2)}\n`, 'utf8')
console.log(`Saved ${Object.keys(names).length} neighbourhood names to ${out}`)
