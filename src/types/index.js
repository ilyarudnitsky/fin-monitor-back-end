import { makeSchema } from "nexus";
import * as inputs from "./inputs.js";
import * as user from "./user.js";

function collectTypes(...modules) {
  return modules.flatMap((mod) =>
    Object.values(mod).filter(
      (value) =>
        value &&
        typeof value === "object" &&
        typeof value.name === "string" &&
        value.config != null &&
        value.constructor?.name?.startsWith("Nexus"),
    ),
  );
}

export const schema = makeSchema({
  types: collectTypes(inputs, user),
  outputs: {
    schema: false,
    typegen: false,
  },
});
