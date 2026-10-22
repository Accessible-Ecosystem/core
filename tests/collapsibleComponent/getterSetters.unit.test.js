/**
 * Getter/Setter tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import CollapsibleComponent from "../../src/CollapsibleComponent.js";

let component;

afterEach(() => {
  component?.dispose();
  component = null;
  document.body.innerHTML = "";
  delete window.AccessibleEcosystemStorage;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("CollapsibleComponent getter/setters", () => {
  for (const name of [
    "lockedClass",
    "unlockedClass",
    "expandClass",
    "collapseClass",
    "transitionClass",
  ])
    describe(name, () => {
      it.each(["custom", ["one", "two"], "", []])(
        "should accept class value %j",
        (value) => {
          component = new CollapsibleComponent({
            controllerElement: document.createElement("button"),
            controlledElement: document.createElement("div"),
            bootstrap: false,
          });
          component._rootDOMElement = "controller";
          document.body.appendChild(component.rootDOMElement);
          component._bootstrap();

          component[name] = value;

          expect(component[name]).toEqual(value);
        }
      );

      it.each(["custom", ["one", "two"], "", []])(
        "should retain class value %j when assigned again",
        (value) => {
          component = new CollapsibleComponent({
            controllerElement: document.createElement("button"),
            controlledElement: document.createElement("div"),
            bootstrap: false,
          });
          component._rootDOMElement = "controller";
          document.body.appendChild(component.rootDOMElement);
          component._bootstrap();

          component[name] = value;
          component[name] = value;

          expect(component[name]).toEqual(value);
        }
      );

      it.each([123, null, "invalid token", ["valid", 123]])(
        "should reject %j without changing classes",
        (value) => {
          component = new CollapsibleComponent({
            controllerElement: document.createElement("button"),
            controlledElement: document.createElement("div"),
            bootstrap: false,
          });
          component._rootDOMElement = "controller";
          document.body.appendChild(component.rootDOMElement);
          component._bootstrap();
          const original = component[name];

          expect(() => {
            component[name] = value;
          }).toThrow(TypeError);
          expect(component[name]).toBe(original);
        }
      );
    });
  for (const name of [
    "transitionDuration",
    "expandDuration",
    "collapseDuration",
  ])
    describe(name, () => {
      it("should update the duration", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component[name] = 300;

        expect(component[name]).toBe(300);
      });

      it("should refresh custom properties when the duration changes", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const props = vi.spyOn(component, "_setCustomProps");

        component[name] = 300;

        expect(props).toHaveBeenCalledTimes(1);
      });

      it("should not refresh custom properties when the duration is unchanged", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component[name] = 300;
        const props = vi.spyOn(component, "_setCustomProps");
        component[name] = 300;

        expect(props).not.toHaveBeenCalled();
      });

      it("should reject non-numeric durations without changing the duration", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const original = component[name];

        expect(() => {
          component[name] = "slow";
        }).toThrow(TypeError);
        expect(component[name]).toBe(original);
      });
    });
  for (const name of ["expandDuration", "collapseDuration"])
    describe(name, () => {
      it("should fall back to the transition duration by default", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionDuration: 321,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        expect(component[name]).toBe(321);
      });

      it("should use an explicit action duration", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionDuration: 321,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component[name] = 50;

        expect(component[name]).toBe(50);
      });

      it("should use transitionDuration when set to -1", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionDuration: 321,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component[name] = 50;
        component[name] = -1;

        expect(component[name]).toBe(321);
      });
    });
  for (const name of [
    "expandOnFocus",
    "collapseOnBlur",
    "expandInsideBreakpoint",
    "expandOutsideBreakpoint",
    "collapseInsideBreakpoint",
    "collapseOutsideBreakpoint",
    "lockInsideBreakpoint",
    "lockOutsideBreakpoint",
    "unlockInsideBreakpoint",
    "unlockOutsideBreakpoint",
  ])
    describe(name, () => {
      it.each([true, false])("should accept %s", (value) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component[name] = !value;
        component[name] = value;

        expect(component[name]).toBe(value);
      });

      it("should retain a boolean value when assigned again", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component[name] = true;
        component[name] = true;

        expect(component[name]).toBe(true);
      });

      it("should reject non-boolean values without changing state", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const original = component[name];

        expect(() => {
          component[name] = "yes";
        }).toThrow(TypeError);
        expect(component[name]).toBe(original);
      });
    });
  for (const [name, field, committed] of [
    ["isExpanded", "_expanded", false],
    ["shouldBeExpanded", "_expanded", true],
    ["isLocked", "_locked", false],
    ["shouldBeLocked", "_locked", true],
  ])
    describe(name, () => {
      it("should return the initial state", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        expect(component[name]).toBe(false);
      });

      it("should get the current state before committing", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component[field].value = true;

        expect(component[name]).toBe(!committed);
      });

      it("should get the committed state after committing", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component[field].value = true;
        component[field].commit();

        expect(component[name]).toBe(true);
      });

      it("should throw when set manually", () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        expect(() => {
          component[name] = true;
        }).toThrow(TypeError);
      });
    });
});
