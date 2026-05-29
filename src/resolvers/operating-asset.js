import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";

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
    orderBy: { createdAt: "desc" },
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
      value: input.value,
      createdAt: input.createdAt,
      notes: input.notes,
    },
  });

  return result;
};
