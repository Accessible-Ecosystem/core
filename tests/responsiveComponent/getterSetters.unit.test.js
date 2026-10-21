/**
 * Getter/Setter tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import { createResponsive, setupMatchMedia } from "../helpers.js";

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
        const component = createResponsive(options);
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
      const component = createResponsive({ breakpoint: "768px" });

      expect(component.breakpoint).toBe("768px");
    });

    it("should update the breakpoint", () => {
      const component = createResponsive({ breakpoint: "768px" });

      component.breakpoint = "1024px";

      expect(component.breakpoint).toBe("1024px");
    });
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
        const component = createResponsive(options);
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
      const component = createResponsive({ breakpoint: "768px" });

      expect(component.mediaQuery).toBe("(width <= 768px)");
    });

    it("should derive the query from an updated breakpoint", () => {
      const component = createResponsive({ breakpoint: "768px" });
      component.breakpoint = "1024px";

      expect(component.mediaQuery).toBe("(width <= 1024px)");
    });

    it("should prefer an explicit query over the breakpoint", () => {
      const component = createResponsive({
        breakpoint: "768px",
        mediaQuery: "(min-width: 1024px)",
      });

      expect(component.mediaQuery).toBe("(min-width: 1024px)");
    });

    it("should update an explicit query", () => {
      const component = createResponsive();

      component.mediaQuery = "(orientation: portrait)";

      expect(component.mediaQuery).toBe("(orientation: portrait)");
    });

    it("should fall back to the breakpoint when the explicit query is cleared", () => {
      const component = createResponsive({
        breakpoint: "768px",
        mediaQuery: "(orientation: portrait)",
      });

      component.mediaQuery = "";

      expect(component.mediaQuery).toBe("(width <= 768px)");
    });

    it("should return an empty query when no breakpoint or query is configured", () => {
      expect(createResponsive().mediaQuery).toBe("");
    });
  });
  for (const name of ["breakpoint", "mediaQuery"])
    describe(name, () => {
      it("should wait for initialization before registering a listener", () => {
        const { matchMedia } = setupMatchMedia();
        const component = createResponsive();

        component[name] = "768px";

        expect(matchMedia).not.toHaveBeenCalled();
      });

      it("should keep the current listener when assigned the same value", () => {
        vi.useFakeTimers();
        const { list, matchMedia } = setupMatchMedia();
        const component = createResponsive({ [name]: "768px" });
        component.initialize();
        const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
        matchMedia.mockClear();

        component[name] = "768px";
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
        const component = createResponsive({ [name]: "768px" });
        component.initialize();
        const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
        matchMedia.mockClear();

        component[name] = "";
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
        const component = createResponsive();

        component[name] = "768px";
        const original = component[name];
        component[name] = "768px";

        expect(component[name]).toBe(original);
      });

      it.each([123, null, {}, []])(
        "should reject %j without changing its value",
        (value) => {
          const component = createResponsive({ breakpoint: "768px" });
          const original = component[name];

          expect(() => {
            component[name] = value;
          }).toThrow(TypeError);
          expect(component[name]).toBe(original);
        }
      );
    });
});
