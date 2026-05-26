import { db } from "../db/index.js";
import { findAssetRecord } from "./asset.js";

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

function formatMoney(amount) {
  const absolute = Math.abs(amount);
  return `$${absolute.toLocaleString("en-US")}`;
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

export function mapInvestmentLine(line) {
  return {
    id: line.id,
    assetId: line.assetId,
    createdAt: line.createdAt,
    updatedAt: line.updatedAt,
    type: line.type,
    amount: line.amount,
    quantity: line.quantity,
    price: line.price,
    commission: line.commission,
    notes: line.notes ?? null,
  };
}

async function assertAssetWithInvestmentSubtype(categoryId, assetId) {
  const asset = await findAssetRecord(categoryId, assetId);

  if (!asset?.investmentAsset) {
    throw new Error("Investment asset not found");
  }

  return asset;
}

async function syncInvestmentAssetMetrics(assetId) {
  const investment = await db.InvestmentAsset.findUnique({
    where: { assetId },
  });

  if (!investment) {
    return;
  }

  const lines = await loadInvestmentLines(assetId);
  const { profit } = computeInvestmentMetrics(lines);

  await db.InvestmentAsset.update({
    where: { assetId },
    data: { netIncome: formatMoney(profit) },
  });
}

function linePayload(input) {
  return {
    type: input.type,
    amount: input.amount,
    quantity: input.quantity,
    price: input.price,
    commission: input.commission,
    createdAt: input.createdAt,
    notes: input.notes ?? "",
  };
}

export const investmentAssetLineCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  await assertAssetWithInvestmentSubtype(input.category.id, input.asset.id);

  const line = await db.InvestmentAssetLine.create({
    data: {
      assetId: input.asset.id,
      ...linePayload(input),
    },
  });

  await syncInvestmentAssetMetrics(input.asset.id);

  return mapInvestmentLine(line);
};

export const investmentAssetLineUpdate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  await assertAssetWithInvestmentSubtype(input.category.id, input.asset.id);

  const line = await db.InvestmentAssetLine.update({
    where: { id: input.line.id },
    data: linePayload(input),
  });

  await syncInvestmentAssetMetrics(input.asset.id);

  return mapInvestmentLine(line);
};

export const investmentAssetLineDelete = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  await assertAssetWithInvestmentSubtype(input.category.id, input.asset.id);

  const line = await db.InvestmentAssetLine.delete({
    where: { id: input.line.id },
  });

  await syncInvestmentAssetMetrics(input.asset.id);

  return mapInvestmentLine(line);
};
