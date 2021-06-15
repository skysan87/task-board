module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'no-lonely-if': 'off',
    'no-unused-vars': 'off',
    'dot-notation': 'off',
    'no-console': 'off'
  }
}
