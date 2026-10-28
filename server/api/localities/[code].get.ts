import { getMunicipalData, getNeighborhoodData } from '../../utils/votes-data'
import { buildLocalityDetail } from '../../utils/localities'

export default defineCachedEventHandler(
  async (event) => {
    const code = getRouterParam(event, 'code') ?? ''
    if (!/^\d+$/.test(code)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid locality code' })
    }

    const [municipal, neighborhoods] = await Promise.all([
      getMunicipalData(),
      getNeighborhoodData(),
    ])
    const locality = buildLocalityDetail(municipal, code, neighborhoods)
    if (!locality) {
      throw createError({ statusCode: 404, statusMessage: 'Locality not found' })
    }
    return locality
  },
  {
    name: 'locality-detail',
    maxAge: 90,
    swr: false,
    getKey: (event) => getRequestURL(event).pathname,
  },
)
