/**
 * Protected method tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import CollapsibleComponent from "../../src/CollapsibleComponent.js";

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

describe("CollapsibleComponent protected methods", () => {
  describe("_bootstrap", () => {
    it.each(["expand", "collapse", "lock", "unlock"])(
      "should register the %s action events",
      (action) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        for (const prefix of ["pre", "", "post"])
          expect(component.events[`${prefix}${action}`]).toBeInstanceOf(
            CustomEvent
          );
      }
    );

    it("should register lifecycle listeners", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      expect(component.listeners).toHaveLength(4);
    });
  });

  describe("_expand", () => {
    it("should emit lifecycle events in order", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const events = [];
      for (const name of ["preexpand", "expand", "postexpand"]) {
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => events.push(name)
        );
      }

      component._expand({ emit: true, transition: false });

      expect(events).toEqual(["preexpand", "expand", "postexpand"]);
    });

    it("should include the component in event detail", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener(
        component.getEventName("expand"),
        component.rootDOMElement,
        listener
      );

      component._expand({ emit: true, transition: false });

      expect(listener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { component } })
      );
    });

    it("should suppress lifecycle events when emit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      for (const name of ["preexpand", "expand", "postexpand"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          listener
        );

      component._expand({ emit: false, transition: false });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should apply the action attribute", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._expand({ emit: false, transition: false });

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "true"
      );
    });

    it("should apply the action class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._expand({ emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("show")).toBe(true);
    });

    it("should cancel pending expand transition frames on disposal", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandClass: "show",
        collapseClass: "hide",
        transitionClass: "transitioning",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controlled.classList.add("hide");

      component._expand({ emit: false, transition: true });
      component.dispose();
      vi.advanceTimersByTime(64);

      expect(component.dom.controlled.classList.contains("hide")).toBe(true);
      expect(component.frames).toEqual({});
    });

    // https://github.com/Accessible-Ecosystem/core/issues/6
    it.each([true, false])(
      "should replace pending collapse frames with transition set to %s",
      (transition) => {
        vi.useFakeTimers();
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component._collapse({ emit: false, transition: true });
        component._expand({ emit: false, transition });
        vi.runAllTimers();

        expect(component.dom.controlled.classList.contains("show")).toBe(true);
        expect(component.dom.controlled.classList.contains("hide")).toBe(false);
        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(false);
      }
    );

    // https://github.com/Accessible-Ecosystem/core/issues/6
    it.each(["_expand", "_collapse"])(
      "should replace the pending %s timer with the new expand duration",
      (previousAction) => {
        vi.useFakeTimers();
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionDuration: 100,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component[previousAction]({ emit: false, transition: true });
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersByTime(50);

        component._expand({ emit: false, transition: true });
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersByTime(99);

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(true);

        vi.advanceTimersByTime(1);

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(false);
      }
    );

    // https://github.com/Accessible-Ecosystem/core/issues/6
    it("should cancel the pending expand transition timer on disposal", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._expand({ emit: false, transition: true });
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();

      component.dispose();

      expect(vi.getTimerCount()).toBe(0);
    });

    it("should sequence state class changes over animation frames", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const element = component.dom.controlled;
      const from = "hide",
        to = "show";
      element.classList.add(from);

      component._expand({ emit: false, transition: true });

      expect(element.classList.contains(from)).toBe(true);

      vi.advanceTimersToNextFrame();

      expect(element.classList.contains(from)).toBe(false);
      expect(element.classList.contains(to)).toBe(false);

      vi.advanceTimersToNextFrame();

      expect(element.classList.contains(to)).toBe(true);
    });

    it("should add the transition class immediately", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._expand({ emit: false, transition: true });

      expect(component.dom.controlled.classList.contains("transitioning")).toBe(
        true
      );
    });

    it("should remove the transition class after the action duration", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandDuration: 80,
        collapseDuration: 120,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._expand({ emit: false, transition: true });
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersByTime(79);

      expect(component.dom.controlled.classList.contains("transitioning")).toBe(
        true
      );

      vi.advanceTimersByTime(1);

      expect(component.dom.controlled.classList.contains("transitioning")).toBe(
        false
      );
    });

    it("should apply classes synchronously when no transition class is configured", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._expand({ emit: false, transition: true });

      expect(component.dom.controlled.classList.contains("show")).toBe(true);
    });

    it("should not schedule timers when no transition class is configured", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._expand({ emit: false, transition: true });

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("_collapse", () => {
    it("should emit lifecycle events in order", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const events = [];
      for (const name of ["precollapse", "collapse", "postcollapse"]) {
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => events.push(name)
        );
      }

      component._collapse({ emit: true, transition: false });

      expect(events).toEqual(["precollapse", "collapse", "postcollapse"]);
    });

    it("should include the component in event detail", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener(
        component.getEventName("collapse"),
        component.rootDOMElement,
        listener
      );

      component._collapse({ emit: true, transition: false });

      expect(listener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { component } })
      );
    });

    it("should suppress lifecycle events when emit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      for (const name of ["precollapse", "collapse", "postcollapse"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          listener
        );

      component._collapse({ emit: false, transition: false });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should apply the action attribute", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._collapse({ emit: false, transition: false });

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "false"
      );
    });

    it("should apply the action class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._collapse({ emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("hide")).toBe(true);
    });

    it("should cancel pending collapse transition frames on disposal", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandClass: "show",
        collapseClass: "hide",
        transitionClass: "transitioning",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controlled.classList.add("show");

      component._collapse({ emit: false, transition: true });
      component.dispose();
      vi.advanceTimersByTime(64);

      expect(component.dom.controlled.classList.contains("show")).toBe(true);
      expect(component.frames).toEqual({});
    });

    // https://github.com/Accessible-Ecosystem/core/issues/6
    it.each([true, false])(
      "should replace pending expand frames with transition set to %s",
      (transition) => {
        vi.useFakeTimers();
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component._expand({ emit: false, transition: true });
        component._collapse({ emit: false, transition });
        vi.runAllTimers();

        expect(component.dom.controlled.classList.contains("hide")).toBe(true);
        expect(component.dom.controlled.classList.contains("show")).toBe(false);
        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(false);
      }
    );

    // https://github.com/Accessible-Ecosystem/core/issues/6
    it.each(["_expand", "_collapse"])(
      "should replace the pending %s timer with the new collapse duration",
      (previousAction) => {
        vi.useFakeTimers();
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionDuration: 100,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component[previousAction]({ emit: false, transition: true });
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersByTime(50);

        component._collapse({ emit: false, transition: true });
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersByTime(99);

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(true);

        vi.advanceTimersByTime(1);

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(false);
      }
    );

    // https://github.com/Accessible-Ecosystem/core/issues/6
    it("should cancel the pending collapse transition timer on disposal", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component._collapse({ emit: false, transition: true });
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();

      component.dispose();

      expect(vi.getTimerCount()).toBe(0);
    });

    it("should sequence state class changes over animation frames", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const element = component.dom.controlled;
      const from = "show",
        to = "hide";
      element.classList.add(from);

      component._collapse({ emit: false, transition: true });

      expect(element.classList.contains(from)).toBe(true);

      vi.advanceTimersToNextFrame();

      expect(element.classList.contains(from)).toBe(false);
      expect(element.classList.contains(to)).toBe(false);

      vi.advanceTimersToNextFrame();

      expect(element.classList.contains(to)).toBe(true);
    });

    it("should add the transition class immediately", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._collapse({ emit: false, transition: true });

      expect(component.dom.controlled.classList.contains("transitioning")).toBe(
        true
      );
    });

    it("should remove the transition class after the action duration", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandDuration: 80,
        collapseDuration: 120,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._collapse({ emit: false, transition: true });
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersByTime(119);

      expect(component.dom.controlled.classList.contains("transitioning")).toBe(
        true
      );

      vi.advanceTimersByTime(1);

      expect(component.dom.controlled.classList.contains("transitioning")).toBe(
        false
      );
    });

    it("should apply classes synchronously when no transition class is configured", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._collapse({ emit: false, transition: true });

      expect(component.dom.controlled.classList.contains("hide")).toBe(true);
    });

    it("should not schedule timers when no transition class is configured", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._collapse({ emit: false, transition: true });

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("_lock", () => {
    it("should emit lifecycle events in order", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const events = [];
      for (const name of ["prelock", "lock", "postlock"]) {
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => events.push(name)
        );
      }

      component._lock({ emit: true, transition: false });

      expect(events).toEqual(["prelock", "lock", "postlock"]);
    });

    it("should include the component in event detail", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener(
        component.getEventName("lock"),
        component.rootDOMElement,
        listener
      );

      component._lock({ emit: true, transition: false });

      expect(listener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { component } })
      );
    });

    it("should suppress lifecycle events when emit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      for (const name of ["prelock", "lock", "postlock"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          listener
        );

      component._lock({ emit: false, transition: false });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should apply the action attribute", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._lock({ emit: false, transition: false });

      expect(component.dom.controller.disabled).toBe(true);
    });

    it("should apply the action class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._lock({ emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("locked")).toBe(true);
    });
  });

  describe("_unlock", () => {
    it("should emit lifecycle events in order", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const events = [];
      for (const name of ["preunlock", "unlock", "postunlock"]) {
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => events.push(name)
        );
      }

      component._unlock({ emit: true, transition: false });

      expect(events).toEqual(["preunlock", "unlock", "postunlock"]);
    });

    it("should include the component in event detail", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      component._addEventListener(
        component.getEventName("unlock"),
        component.rootDOMElement,
        listener
      );

      component._unlock({ emit: true, transition: false });

      expect(listener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { component } })
      );
    });

    it("should suppress lifecycle events when emit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      const listener = vi.fn();
      for (const name of ["preunlock", "unlock", "postunlock"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          listener
        );

      component._unlock({ emit: false, transition: false });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should apply the action attribute", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._unlock({ emit: false, transition: false });

      expect(component.dom.controller.disabled).toBe(false);
    });

    it("should apply the action class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component._unlock({ emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        true
      );
    });
  });

  describe("_mediaQueryListEventCallback", () => {
    it("should prefer collapsing an expanded component when both breakpoint actions are enabled", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandOutsideBreakpoint: true,
        collapseOutsideBreakpoint: true,
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.expand({ force: true, emit: false, transition: false });

      component._mediaQueryListEventCallback({ matches: false });

      expect(component.isExpanded).toBe(false);
      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "false"
      );
      expect(component.dom.controlled.classList.contains("hide")).toBe(true);
    });

    for (const [side, matches] of [
      ["Inside", true],
      ["Outside", false],
    ]) {
      it(`should expand ${side.toLowerCase()} the breakpoint`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`expand${side}Breakpoint`]: true,
          transitionClass: "",
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isExpanded).toBe(true);
      });

      it(`should lock ${side.toLowerCase()} the breakpoint`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`lock${side}Breakpoint`]: true,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isLocked).toBe(true);
      });

      it(`should lock after expansion ${side.toLowerCase()} the breakpoint`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`expand${side}Breakpoint`]: true,
          [`lock${side}Breakpoint`]: true,
          transitionClass: "",
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        const order = [];
        vi.spyOn(component, "expand").mockImplementation(() =>
          order.push("expand")
        );
        vi.spyOn(component, "lock").mockImplementation(() =>
          order.push("lock")
        );

        component._mediaQueryListEventCallback({ matches });

        expect(order).toEqual(["expand", "lock"]);
      });

      it(`should unlock before collapsing ${side.toLowerCase()} the breakpoint`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`collapse${side}Breakpoint`]: true,
          transitionClass: "",
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        component.expand();
        component.lock();
        const order = [];
        vi.spyOn(component, "unlock").mockImplementation(() =>
          order.push("unlock")
        );
        vi.spyOn(component, "collapse").mockImplementation(() =>
          order.push("collapse")
        );

        component._mediaQueryListEventCallback({ matches });

        expect(order).toEqual(["unlock", "collapse"]);
      });

      it(`should preserve committed expansion when collapsing ${side.toLowerCase()} the breakpoint`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`collapse${side}Breakpoint`]: true,
          transitionClass: "",
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        component.expand();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isExpanded).toBe(false);
        expect(component.shouldBeExpanded).toBe(true);
      });

      it(`should honor explicit unlock ${side.toLowerCase()}`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`unlock${side}Breakpoint`]: true,
          locked: true,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isLocked).toBe(false);
      });

      it(`should unlock before expanding ${side.toLowerCase()} the breakpoint`, () => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          [`expand${side}Breakpoint`]: true,
          locked: true,
          transitionClass: "",
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        const order = [];
        vi.spyOn(component, "unlock").mockImplementation(() =>
          order.push("unlock")
        );
        vi.spyOn(component, "expand").mockImplementation(() =>
          order.push("expand")
        );

        component._mediaQueryListEventCallback({ matches });

        expect(order).toEqual(["unlock", "expand"]);
      });
    }

    it.each([true, false])(
      "should leave state alone for matches=%s when no actions are configured",
      (matches) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isExpanded).toBe(false);
        expect(component.isLocked).toBe(false);
      }
    );
  });
});
