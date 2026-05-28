import {
  objectType,
  inputObjectType,
  queryField,
  mutationField,
  nonNull,
} from "nexus";
import { defineEntityCollectionByPageInput } from "./entity.js";
import * as resolvers from "../resolvers/index.js";

export const Asset = objectType({
  name: "Asset",
  definition(t) {
    t.implements("Entity");
    t.uuid("categoryId");
    t.string("name");
    t.string("notes");
    t.field("stats", { type: "CategoryStats" });
  },
});

export const AssetCollection = objectType({
  name: "AssetCollection",
  definition(t) {
    t.implements("EntityCollectionByPage");
    t.nonNull.list.nonNull.field("items", { type: "Asset" });
  },
});

export const AssetCollectionInputFilter = inputObjectType({
  name: "AssetCollectionInputFilter",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
  },
});

export const AssetCollectionInput = inputObjectType({
  name: "AssetCollectionInput",
  definition(t) {
    defineEntityCollectionByPageInput(t);
    t.nonNull.field("filter", { type: nonNull("AssetCollectionInputFilter") });
  },
});

export const AssetCreateInput = inputObjectType({
  name: "AssetCreateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.string("name");
    t.string("notes");
  },
});

/*
 * Queries
 */
export const assetCollection = queryField("assetCollection", {
  type: "AssetCollection",
  args: { input: nonNull("AssetCollectionInput") },
  resolve: resolvers.assetCollection,
});

export const assetByName = queryField("assetByName", {
  type: "Asset",
  args: {
    categoryTitle: nonNull("String"),
    name: nonNull("String"),
  },
  resolve: resolvers.assetByName,
});

/* 
 * Mutations
 */
export const assetCreate = mutationField("assetCreate", {
  type: "Asset",
  args: { input: nonNull("AssetCreateInput") },
  resolve: resolvers.assetCreate,
});
