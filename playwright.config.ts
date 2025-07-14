import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test'

const webServer_port = 4321
const reporter: ReporterDescription[] = [['list'], ['html', { open: 'on-failure' }]]
if (process.env.CI) {
  reporter.push(['github'])
}

const config: PlaywrightTestConfig = {
  // retries: 0, // default
  // workers: 50%, // default
  testMatch: '*/**/e2e.ts',
  reporter,
  use: { screenshot: 'only-on-failure' },
  webServer: {
    command: `npm run build && npm run preview --port ${webServer_port}`,
    port: webServer_port,
    // timeout: 180_000, // time for build and run preview!
    stdout: 'pipe',
  },
  timeout: 10_000,
  expect: {
    toMatchSnapshot: {
      threshold: 0.4,
    },
  },
}

export default config
