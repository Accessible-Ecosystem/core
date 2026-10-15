/**
 * Tests for the selectLastFocusableElement() function.
 */

import { describe, it, expect, afterEach } from "vitest";
import { selectLastFocusableElement } from "../../src/domHelpers.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("selectLastFocusableElement", () => {
  it("should return the last match within the context", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectLastFocusableElement(context)).toBe(context.children[2]);
  });

  it("should apply the filter function", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectLastFocusableElement(
        context,
        (element) => element.textContent === "Middle"
      )
    ).toBe(context.children[1]);
  });

  it("should return false when the context has no focusable elements", () => {
    expect(selectLastFocusableElement(document.createElement("div"))).toBe(
      false
    );
  });

  it("should return false when the filter excludes every element", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectLastFocusableElement(context, () => false)).toBe(false);
  });

  it("should use the document by default", () => {
    document.body.innerHTML = "<button>One</button>";

    expect(selectLastFocusableElement()).toBe(document.querySelector("button"));
  });
});
