import { service } from "./service.js";
import { build } from "./build.js";
import { provider } from "./provider.js";
import { functions } from "./functions.js";
import { plugins } from "./plugins.js";
import { custom } from "./custom.js";

/** @type {import('serverless/aws').AWS} */
export default {
  ...service,
  build,
  provider,
  functions,
  plugins,
  custom,
};
