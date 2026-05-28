import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createFinanceDbMock } from "../helpers/mockDb.js";
import {
  validationErrors,
  executeOperation,
} from "../helpers/graphql.js";

const db = createFinanceDbMock();

jest.unstable_mockModule("../../src/db/index.js", () => ({ db }));

const { schema } = await import("../../src/types/index.js");

describe("Category GraphQL schema (Nexus)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validation", () => {
    it("accepts categoryCollection query", () => {
      const errors = validationErrors(
        schema,
        `query {
          categoryCollection(input: { limit: 500 }) {
            items {
              id
              label
              title
              metrics { amount share investedAmount investedValue }
            }
            meta { page total pages }
          }
        }`,
      );

      expect(errors).toEqual([]);
    });

    it("accepts investmentAssetStatistics with nested detailedStats", () => {
      const errors = validationErrors(
        schema,
        `query {
          investmentAssetStatistics(
            input: {
              category: { id: "11111111-1111-4111-8111-111111111111" }
              asset: { id: "00000000-0000-4000-8000-000000000001" }
            }
          ) {
            id
            name
            detailedStats {
              items { label value tone change }
            }
          }
        }`,
      );

      expect(errors).toEqual([]);
    });

    it("accepts category and asset mutations", () => {
      const errors = validationErrors(
        schema,
        `mutation {
          categoryCreate(input: { title: "Stocks", label: "Investing Asset" }) {
            id
            title
            label
          }
          assetCreate(
            input: {
              category: { id: "11111111-1111-4111-8111-111111111111" }
            }
          ) {
            id
            createdAt
          }
          investmentAssetCreate(
            input: {
              category: { id: "11111111-1111-4111-8111-111111111111" }
              asset: { id: "00000000-0000-4000-8000-000000000001" }
              name: "AAPL"
              notes: "Notes"
              netIncome: "$0"
              incomeShare: "0%"
            }
          ) {
            id
            name
          }
        }`,
      );

      expect(errors).toEqual([]);
    });
  });

  describe("execution", () => {
    it("returns categories from the resolver", async () => {
      db.Category.paginate.mockResolvedValue({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            label: "Investing Asset",
            title: "Stocks",
            assets: [],
          },
        ],
        meta: { page: 1, total: 1, pages: 1 },
      });

      const result = await executeOperation(
        schema,
        `query {
          categoryCollection(input: { limit: 10 }) {
            items {
              id
              title
              label
              metrics { amount share investedAmount investedValue }
            }
            meta { page total pages }
          }
        }`,
      );

      expect(result.errors).toBeUndefined();
      expect(result.data.categoryCollection.items).toEqual([
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Stocks",
          label: "Investing Asset",
          metrics: { amount: 0, share: 0, investedAmount: 0, investedValue: 0 },
        },
      ]);
    });

    it("returns zero metrics from categoryCreate without loaded assets", async () => {
      db.Category.create.mockResolvedValue({
        id: "22222222-2222-4222-8222-222222222222",
        label: "Operating Asset",
        title: "Rental",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const result = await executeOperation(
        schema,
        `mutation {
          categoryCreate(input: { title: "Rental", label: "Operating Asset" }) {
            id
            title
            label
            metrics { amount share }
          }
        }`,
      );

      expect(result.errors).toBeUndefined();
      expect(result.data.categoryCreate.metrics).toEqual({ amount: 0, share: 0 });
    });
  });
});
