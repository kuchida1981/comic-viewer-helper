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
      include: ['src/**/*.js', 'src/**/*.ts'],
      exclude: [
        'src/header.js',
        'src/header.ts',
        'src/main.js',
        'src/main.ts',
        'src/ui/styles.js',
        'src/ui/styles.ts'
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 80,
        statements: 95
      }
    },
  },
});
