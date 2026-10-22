/**
 * Public method tests for the Component class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import Component from "../../src/Component.js";

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

describe("Component public methods", () => {
  describe("init", () => {
    it("should initialize through the alias", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.init();

      expect(component.isInitialized).toBe(true);
    });
  });

  describe("getEventName", () => {
    it("should return a registered event name", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.getEventName("initialize")).toBe(
        "accessibleEcosystemComponentInitialize"
      );
    });

    it("should return null for an unregistered event", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.getEventName("missing")).toBeNull();
    });
  });
  for (const method of ["focus", "blur"])
    describe(method, () => {
      it.each(["none", "mouse", "keyboard", "character"])(
        "should update the focus state for the %s event",
        (currentEvent) => {
          component = new Component({ bootstrap: false });
          component._dom.root = document.createElement("button");
          component._rootDOMElement = "root";
          document.body.appendChild(component.rootDOMElement);
          component._bootstrap();
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
          component = new Component({ bootstrap: false });
          component._dom.root = document.createElement("button");
          component._rootDOMElement = "root";
          document.body.appendChild(component.rootDOMElement);
          component._bootstrap();
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
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const callback = vi.fn();
      component._setTimeout(callback, 10);

      component.dispose();
      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel active intervals", () => {
      vi.useFakeTimers();
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const callback = vi.fn();
      component._setInterval(callback, 10);

      component.dispose();
      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should detach event listeners", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const callback = vi.fn();
      component._addEventListener("click", component.rootDOMElement, callback);

      component.dispose();
      component.rootDOMElement.click();

      expect(callback).not.toHaveBeenCalled();
      expect(component.listeners).toEqual([]);
    });

    it("should remove the component from storage", () => {
      component = new Component({ key: "dispose", bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
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
