/**
 * Public method tests for the CollapsibleComponent class.
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

describe("CollapsibleComponent public methods", () => {
  describe("focus", () => {
    it.each([
      [undefined, false],
      [false, false],
      [true, true],
    ])("should respect expandOnFocus set to %s", (value, expanded) => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandOnFocus: value,
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.currentEvent = "keyboard";

      component.focus();

      expect(component.isExpanded).toBe(expanded);
      expect(component.focusState).toBe("self");
      expect(document.activeElement).toBe(component.dom.controller);
    });

    it("should apply expandOnFocus without moving DOM focus", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expandOnFocus = true;

      component.focus();

      expect(component.isExpanded).toBe(true);
      expect(component.focusState).toBe("self");
      expect(document.activeElement).toBe(document.body);
    });

    it("should respect the locked state when expandOnFocus is true", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandOnFocus: true,
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.lock();

      component.focus();

      expect(component.isExpanded).toBe(false);
      expect(component.focusState).toBe("self");
    });
  });

  describe("blur", () => {
    it.each([
      [undefined, true],
      [false, true],
      [true, false],
    ])("should respect collapseOnBlur set to %s", (value, expanded) => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        collapseOnBlur: value,
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.currentEvent = "keyboard";
      component.focus();
      component.expand();

      component.blur();

      expect(component.isExpanded).toBe(expanded);
      expect(component.focusState).toBe("none");
      expect(document.activeElement).toBe(document.body);
    });

    it("should apply collapseOnBlur without moving DOM focus", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.collapseOnBlur = true;
      component.expand();

      component.blur();

      expect(component.isExpanded).toBe(false);
      expect(component.focusState).toBe("none");
      expect(document.activeElement).toBe(document.body);
    });

    it("should respect the locked state when collapseOnBlur is true", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        collapseOnBlur: true,
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();
      component.lock();

      component.blur();

      expect(component.isExpanded).toBe(true);
      expect(component.focusState).toBe("none");
    });
  });

  describe("expand", () => {
    it("should default emit to false when shouldEmit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        emit: false,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      component.initialize();
      const spy = vi.spyOn(component, "_expand");

      component.expand({ force: true, transition: false });

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        emit: false,
        transition: false,
      });
    });

    it("should suppress the public postexpand event when shouldEmit is disabled during a transition", () => {
      vi.useFakeTimers();
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();

      component.initialize();
      const internal = vi.fn();
      const publicListener = vi.fn();
      component._addInternalEventListener(
        component.getEventName("postexpand"),
        internal
      );
      component._addEventListener(
        component.getEventName("postexpand"),
        component.rootDOMElement,
        publicListener
      );

      component.expand({ transition: true });
      component.shouldEmit = false;
      vi.runAllTimers();

      expect(internal).toHaveBeenCalledTimes(1);
      expect(publicListener).not.toHaveBeenCalled();
      expect(component.isExpanded).toBe(true);
    });

    it("should set aria-expanded to true", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand();

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "true"
      );
    });

    it("should replace the collapse class with the expand class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandClass: "expanded",
        collapseClass: "collapsed",
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controlled.classList.add("collapsed");

      component.expand({ force: true, emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("expanded")).toBe(
        true
      );
      expect(component.dom.controlled.classList.contains("collapsed")).toBe(
        false
      );
    });

    it("should preserve committed expansion before initialization when requested", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();

      component.expand({
        force: true,
        emit: false,
        transition: false,
        preserveState: true,
      });

      expect(component.isExpanded).toBe(true);
      expect(component.shouldBeExpanded).toBe(false);
    });

    it("should update the current state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand();

      expect(component.isExpanded).toBe(true);
    });

    it("should commit the state by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand();

      expect(component.shouldBeExpanded).toBe(true);
    });

    it("should preserve the committed state when requested", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand({ preserveState: true });

      expect(component.shouldBeExpanded).toBe(false);
      expect(component.isExpanded).toBe(true);
    });

    it("should skip repeated actions by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand({ force: true });
      const spy = vi.spyOn(component, "_expand");

      component.expand();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should repeat an action when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand({ force: true });
      const spy = vi.spyOn(component, "_expand");

      component.expand({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should set the focus state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.expand();

      expect(component.focusState).toBe("self");
    });

    it("should block state changes while locked", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();
      const spy = vi.spyOn(component, "_expand");

      component.expand();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should change state while locked when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();
      const spy = vi.spyOn(component, "_expand");

      component.expand({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("collapse", () => {
    it("should default emit to false when shouldEmit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        emit: false,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      component.initialize();
      const spy = vi.spyOn(component, "_collapse");

      component.collapse({ force: true, transition: false });

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        emit: false,
        transition: false,
      });
    });

    it("should honor shouldEmit and the emit option while still updating state", () => {
      vi.useFakeTimers();
      const controller = document.createElement("button");
      controller.setAttribute("aria-expanded", "true");
      component = new CollapsibleComponent({
        controllerElement: controller,
        controlledElement: document.createElement("div"),
        emit: false,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      const internal = [];
      const publicListener = vi.fn();
      for (const name of Object.keys(component.events)) {
        component._addInternalEventListener(component.getEventName(name), () =>
          internal.push(name)
        );
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          publicListener
        );
      }

      component.initialize();
      internal.length = 0;

      component.collapse({ emit: true, transition: true });
      vi.runAllTimers();

      expect(component.isExpanded).toBe(false);
      expect(controller.getAttribute("aria-expanded")).toBe("false");
      expect(internal).toEqual(["precollapse", "collapse", "postcollapse"]);
      expect(publicListener).not.toHaveBeenCalled();

      component.shouldEmit = true;
      component.expand({ transition: false });

      expect(publicListener).toHaveBeenCalledTimes(3);

      component.collapse({ emit: false, transition: false });

      expect(publicListener).toHaveBeenCalledTimes(3);
    });

    it("should set aria-expanded to false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse();

      expect(component.dom.controller.getAttribute("aria-expanded")).toBe(
        "false"
      );
    });

    it("should replace the expand class with the collapse class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        expandClass: "expanded",
        collapseClass: "collapsed",
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controlled.classList.add("expanded");

      component.collapse({ force: true, emit: false, transition: false });

      expect(component.dom.controlled.classList.contains("collapsed")).toBe(
        true
      );
      expect(component.dom.controlled.classList.contains("expanded")).toBe(
        false
      );
    });

    it("should update the current state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse();

      expect(component.isExpanded).toBe(false);
    });

    it("should commit the state by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse();

      expect(component.shouldBeExpanded).toBe(false);
    });

    it("should preserve the committed state when requested", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse({ preserveState: true });

      expect(component.shouldBeExpanded).toBe(true);
      expect(component.isExpanded).toBe(false);
    });

    it("should skip repeated actions by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse({ force: true });
      const spy = vi.spyOn(component, "_collapse");

      component.collapse();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should repeat an action when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse({ force: true });
      const spy = vi.spyOn(component, "_collapse");

      component.collapse({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should set the focus state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.collapse();

      expect(component.focusState).toBe("none");
    });

    it("should block state changes while locked", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.lock();
      const spy = vi.spyOn(component, "_collapse");

      component.collapse();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should change state while locked when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.lock();
      const spy = vi.spyOn(component, "_collapse");

      component.collapse({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("lock", () => {
    it("should default emit to false when shouldEmit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        emit: false,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      component.initialize();
      const spy = vi.spyOn(component, "_lock");

      component.lock({ force: true });

      expect(spy).toHaveBeenCalledExactlyOnceWith({ emit: false });
    });

    it("should replace the unlocked class with the locked class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controlled.classList.add("unlocked");

      component.lock({ force: true, emit: false });

      expect(component.dom.controlled.classList.contains("locked")).toBe(true);
      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        false
      );
    });

    it("should set the disabled attribute", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      expect(component.dom.controller.hasAttribute("disabled")).toBe(true);
    });

    it("should update the current state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      expect(component.isLocked).toBe(true);
    });

    it("should commit the state by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      expect(component.shouldBeLocked).toBe(true);
    });

    it("should preserve the committed state when requested", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock({ preserveState: true });

      expect(component.shouldBeLocked).toBe(false);
      expect(component.isLocked).toBe(true);
    });

    it("should skip repeated actions by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock({ force: true });
      const spy = vi.spyOn(component, "_lock");

      component.lock();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should repeat an action when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock({ force: true });
      const spy = vi.spyOn(component, "_lock");

      component.lock({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("unlock", () => {
    it("should default emit to false when shouldEmit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        emit: false,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      component.initialize();
      const spy = vi.spyOn(component, "_unlock");

      component.unlock({ force: true });

      expect(spy).toHaveBeenCalledExactlyOnceWith({ emit: false });
    });

    it("should replace the locked class with the unlocked class", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.dom.controlled.classList.add("locked");

      component.unlock({ force: true, emit: false });

      expect(component.dom.controlled.classList.contains("unlocked")).toBe(
        true
      );
      expect(component.dom.controlled.classList.contains("locked")).toBe(false);
    });

    it("should remove the disabled attribute", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.lock();

      component.unlock();

      expect(component.dom.controller.hasAttribute("disabled")).toBe(false);
    });

    it("should update the current state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      component.unlock();

      expect(component.isLocked).toBe(false);
    });

    it("should commit the state by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      component.unlock();

      expect(component.shouldBeLocked).toBe(false);
    });

    it("should preserve the committed state when requested", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      component.unlock({ preserveState: true });

      expect(component.shouldBeLocked).toBe(true);
      expect(component.isLocked).toBe(false);
    });

    it("should skip repeated actions by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      component.unlock({ force: true });
      const spy = vi.spyOn(component, "_unlock");

      component.unlock();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should repeat an action when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();

      component.unlock({ force: true });
      const spy = vi.spyOn(component, "_unlock");

      component.unlock({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("preview", () => {
    it("should default emit to false when shouldEmit is false", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        emit: false,
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      component._bootstrap();
      component.initialize();
      const spy = vi.spyOn(component, "_expand");

      component.preview({ force: true, transition: false });

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        emit: false,
        transition: false,
      });
    });

    it("should update the current state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.preview();

      expect(component.isExpanded).toBe(true);
    });

    it("should commit the state by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.preview();

      expect(component.shouldBeExpanded).toBe(true);
    });

    it("should preserve the committed state when requested", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.preview({ preserveState: true });

      expect(component.shouldBeExpanded).toBe(false);
      expect(component.isExpanded).toBe(true);
    });

    it("should skip repeated actions by default", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.preview({ force: true });
      const spy = vi.spyOn(component, "_expand");

      component.preview();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should repeat an action when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.preview({ force: true });
      const spy = vi.spyOn(component, "_expand");

      component.preview({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should set the focus state", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.preview();

      expect(component.focusState).toBe("none");
    });

    it("should block state changes while locked", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();
      const spy = vi.spyOn(component, "_expand");

      component.preview();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should change state while locked when forced", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.lock();
      const spy = vi.spyOn(component, "_expand");

      component.preview({ force: true });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("toggle", () => {
    it("should expand when currently collapsed", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.toggle();

      expect(component.isExpanded).toBe(true);
    });

    it("should forward explicit options to expand", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
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

    it.each([true, false])(
      "should pass shouldEmit %s as the default emit option to expand",
      (shouldEmit) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionClass: "",
          emit: shouldEmit,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        const spy = vi.spyOn(component, "expand");

        component.toggle();

        expect(spy).toHaveBeenCalledExactlyOnceWith({
          force: false,
          emit: shouldEmit,
          transition: true,
          preserveState: false,
        });
      }
    );

    it("should collapse when currently expanded", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.expand();

      component.toggle();

      expect(component.isExpanded).toBe(false);
    });

    it("should forward explicit options to collapse", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
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

    it.each([true, false])(
      "should pass shouldEmit %s as the default emit option to collapse",
      (shouldEmit) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionClass: "",
          emit: shouldEmit,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        component.expand();
        const spy = vi.spyOn(component, "collapse");

        component.toggle();

        expect(spy).toHaveBeenCalledExactlyOnceWith({
          force: false,
          emit: shouldEmit,
          transition: true,
          preserveState: false,
        });
      }
    );
  });

  describe("toggleLock", () => {
    it("should lock when currently unlocked", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();

      component.toggleLock();

      expect(component.isLocked).toBe(true);
    });

    it("should forward explicit options to lock", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      const spy = vi.spyOn(component, "lock");
      const options = { force: true, emit: false, preserveState: true };

      component.toggleLock(options);

      expect(spy).toHaveBeenCalledExactlyOnceWith(options);
    });

    it.each([true, false])(
      "should pass shouldEmit %s as the default emit option to lock",
      (shouldEmit) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionClass: "",
          emit: shouldEmit,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        const spy = vi.spyOn(component, "lock");

        component.toggleLock();

        expect(spy).toHaveBeenCalledExactlyOnceWith({
          force: false,
          emit: shouldEmit,
          preserveState: false,
        });
      }
    );

    it("should unlock when currently locked", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.lock();

      component.toggleLock();

      expect(component.isLocked).toBe(false);
    });

    it("should forward explicit options to unlock", () => {
      component = new CollapsibleComponent({
        controllerElement: document.createElement("button"),
        controlledElement: document.createElement("div"),
        transitionClass: "",
        bootstrap: false,
      });
      component._rootDOMElement = "controller";
      document.body.appendChild(component.rootDOMElement);
      component._bootstrap();
      component.initialize();
      component.lock();
      const spy = vi.spyOn(component, "unlock");
      const options = { force: true, emit: false, preserveState: true };

      component.toggleLock(options);

      expect(spy).toHaveBeenCalledExactlyOnceWith(options);
    });

    it.each([true, false])(
      "should pass shouldEmit %s as the default emit option to unlock",
      (shouldEmit) => {
        component = new CollapsibleComponent({
          controllerElement: document.createElement("button"),
          controlledElement: document.createElement("div"),
          transitionClass: "",
          emit: shouldEmit,
          bootstrap: false,
        });
        component._rootDOMElement = "controller";
        document.body.appendChild(component.rootDOMElement);
        component._bootstrap();
        component.initialize();
        component.lock();
        const spy = vi.spyOn(component, "unlock");

        component.toggleLock();

        expect(spy).toHaveBeenCalledExactlyOnceWith({
          force: false,
          emit: shouldEmit,
          preserveState: false,
        });
      }
    );
  });
});
