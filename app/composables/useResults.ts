import type { ResultsPayload } from '~~/shared/election/types'

export const RESULTS_KEY = Symbol('votes26-results')

export function useResults() {
  const autoRefresh = useState<boolean>('votes26-auto-refresh', () => true)
  const refreshing = ref(false)
  const lastAttempt = ref<number>(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const { data, pending, error, refresh, status } = useFetch<ResultsPayload>('/api/results', {
    key: 'votes26-results',
    server: true,
    lazy: false,
  })

  const isLive = computed(() => data.value?.meta.mode === 'live')
  const hasData = computed(() => Boolean(data.value))
  const isStale = computed(() => {
    const fetched = data.value?.meta.fetchedAt
    if (!fetched) return false
    return Date.now() - new Date(fetched).getTime() > 10 * 60 * 1000
  })

  async function refreshNow() {
    if (refreshing.value) return
    refreshing.value = true
    lastAttempt.value = Date.now()
    try {
      await refresh()
    } finally {
      refreshing.value = false
    }
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function start() {
    stop()
    if (!autoRefresh.value) return
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refreshNow()
    }, 5 * 60 * 1000)
  }

  function onVisibilityChange() {
    if (document.visibilityState !== 'visible') return
    if (!autoRefresh.value) return
    if (Date.now() - lastAttempt.value > 5 * 60 * 1000) void refreshNow()
  }

  watch(autoRefresh, (enabled) => {
    if (enabled) start()
    else stop()
  })

  onMounted(() => {
    lastAttempt.value = Date.now()
    start()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    stop()
    if (import.meta.client) {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  })

  return {
    data,
    pending,
    error,
    status,
    isLive,
    hasData,
    isStale,
    refreshing,
    autoRefresh,
    refreshNow,
  }
}

export type ResultsState = ReturnType<typeof useResults>

export function useResultsState(): ResultsState {
  const injected = inject<ResultsState | null>(RESULTS_KEY, null)
  return injected ?? useResults()
}
