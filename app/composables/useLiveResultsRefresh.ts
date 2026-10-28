/**
 * Re-fetch page-level, server-cached data when the shared national result
 * refresh lands. Keeps a locality or party page from silently staying on an
 * older feed than the header and the national views.
 */
export function useLiveResultsRefresh(refresh: () => Promise<unknown>) {
  const { data } = useResultsState()

  watch(
    () => data.value?.meta.fetchedAt,
    (next, previous) => {
      if (!next || !previous || next === previous) return
      void refresh()
    },
  )
}
