import type { Locale } from '~~/shared/election/types'
import { translate, type MessageKey } from '~/i18n/messages'

export function useLocale() {
  const locale = useCookie<Locale>('votes26-locale', {
    default: () => 'he',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  const isHe = computed(() => locale.value === 'he')
  const dir = computed(() => (isHe.value ? 'rtl' : 'ltr'))

  function t(key: MessageKey, params: Record<string, string | number> = {}) {
    return translate(locale.value, key, params)
  }

  function setLocale(next: Locale) {
    locale.value = next
  }

  function toggleLocale() {
    locale.value = isHe.value ? 'en' : 'he'
  }

  return { locale, isHe, dir, t, setLocale, toggleLocale }
}
