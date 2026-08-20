import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    include: ['src/**/*.test.{jsx,js}'],
    server: {
      deps: {
        inline: ['axios'],
      },
    },
  },
  css: {
    modules: { classNameStrategy: 'non-scoped' },
  },
})

