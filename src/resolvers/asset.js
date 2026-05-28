import {
  ASSET_GRAPHQL_TYPE,
  CATEGORY_ASSET_GRAPHQL_TYPE,
} from "../constants/asset.js";
import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import * as include from "../include/index.js";

export async function findCategory(categoryId) {
  return db.Category.findUnique({
    where: { id: categoryId },
  });
}

export async function findAssetRecord(categoryId, assetId) {
  return db.Asset.findFirst({
    where: { id: assetId, categoryId },
    include: include.asset.withCategory,
  });
}

function assetListFields(asset, detail) {
  return {
    id: asset.id,
    createdAt: asset.createdAt,
    updatedAt: (detail ?? asset).updatedAt,
    categoryId: asset.categoryId,
  };
}

export function flattenAssetForList(asset, categoryLabel) {
  const detail =
    asset.investmentAsset ?? asset.operatingAsset ?? asset.dualPurposeAsset;

  if (!detail) {
    return {
      ...assetListFields(asset),
      name: asset.name,
      notes: asset.notes,
      __graphqlType: ASSET_GRAPHQL_TYPE.BASE,
    };
  }

  return {
    ...assetListFields(asset, detail),
    name: detail.name,
    notes: detail.notes,
    netIncome: detail.netIncome,
    incomeShare: detail.incomeShare,
    __graphqlType: CATEGORY_ASSET_GRAPHQL_TYPE[categoryLabel],
  };
}

export async function findAsset(category, assetId) {
  const asset = await findAssetRecord(category.id, assetId);

  if (!asset) {
    return null;
  }

  const flattened = flattenAssetForList(asset, category.label);

  if (flattened.__graphqlType === ASSET_GRAPHQL_TYPE.BASE) {
    return null;
  }

  return flattened;
}

/*
 * Query
 */

export const assetCollection = async (...payload) => {
  const [, args] = payload;
  const { filter, ...pagination } = args.input;

  const page = await db.Asset.paginate({
    where: { categoryId: filter.category.id },
    include: include.asset.withCategory,
    orderBy: { createdAt: "desc" },
    ...pagination,
    limit: pagination.limit ?? COLLECTION_DEFAULT_LIMIT,
  });

  const category = page.items.find((asset) => asset.category)?.category;

  const assets = page.items.map((asset) =>
    flattenAssetForList(asset, asset.category?.label ?? category?.label),
  );

  return {
    categoryId: filter.category.id,
    items: assets,
    meta: page.meta,
  };
};

/*
 * Mutations
 */

export const assetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  return db.Asset.create({
    data: {
      categoryId: args.input.category.id,
      name: args.input.name,
      notes: args.input.notes,
    },
  });
};
