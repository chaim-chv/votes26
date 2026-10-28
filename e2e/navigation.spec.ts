import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/mandates',
  '/votes',
  '/blocs',
  '/localities',
  '/localities/3000',
  '/parties/%D7%9E%D7%97%D7%9C',
  '/parties/%D7%93%D7%99',
  '/insights',
  '/method',
  '/privacy',
]

test('every view renders one h1 without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' })
    expect(response?.status(), route).toBe(200)
    await expect(page.locator('h1'), route).toHaveCount(1)
    await expect(page.locator('h1'), route).toBeVisible()
  }

  expect(errors).toEqual([])
})

test('national data is consistent and survives navigation', async ({ page, request }) => {
  const payload = await (await request.get('/api/results')).json()
  const formattedVotes = new Intl.NumberFormat('he-IL').format(payload.meta.validVotes)

  await page.goto('/', { waitUntil: 'networkidle' })
  const validCard = page.locator('article').filter({ hasText: 'קולות כשרים' }).first()
  await expect(validCard).toContainText(formattedVotes)
  await expect(page.getByRole('banner')).toContainText('נתונים חיים')

  await page.goto('/mandates', { waitUntil: 'networkidle' })
  await expect(page.getByRole('banner')).toContainText('נתונים חיים')
  await page.goto('/votes', { waitUntil: 'networkidle' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(
    page.locator('article').filter({ hasText: 'קולות כשרים' }).first(),
  ).toContainText(formattedVotes)
})

test('a manual refresh updates the shared data used by later views', async ({ page, request }) => {
  const payload = await (await request.get('/api/results')).json()
  const updated = structuredClone(payload)
  updated.meta.validVotes += 12_345
  updated.meta.fetchedAt = new Date().toISOString()
  updated.meta.generatedAt = new Date().toISOString()
  const formattedUpdated = new Intl.NumberFormat('he-IL').format(updated.meta.validVotes)

  await page.route('**/api/results*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(updated),
    })
  })

  await page.goto('/', { waitUntil: 'networkidle' })
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/results')),
    page.getByRole('banner').getByRole('button', { name: 'רענון' }).click(),
  ])
  await expect(
    page.locator('article').filter({ hasText: 'קולות כשרים' }).first(),
  ).toContainText(formattedUpdated)

  await page.getByRole('link', { name: 'קולות' }).first().click()
  await expect(page).toHaveURL(/\/votes$/)
  await page.getByRole('link', { name: 'תמונת מצב' }).first().click()
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.locator('article').filter({ hasText: 'קולות כשרים' }).first(),
  ).toContainText(formattedUpdated)
})

test('locale and theme choices survive navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /en/i }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')

  await page.getByRole('button', { name: /Dark or light theme|מצב תצוגה כהה או בהיר/ }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.goto('/mandates', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('h1')).toHaveText('Seats')
})

test('mobile navigation opens the menu and the legend', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'פתיחת תפריט' }).click()
  const menu = page.getByRole('dialog', { name: 'תפריט' })
  await expect(menu).toBeVisible()
  await expect(menu).toContainText('מנדטים')
  await expect(menu).toContainText('יישובים')
  await menu.getByRole('button', { name: 'מקרא' }).last().click()
  await expect(page.getByRole('dialog', { name: 'מקרא' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'מקרא' })).toBeHidden()
})

test('locality data re-fetches when the shared national result refreshes', async ({ page, request }) => {
  const results = await (await request.get('/api/results')).json()
  const localities = await (await request.get('/api/localities')).json()
  const updated = structuredClone(results)
  updated.meta.fetchedAt = new Date().toISOString()
  updated.meta.generatedAt = new Date().toISOString()

  await page.route('**/api/results*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(updated),
    })
  })
  await page.route('**/api/localities*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(localities),
    })
  })

  await page.goto('/localities', { waitUntil: 'networkidle' })
  let localityRequests = 0
  page.on('request', (request) => {
    if (request.url().includes('/api/localities')) localityRequests += 1
  })

  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/localities')),
    page.getByRole('banner').getByRole('button', { name: 'רענון' }).click(),
  ])
  expect(localityRequests).toBeGreaterThan(0)
})
