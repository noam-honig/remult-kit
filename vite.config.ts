import { sveltekit } from '@sveltejs/kit/vite'
import { loadEnv } from 'vite'
import { striper } from 'vite-plugin-striper'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      host: env.REMULT_KIT_HOST ?? '127.0.0.1',
      port: parseInt(env.REMULT_KIT_PORT ?? '4321'),
    },

    plugins: [
      // TODO JYC... as it's not working !
      striper({ decorators: ['BackendMethod'], debug: false }),
      sveltekit(),
    ],
    build: {
      rollupOptions: {
        external: ['fs'],
      },
    },
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  }
})
