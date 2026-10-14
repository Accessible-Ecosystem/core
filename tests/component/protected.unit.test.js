import { describe, it, expect, vi } from "vitest";
import { createComponent } from "../helpers.js";

describe("Component protected methods", () => {
  describe("_bootstrap", () => {
    it("should register all lifecycle events", () => {
      expect(Object.keys(createComponent().events)).toEqual([
        "initialize",
        "preinitialize",
        "postinitialize",
        "validate",
        "prevalidate",
        "postvalidate",
      ]);
    });

    it("should log registration failures", () => {
      const component = createComponent();
      const failure = new Error("registration failed");
      vi.spyOn(component, "_registerEvent").mockImplementation(() => {
        throw failure;
      });
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(error).toHaveBeenCalledWith(failure);
    });

    it("should invalidate the component after a registration failure", () => {
      const component = createComponent();
      vi.spyOn(component, "_registerEvent").mockImplementation(() => {
        throw new Error("registration failed");
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      component._bootstrap();

      expect(component.isValid).toBe(false);
    });
  });

  describe("_validate", () => {
    it.each([
      ["_selectors", { child: "[" }],
      ["_classes", { initialize: "invalid token" }],
      ["_durations", { transition: "slow" }],
      ["_delays", { transition: "slow" }],
      ["_name", 123],
      ["_scope", 123],
      ["_storageKey", 123],
      ["_key", 123],
      ["_prefix", 123],
      ["_protectedDOMElements", [123]],
      ["_shouldStore", "yes"],
      ["_dom", { children: [{}] }],
    ])("should report invalid %s", (field, value) => {
      const component = createComponent();
      component[field] =
        field === "_dom" ? { root: component.rootDOMElement, ...value } : value;

      expect(component._validate()).toBe(false);
      expect(component.errors.length).toBeGreaterThan(0);
    });

    it("should aggregate validation errors", () => {
      const component = createComponent();
      component._prefix = 123;
      component._key = 456;

      component._validate();

      expect(component.errors).toHaveLength(2);
    });

    it("should clear stale errors on the next validation pass", () => {
      const component = createComponent();
      component._prefix = 123;

      component._validate();
      component._prefix = "ae-";

      expect(component._validate()).toBe(true);
      expect(component.errors).toEqual([]);
    });

    it("should dispatch validation lifecycle events in order", () => {
      const component = createComponent(),
        order = [];
      for (const name of ["prevalidate", "validate", "postvalidate"])
        component._addEventListener(
          component.getEventName(name),
          component.rootDOMElement,
          () => order.push(name)
        );

      component._validate();

      expect(order).toEqual(["prevalidate", "validate", "postvalidate"]);
    });

    it("should accept valid DOM arrays", () => {
      const component = createComponent();
      component._dom.children = [document.createElement("div")];

      expect(component._validate()).toBe(true);
    });

    it("should accept a null optional DOM slot", () => {
      const component = createComponent();
      component._dom.optional = null;

      expect(component._validate()).toBe(true);
    });
  });

  describe("_generateKey", () => {
    it("should generate a key when none is configured", () => {
      const component = createComponent();
      vi.spyOn(Math, "random").mockReturnValue(0.123456);

      component._generateKey();

      expect(component.key).toMatch(/^[a-z]{1,10}$/);
    });

    it("should preserve an existing key", () => {
      const component = createComponent({ key: "existing" });

      component._generateKey();

      expect(component.key).toBe("existing");
    });

    it("should regenerate a key when requested", () => {
      const component = createComponent({ key: "existing" });
      vi.spyOn(Math, "random").mockReturnValue(0.123456);

      component._generateKey(true);

      expect(component.key).not.toBe("existing");
      expect(component.key).toMatch(/^[a-z]{1,10}$/);
    });
  });

  describe("_setDOMElementType", () => {
    it.each([false, true])(
      "should select descendants with strict=%s",
      (strict) => {
        const component = createComponent();
        const context = document.createElement("div");
        context.innerHTML = "<span></span><div><span></span></div>";
        component._selectors.child = "span";
        component._dom.child = [];

        component._setDOMElementType("child", { context, strict });

        expect(component.dom.child).toEqual(
          Array.from(context.querySelectorAll("span")).slice(0, strict ? 1 : 2)
        );
      }
    );

    it("should append matches when overwrite is false", () => {
      const component = createComponent();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      const original = document.createElement("span");
      component._dom.child = [original];

      component._setDOMElementType("child", { context, overwrite: false });

      expect(component.dom.child).toEqual([
        original,
        ...context.querySelectorAll("span"),
      ]);
    });

    it("should replace existing matches by default", () => {
      const component = createComponent();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      component._dom.child = [document.createElement("span")];

      component._setDOMElementType("child", { context });

      expect(component.dom.child).toEqual(
        Array.from(context.querySelectorAll("span"))
      );
    });

    it("should select the first match for a scalar slot", () => {
      const component = createComponent();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      component._dom.child = null;

      component._setDOMElementType("child", { context });

      expect(component.dom.child).toBe(context.firstElementChild);
    });

    it("should assign null to a scalar slot when no matches exist", () => {
      const component = createComponent();
      const context = document.createElement("div");
      context.innerHTML = "<span></span><div><span></span></div>";
      component._selectors.child = "span";
      component._dom.child = [];
      component._dom.child = null;
      context.innerHTML = "";

      component._setDOMElementType("child", { context });

      expect(component.dom.child).toBeNull();
    });

    it.each(["missing", "root", "protected"])(
      "should reject the %s element type",
      (type) => {
        const component = createComponent();
        component._selectors.root = "button";
        component._selectors.protected = "span";
        component._protectedDOMElements.push("protected");

        expect(() =>
          component._setDOMElementType(type, {
            context: component.rootDOMElement,
          })
        ).toThrow(Error);
      }
    );

    it("should reject an invalid context", () => {
      const component = createComponent();
      component._selectors.child = "span";

      expect(() =>
        component._setDOMElementType("child", { context: {} })
      ).toThrow(TypeError);
    });
  });

  describe("_resetDOMElementType", () => {
    it("should reset an array slot", () => {
      const component = createComponent();
      component._selectors.children = "span";
      component._dom.children = [document.createElement("span")];

      component._resetDOMElementType("children");

      expect(component.dom.children).toEqual([]);
    });

    it("should reset a scalar slot", () => {
      const component = createComponent();
      component._selectors.child = "span";
      component._dom.child = document.createElement("span");

      component._resetDOMElementType("child");

      expect(component.dom.child).toBeNull();
    });

    it.each(["missing", "root", "protected"])(
      "should reject the %s element type",
      (type) => {
        const component = createComponent();
        component._selectors.root = "button";
        component._selectors.protected = "span";
        component._protectedDOMElements.push("protected");

        expect(() => component._resetDOMElementType(type)).toThrow(Error);
      }
    );
  });
  for (const [set, clear, all] of [
    ["_setTimeout", "_clearTimeout", "_clearTimeouts"],
    ["_setInterval", "_clearInterval", "_clearIntervals"],
  ]) {
    describe(set, () => {
      it("should replace the previous timer in the same scope", () => {
        vi.useFakeTimers();
        const component = createComponent(),
          old = vi.fn(),
          current = vi.fn();

        component[set](old, 10);
        component[set](current, 10);
        vi.advanceTimersByTime(10);

        expect(old).not.toHaveBeenCalled();
        expect(current).toHaveBeenCalledTimes(1);
      });

      it("should leave timers in other scopes active", () => {
        vi.useFakeTimers();
        const component = createComponent(),
          other = vi.fn();

        component[set](other, 10, "other");
        component[set](vi.fn(), 10);
        vi.advanceTimersByTime(10);

        expect(other).toHaveBeenCalledTimes(1);
      });
    });

    describe(clear, () => {
      it("should cancel callbacks in the selected scope", () => {
        vi.useFakeTimers();
        const component = createComponent(),
          callback = vi.fn();
        component[set](callback, 10);

        component[clear]();
        vi.advanceTimersByTime(100);

        expect(callback).not.toHaveBeenCalled();
      });

      it("should leave other scopes active", () => {
        vi.useFakeTimers();
        const component = createComponent(),
          callback = vi.fn();
        component[set](vi.fn(), 10);
        component[set](callback, 10, "other");

        component[clear]();
        vi.advanceTimersByTime(10);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should tolerate a missing scope", () => {
        const component = createComponent();

        expect(() => component[clear]("missing")).not.toThrow();
      });
    });

    describe(all, () => {
      it("should cancel callbacks in all scopes", () => {
        vi.useFakeTimers();
        const component = createComponent(),
          callback = vi.fn();
        component[set](callback, 10);
        component[set](callback, 10, "other");

        component[all]();
        vi.advanceTimersByTime(100);

        expect(callback).not.toHaveBeenCalled();
      });
    });
  }

  describe("_registerEvent", () => {
    it("should register a CustomEvent with the generated name", () => {
      const component = createComponent();

      component._registerEvent("ready");

      expect(component.events.ready).toBeInstanceOf(CustomEvent);
      expect(component.events.ready.type).toBe(
        "accessibleEcosystemComponentReady"
      );
    });

    it.each([true, false])("should honor bubbles=%s", (bubbles) => {
      const component = createComponent();

      component._registerEvent("ready", { bubbles });

      expect(component.events.ready.bubbles).toBe(bubbles);
    });

    it("should include the component in the default detail", () => {
      const component = createComponent();

      component._registerEvent("ready");

      expect(component.events.ready.detail.component).toBe(component);
    });

    it("should include custom event detail", () => {
      const component = createComponent();

      component._registerEvent("ready", { detail: { step: 2 } });

      expect(component.events.ready.detail.step).toBe(2);
    });

    it.each([
      [123, {}],
      ["ready", { bubbles: "yes" }],
      ["ready", { detail: "bad" }],
    ])("should reject event name=%j options=%j", (name, options) => {
      expect(() => createComponent()._registerEvent(name, options)).toThrow(
        TypeError
      );
    });
  });

  describe("_dispatchEvent", () => {
    it("should dispatch to the root by default", () => {
      const component = createComponent(),
        listener = vi.fn();
      component._addEventListener(
        component.getEventName("initialize"),
        component.rootDOMElement,
        listener
      );

      component._dispatchEvent("initialize");

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should dispatch to an explicit element", () => {
      const component = createComponent(),
        listener = vi.fn(),
        other = document.createElement("div");
      component._addEventListener(
        component.getEventName("initialize"),
        other,
        listener
      );

      component._dispatchEvent("initialize", other);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should reject unregistered events", () => {
      expect(() => createComponent()._dispatchEvent("missing")).toThrow(
        TypeError
      );
    });

    it("should reject invalid elements", () => {
      expect(() => createComponent()._dispatchEvent("initialize", {})).toThrow(
        TypeError
      );
    });
  });

  describe("_addEventListener", () => {
    it("should track registered listeners", () => {
      const component = createComponent(),
        listener = vi.fn();

      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });

      expect(component.listeners).toContainEqual({
        type: "click",
        element: component.rootDOMElement,
        listener,
        options: { capture: true },
      });
    });

    it("should attach the callback to the element", () => {
      const component = createComponent(),
        listener = vi.fn();

      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });
      component.rootDOMElement.click();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("_removeEventListener", () => {
    it("should remove the listener from tracking", () => {
      const component = createComponent(),
        listener = vi.fn();
      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });

      component._removeEventListener(
        "click",
        component.rootDOMElement,
        listener,
        { capture: true }
      );

      expect(component.listeners).toEqual([]);
    });

    it("should detach the callback from the element", () => {
      const component = createComponent(),
        listener = vi.fn();
      component._addEventListener("click", component.rootDOMElement, listener, {
        capture: true,
      });

      component._removeEventListener(
        "click",
        component.rootDOMElement,
        listener,
        { capture: true }
      );
      component.rootDOMElement.click();

      expect(listener).not.toHaveBeenCalled();
    });

    it("should tolerate an unregistered listener", () => {
      const component = createComponent();

      expect(() =>
        component._removeEventListener(
          "click",
          component.rootDOMElement,
          vi.fn()
        )
      ).not.toThrow();
      expect(component.listeners).toEqual([]);
    });
  });

  describe("_removeEventListeners", () => {
    it.each(["all", "type", "element", "both"])(
      "should filter by %s",
      (filter) => {
        const component = createComponent();
        const root = component.rootDOMElement,
          other = document.createElement("button");
        const callbacks = [vi.fn(), vi.fn(), vi.fn()];
        component._addEventListener("click", root, callbacks[0]);
        component._addEventListener("keyup", root, callbacks[1]);
        component._addEventListener("click", other, callbacks[2]);

        component._removeEventListeners({
          type: ["type", "both"].includes(filter) ? "click" : null,
          element: ["element", "both"].includes(filter) ? root : null,
        });
        root.click();
        root.dispatchEvent(new Event("keyup"));
        other.click();

        expect(callbacks[0]).not.toHaveBeenCalled();
        expect(callbacks[1]).toHaveBeenCalledTimes(
          ["type", "both"].includes(filter) ? 1 : 0
        );
        expect(callbacks[2]).toHaveBeenCalledTimes(
          ["element", "both"].includes(filter) ? 1 : 0
        );
      }
    );
  });

  describe("_store", () => {
    it.each(["", "explicit-id"])(
      "should store using id=%j or fall back to the key",
      (id) => {
        const component = createComponent({ key: "key" });
        component._id = id;

        component._store();

        expect(
          window.AccessibleEcosystemStorage.get({
            type: "components",
            key: id || "key",
          })
        ).toBe(component);
      }
    );

    it("should skip storage when disabled", () => {
      const component = createComponent();
      component._shouldStore = false;

      component._store();

      expect(window.AccessibleEcosystemStorage).toBeUndefined();
    });

    it("should replace incompatible global storage", () => {
      const component = createComponent({ key: "key" });
      window.AccessibleEcosystemStorage = {};

      component._store();

      expect(
        window.AccessibleEcosystemStorage.get({
          type: "components",
          key: "key",
        })
      ).toBe(component);
    });
  });

  describe("_unstore", () => {
    it.each(["", "explicit-id"])(
      "should remove the component using id=%j or the key",
      (id) => {
        const component = createComponent({ key: "key" });
        component._id = id;
        component._store();

        component._unstore();

        expect(
          window.AccessibleEcosystemStorage.get({
            type: "components",
            key: id || "key",
          })
        ).toBeUndefined();
      }
    );

    it("should preserve other stored entries", () => {
      const component = createComponent({ key: "key" });
      component._store();
      const storage = window.AccessibleEcosystemStorage;
      storage.set({ type: "components", key: "other", data: {} });

      component._unstore();

      expect(storage.get({ type: "components", key: "other" })).toEqual({});
    });

    it("should skip removal when storage is disabled", () => {
      const component = createComponent({ key: "key" });
      component._store();
      component._shouldStore = false;

      component._unstore();

      expect(
        window.AccessibleEcosystemStorage.get({
          type: "components",
          key: "key",
        })
      ).toBe(component);
    });

    it("should tolerate absent global storage", () => {
      expect(() => createComponent()._unstore()).not.toThrow();
      expect(window.AccessibleEcosystemStorage).toBeUndefined();
    });

    it("should leave incompatible global storage unchanged", () => {
      const component = createComponent();
      const incompatible = {};
      window.AccessibleEcosystemStorage = incompatible;

      component._unstore();

      expect(window.AccessibleEcosystemStorage).toBe(incompatible);
    });
  });
});
