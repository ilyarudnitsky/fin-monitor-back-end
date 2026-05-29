import { ASSET_GRAPHQL_TYPE } from "../constants/asset.js";
import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import { deleteAssetLines } from "../lib/delete-cascades.js";
import { buildUpdateData } from "../lib/patch-input.js";
import { mapSortToOrderBy } from "../lib/collection-sort.js";
import * as include from "../include/index.js";
import {
  resolveAssetStats,
  resolveCategoryAssetsStats,
  ZERO_STATS,
} from "../services/finance-stats.js";

export { resolveAssetStats };

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

export async function findAssetByName(categoryTitle, name) {
  const category = await db.Category.findUnique({
    where: { title: categoryTitle },
  });

  if (!category) {
    return null;
  }

  return db.Asset.findFirst({
    where: { categoryId: category.id, name },
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

export function flattenAssetForList(asset, _categoryLabel) {
  const detail =
    asset.investmentAsset ?? asset.operatingAsset ?? asset.dualPurposeAsset;

  // Name/notes live on Asset; OperatingAsset/InvestmentAsset/DualPurposeAsset rows are lines.
  return {
    ...assetListFields(asset, detail),
    name: asset.name,
    notes: asset.notes,
    __graphqlType: ASSET_GRAPHQL_TYPE.BASE,
  };
}

export async function findAsset(category, assetId) {
  const asset = await findAssetRecord(category.id, assetId);

  if (!asset) {
    return null;
  }

  return flattenAssetForList(asset, category.type);
}

/*
 * Query
 */

export const assetByName = async (...payload) => {
  const [, args] = payload;
  const asset = await findAssetByName(args.categoryTitle, args.name);

  if (!asset) {
    return null;
  }

  const stats = await resolveAssetStats(asset.id, asset.categoryId);

  return {
    id: asset.id,
    categoryId: asset.categoryId,
    name: asset.name,
    notes: asset.notes,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    stats: stats ?? ZERO_STATS,
  };
};

export const assetCollection = async (...payload) => {
  const [, args] = payload;
  const { filter, ...pagination } = args.input;
  const categoryId = filter.category.id;

  const page = await db.Asset.paginate({
    where: { categoryId },
    include: include.asset.withCategory,
    orderBy: mapSortToOrderBy(args.input?.sort),
    ...pagination,
    limit: pagination.limit ?? COLLECTION_DEFAULT_LIMIT,
  });

  const category = page.items.find((asset) => asset.category)?.category;
  const statsByAssetId = await resolveCategoryAssetsStats(categoryId);

  const items = page.items.map((asset) => {
    const flattened = flattenAssetForList(
      asset,
      asset.category?.type ?? category?.type,
    );

    return {
      ...flattened,
      stats: statsByAssetId.get(asset.id) ?? ZERO_STATS,
    };
  });

  return {
    categoryId,
    items,
    meta: page.meta,
  };
};

/*
 * Mutations
 */

export const assetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  const result = await db.Asset.create({
    data: {
      categoryId: args.input.category.id,
      name: args.input.name,
      notes: args.input.notes,
    },
  });

  return result;
};

export const assetUpdate = async (...payload) => {
  const [, args] = payload;
  const { id, ...fields } = args.input;

  const data = buildUpdateData(
    fields,
    "assetUpdate requires at least one field to update",
  );

  return db.Asset.update({
    where: { id },
    data,
  });
};

export const assetDelete = async (...payload) => {
  const [, args] = payload;
  const { id } = args.input;

  await deleteAssetLines(id);

  return db.Asset.delete({
    where: { id },
  });
};
