import { GraphQLScalarType, Kind } from "graphql";
import { asNexusMethod } from "nexus";

import {
  DateTimeResolver,
  EmailAddressResolver,
  PhoneNumberResolver,
  URLResolver,
  UUIDResolver,
  JSONResolver,
} from "graphql-scalars";

const StringV2Resolver = new GraphQLScalarType({
  name: "StringV2",
  description: "The `StringV2` must be without html tags.",

  serialize(value) {
    return value;
  },

  parseValue(value) {
    const regex = /(<([^>]+)>)/gi;

    if (value.match(regex)) {
      throw new TypeError(`${String(value)} is not a valid file key value.`);
    }

    return value;
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError(`${String(ast.value)} is not a valid file key value.`);
    }

    const regex = /(<([^>]+)>)/gi;

    if (ast.value.match(regex)) {
      throw new TypeError(`${String(ast.value)} is not a valid file key value.`);
    }

    return ast.value;
  },
});

export const DateTime = asNexusMethod(DateTimeResolver, "dateTime");
export const Email = asNexusMethod(EmailAddressResolver, "email");
export const JSON = asNexusMethod(JSONResolver, "json");
export const StringV2 = asNexusMethod(StringV2Resolver, "string");
export const PhoneNumber = asNexusMethod(PhoneNumberResolver, "phoneNumber");
export const URL = asNexusMethod(URLResolver, "url");
export const UUID = asNexusMethod(UUIDResolver, "uuid");
