import { objectType, extendType, inputObjectType, queryField, mutationField, nonNull } from "nexus";
import * as resolvers from "../resolvers/index.js";
import { defineEntityCollectionByPageInput } from "./entity.js";

export const OperatingAsset = objectType({
  name: "OperatingAsset",
  definition(t) {
    t.implements("Entity");
    t.string("type");
    t.string("value");
    t.string("notes");
  },
});

export const OperatingAssetCollection = objectType({
  name: "OperatingAssetCollection",
  definition(t) {
    t.implements("EntityCollectionByPage");
    t.list.field("items", { type: "OperatingAsset" });
  },
});

export const OperatingAssetInput = inputObjectType({
  name: "OperatingAssetInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
  },
});

export const OperatingAssetCreateInput = inputObjectType({
  name: "OperatingAssetCreateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.string("type");
    t.nonNull.string("value");
    t.nonNull.dateTime("createdAt");
    t.string("notes");
  },
});

export const OperatingAssetCollectionInput = inputObjectType({
  name: "OperatingAssetCollectionInput",
  definition(t) {
    defineEntityCollectionByPageInput(t);
    t.nonNull.field("filter", { type: nonNull("OperatingAssetCollectionInputFilter") });
  },
});

export const OperatingAssetCollectionInputFilter = inputObjectType({
  name: "OperatingAssetCollectionInputFilter",
  definition(t) {
    t.nonNull.field("asset", { type: "EntityInput" });
  },
});


/* 
 * Queries
 */
export const operatingAsset = queryField("operatingAsset", {
  type: "OperatingAsset",
  args: { input: nonNull("OperatingAssetInput") },
  resolve: resolvers.operatingAsset,
});

export const operatingAssetCollection = queryField("operatingAssetCollection", {
  type: "OperatingAssetCollection",
  args: { input: nonNull("OperatingAssetCollectionInput") },
  resolve: resolvers.operatingAssetCollection,
});

/* 
 * Mutations
 */
export const operatingAssetCreate = mutationField("operatingAssetCreate", {
  type: "OperatingAsset",
  args: { input: nonNull("OperatingAssetCreateInput") },
  resolve: resolvers.operatingAssetCreate,
});
