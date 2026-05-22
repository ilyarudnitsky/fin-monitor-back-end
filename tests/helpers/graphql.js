import { graphql, parse, validate } from "graphql";

export function validationErrors(schema, source) {
  return validate(schema, parse(source));
}

export async function executeOperation(schema, source, options = {}) {
  return graphql({
    schema,
    source,
    ...options,
  });
}
