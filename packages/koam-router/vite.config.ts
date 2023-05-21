import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      test: resolve(__dirname, 'test'),
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    minify: false,
    rollupOptions: {
      external: [/^node:/],
    },
  },
  test: {
    globals: true,
    setupFiles: [resolve(__dirname, 'test/_setupTest.ts')],
    mockReset: true,
    coverage: {
      provider: 'c8',
      reporter: ['json', 'html', 'lcov'],
    },
  },
})
