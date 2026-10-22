/**
 * Tests for the isValidEventType() function.
 */

import { describe, it, expect } from "vitest";
import { isValidEventType } from "../../src/validate.js";

describe("isValidEventType", () => {
  class TestComponent {
    constructor() {
      this.events = {
        expand: {},
        collapse: {},
      };
    }
  }

  it("should accept an event type registered on the component", () => {
    const component = new TestComponent();

    const result = isValidEventType("expand", component);

    expect(result.status).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  it("should throw when the event type is not registered on the component", () => {
    const component = new TestComponent();

    expect(() => {
      isValidEventType("invalid", component);
    }).toThrow(TypeError);
  });

  it("should throw when shouldThrow is true", () => {
    const component = new TestComponent();

    expect(() => {
      isValidEventType("invalid", component, { shouldThrow: true });
    }).toThrow(TypeError);
  });

  it("should report validation errors without throwing when shouldThrow is false", () => {
    const component = new TestComponent();

    const result = isValidEventType("invalid", component, {
      shouldThrow: false,
    });

    expect(result.status).toBeFalsy();
    expect(result.errors[0]).toBeInstanceOf(TypeError);
  });

  it("should reject inherited event keys", () => {
    const component = { events: Object.create({ inherited: {} }) };

    expect(
      isValidEventType("inherited", component, { shouldThrow: false }).status
    ).toBe(false);
  });
});
