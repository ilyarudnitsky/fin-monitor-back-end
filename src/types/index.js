import { makeSchema } from "nexus";
import * as base from "./base.js";
import * as entity from "./entity.js";
import * as shared from "./shared.js";
import * as category from "./category.js";
import * as asset from "./asset.js";
import * as operatingAsset from "./operating-asset.js";
import * as investmentAsset from "./investment-asset.js";
import * as dualPurposeAsset from "./dual-purpose-asset.js";
import * as user from "./user.js";

function isSchemaType(value) {
  if (!value || typeof value !== "object" || typeof value.name !== "string") {
    return false;
  }

  if (value.constructor?.name === "GraphQLScalarType") {
    return true;
  }

  return (
    value.config != null && value.constructor?.name?.startsWith("Nexus")
  );
}

function collectTypes(...modules) {
  return modules.flatMap((mod) => Object.values(mod).filter(isSchemaType));
}

export const schema = makeSchema({
  types: collectTypes(
    base,
    entity,
    shared,
    category,
    asset,
    operatingAsset,
    investmentAsset,
    dualPurposeAsset,
    user,
  ),
  outputs: {
    schema: false,
    typegen: false,
  },
});
