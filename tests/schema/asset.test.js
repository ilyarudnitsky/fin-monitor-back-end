import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createFinanceDbMock } from "../helpers/mockDb.js";
import { validationErrors } from "../helpers/graphql.js";

const db = createFinanceDbMock();

jest.unstable_mockModule("../../src/db/index.js", () => ({ db }));

const { schema } = await import("../../src/types/index.js");

describe("Asset GraphQL schema (Nexus)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts assetCollection query filtered by category", () => {
    const errors = validationErrors(
      schema,
      `query {
        assetCollection(input: { filter: { category: { id: "11111111-1111-4111-8111-111111111111" } }, limit: 500 }) {
          categoryId
          categoryTitle
          categoryLabel
          stats { amount share }
          meta { page total pages }
          items {
            __typename
            ... on Asset {
              id
              name
              notes
              createdAt
              stats {
                amount
                share
              }
            }
          }
        }
      }`,
    );

    expect(errors).toEqual([]);
  });
});
