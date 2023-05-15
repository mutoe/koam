import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'build',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
  },
  test: {
    setupFiles: [resolve(__dirname, 'test/_setupTest.ts')],
    mockReset: true,
  },
})
