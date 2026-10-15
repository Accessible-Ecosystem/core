import { describe, it, expect, vi } from "vitest";
import { createResponsive } from "../helpers.js";

describe("ResponsiveComponent lifecycle isolation", () => {
  it("should ignore another component's initialization on the same element", () => {
    const parent = createResponsive();
    const child = createResponsive();
    const handleMediaMatch = vi.spyOn(parent, "_handleMediaMatch");

    child._dispatchEvent("initialize");

    expect(handleMediaMatch).not.toHaveBeenCalled();
  });

  it("should ignore another component's validation on the same element", () => {
    const parent = createResponsive();
    const child = createResponsive();
    parent._breakpoint = 12;

    child._dispatchEvent("validate");

    expect(parent.isValid).toBe(true);
  });
});
