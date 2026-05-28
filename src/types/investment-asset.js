import { objectType, inputObjectType, queryField, mutationField, nonNull } from "nexus";
import * as resolvers from "../resolvers/index.js";
import { defineEntityCollectionByPageInput } from "./entity.js";

export const InvestmentAsset = objectType({
  name: "InvestmentAsset",
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

export const InvestmentAssetCollection = objectType({
  name: "InvestmentAssetCollection",
  definition(t) {
    t.implements("EntityCollectionByPage");
    t.list.field("items", { type: "InvestmentAsset" });
  },
});

export const InvestmentAssetInput = inputObjectType({
  name: "InvestmentAssetInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
  },
});

export const InvestmentAssetCreateInput = inputObjectType({
  name: "InvestmentAssetCreateInput",
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

export const InvestmentAssetCollectionInput = inputObjectType({
  name: "InvestmentAssetCollectionInput",
  definition(t) {
    defineEntityCollectionByPageInput(t);
    t.nonNull.field("filter", { type: nonNull("InvestmentAssetCollectionInputFilter") });
  },
});

export const InvestmentAssetCollectionInputFilter = inputObjectType({
  name: "InvestmentAssetCollectionInputFilter",
  definition(t) {
    t.nonNull.field("asset", { type: "EntityInput" });
  },
});

export const investmentAsset = queryField("investmentAsset", {
  type: "InvestmentAsset",
  args: { input: nonNull("InvestmentAssetInput") },
  resolve: resolvers.investmentAsset,
});

export const investmentAssetCollection = queryField("investmentAssetCollection", {
  type: "InvestmentAssetCollection",
  args: { input: nonNull("InvestmentAssetCollectionInput") },
  resolve: resolvers.investmentAssetCollection,
});

export const investmentAssetCreate = mutationField("investmentAssetCreate", {
  type: "InvestmentAsset",
  args: { input: nonNull("InvestmentAssetCreateInput") },
  resolve: resolvers.investmentAssetCreate,
});
