import {
  objectType,
  inputObjectType,
  mutationField,
  nonNull,
} from "nexus";
import * as resolvers from "../resolvers/index.js";

export const OperatingAssetLine = objectType({
  name: "OperatingAssetLine",
  definition(t) {
    t.implements("Entity");
    t.nonNull.uuid("assetId");
    t.nonNull.string("type");
    t.nonNull.string("value");
    t.string("notes");
  },
});

export const OperatingAssetLineCreateInput = inputObjectType({
  name: "OperatingAssetLineCreateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.string("type");
    t.nonNull.string("value");
    t.nonNull.dateTime("createdAt");
    t.string("notes");
  },
});

export const OperatingAssetLineUpdateInput = inputObjectType({
  name: "OperatingAssetLineUpdateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.field("line", { type: "EntityInput" });
    t.nonNull.string("type");
    t.nonNull.string("value");
    t.nonNull.dateTime("createdAt");
    t.string("notes");
  },
});

export const OperatingAssetLineDeleteInput = inputObjectType({
  name: "OperatingAssetLineDeleteInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.field("line", { type: "EntityInput" });
  },
});

export const operatingAssetLineCreate = mutationField(
  "operatingAssetLineCreate",
  {
    type: "OperatingAssetLine",
    args: { input: nonNull("OperatingAssetLineCreateInput") },
    resolve: resolvers.operatingAssetLineCreate,
  },
);

export const operatingAssetLineUpdate = mutationField(
  "operatingAssetLineUpdate",
  {
    type: "OperatingAssetLine",
    args: { input: nonNull("OperatingAssetLineUpdateInput") },
    resolve: resolvers.operatingAssetLineUpdate,
  },
);

export const operatingAssetLineDelete = mutationField(
  "operatingAssetLineDelete",
  {
    type: "OperatingAssetLine",
    args: { input: nonNull("OperatingAssetLineDeleteInput") },
    resolve: resolvers.operatingAssetLineDelete,
  },
);
