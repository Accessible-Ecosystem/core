import { describe, it, expect, vi } from "vitest";
import { createComponent } from "../helpers.js";

describe("Component public methods", () => {
  describe("init", () => {
    it("should initialize through the alias", () => {
      const component = createComponent();

      component.init();

      expect(component.isInitialized).toBe(true);
    });
  });

  describe("getEventName", () => {
    it("should return a registered event name", () => {
      expect(createComponent().getEventName("initialize")).toBe(
        "accessibleEcosystemComponentInitialize"
      );
    });

    it("should return null for an unregistered event", () => {
      expect(createComponent().getEventName("missing")).toBeNull();
    });
  });
  for (const method of ["focus", "blur"])
    describe(method, () => {
      it.each(["none", "mouse", "keyboard", "character"])(
        "should update the focus state for the %s event",
        (currentEvent) => {
          const component = createComponent();
          component.currentEvent = currentEvent;

          component[method]();

          expect(component.focusState).toBe(
            method === "focus" ? "self" : "none"
          );
        }
      );

      it.each(["none", "mouse", "keyboard", "character"])(
        "should respect DOM focus eligibility for the %s event",
        (currentEvent) => {
          const component = createComponent();
          const root = component.rootDOMElement;
          root.focus();
          if (method === "focus") root.blur();
          component.currentEvent = currentEvent;

          component[method]();

          expect(document.activeElement === root).toBe(
            method === "focus"
              ? currentEvent === "keyboard"
              : currentEvent !== "keyboard"
          );
        }
      );
    });

  describe("dispose", () => {
    it("should cancel pending timeouts", () => {
      vi.useFakeTimers();
      const component = createComponent(),
        callback = vi.fn();
      component._setTimeout(callback, 10);

      component.dispose();
      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel active intervals", () => {
      vi.useFakeTimers();
      const component = createComponent(),
        callback = vi.fn();
      component._setInterval(callback, 10);

      component.dispose();
      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should detach event listeners", () => {
      const component = createComponent(),
        callback = vi.fn();
      component._addEventListener("click", component.rootDOMElement, callback);

      component.dispose();
      component.rootDOMElement.click();

      expect(callback).not.toHaveBeenCalled();
      expect(component.listeners).toEqual([]);
    });

    it("should remove the component from storage", () => {
      const component = createComponent({ key: "dispose" });
      component.initialize();

      component.dispose();

      expect(
        window.AccessibleEcosystemStorage.get({
          type: "components",
          key: "dispose",
        })
      ).toBeUndefined();
    });
  });
});
