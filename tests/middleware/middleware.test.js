import { jest, describe, it, expect } from "@jest/globals";
import { authenticateContext, STUB_AUTH_USER } from "../../src/middleware/auth.js";
import { createAuthContext } from "../helpers/context.js";

describe("middleware", () => {
  describe("authenticateContext", () => {
    it("sets stub auth when Authorization header matches", () => {
      const context = createAuthContext();

      authenticateContext(context);

      expect(context.auth).toEqual(STUB_AUTH_USER);
    });

    it("throws Unauthorized when Authorization header is missing or invalid", () => {
      expect(() => authenticateContext({ headers: {} })).toThrow("Unauthorized");
      expect(() => authenticateContext({ headers: { authorization: "Bearer wrong" } })).toThrow(
        "Unauthorized",
      );
    });
  });
});
