import {
  objectType,
  inputObjectType,
  mutationField,
  nonNull,
} from "nexus";
import * as resolvers from "../resolvers/index.js";

export const InvestmentAssetLine = objectType({
  name: "InvestmentAssetLine",
  definition(t) {
    t.implements("Entity");
    t.nonNull.uuid("assetId");
    t.nonNull.string("type");
    t.nonNull.string("amount");
    t.nonNull.string("quantity");
    t.nonNull.string("price");
    t.nonNull.string("commission");
    t.string("notes");
  },
});

export const InvestmentAssetLineCreateInput = inputObjectType({
  name: "InvestmentAssetLineCreateInput",
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

export const InvestmentAssetLineUpdateInput = inputObjectType({
  name: "InvestmentAssetLineUpdateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.field("line", { type: "EntityInput" });
    t.nonNull.string("type");
    t.nonNull.string("amount");
    t.nonNull.string("quantity");
    t.nonNull.string("price");
    t.nonNull.string("commission");
    t.nonNull.dateTime("createdAt");
    t.string("notes");
  },
});

export const InvestmentAssetLineDeleteInput = inputObjectType({
  name: "InvestmentAssetLineDeleteInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.field("line", { type: "EntityInput" });
  },
});

export const investmentAssetLineCreate = mutationField(
  "investmentAssetLineCreate",
  {
    type: "InvestmentAssetLine",
    args: { input: nonNull("InvestmentAssetLineCreateInput") },
    resolve: resolvers.investmentAssetLineCreate,
  },
);

export const investmentAssetLineUpdate = mutationField(
  "investmentAssetLineUpdate",
  {
    type: "InvestmentAssetLine",
    args: { input: nonNull("InvestmentAssetLineUpdateInput") },
    resolve: resolvers.investmentAssetLineUpdate,
  },
);

export const investmentAssetLineDelete = mutationField(
  "investmentAssetLineDelete",
  {
    type: "InvestmentAssetLine",
    args: { input: nonNull("InvestmentAssetLineDeleteInput") },
    resolve: resolvers.investmentAssetLineDelete,
  },
);
