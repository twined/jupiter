module.exports = {
  root: true,
  env: {
    browser: true,
    node: false
  },
  extends: [
    'standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}