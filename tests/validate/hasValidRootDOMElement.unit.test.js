/**
 * Tests for the hasValidRootDOMElement() function.
 */

import { describe, it, expect } from "vitest";
import { hasValidRootDOMElement } from "../../src/validate.js";

describe("hasValidRootDOMElement", () => {
  class TestComponent {
    constructor() {
      this._dom = { root: null };
      this._rootDOMElement = "root";
    }
  }

  it("should accept a configured root DOM slot", () => {
    const component = new TestComponent();

    const result = hasValidRootDOMElement(component);

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  it("should throw when the configured root DOM slot is missing", () => {
    const component = new TestComponent();
    component._rootDOMElement = "missing";

    expect(() => {
      hasValidRootDOMElement(component);
    }).toThrow(Error);
  });

  it("should throw when shouldThrow is true", () => {
    const component = new TestComponent();
    component._rootDOMElement = "missing";

    expect(() => {
      hasValidRootDOMElement(component, { shouldThrow: true });
    }).toThrow(Error);
  });

  it("should report validation errors without throwing when shouldThrow is false", () => {
    const component = new TestComponent();
    component._rootDOMElement = "missing";

    const result = hasValidRootDOMElement(component, { shouldThrow: false });

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(Error);
  });

  it("should reject inherited DOM slots", () => {
    const component = {
      _dom: Object.create({ root: document.createElement("div") }),
      _rootDOMElement: "root",
    };

    expect(
      hasValidRootDOMElement(component, { shouldThrow: false }).status
    ).toBe(false);
  });
});
