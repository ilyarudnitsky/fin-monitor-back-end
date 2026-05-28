import { objectType, inputObjectType, queryField, mutationField, nonNull } from "nexus";
import * as resolvers from "../resolvers/index.js";
import { defineEntityCollectionByPageInput } from "./entity.js";

export const DualPurposeAsset = objectType({
  name: "DualPurposeAsset",
  definition(t) {
    t.implements("Entity");
    t.string("type");
    t.string("amount");
    t.string("quantity");
    t.string("price");
    t.string("commission");
    t.string("notes");
  },
});

export const DualPurposeAssetCollection = objectType({
  name: "DualPurposeAssetCollection",
  definition(t) {
    t.implements("EntityCollectionByPage");
    t.list.field("items", { type: "DualPurposeAsset" });
  },
});

export const DualPurposeAssetInput = inputObjectType({
  name: "DualPurposeAssetInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
  },
});

export const DualPurposeAssetCreateInput = inputObjectType({
  name: "DualPurposeAssetCreateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.string("type");
    t.nonNull.string("amount");
    t.nonNull.string("quantity");
    t.nonNull.string("price");
    t.nonNull.string("commission");
    t.nonNull.dateTime("createdAt");
    t.string("notes");
  },
});

export const DualPurposeAssetCollectionInput = inputObjectType({
  name: "DualPurposeAssetCollectionInput",
  definition(t) {
    defineEntityCollectionByPageInput(t);
    t.nonNull.field("filter", { type: nonNull("DualPurposeAssetCollectionInputFilter") });
  },
});

export const DualPurposeAssetCollectionInputFilter = inputObjectType({
  name: "DualPurposeAssetCollectionInputFilter",
  definition(t) {
    t.nonNull.field("asset", { type: "EntityInput" });
  },
});

export const dualPurposeAsset = queryField("dualPurposeAsset", {
  type: "DualPurposeAsset",
  args: { input: nonNull("DualPurposeAssetInput") },
  resolve: resolvers.dualPurposeAsset,
});

export const dualPurposeAssetCollection = queryField("dualPurposeAssetCollection", {
  type: "DualPurposeAssetCollection",
  args: { input: nonNull("DualPurposeAssetCollectionInput") },
  resolve: resolvers.dualPurposeAssetCollection,
});

export const dualPurposeAssetCreate = mutationField("dualPurposeAssetCreate", {
  type: "DualPurposeAsset",
  args: { input: nonNull("DualPurposeAssetCreateInput") },
  resolve: resolvers.dualPurposeAssetCreate,
});
