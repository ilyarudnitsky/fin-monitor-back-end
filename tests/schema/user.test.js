import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createUserDbMock } from "../helpers/mockDb.js";
import {
  validationErrors,
  executeOperation,
} from "../helpers/graphql.js";

const db = createUserDbMock();

jest.unstable_mockModule("../../src/db/index.js", () => ({ db }));

const { schema } = await import("../../src/types/index.js");

describe("User GraphQL schema (Nexus)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validation", () => {
    it("accepts a valid user query", () => {
      const errors = validationErrors(
        schema,
        `query {
          user(input: { id: "00000000-0000-4000-8000-000000000001" }) {
            id
            email
            name
            firstName
            lastName
          }
        }`,
      );

      expect(errors).toEqual([]);
    });

    it("accepts a valid userCollection query", () => {
      const errors = validationErrors(
        schema,
        `query {
          userCollection(input: { page: 1, limit: 10 }) {
            items { id email name firstName lastName }
            meta { page total pages }
          }
        }`,
      );

      expect(errors).toEqual([]);
    });

    it("accepts valid user mutations", () => {
      const errors = validationErrors(
        schema,
        `mutation {
          userCreate(input: { email: "a@example.com", name: "Alice" }) {
            id
          }
          userUpdate(input: { id: "00000000-0000-4000-8000-000000000001", firstName: "Bob" }) {
            id
          }
          userDelete(input: { id: "00000000-0000-4000-8000-000000000001" }) {
            id
          }
        }`,
      );

      expect(errors).toEqual([]);
    });

    it("accepts userCreate without firstName and lastName", () => {
      const errors = validationErrors(
        schema,
        `mutation {
          userCreate(input: { email: "a@example.com", name: "Alice" }) {
            id
            firstName
            lastName
          }
        }`,
      );

      expect(errors).toEqual([]);
    });

    it("rejects unknown root fields", () => {
      const errors = validationErrors(schema, `query { unknownField }`);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/Cannot query field/);
    });

    it("rejects user query without required input", () => {
      const errors = validationErrors(
        schema,
        `query { user { id } }`,
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/input/);
    });

    it("rejects userCreate with missing required fields", () => {
      const errors = validationErrors(
        schema,
        `mutation { userCreate(input: { email: "a@example.com" }) { id } }`,
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/name/);
    });

    it("rejects invalid selection on User", () => {
      const errors = validationErrors(
        schema,
        `query {
          user(input: { id: "00000000-0000-4000-8000-000000000001" }) {
            notAUserField
          }
        }`,
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/Cannot query field/);
    });
  });

  describe("execution", () => {
    it("returns null firstName and lastName when omitted in the database", async () => {
      const row = {
        id: "00000000-0000-4000-8000-000000000001",
        email: "a@example.com",
        name: "A",
        firstName: null,
        lastName: null,
      };
      db.User.findUnique.mockResolvedValue(row);

      const result = await executeOperation(
        schema,
        `query {
          user(input: { id: "00000000-0000-4000-8000-000000000001" }) {
            firstName
            lastName
          }
        }`,
      );

      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        user: { firstName: null, lastName: null },
      });
    });

    it("runs userCollection through the schema", async () => {
      const rows = [
        {
          id: "00000000-0000-4000-8000-000000000001",
          email: "a@example.com",
          name: "A",
          firstName: "Ann",
          lastName: "A",
        },
      ];
      db.User.paginate.mockResolvedValue({
        items: rows,
        meta: { page: 1, total: 1, pages: 1 },
      });
      const result = await executeOperation(
        schema,
        `query {
          userCollection(input: {}) {
            items { id email name firstName lastName }
            meta { page total pages }
          }
        }`,
      );

      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        userCollection: {
          items: rows,
          meta: { page: 1, total: 1, pages: 1 },
        },
      });
    });

    it("rejects execution without Authorization header", async () => {
      const result = await executeOperation(
        schema,
        `query {
          userCollection(input: {}) {
            items { id }
          }
        }`,
        { contextValue: { headers: {} } },
      );

      expect(result.data).toBeUndefined();
      expect(result.errors?.[0]?.message).toMatch(/Unauthorized/);
      expect(db.User.paginate).not.toHaveBeenCalled();
    });

    it("surfaces resolver errors on userUpdate with empty patch", async () => {
      const result = await executeOperation(
        schema,
        `mutation {
          userUpdate(input: { id: "00000000-0000-4000-8000-000000000001" }) {
            id
          }
        }`,
      );

      expect(result.data?.userUpdate).toBeNull();
      expect(result.errors?.[0]?.message).toMatch(
        /userUpdate requires at least one field to update/,
      );
    });
  });
});
