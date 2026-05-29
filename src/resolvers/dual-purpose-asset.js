import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import { mapSortToOrderBy } from "../lib/collection-sort.js";
import {
  normalizeAmountWithUnitValue,
  normalizeMoneyValue,
  normalizeQuantityValue,
} from "../lib/money.js";

export const dualPurposeAsset = async (...payload) => {
  const [, args] = payload;

  const result = await db.DualPurposeAsset.findFirst({
    where: { assetId: args.input.asset.id },
    include: { asset: true },
  });

  return result;
};

export const dualPurposeAssetCollection = async (...payload) => {
  const [, args] = payload;
  const { asset } = args.input.filter;

  const result = await db.DualPurposeAsset.paginate({
    where: { assetId: asset.id },
    orderBy: mapSortToOrderBy(args.input?.sort),
    limit: args.input.limit ?? COLLECTION_DEFAULT_LIMIT,
    page: args.input.page ?? 1,
  });

  return result;
};

export const dualPurposeAssetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  const result = await db.DualPurposeAsset.create({
    data: {
      assetId: input.asset.id,
      type: input.type,
      amount: normalizeAmountWithUnitValue(input.amount),
      quantity: normalizeQuantityValue(input.quantity),
      price: normalizeMoneyValue(input.price),
      commission: normalizeMoneyValue(input.commission),
      createdAt: input.createdAt,
      notes: input.notes,
    },
  });

  return result;
};
