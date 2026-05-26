import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { createUserDbMock } from "../helpers/mockDb.js";

const db = createUserDbMock();

jest.unstable_mockModule("../../src/db/index.js", () => ({ db }));

const {
  user,
  userCollection,
  userCreate,
  userUpdate,
  userDelete,
} = await import("../../src/resolvers/user.js");

describe("user resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("user", () => {
    it("loads a user by id", async () => {
      const row = {
        id: "00000000-0000-4000-8000-000000000001",
        email: "alice@example.com",
        name: "Alice",
        firstName: "Alice",
        lastName: "Smith",
      };
      db.User.findUnique.mockResolvedValue(row);

      const result = await user(null, { input: { id: row.id } });

      expect(db.User.findUnique).toHaveBeenCalledWith({
        where: { id: row.id },
      });
      expect(result).toEqual(row);
    });
  });

  describe("userCollection", () => {
    it("returns paginate result from the ORM", async () => {
      const rows = [
        {
          id: "1",
          email: "a@example.com",
          name: "A",
          firstName: "Ann",
          lastName: "A",
        },
        {
          id: "2",
          email: "b@example.com",
          name: "B",
          firstName: "Bob",
          lastName: "B",
        },
      ];
      const page = {
        items: rows,
        meta: { page: 1, total: 2, pages: 1 },
      };
      db.User.paginate.mockResolvedValue(page);

      const result = await userCollection(null, { input: {} });

      expect(db.User.paginate).toHaveBeenCalledWith({
        orderBy: { id: "asc" },
      });
      expect(result).toEqual(page);
    });

    it("applies page and limit when provided", async () => {
      db.User.paginate.mockResolvedValue({
        items: [],
        meta: { page: 2, total: 0, pages: 0 },
      });

      await userCollection(null, {
        input: { page: 1, limit: 10 },
      });

      expect(db.User.paginate).toHaveBeenCalledWith({
        orderBy: { id: "asc" },
        page: 1,
        limit: 10,
      });
    });
  });

  describe("userCreate", () => {
    it("creates a user from input", async () => {
      const input = {
        email: "new@example.com",
        name: "New",
        firstName: "New",
        lastName: "User",
      };
      const row = { id: "3", ...input };
      db.User.create.mockResolvedValue(row);

      const result = await userCreate(null, { input });

      expect(db.User.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(row);
    });

    it("creates a user without optional name fields", async () => {
      const input = { email: "new@example.com", name: "New" };
      const row = { id: "3", ...input, firstName: null, lastName: null };
      db.User.create.mockResolvedValue(row);

      const result = await userCreate(null, { input });

      expect(db.User.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(row);
    });
  });

  describe("userUpdate", () => {
    it("updates only non-null fields", async () => {
      const row = {
        id: "1",
        email: "updated@example.com",
        name: "Updated",
      };
      db.User.update.mockResolvedValue(row);

      const result = await userUpdate(
        null,
        { input: { id: "1", email: "updated@example.com", name: null } },
      );

      expect(db.User.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { email: "updated@example.com" },
      });
      expect(result).toEqual(row);
    });

    it("throws when no updatable fields are provided", async () => {
      await expect(userUpdate(null, { input: { id: "1" } })).rejects.toThrow(
        "userUpdate requires at least one field to update",
      );

      expect(db.User.update).not.toHaveBeenCalled();
    });
  });

  describe("userDelete", () => {
    it("deletes a user by id", async () => {
      const row = {
        id: "1",
        email: "a@example.com",
        name: "A",
        firstName: "Ann",
        lastName: "A",
      };
      db.User.delete.mockResolvedValue(row);

      const result = await userDelete(null, { input: { id: "1" } });

      expect(db.User.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(row);
    });
  });
});
