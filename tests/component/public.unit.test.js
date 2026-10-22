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

  describe("focus", () => {
    it.each(["none", "mouse", "keyboard", "character"])(
      "should update the focus state for the %s event",
      (currentEvent) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.currentEvent = currentEvent;

        component.focus();

        expect(component.focusState).toBe("self");
      }
    );

    it.each([
      ["none", false],
      ["mouse", false],
      ["keyboard", true],
      ["character", false],
    ])(
      "should respect DOM focus eligibility for the %s event",
      (currentEvent, expectedFocus) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const root = component.rootDOMElement;

        root.focus();
        root.blur();
        component.currentEvent = currentEvent;

        component.focus();

        expect(document.activeElement === root).toBe(expectedFocus);
      }
    );
  });

  describe("blur", () => {
    it.each(["none", "mouse", "keyboard", "character"])(
      "should update the focus state for the %s event",
      (currentEvent) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.currentEvent = currentEvent;

        component.blur();

        expect(component.focusState).toBe("none");
      }
    );

    it.each([
      ["none", true],
      ["mouse", true],
      ["keyboard", false],
      ["character", true],
    ])(
      "should respect DOM focus eligibility for the %s event",
      (currentEvent, expectedFocus) => {
        component = new Component({ bootstrap: false });
        component._dom.root = document.createElement("button");
        component._rootDOMElement = "root";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        const root = component.rootDOMElement;
        root.focus();

        component.currentEvent = currentEvent;

        component.blur();

        expect(document.activeElement === root).toBe(expectedFocus);
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

    it("should cancel all pending frames on disposal", () => {
      component = new Component({ bootstrap: false });
      component._dom.root = document.createElement("button");
      component._rootDOMElement = "root";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      vi.spyOn(window, "requestAnimationFrame")
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);
      const cancel = vi.spyOn(window, "cancelAnimationFrame");
      component._requestAnimationFrame(vi.fn());
      component._requestAnimationFrame(vi.fn(), "focus");

      component.dispose();

      expect(cancel).toHaveBeenCalledWith(1);
      expect(cancel).toHaveBeenCalledWith(2);
      expect(component.frames).toEqual({});
    });
  });
});
