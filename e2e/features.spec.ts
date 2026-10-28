import { expect, test } from '@playwright/test'

test('threshold simulator recalculates and resets', async ({ page, request }) => {
  const payload = await (await request.get('/api/results')).json()
  const partyCount = payload.parties.filter((party: { votes: number }) => party.votes > 0).length

  await page.goto('/mandates', { waitUntil: 'networkidle' })
  const slider = page.locator('#threshold-simulator input[type="range"]')
  await expect(slider).toHaveValue('3.25')
  await expect(page.locator('#threshold-simulator output')).toHaveText('3.25%')

  await page.getByRole('button', { name: '0%', exact: true }).click()
  await expect(slider).toHaveValue('0')
  await expect(page.locator('#threshold-simulator output')).toHaveText('0%')
  const passing = page.locator('#threshold-simulator dl > div').first().locator('dd')
  await expect(passing).toHaveText(String(partyCount))
  await expect(page.getByText('בסף 0% כל מפלגה מקבלת ייצוג')).toBeVisible()

  await page.getByRole('button', { name: '3.25%', exact: true }).click()
  await expect(slider).toHaveValue('3.25')
})

test('locality search and neighbourhood drill-down work', async ({ page }) => {
  await page.goto('/localities', { waitUntil: 'networkidle' })
  const search = page.getByRole('searchbox')
  await search.fill('ירושלים')
  const result = page.locator('main ul li a').filter({ hasText: 'ירושלים' }).first()
  await expect(result).toBeVisible()
  await result.click()
  await expect(page).toHaveURL(/\/localities\/3000$/)
  await expect(page.locator('h1')).toHaveText('ירושלים')
  await expect(page.getByRole('heading', { name: 'שכונות' })).toBeVisible()
  await expect(page.getByText('הצג את כל').first()).toBeVisible()
})

test('party names lead to a complete party profile', async ({ page }) => {
  await page.goto('/votes', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'הליכוד' }).first().click()
  await expect(page).toHaveURL(/\/parties\//)
  await expect(page.locator('h1')).toHaveText('הליכוד')
  await expect(page.getByText('אחוז מהקולות')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'איפה המפלגה חזקה' })).toBeVisible()

  await page.goto('/parties/%D7%93%D7%99', { waitUntil: 'networkidle' })
  await expect(page.locator('h1')).toHaveText('המילואימניקים והכלכלית')
  await expect(page.getByText('מתחת לחסימה').first()).toBeVisible()
  await expect(page.getByText('חסרים לחסימה').first()).toBeVisible()
})

test('below-threshold table links to the party profile', async ({ page }) => {
  await page.goto('/mandates', { waitUntil: 'networkidle' })
  await page.getByText(/הצגת \d+ מפלגות מתחת לחסימה/).click()
  const partyLink = page.locator('#below-threshold table a').first()
  await expect(partyLink).toBeVisible()
  const name = (await partyLink.innerText()).trim()
  await partyLink.click()
  await expect(page.locator('h1')).toContainText(name)
})

test('2022 comparisons appear where they are meaningful', async ({ page }) => {
  await page.goto('/mandates', { waitUntil: 'networkidle' })
  await expect(page.getByText('2022 · תוצאות סופיות').first()).toBeVisible()
  await expect(page.getByRole('columnheader', { name: /Δ מנדטים/ })).toBeVisible()
  await expect(page.getByText('2022: מנדטים רשמיים. 2026: מנדטים מחושבים.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'קבוצות להשוואה' })).toBeVisible()

  await page.goto('/parties/%D7%9E%D7%97%D7%9C', { waitUntil: 'networkidle' })
  await expect(page.getByText('2022: 32')).toBeVisible()
  await expect(page.getByText('2022: 23.4%')).toBeVisible()

  await page.goto('/blocs', { waitUntil: 'networkidle' })
  await expect(page.getByText('גוש נתניהו 2022: 64')).toBeVisible()
  await expect(page.getByText('מול בחירות 2022').first()).toBeVisible()

  await page.goto('/insights', { waitUntil: 'networkidle' })
  await expect(page.getByText('מול בחירות 2022').first()).toBeVisible()
  await expect(page.getByText('2022: 8.8%')).toBeVisible()

  await page.goto('/localities/3000', { waitUntil: 'networkidle' })
  await expect(page.getByRole('columnheader', { name: '2022', exact: true }).first()).toBeVisible()
  await expect(page.getByRole('columnheader', { name: /Δ מול/ })).toBeVisible()

  await page.goto('/votes', { waitUntil: 'networkidle' })
  await expect(page.getByText('2022: 1,115,171').first()).toBeVisible()
  const eligibleRows = await page.locator('main ol[aria-label="רשימת המפלגות"] > li').count()
  expect(eligibleRows).toBeLessThan(20)
  await page.getByRole('button', { name: 'כל המפלגות' }).click()
  const allRows = await page.locator('main ol[aria-label="רשימת המפלגות"] > li').count()
  expect(allRows).toBeGreaterThan(eligibleRows)
})
