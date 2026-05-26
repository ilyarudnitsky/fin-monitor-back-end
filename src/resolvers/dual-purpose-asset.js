import { CATEGORY_LABEL } from "../constants/category.js";
import { db } from "../db/index.js";
import {
  findAsset,
  findAssetRecord,
  findCategory,
  flattenAssetForList,
} from "./asset.js";

function subtypeDetailFromInput(input) {
  return {
    name: input.name,
    notes: input.notes ?? "",
    netIncome: input.netIncome,
    incomeShare: input.incomeShare,
  };
}

async function attachDualPurposeSubtype(category, asset, input) {
  if (asset.investmentAsset ?? asset.operatingAsset ?? asset.dualPurposeAsset) {
    throw new Error("Asset details already exist");
  }

  await db.DualPurposeAsset.create({
    data: {
      assetId: asset.id,
      ...subtypeDetailFromInput(input),
    },
  });

  const updated = await findAssetRecord(category.id, asset.id);

  return flattenAssetForList(updated, category.label);
}

/*
 * Query
 */

export const dualPurposeAsset = async (...payload) => {
  const [, args] = payload;
  const category = await findCategory(args.input.category.id);

  if (!category || category.label !== CATEGORY_LABEL.DUAL_PURPOSE) {
    return null;
  }

  const asset = await findAsset(category, args.input.asset.id);

  if (!asset) {
    return null;
  }

  return asset;
};

/*
 * Mutations
 */

export const dualPurposeAssetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;
  const asset = await findAssetRecord(input.category.id, input.asset.id);

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (!asset.category || asset.category.label !== CATEGORY_LABEL.DUAL_PURPOSE) {
    throw new Error(
      `Category not found or not a ${CATEGORY_LABEL.DUAL_PURPOSE} category`,
    );
  }

  return attachDualPurposeSubtype(asset.category, asset, input);
};
