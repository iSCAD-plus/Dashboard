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
    'react/jsx-filename-extension': 0,
    'react/no-unused-prop-types': 1,
    'react/require-default-props': 1,

    'no-underscore-dangle': [
      'error',
      {
        allow: ['__', '_id'],
      },
    ],
    'new-cap': [
      'error',
      {
        capIsNewExceptions: [
          'CrossCuttingResearchRow',
          'Decision',
          'Just',
          'Left',
          'Mandate',
          'Nothing',
          'Right',
        ],
      },
    ],
  },
  globals: {
    KYT: true,
  },
};
