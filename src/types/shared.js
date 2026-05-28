import { objectType, unionType } from "nexus";
import { ASSET_GRAPHQL_TYPE } from "../constants/asset.js";

export const CategoryMetrics = objectType({
  name: "CategoryMetrics",
  definition(t) {
    t.nonNull.float("amount");
    t.nonNull.float("share");
    t.float("investedAmount");
    t.float("investedValue");
  },
});

export const CategoryStats = objectType({
  name: "CategoryStats",
  definition(t) {
    t.nonNull.float("amount");
    t.nonNull.float("share");
  },
});

export const DisplayStat = objectType({
  name: "DisplayStat",
  definition(t) {
    t.nonNull.string("label");
    t.nonNull.string("value");
    t.string("tone");
    t.string("icon");
    t.string("badge");
  },
});

export const DetailedStat = objectType({
  name: "DetailedStat",
  definition(t) {
    t.nonNull.string("label");
    t.nonNull.string("value");
    t.string("tone");
    t.string("change");
  },
});

export const DetailedStatColumn = objectType({
  name: "DetailedStatColumn",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: "DetailedStat" });
  },
});

export const CategoryAsset = unionType({
  name: "CategoryAsset",
  definition(t) {
    t.members("Asset");
  },
  resolveType(item) {
    return item.__graphqlType ?? ASSET_GRAPHQL_TYPE.BASE;
  },
});
