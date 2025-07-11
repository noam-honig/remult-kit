import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test'

const webServer_port = 4321
const reporter: ReporterDescription[] = [['list'], ['html', { open: 'on-failure' }]]
if (process.env.CI) {
  reporter.push(['github'])
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  retries: 2, // default
  // workers: 50%, // default
  testMatch: '*/**/e2e/*.ts',
  reporter,
  use: {
    screenshot: 'only-on-failure',
    baseURL: `http://127.0.0.1:${webServer_port}`,
  },
  webServer: {
    // command: `npm run build && npm run preview --port ${webServer_port}`,
    command: `npm run preview`,
    port: webServer_port,
    timeout: 180_000, // time for build and run preview!
    stdout: 'pipe',
  },
  timeout: 60_000,
  expect: {
    timeout: 6 * 1000,
    toMatchSnapshot: {
      threshold: 0.4,
    },
  },
}

export default config
