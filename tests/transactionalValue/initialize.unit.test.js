/**
 * Initialization tests for the TransactionalValue class.
 */

import { describe, it, expect, vi } from "vitest";
import TransactionalValue from "../../src/TransactionalValue.js";

// Test the TransactionalValue initialization.
describe("TransactionalValue", () => {
  // Test that the TransactionalValue will initialize with the initial value.
  it("should initialize with the initial value", () => {
    const value = new TransactionalValue("Test");

    expect(value.value).toBe("Test");
    expect(value.committed).toBe("Test");
    expect(value.isDirty).toBe(false);
  });

  // Test TransactionalValue equals.
  describe("equals", () => {
    // Test that equals is used to determine dirty state.
    it("should use the custom equality comparator", () => {
      const equals = vi.fn(
        (left, right) =>
          String(left).toLowerCase() === String(right).toLowerCase()
      );
      const value = new TransactionalValue("Test", { equals });

      value.value = "test";

      expect(value.isDirty).toBe(false);
      expect(equals).toHaveBeenCalledExactlyOnceWith("test", "Test");
    });
  });

  it("should accept an omitted initial value", () => {
    const value = new TransactionalValue();

    expect(value.value).toBeUndefined();
    expect(value.committed).toBeUndefined();
    expect(value.isDirty).toBe(false);
  });

  it("should use Object.is when the comparator is null", () => {
    const value = new TransactionalValue(NaN, { equals: null });

    expect(value.isDirty).toBe(false);
  });
});
