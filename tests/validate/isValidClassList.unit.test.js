/**
 * Tests for the isValidClassList() function.
 */

import { describe, it, expect } from "vitest";
import { isValidClassList } from "../../src/validate.js";

describe("isValidClassList", () => {
  // Test a valid single class.
  it("should accept a single class", () => {
    const classList = "class";

    const result = isValidClassList({ classList });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test an array of valid classes.
  it("should accept an array of classes", () => {
    const classList = ["class1", "class2"];

    const result = isValidClassList({ classList });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test an invalid single class.
  it("should throw when a class value is a number", () => {
    const classList = 1;

    expect(() => {
      isValidClassList({ classList });
    }).toThrow(TypeError);
  });

  // Test an array of invalid classes.
  it("should throw when a class array contains numbers", () => {
    const classList = [1, 2];

    expect(() => {
      isValidClassList({ classList });
    }).toThrow(TypeError);
  });

  // Test an array of valid and invalid classes.
  it("should throw when a class array mixes strings and numbers", () => {
    const classList = ["class", 1];

    expect(() => {
      isValidClassList({ classList });
    }).toThrow(TypeError);
  });

  // Test that class names are validated as class tokens, not CSS selectors.
  it("should reject class names that contain whitespace", () => {
    const classList = "class one";

    expect(() => {
      isValidClassList({ classList });
    }).toThrow(TypeError);
  });

  // Test passing a non-object.
  it("should throw when the values argument is not an object", () => {
    const classList = "class";

    expect(() => {
      isValidClassList(classList);
    }).toThrow(TypeError);
  });

  // Test that shouldThrow will throw on invalid values.
  it("should throw when shouldThrow is true", () => {
    expect(() => {
      isValidClassList({ classList: 1 }, { shouldThrow: true });
    }).toThrow(TypeError);
  });

  // Test that shouldThrow can be disabled.
  it("should report validation errors without throwing when shouldThrow is false", () => {
    const result = isValidClassList({ classList: 1 }, { shouldThrow: false });

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });

  it("should return errors for all invalid values", () => {
    const result = isValidClassList(
      { valid: "valid", first: "invalid token", second: "invalid token" },
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
      isValidClassList({ first: "invalid token", second: "invalid token" })
    ).toThrow(/^first\b/);
  });

  it.each(["", [], ["", "valid"], "colon:token", "123"])(
    "should allow class tokens %j",
    (value) => {
      expect(isValidClassList({ value })).toEqual({ status: true, errors: [] });
    }
  );

  it("should reject an array as the values container", () => {
    expect(() => isValidClassList(["valid"])).toThrow(TypeError);
  });
});
