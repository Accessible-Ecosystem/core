/**
 * Tests for the isValidHoverType() function.
 */

import { describe, it, expect } from "vitest";
import { isValidHoverType } from "../../src/validate.js";

describe("isValidHoverType", () => {
  // Test for all valid hover types.
  const hoverTypes = ["off", "on", "dynamic"];

  it.each(hoverTypes)("should accept %p as a hover type", (hoverType) => {
    const result = isValidHoverType({ hoverType });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test for an invalid hover type.
  it("should throw for an invalid hover type", () => {
    const hoverType = "invalid";

    expect(() => {
      isValidHoverType({ hoverType });
    }).toThrow(TypeError);
  });

  // Test passing a non-object.
  it("should throw when the values argument is not an object", () => {
    const hoverType = "off";

    expect(() => {
      isValidHoverType(hoverType);
    }).toThrow(TypeError);
  });

  // Test that shouldThrow will throw on invalid values.
  it("should throw when shouldThrow is true", () => {
    expect(() => {
      isValidHoverType({ hoverType: "invalid" }, { shouldThrow: true });
    }).toThrow(TypeError);
  });

  // Test that shouldThrow can be disabled.
  it("should report validation errors without throwing when shouldThrow is false", () => {
    const result = isValidHoverType(
      { hoverType: "invalid" },
      { shouldThrow: false }
    );

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });

  it("should return errors for all invalid values", () => {
    const result = isValidHoverType(
      { valid: "on", first: "invalid", second: "invalid" },
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
    expect(() =>
      isValidHoverType({ first: "invalid", second: "invalid" })
    ).toThrow(/^first\b/);
  });
});
