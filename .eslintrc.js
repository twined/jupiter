module.exports = {
  root: true,
  env: {
    browser: true,
    node: false
  },
  extends: [
    'airbnb-base'
  ],
  rules: {
    'arrow-parens': [2, 'as-needed'],
    'class-methods-use-this': 0,
    'comma-dangle': ['error', 'never'],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'quotes': ['error', 'single'],
    'radix': ['error', 'as-needed'],
    'semi': 0,
    'space-before-function-paren': ['error', 'always']
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}