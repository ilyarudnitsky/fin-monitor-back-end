import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { auth } from "../../src/middleware/auth.js";
import { logging } from "../../src/middleware/logging.js";
import { composeResolver } from "../../src/middleware/compose.js";
import { createAuthContext } from "../helpers/context.js";

describe("middleware", () => {
  describe("auth", () => {
    it("calls next and sets stub auth when Authorization header matches", async () => {
      const context = createAuthContext();
      const next = jest.fn().mockResolvedValue("ok");

      const result = await auth(null, {}, context, { fieldName: "user" }, next);

      expect(next).toHaveBeenCalled();
      expect(context.auth).toEqual({
        id: "00000000-0000-4000-8000-000000000099",
        email: "stub@example.com",
        name: "Stub User",
      });
      expect(result).toBe("ok");
    });

    it("throws Unauthorized when Authorization header is missing or invalid", async () => {
      const next = jest.fn();

      await expect(
        auth(null, {}, { headers: {} }, { fieldName: "user" }, next),
      ).rejects.toThrow("Unauthorized");

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("logging", () => {
    let logSpy;

    beforeEach(() => {
      logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    it("logs resolver result to console", async () => {
      const result = { id: "1" };

      await logging(
        null,
        {},
        {},
        { fieldName: "userCollection" },
        result,
      );

      expect(logSpy).toHaveBeenCalledWith("[graphql]", {
        field: "userCollection",
        result,
      });
    });
  });

  describe("composeResolver", () => {
    let logSpy;

    beforeEach(() => {
      logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    it("runs middleware in order and returns handler result", async () => {
      const handler = jest.fn().mockResolvedValue({ ok: true });
      const resolver = composeResolver([auth, handler, logging]);

      const context = createAuthContext();
      const result = await resolver(
        null,
        {},
        context,
        { fieldName: "user" },
      );

      expect(handler).toHaveBeenCalled();
      expect(context.auth).toBeDefined();
      expect(logSpy).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });
});
