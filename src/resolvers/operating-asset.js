import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import { mapSortToOrderBy } from "../lib/collection-sort.js";
import { buildUpdateData } from "../lib/patch-input.js";
import { normalizeMoneyValue } from "../lib/money.js";

/*
 * Query
 */
export const operatingAsset = async (...payload) => {
  const [, args] = payload;

  const result = await db.OperatingAsset.findUnique({
    where: { id: args.input.id },
    include: { asset: true },
  });
  
  return result;
};

export const operatingAssetCollection = async (...payload) => {
  const [, args] = payload;
  const { asset } = args.input.filter;

  const result = await db.OperatingAsset.paginate({
    where: { assetId: asset.id },
    orderBy: mapSortToOrderBy(args.input?.sort),
    limit: args.input.limit ?? COLLECTION_DEFAULT_LIMIT,
    page: args.input.page ?? 1,
  });

  return result;
};

/*
 * Mutations
 */

export const operatingAssetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  const result = await db.OperatingAsset.create({
    data: {
      assetId: input.asset.id,
      type: input.type,
      value: normalizeMoneyValue(input.value),
      createdAt: input.createdAt,
      notes: input.notes,
    },
  });

  return result;
};

export const operatingAssetUpdate = async (...payload) => {
  const [, args] = payload;
  const { id, value, ...fields } = args.input;

  const data = buildUpdateData(
    {
      ...fields,
      ...(value != null ? { value: normalizeMoneyValue(value) } : {}),
    },
    "operatingAssetUpdate requires at least one field to update",
  );

  return db.OperatingAsset.update({
    where: { id },
    data,
  });
};

export const operatingAssetDelete = async (...payload) => {
  const [, args] = payload;

  return db.OperatingAsset.delete({
    where: { id: args.input.id },
  });
};
