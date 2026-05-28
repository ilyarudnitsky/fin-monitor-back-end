import { db } from "../db/index.js";

const ZERO_STATS = { amount: 0, share: 0 };

function shareFromAmount(amount, denominator) {
  if (denominator === 0) {
    return 0;
  }

  return (amount / denominator) * 100;
}

function absTotal(entries) {
  return entries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
}

async function queryAllSignedAmountsByAsset() {
  const rows = await db.$queryRaw`
    WITH line_values AS (
      SELECT
        a."categoryId",
        oa."assetId",
        oa."type",
        'operating'::text AS source,
        COALESCE(
          NULLIF(
            regexp_replace(oa."value", '[^0-9.-]', '', 'g'),
            ''
          )::double precision,
          0
        ) AS amount
      FROM "OperatingAsset" oa
      INNER JOIN "Asset" a ON a."id" = oa."assetId"

      UNION ALL

      SELECT
        a."categoryId",
        ia."assetId",
        ia."type",
        'investment'::text AS source,
        COALESCE(
          NULLIF(
            regexp_replace(ia."amount", '[^0-9.-]', '', 'g'),
            ''
          )::double precision,
          0
        ) AS amount
      FROM "InvestmentAsset" ia
      INNER JOIN "Asset" a ON a."id" = ia."assetId"

      UNION ALL

      SELECT
        a."categoryId",
        da."assetId",
        da."type",
        'dual'::text AS source,
        COALESCE(
          NULLIF(
            regexp_replace(da."amount", '[^0-9.-]', '', 'g'),
            ''
          )::double precision,
          0
        ) AS amount
      FROM "DualPurposeAsset" da
      INNER JOIN "Asset" a ON a."id" = da."assetId"
    ),
    signed_values AS (
      SELECT
        "categoryId",
        "assetId",
        CASE
          WHEN source = 'operating' AND LOWER(TRIM("type")) = 'expense' THEN -amount
          WHEN source IN ('investment', 'dual') AND LOWER(TRIM("type")) = 'sell' THEN -amount
          ELSE amount
        END AS amount
      FROM line_values
    )
    SELECT
      "categoryId",
      "assetId",
      COALESCE(SUM(amount), 0) AS amount
    FROM signed_values
    GROUP BY "categoryId", "assetId"
  `;

  return (rows ?? []).map((row) => ({
    categoryId: row.categoryId,
    assetId: row.assetId,
    amount: Number(row.amount ?? 0),
  }));
}

export async function resolveCategoryAssetsStats(categoryId) {
  const rows = (await queryAllSignedAmountsByAsset()).filter(
    (row) => row.categoryId === categoryId,
  );
  const absDenominator = absTotal(rows);
  const statsByAssetId = new Map();

  for (const row of rows) {
    statsByAssetId.set(row.assetId, {
      amount: row.amount,
      share: shareFromAmount(row.amount, absDenominator),
    });
  }

  const assets = await db.Asset.findMany({
    where: { categoryId },
    select: { id: true },
  });

  for (const asset of assets) {
    if (!statsByAssetId.has(asset.id)) {
      statsByAssetId.set(asset.id, ZERO_STATS);
    }
  }

  return statsByAssetId;
}

export async function resolveAssetStats(assetId, categoryId) {
  const statsByAssetId = await resolveCategoryAssetsStats(categoryId);

  return statsByAssetId.get(assetId) ?? ZERO_STATS;
}

export async function resolveAllCategoryStatsMap() {
  const rows = await queryAllSignedAmountsByAsset();
  const byCategory = new Map();

  for (const row of rows) {
    const current = byCategory.get(row.categoryId) ?? { amount: 0 };

    byCategory.set(row.categoryId, {
      amount: current.amount + row.amount,
    });
  }

  const categoryEntries = [...byCategory.entries()].map(([categoryId, { amount }]) => ({
    categoryId,
    amount,
  }));

  const absDenominator = absTotal(categoryEntries);
  const statsByCategoryId = new Map();

  for (const { categoryId, amount } of categoryEntries) {
    statsByCategoryId.set(categoryId, {
      amount,
      share: shareFromAmount(amount, absDenominator),
    });
  }

  return statsByCategoryId;
}

export async function resolveCategoryStatsById(categoryId) {
  const statsByCategoryId = await resolveAllCategoryStatsMap();

  return statsByCategoryId.get(categoryId) ?? ZERO_STATS;
}

export { ZERO_STATS };
