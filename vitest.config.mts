export default {
  oxc: false,
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['lib/**/*.test.ts', 'app/**/*.test.tsx', 'components/**/*.test.tsx'],
  },
}
