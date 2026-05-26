import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import { authenticateContext } from "../middleware/auth.js";
import { schema } from "../types/index.js";

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

const server = new ApolloServer({
  schema,
  introspection: true,
});

const apolloHandler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async ({ event }) => {
      const context = {
        headers: normalizeHeaders(event.headers),
      };

      authenticateContext(context);

      return context;
    },
  },
);

export async function graphqlHandler(event, context) {
  return apolloHandler(event, context);
}
