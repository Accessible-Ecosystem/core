/**
 * Initialization tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import ResponsiveComponent from "../../src/ResponsiveComponent.js";
import { createResponsive, setupMatchMedia } from "../helpers.js";

describe("ResponsiveComponent initialization", () => {
  describe("constructor", () => {
    it("should bootstrap by default", () => {
      const spy = vi.spyOn(ResponsiveComponent.prototype, "_bootstrap");

      const component = new ResponsiveComponent();

      expect(spy).toHaveBeenCalledTimes(1);

      component.dispose();
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(ResponsiveComponent.prototype, "_bootstrap");

      const component = new ResponsiveComponent({ bootstrap: false });

      expect(spy).not.toHaveBeenCalled();

      component.dispose();
    });

    it("should use an empty string when breakpoint is null", () => {
      expect(createResponsive({ breakpoint: null }).breakpoint).toBe("");
    });

    it("should use an empty string when mediaQuery is null", () => {
      expect(createResponsive({ mediaQuery: null }).mediaQuery).toBe("");
    });
  });

  describe("initialize", () => {
    it("should call _handleMediaMatch during initialization", () => {
      vi.useFakeTimers();
      const { list, matchMedia } = setupMatchMedia(true);
      const component = createResponsive({ breakpoint: "768px" });
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");

      component.initialize();

      expect(component.isInitialized).toBe(true);
      expect(matchMedia).toHaveBeenCalledWith("(width <= 768px)");

      vi.advanceTimersToNextFrame();

      expect(callback).toHaveBeenCalledExactlyOnceWith(list);
    });

    it.each([{ breakpoint: 123 }, { mediaQuery: {} }])(
      "should validate responsive options %j",
      (options) => {
        const component = createResponsive(options);
        const error = vi.spyOn(console, "error").mockImplementation(() => {});

        component.initialize();

        expect(component.isInitialized).toBe(false);
        expect(component.isValid).toBe(false);
        expect(component.errors).toHaveLength(1);
        expect(error).toHaveBeenCalledWith(expect.any(Error));
      }
    );
  });
});
