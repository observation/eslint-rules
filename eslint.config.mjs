import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-console': 'warn',
      curly: ['error', 'multi-line'],
      'prefer-destructuring': ['error'],
    },
  },
  ...tseslint.configs.recommended,
]
