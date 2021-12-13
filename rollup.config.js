import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'index.js',
  output: {
    file: 'documentation.js',
    inlineDynamicImports: true,
    format: 'es'
  },
  external: [
    'node:path',
    'node:process',
    'node:fs',
    'fs/promises',
    '@vue/compiler-sfc',
    'vue-template-compiler'
  ],
  plugins: [
    nodeResolve({ exportConditions: ['node', 'default', 'module', 'require'] }),
    commonjs(),
    json(),
    {
      resolveImportMeta(prop, { moduleId }) {
        if (
          prop !== 'url' ||
          !moduleId.endsWith('src\\default_theme\\index.js')
        ) {
          return;
        }

        const relative = moduleId.split(path.sep).join(path.posix.sep);
        console.log(relative);
        return `'file:///${relative}'`;
      }
    }
  ]
};
