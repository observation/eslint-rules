import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
    },
    plugins: {
      import: {},
    },
    rules: {
      semi: ['error', 'never'],
      'no-console': 'warn',
      curly: ['error', 'multi-line'],
      'prefer-destructuring': ['error'],
    },
  },
]