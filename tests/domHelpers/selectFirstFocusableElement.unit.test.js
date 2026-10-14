import { describe, it, expect, afterEach } from "vitest";
import { selectFirstFocusableElement } from "../../src/domHelpers.js";
afterEach(() => {
  document.body.innerHTML = "";
});

describe("selectFirstFocusableElement", () => {
  it("should return the first match within the context", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectFirstFocusableElement(context)).toBe(context.children[0]);
  });

  it("should apply the supplied predicate", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(
      selectFirstFocusableElement(
        context,
        (element) => element.textContent === "Middle"
      )
    ).toBe(context.children[1]);
  });

  it("should return false when the context has no focusable elements", () => {
    expect(selectFirstFocusableElement(document.createElement("div"))).toBe(
      false
    );
  });

  it("should return false when the predicate excludes every element", () => {
    const context = document.createElement("div");
    context.innerHTML =
      "<button>First</button><button>Middle</button><button>Last</button>";

    expect(selectFirstFocusableElement(context, () => false)).toBe(false);
  });

  it("should use the document by default", () => {
    document.body.innerHTML = "<button>One</button>";

    expect(selectFirstFocusableElement()).toBe(
      document.querySelector("button")
    );
  });
});
