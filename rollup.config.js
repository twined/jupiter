import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import analyze from 'rollup-plugin-analyzer';
import size from 'rollup-plugin-bundle-size';

import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      resolve(),
      commonjs(),
      analyze({ summaryOnly: true }),
      size()
    ],
    moduleContext: {
      'node_modules/gsap/TweenLite.js': 'window'
    }
  }
];
