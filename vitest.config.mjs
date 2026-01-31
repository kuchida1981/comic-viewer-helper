import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/header.js',
        'src/main.js',
        'src/ui/styles.js'
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 92, // UI components' defensive branches make 100% difficult
        statements: 100
      }
    },
  },
});
