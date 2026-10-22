/**
 * Initialization tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import ResponsiveComponent from "../../src/ResponsiveComponent.js";
import { setupMatchMedia } from "../helpers.js";

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

describe("ResponsiveComponent initialization", () => {
  describe("constructor", () => {
    it("should bootstrap by default", () => {
      const spy = vi.spyOn(ResponsiveComponent.prototype, "_bootstrap");

      component = new ResponsiveComponent();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should skip bootstrapping when bootstrap is false", () => {
      const spy = vi.spyOn(ResponsiveComponent.prototype, "_bootstrap");

      component = new ResponsiveComponent({ bootstrap: false });

      expect(spy).not.toHaveBeenCalled();
    });

    it("should use an empty string when breakpoint is null", () => {
      component = new ResponsiveComponent({
        breakpoint: null,
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.breakpoint).toBe("");
    });

    it("should use an empty string when mediaQuery is null", () => {
      component = new ResponsiveComponent({
        mediaQuery: null,
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.mediaQuery).toBe("");
    });
  });

  describe("initialize", () => {
    it("should call _handleMediaMatch during initialization", () => {
      vi.useFakeTimers();
      const { list, matchMedia } = setupMatchMedia(true);
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
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
        component = new ResponsiveComponent({ ...options, bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
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
