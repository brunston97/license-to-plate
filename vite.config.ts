/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config https://vitest.dev/config

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    plugins: [react(), tsconfigPaths()],
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: '.vitest/setup',
      include: ['**/test.{ts,tsx}']
    },
    server: {
      //only applies to DEV
      //port: parseInt(process.env.PORT || '808')
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${env.VITE_PORT ?? 8080}`,
          changeOrigin: true //,
          //rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
