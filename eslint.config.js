import globals, { commonjs } from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    env: { node: true, commonjs: false, module: true },
    languageOptions: { globals: globals.browser },
    rules: {
      'newline-before-return': ['error', 'never'],
    },
  },
  pluginJs.configs.recommended,
];
