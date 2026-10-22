/**
 * Initialization tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import ResponsiveComponent from "../../src/ResponsiveComponent.js";
import { setupMatchMedia } from "../helpers.js";

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
    it("should set up the media query during initialization", () => {
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
      "should report validation failures for responsive options %j",
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

    it("should ignore a child component's initialize event", () => {
      parent = new ResponsiveComponent({ bootstrap: false });
      parent._dom.root = document.createElement("div");
      parent._rootDOMElement = "root";
      document.body.appendChild(parent.rootDOMElement);
      parent._bootstrap();
      child = new ResponsiveComponent({ bootstrap: false });
      child._dom.root = document.createElement("button");
      child._rootDOMElement = "root";
      document.body.appendChild(child.rootDOMElement);
      child._bootstrap();
      parent.rootDOMElement.appendChild(child.rootDOMElement);
      const handleMediaMatch = vi.spyOn(parent, "_handleMediaMatch");
      const initialize = vi.fn();
      parent._addEventListener(
        parent.getEventName("initialize"),
        parent.rootDOMElement,
        initialize
      );

      child._dispatchEvent("initialize");

      expect(initialize).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ target: child.rootDOMElement })
      );
      expect(handleMediaMatch).not.toHaveBeenCalled();
    });

    it("should ignore a child component's validate event", () => {
      parent = new ResponsiveComponent({ bootstrap: false });
      parent._dom.root = document.createElement("div");
      parent._rootDOMElement = "root";
      document.body.appendChild(parent.rootDOMElement);
      parent._bootstrap();
      child = new ResponsiveComponent({ bootstrap: false });
      child._dom.root = document.createElement("button");
      child._rootDOMElement = "root";
      document.body.appendChild(child.rootDOMElement);
      child._bootstrap();
      parent.rootDOMElement.appendChild(child.rootDOMElement);
      parent._breakpoint = 12;
      const validate = vi.fn();
      parent._addEventListener(
        parent.getEventName("validate"),
        parent.rootDOMElement,
        validate
      );

      child._dispatchEvent("validate");

      expect(validate).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ target: child.rootDOMElement })
      );
      expect(parent.isValid).toBe(true);
    });
  });
});
