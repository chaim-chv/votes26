import { getMunicipalData } from '../utils/votes-data'
import { buildLocalitySummaries } from '../utils/localities'

export default defineCachedEventHandler(
  async () => {
    const data = await getMunicipalData()
    const localities = buildLocalitySummaries(data)
    return {
      generatedAt: data.generated || new Date().toISOString(),
      total: localities.length,
      localities,
    }
  },
  {
    name: 'localities',
    maxAge: 90,
    swr: false,
    getKey: () => 'all',
  },
)
