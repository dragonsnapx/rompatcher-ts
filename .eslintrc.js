// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:react/recommended"
  ],
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
