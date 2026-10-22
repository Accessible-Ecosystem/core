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
    it("should bootstrap by default", () => {
      const spy = vi.spyOn(CollapsibleComponent.prototype, "_bootstrap");

      component = new CollapsibleComponent();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(CollapsibleComponent.prototype, "_bootstrap");

      component = new CollapsibleComponent({ bootstrap: false });

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
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component[property]).toBe("");
    });
  });

  describe("initialize", () => {
    it.each([
      [true, "show"],
      [false, "hide"],
    ])(
      "should initialize expansion from aria-expanded=%s",
      (expanded, expectedClass) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.dom.controller.setAttribute(
          "aria-expanded",
          String(expanded)
        );

        component.initialize();

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
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should keep ARIA attributes and lifecycle events on the controller", () => {
      const trigger = document.createElement("span");
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        triggerElement: trigger,
        bootstrap: false,
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

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "true"
      );
      expect(trigger.hasAttribute("aria-expanded")).toBe(false);
      expect(expanded).toHaveBeenCalledOnce();
      expect(expanded.mock.calls[0][0].target).toBe(component.dom.controller);
    });

    it.each([
      "locked",
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
      });
      parent._rootDOMElement = "controller";
      document.body.appendChild(parent.rootDOMElement);
      parent._bootstrap();
      child = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      child._rootDOMElement = "controller";
      document.body.appendChild(child.rootDOMElement);
      child._bootstrap();
      parent.rootDOMElement.append(child.rootDOMElement);
      const collapse = vi.spyOn(parent, "collapse");

      child._dispatchEvent("initialize");

      expect(collapse).not.toHaveBeenCalled();
    });

    it("should ignore a child component's validate event", () => {
      parent = new CollapsibleComponent({
        controlledElement: document.createElement("div"),
        controllerElement: document.createElement("div"),
        bootstrap: false,
      });
      parent._rootDOMElement = "controller";
      document.body.appendChild(parent.rootDOMElement);
      parent._bootstrap();
      child = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      child._rootDOMElement = "controller";
      document.body.appendChild(child.rootDOMElement);
      child._bootstrap();
      parent.rootDOMElement.append(child.rootDOMElement);
      parent._expandInsideBreakpoint = "invalid";

      child._dispatchEvent("validate");

      expect(parent.isValid).toBe(true);
    });
  });
});
