export function useFormat() {
  const { locale } = useLocale()
  const intlLocale = computed(() => (locale.value === 'he' ? 'he-IL' : 'en-US'))

  const numberFormatter = computed(
    () =>
      new Intl.NumberFormat(intlLocale.value, {
        maximumFractionDigits: 0,
      }),
  )

  const decimalFormatter = computed(
    () =>
      new Intl.NumberFormat(intlLocale.value, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
  )

  const percentFormatter = computed(
    () =>
      new Intl.NumberFormat(intlLocale.value, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
  )

  function number(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return '—'
    return numberFormatter.value.format(value)
  }

  function decimal(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return '—'
    return decimalFormatter.value.format(value)
  }

  function percent(value: number | null | undefined, digits = 1) {
    if (value == null || Number.isNaN(value)) return '—'
    const formatter =
      digits === 1
        ? percentFormatter.value
        : new Intl.NumberFormat(intlLocale.value, {
            style: 'percent',
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          })
    return formatter.format(value / 100)
  }

  function signedPercent(value: number | null | undefined, digits = 1) {
    if (value == null || Number.isNaN(value)) return '—'
    const sign = value > 0 ? '+' : ''
    return `${sign}${percent(value, digits)}`
  }

  function date(value: string | number | Date | null | undefined) {
    if (!value) return '—'
    const parsed = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return new Intl.DateTimeFormat(intlLocale.value, {
      dateStyle: 'medium',
      timeZone: 'Asia/Jerusalem',
    }).format(parsed)
  }

  function dateTime(value: string | number | Date | null | undefined) {
    if (!value) return '—'
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat(intlLocale.value, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Asia/Jerusalem',
    }).format(date)
  }

  function time(value: string | number | Date | null | undefined) {
    if (!value) return '—'
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat(intlLocale.value, {
      timeStyle: 'short',
      timeZone: 'Asia/Jerusalem',
    }).format(date)
  }

  function relative(value: string | number | Date | null | undefined) {
    if (!value) return '—'
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    const diffMinutes = Math.round((date.getTime() - Date.now()) / 60_000)
    const formatter = new Intl.RelativeTimeFormat(intlLocale.value, {
      numeric: 'auto',
    })
    if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute')
    const diffHours = Math.round(diffMinutes / 60)
    if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour')
    return formatter.format(Math.round(diffHours / 24), 'day')
  }

  return {
    number,
    decimal,
    percent,
    signedPercent,
    date,
    dateTime,
    time,
    relative,
  }
}
