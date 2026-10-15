import { describe, it, expect, vi } from "vitest";
import { createCollapsible } from "../helpers.js";

describe("CollapsibleComponent protected methods", () => {
  describe("_bootstrap", () => {
    it.each(["expand", "collapse", "lock", "unlock"])(
      "should register the %s action events",
      (action) => {
        const component = createCollapsible();

        for (const prefix of ["pre", "", "post"])
          expect(component.events[`${prefix}${action}`]).toBeInstanceOf(
            CustomEvent
          );
      }
    );

    it("should register lifecycle listeners", () => {
      expect(createCollapsible().listeners).toHaveLength(4);
    });
  });
  for (const action of ["expand", "collapse", "lock", "unlock"])
    describe(`_${action}`, () => {
      it("should emit lifecycle events in order", () => {
        const component = createCollapsible(),
          events = [];
        for (const prefix of ["pre", "", "post"]) {
          const name = `${prefix}${action}`;
          component._addEventListener(
            component.getEventName(name),
            component.rootDOMElement,
            () => events.push(name)
          );
        }

        component[`_${action}`]({ emit: true, transition: false });

        expect(events).toEqual([`pre${action}`, action, `post${action}`]);
      });

      it("should include the component in event detail", () => {
        const component = createCollapsible(),
          listener = vi.fn();
        component._addEventListener(
          component.getEventName(action),
          component.rootDOMElement,
          listener
        );

        component[`_${action}`]({ emit: true, transition: false });

        expect(listener).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ detail: { component } })
        );
      });

      it("should suppress lifecycle events when emit is false", () => {
        const component = createCollapsible(),
          listener = vi.fn();
        for (const prefix of ["pre", "", "post"])
          component._addEventListener(
            component.getEventName(`${prefix}${action}`),
            component.rootDOMElement,
            listener
          );

        component[`_${action}`]({ emit: false, transition: false });

        expect(listener).not.toHaveBeenCalled();
      });

      it("should apply the action attribute", () => {
        const component = createCollapsible();

        component[`_${action}`]({ emit: false, transition: false });

        if (["expand", "collapse"].includes(action))
          expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
            String(action === "expand")
          );
        else expect(component.dom.controller.disabled).toBe(action === "lock");
      });

      it("should apply the action class", () => {
        const component = createCollapsible();

        component[`_${action}`]({ emit: false, transition: false });
        const className = {
          expand: "show",
          collapse: "hide",
          lock: "locked",
          unlock: "unlocked",
        }[action];

        expect(component.dom.controlled.classList.contains(className)).toBe(
          true
        );
      });
    });
  for (const action of ["expand", "collapse"])
    describe(`_${action} transitions`, () => {
      it("should sequence state class changes over animation frames", () => {
        vi.useFakeTimers();
        const component = createCollapsible(),
          element = component.dom.controlled;
        const from = action === "expand" ? "hide" : "show",
          to = action === "expand" ? "show" : "hide";
        element.classList.add(from);

        component[`_${action}`]({ emit: false, transition: true });

        expect(element.classList.contains(from)).toBe(true);

        vi.advanceTimersToNextFrame();

        expect(element.classList.contains(from)).toBe(false);
        expect(element.classList.contains(to)).toBe(false);

        vi.advanceTimersToNextFrame();

        expect(element.classList.contains(to)).toBe(true);
      });

      it("should add the transition class immediately", () => {
        vi.useFakeTimers();
        const component = createCollapsible();

        component[`_${action}`]({ emit: false, transition: true });

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(true);
      });

      it("should remove the transition class after the action duration", () => {
        vi.useFakeTimers();
        const component = createCollapsible({
          expandDuration: 80,
          collapseDuration: 120,
        });

        component[`_${action}`]({ emit: false, transition: true });
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        vi.advanceTimersByTime(component[`${action}Duration`] - 1);

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(true);

        vi.advanceTimersByTime(1);

        expect(
          component.dom.controlled.classList.contains("transitioning")
        ).toBe(false);
      });

      it("should apply classes synchronously when no transition class is configured", () => {
        const component = createCollapsible({ transitionClass: "" });

        component[`_${action}`]({ emit: false, transition: true });

        expect(
          component.dom.controlled.classList.contains(
            action === "expand" ? "show" : "hide"
          )
        ).toBe(true);
      });

      it("should not schedule timers when no transition class is configured", () => {
        vi.useFakeTimers();
        const component = createCollapsible({ transitionClass: "" });

        component[`_${action}`]({ emit: false, transition: true });

        expect(vi.getTimerCount()).toBe(0);
      });
    });

  describe("_mediaQueryListEventCallback", () => {
    it("should prefer collapsing an expanded component when both breakpoint actions are enabled", () => {
      const component = createCollapsible({
        expandOutsideBreakpoint: true,
        collapseOutsideBreakpoint: true,
        transitionClass: "",
      });
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
        const component = createCollapsible({
          [`expand${side}Breakpoint`]: true,
          transitionClass: "",
        });
        component.initialize();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isExpanded).toBe(true);
      });

      it(`should lock ${side.toLowerCase()} the breakpoint`, () => {
        const component = createCollapsible({
          [`lock${side}Breakpoint`]: true,
        });
        component.initialize();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isLocked).toBe(true);
      });

      it(`should lock after expansion ${side.toLowerCase()} the breakpoint`, () => {
        const component = createCollapsible({
          [`expand${side}Breakpoint`]: true,
          [`lock${side}Breakpoint`]: true,
          transitionClass: "",
        });
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
        const component = createCollapsible({
          [`collapse${side}Breakpoint`]: true,
          transitionClass: "",
        });
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
        const component = createCollapsible({
          [`collapse${side}Breakpoint`]: true,
          transitionClass: "",
        });
        component.initialize();
        component.expand();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isExpanded).toBe(false);
        expect(component.shouldBeExpanded).toBe(true);
      });

      it(`should honor explicit unlock ${side.toLowerCase()}`, () => {
        const component = createCollapsible({
          [`unlock${side}Breakpoint`]: true,
          locked: true,
        });
        component.initialize();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isLocked).toBe(false);
      });

      it(`should unlock before expanding ${side.toLowerCase()} the breakpoint`, () => {
        const component = createCollapsible({
          [`expand${side}Breakpoint`]: true,
          locked: true,
          transitionClass: "",
        });
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
        const component = createCollapsible();

        component._mediaQueryListEventCallback({ matches });

        expect(component.isExpanded).toBe(false);
        expect(component.isLocked).toBe(false);
      }
    );
  });
});
