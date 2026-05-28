import { CATEGORY_LABEL } from "../constants/category.js";
import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import * as include from "../include/index.js";
import { flattenAssetForList } from "./asset.js";

function parseMoney(value) {
  if (value == null || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const normalized = String(value).replace(/[$,\s]/g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parseShare(value) {
  if (value == null || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const normalized = String(value).replace(/%/g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function sumParentMetrics(assets) {
  return assets.reduce(
    (totals, asset) => {
      totals.amount += parseMoney(asset.netIncome);
      totals.share += parseShare(asset.incomeShare);
      return totals;
    },
    { amount: 0, share: 0 },
  );
}

function computeCategoryMetrics(category) {
  const assets = (category.assets ?? []).map((asset) =>
    flattenAssetForList(asset, category.label),
  );
  const metrics = sumParentMetrics(assets);

  if (
    category.label === CATEGORY_LABEL.INVESTING ||
    category.label === CATEGORY_LABEL.DUAL_PURPOSE
  ) {
    metrics.investedAmount = metrics.amount;
    metrics.investedValue = metrics.amount;
  }

  return {
    id: category.id,
    label: category.label,
    title: category.title,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    metrics,
  };
}

/*
 * Query
 */

export const categoryCollection = async (...payload) => {
  const [, args] = payload;

  const result = await db.Category.paginate({
    include: include.category.collection,
    orderBy: { title: "asc" },
    ...args.input,
    limit: args.input.limit ?? COLLECTION_DEFAULT_LIMIT,
  });

  const items = result.items.map(computeCategoryMetrics);

  return { items, meta: result.meta };
};

export const categoryByTitle = async (...payload) => {
  const [, args] = payload;

  const category = await db.Category.findUnique({
    where: { title: args.title },
    include: include.category.collection,
  });

  if (!category) {
    return null;
  }

  return computeCategoryMetrics(category);
};

/*
 * Mutations
 */

export const categoryCreate = async (...payload) => {
  const [, args] = payload;

  const category = await db.Category.create({
    data: {
      title: args.input.title,
      label: args.input.label,
    },
  });

  return computeCategoryMetrics(category);
};
