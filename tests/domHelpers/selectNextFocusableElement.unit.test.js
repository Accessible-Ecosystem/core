/**
 * Tests for the selectNextFocusableElement() function.
 */

import { describe, it, expect, afterEach } from "vitest";
import { selectNextFocusableElement } from "../../src/domHelpers.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("selectNextFocusableElement", () => {
  it("should return the next focusable element", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectNextFocusableElement(context.children[0], context)).toBe(
      context.children[1]
    );
  });

  it("should return false for the last focusable element", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectNextFocusableElement(context.children[2], context)).toBe(
      false
    );
  });

  it("should skip elements excluded by the filter function", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectNextFocusableElement(
        context.children[0],
        context,
        (element) => element.textContent !== "Middle"
      )
    ).toBe(context.children[2]);
  });

  it("should return false when the context has no focusable elements", () => {
    expect(
      selectNextFocusableElement(
        document.createElement("button"),
        document.createElement("div")
      )
    ).toBe(false);
  });

  it("should return false when the element is outside the context", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectNextFocusableElement(document.createElement("button"), context)
    ).toBe(false);
  });

  it("should return false when the target is filtered out", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectNextFocusableElement(
        context.children[1],
        context,
        (element) => element !== context.children[1]
      )
    ).toBe(false);
  });

  it("should return false when every element is filtered out", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectNextFocusableElement(context.children[1], context, () => false)
    ).toBe(false);
  });

  it("should use the document by default", () => {
    document.body.innerHTML = "<button>First</button><button>Last</button>";

    expect(selectNextFocusableElement(document.body.children[0])).toBe(
      document.body.children[1]
    );
  });
});
