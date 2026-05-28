import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createFinanceDbMock } from "../helpers/mockDb.js";
import { validationErrors } from "../helpers/graphql.js";

const db = createFinanceDbMock();

jest.unstable_mockModule("../../src/db/index.js", () => ({ db }));

const { schema } = await import("../../src/types/index.js");

describe("Asset line GraphQL schema (Nexus)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts operatingAssetCollection", () => {
    const errors = validationErrors(
      schema,
      `query {
        operatingAssetCollection(
          input: {
            filter: { asset: { id: "00000000-0000-4000-8000-000000000001" } }
            limit: 500
          }
        ) {
          items {
            id
            type
            value
            createdAt
            notes
          }
        }
      }`,
    );

    expect(errors).toEqual([]);
  });

  it("accepts investmentAssetCollection", () => {
    const errors = validationErrors(
      schema,
      `query {
        investmentAssetCollection(
          input: {
            filter: { asset: { id: "00000000-0000-4000-8000-000000000001" } }
            limit: 500
          }
        ) {
          items {
            id
            type
            amount
            quantity
            price
            commission
            createdAt
            notes
          }
        }
      }`,
    );

    expect(errors).toEqual([]);
  });

  it("accepts line create mutations", () => {
    const errors = validationErrors(
      schema,
      `mutation {
        operatingAssetCreate(
          input: {
            category: { id: "22222222-2222-4222-8222-222222222222" }
            asset: { id: "00000000-0000-4000-8000-000000000001" }
            type: "income"
            value: "$1,000"
            createdAt: "2025-12-20T00:00:00.000Z"
            notes: "Notes"
          }
        ) {
          id
        }
        investmentAssetCreate(
          input: {
            category: { id: "33333333-3333-4333-8333-333333333333" }
            asset: { id: "00000000-0000-4000-8000-000000000001" }
            type: "buy"
            amount: "100 g"
            quantity: "2"
            price: "$1,000"
            commission: "$100"
            createdAt: "2025-12-20T00:00:00.000Z"
          }
        ) {
          id
        }
      }`,
    );

    expect(errors).toEqual([]);
  });
});
