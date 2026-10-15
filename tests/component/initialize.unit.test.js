/**
 * Initialization tests for the Component class.
 */

import { describe, it, expect, vi } from "vitest";
import Component from "../../src/Component.js";
import { createComponent } from "../helpers.js";

describe("Component initialization", () => {
  describe("constructor", () => {
    it("should default the protected event prefix to an empty string", () => {
      const component = createComponent();

      expect(component._eventPrefix).toBe("");
    });

    it("should use a subclass event prefix during bootstrapping", () => {
      class PrefixedComponent extends Component {
        _eventPrefix = "customEvents";
      }

      const component = createComponent({}, PrefixedComponent);

      expect(component.getEventName("initialize")).toBe(
        "customEventsInitialize"
      );
    });

    it("should bootstrap by default", () => {
      const spy = vi.spyOn(Component.prototype, "_bootstrap");

      const component = new Component();

      expect(spy).toHaveBeenCalledTimes(1);

      component.dispose();
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(Component.prototype, "_bootstrap");

      const component = new Component({ bootstrap: false });

      expect(spy).not.toHaveBeenCalled();

      component.dispose();
    });

    it.each([
      {},
      { prefix: "custom-" },
      { key: "custom" },
      { initializeClass: ["one", "two"] },
      { prefix: null, key: null, initializeClass: null },
    ])("should initialize with valid options %j", (options) => {
      const component = createComponent(options);
      component.initialize();

      expect(component.isInitialized).toBe(true);
      expect(component.isValid).toBe(true);
      expect(component.errors).toEqual([]);
      expect(component.rootDOMElement.classList.length).toBe(0);
    });
  });

  describe("initialize", () => {
    it.each([
      { prefix: 123 },
      { key: {} },
      { initializeClass: 456 },
      { initializeClass: ["valid", 789] },
      { initializeClass: ["valid", {}] },
    ])("should log validation failure for %j", (options) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const component = createComponent(options);

      expect(() => component.initialize()).not.toThrow();
      expect(error).toHaveBeenCalledWith(expect.any(Error));
      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(component.errors.length).toBeGreaterThan(0);
    });

    it("should reject a missing root", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const component = new Component();

      component.initialize();

      expect(error).toHaveBeenCalledWith(expect.any(Error));
      expect(component.isInitialized).toBe(false);
    });

    it("should call initialization methods in order", () => {
      const component = createComponent(),
        order = [];
      const hooks = [
        "_generateKey",
        "_setDOMElements",
        "_setIds",
        "_setAriaAttributes",
        "_setCustomProps",
        "_createChildElements",
        "_handleFocus",
        "_handleHover",
        "_handleClick",
        "_handleKeydown",
        "_handleKeyup",
        "_store",
      ];
      for (const name of hooks)
        vi.spyOn(component, name).mockImplementation(() => order.push(name));

      component.initialize();

      expect(order).toEqual(hooks);
    });

    it("should dispatch initialization lifecycle events in order", () => {
      const component = createComponent(),
        order = [];
      for (const name of ["preinitialize", "initialize", "postinitialize"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => order.push(name)
        );

      component.initialize();

      expect(order).toEqual(["preinitialize", "initialize", "postinitialize"]);
    });

    it.each(["preinitialize", "initialize", "postinitialize"])(
      "should include the component in the %s lifecycle event",
      (name) => {
        const component = createComponent(),
          listener = vi.fn();
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          listener
        );

        component.initialize();

        expect(listener).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ detail: { component } })
        );
      }
    );

    it.each(["preinitialize", "initialize", "postinitialize"])(
      "should expose the expected initialized state during %s",
      (name) => {
        const component = createComponent(),
          states = [];
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => states.push(component.isInitialized)
        );

        component.initialize();

        expect(states).toEqual([name === "postinitialize"]);
      }
    );

    it.each(["preinitialize", "initialize", "postinitialize"])(
      "should expose the initialization class during %s",
      (name) => {
        const component = createComponent(),
          states = [];
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () =>
            states.push(
              component.rootDOMElement.classList.contains("initializing")
            )
        );

        component.initialize();

        expect(states).toEqual([name !== "postinitialize"]);
      }
    );

    it("should log failures from initialization hooks", () => {
      const component = createComponent();
      const failure = new Error("hook failure");
      vi.spyOn(component, "_setDOMElements").mockImplementation(() => {
        throw failure;
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component.initialize();

      expect(error).toHaveBeenCalledWith(failure);
      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
    });
  });
  it("should collect invalid-root validation errors before initialization", () => {
    const component = createComponent();
    component._dom.root = 12;
    vi.spyOn(console, "error").mockImplementation(() => {});

    component.initialize();

    expect(
      component.errors.some((error) => error.message.includes("rootElement"))
    ).toBe(true);
  });
});
