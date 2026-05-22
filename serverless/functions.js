/** @type {import('serverless/aws').AWS['functions']} */
export const functions = {
  graphql: {
    handler: "src/handlers/graphql.graphqlHandler",
    memorySize: 512,
    timeout: 29,
    events: [
      {
        httpApi: {
          path: "/graphql",
          method: "POST",
        },
      },
      {
        httpApi: {
          path: "/graphql",
          method: "GET",
        },
      },
    ],
  },
};
