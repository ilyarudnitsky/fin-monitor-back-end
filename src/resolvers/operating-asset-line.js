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

async function loadOperatingLines(assetId) {
  return db.OperatingAssetLine.findMany({
    where: { assetId },
    orderBy: { createdAt: "desc" },
  });
}

export function mapOperatingLine(line) {
  return {
    id: line.id,
    assetId: line.assetId,
    createdAt: line.createdAt,
    updatedAt: line.updatedAt,
    type: line.type,
    value: line.value,
    notes: line.notes ?? null,
  };
}

function computeOperatingNetIncome(lines) {
  return lines.reduce((total, line) => {
    const value = parseMoney(line.value);
    const type = String(line.type).toLowerCase();

    return type === "income" ? total + value : total - value;
  }, 0);
}

async function assertAssetWithOperatingSubtype(categoryId, assetId) {
  const asset = await findAssetRecord(categoryId, assetId);

  if (!asset?.operatingAsset) {
    throw new Error("Operating asset not found");
  }

  return asset;
}

async function syncOperatingAssetMetrics(assetId) {
  const operating = await db.OperatingAsset.findUnique({
    where: { assetId },
  });

  if (!operating) {
    return;
  }

  const lines = await loadOperatingLines(assetId);
  const amount = computeOperatingNetIncome(lines);

  await db.OperatingAsset.update({
    where: { assetId },
    data: { netIncome: formatMoney(amount) },
  });
}

function linePayload(input) {
  return {
    type: input.type,
    value: input.value,
    createdAt: input.createdAt,
    notes: input.notes ?? "",
  };
}

export const operatingAssetLineCreate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  await assertAssetWithOperatingSubtype(input.category.id, input.asset.id);

  const line = await db.OperatingAssetLine.create({
    data: {
      assetId: input.asset.id,
      ...linePayload(input),
    },
  });

  await syncOperatingAssetMetrics(input.asset.id);

  return mapOperatingLine(line);
};

export const operatingAssetLineUpdate = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  await assertAssetWithOperatingSubtype(input.category.id, input.asset.id);

  const line = await db.OperatingAssetLine.update({
    where: { id: input.line.id },
    data: linePayload(input),
  });

  await syncOperatingAssetMetrics(input.asset.id);

  return mapOperatingLine(line);
};

export const operatingAssetLineDelete = async (...payload) => {
  const [, args] = payload;
  const { input } = args;

  await assertAssetWithOperatingSubtype(input.category.id, input.asset.id);

  const line = await db.OperatingAssetLine.delete({
    where: { id: input.line.id },
  });

  await syncOperatingAssetMetrics(input.asset.id);

  return mapOperatingLine(line);
};
