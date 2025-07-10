import { expect, test } from '@playwright/test'

test('Landing page working, we can start 🚀', async ({ page }) => {
  await page.goto('/')
  await page.waitForResponse(response => response.status() === 200);

  expect(await page.locator('h1').textContent()).toBe('Home')
})
