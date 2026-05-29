import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
import {
  resolveAllCategoryStatsMap,
  resolveCategoryStatsById,
  ZERO_STATS,
} from "../services/finance-stats.js";

function buildPageMeta(total, page, limit) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const normalizedPage = Math.min(Math.max(page, 1), pages);

  return {
    page: normalizedPage,
    pages,
    total,
  };
}

/*
 * Query
 */

export const categoryCollection = async (...payload) => {
  const [, args] = payload;
  const page = args.input.page ?? 1;
  const limit = args.input.limit ?? COLLECTION_DEFAULT_LIMIT;
  const labelFilter = args.input.filter?.label;

  const categories = await db.Category.findMany({
    orderBy: { title: "asc" },
    ...(labelFilter ? { where: { label: labelFilter } } : {}),
  });

  const statsByCategoryId = await resolveAllCategoryStatsMap();

  const items = categories.map((category) => ({
    ...category,
    stats: statsByCategoryId.get(category.id) ?? ZERO_STATS,
  }));

  const total = items.length;
  const offset = (Math.max(page, 1) - 1) * limit;
  const pageItems = items.slice(offset, offset + limit);

  return { items: pageItems, meta: buildPageMeta(total, page, limit) };
};

export const categoryByTitle = async (...payload) => {
  const [, args] = payload;

  const category = await db.Category.findUnique({
    where: { title: args.title },
  });

  if (!category) {
    return null;
  }

  const stats = await resolveCategoryStatsById(category.id);

  return {
    ...category,
    stats: stats ?? ZERO_STATS,
  };
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

  return {
    ...category,
    stats: ZERO_STATS,
  };
};
