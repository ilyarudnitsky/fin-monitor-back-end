import { graphql, parse, validate } from "graphql";
import { authenticateContext } from "../../src/middleware/auth.js";
import { createAuthContext } from "./context.js";

export function validationErrors(schema, source) {
  return validate(schema, parse(source));
}

export async function executeOperation(schema, source, options = {}) {
  const { contextValue = createAuthContext(), ...rest } = options;

  try {
    authenticateContext(contextValue);
  } catch (error) {
    return { errors: [{ message: error.message }] };
  }

  return graphql({
    schema,
    source,
    contextValue,
    ...rest,
  });
}
