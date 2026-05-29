/**
 * Temporary seed script for infinite-scroll testing.
 *
 * Usage (from fin-monitor-back-end, DB must be up):
 *   node scripts/seed-many-items.mjs
 *
 * Env overrides (defaults are 100 each):
 *   SEED_CATEGORIES=100 SEED_ASSETS_PER_CATEGORY=100
 *   SEED_OPERATING_LINES=100 SEED_INVESTMENT_LINES=100 SEED_DUAL_PURPOSE_LINES=100
 *
 * Creates:
 * - Many categories (mixed types)
 * - Many assets per category
 * - Many lines on the first asset of each type (Operating / Investing / Dual-Purpose)
 *
 * Safe to re-run: titles/names are suffixed with timestamps.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { CATEGORY_TYPE } from "../src/constants/category.js";

const require = createRequire(import.meta.url);
const { createClient } = require("postgresql-orm");

const configPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../orm.config.json",
);

const SEED_COUNT = 100;

const CATEGORY_COUNT = Number(process.env.SEED_CATEGORIES ?? SEED_COUNT);
const ASSETS_PER_CATEGORY = Number(process.env.SEED_ASSETS_PER_CATEGORY ?? SEED_COUNT);
const OPERATING_LINES = Number(process.env.SEED_OPERATING_LINES ?? SEED_COUNT);
const INVESTMENT_LINES = Number(process.env.SEED_INVESTMENT_LINES ?? SEED_COUNT);
const DUAL_PURPOSE_LINES = Number(process.env.SEED_DUAL_PURPOSE_LINES ?? SEED_COUNT);

const CATEGORY_TYPES = [
  CATEGORY_TYPE.OPERATING,
  CATEGORY_TYPE.INVESTING,
  CATEGORY_TYPE.DUAL_PURPOSE,
];

const db = createClient({ configPath });
await db.$connect();

const runId = Date.now().toString(36);

console.log(`Seeding with runId=${runId} ...`);

const seedTargets = {
  [CATEGORY_TYPE.OPERATING]: { category: null, asset: null, lineCount: OPERATING_LINES },
  [CATEGORY_TYPE.INVESTING]: { category: null, asset: null, lineCount: INVESTMENT_LINES },
  [CATEGORY_TYPE.DUAL_PURPOSE]: { category: null, asset: null, lineCount: DUAL_PURPOSE_LINES },
};

for (let categoryIndex = 0; categoryIndex < CATEGORY_COUNT; categoryIndex += 1) {
  const type = CATEGORY_TYPES[categoryIndex % CATEGORY_TYPES.length];
  const title = `Seed Cat ${runId} #${categoryIndex + 1}`;

  const category = await db.Category.create({
    data: { title, type },
  });

  const target = seedTargets[type];

  if (target && !target.category) {
    target.category = category;
  }

  for (let assetIndex = 0; assetIndex < ASSETS_PER_CATEGORY; assetIndex += 1) {
    const asset = await db.Asset.create({
      data: {
        categoryId: category.id,
        name: `Asset ${runId} C${categoryIndex + 1}-${assetIndex + 1}`,
        notes: `Seeded asset ${assetIndex + 1}`,
      },
    });

    if (target?.category?.id === category.id && assetIndex === 0 && !target.asset) {
      target.asset = asset;
    }
  }
}

async function seedOperatingLines(asset, count) {
  const baseDate = Date.now();

  for (let lineIndex = 0; lineIndex < count; lineIndex += 1) {
    await db.OperatingAsset.create({
      data: {
        assetId: asset.id,
        type: lineIndex % 2 === 0 ? "Income" : "Expense",
        value: `${(lineIndex + 1) * 100}`,
        createdAt: new Date(baseDate - lineIndex * 60_000),
        notes: `Seed operating line ${lineIndex + 1}`,
      },
    });
  }
}

async function seedInvestmentStyleLines(Model, asset, count, label) {
  const baseDate = Date.now();

  for (let lineIndex = 0; lineIndex < count; lineIndex += 1) {
    await Model.create({
      data: {
        assetId: asset.id,
        type: lineIndex % 2 === 0 ? "Buy" : "Sell",
        amount: `${(lineIndex + 1) * 10}`,
        quantity: `${lineIndex + 1}`,
        price: `${(lineIndex + 1) * 5}`,
        commission: "0",
        createdAt: new Date(baseDate - lineIndex * 60_000),
        notes: `Seed ${label} line ${lineIndex + 1}`,
      },
    });
  }
}

for (const [type, target] of Object.entries(seedTargets)) {
  if (!target.category || !target.asset || target.lineCount < 1) {
    console.warn(`Skip ${type}: no category/asset or lineCount=0`);
    continue;
  }

  if (type === CATEGORY_TYPE.OPERATING) {
    await seedOperatingLines(target.asset, target.lineCount);
  } else if (type === CATEGORY_TYPE.INVESTING) {
    await seedInvestmentStyleLines(
      db.InvestmentAsset,
      target.asset,
      target.lineCount,
      "investment",
    );
  } else if (type === CATEGORY_TYPE.DUAL_PURPOSE) {
    await seedInvestmentStyleLines(
      db.DualPurposeAsset,
      target.asset,
      target.lineCount,
      "dual-purpose",
    );
  }

  console.log(
    `${type}: ${target.lineCount} lines on "${target.category.title}" / "${target.asset.name}"`,
  );
}

console.log(
  `Done: ${CATEGORY_COUNT} categories × ${ASSETS_PER_CATEGORY} assets (runId=${runId}).`,
);

await db.$disconnect();
