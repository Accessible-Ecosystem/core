/**
 * Initialization and validation event tests for the ResponsiveComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import ResponsiveComponent from "../../src/ResponsiveComponent.js";

let parent;
let child;

afterEach(() => {
  parent?.dispose();
  parent = null;
  child?.dispose();
  child = null;
  document.body.innerHTML = "";
  delete window.AccessibleEcosystemStorage;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("ResponsiveComponent initialization and validation events", () => {
  it("should ignore a child component's initialize event", () => {
    parent = new ResponsiveComponent({ bootstrap: false });
    parent._dom.root = document.createElement("div");
    parent._rootDOMElement = "root";
    document.body.appendChild(parent.rootDOMElement);
    parent._bootstrap();
    child = new ResponsiveComponent({ bootstrap: false });
    child._dom.root = document.createElement("button");
    child._rootDOMElement = "root";
    document.body.appendChild(child.rootDOMElement);
    child._bootstrap();
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
  });

  it("should ignore a child component's validate event", () => {
    parent = new ResponsiveComponent({ bootstrap: false });
    parent._dom.root = document.createElement("div");
    parent._rootDOMElement = "root";
    document.body.appendChild(parent.rootDOMElement);
    parent._bootstrap();
    child = new ResponsiveComponent({ bootstrap: false });
    child._dom.root = document.createElement("button");
    child._rootDOMElement = "root";
    document.body.appendChild(child.rootDOMElement);
    child._bootstrap();
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
  });
});
