module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  overrides: [
    {
      // Allow console logs in development scripts and seed files
      files: ['src/seed.ts', 'scripts/**/*.ts', 'src/scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Allow console logs in main.ts for startup messages
      files: ['src/main.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Allow console logs in logger service (it's the logging implementation)
      files: ['src/common/logger.service.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
