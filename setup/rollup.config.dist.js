// import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: './src/xsskillah.js',
    output: {
      file: './dist/xsskillah.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
        // terser(),
        resolve()
    ],
  }