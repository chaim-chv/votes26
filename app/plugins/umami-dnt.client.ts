export default defineNuxtPlugin(() => {
  const navigatorWithPrivacy = navigator as Navigator & {
    msDoNotTrack?: string
    globalPrivacyControl?: boolean
  }
  const dnt = navigatorWithPrivacy.doNotTrack ?? navigatorWithPrivacy.msDoNotTrack
  if (
    navigatorWithPrivacy.globalPrivacyControl === true ||
    dnt === '1' ||
    dnt === 'yes'
  ) {
    try {
      localStorage.setItem('umami.disabled', '1')
    } catch {
      // Storage can be unavailable in hardened browsers; do not break the page.
    }
  }
})
