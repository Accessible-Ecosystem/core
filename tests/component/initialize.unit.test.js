/**
 * Initialization tests for the Component class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import Component from "../../src/Component.js";

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

describe("Component initialization", () => {
  describe("constructor", () => {
    it("should call initialize once after bootstrapping by default", () => {
      const states = [];
      const initialize = vi
        .spyOn(Component.prototype, "initialize")
        .mockImplementation(function () {
          states.push(this.isBootstrapped);
        });

      component = new Component();

      expect(initialize).toHaveBeenCalledTimes(1);
      expect(states).toEqual([true]);
    });

    it("should bootstrap without initializing when initialize is false", () => {
      const initialize = vi.spyOn(Component.prototype, "initialize");

      component = new Component({ initialize: false });

      expect(component.isBootstrapped).toBe(true);
      expect(component.isInitialized).toBe(false);
      expect(initialize).not.toHaveBeenCalled();
    });

    it("should log an error when initialization is requested without bootstrapping", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const initialize = vi.spyOn(Component.prototype, "initialize");

      component = new Component({ bootstrap: false });

      expect(error).toHaveBeenCalledWith(
        new Error(
          "Cannot initialize a component before it has been bootstrapped."
        )
      );

      expect(component.isBootstrapped).toBe(false);
      expect(component.isInitialized).toBe(false);
      expect(initialize).toHaveBeenCalledTimes(1);
    });

    it("should log an error when automatic initialization follows failed bootstrapping", () => {
      vi.spyOn(Component.prototype, "_registerEvent").mockImplementation(() => {
        throw new Error("registration failed");
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const initialize = vi.spyOn(Component.prototype, "initialize");

      component = new Component();

      expect(error).toHaveBeenCalledWith(
        new Error(
          "Cannot initialize a component before it has been bootstrapped."
        )
      );

      expect(component.isBootstrapped).toBe(false);
      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(initialize).toHaveBeenCalledTimes(1);
    });

    it("should allow manual bootstrapping without automatically initializing", () => {
      const initialize = vi.spyOn(Component.prototype, "initialize");
      component = new Component({ bootstrap: false, initialize: false });

      component._bootstrap();

      expect(component.isBootstrapped).toBe(true);
      expect(component.isInitialized).toBe(false);
      expect(initialize).not.toHaveBeenCalled();
    });

    it.each([null, "false", 0])(
      "should report a validation error when emit is %s",
      (emit) => {
        component = new Component({
          emit,
          bootstrap: false,
          initialize: false,
        });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        component._bootstrap();
        const error = vi.spyOn(console, "error").mockImplementation(() => {});

        component.initialize();

        expect(component.isInitialized).toBe(false);
        expect(component.isValid).toBe(false);
        expect(component.errors).toContainEqual(expect.any(TypeError));
        expect(error).toHaveBeenCalled();
      }
    );

    it("should default the protected event prefix to an empty string", () => {
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component._eventPrefix).toBe("");
    });

    it("should use a subclass event prefix during bootstrapping", () => {
      class PrefixedComponent extends Component {
        _eventPrefix = "customEvents";
      }

      component = new PrefixedComponent({
        bootstrap: false,
        initialize: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.getEventName("initialize")).toBe(
        "customEventsInitialize"
      );
    });

    it("should bootstrap by default", () => {
      const spy = vi.spyOn(Component.prototype, "_bootstrap");

      component = new Component({ initialize: false });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(Component.prototype, "_bootstrap");

      component = new Component({ bootstrap: false, initialize: false });

      expect(spy).not.toHaveBeenCalled();
    });

    it.each([
      {},
      { prefix: "custom-" },
      { key: "custom" },
      { initializeClass: ["one", "two"] },
      { prefix: null, key: null, initializeClass: null },
    ])("should initialize with valid options %j", (options) => {
      component = new Component({
        ...options,
        bootstrap: false,
        initialize: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      expect(component.isInitialized).toBe(true);
      expect(component.isValid).toBe(true);
      expect(component.errors).toEqual([]);
      expect(component.rootDOMElement.classList.length).toBe(0);
    });
  });

  describe("initialize", () => {
    it("should log an error before validation or events when the component is not bootstrapped", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      const validate = vi.spyOn(component, "_validate");
      const dispatch = vi.spyOn(component, "_dispatchEvent");

      component.initialize();

      expect(error).toHaveBeenCalledWith(
        new Error(
          "Cannot initialize a component before it has been bootstrapped."
        )
      );
      expect(validate).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(component.errors).toEqual([]);
      expect(component.rootDOMElement.className).toBe("");
    });

    it("should initialize successfully after a previous attempt without bootstrapping", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";

      component.initialize();

      expect(error).toHaveBeenCalledTimes(1);
      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);

      component._bootstrap();
      component.initialize();

      expect(component.isBootstrapped).toBe(true);
      expect(component.isInitialized).toBe(true);
      expect(component.isValid).toBe(true);
    });

    it("should log an error when initialization is attempted after disposal", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      component._bootstrap();
      component.initialize();

      component.dispose();
      component.initialize();

      expect(error).toHaveBeenCalledWith(
        new Error(
          "Cannot initialize a component before it has been bootstrapped."
        )
      );
    });

    it.each([
      [
        true,
        [
          "prevalidate",
          "validate",
          "postvalidate",
          "preinitialize",
          "initialize",
          "postinitialize",
        ],
      ],
      [false, []],
    ])(
      "should use emit=%s to control public initialization events",
      (emit, expectedEvents) => {
        component = new Component({
          emit,
          bootstrap: false,
          initialize: false,
        });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        component._bootstrap();
        const internal = [];
        const publicEvents = [];
        for (const name of [
          "prevalidate",
          "validate",
          "postvalidate",
          "preinitialize",
          "initialize",
          "postinitialize",
        ]) {
          component._addInternalEventListener(
            component.getEventName(name),
            () => internal.push(name)
          );
          component._addEventListener(
            component.getEventName(name),
            component.rootDOMElement,
            () => publicEvents.push(name)
          );
        }

        component.initialize();

        expect(component.isInitialized).toBe(true);
        expect(internal).toEqual([
          "prevalidate",
          "validate",
          "postvalidate",
          "preinitialize",
          "initialize",
          "postinitialize",
        ]);
        expect(publicEvents).toEqual(expectedEvents);
        expect(component.shouldEmit).toBe(emit);
      }
    );

    it.each([
      { prefix: 123 },
      { key: {} },
      { initializeClass: 456 },
      { initializeClass: ["valid", 789] },
      { initializeClass: ["valid", {}] },
    ])("should log validation failure for %j", (options) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new Component({
        ...options,
        bootstrap: false,
        initialize: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(() => component.initialize()).not.toThrow();
      expect(error).toHaveBeenCalledWith(expect.any(Error));
      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(component.errors.length).toBeGreaterThan(0);
    });

    it("should report a validation failure when the root is missing", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new Component({ initialize: false });

      component.initialize();

      expect(error).toHaveBeenCalledWith(expect.any(Error));
      expect(component.isInitialized).toBe(false);
    });

    it("should call initialization methods in order", () => {
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const order = [];
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
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const order = [];
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
        component = new Component({ bootstrap: false, initialize: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const listener = vi.fn();
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

    it.each([
      ["preinitialize", false],
      ["initialize", false],
      ["postinitialize", true],
    ])(
      "should expose the expected initialized state during %s",
      (name, expectedState) => {
        component = new Component({ bootstrap: false, initialize: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const states = [];
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => states.push(component.isInitialized)
        );

        component.initialize();

        expect(states).toEqual([expectedState]);
      }
    );

    it.each([
      ["preinitialize", true],
      ["initialize", true],
      ["postinitialize", false],
    ])(
      "should expose the initialization class during %s",
      (name, expectedState) => {
        component = new Component({ bootstrap: false, initialize: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const states = [];
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () =>
            states.push(
              component.rootDOMElement.classList.contains("initializing")
            )
        );

        component.initialize();

        expect(states).toEqual([expectedState]);
      }
    );

    it("should log failures from initialization hooks", () => {
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
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

    it("should collect invalid-root validation errors before initialization", () => {
      component = new Component({ bootstrap: false, initialize: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._dom.root = 12;
      vi.spyOn(console, "error").mockImplementation(() => {});

      component.initialize();

      expect(
        component.errors.some((error) => error.message.includes("rootElement"))
      ).toBe(true);
    });
  });
});
