import { fileURLToPath } from 'node:url'

export default {
  oxc: false,
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['lib/**/*.test.ts', 'app/**/*.test.tsx', 'components/**/*.test.tsx'],
  },
}
