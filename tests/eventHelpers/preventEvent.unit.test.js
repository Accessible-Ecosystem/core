/**
 * Tests for the preventEvent() function.
 */

import { describe, it, expect, vi } from "vitest";
import { preventEvent } from "../../src/eventHelpers.js";

describe("preventEvent", () => {
  // Make sure the event is prevented.
  it("should prevent the default action", () => {
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

    preventEvent(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("should stop propagation", () => {
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

    preventEvent(event);

    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("should cancel default behavior for a real event", () => {
    const child = document.createElement("button");
    child.addEventListener("click", preventEvent);
    const event = new MouseEvent("click", { cancelable: true });

    expect(child.dispatchEvent(event)).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });

  it("should prevent a real event from bubbling", () => {
    const parent = document.createElement("div"),
      child = document.createElement("button");
    parent.appendChild(child);
    const listener = vi.fn();
    parent.addEventListener("click", listener);
    child.addEventListener("click", preventEvent);

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(listener).not.toHaveBeenCalled();
  });
});
