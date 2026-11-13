import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/anyjs.esm.js',
      format: 'esm',
      sourcemap: !isProduction
    },
    {
      file: 'dist/anyjs.cjs.js',
      format: 'cjs',
      sourcemap: !isProduction
    },
    {
      file: 'dist/anyjs.umd.js',
      format: 'umd',
      name: 'AnyJS',
      sourcemap: !isProduction
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead']
          }
        }]
      ]
    }),
    isProduction && terser()
  ]
};
