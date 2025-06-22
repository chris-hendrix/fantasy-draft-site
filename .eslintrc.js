// Legacy config for VS Code ESLint extension compatibility
// The actual config is in eslint.config.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Custom overrides (only rules that differ from Next.js defaults)
    'semi': ['error', 'never'], // forces no semicolon
    '@typescript-eslint/no-unused-expressions': 'off', // allows true && runFunction()
    '@typescript-eslint/no-unused-vars': [ // allows unused vars with explicit underscore
      'error',
      { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' },
    ],
    '@typescript-eslint/no-use-before-define': 'off', // allows functions calls before definition
    '@typescript-eslint/no-explicit-any': 'off', // allows any type (for minimal migration impact)
    '@typescript-eslint/ban-types': 'off', // allows Object type (for minimal migration impact)
    '@typescript-eslint/ban-ts-comment': 'off', // allows @ts-ignore comments
    '@typescript-eslint/no-empty-object-type': 'off', // allows {} type (for minimal migration impact)
    '@typescript-eslint/no-wrapper-object-types': 'off', // allows Number type (for minimal migration impact)
    
    'jsx-quotes': ['error', 'prefer-double'], // force double quotes for jsx props
    'react-hooks/exhaustive-deps': 'off', // no need for all dependencies for useEffect
    
    'object-curly-spacing': ['error', 'always'], // require spaces inside braces
    'consistent-return': 'off', // allows no return for an arrow function
    
    // Additional useful rules from Airbnb (non-breaking)
    'no-console': 'warn', // warn on console statements (good practice)
    'no-alert': 'warn', // warn on alert/confirm/prompt usage
    'eqeqeq': ['error', 'always'], // require === and !==
    'no-eval': 'error', // disallow eval()
    'no-implied-eval': 'error', // disallow implied eval()
    'no-new-func': 'error', // disallow new Function()
    'no-script-url': 'error', // disallow javascript: urls
    'no-sequences': 'error', // disallow comma operators
    'radix': 'error', // require radix parameter for parseInt()
    'yoda': 'error' // disallow Yoda conditions
  }
}