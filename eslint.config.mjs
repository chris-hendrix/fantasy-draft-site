import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      '**/*.js',
      'node_modules/*',
      '.next/*',
      'out/*',
      'build/*',
      'dist/*',
      'next-env.d.ts',
      'global.d.ts',
      'prisma/*'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: ['./tsconfig.json', './test/cypress/tsconfig.json']
      }
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Stylistic rules (now base ESLint)
      'semi': ['error', 'never'],
      'comma-dangle': 'off',

      // General rules
      'consistent-return': 'off',
      'jsx-quotes': ['error', 'prefer-double'],
      'object-curly-newline': 'off',
      'operator-linebreak': 'off'
    }
  }
]
