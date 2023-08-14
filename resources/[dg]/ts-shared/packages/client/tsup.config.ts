import type { Options } from 'tsup';

export const tsup: Options = {
  splitting: false,
  clean: true, // clean up the dist folder
  dts: false,
  format: 'esm',
  minify: false,
  bundle: false,
  skipNodeModulesBundle: false,
  noExternal: [/.*/],
  entryPoints: ['./src/index.ts'],
  target: 'es2020',
  outDir: 'dist',
  treeshake: true,
  keepNames: true,
  entry: ['./src/**/*.ts', '!./src/**/*.d.ts'],
  publicDir: './src/types',
};
