/**
 * Getter/Setter tests for the ResponsiveComponent class.
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

describe("ResponsiveComponent getter/setters", () => {
  describe("breakpoint", () => {
    it.each([
      [{ breakpoint: "768px" }, "1024px", "(width <= 1024px)"],
      [
        { breakpoint: "768px", mediaQuery: "(orientation: portrait)" },
        "1024px",
        "(orientation: portrait)",
      ],
    ])(
      "should replace the listener for %j and apply the query on the next frame",
      (options, value, query) => {
        vi.useFakeTimers();
        const { list: oldList } = setupMatchMedia();
        component = new ResponsiveComponent({ ...options, bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
        const { list, matchMedia } = setupMatchMedia(true);

        component.breakpoint = value;

        oldList.dispatchEvent(new Event("change"));

        expect(matchMedia).toHaveBeenCalledExactlyOnceWith(query);
        expect(callback).not.toHaveBeenCalled();
        expect(
          component.listeners.filter((listener) => listener.type === "change")
        ).toHaveLength(1);

        vi.advanceTimersToNextFrame();

        expect(callback).toHaveBeenCalledExactlyOnceWith(list);

        const event = new Event("change");

        list.dispatchEvent(event);

        expect(callback).toHaveBeenLastCalledWith(event);
      }
    );

    it("should return the configured breakpoint", () => {
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.breakpoint).toBe("768px");
    });

    it("should update the breakpoint", () => {
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.breakpoint = "1024px";

      expect(component.breakpoint).toBe("1024px");
    });

    it("should wait for initialization before registering a listener", () => {
      const { matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.breakpoint = "768px";

      expect(matchMedia).not.toHaveBeenCalled();
    });

    it("should keep the current listener when assigned the same value", () => {
      vi.useFakeTimers();
      const { list, matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
      matchMedia.mockClear();

      component.breakpoint = "768px";
      vi.advanceTimersToNextFrame();

      expect(matchMedia).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledExactlyOnceWith(list);

      const event = new Event("change");

      list.dispatchEvent(event);

      expect(callback).toHaveBeenLastCalledWith(event);
    });

    it("should remove the listener and pending callback when the query is cleared", () => {
      vi.useFakeTimers();
      const { list, matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
      matchMedia.mockClear();

      component.breakpoint = "";

      list.dispatchEvent(new Event("change"));
      vi.advanceTimersToNextFrame();

      expect(matchMedia).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
      expect(component.frames).toEqual({});
      expect(
        component.listeners.filter((listener) => listener.type === "change")
      ).toHaveLength(0);
    });

    it("should retain its value when assigned again", () => {
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.breakpoint = "768px";
      const original = component.breakpoint;
      component.breakpoint = "768px";

      expect(component.breakpoint).toBe(original);
    });

    it.each([123, null, {}, []])(
      "should reject %j without changing its value",
      (value) => {
        component = new ResponsiveComponent({
          breakpoint: "768px",
          bootstrap: false,
        });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const original = component.breakpoint;

        expect(() => {
          component.breakpoint = value;
        }).toThrow(TypeError);
        expect(component.breakpoint).toBe(original);
      }
    );
  });

  describe("mediaQuery", () => {
    it.each([
      [
        { breakpoint: "768px" },
        "(orientation: portrait)",
        "(orientation: portrait)",
      ],
      [
        { breakpoint: "768px", mediaQuery: "(orientation: portrait)" },
        "",
        "(width <= 768px)",
      ],
    ])(
      "should replace the listener for %j and apply the query on the next frame",
      (options, value, query) => {
        vi.useFakeTimers();
        const { list: oldList } = setupMatchMedia();
        component = new ResponsiveComponent({ ...options, bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
        const { list, matchMedia } = setupMatchMedia(true);

        component.mediaQuery = value;

        oldList.dispatchEvent(new Event("change"));

        expect(matchMedia).toHaveBeenCalledExactlyOnceWith(query);
        expect(callback).not.toHaveBeenCalled();
        expect(
          component.listeners.filter((listener) => listener.type === "change")
        ).toHaveLength(1);

        vi.advanceTimersToNextFrame();

        expect(callback).toHaveBeenCalledExactlyOnceWith(list);

        const event = new Event("change");

        list.dispatchEvent(event);

        expect(callback).toHaveBeenLastCalledWith(event);
      }
    );

    it("should derive the query from the configured breakpoint", () => {
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.mediaQuery).toBe("(width <= 768px)");
    });

    it("should derive the query from an updated breakpoint", () => {
      component = new ResponsiveComponent({
        breakpoint: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.breakpoint = "1024px";

      expect(component.mediaQuery).toBe("(width <= 1024px)");
    });

    it("should prefer an explicit query over the breakpoint", () => {
      component = new ResponsiveComponent({
        breakpoint: "768px",
        mediaQuery: "(min-width: 1024px)",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.mediaQuery).toBe("(min-width: 1024px)");
    });

    it("should update an explicit query", () => {
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.mediaQuery = "(orientation: portrait)";

      expect(component.mediaQuery).toBe("(orientation: portrait)");
    });

    it("should fall back to the breakpoint when the explicit query is cleared", () => {
      component = new ResponsiveComponent({
        breakpoint: "768px",
        mediaQuery: "(orientation: portrait)",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.mediaQuery = "";

      expect(component.mediaQuery).toBe("(width <= 768px)");
    });

    it("should return an empty query when no breakpoint or query is configured", () => {
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.mediaQuery).toBe("");
    });

    it("should wait for initialization before registering a listener", () => {
      const { matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.mediaQuery = "768px";

      expect(matchMedia).not.toHaveBeenCalled();
    });

    it("should keep the current listener when assigned the same value", () => {
      vi.useFakeTimers();
      const { list, matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({
        mediaQuery: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
      matchMedia.mockClear();

      component.mediaQuery = "768px";
      vi.advanceTimersToNextFrame();

      expect(matchMedia).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledExactlyOnceWith(list);

      const event = new Event("change");

      list.dispatchEvent(event);

      expect(callback).toHaveBeenLastCalledWith(event);
    });

    it("should remove the listener and pending callback when the query is cleared", () => {
      vi.useFakeTimers();
      const { list, matchMedia } = setupMatchMedia();
      component = new ResponsiveComponent({
        mediaQuery: "768px",
        bootstrap: false,
      });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
      matchMedia.mockClear();

      component.mediaQuery = "";

      list.dispatchEvent(new Event("change"));
      vi.advanceTimersToNextFrame();

      expect(matchMedia).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
      expect(component.frames).toEqual({});
      expect(
        component.listeners.filter((listener) => listener.type === "change")
      ).toHaveLength(0);
    });

    it("should retain its value when assigned again", () => {
      component = new ResponsiveComponent({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.mediaQuery = "768px";
      const original = component.mediaQuery;
      component.mediaQuery = "768px";

      expect(component.mediaQuery).toBe(original);
    });

    it.each([123, null, {}, []])(
      "should reject %j without changing its value",
      (value) => {
        component = new ResponsiveComponent({
          breakpoint: "768px",
          bootstrap: false,
        });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const original = component.mediaQuery;

        expect(() => {
          component.mediaQuery = value;
        }).toThrow(TypeError);
        expect(component.mediaQuery).toBe(original);
      }
    );
  });
});
