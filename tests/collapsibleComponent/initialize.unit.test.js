/**
 * Initialization tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import CollapsibleComponent from "../../src/CollapsibleComponent.js";

let component;
let parent;
let child;

afterEach(() => {
  component?.dispose();
  component = null;
  parent?.dispose();
  parent = null;
  child?.dispose();
  child = null;
  document.body.innerHTML = "";
  delete window.AccessibleEcosystemStorage;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("CollapsibleComponent initialization", () => {
  describe("constructor", () => {
    it("should call initialize once after bootstrapping by default", () => {
      const states = [];
      const initialize = vi
        .spyOn(CollapsibleComponent.prototype, "initialize")
        .mockImplementation(function () {
          states.push(this.isBootstrapped);
        });

      component = new CollapsibleComponent();

      expect(initialize).toHaveBeenCalledTimes(1);
      expect(states).toEqual([true]);
    });

    it("should bootstrap without initializing when initialize is false", () => {
      const initialize = vi.spyOn(CollapsibleComponent.prototype, "initialize");

      component = new CollapsibleComponent({ initialize: false });

      expect(component.isBootstrapped).toBe(true);
      expect(component.isInitialized).toBe(false);
      expect(initialize).not.toHaveBeenCalled();
    });

    it("should log an error when initialization is requested without bootstrapping", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const initialize = vi.spyOn(CollapsibleComponent.prototype, "initialize");

      component = new CollapsibleComponent({ bootstrap: false });

      expect(error).toHaveBeenCalledWith(
        new Error(
          "Cannot initialize a component before it has been bootstrapped."
        )
      );

      expect(component.isBootstrapped).toBe(false);
      expect(component.isInitialized).toBe(false);
      expect(initialize).toHaveBeenCalledTimes(1);
    });

    it.each([undefined, null])(
      "should initialize with controllerElement set to %s",
      (controllerElement) => {
        component = new CollapsibleComponent({
          controllerElement,
          controlledElement: document.createElement("div"),
          bootstrap: false,
          initialize: false,
        });
        component._rootDOMElement = "controlled";
        component._bootstrap();

        component.initialize();

        expect(component.isInitialized).toBe(true);
        expect(component.dom.controller).toBe(null);
        expect(component.dom.trigger).toBe(null);
      }
    );

    it("should reject an invalid controller element", () => {
      component = new CollapsibleComponent({
        controllerElement: {},
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controlled";
      component._bootstrap();
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(component.errors).toContainEqual(expect.any(TypeError));
      expect(error).toHaveBeenCalled();
    });

    it.each([null, "true", 0])(
      "should report an invalid expanded value %s",
      (expanded) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          expanded,
          bootstrap: false,
          initialize: false,
        });
        component._rootDOMElement = "controller";
        component._bootstrap();
        const error = vi.spyOn(console, "error").mockImplementation(() => {});

        component.initialize();

        expect(component.isInitialized).toBe(false);
        expect(component.isValid).toBe(false);
        expect(component.errors).toContainEqual(expect.any(TypeError));
        expect(error).toHaveBeenCalled();
      }
    );

    it.each([
      [undefined, false],
      [false, false],
      [true, true],
    ])("should set focus action flags to %s", (value, expected) => {
      component = new CollapsibleComponent({
        expandOnFocus: value,
        collapseOnBlur: value,
        bootstrap: false,
        initialize: false,
      });

      expect(component.expandOnFocus).toBe(expected);
      expect(component.collapseOnBlur).toBe(expected);
    });

    it.each(["expandOnFocus", "collapseOnBlur"])(
      "should report validation failures when %s is null",
      (option) => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [option]: null,
          bootstrap: false,
          initialize: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component.initialize();

        expect(component.isInitialized).toBe(false);
        expect(component.isValid).toBe(false);
      }
    );

    it("should log an error when automatic initialization follows failed bootstrapping", () => {
      vi.spyOn(
        CollapsibleComponent.prototype,
        "_registerEvent"
      ).mockImplementation(() => {
        throw new Error("registration failed");
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const initialize = vi.spyOn(CollapsibleComponent.prototype, "initialize");

      component = new CollapsibleComponent();

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

    it("should bootstrap by default", () => {
      const spy = vi.spyOn(CollapsibleComponent.prototype, "_bootstrap");

      component = new CollapsibleComponent({ initialize: false });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(CollapsibleComponent.prototype, "_bootstrap");

      component = new CollapsibleComponent({
        bootstrap: false,
        initialize: false,
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it.each([undefined, null])(
      "should use the controller when triggerElement is %s",
      (triggerElement) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          triggerElement,
          bootstrap: false,
          initialize: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        expect(component.dom.trigger).toBe(component.dom.controller);
      }
    );

    it("should retain a separate trigger without changing the controller", () => {
      const trigger = document.createElement("span");
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        triggerElement: trigger,
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.dom.trigger).toBe(trigger);
      expect(component.dom.controller).not.toBe(trigger);
    });

    it("should configure the default classes", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.classes).toEqual({
        initialize: "initializing",
        locked: "locked",
        unlocked: "unlocked",
        expand: "show",
        collapse: "hide",
        transition: "transitioning",
      });
    });

    it("should configure the default durations", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.durations).toEqual({
        transition: 150,
        expand: -1,
        collapse: -1,
      });
    });

    it("should configure the default transition delay", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.delays).toEqual({ transition: 250 });
    });

    it("should protect controller, trigger, and controlled DOM slots", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component._protectedDOMElements).toEqual([
        "controller",
        "trigger",
        "controlled",
      ]);
    });

    it.each([
      ["lockClass", "lockedClass"],
      ["unlockClass", "unlockedClass"],
      ["expandClass", "expandClass"],
      ["collapseClass", "collapseClass"],
      ["transitionClass", "transitionClass"],
    ])("should use an empty string when %s is null", (option, property) => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        [option]: null,
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component[property]).toBe("");
    });
  });

  describe("initialize", () => {
    it("should complete initialization without public events when emit is false", () => {
      vi.useFakeTimers();
      const controller = document.createElement("button");
      controller.setAttribute("aria-expanded", "true");
      component = new CollapsibleComponent({
        controllerElement: controller,
        controlledElement: document.createElement("div"),
        emit: false,
        expanded: true,
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      const internal = [];
      const publicListener = vi.fn();
      for (const name of Object.keys(component.events)) {
        component._addInternalEventListener(component.getEventName(name), () =>
          internal.push(name)
        );
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          publicListener
        );
      }

      component.initialize();

      expect(component.isInitialized).toBe(true);
      expect(component.shouldEmit).toBe(false);
      expect(component.isExpanded).toBe(true);
      expect(component.dom.controlled.classList.contains("show")).toBe(true);
      expect(internal).toContain("initialize");
      expect(internal).toContain("expand");
      expect(publicListener).not.toHaveBeenCalled();
    });

    it("should report invalid component settings even when emit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandOnFocus: "invalid",
        emit: false,
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(component.errors).toContainEqual(expect.any(TypeError));
      expect(error).toHaveBeenCalled();
    });

    it.each([
      [true, "show", "false"],
      [false, "hide", "true"],
    ])(
      "should initialize with expanded set to %s",
      (expanded, expectedClass, controllerValue) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          expanded,
          bootstrap: false,
          initialize: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.dom.controller.setAttribute("aria-expanded", controllerValue);

        component.initialize();

        expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
          controllerValue
        );
        expect(component.isExpanded).toBe(expanded);
        expect(component.shouldBeExpanded).toBe(expanded);
        expect(component.dom.controlled.classList.contains(expectedClass)).toBe(
          true
        );
      }
    );

    it("should initialize with the configured locked state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        locked: true,
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isLocked).toBe(true);
      expect(component.shouldBeLocked).toBe(true);
      expect(component.dom.controller.disabled).toBe(true);
    });

    it("should initialize successfully with default state options", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isInitialized).toBe(true);
    });

    it("should initialize collapsed when no expansion is supplied", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isExpanded).toBe(false);
    });

    it("should initialize unlocked when no lock state is supplied", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isLocked).toBe(false);
      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        true
      );
    });

    it("should report an invalid trigger element", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        triggerElement: "invalid",
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should keep lifecycle events on the controller without adding aria-expanded", () => {
      const trigger = document.createElement("span");
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        triggerElement: trigger,
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controller.appendChild(trigger);

      component.initialize();

      const expanded = vi.fn();
      component.dom.controller.addEventListener(
        component.getEventName("expand"),
        expanded
      );

      component.expand({ transition: false });

      expect(component.dom.controller.hasAttribute("aria-expanded")).toBe(
        false
      );
      expect(trigger.hasAttribute("aria-expanded")).toBe(false);
      expect(expanded).toHaveBeenCalledOnce();
      expect(expanded.mock.calls[0][0].target).toBe(component.dom.controller);
    });

    it.each([
      "locked",
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
    ])("should report validation failures for invalid %s", (option) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        [option]: "invalid",
        bootstrap: false,
        initialize: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should ignore a child component's initialize event", () => {
      parent = new CollapsibleComponent({
        controlledElement: document.createElement("div"),
        controllerElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      parent._rootDOMElement = "controller";
      document.body.appendChild(parent.rootDOMElement);
      parent._bootstrap();
      child = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      child._rootDOMElement = "controller";
      document.body.appendChild(child.rootDOMElement);
      child._bootstrap();
      parent.rootDOMElement.append(child.rootDOMElement);
      const collapse = vi.spyOn(parent, "collapse");

      const publicListener = vi.fn();
      parent._addEventListener(
        parent.getEventName("initialize"),
        parent.rootDOMElement,
        publicListener
      );

      child._dispatchEvent("initialize");

      expect(publicListener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ target: child.rootDOMElement })
      );

      expect(collapse).not.toHaveBeenCalled();

      const internalListener = vi.fn();
      parent._addInternalEventListener(
        parent.getEventName("initialize"),
        internalListener
      );
      parent._registerEvent("initialize", { detail: { component: child } });

      parent._dispatchEvent("initialize");

      expect(internalListener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { component: child } })
      );
      expect(collapse).not.toHaveBeenCalled();
    });

    it("should ignore a child component's validate event", () => {
      parent = new CollapsibleComponent({
        controlledElement: document.createElement("div"),
        controllerElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      parent._rootDOMElement = "controller";
      document.body.appendChild(parent.rootDOMElement);
      parent._bootstrap();
      child = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
        initialize: false,
      });
      child._rootDOMElement = "controller";
      document.body.appendChild(child.rootDOMElement);
      child._bootstrap();
      parent.rootDOMElement.append(child.rootDOMElement);
      parent._expandInsideBreakpoint = "invalid";

      const publicListener = vi.fn();
      parent._addEventListener(
        parent.getEventName("validate"),
        parent.rootDOMElement,
        publicListener
      );

      child._dispatchEvent("validate");

      expect(publicListener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ target: child.rootDOMElement })
      );

      expect(parent.isValid).toBe(true);

      const internalListener = vi.fn();
      parent._addInternalEventListener(
        parent.getEventName("validate"),
        internalListener
      );
      parent._registerEvent("validate", { detail: { component: child } });

      parent._dispatchEvent("validate");

      expect(internalListener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { component: child } })
      );
      expect(parent.isValid).toBe(true);
    });
  });
});
