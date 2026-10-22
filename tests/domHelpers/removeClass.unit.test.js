/**
 * Tests for the removeClass() function.
 */

import { describe, it, expect, vi } from "vitest";
import { removeClass } from "../../src/domHelpers.js";

describe("removeClass", () => {
  // Test if classList.remove is called.
  it("should call classList.remove", () => {
    const element = {
      classList: {
        remove: vi.fn(),
      },
    };

    removeClass("test", element);

    expect(element.classList.remove).toHaveBeenCalledWith("test");
  });

  // Test removing a single class.
  it("should remove a single class from an element", () => {
    const element = document.createElement("div");
    element.classList.add("test");

    removeClass("test", element);

    expect(element.classList.contains("test")).toBeFalsy();
  });

  // Test removing multiple classes.
  it("should remove multiple classes from an element", () => {
    const element = document.createElement("div");
    element.classList.add("test", "test2");

    removeClass(["test", "test2"], element);

    expect(element.classList.contains("test")).toBeFalsy();
    expect(element.classList.contains("test2")).toBeFalsy();
  });

  // Test not passing a class.
  it("should throw if no class is passed", () => {
    const element = document.createElement("div");

    expect(() => removeClass(undefined, element)).toThrow();
  });

  // Test not passing an element.
  it("should throw if no element is passed", () => {
    expect(() => removeClass("test", undefined)).toThrow();
  });

  // Test not passing a class or element.
  it("should throw if no class or element is passed", () => {
    expect(() => removeClass(undefined, undefined)).toThrow();
  });

  // Test passing an element that doesn't have a classList.
  it("should throw if the element doesn't have a classList", () => {
    const element = {};

    expect(() => removeClass("test", element)).toThrow();
  });

  // Test passing a number as the class value.
  it("should throw if the class is a number", () => {
    const element = document.createElement("div");

    expect(() => removeClass(1, element)).toThrow();
  });

  // Test passing a class array containing an object.
  it("should throw if the class array contains an object", () => {
    const element = document.createElement("div");

    expect(() => removeClass([{}, "test"], element)).toThrow();
  });

  // Test passing an empty string.
  it("should do nothing if the class string is empty", () => {
    const element = {
      classList: {
        remove: vi.fn(),
      },
    };

    removeClass("", element);

    expect(element.classList.remove).not.toHaveBeenCalled();
  });

  // Test passing an empty array.
  it("should do nothing if the class array is empty", () => {
    const element = {
      classList: {
        remove: vi.fn(),
      },
    };

    removeClass([], element);

    expect(element.classList.remove).not.toHaveBeenCalled();
  });

  // Test passing an array of empty strings.
  it("should do nothing if the class array is all empty strings", () => {
    const element = {
      classList: {
        remove: vi.fn(),
      },
    };

    removeClass(["", ""], element);

    expect(element.classList.remove).not.toHaveBeenCalled();
  });

  it("should ignore empty tokens in mixed arrays", () => {
    const element = document.createElement("div");
    element.classList.add("existing");

    removeClass(["", "existing", "valid", ""], element);

    expect(element.classList.contains("existing")).toBe(false);
    expect(element.classList.contains("valid")).toBe(false);
  });
});
