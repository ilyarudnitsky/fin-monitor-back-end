/** @type {import('serverless/aws').AWS['provider']} */
export const provider = {
  name: "aws",
  runtime: "nodejs20.x",
  architecture: "arm64",
  stage: '${opt:stage, "dev"}',
  region: '${opt:region, "us-east-1"}',
  httpApi: {
    cors: true,
  },
};
