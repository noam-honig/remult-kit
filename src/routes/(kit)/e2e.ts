import { expect, test } from '@playwright/test'

test('Landing page working, we can start 🚀', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('h1').textContent()).toBe('Home')
})
