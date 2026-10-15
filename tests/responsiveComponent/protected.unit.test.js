/**
 * Protected method tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import { createResponsive, setupMatchMedia } from "../helpers.js";

describe("ResponsiveComponent protected methods", () => {
  describe("_bootstrap", () => {
    it.each(["validate", "initialize"])(
      "should track the %s lifecycle listener",
      (name) => {
        const component = createResponsive();

        expect(component.listeners.map((listener) => listener.type)).toContain(
          component.getEventName(name)
        );
      }
    );

    it("should log listener registration failures", () => {
      const component = createResponsive(),
        failure = new Error("listener failure");
      vi.spyOn(component, "_addEventListener").mockImplementation(() => {
        throw failure;
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(error).toHaveBeenCalledWith(failure);
    });

    it("should invalidate the component when listener registration fails", () => {
      const component = createResponsive();
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

      createResponsive()._handleMediaMatch();

      expect(matchMedia).not.toHaveBeenCalled();
    });

    it("should request the configured media query", () => {
      vi.useFakeTimers();
      const { matchMedia } = setupMatchMedia();
      const component = createResponsive({ breakpoint: "768px" });

      component._handleMediaMatch();

      expect(matchMedia).toHaveBeenCalledExactlyOnceWith("(width <= 768px)");
    });

    it("should defer the initial callback until an animation frame", () => {
      vi.useFakeTimers();
      setupMatchMedia();
      const component = createResponsive({ breakpoint: "768px" });
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");

      component._handleMediaMatch();

      expect(callback).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      "should forward the initial media query list with matches=%s",
      (matches) => {
        vi.useFakeTimers();
        const { list } = setupMatchMedia(matches);
        const component = createResponsive({ breakpoint: "768px" });
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
        const component = createResponsive({ breakpoint: "768px" });

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
      const component = createResponsive({ breakpoint: "768px" });

      component._handleMediaMatch();
      vi.advanceTimersToNextFrame();
      const callback = vi.spyOn(component, "_mediaQueryListEventCallback");
      component.dispose();
      list.dispatchEvent(new Event("change"));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
