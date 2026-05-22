/** @type {import('serverless/aws').AWS['custom']} */
export const custom = {
  "serverless-offline": {
    httpPort: 3000,
    lambdaPort: 3002,
    noPrependStageInUrl: true,
    reloadHandler: true,
  },
};
