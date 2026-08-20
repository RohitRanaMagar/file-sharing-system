import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.js'],
    environment: 'node',
    setupFiles: [],
    server: {
      deps: {
        inline: ['axios', 'supertest'],
      },
    },
  },
})
