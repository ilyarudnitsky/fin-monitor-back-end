import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";

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
    orderBy: { createdAt: "desc" },
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
      amount: input.amount,
      quantity: input.quantity,
      price: input.price,
      commission: input.commission,
      createdAt: input.createdAt,
      notes: input.notes,
    },
  });

  return result;
};
