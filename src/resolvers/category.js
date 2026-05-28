import { COLLECTION_DEFAULT_LIMIT } from "../constants/collection.js";
import { db } from "../db/index.js";
const ZERO_STATS = { amount: 0, share: 0 };

async function resolveCategoryStatsById(categoryId) {
  const rows = await db.$queryRaw`
    SELECT
      COALESCE(
        SUM(
          COALESCE(
            NULLIF(
              regexp_replace(
                COALESCE(
                  ia."amount",
                  oa."value",
                  da."amount",
                  '0'
                ),
                '[^0-9.-]',
                '',
                'g'
              ),
              ''
            )::double precision,
            0
          )
        ),
        0
      ) AS amount,
      0::double precision AS share
    FROM "Asset" a
    LEFT JOIN "InvestmentAsset" ia ON ia."assetId" = a."id"
    LEFT JOIN "OperatingAsset" oa ON oa."assetId" = a."id"
    LEFT JOIN "DualPurposeAsset" da ON da."assetId" = a."id"
    WHERE a."categoryId" = ${categoryId}
  `;

  const [stats] = rows ?? [];

  return {
    amount: Number(stats?.amount ?? 0),
    share: Number(stats?.share ?? 0),
  };
}

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
  const rows = await db.$queryRaw`
    SELECT
      c."id" AS id,
      c."label" AS label,
      c."title" AS title,
      c."createdAt" AS "createdAt",
      c."updatedAt" AS "updatedAt",
      json_build_object(
        'amount',
        COALESCE(
          SUM(
            COALESCE(
              NULLIF(
                regexp_replace(
                  COALESCE(
                    ia."amount",
                    oa."value",
                    da."amount",
                    '0'
                  ),
                  '[^0-9.-]',
                  '',
                  'g'
                ),
                ''
              )::double precision,
              0
            )
          ),
          0
        ),
        'share',
        0::double precision
      ) AS stats
    FROM "Category" c
    LEFT JOIN "Asset" a ON a."categoryId" = c."id"
    LEFT JOIN "InvestmentAsset" ia ON ia."assetId" = a."id"
    LEFT JOIN "OperatingAsset" oa ON oa."assetId" = a."id"
    LEFT JOIN "DualPurposeAsset" da ON da."assetId" = a."id"
    GROUP BY c."id", c."label", c."title", c."createdAt", c."updatedAt"
    ORDER BY c."title" ASC
  `;
  
  const categories = rows;

  const total = categories.length;
  const offset = (Math.max(page, 1) - 1) * limit;
  const items = categories.slice(offset, offset + limit);

  return { items, meta: buildPageMeta(total, page, limit) };
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
