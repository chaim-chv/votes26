import AxeBuilder from '@axe-core/playwright'
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

test('no WCAG A/AA violations in light mode', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'networkidle' })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations, route).toEqual([])
  }
})

test('no WCAG A/AA violations in dark mode', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nuxt-color-mode', 'dark'))
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.locator('html')).toHaveClass(/dark/)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations, route).toEqual([])
  }
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('no WCAG A/AA violations on key mobile views', async ({ page }) => {
    for (const route of ['/', '/mandates', '/localities', '/localities/3000', '/parties/%D7%93%D7%99']) {
      await page.goto(route, { waitUntil: 'networkidle' })
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations, route).toEqual([])
    }
  })
})
