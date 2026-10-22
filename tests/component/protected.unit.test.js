/**
 * Protected method tests for the Component class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import Component from "../../src/Component.js";

let component;
let first;
let second;

afterEach(() => {
  component?.dispose();
  component = null;
  first?.dispose();
  first = null;
  second?.dispose();
  second = null;
  document.body.innerHTML = "";
  delete window.AccessibleEcosystemStorage;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Component protected methods", () => {
  describe("_bootstrap", () => {
    it("should register all lifecycle events", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(Object.keys(component.events)).toEqual([
        "initialize",
        "preinitialize",
        "postinitialize",
        "validate",
        "prevalidate",
        "postvalidate",
      ]);
    });

    it("should log registration failures", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const failure = new Error("registration failed");
      vi.spyOn(component, "_registerEvent").mockImplementation(() => {
        throw failure;
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(error).toHaveBeenCalledWith(failure);
    });

    it("should invalidate the component after a registration failure", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(component, "_registerEvent").mockImplementation(() => {
        throw new Error("registration failed");
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(component.isValid).toBe(false);
    });
  });

  describe("_validate", () => {
    it.each([
      ["_selectors", { child: "[" }],
      ["_classes", { initialize: "invalid token" }],
      ["_durations", { transition: "slow" }],
      ["_delays", { transition: "slow" }],
      ["_name", 123],
      ["_scope", 123],
      ["_eventPrefix", 123],
      ["_storageKey", 123],
      ["_key", 123],
      ["_prefix", 123],
      ["_protectedDOMElements", [123]],
      ["_shouldStore", "yes"],
    ])("should report invalid %s", (field, value) => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component[field] = value;

      expect(component._validate()).toBe(false);
      expect(component.errors.length).toBeGreaterThan(0);
    });

    it("should report invalid _dom", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._dom.children = [{}];

      expect(component._validate()).toBe(false);
      expect(component.errors.length).toBeGreaterThan(0);
    });

    it("should accept an empty selector alongside a valid selector", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._selectors = { optional: "", child: "span" };

      expect(component._validate()).toBe(true);
      expect(component.errors).toEqual([]);
    });

    it("should still report an invalid selector alongside an empty selector", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._selectors = { optional: "", child: "[" };

      expect(component._validate()).toBe(false);
      expect(component.errors).toHaveLength(1);
      expect(component.errors[0].message).toContain("childSelector");
    });

    it("should collect all validation errors", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._prefix = 123;
      component._key = 456;

      component._validate();

      expect(component.errors).toHaveLength(2);
    });

    it("should clear previous errors before validating again", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._prefix = 123;

      component._validate();
      component._prefix = "ae-";

      expect(component._validate()).toBe(true);
      expect(component.errors).toEqual([]);
    });

    it("should dispatch validation lifecycle events in order", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const order = [];
      for (const name of ["prevalidate", "validate", "postvalidate"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => order.push(name)
        );

      component._validate();

      expect(order).toEqual(["prevalidate", "validate", "postvalidate"]);
    });

    it("should accept valid DOM arrays", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._dom.children = [document.createElement("div")];

      expect(component._validate()).toBe(true);
    });

    it("should accept null for an optional DOM element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._dom.optional = null;

      expect(component._validate()).toBe(true);
    });
  });

  describe("_generateKey", () => {
    it("should generate a key when none is configured", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(Math, "random").mockReturnValue(0.123456);

      component._generateKey();

      expect(component.key).toMatch(/^[a-z]{1,10}$/);
    });

    it("should preserve an existing key", () => {
      component = new Component({ key: "existing", bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._generateKey();

      expect(component.key).toBe("existing");
    });

    it("should regenerate a key when requested", () => {
      component = new Component({ key: "existing", bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(Math, "random").mockReturnValue(0.123456);

      component._generateKey(true);

      expect(component.key).not.toBe("existing");
      expect(component.key).toMatch(/^[a-z]{1,10}$/);
    });
  });

  describe("_setDOMElementType", () => {
    it("should select all matching descendants", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];

      component._setDOMElementType("child", { context, strict: false });

      expect(component.dom.child).toEqual([
        context.children[0],
        context.children[1].firstElementChild,
      ]);
    });

    it("should select only matching direct children", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];

      component._setDOMElementType("child", { context, strict: true });

      expect(component.dom.child).toEqual([context.firstElementChild]);
    });

    it("should append matches when overwrite is false", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      const original = document.createElement("span");
      component._dom.child = [original];

      component._setDOMElementType("child", { context, overwrite: false });

      expect(component.dom.child).toEqual([
        original,
        ...context.querySelectorAll("span"),
      ]);
    });

    it("should replace existing matches by default", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      component._dom.child = [document.createElement("span")];

      component._setDOMElementType("child", { context });

      expect(component.dom.child).toEqual(
        Array.from(context.querySelectorAll("span"))
      );
    });

    it("should set a single DOM element to the first match", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      component._dom.child = null;

      component._setDOMElementType("child", { context });

      expect(component.dom.child).toBe(context.firstElementChild);
    });

    it("should set a single DOM element to null when no elements match", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      component._dom.child = null;
      context.innerHTML = "";

      component._setDOMElementType("child", { context });

      expect(component.dom.child).toBeNull();
    });

    it.each(["missing", "root", "protected"])(
      "should reject the %s element type",
      (type) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component._selectors.root = "button";
        component._selectors.protected = "span";
        component._protectedDOMElements.push("protected");

        expect(() =>
          component._setDOMElementType(type, {
            context: component.rootDOMElement,
          })
        ).toThrow(Error);
      }
    );

    it("should reject an invalid context", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._selectors.child = "span";

      expect(() =>
        component._setDOMElementType("child", { context: {} })
      ).toThrow(TypeError);
    });
  });

  describe("_resetDOMElementType", () => {
    it("should reset a DOM element array", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._selectors.children = "span";
      component._dom.children = [document.createElement("span")];

      component._resetDOMElementType("children");

      expect(component.dom.children).toEqual([]);
    });

    it("should reset a single DOM element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._selectors.child = "span";
      component._dom.child = document.createElement("span");

      component._resetDOMElementType("child");

      expect(component.dom.child).toBeNull();
    });

    it.each(["missing", "root", "protected"])(
      "should reject the %s element type",
      (type) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component._selectors.root = "button";
        component._selectors.protected = "span";
        component._protectedDOMElements.push("protected");

        expect(() => component._resetDOMElementType(type)).toThrow(Error);
      }
    );
  });

  for (const [set, clear, all, callsAfterThreeDelays] of [
    ["_setTimeout", "_clearTimeout", "_clearTimeouts", 1],
    ["_setInterval", "_clearInterval", "_clearIntervals", 3],
  ]) {
    describe(set, () => {
      it("should run the callback at the scheduled frequency", () => {
        vi.useFakeTimers();
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const callback = vi.fn();

        component[set](callback, 10);
        vi.advanceTimersByTime(9);

        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(callback).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(20);

        expect(callback).toHaveBeenCalledTimes(callsAfterThreeDelays);
      });

      it("should replace the previous timer in the same scope", () => {
        vi.useFakeTimers();
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const old = vi.fn();
        const current = vi.fn();

        component[set](old, 10);
        component[set](current, 10);
        vi.advanceTimersByTime(10);

        expect(old).not.toHaveBeenCalled();
        expect(current).toHaveBeenCalledTimes(1);
      });

      it("should leave timers in other scopes active", () => {
        vi.useFakeTimers();
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const other = vi.fn();

        component[set](other, 10, "other");
        component[set](vi.fn(), 10);
        vi.advanceTimersByTime(10);

        expect(other).toHaveBeenCalledTimes(1);
      });
    });

    describe(clear, () => {
      it("should cancel callbacks in the selected scope", () => {
        vi.useFakeTimers();
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const callback = vi.fn();
        component[set](callback, 10);

        component[clear]();
        vi.advanceTimersByTime(100);

        expect(callback).not.toHaveBeenCalled();
      });

      it("should leave other scopes active", () => {
        vi.useFakeTimers();
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const callback = vi.fn();
        component[set](vi.fn(), 10);
        component[set](callback, 10, "other");

        component[clear]();
        vi.advanceTimersByTime(10);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should tolerate a missing scope", () => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        expect(() => component[clear]("missing")).not.toThrow();
      });
    });

    describe(all, () => {
      it("should cancel callbacks in all scopes", () => {
        vi.useFakeTimers();
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const callback = vi.fn();
        component[set](callback, 10);
        component[set](callback, 10, "other");

        component[all]();
        vi.advanceTimersByTime(100);

        expect(callback).not.toHaveBeenCalled();
      });
    });
  }

  describe("_registerEvent", () => {
    it("should use the eventPrefix getter when naming events", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(component, "eventPrefix", "get").mockReturnValue("customEvents");

      component._registerEvent("ready");

      expect(component.getEventName("ready")).toBe("customEventsReady");
    });

    it("should register a CustomEvent with the generated name", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._registerEvent("ready");

      expect(component.events.ready).toBeInstanceOf(CustomEvent);
      expect(component.events.ready.type).toBe(
        "accessibleEcosystemComponentReady"
      );
    });

    it.each([true, false])(
      "should set the event bubbles value to %s",
      (bubbles) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component._registerEvent("ready", { bubbles });

        expect(component.events.ready.bubbles).toBe(bubbles);
      }
    );

    it("should include the component in the default detail", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._registerEvent("ready");

      expect(component.events.ready.detail.component).toBe(component);
    });

    it("should include custom event detail", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._registerEvent("ready", { detail: { step: 2 } });

      expect(component.events.ready.detail.step).toBe(2);
    });

    it.each([
      [123, {}],
      ["ready", { bubbles: "yes" }],
      ["ready", { detail: "bad" }],
    ])("should reject event name=%j options=%j", (name, options) => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(() => component._registerEvent(name, options)).toThrow(TypeError);
    });
  });

  describe("_dispatchEvent", () => {
    it("should dispatch to the root by default", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener(
        component.getEventName("initialize"),
        component.rootDOMElement,
        listener
      );

      component._dispatchEvent("initialize");

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should dispatch to an explicit element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      const other = document.createElement("div");
      component._addEventListener(
        component.getEventName("initialize"),
        other,
        listener
      );

      component._dispatchEvent("initialize", other);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should reject unregistered events", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(() => component._dispatchEvent("missing")).toThrow(TypeError);
    });

    it("should reject invalid elements", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(() => component._dispatchEvent("initialize", {})).toThrow(
        TypeError
      );
    });
  });

  describe("_addEventListener", () => {
    it("should track registered listeners", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();

      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });

      expect(component.listeners).toContainEqual({
        type: "click",
        element: component.rootDOMElement,
        listener,
        options: { capture: true },
      });
    });

    it("should attach the callback to the element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();

      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });
      component.rootDOMElement.click();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("_removeEventListener", () => {
    it("should remove the listener from tracking", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });

      component._removeEventListener(
        "click",
        component.rootDOMElement,
        listener,
        { capture: true }
      );

      expect(component.listeners).toEqual([]);
    });

    it("should detach the callback from the element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });

      component._removeEventListener(
        "click",
        component.rootDOMElement,
        listener,
        { capture: true }
      );
      component.rootDOMElement.click();

      expect(listener).not.toHaveBeenCalled();
    });

    it("should tolerate an unregistered listener", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(() =>
        component._removeEventListener(
          "click",
          component.rootDOMElement,
          vi.fn()
        )
      ).not.toThrow();
      expect(component.listeners).toEqual([]);
    });
  });

  describe("_removeEventListeners", () => {
    it("should remove all listeners", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const root = component.rootDOMElement,
        other = document.createElement("button");
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      component._addEventListener("click", root, callbacks[0]);
      component._addEventListener("keyup", root, callbacks[1]);
      component._addEventListener("click", other, callbacks[2]);

      component._removeEventListeners({});
      root.click();

      root.dispatchEvent(new Event("keyup"));
      other.click();

      expect(callbacks[0]).not.toHaveBeenCalled();
      expect(callbacks[1]).toHaveBeenCalledTimes(0);
      expect(callbacks[2]).toHaveBeenCalledTimes(0);
    });

    it("should remove listeners of the requested type", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const root = component.rootDOMElement,
        other = document.createElement("button");
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      component._addEventListener("click", root, callbacks[0]);
      component._addEventListener("keyup", root, callbacks[1]);
      component._addEventListener("click", other, callbacks[2]);

      component._removeEventListeners({ type: "click" });
      root.click();

      root.dispatchEvent(new Event("keyup"));
      other.click();

      expect(callbacks[0]).not.toHaveBeenCalled();
      expect(callbacks[1]).toHaveBeenCalledTimes(1);
      expect(callbacks[2]).toHaveBeenCalledTimes(0);
    });

    it("should remove listeners on the requested element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const root = component.rootDOMElement,
        other = document.createElement("button");
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      component._addEventListener("click", root, callbacks[0]);
      component._addEventListener("keyup", root, callbacks[1]);
      component._addEventListener("click", other, callbacks[2]);

      component._removeEventListeners({ element: root });
      root.click();

      root.dispatchEvent(new Event("keyup"));
      other.click();

      expect(callbacks[0]).not.toHaveBeenCalled();
      expect(callbacks[1]).toHaveBeenCalledTimes(0);
      expect(callbacks[2]).toHaveBeenCalledTimes(1);
    });

    it("should remove listeners matching both type and element", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const root = component.rootDOMElement,
        other = document.createElement("button");
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      component._addEventListener("click", root, callbacks[0]);
      component._addEventListener("keyup", root, callbacks[1]);
      component._addEventListener("click", other, callbacks[2]);

      component._removeEventListeners({ type: "click", element: root });
      root.click();

      root.dispatchEvent(new Event("keyup"));
      other.click();

      expect(callbacks[0]).not.toHaveBeenCalled();
      expect(callbacks[1]).toHaveBeenCalledTimes(1);
      expect(callbacks[2]).toHaveBeenCalledTimes(1);
    });
  });

  describe("_store", () => {
    it.each([
      ["", "key"],
      ["explicit-id", "explicit-id"],
    ])(
      "should store using id=%j or fall back to the key",
      (id, expectedKey) => {
        component = new Component({ key: "key", bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component._id = id;

        component._store();

        expect(
          window.AccessibleEcosystemStorage.get({
            type: "components",
            key: expectedKey,
          })
        ).toBe(component);
      }
    );

    it("should skip storage when disabled", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._shouldStore = false;

      component._store();

      expect(window.AccessibleEcosystemStorage).toBeUndefined();
    });

    it("should replace incompatible global storage", () => {
      component = new Component({ key: "key", bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      window.AccessibleEcosystemStorage = {};

      component._store();

      expect(
        window.AccessibleEcosystemStorage.get({
          type: "components",
          key: "key",
        })
      ).toBe(component);
    });
  });

  describe("_unstore", () => {
    it.each([
      ["", "key"],
      ["explicit-id", "explicit-id"],
    ])(
      "should remove the component using id=%j or the key",
      (id, expectedKey) => {
        component = new Component({ key: "key", bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component._id = id;
        component._store();

        component._unstore();

        expect(
          window.AccessibleEcosystemStorage.get({
            type: "components",
            key: expectedKey,
          })
        ).toBeUndefined();
      }
    );

    it("should preserve other stored entries", () => {
      component = new Component({ key: "key", bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._store();
      const storage = window.AccessibleEcosystemStorage;
      storage.set({ type: "components", key: "other", data: {} });

      component._unstore();

      expect(storage.get({ type: "components", key: "other" })).toEqual({});
    });

    it("should skip removal when storage is disabled", () => {
      component = new Component({ key: "key", bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._store();
      component._shouldStore = false;

      component._unstore();

      expect(
        window.AccessibleEcosystemStorage.get({
          type: "components",
          key: "key",
        })
      ).toBe(component);
    });

    it("should tolerate absent global storage", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(() => component._unstore()).not.toThrow();
      expect(window.AccessibleEcosystemStorage).toBeUndefined();
    });

    it("should leave incompatible global storage unchanged", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const incompatible = {};
      window.AccessibleEcosystemStorage = incompatible;

      component._unstore();

      expect(window.AccessibleEcosystemStorage).toBe(incompatible);
    });
  });

  describe("_requestAnimationFrame", () => {
    it("should pass the timestamp and remove a completed frame before its callback", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      let runFrame;
      vi.spyOn(window, "requestAnimationFrame").mockImplementation(
        (callback) => {
          runFrame = callback;
          return 0;
        }
      );
      const callback = vi.fn(() => {
        expect(component.frames).toEqual({});
      });

      const id = component._requestAnimationFrame(callback);

      expect(id).toBe(0);
      expect(component.frames).toEqual({ _default: 0 });

      runFrame(123);

      expect(callback).toHaveBeenCalledWith(123);
      expect(component.frames).toEqual({});
    });

    it("should replace a pending frame in the same scope without cancelling other scopes", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(window, "requestAnimationFrame")
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2)
        .mockReturnValueOnce(3);
      const cancel = vi.spyOn(window, "cancelAnimationFrame");

      component._requestAnimationFrame(vi.fn(), "focus");
      component._requestAnimationFrame(vi.fn(), "blur");
      component._requestAnimationFrame(vi.fn(), "focus");

      expect(cancel).toHaveBeenCalledExactlyOnceWith(1);
      expect(component.frames).toEqual({ focus: 3, blur: 2 });
    });

    it("should preserve a new frame requested from inside a callback", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      let runFrame;
      vi.spyOn(window, "requestAnimationFrame")
        .mockImplementationOnce((callback) => {
          runFrame = callback;
          return 1;
        })
        .mockReturnValueOnce(2);

      component._requestAnimationFrame(() => {
        component._requestAnimationFrame(vi.fn());
      });

      runFrame(0);

      expect(component.frames).toEqual({ _default: 2 });
    });

    it("should remove frames even when their callbacks throw", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      let runFrame;
      vi.spyOn(window, "requestAnimationFrame").mockImplementation(
        (callback) => {
          runFrame = callback;
          return 1;
        }
      );

      component._requestAnimationFrame(() => {
        throw new Error("frame failed");
      });

      expect(() => runFrame(0)).toThrow("frame failed");
      expect(component.frames).toEqual({});
    });

    it("should keep frame storage separate for each component", () => {
      first = new Component({ bootstrap: false });
      first._dom.root = document.createElement("button");
      first._rootDOMElement = "root";
      document.body.appendChild(first.rootDOMElement);
      first._bootstrap();
      second = new Component({ bootstrap: false });
      second._dom.root = document.createElement("button");
      second._rootDOMElement = "root";
      document.body.appendChild(second.rootDOMElement);
      second._bootstrap();
      vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);

      first._requestAnimationFrame(vi.fn());

      expect(first.frames).toEqual({ _default: 1 });
      expect(second.frames).toEqual({});
    });

    it("should not store frames whose callbacks run synchronously", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(window, "requestAnimationFrame").mockImplementation(
        (callback) => {
          callback(0);
          return 1;
        }
      );

      component._requestAnimationFrame(vi.fn());

      expect(component.frames).toEqual({});
    });
  });

  describe("_cancelAnimationFrame", () => {
    it("should cancel a scoped frame and allow repeated cancellation", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(window, "requestAnimationFrame").mockReturnValue(0);
      const cancel = vi.spyOn(window, "cancelAnimationFrame");
      component._requestAnimationFrame(vi.fn(), "focus");

      component._cancelAnimationFrame("focus");
      component._cancelAnimationFrame("focus");
      component._cancelAnimationFrame("missing");

      expect(cancel).toHaveBeenCalledExactlyOnceWith(0);
      expect(component.frames).toEqual({});
    });
  });
});
