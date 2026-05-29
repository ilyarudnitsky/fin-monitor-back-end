import { describe, expect, it } from "@jest/globals";
import {
  normalizeAmountWithUnitValue,
  normalizeMoneyValue,
  normalizeQuantityValue,
  parseStoredMoneyValue,
} from "../../src/lib/money.js";

describe("money helpers", () => {
  it("normalizes money strings to canonical decimals", () => {
    expect(normalizeMoneyValue("$1,000.50")).toBe("1000.5");
    expect(normalizeMoneyValue("100")).toBe("100");
  });

  it("normalizes quantity strings", () => {
    expect(normalizeQuantityValue("2")).toBe("2");
    expect(normalizeQuantityValue("1.5")).toBe("1.5");
  });

  it("keeps optional units on amount values", () => {
    expect(normalizeAmountWithUnitValue("100 g")).toBe("100 g");
    expect(normalizeAmountWithUnitValue("$1,000")).toBe("1000");
  });

  it("parses stored money for calculations", () => {
    expect(parseStoredMoneyValue("1000.5")).toBe(1000.5);
    expect(parseStoredMoneyValue("100 g")).toBe(100);
  });
});
