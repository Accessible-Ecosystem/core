/**
 * Initialization and validation event tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import { createResponsive } from "../helpers.js";

describe("ResponsiveComponent initialization and validation events", () => {
  it("should ignore another component's initialize event", () => {
    const parent = createResponsive();
    const child = createResponsive();
    const handleMediaMatch = vi.spyOn(parent, "_handleMediaMatch");

    child._dispatchEvent("initialize");

    expect(handleMediaMatch).not.toHaveBeenCalled();
  });

  it("should ignore another component's validate event", () => {
    const parent = createResponsive();
    const child = createResponsive();
    parent._breakpoint = 12;

    child._dispatchEvent("validate");

    expect(parent.isValid).toBe(true);
  });
});
