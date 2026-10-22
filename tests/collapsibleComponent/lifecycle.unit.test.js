/**
 * Initialization and validation event tests for the CollapsibleComponent class.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import CollapsibleComponent from "../../src/CollapsibleComponent.js";

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

describe("CollapsibleComponent initialization and validation events", () => {
  it("should ignore a child component's initialize event", () => {
    parent = new CollapsibleComponent({
      controlledElement: document.createElement("div"),
      controllerElement: document.createElement("div"),
      bootstrap: false,
    });
    parent._rootDOMElement = "controller";
    document.body.appendChild(parent.rootDOMElement);
    parent._bootstrap();
    child = new CollapsibleComponent({
      controllerElement: document.createElement("button"),
      controlledElement: document.createElement("div"),
      bootstrap: false,
    });
    child._rootDOMElement = "controller";
    document.body.appendChild(child.rootDOMElement);
    child._bootstrap();
    parent.rootDOMElement.append(child.rootDOMElement);
    const collapse = vi.spyOn(parent, "collapse");

    child._dispatchEvent("initialize");

    expect(collapse).not.toHaveBeenCalled();
  });

  it("should ignore a child component's validate event", () => {
    parent = new CollapsibleComponent({
      controlledElement: document.createElement("div"),
      controllerElement: document.createElement("div"),
      bootstrap: false,
    });
    parent._rootDOMElement = "controller";
    document.body.appendChild(parent.rootDOMElement);
    parent._bootstrap();
    child = new CollapsibleComponent({
      controllerElement: document.createElement("button"),
      controlledElement: document.createElement("div"),
      bootstrap: false,
    });
    child._rootDOMElement = "controller";
    document.body.appendChild(child.rootDOMElement);
    child._bootstrap();
    parent.rootDOMElement.append(child.rootDOMElement);
    parent._expandInsideBreakpoint = "invalid";

    child._dispatchEvent("validate");

    expect(parent.isValid).toBe(true);
  });
});
