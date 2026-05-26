import { CATEGORY_LABEL } from "../constants/category.js";
import { db } from "../db/index.js";
import {
  findAsset,
  findAssetRecord,
  findCategory,
  flattenAssetForList,
} from "./asset.js";
import { mapOperatingLine } from "./operating-asset-line.js";

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

function formatMoney(amount) {
  const absolute = Math.abs(amount);
  return `$${absolute.toLocaleString("en-US")}`;
}

async function loadOperatingLines(assetId) {
  return db.OperatingAssetLine.findMany({
    where: { assetId },
    orderBy: { createdAt: "desc" },
  });
}

function computeOperatingNetIncome(lines) {
  return lines.reduce((total, line) => {
    const value = parseMoney(line.value);
    const type = String(line.type).toLowerCase();

    return type === "income" ? total + value : total - value;
  }, 0);
}

function subtypeDetailFromInput(input) {
  return {
    name: input.name,
    notes: input.notes ?? "",
    netIncome: input.netIncome,
    incomeShare: input.incomeShare,
  };
}

async function attachOperatingSubtype(category, asset, input) {
  if (asset.investmentAsset ?? asset.operatingAsset ?? asset.dualPurposeAsset) {
    throw new Error("Asset details already exist");
  }

  await db.OperatingAsset.create({
    data: {
      assetId: asset.id,
      ...subtypeDetailFromInput(input),
    },
  });

  const updated = await findAssetRecord(category.id, asset.id);

  return flattenAssetForList(updated, category.label);
}

/*
 * Query
 */

export const operatingAsset = async (...payload) => {
  const [, args] = payload;
  const category = await findCategory(args.input.category.id);

  if (!category || category.label !== CATEGORY_LABEL.OPERATING) {
    return null;
  }

  const asset = await findAsset(category, args.input.asset.id);

  if (!asset) {
    return null;
  }

  const lines = (await loadOperatingLines(asset.id)).map(mapOperatingLine);
  const netIncomeAmount = computeOperatingNetIncome(lines);

  return {
    categoryId: category.id,
    categoryTitle: category.title,
    categoryLabel: category.label,
    id: asset.id,
    name: asset.name,
    notes: asset.notes,
    netIncome: formatMoney(netIncomeAmount),
    incomeShare: asset.incomeShare,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    stats: {
      amount: netIncomeAmount,
      share: parseShare(asset.incomeShare),
    },
    lines,
  };
};

/*
 * Mutations
 */

export const operatingAssetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;
  const asset = await findAssetRecord(input.category.id, input.asset.id);

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (!asset.category || asset.category.label !== CATEGORY_LABEL.OPERATING) {
    throw new Error(
      `Category not found or not a ${CATEGORY_LABEL.OPERATING} category`,
    );
  }

  return attachOperatingSubtype(asset.category, asset, input);
};
