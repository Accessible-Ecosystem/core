/**
 * Tests for the isQuerySelector() function.
 */

import { describe, it, expect } from "vitest";
import { isQuerySelector } from "../../src/validate.js";

describe("isQuerySelector", () => {
  // Test a valid query selector.
  it("should return true when checking if a valid query selector is a valid query selector", () => {
    const selector = "div";
    const result = isQuerySelector({ selector });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test multiple valid query selectors.
  it("should return true when checking if multiple valid query selectors are valid query selectors", () => {
    const selector1 = "div";
    const selector2 = "div";
    const result = isQuerySelector({ selector1, selector2 });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test an invalid query selector.
  it("should return false when checking if an invalid query selector is a valid query selector", () => {
    const selector = "div[";

    expect(() => {
      isQuerySelector({ selector });
    }).toThrow(TypeError);
  });

  // Test multiple invalid query selectors.
  it("should return false when checking if multiple invalid query selectors are valid query selectors", () => {
    const selector1 = "div[";
    const selector2 = "a[";

    expect(() => {
      isQuerySelector({ selector1, selector2 });
    }).toThrow(TypeError);
  });

  // Test non-string query selector.
  it.each([1, true, false])(
    "should reject the non-string query selector %s",
    (selector) => {
      expect(() => {
        isQuerySelector({ selector });
      }).toThrow(TypeError);
    }
  );

  it("should reject an empty string as a query selector", () => {
    expect(() => {
      isQuerySelector({ selector: "" });
    }).toThrow(TypeError);
  });

  // Test multiple non-string query selectors.
  it("should return false when checking if multiple non-string query selectors are valid query selectors", () => {
    const selector1 = 1;
    const selector2 = 1;

    expect(() => {
      isQuerySelector({ selector1, selector2 });
    }).toThrow(TypeError);
  });

  // Test null.
  it("should return false when checking if null is a valid query selector", () => {
    const selector = null;

    expect(() => {
      isQuerySelector({ selector });
    }).toThrow(TypeError);
  });

  // Test a mixed valid and invalid query selector.
  it("should return false when checking if a mixed valid and invalid query selector is a valid query selector", () => {
    const selector1 = "div";
    const selector2 = "div[";

    expect(() => {
      isQuerySelector({ selector1, selector2 });
    }).toThrow(TypeError);
  });

  // Test a mixed valid and non-string query selector.
  it("should return false when checking if a mixed valid and non-string query selector is a valid query selector", () => {
    const selector1 = "div";
    const selector2 = 1;

    expect(() => {
      isQuerySelector({ selector1, selector2 });
    }).toThrow(TypeError);
  });

  // Test passing a non-object.
  it("should return false when checking for a non-object", () => {
    const selector = "div";

    expect(() => {
      isQuerySelector(selector);
    }).toThrow(TypeError);
  });

  // Test that shouldThrow will throw on invalid values.
  it("should throw the first error when shouldThrow is true", () => {
    expect(() => {
      isQuerySelector({ selector: 1 }, { shouldThrow: true });
    }).toThrow(TypeError);
  });

  // Test that shouldThrow can be disabled.
  it("should not throw when shouldThrow is false", () => {
    const result = isQuerySelector({ selector: 1 }, { shouldThrow: false });

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });
});

describe("isQuerySelector error aggregation", () => {
  it("should return errors for all invalid values", () => {
    const result = isQuerySelector(
      { valid: "div", first: "[", second: "[" },
      { shouldThrow: false }
    );

    expect(result.status).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.every((error) => error instanceof TypeError)).toBe(
      true
    );
    expect(result.errors[0].message).toContain("first");
    expect(result.errors[1].message).toContain("second");
  });

  it("should throw the first error when multiple entries are invalid", () => {
    expect(() => isQuerySelector({ first: "[", second: "[" })).toThrow(
      /^first\b/
    );
  });
});
