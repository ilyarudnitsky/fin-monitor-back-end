import {
  objectType,
  inputObjectType,
  queryField,
  mutationField,
  nonNull,
} from "nexus";
import * as resolvers from "../resolvers/index.js";

export const OperatingAssetDetail = objectType({
  name: "OperatingAssetDetail",
  definition(t) {
    t.implements("Entity");
    t.nonNull.uuid("categoryId");
    t.nonNull.string("categoryTitle");
    t.nonNull.string("categoryLabel");
    t.nonNull.string("name");
    t.string("notes");
    t.nonNull.string("netIncome");
    t.nonNull.string("incomeShare");
    t.nonNull.field("stats", { type: "CategoryStats" });
    t.nonNull.list.nonNull.field("lines", { type: "OperatingAssetLine" });
  },
});

export const OperatingAssetCreateInput = inputObjectType({
  name: "OperatingAssetCreateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.string("name");
    t.string("notes");
    t.nonNull.string("netIncome");
    t.nonNull.string("incomeShare");
  },
});

export const operatingAsset = queryField("operatingAsset", {
  type: "OperatingAssetDetail",
  args: { input: nonNull("AssetLookupInput") },
  resolve: resolvers.operatingAsset,
});

export const operatingAssetCreate = mutationField("operatingAssetCreate", {
  type: "OperatingAsset",
  args: { input: nonNull("OperatingAssetCreateInput") },
  resolve: resolvers.operatingAssetCreate,
});
