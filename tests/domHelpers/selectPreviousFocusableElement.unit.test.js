import { describe, it, expect, afterEach } from "vitest";
import { selectPreviousFocusableElement } from "../../src/domHelpers.js";
afterEach(() => {
  document.body.innerHTML = "";
});

describe("selectPreviousFocusableElement", () => {
  it("should return the adjacent match", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectPreviousFocusableElement(context.children[2], context)).toBe(
      context.children[1]
    );
  });

  it("should return false at the boundary", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectPreviousFocusableElement(context.children[0], context)).toBe(
      false
    );
  });

  it("should skip elements excluded by the predicate", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectPreviousFocusableElement(
        context.children[2],
        context,
        (element) => element.textContent !== "Middle"
      )
    ).toBe(context.children[0]);
  });

  it("should return false when the context has no focusable elements", () => {
    expect(
      selectPreviousFocusableElement(
        document.createElement("button"),
        document.createElement("div")
      )
    ).toBe(false);
  });

  it("should return false when the target is absent", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectPreviousFocusableElement(document.createElement("button"), context)
    ).toBe(false);
  });

  it("should return false when the target is filtered out", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectPreviousFocusableElement(
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
      selectPreviousFocusableElement(context.children[1], context, () => false)
    ).toBe(false);
  });

  it("should use the document by default", () => {
    document.body.innerHTML = "<button>First</button><button>Last</button>";

    expect(selectPreviousFocusableElement(document.body.children[1])).toBe(
      document.body.children[0]
    );
  });
});
