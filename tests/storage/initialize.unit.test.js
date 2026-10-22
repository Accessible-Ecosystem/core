/**
 * Initialization tests for the StorageManager class.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import StorageManager from "../../src/StorageManager.js";

const scope = "TestStorage";

beforeEach(() => {
  delete window[scope];
});

afterEach(() => {
  delete window[scope];
});

// Test StorageManager initialization.
describe("StorageManager initialization", () => {
  // Test that the storage is registered on the window.
  it("should register itself on the window using the provided scope", () => {
    const storage = new StorageManager({ scope });

    expect(window[scope]).toBe(storage);
  });

  // Test that automatic initialization can be disabled.
  it("should not register on the window when initialize is false", () => {
    new StorageManager({ scope, initialize: false });

    expect(window[scope]).toBeUndefined();
  });

  it("should register on the window when manually initialized", () => {
    const storage = new StorageManager({ scope, initialize: false });

    storage.initialize();

    expect(window[scope]).toBe(storage);
  });

  // Test that storage sets the default type.
  it('should initialize with the default type of "_default"', () => {
    const storage = new StorageManager({ scope });

    expect(storage.type).toBe("_default");
  });

  // Test that storage sets a custom type.
  it("should initialize with a provided type", () => {
    const storage = new StorageManager({ scope, type: "menus" });

    expect(storage.type).toBe("menus");
  });

  // Test that existing storage data is preserved when crush is disabled.
  it("should preserve existing storage data when crush is disabled", () => {
    const existing = new StorageManager({ scope, initialize: false });
    existing.set({ type: "menus", key: "main", data: { id: 1 } });
    window[scope] = existing;

    const storage = new StorageManager({ scope });

    expect(window[scope]).toBe(storage);
    expect(storage.storage).toEqual(existing.storage);
  });

  // Test that existing storage data is replaced when crush is enabled.
  it("should replace existing storage data when crush is true", () => {
    const existing = new StorageManager({ scope, initialize: false });
    existing.set({ type: "menus", key: "main", data: { id: 1 } });
    window[scope] = existing;

    const storage = new StorageManager({ scope, crush: true });

    expect(window[scope]).toBe(storage);
    expect(storage.storage).not.toEqual(existing.storage);
  });

  it("should reuse the existing storage object", () => {
    const existing = new StorageManager({ scope });
    const storage = new StorageManager({ scope });

    expect(storage.storage).toBe(existing.storage);

    storage.set({ key: "shared", data: {} });

    expect(existing.get({ key: "shared" })).toBe(
      storage.get({ key: "shared" })
    );
  });

  it("should reuse compatible storage from another implementation", () => {
    const backing = { _default: { existing: true } };
    window[scope] = { storage: backing, scope, type: "_default" };
    const storage = new StorageManager({ scope });

    expect(storage.storage).toBe(backing);
    expect(window[scope]).toBe(storage);
  });

  it.each([null, {}, 123])(
    "should replace incompatible existing scope %j",
    (existing) => {
      window[scope] = existing;
      const storage = new StorageManager({ scope });

      expect(window[scope]).toBe(storage);
      expect(storage.storage).toEqual({});
    }
  );
});
