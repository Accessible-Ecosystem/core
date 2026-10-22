/**
 * Protected method tests for the ResponsiveComponent class.
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

describe("ResponsiveComponent protected methods", () => {
  describe("_bootstrap", () => {
    it.each(["validate", "initialize"])(
      "should track the %s lifecycle listener",
      (name) => {
        component = new ResponsiveComponent({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        expect(component.listeners.map((listener) => listener.type)).toContain(
          component.getEventName(name)
        );
      }
    );

    it("should log listener registration failures", () => {
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const failure = new Error("listener failure");
      vi.spyOn(component, "_addEventListener").mockImplementation(() => {
        throw failure;
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(error).toHaveBeenCalledWith(failure);
    });

    it("should invalidate the component when listener registration fails", () => {
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(component, "_addEventListener").mockImplementation(() => {
        throw new Error("listener failure");
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(component.isValid).toBe(false);
    });
  });

  describe("_handleMediaMatch", () => {
    it("should skip an empty query", () => {
      const { matchMedia } = setupMatchMedia();

      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._handleMediaMatch();

      expect(matchMedia).not.toHaveBeenCalled();
    });

    it("should request the configured media query", () => {
      vi.useFakeTimers();
      const { matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._handleMediaMatch();

      expect(matchMedia).toHaveBeenCalledExactlyOnceWith("(width <= 768px)");
    });

    it("should defer the initial callback until an animation frame", () => {
      vi.useFakeTimers();
      setupMatchMedia();
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");

      component._handleMediaMatch();

      expect(callback).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      "should forward the initial media query list with matches=%s",
      (matches) => {
        vi.useFakeTimers();
        const { list } = setupMatchMedia(matches);
        component = new ResponsiveComponent({
          breakpoint: "768px",
          bootstrap: false,
        });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const callback = vi.spyOn(component, "_mediaQueryListEventCallback");

        component._handleMediaMatch();
        vi.advanceTimersToNextFrame();

        expect(callback).toHaveBeenCalledExactlyOnceWith(list);
      }
    );

    it.each([true, false])(
      "should forward a change event with matches=%s",
      (matches) => {
        vi.useFakeTimers();
        const { list } = setupMatchMedia(!matches);
        component = new ResponsiveComponent({
          breakpoint: "768px",
          bootstrap: false,
        });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component._handleMediaMatch();
        vi.advanceTimersToNextFrame();
        const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
        const event = new Event("change");
        Object.assign(event, { matches });

        list.dispatchEvent(event);

        expect(callback).toHaveBeenCalledExactlyOnceWith(event);
      }
    );

    it("should detach the media query change listener on disposal", () => {
      vi.useFakeTimers();
      const { list } = setupMatchMedia();
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._handleMediaMatch();
      vi.advanceTimersToNextFrame();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
      component.dispose();

      list.dispatchEvent(new Event("change"));

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel the initial media callback on disposal", () => {
      vi.useFakeTimers();
      setupMatchMedia();
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");

      component._handleMediaMatch();
      component.dispose();
      vi.advanceTimersByTime(32);

      expect(callback).not.toHaveBeenCalled();
      expect(component.frames).toEqual({});
    });
  });
});
