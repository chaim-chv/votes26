const umamiHost = process.env.NUXT_UMAMI_HOST || 'https://um.csp-monitor.com/'
const umamiId = process.env.NUXT_UMAMI_ID || '71213735-f0d9-4cd1-b61c-4e9ba5b8a134'

export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'nuxt-umami'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-10-01',
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  app: {
    head: {
      htmlAttrs: { lang: 'he', dir: 'rtl' },
      title: 'votes26 — תוצאות הבחירות לכנסת ה-26',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1d4ed8' },
        { name: 'color-scheme', content: 'light dark' },
        {
          name: 'description',
          content:
            'תצוגה נגישה וברורה של תוצאות הבחירות לכנסת ה-26: קולות, מנדטים, גושים ותובנות.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'votes26' },
        { property: 'og:locale', content: 'he_IL' },
        { name: 'twitter:card', content: 'summary' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  ui: {
    theme: {
      colors: ['primary', 'success', 'warning', 'error', 'neutral'],
    },
  },
  umami: {
    enabled: Boolean(umamiHost && umamiId),
    host: umamiHost,
    id: umamiId,
    proxy: 'cloak',
    autoTrack: true,
    ignoreLocalhost: true,
    domains: ['votes26.chv.ovh'],
    useDirective: false,
    logErrors: false,
    urlOptions: {
      trailingSlash: 'any',
      excludeSearch: false,
      excludeHash: true,
    },
  },
  runtimeConfig: {
    votesSourceUrl:
      process.env.NUXT_VOTES_SOURCE_URL ||
      process.env.VOTES_SOURCE_URL ||
      'https://elections.govmap.gov.il/data/votes/latest/municipal_data.json',
    votesCatalogUrl:
      process.env.NUXT_VOTES_CATALOG_URL ||
      process.env.VOTES_CATALOG_URL ||
      'https://elections.govmap.gov.il/data/votes/elections.json',
    votesNeighborhoodUrl:
      process.env.NUXT_VOTES_NEIGHBORHOOD_URL ||
      process.env.VOTES_NEIGHBORHOOD_URL ||
      'https://elections.govmap.gov.il/data/votes/latest/neighborhood_data.json',
  },
  typescript: {
    typeCheck: false,
  },
})
