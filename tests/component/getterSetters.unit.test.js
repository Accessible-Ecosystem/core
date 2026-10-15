/**
 * Getter/Setter tests for the Component class.
 */

import { describe, it, expect } from "vitest";
import { createComponent } from "../helpers.js";

describe("Component getter/setters", () => {
  const readonly = {
    dom: "_dom",
    selectors: "_selectors",
    elements: "_elements",
    classes: "_classes",
    durations: "_durations",
    delays: "_delays",
    intervals: "_intervals",
    timeouts: "_timeouts",
    listeners: "_listeners",
    events: "_events",
    prefix: "_prefix",
    key: "_key",
    name: "_name",
    scope: "_scope",
    id: "_id",
    isValid: "_valid",
    isInitialized: "_initialized",
    errors: "_errors",
  };
  for (const [name, field] of Object.entries(readonly))
    describe(name, () => {
      it("should get the protected field value", () => {
        const component = createComponent();

        expect(component[name]).toBe(component[field]);
      });

      it("should throw when set manually", () => {
        const component = createComponent();
        const original = component[name];

        expect(() => {
          component[name] = null;
        }).toThrow(TypeError);
        expect(component[name]).toBe(original);
      });
    });

  describe("eventPrefix", () => {
    it("should combine the scope and name by default", () => {
      const component = createComponent();

      expect(component.eventPrefix).toBe("accessibleEcosystemComponent");
    });

    it("should combine a custom scope and name when the event prefix is empty", () => {
      const component = createComponent();
      component._scope = "CustomScope";
      component._name = "Widget";

      expect(component.eventPrefix).toBe("customScopeWidget");
    });

    it.each(["customEvents", "CustomEvents"])(
      "should return the configured prefix %s unchanged",
      (prefix) => {
        const component = createComponent();
        component._eventPrefix = prefix;

        expect(component.eventPrefix).toBe(prefix);
      }
    );

    it("should throw when set manually", () => {
      const component = createComponent();

      expect(() => {
        component.eventPrefix = "replacement";
      }).toThrow(TypeError);
    });
  });

  describe("rootDOMElement", () => {
    it("should return the configured root", () => {
      const component = createComponent();

      expect(component.rootDOMElement).toBe(component.dom.root);
    });

    it("should fall back to the document root when the configured root is invalid", () => {
      const component = createComponent();
      component._dom.root = 12;

      expect(component.rootDOMElement).toBe(document.documentElement);
    });

    it("should fall back to the document root when the configured root is missing", () => {
      const component = createComponent();
      component._rootDOMElement = "missing";

      expect(component.rootDOMElement).toBe(document.documentElement);
    });

    it("should throw when set manually", () => {
      const component = createComponent();

      expect(() => {
        component.rootDOMElement = null;
      }).toThrow(TypeError);
    });
  });
  for (const [name, values, invalid] of [
    ["initializeClass", ["custom", ["one", "two"], "", []], 123],
    ["focusState", ["none", "self", "child"], "invalid"],
    ["currentEvent", ["none", "mouse", "keyboard", "character"], "invalid"],
  ])
    describe(name, () => {
      it.each(values)("should accept %j", (value) => {
        const component = createComponent();

        component[name] = value;

        expect(component[name]).toEqual(value);
      });

      it.each(values)("should retain %j when assigned again", (value) => {
        const component = createComponent();

        component[name] = value;
        component[name] = value;

        expect(component[name]).toEqual(value);
      });

      it("should reject invalid values without changing state", () => {
        const component = createComponent();
        const original = component[name];

        expect(() => {
          component[name] = invalid;
        }).toThrow(TypeError);
        expect(component[name]).toBe(original);
      });
    });

  describe("shouldFocus", () => {
    it("should throw when set manually", () => {
      const component = createComponent();

      expect(() => {
        component.shouldFocus = true;
      }).toThrow(TypeError);
    });

    it.each(["none", "mouse", "keyboard", "character"])(
      "should derive focus eligibility from %s",
      (currentEvent) => {
        const component = createComponent();
        component.currentEvent = currentEvent;

        expect(component.shouldFocus).toBe(currentEvent === "keyboard");
      }
    );
  });
});
