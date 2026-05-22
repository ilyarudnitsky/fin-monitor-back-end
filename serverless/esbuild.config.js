/** @param {import('serverless').Serverless} serverless */
export default (serverless) => {
  const isDev = serverless?.service?.provider?.stage === "dev";

  return {
    platform: "node",
    target: "node20",
    format: "esm",
    mainFields: ["module", "main"],
    external: ["@aws-sdk/*", "pg", "pg-native", "postgresql-orm"],
    logLevel: isDev ? "info" : "warning",
  };
};
