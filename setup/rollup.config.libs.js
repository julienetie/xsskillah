// import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: './libs/Parser.js',
    output: {
      file: './libs/html-parser-2.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
        // terser(),
        resolve()
    ],
  }