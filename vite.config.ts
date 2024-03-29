import type { KIT_ROUTES } from '$lib/ROUTES'
import { sveltekit } from '@sveltejs/kit/vite'
import { loadEnv } from 'vite'
import { defineConfig } from 'vite'
import { kitRoutes } from 'vite-plugin-kit-routes'
import { stripper } from 'vite-plugin-stripper'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      host: env.REMULT_KIT_HOST ?? '127.0.0.1',
      port: parseInt(env.REMULT_KIT_PORT ?? '4321'),
    },

    plugins: [
      kitRoutes<KIT_ROUTES>({
        post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',
        logs: {
          post_update_run: false,
          update: false,
        },
      }),
      stripper({ decorators: ['BackendMethod'], debug: false }),
      sveltekit(),
    ],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  }
})
