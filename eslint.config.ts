// eslint-disable-next-line import/no-extraneous-dependencies
import getConfig from 'eslint-config-vylda-typescript';

const baseDir = import.meta.dirname;

const eslintConfig = [
  ...getConfig(baseDir),
  {
    files: [
      'data.ts',
      'examples.ts',
    ],
    name: 'Project specificRules',
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
  {
    ignores: [
      'privateFiles/**/*',
    ],
    name: 'Ignored files',
  },
];

export default eslintConfig;
