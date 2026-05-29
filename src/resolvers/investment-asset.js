import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import { mapSortToOrderBy } from "../lib/collection-sort.js";
import { buildUpdateData } from "../lib/patch-input.js";
import {
  normalizeAmountWithUnitValue,
  normalizeMoneyValue,
  normalizeQuantityValue,
} from "../lib/money.js";

export const investmentAsset = async (...payload) => {
  const [, args] = payload;

  const result = await db.InvestmentAsset.findFirst({
    where: { assetId: args.input.asset.id },
    include: { asset: true },
  });

  return result;
};

export const investmentAssetCollection = async (...payload) => {
  const [, args] = payload;
  const { asset } = args.input.filter;

  const result = await db.InvestmentAsset.paginate({
    where: { assetId: asset.id },
    orderBy: mapSortToOrderBy(args.input?.sort),
    limit: args.input.limit ?? COLLECTION_DEFAULT_LIMIT,
    page: args.input.page ?? 1,
  });

  return result;
};

export const investmentAssetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  const result = await db.InvestmentAsset.create({
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

export const investmentAssetUpdate = async (...payload) => {
  const [, args] = payload;
  const { id, amount, quantity, price, commission, ...fields } = args.input;

  const data = buildUpdateData(
    {
      ...fields,
      ...(amount != null ? { amount: normalizeAmountWithUnitValue(amount) } : {}),
      ...(quantity != null ? { quantity: normalizeQuantityValue(quantity) } : {}),
      ...(price != null ? { price: normalizeMoneyValue(price) } : {}),
      ...(commission != null ? { commission: normalizeMoneyValue(commission) } : {}),
    },
    "investmentAssetUpdate requires at least one field to update",
  );

  return db.InvestmentAsset.update({
    where: { id },
    data,
  });
};

export const investmentAssetDelete = async (...payload) => {
  const [, args] = payload;

  return db.InvestmentAsset.delete({
    where: { id: args.input.id },
  });
};
