import { describe, it, expect, vi } from "vitest";
import { createCollapsible } from "../helpers.js";

describe("CollapsibleComponent lifecycle isolation", () => {
  it("should ignore a nested component's initialization", () => {
    const parent = createCollapsible();
    const child = createCollapsible();
    parent.rootDOMElement.append(child.rootDOMElement);
    const collapse = vi.spyOn(parent, "collapse");

    child._dispatchEvent("initialize");

    expect(collapse).not.toHaveBeenCalled();
  });

  it("should ignore a nested component's validation", () => {
    const parent = createCollapsible();
    const child = createCollapsible();
    parent.rootDOMElement.append(child.rootDOMElement);
    parent._expandInsideBreakpoint = "invalid";

    child._dispatchEvent("validate");

    expect(parent.isValid).toBe(true);
  });
});
