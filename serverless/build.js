/** @type {import('serverless/aws').AWS['build']} */
export const build = {
  esbuild: {
    bundle: true,
    minify: false,
    sourcemap: true,
    configFile: "./serverless/esbuild.config.js",
  },
};
