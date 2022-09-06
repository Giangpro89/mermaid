const { Generator } = require('jison');
const fs = require('fs');

/** @typedef {import('esbuild').BuildOptions} Options */

/**
 * @param {Options} override
 * @returns {Options}
 */
const buildOptions = (override = {}) => {
  return {
    bundle: true,
    minify: true,
    keepNames: true,
    banner: { js: '"use strict";' },
    globalName: 'mermaid',
    platform: 'browser',
    tsconfig: 'tsconfig.json',
    resolveExtensions: ['.ts', '.js', '.json', '.jison'],
    external: ['require', 'fs', 'path'],
    entryPoints: ['src/mermaid.ts'],
    outfile: 'dist/mermaid.min.js',
    plugins: [jisonPlugin],
    sourcemap: 'external',
    ...override,
  };
};

/**
 * @param {Options} override
 * @returns {Options}
 */
exports.esmBuild = (override = { minify: true }) => {
  return buildOptions({
    format: 'esm',
    outfile: `dist/mermaid.esm${override.minify ? '.min' : ''}.mjs`,
    ...override,
  });
};

/**
 * @param {Options} override
 * @returns {Options}
 */
exports.umdBuild = (override = { minify: true }) => {
  return buildOptions({
    outfile: `dist/mermaid${override.minify ? '.min' : ''}.js`,
    ...override,
  });
};

const jisonPlugin = {
  name: 'jison',
  setup(build) {
    build.onLoad({ filter: /\.jison$/ }, async (args) => {
      // Load the file from the file system
      const source = await fs.promises.readFile(args.path, 'utf8');
      const contents = new Generator(source, { 'token-stack': true }).generate();
      return { contents, warnings: [] };
    });
  },
};