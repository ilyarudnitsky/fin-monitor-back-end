import { jest } from "@jest/globals";

function createModelMock() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    paginate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export function createUserDbMock() {
  return {
    User: createModelMock(),
  };
}

export function createFinanceDbMock() {
  return {
    User: createModelMock(),
    Category: createModelMock(),
    Asset: createModelMock(),
    InvestmentAsset: createModelMock(),
    OperatingAsset: createModelMock(),
    DualPurposeAsset: createModelMock(),
    OperatingAssetLine: createModelMock(),
    InvestmentAssetLine: createModelMock(),
  };
}
