import { describe, it, expect, vi } from "vitest";
import CollapsableComponent from "../../src/CollapsableComponent.js";
import { createCollapsable } from "../helpers.js";

describe("CollapsableComponent initialization", () => {
  describe("constructor", () => {
    it("should bootstrap by default", () => {
      const spy = vi.spyOn(CollapsableComponent.prototype, "_bootstrap");

      const component = new CollapsableComponent();

      expect(spy).toHaveBeenCalledTimes(1);

      component.dispose();
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(CollapsableComponent.prototype, "_bootstrap");

      const component = new CollapsableComponent({ bootstrap: false });

      expect(spy).not.toHaveBeenCalled();

      component.dispose();
    });

    it("should configure the default classes", () => {
      expect(createCollapsable().classes).toEqual({
        initialize: "initializing",
        locked: "locked",
        unlocked: "unlocked",
        expand: "show",
        collapse: "hide",
        transition: "transitioning",
      });
    });

    it("should configure the default durations", () => {
      expect(createCollapsable().durations).toEqual({
        transition: 150,
        expand: -1,
        collapse: -1,
      });
    });

    it("should configure the default transition delay", () => {
      expect(createCollapsable().delays).toEqual({ transition: 250 });
    });

    it("should protect controller and controlled DOM slots", () => {
      expect(createCollapsable()._protectedDOMElements).toEqual([
        "controller",
        "controlled",
      ]);
    });

    it.each([
      ["lockClass", "lockedClass"],
      ["unlockClass", "unlockedClass"],
      ["expandClass", "expandClass"],
      ["collapseClass", "collapseClass"],
      ["transitionClass", "transitionClass"],
    ])("should normalize a null %s option", (option, property) => {
      const component = createCollapsable({ [option]: null });

      expect(component[property]).toBe("");
    });
  });

  describe("initialize", () => {
    it.each([true, false])(
      "should initialize expansion from aria-expanded=%s",
      (expanded) => {
        const component = createCollapsable();
        component.dom.controller.setAttribute(
          "aria-expanded",
          String(expanded)
        );

        component.initialize();

        expect(component.isExpanded).toBe(expanded);
        expect(component.shouldBeExpanded).toBe(expanded);
        expect(
          component.dom.controlled.classList.contains(
            expanded ? "show" : "hide"
          )
        ).toBe(true);
      }
    );

    it("should initialize with the configured locked state", () => {
      const component = createCollapsable({ locked: true });

      component.initialize();

      expect(component.isLocked).toBe(true);
      expect(component.shouldBeLocked).toBe(true);
      expect(component.dom.controller.disabled).toBe(true);
    });

    it("should initialize successfully with default state options", () => {
      const component = createCollapsable();

      component.initialize();

      expect(component.isInitialized).toBe(true);
    });

    it("should initialize collapsed when no expansion is supplied", () => {
      const component = createCollapsable();

      component.initialize();

      expect(component.isExpanded).toBe(false);
    });

    it("should initialize unlocked when no lock state is supplied", () => {
      const component = createCollapsable();

      component.initialize();

      expect(component.isLocked).toBe(false);
      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        true
      );
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
    ])("should reject invalid %s", (option) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const component = createCollapsable({ [option]: "invalid" });

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
