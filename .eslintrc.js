module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  rules: {
    semi: ['error', 'never'],
    'no-console': 'warn',
    curly: ['error', 'multi-line'],
    'prefer-destructuring': ['error'],
  },
}
