import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // ESM build
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: ['react', '@notiboost/browser-sdk'],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  // CommonJS build
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    external: ['react', '@notiboost/browser-sdk'],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  }
];

