import { db } from "../db/index.js";

export async function deleteAssetLines(assetId) {
  await db.OperatingAsset.deleteMany({ where: { assetId } });
  await db.InvestmentAsset.deleteMany({ where: { assetId } });
  await db.DualPurposeAsset.deleteMany({ where: { assetId } });
}

export async function deleteCategoryWithAssets(categoryId) {
  const assets = await db.Asset.findMany({
    where: { categoryId },
    select: { id: true },
  });

  for (const asset of assets) {
    await deleteAssetLines(asset.id);
  }

  await db.Asset.deleteMany({ where: { categoryId } });
  return db.Category.delete({ where: { id: categoryId } });
}
