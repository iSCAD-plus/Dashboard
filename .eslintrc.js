module.exports = {
  env: {
    jest: true,
    jasmine: true,
    browser: true,
    node: true,
  },
  parser: 'babel-eslint',
  plugins: ['import', 'promise'],
  extends: ['airbnb', 'plugin:import/errors', 'plugin:import/warnings'],
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
    'max-len': ['error', { ignoreComments: true }],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 5 }],
    'react/display-name': 0,
    'func-names': 0,
    'no-confusing-arrow': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-underscore-dangle': 0,
    'new-cap': 0,
  },
  globals: {
    KYT: true,
  },
};
