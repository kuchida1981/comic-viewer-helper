import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.2.0-test'),
    __IS_UNSTABLE__: true,
  },
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
