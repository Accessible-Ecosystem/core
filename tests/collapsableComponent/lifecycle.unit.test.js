import { describe, it, expect, vi } from "vitest";
import { createCollapsable } from "../helpers.js";

describe("CollapsableComponent lifecycle isolation", () => {
  it("should ignore a nested component's initialization", () => {
    const parent = createCollapsable();
    const child = createCollapsable();
    parent.rootDOMElement.append(child.rootDOMElement);
    const collapse = vi.spyOn(parent, "collapse");

    child._dispatchEvent("initialize");

    expect(collapse).not.toHaveBeenCalled();
  });

  it("should ignore a nested component's validation", () => {
    const parent = createCollapsable();
    const child = createCollapsable();
    parent.rootDOMElement.append(child.rootDOMElement);
    parent._expandInsideBreakpoint = "invalid";

    child._dispatchEvent("validate");

    expect(parent.isValid).toBe(true);
  });
});
