import { inputObjectType, queryField, mutationField, nonNull } from "nexus";
import * as resolvers from "../resolvers/index.js";

export const DualPurposeAssetCreateInput = inputObjectType({
  name: "DualPurposeAssetCreateInput",
  definition(t) {
    t.nonNull.field("category", { type: "EntityInput" });
    t.nonNull.field("asset", { type: "EntityInput" });
    t.nonNull.string("name");
    t.string("notes");
    t.nonNull.string("netIncome");
    t.nonNull.string("incomeShare");
  },
});

export const dualPurposeAsset = queryField("dualPurposeAsset", {
  type: "DualPurposeAsset",
  args: { input: nonNull("AssetLookupInput") },
  resolve: resolvers.dualPurposeAsset,
});

export const dualPurposeAssetCreate = mutationField("dualPurposeAssetCreate", {
  type: "DualPurposeAsset",
  args: { input: nonNull("DualPurposeAssetCreateInput") },
  resolve: resolvers.dualPurposeAssetCreate,
});
