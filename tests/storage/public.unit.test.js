/**
 * Tests for public methods of the StorageManager class.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import StorageManager from "../../src/StorageManager.js";

import * as validation from "../../src/validate.js";

const scope = "TestStorage";

beforeEach(() => {
  delete window[scope];
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window[scope];
});

// Test StorageManager public methods.
describe("StorageManager public methods", () => {
  // Test StorageManager get().
  describe("get", () => {
    // Test that invalid storage types rethrow the validation error message.
    it("should rethrow the validation error when the storage type is invalid", () => {
      const storage = new StorageManager({ scope, initialize: false });
      const validationError = new TypeError(
        "The storage type must be a string."
      );
      vi.spyOn(validation, "isValidType").mockReturnValue({
        status: false,
        errors: [validationError],
      });

      expect(() => storage.get({ type: 123 })).toThrow(validationError);
      expect(() => storage.get({ type: 123 })).toThrow(
        "The storage type must be a string."
      );
    });

    // Test that get returns a type's data.
    it("should return the storage for a given type", () => {
      const storage = new StorageManager({ scope, type: "menus" });
      const data = { main: { id: 1 } };
      storage.set({ data });

      expect(storage.get()).toEqual(data);
    });

    // Test that get returns data for a key.
    it("should return the data for a given key", () => {
      const storage = new StorageManager({ scope, type: "menus" });
      const data = { id: 1 };
      storage.set({ key: "main", data });

      expect(storage.get({ key: "main" })).toEqual(data);
    });

    // Test that get throws an error if the type is not initialized.
    it("should throw an error if the type is not initialized", () => {
      const storage = new StorageManager({ scope, type: "menus" });

      expect(() => {
        storage.get();
      }).toThrowError(
        'StorageManager (TestStorage): Type "menus" is not initialized.'
      );
    });

    it.each([{ type: 123 }, { type: null }, { key: 123 }, { key: {} }])(
      "should reject invalid options %j without modifying data",
      (options) => {
        const storage = new StorageManager({ scope });
        storage.set({ key: "main", data: { id: 1 } });

        expect(() => storage.get(options)).toThrow(TypeError);
        expect(storage.get()).toEqual({ main: { id: 1 } });
      }
    );

    it("should operate on an explicitly requested type", () => {
      const storage = new StorageManager({ scope });
      storage.set({ type: "custom", key: "main", data: { id: 1 } });

      expect(storage.get({ type: "custom", key: "main" })).toEqual({
        id: 1,
      });
    });

    it("should leave the default type unchanged when an explicit type is used", () => {
      const storage = new StorageManager({ scope });
      storage.set({ type: "custom", key: "main", data: { id: 1 } });

      storage.get({ type: "custom", key: "main" });

      expect(storage.type).toBe("_default");
    });

    it("should return undefined for a missing key in an initialized type", () => {
      const storage = new StorageManager({ scope });
      storage.set();

      expect(storage.get({ key: "missing" })).toBeUndefined();
    });
  });

  // Test StorageManager set().
  describe("set", () => {
    // Test that set creates a type when no key is provided.
    it("should set data for a type when no key is provided", () => {
      const storage = new StorageManager({ scope });
      const data = { id: 1 };

      storage.set({ data });

      expect(storage.storage._default).toEqual(data);
    });

    // Test that set creates a key/value pair when a key is provided.
    it("should set data for a key when a key is provided", () => {
      const storage = new StorageManager({ scope, type: "menus" });
      const data = { id: 1 };

      storage.set({ key: "main", data });

      expect(storage.storage.menus.main).toEqual(data);
    });

    // Test that set can add multiple keys to the same type.
    it("should add additional data to an existing type", () => {
      const storage = new StorageManager({ scope, type: "menus" });
      const mainMenu = { id: 1 };
      const sideMenu = { id: 2 };

      storage.set({ key: "main", data: mainMenu });
      storage.set({ key: "side", data: sideMenu });

      expect(storage.storage.menus).toEqual({
        main: mainMenu,
        side: sideMenu,
      });
    });

    it.each([{ type: 123 }, { type: null }, { key: 123 }, { key: {} }])(
      "should reject invalid options %j without modifying data",
      (options) => {
        const storage = new StorageManager({ scope });

        storage.set({ key: "main", data: { id: 1 } });

        expect(() => storage.set(options)).toThrow(TypeError);
        expect(storage.get()).toEqual({ main: { id: 1 } });
      }
    );

    it("should operate on an explicitly requested type", () => {
      const storage = new StorageManager({ scope });

      storage.set({ type: "custom", key: "main", data: { id: 1 } });

      storage.set({ type: "custom", key: "main", data: { id: 2 } });

      expect(storage.get({ type: "custom", key: "main" })).toEqual({
        id: 2,
      });
    });

    it("should leave the default type unchanged when an explicit type is used", () => {
      const storage = new StorageManager({ scope });

      storage.set({ type: "custom", key: "main", data: { id: 1 } });

      storage.set({ type: "custom", key: "main" });

      expect(storage.type).toBe("_default");
    });

    it.each([123, "invalid"])("should reject invalid data %j", (data) => {
      const storage = new StorageManager({ scope });

      expect(() => storage.set({ data })).toThrow(TypeError);
      expect(storage.storage).toEqual({});
    });

    it("should default undefined data to an empty object", () => {
      const storage = new StorageManager({ scope });

      storage.set({ data: undefined });

      expect(storage.get()).toEqual({});
    });

    it("should replace type data rather than merge it", () => {
      const storage = new StorageManager({ scope });

      storage.set({ data: { old: true } });
      storage.set({ data: { current: true } });

      expect(storage.get()).toEqual({ current: true });
    });
  });

  // Test StorageManager clear().
  describe("clear", () => {
    // Test that clear deletes a specific key's data.
    it("should clear data for a given key", () => {
      const storage = new StorageManager({ scope, type: "menus" });
      storage.set({ key: "main", data: { id: 1 } });
      storage.set({ key: "side", data: { id: 2 } });

      storage.clear({ key: "main" });

      expect(storage.storage.menus.main).toBeUndefined();
      expect(storage.storage.menus.side).toEqual({ id: 2 });
    });

    // Test that clear deletes a type's data.
    it("should clear data for a given type", () => {
      const storage = new StorageManager({ scope, type: "menus" });
      storage.set({ data: { main: { id: 1 } } });

      storage.clear();

      expect(storage.storage.menus).toBeUndefined();
    });

    it.each([{ type: 123 }, { type: null }, { key: 123 }, { key: {} }])(
      "should reject invalid options %j without modifying data",
      (options) => {
        const storage = new StorageManager({ scope });
        storage.set({ key: "main", data: { id: 1 } });

        expect(() => storage.clear(options)).toThrow(TypeError);
        expect(storage.get()).toEqual({ main: { id: 1 } });
      }
    );

    it("should operate on an explicitly requested type", () => {
      const storage = new StorageManager({ scope });
      storage.set({ type: "custom", key: "main", data: { id: 1 } });

      storage.clear({ type: "custom", key: "main" });

      expect(storage.get({ type: "custom" })).toEqual({});
    });

    it("should leave the default type unchanged when an explicit type is used", () => {
      const storage = new StorageManager({ scope });
      storage.set({ type: "custom", key: "main", data: { id: 1 } });

      storage.clear({ type: "custom", key: "main" });

      expect(storage.type).toBe("_default");
    });

    it("should tolerate a missing type when clearing the whole type", () => {
      const storage = new StorageManager({ scope });

      expect(() => storage.clear()).not.toThrow();
      expect(storage.storage).toEqual({});
    });
  });

  // Test StorageManager dispose().
  describe("dispose", () => {
    // Test that dispose removes the storage object.
    it("should remove the storage object from the instance", () => {
      const storage = new StorageManager({ scope });

      storage.dispose();

      expect(storage.storage).toBeUndefined();
    });

    it("should remove the instance from global storage", () => {
      const storage = new StorageManager({ scope });

      storage.dispose();

      expect(window[scope]).toBeUndefined();
    });

    it("should preserve a newer owner of the global scope", () => {
      const first = new StorageManager({ scope });
      const second = new StorageManager({ scope });

      first.dispose();

      expect(window[scope]).toBe(second);
    });

    it("should tolerate repeated disposal", () => {
      const storage = new StorageManager({ scope });

      storage.dispose();

      expect(() => storage.dispose()).not.toThrow();
      expect(window[scope]).toBeUndefined();
    });
  });
});
