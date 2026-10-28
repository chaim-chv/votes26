import { expect, test } from '@playwright/test'

const hebrewTitles: Array<[string, string]> = [
  ['/', 'תמונת מצב · votes26'],
  ['/mandates', 'מנדטים · votes26'],
  ['/votes', 'קולות · votes26'],
  ['/blocs', 'גושים · votes26'],
  ['/localities', 'יישובים · votes26'],
  ['/localities/3000', 'ירושלים · יישובים · votes26'],
  ['/parties/%D7%9E%D7%97%D7%9C', 'הליכוד · votes26'],
  ['/insights', 'תובנות · votes26'],
  ['/method', 'שיטה ומקורות · votes26'],
  ['/privacy', 'פרטיות · votes26'],
]

const englishTitles: Array<[string, string]> = [
  ['/', 'Overview · votes26'],
  ['/mandates', 'Seats · votes26'],
  ['/votes', 'Votes · votes26'],
  ['/blocs', 'Blocs · votes26'],
  ['/localities', 'Localities · votes26'],
  ['/localities/3000', 'ירושלים · Localities · votes26'],
  ['/parties/%D7%9E%D7%97%D7%9C', 'Likud · votes26'],
  ['/insights', 'Insights · votes26'],
  ['/method', 'Method & sources · votes26'],
  ['/privacy', 'Privacy · votes26'],
]

test('browser titles follow the route and locale', async ({ page }) => {
  await page.context().addCookies([
    { name: 'votes26-locale', value: 'he', domain: 'localhost', path: '/' },
  ])
  for (const [route, title] of hebrewTitles) {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page).toHaveTitle(title)
  }

  await page.context().clearCookies()
  await page.context().addCookies([
    { name: 'votes26-locale', value: 'en', domain: 'localhost', path: '/' },
  ])
  for (const [route, title] of englishTitles) {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page).toHaveTitle(title)
  }

  // Client-side navigation and language switching update the tab title too.
  await page.context().clearCookies()
  await page.context().addCookies([
    { name: 'votes26-locale', value: 'he', domain: 'localhost', path: '/' },
  ])
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('navigation').getByRole('link', { name: 'מנדטים', exact: true }).click()
  await expect(page).toHaveTitle('מנדטים · votes26')
  await page.getByRole('button', { name: 'en', exact: true }).click()
  await expect(page).toHaveTitle('Seats · votes26')
  await page.getByRole('navigation').getByRole('link', { name: 'Privacy', exact: true }).first().click()
  await expect(page).toHaveTitle('Privacy · votes26')
})

test('titles are explicit for unknown and missing entities', async ({ page }) => {
  await page.goto('/missing-page', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('הדף לא נמצא · votes26')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('הדף לא נמצא')

  await page.goto('/parties/xyz', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('מפלגה לא נמצאה · votes26')

  await page.goto('/localities/not-a-code', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('היישוב לא נמצא · votes26')

  await page.context().clearCookies()
  await page.context().addCookies([
    { name: 'votes26-locale', value: 'en', domain: 'localhost', path: '/' },
  ])
  await page.goto('/missing-page', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('Page not found · votes26')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')

  // A malformed locale cookie falls back to Hebrew instead of mixing languages.
  await page.context().addCookies([
    { name: 'votes26-locale', value: 'fr', domain: 'localhost', path: '/' },
  ])
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('תמונת מצב · votes26')
  await expect(page.locator('html')).toHaveAttribute('lang', 'he')
})
