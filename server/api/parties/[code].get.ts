import { getMunicipalData } from '../../utils/votes-data'
import { buildPartyLocalities } from '../../utils/localities'

export default defineCachedEventHandler(
  async (event) => {
    const code = getRouterParam(event, 'code') ?? ''
    if (!code) {
      throw createError({ statusCode: 400, statusMessage: 'Missing party code' })
    }

    const data = await getMunicipalData()
    const profile = buildPartyLocalities(data, code)
    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: 'Party not found' })
    }
    return profile
  },
  {
    name: 'party-localities',
    maxAge: 90,
    swr: false,
    getKey: (event) => getRequestURL(event).pathname,
  },
)
