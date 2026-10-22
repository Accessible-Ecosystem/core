/**
 * Initialization and validation event tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi } from "vitest";
import ResponsiveComponent from "../../src/ResponsiveComponent.js";
import { createResponsive } from "../helpers.js";

describe("ResponsiveComponent initialization and validation events", () => {
  it("should ignore a child component's initialize event", () => {
    const parent = new ResponsiveComponent({ bootstrap: false });
    parent._dom.root = document.createElement("div");
    parent._rootDOMElement = "root";
    document.body.appendChild(parent.rootDOMElement);
    parent._bootstrap();
    const child = createResponsive();
    parent.rootDOMElement.appendChild(child.rootDOMElement);
    const handleMediaMatch = vi.spyOn(parent, "_handleMediaMatch");
    const initialize = vi.fn();
    parent._addEventListener(
      parent.getEventName("initialize"),
      parent.rootDOMElement,
      initialize
    );

    child._dispatchEvent("initialize");

    expect(initialize).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ target: child.rootDOMElement })
    );
    expect(handleMediaMatch).not.toHaveBeenCalled();

    parent.dispose();
  });

  it("should ignore a child component's validate event", () => {
    const parent = new ResponsiveComponent({ bootstrap: false });
    parent._dom.root = document.createElement("div");
    parent._rootDOMElement = "root";
    document.body.appendChild(parent.rootDOMElement);
    parent._bootstrap();
    const child = createResponsive();
    parent.rootDOMElement.appendChild(child.rootDOMElement);
    parent._breakpoint = 12;
    const validate = vi.fn();
    parent._addEventListener(
      parent.getEventName("validate"),
      parent.rootDOMElement,
      validate
    );

    child._dispatchEvent("validate");

    expect(validate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ target: child.rootDOMElement })
    );
    expect(parent.isValid).toBe(true);

    parent.dispose();
  });
});
