/**
 * Initialization and validation event tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import { createCollapsible } from "../helpers.js";

describe("CollapsibleComponent initialization and validation events", () => {
  it("should ignore a child component's initialize event", () => {
    const parent = createCollapsible();
    const child = createCollapsible();
    parent.rootDOMElement.append(child.rootDOMElement);
    const collapse = vi.spyOn(parent, "collapse");

    child._dispatchEvent("initialize");

    expect(collapse).not.toHaveBeenCalled();
  });

  it("should ignore a child component's validate event", () => {
    const parent = createCollapsible();
    const child = createCollapsible();
    parent.rootDOMElement.append(child.rootDOMElement);
    parent._expandInsideBreakpoint = "invalid";

    child._dispatchEvent("validate");

    expect(parent.isValid).toBe(true);
  });
});
