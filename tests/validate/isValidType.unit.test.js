/**
 * Tests for the isValidType() function.
 */

import { describe, it, expect } from "vitest";
import { isValidType } from "../../src/validate.js";

describe("isValidType", () => {
  // Test checking for a string.
  it("should accept a string when the required type is string", () => {
    const string = "string";

    const result = isValidType("string", { string });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test checking for multiple strings.
  it("should accept multiple strings when the required type is string", () => {
    const string1 = "string";
    const string2 = "string";

    const result = isValidType("string", { string1, string2 });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test checking for a non-string.
  it("should throw when a value does not match the required type", () => {
    const string = 1;

    expect(() => {
      isValidType("string", { string });
    }).toThrow(TypeError);
  });

  // Test checking for multiple non-strings.
  it("should throw when multiple values do not match the required type", () => {
    const string1 = 1;
    const string2 = 1;

    expect(() => {
      isValidType("string", { string1, string2 });
    }).toThrow(TypeError);
  });

  // Test checking for a mixed string and non-string.
  it("should throw when a value has the wrong type alongside a valid value", () => {
    const string1 = "string";
    const string2 = 1;

    expect(() => {
      isValidType("string", { string1, string2 });
    }).toThrow(TypeError);
  });

  // Test passing an invalid type argument.
  it("should throw when the type argument is not a string", () => {
    const string = "string";

    expect(() => {
      isValidType(1, { string });
    }).toThrow(TypeError);
  });

  // Test passing a non-object as the values argument.
  it("should throw when the values argument is not an object", () => {
    const string = "string";

    expect(() => {
      isValidType("string", string);
    }).toThrow(TypeError);
  });

  // Test that shouldThrow will throw on invalid values.
  it("should throw when shouldThrow is true", () => {
    expect(() => {
      isValidType("string", { value: 1 }, { shouldThrow: true });
    }).toThrow(TypeError);
  });

  // Test that shouldThrow can be disabled.
  it("should report validation errors without throwing when shouldThrow is false", () => {
    const result = isValidType("string", { value: 1 }, { shouldThrow: false });

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });

  // Test that the no-throw result contains the original validation error.
  it("should return the original validation error when shouldThrow is false", () => {
    const result = isValidType("string", { value: 1 }, { shouldThrow: false });

    expect(result).toHaveProperty("status", false);
    expect(result).toHaveProperty("errors");
    expect(result.errors[0]).toBeInstanceOf(TypeError);
    expect(result.errors[0].message).toContain("must be a string");
  });

  it("should return errors for all invalid values", () => {
    const result = isValidType(
      "string",
      { valid: "valid", first: 123, second: 123 },
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
    expect(() => isValidType("string", { first: 123, second: 123 })).toThrow(
      /^first\b/
    );
  });
});
