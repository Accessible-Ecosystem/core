/**
 * Tests for public methods of the TransactionalValue class.
 */

import { describe, it, expect } from "vitest";
import TransactionalValue from "../../src/TransactionalValue.js";

// Test TransactionalValue public methods.
describe("TransactionalValue public methods", () => {
  // Test TransactionalValue commit().
  describe("commit", () => {
    it("should return the instance", () => {
      const value = new TransactionalValue(1);

      expect(value.commit()).toBe(value);
    });
    // Test that commit updates the committed value.
    it("should commit the current value", () => {
      const value = new TransactionalValue(1);
      value.value = 2;

      value.commit();

      expect(value.committed).toBe(2);
      expect(value.isDirty).toBe(false);
    });
  });

  // Test TransactionalValue reset().
  describe("reset", () => {
    it("should return the instance", () => {
      const value = new TransactionalValue(1);

      expect(value.reset()).toBe(value);
    });
    // Test that reset restores the committed value.
    it("should reset the current value to the committed value", () => {
      const value = new TransactionalValue("initial");
      value.value = "updated";

      value.reset();

      expect(value.value).toBe("initial");
      expect(value.isDirty).toBe(false);
    });
  });

  // Test TransactionalValue update().
  describe("update", () => {
    it("should return the instance", () => {
      const value = new TransactionalValue(1);

      expect(value.update((current) => current + 1)).toBe(value);
    });
    // Test that update applies a functional update.
    it("should update the current value with a function", () => {
      const value = new TransactionalValue(2);

      value.update((current) => current + 1);

      expect(value.value).toBe(3);
      expect(value.committed).toBe(2);
      expect(value.isDirty).toBe(true);
    });
  });
});

describe("TransactionalValue public edge cases", () => {
  describe("update", () => {
    it("should propagate callback failure without changing the current or committed value", () => {
      const value = new TransactionalValue(1);
      const failure = new Error("update failed");

      expect(() =>
        value.update(() => {
          throw failure;
        })
      ).toThrow(failure);
      expect(value.value).toBe(1);
      expect(value.committed).toBe(1);
    });
  });

  describe("commit and reset", () => {
    it("should reset to the latest committed value", () => {
      const value = new TransactionalValue(1);
      value.value = 2;

      value.commit();
      value.value = 3;
      value.reset();

      expect(value.value).toBe(2);
      expect(value.committed).toBe(2);
      expect(value.isDirty).toBe(false);
    });

    it("should support chaining public methods", () => {
      const value = new TransactionalValue(1);

      expect(
        value
          .update((current) => current + 1)
          .commit()
          .update((current) => current + 1)
          .reset()
      ).toBe(value);
    });
  });
});
