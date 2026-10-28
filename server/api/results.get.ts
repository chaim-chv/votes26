import type { RawSnapshot } from '../../shared/election/types'
import { fetchLiveSnapshot } from '../utils/source'
import { normalizeResults } from '../utils/normalize'
import snapshot from '../data/snapshot.json'

/**
 * National results.
 *
 * The live feed is preferred. If it is unreachable, the bundled snapshot is
 * returned with `meta.mode = "snapshot"` so the UI can say so plainly.
 */
export default defineCachedEventHandler(
  async (event) => {
    try {
      const live = await fetchLiveSnapshot()
      return normalizeResults(live, 'live')
    } catch (error) {
      console.warn('[votes26] live source unavailable; using snapshot', error)
      return normalizeResults(snapshot as RawSnapshot, 'snapshot')
    }
  },
  {
    name: 'national-results',
    maxAge: 90,
    swr: false,
    shouldBypassCache: (event) => getQuery(event).fresh === '1',
    getKey: () => 'national',
  },
)
