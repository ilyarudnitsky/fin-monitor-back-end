import { CATEGORY_LABEL } from "../constants/category.js";
import { db } from "../db/index.js";
import {
  findAsset,
  findAssetRecord,
  findCategory,
  flattenAssetForList,
} from "./asset.js";
import { mapInvestmentLine } from "./investment-asset-line.js";

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

function formatShare(share) {
  return `${share}%`;
}

function metricTone(amount, variant = "primary") {
  const negative = amount < 0;

  if (variant === "primary") {
    return negative ? "negative" : "positive";
  }

  return negative ? "neutral-negative" : "neutral-positive";
}

function buildInvestmentDisplayStats({
  amount,
  share,
  investedAmount = 0,
  investedValue = 0,
}) {
  const shareTone = metricTone(amount, "share");

  return [
    {
      label: amount < 0 ? "Loss" : "Profit",
      value: formatMoney(amount),
      tone: metricTone(amount, "primary"),
      icon: amount < 0 ? "lineDown" : "lineUp",
      badge: true,
    },
    {
      label: "Income Share",
      value: formatShare(share),
      tone: shareTone,
      icon: "pie",
      badge: null,
    },
    {
      label: "Invested Amount",
      value: formatMoney(investedAmount),
      tone: shareTone,
      icon: "briefcase",
      badge: null,
    },
    {
      label: "Invested Value",
      value: formatMoney(investedValue),
      tone: shareTone,
      icon: "wallet",
      badge: null,
    },
  ];
}

function buildDetailedStatColumns(amount, share) {
  const primaryTone = metricTone(amount, "primary");
  const shareTone = metricTone(amount, "share");

  return [
    [
      { label: "Profit / Loss", value: formatMoney(amount), tone: primaryTone, change: null },
      { label: "Income Share", value: formatShare(share), tone: shareTone, change: null },
      { label: "Net Position", value: formatMoney(amount), tone: primaryTone, change: null },
    ],
    [
      { label: "Realized", value: formatMoney(amount * 0.4), tone: primaryTone, change: "+2.1%" },
      { label: "Unrealized", value: formatMoney(amount * 0.6), tone: shareTone, change: "-0.8%" },
      { label: "Total Return", value: formatShare(share), tone: shareTone, change: "+1.3%" },
    ],
    [
      { label: "Cost Basis", value: formatMoney(Math.abs(amount) * 0.7), tone: "neutral-positive", change: null },
      { label: "Market Value", value: formatMoney(Math.abs(amount) * 1.1), tone: primaryTone, change: null },
      { label: "Commission", value: formatMoney(Math.abs(amount) * 0.02), tone: "neutral-negative", change: null },
    ],
  ];
}

function lineTradeTotal(line) {
  const qty = parseMoney(line.quantity);
  const price = parseMoney(line.price);
  const commission = parseMoney(line.commission);

  return qty * price + commission;
}

function computeInvestmentMetrics(lines) {
  return lines.reduce(
    (totals, line) => {
      const total = lineTradeTotal(line);
      const type = String(line.type).toLowerCase();

      if (type === "buy") {
        totals.investedAmount += total;
        totals.profit -= total;
      } else {
        totals.profit += total;
      }

      totals.investedValue = totals.investedAmount + totals.profit;
      return totals;
    },
    { profit: 0, investedAmount: 0, investedValue: 0 },
  );
}

async function loadInvestmentLines(assetId) {
  return db.InvestmentAssetLine.findMany({
    where: { assetId },
    orderBy: { createdAt: "desc" },
  });
}

function subtypeDetailFromInput(input) {
  return {
    name: input.name,
    notes: input.notes ?? "",
    netIncome: input.netIncome,
    incomeShare: input.incomeShare,
  };
}

async function attachInvestmentSubtype(category, asset, input) {
  if (asset.investmentAsset ?? asset.operatingAsset ?? asset.dualPurposeAsset) {
    throw new Error("Asset details already exist");
  }

  await db.InvestmentAsset.create({
    data: {
      assetId: asset.id,
      ...subtypeDetailFromInput(input),
    },
  });

  const updated = await findAssetRecord(category.id, asset.id);

  return flattenAssetForList(updated, category.label);
}

async function loadInvestmentDetail(category, asset) {
  const lines = (await loadInvestmentLines(asset.id)).map(mapInvestmentLine);
  const { profit, investedAmount, investedValue } =
    computeInvestmentMetrics(lines);
  const share = parseShare(asset.incomeShare);

  return {
    categoryId: category.id,
    categoryTitle: category.title,
    id: asset.id,
    name: asset.name,
    notes: asset.notes,
    netIncome: formatMoney(profit),
    incomeShare: asset.incomeShare,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    stats: buildInvestmentDisplayStats({
      amount: profit,
      share,
      investedAmount,
      investedValue,
    }),
    lines,
  };
}

/*
 * Query
 */

export const investmentAsset = async (...payload) => {
  const [, args] = payload;
  const category = await findCategory(args.input.category.id);

  if (!category || category.label !== CATEGORY_LABEL.INVESTING) {
    return null;
  }

  const asset = await findAsset(category, args.input.asset.id);

  if (!asset) {
    return null;
  }

  return await loadInvestmentDetail(category, asset);
};

export const investmentAssetStatistics = async (...payload) => {
  const [, args] = payload;
  const category = await findCategory(args.input.category.id);

  if (!category || category.label !== CATEGORY_LABEL.INVESTING) {
    return null;
  }

  const asset = await findAsset(category, args.input.asset.id);

  if (!asset) {
    return null;
  }

  const detail = await loadInvestmentDetail(category, asset);
  const amount = parseMoney(detail.netIncome);
  const share = parseShare(detail.incomeShare);

  return {
    ...detail,
    detailedStats: buildDetailedStatColumns(amount, share),
  };
};

/*
 * Mutations
 */

export const investmentAssetCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;
  const asset = await findAssetRecord(input.category.id, input.asset.id);

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (!asset.category || asset.category.label !== CATEGORY_LABEL.INVESTING) {
    throw new Error(
      `Category not found or not a ${CATEGORY_LABEL.INVESTING} category`,
    );
  }

  return attachInvestmentSubtype(asset.category, asset, input);
};
