/**
 * Public method tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import { createCollapsible } from "../helpers.js";

const prepareAction = (action) => {
  const component = createCollapsible({ transitionClass: "" });
  component.initialize();
  if (action === "collapse") component.expand();
  if (action === "unlock") component.lock();
  return component;
};

describe("CollapsibleComponent public methods", () => {
  describe("expand", () => {
    it("should set aria-expanded to true", () => {
      const component = prepareAction("expand");

      component.expand();

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "true"
      );
    });

    it("should replace the collapse class with the expand class", () => {
      const component = createCollapsible({
        expandClass: "expanded",
        collapseClass: "collapsed",
        transitionClass: "",
      });
      component.dom.controlled.classList.add("collapsed");

      component.expand({ force: true, emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("expanded")).toBe(
        true
      );
      expect(component.dom.controlled.classList.contains("collapsed")).toBe(
        false
      );
    });
  });

  describe("collapse", () => {
    it("should set aria-expanded to false", () => {
      const component = prepareAction("collapse");

      component.collapse();

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "false"
      );
    });

    it("should replace the expand class with the collapse class", () => {
      const component = createCollapsible({
        expandClass: "expanded",
        collapseClass: "collapsed",
        transitionClass: "",
      });
      component.dom.controlled.classList.add("expanded");

      component.collapse({ force: true, emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("collapsed")).toBe(
        true
      );
      expect(component.dom.controlled.classList.contains("expanded")).toBe(
        false
      );
    });
  });

  describe("lock", () => {
    it("should replace the unlocked class with the locked class", () => {
      const component = createCollapsible();
      component.dom.controlled.classList.add("unlocked");

      component.lock({ force: true, emit: false });

      expect(component.dom.controlled.classList.contains("locked")).toBe(true);
      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        false
      );
    });

    it("should set the disabled attribute", () => {
      const component = prepareAction("lock");

      component.lock();

      expect(component.dom.controller.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("unlock", () => {
    it("should replace the locked class with the unlocked class", () => {
      const component = createCollapsible();
      component.dom.controlled.classList.add("locked");

      component.unlock({ force: true, emit: false });

      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        true
      );
      expect(component.dom.controlled.classList.contains("locked")).toBe(false);
    });

    it("should remove the disabled attribute", () => {
      const component = prepareAction("unlock");

      component.unlock();

      expect(component.dom.controller.hasAttribute("disabled")).toBe(false);
    });
  });

  describe("expand", () => {
    it("should preserve committed expansion before initialization when requested", () => {
      const component = createCollapsible();

      component.expand({
        force: true,
        emit: false,
        transition: false,
        preserveState: true,
      });

      expect(component.isExpanded).toBe(true);
      expect(component.shouldBeExpanded).toBe(false);
    });
  });
  for (const action of ["expand", "preview", "collapse", "lock", "unlock"])
    describe(action, () => {
      it("should update the current state", () => {
        const component = prepareAction(action);
        const lockedAction = ["lock", "unlock"].includes(action);

        component[action]();

        expect(component[lockedAction ? "isLocked" : "isExpanded"]).toBe(
          ["expand", "preview", "lock"].includes(action)
        );
      });

      it("should commit the state by default", () => {
        const component = prepareAction(action);
        const lockedAction = ["lock", "unlock"].includes(action);

        component[action]();

        expect(
          component[lockedAction ? "shouldBeLocked" : "shouldBeExpanded"]
        ).toBe(["expand", "preview", "lock"].includes(action));
      });

      it("should preserve the committed state when requested", () => {
        const component = prepareAction(action);
        const lockedAction = ["lock", "unlock"].includes(action);
        const committed =
          component[lockedAction ? "shouldBeLocked" : "shouldBeExpanded"];

        component[action]({ preserveState: true });

        expect(
          component[lockedAction ? "shouldBeLocked" : "shouldBeExpanded"]
        ).toBe(committed);
        expect(component[lockedAction ? "isLocked" : "isExpanded"]).toBe(
          !committed
        );
      });

      it("should skip repeated actions by default", () => {
        const component = prepareAction(action);

        component[action]({ force: true });
        const spy = vi.spyOn(
          component,
          action === "preview" ? "_expand" : `_${action}`
        );
        component[action]();

        expect(spy).not.toHaveBeenCalled();
      });

      it("should repeat an action when forced", () => {
        const component = prepareAction(action);

        component[action]({ force: true });
        const spy = vi.spyOn(
          component,
          action === "preview" ? "_expand" : `_${action}`
        );
        component[action]({ force: true });

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  for (const action of ["expand", "preview", "collapse"])
    describe(action, () => {
      it("should set the focus state", () => {
        const component = prepareAction(action);

        component[action]();

        expect(component.focusState).toBe(
          action === "expand" ? "self" : "none"
        );
      });

      it("should block state changes while locked", () => {
        const component = prepareAction(action);
        component.lock();
        const spy = vi.spyOn(
          component,
          action === "preview" ? "_expand" : `_${action}`
        );

        component[action]();

        expect(spy).not.toHaveBeenCalled();
      });

      it("should change state while locked when forced", () => {
        const component = prepareAction(action);
        component.lock();
        const spy = vi.spyOn(
          component,
          action === "preview" ? "_expand" : `_${action}`
        );

        component[action]({ force: true });

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

  describe("toggle", () => {
    it("should expand when currently collapsed", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();

      component.toggle();

      expect(component.isExpanded).toBe(true);
    });

    it("should forward explicit options to expand", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      const spy = vi.spyOn(component, "expand");
      const options = {
        force: true,
        emit: false,
        transition: false,
        preserveState: true,
      };

      component.toggle(options);

      expect(spy).toHaveBeenCalledExactlyOnceWith(options);
    });

    it("should forward default options to expand", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      const spy = vi.spyOn(component, "expand");

      component.toggle();

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        force: false,
        emit: true,
        transition: true,
        preserveState: false,
      });
    });

    it("should collapse when currently expanded", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      component.expand();

      component.toggle();

      expect(component.isExpanded).toBe(false);
    });

    it("should forward explicit options to collapse", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      component.expand();
      const spy = vi.spyOn(component, "collapse");
      const options = {
        force: true,
        emit: false,
        transition: false,
        preserveState: true,
      };

      component.toggle(options);

      expect(spy).toHaveBeenCalledExactlyOnceWith(options);
    });

    it("should forward default options to collapse", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      component.expand();
      const spy = vi.spyOn(component, "collapse");

      component.toggle();

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        force: false,
        emit: true,
        transition: true,
        preserveState: false,
      });
    });
  });

  describe("toggleLock", () => {
    it("should lock when currently unlocked", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();

      component.toggleLock();

      expect(component.isLocked).toBe(true);
    });

    it("should forward explicit options to lock", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      const spy = vi.spyOn(component, "lock");
      const options = { force: true, emit: false, preserveState: true };

      component.toggleLock(options);

      expect(spy).toHaveBeenCalledExactlyOnceWith(options);
    });

    it("should forward default options to lock", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      const spy = vi.spyOn(component, "lock");

      component.toggleLock();

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        force: false,
        emit: true,
        preserveState: false,
      });
    });

    it("should unlock when currently locked", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      component.lock();

      component.toggleLock();

      expect(component.isLocked).toBe(false);
    });

    it("should forward explicit options to unlock", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      component.lock();
      const spy = vi.spyOn(component, "unlock");
      const options = { force: true, emit: false, preserveState: true };

      component.toggleLock(options);

      expect(spy).toHaveBeenCalledExactlyOnceWith(options);
    });

    it("should forward default options to unlock", () => {
      const component = createCollapsible({ transitionClass: "" });
      component.initialize();
      component.lock();
      const spy = vi.spyOn(component, "unlock");

      component.toggleLock();

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        force: false,
        emit: true,
        preserveState: false,
      });
    });
  });
});
