/**
 * Tests for the isValidInstance() function.
 */

import { describe, it, expect } from "vitest";
import { isValidInstance } from "../../src/validate.js";

describe("isValidInstance", () => {
  // Test checking for an HTMLElement.
  it("should accept an HTMLElement instance", () => {
    const element = document.createElement("div");

    const result = isValidInstance(HTMLElement, { element });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test checking for multiple HTMLElements.
  it("should accept multiple HTMLElement instances", () => {
    const element1 = document.createElement("div");
    const element2 = document.createElement("div");

    const result = isValidInstance(HTMLElement, { element1, element2 });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test checking for a non-HTMLElement.
  it("should throw when a value is not an HTMLElement instance", () => {
    const element = "string";

    expect(() => {
      isValidInstance(HTMLElement, { element });
    }).toThrow(TypeError);
  });

  // Test checking for multiple non-HTMLElements.
  it("should throw when multiple values are not HTMLElement instances", () => {
    const element1 = "string";
    const element2 = "string";

    expect(() => {
      isValidInstance(HTMLElement, { element1, element2 });
    }).toThrow(TypeError);
  });

  // Test checking for a mixed HTMLElement and non-HTMLElement.
  it("should throw when an invalid instance appears alongside a valid instance", () => {
    const element1 = document.createElement("div");
    const element2 = "string";

    expect(() => {
      isValidInstance(HTMLElement, { element1, element2 });
    }).toThrow(TypeError);
  });

  // Test passing an invalid constructor.
  it("should throw when the constructor argument is not a function", () => {
    const element = document.createElement("div");

    expect(() => {
      isValidInstance("string", { element });
    }).toThrow(TypeError);
  });

  // Test passing a non-object as the elements parameter.
  it("should throw when the elements argument is not an object", () => {
    const element = document.createElement("div");

    expect(() => {
      isValidInstance(HTMLElement, element);
    }).toThrow(TypeError);
  });

  // Test that shouldThrow will throw on invalid values.
  it("should throw when shouldThrow is true", () => {
    expect(() => {
      isValidInstance(
        HTMLElement,
        { element: "string" },
        { shouldThrow: true }
      );
    }).toThrow(TypeError);
  });

  // Test that shouldThrow can be disabled.
  it("should report validation errors without throwing when shouldThrow is false", () => {
    const result = isValidInstance(
      HTMLElement,
      { element: "string" },
      { shouldThrow: false }
    );

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });

  it("should return errors for all invalid values", () => {
    const result = isValidInstance(
      HTMLElement,
      {
        valid: document.createElement("div"),
        first: "invalid",
        second: "invalid",
      },
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
      isValidInstance(HTMLElement, { first: "invalid", second: "invalid" })
    ).toThrow(/^first\b/);
  });
});
