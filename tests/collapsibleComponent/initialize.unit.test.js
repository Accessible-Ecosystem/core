/**
 * Initialization tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import CollapsibleComponent from "../../src/CollapsibleComponent.js";
import { createCollapsible } from "../helpers.js";

describe("CollapsibleComponent initialization", () => {
  describe("constructor", () => {
    it("should bootstrap by default", () => {
      const spy = vi.spyOn(CollapsibleComponent.prototype, "_bootstrap");

      const component = new CollapsibleComponent();

      expect(spy).toHaveBeenCalledTimes(1);

      component.dispose();
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(CollapsibleComponent.prototype, "_bootstrap");

      const component = new CollapsibleComponent({ bootstrap: false });

      expect(spy).not.toHaveBeenCalled();

      component.dispose();
    });

    it("should configure the default classes", () => {
      expect(createCollapsible().classes).toEqual({
        initialize: "initializing",
        locked: "locked",
        unlocked: "unlocked",
        expand: "show",
        collapse: "hide",
        transition: "transitioning",
      });
    });

    it("should configure the default durations", () => {
      expect(createCollapsible().durations).toEqual({
        transition: 150,
        expand: -1,
        collapse: -1,
      });
    });

    it("should configure the default transition delay", () => {
      expect(createCollapsible().delays).toEqual({ transition: 250 });
    });

    it("should protect controller and controlled DOM slots", () => {
      expect(createCollapsible()._protectedDOMElements).toEqual([
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
    ])("should use an empty string when %s is null", (option, property) => {
      const component = createCollapsible({ [option]: null });

      expect(component[property]).toBe("");
    });
  });

  describe("initialize", () => {
    it.each([true, false])(
      "should initialize expansion from aria-expanded=%s",
      (expanded) => {
        const component = createCollapsible();
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
      const component = createCollapsible({ locked: true });

      component.initialize();

      expect(component.isLocked).toBe(true);
      expect(component.shouldBeLocked).toBe(true);
      expect(component.dom.controller.disabled).toBe(true);
    });

    it("should initialize successfully with default state options", () => {
      const component = createCollapsible();

      component.initialize();

      expect(component.isInitialized).toBe(true);
    });

    it("should initialize collapsed when no expansion is supplied", () => {
      const component = createCollapsible();

      component.initialize();

      expect(component.isExpanded).toBe(false);
    });

    it("should initialize unlocked when no lock state is supplied", () => {
      const component = createCollapsible();

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
      const component = createCollapsible({ [option]: "invalid" });

      component.initialize();

      expect(component.isInitialized).toBe(false);
      expect(component.isValid).toBe(false);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
