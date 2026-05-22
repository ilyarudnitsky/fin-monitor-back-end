import { graphql, parse, validate } from "graphql";
import { createAuthContext } from "./context.js";

export function validationErrors(schema, source) {
  return validate(schema, parse(source));
}

export async function executeOperation(schema, source, options = {}) {
  const { contextValue = createAuthContext(), ...rest } = options;

  return graphql({
    schema,
    source,
    contextValue,
    ...rest,
  });
}
