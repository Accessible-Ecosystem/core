/**
 * Tests for the isTag() function.
 */

import { describe, it, expect } from "vitest";
import { isTag } from "../../src/validate.js";

describe("isTag", () => {
  // Test that a paragraph element is a 'p' tag.
  it("should accept a paragraph element when the required tag is p", () => {
    const element = document.createElement("p");

    const result = isTag("p", { element });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test that multiple paragraph elements are 'p' tags.
  it("should accept multiple paragraph elements when the required tag is p", () => {
    const element1 = document.createElement("p");
    const element2 = document.createElement("p");

    const result = isTag("p", { element1, element2 });

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  // Test that a div element is not a 'p' tag.
  it("should throw when an element has the wrong tag", () => {
    const element = document.createElement("div");

    expect(() => {
      isTag("p", { element });
    }).toThrow(TypeError);
  });

  // Test that multiple div elements are not 'p' tags.
  it("should throw when multiple elements have the wrong tag", () => {
    const element1 = document.createElement("div");
    const element2 = document.createElement("div");

    expect(() => {
      isTag("p", { element1, element2 });
    }).toThrow(TypeError);
  });

  // Test that a mixed div and paragraph element are not 'p' tags.
  it("should throw when an element has the wrong tag alongside a matching element", () => {
    const element1 = document.createElement("div");
    const element2 = document.createElement("p");

    expect(() => {
      isTag("p", { element1, element2 });
    }).toThrow(TypeError);
  });

  // Test passing an invalid tag.
  it("should throw when the tag argument is not a string", () => {
    const element = document.createElement("p");

    expect(() => {
      isTag(1, { element });
    }).toThrow(TypeError);
  });

  // Test passing an invalid element.
  it("should throw when a value is not an HTMLElement", () => {
    const element = "string";

    expect(() => {
      isTag("p", { element });
    }).toThrow(TypeError);
  });

  // Test passing both an invalid tag and element.
  it("should throw when both the tag and element are invalid", () => {
    const element = "string";

    expect(() => {
      isTag(1, { element });
    }).toThrow(TypeError);
  });

  // Test passing a non-object.
  it("should throw when the elements argument is not an object", () => {
    const element = document.createElement("p");

    expect(() => {
      isTag("p", element);
    }).toThrow(TypeError);
  });

  // Test that shouldThrow will throw on invalid values.
  it("should throw when shouldThrow is true", () => {
    expect(() => {
      isTag(
        "p",
        { element: document.createElement("div") },
        { shouldThrow: true }
      );
    }).toThrow(TypeError);
  });

  // Test that shouldThrow can be disabled.
  it("should report validation errors without throwing when shouldThrow is false", () => {
    const result = isTag(
      "p",
      { element: document.createElement("div") },
      { shouldThrow: false }
    );

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });

  it("should return errors for all invalid values", () => {
    const result = isTag(
      "p",
      {
        valid: document.createElement("p"),
        first: document.createElement("div"),
        second: document.createElement("div"),
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
      isTag("p", {
        first: document.createElement("div"),
        second: document.createElement("div"),
      })
    ).toThrow(/^first\b/);
  });

  it("should match tags without case sensitivity", () => {
    expect(
      isTag("BUTTON", { element: document.createElement("button") })
    ).toEqual({ status: true, errors: [] });
  });
});
