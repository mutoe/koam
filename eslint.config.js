import defineConfig from '@mutoe/eslint-config'

export default defineConfig({
  overrides: {
    typescript: {
      'ts/no-namespace': 'off',
    },
    test: {
      'style/max-statements-per-line': ['warn', { max: 4 }],
    },
  },
})
