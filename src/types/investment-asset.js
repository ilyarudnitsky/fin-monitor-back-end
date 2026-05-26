import {
  objectType,
  inputObjectType,
  queryField,
  mutationField,
  nonNull,
} from "nexus";
import * as resolvers from "../resolvers/index.js";

export const InvestmentAssetDetail = objectType({
  name: "InvestmentAssetDetail",
  definition(t) {
    t.implements("Entity");
    t.nonNull.uuid("categoryId");
    t.nonNull.string("categoryTitle");
    t.nonNull.string("name");
    t.string("notes");
    t.nonNull.string("netIncome");
    t.nonNull.string("incomeShare");
    t.nonNull.list.nonNull.field("stats", { type: "DisplayStat" });
    t.nonNull.list.nonNull.field("lines", { type: "InvestmentAssetLine" });
  },
});

export const InvestmentAssetStatisticsDetail = objectType({
  name: "InvestmentAssetStatisticsDetail",
  definition(t) {
    t.implements("Entity");
    t.nonNull.uuid("categoryId");
    t.nonNull.string("categoryTitle");
    t.nonNull.string("name");
    t.string("notes");
    t.nonNull.string("netIncome");
    t.nonNull.string("incomeShare");
    t.nonNull.list.nonNull.field("stats", { type: "DisplayStat" });
    t.nonNull.list.nonNull.field("detailedStats", { type: "DetailedStatColumn" });
  },
});

export const AssetLookupInput = inputObjectType({
  name: "AssetLookupInput",
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
    t.nonNull.string("name");
    t.string("notes");
    t.nonNull.string("netIncome");
    t.nonNull.string("incomeShare");
  },
});

export const investmentAsset = queryField("investmentAsset", {
  type: "InvestmentAssetDetail",
  args: { input: nonNull("AssetLookupInput") },
  resolve: resolvers.investmentAsset,
});

export const investmentAssetStatistics = queryField("investmentAssetStatistics", {
  type: "InvestmentAssetStatisticsDetail",
  args: { input: nonNull("AssetLookupInput") },
  resolve: resolvers.investmentAssetStatistics,
});

export const investmentAssetCreate = mutationField("investmentAssetCreate", {
  type: "InvestmentAsset",
  args: { input: nonNull("InvestmentAssetCreateInput") },
  resolve: resolvers.investmentAssetCreate,
});
